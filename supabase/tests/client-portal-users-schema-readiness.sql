-- Disposable/test only.
--
-- Verifies the staged client_portal_users schema migration.
--
-- Important:
-- - Do not use this against production.
-- - This script does not enable RLS.
-- - This script does not change existing business RLS policies.
-- - Run only after applying:
--   supabase/migrations/20260514010000_add_client_portal_users.sql
--
-- The script records PASS/FAIL rows and cleans up its fixed test data.
-- Client seed rows are inserted with schema-tolerant dynamic SQL because
-- disposable/prod-like clients schemas may omit optional columns such as
-- client_type, assigned_agent, notes, or phone.

create temporary table if not exists client_portal_users_schema_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

truncate table client_portal_users_schema_results;

-- Cleanup any interrupted prior run.
delete from public.client_portal_users
where user_id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
)
or account_id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
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
    where email like 'portal-schema-readiness-client-%@example.test';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'account_id'
  ) then
    delete from public.clients
    where account_id in (
      '2a000000-0000-4000-8000-000000000001',
      '2a000000-0000-4000-8000-000000000002'
    );
  end if;
end $$;

delete from public.account_memberships
where user_id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
)
or account_id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
);

delete from public.accounts
where id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
);

insert into client_portal_users_schema_results
select
  'client_portal_users table exists',
  'public.client_portal_users exists',
  coalesce(to_regclass('public.client_portal_users')::text, 'missing'),
  to_regclass('public.client_portal_users') is not null,
  'Schema-only migration must create the mapping table.';

insert into client_portal_users_schema_results
select
  'required columns exist',
  'id, account_id, client_id, user_id, status, created_at, updated_at',
  string_agg(column_name, ', ' order by ordinal_position),
  count(*) = 7,
  'All required mapping columns must be present.'
from information_schema.columns
where table_schema = 'public'
  and table_name = 'client_portal_users'
  and column_name in ('id', 'account_id', 'client_id', 'user_id', 'status', 'created_at', 'updated_at');

insert into client_portal_users_schema_results
select
  'client_id type matches clients.id',
  clients_id.data_type || coalesce(':' || clients_id.udt_name, ''),
  cpu_client_id.data_type || coalesce(':' || cpu_client_id.udt_name, ''),
  clients_id.udt_name = cpu_client_id.udt_name,
  'Portal mapping client_id must match the target database public.clients.id type.'
from information_schema.columns clients_id
cross join information_schema.columns cpu_client_id
where clients_id.table_schema = 'public'
  and clients_id.table_name = 'clients'
  and clients_id.column_name = 'id'
  and cpu_client_id.table_schema = 'public'
  and cpu_client_id.table_name = 'client_portal_users'
  and cpu_client_id.column_name = 'client_id';

insert into client_portal_users_schema_results
select
  'unique mapping constraint exists',
  'client_portal_users_account_client_user_unique',
  coalesce(max(tc.constraint_name), 'missing'),
  count(*) = 1,
  'Prevents duplicate mappings for the same account/client/user tuple.'
from information_schema.table_constraints tc
where tc.table_schema = 'public'
  and tc.table_name = 'client_portal_users'
  and tc.constraint_name = 'client_portal_users_account_client_user_unique'
  and tc.constraint_type = 'UNIQUE';

insert into client_portal_users_schema_results
select
  'indexes exist',
  'user_id, account_id, client_id, account_client',
  string_agg(indexname, ', ' order by indexname),
  count(*) filter (
    where indexname in (
      'client_portal_users_user_id_idx',
      'client_portal_users_account_id_idx',
      'client_portal_users_client_id_idx',
      'client_portal_users_account_client_idx'
    )
  ) = 4,
  'Portal lookup indexes should exist before portal RLS and server helpers are added.'
from pg_indexes
where schemaname = 'public'
  and tablename = 'client_portal_users';

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
    '1a000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-schema-readiness-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '1a000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'portal-schema-readiness-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into public.accounts (id, name, created_by_user_id)
values
  (
    '2a000000-0000-4000-8000-000000000001',
    'Portal Schema Readiness Account A',
    '1a000000-0000-4000-8000-000000000001'
  ),
  (
    '2a000000-0000-4000-8000-000000000002',
    'Portal Schema Readiness Account B',
    '1a000000-0000-4000-8000-000000000002'
  );

