# Phase 3 Data Ownership and RLS Preparation Plan

Date: 2026-05-06

## Current Git State

- `git status --short` before this document was added showed existing uncommitted API-auth work:
  - `M app/api/analyze-credit/route.ts`
  - `M app/api/rewrite-letter/route.ts`
  - `M app/api/send-email/route.ts`
  - `M tests/auth-foundation.spec.ts`
  - `?? lib/api-auth.ts`
- `git log -9 --oneline`:
  - `8cdf153 Verify Supabase auth in route protection`
  - `d7d7b7c Consolidate browser Supabase client usage`
  - `aa64c9e Add Supabase SSR helper support`
  - `ff5b5ad Document auth and data isolation audit`
  - `24ef258 Fix CI safe behavior route failures`
  - `ebfa67b Fix Playwright specs to use local base URL`
  - `287756f Add route protection for private app pages`
  - `bb324a6 Add password reset support`
  - `c7b8f13 Add password reset support`

No schema, RLS, or runtime data access changes are included in this plan.

## Recommended Ownership Model

Use `account_id` as the canonical tenant ownership field for business-owned data.

Recommended core tables:

- `accounts`: one business/tenant per row.
- `account_memberships`: `account_id`, `user_id`, `role`, `status`; maps Supabase Auth business users to accounts.
- `client_portal_users`: `account_id`, `client_id`, `user_id`, `status`; maps Supabase Auth customer users to one or more client records.

Why `account_id`:

- It supports future multi-user businesses better than `user_id`.
- It cleanly separates the business tenant from individual employees.
- It allows customer portal users to be scoped to client records without giving them business-wide account access.

Use `created_by_user_id` and `updated_by_user_id` only for audit trails. They should not be the tenant boundary.

## RLS Policy Pattern

Business app tables should use this shape after `account_id` exists and is backfilled:

```sql
account_id in (
  select account_id
  from account_memberships
  where user_id = auth.uid()
    and status = 'active'
)
```

Customer portal policies should use a narrower shape:

```sql
exists (
  select 1
  from client_portal_users cpu
  where cpu.user_id = auth.uid()
    and cpu.account_id = <table>.account_id
    and cpu.client_id = <table>.client_id
    and cpu.status = 'active'
)
```

For child records with both `account_id` and a parent foreign key, policies should check `account_id` directly and add parent consistency checks with `with check` constraints or triggers.

## Tables and Record Types Found

| Table / record type | Read locations | Write locations | Ownership type | Relationship fields found | Missing ownership | Recommended owner | Backfill strategy | RLS policy shape | Frontend changes after owner exists |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `clients` | `app/clients/page.tsx`, `app/clients/[id]/page.tsx`, `app/calendar/page.tsx`, `app/reports/page.tsx`, `app/credit-analysis/page.tsx`, `app/billing/pay-per-deletion/page.tsx`, `app/billing/BillingWorkspace.tsx` | `app/clients/page.tsx`, `app/clients/[id]/page.tsx`, `app/leads/page.tsx` conversion | Business-owned; portal-visible subset | Referenced by `client_id` from disputes, invoices, calendar events | `account_id`; optional `created_by_user_id`; portal user mapping | `account_id` | Add default account for existing deployment; set every client to that account; later assign imported/demo rows during insert | Business CRUD by active account member; portal select only through `client_portal_users` and only permitted columns | Add owner on insert via server helper/RPC or authenticated default; scope selects by current account until RLS is enabled; remove local fallback merge once persisted records are reliable |
| `leads` | `app/leads/page.tsx`, `app/calendar/page.tsx`, `app/reports/page.tsx` | `app/leads/page.tsx` create/update/delete/import/status | Business-owned | Conversion writes a related `clients` row, but no FK is stored | `account_id`; optional `converted_client_id`; optional `created_by_user_id` | `account_id` | Backfill all leads to default account; for converted leads, optionally link by email/name to clients | Business members can CRUD leads in their account; no customer portal access | Include account ownership during insert; preserve owner when converting lead to client; scope lead calendar auto-events |
| `affiliates` | `app/leads/affiliates/page.tsx` | `app/leads/affiliates/page.tsx` create/delete | Business-owned or partner-owned, currently admin-managed | None found | `account_id`; optional future affiliate auth mapping | `account_id` | Backfill all existing affiliates to default account | Business members can CRUD affiliates for their account; no public anonymous read | Add owner on insert; scope list/delete by account |
| `disputes` | `app/clients/page.tsx`, `app/clients/[id]/page.tsx`, `app/disputes/status/page.tsx`, `app/disputes/[id]/page.tsx`, `app/bulk-print/page.tsx`, `app/calendar/page.tsx`, `app/reports/page.tsx` | `app/disputes/status/page.tsx`, `app/disputes/[id]/page.tsx`; `app/disputes/page.tsx` is static/local only | Business-owned; portal-visible subset | `client_id`; status/detail pages join `clients(...)`; fields include dispute status, bureau, round, account fields | `account_id`; optional `created_by_user_id` | `account_id` plus valid `client_id` within same account | Backfill from parent client when possible; otherwise default account and audit unmatched rows | Business members can CRUD by account; portal users select disputes where mapped to same `client_id`; writes business-only | Add owner on new disputes; scope list/detail/update queries; validate selected `client_id` belongs to account before insert/update |
| `dispute_letters` | `app/disputes/[id]/page.tsx` | No current Supabase writes found in inspected files | Business-owned; portal-visible if exposed later | `dispute_id` | `account_id`; optional `client_id`; optional `created_by_user_id` | `account_id` inherited from dispute | Backfill by joining `disputes`; fail/audit any orphan letters | Business members read/write by account; portal select only through dispute/client mapping | When letters are persisted, insert owner from parent dispute; never trust client-provided `account_id` |
| `invoices` | `app/clients/[id]/page.tsx`, `app/calendar/page.tsx`, `app/reports/page.tsx` | No current Supabase writes found; billing workspace is localStorage only | Business-owned; portal-visible subset | `client_id`; invoice reads include `invoice_number`, `amount`, `status`, `due_date` | `account_id`; optional `created_by_user_id` | `account_id` plus valid `client_id` | Backfill from parent client; default account for unmatched rows and audit | Business members CRUD by account; portal users select invoices for their `client_id` only | When billing is moved from localStorage to Supabase, write `client_id` and account ownership together; reports/calendar must query account-scoped invoices |
| Billing local records | `app/billing/BillingWorkspace.tsx` | `app/billing/BillingWorkspace.tsx` local invoice/payment/service CRUD | Browser-local only today | Client name string only, no durable FK | Needs persisted tables before RLS: likely `invoices`, `payments`, `services` with `account_id`; invoices/payments should reference `client_id` | `account_id` | Migrate local records only if product requires preserving browser-local demo data; otherwise start new persisted records per account | Same account membership pattern; portal invoices/payments by `client_id` mapping | Replace localStorage with account-scoped Supabase writes after schema exists; use client id instead of client display name |
| `calendar_events` | `app/calendar/page.tsx` | `app/calendar/page.tsx` create/update/delete | Business-owned; portal-visible only for client-specific events if later exposed | `client_id`; auto-events also read leads, invoices, disputes, clients | `account_id`; optional `created_by_user_id` | `account_id` plus nullable `client_id` | Backfill from `client_id` when present; otherwise default account | Business members CRUD by account; portal users select events only when `client_id` matches portal mapping and event type is portal-safe | Add owner on event insert; scope all auto-event source queries; decide which event types are portal-visible |
| `employees` | `app/employees/page.tsx` | `app/employees/page.tsx` create/update/delete/bulk status | Business-owned; should map to business users eventually | None found | `account_id`; optional `user_id` for invited employee auth identity | `account_id` | Backfill all employees to default account; later link rows to Supabase `user_id` when invites exist | Admin/manager account members can manage employees; normal employees read limited profile data | Add role/permission enforcement server-side before trusting UI role labels; include owner on insert |
| `statuses` | `app/settings/configuration/page.tsx` | `app/settings/configuration/page.tsx` create/delete | Business-owned configuration | `type` differentiates client/dispute status | `account_id` | `account_id` | Seed default statuses per account; backfill current rows to default account | Account members can read; admins/managers can write; optionally allow global defaults separately | Scope configuration reads; when account has no rows, copy defaults into account-owned rows |
| `reports` aggregate data | `app/reports/page.tsx` | None | Derived business-owned aggregates | Reads `clients`, `disputes`, `invoices`, `leads` | Depends on source tables | Source table `account_id` | No separate backfill unless persisted report snapshots are introduced | Use source table RLS or server-side account-scoped aggregate functions/views | Move aggregates behind server helpers or Supabase RPC/views once policies are in place; avoid client-side unscoped full-table reads |
| Credit analysis mock/tradeline records | `app/credit-analysis/page.tsx` | In-memory only; API route `app/api/analyze-credit/route.ts` protected separately | Mostly static/demo today; selected client is business-owned | Reads `clients.id`, `clients.full_name` | If persisted later, add `account_id`, `client_id` | `account_id` plus `client_id` | No backfill until a real credit report table exists | Business members by account; portal users only their own report rows if exposed | Define tables such as `credit_reports`, `tradelines`, `inquiries` before persistence; never store uploaded report data without owner |
| Company/settings pages | `app/company/*`, `app/settings/configuration/page.tsx` | Mostly local component state/static UI; `statuses` persists | Business-owned configuration | None beyond `statuses.type` | Future settings tables need `account_id` | `account_id` | Create account settings defaults per account | Account members read; admin/manager write | Persist settings only after owner model exists; keep current static UI behavior until then |
| Client portal auth/data | `app/client-login/page.tsx`, `components/ClientPortalLayout.tsx`; no real `app/portal` page found | Auth UI only today | Client-owned view into business-owned records | `clients.portal_access` appears in client forms, but no auth user mapping found | `client_portal_users.user_id`, `client_portal_users.client_id`, `account_id` | Portal mapping row, not raw business membership | Backfill only after matching customer auth users to client records; do not infer from email without confirmation | Portal users select only mapped client records and allowed child data; no business-wide tables | Build portal data surface server-first; never let customer login use business dashboard queries |
| API routes | `app/api/send-email/route.ts`, `app/api/analyze-credit/route.ts`, `app/api/rewrite-letter/route.ts` | Server side only | Sensitive business actions | No record ids currently required by APIs | Future audit/rate-limit tables need `account_id`; record-specific APIs need parent ownership validation | Verified user account from membership | No data backfill required for current API behavior | Require verified user and active account; validate any future `client_id`, `dispute_id`, `letter_id` against account | Keep API auth server-side; add account lookup helper before adding record-specific API payloads |

