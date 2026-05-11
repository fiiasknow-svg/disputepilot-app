-- Phase 3 statuses RLS apply migration.
--
-- This migration enables RLS on statuses only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/statuses-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for statuses.
-- - the post-RLS block in that readiness script passes in the disposable DB.
-- - null statuses.account_id rows have been audited and intentionally handled.

drop policy if exists "statuses_delete_account_members" on statuses;
drop policy if exists "statuses_update_account_members" on statuses;
drop policy if exists "statuses_insert_account_members" on statuses;
drop policy if exists "statuses_select_account_members" on statuses;

alter table statuses enable row level security;

grant select, insert, update, delete on public.statuses to authenticated;

do $$
begin
  if to_regclass('public.statuses_id_seq') is not null then
    execute 'grant usage, select on sequence public.statuses_id_seq to authenticated';
  end if;
end $$;

create or replace function public.statuses_has_membership(
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

revoke all on function public.statuses_has_membership(uuid, text[]) from public;
grant execute on function public.statuses_has_membership(uuid, text[]) to authenticated;

create policy "statuses_select_account_members"
on statuses
for select
to authenticated
using (
  public.statuses_has_membership(account_id)
);

create policy "statuses_insert_account_members"
on statuses
for insert
to authenticated
with check (
  public.statuses_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "statuses_update_account_members"
on statuses
for update
to authenticated
using (
  public.statuses_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.statuses_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "statuses_delete_account_members"
on statuses
for delete
to authenticated
using (
  public.statuses_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable statuses RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table statuses disable row level security;
-- Do not run rollback casually in production.
