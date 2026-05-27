# Leads / Affiliates / Website Lead Form Button Function Checklist

Audit scope: root app only at `C:\Users\LESLI\disputepilot-app`.

Nested folder excluded: `C:\Users\LESLI\disputepilot-app\disputepilot-app`.

No fixes applied. No app files changed. No tests changed. No full suite run.

Inspected files:
- `app/leads/page.tsx`
- `app/leads/website-lead-form/page.tsx`
- `app/leads/affiliate-website-form/page.tsx`
- `app/leads/affiliates/page.tsx`
- `app/affiliates/page.tsx`
- `app/affiliates/website-form/page.tsx`
- `components/CDMLayout.tsx`
- `app/api/send-email/route.ts`
- Existing lead/affiliate related Playwright specs listed in the request

## Route Map

- [x] `/leads` is implemented by `app/leads/page.tsx`.
- [x] `/leads/website-lead-form` is implemented by `app/leads/website-lead-form/page.tsx`.
- [x] `/leads/affiliate-website-form` is implemented by `app/leads/affiliate-website-form/page.tsx`.
- [x] `/leads/affiliates` is implemented by `app/leads/affiliates/page.tsx`.
- [x] `/affiliates` redirects to `/leads/affiliates`.
- [x] `/affiliates/website-form` redirects to `/leads/affiliate-website-form`.
- [x] `components/CDMLayout.tsx` sidebar links route to `/leads`, `/leads/website-lead-form`, `/leads/affiliates`, and `/leads/affiliate-website-form`.

## Working Buttons / Links

### `/leads`

- [x] `Leads` tab
  - Expected: stay on Leads tab.
  - Current: no-op when already on `/leads`; active styling remains on Leads.
  - Type: does nothing intentionally.
  - Needs fix: no.

- [x] `Affiliates` tab
  - Expected: navigate to affiliate management.
  - Current: `router.push("/leads/affiliates")`.
  - Type: navigates.
  - Needs fix: no.

- [x] `Website Lead Form`
  - Expected: open lead form builder.
  - Current: `router.push("/leads/website-lead-form")`.
  - Type: navigates.
  - Needs fix: no.

- [x] `Leads`, `Client Portal`, `Client Referral Leads`, `Current`, `Archive`
  - Expected: filter lead list by section/context.
  - Current: calls `setLeadSection`, resets page and selected rows, updates notice, and filters in-memory leads.
  - Type: filters.
  - Needs fix: no for current local behavior.

- [x] `Move Archive`
  - Expected: move visible leads into archive.
  - Current: writes archived IDs to `localStorage`, marks visible leads archived in local state, and switches to Archive.
  - Type: archives/moves locally.
  - Needs fix: no for local behavior; see ambiguous production persistence item.

- [x] `Auto-archive On/Off`
  - Expected: toggle auto-archive setting.
  - Current: stores boolean in `localStorage` and shows status message.
  - Type: toggles local setting.
  - Needs fix: no for local toggle; see broken automation item.

- [x] `Import CSV`
  - Expected: open CSV import modal.
  - Current: opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] `Click to upload CSV file`
  - Expected: open file picker and read CSV file.
  - Current: triggers hidden file input and reads selected file into textarea via `FileReader`.
  - Type: imports file content into modal.
  - Needs fix: no.

- [x] `Import`
  - Expected: parse CSV and create lead rows.
  - Current: validates text, parses header/no-header CSV, adds rows to state/localStorage, attempts Supabase insert, reports local fallback on remote failure.
  - Type: imports/creates.
  - Needs fix: no.

- [x] Import modal `Cancel`
  - Expected: close import modal and clear input/errors.
  - Current: closes and resets `importText`/`importError`.
  - Type: clears/closes.
  - Needs fix: no.

- [x] `Export CSV`
  - Expected: download visible/filtered leads.
  - Current: creates CSV blob and downloads `leads.csv`.
  - Type: exports.
  - Needs fix: no.

