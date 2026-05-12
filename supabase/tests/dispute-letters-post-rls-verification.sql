-- Disposable/test only.
--
-- This script verifies dispute_letters RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Dispute letter policies depend on authenticated membership evaluation
--   through a security-definer helper so policy checks can resolve membership
--   without granting direct read access to account_memberships.
-- - Dispute letter writes also require any dispute_id to belong to the same
--   account_id as the dispute letter.
-- - This script assumes the dispute_letters migration defines those helpers.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists dispute_letters_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on dispute_letters_post_rls_results to authenticated;

create or replace function public.dispute_letters_post_rls_snapshot(p_title text)
returns table (
  id bigint,
  dispute_id bigint,
  title text,
  content text,
  round integer,
  account_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select dl.id, dl.dispute_id, dl.title, dl.content, dl.round, dl.account_id
  from public.dispute_letters dl
  where dl.title = p_title
  limit 1;
$$;

create or replace function public.dispute_letters_post_rls_dispute_id(p_account_name text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select d.id
  from public.disputes d
  where d.account_name = p_account_name
  limit 1;
$$;

revoke all on function public.dispute_letters_post_rls_snapshot(text) from public;
revoke all on function public.dispute_letters_post_rls_dispute_id(text) from public;
grant execute on function public.dispute_letters_post_rls_snapshot(text) to authenticated;
grant execute on function public.dispute_letters_post_rls_dispute_id(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from dispute_letters
where title like 'RLS-DISPLETTER-POST-%';

delete from disputes
where account_name like 'RLS-DISPLETTER-POST-%';

delete from clients
where email like 'rls-post-rls-dispute-letter-client-%@example.test';

delete from account_memberships
where user_id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
)
or account_id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
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
    '18000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-post-rls-dispute-letter-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '18000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-post-rls-dispute-letter-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '28000000-0000-4000-8000-000000000001',
    'RLS Post Dispute Letters Account A',
    '18000000-0000-4000-8000-000000000001'
  ),
  (
    '28000000-0000-4000-8000-000000000002',
    'RLS Post Dispute Letters Account B',
    '18000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '28000000-0000-4000-8000-000000000001',
    '18000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '28000000-0000-4000-8000-000000000002',
    '18000000-0000-4000-8000-000000000002',
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
    'Dispute Letter Client A',
    'RLS Dispute Letter Client A',
    'rls-post-rls-dispute-letter-client-a@example.test',
    '555-0801',
    'active',
    'Client',
    '28000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Dispute Letter Client B',
    'RLS Dispute Letter Client B',
    'rls-post-rls-dispute-letter-client-b@example.test',
    '555-0802',
    'active',
    'Client',
    '28000000-0000-4000-8000-000000000002'
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
    (select id from clients where email = 'rls-post-rls-dispute-letter-client-a@example.test'),
    'RLS-DISPLETTER-POST-DISPUTE-A',
    'A-8001',
    'Credit Card',
    'equifax',
    'Not My Account',
    'pending',
    1,
    '28000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-letter-client-b@example.test'),
    'RLS-DISPLETTER-POST-DISPUTE-B',
    'B-8001',
    'Credit Card',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '28000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-letter-client-b@example.test'),
    'RLS-DISPLETTER-POST-DISPUTE-B-UPDATE',
    'B-8002',
    'Collection Account',
    'experian',
    'Incorrect Balance',
    'pending',
    1,
    '28000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from clients where email = 'rls-post-rls-dispute-letter-client-b@example.test'),
    'RLS-DISPLETTER-POST-DISPUTE-B-DELETE',
    'B-8003',
    'Collection Account',
    'transunion',
    'Duplicate Account',
    'pending',
    1,
    '28000000-0000-4000-8000-000000000002'
  );

