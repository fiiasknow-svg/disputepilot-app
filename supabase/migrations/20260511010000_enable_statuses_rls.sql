-- Phase 3 statuses RLS apply migration.
--
-- This migration enables RLS on statuses only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/statuses-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for statuses.
-- - the post-RLS block in that readiness script passes in the disposable DB.
-- - null statuses.account_id rows have been audited and intentionally handled.

drop policy if exists "statuses_delete_account_members" on statuses;
drop policy if exists "statuses_update_account_members" on statuses;
drop policy if exists "statuses_insert_account_members" on statuses;
drop policy if exists "statuses_select_account_members" on statuses;

alter table statuses enable row level security;

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

-- Rollback notes:
-- In a disposable database, you can disable statuses RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table statuses disable row level security;
-- Do not run rollback casually in production.