- [x] `+ Add Lead`
  - Expected: open create lead modal.
  - Current: clears editing/form state and opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] Add Lead modal `Add Lead`
  - Expected: create a lead.
  - Current: requires first and last name, inserts into local state/localStorage fallback, attempts Supabase insert.
  - Type: creates/saves.
  - Needs fix: no.

- [x] Add/Edit Lead modal `Cancel`
  - Expected: close modal and discard current modal state.
  - Current: closes modal, clears editing, resets form.
  - Type: clears/closes.
  - Needs fix: no.

- [x] Row edit icon
  - Expected: open edit lead modal.
  - Current: fills form from selected row and opens modal.
  - Type: edits/opens modal.
  - Needs fix: no.

- [x] Edit Lead modal `Save Changes`
  - Expected: update lead.
  - Current: updates local state/localStorage fallback and attempts Supabase update.
  - Type: saves/edits.
  - Needs fix: no.

- [x] Row status dropdown
  - Expected: update lead status.
  - Current: updates local state/localStorage fallback and attempts Supabase update.
  - Type: edits/assigns status.
  - Needs fix: no.

- [x] Row delete icon
  - Expected: ask for delete confirmation.
  - Current: opens `Delete Lead?` modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] Delete modal `Delete`
  - Expected: remove lead.
  - Current: attempts Supabase delete, removes locally even if remote fails.
  - Type: deletes.
  - Needs fix: no.

- [x] Delete modal `Cancel`
  - Expected: close confirmation.
  - Current: clears `deleteTarget`.
  - Type: closes modal.
  - Needs fix: no.

- [x] Search input `Search leads...`
  - Expected: filter lead rows by query.
  - Current: filters name, email, phone, source, assigned agent, tags, city, and state.
  - Type: searches/filters.
  - Needs fix: no.

- [x] `All Sources` dropdown
  - Expected: filter by source.
  - Current: filters in-memory leads by exact `source`.
  - Type: filters.
  - Needs fix: no.

- [x] `Sort: Date`, `Sort: A-Z`, `Sort: Status`, `Sort: Source`, `Sort: Score`
  - Expected: sort visible leads.
  - Current: sorts filtered array; date relies on loaded order from Supabase/local merge.
  - Type: sorts.
  - Needs fix: no.

- [x] `From date` and `To date`
  - Expected: date-range filter.
  - Current: filters by `created_at`.
  - Type: filters.
  - Needs fix: no.

- [x] `Table` / `Pipeline`
  - Expected: switch list view.
  - Current: toggles table and kanban views.
  - Type: changes view.
  - Needs fix: no.

- [x] Stat cards `Total`, `New`, `Contacted`, `Qualified`, `Converted`, `Lost`
  - Expected: filter by status.
  - Current: updates `statusFilter`.
  - Type: filters.
  - Needs fix: no.

- [x] Table row checkbox and header checkbox
  - Expected: select one/all visible page rows.
  - Current: toggles selected set.
  - Type: selects.
  - Needs fix: no.

- [x] Bulk `Export`
  - Expected: download selected leads.
  - Current: downloads `selected-leads.csv` and shows notice.
  - Type: exports.
  - Needs fix: no.

- [x] Bulk `Update Status` and status menu items
  - Expected: bulk change selected lead statuses.
  - Current: opens status menu; selected status updates local state/localStorage fallback and attempts Supabase update.
  - Type: opens menu/edits.
  - Needs fix: no.

- [x] Bulk `Delete`
  - Expected: confirm selected lead deletion.
  - Current: opens `Delete Selected Leads?` modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] Bulk delete modal `Delete Selected`
  - Expected: delete selected rows.
  - Current: attempts Supabase delete, removes from local state/localStorage fallback.
  - Type: deletes.
  - Needs fix: no.

- [x] Bulk delete modal `Cancel`
  - Expected: close modal without deleting.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] Bulk `Clear`
  - Expected: clear selected rows.
  - Current: resets selected set.
  - Type: clears.
  - Needs fix: no.

- [x] Bulk `Send Email`
  - Expected: open bulk email modal for selected leads.
  - Current: opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] Bulk email modal `Cancel`
  - Expected: close modal.
  - Current: closes modal without clearing subject/body.
  - Type: closes modal.
  - Needs fix: optional only; not broken.

