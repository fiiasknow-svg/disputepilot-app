# Phase 3 Production RLS Rollout Checklist

Date: 2026-05-12

Use this checklist only after the production preflight audit is current and clean. This is a production-impacting rollout. Do not apply more than one table migration at a time, and stop immediately if any verification step fails.

## Required Preflight

- Confirm a production backup or restore checkpoint exists before the first migration.
- Confirm the production read-only preflight audit was run against the correct production Supabase project.
- Confirm the combined audit output returned no blocker rows.
- Confirm app build is passing.
- Confirm GitHub Actions is green for the commit being deployed.
- Confirm production deployment is on the expected commit.
- Confirm the operator has the exact migration file open locally before pasting SQL into Supabase SQL Editor.
- Confirm the Supabase SQL Editor is pointed at production before each migration.
- Confirm the operator is not in a disposable, staging, or wrong customer project before each migration.

## Stop Criteria

Stop the rollout and do not apply the next table if any of these occur:

- SQL error while applying a migration.
- App workflow failure after a migration.
- Auth or session failure.
- Unexpected `401` or `403` responses.
- Expected account-owned rows disappear for a valid account member.
- Cross-account rows become visible.
- Expected account-scoped writes fail for a valid account member.
- Any uncertainty about which Supabase project is active.

## Rollout Steps

For each table:

1. Reconfirm the production Supabase project.
2. Open the exact migration file listed below.
3. Paste and run only that migration SQL.
4. Run the table-specific smoke checks.
5. Run representative app workflow checks.
6. Record the result and decide whether to continue.

| Step | Table | Migration file | Post-apply smoke verification |
| --- | --- | --- | --- |
| 1 | `statuses` | `supabase/migrations/20260511010000_enable_statuses_rls.sql` | Verify statuses load where used by disputes/leads, account members can read their account statuses, and anon/no-membership users cannot read statuses. |
| 2 | `employees` | `supabase/migrations/20260511020000_enable_employees_rls.sql` | Verify the employees page loads, account members can read and manage their account employees, and cross-account/no-membership access is blocked. |
| 3 | `leads` | `supabase/migrations/20260511030000_enable_leads_rls.sql` | Verify leads list/search/add/edit workflows for an account member, and confirm cross-account/no-membership access is blocked. |
| 4 | `clients` | `supabase/migrations/20260511040000_enable_clients_rls.sql` | Verify client list, add, edit, detail, search, and delete-safe workflows for an account member, and confirm cross-account/no-membership access is blocked. |
| 5 | `invoices` | `supabase/migrations/20260511050000_enable_invoices_rls.sql` | Verify billing invoice pages load, account-member invoice writes work, and invoices cannot be written with another account's `account_id`. Also verify cross-client write denial only when production schema confirms `invoices.client_id` is compatible with `clients.id`. |
| 6 | `disputes` | `supabase/migrations/20260511060000_enable_disputes_rls.sql` | Verify dispute list/detail/status workflows load, account-member dispute writes work, and disputes cannot be written with another account's `account_id`. Also verify cross-client write denial only when production schema confirms `disputes.client_id` is compatible with `clients.id`. |
| 7 | `calendar_events` | `supabase/migrations/20260511070000_enable_calendar_events_rls.sql` | Verify calendar events load and can be created for the account, and events cannot be written with another account's `account_id` or `client_id`. |
| 8 | `dispute_letters` | `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql` | Verify dispute letter workflows load for account-owned disputes, and letters cannot be written with another account's `account_id` or `dispute_id`. |
| 9 | `affiliates` | `supabase/migrations/20260511090000_enable_affiliates_rls.sql` | Verify affiliate list/add/delete workflows for an account member, and confirm cross-account/no-membership access is blocked. |

## Production Employees Checkpoint

