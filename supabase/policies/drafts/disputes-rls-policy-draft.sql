-- Draft only: disputes RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - disputes.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/disputes-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - dispute write-role semantics are decided.
-- - dispute_letters, letters/documents, calendar_events, portal dispute
--   access, and other child paths are kept separate or have their own
--   ownership and policy coverage.
--
-- Future apply step, intentionally commented:
-- alter table disputes enable row level security;
-- alter table disputes force row level security;

-- Policy model:
-- - A user can access a dispute only when disputes.account_id belongs to one
--   of their account_memberships rows.
-- - If client_id is present, the referenced client must belong to the same
--   account_id as the dispute.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Dispute write policies are drafted for any account member. Tighten writes
--   to owner/admin/manager/specialist-style roles before apply if the product
--   differentiates dispute permissions.

create policy "disputes_select_account_members"
on disputes
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "disputes_insert_account_members"
on disputes
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
  and (
    client_id is null
    or exists (
      select 1
      from clients
      where clients.id = disputes.client_id
        and clients.account_id = disputes.account_id
    )
  )
);

create policy "disputes_update_account_members"
on disputes
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
  and (
    client_id is null
    or exists (
      select 1
      from clients
      where clients.id = disputes.client_id
        and clients.account_id = disputes.account_id
    )
  )
);

create policy "disputes_delete_account_members"
on disputes
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
-- - Do not make disputes.account_id NOT NULL until that audit is complete.

-- Missing or legacy client_id rows:
-- - This draft allows disputes.client_id to remain null because legacy dispute
--   rows may not have a durable client relationship yet.
-- - When client_id is present, insert and update policies require the client
--   to share the dispute account_id.
-- - Before applying RLS, audit disputes with null client_id and decide whether
--   they are valid account-level dispute rows, data needing repair, or rows to
--   archive.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete disputes after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   disputes and should be unable to insert, update, or delete rows.

-- Future dispute write roles:
-- - SELECT may remain available to every account member if dispute visibility
--   is team-wide.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed dispute management
--   roles before apply if the product differentiates permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Child dispute letters, letters, documents, and calendar events:
-- - This draft protects only disputes.
-- - dispute_letters, persisted letters, documents, and calendar_events need
--   separate account_id pilots, backfills, readiness checks, and policies
--   before RLS is enabled for those tables.
-- - Do not rely on disputes RLS to protect child rows until each child table
--   has its own ownership field or a reviewed parent-join policy path.

-- Client portal dispute access:
-- - These policies are for authenticated business users.
-- - Customer portal dispute access needs a separate path based on
--   client_portal_users or an equivalent portal identity mapping.
-- - Do not expose portal dispute data by reusing broad business account
--   membership policies for customer users.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "disputes_delete_account_members" on disputes;
-- drop policy if exists "disputes_update_account_members" on disputes;
-- drop policy if exists "disputes_insert_account_members" on disputes;
-- drop policy if exists "disputes_select_account_members" on disputes;
-- alter table disputes disable row level security;
