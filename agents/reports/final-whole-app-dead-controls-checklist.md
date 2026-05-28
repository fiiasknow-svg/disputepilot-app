# Final Whole-App Dead Controls Checklist

Audit date: 2026-05-28

Scope audited:
- `app/**`
- `components/**`
- `tests/**`
- `agents/reports/*complete-report.md`
- `agents/reports/*function-checklist.md`

Out of scope by instruction:
- Nested app folder `disputepilot-app/**`
- App/test edits
- Full suite execution
- Commits/pushes

Searches performed:
- `href=`, app route inventory, and sidebar/report route cross-checks
- empty/no-op click handlers, `cursor: "pointer"`, visible `<button>` controls, alerts/console-only behavior
- clipboard/download/export/print controls
- `TODO`, `FIXME`, `placeholder`, `not connected`, `mock`, `demo`, `stub`
- existing Playwright specs and prior `agents/reports/*function-checklist.md` / `*complete-report.md`

No full Playwright suite was run.

## Overall Risk Ranking

1. High: Controls that claim activation, public signup, sending, or external provider connection while only recording local state or routing to an incomplete/local-only flow.
2. High: Destructive actions without confirmation where comparable pages now use confirmation modals.
3. Medium: Save controls that only update React state and lose data on reload while the UI says "saved".
4. Medium: Export/download labels that produce text/print/local files instead of the implied PDF/report/provider artifact.
5. Medium: Route aliases and redirects that prevent 404s but may still hide incomplete or wrong-destination workflows.
6. Low: Placeholder video/training/card controls that are honest enough for local demo status but still need real content/provider wiring before production.

## Remaining Likely-Broken Controls

### 1. `/company/client-auto-signup` - `Signup URL` / `Copy`

- Priority: High
- Current code behavior: `signupUrl` is hardcoded to `https://portal.disputepilot.com/signup/auto`; `Copy` calls `navigator.clipboard.writeText(signupUrl)` without a fallback or failure status. The visible URL implies a hosted portal signup route that is not implemented in this root app.
- Why likely broken/misleading: The page now has local settings, but the copied URL points to an external hosted portal and no root-app route verifies that signup flow works.
- Recommended exact fix: Replace the hardcoded URL with a reachable local/public signup route, or label it as an external/unverified production URL. Add clipboard fallback/status for denied clipboard access.
- Files likely needing edits: `app/company/client-auto-signup/page.tsx`; likely new public signup route if making it real.
- Focused test to add/update: `tests/client-auto-signup-url.spec.ts`: copy URL with clipboard mocked success/failure, assert visible status, and assert the URL route either loads or is explicitly labeled external/unverified.

### 2. `/company/self-service-signup` - `Embed Code` / `Copy Embed Code`

- Priority: High
- Current code behavior: generated embed uses `https://portal.disputepilot.com/signup?company=...`; `Copy Embed Code` calls `navigator.clipboard.writeText(embedCode)` with no fallback. Finish saves local wizard settings only and says Stripe charging is not connected.
- Why likely broken/misleading: The embed appears production-ready but does not point to a root-app route and does not make the local wizard configuration available to a real public signup page.
- Recommended exact fix: Point embed code to a real root-app public signup route backed by the saved local settings, or change copy to clearly say this is an external production placeholder. Add clipboard fallback/status.
- Files likely needing edits: `app/company/self-service-signup/page.tsx`; likely `app/public/...` or `app/signup/...` route.
- Focused test to add/update: extend `tests/self-service-signup-wizard.spec.ts` to finish wizard, open/copy the embed, verify clipboard fallback, and navigate to the embed `src` when local.

### 3. Global activation modal - `Open Registration`

