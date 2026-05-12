-- Phase 3 calendar_events RLS apply migration.
--
-- This migration enables RLS on calendar_events only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/calendar-events-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for calendar_events.
-- - supabase/tests/calendar-events-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null calendar_events.account_id rows have been audited and intentionally
--   handled.
-- - calendar_events with client_id have been audited so the client account
--   matches calendar_events.account_id.
-- - clients, invoices, disputes, dispute_letters, portal calendar access, and
--   other child paths are handled separately.

drop policy if exists "calendar_events_delete_account_members" on calendar_events;
drop policy if exists "calendar_events_update_account_members" on calendar_events;
drop policy if exists "calendar_events_insert_account_members" on calendar_events;
drop policy if exists "calendar_events_select_account_members" on calendar_events;

alter table calendar_events enable row level security;

grant select, insert, update, delete on public.calendar_events to authenticated;

do $$
begin
  if to_regclass('public.calendar_events_id_seq') is not null then
    execute 'grant usage, select on sequence public.calendar_events_id_seq to authenticated';
  end if;
end $$;

create or replace function public.calendar_events_has_membership(
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

create or replace function public.calendar_events_client_matches_account(
  p_client_id bigint,
  p_account_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_client_id is null
    or exists (
      select 1
      from public.clients c
      where c.id = p_client_id
        and c.account_id = p_account_id
    );
$$;

revoke all on function public.calendar_events_has_membership(uuid, text[]) from public;
revoke all on function public.calendar_events_client_matches_account(bigint, uuid) from public;
grant execute on function public.calendar_events_has_membership(uuid, text[]) to authenticated;
grant execute on function public.calendar_events_client_matches_account(bigint, uuid) to authenticated;

create policy "calendar_events_select_account_members"
on calendar_events
for select
to authenticated
using (
  public.calendar_events_has_membership(account_id)
);

create policy "calendar_events_insert_account_members"
on calendar_events
for insert
to authenticated
with check (
  public.calendar_events_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.calendar_events_client_matches_account(client_id, account_id)
);

create policy "calendar_events_update_account_members"
on calendar_events
for update
to authenticated
using (
  public.calendar_events_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.calendar_events_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.calendar_events_client_matches_account(client_id, account_id)
);

create policy "calendar_events_delete_account_members"
on calendar_events
for delete
to authenticated
using (
  public.calendar_events_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable calendar_events RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table calendar_events disable row level security;
-- Do not run rollback casually in production.
