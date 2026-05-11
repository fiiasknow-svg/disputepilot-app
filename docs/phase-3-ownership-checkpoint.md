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
| `affiliates` | yes | yes | affiliate page read, insert, delete | yes | yes |

## Final Pre-RLS Matrix

| Active private table | account_id migration | guarded backfill | runtime account-aware | two-account SQL | draft RLS policy | remaining blockers |
| --- | --- | --- | --- | --- | --- | --- |
| `statuses` | yes | yes | yes | yes | yes | disposable DB verification, null-row audit, RLS apply migration |
| `employees` | yes | yes | yes | yes | yes | disposable DB verification, write-role decision, null-row audit, RLS apply migration |
| `leads` | yes | yes | yes | yes | yes | disposable DB verification, converted-client consistency check, null-row audit, RLS apply migration |
| `clients` | yes | yes | yes | yes | yes | disposable DB verification, portal policy separation, null-row audit, RLS apply migration |
| `invoices` | yes | yes | yes | yes | yes | disposable DB verification, portal invoice policy separation, null-row audit, RLS apply migration |
| `disputes` | yes | yes | yes | yes | yes | disposable DB verification, child-table separation, null-row/orphan audit, RLS apply migration |
| `calendar_events` | yes | yes | yes | yes | yes | disposable DB verification, source-linked event audit, null-row audit, RLS apply migration |
| `dispute_letters` | yes | yes | yes | yes | yes | disposable DB verification, orphan dispute_id audit, portal letter policy separation, RLS apply migration |
| `affiliates` | yes | yes | yes | yes | yes | disposable DB verification, write-role decision, null-row audit, RLS apply migration |

## Remaining Private Tables / Areas

- `affiliates`: ownership pilot, two-account readiness SQL, and draft RLS policies exist.
- `payments` and `services`: billing workspace is browser-local today, but these need ownership if/when persisted.
- Persisted `letters`, `documents`, and `letter_templates`: no active Supabase CRUD found in the current app scan; letter/vault/document UI is local, template-driven, or company-page workflow today.
- `client_portal_users` and portal-visible data paths: still missing as a dedicated portal identity/policy model.
- Credit report/tradeline/inquiry records: currently in-memory/mock or API-driven; add ownership before persistence.
- Report snapshots or aggregate tables: none found; current reports derive from source tables.
- `dp_auth` client-portal bridge: still present in `components/ClientPortalLayout.tsx` and `components/AuthLoginForm.tsx`; it is separate from business account membership and still needs a dedicated portal identity path.

## Known Gaps Before RLS

- Run every `supabase/tests/*two-account-rls-readiness.sql` script against a disposable Supabase database.
- Use [docs/phase-3-disposable-supabase-readiness-runbook.md](./phase-3-disposable-supabase-readiness-runbook.md) as the execution checklist and recording sheet.
- Capture the outcomes in [docs/phase-3-disposable-supabase-readiness-results.md](./phase-3-disposable-supabase-readiness-results.md).
- If the disposable database only has the account foundation, bootstrap it with `supabase/tests/disposable-test-schema-setup.sql` first.
- Audit and backfill all nullable `account_id` rows, including orphan child rows and cross-account parent mismatches.
- Do not add `NOT NULL` until null-row audits and manual backfills are complete.
- Decide write-role semantics per table; current drafts generally start from account membership and note where writes may need owner/admin/manager/specialist roles.
- Keep portal access separate from business account membership policies.
- Confirm lead-derived calendar/report reads are account-scoped before relying on leads RLS; the app scan still shows calendar and reports lead reads that do not apply `account_id`.
- Confirm all runtime fallbacks are acceptable before RLS apply, then remove or narrow unscoped fallback behavior once policies are active and seeded data is reliable.
- Fix remaining private persisted tables in order before broad RLS rollout, starting with active unscoped Supabase CRUD.
- Expect duplicate React key warnings to remain until the existing sidebar/layout duplication is cleaned up; they do not block the ownership work but they are still outstanding.

## Affiliates

- Readiness checklist: `supabase/tests/affiliates-two-account-rls-readiness.sql`
- Draft policy: `supabase/policies/drafts/affiliates-rls-policy-draft.sql`
- Policy summary: authenticated users can read, insert, update, and delete affiliates only when `affiliates.account_id` is in their `account_memberships`; null rows and users without membership stay hidden until a later apply.
- Remaining pre-apply checklist: audit/backfill null affiliate ownership, confirm the account-scoped read/insert/delete shape in a disposable database, decide write roles, and verify the affiliates page still works with scoped reads and fallback behavior.
- Before `affiliates.account_id NOT NULL`: every row must be assigned or intentionally archived, and production must have membership coverage for active affiliate managers.
- Before `affiliates` RLS: run the checklist script, review the draft policy, confirm anon and no-membership users cannot read or mutate affiliates, and keep the apply migration reversible.

## Local / Static / Demo Surfaces

- `app/billing/BillingWorkspace.tsx` stores invoices/payments/services in browser-local state/localStorage and only reads account-scoped clients.
- `app/disputes/page.tsx` is static/local for dispute creation UI; persisted dispute writes are elsewhere or not present.
- `/letters`, `/letters/ai-rewriter`, `/letter-vault`, and `/letters/vault` are local/template-driven UI surfaces.
- Company document/settings pages are mostly local workflow/static UI unless a specific persisted table is introduced later.
- `app/billing/BillingWorkspace.tsx` is intentionally excluded from the business-table readiness matrix until invoices/payments/services persistence is introduced.
- `app/letters/*`, `app/letter-vault`, `app/disputes/page.tsx`, and company document pages are intentionally excluded because they are local/template-driven or static workflow surfaces today.

## Safest Next Tasks

1. Close the remaining lead-derived unscoped reads in calendar and reports while preserving fallback behavior, then update the leads readiness notes if needed.
2. Run the existing readiness SQL scripts in a disposable Supabase database and record audit results for null `account_id`, orphan child rows, and parent/child account mismatches before drafting any RLS apply migration.
3. Decide whether `payments` and `services` should stay local-only or get their own ownership pilots before any billing persistence work.
