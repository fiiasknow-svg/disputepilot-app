-- Phase 3 invoices RLS apply migration.
--
-- This migration enables RLS on invoices only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/invoices-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for invoices.
-- - supabase/tests/invoices-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null invoices.account_id rows have been audited and intentionally handled.
-- - invoices with client_id have been audited so the client account matches
--   invoices.account_id.
-- - payments, services/products, and portal invoice access are handled
--   separately.

drop policy if exists "invoices_delete_account_members" on invoices;
drop policy if exists "invoices_update_account_members" on invoices;
drop policy if exists "invoices_insert_account_members" on invoices;
drop policy if exists "invoices_select_account_members" on invoices;

alter table invoices enable row level security;

grant select, insert, update, delete on public.invoices to authenticated;

do $$
begin
  if to_regclass('public.invoices_id_seq') is not null then
    execute 'grant usage, select on sequence public.invoices_id_seq to authenticated';
  end if;
end $$;

create or replace function public.invoices_has_membership(
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

create or replace function public.invoices_client_matches_account(
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

revoke all on function public.invoices_has_membership(uuid, text[]) from public;
revoke all on function public.invoices_client_matches_account(bigint, uuid) from public;
grant execute on function public.invoices_has_membership(uuid, text[]) to authenticated;
grant execute on function public.invoices_client_matches_account(bigint, uuid) to authenticated;

create policy "invoices_select_account_members"
on invoices
for select
to authenticated
using (
  public.invoices_has_membership(account_id)
);

create policy "invoices_insert_account_members"
on invoices
for insert
to authenticated
with check (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_update_account_members"
on invoices
for update
to authenticated
using (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_delete_account_members"
on invoices
for delete
to authenticated
using (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable invoices RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table invoices disable row level security;
-- Do not run rollback casually in production.
