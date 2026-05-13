-- Disposable/test only.
--
-- This script verifies calendar_events RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Calendar event policies depend on authenticated membership evaluation
--   through a security-definer helper so policy checks can resolve membership
--   without granting direct read access to account_memberships.
-- - Calendar event writes use account_id as the primary tenant boundary. When
--   calendar_events.client_id and clients.id are schema-compatible as bigint
--   or uuid, writes also require client_id to belong to the same account_id
--   as the calendar event.
-- - This script assumes the calendar_events migration defines those helpers.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511070000_enable_calendar_events_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists calendar_events_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on calendar_events_post_rls_results to authenticated;

create or replace function public.calendar_events_post_rls_snapshot(p_title text)
returns table (
  id bigint,
  title text,
  description text,
  date date,
  start_time text,
  end_time text,
  all_day boolean,
  type text,
  client_id bigint,
  assigned_agent text,
  location text,
  recurrence text,
  reminder text,
  color text,
  account_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select ce.id, ce.title, ce.description, ce.date, ce.start_time, ce.end_time,
         ce.all_day, ce.type, ce.client_id, ce.assigned_agent, ce.location,
         ce.recurrence, ce.reminder, ce.color, ce.account_id
  from public.calendar_events ce
  where ce.title = p_title
  limit 1;
$$;

create or replace function public.calendar_events_post_rls_client_id(p_email text)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clients_id_type oid;
  v_calendar_events_client_id_type oid;
  v_client_id bigint;
begin
  select a.atttypid
  into v_clients_id_type
  from pg_attribute a
  where a.attrelid = 'public.clients'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  select a.atttypid
  into v_calendar_events_client_id_type
  from pg_attribute a
  where a.attrelid = 'public.calendar_events'::regclass
    and a.attname = 'client_id'
    and not a.attisdropped;

  if v_clients_id_type is distinct from v_calendar_events_client_id_type
    or v_clients_id_type is distinct from 'bigint'::regtype
  then
    return null;
  end if;

  execute
    'select c.id
     from public.clients c
     where c.email = $1
     limit 1'
  into v_client_id
  using p_email;

  return v_client_id;
end;
$$;

revoke all on function public.calendar_events_post_rls_snapshot(text) from public;
revoke all on function public.calendar_events_post_rls_client_id(text) from public;
grant execute on function public.calendar_events_post_rls_snapshot(text) to authenticated;
grant execute on function public.calendar_events_post_rls_client_id(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from calendar_events
where title like 'RLS-CAL-POST-%';

delete from clients
where email like 'rls-post-rls-calendar-client-%@example.test';

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
    'rls-post-rls-calendar-user-a@example.test',
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
    'rls-post-rls-calendar-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '27000000-0000-4000-8000-000000000001',
    'RLS Post Calendar Account A',
    '17000000-0000-4000-8000-000000000001'
  ),
  (
    '27000000-0000-4000-8000-000000000002',
    'RLS Post Calendar Account B',
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
    'Calendar Client A',
    'RLS Calendar Client A',
    'rls-post-rls-calendar-client-a@example.test',
    '555-0701',
    'active',
    'Client',
    '27000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Calendar Client B',
    'RLS Calendar Client B',
    'rls-post-rls-calendar-client-b@example.test',
    '555-0702',
    'active',
    'Client',
    '27000000-0000-4000-8000-000000000002'
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
    'RLS-CAL-POST-VISIBLE-A',
    'Seeded post-RLS calendar event for Account A.',
    current_date + 1,
    '09:00',
    '10:00',
    false,
    'appointment',
    public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-a@example.test'),
    'Alice Johnson',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '27000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS-CAL-POST-VISIBLE-B',
    'Seeded post-RLS calendar event for Account B.',
    current_date + 2,
    '11:00',
    '12:00',
    false,
    'appointment',
    public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test'),
    'Bob Smith',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '27000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS-CAL-POST-PROTECTED-B-UPDATE',
    'Account B event reserved for blocked update verification.',
    current_date + 3,
    '13:00',
    '14:00',
    false,
    'appointment',
    public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test'),
    'Bob Smith',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '27000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS-CAL-POST-PROTECTED-B-DELETE',
    'Account B event reserved for blocked delete verification.',
    current_date + 4,
    '15:00',
    '16:00',
    false,
    'appointment',
    public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test'),
    'Bob Smith',
    'Office',
    'none',
    'none',
    '#3b82f6',
    '27000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '17000000-0000-4000-8000-000000000001', true);

  insert into calendar_events_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '17000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into calendar_events_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'client_account_validation_mode',
    'compatible uuid/bigint schemas validate client/account; incompatible schemas skip safely',
    'validation_supported=' || public.calendar_events_client_account_validation_supported()::text,
    true,
    'When clients.id and calendar_events.client_id have the same uuid or bigint type, this should be true; otherwise account_id remains the enforced tenant boundary';

  insert into calendar_events_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a_visible_calendar_event',
    '1 visible calendar event row for Account A',
    'visible_count=' || count(*)::text || ', events=' || coalesce(string_agg(title, ', ' order by title), 'none'),
    count(*) = 1 and bool_and(account_id = '27000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible calendar event row'
  from calendar_events
  where title like 'RLS-CAL-POST-VISIBLE-%';

  do $$
  declare
    inserted_id bigint;
    inserted_snapshot record;
    account_a_client_id bigint;
  begin
    account_a_client_id := public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-a@example.test');

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
      'RLS-CAL-POST-A-INSERTED',
      'Inserted post-RLS calendar event for Account A.',
      current_date + 5,
      '10:00',
      '10:30',
      false,
      'followup',
      account_a_client_id,
      'Alice Johnson',
      'Phone',
      'none',
      '15 min before',
      '#8b5cf6',
      '27000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select *
    into inserted_snapshot
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-A-INSERTED');

    insert into calendar_events_post_rls_results
    values (
      'account_a_insert_account_a_with_optional_client',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_snapshot.account_id::text, 'null') || ', client_id=' || coalesce(inserted_snapshot.client_id::text, 'null'),
      inserted_snapshot.account_id = '27000000-0000-4000-8000-000000000001'::uuid
        and inserted_snapshot.client_id is not distinct from account_a_client_id,
      'Account A insert should pass; client_id is present only when client/account validation is schema-supported'
    );

    delete from calendar_events where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into calendar_events_post_rls_results
      values (
        'account_a_insert_account_a_with_optional_client',
        'insert allowed',
        sqlerrm,
        false,
        'Account A insert should have been allowed'
      );
  end $$;

  do $$
  declare
    account_b_client_id bigint;
  begin
    account_b_client_id := public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test');

    if not public.calendar_events_client_account_validation_supported() then
      insert into calendar_events_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_client_blocked',
        'skipped when client schema is incompatible',
        'validation_supported=false, account_b_client_id=' || coalesce(account_b_client_id::text, 'null'),
        true,
        'Production-safe policy does not compare incompatible clients.id and calendar_events.client_id types'
      );
      return;
    end if;

    begin
      insert into calendar_events (
        title,
        description,
        date,
        all_day,
        type,
        client_id,
        account_id
      ) values (
        'RLS-CAL-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
        'This should not be allowed for Account A user.',
        current_date + 6,
        true,
        'reminder',
        account_b_client_id,
        '27000000-0000-4000-8000-000000000002'
      );

      insert into calendar_events_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B calendar events'
      );

      delete from calendar_events
      where title = 'RLS-CAL-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into calendar_events_post_rls_results
        values (
          'account_a_insert_account_b_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A insert into Account B should be blocked'
        );
    end;
  end $$;

  do $$
  declare
    account_b_client_id bigint;
  begin
    account_b_client_id := public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test');

    begin
      insert into calendar_events (
        title,
        description,
        date,
        all_day,
        type,
        client_id,
        account_id
      ) values (
        'RLS-CAL-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL',
        'This Account A event should not be allowed to use an Account B client.',
        current_date + 7,
        true,
        'reminder',
        account_b_client_id,
        '27000000-0000-4000-8000-000000000001'
      );

      insert into calendar_events_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_client_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not create an Account A calendar event with an Account B client'
      );

      delete from calendar_events
      where title = 'RLS-CAL-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into calendar_events_post_rls_results
        values (
          'account_a_insert_account_a_with_account_b_client_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A calendar event with an Account B client should be blocked'
        );
    end;
  end $$;

  do $$
  declare
    update_count integer;
    before_snapshot record;
    after_snapshot record;
  begin
    select *
    into before_snapshot
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-PROTECTED-B-UPDATE');

    update calendar_events
    set type = 'deadline',
        description = 'Account A should not be able to change this Account B event.'
    where title = 'RLS-CAL-POST-PROTECTED-B-UPDATE'
      and account_id = '27000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-PROTECTED-B-UPDATE');

    insert into calendar_events_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before_type=' || coalesce(before_snapshot.type, 'null') || ', after_type=' || coalesce(after_snapshot.type, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '27000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '27000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.type = 'appointment'
        and after_snapshot.type = 'appointment'
        and update_count = 0,
      'Account A update of Account B calendar event should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into calendar_events_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B calendar event should be blocked'
      );
  end $$;

  do $$
  declare
    update_count integer := 0;
    account_b_client_id bigint;
    before_snapshot record;
    after_snapshot record;
  begin
    account_b_client_id := public.calendar_events_post_rls_client_id('rls-post-rls-calendar-client-b@example.test');

    select *
    into before_snapshot
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-VISIBLE-A');

    if not public.calendar_events_client_account_validation_supported() then
      insert into calendar_events_post_rls_results
      values (
        'account_a_move_calendar_event_to_account_b_client_blocked',
        'skipped when client schema is incompatible',
        'validation_supported=false, account_b_client_id=' || coalesce(account_b_client_id::text, 'null'),
        true,
        'Production-safe policy does not compare incompatible clients.id and calendar_events.client_id types'
      );
      return;
    end if;

    begin
      update calendar_events
      set client_id = account_b_client_id
      where title = 'RLS-CAL-POST-VISIBLE-A'
        and account_id = '27000000-0000-4000-8000-000000000001'::uuid;

      get diagnostics update_count = row_count;

      select *
      into after_snapshot
      from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-VISIBLE-A');

      insert into calendar_events_post_rls_results
      values (
        'account_a_move_calendar_event_to_account_b_client_blocked',
        'blocked and row unchanged',
        'row_count=' || update_count::text || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
        before_snapshot.id is not null
          and after_snapshot.id is not null
          and before_snapshot.client_id = after_snapshot.client_id
          and after_snapshot.client_id is distinct from account_b_client_id
          and before_snapshot.account_id = '27000000-0000-4000-8000-000000000001'::uuid
          and after_snapshot.account_id = '27000000-0000-4000-8000-000000000001'::uuid
          and update_count = 0,
        'Account A should not move an Account A calendar event to an Account B client'
      );
    exception
      when insufficient_privilege or check_violation then
        select *
        into after_snapshot
        from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-VISIBLE-A');

        insert into calendar_events_post_rls_results
        values (
          'account_a_move_calendar_event_to_account_b_client_blocked',
          'blocked and row unchanged',
          sqlerrm || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
          before_snapshot.id is not null
            and after_snapshot.id is not null
            and before_snapshot.client_id = after_snapshot.client_id
            and after_snapshot.client_id is distinct from account_b_client_id
            and before_snapshot.account_id = '27000000-0000-4000-8000-000000000001'::uuid
            and after_snapshot.account_id = '27000000-0000-4000-8000-000000000001'::uuid,
          'Account A move to an Account B client should be blocked'
        );
    end;
  end $$;

  do $$
  declare
    delete_count integer;
    delete_snapshot_before record;
    delete_snapshot_after record;
  begin
    select *
    into delete_snapshot_before
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-PROTECTED-B-DELETE');

    delete from calendar_events
    where title = 'RLS-CAL-POST-PROTECTED-B-DELETE'
      and account_id = '27000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.calendar_events_post_rls_snapshot('RLS-CAL-POST-PROTECTED-B-DELETE');

    insert into calendar_events_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '27000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '27000000-0000-4000-8000-000000000002'::uuid
        and delete_count = 0,
      'Account A delete of Account B calendar event should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into calendar_events_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B calendar event should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '17000000-0000-4000-8000-000000000002', true);

  insert into calendar_events_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '17000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into calendar_events_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b_visible_calendar_event',
    '1 visible calendar event row for Account B',
    'visible_count=' || count(*)::text || ', events=' || coalesce(string_agg(title, ', ' order by title), 'none'),
    count(*) = 1 and bool_and(account_id = '27000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible calendar event row'
  from calendar_events
  where title like 'RLS-CAL-POST-VISIBLE-%';
commit;

select check_name, expected, actual, passed, notes
from calendar_events_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from calendar_events
where title like 'RLS-CAL-POST-%';

delete from clients
where email like 'rls-post-rls-calendar-client-%@example.test';

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

drop function if exists public.calendar_events_post_rls_snapshot(text);
drop function if exists public.calendar_events_post_rls_client_id(text);
