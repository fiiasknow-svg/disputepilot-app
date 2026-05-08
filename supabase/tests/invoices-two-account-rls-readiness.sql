-- Phase 3 invoices two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, account-owned
--   clients, and account-owned invoices in a disposable Supabase database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include client_id plus account_id,
--   and writes use both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make invoices.account_id NOT NULL.
-- - This script does not change ownership for payments, services, disputes,
--   calendar_events, letters, or portal invoice access.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from invoices
where invoice_number like 'RLS-INV-%';

delete from clients
where email like 'rls-readiness-invoice-client-%@example.test';

delete from account_memberships
where user_id in (
  '14000000-0000-4000-8000-000000000001',
  '14000000-0000-4000-8000-000000000002'
)
or account_id in (
  '24000000-0000-4000-8000-000000000001',
  '24000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '24000000-0000-4000-8000-000000000001',
  '24000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '14000000-0000-4000-8000-000000000001',
  '14000000-0000-4000-8000-000000000002'
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
    '14000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-invoice-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '14000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-invoice-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '24000000-0000-4000-8000-000000000001',
    'RLS Readiness Invoices Account A',
    '14000000-0000-4000-8000-000000000001'
  ),
  (
    '24000000-0000-4000-8000-000000000002',
    'RLS Readiness Invoices Account B',
    '14000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '24000000-0000-4000-8000-000000000001',
    '14000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '24000000-0000-4000-8000-000000000002',
    '14000000-0000-4000-8000-000000000002',
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
    'Invoice Client A',
    'RLS Invoice Client A',
    'rls-readiness-invoice-client-a@example.test',
    '555-0401',
    'active',
    'Client',
    '24000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Invoice Client B',
    'RLS Invoice Client B',
    'rls-readiness-invoice-client-b@example.test',
    '555-0402',
    'active',
    'Client',
    '24000000-0000-4000-8000-000000000002'
  );

insert into invoices (
  invoice_number,
  client_id,
  amount,
  status,
  due_date,
  account_id
) values
  (
    'RLS-INV-A-OWNED',
    (select id from clients where email = 'rls-readiness-invoice-client-a@example.test'),
    149,
    'pending',
    current_date + interval '7 days',
    '24000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS-INV-B-OWNED',
    (select id from clients where email = 'rls-readiness-invoice-client-b@example.test'),
    249,
    'pending',
    current_date + interval '10 days',
    '24000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only RLS-INV-A-OWNED.
select invoice_number, account_id
from invoices
where account_id = '24000000-0000-4000-8000-000000000001'
  and invoice_number like 'RLS-INV-%'
order by invoice_number;

-- Expected: one row, only RLS-INV-B-OWNED.
select invoice_number, account_id
from invoices
where account_id = '24000000-0000-4000-8000-000000000002'
  and invoice_number like 'RLS-INV-%'
order by invoice_number;

-- Expected: no rows. All readiness invoices must match their client account.
select invoices.invoice_number, invoices.account_id as invoice_account_id, clients.account_id as client_account_id
from invoices
join clients on clients.id = invoices.client_id
where invoices.invoice_number like 'RLS-INV-%'
  and invoices.account_id is distinct from clients.account_id;

-- Expected: insert succeeds with both client_id and Account A ownership.
insert into invoices (
  invoice_number,
  client_id,
  amount,
  status,
  due_date,
  account_id
) values (
  'RLS-INV-A-INSERTED',
  (select id from clients where email = 'rls-readiness-invoice-client-a@example.test'),
  199,
  'pending',
  current_date + interval '14 days',
  '24000000-0000-4000-8000-000000000001'
)
returning invoice_number, client_id, account_id;

-- Expected: match = true.
select exists (
  select 1
  from invoices
  join clients on clients.id = invoices.client_id
  where invoices.invoice_number = 'RLS-INV-A-INSERTED'
    and invoices.account_id = clients.account_id
) as inserted_invoice_client_account_matches;

-- Expected: this Account A-scoped update does not update Account B's invoice.
update invoices
set status = 'paid'
where id = (
  select id
  from invoices
  where invoice_number = 'RLS-INV-B-OWNED'
  limit 1
)
and account_id = '24000000-0000-4000-8000-000000000001';

-- Expected: status = pending.
select status
from invoices
where invoice_number = 'RLS-INV-B-OWNED'
  and account_id = '24000000-0000-4000-8000-000000000002';

-- Expected: Account A-scoped update changes Account A's inserted invoice.
update invoices
set status = 'paid'
where invoice_number = 'RLS-INV-A-INSERTED'
  and account_id = '24000000-0000-4000-8000-000000000001'
returning invoice_number, status, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's invoice.
delete from invoices
where id = (
  select id
  from invoices
  where invoice_number = 'RLS-INV-B-OWNED'
  limit 1
)
and account_id = '24000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from invoices
  where invoice_number = 'RLS-INV-B-OWNED'
    and account_id = '24000000-0000-4000-8000-000000000002'
) as account_b_invoice_survived_account_a_scoped_delete;

