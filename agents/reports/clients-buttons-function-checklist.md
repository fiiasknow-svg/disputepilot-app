# Clients / Customers Button Function Checklist

Scope: root app only, `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app/` was not inspected or edited. No app files, tests, commits, or pushes were changed. Existing tests were read only; no suite was run.

Routes found:
- `/clients`: `app/clients/page.tsx`
- `/clients/[id]`: `app/clients/[id]/page.tsx`
- `/get-customers`: `app/get-customers/page.tsx`
- `/get-customers/get-customers`: `app/get-customers/get-customers/page.tsx`
- `/get-customers/start-run-grow`: `app/get-customers/start-run-grow/page.tsx`
- `/get-customers/business-strategies`: `app/get-customers/business-strategies/page.tsx`
- No `app/customers/**` route exists.

## Working Buttons / Links / Controls

- [x] `/clients` sidebar link `Customers`
  - Expected: navigate to customer/client list.
  - Current: `components/CDMLayout.tsx` maps `Customers` to `/clients`.
  - Type: navigates.
  - Needs fix: no.
  - Test coverage: indirectly covered by client page smoke/parity tests.

- [x] `/clients` `Import CSV`
  - Expected: open CSV import modal.
  - Current: sets `showImport`; modal opens with hidden file input, text area, `Choose File`, `Cancel`, and `Import`.
  - Type: opens modal.
  - Needs fix: no functional fix; CSV parsing is basic comma-split and may be fragile, but visible action works.
  - Test coverage to add: focused import modal open/cancel and paste-import visibility test.

- [x] `/clients` import modal `Choose File`
  - Expected: open native file picker and load selected CSV text.
  - Current: clicks hidden file input and reads selected file with `FileReader`.
  - Type: file picker / input.
  - Needs fix: no.
  - Test coverage to add: set input file and verify text area populates.

- [x] `/clients` import modal `Import`
  - Expected: create clients from CSV and sync to Supabase when possible.
  - Current: inserts local rows immediately, then attempts Supabase insert; shows local success plus error if remote fails.
  - Type: submits/imports.
  - Needs fix: no real fix for visible behavior; CSV parser should later be hardened if quoted commas are required.
  - Test coverage to add: paste two-row CSV, click `Import`, assert rows and status notice.

- [x] `/clients` import modal `Cancel` and `x`
  - Expected: close modal without importing.
  - Current: `setShowImport(false)`.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` `Export CSV`
  - Expected: download visible/filtered clients CSV.
  - Current: builds CSV from `filtered`, creates blob link, clicks it, and shows notice.
  - Type: exports/downloads.
  - Needs fix: no.
  - Test coverage to add: intercept download or assert status notice after click.

- [x] `/clients` `Add New Customer` and `+ Add Client`
  - Expected: open add-client form.
  - Current: both set `showForm` true and reset form.
  - Type: opens modal.
  - Needs fix: no.
  - Covered by: `client-add-form-behavior.spec.ts`, `client-add-form-fields-behavior.spec.ts`, `client-add-save-behavior.spec.ts`, `clients.spec.ts`, `forms-smoke.spec.ts`, `manual-workflow-audit.spec.ts`.

- [x] `/clients` add modal fields
  - Expected: collect basic, personal, address, service/billing, referral, portal, tags, notes data.
  - Current: all visible inputs/selects/textareas update local form state.
  - Type: form controls.
  - Needs fix: no visible control fix.

- [x] `/clients` add modal `Save Client`
  - Expected: save a new client and close modal.
  - Current: requires first or last name; inserts local visible row immediately; attempts Supabase insert without `client_type`; shows status/error.
  - Type: submits.
  - Needs fix: no for current expected local-first behavior.
  - Covered by: `client-add-save-behavior.spec.ts`, `manual-workflow-audit.spec.ts`.

- [x] `/clients` add modal `Cancel`
  - Expected: close modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` stat cards `Total`, `Active`, `Pending`, `Inactive`, `Cancelled`
  - Expected: filter list by status group.
  - Current: click sets `statusTab`, resets page and selection.
  - Type: filters.
  - Needs fix: no.
  - Test coverage to add: stat-card click changes visible tab/filter state.

