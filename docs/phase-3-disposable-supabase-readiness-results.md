# Phase 3 Disposable Supabase Readiness Results

Date started: 2026-05-11

Disposable Supabase project / database: disposable Supabase DB via SQL Editor

## How to Use

Fill this document only after running the disposable Supabase validation runbook.
Record facts from the actual SQL output. Do not infer pass/fail.

## statuses

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/statuses-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

### statuses first RLS apply migration

- migration path: `supabase/migrations/20260511010000_enable_statuses_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/statuses-two-account-rls-readiness.sql` and confirm the post-RLS block passes
- production apply blocked until disposable post-RLS denial checks pass: yes

### statuses post-RLS verification

- attempted: yes
- result: still returned false
- note: the first disposable verification run hit a temp results table permission issue; the script was patched to grant authenticated access. The second run hit an empty IN-list cleanup bug; the script was patched again. The readiness script is not a reliable authenticated-user RLS test by itself; use `supabase/tests/statuses-post-rls-verification.sql` instead
- note: the disposable post-RLS verification also exposed missing authenticated table grants on `public.statuses`; the apply migration was patched to grant table access before policies run
- note: the disposable post-RLS verification also exposed a missing authenticated `SELECT` grant on `public.account_memberships`; the apply migration was patched so status policies can evaluate membership for authenticated users
- note: the disposable verification script now documents the `account_memberships` dependency explicitly
- note: a mixed PASS/FAIL run followed; visibility and insert/update/delete checks were tightened so zero-row effects are treated as blocked, not success
- note: the latest disposable rerun mostly passed but exposed a delete-check setup issue; the verification script now seeds separate update and delete targets and snapshots the protected rows with a disposable helper
- note: the latest disposable rerun mostly passed but exposed an idempotent cleanup/counting issue; the verification script now clears prior disposable statuses fixtures up front and counts only the seeded visible Account B row
- status: requires rerun after verification-script fix before production RLS

## employees

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/employees-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

### employees first RLS apply migration

- migration path: `supabase/migrations/20260511020000_enable_employees_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/employees-two-account-rls-readiness.sql` and confirm the post-RLS block passes
- production apply blocked until disposable post-RLS denial checks pass: yes

### employees post-RLS verification

- verification script path: `supabase/tests/employees-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based pattern as statuses and must be executed with an authenticated disposable session before any production apply

## leads

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/leads-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

### leads first RLS apply migration

- migration path: `supabase/migrations/20260511030000_enable_leads_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/leads-two-account-rls-readiness.sql` and `supabase/tests/leads-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes

### leads post-RLS verification

- verification script path: `supabase/tests/leads-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses and employees and must pass in a disposable session before any production apply

## clients

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/clients-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## invoices

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/invoices-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## disputes

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/disputes-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## calendar_events

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/calendar-events-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## dispute_letters

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/dispute-letters-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## affiliates

- date run: 2026-05-11
- disposable DB/project used: disposable Supabase DB via SQL Editor
- script path: `supabase/tests/affiliates-two-account-rls-readiness.sql`
- pass/fail: pre-RLS readiness run passed / no SQL error reported
- SQL errors: none reported
- scoped read result: passed in disposable DB
- insert/update/delete result: passed in disposable DB
- null `account_id` findings: not audited in this run
- orphan row findings: not audited in this run
- cross-account mismatch findings: not audited in this run
- notes/fixes needed: rerun post-RLS checks after future RLS apply migration

## Final Go / No-Go Summary

- Ready for first RLS apply candidate: yes
- Safest first RLS candidate: statuses or employees
- Blockers:
  - actual RLS migrations not applied yet
  - write-role semantics still need final decision
  - null/orphan/cross-account production audits still needed before production RLS
  - post-RLS denial checks must be rerun after enabling policies in disposable DB
  - statuses apply migration must pass disposable DB post-RLS checks before production use
  - statuses post-RLS verification must use the dedicated authenticated-user script, not the readiness script alone
