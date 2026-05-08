-- Phase 3 calendar_events two-account RLS readiness checklist.
--
-- Purpose:
-- - Seed two auth users, two accounts, two memberships, account-owned
--   clients, and account-owned calendar_events in a disposable Supabase
--   database.
-- - Verify the current pre-RLS application query shape:
--   reads filter by account_id, inserts include account_id, and writes use
--   both id and account_id.
-- - Preserve explicit expected checks for the future RLS migration.
--
-- Safety:
-- - Do not run against production without first reviewing the fixed test UUIDs.
-- - This script does not enable RLS.
-- - This script does not make calendar_events.account_id NOT NULL.
-- - This script does not change ownership for letters, documents,
--   dispute_letters, or portal calendar access.
-- - Cleanup SQL is included at the end.

-- Test identities.
-- User A owns Account A. User B owns Account B.
-- These UUIDs are intentionally fixed so cleanup is deterministic.
-- If any row already exists with these ids in a shared database, stop and use
-- a disposable database instead.

-- Cleanup any prior interrupted run.
delete from calendar_events
where title like 'RLS Calendar Event %';

delete from clients
where email like 'rls-readiness-calendar-client-%@example.test';

delete from account_memberships
where user_id in (
  '16000000-0000-4000-8000-000000000001',
  '16000000-0000-4000-8000-000000000002'
)
or account_id in (
  '26000000-0000-4000-8000-000000000001',
  '26000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '26000000-0000-4000-8000-000000000001',
  '26000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '16000000-0000-4000-8000-000000000001',
  '16000000-0000-4000-8000-000000000002'
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
    '16000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-calendar-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '16000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-calendar-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '26000000-0000-4000-8000-000000000001',
    'RLS Readiness Calendar Account A',
    '16000000-0000-4000-8000-000000000001'
  ),
  (
    '26000000-0000-4000-8000-000000000002',
    'RLS Readiness Calendar Account B',
    '16000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '26000000-0000-4000-8000-000000000001',
    '16000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '26000000-0000-4000-8000-000000000002',
    '16000000-0000-4000-8000-000000000002',
    'owner'
  );

-- Optional source rows for client-linked calendar event checks.
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
    'Calendar Client A',
    'RLS Calendar Client A',
    'rls-readiness-calendar-client-a@example.test',
    '555-0601',
    'active',
    'Client',
    '26000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Calendar Client B',
    'RLS Calendar Client B',
    'rls-readiness-calendar-client-b@example.test',
    '555-0602',
    'active',
    'Client',
    '26000000-0000-4000-8000-000000000002'
  );

insert into calendar_events (
  title,
  description,
  date,
  start_time,
  end_time,
  all_day,
  type,
  client_id,
  assigned_agent,
  location,
  recurrence,
  reminder,
  color,
  account_id
) values
  (
    'RLS Calendar Event A Owned',
    'Seeded readiness calendar event for Account A.',
    current_date + interval '1 day',
    '09:00',
    '10:00',
    false,
    'appointment',
    (select id from clients where email = 'rls-readiness-calendar-client-a@example.test'),
    'Alice Johnson',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '26000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS Calendar Event B Owned',
    'Seeded readiness calendar event for Account B.',
    current_date + interval '2 days',
    '11:00',
    '12:00',
    false,
    'appointment',
    (select id from clients where email = 'rls-readiness-calendar-client-b@example.test'),
    'Bob Smith',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '26000000-0000-4000-8000-000000000002'
  );

-- Current pre-RLS checks.
-- These validate the application's scoped query shapes while RLS is still off.

-- Expected: one row, only RLS Calendar Event A Owned.
select title, account_id
from calendar_events
where account_id = '26000000-0000-4000-8000-000000000001'
  and title like 'RLS Calendar Event %'
order by title;

-- Expected: one row, only RLS Calendar Event B Owned.
select title, account_id
from calendar_events
where account_id = '26000000-0000-4000-8000-000000000002'
  and title like 'RLS Calendar Event %'
order by title;

-- Expected: no rows. All readiness calendar events with a client_id must
-- match their client account.
select calendar_events.title, calendar_events.account_id as event_account_id, clients.account_id as client_account_id
from calendar_events
join clients on clients.id = calendar_events.client_id
where calendar_events.title like 'RLS Calendar Event %'
  and calendar_events.account_id is distinct from clients.account_id;

-- Expected: insert succeeds with Account A ownership.
insert into calendar_events (
  title,
  description,
  date,
  start_time,
  end_time,
  all_day,
  type,
  client_id,
  assigned_agent,
  location,
  recurrence,
  reminder,
  color,
  account_id
) values (
  'RLS Calendar Event A Inserted',
  'Inserted readiness calendar event for Account A.',
  current_date + interval '3 days',
  '13:00',
  '14:00',
  false,
  'followup',
  (select id from clients where email = 'rls-readiness-calendar-client-a@example.test'),
  'Alice Johnson',
  'Phone',
  'none',
  '15 min before',
  '#8b5cf6',
  '26000000-0000-4000-8000-000000000001'
)
returning title, client_id, account_id;

