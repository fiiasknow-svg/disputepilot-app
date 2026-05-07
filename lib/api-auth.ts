import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "./supabase-server";

const TEST_AUTH_HEADER = "x-disputepilot-test-auth";

export async function requireBusinessApiAuth(request: NextRequest) {
  if (process.env.NODE_ENV !== "production" && request.headers.get(TEST_AUTH_HEADER) === "1") {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (!error && data.user) {
      return null;
    }
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
