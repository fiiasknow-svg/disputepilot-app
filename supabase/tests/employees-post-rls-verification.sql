-- Disposable/test only.
--
-- This script verifies employees RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Employees policies depend on authenticated membership evaluation through
--   a security-definer helper so policy checks can resolve membership without
--   granting direct read access to account_memberships.
-- - This script assumes the employees migration defines that helper.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511020000_enable_employees_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists employees_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on employees_post_rls_results to authenticated;

create or replace function public.employees_post_rls_snapshot(p_email text)
returns table (
  id bigint,
  first_name text,
  last_name text,
  email text,
  role text,
  status text,
  title text,
  account_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select e.id, e.first_name, e.last_name, e.email, e.role, e.status, e.title, e.account_id
  from public.employees e
  where e.email = p_email
  limit 1;
$$;

revoke all on function public.employees_post_rls_snapshot(text) from public;
grant execute on function public.employees_post_rls_snapshot(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from employees
where email in (
  'rls-readiness-employee-a-owned@example.test',
  'rls-readiness-employee-b-owned@example.test',
  'rls-readiness-employee-a-inserted@example.test',
  'rls-readiness-employee-b-update-target@example.test',
  'rls-readiness-employee-b-delete-target@example.test',
  'rls-readiness-employee-cross-account-insert-should-fail@example.test'
)
or email like 'rls-readiness-employee-%@example.test';

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
  ),
  (
    'RLS',
    'Update Target',
    'rls-readiness-employee-b-update-target@example.test',
    '555-0103',
    'Manager',
    'active',
    'Operations',
    'Account B Update Target',
    'Protected readiness employee for Account B update checks.',
    '21000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS',
    'Delete Target',
    'rls-readiness-employee-b-delete-target@example.test',
    '555-0104',
    'Manager',
    'active',
    'Operations',
    'Account B Delete Target',
    'Protected readiness employee for Account B delete checks.',
    '21000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '11000000-0000-4000-8000-000000000001', true);

  insert into employees_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '11000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into employees_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a',
    '1 visible row for Account A',
    'visible_count=' || count(*)::text || ', emails=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '21000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible row'
  from employees
  where email = 'rls-readiness-employee-a-owned@example.test';

  do $$
  declare inserted_id bigint;
  declare inserted_account_id uuid;
  begin
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
      '555-0105',
      'Specialist',
      'active',
      'Operations',
      'Account A Specialist',
      'Inserted readiness employee for Account A.',
      '21000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select account_id
    into inserted_account_id
    from employees
    where id = inserted_id;

    insert into employees_post_rls_results
    values (
      'account_a_insert_account_a',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_account_id::text, 'null'),
      inserted_account_id = '21000000-0000-4000-8000-000000000001'::uuid,
      'Account A insert should pass'
    );

    delete from employees where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into employees_post_rls_results
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
        'Cross Account',
        'rls-readiness-employee-cross-account-insert-should-fail@example.test',
        '555-0106',
        'Specialist',
        'active',
        'Operations',
        'Should Not Insert',
        'This row should be blocked by employee RLS.',
        '21000000-0000-4000-8000-000000000002'
      );

      insert into employees_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B rows'
      );

      delete from employees
      where email = 'rls-readiness-employee-cross-account-insert-should-fail@example.test'
        and account_id = '21000000-0000-4000-8000-000000000002'::uuid;
    exception
      when insufficient_privilege or check_violation then
        insert into employees_post_rls_results
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
    update_count integer;
    before_snapshot record;
    after_snapshot record;
  begin
    select *
    into before_snapshot
    from public.employees_post_rls_snapshot('rls-readiness-employee-b-update-target@example.test');

    update employees
    set title = 'Should Not Change'
    where email = 'rls-readiness-employee-b-update-target@example.test'
      and account_id = '21000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.employees_post_rls_snapshot('rls-readiness-employee-b-update-target@example.test');

    insert into employees_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before=' || coalesce(before_snapshot.title, 'null') || ', after=' || coalesce(after_snapshot.title, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '21000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '21000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.title = 'Account B Update Target'
        and after_snapshot.title = 'Account B Update Target'
        and update_count = 0,
      'Account A update of Account B should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into employees_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B should be blocked'
      );
  end $$;

  do $$
  declare
    delete_count integer;
    delete_snapshot_before record;
    delete_snapshot_after record;
  begin
    select *
    into delete_snapshot_before
    from public.employees_post_rls_snapshot('rls-readiness-employee-b-delete-target@example.test');

    delete from employees
    where email = 'rls-readiness-employee-b-delete-target@example.test'
      and account_id = '21000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.employees_post_rls_snapshot('rls-readiness-employee-b-delete-target@example.test');

    insert into employees_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '21000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '21000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_before.title = 'Account B Delete Target'
        and delete_snapshot_after.title = 'Account B Delete Target'
        and delete_count = 0,
      'Account A delete of Account B should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into employees_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '11000000-0000-4000-8000-000000000002', true);

  insert into employees_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '11000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into employees_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b',
    '1 visible row for Account B',
    'visible_count=' || count(*)::text || ', emails=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '21000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible row'
  from employees
  where email = 'rls-readiness-employee-b-owned@example.test';
commit;

select check_name, expected, actual, passed, notes
from employees_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from employees
where email in (
  'rls-readiness-employee-a-owned@example.test',
  'rls-readiness-employee-b-owned@example.test',
  'rls-readiness-employee-a-inserted@example.test',
  'rls-readiness-employee-b-update-target@example.test',
  'rls-readiness-employee-b-delete-target@example.test',
  'rls-readiness-employee-cross-account-insert-should-fail@example.test'
)
or email like 'rls-readiness-employee-%@example.test';

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

drop function if exists public.employees_post_rls_snapshot(text);
