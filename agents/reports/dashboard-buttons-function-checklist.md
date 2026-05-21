# Dashboard Buttons/Links/Controls Function Checklist

Scope: root app only, `/dashboard`. Nested `disputepilot-app/` was not inspected or edited. No app files, tests, commits, or fixes were made.

Sources inspected:
- `app/dashboard/page.tsx`
- `components/CDMLayout.tsx`
- `tests/dashboard.spec.ts`
- `tests/compare.spec.ts`
- `tests/operational-pages-smoke.spec.ts`
- `tests/manual-workflow-audit.spec.ts`
- `test-results/.last-run.json`
- `manual-workflow-audit.json`
- `playwright-report/index.html` presence only

Current test/artifact signal:
- `tests/dashboard.spec.ts` only verifies `/dashboard` loads and `Add New Customer` click does not crash.
- `tests/compare.spec.ts` compares visible dashboard text against the original, but does not exercise dashboard controls.
- `tests/operational-pages-smoke.spec.ts` does not include `/dashboard`.
- `tests/manual-workflow-audit.spec.ts` does not audit `/dashboard`; current `manual-workflow-audit.json` has no `/dashboard` route entry.
- `test-results/.last-run.json` reports `"status": "passed"`, with no failed tests.

## Working Buttons/Links/Controls

