# Phase 5 Original-vs-Clone Parity Audit Plan

Date: 2026-05-15

Scope: plan only. This document defines the page-by-page process for matching the live clone at `https://disputepilot-app.vercel.app` to the original Client Dispute Manager app at `https://www.clientdisputemanager.com`. It does not change runtime behavior, RLS, migrations, tests, or production data.

Current checkpoint:
- Production RLS is complete for active business tables.
- `dp_auth` is hardened and must not authorize API or database access.
- The automated suite passes.
- The clone is functional, but exact original product parity has not been completed.

## Completion Rule

Do not claim a section is complete until:
- the missing/different checklist for that section is empty,
- a focused Playwright parity test passes,
- the focused workflow/behavior test for that section passes,
- no hidden text or test-only visible content was added,
- and the page still passes the full Chromium suite.

## Audit Method

For each page, compare authenticated original and clone sessions at desktop and mobile widths. Capture screenshots, visible text, sidebar state, forms, modals, and workflow behavior. Record every difference as one of:
- `missing`: original has it and clone does not,
- `different`: clone has it but label/layout/behavior differs,
- `extra`: clone has visible product behavior not present in original,
- `blocked`: original flow requires data, subscription, or permission not available during audit.

Use this checklist for every page:
- Page title/header.
- Sidebar/nav behavior, expanded groups, active item, and route naming.
- Buttons/actions, labels, order, enabled/disabled states, and icons.
- Filters/search controls, default values, reset behavior, and result counts.
- Tables/columns, column order, row actions, pagination, sorting, and bulk actions.
- Cards/stats, labels, calculations, empty values, and visual hierarchy.
- Modals/forms, fields, required markers, defaults, validation, cancel/save behavior.
- Dropdown options, option order, labels, default selection, and unavailable states.
- Empty states, loading states, local/demo states, and no-data wording.
- Success/error messages, severity, placement, auto-dismiss behavior, and exact wording.
- Save/edit/delete behavior, confirmation prompts, optimistic updates, rollback, and persistence.
- Persistence behavior after reload and across sessions.
- Responsive layout at mobile, tablet, and desktop widths.

## Recommended Audit/Fix Order

1. Sidebar/navigation shell.
2. Dashboard.
3. Clients/customers list.
4. Client profile.
5. Disputes and dispute status/manager.
6. Letters/letter vault.
7. Documents/images and digital contracts.
8. Billing/invoices/payments/services.
9. Leads.
10. Affiliates.
11. Calendar.
12. Reports.
13. Employees.
14. Company/settings/configuration.
15. Portal/client-login.

Reasoning: the shell and dashboard define the product frame; clients and disputes are the main operational workflows; letters and documents depend on dispute context; billing/leads/affiliates/calendar are high-use but more isolated; settings and portal should be aligned after core navigation and business workflows are stable.

## Existing Test Surface

Current compare-style tests include:
- `tests/sidebar-compare.spec.ts`
- `tests/compare.spec.ts`
- `tests/billing-compare.spec.ts`
- `tests/disputes-compare.spec.ts`
- `tests/letters-compare.spec.ts`
- `tests/documents-compare.spec.ts`
- `tests/company-compare.spec.ts`
- `tests/automation-compare.spec.ts`
- `tests/portals-compare.spec.ts`

Current behavior/smoke tests cover many clone routes but are not exact original parity tests. They should remain as regression coverage while new parity tests are added per page.

## Area Checklists

### Sidebar / Navigation Shell

Routes to compare:
- Original authenticated shell from dashboard and major modules.
- Clone shell across `/dashboard`, `/clients`, `/disputes`, `/letter-vault`, `/billing`, `/leads`, `/settings/configuration`.

Checklist:
- Product name, logo, trial banner, user profile block, activation prompts, help menu, sign-out location.
- Top-level nav item names and order.
- Expand/collapse behavior for Company, Dispute Manager, Letters, Billing, Leads/Affiliates, CRB Academy, Get Customers, Partner Resources.
- Active route highlighting.
- Duplicate route entries that are intentional in the original versus clone-only duplication.
- Mobile sidebar behavior and overlay/drawer behavior.

