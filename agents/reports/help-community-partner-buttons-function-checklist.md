# Help / Community / Partner Resources Button Function Checklist

Audit scope: root app only, `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app/` was not inspected or edited. No app files, tests, commits, or fixes were made.

Code inspected:
- `components/CDMLayout.tsx`
- `app/dashboard/page.tsx`
- `app/partner-resources/page.tsx`
- `app/partner-resources/*/page.tsx`
- Existing relevant tests: `tests/help-compare.spec.ts`, `tests/help-training-behavior.spec.ts`, `tests/dashboard-training-resources.spec.ts`, `tests/partner-resources-pages-smoke.spec.ts`, `tests/partner-resources-detail-pages-smoke.spec.ts`, `tests/partner-resources-attorney-review.spec.ts`, `tests/manual-workflow-audit.spec.ts`, `tests/operational-pages-smoke.spec.ts`, `tests/workflow-interactions-smoke.spec.ts`

Route findings:
- [x] `/partner-resources` exists.
- [x] `/partner-resources/*` detail routes exist for all sidebar partner items listed below.
- [ ] `/help` does not exist in root `app/`.
- [ ] `/community` does not exist in root `app/`; current community route is `/partner-resources/community`.
- [ ] `app/help/**` and `app/community/**` do not exist in root `app/`.

## Working Buttons / Links

### Layout Help Controls
- [x] `Help` sidebar footer button
  - Expected: expand/collapse help menu.
  - Current behavior: toggles `helpOpen` and reveals/hides help links.
  - Action type: expands.
  - Needs fix: no.
  - Covered by: `tests/help-compare.spec.ts`, `tests/help-training-behavior.spec.ts`.

- [x] `Need Help?` topbar button
  - Expected: open the same help menu.
  - Current behavior: toggles `helpOpen`.
  - Action type: expands.
  - Needs fix: no.
  - Test gap: existing tests mostly click `Help`, not specifically `Need Help?`.

- [x] `Get Support`
  - Expected: start support request.
  - Current behavior: `mailto:support@clientdisputemanager.com`.
  - Action type: opens mail client / navigates to mailto.
  - Needs fix: no, unless original app used an in-app ticket route.

- [x] `Help Center`
  - Expected: open help center.
  - Current behavior: external link to `https://help.clientdisputemanager.com`, new tab.
  - Action type: navigates externally.
  - Needs fix: no.

- [x] `FAQ`
  - Expected: open FAQ.
  - Current behavior: external link to `https://clientdisputemanager.com/faq`, new tab.
  - Action type: navigates externally.
  - Needs fix: no.

- [x] `Success Path`
  - Expected: open walkthrough/training page.
  - Current behavior: external link to `https://clientdisputemanager.com/success-path`, new tab.
  - Action type: navigates externally.
  - Needs fix: no.

- [x] `1-on-1 Coaching`
  - Expected: open coaching scheduler/page.
  - Current behavior: external link to `https://clientdisputemanager.com/coaching`, new tab.
  - Action type: navigates externally.
  - Needs fix: no.

- [x] `AI Credit Coach`
  - Expected: open AI Credit Coach route.
  - Current behavior: link to `/automation/ai-credit-coach`.
  - Action type: navigates internally.
  - Needs fix: no.

### Dashboard Training & Resource Links
- [x] `Full Walkthrough`
  - Expected/current: link to `/academy`.
  - Action type: navigates.
  - Needs fix: no.
  - Covered by: `tests/dashboard-training-resources.spec.ts`.

- [x] `1 to 1`
  - Expected/current: external coaching link.
  - Action type: navigates externally.
  - Needs fix: no.
  - Covered by: `tests/dashboard-training-resources.spec.ts`.

- [x] `Group Training`
  - Expected/current: link to `/academy`.
  - Action type: navigates.
  - Needs fix: no.
  - Covered by: `tests/dashboard-training-resources.spec.ts`.

- [x] `Free Mastermind`
  - Expected/current: link to `/partner-resources/community`.
  - Action type: navigates.
  - Needs fix: no.
  - Covered by: `tests/dashboard-training-resources.spec.ts`.