| Visible label/text | Type | Expected behavior | Current behavior from code/tests | Action classification | Needs real fix? |
|---|---|---|---|---|---|
| Add Quick Lead | Button | Go to lead workflow. | `router.push("/leads")` in `app/dashboard/page.tsx:57`. Covered indirectly by manual audit proving `/leads` workflows pass, but not from dashboard click. | Navigates | No, unless original requires opening an add-lead modal instead of `/leads`. |
| Add New Customer | Button | Go to customer workflow. | `router.push("/clients")` in `app/dashboard/page.tsx:58`; `tests/dashboard.spec.ts` clicks it and checks no 404/application error. | Navigates | No. |
| Training Videos | Button | Go to training/academy content. | `router.push("/academy/credit-repair")` in `app/dashboard/page.tsx:60`. Not directly tested. | Navigates | No, unless original destination differs. |
| Today, Custom, Last 30 Days, YTD, All Time | Revenue filter buttons | Change selected revenue range. | `setRevFilter(f)` updates active state in `app/dashboard/page.tsx:89`; `Custom` reveals the same From/To inputs plus Apply. No data is recalculated. | Filters UI state only | Partial/no real data fix unless dashboard revenue is expected to be live. |
| From Date / To Date | Revenue date inputs | Capture revenue date range. | Controlled inputs update `fromDate` and `toDate` in `app/dashboard/page.tsx:94-95` and `101-102`. | Inputs only | No if only form state is expected; yes if date range should filter revenue. |
| Training & Resources: Claim Your Free Gifts | Link | Navigate to billing/free gifts area. | `<a href="/billing">` in `app/dashboard/page.tsx:131-143`. | Navigates | Probably no; verify against original if exact destination matters. |
| Training & Resources: Your First Dispute | Link | Navigate to disputes training/workflow. | `<a href="/disputes">` in `app/dashboard/page.tsx:132-143`. | Navigates | Probably no. |
| Training & Resources: Full Walkthrough | Link | Navigate to academy walkthrough. | `<a href="/academy/credit-repair">` in `app/dashboard/page.tsx:133-143`. | Navigates | Probably no. |
| Training & Resources: 1 to 1 | Link | Navigate to one-on-one training/coaching. | `<a href="/academy/credit-repair">` in `app/dashboard/page.tsx:134-143`. | Navigates | Ambiguous; destination may be placeholder. |
| Training & Resources: Group Training | Link | Navigate to group training. | `<a href="/academy/credit-repair">` in `app/dashboard/page.tsx:135-143`. | Navigates | Ambiguous; destination may be placeholder. |
| Training & Resources: Free Mastermind | Link | Navigate to mastermind resource. | `<a href="/academy/credit-repair">` in `app/dashboard/page.tsx:136-143`. | Navigates | Ambiguous; destination may be placeholder. |
| Training & Resources: Help Center | Link | Navigate to help center. | `<a href="/academy/credit-repair">` in `app/dashboard/page.tsx:137-143`. | Navigates | Yes if expected to open real help center. |
| Training & Resources: Task | Link | Navigate/stay on dashboard task area. | `<a href="/dashboard">` in `app/dashboard/page.tsx:138-143`. | Navigates to current route | Ambiguous; may need anchor or tasks route. |
| Training & Resources: Start-Run-Grow Training | Link | Navigate to start-run-grow training. | `<a href="/get-customers/start-run-grow">` in `app/dashboard/page.tsx:139-143`. | Navigates | No. |
| Customer search input | Input | Capture customer search query. | Controlled input updates `searchQ` in `app/dashboard/page.tsx:198`. | Input only | No by itself. |
| Clear | Button | Clear customer search query. | `setSearchQ("")` in `app/dashboard/page.tsx:201`. | Clears input | No. |
| Quick Lead Phone / Email / Note | Inputs | Capture quick lead data. | Controlled inputs update local state in `app/dashboard/page.tsx:208-210`. | Inputs only | No by themselves. |
| Customer / Affiliate / Text | Message tab buttons | Switch message inbox tab. | `setMsgTab(t); setMsgDetail(false)` in `app/dashboard/page.tsx:221`. | Filters/switches local view | No for static UI; yes if expected to load real messages. |
| View Message Detail | Button | Open message detail view. | `setMsgDetail(true)` in `app/dashboard/page.tsx:239`; shows read-only placeholder fields and message textarea. | Opens in-page detail view | Partial; detail has no selected message or submit/send. |
| Back | Button | Return from message detail to message list. | `setMsgDetail(false)` in `app/dashboard/page.tsx:253`. | Closes in-page detail view | No. |
| Prev / Next | Calendar buttons | Move calendar month backward/forward. | Updates `calMonth`/`calYear` in `app/dashboard/page.tsx:264` and `266`. | Calendar navigation | No. |
| Calendar day buttons, labels 1 through days in current month | Buttons | Select/view date or reminders. | Render as `<button>` in `app/dashboard/page.tsx:278` but have no `onClick`; only styling reflects today/reminders. | Does nothing | Yes. |
| Reminder title / Scheduled Date / Scheduled Time / Recurring Reminder / Scheduled End Date | Inputs/checkbox | Capture reminder form fields. | Controlled fields update local reminder state in `app/dashboard/page.tsx:311-320`. | Inputs only | No by themselves. |
| Cancel | Reminder button | Clear reminder form. | Clears all reminder fields in `app/dashboard/page.tsx:322`. | Clears form | No. |
| Save Reminder | Button | Add reminder. | `saveReminder` appends reminder to local state when title is non-empty, then clears form in `app/dashboard/page.tsx:37-42` and `324`. Calendar highlights matching dates. | Submits to local state only | Partial; no persistence. |
| Pending, Completed, Current, Archive, All | Task tab buttons | Filter tasks by status. | `setTaskTab(t)` changes active pill in `app/dashboard/page.tsx:342`, but displayed `tasks.map(...)` is not filtered. | Active state only | Yes. |
| Task checkboxes: Review new client applications; Send Round 2 dispute letters; Follow up on overdue invoices | Checkboxes | Mark task complete/incomplete. | `defaultChecked={t.done}` in `app/dashboard/page.tsx:349`; no state update or persistence. | Browser-local checkbox toggle only | Yes if tasks are meant to be managed. |

## Broken/Non-Functional Buttons

