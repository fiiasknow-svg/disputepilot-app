# Get Customers / Business Strategy / Offer Pages Button Function Audit

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app\` was not inspected or edited. No app files, tests, commits, or pushes were changed.

Tests reviewed only: `tests/get-customers-pages-smoke.spec.ts`, `tests/partner-resources-pages-smoke.spec.ts`, `tests/partner-resources-detail-pages-smoke.spec.ts`, `tests/partner-resources-attorney-review.spec.ts`, `tests/academy-*.spec.ts`, `tests/manual-workflow-audit.spec.ts`, `tests/operational-pages-smoke.spec.ts`, `tests/workflow-interactions-smoke.spec.ts`.

## Working Buttons / Links / Controls

- [x] `/get-customers` section cards: `Start, Run & Grow`, `Business Strategies`, `Get Customers`
  - Type: navigates.
  - Expected behavior: open each Get Customers subpage.
  - Current behavior: card `onClick` pushes `/get-customers/start-run-grow`, `/get-customers/business-strategies`, `/get-customers/get-customers`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts` clicks all three.
  - Fix needed: no.

- [x] `/get-customers` `View Partner Resources ->`
  - Type: navigates.
  - Expected behavior: open partner resources.
  - Current behavior: `router.push("/partner-resources")`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] `/get-customers/start-run-grow` `<- Back to Get Customers`
  - Type: navigates.
  - Expected behavior: return to `/get-customers`.
  - Current behavior: `router.push("/get-customers")`.
  - Test coverage: route smoke checks a page action, but not this exact back button on this page.
  - Fix needed: no; add exact focused test if this route gets changed.

- [x] `/get-customers/start-run-grow` `Next: Business Strategies ->`
  - Type: navigates.
  - Expected behavior: continue to Business Strategies.
  - Current behavior: `router.push("/get-customers/business-strategies")`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] `/get-customers/business-strategies` `<- Back to Get Customers`
  - Type: navigates.
  - Expected behavior: return to `/get-customers`.
  - Current behavior: `router.push("/get-customers")`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] `/get-customers/business-strategies` `View Client Acquisition ->`
  - Type: navigates.
  - Expected behavior: open client acquisition playbook.
  - Current behavior: `router.push("/get-customers/get-customers")`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] `/get-customers/get-customers` `<- Back to Get Customers`
  - Type: navigates.
  - Expected behavior: return to `/get-customers`.
  - Current behavior: `router.push("/get-customers")`.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] `/get-customers/get-customers` lead source tabs: `Referral Network`, `Social Media Organic`, `Paid Facebook / Instagram Ads`, `Google Ads & SEO`
  - Type: filters/updates content.
  - Expected behavior: switch visible lead-source action steps and metrics.
  - Current behavior: `setActiveSource(i)` updates the details panel.
  - Test coverage: `tests/get-customers-pages-smoke.spec.ts` clicks all four and checks changed content.
  - Fix needed: no.

- [x] `/partner-resources` resource cards: `Merchant Accounts`, `Monitoring Commissions`, `Dispute Outsourcing`, `Rebuild Credit Affiliate`, `Partner & Earn`, `Save with Annual Plan`, `Offer Free Vacations`, `Offer Business Funding`, `Credit Repair Class`, `Community`
  - Type: navigates.
  - Expected behavior: open corresponding `/partner-resources/*` route.
  - Current behavior: card `onClick` pushes `/partner-resources/${slug}`.
  - Test coverage: pages are smoke-tested, but card-click navigation is not focused.
  - Fix needed: no.

- [x] Partner resource detail pages `<- Back to Partner Resources` / `Back to Partner Resources`
  - Type: navigates.
  - Expected behavior: return to `/partner-resources`.
  - Current behavior: implemented on all inspected partner detail pages using `router.push("/partner-resources")`.
  - Test coverage: attorney review back button is checked; other detail pages mostly smoke content.
  - Fix needed: no, but add one shared focused back-button test across detail pages.

- [x] `/partner-resources/dispute-outsourcing` four `Get Started` buttons
  - Type: opens modal.
  - Expected behavior: start intake for selected plan.
  - Current behavior: opens `Dispute Outsourcing Intake` modal with selected plan.
  - Test coverage: visibility only in `partner-resources-detail-pages-smoke.spec.ts`; modal flow not covered.
  - Fix needed: partial; see broken/placeholder section for backend handoff.

