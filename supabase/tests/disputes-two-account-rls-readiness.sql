-- Phase 3 disputes two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, account-owned
--   clients, and account-owned disputes in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include client_id plus account_id,
--   and writes use both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make disputes.account_id NOT NULL.
-- - This script does not change ownership for dispute_letters, letters,
--   documents, calendar_events, or portal dispute access.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from disputes
where account_name like 'RLS-DISP-%';

delete from clients
where email like 'rls-readiness-dispute-client-%@example.test';

delete from account_memberships
where user_id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
)
or account_id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
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
    '15000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-dispute-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '15000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-dispute-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '25000000-0000-4000-8000-000000000001',
    'RLS Readiness Disputes Account A',
    '15000000-0000-4000-8000-000000000001'
  ),
  (
    '25000000-0000-4000-8000-000000000002',
    'RLS Readiness Disputes Account B',
    '15000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '25000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '25000000-0000-4000-8000-000000000002',
    '15000000-0000-4000-8000-000000000002',
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
    'Dispute Client A',
    'RLS Dispute Client A',
    'rls-readiness-dispute-client-a@example.test',
    '555-0501',
    'active',
    'Client',
    '25000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Dispute Client B',
    'RLS Dispute Client B',
    'rls-readiness-dispute-client-b@example.test',
    '555-0502',
    'active',
    'Client',
    '25000000-0000-4000-8000-000000000002'
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
    (select id from clients where email = 'rls-readiness-dispute-client-a@example.test'),
    'RLS-DISP-A-OWNED',
    'A-1001',
    'Credit Card',
    'equifax',
    'Not My Account',
    'pending',
    1,
    '25000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from clients where email = 'rls-readiness-dispute-client-b@example.test'),
    'RLS-DISP-B-OWNED',
    'B-1001',
    'Credit Card',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '25000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only RLS-DISP-A-OWNED.
select account_name, account_id
from disputes
where account_id = '25000000-0000-4000-8000-000000000001'
  and account_name like 'RLS-DISP-%'
order by account_name;

-- Expected: one row, only RLS-DISP-B-OWNED.
select account_name, account_id
from disputes
where account_id = '25000000-0000-4000-8000-000000000002'
  and account_name like 'RLS-DISP-%'
order by account_name;

-- Expected: no rows. All readiness disputes with a client_id must match their client account.
select disputes.account_name, disputes.account_id as dispute_account_id, clients.account_id as client_account_id
from disputes
join clients on clients.id = disputes.client_id
where disputes.account_name like 'RLS-DISP-%'
  and disputes.account_id is distinct from clients.account_id;

-- Expected: insert succeeds with both client_id and Account A ownership.
-- The current app create path is local/static, but the future persisted shape
-- must include both ids.
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
) values (
  (select id from clients where email = 'rls-readiness-dispute-client-a@example.test'),
  'RLS-DISP-A-INSERTED',
  'A-2001',
  'Collection Account',
  'transunion',
  'Duplicate Account',
  'pending',
  1,
  '25000000-0000-4000-8000-000000000001'
)
returning account_name, client_id, account_id;

-- Expected: match = true.
select exists (
  select 1
  from disputes
  join clients on clients.id = disputes.client_id
  where disputes.account_name = 'RLS-DISP-A-INSERTED'
    and disputes.account_id = clients.account_id
) as inserted_dispute_client_account_matches;

-- Expected: this Account A-scoped status update does not update Account B's dispute.
update disputes
set status = 'sent'
where id = (
  select id
  from disputes
  where account_name = 'RLS-DISP-B-OWNED'
  limit 1
)
and account_id = '25000000-0000-4000-8000-000000000001';

-- Expected: status = pending.
select status
from disputes
where account_name = 'RLS-DISP-B-OWNED'
  and account_id = '25000000-0000-4000-8000-000000000002';

-- Expected: Account A-scoped status update changes Account A's inserted dispute.
update disputes
set status = 'sent'
where account_name = 'RLS-DISP-A-INSERTED'
  and account_id = '25000000-0000-4000-8000-000000000001'
returning account_name, status, account_id;

