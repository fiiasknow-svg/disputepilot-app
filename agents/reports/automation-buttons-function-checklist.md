# Automation Buttons Function Checklist

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app\` was not inspected or edited. No app files, test files, commits, pushes, or fixes were made.

Sources inspected:
- `app/automation/page.tsx`
- `app/leads/website-lead-form/page.tsx`
- `app/academy/credit-repair/page.tsx`
- `app/academy/automation/page.tsx`
- `components/AcademyPage.tsx`
- `components/CDMLayout.tsx`
- `app/company/notify-automation/page.tsx` as the only other automation route found in `app/`
- Existing automation-related specs:
  - `tests/automation-service-pages-smoke.spec.ts`
  - `tests/automation-save-behavior.spec.ts`
  - `tests/automation-compare.spec.ts`
  - `tests/notify-automation-workflow.spec.ts`
  - `tests/notify-automation-actions.spec.ts`
  - `tests/manual-workflow-audit.spec.ts`
  - `tests/operational-pages-smoke.spec.ts`
  - `tests/workflow-interactions-smoke.spec.ts`

Not found in root `app/`:
- `/automation/ai-credit-coach`
- `/automation/zapier`
- `/automation/go-highlevel`
- `/automation/website-lead-nurturing`

The Next.js route docs in `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` confirm nested app routes require nested folders with `page` files. Only `app/automation/page.tsx` exists under `app/automation`.

## Working Buttons / Links

| Route / Area | Visible label / control | Expected behavior | Current behavior from code/tests | Type | Needs real fix? |
|---|---|---|---|---|---|
| Sidebar | `Automation` | Navigate to Automation page. | `components/CDMLayout.tsx` links to `/automation`; route exists. | Navigates | No |
| Sidebar | `Zapier Automation` | Navigate to Zapier automation area. | Links to `/automation`, not a Zapier-specific route. Route loads, but not Zapier-specific. | Navigates | Ambiguous; likely yes if original had a separate Zapier page |
| Sidebar | `Go-HighLevel` | Navigate to GoHighLevel integration area. | Links to `/automation`, not a GoHighLevel-specific route. Route loads, but not GHL-specific. | Navigates | Ambiguous; likely yes if original had a separate GHL page |
| Sidebar | `Website Lead Nurturing` | Navigate to website lead nurturing/form area. | Links to `/leads/website-lead-form`; route exists and controls work locally. | Navigates | Ambiguous label mismatch; likely yes if original had nurturing workflows |
| Sidebar | `AI Credit Coach` | Navigate to AI Credit Coach. | Links to `/academy/credit-repair`, which is a course page, not an AI coach route. | Navigates | Ambiguous; likely yes |
| Help menu | `AI Credit Coach` | Open AI Credit Coach guidance. | `<a href="/academy/credit-repair">`; navigates to course page. | Navigates | Ambiguous; likely yes |
| `/leads/website-lead-form` | `Preview` | Open form preview modal. | Calls `setShowPreview(true)`; smoke test clicks it and expects `Form Preview`. | Opens modal / previews | No |
| `/leads/website-lead-form` | Preview modal `x` | Close modal. | Calls `setShowPreview(false)`. Existing test only checks visible. | Closes modal | No |
| `/leads/website-lead-form` | `Publish` | Publish or expose embed details. | Saves settings to `localStorage`, sets `published`, shows embed snippet and status. | Publishes locally / saves | No for current local behavior; yes if backend publishing required |
| `/leads/website-lead-form` | `Save` | Save form configuration. | Saves settings to `localStorage`, shows status. | Saves locally | No for current local behavior; yes if persistence must be server-backed |
| `/leads/website-lead-form` | `Short Form`, `Wide Form`, `Website`, `Affiliate` radio controls | Change form style. | Updates `formStyle` state; saved/published with settings. | Selects / edits | No |
| `/leads/website-lead-form` | Required field checkboxes: `First Name`, `Last Name`, `Phone`, `Email` | Toggle required status. | Updates `required` state and preview required marker. | Toggles | No |
| `/leads/website-lead-form` | Form field checkboxes: `First Name`, `Last Name`, `Address`, `City`, `State`, `Zip`, `Phone`, `Email`, `Comments`, `Email Id`, `Phone (Mobile)`, `Phone (Home)`, `Phone (Work)`, `Message`, `How did you hear about us` | Show/hide fields in preview. | Updates `fields` state and visible preview fields. | Toggles | No |
| `/leads/website-lead-form` | `Form Title` input | Change preview title. | Updates `title` state and preview. | Edits | No |
| `/leads/website-lead-form` | `Custom Subtitle` input | Change subtitle/company copy. | Updates `company` state and inline preview. Modal preview does not render subtitle. | Edits | Minor ambiguous gap |
| `/leads/website-lead-form` | Background color swatches | Change preview background color. | Updates `bgColor`; visible in inline/modal preview. | Edits / previews | No |
| `/leads/website-lead-form` | Button color swatches | Change submit button color. | Updates `btnColor`; visible in inline/modal preview. | Edits / previews | No |
| `/leads/website-lead-form` | `Font Size` select | Change preview field/button font size. | Updates `fontSize`; visible in preview. | Edits | No |
| `/leads/website-lead-form` | `Font Family` select | Change preview font family. | Updates `fontFamily`; visible in preview. | Edits | No |
| `/leads/website-lead-form` | `Button Text` input | Change submit button label. | Updates `btnText`; visible in preview and modal button. | Edits | No |
| `/leads/website-lead-form` | Modal submit button, default `Submit` | Test preview submission without creating a lead. | Sets status: `Preview submission captured locally. No lead was created from preview mode.` | Submits preview locally | No |
| `/academy/credit-repair` via AI Credit Coach links | `Begin Course ->` | Start first lesson. | `AcademyPage` sets active lesson to module 0 lesson 0. Existing smoke verifies visibility only. | Opens lesson / edits state | No for course behavior; not an AI coach |
| `/academy/credit-repair` and `/academy/automation` | Module header buttons | Expand/collapse module lesson list. | Updates `expandedModule`. | Opens/collapses | No |
| `/academy/credit-repair` and `/academy/automation` | Lesson row | Select lesson content. | Sets `activeLesson`. | Opens/selects | No |
| `/academy/credit-repair` and `/academy/automation` | Lesson completion circle | Toggle one lesson complete. | Updates local `completed` set. | Toggles | No for local course progress |
| `/academy/credit-repair` and `/academy/automation` | `Mark Complete` / `✓ Completed` | Toggle active lesson completion. | Updates local `completed` set and progress. | Toggles | No for local course progress |
| `/academy/credit-repair` and `/academy/automation` | Certificate button, e.g. `24 lessons left`, `21 lessons left` | Disabled until all lessons complete. | Button is disabled until `allDone`; no download implementation is attached after completion. | Disabled / ambiguous download | Yes if certificate download is expected |
| `/company/notify-automation` | `Save Settings` | Save notification settings. | Sets transient saved status only; existing specs verify success text. | Saves locally / status | No for local demo behavior; yes if persistence required |
| `/company/notify-automation` | `Notification Settings` / `Automation Rules` | Switch main tabs. | Updates `mainTab`; specs use this. | Filters / switches tab | No |
| `/company/notify-automation` | Master channel switches | Enable/disable master email/SMS/portal flags. | Toggle only master state; does not cascade to event rows. | Toggles | Ambiguous |
| `/company/notify-automation` | Bulk `All On` / `All Off` for Email/SMS/Portal | Enable/disable all event rows for a channel. | Updates every event row channel state. Spec clicks `All Off` and saves. | Toggles | No |
| `/company/notify-automation` | Search events input | Filter visible events. | Filters by event/description. | Filters | No |
| `/company/notify-automation` | Category buttons: `All`, `Client`, `Dispute`, `Invoice`, `Client Portal`, `Lead` | Filter events by category. | Updates `category` state. | Filters | No |
| `/company/notify-automation` | Per-event Email/SMS/Portal toggles | Toggle notification channel per event. | Updates event channel state. | Toggles | No |
| `/company/notify-automation` | Delay number inputs | Edit delay days. | Updates event delay state. | Edits | No |
| `/company/notify-automation` | `Company Settings -> Integrations` | Navigate to integrations configuration. | Links to `/settings/configuration?tab=Integrations#integrations`; existing spec verifies URL and `Connected Services`. | Navigates | No |
| `/company/notify-automation` | `+ New Rule` | Open automation rule modal. | Opens modal and resets form. Existing specs use it. | Opens modal | No |
| `/company/notify-automation` | Rule active toggle | Activate/deactivate rule. | Updates rule `active` state. | Toggles | No |
| `/company/notify-automation` | Rule `Edit` | Open edit modal with rule data. | Opens modal; existing spec edits and saves. | Opens modal / edits | No |
| `/company/notify-automation` | Rule `Delete` | Delete rule. | Immediately removes rule with no confirmation. | Deletes | Ambiguous; likely needs confirmation |
| `/company/notify-automation` | Modal `x` / `Cancel` | Close rule modal. | Closes modal and clears edit id. | Closes modal | No |
| `/company/notify-automation` | `Create Rule` / `Save Rule` | Add or update rule. | Adds/updates local state if name and trigger are filled; specs verify. | Saves locally | No for local behavior; yes if persistence required |
| `/company/notify-automation` | Rule form fields: `Rule Name`, `Trigger Event`, `Action`, `Delay`, `Channel` | Configure automation rule. | Updates `newRule` state. | Edits | No |

