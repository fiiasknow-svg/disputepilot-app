# Billing Buttons / Controls Function Checklist

Scope: root app only at `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app/` was not inspected or edited. No app files, tests, commits, or pushes were changed.

Routes inspected:
- `/billing`
- `/billing/invoices`
- `/billing/credit-card-setup`
- `/billing/services-products`
- `/billing/payments`
- `/billing/payment-history`
- `/billing/pay-per-deletion`

Route note: requested `/billing/invoicing` does not exist in root `app/`; implemented route is `/billing/invoices`.

Files inspected:
- `app/billing/BillingWorkspace.tsx`
- `app/billing/page.tsx`
- `app/billing/invoices/page.tsx`
- `app/billing/credit-card-setup/page.tsx`
- `app/billing/services-products/page.tsx`
- `app/billing/payments/page.tsx`
- `app/billing/payment-history/page.tsx`
- `app/billing/pay-per-deletion/page.tsx`
- `components/CDMLayout.tsx`
- Targeted tests: `tests/billing-actions-behavior.spec.ts`, `tests/billing-compare.spec.ts`, `tests/billing-pages-smoke.spec.ts`, `tests/manual-workflow-audit.spec.ts`, `tests/operational-pages-smoke.spec.ts`
- Extra relevant billing smoke coverage found: `tests/workflow-interactions-smoke.spec.ts`, `tests/remaining-sidebar-routes-behavior.spec.ts`

## Working Buttons / Links / Controls

- [x] `Add Invoice` on `/billing`, `/billing/invoices`, `/billing/payments`, `/billing/payment-history`, `/billing/services-products`
  - Expected: open create invoice modal.
  - Current: sets `modal` to `invoice`, opens `Create Invoice`; `Save` prepends local invoice and writes `disputepilot.billing` localStorage; `Cancel`, overlay, and `x` close.
  - Action type: opens modal, submits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 271-284, 385, 447, 657-668, 727-729; tests cover create/cancel/save in `billing-actions-behavior.spec.ts` and `manual-workflow-audit.spec.ts`.
  - Needs real fix: no functional fix for local demo behavior. Product fix needed only if persistence must be Supabase/server-backed.
  - Focused test: keep/extend existing create invoice test to verify localStorage rehydrate after reload.

- [x] `Add Payment`
  - Expected: open add payment modal and save a payment record.
  - Current: opens `Add Payment`; `Save` prepends local payment and writes localStorage; `Cancel`, overlay, and `x` close.
  - Action type: opens modal, submits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 286-303, 386, 448, 672-683, 727-729; tests cover save in `billing-actions-behavior.spec.ts` and `manual-workflow-audit.spec.ts`.
  - Needs real fix: no local functional fix. Product fix needed only if this should actually charge/apply funds.
  - Focused test: add payment reload persistence assertion.

- [x] `Add Service/Product`
  - Expected: open add service/product modal and save a catalog item.
  - Current: opens `Add Service/Product`; `Save` prepends local service/product and writes localStorage; `Cancel`, overlay, and `x` close.
  - Action type: opens modal, submits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 305-319, 387, 449, 687-696, 727-729; covered by `manual-workflow-audit.spec.ts` and `workflow-interactions-smoke.spec.ts`.
  - Needs real fix: no local functional fix. Product fix needed only if catalog must be server-backed.
  - Focused test: create service/product from `/billing/services-products`, then assert it appears in invoice/payment service dropdowns.

- [x] Top billing section links: `Overview`, `Invoices`, `Payments`, `Services/Products`, `Payment History`
  - Expected: navigate to billing views.
  - Current: Next `Link` navigates to `/billing`, `/billing/invoices`, `/billing/payments`, `/billing/services-products`, `/billing/payment-history`.
  - Action type: navigates.
  - Evidence: `BillingWorkspace.tsx` lines 393-398; route smoke tests cover these routes.
  - Needs real fix: no, except `Subscription` below.
  - Focused test: assert each tab href and target heading.

- [x] Sidebar billing links: `Invoicing`, `Credit Card Setup`, `Services/Products`, `Payments`, `Payment History`, `Pay Per Deletion`
  - Expected: navigate to billing pages.
  - Current: valid Next links under expanded Billing group.
  - Action type: navigates.
  - Evidence: `CDMLayout.tsx` lines 86-93; `remaining-sidebar-routes-behavior.spec.ts` checks these routes load.
  - Needs real fix: no.
  - Focused test: assert sidebar billing link hrefs and headings.

