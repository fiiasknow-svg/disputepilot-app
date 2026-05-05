import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "dp_auth";
const TEST_AUTH_HEADER = "x-disputepilot-test-auth";

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

function hasSupabaseCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function hasAuth(request: NextRequest) {
  const hasAppCookie = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const hasTestAuth = process.env.NODE_ENV !== "production" && request.headers.get(TEST_AUTH_HEADER) === "1";

  return hasAppCookie || hasSupabaseCookie(request) || hasTestAuth;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPrivateRoute(pathname) || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (hasAuth(request)) {
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
