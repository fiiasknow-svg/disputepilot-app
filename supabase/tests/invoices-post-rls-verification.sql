-- Disposable/test only.
--
-- This script verifies invoices RLS as authenticated users.
--
-- Important:
-- - Do not use this against production.
-- - Do not rely on the Supabase SQL Editor if it runs with elevated or
--   bypass privileges; that can invalidate the RLS check.
-- - Invoices policies depend on authenticated membership evaluation through a
--   security-definer helper so policy checks can resolve membership without
--   granting direct read access to account_memberships.
-- - Invoice writes use account_id as the primary tenant boundary. When
--   invoices.client_id and clients.id are schema-compatible, writes also
--   require client_id to belong to the same account_id as the invoice.
-- - This script assumes the invoices migration defines those helpers.
-- - The actual verification must run with an authenticated session that
--   resolves auth.uid() to the test user ids below.
--
-- Recommended manual method:
-- - Use a disposable Supabase DB.
-- - Apply the account foundation migration.
-- - Apply the disposable test schema setup if needed.
-- - Apply `supabase/migrations/20260511050000_enable_invoices_rls.sql`.
-- - Run this script from an authenticated Postgres/Supabase session where
--   the role is `authenticated` and `request.jwt.claim.sub` is set to the
--   desired test user id.
--
-- This script records PASS/FAIL rows in a temp result table and prints them at
-- the end. It also includes cleanup SQL.

create temporary table if not exists invoices_post_rls_results (
  check_name text,
  expected text,
  actual text,
  passed boolean,
  notes text
) on commit preserve rows;

grant select, insert, update, delete on invoices_post_rls_results to authenticated;

create or replace function public.invoices_post_rls_snapshot(p_invoice_number text)
returns table (
  id bigint,
  invoice_number text,
  client_id bigint,
  amount numeric,
  status text,
  due_date date,
  account_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, i.invoice_number, i.client_id, i.amount, i.status,
         i.due_date, i.account_id
  from public.invoices i
  where i.invoice_number = p_invoice_number
  limit 1;
$$;

create or replace function public.invoices_post_rls_client_id(p_email text)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clients_id_type oid;
  v_invoices_client_id_type oid;
  v_client_id bigint;
begin
  select a.atttypid
  into v_clients_id_type
  from pg_attribute a
  where a.attrelid = 'public.clients'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  select a.atttypid
  into v_invoices_client_id_type
  from pg_attribute a
  where a.attrelid = 'public.invoices'::regclass
    and a.attname = 'client_id'
    and not a.attisdropped;

  if v_clients_id_type is distinct from v_invoices_client_id_type
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

revoke all on function public.invoices_post_rls_snapshot(text) from public;
revoke all on function public.invoices_post_rls_client_id(text) from public;
grant execute on function public.invoices_post_rls_snapshot(text) to authenticated;
grant execute on function public.invoices_post_rls_client_id(text) to authenticated;

-- Clean any interrupted run from previous attempts.
delete from invoices
where invoice_number like 'RLS-INV-POST-%';

delete from clients
where email like 'rls-post-rls-invoice-client-%@example.test';

delete from account_memberships
where user_id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
)
or account_id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
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
    '15000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-invoice-user-a@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '15000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-readiness-invoice-user-b@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into accounts (id, name, created_by_user_id)
values
  (
    '25000000-0000-4000-8000-000000000001',
    'RLS Readiness Invoices Account A',
    '15000000-0000-4000-8000-000000000001'
  ),
  (
    '25000000-0000-4000-8000-000000000002',
    'RLS Readiness Invoices Account B',
    '15000000-0000-4000-8000-000000000002'
  );

insert into account_memberships (account_id, user_id, role)
values
  (
    '25000000-0000-4000-8000-000000000001',
    '15000000-0000-4000-8000-000000000001',
    'owner'
  ),
  (
    '25000000-0000-4000-8000-000000000002',
    '15000000-0000-4000-8000-000000000002',
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
    'Invoice Client A',
    'RLS Invoice Client A',
    'rls-post-rls-invoice-client-a@example.test',
    '555-0401',
    'active',
    'Client',
    '25000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS',
    'Invoice Client B',
    'RLS Invoice Client B',
    'rls-post-rls-invoice-client-b@example.test',
    '555-0402',
    'active',
    'Client',
    '25000000-0000-4000-8000-000000000002'
  );