- [x] `Search billing`
  - Expected: filter visible invoices/payments/services by text.
  - Current: controlled input updates `query`; filters invoice/payment/service rows by client, number/reference, service, amount, status, date, method, notes.
  - Action type: filters.
  - Evidence: `BillingWorkspace.tsx` lines 176-201, 414-419; `billing-actions-behavior.spec.ts` covers narrowing.
  - Needs real fix: no.
  - Focused test: search a service and payment on their dedicated routes, not only overview.

- [x] `Billing status filter`
  - Expected: filter records by status.
  - Current: controlled select filters across invoice, payment, and service statuses.
  - Action type: filters.
  - Evidence: `BillingWorkspace.tsx` lines 173-201, 421-425; `billing-actions-behavior.spec.ts` covers `Overdue`.
  - Needs real fix: no.
  - Focused test: verify mixed statuses on payments/services routes.

- [x] `Clear Filters`
  - Expected: clear search and status filter.
  - Current: sets query to empty string and status to `All Statuses`.
  - Action type: clears filters.
  - Evidence: `BillingWorkspace.tsx` lines 426-434; `billing-actions-behavior.spec.ts` covers reset.
  - Needs real fix: no.
  - Focused test: assert input value and selected option reset.

- [x] Invoice row `View`
  - Expected: open invoice details.
  - Current: opens `Invoice Details` modal with fields; `Close Details` closes; `Edit` opens edit form.
  - Action type: opens modal.
  - Evidence: `BillingWorkspace.tsx` lines 539-542, 450, 736-749; tested in `billing-actions-behavior.spec.ts` and `manual-workflow-audit.spec.ts`.
  - Needs real fix: no.
  - Focused test: assert details contain all invoice fields.

- [x] Payment row `Manage`
  - Expected: open payment details and allow edit.
  - Current: opens `Payment Details`; `Edit` opens edit form; `Save Changes` updates local row.
  - Action type: opens modal, edits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 546-549, 586-598, 736-749; tested in `manual-workflow-audit.spec.ts`.
  - Needs real fix: no.
  - Focused test: add dedicated payment edit test outside the broad manual audit.

- [x] Service/Product row `Manage`
  - Expected: open service/product details and allow edit.
  - Current: opens `Service/Product Details`; `Edit` opens edit form; `Save Changes` updates local row.
  - Action type: opens modal, edits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 553-556, 602-611, 736-749; tested in `manual-workflow-audit.spec.ts`.
  - Needs real fix: no.
  - Focused test: add dedicated service edit test.

- [x] Details modal `Close Details`, `Edit`
  - Expected: close details or switch to edit modal.
  - Current: `Close Details` closes; `Edit` sets edit target and opens matching edit form.
  - Action type: closes modal, edits.
  - Evidence: `BillingWorkspace.tsx` lines 450-455, 748-749.
  - Needs real fix: no.
  - Focused test: assert invoice/payment/service detail-to-edit transition.

- [x] Edit form `Cancel`, `Save Changes`
  - Expected: cancel edit or save changed record.
  - Current: `Cancel` closes edit modal; `Save Changes` updates local invoice/payment/service and shows status.
  - Action type: clears modal, submits, saves locally.
  - Evidence: `BillingWorkspace.tsx` lines 321-374, 571-611, 727-729; broad manual audit covers all three edits.
  - Needs real fix: no.
  - Focused test: split edit coverage into focused billing actions test.

- [x] Credit Card Setup form controls: `Payment Processor`, `Statement Descriptor`, `Public Key`, `Webhook Endpoint`, `Default Payment Frequency`, `Failed Payment Retry Days`
  - Expected: edit processor settings.
  - Current: form fields are editable; submit reads `processor` and `statementName` only.
  - Action type: form input.
  - Evidence: `credit-card-setup/page.tsx` lines 69-94.
  - Needs real fix: partial. Fields work as input, but values are not persisted and most are ignored by submit.
  - Focused test: assert all entered settings persist if real persistence is added.

- [x] Credit Card Setup checkboxes: `Enable card processing`, `Allow portal payments`, `Send automatic receipts`
  - Expected: toggle client payment options.
  - Current: local React state toggles immediately; `Processing Enabled/Disabled` badge reflects only `Enable card processing`.
  - Action type: toggles.
  - Evidence: `credit-card-setup/page.tsx` lines 12-15, 102-113.
  - Needs real fix: if these settings must save, add persistence on `Save Card Setup`.
  - Focused test: toggle each, save, reload, assert persisted values.

