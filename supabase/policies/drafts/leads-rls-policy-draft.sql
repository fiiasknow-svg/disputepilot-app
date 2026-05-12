-- Draft only: leads RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - leads.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/leads-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
--
-- Future apply step, intentionally commented:
-- alter table leads enable row level security;
-- alter table leads force row level security;

-- Policy model:
-- - The apply migration uses a SECURITY DEFINER helper so authenticated users
--   can evaluate membership without a direct read grant on account_memberships.
-- - A user can access a lead only when leads.account_id belongs to one of
--   their account_memberships rows.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Lead write policies are drafted for owner/admin/manager/member roles to
--   match the proven statuses and employees RLS pattern used for disposable
--   validation. Tighten writes further only if product permissions demand it.

create policy "leads_select_account_members"
on leads
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "leads_insert_account_members"
on leads
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "leads_update_account_members"
on leads
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

create policy "leads_delete_account_members"
on leads
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
-- - Do not make leads.account_id NOT NULL until that audit is complete.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete leads after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   leads and should be unable to insert, update, or delete rows.

-- Future role semantics for lead writes:
-- - SELECT likely remains available to every account member.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed account ownership or
--   lead-management roles before apply if the product differentiates sales or
--   lead pipeline permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Lead conversion and clients.account_id dependency:
-- - The current leads UI can insert a clients row when converting a lead.
-- - This draft only protects the lead status update. Converted client
--   isolation still depends on a later clients ownership pilot that adds,
--   backfills, scopes, and protects clients.account_id.
-- - Do not treat leads RLS as complete converted-client isolation until the
--   clients table has its own ownership and RLS coverage.

-- Affiliates:
-- - Affiliates are intentionally separate from this leads draft.
-- - Do not apply these policies to the affiliates table.
-- - Affiliates need their own account_id pilot, readiness checklist, and
--   policy review before affiliate RLS is enabled.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "leads_delete_account_members" on leads;
-- drop policy if exists "leads_update_account_members" on leads;
-- drop policy if exists "leads_insert_account_members" on leads;
-- drop policy if exists "leads_select_account_members" on leads;
-- alter table leads disable row level security;
