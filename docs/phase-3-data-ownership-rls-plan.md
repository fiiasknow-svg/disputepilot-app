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
