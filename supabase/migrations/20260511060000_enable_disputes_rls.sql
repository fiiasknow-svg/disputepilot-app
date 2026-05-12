-- Phase 3 disputes RLS apply migration.
--
-- This migration enables RLS on disputes only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/disputes-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for disputes.
-- - supabase/tests/disputes-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null disputes.account_id rows have been audited and intentionally handled.
-- - disputes with client_id have been audited so the client account matches
--   disputes.account_id.
-- - dispute_letters, letters/documents, calendar_events, and portal dispute
--   access are handled separately.

drop policy if exists "disputes_delete_account_members" on disputes;
drop policy if exists "disputes_update_account_members" on disputes;
drop policy if exists "disputes_insert_account_members" on disputes;
drop policy if exists "disputes_select_account_members" on disputes;

alter table disputes enable row level security;

grant select, insert, update, delete on public.disputes to authenticated;

do $$
begin
  if to_regclass('public.disputes_id_seq') is not null then
    execute 'grant usage, select on sequence public.disputes_id_seq to authenticated';
  end if;
end $$;

create or replace function public.disputes_has_membership(
  p_account_id uuid,
  p_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.account_memberships am
    where am.account_id = p_account_id
      and am.user_id = auth.uid()
      and (
        p_roles is null
        or am.role = any(p_roles)
      )
  );
$$;

create or replace function public.disputes_client_matches_account(
  p_client_id bigint,
  p_account_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_client_id is null
    or exists (
      select 1
      from public.clients c
      where c.id = p_client_id
        and c.account_id = p_account_id
    );
$$;

revoke all on function public.disputes_has_membership(uuid, text[]) from public;
revoke all on function public.disputes_client_matches_account(bigint, uuid) from public;
grant execute on function public.disputes_has_membership(uuid, text[]) to authenticated;
grant execute on function public.disputes_client_matches_account(bigint, uuid) to authenticated;

create policy "disputes_select_account_members"
on disputes
for select
to authenticated
using (
  public.disputes_has_membership(account_id)
);

create policy "disputes_insert_account_members"
on disputes
for insert
to authenticated
with check (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.disputes_client_matches_account(client_id, account_id)
);

create policy "disputes_update_account_members"
on disputes
for update
to authenticated
using (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.disputes_client_matches_account(client_id, account_id)
);

create policy "disputes_delete_account_members"
on disputes
for delete
to authenticated
using (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable disputes RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table disputes disable row level security;
-- Do not run rollback casually in production.
