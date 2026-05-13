# Phase 3 Production RLS Rollout Checklist

Date: 2026-05-13

This checklist records the completed Phase 3 production RLS rollout. It remains useful as the incident/change log for what was applied, skipped, verified, and left for follow-up.

## Final Rollout Status

Production RLS was applied and live-tested successfully for:

- `employees`
- `leads`
- `clients`
- `invoices`
- `disputes`
- `calendar_events`
- `affiliates`

Production skipped:

- `statuses`: table does not exist in production.
- `dispute_letters`: table does not exist in production.

Live pages verified after apply:

- `/employees`
- `/leads`
- `/clients`
- `/billing`
- `/disputes`
- `/disputes/status`
- `/calendar`
- `/leads/affiliates`

Production data backfills performed:

| Table | Rows backfilled |
| --- | ---: |
| `leads` | 50 |
| `clients` | 8 |
| `invoices` | 1 |
| `disputes` | 5 |
| `calendar_events` | 74 |
| `affiliates` | 1 |

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
| 1 | `statuses` | `supabase/migrations/20260511010000_enable_statuses_rls.sql` | Skipped in production because the table does not exist. |
| 2 | `employees` | `supabase/migrations/20260511020000_enable_employees_rls.sql` | Applied; `/employees` live-tested successfully. |
| 3 | `leads` | `supabase/migrations/20260511030000_enable_leads_rls.sql` | Applied; `/leads` live-tested successfully after 50-row ownership backfill. |
| 4 | `clients` | `supabase/migrations/20260511040000_enable_clients_rls.sql` | Applied; `/clients` live-tested successfully after 8-row ownership backfill. |
| 5 | `invoices` | `supabase/migrations/20260511050000_enable_invoices_rls.sql` | Applied; `/billing` live-tested successfully after 1-row ownership backfill and client_id compatibility helper fix. |
| 6 | `disputes` | `supabase/migrations/20260511060000_enable_disputes_rls.sql` | Applied; `/disputes` and `/disputes/status` live-tested successfully after 5-row ownership backfill and client_id compatibility helper fix. |
| 7 | `calendar_events` | `supabase/migrations/20260511070000_enable_calendar_events_rls.sql` | Applied; `/calendar` live-tested successfully after 74-row ownership backfill and client_id compatibility helper fix. |
| 8 | `dispute_letters` | `supabase/migrations/20260511080000_enable_dispute_letters_rls.sql` | Skipped in production because the table does not exist. |
| 9 | `affiliates` | `supabase/migrations/20260511090000_enable_affiliates_rls.sql` | Applied; `/leads/affiliates` live-tested successfully after 1-row ownership backfill and production schema UI fix. |

## Production Employees Checkpoint

- Production employees RLS was applied first.
- Employees app save needed production-safe columns before the production workflow was reliable.
- Employee save initially required account foundation read policies because the app must resolve the signed-in user's `account_id` from `account_memberships` before inserting an employee row.
- The account foundation read policy migration is `supabase/migrations/20260511100000_add_account_membership_read_policies.sql`.
- The policies allow authenticated users to read only their own `account_memberships` rows and the `accounts` rows where they are members.
- Employee save was verified in production after those read policies were applied manually.

## Production Leads And Clients Checkpoint

- Production leads RLS was applied and `/leads` was live-tested after 50 lead rows were backfilled with `account_id`.
- Production clients RLS was applied and `/clients` was live-tested after 8 client rows were backfilled with `account_id`.
- Account membership scoping remained the enforced tenant boundary.

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

## Production Calendar Events Checkpoint

- Production calendar_events RLS apply failed on 2026-05-13 in `supabase/migrations/20260511070000_enable_calendar_events_rls.sql`.
- Root cause: `public.clients.id` is `uuid` in production while `public.calendar_events.client_id` appears to be `bigint`; the original helper compared `clients.id = calendar_events.client_id`, producing `operator does not exist: uuid = bigint`.
- The calendar_events migration now keeps `account_id` membership as the required tenant boundary for SELECT/INSERT/UPDATE/DELETE and performs calendar event/client account validation only when `clients.id` and `calendar_events.client_id` are schema-compatible. This avoids over-blocking valid account-owned calendar events in the current production schema.
- Before retrying calendar_events RLS, confirm the migration file includes `public.calendar_events_client_account_validation_supported()` plus both PL/pgSQL helpers: `public.calendar_events_client_matches_account(bigint, uuid)` and `public.calendar_events_client_matches_account(uuid, uuid)`.

## Production Affiliates Checkpoint

- Production affiliates RLS was applied and `/leads/affiliates` was live-tested after 1 affiliate row was backfilled with `account_id`.
- The affiliates page needed production schema support after RLS because production uses `full_name`, `email`, `phone`, `company_name`, `referral_code`, `status`, `notes`, and `account_id`.
- Affiliate save/delete behavior now preserves account_id scoping and visible errors while rendering saved rows with production fields.

## App Workflow Checks

After each table migration, verify the relevant production UI as an authenticated account member:

- Dashboard loads without auth/session errors.
- Related list page loads without unexpected empty states.
- Related add or edit workflow still works where the UI supports writes.
- Search, clear, and navigation controls still work where applicable.
- A signed-out browser cannot access protected app data.
- A no-membership authenticated user cannot access protected table data.

## Final Verification

After all applicable production table migrations pass post-apply smoke checks:

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

Final rollout go/no-go: go for the seven existing production tables. `statuses` and `dispute_letters` remain skipped unless those tables are later introduced in production.

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
- Run and record a final live smoke audit.