- [x] `/partner-resources/dispute-outsourcing` modal `Cancel` and `Close`
  - Type: closes modal.
  - Expected behavior: dismiss intake.
  - Current behavior: clears selected plan and status.
  - Test coverage: none focused.
  - Fix needed: no.

- [x] `/partner-resources/dispute-outsourcing` modal `Save Interest`
  - Type: saves locally/status only.
  - Expected behavior: save interest in selected outsourcing plan.
  - Current behavior: only sets visible local status `Interest saved locally...`.
  - Test coverage: none focused.
  - Fix needed: yes for real persistence; see broken/placeholder section.

- [x] `/partner-resources/dispute-outsourcing` modal `Continue`
  - Type: starts placeholder/status only.
  - Expected behavior: continue real intake.
  - Current behavior: status says backend intake is not connected yet.
  - Test coverage: none focused.
  - Fix needed: yes for real intake; see broken/placeholder section.

- [x] `/partner-resources/partner-and-earn` referral count slider
  - Type: calculates/filters displayed earnings.
  - Expected behavior: update monthly and annual referral earnings.
  - Current behavior: `refCount` range state recalculates displayed earnings.
  - Test coverage: slider visibility only in `partner-resources-detail-pages-smoke.spec.ts`; no value-change assertion.
  - Fix needed: no.

- [x] `/partner-resources/save-and-annual-plan` `Monthly` / `Annual Save 20%`
  - Type: toggles pricing.
  - Expected behavior: switch billing display and plan CTA labels.
  - Current behavior: `billing` state toggles; annual shows `Switch to Annual`, monthly shows `Get Started`.
  - Test coverage: `partner-resources-detail-pages-smoke.spec.ts` clicks Monthly and verifies `Get Started`.
  - Fix needed: no.

- [x] `/partner-resources/save-and-annual-plan` plan CTA buttons: `Switch to Annual` / `Get Started`
  - Type: navigates.
  - Expected behavior: open billing subscription with selected plan and billing term.
  - Current behavior: pushes `/billing/subscription?plan={basic|standard|premium}&billing={monthly|annual}`.
  - Test coverage: button visibility only; query navigation not asserted.
  - Fix needed: no if `/billing/subscription` honors these query params; verify with focused test.

- [x] `/partner-resources/credit-repair-class` course module rows
  - Type: expands/collapses.
  - Expected behavior: reveal selected module description.
  - Current behavior: `setActiveModule` toggles description.
  - Test coverage: `partner-resources-detail-pages-smoke.spec.ts` expands first module.
  - Fix needed: no.

- [x] `/partner-resources/community` `<- Back to Partner Resources`
  - Type: navigates.
  - Expected behavior: return to `/partner-resources`.
  - Current behavior: `router.push("/partner-resources")`.
  - Test coverage: not focused.
  - Fix needed: no.

- [x] `/partner-resources/community` `+ New Post`
  - Type: opens modal.
  - Expected behavior: open post composer.
  - Current behavior: opens `New Community Post` modal.
  - Test coverage: `partner-resources-detail-pages-smoke.spec.ts`, `workflow-interactions-smoke.spec.ts`, `manual-workflow-audit.spec.ts`.
  - Fix needed: no.

- [x] `/partner-resources/community` channel buttons: `General Discussion`, `Getting Started`, `Marketing & Growth`, `Legal & Compliance`, `Dispute Strategy`, `Revenue & Pricing`
  - Type: filters.
  - Expected behavior: show posts for selected channel.
  - Current behavior: sets `channel`, marks `channelTouched`, filters posts.
  - Test coverage: no focused assertions.
  - Fix needed: no.

- [x] `/partner-resources/community` category buttons: `All`, `Success Story`, `Strategy`, `Tips & Tricks`, `Question`, `Legal / Compliance`, `General`
  - Type: filters.
  - Expected behavior: show posts matching category.
  - Current behavior: updates `cat` and filters posts.
  - Test coverage: no focused assertions.
  - Fix needed: no.

- [x] `/partner-resources/community` new post modal controls: `Category`, `Title`, `Content`, `Cancel`, `Post`
  - Type: selects, submits, closes.
  - Expected behavior: compose a local community post or cancel.
  - Current behavior: validates required title/content, prepends local post, stores posts in `localStorage`.
  - Test coverage: post modal and submit covered by `workflow-interactions-smoke.spec.ts` and `manual-workflow-audit.spec.ts`.
  - Fix needed: no unless posts must be backend-backed.

