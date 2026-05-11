# Phase 3 Disposable Supabase Readiness Runbook

Date: 2026-05-09

## Purpose

Use this runbook to validate the Phase 3 ownership pilots in a disposable Supabase database before any real RLS migration is applied.

This run is for proof, not deployment. It checks whether the current app query shapes and the two-account SQL readiness scripts behave as expected when seeded with realistic account memberships and owned rows.

## Warning

Do not run this against production.

Use a disposable Supabase project or a throwaway local database only.

## Prerequisites

- A disposable Supabase database or project.
- The account foundation migrations already applied.
- If the disposable database is blank, first run the account ownership foundation migration, then `supabase/tests/disposable-test-schema-setup.sql`.
- The ownership pilot migrations already applied for:
  - `statuses`
  - `employees`
  - `leads`
  - `clients`
  - `invoices`
  - `disputes`
  - `calendar_events`
  - `dispute_letters`
  - `affiliates`
- RLS still disabled for the tables being checked.
- A place to record pass/fail notes for each readiness script.

## Recommended Migration Order

Apply migrations in the same order the ownership pilots were introduced:

1. Account foundation
2. `statuses` ownership migrations
3. `employees` ownership migrations
4. `leads` ownership migrations
5. `clients` ownership migrations
6. `invoices` ownership migrations
7. `disputes` ownership migrations
8. `calendar_events` ownership migrations
9. `dispute_letters` ownership migrations
10. `affiliates` ownership migrations

If the disposable database starts from a clean schema snapshot, apply every schema migration in chronological order instead of cherry-picking individual files.

If the database only has the account foundation, run `supabase/tests/disposable-test-schema-setup.sql` before the readiness scripts.

## Readiness Script Order

Run the two-account readiness scripts in this order:

1. `supabase/tests/statuses-two-account-rls-readiness.sql`
2. `supabase/tests/employees-two-account-rls-readiness.sql`
3. `supabase/tests/leads-two-account-rls-readiness.sql`
4. `supabase/tests/clients-two-account-rls-readiness.sql`
5. `supabase/tests/invoices-two-account-rls-readiness.sql`
6. `supabase/tests/disputes-two-account-rls-readiness.sql`
7. `supabase/tests/calendar-events-two-account-rls-readiness.sql`
8. `supabase/tests/dispute-letters-two-account-rls-readiness.sql`
9. `supabase/tests/affiliates-two-account-rls-readiness.sql`

## What to Record

For each script, record:

- script name
- pass or fail
- any SQL error text
- whether the current pre-RLS query shape returned only the expected account rows
- whether insert, update, delete, or status-change checks behaved as expected
- whether the future post-RLS denial block still matches the intended policy shape

Keep the notes short and explicit. A simple pass/fail table is enough.

## How to Handle Audit Findings

### Null `account_id` rows

- Leave them null during the disposable run if the script is only validating behavior.
- Record the table name and row count.
- Before any real RLS migration, assign ownership or explicitly archive rows that should not be visible.

### Orphan rows

- Treat rows with missing or invalid parent references as blockers for real RLS.
- Record the orphan table, the broken foreign key, and the row count.
- Do not guess ownership for orphan rows in the disposable run.

### Cross-account parent/child mismatches

- Record every row where the child `account_id` does not match the parent row `account_id`.
- Treat mismatch counts as blockers for RLS apply.
- Fix or quarantine those rows before any production migration.

## Future Post-RLS Validation

After draft policies are applied in a disposable database, rerun the readiness scripts and confirm the cross-account denial blocks still fail as expected.

The key validation is simple:

- Account A can read and manage only Account A rows.
- Account B can read and manage only Account B rows.
- Anonymous users and users with no membership cannot read or write the private table.
- Parent/child ownership checks still hold for rows that reference another owned table.

## Reset / Rollback Guidance for the Disposable Database

If a script leaves the database in an unexpected state:

- drop the disposable database and recreate it, or
- restore the schema from a clean snapshot and rerun the migrations in order

Do not try to preserve the disposable state across failed ownership audits.

## Final Go / No-Go Checklist Before Any Real RLS Migration

- Every two-account readiness script passes in the disposable database.
- Null `account_id` rows are understood and either backfilled or intentionally excluded.
- Orphan rows are resolved, archived, or explicitly excluded.
- Cross-account parent/child mismatches are resolved.
- Write-role semantics are finalized for each table.
- Portal-specific access is modeled separately from business membership access.
- Draft policies are reviewed against the validated query shapes.
- The apply migration is reversible and only enables RLS after policies are ready.
