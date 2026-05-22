# Leads / Affiliates / Get Customers Button Function Checklist

Scope: root app only at `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app\` was not inspected or edited. No app files, tests, commits, or fixes were changed.

Audit basis: code inspection of `app/leads/**`, `app/get-customers/**`, `app/affiliates/**`, `components/CDMLayout.tsx`, and the requested Playwright specs. I did not run the full suite.

## Route And Navigation Findings

- [x] `/leads` exists and is a full client-side leads manager.
- [x] `/leads/website-lead-form` exists and is a stateful form-builder preview page.
- [x] `/leads/affiliates` exists and is a functional affiliates manager.
- [x] `/leads/affiliate-website-form` exists and is a stateful affiliate form-builder preview page.
- [x] `/get-customers`, `/get-customers/start-run-grow`, `/get-customers/business-strategies`, and `/get-customers/get-customers` exist.
- [x] Extra relevant routes found: `/affiliates` and `/affiliates/website-form`.
- [ ] Broken route wiring: `components/CDMLayout.tsx` sends sidebar `Affiliates` to `/affiliates` and `Affiliate Website Form` to `/affiliates/website-form`, but those are stub pages. The implemented pages are `/leads/affiliates` and `/leads/affiliate-website-form`.

Recommended fix: update `components/CDMLayout.tsx` Leads/Affiliates nav items to point to `/leads/affiliates` and `/leads/affiliate-website-form`, or move the implemented pages to `/affiliates` and `/affiliates/website-form` and make `/leads/*` redirect consistently.

Focused test: update `tests/leads-affiliates-pages-smoke.spec.ts` to click the sidebar Leads/Affiliates group links and assert the full implemented content, not the stub copy.

## `/leads`

File: `app/leads/page.tsx`

### Working Buttons / Links / Controls

- [x] `Leads` top tab: current tab. Expected behavior: stay on current page. Current behavior: button has an `onClick`, but no action unless the tab is `Affiliates`. Type: tab/no navigation. Needs fix: no.
- [x] `Affiliates` top tab: expected behavior: navigate to affiliate manager. Current behavior: `router.push("/leads/affiliates")`. Type: navigates. Needs fix: no.
- [x] `Website Lead Form` subtab: expected behavior: open website lead form builder. Current behavior: `router.push("/leads/website-lead-form")`. Type: navigates. Needs fix: no.
- [x] `Import CSV`: expected behavior: open CSV import modal. Current behavior: `setShowImport(true)` opens modal. Type: opens modal. Needs fix: partial, see broken import submit below.
- [x] `Export CSV`: expected behavior: download current filtered leads. Current behavior: builds Blob from `filtered` and clicks generated anchor. Type: exports. Needs fix: no for basic export.
- [x] `+ Add Lead`: expected behavior: open add lead modal. Current behavior: resets editing/form and opens modal. Type: opens modal. Needs fix: no.
- [x] status stat cards `Total`, `New`, `Contacted`, `Qualified`, `Converted`, `Lost`: expected behavior: filter leads by status. Current behavior: updates `statusFilter` and resets page. Type: filters. Needs fix: no.
- [x] `Search leads...`: expected behavior: text filter. Current behavior: updates `search` and filters by name/contact/source/agent/tags/city/state. Type: filters. Needs fix: no.
- [x] `All Sources` select: expected behavior: source filter. Current behavior: updates `sourceFilter`. Type: filters. Needs fix: no.
- [x] `Sort: Date/A-Z/Status/Source/Score`: expected behavior: sort visible rows. Current behavior: updates `sortBy`; date relies on loaded order. Type: sorts. Needs fix: no.
- [x] date `From` and `To` inputs: expected behavior: date range filter. Current behavior: compares `created_at` strings. Type: filters. Needs fix: no.
- [x] `Table` / `Pipeline`: expected behavior: switch table and kanban views. Current behavior: updates `view`. Type: view toggle. Needs fix: no.
- [x] row checkbox and header checkbox: expected behavior: select one/all paged leads. Current behavior: updates `selected`. Type: selects. Needs fix: no.
- [x] row status select: expected behavior: update lead status. Current behavior: updates Supabase when possible and local state/local fallback. Type: saves/updates. Needs fix: no.
- [x] row edit icon / kanban `Edit`: expected behavior: open edit modal. Current behavior: loads lead into form and opens modal. Type: opens modal/edits. Needs fix: no.
- [x] row `Convert` / kanban `Convert`: expected behavior: create client and mark lead converted. Current behavior: inserts into `clients`, updates lead status, updates local state, then navigates to `/clients`. Type: saves/sends/navigates. Needs fix: maybe, see ambiguous.
- [x] row delete icon: expected behavior: open confirmation modal. Current behavior: sets `deleteTarget`. Type: opens modal. Needs fix: no.
- [x] add/edit modal `Cancel`: expected behavior: close modal and discard draft. Current behavior: closes modal, clears editing and form. Type: clears/closes. Needs fix: no.
- [x] add/edit modal `Add Lead` / `Save Changes`: expected behavior: save create/update. Current behavior: writes local state/localStorage and attempts Supabase insert/update. Type: submits/saves. Needs fix: no.
- [x] delete modal `Cancel`: expected behavior: close confirmation. Current behavior: clears `deleteTarget`. Type: closes. Needs fix: no.
- [x] delete modal `Delete`: expected behavior: remove lead. Current behavior: attempts Supabase delete and removes from local state/localStorage. Type: deletes. Needs fix: no.
- [x] import modal `Click to upload CSV file`: expected behavior: open file picker and read CSV into textarea. Current behavior: hidden file input click and `FileReader` populate `importText`. Type: imports/loads file into form. Needs fix: no.
- [x] import modal `Cancel`: expected behavior: close import modal and clear text. Current behavior: closes and clears. Type: clears/closes. Needs fix: no.
- [x] bulk toolbar `Send Email`: expected behavior: open bulk email modal. Current behavior: opens modal when at least one row is selected. Type: opens modal. Needs fix: no.
- [x] bulk email modal `Cancel`: expected behavior: close modal. Current behavior: closes modal. Type: closes. Needs fix: no.
- [x] bulk email modal `Send Email`: expected behavior: send email to selected leads with email addresses. Current behavior: posts each target to `/api/send-email`, closes modal, alerts result. Type: sends. Needs fix: maybe, see ambiguous.
- [x] bulk toolbar `Export`: expected behavior: export selected leads or current filtered set. Current behavior: exports the full filtered set, not selected only. Type: exports. Needs fix: maybe, see ambiguous.
- [x] bulk toolbar `Update Status`: expected behavior: open status menu. Current behavior: toggles dropdown. Type: opens menu. Needs fix: no.
- [x] bulk status menu `new/contacted/qualified/converted/lost`: expected behavior: update selected leads. Current behavior: attempts Supabase update and updates local state/localStorage. Type: saves/updates. Needs fix: no.
- [x] bulk toolbar `Delete`: expected behavior: remove selected leads. Current behavior: deletes selected immediately without confirmation. Type: deletes. Needs fix: maybe, see ambiguous.
- [x] bulk toolbar `Clear`: expected behavior: clear selection. Current behavior: clears `selected`. Type: clears. Needs fix: no.
- [x] pagination `Rows per page`, `<<`, `<`, `>`, `>>`: expected behavior: change page size and page. Current behavior: updates `pageSize`/`page` with disabled states. Type: pagination. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] `Client Portal`: expected behavior unclear from visible text, likely show client portal referral leads. Current behavior: no action except the shared `onClick` branch that only handles `Website Lead Form`. Type: does nothing. Needs real fix: yes.
- [ ] `Client Referral Leads`: expected behavior likely filter/show referral leads. Current behavior: does nothing. Type: does nothing. Needs real fix: yes.
- [ ] `Current`: expected behavior likely filter current leads. Current behavior: does nothing. Type: does nothing. Needs real fix: yes.
- [ ] `Archive`: expected behavior likely show archived leads. Current behavior: does nothing. Type: does nothing. Needs real fix: yes.
- [ ] `Move Archive`: expected behavior likely configure auto-moving website leads to archive. Current behavior: button has no `onClick`. Type: does nothing. Needs real fix: yes.
- [ ] import modal `Import`: expected behavior: persist pasted/uploaded CSV leads and show confirmation/fallback. Current behavior: parses by naive comma splitting, inserts only to Supabase, closes/reloads on `.then()` even when insert fails, has no local fallback, no notice/error handling, and blank CSV still silently closes. Type: submits/imports but unreliable/non-observable. Needs real fix: yes.

Recommended fixes:

- `Client Portal`: wire to the intended route if it exists, or remove/disable until implemented.
- `Client Referral Leads`: add a source/type filter and visual active state, or route to a dedicated referral leads page.
- `Current` / `Archive`: add archived/current state to leads and implement filters, or remove the tabs.
- `Move Archive`: either implement the auto-archive setting with persisted account config or remove this control.
- `Import`: validate non-empty CSV, use a real CSV parser, persist locally when Supabase fails, show success/error notice, and keep the modal open on failure.

Files likely needing edits:

- `app/leads/page.tsx`
- Possibly `lib/supabase-browser.ts` only if import/save helpers are centralized later.
- Possible database/account config layer if `Move Archive` becomes a persisted setting.

Focused test to create/update:

- Add `tests/leads-affiliates-behavior.spec.ts` coverage for `Client Referral Leads`, `Current`, `Archive`, `Move Archive`, and a CSV import success/failure path that asserts visible status and row creation.
- Extend `tests/workflow-interactions-smoke.spec.ts` beyond opening the import modal: paste valid CSV, click `Import`, and assert the imported lead appears or a visible failure message remains.

### Ambiguous Buttons Needing Original Comparison

- [ ] bulk `Export`: visible in a selected toolbar, but exports all filtered leads rather than selected leads. Compare original CDM behavior to decide whether it should export selected only.
- [ ] bulk `Delete`: deletes immediately without a confirmation modal. Compare original expected safety behavior.
- [ ] row `Convert`: creates a client and navigates to `/clients`; if Supabase insert fails it still navigates after showing an error. Compare original behavior for failed conversion and whether local client fallback is expected.
- [ ] bulk email `Send Email`: sends via `/api/send-email` and alerts, but there is no visible in-app status or persistent audit trail. Compare original behavior for email send workflow.

## `/leads/website-lead-form`

File: `app/leads/website-lead-form/page.tsx`

### Working Controls

- [x] `Preview`: expected behavior: open preview modal. Current behavior: `setShowPreview(true)`. Type: previews/opens modal. Needs fix: no.
- [x] preview modal `x`: expected behavior: close preview. Current behavior: `setShowPreview(false)`. Type: closes. Needs fix: no.
- [x] `Short Form`, `Wide Form`, `Website`, `Affiliate` radio buttons: expected behavior: select style. Current behavior: updates `formStyle`; no visible structural effect beyond selected styling. Type: selects. Needs fix: maybe, see ambiguous.
- [x] required field checkboxes: expected behavior: toggle required markers. Current behavior: toggles `required`; preview shows `*` for base `FORM_FIELDS`. Type: toggles/previews. Needs fix: no.
- [x] form field checkboxes: expected behavior: show/hide fields in preview. Current behavior: toggles `fields`; preview only renders `FORM_FIELDS`, so extra added labels are toggle-only unless also in `FORM_FIELDS`. Type: toggles/previews partially. Needs fix: maybe, see ambiguous.
- [x] `Form Title`, `Custom Subtitle`, `Background Color`, `Button Color`, `Font Size`, `Font Family`, `Button Text`: expected behavior: update preview. Current behavior: state updates and preview reflects most values. Type: edits/previews. Needs fix: no.
- [x] inline preview submit button text: expected behavior: visual preview only. Current behavior: disabled. Type: preview. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] `Publish`: expected behavior: publish/generate/embed the website lead form. Current behavior: no `onClick`, no submit/action. Type: does nothing. Needs real fix: yes.
- [ ] `Save`: expected behavior: persist form builder settings. Current behavior: no `onClick`, no submit/action. Type: does nothing. Needs real fix: yes.
- [ ] preview modal submit button (`Submit` or custom `Button Text`): expected behavior ambiguous, likely demo submit or disabled preview. Current behavior: clickable-looking button with no `onClick` and not disabled in the modal. Type: does nothing. Needs real fix: yes if intended interactive preview.

Recommended fixes:

- Add persisted form settings save action with visible status.
- Add publish/embed generation behavior or mark as unavailable until implemented.
- In preview modal, either disable the submit button visibly or wire it to a test submission/success state.

Files likely needing edits:

- `app/leads/website-lead-form/page.tsx`
- Potential shared form-builder component if deduplicating with affiliate form.
- Potential Supabase table/config layer for persisted form settings.

Focused test to create/update:

- Add a form-builder behavior test: change title/button color/field visibility, click `Preview`, assert modal reflects changes, click `Save`, assert visible saved status, reload and assert persistence. Add `Publish` assertion for visible embed/published status.

### Ambiguous Buttons Needing Original Comparison

- [ ] form style `Short Form` / `Wide Form` / `Website` / `Affiliate`: currently style selection only. Compare original to know whether layout/embed output should change.
- [ ] extra field checkboxes `Email Id`, `Phone (Mobile)`, `Phone (Home)`, `Phone (Work)`, `Message`, `How did you hear about us`: state toggles, but preview is based on `FORM_FIELDS` only. Compare original field list behavior.

## `/leads/affiliates`

File: `app/leads/affiliates/page.tsx`

### Working Controls

- [x] `+ Add New`: expected behavior: open add affiliate modal. Current behavior: `setShowForm(true)`. Type: opens modal. Needs fix: no.
- [x] `Manage Affiliate`: expected behavior: show affiliates table and filter tabs. Current behavior: sets `mainTab`. Type: tab. Needs fix: no.
- [x] `Documents & Commissions`: expected behavior: show documents/commissions content. Current behavior: sets `mainTab` and shows static empty state. Type: tab. Needs fix: maybe, see ambiguous.
- [x] filter tabs `Active`, `Lead`, `Inactive`, `Pending Messages`, `Pending Referrals`: expected behavior: filter affiliate rows by status. Current behavior: sets `filterTab`; table filters exact status. Type: filters. Needs fix: no, but pending statuses cannot be created from current modal.
- [x] row `Remove`: expected behavior: remove affiliate. Current behavior: local affiliate removes from localStorage/state; remote affiliate requires account context and deletes from Supabase. Type: deletes. Needs fix: maybe, see ambiguous.
- [x] modal fields `Name`, `Company Name`, `Phone`, `Email`, `Referral Code`, `Status`, `Notes`: expected behavior: edit draft. Current behavior: updates `form` state. Type: edits. Needs fix: no.
- [x] modal `Cancel`: expected behavior: close modal. Current behavior: closes modal. Type: closes. Needs fix: no.
- [x] modal `Add Affiliate`: expected behavior: create affiliate. Current behavior: requires `full_name` and `email`, inserts to Supabase or local fallback, then closes and shows notice. Type: submits/saves. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] None strictly non-functional in implemented `/leads/affiliates`.

Recommended fixes:

- Add edit and delete confirmation if original expected those behaviors.
- Add status options for `Pending Messages` and `Pending Referrals`, or remove those filters if they are not valid statuses.
- Implement real `Documents & Commissions` records if original page has this module.

Files likely needing edits:

- `app/leads/affiliates/page.tsx`

Focused test to create/update:

- Extend `tests/leads-affiliates-behavior.spec.ts` to cover filter tabs, `Remove`, and the `Documents & Commissions` tab expected empty or real state.

### Ambiguous Buttons Needing Original Comparison

- [ ] `Documents & Commissions`: currently just an empty state. Compare original to determine if documents/commissions CRUD should exist.
- [ ] `Remove`: no confirmation and no edit affordance. Compare original affiliate management workflow.
- [ ] `Pending Messages` / `Pending Referrals`: visible filters but add modal cannot create those statuses. Compare original status model.

## `/leads/affiliate-website-form`

File: `app/leads/affiliate-website-form/page.tsx`

### Working Controls

- [x] `Preview`: opens preview modal. Type: previews/opens modal. Needs fix: no.
- [x] preview modal `x`: closes preview. Type: closes. Needs fix: no.
- [x] `Website` / `Affiliate` radio buttons: updates selected form style. Type: selects. Needs fix: maybe, see ambiguous.
- [x] required field checkboxes: toggles required markers. Type: toggles/previews. Needs fix: no.
- [x] form field checkboxes: toggles field state; base preview renders only `FORM_FIELDS`. Type: toggles/previews partially. Needs fix: maybe, see ambiguous.
- [x] `Custom Title`, `Company Name`, `Background Color`, `Button Color`, `Font Size`, `Font Family`, `Button Text`: update preview state. Type: edits/previews. Needs fix: no.
- [x] inline preview submit button text: disabled preview. Type: preview. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] `Publish`: no handler. Type: does nothing. Needs real fix: yes.
- [ ] `Save`: no handler. Type: does nothing. Needs real fix: yes.
- [ ] preview modal submit button (`Submit Referral` or custom `Button Text`): clickable-looking, no handler. Type: does nothing. Needs real fix: yes if intended interactive preview.

Recommended fixes:

- Same as website lead form: implement persisted settings, publish/embed generation, and a visibly disabled or functional preview submit.

Files likely needing edits:

- `app/leads/affiliate-website-form/page.tsx`
- Potential shared form-builder component/config persistence.

Focused test to create/update:

- Add affiliate form-builder behavior coverage for `Save`, `Publish`, modal preview, and field visibility persistence.

### Ambiguous Buttons Needing Original Comparison

- [ ] style radio buttons and extra fields `Zip Code`, `Email Id`, `Promotional Methods`, `Comment`: current behavior may not match original output/preview rules.

## `/affiliates`

File: `app/affiliates/page.tsx`

### Working Controls

- [x] Page loads with heading and description only. No page-local buttons/forms/tabs/actions.

### Broken / Non-Functional Buttons

- [ ] Sidebar `Affiliates` link routes here, but this page is only a stub and does not manage affiliates. Type: navigates to wrong/incomplete destination. Needs real fix: yes.

Recommended fix: route sidebar to `/leads/affiliates`, redirect `/affiliates` to `/leads/affiliates`, or move the full affiliate manager here.

Files likely needing edits:

- `components/CDMLayout.tsx`
- `app/affiliates/page.tsx` if using redirect or moving implementation.

Focused test:

- Click sidebar `Affiliates` and assert `+ Add New`, affiliate table headers, and filter tabs are visible.

## `/affiliates/website-form`

File: `app/affiliates/website-form/page.tsx`

### Working Controls

- [x] Page loads with heading and description only. No page-local buttons/forms/tabs/actions.

### Broken / Non-Functional Buttons

- [ ] Sidebar `Affiliate Website Form` link routes here, but this page is only a stub and does not expose Preview/Publish/Save or builder controls. Type: navigates to wrong/incomplete destination. Needs real fix: yes.

Recommended fix: route sidebar to `/leads/affiliate-website-form`, redirect `/affiliates/website-form` to `/leads/affiliate-website-form`, or move the full form-builder here.

Files likely needing edits:

- `components/CDMLayout.tsx`
- `app/affiliates/website-form/page.tsx` if using redirect or moving implementation.

Focused test:

- Click sidebar `Affiliate Website Form` and assert `Preview`, `Publish`, `Save`, required fields, and preview section are visible.

## `/get-customers`

File: `app/get-customers/page.tsx`

### Working Controls

- [x] card `Start, Run & Grow` / `Explore ->`: expected behavior: navigate to `/get-customers/start-run-grow`. Current behavior: card `onClick` uses `router.push`. Type: navigates. Needs fix: no.
- [x] card `Business Strategies` / `Explore ->`: expected behavior: navigate to `/get-customers/business-strategies`. Current behavior: card `onClick` uses `router.push`. Type: navigates. Needs fix: no.
- [x] card `Get Customers` / `Explore ->`: expected behavior: navigate to `/get-customers/get-customers`. Current behavior: card `onClick` uses `router.push`. Type: navigates. Needs fix: no.
- [x] `View Partner Resources ->`: expected behavior: navigate to partner resources. Current behavior: `router.push("/partner-resources")`. Type: navigates. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] None found on this route.

Focused test:

- Update `tests/get-customers-pages-smoke.spec.ts` to click each card and CTA, asserting final URL and destination heading.

## `/get-customers/start-run-grow`

File: `app/get-customers/start-run-grow/page.tsx`

### Working Controls

- [x] `Back to Get Customers`: expected behavior: navigate to `/get-customers`. Current behavior: `router.push("/get-customers")`. Type: navigates. Needs fix: no.
- [x] `Next: Business Strategies ->`: expected behavior: navigate to `/get-customers/business-strategies`. Current behavior: `router.push("/get-customers/business-strategies")`. Type: navigates. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] None found.

Focused test:

- Click both buttons and assert URL/heading.

## `/get-customers/business-strategies`

File: `app/get-customers/business-strategies/page.tsx`

### Working Controls

- [x] `Back to Get Customers`: expected behavior: navigate to `/get-customers`. Current behavior: `router.push("/get-customers")`. Type: navigates. Needs fix: no.
- [x] `View Client Acquisition ->`: expected behavior: navigate to `/get-customers/get-customers`. Current behavior: `router.push("/get-customers/get-customers")`. Type: navigates. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] None found.

Focused test:

- Click both buttons and assert URL/heading.

## `/get-customers/get-customers`

File: `app/get-customers/get-customers/page.tsx`

### Working Controls

- [x] `Back to Get Customers`: expected behavior: navigate to `/get-customers`. Current behavior: `router.push("/get-customers")`. Type: navigates. Needs fix: no.
- [x] lead source list items `Referral Network`, `Social Media Organic`, `Paid Facebook / Instagram Ads`, `Google Ads & SEO`: expected behavior: switch displayed metrics/action steps. Current behavior: `setActiveSource(i)` updates detail panel. Type: tabs/filters. Needs fix: no.

### Broken / Non-Functional Buttons

- [ ] None found.

Focused test:

- Click each lead source and assert the detail panel metrics/action steps update.

## Shared `CDMLayout` Relevant Navigation

File: `components/CDMLayout.tsx`

### Working Links / Controls

- [x] Sidebar group `Leads/Affiliates`: expected behavior: expand/collapse group. Current behavior: `toggleExpand(group.key)`. Type: opens/collapses menu. Needs fix: no.
- [x] Sidebar `Leads`: expected behavior: navigate to `/leads`. Current behavior: `Link href="/leads"`. Type: navigates. Needs fix: no.
- [x] Sidebar `Website Lead Form`: expected behavior: navigate to website lead form builder. Current behavior: `Link href="/leads/website-lead-form"`. Type: navigates. Needs fix: no.
- [x] Sidebar single `Website Lead Nurturing`: expected behavior: navigate to website lead form. Current behavior: `Link href="/leads/website-lead-form"`. Type: navigates. Needs fix: no.
- [x] Sidebar group `Get Customers`: expected behavior: expand/collapse group. Current behavior: `toggleExpand(group.key)`. Type: opens/collapses menu. Needs fix: no.
- [x] Sidebar `Get Customers`: expected behavior: navigate to acquisition playbook. Current behavior: `Link href="/get-customers/get-customers"`. Type: navigates. Needs fix: no.
- [x] Sidebar `Start - Run - Grow`: expected behavior: navigate to `/get-customers/start-run-grow`. Current behavior: correct `Link`. Type: navigates. Needs fix: no.
- [x] Sidebar `Business Strategies`: expected behavior: navigate to `/get-customers/business-strategies`. Current behavior: correct `Link`. Type: navigates. Needs fix: no.

### Broken / Non-Functional Links

- [ ] Sidebar `Affiliates`: expected behavior: open implemented affiliate manager. Current behavior: `href="/affiliates"` stub page. Type: wrong navigation/incomplete. Needs real fix: yes.
- [ ] Sidebar `Affiliate Website Form`: expected behavior: open implemented affiliate form builder. Current behavior: `href="/affiliates/website-form"` stub page. Type: wrong navigation/incomplete. Needs real fix: yes.

Recommended exact fix:

- Change `components/CDMLayout.tsx` nav entries:
  - `Affiliates` from `/affiliates` to `/leads/affiliates`
  - `Affiliate Website Form` from `/affiliates/website-form` to `/leads/affiliate-website-form`
- Optionally add redirects from `/affiliates` and `/affiliates/website-form` to preserve old URLs.

Focused test:

- A sidebar navigation test that opens `Leads/Affiliates`, clicks each child, and verifies the destination is not a stub.

## Existing Test Coverage Observed

- [x] `tests/leads-affiliates-pages-smoke.spec.ts` checks visibility of Leads, implemented `/leads/*` pages, and stub `/affiliates/*` pages. It does not catch the sidebar mismatch.
- [x] `tests/leads-affiliates-behavior.spec.ts` covers add/edit/status/delete lead and add affiliate basics.
- [x] `tests/get-customers-pages-smoke.spec.ts` verifies page content and button visibility only; it does not click navigation cards/buttons.
- [x] `tests/manual-workflow-audit.spec.ts` covers `/leads` add/search/import-export visibility, but not form builder Save/Publish, affiliate routes, or get-customers routes.
- [x] `tests/workflow-interactions-smoke.spec.ts` opens the `/leads` import modal but does not complete an import.
- [x] `tests/operational-pages-smoke.spec.ts` is not materially relevant to these routes except generic app smoke patterns.

## Highest Priority Fix List

1. [ ] Fix sidebar route targets for `Affiliates` and `Affiliate Website Form` in `components/CDMLayout.tsx`.
2. [ ] Implement or remove no-op `/leads` controls: `Client Portal`, `Client Referral Leads`, `Current`, `Archive`, `Move Archive`.
3. [ ] Make `/leads` CSV `Import` actually reliable and observable: validation, parser, Supabase error handling, local fallback or clear failure, visible notice.
4. [ ] Implement `Save` and `Publish` on both form-builder pages.
5. [ ] Decide original behavior for selected bulk `Export`, immediate bulk `Delete`, affiliate `Documents & Commissions`, and form-builder style/extra-field controls.
