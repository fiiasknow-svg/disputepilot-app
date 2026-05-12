-- Disposable/test only.
--
-- This script verifies leads RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Leads policies depend on authenticated membership evaluation through a
--   security-definer helper so policy checks can resolve membership without
--   granting direct read access to account_memberships.
-- - This script assumes the leads migration defines that helper.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511030000_enable_leads_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists leads_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on leads_post_rls_results to authenticated;

create or replace function public.leads_post_rls_snapshot(p_email text)
returns table (
  id bigint,
  first_name text,
  last_name text,
  full_name text,
  email text,
  source text,
  status text,
  city text,
  state text,
  lead_score integer,
  assigned_agent text,
  account_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select l.id, l.first_name, l.last_name, l.full_name, l.email, l.source,
         l.status, l.city, l.state, l.lead_score, l.assigned_agent, l.account_id
  from public.leads l
  where l.email = p_email
  limit 1;
$$;

revoke all on function public.leads_post_rls_snapshot(text) from public;
grant execute on function public.leads_post_rls_snapshot(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from leads
where email in (
  'rls-post-rls-lead-a-visible@example.test',
  'rls-post-rls-lead-a-inserted@example.test',
  'rls-post-rls-lead-b-visible@example.test',
  'rls-post-rls-lead-b-update-target@example.test',
  'rls-post-rls-lead-b-delete-target@example.test',
  'rls-post-rls-lead-cross-account-insert-should-fail@example.test'
)
or email like 'rls-post-rls-lead-%@example.test';

delete from account_memberships
where user_id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
)
or account_id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
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
    '13000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-lead-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '13000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-lead-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '23000000-0000-4000-8000-000000000001',
    'RLS Readiness Leads Account A',
    '13000000-0000-4000-8000-000000000001'
  ),
  (
    '23000000-0000-4000-8000-000000000002',
    'RLS Readiness Leads Account B',
    '13000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '23000000-0000-4000-8000-000000000001',
    '13000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '23000000-0000-4000-8000-000000000002',
    '13000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into leads (
  first_name,
  last_name,
  full_name,
  email,
  phone,
  source,
  status,
  city,
  state,
  lead_score,
  assigned_agent,
  notes,
  account_id
) values
  (
    'RLS',
    'Lead A',
    'RLS Lead A',
    'rls-post-rls-lead-a-visible@example.test',
    '555-0211',
    'Website',
    'new',
    'Sarasota',
    'FL',
    81,
    'Alice Johnson',
    'Seeded visibility lead for Account A.',
    '23000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Lead B',
    'RLS Lead B',
    'rls-post-rls-lead-b-visible@example.test',
    '555-0212',
    'Referral',
    'new',
    'Tampa',
    'FL',
    71,
    'Bob Smith',
    'Seeded visibility lead for Account B.',
    '23000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS',
    'Lead B',
    'RLS Lead B Update Target',
    'rls-post-rls-lead-b-update-target@example.test',
    '555-0213',
    'Referral',
    'new',
    'Tampa',
    'FL',
    72,
    'Bob Smith',
    'Protected readiness lead for Account B update checks.',
    '23000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS',
    'Lead B',
    'RLS Lead B Delete Target',
    'rls-post-rls-lead-b-delete-target@example.test',
    '555-0214',
    'Referral',
    'new',
    'Tampa',
    'FL',
    73,
    'Bob Smith',
    'Protected readiness lead for Account B delete checks.',
    '23000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '13000000-0000-4000-8000-000000000001', true);

  insert into leads_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '13000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into leads_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a',
    '1 visible row for Account A',
    'visible_count=' || count(*)::text || ', emails=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '23000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible row'
  from leads
  where email = 'rls-post-rls-lead-a-visible@example.test';

  do $$
  declare inserted_id bigint;
  declare inserted_account_id uuid;
  begin
    insert into leads (
      first_name,
      last_name,
      full_name,
      email,
      phone,
      source,
      status,
      city,
      state,
      lead_score,
      assigned_agent,
      notes,
      account_id
    ) values (
      'RLS',
      'Inserted Lead A',
      'RLS Inserted Lead A',
      'rls-post-rls-lead-a-inserted@example.test',
      '555-0215',
      'Email Campaign',
      'new',
      'Sarasota',
      'FL',
      78,
      'Alice Johnson',
      'Inserted readiness lead for Account A.',
      '23000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select account_id
    into inserted_account_id
    from leads
    where id = inserted_id;

    insert into leads_post_rls_results
    values (
      'account_a_insert_account_a',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_account_id::text, 'null'),
      inserted_account_id = '23000000-0000-4000-8000-000000000001'::uuid,
      'Account A insert should pass'
    );

    delete from leads where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into leads_post_rls_results
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
      insert into leads (
        first_name,
        last_name,
        full_name,
        email,
        phone,
        source,
        status,
        city,
        state,
        lead_score,
        assigned_agent,
        notes,
        account_id
      ) values (
        'RLS',
        'Cross Account',
        'RLS Cross Account Lead',
        'rls-post-rls-lead-cross-account-insert-should-fail@example.test',
        '555-0216',
        'Website',
        'new',
        'Tampa',
        'FL',
        66,
        'Bob Smith',
        'This row should be blocked by lead RLS.',
        '23000000-0000-4000-8000-000000000002'
      );

      insert into leads_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B rows'
      );

      delete from leads
      where email = 'rls-post-rls-lead-cross-account-insert-should-fail@example.test'
        and account_id = '23000000-0000-4000-8000-000000000002'::uuid;
    exception
      when insufficient_privilege or check_violation then
        insert into leads_post_rls_results
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
    from public.leads_post_rls_snapshot('rls-post-rls-lead-b-update-target@example.test');

    update leads
    set status = 'contacted'
    where email = 'rls-post-rls-lead-b-update-target@example.test'
      and account_id = '23000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.leads_post_rls_snapshot('rls-post-rls-lead-b-update-target@example.test');

    insert into leads_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before=' || coalesce(before_snapshot.full_name, 'null') || ', after=' || coalesce(after_snapshot.full_name, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '23000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '23000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.full_name = 'RLS Lead B Update Target'
        and after_snapshot.full_name = 'RLS Lead B Update Target'
        and before_snapshot.status = 'new'
        and after_snapshot.status = 'new'
        and update_count = 0,
      'Account A update of Account B should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into leads_post_rls_results
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
    from public.leads_post_rls_snapshot('rls-post-rls-lead-b-delete-target@example.test');

    delete from leads
    where email = 'rls-post-rls-lead-b-delete-target@example.test'
      and account_id = '23000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.leads_post_rls_snapshot('rls-post-rls-lead-b-delete-target@example.test');

    insert into leads_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '23000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '23000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_before.full_name = 'RLS Lead B Delete Target'
        and delete_snapshot_after.full_name = 'RLS Lead B Delete Target'
        and delete_snapshot_before.status = 'new'
        and delete_snapshot_after.status = 'new'
        and delete_count = 0,
      'Account A delete of Account B should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into leads_post_rls_results
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
  select set_config('request.jwt.claim.sub', '13000000-0000-4000-8000-000000000002', true);

  insert into leads_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '13000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into leads_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b',
    '1 visible row for Account B',
    'visible_count=' || count(*)::text || ', emails=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '23000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible row'
  from leads
  where email = 'rls-post-rls-lead-b-visible@example.test';
commit;

select check_name, expected, actual, passed, notes
from leads_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from leads
where email in (
  'rls-post-rls-lead-a-visible@example.test',
  'rls-post-rls-lead-a-inserted@example.test',
  'rls-post-rls-lead-b-visible@example.test',
  'rls-post-rls-lead-b-update-target@example.test',
  'rls-post-rls-lead-b-delete-target@example.test',
  'rls-post-rls-lead-cross-account-insert-should-fail@example.test'
)
or email like 'rls-post-rls-lead-%@example.test';

delete from account_memberships
where user_id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
)
or account_id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '23000000-0000-4000-8000-000000000001',
  '23000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '13000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000002'
);

drop function if exists public.leads_post_rls_snapshot(text);
