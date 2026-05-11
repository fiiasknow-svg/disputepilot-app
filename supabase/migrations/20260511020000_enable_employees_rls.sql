-- Phase 3 employees RLS apply migration.
--
-- This migration enables RLS on employees only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/employees-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for employees.
-- - supabase/tests/employees-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null employees.account_id rows have been audited and intentionally handled.

drop policy if exists "employees_delete_account_members" on employees;
drop policy if exists "employees_update_account_members" on employees;
drop policy if exists "employees_insert_account_members" on employees;
drop policy if exists "employees_select_account_members" on employees;

alter table employees enable row level security;

grant select, insert, update, delete on public.employees to authenticated;

do $$
begin
  if to_regclass('public.employees_id_seq') is not null then
    execute 'grant usage, select on sequence public.employees_id_seq to authenticated';
  end if;
end $$;

create or replace function public.employees_has_membership(
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

revoke all on function public.employees_has_membership(uuid, text[]) from public;
grant execute on function public.employees_has_membership(uuid, text[]) to authenticated;

create policy "employees_select_account_members"
on employees
for select
to authenticated
using (
  public.employees_has_membership(account_id)
);

create policy "employees_insert_account_members"
on employees
for insert
to authenticated
with check (
  public.employees_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "employees_update_account_members"
on employees
for update
to authenticated
using (
  public.employees_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.employees_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "employees_delete_account_members"
on employees
for delete
to authenticated
using (
  public.employees_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable employees RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table employees disable row level security;
-- Do not run rollback casually in production.