| Visible label/text | Expected behavior | Current behavior from code/tests | Recommended exact fix | Files likely needing edits | Focused test to create/update |
|---|---|---|---|---|---|
| Customer Search | Open/focus customer search, or navigate to customer search page. | Button has no `onClick` in `app/dashboard/page.tsx:59`; no tests cover it. | Decide original behavior. Likely either `router.push("/clients")` with search area focus/query support, or scroll/focus the dashboard search input via a ref. | `app/dashboard/page.tsx`; possibly `app/clients/page.tsx` if deep-linking search. | Add dashboard behavior test: click `Customer Search`, assert URL `/clients` or focused dashboard search input, matching chosen spec. |
| Apply | Apply revenue date range/filter. | Both Apply buttons have no `onClick` in `app/dashboard/page.tsx:96` and `103`; date values only sit in state. | Add an `applyRevenueFilter` handler that updates displayed revenue/card metrics or calls the dashboard metrics data layer with `revFilter`, `fromDate`, `toDate`. Disable/validate invalid custom ranges. | `app/dashboard/page.tsx`; likely future dashboard data module/API if metrics become real. | Add test setting Custom dates and clicking Apply; assert range is reflected in a status/summary or requested metrics update. |
| Search | Search customer by name/phone/email. | Button has no `onClick` in `app/dashboard/page.tsx:200`; typing only updates `searchQ`. | Implement `handleCustomerSearch`: if staying on dashboard, show matching results/empty state; if using the Customers page, navigate to `/clients?search=<query>` and support that query there. | `app/dashboard/page.tsx`; possibly `app/clients/page.tsx`. | Add test filling `Name, phone, email...`, clicking Search, and asserting visible result/empty state or `/clients?search=` URL. |
| Create | Create quick lead. | Button has no `onClick` in `app/dashboard/page.tsx:211`; form inputs only update local state. | Wire to the same lead creation path used by `/leads`: validate phone/email, create a lead record/local visible confirmation, clear form on success. Prefer shared helper if one exists. | `app/dashboard/page.tsx`; possibly shared lead helper or `app/leads/page.tsx` extraction. | Add test filling quick lead fields, clicking Create, and asserting saved lead confirmation or lead appears on `/leads`. |
| Read All | Mark messages read. | Button has no `onClick` in `app/dashboard/page.tsx:229`; no messages state exists. | Add message state and mark unread messages as read, or hide/disable until backed by data. | `app/dashboard/page.tsx`; possible messages data module. | Add test with seeded unread message fixture or local mock; click Read All and assert unread count/status clears. |
| Load More | Load additional messages. | Button has no `onClick` in `app/dashboard/page.tsx:230`; no pagination/data exists. | Add pagination/load handler for messages, or hide/disable when no data source exists. | `app/dashboard/page.tsx`; possible messages data module/API. | Add test with more-than-page-size messages; click Load More and assert additional messages render. |
| Calendar day buttons | Select a date/view reminders/create reminder for that date. | Day buttons render with no `onClick` in `app/dashboard/page.tsx:278`. | Add selected date state; clicking a day should select it and optionally prefill reminder scheduled date and/or show that date's reminders. | `app/dashboard/page.tsx`. | Add test clicking a day and asserting selected styling plus reminder date prefill or visible reminders for that day. |
| Delete | Delete selected reminder. | Button has no `onClick` in `app/dashboard/page.tsx:323`; no reminder selection exists. | Add reminder selection/edit mode, disable Delete until a reminder is selected, and remove selected reminder from state/data with confirmation if needed. | `app/dashboard/page.tsx`. | Add test creating reminder, selecting it, clicking Delete, and asserting it disappears; also assert disabled/no-op state when none selected. |
| Add | Add a task. | Button has no `onClick` in `app/dashboard/page.tsx:336`; text says tasks can be added from below form but no form exists. | Add task form/modal or navigate to a real tasks route if one exists. If staying inline, append to task state and clear form. | `app/dashboard/page.tsx`; maybe create `/tasks` route if original has one. | Add test clicking Add, asserting form/modal opens, saving a task, and seeing it in list. |
| Task filter tabs | Filter tasks. | `taskTab` changes active state but task list is always unfiltered in `app/dashboard/page.tsx:342-348`. | Derive `visibleTasks` from `taskTab`; include task status fields that map to Pending/Completed/Current/Archive/All. | `app/dashboard/page.tsx`. | Add test clicking Completed/Pending and asserting only matching tasks are visible. |
| Task row checkboxes | Toggle task completion. | Uncontrolled `defaultChecked`; changes do not update task state or filters in `app/dashboard/page.tsx:349`. | Store tasks in `useState`, update `done` on checkbox change, and make filters reflect the new state. Persist if task data is real. | `app/dashboard/page.tsx`; possible task data module/API. | Add test toggling a pending task, clicking Completed, and asserting the task moved to Completed. |
| Leslie Sabek | Sidebar user button | Usually opens user profile/account menu. | Button has no `onClick` in `components/CDMLayout.tsx:223`. | Add profile/account menu or convert to non-button text if no action exists. | `components/CDMLayout.tsx`. | Add layout smoke test on `/dashboard`: click user button and assert account menu/profile navigation. |
| Activate modal: Your 2 Free Gifts expire in 47 hours! | CTA-style button | Likely informational or activate step. | Button has no `onClick` in `components/CDMLayout.tsx:328`. | Convert to non-button informational block or wire to activation/registration behavior. | `components/CDMLayout.tsx`. | Add modal test ensuring only real CTAs are buttons and activation CTA performs expected action. |
| Activate modal: ACTIVATE & CLAIM MY GIFTS | CTA button | Activate account/claim gifts. | Button has no `onClick` in `components/CDMLayout.tsx:329`. | Wire to activation checkout/registration flow or external URL. | `components/CDMLayout.tsx`; possible auth/billing route. | Add test opening activate modal, clicking CTA, and asserting navigation/external link/status. |
| Activate modal: Open Registration | Button | Open registration after password entry or route to registration. | Button has no `onClick` in `components/CDMLayout.tsx:337`; password input is unused. | Add password validation/registration navigation or remove password field until functional. | `components/CDMLayout.tsx`; possible registration route. | Add test entering password, clicking Open Registration, and asserting expected route/status. |

