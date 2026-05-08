-- Phase 3 clients two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, and account-owned
--   clients in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and writes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make clients.account_id NOT NULL.
-- - This script does not change ownership for invoices, disputes,
--   calendar_events, or letters.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from clients
where email like 'rls-readiness-client-%@example.test';

delete from account_memberships
where user_id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
)
or account_id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
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
    '13000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-client-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '13000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-client-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '23000000-0000-4000-8000-000000000001',
    'RLS Readiness Clients Account A',
    '13000000-0000-4000-8000-000000000001'
  ),
  (
    '23000000-0000-4000-8000-000000000002',
    'RLS Readiness Clients Account B',
    '13000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '23000000-0000-4000-8000-000000000001',
    '13000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '23000000-0000-4000-8000-000000000002',
    '13000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into clients (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  status,
  client_type,
  assigned_agent,
  notes,
  account_id
) values
  (
    'RLS',
    'Client A',
    'RLS Client A',
    'rls-readiness-client-a-owned@example.test',
    '555-0301',
    'active',
    'Client',
    'Alice Johnson',
    'Seeded readiness client for Account A.',
    '23000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Client B',
    'RLS Client B',
    'rls-readiness-client-b-owned@example.test',
    '555-0302',
    'active',
    'Client',
    'Bob Smith',
    'Seeded readiness client for Account B.',
    '23000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only rls-readiness-client-a-owned@example.test.
select email, account_id
from clients
where account_id = '23000000-0000-4000-8000-000000000001'
  and email like 'rls-readiness-client-%@example.test'
order by email;

-- Expected: one row, only rls-readiness-client-b-owned@example.test.
select email, account_id
from clients
where account_id = '23000000-0000-4000-8000-000000000002'
  and email like 'rls-readiness-client-%@example.test'
order by email;

-- Expected: direct client creation includes Account A ownership.
insert into clients (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  status,
  client_type,
  assigned_agent,
  notes,
  account_id
) values (
  'RLS',
  'Inserted Client A',
  'RLS Inserted Client A',
  'rls-readiness-client-a-inserted@example.test',
  '555-0303',
  'active',
  'Client',
  'Alice Johnson',
  'Inserted readiness client for Account A.',
  '23000000-0000-4000-8000-000000000001'
)
returning email, account_id;

-- Expected: CSV/import-style client creation includes Account A ownership.
insert into clients (
  first_name,
  last_name,
  full_name,
  email,
  status,
  client_type,
  account_id
) values (
  'RLS',
  'Imported Client A',
  'RLS Imported Client A',
  'rls-readiness-client-a-imported@example.test',
  'active',
  'Client',
  '23000000-0000-4000-8000-000000000001'
)
returning email, account_id;

-- Expected: lead-conversion-style client creation includes Account A ownership.
insert into clients (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  status,
  assigned_agent,
  account_id
) values (
  'RLS',
  'Converted Client A',
  'RLS Converted Client A',
  'rls-readiness-client-a-converted@example.test',
  '555-0304',
  'active',
  'Alice Johnson',
  '23000000-0000-4000-8000-000000000001'
)
returning email, account_id;

-- Expected: this Account A-scoped update does not update Account B's client.
update clients
set status = 'inactive'
where id = (
  select id
  from clients
  where email = 'rls-readiness-client-b-owned@example.test'
  limit 1
)
and account_id = '23000000-0000-4000-8000-000000000001';

-- Expected: status = active.
select status
from clients
where email = 'rls-readiness-client-b-owned@example.test'
  and account_id = '23000000-0000-4000-8000-000000000002';

-- Expected: Account A-scoped status update changes Account A's inserted client.
update clients
set status = 'pending'
where email = 'rls-readiness-client-a-inserted@example.test'
  and account_id = '23000000-0000-4000-8000-000000000001'
returning email, status, account_id;

-- Expected: Account A-scoped bulk-style update changes only Account A rows.
update clients
set status = 'cancelled'
where email in (
  'rls-readiness-client-a-imported@example.test',
  'rls-readiness-client-b-owned@example.test'
)
and account_id = '23000000-0000-4000-8000-000000000001'
returning email, status, account_id;

-- Expected: status = active.
select status
from clients
where email = 'rls-readiness-client-b-owned@example.test'
  and account_id = '23000000-0000-4000-8000-000000000002';

-- Expected: this Account A-scoped delete does not delete Account B's client.
delete from clients
where id = (
  select id
  from clients
  where email = 'rls-readiness-client-b-owned@example.test'
  limit 1
)
and account_id = '23000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from clients
  where email = 'rls-readiness-client-b-owned@example.test'
    and account_id = '23000000-0000-4000-8000-000000000002'
) as account_b_client_survived_account_a_scoped_delete;

-- Expected: Account A-scoped bulk-style delete removes only Account A rows.
delete from clients
where email in (
  'rls-readiness-client-a-inserted@example.test',
  'rls-readiness-client-a-imported@example.test',
  'rls-readiness-client-a-converted@example.test'
)
and account_id = '23000000-0000-4000-8000-000000000001';

-- Expected: count = 0.
select count(*) as remaining_account_a_inserted_clients
from clients
where email in (
  'rls-readiness-client-a-inserted@example.test',
  'rls-readiness-client-a-imported@example.test',
  'rls-readiness-client-a-converted@example.test'
)
and account_id = '23000000-0000-4000-8000-000000000001';

-- Future post-RLS checks.
-- Run these only after a later migration enables clients RLS and adds read,
-- insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '13000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A clients.
--   select email, account_id
--   from clients
--   where email like 'rls-readiness-client-%@example.test'
--   order by email;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into clients (
--     first_name,
--     last_name,
--     full_name,
--     email,
--     status,
--     client_type,
--     account_id
--   )
--   values (
--     'RLS',
--     'Post RLS Client A',
--     'RLS Post RLS Client A',
--     'rls-readiness-client-a-post-rls-insert@example.test',
--     'active',
--     'Client',
--     '23000000-0000-4000-8000-000000000001'
--   )
--   returning email, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the WITH CHECK policy.
--   insert into clients (
--     first_name,
--     last_name,
--     full_name,
--     email,
--     status,
--     client_type,
--     account_id
--   )
--   values (
--     'RLS',
--     'Cross Account Client',
--     'RLS Cross Account Client',
--     'rls-readiness-client-cross-account-insert-should-fail@example.test',
--     'active',
--     'Client',
--     '23000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's client.
--   update clients
--   set status = 'inactive'
--   where email = 'rls-readiness-client-b-owned@example.test';
--
--   select status
--   from clients
--   where email = 'rls-readiness-client-b-owned@example.test';
--
--   -- Expected after RLS: Account A cannot delete Account B's client.
--   delete from clients
--   where email = 'rls-readiness-client-b-owned@example.test';
--
--   select exists (
--     select 1
--     from clients
--     where email = 'rls-readiness-client-b-owned@example.test'
--       and account_id = '23000000-0000-4000-8000-000000000002'
--   ) as account_b_client_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from clients
where email like 'rls-readiness-client-%@example.test';

delete from account_memberships
where user_id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
)
or account_id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
);
