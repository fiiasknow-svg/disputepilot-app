import { createSupabaseServerClient } from "./supabase-server";

export type AccountContext = {
  accountId: string;
  userId: string;
  role: string;
};

export async function getCurrentAccountContext(): Promise<AccountContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("account_memberships")
    .select("account_id, role")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.account_id) {
    return null;
  }

  return {
    accountId: membership.account_id,
    userId: userData.user.id,
    role: membership.role || "owner",
  };
}