- [x] `/academy` course links: `Credit Repair`, `FDCPA`, `FCRA`, `FCBA`, `Compliance`, `Rebuild Credit`, `FICO Score`, `Automation`, `Funding`
  - Type: navigates.
  - Expected behavior: open course detail route.
  - Current behavior: `Link` to each `/academy/*` route.
  - Test coverage: `academy-training-buttons-function.spec.ts`.
  - Fix needed: no.

- [x] `/academy/rebuild-credit`
  - Type: redirects.
  - Expected behavior: alias to current rebuild route.
  - Current behavior: `redirect("/academy/rebuild")`.
  - Test coverage: `academy-training-buttons-function.spec.ts`.
  - Fix needed: no.

- [x] Academy detail pages `Begin Course ->`
  - Type: starts/selects first lesson.
  - Expected behavior: start course and show first lesson with completion controls.
  - Current behavior: expands module 1 and selects lesson 1.
  - Test coverage: `academy-pages-smoke.spec.ts`, `academy-course-detail-pages-smoke.spec.ts`.
  - Fix needed: no.

- [x] Academy module header buttons
  - Type: expands/collapses.
  - Expected behavior: reveal/hide lessons.
  - Current behavior: toggles `expandedModule`.
  - Test coverage: `academy-certificate-action.spec.ts` uses module expansion.
  - Fix needed: no.

- [x] Academy lesson rows
  - Type: selects/previews lesson.
  - Expected behavior: display selected lesson content panel.
  - Current behavior: sets active lesson; video/reading/quiz previews render.
  - Test coverage: `academy-training-buttons-function.spec.ts`.
  - Fix needed: no.

- [x] Academy lesson completion circle and `Mark Complete` / `Completed`
  - Type: saves locally.
  - Expected behavior: toggle lesson completion/progress.
  - Current behavior: toggles `completed` set and persists to `localStorage`.
  - Test coverage: `academy-training-buttons-function.spec.ts`, `academy-certificate-action.spec.ts`.
  - Fix needed: no if local progress is acceptable.

- [x] Academy video play button
  - Type: opens modal/player.
  - Expected behavior: play lesson video or open player.
  - Current behavior: opens visible placeholder dialog because no hosted video source is connected.
  - Test coverage: `academy-training-buttons-function.spec.ts`.
  - Fix needed: yes for real video content; see broken/placeholder section.

- [x] Academy video modal `Close`
  - Type: closes modal.
  - Expected behavior: dismiss player.
  - Current behavior: clears `videoLesson`.
  - Test coverage: `academy-training-buttons-function.spec.ts`.
  - Fix needed: no.

- [x] Academy certificate button: `{N} lessons left` / `Download Certificate`
  - Type: disabled until complete; downloads.
  - Expected behavior: block until complete, then download certificate.
  - Current behavior: creates local `.txt` certificate download after all lessons complete.
  - Test coverage: `academy-certificate-action.spec.ts`.
  - Fix needed: no if text-file local certificate is acceptable; ambiguous if branded certificate/PDF required.

- [x] Sidebar resource links in `components/CDMLayout.tsx`
  - Type: expands/navigates.
  - Expected behavior: expose Get Customers, Partner Resources, and CRB Academy destinations.
  - Current behavior: group buttons expand/collapse; child `Link`s navigate to existing routes.
  - Covered labels: `Get Customers`, `Start - Run - Grow`, `Business Strategies`; `Merchant Accounts`, `Monitoring Commissions`, `Dispute Outsourcing`, `Attorney Review`, `Rebuild Credit Affiliate`, `Partner & Earn`, `Save & Annual Plan`, `Offer Free Vacations`, `Offer Business Funding`, `Credit Repair Class`, `Community`; all CRB Academy course links.
  - Test coverage: attorney review sidebar href only; academy catalog links tested; no full sidebar resource-link click matrix.
  - Fix needed: no.

## Broken / Non-Functional / Placeholder Controls

- [ ] `/partner-resources/merchant-accounts` missing `Apply Now` controls for PayHQ, Payroc, Stripe, Square
  - Expected behavior: each processor card should have a real outbound apply link or a clearly disabled/request-access state.
  - Current behavior from code/tests: `PROCESSORS` includes `link: "#"`, and the instructions say `Click 'Apply Now'`, but no visible `Apply Now` button or anchor is rendered. Tests only verify static content.
  - Current type: missing control; does nothing because there is no visible action.
  - Needs real fix: yes.
  - Recommended exact fix: render an `Apply Now` `<a>`/`Link` per processor using a real URL/config value; if URLs are unavailable, render `Request Processor Link` opening a modal/status that states setup is required.
  - Files likely needing edits: `app/partner-resources/merchant-accounts/page.tsx`.
  - Focused test: create/update `tests/partner-resources-merchant-actions.spec.ts` to assert each processor CTA is visible and has a non-`#` href or opens a request modal/status.

