# Phase 3 Ownership Checkpoint

Date: 2026-05-09

No RLS is enabled yet. No Phase 3 `account_id` column is enforced as `NOT NULL` yet.

## Current Coverage

| Table / area | `account_id` migration | guarded backfill | runtime account-aware access | two-account SQL | draft RLS policy |
| --- | --- | --- | --- | --- | --- |
| `statuses` | yes | yes | settings/configuration read, insert, delete | yes | yes |
| `employees` | yes | yes | employee read, insert, update, delete, bulk status/delete | yes | yes |
| `leads` | yes | yes | leads page read, insert/import, update, status, delete, conversion ownership | yes | yes |
| `clients` | yes | yes | clients list/detail CRUD/import/bulk, lead conversion, client selectors | yes | yes |
| `invoices` | yes | yes | client profile, calendar, reports read paths | yes | yes |
| `disputes` | yes | yes | status/detail updates, status list, client pages, reports, calendar, bulk print reads | yes | yes |
| `calendar_events` | yes | yes | calendar persisted read, insert, update, delete | yes | yes |
| `dispute_letters` | yes | yes | dispute detail read path | yes | yes |

## Remaining Private Tables / Areas

- `affiliates`: active Supabase CRUD in `app/leads/affiliates/page.tsx`; no ownership pilot or readiness materials yet.
- `payments` and `services`: billing workspace is browser-local today, but these need ownership if/when persisted.
- Persisted `letters`, `documents`, and `letter_templates`: no active Supabase CRUD found in the current app scan; letter/vault/document UI is local, template-driven, or company-page workflow today.
- `client_portal_users` and portal-visible data paths: still missing as a dedicated portal identity/policy model.
- Credit report/tradeline/inquiry records: currently in-memory/mock or API-driven; add ownership before persistence.
- Report snapshots or aggregate tables: none found; current reports derive from source tables.

## Known Gaps Before RLS

- Run every `supabase/tests/*two-account-rls-readiness.sql` script against a disposable Supabase database.
- Audit and backfill all nullable `account_id` rows, including orphan child rows and cross-account parent mismatches.
- Do not add `NOT NULL` until null-row audits and manual backfills are complete.
- Decide write-role semantics per table; current drafts generally start from account membership and note where writes may need owner/admin/manager/specialist roles.
- Keep portal access separate from business account membership policies.
- Confirm lead-derived calendar/report reads are account-scoped before relying on leads RLS; the app scan still shows calendar and reports lead reads that do not apply `account_id`.
- Confirm all runtime fallbacks are acceptable before RLS apply, then remove or narrow unscoped fallback behavior once policies are active and seeded data is reliable.
- Fix remaining private persisted tables in order before broad RLS rollout, starting with active unscoped Supabase CRUD.

## Local / Static / Demo Surfaces

- `app/billing/BillingWorkspace.tsx` stores invoices/payments/services in browser-local state/localStorage and only reads account-scoped clients.
- `app/disputes/page.tsx` is static/local for dispute creation UI; persisted dispute writes are elsewhere or not present.
- `/letters`, `/letters/ai-rewriter`, `/letter-vault`, and `/letters/vault` are local/template-driven UI surfaces.
- Company document/settings pages are mostly local workflow/static UI unless a specific persisted table is introduced later.

## Safest Next Tasks

1. Add an `affiliates.account_id` ownership pilot, guarded single-account backfill, runtime scoping, two-account readiness SQL, draft RLS policies, and docs.
2. Close the remaining lead-derived unscoped reads in calendar and reports while preserving fallback behavior, then update the leads readiness notes if needed.
3. Run the existing readiness SQL scripts in a disposable Supabase database and record audit results for null `account_id`, orphan child rows, and parent/child account mismatches before drafting any RLS apply migration.
