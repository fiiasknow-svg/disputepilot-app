# Company Settings Button/Function Audit Checklist

Scope: root app only, `C:\Users\LESLI\disputepilot-app`. Nested `disputepilot-app\` was not inspected or edited. This is a code/test audit only; no full suite was run and no app/test files were changed.

Sources inspected:
- `app/company/**`
- `app/settings/configuration/page.tsx`
- `app/configuration/page.tsx`
- `components/CDMLayout.tsx`
- targeted company/settings/configuration/portal/manage/notify/digital/images tests requested

## Common Layout Controls

### Working / Navigates / Opens
- [x] Sidebar `Company` group expand/collapse - toggles nested company/settings nav locally. File: `components/CDMLayout.tsx`.
- [x] Sidebar links: `Company Settings`, `Portals/Mobile App`, `Manage Portal Content`, `Credit Monitoring`, `Digital Contracts`, `Self Service Signup`, `Client Auto Signup`, `Images/Documents`, `Manage Emails`, `Notify/Automation`, `Team Messages`, `Configuration` - navigate via `next/link`. File: `components/CDMLayout.tsx`.
- [x] Topbar/mobile `Open navigation` and overlay `Close navigation` - toggles mobile sidebar. File: `components/CDMLayout.tsx`.
- [x] Account name `Leslie Sabek` - opens account menu.
- [x] Account menu `Profile and company settings` - navigates to `/company/settings`.
- [x] `Need Help?` and sidebar `Help` - toggles help panel.
- [x] Help links `Get Support`, `Help Center`, `FAQ`, `Success Path`, `1-on-1 Coaching`, `AI Credit Coach` - mailto/external/internal links are present.
- [x] `Activate`, `Activate Membership`, `ACTIVATE MEMBERSHIP` - open activation modal.
- [x] Activation modal `x`, `Close` - close modal.
- [x] Activation modal `Your 2 Free Gifts expire in 47 hours!` - sets local status message.
- [x] Activation modal `ACTIVATE & CLAIM MY GIFTS` - sets status and navigates to `/billing`.
- [x] Activation modal `Open Registration` - validates password locally and sets status.
- [x] `Sign out` - calls Supabase signout, clears local/session auth keys, navigates to `/login`.

### Broken / Needs Fix
- [ ] Sidebar `14 Days Left in The Trial` uses raw `<a href="/billing">`; expected app navigation. Current behavior navigates with full reload.
  - Fix: replace with `Link href="/billing"`.
  - Files likely needing edits: `components/CDMLayout.tsx`.
  - Focused test: click trial link from a company page and assert URL `/billing` without runtime error.

## `/company/settings`

### Working / Current Behavior From Code and Tests
- [x] Link `Back to Dashboard` - navigates to `/dashboard`; covered by `tests/manual-workflow-audit.spec.ts`.
- [x] Text inputs `Company Name`, `Phone`, `Email`, `Website`, `Address`, `City`, `State`, `Zip`, textarea `Notes / Description` - controlled React state.
- [x] Button `Save Company` - saves controlled company form to local React state and updates `Saved Company Profile`; covered by `tests/company-settings-save-behavior.spec.ts` and manual workflow audit.
- [x] Button `Cancel` - resets controlled company form to last saved state; covered by tests.

### Broken / Non-Functional
- [ ] Select `Select a Time Zone` - visible setting but uncontrolled and not included in save/reset/preview.
  - Expected: selected timezone persists with company settings.
  - Current: changing it does nothing outside the DOM control.
  - Fix: add timezone to company form state, include in `saved`, reset, preview/status, and persistence layer when available.
  - Files likely needing edits: `app/company/settings/page.tsx`.
  - Focused test: select timezone, save, change it, cancel, assert selected timezone resets to saved value.
- [ ] Input `Fax` - visible setting but uncontrolled and unsaved.
  - Fix: add `fax` to form state and saved preview/persistence.
  - Files likely needing edits: `app/company/settings/page.tsx`.
  - Focused test: fill fax, save, assert visible saved state or persisted value after reload if persistence is added.
- [ ] Input `Office Hours` - visible setting but uncontrolled and unsaved.
  - Fix: add `officeHours` to form state and saved preview/persistence.
  - Files likely needing edits: `app/company/settings/page.tsx`.
  - Focused test: fill office hours, save/cancel behavior.
- [ ] Upload `Company Logo` - native file input only; no file name/state/preview/upload/save.
  - Fix: add selected file state, preview/name, validation, real upload or explicit local-only confirmation.
  - Files likely needing edits: `app/company/settings/page.tsx`, upload/storage helper if production persistence exists.
  - Focused test: choose fixture file and assert selected logo feedback; later assert uploaded URL when storage is wired.
- [ ] Color controls `Brand Color`, `Brand Text Color`, `Button Color` - uncontrolled and unsaved.
  - Fix: add brand color fields to form state and save/reset/preview/persistence.
  - Files likely needing edits: `app/company/settings/page.tsx`.
  - Focused test: change colors, save, assert saved preview or persisted values.

## `/company/portals`

### Working / Current Behavior From Code and Tests
- [x] `COPY LINK` buttons for Client Tracking Portal, Affiliate Portal, Android Application, IOS Application - call `navigator.clipboard.writeText`; still show `Copied!` if clipboard API fails. Covered by smoke surface tests only.
- [x] File input `Logo` - stores selected filename in React state only.
- [x] Inputs `Portal URL`, `Branding`, textarea `Welcome Message` - controlled state.
- [x] Checkboxes `Enable Client Portal`, `Allow Document Uploads`, `Enable Secure Messages`, `Enable Mobile App Access`, `Enable Push Notifications`, `Allow Biometric Login` - controlled state.
- [x] Button `Save Portal Settings` - saves current portal/mobile state to local React state and updates summary; covered by `tests/portals-save-behavior.spec.ts`.
- [x] Button `Reset` - resets controlled portal/mobile state to last saved state; covered by test.

### Broken / Non-Functional
- [ ] Button `BACK` - no `onClick`, no `href`.
  - Expected: navigate back or to dashboard/company area.
  - Current: does nothing.
  - Fix: use `router.back()` or replace with `Link` to the original expected destination.
  - Files likely needing edits: `app/company/portals/page.tsx`.
  - Focused test: click `BACK`, assert URL changes to expected route.
- [ ] Buttons `WATCH VIDEO` under Client Tracking Portal and Affiliate Portal - no handler.
  - Expected: open tutorial video modal/link.
  - Current: does nothing.
  - Fix: add video URL metadata and open modal or external link.
  - Files likely needing edits: `app/company/portals/page.tsx`.
  - Focused test: click each `WATCH VIDEO`, assert video modal/link opens.
- [ ] Upload `Logo` - only stores local filename and is not included in saved summary/persistence.
  - Fix: add upload/save behavior or explicitly mark as local preview.
  - Files likely needing edits: `app/company/portals/page.tsx`.
  - Focused test: choose logo, save, assert selected logo remains represented in saved state.

### Ambiguous / Needs Original Comparison
- [ ] Preview text `Preview what your clients see...` and `Preview the Affiliate Portal view...` has no visible preview control. Original may have had a preview button/link.
  - Recommended comparison: verify captured original portal page for expected preview action.

## `/company/manage-portal-content`

### Working / Current Behavior
- [x] Button `+ Create New` - opens `New Article` modal.
- [x] Modal fields `Article Title`, `Type` - controlled state.
- [x] Modal `Cancel` - closes modal.
- [x] Modal `Create` - creates a Draft article in local React state when title is non-empty.
- [x] Per-row `Publish` / `Unpublish` - toggles article status locally.
- [x] Per-row `Delete` - removes article locally.

### Broken / Non-Functional
- [ ] Per-row `Edit` - no handler.
  - Expected: open edit modal for selected article.
  - Current: does nothing.
  - Fix: wire `Edit` to populate the same modal or a dedicated edit modal, then save changes into `articles`.
  - Files likely needing edits: `app/company/manage-portal-content/page.tsx`.
  - Focused test: click `Edit`, change article title/type, save, assert row updates.
- [ ] Modal `Create` with empty title silently does nothing.
  - Expected: validation feedback or disabled state.
  - Current: no visible response.
  - Fix: disable `Create` until title is present or show validation text.
  - Files likely needing edits: `app/company/manage-portal-content/page.tsx`.
  - Focused test: empty create shows validation or disabled button.

## `/company/portal-content`

### Ambiguous / Needs Fix Or Original Comparison
- [ ] Route displays only heading `Portal Content`; no visible controls.
  - Expected: unclear; route was found in `app/` but not in sidebar.
  - Current: placeholder page only.
  - Fix: either remove/deprecate route, redirect to `/company/manage-portal-content`, or implement original portal content controls.
  - Files likely needing edits: `app/company/portal-content/page.tsx`.
  - Focused test: route redirects or renders expected content management controls.

## `/company/credit-monitoring`

### Working / Current Behavior
- [x] Provider URL inputs for SmartCredit, MyFreeScore360, IdentityIQ, mySCOREIQ, PrivacyGuard - controlled state.
- [x] Per-provider `Test` - simulates async test, changes label to `Testing...`, then `Connected`, then resets.
- [x] Per-provider ON/OFF toggle - toggles enabled state locally.

### Broken / Non-Functional
- [ ] Button `Save Settings` - no `onClick`.
  - Expected: save provider URLs/enabled states.
  - Current: does nothing.
  - Fix: add save state/status and persistence or local saved summary.
  - Files likely needing edits: `app/company/credit-monitoring/page.tsx`.
  - Focused test: edit URL/toggle provider, click `Save Settings`, assert saved confirmation and retained values.

### Ambiguous
- [ ] Provider `Test` always succeeds and does not validate URL.
  - Fix if production behavior is required: call a backend validation endpoint and show pass/fail.
  - Focused test: mock success/failure endpoint and assert status.

## `/company/digital-contracts`

### Working / Current Behavior
- [x] Button `Create Contract` - opens `New Digital Contract` modal; covered by smoke test.
- [x] Modal fields `Contract Name`, `Recipient`, `Type`, `Contract Body` - controlled state.
- [x] Modal `Cancel` - closes create modal.
- [x] Modal `Save Contract` - creates a Draft contract locally when name and recipient are present.
- [x] Per-row `View` - opens contract detail modal.
- [x] Per-row `Send` - changes selected contract status to `Sent` locally and shows message.
- [x] Detail modal `Close` - closes modal.
- [x] Detail modal `Send Contract` - sends locally and closes modal.
- [x] Workflow tabs/buttons `Documents`, `Upload`, `Contracts`, `Templates`, `Send`, `Sign` - set message only.

### Broken / Non-Functional
- [ ] Workflow controls `Documents`, `Upload`, `Contracts`, `Templates`, `Send`, `Sign` do not switch content or perform workflow actions.
  - Expected: navigate/switch to corresponding workflow views or start upload/send/sign flows.
  - Current: only displays "`<tab>` workflow selected."
  - Fix: introduce active workflow state with actual panels/actions, or convert to non-button status chips if no action exists.
  - Files likely needing edits: `app/company/digital-contracts/page.tsx`.
  - Focused test: click each workflow control and assert expected panel/action appears.
- [ ] `Contract Body` is not stored in `Contract` objects or shown in `View`.
  - Expected: saved contract should retain body.
  - Current: body is discarded on save.
  - Fix: add `body` to `Contract` type and display it in the detail modal.
  - Files likely needing edits: `app/company/digital-contracts/page.tsx`.
  - Focused test: create contract with unique body, view it, assert body is visible.

## `/company/self-service-signup`

### Working / Current Behavior
- [x] Step tabs `1. Welcome` through `10. Embed Code` - switch wizard step.
- [x] `Get Started` - advances to Terms step.
- [x] `Previous` - moves back one step and is disabled at first step.
- [x] `Next` - moves forward one step.
- [x] Checkbox `I have read and agree to the Terms of Use` - controlled state.
- [x] Inputs in `Design Center` `Company Name`, `Contact Email` - controlled and used in embed code.
- [x] Brand color swatches - update selected color locally.
- [x] Plan cards `Starter`, `Professional`, `Agency` - select plan locally.
- [x] Button `Copy Embed Code` - copies iframe code and shows `Copied!`.

### Broken / Non-Functional
- [ ] Billing Setup fields `Stripe API Key`, `Stripe Publishable Key`, `Webhook Secret` - uncontrolled and not saved.
- [ ] About You fields `Business Legal Name`, `Business Address`, `Phone Number`, `State of Operation`, `License Number` - uncontrolled and not saved.
- [ ] Agreement checkbox `I agree to the Service Agreement` - uncontrolled and not required before continuing.
- [ ] Credit Monitoring checkboxes `SmartCredit`, `MyFreeScore360`, `IdentityIQ` - uncontrolled and not saved.
- [ ] Button `Finish` - no handler.
  - Expected: complete setup, persist configuration, or navigate to final configured portal.
  - Current: does nothing.
  - Fix: create one wizard form state object, validate required steps, save configuration, and make `Finish` show completion/navigate.
  - Files likely needing edits: `app/company/self-service-signup/page.tsx`.
  - Focused test: complete required fields, click `Finish`, assert success state and saved wizard config.

### Ambiguous
- [ ] `Next` allows skipping terms/agreement/plan. Original flow may require gating.
  - Recommended comparison: verify original wizard validation rules before enforcing.

## `/company/client-auto-signup`

### Working / Current Behavior
- [x] Tabs `Client Auto Signup`, `Signup Basic Settings`, `Single Credit Card Authorization` - switch panels.
- [x] Select `Select Contract` - controlled state.
- [x] Button `Copy` - copies signup URL and shows `Copied!`.
- [x] Toggle `Client Auto Signup` - toggles ON/OFF locally.
- [x] Toggles `Require Phone Number`, `Require Address`, `Allow Clients to Self-Select Plan` - toggle locally.
- [x] Credit card fields `Cardholder Name`, `Card Number`, `Expiry`, `CVV` - controlled state.

### Broken / Non-Functional
- [ ] Button `Build Signup Form` - no handler.
  - Expected: open form builder or navigate to builder.
  - Current: does nothing.
  - Fix: wire to builder modal/route or remove button until available.
  - Files likely needing edits: `app/company/client-auto-signup/page.tsx`.
  - Focused test: click button and assert builder route/modal.
- [ ] Button `Save Settings` in `Signup Basic Settings` - no handler.
  - Expected: save basic signup settings.
  - Current: does nothing.
  - Fix: add save handler/status/persistence for the three toggles.
  - Files likely needing edits: `app/company/client-auto-signup/page.tsx`.
  - Focused test: toggle settings, save, assert confirmation and retained values.
- [ ] Button `Authorize Card` - no handler.
  - Expected: validate/tokenize/authorize card or show secure integration flow.
  - Current: does nothing.
  - Fix: wire to payment setup endpoint or placeholder confirmation with clear non-production copy.
  - Files likely needing edits: `app/company/client-auto-signup/page.tsx`, payment API route if implemented.
  - Focused test: fill card fields, click authorize, assert success/error state.

## `/company/images-documents`

### Working / Current Behavior From Tests
- [x] Button `+ Upload File` - adds a random fake file to local state and shows status; covered by `tests/images-documents-workflow.spec.ts` and manual workflow audit.
- [x] Drop zone click/drop - calls same fake upload.
- [x] Tabs `All Files`, `Images`, `Documents` - filter visible files.
- [x] Search input `Search files...` - filters by name/category.
- [x] Category select - filters by category.
- [x] View toggle `list` / `grid` icon buttons - switches list/grid view.
- [x] List per-row `Download` - shows "`<file>` is ready to download." status.
- [x] List per-row `Rename` - opens rename modal.
- [x] Rename modal `Cancel` - closes modal.
- [x] Rename modal `Rename` and Enter key - renames local file and shows status; covered by tests.
- [x] List per-row `Share` - copies synthetic URL and shows status; covered by manual workflow audit.
- [x] List per-row `Delete` - opens confirmation.
- [x] Delete modal `Cancel` - closes confirmation.
- [x] Delete modal `Delete` - removes local file and shows status; covered by manual workflow audit.
- [x] Grid per-card share icon - copies synthetic URL.
- [x] Grid per-card delete icon - opens confirmation.

### Broken / Non-Functional
- [ ] Upload controls do not use real selected files or storage.
  - Expected: actual file picker/drop upload.
  - Current: random fake file is added.
  - Fix: add hidden file input/drop file handling, validate size/type, upload/store metadata.
  - Files likely needing edits: `app/company/images-documents/page.tsx`, storage/API helper.
  - Focused test: set input files with fixture, assert file name appears and upload status.
- [ ] List `Download` and grid download icon do not download a file.
  - Expected: file download or signed URL navigation.
  - Current list: status message only. Current grid: no handler at all.
  - Fix: add file URL metadata and download handler; wire grid icon to same handler.
  - Files likely needing edits: `app/company/images-documents/page.tsx`.
  - Focused test: click list/grid download and assert download event or URL.

## `/company/manage-emails`

### Working / Current Behavior From Tests
- [x] Header `+ New Template` - opens template modal; covered by `tests/manage-emails-workflow.spec.ts`.
- [x] Tabs `Email Templates`, `SMTP Settings`, `Email Log` - switch panels.
- [x] Template search and `All Types` select - filter templates.
- [x] Template active status toggle - toggles active state locally.
- [x] Per-template `Preview` - opens preview modal.
- [x] Preview modal `Edit` - opens edit modal for template.
- [x] Preview modal `Close` and `x` - close preview.
- [x] Per-template `Edit` - opens edit modal.
- [x] Per-template `Duplicate` - creates local copy.
- [x] Per-template `Delete` - removes template locally.
- [x] Template modal `x` / `Cancel` - closes and resets form.
- [x] Template modal `Save Template` - creates/updates template locally; covered by tests.
- [x] SMTP `Quick Setup` buttons `Gmail`, `Outlook`, `Mailgun`, `SendGrid`, `Custom` - set host/port locally.
- [x] SMTP fields `SMTP Host`, `Port`, `Encryption`, `Username`, `Password / App Key`, `From Name`, `From Email` - controlled state.
- [x] SMTP `Send Test Email` - simulates async success.
- [x] SMTP `Save Settings` - saves local success message; covered by tests.
- [x] Email Log search/status select - filter log rows.

### Broken / Non-Functional
- [ ] Email Log per-row `Resend` - no handler.
  - Expected: resend email or show queued status.
  - Current: does nothing.
  - Fix: wire to resend handler with status/error feedback.
  - Files likely needing edits: `app/company/manage-emails/page.tsx`, email API route if production.
  - Focused test: click `Resend`, assert queued/sent confirmation or mocked API call.
- [ ] SMTP `Send Test Email` always succeeds and sends nothing.
  - Expected: actual backend SMTP test.
  - Current: delayed local success.
  - Fix: call server endpoint and render real success/failure.
  - Files likely needing edits: `app/company/manage-emails/page.tsx`, API route/lib mailer.
  - Focused test: mock endpoint success/failure and assert UI.

### Ambiguous
- [ ] Template `Delete` removes immediately without confirmation.
  - Recommended comparison: verify whether original required confirm.

## `/company/notify-automation`

### Working / Current Behavior From Tests
- [x] Header `Save Settings` - shows saved state/message; covered by `tests/notify-automation-workflow.spec.ts`.
- [x] Main tabs `Notification Settings`, `Automation Rules` - switch panels.
- [x] Master toggles `All Email Notifications`, `All SMS Notifications`, `All Portal Notifications` - toggle master state locally.
- [x] Bulk buttons `Email: All On/All Off`, `SMS: All On/All Off`, `Portal: All On/All Off` - set all event channel states.
- [x] Search `Search events...` and category chips `All`, `Client`, `Dispute`, `Invoice`, `Client Portal`, `Lead` - filter event rows.
- [x] Per-event channel toggles `Email`, `SMS`, `Portal` - toggle event channel locally.
- [x] Per-event `Delay (Days)` number input - updates event delay locally.
- [x] Automation `+ New Rule` - opens modal.
- [x] New Rule modal `x` / `Cancel` - closes modal.
- [x] New Rule modal fields `Rule Name`, `Trigger Event`, `Action`, `Delay`, `Channel` - controlled state.
- [x] New Rule modal `Create Rule` - adds local rule when name and trigger are present; covered by test.
- [x] Rule active toggle - toggles active state locally.
- [x] Rule `Delete` - removes local rule.

### Broken / Non-Functional
- [ ] Rule `Edit` - no handler.
  - Expected: open edit modal for existing automation rule.
  - Current: does nothing.
  - Fix: populate `newRule`/editing state and update selected rule on save.
  - Files likely needing edits: `app/company/notify-automation/page.tsx`.
  - Focused test: click `Edit`, change rule, save, assert row updates.
- [ ] Link `Company Settings -> Integrations` points to `/company/settings`, but integrations live in `/settings/configuration` tab.
  - Expected: navigate to Integrations settings.
  - Current: navigates to company profile page with no Integrations section.
  - Fix: use `Link` to `/settings/configuration` with query/hash/tab support, or implement integrations in `/company/settings`.
  - Files likely needing edits: `app/company/notify-automation/page.tsx`, maybe `app/settings/configuration/page.tsx` for hash/tab opening.
  - Focused test: click link and assert Integrations content is visible.

### Ambiguous
- [ ] Master channel switches do not cascade to event rows; bulk controls do. Original behavior may expect master switches to globally disable/enable channels.
  - Recommended comparison: verify original semantics.

## `/company/team-messages`

### Working / Current Behavior From Tests
- [x] `Mark All Read` - marks all messages read and hides when unread count is zero; covered by manual workflow audit.
- [x] `+ Compose` - opens new message modal; covered by smoke/manual tests.
- [x] Inbox/Sent tabs - switch message list.
- [x] Search `Search messages...` - filters message list.
- [x] Clicking a message row - opens thread and marks selected message read.
- [x] Thread `Delete` - removes selected message.
- [x] Thread `x` - closes thread.
- [x] Reply textarea and `Send` - appends reply when non-empty; button disabled when empty.
- [x] Compose modal `x` / `Cancel` - closes modal.
- [x] Compose `To`, `Subject`, `Priority`, `Message` - controlled state.
- [x] Priority buttons `normal`, `high` - toggle priority.
- [x] `Send Message` - creates local message when `to` and `subject` are present; covered by manual workflow audit.

### Broken / Ambiguous
- [ ] `Send Message` allows empty body and gives no validation when subject is empty.
  - Expected: original may require subject/body validation.
  - Fix: disable until required fields are complete or show validation.
  - Files likely needing edits: `app/company/team-messages/page.tsx`.
  - Focused test: empty subject/body validation and successful send.

## `/settings/configuration`

### Working / Current Behavior From Code and Tests
- [x] First-surface inline `Custom Status` input, color swatches, `Add Custom Status` - adds status via Supabase if possible, local fallback otherwise; covered by `tests/configuration-behavior.spec.ts`.
- [x] First-surface per-custom-status `Delete` - deletes local/remote status.
- [x] `Change Password` fields and button - validates required fields and matching confirmation, then shows local notice.
- [x] Additional Settings tabs `General`, `Client Statuses`, `Dispute Statuses`, `Round Settings`, `Notifications`, `Portal`, `Service Plans`, `Tags`, `Integrations` - switch panels; covered by smoke test.
- [x] General fields `Company Name`, `Company Email`, `Phone Number`, `Business Address`, `Timezone`, `Date Format`, `Currency`, `Primary Brand Color` - controlled state.
- [x] `Save General Settings` - saves General settings to `localStorage`; covered by `tests/configuration-behavior.spec.ts`.
- [x] Client/Dispute `+ Add Status` - opens modal.
- [x] Add Status modal color swatches - update color preview.
- [x] Add Status modal `Cancel` - closes modal.
- [x] Add Status modal `Add Status` - adds remote/local status; covered by tests.
- [x] Custom status row `x` - deletes status.
- [x] Round Setting numeric inputs and toggles - update local state.
- [x] `Save Round Settings` - shows session-only saved notice.
- [x] Notification sender inputs and trigger toggles - update local state.
- [x] `Save Notification Settings` - shows session-only saved notice.
- [x] Portal URL/welcome/toggles - update local state.
- [x] `Save Portal Settings` - shows session-only saved notice.
- [x] Service Plans `+ Add Plan` - opens inline form.
- [x] Service Plans `Activate` / `Deactivate` - toggles local plan active state.
- [x] New Service Plan `Cancel` - closes form.
- [x] New Service Plan `Add Plan` - adds local plan.
- [x] Tags input, color swatches, Enter key, `+ Add Tag` - add local tags.
- [x] Tag `x` - removes local tag.
- [x] Integrations and Webhook Endpoint fields - render read-only status/URLs.

### Broken / Needs Real Fix
- [ ] `Change Password` does not call Supabase/auth update.
  - Expected: real password change.
  - Current: local validation and notice only.
  - Fix: call `supabase.auth.updateUser({ password })` after verifying current password flow as supported by product auth design.
  - Files likely needing edits: `app/settings/configuration/page.tsx`, auth helper/API if required.
  - Focused test: mock auth update success/failure and assert messages.
- [ ] `Save Round Settings`, `Save Notification Settings`, `Save Portal Settings` are session-only.
  - Expected: durable settings.
  - Current: `setTimeout` saved notice only.
  - Fix: persist to Supabase/settings table or localStorage if intentionally local.
  - Files likely needing edits: `app/settings/configuration/page.tsx`, settings persistence helper.
  - Focused test: save, reload, assert values persist.
- [ ] Service Plans are local-only.
  - Expected: durable CRUD for plans.
  - Current: add/toggle only in React state.
  - Fix: connect to service plans table/API.
  - Files likely needing edits: `app/settings/configuration/page.tsx`.
  - Focused test: add/toggle plan, reload, assert persistence.
- [ ] Tags are local-only.
  - Expected: durable tag management.
  - Current: add/delete only in React state.
  - Fix: connect to tags table/API or localStorage.
  - Files likely needing edits: `app/settings/configuration/page.tsx`.
  - Focused test: add/delete tag, reload, assert persistence.
- [ ] Integrations statuses are read-only and cannot connect/configure missing services.
  - Expected: connect/configure Twilio, SendGrid, DocuSign, etc.
  - Current: display-only environment status.
  - Fix: add configuration actions or route to setup docs/forms.
  - Files likely needing edits: `app/settings/configuration/page.tsx`, integration setup routes/API.
  - Focused test: missing integration exposes a setup action and expected modal/route.
- [ ] Webhook endpoint inputs have no copy action.
  - Expected: copy webhook URL.
  - Current: read-only text only.
  - Fix: add copy buttons with clipboard feedback.
  - Files likely needing edits: `app/settings/configuration/page.tsx`.
  - Focused test: click copy webhook URL, assert copied feedback.

### Ambiguous / Needs Original Comparison
- [ ] Page has both first-surface `Custom Status` and tabbed `Client Statuses` / `Dispute Statuses` custom status flows.
  - Current tests indicate this was intentional for parity, but it creates duplicate status entry paths.
  - Recommendation: compare original expected IA before consolidating.

## `/configuration`

### Broken / Placeholder
- [ ] Route renders only `Configuration` heading with no settings controls.
  - Expected: likely alias to `/settings/configuration` or full configuration page.
  - Current: placeholder only.
  - Fix: redirect to `/settings/configuration` or render the same configuration component.
  - Files likely needing edits: `app/configuration/page.tsx`.
  - Focused test: visit `/configuration`, assert redirect or full settings controls visible.

## Existing Targeted Test Coverage Observed

- [x] `tests/company-settings-save-behavior.spec.ts` covers `/company/settings` controlled save/cancel.
- [x] `tests/company-settings-pages-smoke.spec.ts` covers presence/smoke for requested routes and some modals.
- [x] `tests/portals-save-behavior.spec.ts` covers `/company/portals` controlled portal save/reset.
- [x] `tests/portals-compare.spec.ts` covers portal original parity text surface.
- [x] `tests/configuration-behavior.spec.ts` covers `/settings/configuration` localStorage General save and custom status fallback.
- [x] `tests/configuration-parity.spec.ts` covers configuration first visible surface parity.
- [x] `tests/manage-emails-workflow.spec.ts` covers template create/edit/save and SMTP local save.
- [x] `tests/images-documents-workflow.spec.ts` covers fake upload, rename, download status.
- [x] `tests/notify-automation-workflow.spec.ts` covers bulk toggle/save and new automation rule.
- [x] `tests/manual-workflow-audit.spec.ts` includes `/company/images-documents`, `/company/team-messages`, `/company/settings`, but is broad and not company/settings-only.
- [x] `tests/save-buttons-no-error.spec.ts` covers save buttons for `/company/settings`, `/company/portals`, and `/automation`; does not cover most broken company/settings save buttons.

## Recommended Focused Tests To Create/Update

- [ ] Add `tests/company-settings-controls-audit.spec.ts` for `/company/settings`: timezone, fax, office hours, logo, brand colors save/reset behavior.
- [ ] Add `tests/portals-buttons-audit.spec.ts`: `BACK`, each `WATCH VIDEO`, logo selected/saved behavior.
- [ ] Add `tests/manage-portal-content-actions.spec.ts`: edit article, empty create validation, delete confirmation if desired.
- [ ] Add `tests/credit-monitoring-save.spec.ts`: provider URL/toggle save confirmation and retained values.
- [ ] Add `tests/digital-contracts-workflows.spec.ts`: workflow tab panels, saved body visible in view, send status.
- [ ] Add `tests/self-service-signup-wizard.spec.ts`: required field validation, agreement gating, finish behavior, embed copy.
- [ ] Add `tests/client-auto-signup-actions.spec.ts`: build form action, save settings action, authorize card result.
- [ ] Update `tests/images-documents-workflow.spec.ts`: use fixture upload and assert actual file name; add grid download/share/delete coverage.
- [ ] Update `tests/manage-emails-workflow.spec.ts`: email log `Resend`, SMTP test success/failure.
- [ ] Update `tests/notify-automation-workflow.spec.ts`: rule `Edit`, integrations link destination.
- [ ] Update `tests/configuration-behavior.spec.ts`: password auth call, round/notification/portal persistence, webhook copy.
- [ ] Add `/configuration` alias test: redirect to `/settings/configuration` or full configuration controls.

## Highest-Priority Real Fixes

1. [ ] Wire dead buttons: `/company/portals` `BACK` and `WATCH VIDEO`; `/company/credit-monitoring` `Save Settings`; `/company/client-auto-signup` `Build Signup Form`, `Save Settings`, `Authorize Card`; `/company/manage-portal-content` `Edit`; `/company/manage-emails` `Resend`; `/company/notify-automation` rule `Edit`; `/company/self-service-signup` `Finish`.
2. [ ] Make visible settings save or remove them: `/company/settings` timezone/fax/office/logo/colors; `/company/portals` logo; `/settings/configuration` session-only settings if production persistence is expected.
3. [ ] Replace fake workflows with real or clearly labeled local behavior: image upload/download, SMTP test, credit monitoring test, digital contract workflow tabs, card authorization.
4. [ ] Fix navigation targets: `/company/notify-automation` Integrations link and `/configuration` placeholder route.
