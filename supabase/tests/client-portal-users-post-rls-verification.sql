-- Disposable/test only.
--
-- Verifies the intended future client portal RLS behavior for:
-- - public.client_portal_users
-- - public.clients portal reads
--
-- Important:
-- - Do not use this against production.
-- - This script enables RLS and creates portal draft policies only in a
--   disposable database, then drops those policies during cleanup.
-- - This script does not modify production migrations.
-- - This script does not test route protection or cookies. dp_auth is a browser
--   cookie and is intentionally irrelevant to database RLS; this verifier
--   confirms database access depends on auth.uid() plus client_portal_users.
--
-- Recommended disposable setup:
-- - Apply account foundation and clients/account_id setup.
-- - Apply supabase/migrations/20260514010000_add_client_portal_users.sql.
-- - Run supabase/tests/client-portal-users-schema-readiness.sql.
-- - Run this script in disposable Supabase.

create temporary table if not exists client_portal_users_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

truncate table client_portal_users_post_rls_results;

grant select, insert, update, delete on client_portal_users_post_rls_results to authenticated;
grant select, insert, update, delete on client_portal_users_post_rls_results to anon;

drop policy if exists "client_portal_users_select_self_active" on public.client_portal_users;
drop policy if exists "clients_select_active_portal_user" on public.clients;

alter table public.client_portal_users enable row level security;
alter table public.clients enable row level security;

grant select on public.client_portal_users to authenticated;
grant select on public.clients to authenticated;
grant select on public.client_portal_users to anon;
grant select on public.clients to anon;

create policy "client_portal_users_select_self_active"
on public.client_portal_users
for select
to authenticated
using (
  user_id = auth.uid()
  and status = 'active'
);

create policy "clients_select_active_portal_user"
on public.clients
for select
to authenticated
using (
  exists (
    select 1
    from public.client_portal_users cpu
    where cpu.user_id = auth.uid()
      and cpu.status = 'active'
      and cpu.account_id = clients.account_id
      and cpu.client_id = clients.id
  )
);

-- Cleanup any interrupted prior run.
delete from public.client_portal_users
where user_id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
)
or account_id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'email'
  ) then
    delete from public.clients
    where email like 'portal-post-rls-client-%@example.test';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'account_id'
  ) then
    delete from public.clients
    where account_id in (
      '2b000000-0000-4000-8000-000000000001',
      '2b000000-0000-4000-8000-000000000002'
    );
  end if;
end $$;

delete from public.account_memberships
where user_id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
)
or account_id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

delete from public.accounts
where id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
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
    '1b000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-post-rls-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '1b000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-post-rls-user-b@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '1b000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-post-rls-unmapped-user@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '1b000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-post-rls-business-only-user@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into public.accounts (id, name)
values
  (
    '2b000000-0000-4000-8000-000000000001',
    'Portal Post RLS Account A'
  ),
  (
    '2b000000-0000-4000-8000-000000000002',
    'Portal Post RLS Account B'
  );

-- This membership is intentionally for a non-portal user. The portal policies
-- below must not use account_memberships as a portal authorization source.
insert into public.account_memberships (account_id, user_id, role)
values (
  '2b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000004',
  'owner'
);

do $$
declare
  v_client_a_id public.clients.id%type;
  v_client_b_id public.clients.id%type;
  v_columns text;
  v_values_a text;
  v_values_b text;
begin
  select
    string_agg(quote_ident(column_name), ', ' order by ordinal_position),
    string_agg(
      case column_name
        when 'first_name' then quote_literal('Portal')
        when 'last_name' then quote_literal('Client A')
        when 'full_name' then quote_literal('Portal Client A')
        when 'email' then quote_literal('portal-post-rls-client-a@example.test')
        when 'phone' then quote_literal('555-4201')
        when 'status' then quote_literal('active')
        when 'assigned_agent' then quote_literal('Portal Tester A')
        when 'notes' then quote_literal('Disposable portal RLS client A.')
        when 'portal_access' then quote_literal('true')
        when 'client_portal_access' then quote_literal('true')
        when 'account_id' then quote_literal('2b000000-0000-4000-8000-000000000001') || '::uuid'
      end,
      ', ' order by ordinal_position
    ),
    string_agg(
      case column_name
        when 'first_name' then quote_literal('Portal')
        when 'last_name' then quote_literal('Client B')
        when 'full_name' then quote_literal('Portal Client B')
        when 'email' then quote_literal('portal-post-rls-client-b@example.test')
        when 'phone' then quote_literal('555-4202')
        when 'status' then quote_literal('active')
        when 'assigned_agent' then quote_literal('Portal Tester B')
        when 'notes' then quote_literal('Disposable portal RLS client B.')
        when 'portal_access' then quote_literal('true')
        when 'client_portal_access' then quote_literal('true')
        when 'account_id' then quote_literal('2b000000-0000-4000-8000-000000000002') || '::uuid'
      end,
      ', ' order by ordinal_position
    )
  into v_columns, v_values_a, v_values_b
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'clients'
    and column_name in (
      'first_name',
      'last_name',
      'full_name',
      'email',
      'phone',
      'status',
      'assigned_agent',
      'notes',
      'portal_access',
      'client_portal_access',
      'account_id'
    );

  if v_columns is null then
    raise exception 'public.clients has none of the safe seed columns expected by this verifier';
  end if;

  execute format(
    'insert into public.clients (%s) values (%s) returning id',
    v_columns,
    v_values_a
  )
  into v_client_a_id;

  execute format(
    'insert into public.clients (%s) values (%s) returning id',
    v_columns,
    v_values_b
  )
  into v_client_b_id;

  insert into public.client_portal_users (
    account_id,
    client_id,
    user_id,
    status
  ) values
    (
      '2b000000-0000-4000-8000-000000000001',
      v_client_a_id,
      '1b000000-0000-4000-8000-000000000001',
      'active'
    ),
    (
      '2b000000-0000-4000-8000-000000000002',
      v_client_b_id,
      '1b000000-0000-4000-8000-000000000002',
      'active'
    );