## Broken / Non-Functional Buttons

| Route / Area | Visible label / control | Expected behavior | Current behavior from code/tests | Type | Recommended exact fix | Files likely needing edits | Focused test to create/update |
|---|---|---|---|---|---|---|---|
| `/automation` | `Save` | Save automation/integration/workflow settings or show a clear saved status. | Plain server-rendered `<button>` with no `onClick`, no form, no state, no server action. Existing `automation-save-behavior.spec.ts` only clicks the first matching button and asserts no app error, so it does not prove save behavior. | Does nothing | Convert `app/automation/page.tsx` to a client component or wire a server action. Add state for workflow/integration settings and show a status such as `Automation settings saved.` after click. | `app/automation/page.tsx`; possibly new persistence helper in `lib/` if server-backed | Update `tests/automation-save-behavior.spec.ts` to click `Save` and expect a role `status` message or persisted UI after reload. |
| `/automation` | `Zapier` | Open Zapier settings, navigate to `/automation/zapier`, or filter to Zapier-specific workflows. | Plain `<button>` with no handler. No `/automation/zapier` route exists. Tests only verify visibility. | Does nothing | Create `app/automation/zapier/page.tsx` or implement a tab state on `/automation`. Include connect/test/copy webhook controls if expected by original. | `app/automation/page.tsx`; maybe `app/automation/zapier/page.tsx`; `components/CDMLayout.tsx` if sidebar should point there | Add `tests/zapier-automation.spec.ts`: visit `/automation/zapier` or click tab, assert Zapier panel opens, click connect/test/copy controls and verify visible outcomes. |
| `/automation` | `Go-HighLevel` | Open GoHighLevel integration settings or navigate to `/automation/go-highlevel`. | Plain `<button>` with no handler. No `/automation/go-highlevel` route exists. Tests only verify visibility. | Does nothing | Create `app/automation/go-highlevel/page.tsx` or implement tab state. Add connect/test/save controls with visible statuses. | `app/automation/page.tsx`; maybe `app/automation/go-highlevel/page.tsx`; `components/CDMLayout.tsx` | Add `tests/highlevel-automation.spec.ts`: visit route or tab, assert fields/buttons, click connect/test/save and verify statuses. |
| `/automation` | `GHL` | Likely alias for GoHighLevel tab/filter. | Plain `<button>` with no handler and duplicates `Go-HighLevel`. | Does nothing | Remove duplicate alias or make it select the same GHL panel with a clear active state. | `app/automation/page.tsx` | Extend HighLevel spec to ensure only one canonical GoHighLevel entry or that alias selects the same panel. |
| `/automation` | `Enable` | Enable/disable automations or filter enabled workflows. | Plain `<button>` with no handler. Table rows show static text `Enabled`; no row-level toggles. | Does nothing | Replace with a real global enable toggle or row-level switches. Persist enabled state and update the table/status. | `app/automation/page.tsx` | Update `tests/automation-save-behavior.spec.ts`: click `Enable`, assert enabled/disabled state changes, save, reload if persistence exists. |
| `/automation` table | Static `Enabled` values in `Enable` column | Let user toggle each workflow. | Static text only. | Does nothing | Replace text with accessible toggle buttons/switches per workflow row. | `app/automation/page.tsx` | Add focused row-toggle test for `Client Onboarding` and `Payment Reminder`. |
| `/automation/ai-credit-coach` | Route itself | Load AI Credit Coach automation page. | No route file exists under `app/automation`. | Missing navigation target | Add `app/automation/ai-credit-coach/page.tsx` or redirect intentionally to the correct AI coach route. | `app/automation/ai-credit-coach/page.tsx`; `components/CDMLayout.tsx` | Add `tests/ai-credit-coach.spec.ts` route smoke and interaction test. |
| `/automation/zapier` | Route itself | Load Zapier automation page. | No route file exists under `app/automation`. | Missing navigation target | Add route or intentional redirect. | `app/automation/zapier/page.tsx`; `components/CDMLayout.tsx` | Add `tests/zapier-automation.spec.ts`. |
| `/automation/go-highlevel` | Route itself | Load GoHighLevel automation page. | No route file exists under `app/automation`. | Missing navigation target | Add route or intentional redirect. | `app/automation/go-highlevel/page.tsx`; `components/CDMLayout.tsx` | Add `tests/highlevel-automation.spec.ts`. |
| `/automation/website-lead-nurturing` | Route itself | Load website lead nurturing workflows. | No route file exists under `app/automation`. Sidebar points to `/leads/website-lead-form` instead. | Missing navigation target | Add route for nurture sequence controls or rename/sidebar link to match current form builder scope. | `app/automation/website-lead-nurturing/page.tsx`; `components/CDMLayout.tsx`; possibly `app/leads/website-lead-form/page.tsx` | Add `tests/nurturing-automation.spec.ts`: route loads, controls edit/save/test/send sequence behavior. |
| `/leads/website-lead-form` published embed | No visible `Copy` button for embed snippet | Users likely need to copy embed code after publish. | Publish displays `<code>` only; no copy control. | Missing copy action | Add `Copy Embed` button using `navigator.clipboard.writeText(embedSnippet)` and role `status` confirmation. | `app/leads/website-lead-form/page.tsx` | Update `tests/automation-service-pages-smoke.spec.ts` or add `tests/nurturing-automation.spec.ts`: publish, click `Copy Embed`, expect copied status. |
| `/leads/website-lead-form` published public URL | Public URL placeholder `/public/forms/website-lead-form` | Should open a real public form if this is production functionality. | Placeholder text only; no route verified or link rendered. | Does nothing / placeholder | Create actual public form route or change copy to clearly say local preview only. | `app/leads/website-lead-form/page.tsx`; maybe `app/public/forms/website-lead-form/page.tsx` | Add route test for public form submission if created. |
| `/academy/credit-repair` reached as AI Credit Coach | AI Credit Coach controls | Should provide AI credit coach guidance/chat/action controls based on route name. | Page is `Credit Repair Specialist` academy course. No AI coach input, generate, send, copy, or chat controls. | Wrong target / missing feature | Either create a real AI Credit Coach route/page or rename sidebar/help labels to `Credit Repair Specialist`. | `components/CDMLayout.tsx`; `app/automation/ai-credit-coach/page.tsx` or `app/academy/credit-repair/page.tsx` | Add `tests/ai-credit-coach.spec.ts`: AI Coach route exposes prompt/input, generate/send/copy controls, and output status. |
| `/academy/*` certificate button after completion | `Download Certificate` | Download certificate. | Button label changes after all lessons complete but has no `onClick`; disabled only when not all done. | Does nothing after enabled | Attach download/generate action or status. | `components/AcademyPage.tsx` | Add academy completion test for all lessons complete and certificate click outcome. |

