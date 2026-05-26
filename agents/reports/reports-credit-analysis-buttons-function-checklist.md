# Reports / Credit Analysis / Credit Analyzer Button Function Checklist

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app\disputepilot-app` was not inspected or edited.

No app files or tests were changed in this pass.

## Routes and Files Inspected

- `/reports`: `app/reports/page.tsx`
- `/credit-analysis`: `app/credit-analysis/page.tsx`
- `/credit-analyzer`: `app/credit-analyzer/page.tsx`
- Related layout controls: `components/CDMLayout.tsx`
- Related API route found: `app/api/analyze-credit/route.ts`
- Existing focused tests:
  - `tests/reports-parity.spec.ts`
  - `tests/credit-analysis-behavior.spec.ts`
  - `tests/operational-pages-smoke.spec.ts`
  - `tests/manual-workflow-audit.spec.ts`
  - `tests/workflow-interactions-smoke.spec.ts`
  - `tests/save-buttons-no-error.spec.ts`

## Working Buttons / Links / Controls

- [x] `/reports` - `3 Mo`
  - Expected: filter report charts/stats to the last 3 months.
  - Current behavior: calls `setPeriod("3m")`; `useEffect` reloads Supabase-backed client/dispute/invoice/lead data using 3 month labels.
  - Type: filter.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: extend `tests/reports-parity.spec.ts` or `tests/operational-pages-smoke.spec.ts` to click `3 Mo` and assert the selected style or changed month count.

- [x] `/reports` - `6 Mo`
  - Expected: filter report charts/stats to the last 6 months.
  - Current behavior: default active period is `6m`; clicking resets `period` to `6m` and reloads data.
  - Type: filter.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: same period-control test as above.

- [x] `/reports` - `12 Mo`
  - Expected: filter report charts/stats to the last 12 months.
  - Current behavior: calls `setPeriod("12m")`; `useEffect` reloads data using 12 month labels.
  - Type: filter.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: same period-control test as above.

- [x] Layout link - `Reports`
  - Expected: navigate to `/reports`.
  - Current behavior: `CDMLayout` includes a Company sidebar `Link` to `/reports`; `tests/reports-parity.spec.ts` asserts it is visible.
  - Type: navigates.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: existing `tests/reports-parity.spec.ts`.

- [x] Layout link - `Credit Analysis/Analyzer`
  - Expected: navigate to the credit analysis/analyzer workflow.
  - Current behavior: sidebar `Link` navigates to `/credit-analysis`.
  - Type: navigates.
  - Needs real fix: partly, see ambiguous `/credit-analyzer` item below.
  - Files likely needing edits: `components/CDMLayout.tsx`, possibly `app/credit-analyzer/page.tsx`.
  - Focused test: update `tests/operational-pages-smoke.spec.ts` once the intended analyzer route is clarified.

- [x] `/credit-analysis` - `Select Client`
  - Expected: choose a client before loading analysis.
  - Current behavior: Supabase client rows populate the select; changing it sets `clientId`.
  - Type: filter/select.
  - Needs real fix: no for selection itself; the loaded report is still mock/static after selection.
  - Files likely needing edits: `app/credit-analysis/page.tsx` if client-specific report loading is implemented.
  - Focused test: existing `tests/credit-analysis-behavior.spec.ts` checks the select exists and can select an option when data exists.

- [x] `/credit-analysis` - bureau tab buttons `Equifax`, `Experian`, `TransUnion`
  - Expected: switch the active bureau analysis.
  - Current behavior: each button calls `setBureau(b)` and updates score, factors, tradelines, negative items, inquiries, simulator, and export data.
  - Type: filter/tab.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: add a credit-analysis interaction test that loads a client, clicks each bureau tab, and asserts the active bureau heading/tradeline count changes.

- [x] `/credit-analysis` - score summary cards `Equifax`, `Experian`, `TransUnion`
  - Expected: switch active bureau by clicking a score card.
  - Current behavior: `div` cards call `setBureau(b)` on mouse click.
  - Type: filter/tab.
  - Needs real fix: yes, accessibility/semantics only. They are clickable controls implemented as non-keyboard `div`s.
  - Recommended exact fix: convert score cards to `<button type="button">` elements or add full keyboard handling, role, and focus style. Prefer real buttons.
  - Files likely needing edits: `app/credit-analysis/page.tsx`.
  - Focused test: add keyboard test for selecting a bureau card with Tab/Enter.

- [x] `/credit-analysis` - `Export CSV`
  - Expected: export the active bureau tradelines.
  - Current behavior: creates a CSV `Blob`, creates an anchor, sets `download` to `credit_report_${bureau}.csv`, and clicks it.
  - Type: exports/downloads.
  - Needs real fix: minor hardening, not currently broken.
  - Recommended exact fix: escape CSV cells containing commas/quotes/newlines and revoke the object URL after click.
  - Files likely needing edits: `app/credit-analysis/page.tsx`.
  - Focused test: add a Playwright download test after loading a report; assert filename includes selected bureau and CSV contains expected header.

- [x] `/credit-analysis` - `Cancel` in Add Dispute Item modal
  - Expected: close the modal without saving.
  - Current behavior: sets `showDispute(null)` and hides the modal.
  - Type: closes modal/clears.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: add modal open/cancel coverage in `tests/credit-analysis-behavior.spec.ts`.

- [x] `/credit-analysis` - Score Simulator range `Pay Down Credit Cards`
  - Expected: change simulated paydown amount.
  - Current behavior: updates `simPayOff` and clears previous simulated score.
  - Type: simulator input/filter.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: add test changing range then clicking `Simulate`.

- [x] `/credit-analysis` - Score Simulator checkbox `Remove all negative items (+~25 pts)`
  - Expected: include negative-item removal in simulated score.
  - Current behavior: toggles `simDispute` and clears previous simulated score.
  - Type: simulator input/filter.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: add test toggling checkbox then clicking `Simulate`.

- [x] `/credit-analysis` - `Simulate`
  - Expected: estimate score improvement from simulator inputs.
  - Current behavior: calculates `boost = simPayOff * 0.04`, adds 25 if negative item removal is checked, caps at 850, and displays estimated score.
  - Type: analyzes/generates local estimate.
  - Needs real fix: no for current mock simulator; algorithm may need product validation.
  - Files likely needing edits: `app/credit-analysis/page.tsx` if replacing mock formula.
  - Focused test: assert `Estimated Score` appears and increases after setting paydown/checkbox.

## Broken / Non-Functional Buttons and Controls

- [ ] `/credit-analysis` - `Load Credit Report`
  - Expected: load the selected client's actual 3-bureau credit analysis.
  - Current behavior: disabled until a client is selected; when clicked it only sets `loaded(true)` and shows hardcoded `MOCK` bureau data. `clientId` is not used to fetch report data.
  - Type: analyzes/loads.
  - Needs real fix: yes.
  - Recommended exact fix: replace hardcoded `MOCK` dependency with a client-scoped credit report source. Fetch/import parsed credit report data by `clientId`, show an empty/error state when no report exists, and only fall back to demo data behind an explicit demo mode.
  - Files likely needing edits: `app/credit-analysis/page.tsx`, likely a new or existing credit-report data API/lib module, possibly Supabase schema access in `lib/**`.
  - Focused test: update `tests/credit-analysis-behavior.spec.ts` to seed/mock a client report, click `Load Credit Report`, and assert client-specific bureau data appears.

- [ ] `/credit-analysis` - `PDF Report`
  - Expected: label implies PDF report export/download.
  - Current behavior: calls `window.print()`; it opens browser print behavior and does not generate or download a PDF.
  - Type: prints; mislabeled as PDF export/download.
  - Needs real fix: yes.
  - Recommended exact fix: either rename to `Print Report` and add print styles, or implement real PDF generation/download with a deterministic filename such as `credit_report_${bureau}.pdf`.
  - Files likely needing edits: `app/credit-analysis/page.tsx`, possibly print CSS/global stylesheet or a report PDF utility.
  - Focused test: if renamed, spy on `window.print`; if PDF export is implemented, add a Playwright download test.

- [ ] `/credit-analysis` - negative item `Dispute`
  - Expected: open a dispute creation flow for the selected negative tradeline.
  - Current behavior: opens the Add Dispute Item modal with local item name and default reason.
  - Type: opens modal.
  - Needs real fix: the open behavior works, but the overall workflow is non-persistent until `Add to Disputes` is fixed.
  - Recommended exact fix: keep modal opening, but pass enough structured tradeline/bureau/client data into the save handler for persistence.
  - Files likely needing edits: `app/credit-analysis/page.tsx`, possibly dispute creation API/lib.
  - Focused test: modal open test plus persistence test after save.

- [ ] `/credit-analysis` - hard inquiry `Dispute`
  - Expected: open a dispute creation flow for an unauthorized hard inquiry.
  - Current behavior: opens the Add Dispute Item modal with reason set to `Inquiry Not Authorized`.
  - Type: opens modal.
  - Needs real fix: same persistence gap as negative item disputes.
  - Recommended exact fix: pass inquiry-specific data and persist as a dispute item tied to client and bureau.
  - Files likely needing edits: `app/credit-analysis/page.tsx`, possibly dispute creation API/lib.
  - Focused test: click a hard inquiry dispute button and assert reason defaults to `Inquiry Not Authorized`; then save and assert queue insertion once implemented.

- [ ] `/credit-analysis` - `Add to Disputes`
  - Expected: save the selected tradeline/inquiry to the real disputes queue.
  - Current behavior: only sets `disputeSuccess(true)`, shows a success message, and clears modal state after 1.5 seconds. It does not insert into Supabase, navigate to disputes, or update any real queue.
  - Type: save/generate dispute item; currently local-only.
  - Needs real fix: yes.
  - Recommended exact fix: create or call a dispute creation function that inserts the selected item with `clientId`, `bureau`, item name/type/status, reason, notes, and source metadata; show success only after persistence succeeds; show a visible error on failure.
  - Files likely needing edits: `app/credit-analysis/page.tsx`, likely `app/disputes/**` or shared dispute data helper/API.
  - Focused test: add Playwright test that loads a report, opens a dispute modal, enters notes, clicks `Add to Disputes`, and asserts a persisted dispute appears in `/disputes` or a mocked API was called.

- [ ] `/credit-analyzer` - page-level analyzer controls
  - Expected: route name implies visible upload/analyze/report controls for credit analysis.
  - Current behavior: route renders only the `Credit Analyzer` heading inside `CDMLayout`; no upload, analyze, export, download, print, filter, search, clear, save, AI/report, or navigation controls exist in page content.
  - Type: does nothing/no visible page controls.
  - Needs real fix: yes, unless this route is intentionally deprecated.
  - Recommended exact fix: choose one canonical route. Either redirect `/credit-analyzer` to `/credit-analysis`, remove it from tests if intentionally unused, or implement the analyzer workflow there. If implemented, add credit report upload, parse/analyze action, result display, export/print, clear/reset, and save-to-client/disputes controls.
  - Files likely needing edits: `app/credit-analyzer/page.tsx`, `components/CDMLayout.tsx`, `tests/operational-pages-smoke.spec.ts`, new analyzer tests.
  - Focused test: create `tests/credit-analyzer-workflow.spec.ts` that uploads a sample report, clicks analyze, sees results, exports/downloads, clears, and saves.

- [ ] `/api/analyze-credit` - AI analysis endpoint not connected to visible controls
  - Expected: likely supports AI credit report analysis.
  - Current behavior: POST route exists and calls OpenAI, but `/credit-analysis` and `/credit-analyzer` do not call it. No visible `Analyze`, `AI Analyze`, or upload control reaches this endpoint.
  - Type: AI/analyze backend present but unused from inspected UI.
  - Needs real fix: yes if AI analysis is part of product scope.
  - Recommended exact fix: wire an explicit UI control to this endpoint or remove/deprecate the route. Add request validation and a current supported OpenAI implementation before production use.
  - Files likely needing edits: `app/api/analyze-credit/route.ts`, `app/credit-analysis/page.tsx` or `app/credit-analyzer/page.tsx`.
  - Focused test: API unit/integration test for auth and response handling, plus UI test clicking `Analyze`.

## Ambiguous Items Needing Original Comparison

- [ ] `/reports` - original Reports page parity
  - Current evidence: `tests/reports-parity.spec.ts` records that the original dedicated Reports route was not confirmed; prior capture redirected `/Reports` to `/Home/Index?aspxerrorpath=/Reports`.
  - Ambiguity: current clone exposes a dashboard with stats/charts and period filters, but original report-specific controls are unknown.
  - Recommended exact fix: compare against a fresh original capture. If original has export/download/print/saved report/report builder controls, add them to `/reports`.
  - Files likely needing edits: `app/reports/page.tsx`, possibly report export utilities and focused tests.
  - Focused test: update `tests/reports-parity.spec.ts` with confirmed original controls once known.

- [ ] `/reports` - missing visible export/download/print/search/clear/save/report controls
  - Current behavior: no such controls are visible on `/reports`; only period filters are present.
  - Ambiguity: could be acceptable for a dashboard, but "Reports" workflows often include export/print.
  - Recommended exact fix: verify original/product expectation. If required, add scoped controls such as `Export CSV`, `Download PDF`, and `Print Report` with real behavior.
  - Files likely needing edits: `app/reports/page.tsx`.
  - Focused test: add download/print tests only after controls are specified.

- [ ] `/credit-analysis` vs `/credit-analyzer` route split
  - Current behavior: sidebar says `Credit Analysis/Analyzer` but navigates to `/credit-analysis`; `/credit-analyzer` exists and is smoke-tested but empty.
  - Ambiguity: unclear whether `/credit-analyzer` should be the upload/analyze tool, an alias, or removed.
  - Recommended exact fix: choose a canonical route and make navigation, redirects, tests, and page implementation match.
  - Files likely needing edits: `components/CDMLayout.tsx`, `app/credit-analyzer/page.tsx`, `app/credit-analysis/page.tsx`, `tests/operational-pages-smoke.spec.ts`.
  - Focused test: assert the sidebar route and direct route both land on the intended functional workflow.

## Existing Test Coverage Summary

- [x] `/reports` route loads, visible dashboard content exists, and `3 Mo`/`6 Mo`/`12 Mo` buttons are visible.
- [x] `/reports` sidebar link is visible.
- [x] `/credit-analysis` route loads, heading/select/button are visible, and `Load Credit Report` can be clicked if clients exist.
- [x] `/credit-analyzer` route loads a heading.
- [ ] No existing test verifies `/reports` period buttons actually change active state or data.
- [ ] No existing test verifies `/credit-analysis` CSV download.
- [ ] No existing test verifies `/credit-analysis` print/PDF behavior.
- [ ] No existing test verifies dispute modal open/save persistence.
- [ ] No existing test verifies bureau switching.
- [ ] No existing test verifies score simulator.
- [ ] No existing test verifies credit report upload/analyze/AI workflows.

## Highest Priority Fix List

1. Decide whether `/credit-analyzer` should redirect, be removed from expectations, or become the real analyzer workflow.
2. Make `Load Credit Report` load client-specific credit report data instead of hardcoded mock data.
3. Make `Add to Disputes` persist a real dispute item and only show success after save.
4. Align `PDF Report` label with behavior: either real PDF download or rename to `Print Report`.
5. Wire or deprecate `app/api/analyze-credit/route.ts`; no visible inspected UI currently uses it.
6. Convert clickable score-card `div`s into accessible buttons.
