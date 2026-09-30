# Testing Summary

## Latest Verified Full-Suite Status

Command:

```powershell
npx playwright test --project=chromium --config=playwright.config.ts
```

Latest verified result: `358 passed`.

Focused `/clients` command:

```powershell
npx playwright test tests/client-add-form-fields-behavior.spec.ts --project=chromium --config=playwright.config.ts
```

Latest verified result: passed.

## Playwright Coverage by Category

The `tests/` directory includes coverage for:

- Authentication foundation and protected routes.
- Dashboard workflows.
- Clients/customer CRUD, filters, pagination, search, statuses, bulk export/delete, profiles, letters, portal tabs, and document downloads.
- Leads, affiliates, public website forms, affiliate forms, CSV import/export, auto-archive, and bulk email behavior.
- Disputes, dispute detail, dispute status, furnisher addresses, AI Metro 2 letters, and dispute route smoke/parity.
- Letter vault, saved letters, AI rewriter, previews, responses, downloads, and route smoke.
- Billing overview, invoices, payments, payment history, services/products, credit-card setup, subscriptions, and pay-per-deletion screens.
- Calendar, reminders, tasks, dashboard task interactions, and iCal export.
- Company settings, configuration, portals, manage emails, notify automation, team messages, client auto signup, self-service signup, images/documents, and digital contracts.
- Automation routes including Zapier, GoHighLevel, website lead nurturing, and integration navigation.
- Employees/outsourcers, roles/permissions, local invites, tasks, training panel, and team messages.
- Academy/training pages and certificate behavior.
- Partner resources, get-customers pages, help/community pages, operational pages, route smoke, sidebar route coverage, and manual workflow audit.
- Public/live smoke specs for public routes and authenticated admin routes.
- Visual/parity compare specs and the full visual audit.

## Functional Testing vs Visual Audit

Functional Playwright tests assert visible behavior, route availability, form validation, local persistence, fallback behavior, and workflow usability.

The full visual audit captures desktop and mobile screenshots for mapped routes and reports pixel differences. It is report-only for visual differences and does not fail when screenshots differ. It is designed to identify review targets, not to certify exact visual parity.

## Full Visual Audit Status and Limitations

Current audit tooling:

- Uses explicit `originalPath` and `clonePath` route mappings.
- Detects original route fallbacks such as `/Home/Index?aspxerrorpath=...`.
- Detects clone 404s.
- Records mapping confidence counts.
- Excludes blocked or bad mappings from valid visual-diff comparisons.

Latest known clone audit status from project state:

- `cloneCapturedCount: 34`
- `cloneErrorCount: 0`
- `clone404Count: 0`

Current limitation:

- Original comparison is blocked by original-site login/session failure. Valid original credentials and route access are required to compare original pages.

## Generated Artifacts to Clean After Test Runs

Common generated files/directories:

- `audit-results/`
- `playwright-report/`
- `test-results/`
- `parity-results/`
- `manual-workflow-audit.json`
- `missing-*-from-clone.json`
- `debug-clone.json`
- `auth-original.json`

Some generated artifacts are useful evidence for audits, but they should be reviewed before commit or sale handoff.

## Suggested Tests Still Worth Adding Before Sale

- Production build smoke against buyer-owned Vercel deployment.
- Buyer-owned Supabase multi-tenant isolation test using two real accounts.
- Real file upload/download test if Supabase Storage or another storage provider is connected.
- Stripe checkout/subscription/webhook integration tests after live/test payment setup is finalized.
- Resend email delivery test with buyer-owned domain and API key.
- SMS delivery tests if SMS is added.
- Security regression tests for all sensitive API routes.
- Cross-browser full-suite run for Firefox/WebKit if buyer requires browser coverage beyond Chromium.
- Accessibility scan for core workflows.