- [x] `Help Center`
  - Expected/current: external help center link.
  - Action type: navigates externally.
  - Needs fix: no.
  - Covered by: `tests/dashboard-training-resources.spec.ts`.

- [x] `Start-Run-Grow Training`
  - Expected/current: link to `/get-customers/start-run-grow`.
  - Action type: navigates.
  - Needs fix: no.
  - Test gap: not asserted in `tests/dashboard-training-resources.spec.ts`.

### Partner Resources Sidebar / Overview Navigation
- [x] `Partner Resources` sidebar group
  - Expected: expand/collapse partner resource menu.
  - Current behavior: toggles expanded state.
  - Action type: expands.
  - Needs fix: no.

- [x] Sidebar links: `Merchant Accounts`, `Monitoring Commissions`, `Dispute Outsourcing`, `Attorney Review`, `Rebuild Credit Affiliate`, `Partner & Earn`, `Save & Annual Plan`, `Offer Free Vacations`, `Offer Business Funding`, `Credit Repair Class`, `Community`
  - Expected: navigate to each partner detail page.
  - Current behavior: all are `Link` components with existing `/partner-resources/...` hrefs.
  - Action type: navigates.
  - Needs fix: no.
  - Covered by: `tests/partner-resources-pages-smoke.spec.ts`, `tests/partner-resources-attorney-review.spec.ts`, `tests/remaining-sidebar-routes-behavior.spec.ts` for most links.

- [x] Partner Resources overview cards: `Merchant Accounts`, `Monitoring Commissions`, `Dispute Outsourcing`, `Rebuild Credit Affiliate`, `Partner & Earn`, `Save with Annual Plan`, `Offer Free Vacations`, `Offer Business Funding`, `Credit Repair Class`, `Community`
  - Expected: open detail page for selected resource.
  - Current behavior: clickable card `onClick={() => router.push(...)}`.
  - Action type: navigates.
  - Needs fix: no.
  - Test gap: smoke tests verify routes render, but do not click overview cards.

### Partner Detail Back Controls
- [x] `Back to Partner Resources` / `<- Back to Partner Resources`
  - Visible on all partner detail pages.
  - Expected: return to `/partner-resources`.
  - Current behavior: `router.push("/partner-resources")`.
  - Action type: navigates.
  - Needs fix: no.
  - Test gap: `tests/partner-resources-attorney-review.spec.ts` checks visibility only; add behavior assertion across all detail pages.

### Community Controls
- [x] `+ New Post`
  - Expected: open new post modal.
  - Current behavior: sets `newPost` true and displays modal.
  - Action type: opens modal.
  - Needs fix: no.
  - Covered by: `tests/partner-resources-detail-pages-smoke.spec.ts`, `tests/workflow-interactions-smoke.spec.ts`, `tests/manual-workflow-audit.spec.ts`.

- [x] New post modal `Category` select
  - Expected: choose category for submitted post.
  - Current behavior: updates local draft category.
  - Action type: selects.
  - Needs fix: no.

- [x] New post modal `Title` input
  - Expected: enter post title.
  - Current behavior: updates local draft title.
  - Action type: input.
  - Needs fix: no.

- [x] New post modal `Content` textarea
  - Expected: enter post body.
  - Current behavior: updates local draft content.
  - Action type: input.
  - Needs fix: no.

- [x] New post modal `Cancel`
  - Expected: close modal and discard draft.
  - Current behavior: closes modal and resets draft.
  - Action type: closes modal.
  - Needs fix: no.

- [x] New post modal `Post`
  - Expected: submit post.
  - Current behavior: if title/content are non-empty, inserts a local post at top of feed and persists to `localStorage`; if empty, silently does nothing.
  - Action type: submits/saves locally.
  - Needs fix: no for local prototype; consider validation message if parity expects user feedback.
  - Covered by: `tests/workflow-interactions-smoke.spec.ts`, `tests/manual-workflow-audit.spec.ts`.

- [x] Category filter chips: `All`, `Success Story`, `Strategy`, `Tips & Tricks`, `Question`, `Legal / Compliance`, `General`
  - Expected: filter visible community posts by category.
  - Current behavior: updates `cat`; feed displays matching posts.
  - Action type: filters.
  - Needs fix: no.
  - Test gap: no focused test verifies each filter result.