- [x] `/clients` customer search inputs `First Name`, `Last Name`, `Phone`, `Email`
  - Expected: filter list by typed value.
  - Current: filters are reactive on change and reset page to 1.
  - Type: filters.
  - Needs fix: no.
  - Covered by: `client-search-clear-behavior.spec.ts`.

- [x] `/clients` `Search`
  - Expected: apply search.
  - Current: only sets page to 1 because filtering already happens while typing.
  - Type: filter/apply.
  - Needs fix: no, but behavior is mostly redundant.

- [x] `/clients` `Clear`
  - Expected: reset search filters.
  - Current: clears search fields and type filter, resets page; does not reset status tab or sort.
  - Type: clears.
  - Needs fix: no unless original expected full reset.
  - Covered by: `client-search-clear-behavior.spec.ts`.

- [x] `/clients` tabs `All`, `Current`, `Leads`, `Archive`
  - Expected: filter by grouped client status.
  - Current: `All` all, `Current` active, `Leads` pending, `Archive` inactive/cancelled.
  - Type: filters/tabs.
  - Needs fix: no.
  - Covered by: `client-filter-tabs-behavior.spec.ts`, `manual-workflow-audit.spec.ts`.

- [x] `/clients` `Type` select
  - Expected: filter by client type/category.
  - Current: filters by lowercase `client_type`, resets only when `Clear` or save-new runs.
  - Type: filters.
  - Needs fix: no.

- [x] `/clients` `Sort` select
  - Expected: sort by newest, name, status, score.
  - Current: code sorts `filtered` by selected mode.
  - Type: sorts.
  - Needs fix: no.
  - Covered by: `client-sort-behavior.spec.ts`.

- [x] `/clients` view toggle `Table` / `Cards`
  - Expected: switch list layout.
  - Current: sets `view` state and renders table/card branches.
  - Type: view toggle.
  - Needs fix: no.
  - Covered by: `client-view-toggle-behavior.spec.ts`.

- [x] `/clients` row/card checkbox and header checkbox
  - Expected: select one/all visible clients and reveal bulk toolbar.
  - Current: toggles `selected`; header checkbox selects/deselects current page.
  - Type: selects.
  - Needs fix: no.
  - Test coverage to add: selecting a row reveals bulk toolbar and clear hides it.

- [x] `/clients` client name button
  - Expected: open full client profile.
  - Current: `router.push('/clients/{id}')`.
  - Type: navigates.
  - Needs fix: no.
  - Covered partly by: `client-view-profile-behavior.spec.ts`.

- [x] `/clients` row/card status dropdown
  - Expected: update client status.
  - Current: attempts Supabase update, updates local state either way, writes local rows, shows notice/error.
  - Type: edits status.
  - Needs fix: no.
  - Covered by: `client-status-change-behavior.spec.ts`.

- [x] `/clients` row/card `View`
  - Expected: open quick details modal.
  - Current: sets `viewTarget`; modal shows client fields, `Close`, and `Edit Client`.
  - Type: opens modal.
  - Needs fix: no.
  - Covered by: `client-view-profile-behavior.spec.ts`, `manual-workflow-audit.spec.ts`.

- [x] `/clients` quick view modal `Close` and `x`
  - Expected: close details.
  - Current: clears `viewTarget`.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` quick view modal `Edit Client`
  - Expected: switch from view modal to edit modal.
  - Current: closes view target and calls `openEdit`.
  - Type: opens edit modal.
  - Needs fix: no.

- [x] `/clients` row/card `Edit`
  - Expected: open edit form with existing client data.
  - Current: `openEdit` maps record fields into form state and opens edit modal.
  - Type: opens modal / edits.
  - Needs fix: no.
  - Covered by: `client-edit-action-behavior.spec.ts`.

- [x] `/clients` edit modal `Save Changes`
  - Expected: update existing client.
  - Current: updates local visible row, writes local clients, attempts Supabase update, shows status/error.
  - Type: submits/edit.
  - Needs fix: no.
  - Test coverage to add: edit a row, save, assert visible updated value and no schema error.

- [x] `/clients` edit modal `Cancel`
  - Expected: close without saving.
  - Current: clears `editing`.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` row/card delete icon
  - Expected: ask for delete confirmation.
  - Current: opens custom `Delete Client?` modal.
  - Type: opens modal.
  - Needs fix: no.
  - Note: existing `client-delete-safe-behavior.spec.ts` expects a native dialog, but the app uses a modal. Update test during fix pass.