-- Expected: Account A-scoped detail update changes only Account A's inserted dispute.
update disputes
set round = 2,
    bureau_response = 'Readiness response received',
    response_outcome = 'Updated',
    response_date = current_date
where account_name = 'RLS-DISP-A-INSERTED'
  and account_id = '25000000-0000-4000-8000-000000000001'
returning account_name, round, response_outcome, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's dispute.
delete from disputes
where id = (
  select id
  from disputes
  where account_name = 'RLS-DISP-B-OWNED'
  limit 1
)
and account_id = '25000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from disputes
  where account_name = 'RLS-DISP-B-OWNED'
    and account_id = '25000000-0000-4000-8000-000000000002'
) as account_b_dispute_survived_account_a_scoped_delete;

-- Expected: Account A-scoped delete removes Account A's inserted dispute.
delete from disputes
where account_name = 'RLS-DISP-A-INSERTED'
  and account_id = '25000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from disputes
  where account_name = 'RLS-DISP-A-INSERTED'
    and account_id = '25000000-0000-4000-8000-000000000001'
) as account_a_inserted_dispute_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables disputes RLS and adds read,
-- insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '15000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A disputes.
--   select account_name, account_id
--   from disputes
--   where account_name like 'RLS-DISP-%'
--   order by account_name;
--
--   -- Expected after RLS: insert into Account A with an Account A client succeeds.
--   insert into disputes (
--     client_id,
--     account_name,
--     account_number,
--     account_type,
--     bureau,
--     reason,
--     status,
--     account_id
--   )
--   values (
--     (select id from clients where email = 'rls-readiness-dispute-client-a@example.test'),
--     'RLS-DISP-A-POST-RLS-INSERT',
--     'A-3001',
--     'Credit Card',
--     'equifax',
--     'Incorrect Late Payment',
--     'pending',
--     '25000000-0000-4000-8000-000000000001'
--   )
--   returning account_name, client_id, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the account membership WITH CHECK policy.
--   insert into disputes (
--     client_id,
--     account_name,
--     account_number,
--     account_type,
--     bureau,
--     reason,
--     status,
--     account_id
--   )
--   values (
--     (select id from clients where email = 'rls-readiness-dispute-client-b@example.test'),
--     'RLS-DISP-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
--     'B-3001',
--     'Credit Card',
--     'experian',
--     'Incorrect Balance',
--     'pending',
--     '25000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: insert into Account A with an Account B client fails.
--   insert into disputes (
--     client_id,
--     account_name,
--     account_number,
--     account_type,
--     bureau,
--     reason,
--     status,
--     account_id
--   )
--   values (
--     (select id from clients where email = 'rls-readiness-dispute-client-b@example.test'),
--     'RLS-DISP-CROSS-CLIENT-INSERT-SHOULD-FAIL',
--     'B-4001',
--     'Credit Card',
--     'transunion',
--     'Duplicate Account',
--     'pending',
--     '25000000-0000-4000-8000-000000000001'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's dispute.
--   update disputes
--   set status = 'sent'
--   where account_name = 'RLS-DISP-B-OWNED';
--
--   select status
--   from disputes
--   where account_name = 'RLS-DISP-B-OWNED';
--
--   -- Expected after RLS: Account A cannot move an Account A dispute to an
--   -- Account B client.
--   update disputes
--   set client_id = (
--     select id from clients where email = 'rls-readiness-dispute-client-b@example.test'
--   )
--   where account_name = 'RLS-DISP-A-OWNED';
--
--   -- Expected after RLS: Account A cannot delete Account B's dispute.
--   delete from disputes
--   where account_name = 'RLS-DISP-B-OWNED';
--
--   select exists (
--     select 1
--     from disputes
--     where account_name = 'RLS-DISP-B-OWNED'
--       and account_id = '25000000-0000-4000-8000-000000000002'
--   ) as account_b_dispute_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from disputes
where account_name like 'RLS-DISP-%';

delete from clients
where email like 'rls-readiness-dispute-client-%@example.test';

delete from account_memberships
where user_id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
)
or account_id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
);