- [x] Bulk email modal `Send Email`
  - Expected: send email to selected leads with email addresses.
  - Current: posts each target to `/api/send-email`; the API requires business auth and `RESEND_API_KEY`.
  - Type: sends.
  - Needs fix: no if auth and email service are configured; see ambiguous auth/config item.

- [x] Pagination `Rows per page`, `<<`, `<`, `>`, `>>`
  - Expected: change page size and navigate pages.
  - Current: updates page/page size; disabled at boundaries.
  - Type: paginates/filters visible rows.
  - Needs fix: no.

- [x] Kanban card `Edit`
  - Expected: open edit modal.
  - Current: calls `openEdit`.
  - Type: edits/opens modal.
  - Needs fix: no.

- [x] Kanban card `Convert`
  - Expected: convert lead to client.
  - Current: calls `convertToClient`.
  - Type: converts.
  - Needs fix: no for happy path; see ambiguous/error handling item.

### `/leads/website-lead-form`

- [x] `Preview`
  - Expected: open form preview modal.
  - Current: opens modal.
  - Type: previews/opens modal.
  - Needs fix: no.

- [x] Preview modal close `x`
  - Expected: close preview modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] Preview modal submit button, default `Submit` or custom button text
  - Expected: preview-only submission feedback.
  - Current: shows `Preview submission captured locally. No lead was created from preview mode.`
  - Type: preview/local status.
  - Needs fix: no if preview is intentionally non-submitting.

- [x] `Save`
  - Expected: save builder settings.
  - Current: saves settings to `localStorage`.
  - Type: saves locally.
  - Needs fix: no for local builder; see broken production persistence item.

- [x] `Publish`
  - Expected: publish website lead form.
  - Current: writes published flag/settings to `localStorage`, shows embed snippet and placeholder URL.
  - Type: publishes locally.
  - Needs fix: yes for real public form publishing.

- [x] `Copy Embed`
  - Expected: copy embed snippet.
  - Current: appears after publish; copies `<script src="/embed/website-lead-form.js" ...>` or shows fallback status if clipboard is unavailable.
  - Type: copies.
  - Needs fix: yes because copied script target does not exist.

- [x] Form style radio buttons `Short Form`, `Wide Form`, `Website`, `Affiliate`
  - Expected: change preview style/type.
  - Current: updates `formStyle`; no visible layout difference in preview beyond saved setting.
  - Type: changes local setting.
  - Needs fix: ambiguous; compare original behavior.

- [x] Required field checkboxes `First Name`, `Last Name`, `Phone`, `Email`
  - Expected: mark fields required.
  - Current: toggles required markers in preview.
  - Type: changes local setting/preview.
  - Needs fix: no for preview; real public form needs validation.

- [x] Field visibility checkboxes `First Name`, `Last Name`, `Address`, `City`, `State`, `Zip`, `Phone`, `Email`, `Comments`, `Email Id`, `Phone (Mobile)`, `Phone (Home)`, `Phone (Work)`, `Message`, `How did you hear about us`
  - Expected: show/hide fields.
  - Current: toggles fields in preview.
  - Type: filters/changes local setting.
  - Needs fix: no for preview; real public form needs to consume settings.

- [x] Inputs `Form Title`, `Custom Subtitle`, `Button Text`
  - Expected: update builder settings and preview.
  - Current: updates local state and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

- [x] Background and button color swatches
  - Expected: change colors.
  - Current: updates preview and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

- [x] `Font Size` and `Font Family`
  - Expected: update preview typography.
  - Current: updates preview and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

### `/leads/affiliate-website-form`

- [x] `Preview`
  - Expected: open affiliate form preview modal.
  - Current: opens modal.
  - Type: previews/opens modal.
  - Needs fix: no.

- [x] Preview modal close `x`
  - Expected: close preview modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] Preview modal submit button, default `Submit Referral` or custom button text
  - Expected: preview-only referral feedback.
  - Current: shows `Preview referral captured locally. No affiliate lead was created from preview mode.`
  - Type: preview/local status.
  - Needs fix: no if preview is intentionally non-submitting.