- [x] `/clients` delete modal `Cancel`
  - Expected: close without deleting.
  - Current: clears `deleteTarget`.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` delete modal `Delete`
  - Expected: delete one client.
  - Current: attempts Supabase delete, removes local row either way, clears selection, shows notice/error.
  - Type: deletes.
  - Needs fix: no for single-row delete.

- [x] `/clients` rows per page `25`, `50`, `100`
  - Expected: change page size.
  - Current: sets `pageSize`, resets page.
  - Type: pagination.
  - Needs fix: no.
  - Covered by: `client-pagination-behavior.spec.ts`.

- [x] `/clients` pagination `<<`, `<`, `>`, `>>`
  - Expected: first, previous, next, last page navigation.
  - Current: updates page state and disables at boundaries.
  - Type: pagination.
  - Needs fix: no.

- [x] `/clients` bulk `Send Email`
  - Expected: open bulk email modal for selected clients.
  - Current: opens modal; modal sends POSTs to `/api/send-email` for selected clients with email.
  - Type: opens modal / submits.
  - Needs fix: no core UI fix; consider better success status than `alert`.
  - Test coverage to add: select rows, open modal, fill subject/body, route `/api/send-email`, assert fetch calls and modal closes.

- [x] `/clients` bulk email modal `Cancel`
  - Expected: close modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` bulk email modal `Send Email`
  - Expected: send to selected clients with emails.
  - Current: disabled without subject; sends fetch requests, alerts success/failure, clears fields.
  - Type: submits.
  - Needs fix: no, but UX can be improved later.

- [x] `/clients` bulk `Update Status`
  - Expected: open status update modal for selected clients.
  - Current: opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] `/clients` bulk status modal select and `Apply`
  - Expected: apply chosen status to selected clients.
  - Current: attempts Supabase bulk update, updates local selected clients, clears selection, closes modal.
  - Type: edits status.
  - Needs fix: no.