- [ ] `/partner-resources/monitoring-commissions` missing affiliate signup/link controls
  - Expected behavior: `Sign Up as Affiliate` / `Get Your Affiliate Link` should provide actionable partner links or setup flow.
  - Current behavior from code/tests: page describes affiliate registration and unique links but renders only static provider cards and steps. Tests only verify content.
  - Current type: missing control; no navigation/copy/signup.
  - Needs real fix: yes.
  - Recommended exact fix: add provider CTA buttons such as `Get Affiliate Link` or `Sign Up` for SmartCredit, MyFreeScore360, IdentityIQ, mySCOREIQ with real configured URLs, plus fallback request modal if not configured.
  - Files likely needing edits: `app/partner-resources/monitoring-commissions/page.tsx`.
  - Focused test: `tests/partner-resources-monitoring-actions.spec.ts` should verify every provider CTA is visible and either navigates to a non-placeholder URL or opens request/setup confirmation.

- [ ] `/partner-resources/rebuild-credit-affiliate` missing product affiliate-link controls
  - Expected behavior: user can open/copy affiliate links for Credit Strong, Kikoff, Chime Credit Builder, OpenSky Secured Visa, Experian Boost, Self Lender.
  - Current behavior from code/tests: page tells users to use affiliate links but renders no actionable links/buttons. Tests only verify static content.
  - Current type: missing control; no copy/navigation.
  - Needs real fix: yes.
  - Recommended exact fix: render per-product `Copy Affiliate Link` and/or `Open Partner` controls backed by configured URLs; show `No commission` or `Recommended free tool` state for Experian Boost if intentionally non-affiliate.
  - Files likely needing edits: `app/partner-resources/rebuild-credit-affiliate/page.tsx`.
  - Focused test: `tests/partner-resources-rebuild-affiliate-actions.spec.ts` should verify CTA behavior for each product and special handling for Experian Boost.

- [ ] `/partner-resources/partner-and-earn` missing `Get Your Link` action
  - Expected behavior: let user view/copy referral link or navigate to partner program settings.
  - Current behavior from code/tests: earnings calculator works, but `Get Your Link` is static instructional text. No CTA or copy behavior.
  - Current type: missing copy/navigation.
  - Needs real fix: yes.
  - Recommended exact fix: add `Copy Referral Link` and `Open Partner Program` controls. If account settings route exists, link there; otherwise generate/copy a local placeholder only if labeled as pending backend.
  - Files likely needing edits: `app/partner-resources/partner-and-earn/page.tsx`, possibly account/settings partner program route if one exists.
  - Focused test: `tests/partner-resources-partner-earn-actions.spec.ts` should move slider and assert copy/open referral action.

- [ ] `/partner-resources/dispute-outsourcing` `Save Interest` is local-only
  - Expected behavior: save selected outsourcing interest for follow-up or intake.
  - Current behavior from code/tests: only sets modal status text; no backend, no local storage, no durable record. Tests do not cover it.
  - Current type: saves/status only, not a real save.
  - Needs real fix: yes.
  - Recommended exact fix: connect to actual intake persistence/API or at least durable local storage with visible audit trail until backend exists.
  - Files likely needing edits: `app/partner-resources/dispute-outsourcing/page.tsx`, likely new API route under `app/api/partner-resources/...` or existing lead/support workflow.
  - Focused test: update/create `tests/partner-resources-dispute-outsourcing-actions.spec.ts` to open each plan, click `Save Interest`, and verify durable confirmation/reload behavior.

- [ ] `/partner-resources/dispute-outsourcing` `Continue` is placeholder-only
  - Expected behavior: continue into real outsourcing intake, billing, scheduling, or request form.
  - Current behavior from code/tests: status explicitly says backend intake is not connected yet. Tests do not cover this behavior.
  - Current type: starts placeholder/status only.
  - Needs real fix: yes.
  - Recommended exact fix: replace status-only action with a real intake form step or navigation to connected billing/service request route; preserve selected plan in query/state.
  - Files likely needing edits: `app/partner-resources/dispute-outsourcing/page.tsx`, possible billing/intake route/API.
  - Focused test: same `partner-resources-dispute-outsourcing-actions.spec.ts`, asserting `Continue` reaches the connected next step.

