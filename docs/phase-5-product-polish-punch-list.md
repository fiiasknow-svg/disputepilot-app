# Phase 5 Product Polish Punch List

Date: 2026-05-14

Scope: documentation-only audit of the main authenticated app pages before broad UI changes. This punch list does not change runtime behavior, RLS, migrations, or tests.

Current checkpoint:
- Production RLS is complete for active business tables.
- dp_auth route-shell bridge is hardened in production.
- Client portal isolation planning and disposable verification are complete.
- Duplicate React key warnings were fixed.
- Final live smoke audit checklist exists.
- Full automated suite previously passed 225/225.

## Cross-App Findings

1. High: Encoding artifacts appear across multiple pages as mojibake strings such as `â€¦`, `â€”`, `â†“`, `âœ“`, and `ðŸŽ‚`.
   Recommended fix: normalize source files to valid UTF-8 and replace decorative glyphs with the existing icon system or plain text.

2. High: Several pages optimistically update local UI after Supabase failures or fall back to localStorage without always making the remote/local state obvious.
   Recommended fix: standardize save/delete status banners with "saved remotely", "saved locally", and actionable failure messages.

3. High: Several database-backed actions catch errors with empty `catch {}` blocks.
   Recommended fix: surface user-safe error text and log structured detail in development only.

4. High: Dashboard contains offscreen exact-match text used for test compatibility.
   Recommended fix: remove hidden/ghost UI text after tests are moved to semantic visible selectors.

5. Medium: Tables are dense and depend on horizontal scrolling on small screens.
   Recommended fix: define compact mobile card/list alternatives for high-use pages rather than relying only on wide tables.

6. Medium: Modals commonly use fixed desktop widths with two-column grids.
   Recommended fix: use responsive single-column layouts below tablet widths and set predictable max heights.

7. Medium: Many controls are icon-only or symbol-heavy without consistent visual treatment.
   Recommended fix: use a single button/icon pattern with accessible labels and consistent hover/disabled states.

8. Medium: Bulk actions frequently complete without enough confirmation detail.
   Recommended fix: show target counts, skipped records, and remote failure counts for bulk updates, deletes, import, and email flows.

9. Medium: Configuration and portal settings appear editable even where persistence is simulated or not yet production-backed.
   Recommended fix: mark staged settings clearly or persist them through account-scoped settings before presenting them as live configuration.

10. Low: Copy uses mixed product language: "client", "customer", "lead", "affiliate", "staff", and "employee" are not always differentiated.
    Recommended fix: define a small product terminology guide and apply it consistently.

## Page Punch List

### Dashboard

Priority: High

Visual issues:
- Multiple emoji/icon strings render as mojibake, making the page look broken.
- The page is visually dense with many cards, inbox panels, task areas, and chart placeholders competing for attention.
- Hidden offscreen exact-match strings are present for tests and should not remain part of the UI implementation.

Confusing wording:
- "Total Deletion" should likely be "Total Deletions".
- "No Text Message Yet" and "No Reminder Yet" read awkwardly.
- "Customer Search" mixes customer language with the rest of the app's client terminology.

Form/layout issues:
- Quick lead creation and task/reminder controls do not make persistence or outcome clear.
- Search/apply/read/delete actions are visually available even when the target or result is ambiguous.

Workflow friction:
- Users can see many calls to action, but the highest-priority dashboard workflow is not obvious.
- Notification/message sections look actionable but do not clearly show connected data sources or empty-state next actions.

Responsive/mobile concerns:
- Fixed three-column and four-card grid patterns are likely cramped on tablet and mobile widths.

Recommended fix:
- First normalize icons/text encoding, then simplify the dashboard into a small set of real production metrics and visible workflows.

### Employees

Priority: High

Visual issues:
- Export, invite, edit, permissions, activity, remove, close, and pagination controls include broken glyphs in some file output.
- The table is dense and uses many small icon buttons close together.

Confusing wording:
- "Staff members" and "employees" are both used; choose one user-facing label.
- "Remove" should clarify whether the action deletes an employee record or deactivates access.