## Special Cases

- Demo/static fallbacks: `app/clients/page.tsx`, `app/disputes/page.tsx`, `app/billing/BillingWorkspace.tsx`, `app/credit-analysis/page.tsx`, `app/bulk-print/page.tsx`, and several company pages contain static/demo records. These are useful for empty-state tests but are not isolated tenant data.
- Browser localStorage: keys found include `disputepilot.clients`, `disputepilot.leads`, `disputepilot.calendar-events`, `disputepilot.billing`, `disputepilot.furnisher-addresses`, and `disputepilot.community.posts`. RLS cannot protect browser-local data. Treat these as demo/offline caches until explicitly migrated.
- Public pages: `/`, `/academy/*`, `/get-customers/*`, `/partner-resources/*`, and `/affiliates/*` should not depend on private account tables.
- Client portal: current customer login is only an auth entry point. Do not expose `clients`, `invoices`, `disputes`, documents, or messages until `client_portal_users` exists and portal-specific policies are tested.
- Reports: current reports read whole tables client-side. After ownership fields exist, reports should either rely on RLS-filtered reads or move to server/RPC aggregate endpoints.
- Billing invoice-client relationships: `invoices.client_id` is the important child relationship. Local billing data currently stores client display names, which is not sufficient for account isolation or durable joins.

## Migration Sequence Before Enabling RLS

Foundation added after this plan:

- `supabase/migrations/20260507010000_add_account_ownership_foundation.sql` creates only `accounts` and `account_memberships`.
- `lib/account-context.ts` can resolve the current verified user's first account membership on the server.
- No RLS policies were enabled.
- No `account_id` columns were added to existing app tables.
- No runtime data reads or writes were changed to use account scoping yet.

Statuses pilot added after the account foundation:

- `supabase/migrations/20260507013000_add_statuses_account_id.sql` adds nullable `statuses.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260507020000_backfill_statuses_account_id_single_account.sql` backfills unowned status rows only when the database has exactly one account. If there are zero accounts or multiple accounts, the migration updates no rows and leaves ambiguous `statuses.account_id` values null for manual review.
- RLS remains disabled for `statuses`.
- `statuses.account_id` remains nullable until existing rows are backfilled and runtime scoping is verified.
- `app/settings/configuration/page.tsx` now attempts to resolve the current user's account membership in the browser and reads account-scoped statuses when rows exist.
- If no Supabase session, no account membership, no account-scoped statuses, or missing Supabase config exists, the settings UI keeps the previous unscoped/fallback behavior.
- New custom status inserts include `account_id` only when an account membership can be safely resolved.
- Custom status deletes include both `id` and `account_id` when an account membership can be safely resolved. If no account is available, the UI preserves the previous fallback delete behavior until RLS policies can become authoritative.
- The visible settings workflow has Playwright coverage for page load, custom client status creation, custom client status deletion, and no app/runtime error without requiring real Supabase credentials. These tests exercise the no-credentials fallback path through the browser Supabase no-op client. Direct cross-account database isolation still needs Supabase-backed test data before RLS is enabled.
- `supabase/tests/statuses-two-account-rls-readiness.sql` documents the required two-account Supabase readiness check. It seeds two auth users, two accounts, memberships, and account-owned statuses in a disposable database; verifies the current pre-RLS scoped read, insert, and delete query shapes; documents expected future RLS behavior; and includes cleanup SQL.
- `supabase/policies/drafts/statuses-rls-policy-draft.sql` contains draft-only statuses RLS policies for review. It is not an active migration and does not enable RLS.
- First applyable RLS migration: `supabase/migrations/20260511010000_enable_statuses_rls.sql`. Test it in the disposable database first, then rerun `supabase/tests/statuses-two-account-rls-readiness.sql` with the post-RLS block enabled before any production apply.
- Rollback notes for the apply migration: in a disposable database, `drop policy if exists` for the four statuses policies and `alter table statuses disable row level security;`. Do not run rollback casually in production.

Statuses policy draft summary:

- SELECT allows authenticated users to read rows where `statuses.account_id` is in their `account_memberships`.
- INSERT allows authenticated users to create rows only for account ids in their `account_memberships`.
- UPDATE requires the existing row account and the updated row account to stay within the user's `account_memberships`.
- DELETE allows deleting only rows whose `account_id` is in the user's `account_memberships`.
- Anonymous users and authenticated users without membership should receive no access once RLS is enabled.
- Null `account_id` legacy rows are intentionally hidden by the draft policies and must be manually assigned or explicitly archived before apply if they should remain visible.
- Current default statuses are app-defined, not persisted database rows. If defaults become database rows, prefer account-owned copies rather than global null-account rows.
- `account_memberships` currently has `role` but no membership `status` column. The draft treats any membership as active and notes where to add `status = 'active'` if that column is introduced.

Employees pilot added after the statuses pilot:

- `supabase/migrations/20260507030000_add_employees_account_id.sql` adds nullable `employees.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260507033000_backfill_employees_account_id_single_account.sql` backfills unowned employee rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous employee rows null for manual review.
- RLS remains disabled for `employees`.
- `employees.account_id` remains nullable until existing rows are backfilled and runtime scoping is verified.
- `app/employees/page.tsx` now attempts to resolve the current user's account membership in the browser and reads account-scoped employees when rows exist.
- If no Supabase session, no account membership, no account-scoped employee rows, or missing Supabase config exists, the employees UI keeps the previous unscoped/fallback behavior.
- New employee inserts include `account_id` only when an account membership can be safely resolved.
- Employee updates, deletes, bulk deletes, and status updates include `account_id` constraints when an account membership can be safely resolved.
- `tests/employees-behavior.spec.ts` verifies the employees page loads, the add employee flow remains usable, optional edit/delete/status controls remain usable when rows exist, and no page exception or visible app/runtime error occurs without requiring real Supabase credentials.
- `supabase/tests/employees-two-account-rls-readiness.sql` documents the required two-account Supabase readiness check. It seeds two auth users, two accounts, memberships, and account-owned employees in a disposable database; verifies the current pre-RLS scoped read, insert, update, and delete query shapes; documents expected future RLS behavior; and includes cleanup SQL.
- `supabase/policies/drafts/employees-rls-policy-draft.sql` contains draft-only employees RLS policies for review. It is not an active migration and does not enable RLS.
- `supabase/migrations/20260511020000_enable_employees_rls.sql` is the first applyable employees RLS migration. It uses a SECURITY DEFINER helper for membership checks, grants authenticated privileges only on employees, and must be tested in a disposable database before production use.
- `supabase/tests/employees-post-rls-verification.sql` is the disposable-only authenticated verification script for employees RLS. It mirrors the statuses post-RLS helper pattern and must pass before any production apply.
- `supabase/migrations/20260511030000_enable_leads_rls.sql` is the next applyable leads RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses and employees, grants authenticated privileges only on leads, and must be tested in a disposable database before production use.
- `supabase/tests/leads-post-rls-verification.sql` is the disposable-only authenticated verification script for leads RLS. It mirrors the helper-based statuses and employees post-RLS pattern and must pass before any production apply.
- `supabase/migrations/20260511040000_enable_clients_rls.sql` is the next applyable clients RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses, employees, and leads, grants authenticated privileges only on clients, and must be tested in a disposable database before production use.
- `supabase/tests/clients-post-rls-verification.sql` is the disposable-only authenticated verification script for clients RLS. It mirrors the helper-based statuses, employees, and leads post-RLS pattern and must pass before any production apply.
- `supabase/migrations/20260511050000_enable_invoices_rls.sql` is the next applyable invoices RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses, employees, leads, and clients, grants authenticated privileges only on invoices, and adds invoice/client account-match validation for writes.
- `supabase/tests/invoices-post-rls-verification.sql` is the disposable-only authenticated verification script for invoices RLS. It verifies account isolation plus cross-account and cross-client write denials before any production apply.
- `supabase/migrations/20260511060000_enable_disputes_rls.sql` is the next applyable disputes RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses, employees, leads, clients, and invoices, grants authenticated privileges only on disputes, and adds dispute/client account-match validation for writes.
- `supabase/tests/disputes-post-rls-verification.sql` is the disposable-only authenticated verification script for disputes RLS. It verifies account isolation plus cross-account and cross-client write denials before any production apply.
- `supabase/migrations/20260511070000_enable_calendar_events_rls.sql` is the next applyable calendar_events RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses, employees, leads, clients, invoices, and disputes, grants authenticated privileges only on calendar_events, and adds calendar event/client account-match validation for writes.
- `supabase/tests/calendar-events-post-rls-verification.sql` is the disposable-only authenticated verification script for calendar_events RLS. It verifies account isolation plus cross-account and cross-client write denials before any production apply.
- `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql` is the next applyable dispute_letters RLS migration. It uses the same SECURITY DEFINER helper pattern as statuses, employees, leads, clients, invoices, disputes, and calendar_events, grants authenticated privileges only on dispute_letters, and adds dispute letter/parent dispute account-match validation for writes.
- `supabase/tests/dispute-letters-post-rls-verification.sql` is the disposable-only authenticated verification script for dispute_letters RLS. It verifies account isolation plus cross-account and cross-dispute write denials before any production apply.

Employees policy draft summary:

- SELECT allows authenticated users to read rows where `employees.account_id` is in their `account_memberships`.
- INSERT allows authenticated users to create rows only for account ids in their `account_memberships`.
- UPDATE requires the existing row account and the updated row account to stay within the user's `account_memberships`.
- DELETE allows deleting only rows whose `account_id` is in the user's `account_memberships`.
- Anonymous users and authenticated users without membership should receive no access once RLS is enabled.
- Null `account_id` legacy rows are intentionally hidden by the draft policies and must be manually assigned or explicitly archived before apply if they should remain visible.
- Employee row roles such as Admin and Manager are not database membership roles. Write policy role semantics must be finalized against `account_memberships.role` or a future permission table before applying RLS.
- `account_memberships` currently has `role` but no membership `status` column. The draft treats any membership as active and notes where to add `status = 'active'` if that column is introduced.

Manual employees coverage before RLS:

- Run `supabase/tests/employees-two-account-rls-readiness.sql` against a disposable Supabase database after applying the account foundation and employees migrations.
- After the employees RLS migration is applied in a disposable database, rerun `supabase/tests/employees-two-account-rls-readiness.sql` and `supabase/tests/employees-post-rls-verification.sql`.
- Confirm Account A-scoped reads return only Account A readiness employees and Account B-scoped reads return only Account B readiness employees.
- Confirm an Account A insert includes Account A ownership.
- Confirm an Account A-scoped update cannot update Account B's employee and can update Account A's inserted employee.
- Confirm an Account A-scoped delete cannot delete Account B's employee and can delete Account A's inserted employee.

Before making `employees.account_id` `NOT NULL`:

- Every existing employee row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- New employee inserts must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user who manages employees.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `employees` RLS:

- Draft policies allowing account members to read employee rows in their account.
- Decide write-role semantics before policy apply. UI roles such as Admin and Manager are employee record roles today, not database membership roles.
- Add write policies limited to confirmed account membership roles after role semantics are finalized.
- Confirm anon users and authenticated users without membership cannot read or mutate employees.
- Add Supabase-backed two-account tests or manual SQL verification for scoped read, insert, update, delete, bulk delete, bulk status update, and cross-account denial.
- Confirm all update/delete paths are protected by RLS policies before trusting client-provided employee ids.
- Run the future post-RLS block in `supabase/tests/employees-two-account-rls-readiness.sql` in a disposable database after applying draft policies.
- Review `supabase/policies/drafts/employees-rls-policy-draft.sql` and decide whether write policies should allow every member or only owner/admin/manager roles.
- Keep production apply blocked until the disposable authenticated post-RLS verifier passes.
- Confirm whether `account_memberships` needs a `status` column before policies are applied, then include active-membership checks if it exists.

## Leads RLS

- Migration path: `supabase/migrations/20260511030000_enable_leads_rls.sql`
- Post-RLS verification path: `supabase/tests/leads-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/leads-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Use the same helper-based authenticated-user pattern as statuses and employees so membership checks do not require direct `account_memberships` visibility.

## Clients RLS

- Migration path: `supabase/migrations/20260511040000_enable_clients_rls.sql`
- Post-RLS verification path: `supabase/tests/clients-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/clients-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Keep child-table ownership separate: invoices, disputes, calendar_events, dispute_letters, and any portal mappings still need their own ownership pilots and policies.

## Invoices RLS

- Migration path: `supabase/migrations/20260511050000_enable_invoices_rls.sql`
- Post-RLS verification path: `supabase/tests/invoices-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/invoices-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Keep related billing and portal tables separate: payments, services/products, payment history, and customer portal invoice access still need their own ownership and policy work before RLS is enabled for those paths.

## Disputes RLS

- Migration path: `supabase/migrations/20260511060000_enable_disputes_rls.sql`
- Post-RLS verification path: `supabase/tests/disputes-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/disputes-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Keep child dispute data separate: `dispute_letters`, persisted letters/documents, calendar events, and portal dispute access still need their own ownership and policy work. `dispute_letters` RLS remains required even after disputes RLS passes.

## Calendar Events RLS

- Migration path: `supabase/migrations/20260511070000_enable_calendar_events_rls.sql`
- Post-RLS verification path: `supabase/tests/calendar-events-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/calendar-events-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Calendar event writes also verify that any `client_id` belongs to the same `account_id` as the calendar event.
- Keep portal calendar access and future source-linked event columns separate until their own ownership and policy checks are defined.

## Dispute Letters RLS

- Migration path: `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql`
- Post-RLS verification path: `supabase/tests/dispute-letters-post-rls-verification.sql`
- Disposable-first requirement: apply the migration in a disposable Supabase database first, then rerun `supabase/tests/dispute-letters-two-account-rls-readiness.sql` and the dedicated post-RLS verifier before production use.
- Production apply blocked until the disposable post-RLS checks pass.
- Dispute letter writes also verify that any `dispute_id` belongs to the same `account_id` as the dispute letter.
- Keep persisted letters, documents, templates, and portal letter access separate until their own ownership and policy checks are defined.

Rollback notes for future employees RLS apply:

- Keep the apply migration reversible by dropping the four employees policies before disabling RLS.
- Use the rollback SQL already documented in `supabase/policies/drafts/employees-rls-policy-draft.sql`.
- Do not roll back by deleting employees rows or removing `employees.account_id`; rollback should only remove policies and disable RLS if the migration must be reverted.

Exact criteria to enable `employees` RLS safely:

- All production `employees` rows have the correct `account_id`, or any remaining null rows are explicitly documented and intentionally excluded from account-scoped reads.
- Employees page membership resolution works for real business users in a production-like Supabase environment.
- The two-account readiness SQL passes before RLS, proving the app query shape is scoped by `account_id`.
- Draft RLS policies are reviewed for select, insert, update, and delete using active account membership.
- Employee write role semantics are decided using account membership roles or a future permissions table, not `employees.role` labels.
- The future post-RLS block in `supabase/tests/employees-two-account-rls-readiness.sql` passes after policies are applied: Account A sees only Account A employees, can insert Account A employees, cannot insert Account B employees, cannot update Account B employees, and cannot delete Account B employees.
- No `employees.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Leads pilot added after the employees pilot:

- `supabase/migrations/20260507040000_add_leads_account_id.sql` adds nullable `leads.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260507043000_backfill_leads_account_id_single_account.sql` backfills unowned lead rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous lead rows null for manual review.
- RLS remains disabled for `leads`.
- `leads.account_id` remains nullable until existing rows are backfilled and runtime scoping is verified.
- `app/leads/page.tsx` now attempts to resolve the current user's account membership in the browser and reads account-scoped leads when rows exist.
- If no Supabase session, no account membership, no account-scoped lead rows, missing Supabase config, or local demo leads exist, the leads UI keeps the previous unscoped/local fallback behavior.
- New lead inserts and CSV imports include `account_id` only when an account membership can be safely resolved.
- Lead updates, deletes, bulk deletes, status updates, and conversion status updates include `account_id` constraints when an account membership can be safely resolved.
- Lead conversion still writes a `clients` row without adding ownership to `clients`; client ownership is intentionally left for a later clients pilot.
- Affiliates remain a separate table and are not changed in this leads pilot. They have a later separate ownership pilot before affiliate RLS.
- `tests/leads-affiliates-behavior.spec.ts` verifies the leads page loads, the add lead flow remains usable, edit/status/delete behavior remains usable, and no page exception or visible app/runtime error occurs without requiring real Supabase credentials.
- `supabase/tests/leads-two-account-rls-readiness.sql` documents the required two-account Supabase readiness check. It seeds two auth users, two accounts, memberships, and account-owned leads in a disposable database; verifies the current pre-RLS scoped read, insert, update, and delete query shapes; documents expected future RLS behavior; and includes cleanup SQL.
- `supabase/policies/drafts/leads-rls-policy-draft.sql` contains draft-only leads RLS policies for review. It is not an active migration and does not enable RLS.

Leads policy draft summary:

- SELECT allows authenticated users to read rows where `leads.account_id` is in their `account_memberships`.
- INSERT allows authenticated users to create rows only for account ids in their `account_memberships`.
- UPDATE requires the existing row account and the updated row account to stay within the user's `account_memberships`.
- DELETE allows deleting only rows whose `account_id` is in the user's `account_memberships`.
- Anonymous users and authenticated users without membership should receive no access once RLS is enabled.
- Null `account_id` legacy rows are intentionally hidden by the draft policies and must be manually assigned or explicitly archived before apply if they should remain visible.
- Lead write role semantics must be finalized against `account_memberships.role` or a future permission table before applying RLS.
- `account_memberships` currently has `role` but no membership `status` column. The draft treats any membership as active and notes where to add `status = 'active'` if that column is introduced.
- Converted client isolation remains incomplete until a later clients ownership pilot adds and verifies `clients.account_id`.
- Affiliates remain separate and are not covered by the leads readiness checklist or draft policies. They have a later separate ownership pilot.

Manual leads coverage before RLS:

- Run `supabase/tests/leads-two-account-rls-readiness.sql` against a disposable Supabase database after applying the account foundation and leads migrations.
- Confirm Account A-scoped reads return only Account A readiness leads and Account B-scoped reads return only Account B readiness leads.
- Confirm an Account A insert includes Account A ownership.
- Confirm an Account A-scoped update cannot update Account B's lead and can update Account A's inserted lead.
- Confirm an Account A-scoped delete cannot delete Account B's lead and can delete Account A's inserted lead.