- [x] `Save`
  - Expected: save affiliate form builder settings.
  - Current: saves settings to `localStorage`.
  - Type: saves locally.
  - Needs fix: no for local builder; see broken production persistence item.

- [x] `Publish`
  - Expected: publish affiliate website form.
  - Current: writes published flag/settings to `localStorage`, shows embed snippet and placeholder URL.
  - Type: publishes locally.
  - Needs fix: yes for real public form publishing.

- [x] Form style radio buttons `Website`, `Affiliate`
  - Expected: change form style/type.
  - Current: updates `formStyle`; limited visible difference.
  - Type: changes local setting.
  - Needs fix: ambiguous; compare original behavior.

- [x] Required field checkboxes `First Name`, `Last Name`, `Phone`, `Email`
  - Expected: mark fields required.
  - Current: toggles required markers in preview.
  - Type: changes local setting/preview.
  - Needs fix: no for preview; real public form needs validation.

- [x] Field visibility checkboxes `First Name`, `Last Name`, `Address`, `City`, `State`, `Zip`, `Phone`, `Email`, `Comments`, `Zip Code`, `Email Id`, `Promotional Methods`, `Comment`
  - Expected: show/hide fields.
  - Current: toggles fields in preview.
  - Type: filters/changes local setting.
  - Needs fix: no for preview; real public form needs to consume settings.

- [x] Inputs `Custom Title`, `Company Name`, `Button Text`
  - Expected: update builder settings and preview.
  - Current: updates local state and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

- [x] Background and button color swatches
  - Expected: change colors.
  - Current: updates preview and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

- [x] `Font Size` and `Font Family`
  - Expected: update preview typography.
  - Current: updates preview and persists on Save/Publish.
  - Type: edits local settings.
  - Needs fix: no for local builder.

### `/leads/affiliates` and `/affiliates`

- [x] `/affiliates`
  - Expected: root alias for affiliates.
  - Current: redirects to `/leads/affiliates`.
  - Type: navigates/redirects.
  - Needs fix: no.

- [x] `+ Add New`
  - Expected: open Add New Affiliate modal.
  - Current: opens modal.
  - Type: opens modal.
  - Needs fix: no.

- [x] Add New Affiliate modal `Add Affiliate`
  - Expected: create affiliate.
  - Current: requires name and email, attempts Supabase insert, falls back to localStorage/local state.
  - Type: creates/saves.
  - Needs fix: no.

- [x] Add New Affiliate modal `Cancel`
  - Expected: close modal.
  - Current: closes modal.
  - Type: closes modal.
  - Needs fix: no.

- [x] `Manage Affiliate`
  - Expected: show affiliate list.
  - Current: sets `mainTab` to `Manage Affiliate`.
  - Type: filters/changes tab.
  - Needs fix: no.

- [x] `Documents & Commissions`
  - Expected: show affiliate documents and commissions.
  - Current: switches tab and displays empty placeholder: `No documents or commission records yet.`
  - Type: changes tab.
  - Needs fix: yes if documents/commission management is expected.

- [x] Filter tabs `Active`, `Lead`, `Inactive`, `Pending Messages`, `Pending Referrals`
  - Expected: filter affiliate table by status.
  - Current: filters in-memory affiliates by exact status.
  - Type: filters.
  - Needs fix: no for filtering.

- [x] Row `Remove`
  - Expected: remove affiliate.
  - Current: local affiliates are removed from localStorage/state; remote affiliates require account context and then Supabase delete.
  - Type: deletes.
  - Needs fix: ambiguous; no confirmation.

### `/affiliates/website-form`

- [x] `/affiliates/website-form`
  - Expected: root alias for affiliate website form.
  - Current: redirects to `/leads/affiliate-website-form`.
  - Type: navigates/redirects.
  - Needs fix: no.

### Sidebar Links

- [x] `Leads`
  - Expected: route to leads.
  - Current: `href="/leads"`.
  - Type: navigates.
  - Needs fix: no.