insert into public.account_memberships (account_id, user_id, role)
values
  (
    '2a000000-0000-4000-8000-000000000001',
    '1a000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '2a000000-0000-4000-8000-000000000002',
    '1a000000-0000-4000-8000-000000000002',
    'owner'
  );

do $$
declare
  v_client_a_id public.clients.id%type;
  v_client_b_id public.clients.id%type;
  v_duplicate_blocked boolean := false;
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
        when 'email' then quote_literal('portal-schema-readiness-client-a@example.test')
        when 'phone' then quote_literal('555-4101')
        when 'status' then quote_literal('active')
        when 'assigned_agent' then quote_literal('Portal Tester A')
        when 'notes' then quote_literal('Disposable portal mapping client A.')
        when 'account_id' then quote_literal('2a000000-0000-4000-8000-000000000001') || '::uuid'
      end,
      ', ' order by ordinal_position
    ),
    string_agg(
      case column_name
        when 'first_name' then quote_literal('Portal')
        when 'last_name' then quote_literal('Client B')
        when 'full_name' then quote_literal('Portal Client B')
        when 'email' then quote_literal('portal-schema-readiness-client-b@example.test')
        when 'phone' then quote_literal('555-4102')
        when 'status' then quote_literal('active')
        when 'assigned_agent' then quote_literal('Portal Tester B')
        when 'notes' then quote_literal('Disposable portal mapping client B.')
        when 'account_id' then quote_literal('2a000000-0000-4000-8000-000000000002') || '::uuid'
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
      'account_id'
    );

  if v_columns is null then
    raise exception 'public.clients has none of the safe seed columns expected by this readiness script';
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
    user_id
  ) values
    (
      '2a000000-0000-4000-8000-000000000001',
      v_client_a_id,
      '1a000000-0000-4000-8000-000000000001'
    ),
    (
      '2a000000-0000-4000-8000-000000000002',
      v_client_b_id,
      '1a000000-0000-4000-8000-000000000002'
    );

  insert into client_portal_users_schema_results
  values (
    'mapping rows represent user A/client A and user B/client B',
    '2 active mapping rows',
    (
      select count(*)::text
      from public.client_portal_users
      where user_id in (
        '1a000000-0000-4000-8000-000000000001',
        '1a000000-0000-4000-8000-000000000002'
      )
        and status = 'active'
    ),
    (
      select count(*) = 2
      from public.client_portal_users
      where user_id in (
        '1a000000-0000-4000-8000-000000000001',
        '1a000000-0000-4000-8000-000000000002'
      )
        and status = 'active'
    ),
    'Default active status and mapped account/client/user tuples should work.'
  );

  begin
    insert into public.client_portal_users (
      account_id,
      client_id,
      user_id
    ) values (
      '2a000000-0000-4000-8000-000000000001',
      v_client_a_id,
      '1a000000-0000-4000-8000-000000000001'
    );
  exception
    when unique_violation then
      v_duplicate_blocked := true;
  end;

  insert into client_portal_users_schema_results
  values (
    'duplicate mapping blocked',
    'unique violation',
    case when v_duplicate_blocked then 'unique violation' else 'duplicate insert succeeded' end,
    v_duplicate_blocked,
    'unique(account_id, client_id, user_id) must prevent duplicate portal mappings.'
  );
end $$;

-- Cleanup test rows. Results remain in the temporary result table.
delete from public.client_portal_users
where user_id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
)
or account_id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
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
    where email like 'portal-schema-readiness-client-%@example.test';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'account_id'
  ) then
    delete from public.clients
    where account_id in (
      '2a000000-0000-4000-8000-000000000001',
      '2a000000-0000-4000-8000-000000000002'
    );
  end if;
end $$;

delete from public.account_memberships
where user_id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
)
or account_id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
);

delete from public.accounts
where id in (
  '2a000000-0000-4000-8000-000000000001',
  '2a000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '1a000000-0000-4000-8000-000000000001',
  '1a000000-0000-4000-8000-000000000002'
);

select *
from client_portal_users_schema_results
order by check_name;