## Ambiguous Buttons Needing Original Comparison

| Area | Item | Why ambiguous | Suggested original comparison |
|---|---|---|---|
| Sidebar | `Zapier Automation` -> `/automation` | Could be intentional consolidated automation page, but label implies a dedicated Zapier integration. | Compare original sidebar href and destination page. |
| Sidebar | `Go-HighLevel` -> `/automation` | Label implies a dedicated integration page. | Compare original GHL route and required connect/test fields. |
| Sidebar | `Website Lead Nurturing` -> `/leads/website-lead-form` | Current target is a form builder, not nurture workflows. | Check whether original had drip sequence, SMS/email cadence, send test, or Zapier/GHL handoff. |
| Sidebar/help | `AI Credit Coach` -> `/academy/credit-repair` | Current target is a static academy course. | Check whether original had coach chat, credit advice generator, or prompt workflow. |
| `/automation` | Top-level workflow table | Current table is static sample data. | Compare original workflow controls: create/edit/delete, enable toggles, test action, integration status, save behavior. |
| `/company/notify-automation` | Master channel switches | They toggle only master flags and do not cascade to per-event rows. | Check whether original master switches were intended as global gates or visual preferences. |
| `/company/notify-automation` | Rule delete | Deletes immediately. | Check whether original required confirmation/undo. |
| `/leads/website-lead-form` | Save/Publish local persistence | Works in `localStorage`, not backend. | Check original persistence expectations. |
| `/leads/website-lead-form` | Preview modal submit | Explicitly says no lead is created. | Check whether original preview should create test lead, send webhook, or only preview. |