insert into invoices (
  invoice_number,
  client_id,
  amount,
  status,
  due_date,
  account_id
) values
  (
    'RLS-INV-POST-VISIBLE-A',
    public.invoices_post_rls_client_id('rls-post-rls-invoice-client-a@example.test'),
    149,
    'pending',
    current_date + interval '7 days',
    '25000000-0000-4000-8000-000000000001'
  ),
  (
    'RLS-INV-POST-VISIBLE-B',
    public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test'),
    249,
    'pending',
    current_date + interval '10 days',
    '25000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS-INV-POST-PROTECTED-B-UPDATE',
    public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test'),
    349,
    'pending',
    current_date + interval '14 days',
    '25000000-0000-4000-8000-000000000002'
  ),
  (
    'RLS-INV-POST-PROTECTED-B-DELETE',
    public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test'),
    449,
    'pending',
    current_date + interval '21 days',
    '25000000-0000-4000-8000-000000000002'
  );

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '15000000-0000-4000-8000-000000000001', true);

  insert into invoices_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_a',
    'auth.uid() = account A',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '15000000-0000-4000-8000-000000000001'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account A';

  insert into invoices_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'client_account_validation_mode',
    'compatible schemas validate client/account; incompatible schemas skip safely',
    'validation_supported=' || public.invoices_client_account_validation_supported()::text,
    true,
    'When production has clients.id uuid and invoices.client_id bigint, this should be false and account_id remains the enforced tenant boundary';

  insert into invoices_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_a_sees_only_a_visible_invoice',
    '1 visible invoice row for Account A',
    'visible_count=' || count(*)::text || ', invoices=' || coalesce(string_agg(invoice_number, ', ' order by invoice_number), 'none'),
    count(*) = 1 and bool_and(account_id = '25000000-0000-4000-8000-000000000001'::uuid),
    'Account A should only see its own visible invoice row'
  from invoices
  where invoice_number like 'RLS-INV-POST-VISIBLE-%';

  do $$
  declare
    inserted_id bigint;
    inserted_snapshot record;
    account_a_client_id bigint;
  begin
    account_a_client_id := public.invoices_post_rls_client_id('rls-post-rls-invoice-client-a@example.test');

    insert into invoices (
      invoice_number,
      client_id,
      amount,
      status,
      due_date,
      account_id
    ) values (
      'RLS-INV-POST-A-INSERTED',
      account_a_client_id,
      199,
      'pending',
      current_date + interval '28 days',
      '25000000-0000-4000-8000-000000000001'
    )
    returning id into inserted_id;

    select *
    into inserted_snapshot
    from public.invoices_post_rls_snapshot('RLS-INV-POST-A-INSERTED');

    insert into invoices_post_rls_results
    values (
      'account_a_insert_account_a_with_optional_client',
      'insert allowed',
      'insert succeeded with id=' || inserted_id::text || ', account_id=' || coalesce(inserted_snapshot.account_id::text, 'null') || ', client_id=' || coalesce(inserted_snapshot.client_id::text, 'null'),
      inserted_snapshot.account_id = '25000000-0000-4000-8000-000000000001'::uuid
        and inserted_snapshot.client_id is not distinct from account_a_client_id,
      'Account A insert should pass; client_id is present only when client/account validation is schema-supported'
    );

    delete from invoices where id = inserted_id;
  exception
    when insufficient_privilege or check_violation then
      insert into invoices_post_rls_results
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
    account_b_client_id := public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test');

    begin
      insert into invoices (
        invoice_number,
        client_id,
        amount,
        status,
        due_date,
        account_id
      ) values (
        'RLS-INV-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL',
        account_b_client_id,
        299,
        'pending',
        current_date + interval '30 days',
        '25000000-0000-4000-8000-000000000002'
      );

      insert into invoices_post_rls_results
      values (
        'account_a_insert_account_b_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not insert Account B invoices'
      );

      delete from invoices
      where invoice_number = 'RLS-INV-POST-CROSS-ACCOUNT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into invoices_post_rls_results
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
    account_b_client_id := public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test');

    if not public.invoices_client_account_validation_supported() then
      insert into invoices_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_client_blocked',
        'skipped when client schema is incompatible',
        'validation_supported=false, account_b_client_id=' || coalesce(account_b_client_id::text, 'null'),
        true,
        'Production-safe policy does not compare incompatible clients.id and invoices.client_id types'
      );
      return;
    end if;

    begin
      insert into invoices (
        invoice_number,
        client_id,
        amount,
        status,
        due_date,
        account_id
      ) values (
        'RLS-INV-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL',
        account_b_client_id,
        399,
        'pending',
        current_date + interval '35 days',
        '25000000-0000-4000-8000-000000000001'
      );

      insert into invoices_post_rls_results
      values (
        'account_a_insert_account_a_with_account_b_client_blocked',
        'blocked',
        'insert unexpectedly succeeded',
        false,
        'Account A should not create an Account A invoice with an Account B client'
      );

      delete from invoices
      where invoice_number = 'RLS-INV-POST-CROSS-CLIENT-INSERT-SHOULD-FAIL';
    exception
      when insufficient_privilege or check_violation then
        insert into invoices_post_rls_results
        values (
          'account_a_insert_account_a_with_account_b_client_blocked',
          'blocked',
          sqlerrm,
          true,
          'Account A invoice with an Account B client should be blocked'
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
    from public.invoices_post_rls_snapshot('RLS-INV-POST-PROTECTED-B-UPDATE');

    update invoices
    set status = 'paid'
    where invoice_number = 'RLS-INV-POST-PROTECTED-B-UPDATE'
      and account_id = '25000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics update_count = row_count;

    select *
    into after_snapshot
    from public.invoices_post_rls_snapshot('RLS-INV-POST-PROTECTED-B-UPDATE');

    insert into invoices_post_rls_results
    values (
      'account_a_update_account_b_blocked',
      'blocked and row unchanged',
      'row_count=' || update_count::text || ', before_status=' || coalesce(before_snapshot.status, 'null') || ', after_status=' || coalesce(after_snapshot.status, 'null'),
      before_snapshot.id is not null
        and after_snapshot.id is not null
        and before_snapshot.account_id = '25000000-0000-4000-8000-000000000002'::uuid
        and after_snapshot.account_id = '25000000-0000-4000-8000-000000000002'::uuid
        and before_snapshot.status = 'pending'
        and after_snapshot.status = 'pending'
        and update_count = 0,
      'Account A update of Account B invoice should be blocked and leave the row unchanged'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into invoices_post_rls_results
      values (
        'account_a_update_account_b_blocked',
        'blocked and row unchanged',
        sqlerrm,
        true,
        'Account A update of Account B invoice should be blocked'
      );
  end $$;

  do $$
  declare
    update_count integer := 0;
    account_b_client_id bigint;
    before_snapshot record;
    after_snapshot record;
  begin
    account_b_client_id := public.invoices_post_rls_client_id('rls-post-rls-invoice-client-b@example.test');

    select *
    into before_snapshot
    from public.invoices_post_rls_snapshot('RLS-INV-POST-VISIBLE-A');

    if not public.invoices_client_account_validation_supported() then
      insert into invoices_post_rls_results
      values (
        'account_a_move_invoice_to_account_b_client_blocked',
        'skipped when client schema is incompatible',
        'validation_supported=false, account_b_client_id=' || coalesce(account_b_client_id::text, 'null'),
        true,
        'Production-safe policy does not compare incompatible clients.id and invoices.client_id types'
      );
      return;
    end if;

    begin
      update invoices
      set client_id = account_b_client_id
      where invoice_number = 'RLS-INV-POST-VISIBLE-A'
        and account_id = '25000000-0000-4000-8000-000000000001'::uuid;

      get diagnostics update_count = row_count;

      select *
      into after_snapshot
      from public.invoices_post_rls_snapshot('RLS-INV-POST-VISIBLE-A');

      insert into invoices_post_rls_results
      values (
        'account_a_move_invoice_to_account_b_client_blocked',
        'blocked and row unchanged',
        'row_count=' || update_count::text || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
        before_snapshot.id is not null
          and after_snapshot.id is not null
          and before_snapshot.client_id = after_snapshot.client_id
          and after_snapshot.client_id is distinct from account_b_client_id
          and before_snapshot.account_id = '25000000-0000-4000-8000-000000000001'::uuid
          and after_snapshot.account_id = '25000000-0000-4000-8000-000000000001'::uuid
          and update_count = 0,
        'Account A should not move an Account A invoice to an Account B client'
      );
    exception
      when insufficient_privilege or check_violation then
        select *
        into after_snapshot
        from public.invoices_post_rls_snapshot('RLS-INV-POST-VISIBLE-A');

        insert into invoices_post_rls_results
        values (
          'account_a_move_invoice_to_account_b_client_blocked',
          'blocked and row unchanged',
          sqlerrm || ', before_client_id=' || coalesce(before_snapshot.client_id::text, 'null') || ', after_client_id=' || coalesce(after_snapshot.client_id::text, 'null'),
          before_snapshot.id is not null
            and after_snapshot.id is not null
            and before_snapshot.client_id = after_snapshot.client_id
            and after_snapshot.client_id is distinct from account_b_client_id
            and before_snapshot.account_id = '25000000-0000-4000-8000-000000000001'::uuid
            and after_snapshot.account_id = '25000000-0000-4000-8000-000000000001'::uuid,
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
    from public.invoices_post_rls_snapshot('RLS-INV-POST-PROTECTED-B-DELETE');

    delete from invoices
    where invoice_number = 'RLS-INV-POST-PROTECTED-B-DELETE'
      and account_id = '25000000-0000-4000-8000-000000000002'::uuid;

    get diagnostics delete_count = row_count;

    select *
    into delete_snapshot_after
    from public.invoices_post_rls_snapshot('RLS-INV-POST-PROTECTED-B-DELETE');

    insert into invoices_post_rls_results
    values (
      'account_a_delete_account_b_blocked',
      'blocked and row preserved',
      'row_count=' || delete_count::text || ', existed_before=' || (delete_snapshot_before.id is not null)::text || ', existed_after=' || (delete_snapshot_after.id is not null)::text,
      delete_snapshot_before.id is not null
        and delete_snapshot_after.id is not null
        and delete_snapshot_before.account_id = '25000000-0000-4000-8000-000000000002'::uuid
        and delete_snapshot_after.account_id = '25000000-0000-4000-8000-000000000002'::uuid
        and delete_count = 0,
      'Account A delete of Account B invoice should be blocked and preserve the row'
    );
  exception
    when insufficient_privilege or check_violation then
      insert into invoices_post_rls_results
      values (
        'account_a_delete_account_b_blocked',
        'blocked and row preserved',
        sqlerrm,
        true,
        'Account A delete of Account B invoice should be blocked'
      );
  end $$;

commit;

begin;
  set local role authenticated;
  set local row_security = on;
  select set_config('request.jwt.claim.sub', '15000000-0000-4000-8000-000000000002', true);

  insert into invoices_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'auth_context_b',
    'auth.uid() = account B',
    coalesce(auth.uid()::text, 'null') || ', current_user=' || current_user,
    auth.uid() = '15000000-0000-4000-8000-000000000002'::uuid and current_user = 'authenticated',
    'authenticated context should resolve to Account B';

  insert into invoices_post_rls_results (check_name, expected, actual, passed, notes)
  select
    'account_b_sees_only_b_visible_invoice',
    '1 visible invoice row for Account B',
    'visible_count=' || count(*)::text || ', invoices=' || coalesce(string_agg(invoice_number, ', ' order by invoice_number), 'none'),
    count(*) = 1 and bool_and(account_id = '25000000-0000-4000-8000-000000000002'::uuid),
    'Account B should only see its own visible invoice row'
  from invoices
  where invoice_number like 'RLS-INV-POST-VISIBLE-%';
commit;

select check_name, expected, actual, passed, notes
from invoices_post_rls_results
order by check_name;

-- Cleanup SQL:
delete from invoices
where invoice_number like 'RLS-INV-POST-%';

delete from clients
where email like 'rls-post-rls-invoice-client-%@example.test';

delete from account_memberships
where user_id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
)
or account_id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from accounts
where id in (
  '25000000-0000-4000-8000-000000000001',
  '25000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '15000000-0000-4000-8000-000000000001',
  '15000000-0000-4000-8000-000000000002'
);

drop function if exists public.invoices_post_rls_snapshot(text);
drop function if exists public.invoices_post_rls_client_id(text);