- [ ] `/partner-resources/attorney-review` missing attorney intake/scheduling CTA
  - Expected behavior: request attorney review or schedule legal review.
  - Current behavior from code/tests: page states backend intake or scheduling is not connected and only provides `Back to Partner Resources`.
  - Current type: missing start/schedule/submit control.
  - Needs real fix: yes if this is intended as an offer/resource control rather than informational placeholder.
  - Recommended exact fix: add `Request Attorney Review` button opening an intake modal with client/file fields or route to a connected support/legal intake. If not ready, display disabled `Request Attorney Review` with setup-required reason.
  - Files likely needing edits: `app/partner-resources/attorney-review/page.tsx`.
  - Focused test: extend `tests/partner-resources-attorney-review.spec.ts` to verify the request CTA opens/submits connected intake or clearly disabled setup state.

- [ ] `/partner-resources/offer-free-vacations` missing partner signup/certificate activation controls
  - Expected behavior: sign up for vacation certificate partner account, choose package, or send activation link.
  - Current behavior from code/tests: page describes signup, package choice, and activation link, but package cards are static and there are no CTAs. Tests only verify content.
  - Current type: missing start/select/send controls.
  - Needs real fix: yes.
  - Recommended exact fix: add `Get Vacation Certificates` CTA plus per-package `Select Package` controls that open setup/send modal or configured partner URL.
  - Files likely needing edits: `app/partner-resources/offer-free-vacations/page.tsx`.
  - Focused test: `tests/partner-resources-vacation-actions.spec.ts` should verify package selection and partner CTA behavior.

- [ ] `/partner-resources/offer-business-funding` missing referral submission controls
  - Expected behavior: submit client to funding partner or open/copy referral link.
  - Current behavior from code/tests: page says submit through referral link, but renders no link, form, or submit button. Tests only verify content.
  - Current type: missing submit/navigation/copy.
  - Needs real fix: yes.
  - Recommended exact fix: add `Submit Funding Referral` CTA with qualification fields and/or configured outbound referral link; include validation and success status.
  - Files likely needing edits: `app/partner-resources/offer-business-funding/page.tsx`.
  - Focused test: `tests/partner-resources-business-funding-actions.spec.ts` should verify referral modal/form and submit confirmation.

- [ ] `/partner-resources/credit-repair-class` missing white-label course setup/sales controls
  - Expected behavior: request white-label setup, preview course, or copy/embed/sell link.
  - Current behavior from code/tests: module expansion works, but sales/setup actions are static text only.
  - Current type: expands only; missing setup/preview/copy controls.
  - Needs real fix: yes if users are expected to activate the offer from this page.
  - Recommended exact fix: add `Request White-Label Setup`, `Preview Course`, and/or `Copy Sales Link` controls with real flow or setup-required modal.
  - Files likely needing edits: `app/partner-resources/credit-repair-class/page.tsx`.
  - Focused test: extend partner detail action tests to verify module expansion plus white-label CTA behavior.

- [ ] `/partner-resources/community` post cards look clickable but do nothing
  - Expected behavior: open post details/thread when clicking a post card, or not present a click affordance.
  - Current behavior from code/tests: each post card has `cursor: "pointer"` but no `onClick`; clicking does nothing. Tests do not check post details.
  - Current type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: either remove pointer cursor/affordance or add post detail modal/page with title, content, likes/replies, and reply action.
  - Files likely needing edits: `app/partner-resources/community/page.tsx`.
  - Focused test: `tests/partner-resources-community-actions.spec.ts` should click a post and assert details open, or assert cards are not interactive.

- [ ] Academy video play opens placeholder, not real video
  - Expected behavior: play hosted lesson video.
  - Current behavior from code/tests: opens a modal that states no hosted video source is connected.
  - Current type: previews/opens modal, but not real playback.
  - Needs real fix: yes if CRB Academy is expected to deliver actual course media.
  - Recommended exact fix: extend `Lesson` with video source metadata and render real `<video>`/embed for video lessons; keep placeholder only when source missing and report missing source clearly.
  - Files likely needing edits: `components/AcademyPage.tsx`, all `app/academy/*/page.tsx` course data files.
  - Focused test: update `tests/academy-training-buttons-function.spec.ts` to assert video lessons with configured sources render playable media, and missing-source lessons show explicit setup state.

