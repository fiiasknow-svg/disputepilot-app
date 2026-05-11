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
