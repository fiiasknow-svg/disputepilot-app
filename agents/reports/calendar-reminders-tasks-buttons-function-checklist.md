# Calendar / Reminders / Tasks Buttons Function Checklist

Scope: root app only at `C:\Users\LESLI\disputepilot-app`. Nested `C:\Users\LESLI\disputepilot-app\disputepilot-app` was not inspected or edited. No app files, tests, commits, pushes, or fixes were made.

Routes/files inspected:
- `/calendar`: `app/calendar/page.tsx`
- `/dashboard`: calendar/reminders/tasks sections in `app/dashboard/page.tsx`
- Shared visible navigation: `components/CDMLayout.tsx`
- No other root `app/` calendar/reminder/task route folders were found.
- Existing targeted tests: `tests/calendar-behavior.spec.ts`, `tests/dashboard.spec.ts`, `tests/dashboard-training-resources.spec.ts`, `tests/manual-workflow-audit.spec.ts`, `tests/operational-pages-smoke.spec.ts`, `tests/workflow-interactions-smoke.spec.ts`, `tests/save-buttons-no-error.spec.ts`

Test signal:
- `tests/calendar-behavior.spec.ts` verifies `/calendar` first-surface reminder text, reminder save, `Mark All as Read`, and add-event workflow.
- `tests/workflow-interactions-smoke.spec.ts` verifies `/calendar` add-event workflow.
- `tests/operational-pages-smoke.spec.ts` verifies `/calendar` visible controls and reveals Event Calendar Tools, but does not assert tool behavior.
- `tests/manual-workflow-audit.spec.ts` verifies `/calendar` add-event cancel/create behavior.
- `tests/dashboard.spec.ts` verifies dashboard calendar day selection, dashboard reminder save/delete, task add/filter/checkbox behavior.
- `tests/dashboard-training-resources.spec.ts` verifies dashboard `Task` resource button opens/focuses the task form.
- `tests/save-buttons-no-error.spec.ts` does not cover calendar/reminder/task pages.

## Working Buttons / Links / Controls

- [x] Sidebar `Calendar`
  - Expected behavior: navigate to `/calendar`.
  - Current behavior: `components/CDMLayout.tsx:59` defines the Company nav child `{ label: "Calendar", href: "/calendar" }`, rendered as a Next `Link`.
  - Action: navigation.
  - Needs real fix: no.
  - Focused test: add/extend layout route test to click Company > Calendar and assert `/calendar` heading.

- [x] `/calendar` tab `Reminder`
  - Expected behavior: show all reminders.
  - Current behavior: `setActiveTab("all")`; `visibleReminders` returns all reminders at `app/calendar/page.tsx:96-99`, control rendered at `app/calendar/page.tsx:231`.
  - Action: filter.
  - Needs real fix: no for local behavior.
  - Focused test: create scheduled and past-due reminders, click `Reminder`, assert both appear.

- [x] `/calendar` tab `Scheduled Reminder`
  - Expected behavior: show scheduled reminders.
  - Current behavior: filters `reminder.status === "scheduled"`; new reminders are scheduled when scheduled date is today/future at `app/calendar/page.tsx:131`.
  - Action: filter.
  - Needs real fix: no.
  - Focused test: create future reminder, click `Scheduled Reminder`, assert it remains visible.

- [x] `/calendar` tab `Read Reminder`
  - Expected behavior: show read reminders.
  - Current behavior: filters `reminder.status === "read"`; `Mark All as Read` and row `Read Reminder` set read state.
  - Action: filter.
  - Needs real fix: no.
  - Focused test: create reminder, mark row read, click `Read Reminder`, assert it appears and `Read` cell says `Yes`.

- [x] `/calendar` tab `Past Due`
  - Expected behavior: show past-due reminders.
  - Current behavior: filters `reminder.status === "past-due"`; new reminders become past due when `scheduleDate < today`.
  - Action: filter.
  - Needs real fix: no.
  - Focused test: create reminder with yesterday's date and assert `Past Due` tab shows it.

