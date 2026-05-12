-- Phase 3 account foundation read policies.
--
-- These policies let authenticated users read only their own membership rows
-- and the account records for accounts where they are members. Account-scoped
-- app pages use this read path to resolve the current user's account_id before
-- writing protected tenant rows such as employees.

grant select on public.account_memberships to authenticated;
grant select on public.accounts to authenticated;

drop policy if exists account_memberships_select_own on public.account_memberships;
create policy account_memberships_select_own
on public.account_memberships
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists accounts_select_member_accounts on public.accounts;
create policy accounts_select_member_accounts
on public.accounts
for select
to authenticated
using (
  exists (
    select 1
    from public.account_memberships am
    where am.account_id = accounts.id
      and am.user_id = auth.uid()
  )
);