## Existing Test Coverage Gaps

- `tests/automation-service-pages-smoke.spec.ts` verifies text and button visibility for `/automation`, `/academy/automation`, `/academy/credit-repair`, and `/leads/website-lead-form`. It only exercises the website lead form `Preview` modal.
- `tests/automation-save-behavior.spec.ts` clicks the first automation button matching a broad regex and only asserts no app error. Because `/automation` buttons have no handlers, this test can pass while behavior is broken.
- `tests/automation-compare.spec.ts` only checks expected text exists.
- No root test files matching `*zapier*.spec.ts`, `*highlevel*.spec.ts`, or `*nurturing*.spec.ts` were found by `rg --files`.
- `tests/notify-automation-workflow.spec.ts` and `tests/notify-automation-actions.spec.ts` cover `/company/notify-automation` local interactions and integration navigation.
- `tests/manual-workflow-audit.spec.ts`, `tests/operational-pages-smoke.spec.ts`, and `tests/workflow-interactions-smoke.spec.ts` do not directly validate `/automation` button behavior beyond broad workflow areas.

## Recommended Focused Test Plan

- Update `tests/automation-save-behavior.spec.ts` so it asserts real outcomes:
  - `Save` shows `Automation settings saved.`
  - `Zapier`, `Go-HighLevel`, and `Enable` change active panel/filter/toggle state.
  - Row enable toggles change accessible state.
