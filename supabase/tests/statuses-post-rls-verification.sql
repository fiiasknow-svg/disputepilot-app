-- Disposable/test only.
--
-- This script verifies statuses RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511010000_enable_statuses_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists statuses_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

-- Clean any interrupted run from previous attempts.
delete from statuses
where name like 'rls-post-rls-%';

delete from account_memberships
where user_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
or account_id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
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
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'RLS Readiness Account A',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'RLS Readiness Account B',
    '10000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into statuses (name, color, type, account_id)
values
  (
    'rls-post-rls-a-visible',
    '#10b981',
    'client',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    'rls-post-rls-b-visible',
    '#ef4444',
    'client',
    '20000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

  insert into statuses_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '10000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into statuses_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a',
    '1 visible row for Account A',
    'visible_count=' || count(*)::text || ', names=' || coalesce(string_agg(name, ', ' order by name), 'none'),
    count(*) = 1 and bool_and(account_id = '20000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own row'
  from statuses
  where name like 'rls-post-rls-%';

  do $$
  declare inserted_id bigint;
  begin
    insert into statuses (name, color, type, account_id)
    values (
      'rls-post-rls-a-inserted',
      '#3b82f6',
      'client',
      '20000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    insert into statuses_post_rls_results
    values (
      'account_a_insert_account_a',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text,
      true,
      'Account A insert should pass'
    );

    delete from statuses where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into statuses_post_rls_results
      values (
        'account_a_insert_account_a',
        'insert allowed',
        sqlerrm,
        false,
      'Account A insert should have been allowed'
      );
  end $$;

  do $$
  begin
    begin
      insert into statuses (name, color, type, account_id)
      values (
        'rls-post-rls-cross-account-insert-should-fail',
        '#f59e0b',
        'client',
        '20000000-0000-4000-8000-000000000002'
      );

      insert into statuses_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B rows'
      );

      delete from statuses
      where name = 'rls-post-rls-cross-account-insert-should-fail'
        and account_id = '20000000-0000-4000-8000-000000000002'::uuid;
    exception
      when insufficient_privilege or check_violation then
        insert into statuses_post_rls_results
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
  begin
    begin
      update statuses
      set color = '#000000'
      where name = 'rls-post-rls-b-visible'
        and account_id = '20000000-0000-4000-8000-000000000002'::uuid;

      insert into statuses_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked',
        'update unexpectedly succeeded',
        false,
        'Account A should not update Account B rows'
      );
    exception
      when insufficient_privilege or check_violation then
        insert into statuses_post_rls_results
        values (
          'account_a_update_account_b_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A update of Account B should be blocked'
        );
    end;
  end $$;

  do $$
  begin
    begin
      delete from statuses
      where name = 'rls-post-rls-b-visible'
        and account_id = '20000000-0000-4000-8000-000000000002'::uuid;

      insert into statuses_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked',
        'delete unexpectedly succeeded',
        false,
        'Account A should not delete Account B rows'
      );
    exception
      when insufficient_privilege or check_violation then
        insert into statuses_post_rls_results
        values (
          'account_a_delete_account_b_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A delete of Account B should be blocked'
        );
    end;
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);

  insert into statuses_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '10000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into statuses_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b',
    '1 visible row for Account B',
    'visible_count=' || count(*)::text || ', names=' || coalesce(string_agg(name, ', ' order by name), 'none'),
    count(*) = 1 and bool_and(account_id = '20000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own row'
  from statuses
  where name like 'rls-post-rls-%';
commit;

select check_name, expected, actual, passed, notes
from statuses_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from statuses
where name like 'rls-post-rls-%';

delete from account_memberships
where user_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
or account_id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);
