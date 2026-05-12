-- Disposable/test only.
--
-- This script verifies disputes RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Disputes policies depend on authenticated membership evaluation through a
--   security-definer helper so policy checks can resolve membership without
--   granting direct read access to account_memberships.
-- - Dispute writes also require any client_id to belong to the same account_id
--   as the dispute.
-- - This script assumes the disputes migration defines those helpers.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511060000_enable_disputes_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists disputes_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on disputes_post_rls_results to authenticated;

create or replace function public.disputes_post_rls_snapshot(p_account_name text)
returns table (
  id bigint,
  client_id bigint,
  account_name text,
  account_number text,
  account_type text,
  bureau text,
  reason text,
  status text,
  round integer,
  bureau_response text,
  response_outcome text,
  response_date date,
  account_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, d.client_id, d.account_name, d.account_number, d.account_type,
         d.bureau, d.reason, d.status, d.round, d.bureau_response,
         d.response_outcome, d.response_date, d.account_id
  from public.disputes d
  where d.account_name = p_account_name
  limit 1;
$$;

create or replace function public.disputes_post_rls_client_id(p_email text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.clients c
  where c.email = p_email
  limit 1;
$$;

revoke all on function public.disputes_post_rls_snapshot(text) from public;
revoke all on function public.disputes_post_rls_client_id(text) from public;
grant execute on function public.disputes_post_rls_snapshot(text) to authenticated;
grant execute on function public.disputes_post_rls_client_id(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from disputes
where account_name like 'RLS-DISP-POST-%';

delete from clients
where email like 'rls-post-rls-dispute-client-%@example.test';

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
    'rls-readiness-dispute-user-a@example.test',
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
    'rls-readiness-dispute-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '26000000-0000-4000-8000-000000000001',
    'RLS Readiness Disputes Account A',
    '16000000-0000-4000-8000-000000000001'
  ),
  (
    '26000000-0000-4000-8000-000000000002',
    'RLS Readiness Disputes Account B',
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
    'rls-post-rls-dispute-client-a@example.test',
    '555-0501',
    'active',
    'Client',
    '26000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Dispute Client B',
    'RLS Dispute Client B',
    'rls-post-rls-dispute-client-b@example.test',
    '555-0502',
    'active',
    'Client',
    '26000000-0000-4000-8000-000000000002'
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
    (select id from clients where email = 'rls-post-rls-dispute-client-a@example.test'),
    'RLS-DISP-POST-VISIBLE-A',
    'A-1001',
    'Credit Card',
    'equifax',
    'Not My Account',
    'pending',
    1,
    '26000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-client-b@example.test'),
    'RLS-DISP-POST-VISIBLE-B',
    'B-1001',
    'Credit Card',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '26000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-client-b@example.test'),
    'RLS-DISP-POST-PROTECTED-B-UPDATE',
    'B-2001',
    'Collection Account',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '26000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-client-b@example.test'),
    'RLS-DISP-POST-PROTECTED-B-DELETE',
    'B-3001',
    'Collection Account',
    'transunion',
    'Duplicate Account',
    'pending',
    1,
    '26000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000001', true);

  insert into disputes_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '16000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into disputes_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a_visible_dispute',
    '1 visible dispute row for Account A',
    'visible_count=' || count(*)::text || ', disputes=' || coalesce(string_agg(account_name, ', ' order by account_name), 'none'),
    count(*) = 1 and bool_and(account_id = '26000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible dispute row'
  from disputes
  where account_name like 'RLS-DISP-POST-VISIBLE-%';

  do $$
  declare
    inserted_id bigint;
    inserted_snapshot record;
    account_a_client_id bigint;
  begin
    account_a_client_id := public.disputes_post_rls_client_id('rls-post-rls-dispute-client-a@example.test');

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
      account_a_client_id,
      'RLS-DISP-POST-A-INSERTED',
      'A-4001',
      'Credit Card',
      'equifax',
      'Incorrect Late Payment',
      'pending',
      1,
      '26000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select *
    into inserted_snapshot
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-A-INSERTED');

    insert into disputes_post_rls_results
    values (
      'account_a_insert_account_a_with_account_a_client',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_snapshot.account_id::text, 'null') || ', client_id=' || coalesce(inserted_snapshot.client_id::text, 'null'),
      inserted_snapshot.account_id = '26000000-0000-4000-8000-000000000001'::uuid
        and inserted_snapshot.client_id = account_a_client_id,
      'Account A insert with an Account A client should pass'
    );

    delete from disputes where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into disputes_post_rls_results
      values (
        'account_a_insert_account_a_with_account_a_client',
        'insert allowed',
        sqlerrm,
        false,
        'Account A insert with an Account A client should have been allowed'
      );
  end $$;

  do $$
  declare
    account_b_client_id bigint;
  begin
    account_b_client_id := public.disputes_post_rls_client_id('rls-post-rls-dispute-client-b@example.test');

    begin
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
        account_b_client_id,
        'RLS-DISP-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
        'B-4001',
        'Credit Card',
        'experian',
        'Incorrect Balance',
        'pending',
        1,
        '26000000-0000-4000-8000-000000000002'
      );

      insert into disputes_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B disputes'
      );

      delete from disputes
      where account_name = 'RLS-DISP-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into disputes_post_rls_results
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
    account_b_client_id := public.disputes_post_rls_client_id('rls-post-rls-dispute-client-b@example.test');

    begin
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
        account_b_client_id,
        'RLS-DISP-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL',
        'A-5001',
        'Credit Card',
        'transunion',
        'Duplicate Account',
        'pending',
        1,
        '26000000-0000-4000-8000-000000000001'
      );

      insert into disputes_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_client_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not create an Account A dispute with an Account B client'
      );

      delete from disputes
      where account_name = 'RLS-DISP-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into disputes_post_rls_results
        values (
          'account_a_insert_account_a_with_account_b_client_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A dispute with an Account B client should be blocked'
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
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-PROTECTED-B-UPDATE');

    update disputes
    set status = 'sent'
    where account_name = 'RLS-DISP-POST-PROTECTED-B-UPDATE'
      and account_id = '26000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-PROTECTED-B-UPDATE');

    insert into disputes_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before_status=' || coalesce(before_snapshot.status, 'null') || ', after_status=' || coalesce(after_snapshot.status, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '26000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '26000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.status = 'pending'
        and after_snapshot.status = 'pending'
        and update_count = 0,
      'Account A update of Account B dispute should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into disputes_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B dispute should be blocked'
      );
  end $$;

  do $$
  declare
    update_count integer := 0;
    account_b_client_id bigint;
    before_snapshot record;
    after_snapshot record;
  begin
    account_b_client_id := public.disputes_post_rls_client_id('rls-post-rls-dispute-client-b@example.test');

    select *
    into before_snapshot
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-VISIBLE-A');

    begin
      update disputes
      set client_id = account_b_client_id
      where account_name = 'RLS-DISP-POST-VISIBLE-A'
        and account_id = '26000000-0000-4000-8000-000000000001'::uuid;

      get diagnostics update_count = row_count;

      select *
      into after_snapshot
      from public.disputes_post_rls_snapshot('RLS-DISP-POST-VISIBLE-A');

      insert into disputes_post_rls_results
      values (
        'account_a_move_dispute_to_account_b_client_blocked',
        'blocked and row unchanged',
        'row_count=' || update_count::text || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
        before_snapshot.id is not null
          and after_snapshot.id is not null
          and before_snapshot.client_id = after_snapshot.client_id
          and after_snapshot.client_id is distinct from account_b_client_id
          and before_snapshot.account_id = '26000000-0000-4000-8000-000000000001'::uuid
          and after_snapshot.account_id = '26000000-0000-4000-8000-000000000001'::uuid
          and update_count = 0,
        'Account A should not move an Account A dispute to an Account B client'
      );
    exception
      when insufficient_privilege or check_violation then
        select *
        into after_snapshot
        from public.disputes_post_rls_snapshot('RLS-DISP-POST-VISIBLE-A');

        insert into disputes_post_rls_results
        values (
          'account_a_move_dispute_to_account_b_client_blocked',
          'blocked and row unchanged',
          sqlerrm || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
          before_snapshot.id is not null
            and after_snapshot.id is not null
            and before_snapshot.client_id = after_snapshot.client_id
            and after_snapshot.client_id is distinct from account_b_client_id
            and before_snapshot.account_id = '26000000-0000-4000-8000-000000000001'::uuid
            and after_snapshot.account_id = '26000000-0000-4000-8000-000000000001'::uuid,
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
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-PROTECTED-B-DELETE');

    delete from disputes
    where account_name = 'RLS-DISP-POST-PROTECTED-B-DELETE'
      and account_id = '26000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.disputes_post_rls_snapshot('RLS-DISP-POST-PROTECTED-B-DELETE');

    insert into disputes_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '26000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '26000000-0000-4000-8000-000000000002'::uuid
        and delete_count = 0,
      'Account A delete of Account B dispute should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into disputes_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B dispute should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000002', true);

  insert into disputes_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '16000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into disputes_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b_visible_dispute',
    '1 visible dispute row for Account B',
    'visible_count=' || count(*)::text || ', disputes=' || coalesce(string_agg(account_name, ', ' order by account_name), 'none'),
    count(*) = 1 and bool_and(account_id = '26000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible dispute row'
  from disputes
  where account_name like 'RLS-DISP-POST-VISIBLE-%';
commit;

select check_name, expected, actual, passed, notes
from disputes_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from disputes
where account_name like 'RLS-DISP-POST-%';

delete from clients
where email like 'rls-post-rls-dispute-client-%@example.test';

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

drop function if exists public.disputes_post_rls_snapshot(text);
drop function if exists public.disputes_post_rls_client_id(text);