Form/layout issues:
- Add/edit modals use fixed widths and two-column grids.
- Permissions are shown as a preview rather than a real editable permission model.

Workflow friction:
- Status changes and bulk actions optimistically update the UI even when backend operations may fail.
- Invite workflow appears simulated and should clearly state whether an invitation was actually sent.

Responsive/mobile concerns:
- Four stat cards, filters, bulk action bar, and a `minWidth: 900` table make the page hard to use on narrow screens.

Recommended fix:
- Add consistent visible result banners for invite/status/delete operations and convert mobile employee rows to a compact card pattern.

### Leads

Priority: High

Visual issues:
- Encoding artifacts appear in labels, actions, and pagination.
- Six stat cards and the kanban columns create a wide, busy first screen.

Confusing wording:
- "Convert" needs a clearer destination, such as "Convert to Client".
- Bulk email completion currently depends on browser-style feedback rather than a durable in-page result.

Form/layout issues:
- Lead create/edit uses a fixed-width modal with many fields.
- CSV import has limited visible validation guidance for required and ignored columns.

Workflow friction:
- Local fallback can make a save look successful even when Supabase did not persist it.
- Bulk delete/status/email flows should show skipped and failed records.

Responsive/mobile concerns:
- `repeat(6, 1fr)` stat cards, 240px kanban columns, and a `minWidth: 1000` table will require significant horizontal movement.

Recommended fix:
- Preserve the production-safe save path but make remote save failures visible and improve import/bulk-action result summaries.

### Clients

Priority: High

Visual issues:
- Encoding artifacts appear in comments and select placeholders in the source and may surface in rendered options.
- Five stat cards and dense table/card views compete for attention.

Confusing wording:
- "Type / Category" overlaps with lead/client lifecycle language.
- "Portal Access Enabled" can be misunderstood as identity authorization, even though portal isolation planning says it is only a flag.

Form/layout issues:
- The client form contains basic info, personal data, address, service, billing, referral, portal, tags, and notes in one long modal.
- Sensitive fields such as SSN last 4 and DOB should be visually separated and handled with stronger privacy cues.

Workflow friction:
- Bulk update/delete and email flows need clearer result reporting.
- Client view/edit/import/email modals are separate experiences with uneven confirmation behavior.

Responsive/mobile concerns:
- The page uses a five-column stat grid, wide filters, dense table columns, and several fixed-width dialogs.

Recommended fix:
- Split add/edit client into clear sections with progressive disclosure, and clarify that portal access is only an account feature flag.

### Billing

Priority: Medium

Visual issues:
- Billing summary, invoices, payments, services, detail modals, and action buttons are functional but visually generic.
- The page is mostly local/demo state, which can feel production-ready without being connected to durable billing records.

Confusing wording:
- "Services / Products" may need one product taxonomy that matches pricing and invoicing.
- Payment history and payments can feel redundant without clear distinction.

Form/layout issues:
- Create invoice, payment, and service forms share a large two-column modal pattern.
- Client/service selectors are string based and can be ambiguous when clients have duplicate names.

Workflow friction:
- Billing saves are localStorage-driven and do not create production invoice/payment records through a visible remote path.
- There is no explicit failed-save state because the page does not attempt full persistence for all billing objects.

Responsive/mobile concerns:
- Tables scroll horizontally, and the 720px modal will need better mobile spacing.

Recommended fix:
- Label local/demo billing behavior clearly or wire billing actions to account-scoped Supabase tables before launch-level polish.

### Disputes

Priority: Medium

Visual issues:
- The dispute list has many columns including repeated bureau inclusion columns, making each row hard to scan.
- Status and detail views use mostly raw text instead of clear status hierarchy.

Confusing wording:
- "Letters", "Accounts", and "Action" are broad labels; "Letter Template", "Account/Creditor", and "View Details" would be clearer.
- The create form mixes round, bureau, reason, account, and letter in one two-column block.

Form/layout issues:
- Create dispute uses a 720px modal and a dense two-column grid.
- The status page has multiple filters, three views, batch actions, export, details panel, and inline status controls on one screen.

Workflow friction:
- The main Dispute Center appears local-state oriented while Dispute Status reads production disputes, creating a possible mental split.
- Status updates should show success/failure state and batch result counts.