Before making `leads.account_id` `NOT NULL`:

- Every existing lead row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- New lead inserts and CSV imports must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user who manages leads.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.
- Confirm lead conversion behavior once `clients.account_id` exists, so converted client ownership and source lead ownership stay consistent.

Before enabling `leads` RLS:

- Draft policies allowing account members to read lead rows in their account.
- Decide write-role semantics before policy apply. Lead management may need owner/admin/manager/sales roles rather than every account member.
- Add write policies limited to confirmed account membership roles after role semantics are finalized.
- Confirm anon users and authenticated users without membership cannot read or mutate leads.
- Add Supabase-backed two-account tests or manual SQL verification for scoped read, insert, update, delete, bulk delete, status update, CSV import ownership, conversion status update, and cross-account denial.
- Confirm all update/delete paths are protected by RLS policies before trusting client-provided lead ids.
- Keep affiliates out of the leads RLS apply unless the affiliates ownership pilot has been verified and affiliates readiness materials have been added.
- Run the future post-RLS block in `supabase/tests/leads-two-account-rls-readiness.sql` in a disposable database after applying draft policies.
- Review `supabase/policies/drafts/leads-rls-policy-draft.sql` and decide whether write policies should allow every member or only owner/admin/manager/sales roles.
- Confirm whether `account_memberships` needs a `status` column before policies are applied, then include active-membership checks if it exists.
- Confirm converted-client isolation separately after the later clients ownership pilot; leads RLS alone does not protect newly inserted clients rows.

Rollback notes for future leads RLS apply:

- Keep the apply migration reversible by dropping the four leads policies before disabling RLS.
- Use the rollback SQL already documented in `supabase/policies/drafts/leads-rls-policy-draft.sql`.
- Do not roll back by deleting leads rows or removing `leads.account_id`; rollback should only remove policies and disable RLS if the migration must be reverted.

Exact criteria to enable `leads` RLS safely:

- All production `leads` rows have the correct `account_id`, or any remaining null rows are explicitly documented and intentionally excluded from account-scoped reads.
- Leads page membership resolution works for real business users in a production-like Supabase environment.
- The two-account readiness SQL passes before RLS, proving the app query shape is scoped by `account_id`.
- Draft RLS policies are reviewed for select, insert, update, and delete using active account membership.
- Lead write role semantics are decided using account membership roles or a future permissions table.
- The future post-RLS block in `supabase/tests/leads-two-account-rls-readiness.sql` passes after policies are applied: Account A sees only Account A leads, can insert Account A leads, cannot insert Account B leads, cannot update Account B leads, and cannot delete Account B leads.
- CSV import ownership and conversion status updates are verified in a Supabase-backed environment.
- Converted client isolation is documented as dependent on a later clients ownership pilot.
- No `leads.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Affiliates pilot added after the dispute_letters readiness checkpoint:

- `supabase/migrations/20260509020000_add_affiliates_account_id.sql` adds nullable `affiliates.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260509023000_backfill_affiliates_account_id_single_account.sql` backfills unowned affiliate rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous affiliate rows null for manual review.
- RLS remains disabled for `affiliates`.
- `affiliates.account_id` remains nullable until existing rows are audited/backfilled and runtime scoping is verified.
- `app/leads/affiliates/page.tsx` now attempts to resolve the current user's account membership in the browser and reads account-scoped affiliates when rows exist, then falls back to the previous unscoped read when no scoped rows exist.
- New affiliate inserts include `account_id` only when an account membership can be safely resolved.
- Affiliate deletes include both `id` and `account_id` when account membership resolves. If account context cannot be resolved, the previous `id`-only delete behavior is preserved.
- No affiliate edit or status update path was found in the current UI, so this pilot does not add one.

Before making `affiliates.account_id` `NOT NULL`:

- Every existing affiliate row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- New affiliate inserts must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user who manages affiliates.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `affiliates` RLS:

- Add and run an `affiliates` two-account readiness SQL checklist against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- Add and review draft-only `affiliates` RLS policies for select, insert, update, and delete using active account membership.
- Decide write-role semantics before policy apply. Affiliate management may need owner/admin/manager/sales roles rather than every account member.
- Confirm anon users and authenticated users without membership cannot read or mutate affiliates after policies are applied.
- Confirm the affiliates page continues to use account-scoped reads, inserts, and deletes in a production-like Supabase environment.
- No `affiliates.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Clients pilot added after the leads pilot:

- `supabase/migrations/20260507050000_add_clients_account_id.sql` adds nullable `clients.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260507053000_backfill_clients_account_id_single_account.sql` backfills unowned client rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous client rows null for manual review.
- RLS remains disabled for `clients`.
- `clients.account_id` remains nullable until existing rows are backfilled and runtime scoping is verified.
- `app/clients/page.tsx` now attempts to resolve the current user's account membership in the browser and reads account-scoped clients when rows exist.
- If no Supabase session, no account membership, no account-scoped client rows, missing Supabase config, local saved clients, or demo data exists, the clients UI keeps the previous unscoped/local fallback behavior.
- New client inserts, CSV imports, client updates, status updates, deletes, bulk status updates, and bulk deletes include `account_id` or `account_id` constraints only when an account membership can be safely resolved.
- `app/clients/[id]/page.tsx` now prefers the account-scoped client detail row when account membership resolves, then falls back to the previous unscoped/local saved behavior. Detail page client updates include `account_id` and constrain by `id` plus `account_id` when available.
- Lead conversion now passes the resolved lead account context into the created `clients` row when available. If account context cannot be resolved, conversion preserves the previous client creation behavior.
- Client selector/list reads in `app/billing/BillingWorkspace.tsx`, `app/billing/pay-per-deletion/page.tsx`, `app/calendar/page.tsx`, `app/credit-analysis/page.tsx`, and `app/reports/page.tsx` prefer account-scoped client rows when account membership resolves and preserve unscoped fallback behavior.
- `supabase/tests/clients-two-account-rls-readiness.sql` is the draft SQL readiness checklist for clients RLS. It seeds two users/accounts/memberships and verifies account-scoped reads, direct inserts, CSV/import-style inserts, lead-conversion-style inserts, single update, bulk-style status update, single delete, bulk-style delete, and cross-account denial shapes without enabling RLS.
- `supabase/policies/drafts/clients-rls-policy-draft.sql` is the draft-only clients RLS policy file. It is not a migration and must not be applied until the readiness script and post-RLS checks pass in a disposable database.
- Draft clients policies allow authenticated users to select, insert, update, and delete only client rows whose `account_id` appears in their `account_memberships`. Null `account_id` rows and users without membership are intentionally not exposed; anon receives no clients policy.
- Dependent tables remain intentionally unchanged in the clients pilot: `payments`, `services`, letters/documents, and `client_portal_users` still need their own ownership pilots before RLS can protect their rows. `invoices`, `disputes`, `calendar_events`, and `dispute_letters` have separate ownership pilots.
- `app/calendar/page.tsx` still reads unowned leads for auto-events. The direct client list and birthday source are scoped in this clients pilot; invoice, dispute, and persisted calendar event reads are scoped in their later pilots.
- Billing workspace records remain browser-local and keyed by client display name, not durable `client_id`; persisted billing ownership is deferred.

