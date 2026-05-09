-- Draft only: dispute_letters RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - dispute_letters.account_id has been audited and backfilled for all
--   intended rows.
-- - supabase/tests/dispute-letters-two-account-rls-readiness.sql passes
--   pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - dispute letter write-role semantics are decided.
-- - letters, documents, templates, portal letter access, and other child
--   paths are kept separate or have their own ownership and policy coverage.
--
-- Future apply step, intentionally commented:
-- alter table dispute_letters enable row level security;
-- alter table dispute_letters force row level security;

-- Policy model:
-- - A user can access a dispute letter only when dispute_letters.account_id
--   belongs to one of their account_memberships rows.
-- - If dispute_id is present, the referenced dispute must belong to the same
--   account_id as the dispute letter.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Dispute letter write policies are drafted for any account member. Tighten
--   writes to owner/admin/manager/specialist-style roles before apply if the
--   product differentiates letter permissions.

create policy "dispute_letters_select_account_members"
on dispute_letters
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "dispute_letters_insert_account_members"
on dispute_letters
for insert
to authenticated
with check (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
  and (
    dispute_id is null
    or exists (
      select 1
      from disputes
      where disputes.id = dispute_letters.dispute_id
        and disputes.account_id = dispute_letters.account_id
    )
  )
);

create policy "dispute_letters_update_account_members"
on dispute_letters
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
    dispute_id is null
    or exists (
      select 1
      from disputes
      where disputes.id = dispute_letters.dispute_id
        and disputes.account_id = dispute_letters.account_id
    )
  )
);

create policy "dispute_letters_delete_account_members"
on dispute_letters
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
-- - Do not make dispute_letters.account_id NOT NULL until that audit is
--   complete.

-- Orphan or invalid dispute_id rows:
-- - This draft allows dispute_letters.dispute_id to remain null because legacy
--   rows may exist without a durable parent dispute.
-- - When dispute_id is present, insert and update policies require the parent
--   dispute to share the dispute letter account_id.
-- - Before applying RLS, audit null, invalid, or cross-account dispute_id rows
--   and decide whether they are valid account-level letter records, data
--   needing repair, or rows to archive.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete dispute_letters after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   dispute_letters and should be unable to insert, update, or delete rows.

-- Future dispute letter write roles:
-- - SELECT may remain available to every account member if dispute letters are
--   team-visible.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed letter generation or
--   dispute management roles before apply if the product differentiates
--   permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Letters, documents, and templates:
-- - This draft protects only dispute_letters.
-- - Persisted letters, documents, and templates need separate account_id
--   pilots, backfills, readiness checks, and policies if they become private
--   persisted business tables.
-- - Do not rely on dispute_letters RLS to protect unrelated letter/template or
--   document records.

-- Client portal letter access:
-- - These policies are for authenticated business users.
-- - Customer portal letter access needs a separate path based on
--   client_portal_users or an equivalent portal identity mapping.
-- - Do not expose portal letter data by reusing broad business account
--   membership policies for customer users.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "dispute_letters_delete_account_members" on dispute_letters;
-- drop policy if exists "dispute_letters_update_account_members" on dispute_letters;
-- drop policy if exists "dispute_letters_insert_account_members" on dispute_letters;
-- drop policy if exists "dispute_letters_select_account_members" on dispute_letters;
-- alter table dispute_letters disable row level security;