- Priority: High
- Current code behavior: in `components/CDMLayout.tsx`, `Open Registration` only validates that a password was typed and then sets `Registration password accepted locally. Continue from billing activation.` It does not open registration, navigate, persist, or verify the password.
- Why likely broken/misleading: The label promises opening registration; current behavior is only fake local acceptance.
- Recommended exact fix: Either route to a real registration/activation workflow after validation, or relabel to `Validate Registration Password Locally` and show a clear local-only status. If a real password is required, verify it server-side.
- Files likely needing edits: `components/CDMLayout.tsx`; possibly `app/billing/**` or a new activation route.
- Focused test to add/update: add `tests/activation-modal-behavior.spec.ts`: open activation modal, click `Open Registration` empty and filled, assert either real navigation or honest local-only status.

### 4. Global activation modal - `Your 2 Free Gifts expire in 47 hours!`

- Priority: Medium
- Current code behavior: button only sets status text: `Your free gifts are reserved during the 47 hour activation window.`
- Why likely broken/misleading: The visible label is a CTA/timer, but it does not claim gifts, open details, or persist reservation state.
- Recommended exact fix: Make this a non-clickable notice, or implement a real local reservation record/status with timestamp and a route to claim details.
- Files likely needing edits: `components/CDMLayout.tsx`
- Focused test to add/update: include in `tests/activation-modal-behavior.spec.ts`; assert the CTA is either non-interactive notice text or persists an honest reservation status.

### 5. `/company/settings` - `Save Company`

- Priority: Medium
- Current code behavior: updates only component state (`saved`) and shows `Company profile saved for ... Saved preview refreshed.` No `localStorage`, Supabase, or backend persistence is used.
- Why likely broken/misleading: The route is a company settings page and the save label implies persistence across reloads.
- Recommended exact fix: Persist to localStorage with explicit "saved locally" status, or save to account/company backend. Load saved values on mount.
- Files likely needing edits: `app/company/settings/page.tsx`
- Focused test to add/update: extend `tests/company-settings-save-behavior.spec.ts` or add `tests/company-profile-persistence.spec.ts`: edit company name, save, reload, assert retained value and honest status.

### 6. `/company/manage-portal-content` - row `Delete`

- Priority: High
- Current code behavior: row `Delete` immediately filters the article out of React state with no confirmation.
- Why likely broken/misleading: Comparable destructive pages now use confirmation modals. This action is immediate and data disappears from the visible table.
- Recommended exact fix: Add a confirmation modal naming the article; only delete after confirm. If still local-only, show `deleted locally` status.
- Files likely needing edits: `app/company/manage-portal-content/page.tsx`
- Focused test to add/update: `tests/manage-portal-content-delete-confirm.spec.ts`: click `Delete`, assert confirm modal, cancel keeps row, confirm removes row/status.

### 7. `/company/manage-portal-content` - `Create`, `Save`, `Publish`/`Unpublish`

- Priority: Medium
- Current code behavior: create/edit/status toggles mutate React state only and vanish on reload.
- Why likely broken/misleading: Page copy says articles/resources are displayed in the client portal; current behavior does not persist and does not feed a public/client portal route.
- Recommended exact fix: Persist portal content locally with explicit local status, or connect to backend/client portal content source.
- Files likely needing edits: `app/company/manage-portal-content/page.tsx`; possibly `components/ClientPortalLayout.tsx` or portal routes.
- Focused test to add/update: extend `tests/manage-portal-content-actions.spec.ts`: create/edit/publish, reload, assert persistence or honest local-only status.

### 8. `/company/digital-contracts` - `Save Contract`

- Priority: Medium
- Current code behavior: blank required fields silently no-op (`if (!form.name.trim() || !form.recipient.trim()) return;`). Successful save mutates React state only.
- Why likely broken/misleading: Validation failure is silent, and saved contracts vanish on reload.
- Recommended exact fix: Show visible validation for missing Contract Name/Recipient. Persist local contracts or backend records, with honest status.
- Files likely needing edits: `app/company/digital-contracts/page.tsx`
- Focused test to add/update: extend `tests/digital-contracts-workflows.spec.ts`: submit blank form, assert validation; create contract, reload, assert saved or local-only status.

### 9. `/company/digital-contracts` - row `Send` / modal `Send Contract`

