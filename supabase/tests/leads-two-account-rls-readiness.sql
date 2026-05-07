-- Phase 3 leads two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, and account-owned
--   leads in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and writes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make leads.account_id NOT NULL.
-- - This script does not change clients or affiliates ownership.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from leads
where email like 'rls-readiness-lead-%@example.test';

delete from account_memberships
where user_id in (
  '12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002'
)
or account_id in (
  '22000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '22000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002'
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
    '12000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-lead-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '12000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-lead-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '22000000-0000-4000-8000-000000000001',
    'RLS Readiness Leads Account A',
    '12000000-0000-4000-8000-000000000001'
  ),
  (
    '22000000-0000-4000-8000-000000000002',
    'RLS Readiness Leads Account B',
    '12000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '22000000-0000-4000-8000-000000000001',
    '12000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '22000000-0000-4000-8000-000000000002',
    '12000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into leads (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  source,
  status,
  city,
  state,
  lead_score,
  assigned_agent,
  notes,
  account_id
) values
  (
    'RLS',
    'Lead A',
    'RLS Lead A',
    'rls-readiness-lead-a-owned@example.test',
    '555-0201',
    'Website',
    'new',
    'Sarasota',
    'FL',
    80,
    'Alice Johnson',
    'Seeded readiness lead for Account A.',
    '22000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Lead B',
    'RLS Lead B',
    'rls-readiness-lead-b-owned@example.test',
    '555-0202',
    'Referral',
    'new',
    'Tampa',
    'FL',
    70,
    'Bob Smith',
    'Seeded readiness lead for Account B.',
    '22000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only rls-readiness-lead-a-owned@example.test.
select email, account_id
from leads
where account_id = '22000000-0000-4000-8000-000000000001'
  and email like 'rls-readiness-lead-%@example.test'
order by email;

-- Expected: one row, only rls-readiness-lead-b-owned@example.test.
select email, account_id
from leads
where account_id = '22000000-0000-4000-8000-000000000002'
  and email like 'rls-readiness-lead-%@example.test'
order by email;

-- Expected: insert succeeds and the inserted row has Account A ownership.
insert into leads (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  source,
  status,
  city,
  state,
  lead_score,
  assigned_agent,
  notes,
  account_id
) values (
  'RLS',
  'Inserted Lead A',
  'RLS Inserted Lead A',
  'rls-readiness-lead-a-inserted@example.test',
  '555-0203',
  'Email Campaign',
  'new',
  'Sarasota',
  'FL',
  75,
  'Alice Johnson',
  'Inserted readiness lead for Account A.',
  '22000000-0000-4000-8000-000000000001'
)
returning email, account_id;

-- Expected: this Account A-scoped update does not update Account B's lead.
update leads
set status = 'lost'
where id = (
  select id
  from leads
  where email = 'rls-readiness-lead-b-owned@example.test'
  limit 1
)
and account_id = '22000000-0000-4000-8000-000000000001';

-- Expected: status = new.
select status
from leads
where email = 'rls-readiness-lead-b-owned@example.test'
  and account_id = '22000000-0000-4000-8000-000000000002';

-- Expected: this Account A-scoped update changes Account A's inserted lead.
update leads
set status = 'contacted'
where email = 'rls-readiness-lead-a-inserted@example.test'
  and account_id = '22000000-0000-4000-8000-000000000001'
returning email, status, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's lead.
delete from leads
where id = (
  select id
  from leads
  where email = 'rls-readiness-lead-b-owned@example.test'
  limit 1
)
and account_id = '22000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from leads
  where email = 'rls-readiness-lead-b-owned@example.test'
    and account_id = '22000000-0000-4000-8000-000000000002'
) as account_b_lead_survived_account_a_scoped_delete;

-- Expected: this Account A-scoped delete removes Account A's inserted lead.
delete from leads
where email = 'rls-readiness-lead-a-inserted@example.test'
  and account_id = '22000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from leads
  where email = 'rls-readiness-lead-a-inserted@example.test'
    and account_id = '22000000-0000-4000-8000-000000000001'
) as account_a_inserted_lead_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables leads RLS and adds read,
-- insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '12000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A leads.
--   select email, account_id
--   from leads
--   where email like 'rls-readiness-lead-%@example.test'
--   order by email;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into leads (
--     first_name,
--     last_name,
--     full_name,
--     email,
--     phone,
--     source,
--     status,
--     city,
--     state,
--     lead_score,
--     assigned_agent,
--     notes,
--     account_id
--   )
--   values (
--     'RLS',
--     'Post RLS Lead A',
--     'RLS Post RLS Lead A',
--     'rls-readiness-lead-a-post-rls-insert@example.test',
--     '555-0204',
--     'Website',
--     'new',
--     'Sarasota',
--     'FL',
--     82,
--     'Alice Johnson',
--     'Post-RLS readiness lead for Account A.',
--     '22000000-0000-4000-8000-000000000001'
--   )
--   returning email, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the WITH CHECK policy.
--   insert into leads (
--     first_name,
--     last_name,
--     full_name,
--     email,
--     phone,
--     source,
--     status,
--     city,
--     state,
--     lead_score,
--     assigned_agent,
--     notes,
--     account_id
--   )
--   values (
--     'RLS',
--     'Cross Account Lead',
--     'RLS Cross Account Lead',
--     'rls-readiness-lead-cross-account-insert-should-fail@example.test',
--     '555-0205',
--     'Website',
--     'new',
--     'Tampa',
--     'FL',
--     60,
--     'Bob Smith',
--     'This row should be blocked by lead RLS.',
--     '22000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's lead.
--   update leads
--   set status = 'lost'
--   where email = 'rls-readiness-lead-b-owned@example.test';
--
--   select status
--   from leads
--   where email = 'rls-readiness-lead-b-owned@example.test';
--
--   -- Expected after RLS: Account A cannot delete Account B's lead.
--   delete from leads
--   where email = 'rls-readiness-lead-b-owned@example.test';
--
--   select exists (
--     select 1
--     from leads
--     where email = 'rls-readiness-lead-b-owned@example.test'
--       and account_id = '22000000-0000-4000-8000-000000000002'
--   ) as account_b_lead_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from leads
where email like 'rls-readiness-lead-%@example.test';

delete from account_memberships
where user_id in (
  '12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002'
)
or account_id in (
  '22000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '22000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002'
);
