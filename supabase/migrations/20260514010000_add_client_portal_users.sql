-- Phase 4 client portal identity mapping foundation.
--
-- Staged schema only:
-- - Do not apply to production until public.clients.id type has been verified.
-- - Do not enable RLS here.
-- - Do not wire the app to this table yet.
-- - Portal-specific RLS and server-side portal context belong in later,
--   separately verified migrations/code changes.

create extension if not exists pgcrypto;

do $$
declare
  v_clients_id_type text;
begin
  if to_regclass('public.accounts') is null then
    raise exception 'public.accounts must exist before creating public.client_portal_users';
  end if;

  if to_regclass('public.clients') is null then
    raise exception 'public.clients must exist before creating public.client_portal_users';
  end if;

  select format_type(a.atttypid, a.atttypmod)
  into v_clients_id_type
  from pg_attribute a
  where a.attrelid = 'public.clients'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  if v_clients_id_type is null then
    raise exception 'public.clients.id must exist before creating public.client_portal_users';
  end if;

  execute format($ddl$
    create table if not exists public.client_portal_users (
      id uuid primary key default gen_random_uuid(),
      account_id uuid not null references public.accounts(id) on delete cascade,
      client_id %s not null references public.clients(id) on delete cascade,
      user_id uuid not null references auth.users(id) on delete cascade,
      status text not null default 'active',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  $ddl$, v_clients_id_type);
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.client_portal_users'::regclass
      and conname = 'client_portal_users_status_check'
  ) then
    alter table public.client_portal_users
      add constraint client_portal_users_status_check
      check (status in ('active', 'disabled', 'invited', 'revoked'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.client_portal_users'::regclass
      and conname = 'client_portal_users_account_client_user_unique'
  ) then
    alter table public.client_portal_users
      add constraint client_portal_users_account_client_user_unique
      unique (account_id, client_id, user_id);
  end if;
end $$;

create index if not exists client_portal_users_user_id_idx
  on public.client_portal_users(user_id);

create index if not exists client_portal_users_account_id_idx
  on public.client_portal_users(account_id);

create index if not exists client_portal_users_client_id_idx
  on public.client_portal_users(client_id);

create index if not exists client_portal_users_account_client_idx
  on public.client_portal_users(account_id, client_id);

comment on table public.client_portal_users is
  'Staged Phase 4 mapping from Supabase Auth customer users to client records. RLS and app wiring are intentionally deferred until disposable verification and production schema audit pass.';

comment on column public.client_portal_users.account_id is
  'Business tenant that owns the mapped client. This must match clients.account_id for portal access.';

comment on column public.client_portal_users.client_id is
  'Client row visible to the mapped portal user. This column is created with the same data type as public.clients.id in the target database.';

comment on column public.client_portal_users.user_id is
  'Supabase Auth user for the customer portal identity. Do not add customer portal users to account_memberships as a shortcut.';

comment on column public.client_portal_users.status is
  'Portal mapping state. Later RLS should authorize only active mappings.';
