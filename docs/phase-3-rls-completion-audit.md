# Phase 3 RLS Completion Audit

Date: 2026-05-13

Scope: Phase 3 RLS completion checkpoint for active private tables. Disposable verification materials exist for the full planned matrix; production RLS has now been applied and live-tested for the production tables that exist.

## Completion Summary

RLS apply migrations and disposable post-RLS verification scripts exist for all active private Phase 3 tables listed below. Production rollout is complete for the existing production tables: `employees`, `leads`, `clients`, `invoices`, `disputes`, `calendar_events`, and `affiliates`. Production skipped `statuses` and `dispute_letters` because those tables do not exist in production.

| Table | RLS migration | Post-RLS verifier | Disposable result | Production result |
| --- | --- | --- | --- | --- |
| `statuses` | `supabase/migrations/20260511010000_enable_statuses_rls.sql` | `supabase/tests/statuses-post-rls-verification.sql` | passed | skipped: table does not exist in production |
| `employees` | `supabase/migrations/20260511020000_enable_employees_rls.sql` | `supabase/tests/employees-post-rls-verification.sql` | passed | applied and live-tested |
| `leads` | `supabase/migrations/20260511030000_enable_leads_rls.sql` | `supabase/tests/leads-post-rls-verification.sql` | passed | applied and live-tested |
| `clients` | `supabase/migrations/20260511040000_enable_clients_rls.sql` | `supabase/tests/clients-post-rls-verification.sql` | passed | applied and live-tested |
| `invoices` | `supabase/migrations/20260511050000_enable_invoices_rls.sql` | `supabase/tests/invoices-post-rls-verification.sql` | passed | applied and live-tested |
| `disputes` | `supabase/migrations/20260511060000_enable_disputes_rls.sql` | `supabase/tests/disputes-post-rls-verification.sql` | passed | applied and live-tested |
| `calendar_events` | `supabase/migrations/20260511070000_enable_calendar_events_rls.sql` | `supabase/tests/calendar-events-post-rls-verification.sql` | passed | applied and live-tested |
| `dispute_letters` | `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql` | `supabase/tests/dispute-letters-post-rls-verification.sql` | passed | skipped: table does not exist in production |
| `affiliates` | `supabase/migrations/20260511090000_enable_affiliates_rls.sql` | `supabase/tests/affiliates-post-rls-verification.sql` | passed | applied and live-tested |

## Policy Coverage

- Every migration enables RLS for exactly one table.
- Every migration uses a `SECURITY DEFINER` helper to evaluate account membership.
- Authenticated users receive only the table privileges needed for the protected table.
- Anonymous users receive no explicit table policy access.
- Child tables add same-account parent checks where schema-compatible:
  - `invoices.account_id`, `disputes.account_id`, and `calendar_events.account_id` are the enforced tenant boundaries.
  - `invoices.client_id`, `disputes.client_id`, and `calendar_events.client_id` validate against `clients.account_id` only when the production schema can safely compare the column types.
  - `dispute_letters.dispute_id` remains ready in the migration set, but production skipped it because the table does not exist.

## Production Rollout Result

Production RLS rollout completed on the existing production tables after data backfills and live smoke checks. No production apply was performed for missing tables.

Production data backfills performed before or during rollout:

| Table | Rows backfilled |
| --- | ---: |
| `leads` | 50 |
| `clients` | 8 |
| `invoices` | 1 |
| `disputes` | 5 |
| `calendar_events` | 74 |
| `affiliates` | 1 |

Live pages verified after apply:

- `/employees`
- `/leads`
- `/clients`
- `/billing`
- `/disputes`
- `/disputes/status`
- `/calendar`
- `/leads/affiliates`

Production issues found and fixed during rollout:

- Employees app save needed production-safe columns.
- Authenticated account membership reads required account/accounts membership read policies.
- Invoices, disputes, and calendar_events needed production-safe client_id compatibility helpers because production `clients.id` is `uuid` while some child `client_id` columns resolve differently.
- Affiliates page needed production schema support for `full_name`, `phone`, `company_name`, `referral_code`, `status`, `notes`, and row visibility after save.

Production reference materials:

- Read-only SQL audit: `supabase/audits/production-rls-preflight-readonly.sql`
- Runbook: [docs/phase-3-production-rls-preflight-runbook.md](./phase-3-production-rls-preflight-runbook.md)
- Manual production rollout checklist: [docs/phase-3-production-rls-rollout-checklist.md](./phase-3-production-rls-rollout-checklist.md)
- Account foundation read policy migration: `supabase/migrations/20260511100000_add_account_membership_read_policies.sql`

## Remaining Work

- Define customer portal identity and portal-specific RLS separately.
- Harden or remove the `dp_auth` bridge after the portal identity path is defined.
- Resolve duplicate React key warnings separately from the production RLS rollout.
- Run and record a final live smoke audit after the next production deployment.
