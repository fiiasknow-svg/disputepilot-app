# Phase 3 Auth and Data Isolation Audit

Date: 2026-05-06

## Git Checkpoint

- `git status --short`: clean before this audit file was added.
- `git log -3 --oneline`:
  - `24ef258 Fix CI safe behavior route failures`
  - `ebfa67b Fix Playwright specs to use local base URL`
  - `287756f Add route protection for private app pages`

## Current Auth Boundary

Current private route protection is implemented in `proxy.ts`.

- Private routes are matched by path prefix and redirected to `/login?next=...` when no auth signal is present.
- Public routes include `/`, `/login`, `/client-login`, `/reset-password`, `/academy`, `/get-customers`, `/partner-resources`, and `/affiliates`.
- `/api` routes are excluded by the proxy matcher.
- The current accepted auth signals are:
  - `dp_auth=1`
  - a cookie name matching `sb-*auth-token*`
  - `x-disputepilot-test-auth: 1` when `NODE_ENV !== "production"`

The `dp_auth` cookie is optimistic app state. It proves that the browser completed the local login flow at some point, but it is not a server-verified Supabase session.

Auth UI and client helpers:

- `lib/supabase.ts` creates a browser Supabase client from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- If Supabase env vars are missing, `lib/supabase.ts` returns a no-op fallback client.
- `app/login/page.tsx` renders the business login form.
- `app/client-login/page.tsx` renders the customer portal login form.
- `app/reset-password/page.tsx` renders password update UI.
- `components/AuthLoginForm.tsx` calls `supabase.auth.signInWithPassword`, sets `dp_auth=1`, supports reset email, and redirects after login.
- `components/ResetPasswordForm.tsx` calls `supabase.auth.updateUser`.
- `components/CDMLayout.tsx` and `components/ClientPortalLayout.tsx` call `supabase.auth.signOut`, clear `dp_auth`, clear matching local/session storage auth keys, and redirect to `/login`.

## Server-Verified Supabase Auth Feasibility

Server-verified auth is feasible, but not available with the current implementation alone.

- `@supabase/supabase-js` is installed.
- `@supabase/ssr` is not installed.
- The current Supabase client is browser-oriented and does not provide a server cookie bridge.
- The server/proxy can inspect cookies, but it cannot inspect browser `localStorage`, where the browser Supabase client normally stores session state.
- `proxy.ts` currently checks for Supabase-looking cookie names, but it does not verify the token with Supabase.
- Next 16 `proxy.ts` is compatible with cookie inspection and redirects. The Next docs also caution that Proxy is best for optimistic checks and should not be the only authorization boundary for data access.

The safest server-verified path is to add a server Supabase client helper, refresh/read Supabase auth cookies on the server, and verify with `auth.getUser()` before allowing private routes. The non-production Playwright bypass can remain in `proxy.ts` while real auth is introduced.

## Data Ownership Findings

