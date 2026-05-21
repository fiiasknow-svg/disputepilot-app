# Dispute Manager Button / Function Audit Checklist

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app\` was not inspected or edited.

No app files, tests, commits, or pushes were changed. This is a code/test audit only; no full suite was run.

## Routes Found

- [x] `/disputes` -> `app/disputes/page.tsx`
- [x] `/disputes/[id]` -> `app/disputes/[id]/page.tsx`
- [x] `/disputes/status` -> `app/disputes/status/page.tsx`
- [x] `/disputes/furnisher-addresses` -> wrapper around `app/dispute-manager/furnisher-addresses/page.tsx`
- [x] `/dispute-manager/furnisher-addresses` -> `app/dispute-manager/furnisher-addresses/page.tsx`
- [x] `/disputes/ai-metro-2-letters` -> `app/disputes/ai-metro-2-letters/page.tsx`
- [x] `/disputes/dispute-playbook` -> `app/disputes/dispute-playbook/page.tsx`

## Shared Dispute Manager Navigation

Source: `components/CDMLayout.tsx`

- [x] `Dispute Manager` sidebar group
  - Expected: expand/collapse the dispute menu.
  - Current behavior: toggles expanded state locally with `toggleExpand`.
  - Type: tab/menu disclosure.
  - Needs real fix: no.

- [x] `All Disputes`
  - Expected: navigate to `/disputes`.
  - Current behavior: `Link href="/disputes"`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `Dispute Status`
  - Expected: navigate to `/disputes/status`.
  - Current behavior: `Link href="/disputes/status"` in both Company and Dispute Manager nav groups.
  - Type: navigates.
  - Needs real fix: no.

- [x] `Furnisher Addresses`
  - Expected: navigate to `/disputes/furnisher-addresses`.
  - Current behavior: `Link href="/disputes/furnisher-addresses"`; route wraps `/dispute-manager/furnisher-addresses`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `AI/Metro 2 Letters`
  - Expected: navigate to `/disputes/ai-metro-2-letters`.
  - Current behavior: `Link href="/disputes/ai-metro-2-letters"`.
  - Type: navigates.
  - Needs real fix: no navigation fix, but destination page is a placeholder.

- [x] `Dispute Playbook`
  - Expected: navigate to `/disputes/dispute-playbook`.
  - Current behavior: `Link href="/disputes/dispute-playbook"`.
  - Type: navigates.
  - Needs real fix: no.

## `/disputes` Controls

Source: `app/disputes/page.tsx`. Existing focused tests: `tests/disputes-create-behavior.spec.ts`, `tests/manual-workflow-audit.spec.ts`, `tests/dispute-manager-pages-smoke.spec.ts`.

- [x] `Create New Dispute`
  - Expected: open a create dispute form.
  - Current behavior: calls `openCreate`, resets form/saved state, shows modal.
  - Type: opens modal.
  - Needs real fix: yes, if production disputes must persist. Current save is local React state only and disappears on refresh.
  - Recommended exact fix: replace `INITIAL_DISPUTES` local-only state with Supabase-backed load/create, using account scoping like `/disputes/status`.
  - Files likely needing edits: `app/disputes/page.tsx`, maybe shared dispute data helpers under `lib/`.
  - Focused test: update `tests/disputes-create-behavior.spec.ts` to verify the saved dispute survives reload or is visible after route revisit with mocked/seeded Supabase data.

- [x] `Search customer, furnisher, account, bureau, or letter`
  - Expected: filter visible dispute rows by text.
  - Current behavior: filters client, account, bureau, status, round, reason, and letter in memory.
  - Type: filters.
  - Needs real fix: no for current local page; yes if data becomes server-backed and large enough to require query-backed filtering.

- [x] `Filter by status`
  - Expected: show rows matching selected status.
  - Current behavior: filters local `disputes` array by exact status.
  - Type: filters.
  - Needs real fix: no.

- [x] `Filter by bureau`
  - Expected: show rows matching selected bureau.
  - Current behavior: filters local `disputes` array by exact bureau.
  - Type: filters.
  - Needs real fix: no.

- [x] `Clear Filters`
  - Expected: reset search/status/bureau filters.
  - Current behavior: sets search to empty and selects `All Statuses` / `All Bureaus`.
  - Type: clears filters.
  - Needs real fix: no.

- [x] row action `View`
  - Expected: show selected dispute details.
  - Current behavior: sets `selected`, opens details dialog with read-only fields.
  - Type: opens modal.
  - Needs real fix: no for view-only behavior.

- [x] create modal inputs: `Client / Customer *`, `Status`, `Round`, `Bureau`, `Dispute Reason / Type`, `Account / Creditor *`, `Letter / Template`, `Date`, `Notes`
  - Expected: edit draft dispute values.
  - Current behavior: controlled inputs update local `form`; client field uses localStorage-backed datalist suggestions.
  - Type: form editing.
  - Needs real fix: no for local draft behavior.

- [x] create modal `Cancel`
  - Expected: close modal and discard draft.
  - Current behavior: calls `cancelCreate`.
  - Type: closes modal.
  - Needs real fix: no.

- [x] create modal `Save Dispute`
  - Expected: submit new dispute.
  - Current behavior: disabled until client/account are filled, then prepends local dispute, closes modal, shows confirmation.
  - Type: submits local form.
  - Needs real fix: yes, same persistence issue as `Create New Dispute`.
  - Recommended exact fix: insert into Supabase `disputes` with `account_id`, normalize status/bureau/round casing with `/disputes/status`, and reload/prepend from persisted row.
  - Files likely needing edits: `app/disputes/page.tsx`; maybe schema helper in `lib/`.
  - Focused test: extend `tests/disputes-create-behavior.spec.ts` to cover persistence after reload and expected field mapping.

- [x] details dialog `x` / `Close dispute details`
  - Expected: close details modal.
  - Current behavior: sets `selected` to null.
  - Type: closes modal.
  - Needs real fix: no.

- [x] details dialog `Close`
  - Expected: close details modal.
  - Current behavior: sets `selected` to null.
  - Type: closes modal.
  - Needs real fix: no.

## `/disputes/status` Controls

Source: `app/disputes/status/page.tsx`. Existing focused tests mostly check visibility/tab toggles, not all row workflows.

- [x] `Update N Selected`
  - Expected: open batch status modal for selected rows.
  - Current behavior: appears only when `checkedIds.size > 0`; opens `showBatchModal`.
  - Type: opens modal.
  - Needs real fix: depends on checkbox bug below; button itself works after rows are selected.

- [x] `Export CSV`
  - Expected: export filtered rows to CSV.
  - Current behavior: creates a CSV blob from `filtered`, creates an anchor, and clicks it.
  - Type: exports.
  - Needs real fix: minor. Revoke object URL after click to avoid leaks; add escaping for embedded quotes.
  - Files likely needing edits: `app/disputes/status/page.tsx`.
  - Focused test: add a Playwright download test for `/disputes/status` with seeded disputes and filter applied.

- [x] `Refresh`
  - Expected: reload disputes from Supabase.
  - Current behavior: calls `load()`.
  - Type: refreshes data.
  - Needs real fix: no, but add error/loading feedback if desired.

- [x] view tabs `All Disputes`, `By Bureau`, `By Round`
  - Expected: switch the status page view.
  - Current behavior: sets local `view`; manual audit tests verify toggling remains visible.
  - Type: tabs.
  - Needs real fix: no.

- [x] search `Search client or account...`
  - Expected: filter all-disputes table by client or account.
  - Current behavior: filters by client first/last name and `account_name`.
  - Type: filters.
  - Needs real fix: no.

- [x] filters `All Statuses`, `All Bureaus`, `All Rounds`
  - Expected: filter all-disputes table.
  - Current behavior: filters local loaded Supabase rows by exact values.
  - Type: filters.
  - Needs real fix: no.

- [x] conditional `Clear`
  - Expected: reset all status page filters/search.
  - Current behavior: resets status, bureau, round, and search to `all` / empty.
  - Type: clears filters.
  - Needs real fix: no.

- [ ] row checkbox
  - Expected: select/deselect one dispute row.
  - Current behavior: the `<td>` has `onClick={...toggleCheck}` and the nested `<input>` has `onChange={...toggleCheck}`. Clicking directly on the checkbox can toggle twice and leave the row unselected.
  - Type: row selection.
  - Needs real fix: yes.
  - Recommended exact fix: remove the `<td onClick>` handler, or add `onClick={e => e.stopPropagation()}` to the checkbox and keep selection on `onChange` only.
  - Files likely needing edits: `app/disputes/status/page.tsx`.
  - Focused test: add/update a `/disputes/status` test that clicks a row checkbox by role and expects `Update 1 Selected` to appear.

- [x] select-all checkbox
  - Expected: select or clear all currently filtered rows.
  - Current behavior: `toggleAll` selects all filtered ids or clears all when all filtered are selected.
  - Type: bulk selection.
  - Needs real fix: no, but should be covered with the row-checkbox fix.

- [x] row click
  - Expected: open/collapse the right-side `Dispute Detail` panel.
  - Current behavior: toggles `selected` row.
  - Type: opens inline detail panel.
  - Needs real fix: no.

- [x] row `Update Status` select
  - Expected: update one dispute status.
  - Current behavior: calls Supabase `update({ status })` scoped by `account_id` when available, updates local row and selected panel.
  - Type: edits status.
  - Needs real fix: no for happy path. Add error handling if backend update fails.
  - Focused test: add a mocked/seeded test that changes the select and verifies local row/status badge update.

- [x] detail panel `x`
  - Expected: close selected dispute detail panel.
  - Current behavior: sets `selected` to null.
  - Type: closes detail panel.
  - Needs real fix: no.

- [x] detail panel status buttons `pending`, `sent`, `responded`, `resolved`
  - Expected: update selected dispute status.
  - Current behavior: calls same `updateStatus` function as row select.
  - Type: edits status.
  - Needs real fix: no for happy path; add error handling/disabled state if desired.

- [x] batch modal status buttons `pending`, `sent`, `responded`, `resolved`
  - Expected: choose batch target status.
  - Current behavior: sets local `batchStatus`.
  - Type: edits modal state.
  - Needs real fix: no.

- [x] batch modal `Cancel`
  - Expected: close batch modal.
  - Current behavior: sets `showBatchModal` false.
  - Type: closes modal.
  - Needs real fix: no.

- [x] batch modal `Set All to "status"`
  - Expected: update all selected disputes to chosen status.
  - Current behavior: loops selected ids, sends Supabase updates, updates local rows, clears checked ids, closes modal.
  - Type: batch edits status.
  - Needs real fix: no for happy path; add failure handling and disable while saving.
  - Focused test: after row-checkbox fix, select two rows, open modal, set all to resolved, verify button disappears and rows update.

## `/disputes/[id]` Controls

Source: `app/disputes/[id]/page.tsx`. No focused test currently covers this route.

- [x] `Back` / `Back to Disputes`
  - Expected: navigate back to `/disputes`.
  - Current behavior: `router.push("/disputes")`.
  - Type: navigates.
  - Needs real fix: no.

- [x] header status transition buttons `-> pending`, `-> sent`, `-> responded`, `-> resolved`
  - Expected: update dispute status.
  - Current behavior: calls Supabase update and local `setDispute`.
  - Type: edits status/workflow.
  - Needs real fix: no for happy path; add error handling.

- [x] `Edit` / `Cancel Edit`
  - Expected: toggle overview edit mode.
  - Current behavior: toggles `editMode`.
  - Type: opens/cancels edit mode.
  - Needs real fix: no.

- [x] tabs `Overview`, `Letters Sent`, `Bureau Response`, `Round History`, `Timeline`
  - Expected: switch detail page content.
  - Current behavior: sets local `tab`.
  - Type: tabs.
  - Needs real fix: no.

- [x] overview edit fields
  - Expected: edit account, bureau, reason, balance, furnisher fields.
  - Current behavior: controlled inputs/selects update `editFields`.
  - Type: form editing.
  - Needs real fix: no.

- [x] `Save Changes`
  - Expected: persist overview edits.
  - Current behavior: Supabase update with `editFields`, then local state update and exits edit mode.
  - Type: submits edit.
  - Needs real fix: no for happy path; add validation/error feedback.

- [ ] overview `Assign Letter`
  - Expected: assign selected letter template to this dispute.
  - Current behavior: only sets local `assignedLetter`; no `dispute_letters` insert, no queue item, no persisted assignment.
  - Type: local-only placeholder.
  - Needs real fix: yes.
  - Recommended exact fix: insert a row into `dispute_letters` or the app's letter queue with `dispute_id`, `account_id`, selected template/title, round, status/queued metadata; then reload/append `letters`.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`, maybe `app/letters/**` or a shared letter helper.
  - Focused test: create `/disputes/[id]` behavior test with seeded dispute, click `Assign Letter`, navigate to `Letters Sent`, and verify the queued letter persists after reload.