- [x] `Save Card Setup`
  - Expected: save processor settings.
  - Current: prevents default and shows local success message using `processor` and `statementName`; no server/localStorage persistence.
  - Action type: submits, saves only visible confirmation.
  - Evidence: `credit-card-setup/page.tsx` lines 22-26, 125; covered by `billing-actions-behavior.spec.ts`.
  - Needs real fix: yes if production settings must persist.
  - Recommended exact fix: create a settings model/localStorage fallback or Supabase table write for processor settings and payment option toggles; hydrate existing saved values on load.
  - Files likely needing edits: `app/billing/credit-card-setup/page.tsx`, possibly `lib/` Supabase helper/API route, focused tests.
  - Focused test: update `billing-actions-behavior.spec.ts` with save/reload assertions.

- [x] Credit Card Setup `Reset`
  - Expected: reset form fields to defaults.
  - Current: native form reset resets uncontrolled form fields; does not reset React checkbox state.
  - Action type: clears/resets form fields.
  - Evidence: `credit-card-setup/page.tsx` line 124.
  - Needs real fix: yes, because reset only partly resets visible settings.
  - Recommended exact fix: change reset to controlled handler that resets all form fields and checkbox state to hydrated defaults.
  - Files likely needing edits: `app/billing/credit-card-setup/page.tsx`.
  - Focused test: toggle checkboxes and edit fields, click `Reset`, assert all values return to defaults.

- [x] Pay Per Deletion section checkboxes: `Credit Analysis`, `Personal Information`, `Return Item`
  - Expected: include/exclude estimate sections.
  - Current: toggles local `checked` map; selected labels appear in generated estimate preview.
  - Action type: toggles.
  - Evidence: `pay-per-deletion/page.tsx` lines 7, 83-94, 34.
  - Needs real fix: no for local preview; product fix if estimate document should include real section content.
  - Focused test: select two sections, build estimate, assert preview text.

- [x] Pay Per Deletion `Select Client`
  - Expected: select client for estimate.
  - Current: loads clients from Supabase, sets `clientId`; `Build Estimate` disabled until a client is selected. If no clients exist, user cannot build.
  - Action type: selects, gates submit.
  - Evidence: `pay-per-deletion/page.tsx` lines 14-32, 105-109, 129-132.
  - Needs real fix: no code bug, but seeded empty-state makes workflow unavailable without clients.
  - Focused test: mock/seed clients and assert build is enabled only after selection.

- [x] Pay Per Deletion `Report Type`
  - Expected: choose report type for estimate.
  - Current: updates local report type and writes selected type into generated estimate row.
  - Action type: selects.
  - Evidence: `pay-per-deletion/page.tsx` lines 5, 110-113, 44.
  - Needs real fix: no.
  - Focused test: select `3-Bureau Report`, build, assert row report type.

- [x] Pay Per Deletion `Browse HTML File`
  - Expected: choose an HTML credit report file.
  - Current: hidden file input accepts `.html,.htm`; label displays selected filename. File content is not parsed or used by build.
  - Action type: file selection only.
  - Evidence: `pay-per-deletion/page.tsx` lines 122-126.
  - Needs real fix: yes if uploaded report is expected to influence estimate.
  - Recommended exact fix: parse selected HTML file and feed parsed accounts/deletions into `buildEstimate`, or mark it clearly optional if only filename is needed.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly shared credit report parser if present.
  - Focused test: upload fixture HTML, build estimate, assert parsed items influence preview/amount.

- [x] Pay Per Deletion `Build Estimate`
  - Expected: generate estimate preview for selected client/report/sections.
  - Current: disabled without client; when enabled waits 900ms, appends local estimate row with selected sections and report type. Does not use uploaded HTML or fees.
  - Action type: submits/builds local preview.
  - Evidence: `pay-per-deletion/page.tsx` lines 33-47, 128-132.
  - Needs real fix: partial. Local row generation works; production estimate generation is incomplete.
  - Recommended exact fix: include configured fee schedule, parsed report data, and persistent estimate records; replace timeout with real generation.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly new billing estimate service/API.
  - Focused test: seeded client + fee + uploaded HTML produces expected row and persists across reload.