Recommended tests:
- Replace the static expected sidebar array with an original-vs-clone extraction test that records missing/different/extra nav labels.
- Add a route-by-route active state test for the highest-use pages.

### Dashboard

Routes:
- Original: `/dashboard`
- Clone: `/dashboard`

Checklist:
- Header/title, welcome text, trial/activation prompts.
- KPI cards, labels, values, icons, and ordering.
- Customer/client search, quick actions, recent activity, reminders, notifications, messages.
- Add/new customer workflow and any dashboard shortcuts.
- Empty states for no activity.
- Save/action feedback and app/runtime error behavior.
- Responsive card stacking and first-screen density.

Recommended tests:
- `tests/dashboard-parity.spec.ts`: extract headings/buttons/labels/stats from original and clone, record missing/different/extra.
- Keep `tests/dashboard.spec.ts` as workflow regression.

### Clients / Customers

Routes:
- Original customer list route identified during audit.
- Clone: `/clients`

Checklist:
- Page naming: `Customers` versus `Clients`.
- Add customer/client button, import/export actions, bulk actions.
- Search, filters, status tabs, sort, view toggle, pagination.
- Table columns and card view fields.
- Add/edit modal fields, required markers, labels, dropdown values, and sections.
- Status update behavior, delete confirmation, email/export workflows.
- Production persistence and reload behavior.
- Mobile table/card behavior.

Recommended tests:
- `tests/clients-parity.spec.ts`: list page structure, table columns, filters, action labels.
- Extend existing client behavior tests only after parity differences are fixed.

### Client Profile

Routes:
- Original client/customer profile route identified during audit.
- Clone: `/clients/[id]`

Checklist:
- Profile header, customer identity block, status, assigned employee/agent.
- Tabs/sections for overview, disputes, letters, documents, invoices, notes, portal, activity.
- Edit controls and field layout.
- Related records visibility and empty states.
- Back navigation and breadcrumbs.
- Save/delete/persistence behavior.
- Mobile profile layout.

Recommended tests:
- `tests/client-profile-parity.spec.ts`: seeded or fixture profile route comparison.
- Keep `tests/client-view-profile-behavior.spec.ts` for clone workflow regression.

### Disputes

Routes:
- Original: `/User/DisputeCenter` or confirmed equivalent.
- Clone: `/disputes`

Checklist:
- Page title and dispute center labels.
- Create dispute action and form fields.
- Client, bureau, creditor/account, reason, round, letter/template fields.
- Table columns: client, status, round, bureau flags, letters, accounts, date, action.
- Filters/search and bulk actions.
- View/edit modal behavior.
- Save persistence and reload behavior.
- Responsive table behavior.

Recommended tests:
- Strengthen `tests/disputes-compare.spec.ts` from static clone-only expected labels to original-vs-clone extracted differences.
- Keep `tests/disputes-create-behavior.spec.ts` for workflow regression.

### Dispute Status / Manager

Routes:
- Original dispute status route identified during audit.
- Clone: `/disputes/status`, `/dispute-manager/furnisher-addresses`, `/disputes/furnisher-addresses`, `/disputes/dispute-playbook`, `/disputes/ai-metro-2-letters`.

Checklist:
- Status dashboard/list title and nav entry.
- Views, filters, batch actions, details panel, edit status controls.
- Furnisher address layout and search behavior.
- AI/Metro 2 letter tools and dispute playbook actions.
- Empty/loading/success/error states.
- Persistence and reload behavior.
- Mobile behavior for details panel.

Recommended tests:
- `tests/dispute-status-parity.spec.ts`.
- `tests/dispute-tools-parity.spec.ts` for furnisher addresses, playbook, and AI/Metro 2 labels/actions.

### Letters / Letter Vault

Routes:
- Original: `/LetterVault`
- Clone: `/letter-vault`, `/letters`, `/letters/vault`, `/letters/ai-rewriter`.

Checklist:
- Letter Vault title, tabs/categories, training video labels.
- Credit bureau, creditor, collector, respond, manual, campaign categories.
- Letter list names, numbering, ordering, selection controls.
- Preview panel, add manual letter, undo delete, move letters.
- AI rewriter inputs/outputs and button wording if present in original.
- Save/edit/delete/move behavior and persistence.
- Responsive layout.