| Area | Files inspected | Storage source | Ownership fields found | Current unauthenticated risk | RLS readiness blockers |
| --- | --- | --- | --- | --- | --- |
| Clients | `app/clients/page.tsx`, `app/clients/[id]/page.tsx` | Supabase `clients`; browser `localStorage` key `disputepilot.clients`; sample fallback data | `client_id` appears only in related `disputes`/`invoices` queries. No `user_id`, `account_id`, `company_id`, or `business_id` found. | Browser pages are route-protected, but client-side Supabase queries are unscoped. A forged `dp_auth` cookie can reach the page. Supabase anon access depends entirely on database policies. | Pick tenant owner field, add it to `clients`, backfill, update inserts/selects/updates/deletes to require owner, and add server-side authorization before enabling RLS. |
| Client detail | `app/clients/[id]/page.tsx` | Supabase `clients`, `disputes`, `invoices`; local client fallback; in-memory notes/docs/activity | Related rows use `client_id`; no tenant owner field found. | Direct client detail reads by `id` are unscoped except for route protection and any Supabase policies. | Client detail must verify the requested client belongs to the authenticated account before loading related data. |
| Leads | `app/leads/page.tsx`, `app/leads/affiliates/page.tsx` | Supabase `leads`, `affiliates`; browser `localStorage` key `disputepilot.leads` | No tenant owner field found. Lead-to-client conversion writes `clients` without owner. | Route-protected page, but Supabase lead CRUD is unscoped from the browser. | Add tenant owner to `leads` and `affiliates`; update conversion to preserve owner into `clients`. |
| Billing and invoices | `app/billing/BillingWorkspace.tsx`, `app/billing/pay-per-deletion/page.tsx`, billing route wrappers | Browser `localStorage` key `disputepilot.billing`; Supabase `clients` for options; Supabase `invoices` read indirectly by reports/calendar/client detail | `client_id` exists on invoice-related reads. No tenant owner field found. | Main billing data is browser-local, but invoice reads in reports/calendar/client detail are unscoped Supabase queries. | Decide whether invoices become persisted Supabase records; add tenant owner and verify client ownership for `client_id` references. |
| Disputes | `app/disputes/page.tsx`, `app/disputes/status/page.tsx`, `app/disputes/[id]/page.tsx`, `app/dispute-manager/furnisher-addresses/page.tsx` | Mixed static demo arrays, Supabase `disputes`/`dispute_letters`, browser `localStorage` for furnisher addresses and client suggestions | `client_id` links disputes to clients. No tenant owner field found. | Some dispute pages are demo-only, but status/detail pages read and write Supabase disputes by unscoped id. | Add tenant owner to `disputes` and `dispute_letters`; enforce ownership on status updates and detail reads. |
| Calendar/events | `app/calendar/page.tsx` | Supabase `calendar_events`, `clients`, `leads`, `invoices`, `disputes`; browser `localStorage` key `disputepilot.calendar-events` | `client_id` on events; no tenant owner field found. | Calendar aggregates unscoped data from several private tables. | Add tenant owner to `calendar_events` and scope all aggregate source queries by tenant. |
| Letters | `app/letters/page.tsx`, `app/letters/ai-rewriter/page.tsx`, `app/letter-vault/page.tsx`, `app/letters/vault/page.tsx` | Static template data, component state, API call to `/api/rewrite-letter`; `dispute_letters` read on dispute detail | `dispute_id` links generated letters to disputes. No tenant owner field found. | Saved letters in `app/letters/page.tsx` are in-memory only. `/api/rewrite-letter` is publicly reachable unless protected elsewhere. | Persisted letters need tenant owner or inherited ownership through verified dispute ownership; API routes need auth. |
| Reports | `app/reports/page.tsx` | Supabase aggregate reads from `clients`, `disputes`, `invoices`, `leads` | No tenant owner field found in queries. | Reports aggregate every row visible to the anon Supabase client. | Reports must query account-scoped data only, preferably via server-side data access or RLS-backed views/functions. |
| Company/settings | `app/company/*`, `app/settings/configuration/page.tsx` | Mostly local component state/static UI; Supabase `statuses` for configurable statuses | No tenant owner field found. | `statuses` CRUD is unscoped from the browser. Many company settings are not truly persisted yet. | Define account/company settings tables with owner columns before enabling RLS. Add owner to `statuses`. |
| Client portal | `app/client-login/page.tsx`, `components/ClientPortalLayout.tsx`, company portal configuration pages | Login UI exists; no real `/portal` page found in `app/`; company portal pages are admin-side configuration UI | No `customer_id` or portal identity mapping found. | Customer portal login uses the same Supabase auth helper, but there is no confirmed customer data boundary or portal data surface. | Define customer identity, client-to-user mapping, portal permissions, and client-scoped policies before exposing portal records. |
| API routes | `app/api/send-email/route.ts`, `app/api/analyze-credit/route.ts`, `app/api/rewrite-letter/route.ts` | Server routes calling Resend/OpenAI; no Supabase ownership checks | None | `/api` is excluded from proxy. These routes can be called without app route auth if deployed and env vars are present. | Add server auth checks, tenant rate limits/audit logging, and ownership validation for any record-specific API payloads. |

## Schema and RLS Readiness

Only one Supabase migration was found: `supabase/migrations/add_client_columns.sql`. It adds extra client profile fields but does not define tenant ownership fields, memberships, RLS policies, or backfill logic.

Do not enable RLS yet. Enabling RLS before ownership fields and policies are confirmed would either break the app or create incomplete isolation.

Before RLS, the app needs:

- A canonical tenant model, such as `accounts` or `businesses`.
- A membership/profile model mapping Supabase auth users to business accounts and roles.
- A client portal identity model mapping customer auth users to client records.
- Ownership fields on every persisted table: clients, leads, affiliates, disputes, dispute letters, invoices, calendar events, statuses, company settings, and any future saved letters/documents.
- Backfill migrations for existing records.
- Server-side data access helpers that always derive owner scope from the verified session, not from client-provided ids.
- API route auth checks for email, credit analysis, and AI rewrite endpoints.
- Tests for logged-out redirects, verified logged-in access, cross-account denial, and API denial.

## Smallest Safe Next Step

The smallest safe implementation step is to introduce server-side Supabase session verification without changing database isolation yet:

1. Add `@supabase/ssr`.
2. Create server/browser Supabase helper files that preserve the existing client login UI while writing Supabase auth cookies the server can read.
3. Update `proxy.ts` to verify private route access with `supabase.auth.getUser()` from cookies, while keeping the existing non-production Playwright bypass.
4. Keep `dp_auth` only as temporary compatibility during migration, or remove it after tests and production login are confirmed against server cookies.
5. Add focused tests for verified private route access and public routes.

After that, plan a schema migration for tenant ownership fields and backfill. RLS should be enabled only after the ownership model and data access changes are implemented and tested.