- [x] Pay Per Deletion row `Remove`
  - Expected: remove generated estimate row.
  - Current: filters estimate out of local state.
  - Action type: deletes local row.
  - Evidence: `pay-per-deletion/page.tsx` lines 187-189.
  - Needs real fix: no for local state; add persistence if estimates become stored.
  - Focused test: build estimate, remove it, assert row disappears.

- [x] Layout/topbar billing membership controls: `14 Days Left in The Trial`, `Activate`, `Activate Membership`, `ACTIVATE MEMBERSHIP`, activation modal `x`, `Your 2 Free Gifts expire in 47 hours!`, `ACTIVATE & CLAIM MY GIFTS`, `Open Registration`, `Close`, `Billing and membership`
  - Expected: trial link navigates to billing; activation buttons open modal; claim navigates to `/billing`; registration validates local password text; close buttons close modal.
  - Current: works as local UI/navigation; no real membership activation/payment.
  - Action type: navigates, opens modal, closes modal, local validation.
  - Evidence: `CDMLayout.tsx` lines 194-203, 229-249, 327-361.
  - Needs real fix: yes if activation/payment should be real.
  - Recommended exact fix: wire activation to real billing/subscription checkout flow, and make trial/membership state account-backed.
  - Files likely needing edits: `components/CDMLayout.tsx`, billing subscription route/component, checkout/API integration.
  - Focused test: click activation claim, assert checkout/subscription route or API handoff instead of only `/billing`.

## Broken / Non-Functional Buttons And Controls

- [ ] Top billing tab `Subscription`
  - Expected: navigate to a subscription/membership billing view.
  - Current: links to `/billing`, same as `Overview`; no subscription-specific panel, plan, checkout, cancel, or update controls.
  - Action type: navigates to overview only.
  - Evidence: `BillingWorkspace.tsx` line 397; `billing-compare.spec.ts` only checks the word exists.
  - Needs real fix: yes.
  - Recommended exact fix: add a real `/billing/subscription` route or render a subscription panel under `/billing`; update tab href to the real route and add plan/payment actions.
  - Files likely needing edits: `app/billing/BillingWorkspace.tsx`, new `app/billing/subscription/page.tsx` or equivalent, `components/CDMLayout.tsx` if sidebar should include it.
  - Focused test: add `tests/billing-subscription-actions.spec.ts` to click `Subscription` and assert subscription-specific heading/actions.

- [ ] Payment History sub-tabs `Payment History`, `Interval Billing History`, `Archived`
  - Expected: switch payment-history views.
  - Current: plain buttons with no `onClick`; visible only.
  - Action type: does nothing.
  - Evidence: `BillingWorkspace.tsx` lines 466-470.
  - Needs real fix: yes.
  - Recommended exact fix: introduce local `historyView` state; filter/render current, interval billing, and archived records, with active state.
  - Files likely needing edits: `app/billing/BillingWorkspace.tsx`.
  - Focused test: on `/billing/payment-history`, click each tab and assert active state and record set/empty state changes.

- [ ] Payment History advanced filters: `Select a Client`, `Payment Type`, `From Date`, `To Date`, `Search`, `Reset`, `Show 10 20 50 100 Entries`
  - Expected: filter payment history by client/type/date, reset filters, change page size.
  - Current: selects/date fields are uncontrolled and never read; `Search`/`Reset` have no handlers; "Show 10 20 50 100 Entries" is static text.
  - Action type: inputs are editable but do not filter; buttons do nothing.
  - Evidence: `BillingWorkspace.tsx` lines 471-492.
  - Needs real fix: yes.
  - Recommended exact fix: add state for client/type/from/to/pageSize; make `Search` apply filters to `PaymentHistory`; make `Reset` clear them; convert entries text to a real select/segmented control.
  - Files likely needing edits: `app/billing/BillingWorkspace.tsx`.
  - Focused test: select client/date/type, click `Search`, assert visible payment rows narrow; click `Reset`, assert all rows return.

- [ ] Services/Products original panel buttons `Services`, `Products`, `Add New Services`
  - Expected: switch between service/product records and open add service form.
  - Current: buttons have no handlers. Real add flow exists separately as header `Add Service/Product`.
  - Action type: does nothing.
  - Evidence: `BillingWorkspace.tsx` lines 500-504.
  - Needs real fix: yes.
  - Recommended exact fix: wire `Services`/`Products` to a type filter on `filteredServices`; wire `Add New Services` to `setModal("service")` or rename/remove it to avoid duplicate dead CTA.
  - Files likely needing edits: `app/billing/BillingWorkspace.tsx`.
  - Focused test: on `/billing/services-products`, click `Products` and assert product rows only; click `Add New Services` and assert add modal opens.