- [x] `+ Create Letter`
  - Expected: start a new letter for the current dispute.
  - Current behavior: navigates to `/letters` with no dispute id/template/client context.
  - Type: navigates.
  - Needs real fix: ambiguous. If original CDM opens a prefilled dispute letter, this needs a real fix.
  - Recommended exact fix: pass `?disputeId={id}` or route to a dispute-aware letter creation flow and prefill client/bureau/account/reason.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`, `app/letters/page.tsx`.
  - Focused test: route from detail page to letters and verify prefilled dispute context.

- [ ] letters list row `View Letter`
  - Expected: open/navigate to the letter detail.
  - Current behavior: rendered button has no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add `onClick={() => router.push(`/letters/${l.id}`)}` if a letter detail route exists, or open a modal with full `l.content`.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`; possibly add/use a letter detail route.
  - Focused test: seed a dispute letter, click `View Letter`, assert modal or URL/content changes.

- [ ] letters list row `Download PDF`
  - Expected: download a PDF for the letter.
  - Current behavior: rendered button has no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: connect to existing PDF/export utility or add a route handler that returns a generated PDF for `dispute_letters.id`.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`, PDF/export utility or route handler.
  - Focused test: Playwright download test for a seeded letter.

- [ ] `Assign & Queue`
  - Expected: assign selected letter template and queue it for this dispute.
  - Current behavior: same local-only `assignLetter`; no queue/persistence.
  - Type: local-only placeholder.
  - Needs real fix: yes.
  - Recommended exact fix: same as overview `Assign Letter`, but set queue status explicitly.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`, letter queue persistence layer.
  - Focused test: verify queue item appears and survives reload.

