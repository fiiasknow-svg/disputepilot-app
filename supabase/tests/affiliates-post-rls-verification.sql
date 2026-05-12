-- Disposable/test only.
--
-- This script verifies affiliates RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Affiliate policies depend on authenticated membership evaluation through
--   a security-definer helper so policy checks can resolve membership without
--   granting direct read access to account_memberships.
-- - This script assumes the affiliates migration defines that helper.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511090000_enable_affiliates_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists affiliates_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on affiliates_post_rls_results to authenticated;

create or replace function public.affiliates_post_rls_snapshot(p_email text)
returns table (
  id bigint,
  name text,
  company_name text,
  office_phone text,
  cell_phone text,
  email text,
  status text,
  start_date date,
  end_date date,
  commission text,
  account_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.name, a.company_name, a.office_phone, a.cell_phone, a.email,
         a.status, a.start_date, a.end_date, a.commission, a.account_id
  from public.affiliates a
  where a.email = p_email
  limit 1;
$$;

revoke all on function public.affiliates_post_rls_snapshot(text) from public;
grant execute on function public.affiliates_post_rls_snapshot(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from affiliates
where email like 'rls-post-rls-affiliate-%@example.test';

delete from account_memberships
where user_id in (
  '19000000-0000-4000-8000-000000000001',
  '19000000-0000-4000-8000-000000000002'
)
or account_id in (
  '29000000-0000-4000-8000-000000000001',
  '29000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '29000000-0000-4000-8000-000000000001',
  '29000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '19000000-0000-4000-8000-000000000001',
  '19000000-0000-4000-8000-000000000002'
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
    '19000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-post-rls-affiliate-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '19000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-post-rls-affiliate-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '29000000-0000-4000-8000-000000000001',
    'RLS Post Affiliates Account A',
    '19000000-0000-4000-8000-000000000001'
  ),
  (
    '29000000-0000-4000-8000-000000000002',
    'RLS Post Affiliates Account B',
    '19000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '29000000-0000-4000-8000-000000000001',
    '19000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '29000000-0000-4000-8000-000000000002',
    '19000000-0000-4000-8000-000000000002',
    'owner'
  );

insert into affiliates (
  name,
  company_name,
  office_phone,
  cell_phone,
  email,
  status,
  start_date,
  end_date,
  commission,
  account_id
) values
  (
    'RLS Affiliate Post Visible A',
    'RLS Affiliate Post Company A',
    '555-0901',
    '555-0902',
    'rls-post-rls-affiliate-visible-a@example.test',
    'Active',
    current_date,
    current_date + 30,
    '10',
    '29000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS Affiliate Post Visible B',
    'RLS Affiliate Post Company B',
    '555-0903',
    '555-0904',
    'rls-post-rls-affiliate-visible-b@example.test',
    'Lead',
    current_date,
    current_date + 45,
    '12',
    '29000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS Affiliate Post Protected B Update',
    'RLS Affiliate Post Company B Update',
    '555-0905',
    '555-0906',
    'rls-post-rls-affiliate-protected-b-update@example.test',
    'Lead',
    current_date,
    current_date + 45,
    '13',
    '29000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS Affiliate Post Protected B Delete',
    'RLS Affiliate Post Company B Delete',
    '555-0907',
    '555-0908',
    'rls-post-rls-affiliate-protected-b-delete@example.test',
    'Lead',
    current_date,
    current_date + 45,
    '14',
    '29000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '19000000-0000-4000-8000-000000000001', true);

  insert into affiliates_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '19000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into affiliates_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a_visible_affiliate',
    '1 visible affiliate row for Account A',
    'visible_count=' || count(*)::text || ', affiliates=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '29000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible affiliate row'
  from affiliates
  where email in (
    'rls-post-rls-affiliate-visible-a@example.test',
    'rls-post-rls-affiliate-visible-b@example.test'
  );

  do $$
  declare
    inserted_id bigint;
    inserted_snapshot record;
  begin
    insert into affiliates (
      name,
      company_name,
      office_phone,
      cell_phone,
      email,
      status,
      start_date,
      end_date,
      commission,
      account_id
    ) values (
      'RLS Affiliate Post A Inserted',
      'RLS Affiliate Post Company A Inserted',
      '555-0909',
      '555-0910',
      'rls-post-rls-affiliate-a-inserted@example.test',
      'Active',
      current_date,
      current_date + 60,
      '15',
      '29000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select *
    into inserted_snapshot
    from public.affiliates_post_rls_snapshot('rls-post-rls-affiliate-a-inserted@example.test');

    insert into affiliates_post_rls_results
    values (
      'account_a_insert_account_a_affiliate',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_snapshot.account_id::text, 'null'),
      inserted_snapshot.account_id = '29000000-0000-4000-8000-000000000001'::uuid,
      'Account A insert for Account A should pass'
    );

    delete from affiliates where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into affiliates_post_rls_results
      values (
        'account_a_insert_account_a_affiliate',
        'insert allowed',
        sqlerrm,
        false,
        'Account A insert for Account A should have been allowed'
      );
  end $$;

  do $$
  begin
    begin
      insert into affiliates (
        name,
        company_name,
        office_phone,
        cell_phone,
        email,
        status,
        start_date,
        end_date,
        commission,
        account_id
      ) values (
        'RLS Affiliate Post Cross Account Insert Should Fail',
        'RLS Affiliate Post Cross Account Company',
        '555-0911',
        '555-0912',
        'rls-post-rls-affiliate-cross-account-insert-should-fail@example.test',
        'Lead',
        current_date,
        current_date + 45,
        '11',
        '29000000-0000-4000-8000-000000000002'
      );

      insert into affiliates_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B affiliates'
      );

      delete from affiliates
      where email = 'rls-post-rls-affiliate-cross-account-insert-should-fail@example.test';
    exception
      when insufficient_privilege or check_violation then
        insert into affiliates_post_rls_results
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
    from public.affiliates_post_rls_snapshot('rls-post-rls-affiliate-protected-b-update@example.test');

    update affiliates
    set status = 'Active',
        commission = '99'
    where email = 'rls-post-rls-affiliate-protected-b-update@example.test'
      and account_id = '29000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.affiliates_post_rls_snapshot('rls-post-rls-affiliate-protected-b-update@example.test');

    insert into affiliates_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before_status=' || coalesce(before_snapshot.status, 'null') || ', after_status=' || coalesce(after_snapshot.status, 'null') || ', before_commission=' || coalesce(before_snapshot.commission, 'null') || ', after_commission=' || coalesce(after_snapshot.commission, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '29000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '29000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.status = after_snapshot.status
        and before_snapshot.commission = after_snapshot.commission
        and update_count = 0,
      'Account A update of Account B affiliate should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into affiliates_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B affiliate should be blocked'
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
    from public.affiliates_post_rls_snapshot('rls-post-rls-affiliate-protected-b-delete@example.test');

    delete from affiliates
    where email = 'rls-post-rls-affiliate-protected-b-delete@example.test'
      and account_id = '29000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.affiliates_post_rls_snapshot('rls-post-rls-affiliate-protected-b-delete@example.test');

    insert into affiliates_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '29000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '29000000-0000-4000-8000-000000000002'::uuid
        and delete_count = 0,
      'Account A delete of Account B affiliate should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into affiliates_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B affiliate should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '19000000-0000-4000-8000-000000000002', true);

  insert into affiliates_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '19000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into affiliates_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b_visible_affiliate',
    '1 visible affiliate row for Account B',
    'visible_count=' || count(*)::text || ', affiliates=' || coalesce(string_agg(email, ', ' order by email), 'none'),
    count(*) = 1 and bool_and(account_id = '29000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible affiliate row'
  from affiliates
  where email in (
    'rls-post-rls-affiliate-visible-a@example.test',
    'rls-post-rls-affiliate-visible-b@example.test'
  );
commit;

select check_name, expected, actual, passed, notes
from affiliates_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from affiliates
where email like 'rls-post-rls-affiliate-%@example.test';

delete from account_memberships
where user_id in (
  '19000000-0000-4000-8000-000000000001',
  '19000000-0000-4000-8000-000000000002'
)
or account_id in (
  '29000000-0000-4000-8000-000000000001',
  '29000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '29000000-0000-4000-8000-000000000001',
  '29000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '19000000-0000-4000-8000-000000000001',
  '19000000-0000-4000-8000-000000000002'
);

drop function if exists public.affiliates_post_rls_snapshot(text);
