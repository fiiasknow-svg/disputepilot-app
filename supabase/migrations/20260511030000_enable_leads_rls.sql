-- Phase 3 leads RLS apply migration.
--
-- This migration enables RLS on leads only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/leads-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for leads.
-- - supabase/tests/leads-post-rls-verification.sql passes in the disposable
--   database after this migration is applied.
-- - null leads.account_id rows have been audited and intentionally handled.

drop policy if exists "leads_delete_account_members" on leads;
drop policy if exists "leads_update_account_members" on leads;
drop policy if exists "leads_insert_account_members" on leads;
drop policy if exists "leads_select_account_members" on leads;

alter table leads enable row level security;

grant select, insert, update, delete on public.leads to authenticated;

do $$
begin
  if to_regclass('public.leads_id_seq') is not null then
    execute 'grant usage, select on sequence public.leads_id_seq to authenticated';
  end if;
end $$;

create or replace function public.leads_has_membership(
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

revoke all on function public.leads_has_membership(uuid, text[]) from public;
grant execute on function public.leads_has_membership(uuid, text[]) to authenticated;

create policy "leads_select_account_members"
on leads
for select
to authenticated
using (
  public.leads_has_membership(account_id)
);

create policy "leads_insert_account_members"
on leads
for insert
to authenticated
with check (
  public.leads_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "leads_update_account_members"
on leads
for update
to authenticated
using (
  public.leads_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.leads_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "leads_delete_account_members"
on leads
for delete
to authenticated
using (
  public.leads_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable leads RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table leads disable row level security;
-- Do not run rollback casually in production.