- Priority: High
- Current code behavior: changes row status to `Sent` and shows message; no email/e-signature/backend delivery occurs, and message does not state local-only/no external send.
- Why likely broken/misleading: `Send` is a high-risk external action label.
- Recommended exact fix: Change status/message to `Sent locally - no email/e-signature sent`, or wire to real email/e-sign provider.
- Files likely needing edits: `app/company/digital-contracts/page.tsx`; possibly `app/api/send-email/route.ts` or e-sign provider integration.
- Focused test to add/update: extend `tests/digital-contracts-workflows.spec.ts`: click Send, assert local-only message unless API mock is called.

### 10. `/billing/pay-per-deletion` - row `Send`

- Priority: High
- Current code behavior: sets estimate status to `Sent locally` and status says `Estimate send simulated locally. No email was sent.`
- Why still remaining: The status is honest after click, but the button label `Send` still appears as a real send action before click.
- Recommended exact fix: Rename visible label to `Mark Sent Locally` or gate real `Send` behind an email/provider connection.
- Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`
- Focused test to add/update: `tests/billing-pay-per-deletion-controls.spec.ts`: generated estimate row button label/status reflects local-only send.

### 11. `/billing/pay-per-deletion` - row `Remove`

- Priority: High
- Current code behavior: immediately removes an estimate from React state with no confirmation.
- Why likely broken/misleading: Destructive action with no confirmation, unlike clients/employees/furnisher patterns.
- Recommended exact fix: Add confirmation modal naming the estimate/client. Persist removal/archive locally or backend and show status.
- Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`
- Focused test to add/update: `tests/billing-pay-per-deletion-controls.spec.ts`: remove requires confirmation and cancel preserves row.

### 12. `/billing/pay-per-deletion` - `Quick Import`, HTML credit report, `Build Estimate`

- Priority: Medium
- Current code behavior: selected HTML file name is appended to the generated estimate preview, but HTML content is not parsed. `Quick Import` panel says parsing is deferred.
- Why likely broken/misleading: The page title and controls imply automated/manual pay-per-deletion estimates from an HTML report. Current behavior is an honest placeholder in panel copy but still easy to misread from the main workflow.
- Recommended exact fix: Either parse supported HTML report fields into the estimate or rename the upload control to `Attach HTML File Name Locally`.
- Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`
- Focused test to add/update: add fixture HTML upload, assert parsed values affect estimate; or assert visible deferred/local-only copy next to upload and estimate output.

### 13. `/billing/pay-per-deletion` - row `Contract`

- Priority: Medium
- Current code behavior: opens a local modal saying e-signature integration is deferred and suggests preparing the digital contract route later.
- Why likely broken/misleading: Row label `Contract` can imply sending/generating an actual contract. Modal is honest after click.
- Recommended exact fix: Rename to `Preview Contract Context` or wire to `/company/digital-contracts` with estimate context prefilled.
- Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`; `app/company/digital-contracts/page.tsx`
- Focused test to add/update: `tests/billing-pay-per-deletion-controls.spec.ts`: click Contract and assert either route prefill or local deferred modal.

### 14. `/company/credit-monitoring` - provider `Test`

- Priority: Medium
- Current code behavior: waits 1.2 seconds and marks provider `Connected` without checking the URL or making a request.
- Why likely broken/misleading: `Test`/`Connected` imply validation of provider affiliate URLs.
- Recommended exact fix: Rename to `Mark Tested Locally`, or perform a safe backend URL/provider validation and show failure states.
- Files likely needing edits: `app/company/credit-monitoring/page.tsx`
- Focused test to add/update: extend `tests/company-credit-monitoring-save.spec.ts`: invalid URL test does not show `Connected`, or local-only wording is visible.

### 15. `/automation/zapier` - `Connect`