- [x] `/calendar` `Mark All as Read`
  - Expected behavior: mark every reminder read.
  - Current behavior: maps every reminder status to `read` and sets notice at `app/calendar/page.tsx:158-161`; covered by `tests/calendar-behavior.spec.ts`.
  - Action: mark read.
  - Needs real fix: no for local behavior.
  - Focused test: existing coverage is adequate; extend to assert scheduled tab no longer shows marked reminders.

- [x] `/calendar` row `Read Reminder`
  - Expected behavior: mark one reminder read.
  - Current behavior: `markOneRead(id)` updates only the matching row status to `read` at `app/calendar/page.tsx:163-166`; button rendered at `app/calendar/page.tsx:285`.
  - Action: mark read.
  - Needs real fix: no, but not directly covered by current tests.
  - Focused test: create two reminders, click one row `Read Reminder`, assert only one row changes to `Yes`.

- [x] `/calendar` `Reset`
  - Expected behavior: clear reminder form to defaults.
  - Current behavior: clears customer/title and resets dates/times/type at `app/calendar/page.tsx:369`.
  - Action: clears form.
  - Needs real fix: no.
  - Focused test: fill reminder form, click `Reset`, assert fields return to defaults.

- [x] `/calendar` `Save Reminder`
  - Expected behavior: create a reminder.
  - Current behavior: validates customer and title by silent no-op if missing; creates localStorage-backed reminder, classifies scheduled vs past-due, clears form, shows `Reminder saved.` at `app/calendar/page.tsx:129-155`; covered by `tests/calendar-behavior.spec.ts`.
  - Action: creates/saves locally.
  - Needs real fix: partial only if reminders must persist to Supabase/server instead of localStorage.
  - Focused test: existing create test is adequate; add reload persistence assertion against `disputepilot.calendar-reminders`.

- [x] `/calendar` `Export iCal`
  - Expected behavior: export calendar events.
  - Current behavior: creates an `.ics` download containing saved `events` only at `app/calendar/page.tsx:177-187`; visible and smoke-tested, but download content is not tested.
  - Action: exports.
  - Needs real fix: ambiguous/partial. It works for events, but omits reminders despite `PRODID` saying Reminder.
  - Focused test: create event, click export, capture download, assert `BEGIN:VCALENDAR` and event summary.

- [x] `/calendar` `+ Add Event`
  - Expected behavior: open new event modal.
  - Current behavior: sets `showEventForm(true)` at `app/calendar/page.tsx:215`; covered by multiple tests.
  - Action: opens modal.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] `/calendar` modal `Cancel`
  - Expected behavior: close new event modal.
  - Current behavior: sets `showEventForm(false)` at `app/calendar/page.tsx:444`; covered by `tests/manual-workflow-audit.spec.ts`.
  - Action: closes modal.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] `/calendar` modal `All day`
  - Expected behavior: mark event all-day.
  - Current behavior: controlled checkbox updates `eventForm.allDay` at `app/calendar/page.tsx:434-438`; saved event displays `date - All day`.
  - Action: toggles event option.
  - Needs real fix: no.
  - Focused test: create all-day event and assert `All day` appears.

- [x] `/calendar` modal `Add Event`
  - Expected behavior: create event and close modal.
  - Current behavior: validates title by silent no-op if missing; prepends localStorage-backed event, clears form, closes modal, shows `Event saved.` at `app/calendar/page.tsx:169-175`; covered by tests.
  - Action: creates/saves locally.
  - Needs real fix: partial only if events must persist to Supabase/server.
  - Focused test: existing create tests are adequate; add reload persistence assertion against `disputepilot.calendar-events-lite`.