-- Expected: match = true.
select exists (
  select 1
  from calendar_events
  join clients on clients.id = calendar_events.client_id
  where calendar_events.title = 'RLS Calendar Event A Inserted'
    and calendar_events.account_id = clients.account_id
) as inserted_calendar_event_client_account_matches;

-- Expected: this Account A-scoped update does not update Account B's event.
update calendar_events
set title = 'RLS Calendar Event B Should Not Change'
where id = (
  select id
  from calendar_events
  where title = 'RLS Calendar Event B Owned'
  limit 1
)
and account_id = '26000000-0000-4000-8000-000000000001';

-- Expected: title remains RLS Calendar Event B Owned.
select title
from calendar_events
where title = 'RLS Calendar Event B Owned'
  and account_id = '26000000-0000-4000-8000-000000000002';

-- Expected: Account A-scoped update changes Account A's inserted event.
update calendar_events
set title = 'RLS Calendar Event A Updated',
    reminder = '1 hour before'
where title = 'RLS Calendar Event A Inserted'
  and account_id = '26000000-0000-4000-8000-000000000001'
returning title, reminder, account_id;

-- Expected: this Account A-scoped delete does not delete Account B's event.
delete from calendar_events
where id = (
  select id
  from calendar_events
  where title = 'RLS Calendar Event B Owned'
  limit 1
)
and account_id = '26000000-0000-4000-8000-000000000001';

-- Expected: exists = true.
select exists (
  select 1
  from calendar_events
  where title = 'RLS Calendar Event B Owned'
    and account_id = '26000000-0000-4000-8000-000000000002'
) as account_b_calendar_event_survived_account_a_scoped_delete;

-- Expected: Account A-scoped delete removes Account A's updated event.
delete from calendar_events
where title = 'RLS Calendar Event A Updated'
  and account_id = '26000000-0000-4000-8000-000000000001';

-- Expected: exists = false.
select exists (
  select 1
  from calendar_events
  where title = 'RLS Calendar Event A Updated'
    and account_id = '26000000-0000-4000-8000-000000000001'
) as account_a_inserted_calendar_event_survived_account_a_scoped_delete;

-- Future post-RLS checks.
-- Run these only after a later migration enables calendar_events RLS and adds
-- read, insert, update, and delete policies based on active account membership.
--
-- begin;
--   set local role authenticated;
--   select set_config(
--     'request.jwt.claim.sub',
--     '16000000-0000-4000-8000-000000000001',
--     true
--   );
--
--   -- Expected after RLS: Account A user sees only Account A calendar events.
--   select title, account_id
--   from calendar_events
--   where title like 'RLS Calendar Event %'
--   order by title;
--
--   -- Expected after RLS: insert into Account A succeeds.
--   insert into calendar_events (
--     title,
--     description,
--     date,
--     all_day,
--     type,
--     client_id,
--     account_id
--   )
--   values (
--     'RLS Calendar Event A Post RLS Insert',
--     'Post-RLS readiness calendar event for Account A.',
--     current_date + interval '4 days',
--     true,
--     'reminder',
--     (select id from clients where email = 'rls-readiness-calendar-client-a@example.test'),
--     '26000000-0000-4000-8000-000000000001'
--   )
--   returning title, client_id, account_id;
--
--   -- Expected after RLS: insert into Account B fails or returns no row due
--   -- to the account membership WITH CHECK policy.
--   insert into calendar_events (
--     title,
--     description,
--     date,
--     all_day,
--     type,
--     account_id
--   )
--   values (
--     'RLS Calendar Event Cross Account Insert Should Fail',
--     'This should not be allowed for Account A user.',
--     current_date + interval '5 days',
--     true,
--     'reminder',
--     '26000000-0000-4000-8000-000000000002'
--   );
--
--   -- Expected after RLS: Account A cannot update Account B's event.
--   update calendar_events
--   set title = 'RLS Calendar Event B RLS Update Should Fail'
--   where title = 'RLS Calendar Event B Owned';
--
--   select title
--   from calendar_events
--   where title = 'RLS Calendar Event B Owned';
--
--   -- Expected after RLS: Account A cannot delete Account B's event.
--   delete from calendar_events
--   where title = 'RLS Calendar Event B Owned';
--
--   select exists (
--     select 1
--     from calendar_events
--     where title = 'RLS Calendar Event B Owned'
--       and account_id = '26000000-0000-4000-8000-000000000002'
--   ) as account_b_calendar_event_survived_account_a_rls_delete;
-- rollback;

-- Cleanup / rollback for this readiness script.
delete from calendar_events
where title like 'RLS Calendar Event %';

delete from clients
where email like 'rls-readiness-calendar-client-%@example.test';

delete from account_memberships
where user_id in (
  '16000000-0000-4000-8000-000000000001',
  '16000000-0000-4000-8000-000000000002'
)
or account_id in (
  '26000000-0000-4000-8000-000000000001',
  '26000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '26000000-0000-4000-8000-000000000001',
  '26000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '16000000-0000-4000-8000-000000000001',
  '16000000-0000-4000-8000-000000000002'
);
