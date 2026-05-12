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

- date run: 2026-05-12
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

### clients first RLS apply migration

- migration path: `supabase/migrations/20260511040000_enable_clients_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/clients-two-account-rls-readiness.sql` and `supabase/tests/clients-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes

### clients post-RLS verification

- verification script path: `supabase/tests/clients-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses, employees, and leads and must pass in a disposable session before any production apply

## invoices

- date run: 2026-05-12
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

### invoices first RLS apply migration

- migration path: `supabase/migrations/20260511050000_enable_invoices_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/invoices-two-account-rls-readiness.sql` and `supabase/tests/invoices-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes
- note: invoice insert/update checks also require any `client_id` to belong to the same `account_id` as the invoice

### invoices post-RLS verification

- verification script path: `supabase/tests/invoices-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses, employees, leads, and clients, with additional invoice/client account-match denial checks

## disputes

- date run: 2026-05-12
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

### disputes first RLS apply migration

- migration path: `supabase/migrations/20260511060000_enable_disputes_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/disputes-two-account-rls-readiness.sql` and `supabase/tests/disputes-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes
- note: dispute insert/update checks also require any `client_id` to belong to the same `account_id` as the dispute
- note: `dispute_letters` still require their own RLS; disputes RLS does not protect child letter rows by itself

### disputes post-RLS verification

- verification script path: `supabase/tests/disputes-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses, employees, leads, clients, and invoices, with additional dispute/client account-match denial checks

## calendar_events

- date run: 2026-05-12
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

### calendar_events first RLS apply migration

- migration path: `supabase/migrations/20260511070000_enable_calendar_events_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/calendar-events-two-account-rls-readiness.sql` and `supabase/tests/calendar-events-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes
- note: calendar event insert/update checks also require any `client_id` to belong to the same `account_id` as the calendar event

### calendar_events post-RLS verification

- verification script path: `supabase/tests/calendar-events-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses, employees, leads, clients, invoices, and disputes, with additional calendar event/client account-match denial checks

## dispute_letters

- date run: 2026-05-12
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

### dispute_letters first RLS apply migration

- migration path: `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/dispute-letters-two-account-rls-readiness.sql` and `supabase/tests/dispute-letters-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes
- note: dispute letter insert/update checks also require any `dispute_id` to belong to the same `account_id` as the dispute letter
- note: persisted letters, documents, templates, and portal letter access still require separate ownership and policy work if they become private persisted business data

### dispute_letters post-RLS verification

- verification script path: `supabase/tests/dispute-letters-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script uses the same helper-based authenticated-user pattern as statuses, employees, leads, clients, invoices, disputes, and calendar_events, with additional dispute letter/parent dispute account-match denial checks

## affiliates

- date run: 2026-05-12
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

### affiliates first RLS apply migration

- migration path: `supabase/migrations/20260511090000_enable_affiliates_rls.sql`
- test in disposable DB first: yes
- after applying in disposable DB: rerun `supabase/tests/affiliates-two-account-rls-readiness.sql` and `supabase/tests/affiliates-post-rls-verification.sql`
- production apply blocked until disposable post-RLS denial checks pass: yes
- note: affiliate policies use the same SECURITY DEFINER membership helper pattern as the prior Phase 3 RLS migrations

### affiliates post-RLS verification

- verification script path: `supabase/tests/affiliates-post-rls-verification.sql`
- status: pending disposable DB run
- note: this script verifies account isolation plus cross-account insert, update, and delete denials before any production apply

## Final Go / No-Go Summary

- Ready for first RLS apply candidate: yes
- Safest first RLS candidate: statuses or employees
- production preflight note: the read-only production RLS preflight audit was run on 2026-05-12 after the combined-output fix; based on the visible/exported operator-provided result, the combined output returned 29 rows, active private tables showed 0 total rows, and no blocker rows were observed. Production RLS apply remains a separate manual rollout decision.
- Blockers:
  - actual RLS migrations not applied yet
  - write-role semantics still need final decision
  - null/orphan/cross-account production audits still needed before production RLS
  - post-RLS denial checks must be rerun after enabling policies in disposable DB
  - statuses apply migration must pass disposable DB post-RLS checks before production use
  - statuses post-RLS verification must use the dedicated authenticated-user script, not the readiness script alone