- [x] `/calendar` `Event Calendar Tools`
  - Expected behavior: show/hide event tool controls.
  - Current behavior: toggles `showEventTools` at `app/calendar/page.tsx:376-383`; covered for reveal by `tests/operational-pages-smoke.spec.ts`.
  - Action: opens/collapses in-page tools.
  - Needs real fix: no for disclosure behavior.
  - Focused test: assert `aria-expanded` toggles and tools appear/disappear.

- [x] Dashboard training resource `Task`
  - Expected behavior: jump to/open task area.
  - Current behavior: `openTaskSection` shows task form, sets status, scrolls/focuses task input at `app/dashboard/page.tsx:102-106`; rendered at `app/dashboard/page.tsx:295`; covered by `tests/dashboard-training-resources.spec.ts`.
  - Action: opens task form / in-page navigation.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] Dashboard calendar `Prev`
  - Expected behavior: move calendar to previous month.
  - Current behavior: updates `calMonth`/`calYear` at `app/dashboard/page.tsx:445`.
  - Action: calendar navigation.
  - Needs real fix: no.
  - Focused test: click `Prev`, assert month label changes.

- [x] Dashboard calendar `Next`
  - Expected behavior: move calendar to next month.
  - Current behavior: updates `calMonth`/`calYear` at `app/dashboard/page.tsx:447`.
  - Action: calendar navigation.
  - Needs real fix: no.
  - Focused test: click `Next`, assert month label changes.

- [x] Dashboard calendar day buttons
  - Expected behavior: select date and prefill reminder scheduled date.
  - Current behavior: `selectCalendarDate(dateStr)` sets selected date, pre-fills reminder date, status, and selected reminder id if a reminder exists at `app/dashboard/page.tsx:151-156`; rendered at `app/dashboard/page.tsx:460`; covered by `tests/dashboard.spec.ts`.
  - Action: selects date / calendar navigation within month.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] Dashboard reminder card button
  - Expected behavior: select an existing reminder for deletion.
  - Current behavior: reminder list item buttons set `selectedReminderId` and status at `app/dashboard/page.tsx:487`; covered by `tests/dashboard.spec.ts`.
  - Action: selects reminder.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] Dashboard reminder `Cancel`
  - Expected behavior: clear reminder form.
  - Current behavior: clears title/date/time/recurring/end date and sets `Reminder form cleared.` at `app/dashboard/page.tsx:506`.
  - Action: clears form.
  - Needs real fix: no.
  - Focused test: fill dashboard reminder form, click `Cancel`, assert fields cleared.

- [x] Dashboard reminder `Delete`
  - Expected behavior: delete selected reminder; disabled when none selected.
  - Current behavior: disabled when `selectedReminderId === null`; `deleteReminder` removes selected local reminder at `app/dashboard/page.tsx:171-179` and `app/dashboard/page.tsx:507`; covered by `tests/dashboard.spec.ts`.
  - Action: deletes locally.
  - Needs real fix: partial only if reminders must persist beyond current dashboard session.
  - Focused test: existing coverage is adequate.

- [x] Dashboard reminder `Save Reminder`
  - Expected behavior: save reminder.
  - Current behavior: requires title, appends reminder to local React state, clears form at `app/dashboard/page.tsx:159-168`; rendered at `app/dashboard/page.tsx:508`; covered by `tests/dashboard.spec.ts`.
  - Action: creates/saves in memory.
  - Needs real fix: partial because dashboard reminders are not persisted and are separate from `/calendar` reminders.
  - Focused test: add reload or cross-route assertion once persistence/sync behavior is specified.

- [x] Dashboard reminder `Recurring Reminder`
  - Expected behavior: mark reminder recurring.
  - Current behavior: controlled checkbox updates `reminderRecurring` and saved object includes `recurring`, but UI does not display or use recurrence at `app/dashboard/page.tsx:164` and `app/dashboard/page.tsx:501-502`.
  - Action: toggles option.
  - Needs real fix: partial; recurrence flag is currently stored only in memory and unused.
  - Focused test: after intended behavior is defined, assert recurring display/schedule generation.