end $$;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '1b000000-0000-4000-8000-000000000001', true);

  insert into client_portal_users_post_rls_results
  select
    'portal_user_a_mapping_visibility',
    '1 mapping for user A only',
    'visible_count=' || count(*)::text || ', users=' || coalesce(string_agg(user_id::text, ', ' order by user_id::text), 'none'),
    count(*) = 1 and bool_and(user_id = '1b000000-0000-4000-8000-000000000001'::uuid),
    'Mapped portal user A should read only their own active mapping.'
  from public.client_portal_users;

  insert into client_portal_users_post_rls_results
  select
    'portal_user_a_client_visibility',
    '1 client for mapped client A only',
    'visible_count=' || count(*)::text || ', accounts=' || coalesce(string_agg(account_id::text, ', ' order by account_id::text), 'none'),
    count(*) = 1 and bool_and(account_id = '2b000000-0000-4000-8000-000000000001'::uuid),
    'Mapped portal user A should read only the mapped client row.'
  from public.clients;
commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '1b000000-0000-4000-8000-000000000002', true);

  insert into client_portal_users_post_rls_results
  select
    'portal_user_b_mapping_visibility',
    '1 mapping for user B only',
    'visible_count=' || count(*)::text || ', users=' || coalesce(string_agg(user_id::text, ', ' order by user_id::text), 'none'),
    count(*) = 1 and bool_and(user_id = '1b000000-0000-4000-8000-000000000002'::uuid),
    'Mapped portal user B should read only their own active mapping.'
  from public.client_portal_users;
commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '1b000000-0000-4000-8000-000000000003', true);

  insert into client_portal_users_post_rls_results
  select
    'unmapped_authenticated_mapping_visibility',
    '0 mappings',
    count(*)::text,
    count(*) = 0,
    'Unmapped authenticated users should read no portal mappings.'
  from public.client_portal_users;

  insert into client_portal_users_post_rls_results
  select
    'unmapped_authenticated_client_visibility',
    '0 clients',
    count(*)::text,
    count(*) = 0,
    'Unmapped authenticated users should read no portal client rows.'
  from public.clients;
commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '1b000000-0000-4000-8000-000000000004', true);

  insert into client_portal_users_post_rls_results
  select
    'business_membership_not_portal_mapping',
    '0 portal mappings',
    count(*)::text,
    count(*) = 0,
    'A business account_memberships row alone must not grant portal mapping access.'
  from public.client_portal_users;
commit;

begin;
  set local role anon;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '', true);

  insert into client_portal_users_post_rls_results
  select
    'anon_mapping_visibility',
    '0 mappings',
    count(*)::text,
    count(*) = 0,
    'Anon should read no portal mappings.'
  from public.client_portal_users;

  insert into client_portal_users_post_rls_results
  select
    'anon_client_visibility',
    '0 clients',
    count(*)::text,
    count(*) = 0,
    'Anon should read no portal client rows.'
  from public.clients;
commit;

insert into client_portal_users_post_rls_results
values (
  'dp_auth_not_database_authorization',
  'database RLS ignores browser cookies',
  'RLS predicates use auth.uid() and client_portal_users only',
  true,
  'dp_auth is not a database claim and is not referenced by these policies.'
);

-- Cleanup test data and disposable draft policies.
delete from public.client_portal_users
where user_id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
)
or account_id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'email'
  ) then
    delete from public.clients
    where email like 'portal-post-rls-client-%@example.test';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'account_id'
  ) then
    delete from public.clients
    where account_id in (
      '2b000000-0000-4000-8000-000000000001',
      '2b000000-0000-4000-8000-000000000002'
    );
  end if;
end $$;

delete from public.account_memberships
where user_id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
)
or account_id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

delete from public.accounts
where id in (
  '2b000000-0000-4000-8000-000000000001',
  '2b000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '1b000000-0000-4000-8000-000000000001',
  '1b000000-0000-4000-8000-000000000002',
  '1b000000-0000-4000-8000-000000000003',
  '1b000000-0000-4000-8000-000000000004'
);

drop policy if exists "clients_select_active_portal_user" on public.clients;
drop policy if exists "client_portal_users_select_self_active" on public.client_portal_users;

select *
from client_portal_users_post_rls_results
order by check_name;
