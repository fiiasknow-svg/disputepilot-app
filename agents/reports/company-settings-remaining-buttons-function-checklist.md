# Company Settings Remaining Buttons Function Checklist

Scope: root app only, `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app\` was not inspected or edited. No app files, tests, commits, or pushes were changed in this pass. This is a code/test audit only; no full suite was run.

Sources inspected:
- `app/company/settings/page.tsx`
- `app/company/images-documents/page.tsx`
- `app/company/manage-emails/page.tsx`
- `app/company/notify-automation/page.tsx`
- `app/company/portals/page.tsx`
- `app/settings/configuration/page.tsx`
- `app/configuration/page.tsx`
- `app/disputes/status/page.tsx`
- `components/CDMLayout.tsx`
- Targeted tests matching company/settings/configuration/images/documents/emails/notify/automation/manual/operational/workflow/save patterns.

Route notes:
- `/company` has no root `app/company/page.tsx`.
- `/company/dispute-status-notify` has no page. The sidebar uses `/company/notify-automation`.
- `/configuration` redirects to `/settings/configuration`.
- Company sidebar also links `Dispute Status` to `/disputes/status`.

## Working Buttons / Links / Controls

### Shared Company Navigation - `components/CDMLayout.tsx`
- [x] `Company` sidebar group: toggles nested links.
- [x] Company sidebar links: `Company Settings`, `Portals/Mobile App`, `Images/Documents`, `Manage Emails`, `Dispute Status`, `Notify/Automation`, `Configuration`; navigate to their configured routes.
- [x] Trial link `14 Days Left in The Trial`: navigates to `/billing` via `Link`.
- [x] `Activate`, `Activate Membership`, `ACTIVATE MEMBERSHIP`: open activation modal.
- [x] Activation modal `x`, `Close`: close modal.
- [x] `ACTIVATE & CLAIM MY GIFTS`: routes to `/billing`.
- [x] `Open Registration`: validates password field locally and shows status.
- [x] `Need Help?` / `Help`: toggle help links.
- [x] `Sign out`: calls Supabase sign out, clears auth storage/cookie, navigates to `/login`.

### `/company/settings`
- [x] `Back to Dashboard`: navigates to `/dashboard`.
- [x] `Cancel`: resets company profile form to last saved local state.
- [x] `Save Company`: saves form to in-page saved preview and shows status.
- [x] Company profile controls: `Select a Time Zone`, `Company Name`, `Phone`, `Email`, `Website`, `Address`, `City`, `State`, `Zip`, `Notes / Description`, `Fax`, `Office Hours`, `Company Logo`, `Brand Color`, `Brand Text Color`, `Button Color`; all update local React state and participate in save/cancel/preview behavior.
- Covered by: `tests/company-settings-save-behavior.spec.ts`, `tests/company-settings-controls-audit.spec.ts`, `tests/manual-workflow-audit.spec.ts`.

### `/company/images-documents`
- [x] `+ Upload File`: opens hidden file input; selected files are added from real browser file metadata with blob URL for current-session downloads.
- [x] Drop zone click/drop: opens file picker or uploads dropped files.
- [x] Tabs `All Files`, `Images`, `Documents`: filter file list.
- [x] Search `Search files...` and category select: filter visible rows/cards.
- [x] View toggle list/grid icon buttons: switch views.
- [x] List `Download`: downloads uploaded blob files; seeded sample rows show unavailable status.
- [x] List `Rename`: opens rename modal.
- [x] Rename modal `Cancel`: closes modal.
- [x] Rename modal `Rename` / Enter key: renames local file.
- [x] List `Share`: copies synthetic share URL and shows copied status.
- [x] List `Delete`: opens delete confirmation.
- [x] Delete modal `Cancel`: closes confirmation.
- [x] Delete modal `Delete`: removes local file.
- [x] Grid download/share/delete icon buttons: call the same download/copy/delete flows.
- Covered by: `tests/images-documents-workflow.spec.ts`, `tests/images-documents-real-upload.spec.ts`, `tests/manual-workflow-audit.spec.ts`.

### `/company/manage-emails`
- [x] `+ New Template`: opens template modal.
- [x] Tabs `Email Templates`, `SMTP Settings`, `Email Log`: switch panels.
- [x] Template search and `All Types` select: filter templates.
- [x] Template status toggle: toggles active/inactive locally.
- [x] Template row `Preview`: opens preview modal.
- [x] Template row `Edit`: opens edit modal.
- [x] Template row `Duplicate`: creates local copy.
- [x] Template row `Delete`: removes template locally.
- [x] Template modal `x` / `Cancel`: closes and resets form.
- [x] Template modal `Save Template`: creates or updates template locally.
- [x] Preview modal `Edit`: opens edit modal from preview.
- [x] Preview modal `Close` / `x`: closes preview.
- [x] SMTP quick setup `Gmail`, `Outlook`, `Mailgun`, `SendGrid`, `Custom`: set host/port locally.
- [x] SMTP controls `SMTP Host`, `Port`, `Encryption`, `Username`, `Password / App Key`, `From Name`, `From Email`: controlled state.
- [x] SMTP `Send Test Email`: simulates async local connection check; no real email is sent.
- [x] SMTP `Save Settings`: saves local SMTP status message.
- [x] Email Log search/status select: filter log rows.
- [x] Email Log `Resend`: queues/marks local resend status; no real email is sent.
- Covered by: `tests/manage-emails-workflow.spec.ts`.

### `/company/notify-automation`
- [x] Header `Save Settings`: shows saved state/message locally.
- [x] Tabs `Notification Settings`, `Automation Rules`: switch panels.
- [x] Master toggles `All Email Notifications`, `All SMS Notifications`, `All Portal Notifications`: toggle master flags locally.
- [x] Bulk buttons `Email/SMS/Portal: All On` and `All Off`: set all per-event channel toggles.
- [x] Search `Search events...` and category chips `All`, `Client`, `Dispute`, `Invoice`, `Client Portal`, `Lead`: filter events.
- [x] Per-event `Email`, `SMS`, `Portal` toggles: toggle event channel locally.
- [x] Per-event `Delay (Days)` inputs: update local delay.
- [x] Integrations link `Company Settings -> Integrations`: navigates to `/settings/configuration?tab=Integrations#integrations`.
- [x] Automation `+ New Rule`: opens rule modal.
- [x] Rule modal `x` / `Cancel`: closes modal.
- [x] Rule fields `Rule Name`, `Trigger Event`, `Action`, `Delay`, `Channel`: controlled state.
- [x] Rule modal `Create Rule` / `Save Rule`: creates or updates local rule.
- [x] Rule active toggle: toggles local active state.
- [x] Rule `Edit`: opens edit modal and saves row update.
- [x] Rule `Delete`: removes local rule.
- Covered by: `tests/notify-automation-workflow.spec.ts`, `tests/notify-automation-actions.spec.ts`.