- [x] bureau response `Response Outcome`, `Response Date`, notes textarea
  - Expected: edit bureau response metadata/notes.
  - Current behavior: controlled fields update local response state.
  - Type: form editing.
  - Needs real fix: no.

- [x] bureau response `Save Response`
  - Expected: persist bureau response and mark dispute responded.
  - Current behavior: Supabase update `{ bureau_response, response_outcome, response_date, status: "responded" }`, local state update, temporary saved state.
  - Type: submits edit/workflow update.
  - Needs real fix: no for happy path; add validation/error handling.

- [x] conditional `Advance to Round N` under `Verified`
  - Expected: open confirmation to advance to next round.
  - Current behavior: sets `addingRound` true.
  - Type: opens modal/workflow.
  - Needs real fix: no for opening modal.

- [x] conditional `Mark as Resolved` under `Deleted`
  - Expected: mark dispute resolved.
  - Current behavior: calls `updateStatus("resolved")`.
  - Type: edits workflow status.
  - Needs real fix: no for happy path.

- [x] round history `+ New Round`
  - Expected: open confirmation to create next round.
  - Current behavior: sets `addingRound` true.
  - Type: opens modal.
  - Needs real fix: no for opening modal.

- [x] advance-round modal `Cancel`
  - Expected: close modal.
  - Current behavior: sets `addingRound` false.
  - Type: closes modal.
  - Needs real fix: no.