- Production employees RLS was applied first.
- Employee save initially required account foundation read policies because the app must resolve the signed-in user's `account_id` from `account_memberships` before inserting an employee row.
- The account foundation read policy migration is `supabase/migrations/20260511100000_add_account_membership_read_policies.sql`.
- The policies allow authenticated users to read only their own `account_memberships` rows and the `accounts` rows where they are members.
- Employee save was verified in production after those read policies were applied manually.

## Production Invoices Checkpoint

- Production invoices RLS apply initially failed on 2026-05-13 in `supabase/migrations/20260511050000_enable_invoices_rls.sql`.
- Root cause: `public.clients.id` is `uuid` in production while `public.invoices.client_id` appears to be `bigint`; the helper compared `clients.id = invoices.client_id`, producing `operator does not exist: uuid = bigint`.
- The invoices migration now keeps `account_id` membership as the required tenant boundary for SELECT/INSERT/UPDATE/DELETE and performs invoice/client account validation only when `clients.id` and `invoices.client_id` are schema-compatible. This avoids over-blocking valid account-owned invoices in the current production schema.
- A later production retry resolved the policy call as `public.invoices_client_matches_account(uuid, uuid)`, so the migration now includes both `bigint` and `uuid` overloads. The uuid overload validates only a real `clients.id = p_client_id` and same `account_id` match.
- Before retrying invoices RLS, confirm the migration file includes `public.invoices_client_account_validation_supported()` plus both PL/pgSQL helpers: `public.invoices_client_matches_account(bigint, uuid)` and `public.invoices_client_matches_account(uuid, uuid)`.

## Production Disputes Checkpoint

- Production disputes RLS apply failed on 2026-05-13 in `supabase/migrations/20260511060000_enable_disputes_rls.sql`.
- Root cause: `public.clients.id` is `uuid` in production while `public.disputes.client_id` appears to be `bigint`; the original helper compared `clients.id = disputes.client_id`, producing `operator does not exist: uuid = bigint`.
- The disputes migration now keeps `account_id` membership as the required tenant boundary for SELECT/INSERT/UPDATE/DELETE and performs dispute/client account validation only when `clients.id` and `disputes.client_id` are schema-compatible. This avoids over-blocking valid account-owned disputes in the current production schema.
- Before retrying disputes RLS, confirm the migration file includes `public.disputes_client_account_validation_supported()` plus both PL/pgSQL helpers: `public.disputes_client_matches_account(bigint, uuid)` and `public.disputes_client_matches_account(uuid, uuid)`.

## App Workflow Checks

After each table migration, verify the relevant production UI as an authenticated account member:

- Dashboard loads without auth/session errors.
- Related list page loads without unexpected empty states.
- Related add or edit workflow still works where the UI supports writes.
- Search, clear, and navigation controls still work where applicable.
- A signed-out browser cannot access protected app data.
- A no-membership authenticated user cannot access protected table data.

## Final Verification

After all nine table migrations pass post-apply smoke checks:

1. Run `npm run build` locally against the production-bound code.
2. Run the full Playwright suite: `npx playwright test --project=chromium --config=playwright.config.ts`.
3. Confirm live auth routes: login, logout, reset password, and protected-route redirect behavior.
4. Confirm live dashboard checks.
5. Confirm live clients checks.
6. Confirm live leads checks.
7. Confirm live billing checks.
8. Confirm live dispute checks.
9. Confirm live calendar checks.
10. Confirm live settings/configuration checks.
11. Record final go/no-go and any follow-up defects.

## Rollback Notes

- Prefer Supabase backup/restore for serious production data or access regressions.
- Emergency `alter table <table_name> disable row level security;` commands should be used only with explicit approval and a written incident note.
- Do not casually drop policies in production.
- Do not remove `account_id` columns.
- Do not delete business rows as part of rollback.
- If rollback is needed for one table, stop the rollout and reassess before touching later tables.

## Remaining Follow-Up

- Define and implement client portal-specific policy separation.
- Remove or harden the `dp_auth` bridge after production RLS behavior is proven.
- Resolve duplicate React key warnings separately from the production RLS rollout.
