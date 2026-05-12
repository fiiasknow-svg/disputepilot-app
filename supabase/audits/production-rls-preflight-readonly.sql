with
row_counts as (
  select 'statuses' as table_name, count(*)::bigint as total_rows, count(*) filter (where account_id is null)::bigint as null_account_id_rows from public.statuses
  union all select 'employees', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.employees
  union all select 'leads', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.leads
  union all select 'clients', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.clients
  union all select 'invoices', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.invoices
  union all select 'disputes', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.disputes
  union all select 'calendar_events', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.calendar_events
  union all select 'dispute_letters', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.dispute_letters
  union all select 'affiliates', count(*)::bigint, count(*) filter (where account_id is null)::bigint from public.affiliates
),
orphan_counts as (
  select
    'invoices' as table_name,
    'client_id_missing_client' as check_name,
    count(*)::bigint as finding_count
  from public.invoices i
  left join public.clients c on c.id = i.client_id
  where i.client_id is not null
    and c.id is null
  union all
  select
    'disputes',
    'client_id_missing_client',
    count(*)::bigint
  from public.disputes d
  left join public.clients c on c.id = d.client_id
  where d.client_id is not null
    and c.id is null
  union all
  select
    'calendar_events',
    'client_id_missing_client',
    count(*)::bigint
  from public.calendar_events ce
  left join public.clients c on c.id = ce.client_id
  where ce.client_id is not null
    and c.id is null
  union all
  select
    'dispute_letters',
    'dispute_id_missing_dispute',
    count(*)::bigint
  from public.dispute_letters dl
  left join public.disputes d on d.id = dl.dispute_id
  where dl.dispute_id is not null
    and d.id is null
),
mismatch_counts as (
  select
    'invoices' as table_name,
    'account_id_differs_from_client' as check_name,
    count(*)::bigint as finding_count
  from public.invoices i
  join public.clients c on c.id = i.client_id
  where i.client_id is not null
    and i.account_id is distinct from c.account_id
  union all
  select
    'disputes',
    'account_id_differs_from_client',
    count(*)::bigint
  from public.disputes d
  join public.clients c on c.id = d.client_id
  where d.client_id is not null
    and d.account_id is distinct from c.account_id
  union all
  select
    'calendar_events',
    'account_id_differs_from_client',
    count(*)::bigint
  from public.calendar_events ce
  join public.clients c on c.id = ce.client_id
  where ce.client_id is not null
    and ce.account_id is distinct from c.account_id
  union all
  select
    'dispute_letters',
    'account_id_differs_from_dispute',
    count(*)::bigint
  from public.dispute_letters dl
  join public.disputes d on d.id = dl.dispute_id
  where dl.dispute_id is not null
    and dl.account_id is distinct from d.account_id
),
membership_counts as (
  select
    'accounts' as table_name,
    'accounts_without_memberships' as check_name,
    count(*)::bigint as finding_count
  from public.accounts a
  left join public.account_memberships am on am.account_id = a.id
  where am.account_id is null
  union all
  select
    'account_memberships',
    'memberships_missing_account',
    count(*)::bigint
  from public.account_memberships am
  left join public.accounts a on a.id = am.account_id
  where a.id is null
  union all
  select
    'account_memberships',
    'users_with_multiple_accounts',
    count(*)::bigint
  from (
    select am.user_id
    from public.account_memberships am
    group by am.user_id
    having count(distinct am.account_id) > 1
  ) multiple_account_users
),
combined_results as (
  select
    'row_counts' as audit_category,
    rc.table_name,
    'total_rows' as check_name,
    rc.total_rows as finding_count,
    'info' as severity,
    false as blocks_rls,
    'Inventory count for production preflight.' as notes
  from row_counts rc
  union all
  select
    'null_account_id',
    rc.table_name,
    'null_account_id_rows',
    rc.null_account_id_rows,
    case when rc.null_account_id_rows = 0 then 'pass' else 'blocker' end,
    rc.null_account_id_rows > 0,
    'Rows with null account_id will be hidden by account-membership RLS unless intentionally documented.'
  from row_counts rc
  union all
  select
    'orphan_parent_relationships',
    oc.table_name,
    oc.check_name,
    oc.finding_count,
    case when oc.finding_count = 0 then 'pass' else 'blocker' end,
    oc.finding_count > 0,
    'Parent reference points to a missing row and must be repaired or intentionally archived before production RLS.'
  from orphan_counts oc
  union all
  select
    'cross_account_mismatches',
    mc.table_name,
    mc.check_name,
    mc.finding_count,
    case when mc.finding_count = 0 then 'pass' else 'blocker' end,
    mc.finding_count > 0,
    'Child row account_id does not match its parent account_id and must be repaired before production RLS.'
  from mismatch_counts mc
  union all
  select
    'account_membership_coverage',
    ac.table_name,
    ac.check_name,
    ac.finding_count,
    case
      when ac.finding_count = 0 then 'pass'
      when ac.check_name = 'users_with_multiple_accounts' then 'review'
      else 'blocker'
    end,
    ac.finding_count > 0 and ac.check_name <> 'users_with_multiple_accounts',
    case
      when ac.check_name = 'users_with_multiple_accounts' then 'Review whether multi-account membership is expected for these users.'
      when ac.check_name = 'accounts_without_memberships' then 'Accounts without members may become inaccessible through membership-based policies unless intentionally inactive.'
      else 'Membership references a missing account and must be repaired before production RLS.'
    end
  from membership_counts ac
)
select
  audit_category,
  table_name,
  check_name,
  finding_count,
  severity,
  blocks_rls,
  notes
from combined_results
order by
  case audit_category
    when 'row_counts' then 1
    when 'null_account_id' then 2
    when 'orphan_parent_relationships' then 3
    when 'cross_account_mismatches' then 4
    when 'account_membership_coverage' then 5
    else 99
  end,
  table_name,
  check_name;
