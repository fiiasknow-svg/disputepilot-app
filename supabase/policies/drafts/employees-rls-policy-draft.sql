-- Draft only: employees RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - employees.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/employees-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
--
-- Future apply step, intentionally commented:
-- alter table employees enable row level security;
-- alter table employees force row level security;

-- Policy model:
-- - A user can access an employee only when employees.account_id belongs to one
--   of their account_memberships rows.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Employee row roles such as Admin and Manager are business profile labels,
--   not account_memberships roles. Tighten write access to owner/admin/manager
--   membership roles before apply if normal members should not manage staff.

create policy "employees_select_account_members"
on employees
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "employees_insert_account_members"
on employees
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "employees_update_account_members"
on employees
for update
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
)
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "employees_delete_account_members"
on employees
for delete
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

-- Null account_id legacy rows:
-- - These policies intentionally do not expose null account_id rows because
--   null is not in a user's membership account set.
-- - Before applying RLS, manually assign or explicitly archive any remaining
--   null rows that should stay visible.
-- - Do not make employees.account_id NOT NULL until that audit is complete.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete employees after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   employees and should be unable to insert, update, or delete rows.

-- Future role semantics for employee writes:
-- - SELECT likely remains available to every account member.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed account ownership or
--   admin-style membership roles before apply if the product differentiates
--   staff management permissions.
-- - Do not use employees.role as the authorization source for these policies;
--   use account_memberships.role or a future permissions table.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "employees_delete_account_members" on employees;
-- drop policy if exists "employees_update_account_members" on employees;
-- drop policy if exists "employees_insert_account_members" on employees;
-- drop policy if exists "employees_select_account_members" on employees;
-- alter table employees disable row level security;
