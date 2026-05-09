-- Phase 3 dispute_letters two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, account-owned
--   clients, account-owned disputes, and account-owned dispute_letters in a
--   disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by dispute_id plus account_id, inserts include dispute_id
--   plus account_id, and writes use both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make dispute_letters.account_id NOT NULL.
-- - This script does not change ownership for letters, documents, templates,
--   or portal letter access.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from dispute_letters
where title like 'RLS Dispute Letter %';

delete from disputes
where account_name like 'RLS-DISPLETTER-%';

delete from clients
where email like 'rls-readiness-dispute-letter-client-%@example.test';

delete from account_memberships
where user_id in (
  '17000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000002'
)
or account_id in (
  '27000000-0000-4000-8000-000000000001',
  '27000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '27000000-0000-4000-8000-000000000001',
  '27000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '17000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000002'
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
    '17000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-dispute-letter-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '17000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-dispute-letter-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '27000000-0000-4000-8000-000000000001',
    'RLS Readiness Dispute Letters Account A',
    '17000000-0000-4000-8000-000000000001'
  ),
  (
    '27000000-0000-4000-8000-000000000002',
    'RLS Readiness Dispute Letters Account B',
    '17000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '27000000-0000-4000-8000-000000000001',
    '17000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '27000000-0000-4000-8000-000000000002',
    '17000000-0000-4000-8000-000000000002',
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
  account_id
) values
  (
    'RLS',
    'Dispute Letter Client A',
    'RLS Dispute Letter Client A',
    'rls-readiness-dispute-letter-client-a@example.test',
    '555-0701',
    'active',
    'Client',
    '27000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Dispute Letter Client B',
    'RLS Dispute Letter Client B',
    'rls-readiness-dispute-letter-client-b@example.test',
    '555-0702',
    'active',
    'Client',
    '27000000-0000-4000-8000-000000000002'
  );

insert into disputes (
  client_id,
  account_name,
  account_number,
  account_type,
  bureau,
  reason,
  status,
  round,
  account_id
) values
  (
    (select id from clients where email = 'rls-readiness-dispute-letter-client-a@example.test'),
    'RLS-DISPLETTER-A-OWNED',
    'A-7001',
    'Credit Card',
    'equifax',
    'Not My Account',
    'pending',
    1,
    '27000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from clients where email = 'rls-readiness-dispute-letter-client-b@example.test'),
    'RLS-DISPLETTER-B-OWNED',
    'B-7001',
    'Credit Card',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '27000000-0000-4000-8000-000000000002'
  );

insert into dispute_letters (
  dispute_id,
  title,
  content,
  round,
  account_id
) values
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-A-OWNED'),
    'RLS Dispute Letter A Owned',
    'Seeded readiness dispute letter for Account A.',
    1,
    '27000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-B-OWNED'),
    'RLS Dispute Letter B Owned',
    'Seeded readiness dispute letter for Account B.',
    1,
    '27000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only RLS Dispute Letter A Owned.
select title, dispute_id, account_id
from dispute_letters
where dispute_id = (
    select id from disputes where account_name = 'RLS-DISPLETTER-A-OWNED'
  )
  and account_id = '27000000-0000-4000-8000-000000000001'
  and title like 'RLS Dispute Letter %'
order by title;

-- Expected: one row, only RLS Dispute Letter B Owned.
select title, dispute_id, account_id
from dispute_letters
where dispute_id = (
    select id from disputes where account_name = 'RLS-DISPLETTER-B-OWNED'
  )
  and account_id = '27000000-0000-4000-8000-000000000002'
  and title like 'RLS Dispute Letter %'
order by title;

-- Expected: no rows. All readiness dispute letters must match their parent
-- dispute account.
select dispute_letters.title,
       dispute_letters.account_id as letter_account_id,
       disputes.account_id as dispute_account_id
from dispute_letters
join disputes on disputes.id = dispute_letters.dispute_id
where dispute_letters.title like 'RLS Dispute Letter %'
  and dispute_letters.account_id is distinct from disputes.account_id;

-- Expected: insert succeeds with both dispute_id and Account A ownership.
-- The current app only reads dispute_letters, but the future persisted write
-- shape must include both ids.
insert into dispute_letters (
  dispute_id,
  title,
  content,
  round,
  account_id
) values (
  (select id from disputes where account_name = 'RLS-DISPLETTER-A-OWNED'),
  'RLS Dispute Letter A Inserted',
  'Inserted readiness dispute letter for Account A.',
  2,
  '27000000-0000-4000-8000-000000000001'
)
returning title, dispute_id, account_id;

-- Expected: match = true.
select exists (
  select 1
  from dispute_letters
  join disputes on disputes.id = dispute_letters.dispute_id
  where dispute_letters.title = 'RLS Dispute Letter A Inserted'
    and dispute_letters.account_id = disputes.account_id
) as inserted_dispute_letter_parent_account_matches;