- [x] Dashboard task `Add`
  - Expected behavior: show task creation form.
  - Current behavior: toggles `showTaskForm`, sets `Task form ready.` at `app/dashboard/page.tsx:520`; covered by `tests/dashboard.spec.ts`.
  - Action: opens/closes in-page form.
  - Needs real fix: no.
  - Focused test: existing coverage is adequate.

- [x] Dashboard task `Save Task`
  - Expected behavior: create task.
  - Current behavior: requires title, prepends local task, clears input, hides form, switches to `All`, sets status at `app/dashboard/page.tsx:182-192`; rendered at `app/dashboard/page.tsx:532`; covered by `tests/dashboard.spec.ts`.
  - Action: creates/saves in memory.
  - Needs real fix: partial if tasks must persist beyond current dashboard session.
  - Focused test: existing coverage is adequate; add reload persistence assertion after storage/data layer decision.

- [x] Dashboard task tabs `Pending`, `Completed`, `Current`, `Archive`, `All`
  - Expected behavior: filter tasks.
  - Current behavior: `visibleTasks` filters by `taskTab` at `app/dashboard/page.tsx:71-76`; buttons call `setTaskTab(t)` at `app/dashboard/page.tsx:526`; covered by `tests/dashboard.spec.ts`.
  - Action: filters.
  - Needs real fix: no for in-memory behavior.
  - Focused test: existing coverage is adequate.

- [x] Dashboard task row checkboxes
  - Expected behavior: mark task completed/reopened.
  - Current behavior: controlled checkbox calls `toggleTask`, updates task `done` and status at `app/dashboard/page.tsx:195-198` and `app/dashboard/page.tsx:540`; covered by `tests/dashboard.spec.ts`.
  - Action: edits/marks complete.
  - Needs real fix: partial if tasks must persist beyond current dashboard session.
  - Focused test: existing coverage is adequate.

## Broken / Non-Functional Buttons

- [ ] `/calendar` `Previous month` (`<`)
  - Expected behavior: navigate calendar to previous month.
  - Current behavior: visible button has no `onClick` at `app/calendar/page.tsx:299`; `monthDays` is memoized from module-level `today`, so the calendar cannot change months.
  - Action classification: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add `visibleMonth` state, derive `monthDays` and `monthName` from that state, and wire previous button to decrement month.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: in `tests/calendar-behavior.spec.ts`, click `Previous month`, assert heading/month label changes and day grid updates.

- [ ] `/calendar` `Next month` (`>`)
  - Expected behavior: navigate calendar to next month.
  - Current behavior: visible button has no `onClick` at `app/calendar/page.tsx:301`.
  - Action classification: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: same `visibleMonth` state as previous button; wire next button to increment month.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: click `Next month`, assert month label changes and day grid updates.

- [ ] `/calendar` `Today`
  - Expected behavior: return calendar to current month/date, or select today.
  - Current behavior: visible button has no `onClick` at `app/calendar/page.tsx:302`.
  - Action classification: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: after adding `visibleMonth`/selected date state, wire `Today` to reset visible month to today's month and optionally select/highlight today.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: navigate next month, click `Today`, assert current month label returns.

- [ ] `/calendar` calendar day cells
  - Expected behavior: select date, filter/show reminders/events for that date, or prefill reminder/event date.
  - Current behavior: days are rendered as non-interactive `div`s at `app/calendar/page.tsx:308-326`; only static dots display reminders.
  - Action classification: does nothing / not a control.
  - Needs real fix: yes if original calendar dates are clickable; otherwise make them non-control intentionally.
  - Recommended exact fix: convert day cells to buttons with selected date state; click should prefill reminder scheduled/end date and optionally filter visible reminders/events to the selected date.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: click a date, assert reminder scheduled date input updates and selected-date status appears.