- [ ] advance-round modal `Advance to Round N`
  - Expected: create next dispute round and update status/round.
  - Current behavior: appends a local `rounds` item, calls `updateStatus("sent")`, closes modal, and updates Supabase `round`; it does not update local `dispute.round`, does not persist round history as a separate record, and does not require/queue a new letter.
  - Type: partial workflow update.
  - Needs real fix: yes.
  - Recommended exact fix: await a single persisted transaction-like flow: update dispute `round` and `status`, insert a round-history record if a table exists, update local `dispute.round`, and add error feedback. If no round-history table exists, derive all displayed round history consistently from persisted dispute/letter/response data.
  - Files likely needing edits: `app/disputes/[id]/page.tsx`; possibly Supabase schema/migration if round history should be durable.
  - Focused test: click `+ New Round`, confirm, assert visible `Round N`, status `sent`, and state survives reload.

## `/disputes/furnisher-addresses` and `/dispute-manager/furnisher-addresses` Controls

Source: `app/dispute-manager/furnisher-addresses/page.tsx`. Existing tests cover add/cancel/save/delete on `/dispute-manager/furnisher-addresses`; smoke also covers `/disputes/furnisher-addresses`.

- [x] `+ Add New Creditor`
  - Expected: open add creditor modal.
  - Current behavior: calls `openCreate`.
  - Type: opens modal.
  - Needs real fix: no.

