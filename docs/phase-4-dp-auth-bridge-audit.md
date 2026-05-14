# Phase 4 dp_auth Bridge Audit

Date: 2026-05-14

## Scope

This audit records where the temporary `dp_auth` bridge is still used, the applied production route hardening, and the remaining removal path. It does not change migrations, database/RLS behavior, or production configuration.

Current checkpoint:

- Production business RLS is complete and verified for active production tables.
- Client portal isolation audit is complete.
- `client_portal_users` schema is staged.
- `lib/client-portal-context.ts` exists and does not use `dp_auth`.
- Disposable portal RLS verification passed with `passed = true` for all checks.

## Git Checkpoint

`git status --short` before this audit was added was clean.

`git log -10 --oneline`:

```text
f5901c9 Record client portal RLS verification
b4a1e34 Add client portal RLS verification draft
d4fc2ef Add client portal context helper
98b3f3d Fix portal users readiness schema tolerance
ab05ba6 Add staged client portal users schema
2be8ecd Draft client portal RLS plan
77e35fe Audit client portal isolation
868993e Document production RLS rollout completion
10190a8 Fix affiliate row visibility after save
c55dfd2 Fix affiliates page for production schema
```

## Files Reviewed

- `proxy.ts`
- `components/AuthLoginForm.tsx`
- `components/CDMLayout.tsx`
- `components/ClientPortalLayout.tsx`
- `lib/api-auth.ts`
- `lib/client-portal-context.ts`
- `app/login/page.tsx`
- `app/client-login/page.tsx`
- `tests/auth-foundation.spec.ts`
- `playwright.config.ts`

## Usage Map

`dp_auth` is set in one place:

- `components/AuthLoginForm.tsx`
  - After `supabase.auth.signInWithPassword({ email, password })` succeeds, the form sets `dp_auth=1` for seven days with `SameSite=Lax` and `Secure` only on HTTPS.
  - The same form is used by `/login` and `/client-login`, so both business login and client login set the same bridge cookie.

`dp_auth` is cleared in two places:

- `components/CDMLayout.tsx`
  - Business dashboard sign-out calls `supabase.auth.signOut()`, clears `dp_auth`, clears local/session storage keys containing Supabase/auth markers, and routes to `/login`.
- `components/ClientPortalLayout.tsx`
  - Portal layout sign-out performs the same clear behavior and routes to `/login`.

`dp_auth` is read in one place:

- `proxy.ts`
  - `hasAuthBridgeCookie()` checks whether `dp_auth=1`.
  - Production private route access is allowed only when Supabase SSR auth verifies successfully.
  - In non-production only, `dp_auth=1` can still support local/demo route navigation unless the request explicitly disables test auth with `x-disputepilot-test-auth: 0`.
  - The private route list includes both business routes and `/portal`, so production portal and business route shells no longer accept `dp_auth` as route authorization.

`dp_auth` is not used for API/database authorization:

- `lib/api-auth.ts` requires server-verified Supabase Auth or the non-production test header. It does not read `dp_auth`.
- `lib/account-context.ts` uses Supabase Auth plus `account_memberships`.
- `lib/client-portal-context.ts` uses Supabase Auth plus `client_portal_users`.
- The disposable portal RLS verifier proved database policies depend on `auth.uid()` and `client_portal_users`, not `dp_auth`.

## Current Auth Behavior

`proxy.ts` checks Supabase first:

1. If the route is public, it allows the request.
2. If the route is private, it tries `supabase.auth.getUser()` through the SSR cookie client when Supabase auth cookies are present.
3. If Supabase verification succeeds, the route is allowed.
4. If Supabase verification fails in production, `dp_auth=1` is ignored.
5. If Supabase verification fails in non-production, `dp_auth=1` can still allow the route unless the request has `x-disputepilot-test-auth: 0`.
6. In non-production, `x-disputepilot-test-auth: 1` also allows the route.
7. Otherwise the user is redirected to `/login?next=<path>`.

This means `dp_auth` is now a non-production route-navigation bridge only, not a production route gate and not a database permission. RLS and API helpers still need server-verified Supabase identity.

## Risk Summary

Current risk level: lower for production route access and lower for database/API access.