-- Expected: this Account A-scoped update does not update Account B's letter.
update dispute_letters
set title = 'RLS Dispute Letter B Should Not Change'
where id = (
  select id
  from dispute_letters
  where title = 'RLS Dispute Letter B Owned'
  limit 1
)
and account_id = '27000000-0000-4000-8000-000000000001';

-- Expected: title remains RLS Dispute Letter B Owned.
select title
from dispute_letters
where title = 'RLS Dispute Letter B Owned'
  and account_id = '27000000-0000-4000-8000-000000000002';

-- Expected: Account A-scoped update changes Account A's inserted letter.
update dispute_letters
set title = 'RLS Dispute Letter A Updated',
    content = 'Updated readiness dispute letter for Account A.'
where title = 'RLS Dispute Letter A Inserted'
  and account_id = '27000000-0000-4000-8000-000000000001'
returning title, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's letter.
delete from dispute_letters
where id = (
  select id
  from dispute_letters
  where title = 'RLS Dispute Letter B Owned'
  limit 1
)
and account_id = '27000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from dispute_letters
  where title = 'RLS Dispute Letter B Owned'
    and account_id = '27000000-0000-4000-8000-000000000002'
) as account_b_dispute_letter_survived_account_a_scoped_delete;

-- Expected: Account A-scoped delete removes Account A's updated letter.
delete from dispute_letters
where title = 'RLS Dispute Letter A Updated'
  and account_id = '27000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from dispute_letters
  where title = 'RLS Dispute Letter A Updated'
    and account_id = '27000000-0000-4000-8000-000000000001'
) as account_a_inserted_dispute_letter_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables dispute_letters RLS and adds
-- read, insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '17000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A dispute letters.
--   select title, account_id
--   from dispute_letters
--   where title like 'RLS Dispute Letter %'
--   order by title;
--
--   -- Expected after RLS: insert into Account A with an Account A dispute succeeds.
--   insert into dispute_letters (
--     dispute_id,
--     title,
--     content,
--     round,
--     account_id
--   )
--   values (
--     (select id from disputes where account_name = 'RLS-DISPLETTER-A-OWNED'),
--     'RLS Dispute Letter A Post RLS Insert',
--     'Post-RLS readiness dispute letter for Account A.',
--     2,
--     '27000000-0000-4000-8000-000000000001'
--   )
--   returning title, dispute_id, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the account membership WITH CHECK policy.
--   insert into dispute_letters (
--     dispute_id,
--     title,
--     content,
--     account_id
--   )
--   values (
--     (select id from disputes where account_name = 'RLS-DISPLETTER-B-OWNED'),
--     'RLS Dispute Letter Cross Account Insert Should Fail',
--     'This should not be allowed for Account A user.',
--     '27000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: insert into Account A with an Account B dispute fails.
--   insert into dispute_letters (
--     dispute_id,
--     title,
--     content,
--     account_id
--   )
--   values (
--     (select id from disputes where account_name = 'RLS-DISPLETTER-B-OWNED'),
--     'RLS Dispute Letter Cross Dispute Insert Should Fail',
--     'This should not be allowed because the parent dispute is Account B.',
--     '27000000-0000-4000-8000-000000000001'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's dispute letter.
--   update dispute_letters
--   set title = 'RLS Dispute Letter B RLS Update Should Fail'
--   where title = 'RLS Dispute Letter B Owned';
--
--   select title
--   from dispute_letters
--   where title = 'RLS Dispute Letter B Owned';
--
--   -- Expected after RLS: Account A cannot move an Account A dispute letter
--   -- to an Account B dispute.
--   update dispute_letters
--   set dispute_id = (
--     select id from disputes where account_name = 'RLS-DISPLETTER-B-OWNED'
--   )
--   where title = 'RLS Dispute Letter A Owned';
--
--   -- Expected after RLS: Account A cannot delete Account B's dispute letter.
--   delete from dispute_letters
--   where title = 'RLS Dispute Letter B Owned';
--
--   select exists (
--     select 1
--     from dispute_letters
--     where title = 'RLS Dispute Letter B Owned'
--       and account_id = '27000000-0000-4000-8000-000000000002'
--   ) as account_b_dispute_letter_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from dispute_letters
where title like 'RLS Dispute Letter %';

delete from disputes
where account_name like 'RLS-DISPLETTER-%';

delete from clients
where email like 'rls-readiness-dispute-letter-client-%@example.test';

delete from account_memberships
where user_id in (
  '17000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000002'
)
or account_id in (
  '27000000-0000-4000-8000-000000000001',
  '27000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '27000000-0000-4000-8000-000000000001',
  '27000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '17000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000002'
);