-- Expected: Account A-scoped delete removes Account A's inserted invoice.
delete from invoices
where invoice_number = 'RLS-INV-A-INSERTED'
  and account_id = '24000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from invoices
  where invoice_number = 'RLS-INV-A-INSERTED'
    and account_id = '24000000-0000-4000-8000-000000000001'
) as account_a_inserted_invoice_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables invoices RLS and adds read,
-- insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '14000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A invoices.
--   select invoice_number, account_id
--   from invoices
--   where invoice_number like 'RLS-INV-%'
--   order by invoice_number;
--
--   -- Expected after RLS: insert into Account A with an Account A client succeeds.
--   insert into invoices (
--     invoice_number,
--     client_id,
--     amount,
--     status,
--     due_date,
--     account_id
--   )
--   values (
--     'RLS-INV-A-POST-RLS-INSERT',
--     (select id from clients where email = 'rls-readiness-invoice-client-a@example.test'),
--     299,
--     'pending',
--     current_date + interval '21 days',
--     '24000000-0000-4000-8000-000000000001'
--   )
--   returning invoice_number, client_id, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the account membership WITH CHECK policy.
--   insert into invoices (
--     invoice_number,
--     client_id,
--     amount,
--     status,
--     account_id
--   )
--   values (
--     'RLS-INV-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
--     (select id from clients where email = 'rls-readiness-invoice-client-b@example.test'),
--     399,
--     'pending',
--     '24000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: insert into Account A with an Account B client fails.
--   insert into invoices (
--     invoice_number,
--     client_id,
--     amount,
--     status,
--     account_id
--   )
--   values (
--     'RLS-INV-CROSS-CLIENT-INSERT-SHOULD-FAIL',
--     (select id from clients where email = 'rls-readiness-invoice-client-b@example.test'),
--     499,
--     'pending',
--     '24000000-0000-4000-8000-000000000001'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's invoice.
--   update invoices
--   set status = 'paid'
--   where invoice_number = 'RLS-INV-B-OWNED';
--
--   select status
--   from invoices
--   where invoice_number = 'RLS-INV-B-OWNED';
--
--   -- Expected after RLS: Account A cannot move an Account A invoice to an
--   -- Account B client.
--   update invoices
--   set client_id = (
--     select id from clients where email = 'rls-readiness-invoice-client-b@example.test'
--   )
--   where invoice_number = 'RLS-INV-A-OWNED';
--
--   -- Expected after RLS: Account A cannot delete Account B's invoice.
--   delete from invoices
--   where invoice_number = 'RLS-INV-B-OWNED';
--
--   select exists (
--     select 1
--     from invoices
--     where invoice_number = 'RLS-INV-B-OWNED'
--       and account_id = '24000000-0000-4000-8000-000000000002'
--   ) as account_b_invoice_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from invoices
where invoice_number like 'RLS-INV-%';

delete from clients
where email like 'rls-readiness-invoice-client-%@example.test';

delete from account_memberships
where user_id in (
  '14000000-0000-4000-8000-000000000001',
  '14000000-0000-4000-8000-000000000002'
)
or account_id in (
  '24000000-0000-4000-8000-000000000001',
  '24000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '24000000-0000-4000-8000-000000000001',
  '24000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '14000000-0000-4000-8000-000000000001',
  '14000000-0000-4000-8000-000000000002'
);