### `/company/portals`
- [x] `BACK`: navigates back when same-origin history exists, otherwise `/company/settings`.
- [x] `WATCH VIDEO`: opens training placeholder modal.
- [x] Video modal `Close`: closes modal.
- [x] `COPY LINK` buttons for Client Tracking Portal, Affiliate Portal, Android Application, IOS Application: copy link and show `Copied!`.
- [x] Portal fields `Portal URL`, `Logo`, `Branding`, `Welcome Message`: controlled/local selected filename.
- [x] Checkboxes `Enable Client Portal`, `Allow Document Uploads`, `Enable Secure Messages`, `Enable Mobile App Access`, `Enable Push Notifications`, `Allow Biometric Login`: controlled state.
- [x] `Reset`: resets to last saved local portal/mobile state.
- [x] `Save Portal Settings`: saves local portal/mobile summary, including logo filename.
- Covered by: `tests/portals-save-behavior.spec.ts`, `tests/portals-buttons-audit.spec.ts`.

### `/settings/configuration`
- [x] First-surface `Custom Status` input, color swatches, `Add Custom Status`: add status through Supabase when available, otherwise local fallback.
- [x] Custom status row `Delete`: deletes local/remote status.
- [x] Password fields and `Change Password`: validate required/matching fields; update via Supabase auth when session exists, otherwise deferred local notice.
- [x] Tabs `General`, `Client Statuses`, `Dispute Statuses`, `Round Settings`, `Notifications`, `Portal`, `Service Plans`, `Tags`, `Integrations`: switch settings panels.
- [x] General fields and `Save General Settings`: persist to `localStorage`.
- [x] Client/Dispute `+ Add Status`, modal color swatches, modal `Cancel`, modal `Add Status`: local/remote status flow.
- [x] Round settings numeric fields/toggles and `Save Round Settings`: persist to `localStorage`.
- [x] Notification sender fields/toggles and `Save Notification Settings`: persist to `localStorage`.
- [x] Portal fields/toggles and `Save Portal Settings`: persist to `localStorage`.
- [x] Service Plans `+ Add Plan`, `Cancel`, `Add Plan`, `Activate`/`Deactivate`: local plan CRUD persisted to `localStorage`.
- [x] Tags input, color swatches, Enter key, `+ Add Tag`, tag `x`: local tag CRUD persisted to `localStorage`.
- [x] Webhook endpoint `Copy` buttons: copy URL and show `Copied`.
- Covered by: `tests/configuration-behavior.spec.ts`, `tests/configuration-persistence-alias.spec.ts`, `tests/configuration-parity.spec.ts`.