Responsive/mobile concerns:
- Wide tables and the status page's optional `1fr 360px` details layout will be cramped on mobile.

Recommended fix:
- Align Dispute Center and Dispute Status around one production data model and reduce visible columns to the most actionable fields.

### Calendar

Priority: High

Visual issues:
- Birthday auto-events include mojibake.
- Event colors carry meaning, but the UI needs clearer text labels so color is not the only signal.

Confusing wording:
- Event types such as `followup`, `deadline`, and `other` should be displayed as human-readable labels.
- It is not obvious which events are auto-generated versus manually created until edit restrictions are encountered.

Form/layout issues:
- Add/edit event form includes date, time, all-day, type, client, agent, location, recurrence, reminder, and color in one modal.
- Static agent choices do not appear tied to production employees.

Workflow friction:
- Remote calendar insert/update/delete failures are caught silently while the UI updates local state.
- Imported/generated lead, invoice, dispute, and birthday events are mixed with manual events without a strong source indicator.

Responsive/mobile concerns:
- Month/week/day/agenda views, filter controls, and event cells are inherently dense and need mobile-specific navigation.

Recommended fix:
- Add visible source badges and save/delete error banners, then prioritize a mobile agenda-first view.

### Affiliates

Priority: Medium

Visual issues:
- Main tabs and filter pills are clear, but the table is sparse and has limited hierarchy between person, company, and referral code.
- The "Documents & Commissions" tab risks looking complete even if downstream data is not wired.

Confusing wording:
- "Manage Affiliate" should be plural or action-oriented, such as "Affiliates".
- "Lead" as an affiliate status can be confused with the Leads module.

Form/layout issues:
- The add form is intentionally production-safe, but the table should consistently show full name, company, email, phone, referral code, status, and notes.
- Delete behavior is RLS-safe, but the UI should distinguish local-only rows from remote rows.

Workflow friction:
- Save failures now show visible errors, but local fallback rows still need a clear persistence state.
- Filtering defaults to Active, so newly saved non-active affiliates can appear to disappear unless the user changes filters.

Responsive/mobile concerns:
- The table will need card rows on mobile because company/email/referral/status/actions are hard to scan in columns.

Recommended fix:
- Add a visible "All" filter or post-save filter handling so saved affiliates remain findable after save/reload.

### Settings / Configuration

Priority: High

Visual issues:
- Many tabs and controls are packed into a single configuration surface.
- Encoding artifacts appear in comments and saved-state labels.

Confusing wording:
- Portal settings are presented next to production settings even though portal routes/schema/RLS are staged and not applied to production.
- Integrations/settings labels do not always indicate whether a setting is live, local-only, or placeholder.

Form/layout issues:
- General, statuses, rounds, notifications, portal, plans, tags, and integrations all use page-local state patterns with different persistence behavior.
- Statuses attempt Supabase persistence, while many other settings simulate saving with timers.

Workflow friction:
- Users can click save and receive "Saved" feedback for settings that may not persist beyond the current page state.
- Statuses table was skipped in production because the table does not exist, so status management needs a production readiness decision.

Responsive/mobile concerns:
- The tab strip scrolls horizontally, and many settings grids use two or three fixed columns.

Recommended fix:
- Add a configuration persistence map before UI polish: live account setting, staged setting, or placeholder.

## Recommended First 3 Fixes

1. Normalize encoding and replace decorative glyphs/icons across the audited pages.
   This is the most visible product-quality issue and should not require database or RLS changes.

2. Standardize visible remote/local/error states for Supabase-backed saves, deletes, bulk actions, and fallback localStorage saves.
   This reduces user confusion after production RLS and schema hardening.

3. Make high-use list pages responsive by introducing card/list mobile layouts for employees, leads, clients, affiliates, disputes, and calendar agenda.
   This addresses the largest usability gap without changing backend behavior.

## Non-Goals For This Pass

- No runtime app behavior changes.
- No RLS, migration, or production database changes.
- No test weakening or hidden text additions.
- No broad visual redesign before the punch list is reviewed.
