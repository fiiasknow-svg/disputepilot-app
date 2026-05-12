# Phase 3 RLS Completion Audit

Date: 2026-05-12

Scope: disposable Supabase RLS completion checkpoint for active private Phase 3 tables. No production RLS has been applied.

## Completion Summary

RLS apply migrations and disposable post-RLS verification scripts exist for all active private Phase 3 tables listed below. Per the current checkpoint, each migration passed disposable Supabase post-RLS verification and was pushed before this audit.

| Table | RLS migration | Post-RLS verifier | Disposable result |
| --- | --- | --- | --- |
| `statuses` | `supabase/migrations/20260511010000_enable_statuses_rls.sql` | `supabase/tests/statuses-post-rls-verification.sql` | passed |
| `employees` | `supabase/migrations/20260511020000_enable_employees_rls.sql` | `supabase/tests/employees-post-rls-verification.sql` | passed |
| `leads` | `supabase/migrations/20260511030000_enable_leads_rls.sql` | `supabase/tests/leads-post-rls-verification.sql` | passed |
| `clients` | `supabase/migrations/20260511040000_enable_clients_rls.sql` | `supabase/tests/clients-post-rls-verification.sql` | passed |
| `invoices` | `supabase/migrations/20260511050000_enable_invoices_rls.sql` | `supabase/tests/invoices-post-rls-verification.sql` | passed |
| `disputes` | `supabase/migrations/20260511060000_enable_disputes_rls.sql` | `supabase/tests/disputes-post-rls-verification.sql` | passed |
| `calendar_events` | `supabase/migrations/20260511070000_enable_calendar_events_rls.sql` | `supabase/tests/calendar-events-post-rls-verification.sql` | passed |
| `dispute_letters` | `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql` | `supabase/tests/dispute-letters-post-rls-verification.sql` | passed |
| `affiliates` | `supabase/migrations/20260511090000_enable_affiliates_rls.sql` | `supabase/tests/affiliates-post-rls-verification.sql` | passed |

## Policy Coverage

- Every migration enables RLS for exactly one table.
- Every migration uses a `SECURITY DEFINER` helper to evaluate account membership.
- Authenticated users receive only the table privileges needed for the protected table.
- Anonymous users receive no explicit table policy access.
- Child tables add same-account parent checks where needed:
  - `invoices.client_id` must match `invoices.account_id`.
  - `disputes.client_id` must match `disputes.account_id`.
  - `calendar_events.client_id` must be null or match `calendar_events.account_id`.
  - `dispute_letters.dispute_id` must be null or match `dispute_letters.account_id`.

## Production Gate

Production apply remains blocked. Disposable verification proves policy shape and denial behavior against seeded fixtures; it does not prove production data is ready.

Production preflight materials:

- Read-only SQL audit: `supabase/audits/production-rls-preflight-readonly.sql`
- Runbook: [docs/phase-3-production-rls-preflight-runbook.md](./phase-3-production-rls-preflight-runbook.md)

Required production preflight before any production RLS migration:

- Audit every protected table for null `account_id` rows.
- Audit child tables for orphan parent references.
- Audit cross-account parent/child mismatches:
  - `invoices.client_id` to `clients.account_id`
  - `disputes.client_id` to `clients.account_id`
  - `calendar_events.client_id` to `clients.account_id`
  - `dispute_letters.dispute_id` to `disputes.account_id`
- Confirm every active business user has the required `account_memberships` row.
- Confirm write-role semantics for each table before accepting the current owner/admin/manager/member write set in production.
- Keep customer portal policies separate from business account membership policies.
- Confirm rollback SQL for each table: drop policies first, then disable RLS only if rollback is required.
- Take a production backup or verified restore point before the first production RLS migration.

## Recommended Production Rollout Order

Apply one table at a time, stopping after each table for verification.

1. `statuses`
2. `employees`
3. `leads`
4. `clients`
5. `affiliates`
6. `invoices`
7. `disputes`
8. `calendar_events`
9. `dispute_letters`

Reasoning: start with lower-blast-radius configuration/team/lead/affiliate tables, then move to core customer ownership, then child tables with parent consistency checks.

## Recommended Post-Production Verification Order

After each production migration:

1. Verify an authenticated account member can read only rows for their account.
2. Verify an authenticated account member can perform expected writes for their account.
3. Verify cross-account insert/update/delete attempts are blocked.
4. Verify anon and authenticated users without membership cannot read or mutate rows.
5. Verify representative app workflows still load with real production account membership.

Run table checks in the same order as production rollout:

1. `statuses`
2. `employees`
3. `leads`
4. `clients`
5. `affiliates`
6. `invoices`
7. `disputes`
8. `calendar_events`
9. `dispute_letters`

## Remaining Work

- Run and record production data audits before the first production apply.
- Decide whether write policies should be narrowed by table-specific roles before production.
- Define customer portal identity and portal-specific RLS separately.
- Decide when to remove or narrow runtime fallback reads after production RLS is active and seeded data is confirmed.