### `/disputes/status`
- [x] `↓ Export CSV`: exports currently filtered disputes to CSV.
- [x] `↻ Refresh`: reloads Supabase/demo dispute rows.
- [x] View buttons `All Disputes`, `By Bureau`, `By Round`: switch view.
- [x] Filters `Search client or account...`, `All Statuses`, `All Bureaus`, `All Rounds`: filter rows.
- [x] `Clear`: resets filters when any filter/search is active.
- [x] Row checkboxes and select-all checkbox: select disputes.
- [x] `Update N Selected`: opens batch update modal when rows selected.
- [x] Batch modal status chips: choose batch status.
- [x] Batch modal `Cancel`: closes modal.
- [x] Batch modal `Set All to "status"`: updates Supabase when available and local rows.
- [x] Row `Update Status` select: updates single dispute status.
- [x] Row click: opens/closes detail panel.
- [x] Detail panel `x`: closes panel.
- [x] Detail panel status chips `pending`, `sent`, `responded`, `resolved`: update selected dispute status.
- Covered by: `tests/disputes-status-selection-behavior.spec.ts` and broad smoke coverage.

## Broken / Non-Functional Controls Needing Real Fix

- [ ] `/company` route missing.
  - Expected behavior: Company landing/settings route should render or redirect.
  - Current behavior: no `app/company/page.tsx`.
  - Exact fix: add `app/company/page.tsx` that redirects to `/company/settings`.
  - Files likely needing edits: `app/company/page.tsx`.
  - Focused test: visit `/company`, assert URL `/company/settings` or visible Company Settings heading.

- [ ] `/company/dispute-status-notify` route missing.
  - Expected behavior: requested route should reach Dispute Status Notify/Automation.
  - Current behavior: no `app/company/dispute-status-notify/page.tsx`; sidebar uses `/company/notify-automation`.
  - Exact fix: add redirect page from `/company/dispute-status-notify` to `/company/notify-automation`, or update external references to the current route.
  - Files likely needing edits: `app/company/dispute-status-notify/page.tsx`.
  - Focused test: visit `/company/dispute-status-notify`, assert redirect to `/company/notify-automation`.

- [ ] `/company/images-documents` uploaded files are current-session blob URLs only.
  - Expected behavior: durable upload, preview/download after reload, and server/storage-backed metadata.
  - Current behavior: real selected file metadata is used, but object URLs are lost on reload; seeded samples cannot download.
  - Exact fix: upload to Supabase Storage or app storage API, save metadata URL/path, use signed/download URLs, revoke old object URLs when replacing/removing local blobs.
  - Files likely needing edits: `app/company/images-documents/page.tsx`, `lib` storage helper or `app/api` upload route, storage policy/migration.
  - Focused test: upload fixture, reload, assert file persists and download still works through mocked storage.

- [ ] `/company/manage-emails` SMTP `Send Test Email` sends no real email and always succeeds.
  - Expected behavior: validate SMTP settings through server-side mailer and return success/failure.
  - Current behavior: `setTimeout` local success message only.
  - Exact fix: create server endpoint for SMTP test, validate required fields, call endpoint from page, display real error/success.
  - Files likely needing edits: `app/company/manage-emails/page.tsx`, `app/api/send-email/route.ts` or new SMTP test route, mailer helper.
  - Focused test: mock test endpoint success/failure; assert both UI states.

- [ ] `/company/manage-emails` Email Log `Resend` sends no real email.
  - Expected behavior: resend selected log email or queue backend resend job.
  - Current behavior: local queued/sent status only.
  - Exact fix: add resend API/job using stored log/template data, disable button while pending, render error state.
  - Files likely needing edits: `app/company/manage-emails/page.tsx`, email resend API/service.
  - Focused test: mock resend endpoint and assert queued, success, and failure states.

- [ ] `/company/manage-emails` template/body changes are local-only and not durable.
  - Expected behavior: templates and SMTP settings persist across reload/users.
  - Current behavior: React state only.
  - Exact fix: persist templates/SMTP settings to Supabase/settings table or explicit localStorage if product remains local-demo.
  - Files likely needing edits: `app/company/manage-emails/page.tsx`, settings/template persistence helper.
  - Focused test: create/edit/delete template, reload, assert durable state.

- [ ] `/company/notify-automation` notification settings and automation rules are local-only.
  - Expected behavior: notification/rule configuration persists and drives real automation.
  - Current behavior: React state save message only; no backend workflow execution.
  - Exact fix: persist event channel settings/rules to database, connect automation runner or queue, and reload saved rules on mount.
  - Files likely needing edits: `app/company/notify-automation/page.tsx`, automation settings table/API, worker/queue if available.
  - Focused test: edit toggles/rules, save, reload, assert persistence; integration test can mock automation API.