The main remaining risk is local/demo compatibility drift. `dp_auth` is still set and cleared by the app, and in non-production it can still support route-shell navigation. In production, `proxy.ts` ignores the cookie and requires verified Supabase SSR auth for private routes.

Portal-specific production route risk is reduced because `/portal` now requires verified Supabase SSR auth at the proxy. Portal data must still be gated by `getCurrentClientPortalContext()` and `client_portal_users` once routes exist.

Immediate removal risk:

- Real login/logout flows might break if production browser login was still relying on `dp_auth` because Supabase SSR cookies were not consistently available to `proxy.ts` after `signInWithPassword()`. Production login should be live-smoked after this hardening.
- Existing Playwright full-suite access should continue because tests use `x-disputepilot-test-auth: 1` in non-production, while production-like auth-disabled tests use `x-disputepilot-test-auth: 0`.
- `/client-login` currently has no portal-specific redirect, and no `/portal` routes exist yet, so removing `dp_auth` before portal routes are built would not prove portal isolation by itself.

## Required Rules

- `dp_auth` must never authorize API access.
- `dp_auth` must never authorize database access.
- `dp_auth` must never authorize portal data.
- Portal data must use server-verified Supabase Auth plus `client_portal_users` through `getCurrentClientPortalContext()`.
- Business data must continue to use server-verified Supabase Auth plus `account_memberships`.
- The non-production Playwright header must remain non-production only.

## Recommended Hardening Path

Short-term safe changes:

- Added `tests/auth-foundation.spec.ts` coverage proving `dp_auth=1` with no Supabase session does not authorize `/api/send-email`, `/api/analyze-credit`, or `/api/rewrite-letter`.
- Added `tests/auth-foundation.spec.ts` coverage proving `dp_auth=1` with no Supabase session redirects away from `/dashboard` when test auth is disabled.
- Hardened `proxy.ts` so `dp_auth` is ignored in production route protection.
- Add a production-like login smoke test that signs in through Supabase and verifies private route access without depending on `dp_auth`.

Hardening applied:

- `hasAuthBridgeCookie(request)` now returns true only when `NODE_ENV !== "production"`, the request has not disabled test auth with `x-disputepilot-test-auth: 0`, and `dp_auth=1` is present.

Final removal plan:

1. Verify production login creates SSR-readable Supabase auth cookies and private business routes load without `dp_auth`.
2. Add automated coverage for `dp_auth=1` without Supabase session:
   - private business route behavior after hardening;
   - `/portal` route behavior after portal pages exist;
   - API routes still return 401.
3. Keep `proxy.ts` ignoring `dp_auth` in production.
4. Remove `setAuthCookie()` from `components/AuthLoginForm.tsx` after production login is confirmed stable without the bridge.
5. Remove `dp_auth` clear logic from layouts after the cookie is no longer set.
6. Keep the non-production `x-disputepilot-test-auth` bypass limited to Playwright/local tests unless it is replaced with a stronger test auth fixture.

## Tests Needed Before Removal

- Business login succeeds and redirects to `/dashboard` with only Supabase cookies.
- Logged-out `/dashboard` redirects to `/login?next=%2Fdashboard`.
- `dp_auth=1` without Supabase session cannot authorize API routes. Covered for `/api/send-email`, `/api/analyze-credit`, and `/api/rewrite-letter`.
- `dp_auth=1` without Supabase session cannot authorize production-like private route access when test auth is disabled. Covered for `/dashboard`.
- Customer login does not grant business dashboard access unless the user has business `account_memberships`.
- Portal route tests, once `/portal` exists:
  - mapped portal user can access portal pages;
  - unmapped authenticated user is denied;
  - anon is denied;
  - `dp_auth=1` alone is denied;
  - business-only account member is not treated as a portal user.

## Recommended Next 3 Tasks

1. Live-smoke production business login with Supabase SSR cookies only after deploying the proxy hardening.
2. Remove `setAuthCookie()` and layout `dp_auth` clearing after production login remains stable without the bridge.
3. Build `/portal` routes server-first with `getCurrentClientPortalContext()` and add portal isolation tests before any production portal RLS apply.
