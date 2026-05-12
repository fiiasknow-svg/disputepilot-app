# Phase 3 Production RLS Preflight Runbook

Date: 2026-05-12

Use this runbook before applying any Phase 3 RLS migration to production.

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

This note records the production preflight observation only. Production RLS apply remains a separate manual rollout decision and should not proceed without the required backup/restore checkpoint, rollout order review, and post-apply verification plan.

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

Production RLS can move to rollout planning only when all of these are true:

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

Apply one production RLS migration at a time and stop after each table for verification.

1. `statuses`
2. `employees`
3. `leads`
4. `clients`
5. `affiliates`
6. `invoices`
7. `disputes`
8. `calendar_events`
9. `dispute_letters`

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
