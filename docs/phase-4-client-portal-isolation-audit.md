# Phase 4 Client Portal Isolation Audit

Date: 2026-05-14

## Scope

This audit reviews the current client portal authentication and data access model after Phase 3 production RLS was completed for the active business tables:

- `employees`
- `leads`
- `clients`
- `invoices`
- `disputes`
- `calendar_events`
- `affiliates`

Production skipped `statuses` and `dispute_letters` because those tables do not exist in production.

No runtime behavior, migrations, production data, or tests were changed for this audit.

Follow-up staged artifacts added after this audit:

- `docs/phase-4-client-portal-rls-plan.md`
- `supabase/policies/drafts/client-portal-users-rls-policy-draft.sql`
- `supabase/migrations/20260514010000_add_client_portal_users.sql`
- `supabase/tests/client-portal-users-schema-readiness.sql`

The staged migration is schema-only and must be verified in disposable Supabase before any production apply. It does not enable RLS or change runtime app behavior.

## Git Checkpoint

`git status --short` before this audit document was added was clean.

`git log -10 --oneline`:

```text
868993e Document production RLS rollout completion
10190a8 Fix affiliate row visibility after save
c55dfd2 Fix affiliates page for production schema
df9d570 Fix calendar events RLS client match overloads
8eaa634 Fix disputes RLS client match overloads
fc14ca2 Fix invoices RLS client match overloads
8a0d268 Fix invoices RLS for production client id type
f4d9610 Add account membership read policies
aad41a1 Allow controlled employee save error in test
1828fb2 Remove Claude worktree submodule artifact
```

## Files Inspected

- `app/client-login/page.tsx`
- `components/ClientPortalLayout.tsx`
- `components/AuthLoginForm.tsx`
- `proxy.ts`
- `lib/api-auth.ts`
- `lib/account-context.ts`
- `lib/supabase-browser.ts`
- `lib/supabase-server.ts`
- `app/company/portals/page.tsx`
- `app/company/manage-portal-content/page.tsx`
- portal/auth-related tests including `tests/auth-foundation.spec.ts`, `tests/portals-save-behavior.spec.ts`, `tests/portals-compare.spec.ts`, `tests/company-settings-pages-smoke.spec.ts`, and route smoke coverage

No root `app/client-portal` directory exists in this checkout. No root `app/portal` directory exists either, even though `components/ClientPortalLayout.tsx` and `proxy.ts` reference `/portal`.

## Current Portal Auth Flow

`app/client-login/page.tsx` renders `AuthLoginForm` with customer-facing labels:

- title: `Customer Portal Login`
- description: client portal copy
- alternate link: `/login`

The underlying login behavior is shared with the business login page:

- `components/AuthLoginForm.tsx` calls `supabase.auth.signInWithPassword({ email, password })`.
- On success it sets `dp_auth=1`.
- If a safe `next` query string is present, it redirects there; otherwise it uses the optional `redirectTo` prop.
- The client portal page does not pass a portal-specific `redirectTo`.
- Password reset is Supabase Auth-based on the shared form, but the client login page leaves `showForgotPassword` at the default `false`.

`proxy.ts` protects `/portal` under the same `privatePrefixes` list as the business application. It allows access when one of these is true:

- Supabase SSR cookies are present and `supabase.auth.getUser()` verifies a user.
- `dp_auth=1` is present.
- Non-production requests include `x-disputepilot-test-auth: 1`.

There is no separate portal session type, no portal-specific role check, and no check that the authenticated Supabase user maps to a client record.

## Current Portal Data Access

There is no implemented root portal data surface in this checkout:

- No `app/portal` pages were found.
- No `app/client-portal` pages were found.
- `components/ClientPortalLayout.tsx` contains navigation for `/portal`, `/portal/disputes`, `/portal/documents`, `/portal/messages`, and `/portal/education`, but no matching routes exist.

The existing client portal-related business pages are configuration/demo surfaces:

- `app/company/portals/page.tsx` stores portal/mobile app settings only in component state.
- `app/company/manage-portal-content/page.tsx` uses static sample article data and component state.
- `app/clients/page.tsx` and `app/clients/[id]/page.tsx` expose a `portal_access` flag on client records, but this flag is not tied to a Supabase Auth user or portal login.

Current Supabase access from pages that contain real business data uses the business account model:

- Pages call `supabase.auth.getUser()`.
- Pages read `account_memberships` for the signed-in user.
- Pages scope business table reads and writes by `account_id` where the Phase 3 work has been applied.
- Production RLS policies use account membership as the enforced business tenant boundary.

No portal page currently reads `clients`, `invoices`, `disputes`, documents, messages, or education records as a mapped client user.

## Client User Mapping

No portal-user mapping table or helper was found at the time of this audit.

Missing pieces:

- No `client_portal_users` table exists in the inspected runtime code.
- No helper resolves a current portal user to `account_id` plus `client_id`.
- No policy separates business account members from customer portal users.
- `clients.portal_access` is only a business-side flag today; it does not authenticate a client or grant scoped row access.

Because of that, portal users are not currently tied to client rows in a way RLS can enforce.

The next staged migration path is `supabase/migrations/20260514010000_add_client_portal_users.sql`. It creates `public.client_portal_users` with a `client_id` column matching the target database `public.clients.id` type, plus mapping indexes and uniqueness. The migration intentionally leaves RLS and app wiring for later steps.

## Account Membership Reuse Risk

The current production RLS policies correctly protect business tables for business users through `account_memberships`.

That policy shape should not be reused directly for customer portal users. If a customer Supabase Auth user is added to `account_memberships` just to make portal access work, that user would match the same business tenant boundary used by the dashboard. Depending on grants and UI/API routes, this could expose business-wide rows for the account instead of only the customer's own client row and child records.

Recommended separation:

- Keep `account_memberships` for internal business users only.
- Add a dedicated portal mapping such as `client_portal_users(account_id, client_id, user_id, status)`.
- Use portal-specific policies that require both `account_id` and `client_id` to match the portal mapping.
- Expose only portal-safe columns and child records.

## Risks Remaining After Business-Table RLS

- `/client-login` authenticates with the same Supabase Auth project as business login and does not distinguish user type.
- `dp_auth=1` is still accepted by `proxy.ts` as a route access bridge. It is not equivalent to a server-verified Supabase session.
- `/portal` is listed as private but has no route implementation, so the intended data boundary is not yet exercised by app code.
- There is no enforced customer-to-client mapping.
- `clients.portal_access` can imply portal readiness in the UI, but it is not an authorization boundary.
- Business-table RLS protects account-owned rows from cross-business access, but it does not by itself provide per-client portal isolation inside the same business account.
- If future portal pages reuse dashboard queries, a portal user with business membership could inherit broader access than intended.
- Tests currently verify login page rendering, route redirects, business app access, API auth denial, and company portal configuration UI. They do not verify portal user isolation or cross-client denial.

## Safest Implementation Plan

1. Define the portal identity model before exposing portal data.
   - Add a `client_portal_users` ownership table with `account_id`, `client_id`, `user_id`, `status`, timestamps, and unique constraints for active mappings.
   - Do not infer mappings from matching email addresses without an explicit invite or confirmation flow.
   - Verify `supabase/tests/client-portal-users-schema-readiness.sql` in disposable before production apply.

2. Add server-side portal context resolution.
   - Create a helper that verifies the Supabase session and returns only the mapped portal client context.
   - Keep it separate from `getCurrentAccountContext()` so portal requests cannot accidentally become business account-member requests.

3. Add portal-specific RLS policies.
   - Business policies continue to use `account_memberships`.
   - Portal policies use `client_portal_users` and require the row's `account_id` and `client_id` to match the authenticated user mapping.
   - For `clients`, expose the mapped client row only.
   - For `disputes`, `invoices`, and future documents/messages, expose only mapped-client child rows and only portal-safe columns.

4. Build portal pages server-first.
   - Implement `/portal` and child routes with server-verified portal context.
   - Avoid client-side broad Supabase table queries.
   - Do not trust `account_id` or `client_id` from the browser.

5. Harden or remove `dp_auth`.
   - Once Supabase SSR cookies are confirmed for production login paths, remove `dp_auth` as an authorization signal or restrict it to non-production compatibility only.
   - Keep the Playwright test bypass limited to non-production.

## Tests Needed

- `/client-login` renders and performs Supabase Auth login without granting business dashboard access unless the user also has business membership.
- A portal user mapped to client A can read only client A portal profile data.
- A portal user mapped to client A cannot read client B, client B disputes, client B invoices, or account-wide lists.
- A business user can continue reading business-scoped rows through `account_memberships`.
- An authenticated Supabase user with no `account_memberships` and no `client_portal_users` mapping receives no business or portal data.
- Anon users receive no portal data.
- `dp_auth` alone cannot access production private or portal data after the bridge is hardened/removed.
- API routes that later serve portal data require portal context and reject business-only or unmapped users where appropriate.

## Recommendation

Separate client portal users from business `account_memberships`.

Use `account_memberships` only for internal dashboard users. Use a dedicated `client_portal_users` mapping for customers, and write portal policies around both `account_id` and `client_id`. This preserves the Phase 3 business tenant boundary while adding the narrower per-client boundary the portal needs.

## Recommended Next 3 Tasks

1. Add a schema-only `client_portal_users` design draft and RLS policy draft, without applying it to production.
2. Add a server helper design for portal context resolution that is separate from `getCurrentAccountContext()`.
3. Add failing-first isolation tests for mapped portal user, unmapped authenticated user, cross-client denial, anon denial, and `dp_auth` bridge behavior.
