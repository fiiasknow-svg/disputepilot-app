-- Phase 3 invoices RLS apply migration.
--
-- This migration enables RLS on invoices only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/invoices-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for invoices.
-- - supabase/tests/invoices-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null invoices.account_id rows have been audited and intentionally handled.
-- - invoices.account_id has been audited as the production tenant boundary.
-- - invoices with client_id have been audited when invoices.client_id and
--   clients.id are schema-compatible. Production attempts have observed
--   client_id resolving as both bigint and uuid across environments, so this
--   migration provides overloads for both safe cases and must not assume
--   incompatible columns can be compared.
-- - payments, services/products, and portal invoice access are handled
--   separately.

drop policy if exists "invoices_delete_account_members" on invoices;
drop policy if exists "invoices_update_account_members" on invoices;
drop policy if exists "invoices_insert_account_members" on invoices;
drop policy if exists "invoices_select_account_members" on invoices;

alter table invoices enable row level security;

grant select, insert, update, delete on public.invoices to authenticated;

do $$
begin
  if to_regclass('public.invoices_id_seq') is not null then
    execute 'grant usage, select on sequence public.invoices_id_seq to authenticated';
  end if;
end $$;

create or replace function public.invoices_has_membership(
  p_account_id uuid,
  p_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.account_memberships am
    where am.account_id = p_account_id
      and am.user_id = auth.uid()
      and (
        p_roles is null
        or am.role = any(p_roles)
      )
  );
$$;

create or replace function public.invoices_client_matches_account(
  p_client_id bigint,
  p_account_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clients_id_type oid;
  v_invoices_client_id_type oid;
  v_matches boolean;
begin
  if p_client_id is null then
    return true;
  end if;

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

  -- Some disposable/legacy schemas use bigint clients.id and bigint
  -- invoices.client_id. Validate only in that shape; otherwise account_id
  -- remains the tenant boundary for this overload.
  if v_clients_id_type is distinct from v_invoices_client_id_type
    or v_clients_id_type is distinct from 'bigint'::regtype
  then
    return true;
  end if;

  execute
    'select exists (
       select 1
       from public.clients c
       where c.id = $1
         and c.account_id = $2
     )'
  into v_matches
  using p_client_id, p_account_id;

  return coalesce(v_matches, false);
end;
$$;

create or replace function public.invoices_client_matches_account(
  p_client_id uuid,
  p_account_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_clients_id_type oid;
  v_matches boolean;
begin
  if p_client_id is null then
    return true;
  end if;

  select a.atttypid
  into v_clients_id_type
  from pg_attribute a
  where a.attrelid = 'public.clients'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  -- Production currently resolves invoices.client_id as uuid in the policy
  -- expression. Only compare to clients.id when clients.id is also uuid.
  if v_clients_id_type is distinct from 'uuid'::regtype then
    return false;
  end if;

  execute
    'select exists (
       select 1
       from public.clients c
       where c.id = $1
         and c.account_id = $2
     )'
  into v_matches
  using p_client_id, p_account_id;

  return coalesce(v_matches, false);
end;
$$;

create or replace function public.invoices_client_account_validation_supported()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select clients_id.atttypid = invoices_client_id.atttypid
      and clients_id.atttypid in ('bigint'::regtype, 'uuid'::regtype)
    from pg_attribute clients_id
    cross join pg_attribute invoices_client_id
    where clients_id.attrelid = 'public.clients'::regclass
      and clients_id.attname = 'id'
      and not clients_id.attisdropped
      and invoices_client_id.attrelid = 'public.invoices'::regclass
      and invoices_client_id.attname = 'client_id'
      and not invoices_client_id.attisdropped
  ), false);
$$;

revoke all on function public.invoices_has_membership(uuid, text[]) from public;
revoke all on function public.invoices_client_matches_account(bigint, uuid) from public;
revoke all on function public.invoices_client_matches_account(uuid, uuid) from public;
revoke all on function public.invoices_client_account_validation_supported() from public;
grant execute on function public.invoices_has_membership(uuid, text[]) to authenticated;
grant execute on function public.invoices_client_matches_account(bigint, uuid) to authenticated;
grant execute on function public.invoices_client_matches_account(uuid, uuid) to authenticated;
grant execute on function public.invoices_client_account_validation_supported() to authenticated;

create policy "invoices_select_account_members"
on invoices
for select
to authenticated
using (
  public.invoices_has_membership(account_id)
);

create policy "invoices_insert_account_members"
on invoices
for insert
to authenticated
with check (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_update_account_members"
on invoices
for update
to authenticated
using (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.invoices_client_matches_account(client_id, account_id)
);

create policy "invoices_delete_account_members"
on invoices
for delete
to authenticated
using (
  public.invoices_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable invoices RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table invoices disable row level security;
-- Do not run rollback casually in production.
