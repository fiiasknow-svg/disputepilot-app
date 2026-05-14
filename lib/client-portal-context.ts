import { createSupabaseServerClient } from "./supabase-server";

export type ClientPortalMappingStatus = "active" | "disabled" | "invited" | "revoked" | (string & {});

export type ClientPortalContext = {
  accountId: string;
  clientId: string;
  userId: string;
  status: ClientPortalMappingStatus;
};

type ClientPortalUserRow = {
  account_id: string | null;
  client_id: string | number | null;
  user_id: string | null;
  status: string | null;
};

function toClientPortalContext(userId: string, row: ClientPortalUserRow | null): ClientPortalContext | null {
  if (!row?.account_id || row.client_id === null || row.client_id === undefined) {
    return null;
  }

  if (row.user_id !== userId || row.status !== "active") {
    return null;
  }

  return {
    accountId: row.account_id,
    clientId: String(row.client_id),
    userId,
    status: row.status,
  };
}

export async function getCurrentClientPortalContext(): Promise<ClientPortalContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (userError || !userId) {
    return null;
  }

  const { data: mapping, error: mappingError } = await supabase
    .from("client_portal_users")
    .select("account_id, client_id, user_id, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (mappingError) {
    return null;
  }

  return toClientPortalContext(userId, mapping as ClientPortalUserRow | null);
}
