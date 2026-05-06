import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "dp_auth";
const TEST_AUTH_HEADER = "x-disputepilot-test-auth";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const publicPrefixes = [
  "/",
  "/login",
  "/client-login",
  "/reset-password",
  "/academy",
  "/get-customers",
  "/partner-resources",
  "/affiliates",
];

const privatePrefixes = [
  "/automation",
  "/billing",
  "/bulk-print",
  "/calendar",
  "/clients",
  "/company",
  "/configuration",
  "/credit-analysis",
  "/credit-analyzer",
  "/dashboard",
  "/dispute-manager",
  "/disputes",
  "/employees",
  "/leads",
  "/letter-vault",
  "/letters",
  "/portal",
  "/reports",
  "/settings",
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isPublicRoute(pathname: string) {
  return publicPrefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

function isPrivateRoute(pathname: string) {
  return privatePrefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function hasAuthBridgeCookie(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE)?.value === "1";
}

function hasTestAuth(request: NextRequest) {
  return process.env.NODE_ENV !== "production" && request.headers.get(TEST_AUTH_HEADER) === "1";
}

async function getVerifiedSupabaseAuthResponse(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey || !hasSupabaseAuthCookie(request)) {
    return null;
  }

  const response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options as CookieOptions);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPrivateRoute(pathname) || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const verifiedSupabaseResponse = await getVerifiedSupabaseAuthResponse(request);

  if (verifiedSupabaseResponse) {
    return verifiedSupabaseResponse;
  }

  if (hasAuthBridgeCookie(request) || hasTestAuth(request)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
