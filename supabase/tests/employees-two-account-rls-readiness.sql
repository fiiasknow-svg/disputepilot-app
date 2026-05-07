-- Phase 3 employees two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, and account-owned
--   employees in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and writes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make employees.account_id NOT NULL.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from employees
where email like 'rls-readiness-%@example.test';

delete from account_memberships
where user_id in (
  '11000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000002'
)
or account_id in (
  '21000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '21000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '11000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000002'
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
    '11000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-employee-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '11000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-employee-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '21000000-0000-4000-8000-000000000001',
    'RLS Readiness Employees Account A',
    '11000000-0000-4000-8000-000000000001'
  ),
  (
    '21000000-0000-4000-8000-000000000002',
    'RLS Readiness Employees Account B',
    '11000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '21000000-0000-4000-8000-000000000001',
    '11000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '21000000-0000-4000-8000-000000000002',
    '11000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into employees (
  first_name,
  last_name,
  email,
  phone,
  role,
  status,
  department,
  title,
  notes,
  account_id
) values
  (
    'RLS',
    'Employee A',
    'rls-readiness-employee-a-owned@example.test',
    '555-0101',
    'Manager',
    'active',
    'Operations',
    'Account A Manager',
    'Seeded readiness employee for Account A.',
    '21000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Employee B',
    'rls-readiness-employee-b-owned@example.test',
    '555-0102',
    'Manager',
    'active',
    'Operations',
    'Account B Manager',
    'Seeded readiness employee for Account B.',
    '21000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only rls-readiness-employee-a-owned@example.test.
select email, account_id
from employees
where account_id = '21000000-0000-4000-8000-000000000001'
  and email like 'rls-readiness-%@example.test'
order by email;

-- Expected: one row, only rls-readiness-employee-b-owned@example.test.
select email, account_id
from employees
where account_id = '21000000-0000-4000-8000-000000000002'
  and email like 'rls-readiness-%@example.test'
order by email;

-- Expected: insert succeeds and the inserted row has Account A ownership.
insert into employees (
  first_name,
  last_name,
  email,
  phone,
  role,
  status,
  department,
  title,
  notes,
  account_id
) values (
  'RLS',
  'Inserted A',
  'rls-readiness-employee-a-inserted@example.test',
  '555-0103',
  'Specialist',
  'active',
  'Operations',
  'Account A Specialist',
  'Inserted readiness employee for Account A.',
  '21000000-0000-4000-8000-000000000001'
)
returning email, account_id;

-- Expected: this Account A-scoped update does not update Account B's employee.
update employees
set title = 'Should Not Change'
where id = (
  select id
  from employees
  where email = 'rls-readiness-employee-b-owned@example.test'
  limit 1
)
and account_id = '21000000-0000-4000-8000-000000000001';

-- Expected: title = Account B Manager.
select title
from employees
where email = 'rls-readiness-employee-b-owned@example.test'
  and account_id = '21000000-0000-4000-8000-000000000002';

-- Expected: this Account A-scoped update changes Account A's inserted employee.
update employees
set title = 'Updated Account A Specialist'
where email = 'rls-readiness-employee-a-inserted@example.test'
  and account_id = '21000000-0000-4000-8000-000000000001'
returning email, title, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's employee.
delete from employees
where id = (
  select id
  from employees
  where email = 'rls-readiness-employee-b-owned@example.test'
  limit 1
)
and account_id = '21000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from employees
  where email = 'rls-readiness-employee-b-owned@example.test'
    and account_id = '21000000-0000-4000-8000-000000000002'
) as account_b_employee_survived_account_a_scoped_delete;

-- Expected: this Account A-scoped delete removes Account A's inserted employee.
delete from employees
where email = 'rls-readiness-employee-a-inserted@example.test'
  and account_id = '21000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from employees
  where email = 'rls-readiness-employee-a-inserted@example.test'
    and account_id = '21000000-0000-4000-8000-000000000001'
) as account_a_inserted_employee_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables employees RLS and adds read,
-- insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '11000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A employees.
--   select email, account_id
--   from employees
--   where email like 'rls-readiness-%@example.test'
--   order by email;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into employees (
--     first_name,
--     last_name,
--     email,
--     phone,
--     role,
--     status,
--     department,
--     title,
--     notes,
--     account_id
--   )
--   values (
--     'RLS',
--     'Post RLS A',
--     'rls-readiness-employee-a-post-rls-insert@example.test',
--     '555-0104',
--     'Specialist',
--     'active',
--     'Operations',
--     'Post RLS Account A Specialist',
--     'Post-RLS readiness employee for Account A.',
--     '21000000-0000-4000-8000-000000000001'
--   )
--   returning email, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the WITH CHECK policy.
--   insert into employees (
--     first_name,
--     last_name,
--     email,
--     phone,
--     role,
--     status,
--     department,
--     title,
--     notes,
--     account_id
--   )
--   values (
--     'RLS',
--     'Cross Account',
--     'rls-readiness-employee-cross-account-insert-should-fail@example.test',
--     '555-0105',
--     'Specialist',
--     'active',
--     'Operations',
--     'Should Not Insert',
--     'This row should be blocked by employee RLS.',
--     '21000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's employee.
--   update employees
--   set title = 'Should Not Change Under RLS'
--   where email = 'rls-readiness-employee-b-owned@example.test';
--
--   select title
--   from employees
--   where email = 'rls-readiness-employee-b-owned@example.test';
--
--   -- Expected after RLS: Account A cannot delete Account B's employee.
--   delete from employees
--   where email = 'rls-readiness-employee-b-owned@example.test';
--
--   select exists (
--     select 1
--     from employees
--     where email = 'rls-readiness-employee-b-owned@example.test'
--       and account_id = '21000000-0000-4000-8000-000000000002'
--   ) as account_b_employee_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from employees
where email like 'rls-readiness-%@example.test';

delete from account_memberships
where user_id in (
  '11000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000002'
)
or account_id in (
  '21000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '21000000-0000-4000-8000-000000000001',
  '21000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '11000000-0000-4000-8000-000000000001',
  '11000000-0000-4000-8000-000000000002'
);