Recommended tests:
- Strengthen `tests/letters-compare.spec.ts` to record missing/different/extra category and letter labels from original.
- Keep `tests/letters-workflows.spec.ts` and `tests/letter-vault-actions-behavior.spec.ts`.

### Documents / Images / Digital Contracts

Routes:
- Original documents/images/contracts routes identified during audit.
- Clone: `/company/images-documents`, `/company/digital-contracts`.

Checklist:
- Page titles and section names.
- Upload controls, accepted file text, max-size wording, preview/download/delete actions.
- Digital contract templates, create/edit/send/view flows.
- Table/card columns and document metadata.
- Empty states and upload success/error messages.
- Persistence and reload behavior.
- Mobile upload/form layout.

Recommended tests:
- Strengthen `tests/documents-compare.spec.ts`.
- Keep `tests/documents-actions-behavior.spec.ts` and `tests/images-documents-workflow.spec.ts`.

### Billing / Invoices

Routes:
- Original billing/invoice/payment routes identified during audit.
- Clone: `/billing`, `/billing/invoices`, `/billing/payments`, `/billing/payment-history`, `/billing/services-products`, `/billing/credit-card-setup`, `/billing/pay-per-deletion`.

Checklist:
- Billing overview title and KPI cards.
- Invoices table columns and row actions.
- Create invoice modal fields, line items, taxes/discounts, client selection.
- Payments, payment history, services/products, credit card setup, pay-per-deletion sections.
- Search/filter/status behavior.
- Save/add payment success/error messages.
- Local versus remote persistence behavior.
- Mobile table/modal behavior.

Recommended tests:
- Replace `tests/billing-compare.spec.ts` static expected labels with page-specific original-vs-clone comparisons.
- Keep `tests/billing-actions-behavior.spec.ts`.

### Leads

Routes:
- Original leads route identified during audit.
- Clone: `/leads`, `/leads/website-lead-form`.

Checklist:
- Leads title, stats, tabs/views, source labels.
- Add lead/import actions, CSV guidance, conversion action.
- Table/kanban columns, filters, search, bulk actions.
- Lead form fields, status/source dropdown options.
- Convert-to-client behavior.
- Save/delete/import feedback and persistence.
- Mobile behavior.

Recommended tests:
- `tests/leads-parity.spec.ts`.
- Keep existing leads/affiliates smoke and workflow tests.

### Affiliates

Routes:
- Original affiliate routes identified during audit.
- Clone: `/leads/affiliates`, `/affiliates`, `/affiliates/website-form`, `/leads/affiliate-website-form`.

Checklist:
- Affiliate page title and tab labels.
- Add affiliate form fields and production-safe column mapping.
- Table columns: full name/name, company, email, phone, referral code, status, notes, action.
- Filters/status behavior and post-save visibility.
- Website form fields and public route behavior.
- Save/delete success/error messages and reload behavior.
- Mobile table/card behavior.

Recommended tests:
- `tests/affiliates-parity.spec.ts`.
- Keep `tests/leads-affiliates-behavior.spec.ts`.

### Calendar

Routes:
- Original calendar route identified during audit.
- Clone: `/calendar`

Checklist:
- Calendar title, month/week/day/agenda view controls.
- Add event form fields and dropdown options.
- Event source labels for manual, lead, client, invoice, dispute, birthday.
- Filters, search, navigation, date picker behavior.
- Save/edit/delete feedback and persistence.
- Empty/loading states.
- Mobile agenda behavior.

Recommended tests:
- `tests/calendar-parity.spec.ts`.
- Keep `tests/calendar-behavior.spec.ts`.

### Reports

Routes:
- Original reports route identified during audit.
- Clone: `/reports`

Checklist:
- Report categories, titles, chart/table labels.
- Filters/date ranges/export actions.
- Metrics definitions and empty states.
- Download/export behavior.
- Error states when data is missing.
- Responsive chart/table behavior.

Recommended tests:
- `tests/reports-parity.spec.ts`.
- Add focused export/action behavior tests after parity targets are known.

### Employees

Routes:
- Original employees/team route identified during audit.
- Clone: `/employees`