- [ ] Community channel rows: `General Discussion`, `Getting Started`, `Marketing & Growth`, `Legal & Compliance`, `Dispute Strategy`, `Revenue & Pricing`
  - Expected: likely open/filter the selected channel.
  - Current behavior: styled with `cursor: pointer`, but no `onClick`, no route, no filter state.
  - Action type: does nothing.
  - Needs real fix: yes.

### Partner & Earn Controls
- [x] `How many businesses can you refer?` range slider
  - Expected: update earnings calculator.
  - Current behavior: updates `refCount`; monthly/yearly earnings recalculate from referral tiers.
  - Action type: input/calculates.
  - Needs fix: no.
  - Covered by: `tests/partner-resources-detail-pages-smoke.spec.ts` visibility only.

### Save & Annual Plan Controls
- [x] `Monthly`
  - Expected: switch pricing display to monthly.
  - Current behavior: sets `billing` to `monthly`; plan CTA text changes to `Get Started`.
  - Action type: filters/toggles.
  - Needs fix: no.
  - Covered by: `tests/partner-resources-detail-pages-smoke.spec.ts`.

- [x] `Annual Save 20%`
  - Expected: switch pricing display to annual.
  - Current behavior: sets `billing` to `annual`; plan CTA text changes to `Switch to Annual`.
  - Action type: filters/toggles.
  - Needs fix: no.
  - Covered by: visibility in `tests/partner-resources-detail-pages-smoke.spec.ts`.

### Credit Repair Class Controls
- [x] Course module rows: `Understanding Credit Reports`, `FICO Score Factors`, `Your Rights Under FCRA & FDCPA`, `How to Dispute Items`, `Building Positive Credit`, `Maintaining Great Credit`
  - Expected: expand/collapse module details.
  - Current behavior: clicking a row toggles `activeModule`; selected module shows description.
  - Action type: expands.
  - Needs fix: no.
  - Covered by: first module only in `tests/partner-resources-detail-pages-smoke.spec.ts`.

## Broken / Non-Functional Buttons

- [ ] `Get Started` buttons on `Dispute Outsourcing`
  - Location: `app/partner-resources/dispute-outsourcing/page.tsx`
  - Expected behavior: start outsourcing signup/intake or route to a contact/billing/setup flow for the chosen plan.
  - Current behavior from code/tests: rendered as plain `<button>` with no `onClick`; existing test only checks first button is visible.
  - Action type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add a selected-plan handler such as `startOutsourcing(planName)` that either routes to a real intake route, opens an intake modal, or navigates to a billing/service setup route with query params, for example `/partner-resources/dispute-outsourcing?plan=starter-bundle` only if that route/modal is implemented.
  - Files likely needing edits: `app/partner-resources/dispute-outsourcing/page.tsx`; possibly a new intake route/component if original behavior requires it.
  - Focused test: create/update `tests/partner-resources-dispute-outsourcing-actions.spec.ts` to click each `Get Started`, assert URL/modal/status changes and chosen plan is carried through.

- [ ] `Switch to Annual` buttons on `Save with Annual Plan`
  - Location: `app/partner-resources/save-and-annual-plan/page.tsx`
  - Expected behavior: start plan change/checkout/billing update for selected plan and annual cadence.
  - Current behavior from code/tests: rendered as plain `<button>` with no `onClick`; tests only verify visibility after toggling billing.
  - Action type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: wire each plan CTA to a real billing route or modal, preserving plan and cadence, for example `router.push("/billing/subscription?plan=standard&billing=annual")` if that page consumes query params, or open an in-page confirmation modal that calls the subscription update path.
  - Files likely needing edits: `app/partner-resources/save-and-annual-plan/page.tsx`; possibly `app/billing/subscription/page.tsx` or billing subscription logic.
  - Focused test: create/update `tests/partner-resources-annual-plan-actions.spec.ts` to select Annual, click each `Switch to Annual`, and assert billing/subscription destination or confirmation state.

