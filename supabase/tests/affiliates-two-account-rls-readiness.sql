-- Phase 3 affiliates two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, and account-owned
--   affiliate rows in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and deletes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make affiliates.account_id NOT NULL.
-- - This script does not change ownership for unrelated local/static/demo
--   areas.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from affiliates
where email like 'rls-readiness-affiliate-%@example.test';

delete from account_memberships
where user_id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
)
or account_id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
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
    '18000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-affiliate-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '18000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-affiliate-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '28000000-0000-4000-8000-000000000001',
    'RLS Readiness Affiliates Account A',
    '18000000-0000-4000-8000-000000000001'
  ),
  (
    '28000000-0000-4000-8000-000000000002',
    'RLS Readiness Affiliates Account B',
    '18000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '28000000-0000-4000-8000-000000000001',
    '18000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '28000000-0000-4000-8000-000000000002',
    '18000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into affiliates (
  name,
  company_name,
  office_phone,
  cell_phone,
  email,
  status,
  start_date,
  end_date,
  commission,
  account_id
) values
  (
    'RLS Affiliate A',
    'RLS Affiliate Company A',
    '555-0801',
    '555-0802',
    'rls-readiness-affiliate-a@example.test',
    'Active',
    current_date,
    current_date + interval '30 days',
    '10',
    '28000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS Affiliate B',
    'RLS Affiliate Company B',
    '555-0803',
    '555-0804',
    'rls-readiness-affiliate-b@example.test',
    'Lead',
    current_date,
    current_date + interval '45 days',
    '12',
    '28000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only RLS Affiliate A.
select name, account_id
from affiliates
where account_id = '28000000-0000-4000-8000-000000000001'
  and email like 'rls-readiness-affiliate-%@example.test'
order by name;

-- Expected: one row, only RLS Affiliate B.
select name, account_id
from affiliates
where account_id = '28000000-0000-4000-8000-000000000002'
  and email like 'rls-readiness-affiliate-%@example.test'
order by name;

-- Expected: insert succeeds with Account A ownership.
insert into affiliates (
  name,
  company_name,
  office_phone,
  cell_phone,
  email,
  status,
  start_date,
  end_date,
  commission,
  account_id
) values (
  'RLS Affiliate A Inserted',
  'RLS Affiliate Company A Inserted',
  '555-0805',
  '555-0806',
  'rls-readiness-affiliate-a-inserted@example.test',
  'Pending Referrals',
  current_date,
  current_date + interval '60 days',
  '15',
  '28000000-0000-4000-8000-000000000001'
)
returning name, email, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's affiliate.
delete from affiliates
where id = (
  select id
  from affiliates
  where email = 'rls-readiness-affiliate-b@example.test'
  limit 1
)
and account_id = '28000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from affiliates
  where email = 'rls-readiness-affiliate-b@example.test'
    and account_id = '28000000-0000-4000-8000-000000000002'
) as account_b_affiliate_survived_account_a_scoped_delete;

-- Expected: Account A-scoped delete removes Account A's inserted affiliate.
delete from affiliates
where email = 'rls-readiness-affiliate-a-inserted@example.test'
  and account_id = '28000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from affiliates
  where email = 'rls-readiness-affiliate-a-inserted@example.test'
    and account_id = '28000000-0000-4000-8000-000000000001'
) as account_a_inserted_affiliate_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables affiliates RLS and adds
-- read, insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '18000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A affiliates.
--   select name, account_id
--   from affiliates
--   where email like 'rls-readiness-affiliate-%@example.test'
--   order by name;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into affiliates (
--     name,
--     company_name,
--     office_phone,
--     cell_phone,
--     email,
--     status,
--     start_date,
--     end_date,
--     commission,
--     account_id
--   )
--   values (
--     'RLS Affiliate A Post RLS Insert',
--     'RLS Affiliate Company A Post RLS Insert',
--     '555-0807',
--     '555-0808',
--     'rls-readiness-affiliate-a-post-rls-insert@example.test',
--     'Active',
--     current_date,
--     current_date + interval '90 days',
--     '14',
--     '28000000-0000-4000-8000-000000000001'
--   )
--   returning name, email, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the account membership WITH CHECK policy.
--   insert into affiliates (
--     name,
--     company_name,
--     office_phone,
--     cell_phone,
--     email,
--     status,
--     start_date,
--     end_date,
--     commission,
--     account_id
--   )
--   values (
--     'RLS Affiliate Cross Account Insert Should Fail',
--     'RLS Affiliate Cross Account Company',
--     '555-0809',
--     '555-0810',
--     'rls-readiness-affiliate-cross-account-insert-should-fail@example.test',
--     'Lead',
--     current_date,
--     current_date + interval '45 days',
--     '11',
--     '28000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot delete Account B's affiliate.
--   delete from affiliates
--   where email = 'rls-readiness-affiliate-b@example.test';
--
--   select exists (
--     select 1
--     from affiliates
--     where email = 'rls-readiness-affiliate-b@example.test'
--       and account_id = '28000000-0000-4000-8000-000000000002'
--   ) as account_b_affiliate_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from affiliates
where email like 'rls-readiness-affiliate-%@example.test';

delete from account_memberships
where user_id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
)
or account_id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
);