Checklist:
- Page title and employee/staff terminology.
- Invite/add employee action and form fields.
- Role/status/permissions labels and dropdown options.
- Table columns, filters, search, bulk actions, pagination.
- Edit, permissions, activity, remove/deactivate behavior.
- Save/delete/invite feedback and persistence.
- Mobile layout.

Recommended tests:
- `tests/employees-parity.spec.ts`.
- Keep `tests/employees-behavior.spec.ts`.

### Company / Settings / Configuration

Routes:
- Original company/settings/configuration routes identified during audit.
- Clone: `/company/settings`, `/company/portals`, `/company/manage-portal-content`, `/company/credit-monitoring`, `/company/manage-emails`, `/company/notify-automation`, `/company/team-messages`, `/settings/configuration`, `/configuration`.

Checklist:
- Page names, tab names, and section grouping.
- Company settings fields and save behavior.
- Portals/mobile app settings and staged/live wording.
- Manage portal content, credit monitoring, email templates, notify/automation, team messages.
- Configuration general settings, statuses, round settings, notifications, service plans, tags, integrations.
- Dropdown options and default values.
- Success/error/local persistence messages.
- Responsive form layout.

Recommended tests:
- Strengthen `tests/company-compare.spec.ts`.
- Add `tests/configuration-parity.spec.ts`.
- Keep `tests/configuration-behavior.spec.ts`, `tests/company-settings-save-behavior.spec.ts`, and workflow tests.

### Portal / Client Login

Routes:
- Original client portal/login routes identified during audit.
- Clone: `/client-login`, future portal routes.

Checklist:
- Login page title, branding, field labels, forgot password links, business/customer login cross-links.
- Supabase auth behavior versus original portal auth behavior.
- Error messages and reset-password flow.
- Client portal route availability and missing/staged messaging.
- Portal data isolation must use `client_portal_users`, not business `account_memberships` or `dp_auth`.
- Mobile login layout.

Recommended tests:
- `tests/client-login-parity.spec.ts`.
- Keep `tests/auth-foundation.spec.ts`.
- Add portal data isolation tests only after portal routes/pages exist.

## Playwright Test Plan

Create a shared helper for parity tests:
- open original with `auth-original.json`,
- open clone with normal test auth/session,
- normalize whitespace and volatile text,
- extract headings, buttons, links, labels, table headers, inputs, selects, modal labels, and visible status/error messages,
- write JSON artifacts for missing/different/extra items,
- fail when the section-specific missing/different checklist is not empty.

Recommended test files:
- `tests/parity/sidebar-parity.spec.ts`
- `tests/parity/dashboard-parity.spec.ts`
- `tests/parity/clients-parity.spec.ts`
- `tests/parity/client-profile-parity.spec.ts`
- `tests/parity/disputes-parity.spec.ts`
- `tests/parity/dispute-status-parity.spec.ts`
- `tests/parity/letters-parity.spec.ts`
- `tests/parity/documents-parity.spec.ts`
- `tests/parity/billing-parity.spec.ts`
- `tests/parity/leads-parity.spec.ts`
- `tests/parity/affiliates-parity.spec.ts`
- `tests/parity/calendar-parity.spec.ts`
- `tests/parity/reports-parity.spec.ts`
- `tests/parity/employees-parity.spec.ts`
- `tests/parity/company-configuration-parity.spec.ts`
- `tests/parity/client-login-parity.spec.ts`

Recommended artifact output:
- `parity-results/<section>/missing-from-clone.json`
- `parity-results/<section>/different-from-original.json`
- `parity-results/<section>/extra-in-clone.json`
- `parity-results/<section>/desktop-original.png`
- `parity-results/<section>/desktop-clone.png`
- `parity-results/<section>/mobile-original.png`
- `parity-results/<section>/mobile-clone.png`

## First Page To Compare

Start with the sidebar/navigation shell, then dashboard. The sidebar must be correct before page-level parity work because every authenticated page inherits the product frame, route naming, and module grouping from it.

## Non-Goals

- No RLS or migration changes during parity planning.
- No production database changes.
- No hidden text to satisfy tests.
- No visual redesign that departs from the original product.
- No claim of completion based only on smoke tests.
