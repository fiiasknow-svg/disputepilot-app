# Employees / Team / Team Messages Button Function Checklist

Scope: root app only at `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app\` was not inspected or edited.

Routes found:
- `/employees` from `app/employees/page.tsx`
- `/company/team-messages` from `app/company/team-messages/page.tsx`
- Sidebar links in `components/CDMLayout.tsx`: `Employees` -> `/employees`, `Team Messages` -> `/company/team-messages`

Tests inspected:
- `tests/employees-behavior.spec.ts`
- `tests/employees-parity.spec.ts`
- `tests/employees-training-button.spec.ts`
- `tests/manual-workflow-audit.spec.ts`
- `tests/operational-pages-smoke.spec.ts`
- `tests/workflow-interactions-smoke.spec.ts`
- `tests/save-buttons-no-error.spec.ts`

No full suite was run. No app files, tests, commits, or pushes were changed.

## Working Buttons / Links

- [x] `Employees` sidebar link
  - Expected: navigate to `/employees`.
  - Current behavior: Next `Link` points to `/employees`.
  - Type: navigates.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: sidebar navigation assertion in an employees/team navigation spec.

- [x] `Team Messages` sidebar link
  - Expected: navigate to `/company/team-messages`.
  - Current behavior: Next `Link` points to `/company/team-messages`.
  - Type: navigates.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: sidebar navigation assertion in an employees/team navigation spec.

- [x] `Back`
  - Expected: return to previous browser history entry.
  - Current behavior: calls `history.back()`.
  - Type: navigates via browser history.
  - Needs real fix: maybe only if original requires a deterministic destination.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: seed prior route, open `/employees`, click `Back`, assert previous URL.

- [x] `Add New Employee`
  - Expected: open add employee modal.
  - Current behavior: clears edit state/form and opens `Add Employee` modal.
  - Type: opens modal.
  - Needs real fix: no for opening; save behavior has separate issues below.
  - Files likely needing edits: none for this control.
  - Focused test: already covered by `employees-behavior.spec.ts`.

- [x] Employee modal `Cancel`
  - Expected: close add/edit modal.
  - Current behavior: closes modal and clears editing state.
  - Type: closes modal.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: assert modal closes from both add and edit modes.

- [x] Row `Edit`
  - Expected: open edit modal populated from selected employee.
  - Current behavior: opens `Edit Employee`; role/status/department/title/notes are editable in UI.
  - Type: opens modal / edits.
  - Needs real fix: no for opening; save persistence has separate issues below.
  - Files likely needing edits: `app/employees/page.tsx` if persistence columns are fixed.
  - Focused test: already lightly covered by `employees-behavior.spec.ts`; add assertion fields are prefilled.

- [x] Row active `Yes` / `No`
  - Expected: toggle employee active status.
  - Current behavior: attempts Supabase update, then updates local row state even if Supabase fails and shows local failure notice.
  - Type: toggles active.
  - Needs real fix: yes, if remote persistence is required before claiming success.
  - Recommended exact fix: only update local state after successful Supabase update, or explicitly mark optimistic state as unsaved and retry/revert on error.
  - Files likely needing edits: `app/employees/page.tsx`; Supabase employee update policy/schema if errors are backend-side.
  - Focused test: mock failed status update and assert row does not silently persist a false success.

- [x] Row `Delete`
  - Expected: open delete confirmation.
  - Current behavior: sets `deleteId` and opens `Remove Employee?` modal.
  - Type: opens modal.
  - Needs real fix: no for opening; confirm behavior has separate issue below.
  - Files likely needing edits: none for this control.
  - Focused test: already lightly covered by `employees-behavior.spec.ts`.

- [x] Delete modal `Cancel`
  - Expected: close delete confirmation.
  - Current behavior: clears `deleteId`.
  - Type: closes modal.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: assert row remains after cancel.

- [x] Row `Activity Log`
  - Expected: show employee activity.
  - Current behavior: opens an activity modal, but entries are generated mock rows from employee timestamps; text says a real `activity_log` table is required.
  - Type: previews / opens modal.
  - Needs real fix: yes, if activity must be real.
  - Recommended exact fix: read activity rows from an `activity_log` table keyed by employee/user/account and render empty state when none exist.
  - Files likely needing edits: `app/employees/page.tsx`, Supabase activity table/RLS.
  - Focused test: seed or mock activity rows, open activity log, assert real event text and no generated placeholder rows.

- [x] Activity modal `x`
  - Expected: close activity modal.
  - Current behavior: clears `viewActivity`.
  - Type: closes modal.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: close modal assertion.

- [x] `Training Videos`
  - Expected: open training panel.
  - Current behavior: opens `Employees Training Videos` dialog and closes with `Close`; content is a local placeholder.
  - Type: opens modal / previews.
  - Needs real fix: yes, if a real training video is expected.
  - Recommended exact fix: replace placeholder with configured hosted video/embed source and preserve the visible dialog behavior.
  - Files likely needing edits: `app/employees/page.tsx`; possibly config/content source.
  - Focused test: existing `employees-training-button.spec.ts`; update to expect the real video/embed once connected.

- [x] Training modal `Close`
  - Expected: close training dialog.
  - Current behavior: closes dialog.
  - Type: closes modal.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: already covered by `employees-training-button.spec.ts`.

- [x] Employee row checkbox
  - Expected: select row for bulk actions.
  - Current behavior: toggles selected `Set`; shows bulk toolbar when selected count > 0.
  - Type: selects.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: select one row and assert bulk toolbar appears.

- [x] Header checkbox
  - Expected: select/deselect current page rows.
  - Current behavior: toggles all visible paged employee ids.
  - Type: selects / clears.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: assert all visible rows selected, then cleared.

- [x] Bulk `Update Status` dropdown
  - Expected: show active/inactive choices for selected employees.
  - Current behavior: opens local dropdown.
  - Type: opens menu.
  - Needs real fix: no for opening; persistence has same issue as row status toggle.
  - Files likely needing edits: `app/employees/page.tsx` for persistence semantics.
  - Focused test: select rows, open dropdown, assert `active` and `inactive` choices.

- [x] Bulk `active` / `inactive`
  - Expected: apply selected employee status.
  - Current behavior: attempts Supabase update, then updates local row state even if Supabase fails.
  - Type: toggles active / bulk updates.
  - Needs real fix: yes.
  - Recommended exact fix: make bulk status success conditional on Supabase success, or implement explicit optimistic rollback/error state.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: with two selected rows, apply inactive and assert persisted/local state only updates on success.

- [x] Bulk `Export`
  - Expected: export filtered employees.
  - Current behavior: creates `employees.csv` from current filtered employees.
  - Type: exports.
  - Needs real fix: no for browser export; maybe yes if original requires selected-only export.
  - Files likely needing edits: `app/employees/page.tsx` if selected-only behavior is desired.
  - Focused test: trigger download and assert CSV filename/content.

- [x] Bulk `Clear`
  - Expected: clear selected rows.
  - Current behavior: resets selected set.
  - Type: clears.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: selected count disappears after click.

- [x] `Export CSV`
  - Expected: export employee CSV.
  - Current behavior: creates `employees.csv` from current filtered employees.
  - Type: exports.
  - Needs real fix: no, unless original requires server-side/export-all behavior.
  - Files likely needing edits: `app/employees/page.tsx` if original comparison differs.
  - Focused test: download assertion.

- [x] Search box `Search by name, email, role, department...`
  - Expected: filter visible employees.
  - Current behavior: filters local employees by name, email, role, department, title and resets page to 1.
  - Type: searches / filters.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: seed employees and assert search narrows table.

- [x] `All Roles` select
  - Expected: filter by role.
  - Current behavior: filters local employee list and resets page.
  - Type: filters.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: choose role, assert only matching role rows.

- [x] `All Status` select
  - Expected: filter by active/inactive.
  - Current behavior: filters local employee list and resets page.
  - Type: filters.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: choose inactive, assert only inactive rows.

- [x] `All Departments` select
  - Expected: filter by department.
  - Current behavior: filters local employee list and resets page, but department is not currently saved in the Supabase payload.
  - Type: filters.
  - Needs real fix: yes, if department must persist.
  - Recommended exact fix: include `department` in employee insert/update payload after confirming the `employees` table has a matching column.
  - Files likely needing edits: `app/employees/page.tsx`, Supabase schema/migration if missing.
  - Focused test: create employee with department, reload or refetch, assert department filter finds it.

- [x] Rows select `Rows: 25/50/100`
  - Expected: change page size.
  - Current behavior: updates `pageSize` and resets page.
  - Type: selects / paginates.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: seed >25 rows and assert visible row count changes.

- [x] Pagination `«`, `‹`, `›`, `»`
  - Expected: first/previous/next/last page.
  - Current behavior: updates page within computed page bounds and disables at edges.
  - Type: navigates within table.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: seed >pageSize rows and assert page label/range changes.

- [x] `Invite by Email`
  - Expected: open invite modal.
  - Current behavior: opens `Invite Employee by Email` modal.
  - Type: opens modal.
  - Needs real fix: no for opening; send behavior is broken/non-functional below.
  - Files likely needing edits: none for this control.
  - Focused test: open/cancel modal.

- [x] Invite modal `Cancel`
  - Expected: close invite modal.
  - Current behavior: closes modal.
  - Type: closes modal.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: assert modal closes.

- [x] Team Messages `Mark All Read`
  - Expected: mark all messages read.
  - Current behavior: marks all in local `messages` state read; button hides when unread count reaches zero.
  - Type: toggles read state.
  - Needs real fix: yes, if messages must persist.
  - Recommended exact fix: store messages/read state in backend and update read receipts per account/user.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message table/RLS/API.
  - Focused test: mark read, reload/refetch, assert messages remain read.

- [x] Team Messages `+ Compose`
  - Expected: open new message modal.
  - Current behavior: clears compose error and opens `New Message`.
  - Type: opens modal.
  - Needs real fix: no for opening; sending is local-only below.
  - Files likely needing edits: none for this control.
  - Focused test: already covered by `workflow-interactions-smoke.spec.ts` and `manual-workflow-audit.spec.ts`.

- [x] Team Messages `Inbox` / `Sent`
  - Expected: switch message lists.
  - Current behavior: changes local tab and clears selected thread.
  - Type: filters / selects tab.
  - Needs real fix: yes, if backed by real inbox/sent folders.
  - Recommended exact fix: query persisted messages by recipient/sender and read state instead of filtering the sample array.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message storage/API.
  - Focused test: create a sent message, switch tabs, assert it appears in Sent and proper inbox messages remain.

- [x] Team Messages search `Search messages...`
  - Expected: filter messages by text.
  - Current behavior: filters current local inbox/sent source by subject/from/body.
  - Type: searches / filters.
  - Needs real fix: no for current local data; yes if server-backed search is required.
  - Files likely needing edits: `app/company/team-messages/page.tsx` if backend search is added.
  - Focused test: fill search term and assert matching/nonmatching messages.

- [x] Message row click
  - Expected: open thread and mark message read.
  - Current behavior: sets selected message and updates local `read: true`.
  - Type: selects / previews / toggles read.
  - Needs real fix: yes, if read status must persist.
  - Recommended exact fix: persist read receipt and load real thread data.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message read API/table.
  - Focused test: click unread message, assert unread count decreases and persists after reload.

- [x] Thread `Delete`
  - Expected: delete selected message/thread.
  - Current behavior: removes message from local state and clears selected if needed.
  - Type: deletes.
  - Needs real fix: yes.
  - Recommended exact fix: implement backend delete/archive behavior; prefer soft-delete/archive per user rather than hard-deleting shared team threads.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message API/table.
  - Focused test: delete selected message, reload/refetch, assert it remains deleted/archived for current user.

- [x] Thread `x`
  - Expected: close selected thread.
  - Current behavior: clears selected message.
  - Type: closes preview.
  - Needs real fix: no.
  - Files likely needing edits: none.
  - Focused test: select thread, close, assert detail panel disappears.

- [x] Reply `Send`
  - Expected: send a reply in selected thread.
  - Current behavior: disabled until text is entered; appends reply to local state only.
  - Type: sends / creates locally.
  - Needs real fix: yes.
  - Recommended exact fix: insert reply into a persisted message replies/thread table with sender/account metadata, then update selected thread from saved data.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message storage/API.
  - Focused test: send reply, reload/refetch, assert reply remains visible.

- [x] Compose modal `x` and `Cancel`
  - Expected: close compose modal.
  - Current behavior: closes modal; form values are not reset on cancel.
  - Type: closes modal.
  - Needs real fix: maybe.
  - Recommended exact fix: decide whether cancel should discard draft; if yes, reset `form` and `composeError` on close.
  - Files likely needing edits: `app/company/team-messages/page.tsx`.
  - Focused test: type draft, cancel, reopen; assert expected draft behavior.

- [x] Compose `To` select
  - Expected: choose message recipient.
  - Current behavior: updates local form recipient from fixed options.
  - Type: selects.
  - Needs real fix: yes, if recipients should come from real employees/roles.
  - Recommended exact fix: load active employees/roles from backend and store message recipients by employee/user/account id.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, employee/message API.
  - Focused test: with seeded employees, assert active team members/roles are available as recipients.

- [x] Compose `normal` / `high`
  - Expected: choose priority.
  - Current behavior: updates local form priority.
  - Type: selects / toggles priority.
  - Needs real fix: no for UI; yes if send persistence added.
  - Files likely needing edits: `app/company/team-messages/page.tsx`.
  - Focused test: send high priority message, assert high badge appears and persists.

- [x] Compose `Send Message`
  - Expected: send a new team message.
  - Current behavior: validates subject/body, prepends a local message, closes modal; no backend delivery.
  - Type: sends / creates locally.
  - Needs real fix: yes.
  - Recommended exact fix: persist message to backend with sender, recipients, priority, body, account id, and created timestamp; optionally notify recipients.
  - Files likely needing edits: `app/company/team-messages/page.tsx`, message API/table/RLS, possibly notification/email worker.
  - Focused test: compose/send, reload/refetch, assert message remains in sent list and recipient inbox.

## Broken / Non-Functional Buttons

- [ ] `Employees Information`
  - Expected: act as active tab or switch to employee information view.
  - Current behavior: visible button has no `onClick`; it is only styled as active.
  - Type: does nothing.
  - Needs real fix: yes if it is intended to be a tab.
  - Recommended exact fix: convert to a real tab control with state, `aria-selected`, and content switching; or render as non-button static active label if there is no action.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: click `Roles & Permissions`, then click `Employees Information`, assert visible panel changes back.

- [ ] `Roles & Permissions`
  - Expected: switch to roles/permissions management or preview.
  - Current behavior: visible button has no `onClick`; no page-level roles/permissions panel is opened. A `viewPerms` modal exists in code but no visible control sets it.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: wire the tab to a roles/permissions panel, or remove button styling if it is not interactive; add a row-level `Permissions` action if the existing `viewPerms` modal should be reachable.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: click `Roles & Permissions`, assert permissions matrix or role management content is visible.

- [ ] Permissions modal / `Edit Role`
  - Expected: view role permissions and open edit role flow.
  - Current behavior: modal and `Edit Role` button exist behind `viewPerms`, but no visible button opens it.
  - Type: unreachable / effectively does nothing from UI.
  - Needs real fix: yes.
  - Recommended exact fix: add visible `Permissions` row action or make the `Roles & Permissions` tab select an employee and open this modal.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: click visible permissions control, assert permissions modal opens; click `Edit Role`, assert edit modal opens with role field.

- [ ] Employee modal `Add Employee` / `Save Changes`
  - Expected: create/update employee record including visible form fields.
  - Current behavior: attempts Supabase insert/update but payload only includes `name`, `email`, `role`, `status`, optional `id`, optional `account_id`. Visible `phone`, `department`, `title`, and `notes` fields are not saved. On save failure, modal remains open with an alert.
  - Type: creates / edits / saves partially.
  - Needs real fix: yes.
  - Recommended exact fix: confirm employee schema, include all visible form fields in `employeePayload`, and add validation/error handling that distinguishes required fields from backend failures.
  - Files likely needing edits: `app/employees/page.tsx`, Supabase employee schema/RLS if columns are missing.
  - Focused test: add employee with phone/department/title/notes, reload/refetch, assert all fields persist.

- [ ] Bulk `Remove`
  - Expected: delete selected employees.
  - Current behavior: deletes selected employees from local state even if Supabase delete fails; no confirmation.
  - Type: deletes.
  - Needs real fix: yes.
  - Recommended exact fix: add confirmation for bulk delete and only remove rows from UI after successful Supabase delete, or clearly show failed remote state and rollback.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: select rows, cancel bulk delete confirmation; then confirm with mocked success/failure and assert correct row state.

- [ ] Delete modal `Remove`
  - Expected: permanently remove employee.
  - Current behavior: attempts Supabase delete, then removes row locally even on remote error and shows local removal notice.
  - Type: deletes.
  - Needs real fix: yes.
  - Recommended exact fix: only remove row after successful delete, or implement explicit optimistic rollback; show blocking error when remote delete fails.
  - Files likely needing edits: `app/employees/page.tsx`.
  - Focused test: mocked failed delete should keep row visible and show error.

- [ ] Invite modal `Send Invite`
  - Expected: send account invitation email and create pending employee/user invite.
  - Current behavior: only sets notice `Invite queued locally. Email delivery is not connected yet.`, shows temporary success, and closes/reset after timeout.
  - Type: sends locally / does not actually send.
  - Needs real fix: yes.
  - Recommended exact fix: call a real invite endpoint/Supabase auth invite flow, store invite status, and report delivery failures.
  - Files likely needing edits: `app/employees/page.tsx`, invite API/route or Supabase auth integration.
  - Focused test: mock invite API success/failure; assert success notice and pending invite row/status.

- [ ] `Reminders/Tasks` table column
  - Expected: show or manage employee reminders/tasks.
  - Current behavior: visible column always renders `0`; no button/link/control opens tasks.
  - Type: visible indicator only / does nothing.
  - Needs real fix: yes if reminder/task management is required.
  - Recommended exact fix: load task counts per employee and add a row action/link to filtered reminders/tasks or a task modal.
  - Files likely needing edits: `app/employees/page.tsx`, task/reminder data source.
  - Focused test: seed tasks for employee, assert count and click through/open behavior.

## Ambiguous / Needs Original Comparison

- [ ] `Back`
  - Ambiguity: original may expect a specific dashboard/company route rather than browser history.
  - Recommended comparison: verify original CDM back button destination.

- [ ] `Employees Information` and `Roles & Permissions`
  - Ambiguity: could be decorative parity tabs from original or expected real tabs.
  - Recommended comparison: inspect original interaction. If original tabs switch panels, implement tab state. If not, render non-interactive labels.

- [ ] Employee quota `Employee Quota = total/1 used`
  - Ambiguity: quota limit is hard-coded to `1`; unclear whether original/account plan should drive it.
  - Recommended comparison: verify account plan quota source.

- [ ] `Outsourcers`
  - Ambiguity: page title includes outsourcers, but there is no distinct outsourcer add/filter/type control.
  - Recommended comparison: verify whether original has employee vs outsourcer type selection.

- [ ] `Activity Log`
  - Ambiguity: visible modal may be acceptable as placeholder, but original likely has real activity.
  - Recommended comparison: verify original activity source and event list.

- [ ] `Training Videos`
  - Ambiguity: current placeholder is intentionally visible; original likely embeds hosted training.
  - Recommended comparison: verify video source/URL and expected content.

- [ ] `Export CSV`
  - Ambiguity: current export uses filtered rows; bulk toolbar export also exports filtered rows, not selected rows.
  - Recommended comparison: verify whether selected-only export is expected in bulk mode.

- [ ] Team Messages whole page
  - Ambiguity: current page is sample/local in-memory messages. It works as a UI demo but not a real team messaging system.
  - Recommended comparison: verify original persistence, inbox/sent semantics, recipient model, delivery, and delete/archive behavior.

## Most Important Fix Order

1. [ ] Wire `Roles & Permissions` or make it non-interactive; expose the existing permissions modal if intended.
2. [ ] Fix employee save payload so every visible add/edit field persists.
3. [ ] Stop false-success local deletion/status updates when Supabase fails.
4. [ ] Implement real invite sending or rename/status it clearly as not connected.
5. [ ] Replace Team Messages sample/local state with persisted messages, replies, read receipts, and delete/archive.
6. [ ] Connect training videos and activity log to real content/data.
7. [ ] Add reminders/tasks count and action if original requires it.

