# Academy / Training Resources Button Function Checklist

Audit scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app/` was not inspected or edited. App files and tests were not changed.

## Route Coverage

- [ ] `/academy` - broken: no `app/academy/page.tsx` exists, so the route is expected to 404.
  - Expected behavior: CRB Academy index/catalog or redirect to a default course.
  - Current behavior from code/tests: no route file; no existing test covers `/academy`.
  - Recommended fix: add `app/academy/page.tsx` with course catalog links, or add a redirect to `/academy/credit-repair`.
  - Likely files: `app/academy/page.tsx`, optionally `components/CDMLayout.tsx`.
  - Focused test: add `/academy` to an academy route smoke test and assert course links are visible.

- [x] `/academy/credit-repair` - works: renders `Credit Repair Specialist`.
- [x] `/academy/fdcpa` - works: renders `FDCPA Specialist`.
- [x] `/academy/fcra` - works: renders `FCRA Specialist`.
- [x] `/academy/fcba` - works: renders `FCBA Specialist`.
- [x] `/academy/compliance` - works: renders `Compliance Specialist`.
- [ ] `/academy/rebuild-credit` - broken/mismatch: requested route does not exist.
  - Expected behavior: Rebuild Credit course.
  - Current behavior from code/tests: implemented route is `/academy/rebuild`; sidebar and tests use `/academy/rebuild`.
  - Recommended fix: add `app/academy/rebuild-credit/page.tsx` that reuses the rebuild course or redirects to `/academy/rebuild`, then standardize labels/routes.
  - Likely files: `app/academy/rebuild-credit/page.tsx`, `components/CDMLayout.tsx`, `tests/academy-pages-smoke.spec.ts`.
  - Focused test: assert both canonical and alias behavior, or assert only the chosen canonical route.

- [x] `/academy/rebuild` - works: renders `Rebuild Credit Specialist`.
- [x] `/academy/fico` - works: renders `FICO Score Specialist`.
- [x] `/academy/automation` - works: renders `Automation Specialist`.
- [x] `/academy/funding` - works: extra academy route found in `app/academy`; renders `Funding Specialist`.

## Academy Course Controls

These controls come from `components/AcademyPage.tsx` and appear on every course page.

- [x] `Begin Course` - works.
  - Expected behavior: starts the first lesson.
  - Current behavior: sets `expandedModule` to `0` and `activeLesson` to module 0 lesson 0; `Mark Complete` appears.
  - Type: starts lesson / expands / selects.
  - Existing tests: `tests/academy-pages-smoke.spec.ts`, `tests/academy-course-detail-pages-smoke.spec.ts`.

- [x] Module header buttons, e.g. `Introduction to Credit Repair`, `FDCPA Overview`, `Automation Fundamentals` - work.
  - Expected behavior: expand/collapse module lesson list.
  - Current behavior: toggles `expandedModule`; only one module is expanded at a time.
  - Type: expands/collapses.
  - Existing tests: certificate test clicks module headers on `/academy/automation`.

- [x] Lesson row click, e.g. `What is Credit Repair?` - works.
  - Expected behavior: select lesson and show lesson content panel.
  - Current behavior: `onClick` sets `activeLesson`; content area switches to video/reading/quiz placeholder.
  - Type: starts/selects lesson.
  - Test gap: no focused test asserts a named lesson row selection changes active content.

- [x] Lesson completion circle, aria-label `Toggle completion for {lesson title}` - works.
  - Expected behavior: mark/unmark lesson complete.
  - Current behavior: toggles local `completed` set; progress count, percentage, module completion, and certificate availability update.
  - Type: marks complete.
  - Existing tests: `tests/academy-certificate-action.spec.ts`.

- [x] `Mark Complete` / `Completed` - works.
  - Expected behavior: mark/unmark the active lesson.
  - Current behavior: toggles the same local `completed` set.
  - Type: marks complete.
  - Test gap: existing tests mainly use lesson toggle circles, not active lesson `Mark Complete`.

- [ ] Video play circle inside the lesson video placeholder - broken/non-functional visible control.
  - Expected behavior: play video, open modal/player, or at least expose a real video state.
  - Current behavior: rendered as a clickable-looking `div` with `cursor: "pointer"` and play icon, but no `onClick`, no button role, no video source.
  - Type: does nothing.
  - Needs real fix: yes, if these are meant to be training videos.
  - Recommended fix: replace the `div` with a real `<button>` wired to a modal/player, or remove pointer affordance until media exists; add video URL metadata to `Lesson`.
  - Likely files: `components/AcademyPage.tsx`, all `app/academy/*/page.tsx` course data if video URLs are added.
  - Focused test: click the play control for a video lesson and assert a player/modal/state change, or assert no clickable play control exists while placeholder-only.

- [x] Disabled certificate button, e.g. `24 lessons left` - works.
  - Expected behavior: disabled until all lessons are complete.
  - Current behavior: `disabled={!allDone}`.
  - Type: gated download.
  - Existing tests: `tests/academy-certificate-action.spec.ts` checks disabled state on `/academy/automation`.

- [x] `Download Certificate` - works locally after all lessons complete.
  - Expected behavior: download certificate.
  - Current behavior: creates a text blob, downloads `{cert-title}-certificate.txt`, and shows status.
  - Type: downloads.
  - Existing tests: `tests/academy-certificate-action.spec.ts`.

- [ ] Academy progress persistence - ambiguous needing original comparison.
  - Expected behavior: unclear; training platforms usually persist course progress.
  - Current behavior: progress is React state only and resets on reload/navigation.
  - Recommended fix if original persists: save completion state per user/course in database or local storage.
  - Likely files: `components/AcademyPage.tsx`, data/auth layer.
  - Focused test: complete one lesson, reload, assert completion persists if desired.

## Sidebar / Help Controls

- [x] `CRB Academy` sidebar group - works.
  - Expected behavior: expand/collapse academy nav.
  - Current behavior: `toggleExpand("academy")`.
  - Type: expands/collapses.

- [x] Sidebar course links: `Credit Repair Specialist`, `FDCPA Specialist`, `FCRA Specialist`, `FCBA Specialist`, `Compliance Specialist`, `Rebuild Credit Specialist`, `FICO Score Specialist`, `Automation Specialist`, `Funding Specialist` - work.
  - Expected behavior: navigate to course pages.
  - Current behavior: `Link` hrefs point to existing course routes.
  - Type: navigates.
  - Existing tests: `tests/remaining-sidebar-routes-behavior.spec.ts`, academy smoke tests.

- [x] `Help` sidebar button and topbar `Need Help?` - work.
  - Expected behavior: open/close help links.
  - Current behavior: toggles `helpOpen`.
  - Type: expands/collapses.
  - Existing tests: `tests/help-training-behavior.spec.ts`, `tests/help-compare.spec.ts`.

- [x] Help links: `Get Support`, `Help Center`, `FAQ`, `Success Path`, `1-on-1 Coaching`, `AI Credit Coach` - mostly work as links.
  - Expected behavior: mail support, open external help/FAQ/success/coaching, or navigate to AI Credit Coach.
  - Current behavior: `mailto:`, external `target="_blank"` links, and local `/automation/ai-credit-coach`.
  - Type: navigates/opens mail client.
  - Test gap: current help test clicks only the first matching link and does not verify each href.

## Dashboard Training & Resources

Source: `app/dashboard/page.tsx`.

- [x] Quick action `Training Videos` - works as navigation.
  - Expected behavior: open training videos.
  - Current behavior: `router.push("/academy/credit-repair")`.
  - Type: navigates.
  - Ambiguity: label says videos, destination is a course page with video placeholders.

- [x] `Claim Your Free Gifts` - works as navigation.
  - Expected behavior: open billing/activation.
  - Current behavior: link to `/billing`.
  - Type: navigates.

- [x] `CDM Credit Boss Skool NEW` - navigates.
  - Expected behavior: likely Skool/community/course link.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates.
  - Ambiguous needing original comparison: destination may be wrong for a Skool-branded resource.

- [x] `Your First Dispute` - works as navigation.
  - Expected behavior: open dispute workflow.
  - Current behavior: link to `/disputes`.
  - Type: navigates.

- [ ] `Full Walkthrough` - ambiguous/bad destination.
  - Expected behavior: full walkthrough training.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates, but not to a walkthrough-specific page/video.
  - Needs real fix: likely yes.
  - Recommended fix: point to a real walkthrough route/video, or add a specific lesson deep link when Academy supports lesson IDs.
  - Likely files: `app/dashboard/page.tsx`, maybe `components/AcademyPage.tsx` for deep links.
  - Focused test: click `Full Walkthrough` and assert expected title/player/lesson.

- [ ] `1 to 1` - broken/ambiguous destination.
  - Expected behavior: schedule or open 1-on-1 coaching.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates, but likely wrong.
  - Recommended fix: point to the same coaching URL used in Help (`https://clientdisputemanager.com/coaching`) or a local scheduling route.
  - Likely files: `app/dashboard/page.tsx`.
  - Focused test: assert href is coaching URL or route.

- [ ] `Group Training` - broken/ambiguous destination.
  - Expected behavior: group training resource.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates, but likely wrong.
  - Recommended fix: replace with correct group training URL/route.
  - Likely files: `app/dashboard/page.tsx`.
  - Focused test: assert href is the configured group training destination.

- [ ] `Free Mastermind` - broken/ambiguous destination.
  - Expected behavior: mastermind/community resource.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates, but likely wrong.
  - Recommended fix: replace with correct mastermind/community URL/route.
  - Likely files: `app/dashboard/page.tsx`.
  - Focused test: assert href is the configured mastermind destination.

- [ ] Dashboard card `Help Center` - broken destination.
  - Expected behavior: open help center.
  - Current behavior: link to `/academy/credit-repair`.
  - Type: navigates, but wrong.
  - Needs real fix: yes.
  - Recommended fix: change href to `https://help.clientdisputemanager.com` with `target="_blank"`/`rel="noreferrer"`, matching sidebar Help Center.
  - Likely files: `app/dashboard/page.tsx`.
  - Focused test: assert dashboard `Help Center` href is the external help URL.

- [ ] `Task` - ambiguous/no-op.
  - Expected behavior: jump to or open dashboard tasks.
  - Current behavior: link to `/dashboard`; if already on dashboard, it only reloads/stays on the same page.
  - Type: navigates to same route / effectively does nothing from dashboard.
  - Recommended fix: use `#tasks` anchor and add an id to the tasks section, or make it focus/open task form.
  - Likely files: `app/dashboard/page.tsx`.
  - Focused test: click `Task` and assert tasks section is focused/visible or Add task form opens.

- [x] `Start-Run-Grow Training` - works as navigation.
  - Expected behavior: open Start-Run-Grow training.
  - Current behavior: link to `/get-customers/start-run-grow`.
  - Type: navigates.

## Letter Vault Training

Source: `app/letter-vault/page.tsx`.

- [x] `Training Videos` - works.
  - Expected behavior: open training menu.
  - Current behavior: toggles dropdown containing two training options.
  - Type: expands/collapses.
  - Existing tests: `tests/letter-vault-broken-controls.spec.ts`, `tests/letters-pages-smoke.spec.ts`.

- [x] `Letter Vault Training Video` - opens modal.
  - Expected behavior: show Letter Vault training video.
  - Current behavior: opens dialog with text and `Training video placeholder`.
  - Type: opens modal.
  - Ambiguous needing original comparison: video content is placeholder-only.

- [x] `Move Letters Training Video` - opens modal.
  - Expected behavior: show Move Letters training video.
  - Current behavior: opens dialog with text and `Training video placeholder`.
  - Type: opens modal.
  - Ambiguous needing original comparison: video content is placeholder-only.

- [x] Training modal `Close` - works.
  - Expected behavior: close modal.
  - Current behavior: sets `trainingVideo` to `null`.
  - Type: closes modal.

## Company / Portal Training

Source: `app/company/portals/page.tsx`.

- [x] `WATCH VIDEO` for `Client Tracking Portal` - opens modal.
  - Expected behavior: show client portal training video.
  - Current behavior: opens modal with explanatory text and `Training video placeholder`.
  - Type: opens modal.
  - Ambiguous needing original comparison: placeholder may need a real embedded video.
  - Focused test exists: `tests/portals-buttons-audit.spec.ts`.

- [x] `WATCH VIDEO` for `Affiliate Portal` - opens modal.
  - Expected behavior: show affiliate portal training video.
  - Current behavior: opens modal with explanatory text and `Training video placeholder`.
  - Type: opens modal.
  - Ambiguous needing original comparison: placeholder may need a real embedded video.

- [x] Portal video modal `Close` - works.
  - Expected behavior: close modal.
  - Current behavior: sets `video` to `null`.
  - Type: closes modal.

- [x] `COPY LINK` for Client Tracking Portal and Affiliate Portal - works.
  - Expected behavior: copy portal URL and show confirmation.
  - Current behavior: attempts `navigator.clipboard.writeText`; always sets visible `Copied!` state after attempt.
  - Type: copies.

## Employees Training

Source: `app/employees/page.tsx`.

- [ ] `Training Videos` - broken/non-functional.
  - Expected behavior: open employee/staff training video(s) or navigate to relevant training.
  - Current behavior: plain `<button type="button">Training Videos</button>` with no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended fix: wire to a modal/dropdown like Letter Vault, or navigate to an employee training route/video.
  - Likely files: `app/employees/page.tsx`.
  - Focused test: update `tests/operational-pages-smoke.spec.ts` or add `tests/employees-training-button.spec.ts` to click it and assert modal/navigation.

## Partner Resources / Credit Repair Class

Source: `components/CDMLayout.tsx`, `app/partner-resources/page.tsx`, `app/partner-resources/credit-repair-class/page.tsx`.

- [x] `Partner Resources` sidebar group - works.
  - Expected behavior: expand/collapse resource links.
  - Current behavior: `toggleExpand("partner")`.
  - Type: expands/collapses.

- [x] Partner resource cards, including `Credit Repair Class` - navigate.
  - Expected behavior: open selected resource detail page.
  - Current behavior: clickable cards call `router.push("/partner-resources/{slug}")`.
  - Type: navigates.
  - Test gap: card divs are not semantic links/buttons, so keyboard accessibility should be tested/fixed separately.

- [x] `Credit Repair Class` module rows, e.g. `Understanding Credit Reports` - work.
  - Expected behavior: expand/collapse module description.
  - Current behavior: clicking a module toggles `activeModule`.
  - Type: expands/collapses.
  - Ambiguous: no lesson start/player/download controls exist for this "course"; it is informational only.

- [x] `Back to Partner Resources` on partner detail pages - works.
  - Expected behavior: return to partner resources.
  - Current behavior: `router.push("/partner-resources")`.
  - Type: navigates.

- [ ] Sidebar `Attorney Review` - ambiguous resource destination.
  - Expected behavior: likely a dedicated Attorney Review resource page.
  - Current behavior: href is `/partner-resources`, same as the index.
  - Type: navigates, but likely wrong/incomplete.
  - Recommended fix: create `/partner-resources/attorney-review` or relabel/remove the item if no detail page exists.
  - Likely files: `components/CDMLayout.tsx`, `app/partner-resources/attorney-review/page.tsx`.
  - Focused test: assert sidebar `Attorney Review` route loads a dedicated resource page.

## Shared PageHeader Training Button

Source: `components/PageHeader.tsx`.

- [ ] `Training Videos` in `PageHeader` - latent broken control if rendered.
  - Expected behavior: open training videos or navigate.
  - Current behavior: button has no `onClick`, no href, and no state change.
  - Current usage: no active app file references `<PageHeader` in the root search, so this may not be visible today.
  - Type: does nothing if visible.
  - Recommended fix: either wire `PageHeader` to accept `trainingHref`/`onTrainingClick`, or hide it unless a handler is supplied.
  - Likely files: `components/PageHeader.tsx`, any future pages using it.
  - Focused test: component/page test where `showTrainingVideos` is true and click must produce modal/navigation.

- [ ] `ACTIVATE MEMBERSHIP` in `PageHeader` - latent broken control if rendered.
  - Expected behavior: open activation modal or billing.
  - Current behavior: button has no `onClick`.
  - Recommended fix: wire to billing/activation or remove from header.
  - Likely files: `components/PageHeader.tsx`.

## Recommended Focused Test Work

- [ ] Add `tests/academy-training-buttons-function.spec.ts` covering:
  - `/academy` route behavior.
  - `/academy/rebuild-credit` alias or canonical redirect decision.
  - Course `Begin Course`, module expand, lesson select, `Mark Complete`, certificate enabled/download.
  - Video play control either opens a real player or is not clickable.

- [ ] Update dashboard training/resource test coverage:
  - Verify each `Training & Resources` card href individually.
  - Assert `Help Center` points to the real help URL.
  - Assert `Task` scrolls/focuses/opens the task area if fixed.

- [ ] Update employee training coverage:
  - Click `Employees > Training Videos` and assert modal/navigation, or assert the button is absent until implemented.

- [ ] Update portal and letter-vault training tests if real video assets are added:
  - Assert embedded video/player/source instead of only `Training video placeholder`.

