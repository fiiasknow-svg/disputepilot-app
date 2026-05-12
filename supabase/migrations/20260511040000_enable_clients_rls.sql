-- Phase 3 clients RLS apply migration.
--
-- This migration enables RLS on clients only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/clients-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for clients.
-- - supabase/tests/clients-post-rls-verification.sql passes in the disposable
--   database after this migration is applied.
-- - null clients.account_id rows have been audited and intentionally handled.
-- - child-table ownership for invoices, disputes, calendar_events,
--   dispute_letters, and portal mappings is handled separately.

drop policy if exists "clients_delete_account_members" on clients;
drop policy if exists "clients_update_account_members" on clients;
drop policy if exists "clients_insert_account_members" on clients;
drop policy if exists "clients_select_account_members" on clients;

alter table clients enable row level security;

grant select, insert, update, delete on public.clients to authenticated;

do $$
begin
  if to_regclass('public.clients_id_seq') is not null then
    execute 'grant usage, select on sequence public.clients_id_seq to authenticated';
  end if;
end $$;

create or replace function public.clients_has_membership(
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

revoke all on function public.clients_has_membership(uuid, text[]) from public;
grant execute on function public.clients_has_membership(uuid, text[]) to authenticated;

create policy "clients_select_account_members"
on clients
for select
to authenticated
using (
  public.clients_has_membership(account_id)
);

create policy "clients_insert_account_members"
on clients
for insert
to authenticated
with check (
  public.clients_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "clients_update_account_members"
on clients
for update
to authenticated
using (
  public.clients_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.clients_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "clients_delete_account_members"
on clients
for delete
to authenticated
using (
  public.clients_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable clients RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table clients disable row level security;
-- Do not run rollback casually in production.