## Ambiguous Buttons Needing Original Comparison

These visibly do something in the clone, but the exact original behavior/destination is uncertain:

- `Add Quick Lead`: code navigates to `/leads`; original may open a quick lead modal directly.
- `Customer Search`: visibly a top quick-action button, but there is also a lower dashboard search panel. Need original comparison to decide whether it should scroll/focus local search or navigate to customer search.
- `Claim Your Free Gifts`: points to `/billing`; original may open the activation/free-gifts modal.
- `1 to 1`, `Group Training`, `Free Mastermind`, `Help Center`: all route to `/academy/credit-repair`; likely placeholders unless original routes all training links to the same page.
- `Task`: routes to `/dashboard`; original may scroll to dashboard tasks or navigate to a dedicated tasks page.
- `View Message Detail`: opens placeholder detail fields without a selected message; original may show a real message detail pane.
- `Save Reminder`: works locally but does not persist; original comparison needed to decide if persistence is required in this clone pass.
- `See All`: routes to `/dashboard`; original likely opens all tasks or a task management page/section.
- Activate modal CTAs in `CDMLayout`: need original activation behavior before wiring checkout/registration.

## Layout Controls Visible On `/dashboard`

`CDMLayout` wraps `/dashboard`, so these are visible global controls while on the Dashboard:

- Working/navigation: sidebar nav links, expanded group toggles, `14 Days Left in The Trial` billing link, `Activate`, `Activate Membership`, topbar `ACTIVATE MEMBERSHIP`, `Need Help?`, `Help`, help links, `Sign out`, mobile `Open navigation`/overlay close, activate modal `x` and `Close`.
- Broken/needs fix: sidebar user button `Leslie Sabek`; activate modal CTA buttons `Your 2 Free Gifts expire in 47 hours!`, `ACTIVATE & CLAIM MY GIFTS`, and `Open Registration`.
- Read-only controls: activate modal gift checkboxes are checked/read-only and should remain non-interactive unless original allows opt-in/out.

## Recommended Focused Test File

Create or update a focused dashboard-only Playwright test, likely `tests/dashboard.spec.ts`, without expanding to the full suite:

- Assert quick actions: `Add Quick Lead`, `Add New Customer`, and `Training Videos` navigate to expected routes; `Customer Search` performs chosen fixed behavior.
- Assert revenue controls: filter pills update active state; Custom reveals date inputs; Apply performs chosen fixed behavior.
- Assert customer search: filling query and clicking Search navigates or renders results/empty state; Clear empties input.
- Assert quick lead: filling phone/email/note and clicking Create creates visible confirmation or lead entry.
- Assert message controls: tabs switch, View Message Detail opens, Back returns; Read All/Load More perform chosen fixed behavior or are not rendered when unavailable.
- Assert calendar/reminders: Prev/Next change month, day click selects/prefills, Save Reminder creates a visible reminder, Delete removes selected reminder, Cancel clears form.
- Assert tasks: Add opens/saves a task, tabs filter, task checkbox updates completion, See All navigates/scrolls to the chosen task destination.
- Assert layout activation modal separately if global dashboard-visible controls are in scope.