- [x] search `Search by name or city...`
  - Expected: filter rows by creditor name/city.
  - Current behavior: filters local/localStorage rows by name or city.
  - Type: filters.
  - Needs real fix: no.

- [x] row `Edit`
  - Expected: open edit creditor modal.
  - Current behavior: loads row into `form`, sets `showEdit`.
  - Type: opens modal.
  - Needs real fix: no.

- [x] row `Delete`
  - Expected: open delete confirmation.
  - Current behavior: sets `deleteTarget`.
  - Type: opens modal.
  - Needs real fix: no.

- [x] add modal fields `Company Name`, `Address`, `City`, `State`, `Zip`
  - Expected: edit new creditor draft.
  - Current behavior: controlled local fields.
  - Type: form editing.
  - Needs real fix: no.

- [x] add modal `Cancel`
  - Expected: close add modal.
  - Current behavior: sets `showForm` false and clears message.
  - Type: closes modal.
  - Needs real fix: no.

- [x] add modal `Add Creditor`
  - Expected: save new creditor.
  - Current behavior: if name is blank, silently returns; otherwise prepends row and persists to localStorage.
  - Type: submits local form.
  - Needs real fix: yes if creditors/furnishers should be account-wide/server-backed. Also add validation feedback for blank name.
  - Recommended exact fix: persist to a Supabase `furnisher_addresses`/creditors table scoped by `account_id`; disable or show an inline validation message when company name is blank.
  - Files likely needing edits: `app/dispute-manager/furnisher-addresses/page.tsx`; maybe `app/disputes/furnisher-addresses/page.tsx` remains wrapper only.
  - Focused test: update furnisher behavior test to assert blank submit shows validation, and saved creditor survives reload with seeded/mock persistence.

- [x] edit modal `Cancel`
  - Expected: close edit modal without saving.
  - Current behavior: calls `closeEdit`.
  - Type: closes modal.
  - Needs real fix: no.

- [x] edit modal `Save Changes`
  - Expected: save edited creditor.
  - Current behavior: updates row in local state and localStorage.
  - Type: submits local edit.
  - Needs real fix: same persistence concern as add.
  - Focused test: add assertion that edited address/name persists after reload once backend persistence exists.

- [x] delete confirmation `Cancel`
  - Expected: close confirmation without removing row.
  - Current behavior: sets `deleteTarget` null.
  - Type: closes modal.
  - Needs real fix: no.

- [x] delete confirmation `Delete`
  - Expected: remove creditor.
  - Current behavior: filters local state and updates localStorage.
  - Type: deletes locally.
  - Needs real fix: same persistence concern as add.
  - Focused test: after backend persistence exists, assert deleted row stays gone after reload.

## `/disputes/dispute-playbook` Controls

Source: `app/disputes/dispute-playbook/page.tsx`. Smoke tests verify route and sample option buttons are visible.

- [x] strategy option buttons: `Online Dispute Portal`, `Certified Mail Dispute`, `Round 1 Standard Letter`, `Account-Specific Letter`, `Dual Bureau + Creditor`, `CFPB Complaint`, `Method of Verification Letter`, `FTC Complaint + Demand Letter`, `Updated Dispute with Evidence`, `Frivolous Dispute Rebuttal`, `Pre-Litigation Demand`, `File in Small Claims Court`
  - Expected: select/deselect a playbook option within each strategy card.
  - Current behavior: `pick` toggles local selection and shows `Selected: ...` within the card.
  - Type: tabs/selection controls.
  - Needs real fix: ambiguous. If these are meant to drive workflow generation or recommendations, they currently do not.
  - Recommended exact fix: compare with original CDM behavior. If selection should only be visual, no fix. If it should start a workflow, wire selected options to dispute/letter creation or a saved playbook plan.
  - Files likely needing edits: `app/disputes/dispute-playbook/page.tsx`, possibly `/letters` or dispute workflow helpers.
  - Focused test: add behavior test that clicks each option and verifies selection toggles; add workflow test only after original behavior is confirmed.

