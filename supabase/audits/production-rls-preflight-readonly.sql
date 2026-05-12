select
  'row_counts_and_null_account_id' as audit_category,
  'statuses' as table_name,
  count(*) as total_rows,
  count(*) filter (where account_id is null) as null_account_id_rows
from public.statuses
union all
select
  'row_counts_and_null_account_id',
  'employees',
  count(*),
  count(*) filter (where account_id is null)
from public.employees
union all
select
  'row_counts_and_null_account_id',
  'leads',
  count(*),
  count(*) filter (where account_id is null)
from public.leads
union all
select
  'row_counts_and_null_account_id',
  'clients',
  count(*),
  count(*) filter (where account_id is null)
from public.clients
union all
select
  'row_counts_and_null_account_id',
  'invoices',
  count(*),
  count(*) filter (where account_id is null)
from public.invoices
union all
select
  'row_counts_and_null_account_id',
  'disputes',
  count(*),
  count(*) filter (where account_id is null)
from public.disputes
union all
select
  'row_counts_and_null_account_id',
  'calendar_events',
  count(*),
  count(*) filter (where account_id is null)
from public.calendar_events
union all
select
  'row_counts_and_null_account_id',
  'dispute_letters',
  count(*),
  count(*) filter (where account_id is null)
from public.dispute_letters
union all
select
  'row_counts_and_null_account_id',
  'affiliates',
  count(*),
  count(*) filter (where account_id is null)
from public.affiliates
order by table_name;

select
  'invoices_client_missing' as audit_category,
  count(*) as finding_count
from public.invoices i
left join public.clients c on c.id = i.client_id
where i.client_id is not null
  and c.id is null;

select
  'disputes_client_missing' as audit_category,
  count(*) as finding_count
from public.disputes d
left join public.clients c on c.id = d.client_id
where d.client_id is not null
  and c.id is null;

select
  'calendar_events_client_column_exists' as audit_category,
  count(*) as matching_columns
from information_schema.columns
where table_schema = 'public'
  and table_name = 'calendar_events'
  and column_name = 'client_id';

select
  'calendar_events_client_missing' as audit_category,
  count(*) as finding_count
from public.calendar_events ce
left join public.clients c on c.id = ce.client_id
where ce.client_id is not null
  and c.id is null;

select
  'dispute_letters_dispute_missing' as audit_category,
  count(*) as finding_count
from public.dispute_letters dl
left join public.disputes d on d.id = dl.dispute_id
where dl.dispute_id is not null
  and d.id is null;

select
  'invoices_client_account_mismatch' as audit_category,
  count(*) as finding_count
from public.invoices i
join public.clients c on c.id = i.client_id
where i.client_id is not null
  and i.account_id is distinct from c.account_id;

select
  'disputes_client_account_mismatch' as audit_category,
  count(*) as finding_count
from public.disputes d
join public.clients c on c.id = d.client_id
where d.client_id is not null
  and d.account_id is distinct from c.account_id;

select
  'calendar_events_client_account_mismatch' as audit_category,
  count(*) as finding_count
from public.calendar_events ce
join public.clients c on c.id = ce.client_id
where ce.client_id is not null
  and ce.account_id is distinct from c.account_id;

select
  'dispute_letters_dispute_account_mismatch' as audit_category,
  count(*) as finding_count
from public.dispute_letters dl
join public.disputes d on d.id = dl.dispute_id
where dl.dispute_id is not null
  and dl.account_id is distinct from d.account_id;

select
  'accounts_without_memberships' as audit_category,
  count(*) as finding_count
from public.accounts a
left join public.account_memberships am on am.account_id = a.id
where am.account_id is null;

select
  'memberships_missing_account' as audit_category,
  count(*) as finding_count
from public.account_memberships am
left join public.accounts a on a.id = am.account_id
where a.id is null;

select
  'users_with_multiple_accounts' as audit_category,
  am.user_id,
  count(distinct am.account_id) as account_count
from public.account_memberships am
group by am.user_id
having count(distinct am.account_id) > 1
order by account_count desc, am.user_id;

select
  'invoices_client_missing_samples' as audit_category,
  i.id,
  i.account_id,
  i.client_id
from public.invoices i
left join public.clients c on c.id = i.client_id
where i.client_id is not null
  and c.id is null
order by i.id
limit 50;

select
  'disputes_client_missing_samples' as audit_category,
  d.id,
  d.account_id,
  d.client_id
from public.disputes d
left join public.clients c on c.id = d.client_id
where d.client_id is not null
  and c.id is null
order by d.id
limit 50;

select
  'calendar_events_client_missing_samples' as audit_category,
  ce.id,
  ce.account_id,
  ce.client_id
from public.calendar_events ce
left join public.clients c on c.id = ce.client_id
where ce.client_id is not null
  and c.id is null
order by ce.id
limit 50;

select
  'dispute_letters_dispute_missing_samples' as audit_category,
  dl.id,
  dl.account_id,
  dl.dispute_id
from public.dispute_letters dl
left join public.disputes d on d.id = dl.dispute_id
where dl.dispute_id is not null
  and d.id is null
order by dl.id
limit 50;

select
  'invoices_client_account_mismatch_samples' as audit_category,
  i.id,
  i.account_id,
  i.client_id,
  c.account_id as client_account_id
from public.invoices i
join public.clients c on c.id = i.client_id
where i.client_id is not null
  and i.account_id is distinct from c.account_id
order by i.id
limit 50;

select
  'disputes_client_account_mismatch_samples' as audit_category,
  d.id,
  d.account_id,
  d.client_id,
  c.account_id as client_account_id
from public.disputes d
join public.clients c on c.id = d.client_id
where d.client_id is not null
  and d.account_id is distinct from c.account_id
order by d.id
limit 50;

select
  'calendar_events_client_account_mismatch_samples' as audit_category,
  ce.id,
  ce.account_id,
  ce.client_id,
  c.account_id as client_account_id
from public.calendar_events ce
join public.clients c on c.id = ce.client_id
where ce.client_id is not null
  and ce.account_id is distinct from c.account_id
order by ce.id
limit 50;

select
  'dispute_letters_dispute_account_mismatch_samples' as audit_category,
  dl.id,
  dl.account_id,
  dl.dispute_id,
  d.account_id as dispute_account_id
from public.dispute_letters dl
join public.disputes d on d.id = dl.dispute_id
where dl.dispute_id is not null
  and dl.account_id is distinct from d.account_id
order by dl.id
limit 50;

select
  'accounts_without_memberships_samples' as audit_category,
  a.id,
  a.name
from public.accounts a
left join public.account_memberships am on am.account_id = a.id
where am.account_id is null
order by a.id
limit 50;

select
  'memberships_missing_account_samples' as audit_category,
  am.account_id,
  am.user_id,
  am.role
from public.account_memberships am
left join public.accounts a on a.id = am.account_id
where a.id is null
order by am.account_id, am.user_id
limit 50;