Before making `clients.account_id` `NOT NULL`:

- Every existing client row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- New client inserts, CSV imports, detail updates, and lead conversion client creation must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user who manages clients.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.
- Child tables that reference clients must either be backfilled from `clients.account_id` or explicitly documented as still unprotected before client portal or child-table RLS is applied.

Before enabling `clients` RLS:

- Draft policies allowing account members to read client rows in their account.
- Decide write-role semantics before policy apply. Client management may need owner/admin/manager roles rather than every account member.
- Add write policies limited to confirmed account membership roles after role semantics are finalized.
- Confirm anon users and authenticated users without membership cannot read or mutate clients.
- Run `supabase/tests/clients-two-account-rls-readiness.sql` against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- After a later RLS migration is drafted, run the commented post-RLS block in `supabase/tests/clients-two-account-rls-readiness.sql` and confirm Account A cannot read, insert, update, or delete Account B clients.
- Confirm all update/delete paths are protected by RLS policies before trusting client-provided client ids.
- Keep child tables out of the clients RLS apply unless their own ownership pilots have added and verified `account_id`.
- Confirm client portal data access separately after `client_portal_users` and portal-specific policies exist.
- No `clients.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Invoices/billing pilot added after the clients pilot:

- `supabase/migrations/20260508010000_add_invoices_account_id.sql` adds nullable `invoices.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260508013000_backfill_invoices_account_id_single_account.sql` backfills unowned invoice rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous invoice rows null for manual review.
- RLS remains disabled for `invoices`.
- `invoices.account_id` remains nullable until existing rows are audited/backfilled and runtime scoping is verified.
- `app/clients/[id]/page.tsx` now prefers account-scoped invoice rows for the selected client when account membership resolves, then falls back to the previous client-id-only invoice read when no scoped rows exist.
- `app/calendar/page.tsx` now prefers account-scoped pending invoice rows for invoice due auto-events when account membership resolves, then falls back to the previous unscoped pending invoice read when no scoped rows exist.
- `app/reports/page.tsx` now prefers account-scoped invoice rows for revenue calculations when account membership resolves, then falls back to the previous unscoped invoice read when no scoped rows exist.
- `app/billing/BillingWorkspace.tsx` still uses browser-local invoices, payments, and services. No Supabase invoice insert/update/delete path was found there, so this pilot does not migrate local billing records into persisted invoices.
- New persisted invoices should include both `client_id` and `account_id` when that write path is introduced. Do not rely on `client_id` alone for tenant isolation, even though clients already have account ownership.
- `supabase/tests/invoices-two-account-rls-readiness.sql` is the draft SQL readiness checklist for invoices RLS. It seeds two users/accounts/memberships, account-owned clients, and account-owned invoices, then verifies account-scoped reads, insert with `client_id` plus `account_id`, invoice/client account matching, scoped update/delete behavior, and future post-RLS cross-account denial expectations.
- `supabase/policies/drafts/invoices-rls-policy-draft.sql` is the draft-only invoices RLS policy file. It is not a migration and must not be applied until the readiness script and post-RLS checks pass in a disposable database.
- Draft invoices policies allow authenticated users to select, insert, update, and delete only invoice rows whose `account_id` appears in their `account_memberships`. Insert/update also require any non-null `client_id` to reference a client with the same `account_id`. Null `account_id` rows and users without membership are intentionally not exposed; anon receives no invoices policy.
- Payments, services/products, letters/documents, and client portal mappings remain intentionally unchanged and need their own ownership pilots before RLS can protect those rows. Disputes, calendar events, and dispute letters have separate ownership pilots.

Before making `invoices.account_id` `NOT NULL`:

- Every existing invoice row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- Invoices with `client_id` must be audited so `invoices.account_id` matches `clients.account_id`.
- Invoices with null or missing legacy `client_id` must be classified as valid account-level billing rows, repaired, or archived before enforcing stricter constraints.
- Persisted invoice creation must reliably include `account_id` for authenticated business users.
- Persisted invoice creation must validate that any `client_id` belongs to the same account as the invoice.
- Production must have at least one `account_memberships` row for every active business user who manages billing.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `invoices` RLS:

- Add draft policies allowing account members to read invoice rows in their account.
- Decide write-role semantics before policy apply. Billing management may need owner/admin/manager roles rather than every account member.
- Add write policies limited to confirmed account membership roles after role semantics are finalized.
- Confirm anon users and authenticated users without membership cannot read or mutate invoices.
- Run `supabase/tests/invoices-two-account-rls-readiness.sql` against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- After a later RLS migration is drafted, run the commented post-RLS block in `supabase/tests/invoices-two-account-rls-readiness.sql` and confirm Account A cannot read, insert, update, or delete Account B invoices and cannot attach an Account A invoice to an Account B client.
- Confirm client detail payment history, calendar invoice auto-events, and reports revenue aggregation continue to use account-scoped invoice reads in a production-like Supabase environment.
- Keep payments/services and portal invoice access out of the invoices RLS apply unless their own ownership and policy work is complete.
- No `invoices.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Disputes pilot added after the invoices pilot:

- `supabase/migrations/20260508020000_add_disputes_account_id.sql` adds nullable `disputes.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260508023000_backfill_disputes_account_id_single_account.sql` backfills unowned dispute rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous dispute rows null for manual review.
- RLS remains disabled for `disputes`.
- `disputes.account_id` remains nullable until existing rows are audited/backfilled and runtime scoping is verified.
- `app/disputes/status/page.tsx`, `app/disputes/[id]/page.tsx`, `app/bulk-print/page.tsx`, `app/clients/page.tsx`, `app/clients/[id]/page.tsx`, `app/calendar/page.tsx`, and `app/reports/page.tsx` now prefer account-scoped dispute rows when account membership resolves, then fall back to the previous unscoped reads when no scoped rows exist.
- Persisted dispute status/detail updates now include both `id` and `account_id` when account membership resolves. If account context cannot be resolved, the previous `id`-only update behavior is preserved until RLS policies are ready.
- `app/disputes/page.tsx` remains local/static and no Supabase dispute insert path was found there, so this pilot does not add persisted dispute creation.
- New persisted disputes should include both `client_id` and `account_id` when that write path is introduced. Do not rely on `client_id` alone for tenant isolation, even though clients already have account ownership.
- `dispute_letters` has a later separate ownership pilot. Persisted letters/documents are intentionally unchanged in this pilot and still need separate ownership pilots before their rows can be protected by RLS. `calendar_events` has a separate ownership pilot.
- `supabase/tests/disputes-two-account-rls-readiness.sql` is the draft SQL readiness checklist for disputes RLS. It seeds two users/accounts/memberships, account-owned clients, and account-owned disputes, then verifies account-scoped reads, insert with `client_id` plus `account_id`, dispute/client account matching, scoped status/detail update behavior, scoped delete behavior, and future post-RLS cross-account denial expectations.
- `supabase/policies/drafts/disputes-rls-policy-draft.sql` is the draft-only disputes RLS policy file. It is not a migration and must not be applied until the readiness script and post-RLS checks pass in a disposable database.
- Draft disputes policies allow authenticated users to select, insert, update, and delete only dispute rows whose `account_id` appears in their `account_memberships`. Insert/update also require any non-null `client_id` to reference a client with the same `account_id`. Null `account_id` rows and users without membership are intentionally not exposed; anon receives no disputes policy.

