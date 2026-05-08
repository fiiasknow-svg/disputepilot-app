-- Draft only: clients RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - clients.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/clients-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - child-table ownership for invoices, disputes, calendar_events, letters,
--   and portal mappings is handled separately.
--
-- Future apply step, intentionally commented:
-- alter table clients enable row level security;
-- alter table clients force row level security;

-- Policy model:
-- - A user can access a client only when clients.account_id belongs to one of
--   their account_memberships rows.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Client write policies are drafted for any account member. Tighten writes
--   to owner/admin/manager-style roles before apply if the product
--   differentiates client management permissions.

create policy "clients_select_account_members"
on clients
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "clients_insert_account_members"
on clients
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "clients_update_account_members"
on clients
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

create policy "clients_delete_account_members"
on clients
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
-- - Do not make clients.account_id NOT NULL until that audit is complete.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete clients after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   clients and should be unable to insert, update, or delete rows.

-- Future role semantics for client writes:
-- - SELECT likely remains available to every account member.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed account ownership or
--   client-management roles before apply if the product differentiates team
--   permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Lead conversion:
-- - The current leads UI can insert a clients row when converting a lead.
-- - This policy allows that insert only when the converted client account_id is
--   one of the authenticated user's memberships.
-- - The related leads status update remains governed by leads RLS, not this
--   clients draft.

-- Child tables and portal access:
-- - This draft does not protect invoices, disputes, calendar_events,
--   dispute_letters, saved letters, documents, or client portal data.
-- - Do not expose portal-facing client data until client_portal_users and
--   portal-specific policies exist.
-- - Do not rely on clients RLS to protect child rows until each child table has
--   its own ownership field, backfill, readiness checks, and policies.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "clients_delete_account_members" on clients;
-- drop policy if exists "clients_update_account_members" on clients;
-- drop policy if exists "clients_insert_account_members" on clients;
-- drop policy if exists "clients_select_account_members" on clients;
-- alter table clients disable row level security;
