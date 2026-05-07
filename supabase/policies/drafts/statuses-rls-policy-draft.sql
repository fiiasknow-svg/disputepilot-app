-- Draft only: statuses RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - statuses.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/statuses-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
--
-- Future apply step, intentionally commented:
-- alter table statuses enable row level security;
-- alter table statuses force row level security;

-- Policy model:
-- - A user can access a status only when statuses.account_id belongs to one of
--   their account_memberships rows.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Write policies currently allow owner, admin, manager, and member roles.
--   Tighten this list before apply if members should not manage statuses.

create policy "statuses_select_account_members"
on statuses
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "statuses_insert_account_members"
on statuses
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
      and role in ('owner', 'admin', 'manager', 'member')
  )
);

create policy "statuses_update_account_members"
on statuses
for update
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
      and role in ('owner', 'admin', 'manager', 'member')
  )
)
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
      and role in ('owner', 'admin', 'manager', 'member')
  )
);

create policy "statuses_delete_account_members"
on statuses
for delete
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
      and role in ('owner', 'admin', 'manager', 'member')
  )
);

-- Null account_id legacy rows:
-- - These policies intentionally do not expose null account_id rows because
--   null is not in a user's membership account set.
-- - Before applying RLS, manually assign or explicitly archive any remaining
--   null rows that should stay visible.
-- - Do not make statuses.account_id NOT NULL until that audit is complete.

-- Built-in/default statuses:
-- - The current settings UI defines built-in defaults in app code, not in the
--   statuses table.
-- - If default statuses are later represented as database rows, prefer
--   account-owned copies per account. Global null-account defaults would be
--   hidden by these policies unless a separate reviewed policy is added.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete statuses after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   statuses and should be unable to insert, update, or delete rows.

-- Future role semantics:
-- - SELECT likely remains available to every account member.
-- - INSERT/UPDATE/DELETE may need to narrow to owner/admin/manager after the
--   product's role semantics are confirmed.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "statuses_delete_account_members" on statuses;
-- drop policy if exists "statuses_update_account_members" on statuses;
-- drop policy if exists "statuses_insert_account_members" on statuses;
-- drop policy if exists "statuses_select_account_members" on statuses;
-- alter table statuses disable row level security;