- [x] `/clients` bulk status modal `Cancel`
  - Expected: close modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients` bulk `Clear`
  - Expected: clear selected clients.
  - Current: clears `selected`.
  - Type: clears selection.
  - Needs fix: no.

- [x] `/clients/[id]` header `Portal Access`
  - Expected: toggle portal access for client profile.
  - Current: toggles form state; persists only after `Save Changes`.
  - Type: edit toggle.
  - Needs fix: no.

- [x] `/clients/[id]` header `Send Email`
  - Expected: open single-client email modal.
  - Current: opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] `/clients/[id]` header `Back`
  - Expected: return to client list.
  - Current: `router.push('/clients')`.
  - Type: navigates.
  - Needs fix: no.

- [x] `/clients/[id]` header/bottom `Save Changes`
  - Expected: persist profile edits.
  - Current: writes local client, attempts Supabase update with sanitized payload, shows saved state.
  - Type: submits/edit.
  - Needs fix: no.
  - Covered by: `client-view-profile-behavior.spec.ts`.

- [x] `/clients/[id]` tabs `Overview`, `Disputes`, `Documents`, `Invoices`, `Notes`, `Activity`
  - Expected: switch to tab content.
  - Current: each of these has a rendered content branch.
  - Type: tabs.
  - Needs fix: no for these six tabs.

- [x] `/clients/[id]` Overview form fields and bottom `Cancel`
  - Expected: edit fields; cancel returns to list.
  - Current: fields update form state; `Cancel` navigates to `/clients`.
  - Type: form controls / navigates.
  - Needs fix: no.

- [x] `/clients/[id]` Disputes `+ New Dispute`
  - Expected: navigate to dispute creation/list.
  - Current: `router.push('/disputes')`.
  - Type: navigates.
  - Needs fix: no, unless original expected preselected client creation.

- [x] `/clients/[id]` Disputes row `View`
  - Expected: navigate to dispute detail.
  - Current: `router.push('/disputes/{id}')`.
  - Type: navigates.
  - Needs fix: no.

- [x] `/clients/[id]` Invoices `View All Billing`
  - Expected: navigate to billing.
  - Current: `router.push('/billing')`.
  - Type: navigates.
  - Needs fix: no.

- [x] `/clients/[id]` Documents `+ Upload Document`
  - Expected: choose a document and attach it to profile.
  - Current: hidden file input adds selected file metadata to local `docs` state and activity only.
  - Type: file input/upload-local.
  - Needs fix: no for local UI; real persistence may be future work.

- [x] `/clients/[id]` Documents delete `x`
  - Expected: remove uploaded document row.
  - Current: filters local docs array.
  - Type: deletes local item.
  - Needs fix: no.

- [x] `/clients/[id]` Notes `Add Note`
  - Expected: add note.
  - Current: disabled when blank; adds local note and activity.
  - Type: submits/adds local item.
  - Needs fix: no.

- [x] `/clients/[id]` email modal `Cancel`
  - Expected: close modal.
  - Current: closes modal and resets email status.
  - Type: closes modal.
  - Needs fix: no.

- [x] `/clients/[id]` email modal `Send Email`
  - Expected: send email to client.
  - Current: posts to `/api/send-email`, closes and adds activity on OK, shows error on failure; disabled when no email.
  - Type: submits.
  - Needs fix: no.

- [x] `/get-customers` cards `Start, Run & Grow`, `Business Strategies`, `Get Customers`
  - Expected: navigate to related resources.
  - Current: card click pushes `/get-customers/{slug}`.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers` `View Partner Resources`
  - Expected: navigate to partner resources.
  - Current: `router.push('/partner-resources')`.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/start-run-grow` `Back to Get Customers`
  - Expected: navigate to `/get-customers`.
  - Current: works.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/start-run-grow` `Next: Business Strategies`
  - Expected: navigate to business strategies.
  - Current: works.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/business-strategies` `Back to Get Customers`
  - Expected: navigate to `/get-customers`.
  - Current: works.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/business-strategies` `View Client Acquisition`
  - Expected: navigate to `/get-customers/get-customers`.
  - Current: works.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/get-customers` `Back to Get Customers`
  - Expected: navigate to `/get-customers`.
  - Current: works.
  - Type: navigates.
  - Needs fix: no.

- [x] `/get-customers/get-customers` lead source list items
  - Expected: switch active lead-source detail.
  - Current: clickable divs update `activeSource`.
  - Type: tabs/filter-like selector.
  - Needs fix: no.

## Broken / Non-Functional Buttons

- [ ] `/clients` bulk `Delete`
  - Expected behavior: because this deletes multiple selected clients, it should require confirmation before removal.
  - Current behavior: calls `bulkDelete` immediately; no confirmation modal or undo.
  - Type: deletes.
  - Needs real fix: yes.
  - Recommended exact fix: add `bulkDeleteOpen` confirmation state and modal similar to single-client `Delete Client?`; wire toolbar `Delete` to open modal, add modal `Cancel` and `Delete` buttons, and call existing `bulkDelete` only from confirm.
  - Files likely needing edits: `app/clients/page.tsx`.
  - Focused test: create/update `tests/client-delete-safe-behavior.spec.ts` to select two rows, click bulk delete, assert confirmation visible, cancel preserves rows, confirm removes rows.

- [ ] `/clients` bulk `Export`
  - Expected behavior: export only selected clients when invoked from the selected toolbar.
  - Current behavior: reuses `exportCSV()`, which exports all `filtered` clients, ignoring `selected`.
  - Type: exports.
  - Needs real fix: yes.
  - Recommended exact fix: change `exportCSV` to accept an optional row list or mode, e.g. `exportCSV(rows = filtered, filename = 'clients.csv')`; toolbar calls `exportCSV(filtered.filter(c => selected.has(c.id)), 'selected-clients.csv')`; header export keeps all filtered rows.
  - Files likely needing edits: `app/clients/page.tsx`.
  - Focused test: add `tests/client-bulk-export-behavior.spec.ts` that selects one seeded row, clicks toolbar export, and asserts only selected row is in downloaded CSV.

- [ ] `/clients/[id]` `Letters` tab
  - Expected behavior: show letters associated with this client or a clear empty state/action.
  - Current behavior: tab button changes `tab` to `Letters`, but no `{tab==="Letters"}` branch exists, so the content area goes blank below tabs.
  - Type: does nothing / empty tab.
  - Needs real fix: yes.
  - Recommended exact fix: add a `Letters` tab content branch with a visible empty state plus a `Create Letter` or `View All Letters` navigation button; if letters relation exists, load/filter letters by client id.
  - Files likely needing edits: `app/clients/[id]/page.tsx`; possibly `app/letters/page.tsx` if deep-link/preselect is desired.
  - Focused test: extend `tests/client-view-profile-behavior.spec.ts` to click `Letters` and assert nonblank content and a working navigation/action.

- [ ] `/clients/[id]` `Portal` tab
  - Expected behavior: show portal access settings, invite/reset controls, or clear portal empty state.
  - Current behavior: tab button changes `tab` to `Portal`, but no `{tab==="Portal"}` branch exists, so the content area goes blank below tabs.
  - Type: does nothing / empty tab.
  - Needs real fix: yes.
  - Recommended exact fix: add a `Portal` tab content branch showing current portal access state, email, and at minimum a persistent `Portal Access` toggle with `Save Changes`; optionally add invite/reset actions if backed by existing APIs.
  - Files likely needing edits: `app/clients/[id]/page.tsx`.
  - Focused test: extend `tests/client-view-profile-behavior.spec.ts` to click `Portal`, toggle access, save, and assert no blank content or runtime error.

- [ ] `/clients/[id]` Documents row `Download`
  - Expected behavior: download/open the uploaded document.
  - Current behavior: visible button has no `onClick`, no href, and no stored file URL/blob; it does nothing.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: for local-only docs, store an object URL when uploading and set `Download` to an anchor/button that downloads that URL; for production, persist to storage and use the stored URL. If download is not supported, hide the button until a URL exists.
  - Files likely needing edits: `app/clients/[id]/page.tsx`.
  - Focused test: upload a small file, assert `Download` has a real download action or is absent/disabled with clear unavailable state.

## Ambiguous Buttons Needing Original Comparison

- [ ] `/clients` header naming has both `Add New Customer` and `+ Add Client`
  - Expected behavior: unknown whether original app intentionally had both labels or one is compatibility/parity scaffolding.
  - Current behavior: both open the same `Add New Client` modal.
  - Type: opens modal.
  - Needs real fix: no unless original comparison says one should be removed/renamed.
  - Files likely needing edits if changed: `app/clients/page.tsx`; tests that assert both labels.
  - Focused test: keep `clients-customers-parity.spec.ts` if both labels are required.

- [ ] `/clients` quick `View` opens modal while client name opens `/clients/[id]`
  - Expected behavior: unknown whether `View` should open a quick modal or navigate to the full profile.
  - Current behavior: `View` opens quick details modal; client name navigates to profile route.
  - Type: opens modal vs navigates.
  - Needs real fix: no unless original expected `View` to navigate.
  - Files likely needing edits if changed: `app/clients/page.tsx`.
  - Focused test: update `client-view-profile-behavior.spec.ts` to assert whichever behavior original requires.

- [ ] `/clients` `Clear`
  - Expected behavior: unknown whether it should clear all filters/tabs/sort or only search/type filters.
  - Current behavior: clears search fields and type filter, keeps status tab and sort.
  - Type: clears.
  - Needs real fix: no unless original expected complete reset.
  - Files likely needing edits if changed: `app/clients/page.tsx`.
  - Focused test: extend `client-search-clear-behavior.spec.ts` to assert exact reset scope.

- [ ] `/clients` `Search`
  - Expected behavior: unknown whether search should be explicit-submit only.
  - Current behavior: search is reactive while typing; button only resets page to 1.
  - Type: filter/apply.
  - Needs real fix: no unless original expected delayed search.
  - Files likely needing edits if changed: `app/clients/page.tsx`.
  - Focused test: assert typed value filters before or only after `Search`, based on original.

- [ ] `/clients/[id]` `+ New Dispute`
  - Expected behavior: unknown whether it should navigate to generic disputes or create a dispute with this client preselected.
  - Current behavior: navigates to `/disputes`.
  - Type: navigates.
  - Needs real fix: no unless original expected client preselection.
  - Files likely needing edits if changed: `app/clients/[id]/page.tsx`, maybe `app/disputes/page.tsx`.
  - Focused test: click from profile and assert destination/preselected client behavior.

- [ ] `/clients/[id]` `View All Billing`
  - Expected behavior: unknown whether it should navigate to `/billing` or a client-filtered billing route.
  - Current behavior: navigates to `/billing`.
  - Type: navigates.
  - Needs real fix: no unless original expected client filter.
  - Files likely needing edits if changed: `app/clients/[id]/page.tsx`, billing route handling.
  - Focused test: click and assert billing destination/client context.

- [ ] `/clients/[id]` `+ Upload Document`
  - Expected behavior: unknown whether documents must persist beyond local state.
  - Current behavior: adds local metadata only; page reload loses docs.
  - Type: local upload.
  - Needs real fix: maybe, depending original/product requirement.
  - Files likely needing edits if changed: `app/clients/[id]/page.tsx`; storage/API layer if available.
  - Focused test: upload then reload; assert expected persistence or documented local-only behavior.

- [ ] `/clients/[id]` `Add Note`
  - Expected behavior: unknown whether notes must persist.
  - Current behavior: adds local state only; page reload loses notes.
  - Type: local submit.
  - Needs real fix: maybe, depending original/product requirement.
  - Files likely needing edits if changed: `app/clients/[id]/page.tsx`; Supabase notes table/API if available.
  - Focused test: add note then reload; assert expected persistence or documented local-only behavior.

- [ ] `/get-customers/*` clickable cards/items are `div onClick`, not semantic buttons/links
  - Expected behavior: unknown whether accessibility parity matters in this pass.
  - Current behavior: mouse click works, but keyboard/link semantics are weak for cards and lead-source selectors.
  - Type: navigates / filters.
  - Needs real fix: maybe, for accessibility.
  - Files likely needing edits: `app/get-customers/page.tsx`, `app/get-customers/get-customers/page.tsx`.
  - Focused test: add keyboard/accessibility assertions if this route enters fix scope.

## Existing Test Notes

- Client/customer tests found and read:
  - `tests/client-add-form-behavior.spec.ts`
  - `tests/client-add-form-fields-behavior.spec.ts`
  - `tests/client-add-save-behavior.spec.ts`
  - `tests/client-delete-safe-behavior.spec.ts`
  - `tests/client-edit-action-behavior.spec.ts`
  - `tests/client-filter-tabs-behavior.spec.ts`
  - `tests/client-pagination-behavior.spec.ts`
  - `tests/client-search-clear-behavior.spec.ts`
  - `tests/client-sort-behavior.spec.ts`
  - `tests/client-status-change-behavior.spec.ts`
  - `tests/client-view-profile-behavior.spec.ts`
  - `tests/client-view-toggle-behavior.spec.ts`
  - `tests/clients-customers-parity.spec.ts`
  - `tests/clients-workflow-real.spec.ts`
  - `tests/clients.spec.ts`
  - `tests/forms-smoke.spec.ts`
  - `tests/get-customers-pages-smoke.spec.ts`
  - `tests/manual-workflow-audit.spec.ts`
  - `tests/operational-pages-smoke.spec.ts`

- Test mismatch to fix later:
  - `tests/client-delete-safe-behavior.spec.ts` listens for a native browser dialog, but current single delete uses a custom modal. Update it to assert the custom modal, and add separate coverage for bulk delete confirmation.

- Highest-priority focused tests for next pass:
  - Bulk delete confirmation/cancel/confirm.
  - Bulk export exports selected rows only.
  - `/clients/[id]` `Letters` tab nonblank/action behavior.
  - `/clients/[id]` `Portal` tab nonblank/action behavior.
  - `/clients/[id]` document `Download` action or intentionally unavailable state.
