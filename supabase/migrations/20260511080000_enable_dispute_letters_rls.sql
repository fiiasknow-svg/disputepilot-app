-- Phase 3 dispute_letters RLS apply migration.
--
-- This migration enables RLS on dispute_letters only.
-- It must be tested in the disposable Supabase database before any
-- production use.
-- Do not apply until:
-- - supabase/tests/dispute-letters-two-account-rls-readiness.sql passes in a
--   disposable database with RLS enabled for dispute_letters.
-- - supabase/tests/dispute-letters-post-rls-verification.sql passes in the
--   disposable database after this migration is applied.
-- - null dispute_letters.account_id rows have been audited and intentionally
--   handled.
-- - dispute_letters with dispute_id have been audited so the parent dispute
--   account matches dispute_letters.account_id.
-- - letters, documents, templates, portal letter access, and other child paths
--   are handled separately.

drop policy if exists "dispute_letters_delete_account_members" on dispute_letters;
drop policy if exists "dispute_letters_update_account_members" on dispute_letters;
drop policy if exists "dispute_letters_insert_account_members" on dispute_letters;
drop policy if exists "dispute_letters_select_account_members" on dispute_letters;

alter table dispute_letters enable row level security;

grant select, insert, update, delete on public.dispute_letters to authenticated;

do $$
begin
  if to_regclass('public.dispute_letters_id_seq') is not null then
    execute 'grant usage, select on sequence public.dispute_letters_id_seq to authenticated';
  end if;
end $$;

create or replace function public.dispute_letters_has_membership(
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

create or replace function public.dispute_letters_dispute_matches_account(
  p_dispute_id bigint,
  p_account_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_dispute_id is null
    or exists (
      select 1
      from public.disputes d
      where d.id = p_dispute_id
        and d.account_id = p_account_id
    );
$$;

revoke all on function public.dispute_letters_has_membership(uuid, text[]) from public;
revoke all on function public.dispute_letters_dispute_matches_account(bigint, uuid) from public;
grant execute on function public.dispute_letters_has_membership(uuid, text[]) to authenticated;
grant execute on function public.dispute_letters_dispute_matches_account(bigint, uuid) to authenticated;

create policy "dispute_letters_select_account_members"
on dispute_letters
for select
to authenticated
using (
  public.dispute_letters_has_membership(account_id)
);

create policy "dispute_letters_insert_account_members"
on dispute_letters
for insert
to authenticated
with check (
  public.dispute_letters_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.dispute_letters_dispute_matches_account(dispute_id, account_id)
);

create policy "dispute_letters_update_account_members"
on dispute_letters
for update
to authenticated
using (
  public.dispute_letters_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
)
with check (
  public.dispute_letters_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
  and public.dispute_letters_dispute_matches_account(dispute_id, account_id)
);

create policy "dispute_letters_delete_account_members"
on dispute_letters
for delete
to authenticated
using (
  public.dispute_letters_has_membership(account_id, array['owner', 'admin', 'manager', 'member'])
);

-- Rollback notes:
-- In a disposable database, you can disable dispute_letters RLS and remove the
-- policies with the DROP POLICY statements above, then:
-- alter table dispute_letters disable row level security;
-- Do not run rollback casually in production.
