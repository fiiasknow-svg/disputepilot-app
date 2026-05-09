-- Draft only: affiliates RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - affiliates.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/affiliates-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - affiliate write-role semantics are decided.
-- - any future persisted affiliate edit/status paths are confirmed and tested.
--
-- Future apply step, intentionally commented:
-- alter table affiliates enable row level security;
-- alter table affiliates force row level security;

-- Policy model:
-- - A user can access an affiliate only when affiliates.account_id belongs to
--   one of their account_memberships rows.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Affiliate write policies are drafted for any account member. Tighten
--   writes to owner/admin/manager/sales-style membership roles before apply if
--   the product differentiates affiliate permissions.

create policy "affiliates_select_account_members"
on affiliates
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "affiliates_insert_account_members"
on affiliates
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "affiliates_update_account_members"
on affiliates
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

create policy "affiliates_delete_account_members"
on affiliates
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
-- - Do not make affiliates.account_id NOT NULL until that audit is complete.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete affiliates after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   affiliates and should be unable to insert, update, or delete rows.

-- Future affiliate write roles:
-- - SELECT may remain available to every account member if affiliate partners
--   are team-visible.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed affiliate management
--   roles before apply if the product differentiates permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- No current edit/status path:
-- - The current affiliate UI only supports listing, creating, and deleting
--   affiliates.
-- - There is no separate persisted affiliate edit or status-update path in the
--   inspected app files, so the UPDATE policy exists for future-proofing only.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "affiliates_delete_account_members" on affiliates;
-- drop policy if exists "affiliates_update_account_members" on affiliates;
-- drop policy if exists "affiliates_insert_account_members" on affiliates;
-- drop policy if exists "affiliates_select_account_members" on affiliates;
-- alter table affiliates disable row level security;
