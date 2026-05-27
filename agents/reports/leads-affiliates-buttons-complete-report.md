# Leads / Affiliates / Website Lead Form Complete Report

Root scope: `C:\Users\LESLI\disputepilot-app`

Nested folder not edited: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

## Checklist Items Fixed

- Website Lead Form publish now points to a real public local route: `/public/forms/website-lead-form`.
- Website Lead Form copied embed target now exists: `/embed/website-lead-form.js`, returns JavaScript, and injects an iframe for the public form.
- Website public form renders visible fields, validates required fields, submits to a local demo API, shows success feedback, and stores a local `Website` lead in `localStorage`.
- Affiliate Website Form publish now points to a real public local route: `/public/forms/affiliate-website-form`.
- Affiliate Website Form now has a `Copy Embed` button after publish.
- Affiliate copied embed target now exists: `/embed/affiliate-website-form.js`, returns JavaScript, and injects an iframe for the public form.
- Affiliate public form renders visible referral fields, validates required fields, submits to a local demo API, shows success feedback, stores a local `Affiliate` lead, and stores a local referral row.
- Admin publish copy no longer says no route or placeholder-only route exists.
- Website-source local lead creation/import now applies Auto-archive when the toggle is on and shows a visible auto-archive status.
- Website public form submission also applies the same browser-local Auto-archive setting.
- Affiliate Documents & Commissions placeholder was replaced with local-only commission and document metadata tables, add modals, remove controls, and local persistence.
- Affiliate row Remove now opens a confirmation modal; cancel preserves the row and confirm removes it through the existing local/remote path.
- Bulk Send Email no longer claims sent/queued when the API fails; failure now shows setup/auth guidance and the API error.
- Form style choices now visibly change preview/public layout labels and column behavior for Short Form, Wide Form, Website, and Affiliate styles.

## Files Changed

- `app/leads/website-lead-form/page.tsx`
- `app/leads/affiliate-website-form/page.tsx`
- `app/leads/page.tsx`
- `app/leads/affiliates/page.tsx`
- `app/embed/website-lead-form.js/route.ts`
- `app/embed/affiliate-website-form.js/route.ts`
- `app/api/public-forms/website-lead-form/route.ts`
- `app/api/public-forms/affiliate-website-form/route.ts`
- `app/public/forms/PublicLocalForm.tsx`
- `app/public/forms/website-lead-form/page.tsx`
- `app/public/forms/affiliate-website-form/page.tsx`
- `tests/website-lead-form-copy-embed.spec.ts`
- `tests/affiliate-website-form-copy-embed.spec.ts`
- `tests/leads-form-builders-behavior.spec.ts`
- `tests/leads-controls-csv-bulk-behavior.spec.ts`
- `tests/leads-affiliates-behavior.spec.ts`

## Focused Test Results

- `npm run build`: passed.
- `npx playwright test "tests/.*lead.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 18/18.
- `npx playwright test "tests/.*leads.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 16/16.
- `npx playwright test "tests/.*affiliate.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 11/11.
- `npx playwright test "tests/.*website-lead.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 2/2.

## Full Suite Result

- `npx playwright test --project=chromium --config=playwright.config.ts`: passed, 331/331.

## Remaining Deferred Items

- Backend persistence remains deferred. Public submissions are honest same-browser local/demo submissions and do not claim Supabase/public backend persistence.
- Email delivery remains dependent on `/api/send-email` auth/config and provider setup; UI now reports setup/auth failure instead of claiming success.
- Original-product comparison items remain deferred where the source checklist called them ambiguous, including remote archive persistence, lead convert failure semantics, affiliate edit parity, and any exact original layout comparison beyond the implemented visible local behavior.

## Generated Artifacts Changed By Test Run

- `manual-workflow-audit.json`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/letters/desktop-original.png`
- `parity-results/letters/mobile-original.png`
- `test-results/.last-run.json`
- `playwright-report/index.html`

Note: `agents/reports/leads-affiliates-buttons-function-checklist.md` is present as an untracked source-of-truth report in git status; it was read but not modified.