- Priority: Medium
- Current code behavior: with a non-empty token, only sets status `Zapier connection marked connected locally`; does not save token unless `Save Settings` is clicked.
- Why likely broken/misleading: `Connect` implies saved connection or external verification.
- Recommended exact fix: Save local connection state during `Connect` and label status clearly, or call a real validation endpoint.
- Files likely needing edits: `app/automation/zapier/page.tsx`
- Focused test to add/update: extend `tests/zapier-automation.spec.ts`: after Connect, reload and assert connected state persisted or status tells user to Save Settings.

### 16. `/automation/zapier` - `Test Zap`

- Priority: Medium
- Current code behavior: always says `Test Zap queued locally. No external Zapier request was sent.`
- Why likely broken/misleading: Button label implies a real Zap test.
- Recommended exact fix: Rename to `Record Local Test` or implement an API route that performs an actual test when configured.
- Files likely needing edits: `app/automation/zapier/page.tsx`; possible API route.
- Focused test to add/update: `tests/zapier-automation.spec.ts`: button label/status reflects local-only test unless API mock is used.

### 17. `/automation/go-highlevel` - `Connect` / `Test Connection`

- Priority: Medium
- Current code behavior: only sets local status text; `Connect` does not persist unless `Save Settings` is separately clicked, and `Test Connection` does not call GHL.
- Why likely broken/misleading: Labels imply external provider verification.
- Recommended exact fix: Save local connection status on connect and rename test to local-only, or call a backend GHL validation endpoint.
- Files likely needing edits: `app/automation/go-highlevel/page.tsx`
- Focused test to add/update: extend `tests/highlevel-automation.spec.ts`: connect/test status is honest and persisted or API call is mocked.

### 18. `/automation` - integration cards `Zapier`, `Go-HighLevel`, `Website Lead Nurturing`

- Priority: Low
- Current code behavior: cards only set active integration and status; separate top links navigate to Zapier/GHL routes. The `Website Lead Nurturing` card does not navigate to `/automation/website-lead-nurturing`.
- Why likely broken/misleading: Cards look like route cards and copy says local configuration is available from the dedicated route.
- Recommended exact fix: Make cards navigate to dedicated routes, or change copy to `Selected for saved defaults`.
- Files likely needing edits: `app/automation/page.tsx`
- Focused test to add/update: `tests/automation-save-behavior.spec.ts` or new card-navigation spec: click card and assert route/status matches intended behavior.

### 19. `/dashboard` Training & Resources links

- Priority: Medium
- Current code behavior: several resource links route to generic `/academy` or external resources: `CDM Credit Boss Skool NEW`, `Full Walkthrough`, `Group Training`, etc. The `Task` item now runs a local dashboard action.
- Why likely broken/misleading: Some labels imply specific resources but land on generic academy index.
- Recommended exact fix: Point each resource to a specific route/resource, or relabel generic academy destinations.
- Files likely needing edits: `app/dashboard/page.tsx`
- Focused test to add/update: extend `tests/dashboard-training-resources.spec.ts`: click each resource and assert destination contains matching title/content.

### 20. `/credit-analysis` - `Print Report`

- Priority: Medium
- Current code behavior: calls `window.print()` under `Print Report`. This is acceptable for print, but not PDF download.
- Why included: Prior reports flagged PDF/download ambiguity. Current visible label is `Print Report`, not `PDF Report`, so the remaining risk is test coverage.
- Recommended exact fix: Keep label as `Print Report`; if PDF is required, add a separate real `Download PDF` that generates a file.
- Files likely needing edits: `app/credit-analysis/page.tsx`
- Focused test to add/update: extend `tests/credit-analysis-behavior.spec.ts`: stub `window.print`, click `Print Report`, assert print was called and no PDF wording is present.

### 21. `/credit-analysis` - dispute queue controls (`Dispute`, `Add to Disputes`)

- Priority: Medium
- Current code behavior: prior complete report says queue persistence is localStorage and visibly labeled local. The route still does not create Supabase disputes.
- Why still remaining: Product label implies moving analysis findings into disputes; backend persistence remains deferred.
- Recommended exact fix: Wire queued disputes into `/disputes` durable records, or keep local-only labels visible on every modal/action.
- Files likely needing edits: `app/credit-analysis/page.tsx`; `app/disputes/page.tsx`; possibly Supabase schema/RLS.
- Focused test to add/update: add `tests/credit-analysis-dispute-queue.spec.ts`: add finding to disputes and verify it appears after reload and/or in `/disputes`.

