-- Draft only: invoices RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - invoices.account_id has been audited and backfilled for all intended rows.
-- - supabase/tests/invoices-two-account-rls-readiness.sql passes pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - billing write-role semantics are decided.
-- - payments, services, portal invoice access, and other child paths are kept
--   separate or have their own ownership and policy coverage.
--
-- Future apply step, intentionally commented:
-- alter table invoices enable row level security;
-- alter table invoices force row level security;

-- Policy model:
-- - A user can access an invoice only when invoices.account_id belongs to one
--   of their account_memberships rows.
-- - account_id is the primary tenant boundary.
-- - If client_id is present and invoices.client_id is schema-compatible with
--   clients.id, the referenced client must belong to the same account_id as
--   the invoice. Production attempts have observed invoices.client_id policy
--   resolution as both uuid and bigint across environments, so an apply
--   migration should provide safe overloads for both compatible cases and must
--   not compare incompatible columns directly.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Invoice write policies are drafted for any account member. Tighten writes
--   to owner/admin/manager/billing-style roles before apply if the product
--   differentiates billing permissions.

create policy "invoices_select_account_members"
on invoices
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "invoices_insert_account_members"
on invoices
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_update_account_members"
on invoices
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
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_delete_account_members"
on invoices
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
-- - Do not make invoices.account_id NOT NULL until that audit is complete.

-- Missing or legacy client_id rows:
-- - This draft allows invoices.client_id to remain null because legacy invoice
--   rows may not have a durable client relationship yet.
-- - When client_id is present and schema-compatible with clients.id, insert
--   and update policies require the client to share the invoice account_id.
--   The apply migration should support both uuid and bigint overloads for
--   public.invoices_client_matches_account.
-- - When the schema is incompatible, do not compare clients.id to
--   invoices.client_id. Keep account_id membership as the enforced tenant
--   boundary until the legacy client relationship is repaired or mapped.
-- - Before applying RLS, audit invoices with null client_id and decide whether
--   they are valid account-level billing rows, data needing repair, or rows to
--   archive.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete invoices after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   invoices and should be unable to insert, update, or delete rows.

-- Future billing write roles:
-- - SELECT may remain available to every account member if invoice visibility
--   is team-wide.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed billing roles before
--   apply if the product differentiates billing permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Payments and services/products:
-- - This draft protects only invoices.
-- - Payments, services/products, payment history, and any persisted billing
--   catalog tables need separate account_id pilots, backfills, readiness
--   checks, and policies before RLS is enabled for those tables.
-- - Browser-local billing workspace records remain outside database RLS.

-- Client portal invoice access:
-- - These policies are for authenticated business users.
-- - Customer portal invoice access needs a separate path based on
--   client_portal_users or an equivalent portal identity mapping.
-- - Do not expose portal invoice data by reusing broad business account
--   membership policies for customer users.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "invoices_delete_account_members" on invoices;
-- drop policy if exists "invoices_update_account_members" on invoices;
-- drop policy if exists "invoices_insert_account_members" on invoices;
-- drop policy if exists "invoices_select_account_members" on invoices;
-- alter table invoices disable row level security;
