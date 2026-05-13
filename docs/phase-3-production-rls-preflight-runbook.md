# Phase 3 Production RLS Preflight Runbook

Date: 2026-05-13

Use this runbook before applying any future Phase 3-style RLS migration to production. The original Phase 3 production rollout has completed for the production tables that exist.

## Warning

This is a read-only audit step. Do not apply RLS yet. Do not run repair SQL from the production SQL Editor during this audit. The audit script is intended to identify blockers, not fix them.

Audit script: `supabase/audits/production-rls-preflight-readonly.sql`

The audit returns one combined results table with these columns:

- `audit_category`
- `table_name`
- `check_name`
- `finding_count`
- `severity`
- `blocks_rls`
- `notes`

## Recorded Production Audit Result

Run date: 2026-05-12

Based on the visible/exported production audit result provided by the operator:

- The read-only preflight audit script was run in production after the combined-output refactor.
- The combined output returned 29 rows.
- No blocker rows were observed in the provided result.
- Active private tables showed `0` total rows in the visible audit output.
- Visible `blocks_rls` values were `false`.

This note records the production preflight observation that preceded the rollout. The rollout later completed for `employees`, `leads`, `clients`, `invoices`, `disputes`, `calendar_events`, and `affiliates`. Production skipped `statuses` and `dispute_letters` because those tables do not exist in production.

## Production Rollout Completion Record

- RLS applied and live-tested: `employees`, `leads`, `clients`, `invoices`, `disputes`, `calendar_events`, `affiliates`.
- Skipped because table does not exist in production: `statuses`, `dispute_letters`.
- Live pages verified: `/employees`, `/leads`, `/clients`, `/billing`, `/disputes`, `/disputes/status`, `/calendar`, `/leads/affiliates`.
- Production backfills performed: leads 50 rows, clients 8 rows, invoices 1 row, disputes 5 rows, calendar_events 74 rows, affiliates 1 row.
- Issues fixed during rollout: employees production-safe save columns, account/accounts membership read policies, invoices/disputes/calendar_events client_id compatibility helpers, affiliates production schema and row visibility.

## How to Run

1. Open the production Supabase project.
2. Confirm you are in the production project before running anything.
3. Open SQL Editor.
4. Open `supabase/audits/production-rls-preflight-readonly.sql` locally.
5. Paste the full SQL into SQL Editor.
6. Run the full script.
7. Export or screenshot the single combined results table.
8. Record findings in the Phase 3 rollout notes before deciding whether production RLS can proceed.

## Safe to Proceed Criteria

Future production RLS can move to rollout planning only when all of these are true:

- Every protected table has `null_account_id_rows = 0`, or every remaining null row is explicitly documented as intentionally hidden after RLS.
- Orphan parent relationship counts are `0`.
- Cross-account parent/child mismatch counts are `0`.
- `accounts_without_memberships` is `0`, or each account without members is intentionally inactive and documented.
- `memberships_missing_account` is `0`.
- `users_with_multiple_accounts` is reviewed and confirmed expected for the product.
- Write-role semantics are approved for each table.
- Customer portal access is confirmed separate from business account membership policies.
- A backup or restore checkpoint exists.
- Rollback steps are reviewed for every table in the rollout.

## Blocking Results

Any of these block production RLS:

- Unexpected null `account_id` rows.
- Any orphan `client_id` or `dispute_id` relationship in the audited child tables.
- Any cross-account parent/child mismatch.
- Active production accounts with no membership coverage.
- Membership rows referencing missing accounts.
- Unreviewed users with multiple account memberships.
- Unresolved write-role decisions.
- Unresolved customer portal policy separation.
- No verified backup or restore checkpoint.

Do not continue to production RLS until blockers are repaired through a reviewed migration or an approved operational data fix.

## Findings Record

For each row in the combined results table, record:

- Run date and Supabase project.
- Person running the audit.
- Audit category, table name, and check name.
- `finding_count`.
- `severity` and `blocks_rls`.
- Whether the result is expected.
- Link to supporting ticket or migration for any repair.
- Final go/no-go decision.

## Suggested Rollout Order After a Clean Audit

For future tables, apply one production RLS migration at a time and stop after each table for verification. The original Phase 3 rollout used the table-by-table approach and completed for the existing production tables.

Original Phase 3 production result:

1. `statuses`: skipped, missing production table
2. `employees`: applied and verified
3. `leads`: applied and verified
4. `clients`: applied and verified
5. `invoices`: applied and verified
6. `disputes`: applied and verified
7. `calendar_events`: applied and verified
8. `dispute_letters`: skipped, missing production table
9. `affiliates`: applied and verified

## Post-Apply Verification

After each table is applied:

- Verify a real account member can read only their account rows.
- Verify expected account-scoped writes still work.
- Verify cross-account writes are blocked.
- Verify anon and no-membership users cannot access protected rows.
- Verify representative app workflows still load with production membership data.

## Backup and Rollback Reminder

Before the first production RLS migration:

- Take or verify a production backup or restore point.
- Confirm the rollback path for each table: drop the table's four policies, then disable RLS only if rollback is required.
- Do not remove `account_id` columns or delete business rows as part of rollback.