- [ ] `Payment Product Records` table action area
  - Expected: list gateway/product payment records with row actions.
  - Current: only table header is rendered; no body, no action controls, no empty state.
  - Action type: no visible row action exists.
  - Evidence: `BillingWorkspace.tsx` lines 505-512.
  - Needs real fix: yes if this table is intended to be usable.
  - Recommended exact fix: either remove the dead legacy table or back it with product/payment-gateway records and add row actions.
  - Files likely needing edits: `app/billing/BillingWorkspace.tsx`.
  - Focused test: assert empty state text or created product record appears with working action.

- [ ] Credit Card Setup `Add New Payment Processor`
  - Expected: open a processor creation form/modal or add processor row.
  - Current: button has no handler.
  - Action type: does nothing.
  - Evidence: `credit-card-setup/page.tsx` line 49.
  - Needs real fix: yes.
  - Recommended exact fix: open a modal/form for processor name, keys, default method, and test mode; save to state/persistence and render in `Payment Processor Records`.
  - Files likely needing edits: `app/billing/credit-card-setup/page.tsx`.
  - Focused test: click `Add New Payment Processor`, fill/save, assert row appears and can be selected.

- [ ] Credit Card Setup `Payment Processor Records` row actions
  - Expected: edit/delete/manage processor rows.
  - Current: no rows are rendered; `Action` header only.
  - Action type: no visible row action exists.
  - Evidence: `credit-card-setup/page.tsx` lines 48-63.
  - Needs real fix: yes if payment processors are supported.
  - Recommended exact fix: render saved processors with `Edit`, `Delete`, and default/test-mode controls.
  - Files likely needing edits: `app/billing/credit-card-setup/page.tsx`.
  - Focused test: add processor, edit it, delete it.

- [ ] Pay Per Deletion `+ Pay Per Deletion Fees`
  - Expected: open fee schedule setup or edit deletion fee amounts.
  - Current: button has no handler.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` lines 117-120.
  - Needs real fix: yes.
  - Recommended exact fix: open a fee setup modal/table; persist fees and use them in `Build Estimate`.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly billing fee storage/API.
  - Focused test: add a fee, build estimate, assert fee appears/amount is used.

- [ ] Pay Per Deletion `View Credentials`
  - Expected: display credentials/settings needed for pay-per-deletion workflow.
  - Current: button has no handler.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` lines 133-136.
  - Needs real fix: yes.
  - Recommended exact fix: open credentials modal or navigate to configured credentials/settings page; include empty state if none exist.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`.
  - Focused test: click `View Credentials`, assert modal/settings content appears and can close.

- [ ] Pay Per Deletion tabs `Current`, `Archive`, `Quick Import`
  - Expected: switch between current estimates, archived estimates, and import flow.
  - Current: static buttons with no handlers; `Current` is styled active regardless of clicks.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` lines 141-144.
  - Needs real fix: yes.
  - Recommended exact fix: add `view` state; render current/archive/import panels and active state.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`.
  - Focused test: click `Archive` and `Quick Import`, assert active state and content change.

- [ ] Pay Per Deletion date filters `From`, `To`
  - Expected: filter estimates by date.
  - Current: uncontrolled date inputs not read anywhere.
  - Action type: input only, no filter.
  - Evidence: `pay-per-deletion/page.tsx` lines 146-147.
  - Needs real fix: yes.
  - Recommended exact fix: store date filter state and apply it to estimate rows.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`.
  - Focused test: build two estimates with different dates or seed data, filter range, assert rows narrow.

- [ ] Pay Per Deletion toolbar `Archive`
  - Expected: archive selected/current estimate records.
  - Current: button has no handler and there is no row selection state.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` line 148.
  - Needs real fix: yes.
  - Recommended exact fix: add row selection or row-level archive; move selected rows to archived view.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`.
  - Focused test: build/select estimate, click `Archive`, assert removed from current and visible under archive.