- [ ] `/calendar` Event Calendar Tools view buttons `Month`, `Week`, `Day`, `Agenda`
  - Expected behavior: switch event calendar view.
  - Current behavior: rendered without `onClick` at `app/calendar/page.tsx:386-389`; no view state exists.
  - Action classification: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add `eventView` state, active styling, and render event list/calendar according to selected view; at minimum show a status like `Showing Week view`.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: open tools, click each view button, assert active state/status/content changes.

- [ ] `/calendar` Event Types select
  - Expected behavior: filter events by type.
  - Current behavior: uncontrolled select at `app/calendar/page.tsx:391-396`; event model has no `type` field, so selection has no effect.
  - Action classification: does nothing meaningful / filter not wired.
  - Needs real fix: yes.
  - Recommended exact fix: add event `type` to `EventItem` and event form, track `eventTypeFilter`, filter visible events by selected type.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: create Meeting and Deadline events, select `Deadline`, assert only deadline event is visible.

- [ ] `/calendar` All Agents select
  - Expected behavior: filter events/reminders by assigned agent.
  - Current behavior: uncontrolled select at `app/calendar/page.tsx:397-401`; event/reminder models have no agent field, so selection has no effect.
  - Action classification: does nothing meaningful / filter not wired.
  - Needs real fix: yes if agent filtering is part of expected product behavior.
  - Recommended exact fix: add `agent` metadata to events/reminders or remove/disable the filter until agent-backed data exists.
  - Files likely needing edits: `app/calendar/page.tsx`; possibly future user/employee data helper.
  - Focused test: seed/create events assigned to different agents, select `Assigned Agent`, assert list filters.

- [ ] `/calendar` `Upcoming (30 days)`
  - Expected behavior: filter event list to next 30 days.
  - Current behavior: visible button has no `onClick` at `app/calendar/page.tsx:403`.
  - Action classification: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add date-range filter state and filter displayed events where event date is between today and today + 30 days; make active state visible.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: create one event inside and one outside 30 days, click `Upcoming (30 days)`, assert only upcoming event appears.

- [ ] `/calendar` reminder `Save Reminder` missing validation feedback
  - Expected behavior: tell user why save failed when required fields are missing.
  - Current behavior: `addReminder` silently returns when customer/title is blank at `app/calendar/page.tsx:130`.
  - Action classification: broken validation feedback.
  - Needs real fix: yes.
  - Recommended exact fix: set `notice`/error status such as `Enter customer and reminder title before saving.` and expose it with `role="alert"` or clear status styling.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: click `Save Reminder` empty, assert validation message and no row created.

- [ ] `/calendar` modal `Add Event` missing validation feedback
  - Expected behavior: tell user title is required.
  - Current behavior: `addEvent` silently returns when title is blank at `app/calendar/page.tsx:170`.
  - Action classification: broken validation feedback.
  - Needs real fix: yes.
  - Recommended exact fix: add modal-level validation status/alert and keep dialog open.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: open modal, click `Add Event` with blank title, assert validation message and dialog remains.

- [ ] Dashboard task `See All`
  - Expected behavior: navigate to a full task list, or reveal all tasks.
  - Current behavior: `router.push("/dashboard")` at `app/dashboard/page.tsx:521`; when already on `/dashboard`, it effectively navigates to the same route and does not change task state.
  - Action classification: same-route navigation / effectively no useful action.
  - Needs real fix: yes.
  - Recommended exact fix: either change to `setTaskTab("All")` and scroll/focus task section, or create/use a real `/tasks` route if original has a full task page.
  - Files likely needing edits: `app/dashboard/page.tsx`; possibly new `app/tasks/page.tsx` only if product spec confirms.
  - Focused test: click `See All`, assert task tab becomes `All` or URL changes to real tasks route.

## Ambiguous Buttons / Controls Needing Original Comparison

