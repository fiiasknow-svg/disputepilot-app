-- Phase 3 statuses two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, and account-owned
--   statuses in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and deletes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make statuses.account_id NOT NULL.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from statuses
where name like 'rls-readiness-%';

delete from account_memberships
where user_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
or account_id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);

-- Seed auth users. This uses the common Supabase auth.users shape.
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'RLS Readiness Account A',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'RLS Readiness Account B',
    '10000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into statuses (name, color, type, account_id)
values
  (
    'rls-readiness-a-client-visible',
    '#10b981',
    'client',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    'rls-readiness-b-client-hidden-from-a',
    '#ef4444',
    'client',
    '20000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only rls-readiness-a-client-visible.
select name, account_id
from statuses
where account_id = '20000000-0000-4000-8000-000000000001'
  and name like 'rls-readiness-%'
order by name;

-- Expected: one row, only rls-readiness-b-client-hidden-from-a.
select name, account_id
from statuses
where account_id = '20000000-0000-4000-8000-000000000002'
  and name like 'rls-readiness-%'
order by name;

-- Expected: insert succeeds and the inserted row has Account A ownership.
insert into statuses (name, color, type, account_id)
values (
  'rls-readiness-a-inserted',
  '#3b82f6',
  'client',
  '20000000-0000-4000-8000-000000000001'
)
returning name, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's status.
delete from statuses
where id = (
  select id
  from statuses
  where name = 'rls-readiness-b-client-hidden-from-a'
  limit 1
)
and account_id = '20000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from statuses
  where name = 'rls-readiness-b-client-hidden-from-a'
    and account_id = '20000000-0000-4000-8000-000000000002'
) as account_b_status_survived_account_a_scoped_delete;

-- Expected: this Account A-scoped delete removes Account A's inserted status.
delete from statuses
where name = 'rls-readiness-a-inserted'
  and account_id = '20000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from statuses
  where name = 'rls-readiness-a-inserted'
    and account_id = '20000000-0000-4000-8000-000000000001'
) as account_a_inserted_status_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables statuses RLS and adds read,
-- insert, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '10000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A statuses.
--   select name, account_id
--   from statuses
--   where name like 'rls-readiness-%'
--   order by name;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into statuses (name, color, type, account_id)
--   values (
--     'rls-readiness-a-post-rls-insert',
--     '#8b5cf6',
--     'client',
--     '20000000-0000-4000-8000-000000000001'
--   )
--   returning name, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the WITH CHECK policy.
--   insert into statuses (name, color, type, account_id)
--   values (
--     'rls-readiness-cross-account-insert-should-fail',
--     '#f59e0b',
--     'client',
--     '20000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot delete Account B's status.
--   delete from statuses
--   where name = 'rls-readiness-b-client-hidden-from-a';
--
--   select exists (
--     select 1
--     from statuses
--     where name = 'rls-readiness-b-client-hidden-from-a'
--       and account_id = '20000000-0000-4000-8000-000000000002'
--   ) as account_b_status_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from statuses
where name like 'rls-readiness-%';

delete from account_memberships
where user_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
or account_id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);