- [ ] Pay Per Deletion row `Send`
  - Expected: send estimate email.
  - Current: rendered only after an estimate exists; no handler.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` line 179.
  - Needs real fix: yes.
  - Recommended exact fix: add send-email action with status/confirmation and failure handling; integrate email API or local simulated status.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly email/API utility.
  - Focused test: build estimate, click `Send`, assert sent status/confirmation.

- [ ] Pay Per Deletion row `Download`
  - Expected: download estimate document.
  - Current: no handler.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` line 182.
  - Needs real fix: yes.
  - Recommended exact fix: generate PDF/HTML/text document from estimate and trigger download.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly document generation utility.
  - Focused test: click `Download`, assert download event and filename.

- [ ] Pay Per Deletion row `Contract`
  - Expected: send/open contract flow.
  - Current: no handler.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` line 185.
  - Needs real fix: yes.
  - Recommended exact fix: open contract modal or navigate to digital contract creation with estimate context.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`, possibly contract route integration.
  - Focused test: click `Contract`, assert contract modal/page opens with estimate client.

- [ ] Pay Per Deletion bottom-card `Preview` buttons for `Cover and Welcome`, `Good Faith Estimate`, `Final Preview`
  - Expected: preview each estimate document section.
  - Current: three buttons with no handlers.
  - Action type: does nothing.
  - Evidence: `pay-per-deletion/page.tsx` lines 198-210.
  - Needs real fix: yes.
  - Recommended exact fix: open preview modal for selected section, backed by current generated estimate or disabled until an estimate exists.
  - Files likely needing edits: `app/billing/pay-per-deletion/page.tsx`.
  - Focused test: click each `Preview`, assert section-specific preview modal appears.

## Ambiguous Buttons Needing Original Comparison

- [ ] `Subscription`
  - Ambiguity: current clone only routes to overview. Need original comparison to determine whether it should show plan, membership activation, checkout, or usage.
  - Likely fix file: `app/billing/BillingWorkspace.tsx`; maybe new route.

- [ ] `Payment History`, `Interval Billing History`, `Archived`
  - Ambiguity: labels suggest original CDM tab behavior, but there is no current data model for interval billing or archived records.
  - Likely fix file: `app/billing/BillingWorkspace.tsx`.

- [ ] Services/Products legacy panel: `Services`, `Products`, `Add New Services`, `Payment Product Records`
  - Ambiguity: current page also has a newer `Services / Products` table and header add button. Need original comparison to decide whether the legacy product/payment gateway table should be removed or fully implemented.
  - Likely fix file: `app/billing/BillingWorkspace.tsx`.

- [ ] Credit Card Setup processor records
  - Ambiguity: original may expect payment-processor CRUD separate from settings form. Current page has both a dead processor-records area and a settings form.
  - Likely fix file: `app/billing/credit-card-setup/page.tsx`.

- [ ] Pay Per Deletion workflow controls
  - Ambiguity: many labels imply original automated estimate, fee, contract, email, archive, import, and document preview workflows. Current implementation is a local preview stub.
  - Likely fix file: `app/billing/pay-per-deletion/page.tsx`.

## Recommended Fix Order

1. Implement or remove dead same-page controls first: Payment History filters/tabs, Services/Products panel buttons, Credit Card Setup processor add.
2. Decide Subscription route behavior and create a real subscription page or remove the duplicate overview link.
3. Convert Credit Card Setup from confirmation-only to persisted settings.
4. Define Pay Per Deletion product scope: simple local estimate builder or full fee/report/email/download/contract workflow. Then wire all visible controls accordingly.
5. Split broad manual billing coverage into focused tests for each route and action.

## Focused Tests To Create / Update

- [ ] `tests/billing-navigation.spec.ts`
  - Check all billing top tabs and sidebar links navigate to the right route/heading, including fixed `Subscription`.

- [ ] `tests/billing-history-controls.spec.ts`
  - Check history sub-tabs, client/type/date filters, reset, and entries-size behavior.

- [ ] `tests/billing-services-products-controls.spec.ts`
  - Check `Services`, `Products`, and `Add New Services` behavior.

- [ ] `tests/billing-credit-card-setup-controls.spec.ts`
  - Check add/edit/delete processor, settings save/reload, checkbox reset/save.

- [ ] `tests/billing-pay-per-deletion-controls.spec.ts`
  - Check fee setup, HTML upload use, build estimate, archive, send, download, contract, and preview buttons.

- [ ] Update `tests/billing-actions-behavior.spec.ts`
  - Keep existing working coverage, add localStorage reload assertions for invoice/payment/service if local persistence remains intended.

