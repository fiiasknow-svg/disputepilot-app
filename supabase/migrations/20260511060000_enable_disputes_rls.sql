-- Phase 3 disputes RLS apply migration.
--
-- This migration enables RLS on disputes only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/disputes-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for disputes.
-- - supabase/tests/disputes-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null disputes.account_id rows have been audited and intentionally handled.
-- - disputes.account_id has been audited as the production tenant boundary.
-- - disputes with client_id have been audited when disputes.client_id and
--   clients.id are schema-compatible. Production attempts have observed
--   clients.id as uuid while disputes.client_id appears to be bigint, so this
--   migration provides overloads for safe cases and must not assume
--   incompatible columns can be compared.
-- - dispute_letters, letters/documents, calendar_events, and portal dispute
--   access are handled separately.

drop policy if exists "disputes_delete_account_members" on disputes;
drop policy if exists "disputes_update_account_members" on disputes;
drop policy if exists "disputes_insert_account_members" on disputes;
drop policy if exists "disputes_select_account_members" on disputes;

alter table disputes enable row level security;

grant select, insert, update, delete on public.disputes to authenticated;

do $$
begin
  if to_regclass('public.disputes_id_seq') is not null then
    execute 'grant usage, select on sequence public.disputes_id_seq to authenticated';
  end if;
end $$;

create or replace function public.disputes_has_membership(
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

create or replace function public.disputes_client_matches_account(
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
  v_disputes_client_id_type oid;
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
  into v_disputes_client_id_type
  from pg_attribute a
  where a.attrelid = 'public.disputes'::regclass
    and a.attname = 'client_id'
    and not a.attisdropped;

  -- Some disposable/legacy schemas use bigint clients.id and bigint
  -- disputes.client_id. Validate only in that shape; otherwise account_id
  -- remains the tenant boundary for this overload.
  if v_clients_id_type is distinct from v_disputes_client_id_type
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

create or replace function public.disputes_client_matches_account(
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

  -- Some production schemas resolve disputes.client_id as uuid in the policy
  -- expression. Only compare to clients.id when clients.id is also uuid.
  if v_clients_id_type is distinct from 'uuid'::regtype then
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

create or replace function public.disputes_client_account_validation_supported()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select clients_id.atttypid = disputes_client_id.atttypid
      and clients_id.atttypid in ('bigint'::regtype, 'uuid'::regtype)
    from pg_attribute clients_id
    cross join pg_attribute disputes_client_id
    where clients_id.attrelid = 'public.clients'::regclass
      and clients_id.attname = 'id'
      and not clients_id.attisdropped
      and disputes_client_id.attrelid = 'public.disputes'::regclass
      and disputes_client_id.attname = 'client_id'
      and not disputes_client_id.attisdropped
  ), false);
$$;

revoke all on function public.disputes_has_membership(uuid, text[]) from public;
revoke all on function public.disputes_client_matches_account(bigint, uuid) from public;
revoke all on function public.disputes_client_matches_account(uuid, uuid) from public;
revoke all on function public.disputes_client_account_validation_supported() from public;
grant execute on function public.disputes_has_membership(uuid, text[]) to authenticated;
grant execute on function public.disputes_client_matches_account(bigint, uuid) to authenticated;
grant execute on function public.disputes_client_matches_account(uuid, uuid) to authenticated;
grant execute on function public.disputes_client_account_validation_supported() to authenticated;

create policy "disputes_select_account_members"
on disputes
for select
to authenticated
using (
  public.disputes_has_membership(account_id)
);

create policy "disputes_insert_account_members"
on disputes
for insert
to authenticated
with check (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.disputes_client_matches_account(client_id, account_id)
);

create policy "disputes_update_account_members"
on disputes
for update
to authenticated
using (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.disputes_client_matches_account(client_id, account_id)
);

create policy "disputes_delete_account_members"
on disputes
for delete
to authenticated
using (
  public.disputes_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable disputes RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table disputes disable row level security;
-- Do not run rollback casually in production.
