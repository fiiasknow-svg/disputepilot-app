# Phase 4 dp_auth Bridge Audit

Date: 2026-05-14

## Scope

This audit records where the temporary `dp_auth` bridge is still used and recommends the safest hardening/removal path. It does not change runtime behavior, migrations, tests, or production configuration.

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
  - Private route access is allowed when Supabase SSR auth verifies successfully, or when `dp_auth=1`, or when the non-production `x-disputepilot-test-auth: 1` header is present.
  - The private route list includes both business routes and `/portal`, so the bridge can currently allow navigation to both business and portal route surfaces.

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
4. If Supabase verification fails, `dp_auth=1` still allows the route.
5. In non-production, `x-disputepilot-test-auth: 1` also allows the route.
6. Otherwise the user is redirected to `/login?next=<path>`.

This means `dp_auth` is currently a route-navigation bridge, not a database permission. RLS and API helpers still need server-verified Supabase identity.

## Risk Summary

Current risk level: medium for route access, lower for database/API access.

The main risk is that `dp_auth` is a client-set cookie. If it is present without a valid Supabase session, `proxy.ts` still allows access to private pages. The pages may still fail to read protected Supabase data because RLS and API helpers do not trust `dp_auth`, but the application shell and any client-side fallback/demo behavior can still be reached.

Portal-specific risk is higher than business route risk because `/portal` must eventually enforce a narrower per-client boundary. `dp_auth` must not be accepted as proof of portal identity.

Immediate removal risk:

- Real login/logout flows might break if production browser login is still relying on `dp_auth` because Supabase SSR cookies are not consistently available to `proxy.ts` after `signInWithPassword()`.
- Existing Playwright full-suite access should mostly continue because tests use `x-disputepilot-test-auth: 1` in non-production, but production-like manual login should be verified before removal.
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

- Add tests that prove a request with `dp_auth=1` but no Supabase session does not authorize API access.
- Add a route-protection test that documents current behavior before changing it.
- Add a production-like login smoke test that signs in through Supabase and verifies private route access without depending on `dp_auth`.
- Once Supabase SSR cookie verification is proven reliable after login, change `proxy.ts` so `dp_auth` is ignored in production.

Code-only improvement to consider, but not applied in this audit:

- Restrict `hasAuthBridgeCookie(request)` to non-production in `proxy.ts`, matching the existing test-header guard. This is a narrow hardening step, but it should wait until production login has been live-smoked with Supabase SSR cookies only.

Final removal plan:

1. Verify production login creates SSR-readable Supabase auth cookies and private business routes load without `dp_auth`.
2. Add automated coverage for `dp_auth=1` without Supabase session:
   - private business route behavior after hardening;
   - `/portal` route behavior after portal pages exist;
   - API routes still return 401.
3. Change `proxy.ts` to ignore `dp_auth` in production.
4. Remove `setAuthCookie()` from `components/AuthLoginForm.tsx` after production login is confirmed stable without the bridge.
5. Remove `dp_auth` clear logic from layouts after the cookie is no longer set.
6. Keep the non-production `x-disputepilot-test-auth` bypass limited to Playwright/local tests unless it is replaced with a stronger test auth fixture.

## Tests Needed Before Removal

- Business login succeeds and redirects to `/dashboard` with only Supabase cookies.
- Logged-out `/dashboard` redirects to `/login?next=%2Fdashboard`.
- `dp_auth=1` without Supabase session cannot authorize API routes.
- After hardening, `dp_auth=1` without Supabase session cannot authorize production private routes.
- Customer login does not grant business dashboard access unless the user has business `account_memberships`.
- Portal route tests, once `/portal` exists:
  - mapped portal user can access portal pages;
  - unmapped authenticated user is denied;
  - anon is denied;
  - `dp_auth=1` alone is denied;
  - business-only account member is not treated as a portal user.

## Recommended Next 3 Tasks

1. Add targeted auth tests for `dp_auth=1` without Supabase session across API routes and private route access.
2. Live-smoke production business login with Supabase SSR cookies only, then harden `proxy.ts` to ignore `dp_auth` in production.
3. Build `/portal` routes server-first with `getCurrentClientPortalContext()` and add portal isolation tests before any production portal RLS apply.