Before making `disputes.account_id` `NOT NULL`:

- Every existing dispute row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- Disputes with `client_id` must be audited so `disputes.account_id` matches `clients.account_id`.
- Disputes with null or missing legacy `client_id` must be classified as valid account-level records, repaired, or archived before enforcing stricter constraints.
- Persisted dispute creation must reliably include `account_id` for authenticated business users.
- Persisted dispute creation and client changes must validate that any `client_id` belongs to the same account as the dispute.
- Production must have at least one `account_memberships` row for every active business user who manages disputes.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `disputes` RLS:

- Run `supabase/tests/disputes-two-account-rls-readiness.sql` against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- Review `supabase/policies/drafts/disputes-rls-policy-draft.sql` and confirm the select, insert, update, and delete policy shape.
- Decide write-role semantics before policy apply. Dispute management may need owner/admin/manager/specialist roles rather than every account member.
- Add write policies limited to confirmed account membership roles after role semantics are finalized.
- Confirm anon users and authenticated users without membership cannot read or mutate disputes.
- After a later RLS migration is drafted, run the commented post-RLS block in `supabase/tests/disputes-two-account-rls-readiness.sql` and confirm Account A cannot read, insert, update, or delete Account B disputes and cannot attach an Account A dispute to an Account B client.
- Confirm client detail dispute lists, dispute status management, bulk print queues, calendar dispute source reads, and reports dispute aggregation continue to use account-scoped dispute reads in a production-like Supabase environment.
- Confirm the future persisted dispute create path writes `account_id` and validates same-account `client_id` before relying on insert policies.
- Keep letters/documents, calendar event writes, and portal dispute access out of the disputes RLS apply unless their own ownership and policy work is complete. Apply `dispute_letters` RLS only after its separate readiness materials are added and verified.
- No `disputes.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Calendar events pilot added after the disputes pilot:

- `supabase/migrations/20260508030000_add_calendar_events_account_id.sql` adds nullable `calendar_events.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260508033000_backfill_calendar_events_account_id_single_account.sql` backfills unowned calendar event rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous calendar event rows null for manual review.
- RLS remains disabled for `calendar_events`.
- `calendar_events.account_id` remains nullable until existing rows are audited/backfilled and runtime scoping is verified.
- `app/calendar/page.tsx` now prefers account-scoped persisted calendar event rows when account membership resolves, then falls back to the previous unscoped event read when no scoped rows exist.
- Persisted calendar event inserts include `account_id` when account membership resolves. Persisted event updates and deletes include both `id` and `account_id` when membership resolves, while preserving previous fallback behavior without account context.
- Browser-local events remain in `localStorage` under `disputepilot.calendar-events`; database RLS cannot protect those local/demo records.
- Calendar auto-event sources are unchanged except for existing scoped source reads: clients, invoices, and disputes already have account ownership pilots and are read with scoped-first fallback. Leads auto-events still come from the current leads query path and should be confirmed before calendar_events RLS is applied.
- `letters`, documents, and portal data are intentionally unchanged in this pilot. `dispute_letters` has a later separate ownership pilot.
- `supabase/tests/calendar-events-two-account-rls-readiness.sql` is the draft SQL readiness checklist for calendar_events RLS. It seeds two users/accounts/memberships, account-owned clients, and account-owned calendar events, then verifies account-scoped reads, insert with `account_id`, client/event account matching when `client_id` is present, scoped update/delete behavior, and future post-RLS cross-account denial expectations.
- `supabase/policies/drafts/calendar-events-rls-policy-draft.sql` is the draft-only calendar_events RLS policy file. It is not a migration and must not be applied until the readiness script and post-RLS checks pass in a disposable database.
- Draft calendar_events policies allow authenticated users to select, insert, update, and delete only calendar event rows whose `account_id` appears in their `account_memberships`. Insert/update also require any non-null `client_id` to reference a client with the same `account_id`. Null `account_id` rows and users without membership are intentionally not exposed; anon receives no calendar_events policy.

Before making `calendar_events.account_id` `NOT NULL`:

- Every existing calendar event row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- Calendar events with `client_id` must be audited so `calendar_events.account_id` matches `clients.account_id`.
- Persisted event inserts must reliably include `account_id` for authenticated business users.
- Persisted event updates/deletes must continue to constrain by `id` plus `account_id` or be protected by RLS before trusting client-provided event ids.
- Production must have at least one `account_memberships` row for every active business user who manages calendar events.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `calendar_events` RLS:

- Run `supabase/tests/calendar-events-two-account-rls-readiness.sql` against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- Review `supabase/policies/drafts/calendar-events-rls-policy-draft.sql` and confirm the select, insert, update, and delete policy shape.
- Decide write-role semantics before policy apply. Calendar management may need owner/admin/manager/staff roles rather than every account member.
- Confirm anon users and authenticated users without membership cannot read or mutate calendar events.
- After a later RLS migration is drafted, run the commented post-RLS block in `supabase/tests/calendar-events-two-account-rls-readiness.sql` and confirm Account A cannot read, insert, update, or delete Account B calendar events.
- Confirm add/edit/delete calendar workflows continue to use account-scoped persisted event writes in a production-like Supabase environment.
- Confirm source-linked events do not cross accounts. The current app uses `client_id`; future `invoice_id`, `dispute_id`, or similar source columns should add same-account policy checks before RLS is applied.
- Confirm portal calendar visibility separately if client-specific events are ever exposed to customers.
- Keep letters/documents and portal data out of the calendar_events RLS apply unless their own ownership and policy work is complete. Apply `dispute_letters` RLS only after its separate readiness materials are added and verified.
- No `calendar_events.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Dispute letters pilot added after the calendar_events pilot:

- `supabase/migrations/20260509010000_add_dispute_letters_account_id.sql` adds nullable `dispute_letters.account_id` with an index and an `accounts(id)` foreign key.
- `supabase/migrations/20260509013000_backfill_dispute_letters_account_id_single_account.sql` backfills unowned dispute letter rows only when the database has exactly one account. If there are zero accounts or multiple accounts, it updates no rows and leaves ambiguous dispute letter rows null for manual review.
- RLS remains disabled for `dispute_letters`.
- `dispute_letters.account_id` remains nullable until existing rows are audited/backfilled and runtime scoping is verified.
- `app/disputes/[id]/page.tsx` now prefers account-scoped `dispute_letters` rows by `dispute_id` plus `account_id` when account membership resolves, then falls back to the previous `dispute_id` read when no scoped rows exist.
- No persisted Supabase write path for `dispute_letters` was found in the inspected app files. The dispute detail letter assignment UI remains local state in this pilot.
- `/letters`, `/letters/ai-rewriter`, and `/letter-vault` are local/template-driven UI surfaces. No active Supabase CRUD was found for `letters`, `documents`, or `letter_templates`, so this pilot does not force migrations for those tables.
- Parent disputes already have account ownership. Future persisted dispute letter writes should include both `dispute_id` and `account_id`; do not rely on `dispute_id` alone for tenant isolation.
- Letters/documents, portal letter access, and any future template persistence remain separate ownership/RLS work.
- `supabase/tests/dispute-letters-two-account-rls-readiness.sql` is the draft SQL readiness checklist for dispute_letters RLS. It seeds two users/accounts/memberships, account-owned clients, account-owned disputes, and account-owned dispute letters, then verifies account-scoped reads by `dispute_id` plus `account_id`, insert with `dispute_id` plus `account_id`, dispute letter/dispute account matching, scoped update/delete behavior, and future post-RLS cross-account denial expectations.
- `supabase/policies/drafts/dispute-letters-rls-policy-draft.sql` is the draft-only dispute_letters RLS policy file. It is not a migration and must not be applied until the readiness script and post-RLS checks pass in a disposable database.
- Draft dispute_letters policies allow authenticated users to select, insert, update, and delete only dispute letter rows whose `account_id` appears in their `account_memberships`. Insert/update also require any non-null `dispute_id` to reference a dispute with the same `account_id`. Null `account_id` rows and users without membership are intentionally not exposed; anon receives no dispute_letters policy.