- Create `tests/zapier-automation.spec.ts` once Zapier route/panel exists:
  - visit `/automation/zapier`
  - assert connect/test/copy/save controls
  - click each control and assert visible statuses
- Create `tests/highlevel-automation.spec.ts` once GoHighLevel route/panel exists:
  - visit `/automation/go-highlevel`
  - assert connect/test/save controls and connection status behavior
- Create `tests/nurturing-automation.spec.ts` once nurturing route exists:
  - visit `/automation/website-lead-nurturing`
  - assert workflow controls such as enable, edit, test send, save, delete/confirm
- Create `tests/ai-credit-coach.spec.ts` once AI Credit Coach route exists:
  - visit `/automation/ai-credit-coach`
  - assert prompt/input, generate/send/copy controls
  - verify generated guidance or error/status behavior
- Extend `tests/automation-service-pages-smoke.spec.ts` for website lead form:
  - save settings and reload to verify `localStorage` persistence
  - publish and assert embed snippet
  - when added, click `Copy Embed` and verify status

## Bottom Line

- The visible `/automation` page controls are currently non-functional placeholders.
- The requested `/automation/...` subroutes do not exist in the root app.
- Website lead form controls mostly work, but only locally and without copy/public-form behavior.
- Sidebar automation links mostly navigate, but several labels point to generic or unrelated pages.
- `/company/notify-automation` is the only automation-like area with working local workflow controls and meaningful tests.