- [ ] `/company/notify-automation` master channel switches do not cascade to per-event rows.
  - Expected behavior: ambiguous, but label `All Email/SMS/Portal Notifications` implies global enable/disable.
  - Current behavior: master flags only toggle their own display text/color; bulk controls do the actual per-event changes.
  - Exact fix: either make master switches cascade/disable all channel rows, or rename them to clarify global availability separate from per-event settings.
  - Files likely needing edits: `app/company/notify-automation/page.tsx`.
  - Focused test: click master email off, assert email channel rows disabled/off or assert explanatory state.

- [ ] `/company/portals` portal/mobile settings are local-only.
  - Expected behavior: saved portal branding/settings should persist for company account and client portal.
  - Current behavior: React state summary only.
  - Exact fix: persist portal settings/logo URL to database/storage and reload on mount.
  - Files likely needing edits: `app/company/portals/page.tsx`, portal settings persistence/storage helper.
  - Focused test: save portal settings, reload, assert saved summary and form values persist.

- [ ] `/company/portals` `WATCH VIDEO` opens placeholder instead of real media.
  - Expected behavior: play actual portal training video or open video URL.
  - Current behavior: modal with `Training video placeholder`.
  - Exact fix: add real video URL/embed per portal section and render video player or external link.
  - Files likely needing edits: `app/company/portals/page.tsx`.
  - Focused test: click each `WATCH VIDEO`, assert iframe/video src or external route.

- [ ] `/settings/configuration` integrations are display-only.
  - Expected behavior: connect/configure missing integrations like Twilio, SendGrid, DocuSign.
  - Current behavior: read-only configured/not-set status plus webhook copy.
  - Exact fix: add setup actions/forms/routes for each configurable integration and persist secrets through secure server flow.
  - Files likely needing edits: `app/settings/configuration/page.tsx`, integration API routes/server actions.
  - Focused test: click setup action for a missing integration, assert modal/route and validation.

- [ ] `/disputes/status` demo rows attempt Supabase updates with demo IDs.
  - Expected behavior: demo-only rows should update locally without failed remote calls, or real rows should persist reliably.
  - Current behavior: `updateStatus` and batch update call Supabase even for fallback demo IDs, then update local state regardless.
  - Exact fix: skip remote update for IDs starting `demo-status-`, or show backend error for failed real updates.
  - Files likely needing edits: `app/disputes/status/page.tsx`.
  - Focused test: mock Supabase update failure and assert demo local update/no red error or real-row failure feedback.

## Ambiguous / Needs Original Comparison

- [ ] `/company/portals` preview text has no separate Preview button/control. Current page only offers copy links and video modal. Compare original to confirm whether preview should open a portal preview.
- [ ] `/company/manage-emails` template `Delete` removes immediately with no confirmation. Compare original to determine whether destructive template deletion should confirm.
- [ ] `/company/notify-automation` automation rule `Delete` removes immediately with no confirmation. Compare original to determine whether destructive rule deletion should confirm.
- [ ] `/company/images-documents` seeded sample files cannot download. This may be acceptable for demo data, but compare original if samples were expected to have real assets.
- [ ] `/settings/configuration` has both first-surface `Custom Status` and tab-specific status creation. Existing parity tests suggest this may be intentional, but original IA should decide whether to consolidate.

## Recommended Focused Tests To Create / Update

- [ ] Add `tests/company-route-aliases.spec.ts`: `/company` redirects to `/company/settings`; `/company/dispute-status-notify` redirects to `/company/notify-automation`.
- [ ] Update `tests/images-documents-real-upload.spec.ts`: include persistence/reload once storage is wired; add seeded sample expected behavior.
- [ ] Update `tests/manage-emails-workflow.spec.ts`: mock real SMTP test endpoint and resend endpoint; add failure assertions.
- [ ] Add `tests/manage-emails-persistence.spec.ts`: template create/edit/delete and SMTP save survive reload.
- [ ] Update `tests/notify-automation-workflow.spec.ts`: save notification toggles/rules, reload, assert persistence; clarify master switch behavior.
- [ ] Add `tests/portals-persistence-media.spec.ts`: portal settings/logo survive reload and video buttons open real media.
- [ ] Update `tests/configuration-persistence-alias.spec.ts`: integration setup action tests when real setup UI exists.
- [ ] Add `tests/disputes-status-demo-update.spec.ts`: demo row status updates avoid failed remote dependency or display remote error for real rows.

## Bottom Line

Most visible controls in the requested surfaces now do something visible and are covered by targeted Playwright tests. The remaining real fixes are mainly durability/integration gaps: missing route aliases, local-only settings/templates/rules, simulated email/automation behavior, current-session-only document blobs, placeholder videos, display-only integrations, and ambiguous destructive actions that need original-product comparison before changing UX.