insert into dispute_letters (
  dispute_id,
  title,
  content,
  round,
  account_id
) values
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-POST-DISPUTE-A'),
    'RLS-DISPLETTER-POST-VISIBLE-A',
    'Seeded post-RLS dispute letter for Account A.',
    1,
    '28000000-0000-4000-8000-000000000001'
  ),
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-POST-DISPUTE-B'),
    'RLS-DISPLETTER-POST-VISIBLE-B',
    'Seeded post-RLS dispute letter for Account B.',
    1,
    '28000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-POST-DISPUTE-B-UPDATE'),
    'RLS-DISPLETTER-POST-PROTECTED-B-UPDATE',
    'Account B dispute letter reserved for blocked update verification.',
    1,
    '28000000-0000-4000-8000-000000000002'
  ),
  (
    (select id from disputes where account_name = 'RLS-DISPLETTER-POST-DISPUTE-B-DELETE'),
    'RLS-DISPLETTER-POST-PROTECTED-B-DELETE',
    'Account B dispute letter reserved for blocked delete verification.',
    1,
    '28000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '18000000-0000-4000-8000-000000000001', true);

  insert into dispute_letters_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '18000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into dispute_letters_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a_visible_dispute_letter',
    '1 visible dispute letter row for Account A',
    'visible_count=' || count(*)::text || ', letters=' || coalesce(string_agg(title, ', ' order by title), 'none'),
    count(*) = 1 and bool_and(account_id = '28000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible dispute letter row'
  from dispute_letters
  where title like 'RLS-DISPLETTER-POST-VISIBLE-%';

  do $$
  declare
    inserted_id bigint;
    inserted_snapshot record;
    account_a_dispute_id bigint;
  begin
    account_a_dispute_id := public.dispute_letters_post_rls_dispute_id('RLS-DISPLETTER-POST-DISPUTE-A');

    insert into dispute_letters (
      dispute_id,
      title,
      content,
      round,
      account_id
    ) values (
      account_a_dispute_id,
      'RLS-DISPLETTER-POST-A-INSERTED',
      'Inserted post-RLS dispute letter for Account A.',
      2,
      '28000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select *
    into inserted_snapshot
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-A-INSERTED');

    insert into dispute_letters_post_rls_results
    values (
      'account_a_insert_account_a_with_account_a_dispute',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_snapshot.account_id::text, 'null') || ', dispute_id=' || coalesce(inserted_snapshot.dispute_id::text, 'null'),
      inserted_snapshot.account_id = '28000000-0000-4000-8000-000000000001'::uuid
        and inserted_snapshot.dispute_id = account_a_dispute_id,
      'Account A insert with an Account A dispute should pass'
    );

    delete from dispute_letters where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into dispute_letters_post_rls_results
      values (
        'account_a_insert_account_a_with_account_a_dispute',
        'insert allowed',
        sqlerrm,
        false,
        'Account A insert with an Account A dispute should have been allowed'
      );
  end $$;

  do $$
  declare
    account_b_dispute_id bigint;
  begin
    account_b_dispute_id := public.dispute_letters_post_rls_dispute_id('RLS-DISPLETTER-POST-DISPUTE-B');

    begin
      insert into dispute_letters (
        dispute_id,
        title,
        content,
        round,
        account_id
      ) values (
        account_b_dispute_id,
        'RLS-DISPLETTER-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
        'This should not be allowed for Account A user.',
        2,
        '28000000-0000-4000-8000-000000000002'
      );

      insert into dispute_letters_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B dispute letters'
      );

      delete from dispute_letters
      where title = 'RLS-DISPLETTER-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into dispute_letters_post_rls_results
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
    account_b_dispute_id bigint;
  begin
    account_b_dispute_id := public.dispute_letters_post_rls_dispute_id('RLS-DISPLETTER-POST-DISPUTE-B');

    begin
      insert into dispute_letters (
        dispute_id,
        title,
        content,
        round,
        account_id
      ) values (
        account_b_dispute_id,
        'RLS-DISPLETTER-POST-CROSS-DISPUTE-INSERT-SHOULD-FAIL',
        'This Account A letter should not be allowed to use an Account B dispute.',
        2,
        '28000000-0000-4000-8000-000000000001'
      );

      insert into dispute_letters_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_dispute_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not create an Account A dispute letter with an Account B dispute'
      );

      delete from dispute_letters
      where title = 'RLS-DISPLETTER-POST-CROSS-DISPUTE-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into dispute_letters_post_rls_results
        values (
          'account_a_insert_account_a_with_account_b_dispute_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A dispute letter with an Account B dispute should be blocked'
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
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-PROTECTED-B-UPDATE');

    update dispute_letters
    set content = 'Account A should not be able to change this Account B dispute letter.'
    where title = 'RLS-DISPLETTER-POST-PROTECTED-B-UPDATE'
      and account_id = '28000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-PROTECTED-B-UPDATE');

    insert into dispute_letters_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before_content=' || coalesce(before_snapshot.content, 'null') || ', after_content=' || coalesce(after_snapshot.content, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '28000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '28000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.content = after_snapshot.content
        and update_count = 0,
      'Account A update of Account B dispute letter should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into dispute_letters_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B dispute letter should be blocked'
      );
  end $$;

  do $$
  declare
    update_count integer := 0;
    account_b_dispute_id bigint;
    before_snapshot record;
    after_snapshot record;
  begin
    account_b_dispute_id := public.dispute_letters_post_rls_dispute_id('RLS-DISPLETTER-POST-DISPUTE-B');

    select *
    into before_snapshot
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-VISIBLE-A');

    begin
      update dispute_letters
      set dispute_id = account_b_dispute_id
      where title = 'RLS-DISPLETTER-POST-VISIBLE-A'
        and account_id = '28000000-0000-4000-8000-000000000001'::uuid;

      get diagnostics update_count = row_count;

      select *
      into after_snapshot
      from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-VISIBLE-A');

      insert into dispute_letters_post_rls_results
      values (
        'account_a_move_dispute_letter_to_account_b_dispute_blocked',
        'blocked and row unchanged',
        'row_count=' || update_count::text || ', before_dispute_id=' || coalesce(before_snapshot.dispute_id::text, 'null') || ', after_dispute_id=' || coalesce(after_snapshot.dispute_id::text, 'null'),
        before_snapshot.id is not null
          and after_snapshot.id is not null
          and before_snapshot.dispute_id = after_snapshot.dispute_id
          and after_snapshot.dispute_id is distinct from account_b_dispute_id
          and before_snapshot.account_id = '28000000-0000-4000-8000-000000000001'::uuid
          and after_snapshot.account_id = '28000000-0000-4000-8000-000000000001'::uuid
          and update_count = 0,
        'Account A should not move an Account A dispute letter to an Account B dispute'
      );
    exception
      when insufficient_privilege or check_violation then
        select *
        into after_snapshot
        from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-VISIBLE-A');

        insert into dispute_letters_post_rls_results
        values (
          'account_a_move_dispute_letter_to_account_b_dispute_blocked',
          'blocked and row unchanged',
          sqlerrm || ', before_dispute_id=' || coalesce(before_snapshot.dispute_id::text, 'null') || ', after_dispute_id=' || coalesce(after_snapshot.dispute_id::text, 'null'),
          before_snapshot.id is not null
            and after_snapshot.id is not null
            and before_snapshot.dispute_id = after_snapshot.dispute_id
            and after_snapshot.dispute_id is distinct from account_b_dispute_id
            and before_snapshot.account_id = '28000000-0000-4000-8000-000000000001'::uuid
            and after_snapshot.account_id = '28000000-0000-4000-8000-000000000001'::uuid,
          'Account A move to an Account B dispute should be blocked'
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
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-PROTECTED-B-DELETE');

    delete from dispute_letters
    where title = 'RLS-DISPLETTER-POST-PROTECTED-B-DELETE'
      and account_id = '28000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.dispute_letters_post_rls_snapshot('RLS-DISPLETTER-POST-PROTECTED-B-DELETE');

    insert into dispute_letters_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '28000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '28000000-0000-4000-8000-000000000002'::uuid
        and delete_count = 0,
      'Account A delete of Account B dispute letter should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into dispute_letters_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B dispute letter should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '18000000-0000-4000-8000-000000000002', true);

  insert into dispute_letters_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '18000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into dispute_letters_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b_visible_dispute_letter',
    '1 visible dispute letter row for Account B',
    'visible_count=' || count(*)::text || ', letters=' || coalesce(string_agg(title, ', ' order by title), 'none'),
    count(*) = 1 and bool_and(account_id = '28000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible dispute letter row'
  from dispute_letters
  where title like 'RLS-DISPLETTER-POST-VISIBLE-%';
commit;

select check_name, expected, actual, passed, notes
from dispute_letters_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from dispute_letters
where title like 'RLS-DISPLETTER-POST-%';

delete from disputes
where account_name like 'RLS-DISPLETTER-POST-%';

delete from clients
where email like 'rls-post-rls-dispute-letter-client-%@example.test';

delete from account_memberships
where user_id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
)
or account_id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '18000000-0000-4000-8000-000000000001',
  '18000000-0000-4000-8000-000000000002'
);

drop function if exists public.dispute_letters_post_rls_snapshot(text);
drop function if exists public.dispute_letters_post_rls_dispute_id(text);