- [x] `Website Lead Form`
  - Expected: route to website lead form builder.
  - Current: `href="/leads/website-lead-form"`.
  - Type: navigates.
  - Needs fix: no.

- [x] `Affiliates`
  - Expected: route to affiliate management.
  - Current: `href="/leads/affiliates"`.
  - Type: navigates.
  - Needs fix: no.

- [x] `Affiliate Website Form`
  - Expected: route to affiliate form builder.
  - Current: `href="/leads/affiliate-website-form"`.
  - Type: navigates.
  - Needs fix: no.

## Broken / Non-Functional Items Needing Real Fix

- [ ] Website Lead Form `Publish`
  - Current behavior: only writes settings and `published` flag to `localStorage`; UI explicitly says `Local placeholder public URL only: /public/forms/website-lead-form. No public backend route is created here.`
  - Expected behavior: create a real public/intake form configuration that can be loaded outside the admin UI.
  - Exact fix: add persisted form settings in Supabase or an account-scoped API route; create public render route or script endpoint; publish should write server-side settings and return a real URL/snippet.
  - Files likely needing edits: `app/leads/website-lead-form/page.tsx`, new `app/api/...` form settings route, new public form route or script route, Supabase schema/migration if not present.
  - Focused test: update/create `tests/leads-form-builders-behavior.spec.ts` to assert publish creates a real reachable public URL/script instead of only a placeholder.

- [ ] Website Lead Form `Copy Embed`
  - Current behavior: copies `<script src="/embed/website-lead-form.js" data-form="website-lead-form"></script>`, but no `app/embed/...`, `public/embed/...`, or route exists.
  - Expected behavior: copied embed should point to a real script or iframe that renders/submits the form.
  - Exact fix: implement `/embed/website-lead-form.js` or change snippet to a real implemented public URL/iframe; include account/form identifier.
  - Files likely needing edits: `app/leads/website-lead-form/page.tsx`, new embed route/public asset, public intake route/API.
  - Focused test: extend `tests/website-lead-form-copy-embed.spec.ts` to request the copied script/URL and verify non-404 plus expected content type/body.

- [ ] Website Lead Form public submission
  - Current behavior: preview submit only sets a local preview message and no public backend route exists.
  - Expected behavior: actual embedded/public form submission should create a lead.
  - Exact fix: create a public POST endpoint that validates configured required fields, maps submitted fields to `leads`, stores account/form source metadata, and returns success/error.
  - Files likely needing edits: new public form/API route, `app/leads/website-lead-form/page.tsx`, maybe `app/leads/page.tsx` if source/tag mapping needs display.
  - Focused test: new Playwright/API test that opens public form, submits required fields, then verifies the created lead appears on `/leads`.

- [ ] Affiliate Website Form `Publish`
  - Current behavior: only writes settings and `published` flag to `localStorage`; UI shows `Public URL placeholder: /public/forms/affiliate-website-form`.
  - Expected behavior: publish a real affiliate referral form.
  - Exact fix: persist settings server-side and return a real public URL/snippet.
  - Files likely needing edits: `app/leads/affiliate-website-form/page.tsx`, new form settings/public render/API routes, Supabase schema/migration if not present.
  - Focused test: update/create `tests/leads-form-builders-behavior.spec.ts` to assert public affiliate form route works after publish.

- [ ] Affiliate Website Form embed/copy capability
  - Current behavior: embed snippet is displayed after publish, but no `Copy Embed` button exists on affiliate form and the script path `/embed/affiliate-website-form.js` does not exist.
  - Expected behavior: affiliate form should have parity with website lead form if copy embed is a required control; copied target should exist.
  - Exact fix: add `Copy Embed` button and implement or replace the embed target with a real public route/script.
  - Files likely needing edits: `app/leads/affiliate-website-form/page.tsx`, new embed route/public asset.
  - Focused test: new `tests/affiliate-website-form-copy-embed.spec.ts` or extend `tests/website-lead-form-copy-embed.spec.ts` for affiliate form.