- [ ] `/calendar` breadcrumb text `Dashboard`, `Calendar`, `BACK`
  - Expected behavior: likely breadcrumb navigation and back action in original.
  - Current behavior: plain text spans at `app/calendar/page.tsx:204-208`; not links/buttons.
  - Action classification: non-control.
  - Needs real fix: ambiguous. If original made these clickable, convert `Dashboard` to `Link href="/dashboard"` and `BACK` to a real back button.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: after spec decision, assert breadcrumb/back navigates.

- [ ] `/calendar` `Export iCal`
  - Expected behavior: may export events, reminders, or both.
  - Current behavior: exports events only; reminders are omitted from `.ics` even though page is reminder-oriented.
  - Action classification: exports, but scope is ambiguous.
  - Needs real fix: compare original. If original exports reminders too, include reminders as `VEVENT`/`VTODO` entries.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: save reminder and event, export, assert both are present if required.

- [ ] `/calendar` add/edit/delete event controls
  - Expected behavior: user may expect created events to be editable/deletable.
  - Current behavior: only event creation exists; saved event rows have no edit/delete controls at `app/calendar/page.tsx:407-416`.
  - Action classification: missing controls, not broken visible controls.
  - Needs real fix: compare original. Add Edit/Delete only if original/product requirements include event management.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: after adding controls, create event, edit title/date, delete event.

- [ ] `/calendar` reminder edit/delete controls
  - Expected behavior: user may expect reminders to be editable/deletable from the reminder table.
  - Current behavior: visible row action is only `Read Reminder`; no edit/delete buttons exist at `app/calendar/page.tsx:285`.
  - Action classification: missing controls, not broken visible controls.
  - Needs real fix: compare original. Add Edit/Delete if original had row actions beyond read.
  - Files likely needing edits: `app/calendar/page.tsx`.
  - Focused test: after adding controls, create reminder, edit fields, delete row.

- [ ] Dashboard reminder/calendar persistence and `/calendar` sync
  - Expected behavior: dashboard reminders may be expected to appear on `/calendar`, and `/calendar` reminders may appear on dashboard.
  - Current behavior: dashboard reminders are in-memory only in `app/dashboard/page.tsx:37`; `/calendar` uses localStorage keys `disputepilot.calendar-reminders` and `disputepilot.calendar-events-lite` at `app/calendar/page.tsx:27-28`.
  - Action classification: creates locally, but isolated.
  - Needs real fix: ambiguous/product-level. If they represent the same reminders, share a storage/data layer.
  - Files likely needing edits: `app/dashboard/page.tsx`, `app/calendar/page.tsx`, likely shared `lib` helper/API.
  - Focused test: create dashboard reminder, navigate to `/calendar`, assert same reminder appears; or assert separation if intended.

- [ ] Dashboard task persistence
  - Expected behavior: tasks may need to persist and possibly have a dedicated route.
  - Current behavior: tasks are seeded and maintained only in React state at `app/dashboard/page.tsx:58-63`.
  - Action classification: creates/edits/filters in memory.
  - Needs real fix: ambiguous. Product fix needed if tasks should survive reload or be shared with staff/customer workflows.
  - Files likely needing edits: `app/dashboard/page.tsx`, possible future `app/tasks/page.tsx`, shared task data layer.
  - Focused test: add task, reload, assert persistence after data layer decision.

## Highest-Priority Recommended Fixes

1. Wire `/calendar` month navigation: `Previous month`, `Next month`, and `Today`.
2. Wire or remove `/calendar` Event Calendar Tools controls: `Month`, `Week`, `Day`, `Agenda`, `Event Types`, `All Agents`, `Upcoming (30 days)`.
3. Add user-visible validation feedback for blank `/calendar` reminder and event saves.
4. Decide whether dashboard reminders/tasks are demo-only or real product data; if real, move them to shared persistence and sync dashboard with `/calendar`.
5. Fix dashboard task `See All` so it performs a useful action instead of navigating to the current route.
