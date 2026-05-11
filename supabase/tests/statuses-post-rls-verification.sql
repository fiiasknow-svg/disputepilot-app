-- Disposable/test only.
--
-- This script verifies statuses RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Status policies depend on authenticated SELECT access to
--   a security-definer membership helper so policy evaluation can resolve
--   membership without granting direct read access to account_memberships.
-- - This script assumes the statuses migration defines that helper.
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

grant select, insert, update, delete on statuses_post_rls_results to authenticated;

create or replace function public.statuses_post_rls_snapshot(p_name text)
returns table (
  id bigint,
  name text,
  color text,
  type text,
  account_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select s.id, s.name, s.color, s.type, s.account_id
  from public.statuses s
  where s.name = p_name
  limit 1;
$$;

revoke all on function public.statuses_post_rls_snapshot(text) from public;
grant execute on function public.statuses_post_rls_snapshot(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from statuses
where name in (
  'rls-post-rls-a-visible',
  'rls-post-rls-a-inserted',
  'rls-post-rls-b-visible',
  'rls-post-rls-b-update-target',
  'rls-post-rls-b-delete-target',
  'rls-post-rls-cross-account-insert-should-fail'
)
or name like 'rls-post-rls-%';

delete from account_memberships
where user_id in (
  select id
  from auth.users
  where email in (
    'rls-readiness-a@example.test',
    'rls-readiness-b@example.test'
  )
)
or account_id in (
  select id
  from accounts
  where name in (
    'RLS Readiness Account A',
    'RLS Readiness Account B'
  )
);

delete from accounts
where name in (
  'RLS Readiness Account A',
  'RLS Readiness Account B'
);

delete from auth.users
where email in (
  'rls-readiness-a@example.test',
  'rls-readiness-b@example.test'
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
  ),
  (
    'rls-post-rls-b-update-target',
    '#ef4444',
    'client',
    '20000000-0000-4000-8000-000000000002'
  ),
  (
    'rls-post-rls-b-delete-target',
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
  declare inserted_account_id uuid;
  begin
    insert into statuses (name, color, type, account_id)
    values (
      'rls-post-rls-a-inserted',
      '#3b82f6',
      'client',
      '20000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select account_id
    into inserted_account_id
    from statuses
    where id = inserted_id;

    insert into statuses_post_rls_results
    values (
      'account_a_insert_account_a',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_account_id::text, 'null'),
      inserted_account_id = '20000000-0000-4000-8000-000000000001'::uuid,
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
  declare
    update_count integer;
    before_color text;
    after_color text;
    before_snapshot record;
    after_snapshot record;
  begin
    select *
    into before_snapshot
    from public.statuses_post_rls_snapshot('rls-post-rls-b-update-target');
    before_color := before_snapshot.color;

    update statuses
    set color = '#000000'
    where name = 'rls-post-rls-b-update-target'
      and account_id = '20000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.statuses_post_rls_snapshot('rls-post-rls-b-update-target');
    after_color := after_snapshot.color;

    insert into statuses_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before=' || coalesce(before_color, 'null') || ', after=' || coalesce(after_color, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '20000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '20000000-0000-4000-8000-000000000002'::uuid
        and before_color = '#ef4444'
        and after_color = '#ef4444'
        and update_count = 0,
      'Account A update of Account B should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into statuses_post_rls_results
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
    existed_before boolean;
    existed_after boolean;
    delete_snapshot_before record;
    delete_snapshot_after record;
  begin
    select *
    into delete_snapshot_before
    from public.statuses_post_rls_snapshot('rls-post-rls-b-delete-target');
    existed_before := delete_snapshot_before.id is not null;

    delete from statuses
    where name = 'rls-post-rls-b-delete-target'
      and account_id = '20000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.statuses_post_rls_snapshot('rls-post-rls-b-delete-target');
    existed_after := delete_snapshot_after.id is not null;

    insert into statuses_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || existed_before::text || ', existed_after=' || existed_after::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '20000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '20000000-0000-4000-8000-000000000002'::uuid
        and existed_before
        and existed_after
        and delete_count = 0,
      'Account A delete of Account B should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into statuses_post_rls_results
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
    'Account B should only see the seeded visible row'
  from statuses
  where name = 'rls-post-rls-b-visible';
commit;

select check_name, expected, actual, passed, notes
from statuses_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from statuses
where name like 'rls-post-rls-%';

delete from account_memberships
where user_id in (
  select id
  from auth.users
  where email in (
    'rls-readiness-a@example.test',
    'rls-readiness-b@example.test'
  )
)
or account_id in (
  select id
  from accounts
  where name in (
    'RLS Readiness Account A',
    'RLS Readiness Account B'
  )
);

delete from accounts
where name in (
  'RLS Readiness Account A',
  'RLS Readiness Account B'
);

delete from auth.users
where email in (
  'rls-readiness-a@example.test',
  'rls-readiness-b@example.test'
);

drop function if exists public.statuses_post_rls_snapshot(text);