### 22. `/reports` - period buttons `3 Mo` / `6 Mo` / `12 Mo`

- Priority: Low
- Current code behavior: buttons change `period`, reload chart data from Supabase queries, and have `aria-pressed`.
- Why included: Existing reports note no focused test covers period state/data changes.
- Recommended exact fix: No code fix unless data fails; add focused coverage.
- Files likely needing edits: tests only, likely `tests/reports-controls.spec.ts`
- Focused test to add/update: click each period and assert `aria-pressed` changes and chart query/loading state resolves without app errors.

## Missing Route / Wrong Route Findings

- No current root-app `href="#"`, empty `href`, or obvious internal 404 link was found in active app/component files.
- Legacy `/affiliates` and `/affiliates/website-form` now redirect to implemented `/leads/affiliates` and `/leads/affiliate-website-form`, so the old sidebar 404/stub risk appears resolved.
- `/credit-analyzer` now redirects to `/credit-analysis`, so the old split-route risk appears resolved.
- `/academy/rebuild-credit` exists as a root route, so the old missing route risk appears resolved.
- Remaining route risk is semantic: generic links such as dashboard resource links to `/academy` may not land on content matching their labels.

## Controls Not Covered By Focused Playwright Specs

Likely gaps after cross-checking tests:

- `components/CDMLayout.tsx` activation modal: `Your 2 Free Gifts expire in 47 hours!`, `ACTIVATE & CLAIM MY GIFTS`, `Open Registration`.
- `/company/client-auto-signup`: hosted signup URL reachability, clipboard fallback, builder local-only status, card authorization persistence/honesty.
- `/company/self-service-signup`: copied embed route reachability and clipboard fallback.
- `/company/manage-portal-content`: delete confirmation and persistence after create/edit/publish/delete.
- `/company/digital-contracts`: blank validation, local persistence, and honest `Send` behavior.
- `/billing/pay-per-deletion`: remove confirmation, row send label/status, contract handoff, HTML import behavior.
- `/automation`: integration card route semantics.
- `/automation/zapier` and `/automation/go-highlevel`: connect/test persistence and local-only wording.
- `/credit-analysis`: print behavior, CSV/download file assertions, dispute queue persistence into `/disputes`.
- `/reports`: period button active-state/data behavior.

## Intentionally Deferred Items

These should remain deferred until backend/external provider/original comparison is available:

- Real billing/checkout activation, trial countdown, and free-gift fulfillment.
- Real public portal/signup hosting under `portal.disputepilot.com`.
- Stripe charging, webhook, and signup payment processing.
- Zapier and GoHighLevel external connection/test calls.
- Credit monitoring provider URL validation and affiliate-provider connectivity.
- Digital contract/e-signature provider delivery.
- Pay-per-deletion HTML credit report parsing and contract/email delivery.
- Supabase-backed credit-analysis dispute creation and full credit report parser.
- Hosted academy/training videos and original CDM training destinations.
- Original CDM comparison for exact dashboard resource destinations and academy resource naming.

## Suggested Fix Order

1. Activation/signup/public URL honesty: `components/CDMLayout.tsx`, `app/company/client-auto-signup/page.tsx`, `app/company/self-service-signup/page.tsx`.
2. Destructive action safety: `app/company/manage-portal-content/page.tsx`, `app/billing/pay-per-deletion/page.tsx`.
3. Silent validation and fake sends: `app/company/digital-contracts/page.tsx`, automation provider pages.
4. Non-persistent settings/content that say "saved": `app/company/settings/page.tsx`, portal content/digital contracts if backend is not ready.
5. Coverage-only gaps for `reports`, `credit-analysis` print/download, and dashboard resource destination checks.