- [ ] Affiliate Website Form public submission
  - Current behavior: preview submit only shows `Preview referral captured locally. No affiliate lead was created from preview mode.`
  - Expected behavior: actual embedded/public referral form submission should create an affiliate referral/lead with affiliate attribution.
  - Exact fix: create public POST endpoint and model mapping for affiliate referrals/leads; include referral code/source attribution.
  - Files likely needing edits: `app/leads/affiliate-website-form/page.tsx`, `app/leads/affiliates/page.tsx`, new public/API route, schema if referral table/fields are missing.
  - Focused test: submit public affiliate form and verify referral appears in Leads or Affiliates depending on desired product behavior.

- [ ] `/leads` `Auto-archive On/Off`
  - Current behavior: toggles a `localStorage` boolean, but no code applies this setting when website leads are imported/created/loaded.
  - Expected behavior: if enabled, website leads should automatically move to archive or be created as archived, depending on intended workflow.
  - Exact fix: apply `LOCAL_AUTO_ARCHIVE_KEY` in `load`, `save`, `importCSV`, and public form intake once added, or rename the control if it is only a local preference.
  - Files likely needing edits: `app/leads/page.tsx`, public website lead intake route once created.
  - Focused test: seed/create a Website source lead while auto-archive is on and assert it appears in Archive and not Current.

- [ ] `/leads/affiliates` `Documents & Commissions`
  - Current behavior: tab only shows `No documents or commission records yet.`
  - Expected behavior: manage affiliate documents and commissions if the visible tab is intended to be functional.
  - Exact fix: implement document/commission table and actions, or hide/rename the tab until supported.
  - Files likely needing edits: `app/leads/affiliates/page.tsx`, maybe new affiliate document/commission APIs/schema.
  - Focused test: create/update `tests/leads-affiliates-behavior.spec.ts` to assert the tab exposes real document/commission controls or no longer appears.

## Ambiguous Items Needing Original Comparison

- [ ] Lead `Move Archive`
  - Current behavior: archives visible leads only in `localStorage`/local state and does not persist an `archived` flag to Supabase.
  - Ambiguity: existing local tests expect local archive behavior; product may require remote persistence.
  - Recommended comparison: verify original CDM archive behavior and whether archive is account-wide/server-persisted.
  - Likely files if changed: `app/leads/page.tsx`, Supabase schema/migration.
  - Focused test: create remote-like lead, archive it, reload, and verify archived state persists.

- [ ] Lead `Convert`
  - Current behavior: attempts Supabase client insert and lead status update, but always marks local lead converted and navigates to `/clients` even if client insert fails.
  - Ambiguity: existing UI may intentionally allow local continuation, but "convert" can appear successful without a created client when Supabase fails.
  - Recommended comparison: verify whether conversion should block navigation on insert failure.
  - Likely files if changed: `app/leads/page.tsx`, maybe `app/clients/page.tsx`.
  - Focused test: mock `/clients` insert failure and assert expected error/no navigation, or assert local fallback creates visible client if that is intended.

- [ ] Bulk `Send Email`
  - Current behavior: posts to `/api/send-email`; API requires business auth and `RESEND_API_KEY`.
  - Ambiguity: may work only in authenticated/configured environments; not covered by current lead-specific tests.
  - Recommended comparison: verify expected auth/session flow and whether bulk email should queue locally or show setup guidance when unconfigured.
  - Likely files if changed: `app/leads/page.tsx`, `app/api/send-email/route.ts`.
  - Focused test: mock successful and failed `/api/send-email` responses and assert notices/errors.

- [ ] Affiliate row `Remove`
  - Current behavior: deletes immediately with no confirmation.
  - Ambiguity: lead delete has confirmation; affiliate remove may be intentionally lightweight or may need parity.
  - Recommended comparison: verify original affiliate delete UX.
  - Likely files if changed: `app/leads/affiliates/page.tsx`.
  - Focused test: add affiliate, click remove, assert confirmation if required or immediate removal if confirmed as intended.

