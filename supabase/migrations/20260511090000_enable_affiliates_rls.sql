-- Phase 3 affiliates RLS apply migration.
--
-- This migration enables RLS on affiliates only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/affiliates-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for affiliates.
-- - supabase/tests/affiliates-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null affiliates.account_id rows have been audited and intentionally
--   handled.
-- - affiliate write-role semantics are confirmed for production.

drop policy if exists "affiliates_delete_account_members" on affiliates;
drop policy if exists "affiliates_update_account_members" on affiliates;
drop policy if exists "affiliates_insert_account_members" on affiliates;
drop policy if exists "affiliates_select_account_members" on affiliates;

alter table affiliates enable row level security;

grant select, insert, update, delete on public.affiliates to authenticated;

do $$
begin
  if to_regclass('public.affiliates_id_seq') is not null then
    execute 'grant usage, select on sequence public.affiliates_id_seq to authenticated';
  end if;
end $$;

create or replace function public.affiliates_has_membership(
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

revoke all on function public.affiliates_has_membership(uuid, text[]) from public;
grant execute on function public.affiliates_has_membership(uuid, text[]) to authenticated;

create policy "affiliates_select_account_members"
on affiliates
for select
to authenticated
using (
  public.affiliates_has_membership(account_id)
);

create policy "affiliates_insert_account_members"
on affiliates
for insert
to authenticated
with check (
  public.affiliates_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "affiliates_update_account_members"
on affiliates
for update
to authenticated
using (
  public.affiliates_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.affiliates_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

create policy "affiliates_delete_account_members"
on affiliates
for delete
to authenticated
using (
  public.affiliates_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable affiliates RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table affiliates disable row level security;
-- Do not run rollback casually in production.
