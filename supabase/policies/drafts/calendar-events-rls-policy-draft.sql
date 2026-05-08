-- Draft only: calendar_events RLS policies for Phase 3 review.
--
-- This file is intentionally outside supabase/migrations and must not be
-- applied automatically. Review and test it against a disposable Supabase
-- database before copying it into an active migration.
--
-- Do not apply until:
-- - calendar_events.account_id has been audited and backfilled for all
--   intended rows.
-- - supabase/tests/calendar-events-two-account-rls-readiness.sql passes
--   pre-RLS.
-- - the post-RLS block in that readiness script passes in a disposable DB.
-- - calendar write-role semantics are decided.
-- - letters, documents, dispute_letters, portal calendar access, and other
--   child paths are kept separate or have their own ownership and policy
--   coverage.
--
-- Future apply step, intentionally commented:
-- alter table calendar_events enable row level security;
-- alter table calendar_events force row level security;

-- Policy model:
-- - A user can access a calendar event only when calendar_events.account_id
--   belongs to one of their account_memberships rows.
-- - If client_id is present, the referenced client should belong to the same
--   account_id as the calendar event.
-- - account_memberships currently has role but no status column, so this draft
--   treats any membership as active. If a membership status column is added,
--   include "and account_memberships.status = 'active'" in each subquery.
-- - Calendar write policies are drafted for any account member. Tighten writes
--   to owner/admin/manager/staff-style roles before apply if the product
--   differentiates calendar permissions.

create policy "calendar_events_select_account_members"
on calendar_events
for select
to authenticated
using (
  account_id in (
    select account_id
    from account_memberships
    where user_id = auth.uid()
  )
);

create policy "calendar_events_insert_account_members"
on calendar_events
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
      where clients.id = calendar_events.client_id
        and clients.account_id = calendar_events.account_id
    )
  )
);

create policy "calendar_events_update_account_members"
on calendar_events
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
      where clients.id = calendar_events.client_id
        and clients.account_id = calendar_events.account_id
    )
  )
);

create policy "calendar_events_delete_account_members"
on calendar_events
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
-- - Do not make calendar_events.account_id NOT NULL until that audit is
--   complete.

-- Source-linked events:
-- - The current app uses calendar_events.client_id for linked clients.
-- - This draft requires client_id, when present, to reference a client with the
--   same account_id as the calendar event on insert/update.
-- - If invoice_id, dispute_id, or other source columns are added later, extend
--   insert/update WITH CHECK clauses so each source row belongs to the same
--   account_id before applying RLS.
-- - Auto-events generated from leads, invoices, disputes, or client birthdays
--   are derived UI rows, not persisted calendar_events rows protected by these
--   policies.

-- localStorage-only events:
-- - Browser-local events under disputepilot.calendar-events are outside
--   database RLS.
-- - Treat localStorage records as demo/offline cache data until explicitly
--   migrated into account-owned persisted calendar_events.

-- Anonymous users:
-- - No policy is granted to anon.
-- - auth.uid() is null for anon users, so they should not select, insert,
--   update, or delete calendar_events after RLS is enabled.

-- Authenticated users without membership:
-- - Authenticated users with no account_memberships rows should receive no
--   calendar_events and should be unable to insert, update, or delete rows.

-- Future calendar write roles:
-- - SELECT may remain available to every account member if team calendars are
--   shared.
-- - INSERT/UPDATE/DELETE should be narrowed to confirmed calendar management
--   roles before apply if the product differentiates permissions.
-- - Use account_memberships.role or a future permissions table for those
--   decisions, not client-provided form values.
-- - If account_memberships gains a status column, require active membership in
--   every policy before applying to production.

-- Portal calendar/event access:
-- - These policies are for authenticated business users.
-- - Customer portal event access needs a separate path based on
--   client_portal_users or an equivalent portal identity mapping.
-- - Do not expose portal calendar data by reusing broad business account
--   membership policies for customer users.

-- Rollback notes for a future migration that applies these policies:
-- drop policy if exists "calendar_events_delete_account_members" on calendar_events;
-- drop policy if exists "calendar_events_update_account_members" on calendar_events;
-- drop policy if exists "calendar_events_insert_account_members" on calendar_events;
-- drop policy if exists "calendar_events_select_account_members" on calendar_events;
-- alter table calendar_events disable row level security;
