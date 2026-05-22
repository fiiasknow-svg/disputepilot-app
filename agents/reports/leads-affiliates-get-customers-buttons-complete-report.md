# Leads / Affiliates / Get Customers Buttons Complete Report

Scope: root app only at `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app\` was not edited.

## Checklist Items Fixed

- Fixed Leads/Affiliates sidebar routes:
  - `Affiliates` now routes to `/leads/affiliates`.
  - `Affiliate Website Form` now routes to `/leads/affiliate-website-form`.
  - Legacy `/affiliates` redirects to `/leads/affiliates`.
  - Legacy `/affiliates/website-form` redirects to `/leads/affiliate-website-form`.
- Wired `/leads` no-op controls with visible behavior:
  - `Client Portal` filters to portal-context leads and shows visible context text.
  - `Client Referral Leads` filters to referral-context leads and shows visible context text.
  - `Current` shows non-archived leads.
  - `Archive` shows archived leads.
  - `Move Archive` moves the current visible lead set into local archive state and shows confirmation.
  - Added local auto-archive setting toggle persisted in `localStorage`.
- Fixed `/leads` CSV import:
  - Blank CSV now shows visible error and keeps modal open.
  - Supports header CSV such as `name,email,phone,source,status`.
  - Supports common simple order without headers.
  - Imported leads are added immediately to local state/localStorage.
  - Supabase insert is attempted; failures keep local fallback visible with status/error text.
  - Success count is shown and modal closes only on successful local import.
- Improved selected bulk actions on `/leads`:
  - Selected toolbar `Export` now exports selected leads as `selected-leads.csv`.
  - Header `Export CSV` still exports the filtered lead list.
  - Selected `Delete` now opens a visible confirmation modal before deleting.
- Improved `/leads` bulk email:
  - Existing API send attempt is preserved.
  - Completion/failure now appears as visible in-app status/error text instead of only `alert`.
- Fixed `/leads/website-lead-form`:
  - `Save` persists builder settings locally and shows saved status.
  - `Publish` persists published state and shows embed snippet plus public URL placeholder.
  - Preview submit shows visible preview-only confirmation.
  - Reload hydrates saved settings.
  - Preview reflects selected field visibility, including extra field checkboxes.
- Fixed `/leads/affiliate-website-form` with the same local save/publish/preview/hydration behavior.
- Added get-customers action coverage:
  - Main cards navigate.
  - Back/Next/View Client Acquisition buttons navigate.
  - Lead source list items update visible action-step content.

## Files Changed

- `components/CDMLayout.tsx`
- `app/affiliates/page.tsx`
- `app/affiliates/website-form/page.tsx`
- `app/leads/page.tsx`
- `app/leads/website-lead-form/page.tsx`
- `app/leads/affiliate-website-form/page.tsx`
- `tests/leads-affiliates-pages-smoke.spec.ts`
- `tests/leads-controls-csv-bulk-behavior.spec.ts`
- `tests/leads-form-builders-behavior.spec.ts`
- `tests/get-customers-pages-smoke.spec.ts`

## Focused Test Results

- `npm run build` - passed.
- `npx playwright test "tests/.*lead.*\.spec\.ts" --project=chromium --config=playwright.config.ts` - passed, 11/11.
- `npx playwright test "tests/.*affiliate.*\.spec\.ts" --project=chromium --config=playwright.config.ts` - passed, 8/8.
- `npx playwright test "tests/.*get-customers.*\.spec\.ts" --project=chromium --config=playwright.config.ts` - passed, 5/5.

## Full Suite Result

- `npx playwright test --project=chromium --config=playwright.config.ts` - passed, 278/278.
- Note: an initial full-suite run exposed an existing audit strictness issue caused by two `/leads` live status regions. The filter context remains visible, but its `role="status"` was removed so the saved-lead status remains unique. The targeted audit and final full suite then passed.

## Remaining Deferred Backend / Original-Comparison Items

- Supabase-backed archive persistence remains deferred; archive/current state is local/localStorage when backend integration is unavailable.
- Auto-archive is a local setting only; no backend account configuration table was added.
- Published website/affiliate forms generate visible embed/public URL placeholders only; no public embed endpoint or hosted form backend was implemented.
- CSV import keeps local fallback when Supabase insert fails; full backend schema validation and duplicate detection remain deferred.
- Original-comparison items still deferred: affiliate documents/commissions CRUD, affiliate remove confirmation/edit workflow, exact original form-style layout/embed semantics, and conversion failure local-client fallback.

## Generated Artifacts Changed By Test Run

- `manual-workflow-audit.json`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/letters/desktop-original.png`
- `parity-results/letters/mobile-original.png`
- Playwright also refreshed ignored runtime output under `test-results/.last-run.json`.

No commit or push was performed.
