# DisputePilot Sale Readiness README

## What DisputePilot Is

DisputePilot is a Next.js application for credit-repair/dispute-management operations. The repository includes authenticated business/admin surfaces, client/customer management, disputes, letters, billing screens, leads and affiliates, calendar/reminders, company settings, portals/mobile-app settings, automation pages, training/academy pages, partner resources, public intake forms, and Playwright coverage for the main workflows.

The codebase is a functional credit-repair operations platform modeled around common dispute-management workflows. Before any sale or public commercial launch, the buyer should complete legal/IP, security, database, billing, provider, and production-readiness review.

## Current Verified Status

- Latest pushed commit reported for this handoff: `4b8c549 Improve visual audit mapping and loading fallbacks`.
- Local git state at documentation start: clean and up to date per project status.
- Full local Chromium Playwright suite: `358 passed`.
- Focused `/clients` test: passed.
- Improved visual audit route mapping is committed.
- Latest route screenshot audit result: `cloneCapturedCount: 34`, `cloneErrorCount: 0`, `clone404Count: 0`.
- Original-site visual comparison is currently blocked by original login failure/session access.

## Latest Known Passing Test Command

```powershell
npx playwright test --project=chromium --config=playwright.config.ts
```

Latest verified result: `358 passed`.

Focused client test:

```powershell
npx playwright test tests/client-add-form-fields-behavior.spec.ts --project=chromium --config=playwright.config.ts
```

Latest verified result: passed.

## Live Deployment URL

Repo evidence points to:

```text
https://disputepilot-app.vercel.app
```

This URL appears in `playwright.live.config.ts` and prior project audit docs. Live deployment ownership, current Vercel project settings, environment variables, and production data must still be verified during buyer handoff.

## Local Root Path

```text
C:\Users\LESLI\disputepilot-app
```

Do not use or edit the nested folder unless intentionally working on a separate nested copy:

```text
C:\Users\LESLI\disputepilot-app\disputepilot-app
```

## High-Level Buyer-Readiness Summary

The repository is in a strong demo/readiness state for a private technical review: the app builds on a modern Next.js stack, broad Playwright workflow coverage is passing locally, route-level visual audit tooling exists, and Supabase RLS/migration materials are present.

The product is not automatically proven ready for real customer data or a hands-off SaaS acquisition. The buyer should verify production Supabase state, storage, billing/subscription behavior, email/SMS delivery, domain ownership, third-party licenses, IP/branding exposure from legacy-reference implementation history, and end-to-end live deployment behavior.