- [ ] `Get Started` buttons on `Save with Annual Plan` after selecting `Monthly`
  - Location: `app/partner-resources/save-and-annual-plan/page.tsx`
  - Expected behavior: start signup/plan selection for selected monthly plan.
  - Current behavior from code/tests: same inert button; label changes to `Get Started` only.
  - Action type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: share the same CTA handler as annual plan buttons, passing `billing=monthly`.
  - Files likely needing edits: `app/partner-resources/save-and-annual-plan/page.tsx`; possibly billing subscription route.
  - Focused test: extend the annual plan action test to toggle Monthly and verify `Get Started` navigates/opens expected flow.

## Ambiguous Buttons / Controls Needing Original Comparison

- [ ] `/help`
  - Expected behavior: unclear. User listed `/help`, but no root route exists.
  - Current behavior: would 404 unless middleware rewrites elsewhere.
  - Action type: route missing.
  - Needs original comparison: yes, to decide whether `/help` should be a real page or whether Help is intentionally only the layout menu.
  - Recommended exact fix if original app has `/help`: add `app/help/page.tsx` or redirect `/help` to help center/support menu equivalent.
  - Files likely needing edits: `app/help/page.tsx` or route redirect/middleware; `components/CDMLayout.tsx` only if sidebar should link to `/help`.
  - Focused test: `tests/help-route-behavior.spec.ts` asserting `/help` does not 404 and exposes expected Help controls.

- [ ] `/community`
  - Expected behavior: unclear. User listed `/community`, but current route is `/partner-resources/community`.
  - Current behavior: no root `app/community`; direct `/community` would 404.
  - Action type: route missing.
  - Needs original comparison: yes, to decide if `/community` should redirect to `/partner-resources/community` or be a distinct top-level community page.
  - Recommended exact fix if original app supports `/community`: add a redirect page at `app/community/page.tsx` to `/partner-resources/community`, or move/duplicate route intentionally.
  - Files likely needing edits: `app/community/page.tsx`.
  - Focused test: `tests/community-route-behavior.spec.ts` asserting `/community` reaches visible Community UI.

- [ ] `Apply Now` references in Merchant Accounts copy
  - Location: `app/partner-resources/merchant-accounts/page.tsx`
  - Expected behavior: the page instructions say click `Apply Now`.
  - Current behavior: no visible `Apply Now` buttons or links exist; processor data contains `link: "#"` but it is unused.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: render an `Apply Now` anchor/button per processor using real partner URLs; do not use `#`.
  - Files likely needing edits: `app/partner-resources/merchant-accounts/page.tsx`.
  - Focused test: `tests/partner-resources-merchant-accounts-actions.spec.ts` asserting each processor exposes a non-`#` `Apply Now` link.

- [ ] Affiliate/partner link references in `Monitoring Commissions`
  - Location: `app/partner-resources/monitoring-commissions/page.tsx`
  - Expected behavior: copy instructs users to sign up using partner affiliate links and get affiliate links.
  - Current behavior: no visible signup/link/copy controls.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: add provider-specific `Sign Up as Affiliate` or `Get Affiliate Link` controls with real URLs or a copyable tracked link.
  - Files likely needing edits: `app/partner-resources/monitoring-commissions/page.tsx`.
  - Focused test: `tests/partner-resources-monitoring-actions.spec.ts` asserting every provider has a real link/copy action.

- [ ] Credit builder product affiliate links in `Rebuild Credit Affiliate`
  - Location: `app/partner-resources/rebuild-credit-affiliate/page.tsx`
  - Expected behavior: copy says use affiliate links to direct clients to products.
  - Current behavior: product cards expose no link/copy/start controls.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: add per-product `Get Link`, `Copy Link`, or `Open Partner` actions wired to real affiliate URLs.
  - Files likely needing edits: `app/partner-resources/rebuild-credit-affiliate/page.tsx`.
  - Focused test: `tests/partner-resources-rebuild-affiliate-actions.spec.ts` verifying every product action has an `href` or copy status.