## `/disputes/ai-metro-2-letters` Controls

Source: `app/disputes/ai-metro-2-letters/page.tsx`.

- [ ] No page-specific visible controls
  - Expected: page title suggests generating AI-powered and Metro 2 compliant dispute letters.
  - Current behavior: static heading and description only; generation workflow is absent.
  - Type: missing workflow.
  - Needs real fix: yes if this route is intended to be usable.
  - Recommended exact fix: add a letter generation form or route users to existing `/letters/ai-rewriter` with Metro 2 templates/context; include generate, preview, save/queue, and copy/download controls.
  - Files likely needing edits: `app/disputes/ai-metro-2-letters/page.tsx`; possibly `app/letters/ai-rewriter/page.tsx`, `letterTemplates.ts`, and letter persistence helpers.
  - Focused test: create `tests/disputes-ai-metro-2-letters-behavior.spec.ts` covering sample/load/generate/save or navigation to AI rewriter, depending on chosen implementation.

## Broken / Non-Functional Summary

- [ ] `/disputes/status` row checkbox can double-toggle and fail to select when clicked directly.
- [ ] `/disputes/[id]` `Assign Letter` is local-only and not persisted.
- [ ] `/disputes/[id]` `Assign & Queue` is local-only and does not queue anything.
- [ ] `/disputes/[id]` letters list `View Letter` has no handler.
- [ ] `/disputes/[id]` letters list `Download PDF` has no handler.
- [ ] `/disputes/[id]` advance round flow is only partially persisted and leaves local `dispute.round` stale.
- [ ] `/disputes/ai-metro-2-letters` has no generation controls despite the route purpose.
- [ ] `/disputes` create/save is local-only; this is functional in tests but not durable.
- [ ] furnisher add/edit/delete are localStorage-only; functional locally but not durable/account-wide.

## Ambiguous Items Needing Original Comparison

- [ ] `/disputes/[id]` `+ Create Letter`: currently navigates to `/letters` without dispute context. Compare original to decide whether this should prefill/create a dispute-specific letter.
- [ ] `/disputes/dispute-playbook` strategy option buttons: currently visual selection only. Compare original to decide whether selecting should trigger a guided workflow.
- [ ] `/disputes` main page row `View`: view-only modal works, but original may include edit/archive/delete/letter actions not present here.
- [ ] Furnisher addresses persistence: localStorage may be acceptable for demo parity, but production/account behavior likely requires Supabase.

## Existing Test Coverage Observed

- [x] `tests/disputes-create-behavior.spec.ts` covers `/disputes` create modal, cancel, local save, and view modal.
- [x] `tests/dispute-manager-pages-smoke.spec.ts` covers route load and key visible controls for `/disputes`, `/disputes/status`, both furnisher address routes, playbook, and AI/Metro page.
- [x] `tests/disputes-compare.spec.ts` discovers dispute routes and compares visible surface/columns against expected clone surface; original comparison may be session-limited.
- [x] `tests/manual-workflow-audit.spec.ts` covers `/disputes` create/view, `/disputes/status` tab visibility/toggles, and `/dispute-manager/furnisher-addresses` add/edit cancel/delete.
- [x] `tests/operational-pages-smoke.spec.ts` is not dispute-specific; it checks operational pages like reports/calendar/bulk print/credit analysis.

## Recommended Focused Test Additions

- [ ] `tests/disputes-status-selection-behavior.spec.ts`: click a row checkbox directly and expect `Update 1 Selected`; batch update and assert status changes.
- [ ] `tests/dispute-detail-workflow-behavior.spec.ts`: seeded `/disputes/[id]` route covering edit save, status buttons, bureau response save, advance round persistence, and tabs.
- [ ] `tests/dispute-detail-letters-behavior.spec.ts`: seeded letters covering `Assign Letter`, `Assign & Queue`, `View Letter`, and `Download PDF`.
- [ ] `tests/disputes-create-persistence.spec.ts`: create dispute and verify it persists after reload or route revisit.
- [ ] `tests/furnisher-addresses-persistence.spec.ts`: add/edit/delete creditor and verify durable behavior after reload once backend persistence exists.
- [ ] `tests/disputes-ai-metro-2-letters-behavior.spec.ts`: cover the real AI/Metro 2 letter generation flow after implementation.
