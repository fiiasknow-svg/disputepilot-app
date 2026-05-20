# Round 2 Portals Report

## Files Changed
- `app/company/portals/page.tsx`
- `tests/portals-compare.spec.ts`
- `tests/company-settings-pages-smoke.spec.ts`
- `parity-results/portals/missing-from-clone.json`
- `parity-results/portals/different-from-original.json`
- `parity-results/portals/extra-in-clone.json`

## Exact Original-vs-Clone Gaps Found
- Original `/Settings/PortalsMobileApp` opens as an instructional/help page, while the clone opened with editable portal settings.
- Original first surface includes breadcrumb/back context, portal/mobile guidance, Client Tracking Portal help copy, Affiliate Portal help copy, Q&A items, video prompts, copyable portal links, Android app link, IOS app link, and mobile access Q&A.
- Clone was missing several original Q&A questions, the original preview/help messages, the IOS app download link, and the full mobile app access guidance.
- Clone had editable settings (`Portal URL`, `Logo`, `Branding`, `Welcome Message`, enable toggles, saved summary) dominating the first visible surface.

## Fixes Made
- Rebuilt `/company/portals` so the lead surface matches the original instructional Portals/Mobile App layout.
- Added original-style Client Tracking Portal and Affiliate Portal sections with guidance, `WATCH VIDEO`, Q&A, portal URLs, and `COPY LINK` actions.
- Added Client Tracking Portal Mobile Application guidance with Android and IOS download links and the captured mobile Q&A/help items.
- Moved editable portal/mobile settings below the instructional parity surface so they remain usable but no longer dominate first view.
- Updated the portals parity test to write:
  - `parity-results/portals/missing-from-clone.json`
  - `parity-results/portals/different-from-original.json`
  - `parity-results/portals/extra-in-clone.json`
- Updated the company settings smoke expectations for the new visible Portals/Mobile App UI.

## Focused Test Result
- `npx playwright test tests/portals*.spec.ts --project=chromium --config=playwright.config.ts`
  - Blocked by PowerShell/Playwright path matching with `No tests found`.
- `npx playwright test "tests/portals.*.spec.ts" --project=chromium --config=playwright.config.ts`
  - Passed: 2 tests.
- `parity-results/portals/missing-from-clone.json`: `[]`
- `parity-results/portals/different-from-original.json`: `[]`
- `parity-results/portals/extra-in-clone.json`: records the lower editable settings that remain in the clone but are no longer the first parity surface.

## Build Result
- `npm run build`
  - Passed.

## Blocked Items
- The exact unquoted PowerShell command using `tests/portals*.spec.ts` did not run because Playwright reported no matching tests. The equivalent regex run passed.
- Full exact parity still records editable settings as clone-only content below the instructional surface.