- [ ] `Get Your Link` in `Partner & Earn`
  - Location: `app/partner-resources/partner-and-earn/page.tsx`
  - Expected behavior: copy says referral link is in Account Settings -> Partner Program.
  - Current behavior: instructional tile only; no clickable route/copy action.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: make `Get Your Link` a button/link to the real partner program settings page or add a copy-referral-link control.
  - Files likely needing edits: `app/partner-resources/partner-and-earn/page.tsx`; possibly account/settings partner-program page.
  - Focused test: `tests/partner-resources-partner-earn-actions.spec.ts` asserting link/copy behavior and calculator behavior.

- [ ] Vacation certificate activation/link flow
  - Location: `app/partner-resources/offer-free-vacations/page.tsx`
  - Expected behavior: copy instructs users to sign up through partner link and send certificate activation link.
  - Current behavior: no signup, copy, download, or send controls.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: add `Get Vacation Partner Link` and/or `Copy Certificate Activation Link` controls with real destinations.
  - Files likely needing edits: `app/partner-resources/offer-free-vacations/page.tsx`.
  - Focused test: `tests/partner-resources-free-vacations-actions.spec.ts` verifying partner link/copy action.

- [ ] Business funding referral submission
  - Location: `app/partner-resources/offer-business-funding/page.tsx`
  - Expected behavior: copy says submit client info to a funding partner through referral link.
  - Current behavior: no referral submission/link control.
  - Action type: missing control.
  - Needs original comparison: yes.
  - Recommended exact fix: add `Submit Funding Referral` CTA routing to a form/modal or real partner URL.
  - Files likely needing edits: `app/partner-resources/offer-business-funding/page.tsx`; possibly new referral form route/component.
  - Focused test: `tests/partner-resources-business-funding-actions.spec.ts` asserting CTA opens form or navigates to valid destination.

- [ ] Credit Repair Class sales/lead-magnet actions
  - Location: `app/partner-resources/credit-repair-class/page.tsx`
  - Expected behavior: copy suggests selling course, bundling, offering module 1 free, or partner distribution.
  - Current behavior: only module expand/collapse exists; no download, preview, copy, save, or start controls.
  - Action type: missing controls.
  - Needs original comparison: yes.
  - Recommended exact fix: add actions such as `Preview Course`, `Copy Lead Magnet Link`, `Download Course Assets`, or `Enable White Label Course`, based on original behavior.
  - Files likely needing edits: `app/partner-resources/credit-repair-class/page.tsx`.
  - Focused test: `tests/partner-resources-credit-repair-class-actions.spec.ts` covering module expansion and any new CTA behavior.

- [ ] Attorney Review intake CTA
  - Location: `app/partner-resources/attorney-review/page.tsx`
  - Expected behavior: likely request attorney review or schedule/send intake.
  - Current behavior: page explicitly states backend intake or attorney scheduling is not connected. Only working control is `Back to Partner Resources`.
  - Action type: missing intake/scheduling control.
  - Needs original comparison: yes.
  - Recommended exact fix: add `Request Attorney Review` CTA only once a real intake route, scheduling link, or submission handler is known.
  - Files likely needing edits: `app/partner-resources/attorney-review/page.tsx`; possibly new attorney intake route/API.
  - Focused test: update `tests/partner-resources-attorney-review.spec.ts` to click `Request Attorney Review` and assert modal/form/external scheduler behavior.

## Recommended Focused Test Coverage

- [ ] Add `tests/help-community-partner-buttons-function.spec.ts` or split by page group.
- [ ] Verify topbar `Need Help?` expands help links.
- [ ] Verify `/help` expected behavior after original comparison.
- [ ] Verify `/community` expected behavior after original comparison.
- [ ] Click every Partner Resources overview card and assert destination route.
- [ ] Click each partner detail `Back to Partner Resources` button and assert URL.
- [ ] Verify community category filters change the visible feed.
- [ ] Verify community channel rows either navigate/filter after fix, or remove pointer styling if intentionally static.
- [ ] Verify `Dispute Outsourcing` plan CTAs perform real action.
- [ ] Verify `Save with Annual Plan` monthly/annual CTAs perform real action.
- [ ] Add provider/product/link tests after real partner URLs are supplied.