Before making `dispute_letters.account_id` `NOT NULL`:

- Every existing dispute letter row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- Dispute letters with `dispute_id` must be audited so `dispute_letters.account_id` matches `disputes.account_id`.
- Orphan dispute letters with missing or invalid `dispute_id` must be repaired, assigned to a confirmed account, or archived before enforcing stricter constraints.
- Future persisted dispute letter inserts must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user who manages dispute letters.

Before enabling `dispute_letters` RLS:

- Run `supabase/tests/dispute-letters-two-account-rls-readiness.sql` against a disposable Supabase database and confirm the pre-RLS account-scoped checks pass.
- Review `supabase/policies/drafts/dispute-letters-rls-policy-draft.sql` and confirm the select, insert, update, and delete policy shape.
- Decide write-role semantics before policy apply. Letter generation and review may need owner/admin/manager/specialist roles rather than every account member.
- Confirm anon users and authenticated users without membership cannot read or mutate dispute letters after policies are applied.
- After a later RLS migration is drafted, run the commented post-RLS block in `supabase/tests/dispute-letters-two-account-rls-readiness.sql` and confirm Account A cannot read, insert, update, or delete Account B dispute letters and cannot attach an Account A dispute letter to an Account B dispute.
- Confirm the dispute detail letter list continues to use account-scoped reads in a production-like Supabase environment.
- Keep letters/documents, templates, and portal letter access out of the `dispute_letters` RLS apply unless their own ownership and policy work is complete.
- No `dispute_letters.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

Current automated statuses coverage:

- `tests/configuration-behavior.spec.ts` verifies the settings/configuration page loads and that custom client status creation and deletion stay usable without page exceptions or visible app/runtime errors.
- The automated Playwright coverage intentionally does not require real Supabase credentials. It cannot prove database-enforced cross-account isolation because the no-credentials path uses the browser Supabase no-op client and there is no seeded two-user Supabase auth context.

Manual statuses coverage before RLS:

- Run `supabase/tests/statuses-two-account-rls-readiness.sql` against a disposable Supabase database after applying the account foundation and statuses migrations.
- Confirm Account A-scoped reads return only Account A readiness statuses and Account B-scoped reads return only Account B readiness statuses.
- Confirm an Account A insert includes Account A ownership.
- Confirm an Account A-scoped delete cannot delete Account B's status and can delete Account A's inserted status.

Before making `statuses.account_id` `NOT NULL`:

- Every existing custom status row must be assigned to the correct account.
- Any rows left null after the guarded single-account backfill must be manually assigned or intentionally archived in a later audited migration.
- New status inserts must reliably include `account_id` for authenticated business users.
- Production must have at least one `account_memberships` row for every active business user.
- The settings UI must continue to handle empty account-scoped status lists cleanly.
- Supabase-backed tests or manual verification must confirm account membership resolution succeeds in production-like environments.

Before enabling `statuses` RLS:

- Add policies allowing active `account_memberships` users to read account statuses.
- Add write policies limited to owner/admin-style roles once role semantics are confirmed.
- Confirm the anon client cannot read or mutate another account's statuses.
- Add regression coverage for scoped read, scoped insert, scoped delete, and cross-account denial.
- Confirm delete/update paths include account ownership constraints or are protected by RLS policies before trusting client-provided status ids.
- Run Supabase-backed manual verification or seeded integration tests with at least two accounts before enabling policies, because the current Playwright tests intentionally avoid real Supabase credentials.
- Convert the readiness SQL into an automated Supabase-backed integration test when CI has disposable Supabase service credentials and seeded auth users.
- Review `supabase/policies/drafts/statuses-rls-policy-draft.sql` and decide whether write policies should allow every member or only owner/admin/manager roles.
- Confirm whether `account_memberships` needs a `status` column before policies are applied, then include active-membership checks if it exists.

Rollback notes for future statuses RLS apply:

- Keep the apply migration reversible by dropping the four statuses policies before disabling RLS.
- Use the rollback SQL already documented in `supabase/policies/drafts/statuses-rls-policy-draft.sql`.
- Do not roll back by deleting statuses rows or removing `statuses.account_id`; rollback should only remove policies and disable RLS if the migration must be reverted.

Exact criteria to enable `statuses` RLS safely:

- All production `statuses` rows have the correct `account_id`, or any remaining null rows are explicitly documented and intentionally excluded from account-scoped reads.
- Settings/configuration still resolves account membership for real business users in a production-like Supabase environment.
- The two-account readiness SQL passes in a disposable database before RLS, proving the app query shape is scoped by `account_id`.
- Draft RLS policies are reviewed for select, insert, update, and delete using active account membership.
- The future post-RLS block in `supabase/tests/statuses-two-account-rls-readiness.sql` passes after policies are applied: Account A sees only Account A statuses, can insert Account A statuses, cannot insert Account B statuses, and cannot delete Account B statuses.
- No `statuses.account_id NOT NULL` constraint is added until null-row audit and manual backfill are complete.

1. Add tenant tables: `accounts`, `account_memberships`, and later `client_portal_users`.
2. Add nullable `account_id` columns to persisted business tables: `clients`, `leads`, `affiliates`, `disputes`, `dispute_letters`, `invoices`, `calendar_events`, `employees`, `statuses`.
3. Backfill one default account for existing data, then derive child ownership from parent records where possible:
   - `disputes.account_id` from `clients.account_id` using `client_id`.
   - `dispute_letters.account_id` from `disputes.account_id` using `dispute_id`.
   - `invoices.account_id` from `clients.account_id` using `client_id`.
   - `calendar_events.account_id` from `clients.account_id` when `client_id` exists; otherwise default account.
4. Add not-null constraints only after backfill and orphan audits pass.
5. Add server helpers that resolve the current `account_id` from the verified Supabase user and active membership.
6. Update inserts to derive `account_id` server-side or through safe database defaults/RPC. Do not accept client-provided `account_id` as authoritative.
7. Update reads/writes to include account scoping while RLS is still off.
8. Add tests for logged-in account access and cross-account denial.
9. Enable RLS table by table, starting with a low-blast-radius config table such as `statuses`, then `clients`, then child tables.

## Smallest Safe Next Step

Add a schema-only migration for `accounts` and `account_memberships`, plus a server helper that resolves the current user's active `account_id`. Do not add `account_id` to every data table or enable RLS in the same step. Once that helper exists, add tests around account resolution and then use it in one low-risk area before migrating high-volume tables like `clients`.