## Ambiguous Controls Needing Original Comparison

- [ ] `/partner-resources/save-and-annual-plan` plan CTAs navigate to `/billing/subscription?plan=...&billing=...`
  - Ambiguity: current route exists in app tree, but this audit did not verify whether subscription page consumes the query params or starts checkout.
  - Recommended comparison: compare original product behavior for annual upgrade/checkout.
  - Likely files: `app/partner-resources/save-and-annual-plan/page.tsx`, `app/billing/subscription/page.tsx`.
  - Focused test: click all three plan CTAs in both billing modes and assert selected plan/billing is visible on subscription page.

- [ ] Academy certificate downloads a local `.txt` file
  - Ambiguity: current behavior is functional and tested, but product may require branded certificate/PDF, signed certificate, or account-backed certificate.
  - Recommended comparison: compare original CRB Academy certificate flow.
  - Likely files: `components/AcademyPage.tsx`.
  - Focused test: keep current download test, update expected filename/content/format after original comparison.

- [ ] Academy progress is local-only
  - Ambiguity: local persistence works, but account-level academy progress may be expected.
  - Recommended comparison: check original CRB Academy progress persistence.
  - Likely files: `components/AcademyPage.tsx`, potential academy progress API/storage.
  - Focused test: preserve local reload test; add backend/session persistence test if connected.

- [ ] `/partner-resources/community` posts are local-only
  - Ambiguity: local posting works and is tested, but community may need real multi-user backend persistence.
  - Recommended comparison: compare original community/forum behavior.
  - Likely files: `app/partner-resources/community/page.tsx`.
  - Focused test: keep modal/post test; add reload persistence and backend visibility expectations if required.

- [ ] Sidebar label mismatch: page title `Save with Annual Plan` vs sidebar/audit target `Save & Annual Plan`
  - Ambiguity: route works, but exact copy may need parity with original.
  - Recommended comparison: verify expected label in original app.
  - Likely files: `components/CDMLayout.tsx`, `app/partner-resources/save-and-annual-plan/page.tsx`, tests that expect title text.
  - Focused test: sidebar route/title smoke should use agreed product label.

## Focused Tests To Create / Update

- [ ] Add `tests/partner-resources-card-navigation.spec.ts`: click every `/partner-resources` resource card and every relevant sidebar partner link.
- [ ] Add `tests/get-customers-sidebar-navigation.spec.ts`: click Get Customers sidebar group/link matrix and page CTAs.
- [ ] Add `tests/partner-resources-merchant-actions.spec.ts`: verify merchant processor application CTAs are real.
- [ ] Add `tests/partner-resources-monitoring-actions.spec.ts`: verify monitoring provider affiliate CTAs are real.
- [ ] Add `tests/partner-resources-rebuild-affiliate-actions.spec.ts`: verify credit builder affiliate CTAs.
- [ ] Add `tests/partner-resources-dispute-outsourcing-actions.spec.ts`: verify `Get Started`, `Save Interest`, and `Continue` reach a durable/connected flow.
- [ ] Update `tests/partner-resources-attorney-review.spec.ts`: add request/schedule intake CTA once implemented.
- [ ] Add `tests/partner-resources-vacation-actions.spec.ts`: verify vacation package selection/setup.
- [ ] Add `tests/partner-resources-business-funding-actions.spec.ts`: verify funding referral submission.
- [ ] Add/extend `tests/partner-resources-credit-repair-class-actions.spec.ts`: verify white-label setup/preview/copy controls.
- [ ] Add `tests/partner-resources-community-actions.spec.ts`: verify channel/category filters, post-card behavior, validation, and reload persistence expectations.
- [ ] Update `tests/academy-training-buttons-function.spec.ts`: assert real video source behavior when source metadata exists.

## Highest-Priority Fix Order

1. [ ] Replace missing partner offer CTAs with real configured links/forms: merchant accounts, monitoring commissions, rebuild credit affiliate, business funding, free vacations, credit repair class.
2. [ ] Connect placeholder intake flows: dispute outsourcing `Save Interest`/`Continue`, attorney review request/schedule.
3. [ ] Remove or implement community post-card click behavior.
4. [ ] Verify subscription query handling for annual-plan CTAs.
5. [ ] Compare academy video/certificate/progress expectations with original CRB Academy behavior.