- [ ] Affiliate add/edit support
  - Current behavior: add and remove exist; no edit button/control exists.
  - Ambiguity: request includes add/edit/delete generally, but visible affiliate edit control is absent.
  - Recommended comparison: verify original CDM affiliate page has edit.
  - Likely files if changed: `app/leads/affiliates/page.tsx`.
  - Focused test: create affiliate, edit fields, verify updated row.

- [ ] Assign lead control
  - Current behavior: assignment exists as `Assigned Agent` field inside add/edit modal; no visible table quick assign control.
  - Ambiguity: if "assign" means visible row action, it is absent; if modal assignment is enough, it works.
  - Recommended comparison: verify original lead assignment workflow.
  - Likely files if changed: `app/leads/page.tsx`.
  - Focused test: add/edit lead assigned agent and assert Agent column updates.

- [ ] Form style options
  - Current behavior: website form has `Short Form`, `Wide Form`, `Website`, `Affiliate`; affiliate form has `Website`, `Affiliate`. The setting is saved but has little/no visible layout impact beyond selected state.
  - Ambiguity: original may have distinct generated form layouts.
  - Recommended comparison: compare original preview/render behavior for these style options.
  - Likely files if changed: `app/leads/website-lead-form/page.tsx`, `app/leads/affiliate-website-form/page.tsx`.
  - Focused test: switch each style and assert meaningful preview/output differences.

## Existing Test Coverage Summary

- [x] `tests/leads-affiliates-pages-smoke.spec.ts`
  - Covers page visibility for `/leads`, `/leads/affiliates`, `/leads/affiliate-website-form`, `/leads/website-lead-form`, `/affiliates`, and `/affiliates/website-form`.
  - Covers sidebar routing to Affiliates and Affiliate Website Form.

- [x] `tests/leads-affiliates-behavior.spec.ts`
  - Covers lead add/edit/status/delete and affiliate add happy path.

- [x] `tests/leads-controls-csv-bulk-behavior.spec.ts`
  - Covers lead section filters, archive local behavior, CSV import validation/import, selected export, and bulk delete cancel.

- [x] `tests/leads-form-builders-behavior.spec.ts`
  - Covers local save/publish/preview/hydration for website and affiliate form builders.
  - Does not verify public URL/script/backend submission.

- [x] `tests/website-lead-form-copy-embed.spec.ts`
  - Covers Website Lead Form Copy Embed button status after local publish.
  - Does not verify copied script exists.

- [x] `tests/manual-workflow-audit.spec.ts`
  - Includes basic lead add/search/import/export visibility workflows.

- [x] `tests/workflow-interactions-smoke.spec.ts`
  - Includes basic Leads add/import modal workflow.

- [x] `tests/operational-pages-smoke.spec.ts`
  - No lead/affiliate page entries in current file.

- [x] `tests/save-buttons-no-error.spec.ts`
  - No lead/affiliate page entries in current file.

## Recommended Focused Test Additions / Updates

- [ ] Add public website lead form publish/embed test:
  - Publish form.
  - Read snippet or public URL.
  - Visit/request it.
  - Assert non-404 and rendered form.
  - Submit and verify lead appears on `/leads`.

- [ ] Add public affiliate form publish/embed test:
  - Publish affiliate form.
  - Copy or read snippet/public URL.
  - Visit/request it.
  - Submit referral.
  - Verify referral/lead appears in the intended destination with affiliate attribution.

- [ ] Update `tests/website-lead-form-copy-embed.spec.ts`:
  - Assert copied `/embed/website-lead-form.js` target exists or replace assertion with the new implemented URL.

- [ ] Add affiliate copy embed test:
  - Assert `Copy Embed` exists after publish if parity is desired.
  - Assert copied target exists.

- [ ] Add auto-archive behavior test:
  - Enable auto-archive.
  - Create/import Website source lead.
  - Assert it moves to Archive and is hidden from Current.

- [ ] Add lead convert failure/success test:
  - Success: converted lead creates visible client and status changes.
  - Failure: expected product behavior is explicit and tested.

- [ ] Add affiliate documents/commissions test after product decision:
  - If implemented, assert add/view/edit/remove commission/document controls.
  - If not implemented, assert tab is hidden or clearly disabled.

