# Phase 5 Manager Agent Plan

Date: 2026-05-15

Scope: root project only at `C:\Users\LESLI\disputepilot-app`. The nested folder `C:\Users\LESLI\disputepilot-app\disputepilot-app` is out of scope and must not be edited.

Project goal: make the DisputePilot clone match the original Client Dispute Manager app visually and functionally, page by page.

Original app: `https://www.clientdisputemanager.com`

Live clone: `https://disputepilot-app.vercel.app`

Source plan: `docs/phase-5-original-clone-parity-audit-plan.md`

## Manager Agent Responsibilities

- Protect `main`: no broad UI rewrites, no opportunistic fixes outside assigned sections, no commits unless explicitly requested.
- Keep all work in the root project. Do not read from or edit the nested `disputepilot-app` folder for implementation decisions.
- Maintain the Phase 5 audit process and completion rule from `docs/phase-5-original-clone-parity-audit-plan.md`.
- Assign focused worker tasks by section and enforce file ownership before review.
- Review worker output for visible product parity, not hidden text or test-only content.
- Require real usable UI fixes only. Do not weaken Playwright tests to make parity pass.
- Do not change RLS, migrations, Supabase policies, or production data flows unless explicitly approved.
- Preserve recent production client-save work and any unrelated dirty worktree changes.
- Keep a section open until its missing/different checklist is empty or explicitly documented, focused parity and behavior tests pass, the full Chromium suite passes, and `npm run build` passes.

## Current Baseline Status

- Phase 5 audit plan exists at `docs/phase-5-original-clone-parity-audit-plan.md`.
- Recent reported baseline: full Playwright suite passed `226/226`, and build passed.
- Recent production fix: clients save payload strips unsupported Supabase fields before insert/update/import.
- Current root app routes include: `academy`, `affiliates`, `api`, `automation`, `billing`, `bulk-print`, `calendar`, `client-login`, `clients`, `company`, `configuration`, `credit-analysis`, `credit-analyzer`, `dashboard`, `dispute-manager`, `disputes`, `employees`, `get-customers`, `leads`, `letter-vault`, `letters`, `login`, `partner-resources`, `reports`, `reset-password`, and `settings`.
- Current shared components are concentrated in `components/CDMLayout.tsx`, `components/ClientPortalLayout.tsx`, `components/PageHeader.tsx`, `components/AuthLoginForm.tsx`, `components/ResetPasswordForm.tsx`, and `components/AcademyPage.tsx`.
- Existing section missing-artifact files are present and currently empty arrays: `missing-sidebar-from-clone.json`, `missing-clients-from-clone.json`, `missing-disputes-from-clone.json`, `missing-letters-from-clone.json`, `missing-billing-from-clone.json`, `missing-company-from-clone.json`, `missing-documents-from-clone.json`, `missing-portals-from-clone.json`, `missing-automation-from-clone.json`, `missing-help-from-clone.json`, and `missing-from-clone.json`.
- Current worktree already has client-related changes from the recent production save work. Workers must not revert or overwrite those changes.

## Worker Agent List

### Agent 1 - Navigation + Dashboard + Global Layout

Owns:
- sidebar/navigation shell
- dashboard
- top/global layout
- shared visible layout issues

Primary files:
- `components/CDMLayout.tsx`
- `components/PageHeader.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/dashboard/page.tsx`
- `tests/sidebar-compare.spec.ts`
- `tests/navigation.spec.ts`
- `tests/dashboard.spec.ts`
- new focused dashboard/sidebar parity tests if needed
- sidebar/dashboard parity artifacts

### Agent 2 - Clients + Client Profile

Owns:
- clients/customers list
- add/edit client
- client profile
- client documents attached to profile
- client save/edit/delete behavior

Primary files:
- `app/clients/page.tsx`
- `app/clients/[id]/page.tsx`
- client-related helpers imported by those pages
- `tests/client-*.spec.ts`
- `tests/clients*.spec.ts`
- client/client-profile parity artifacts

### Agent 3 - Disputes + Letters

Owns:
- disputes
- dispute status/manager
- letter vault
- generated letters
- dispute workflow behavior

Primary files:
- `app/disputes/**`
- `app/dispute-manager/**`
- `app/letter-vault/**`
- `app/letters/**`
- `app/bulk-print/**` only when the change is directly tied to generated letters
- `tests/disputes-*.spec.ts`
- `tests/dispute-manager-*.spec.ts`
- `tests/letters-*.spec.ts`
- `tests/letter-vault-*.spec.ts`
- dispute/letter parity artifacts

### Agent 4 - Billing + Leads + Affiliates

Owns:
- invoices/billing
- payments/status UI
- leads
- affiliates
- related forms/search/filter behavior

Primary files:
- `app/billing/**`
- `app/leads/**`
- `app/affiliates/**`
- `tests/billing-*.spec.ts`
- `tests/leads-*.spec.ts`
- `tests/*affiliates*.spec.ts`
- billing/leads/affiliates parity artifacts

### Agent 5 - Calendar + Reports + Employees + Settings + Portal

Owns:
- calendar
- reports
- employees
- company/settings/configuration
- portal/client-login

Primary files:
- `app/calendar/**`
- `app/reports/**`
- `app/employees/**`
- `app/company/**`
- `app/settings/**`
- `app/configuration/**`
- `app/client-login/**`
- `app/login/**` and `app/reset-password/**` only for portal/auth-visible parity
- `components/ClientPortalLayout.tsx`
- `components/AuthLoginForm.tsx`
- `components/ResetPasswordForm.tsx`
- `tests/calendar-*.spec.ts`
- `tests/employees-*.spec.ts`
- `tests/company-*.spec.ts`
- `tests/configuration-*.spec.ts`
- `tests/portals-*.spec.ts`
- `tests/auth-foundation.spec.ts`
- calendar/reports/employees/settings/portal parity artifacts

## Branch and Worktree Recommendation

Use one branch per worker and a separate worktree per branch when parallel workers are active. Recommended naming:

- `phase5/agent-1-nav-dashboard`
- `phase5/agent-2-clients-profile`
- `phase5/agent-3-disputes-letters`
- `phase5/agent-4-billing-leads-affiliates`
- `phase5/agent-5-settings-portal`

Recommended worktree layout outside the root working copy:

- `C:\Users\LESLI\disputepilot-agent-1`
- `C:\Users\LESLI\disputepilot-agent-2`
- `C:\Users\LESLI\disputepilot-agent-3`
- `C:\Users\LESLI\disputepilot-agent-4`
- `C:\Users\LESLI\disputepilot-agent-5`

Before starting a worker, branch from the latest stable root project state. Do not branch from the nested folder. Each worker should report dirty files before and after work.

## File Ownership Rules

- A worker may edit only files in its assigned ownership list unless the Manager Agent approves an exception.
- Shared files are high-conflict. `components/CDMLayout.tsx`, `components/PageHeader.tsx`, `app/layout.tsx`, and `app/globals.css` default to Agent 1 ownership. Other agents must request a narrow exception before editing them.
- Test ownership follows feature ownership. Workers may add focused parity tests for their section and may update existing behavior tests only to reflect real visible UI.
- Do not remove assertions, skip tests, or replace real workflow checks with weaker smoke checks.
- Do not add hidden text, invisible buttons, duplicate labels, or test-only content to satisfy tests.
- Do not edit migrations, RLS policies, Supabase schema files, or auth authorization rules without explicit approval.
- Keep artifacts section-scoped. Prefer future artifact paths like `parity-results/<section>/missing-from-clone.json`, `different-from-original.json`, and `extra-in-clone.json`.
- If a shared visible issue blocks a section, document it and send it to Agent 1 instead of fixing it from another section.

## Merge and Review Checklist

For every worker result:

- Confirm the worker stayed in root project and did not edit the nested folder.
- Review `git status --short` and ensure changed files match the assigned ownership.
- Inspect visible UI changes against the original app at desktop and mobile widths.
- Confirm each missing/different item is either fixed or documented with a reason.
- Confirm no hidden/test-only text or weakened Playwright assertion was introduced.
- Confirm no RLS, migrations, production policy, or unrelated data access changes were made.
- Run the focused parity test for the section.
- Run the focused behavior/workflow tests for the section.
- Run the full Chromium Playwright suite.
- Run `npm run build`.
- Only after all checks pass, consider merging the worker branch into the integration branch.

## Required Test Commands

Build:

```powershell
npm run build
```

Full Chromium suite:

```powershell
npx playwright test --project=chromium --config=playwright.config.ts
```

Agent 1 focused checks:

```powershell
npx playwright test tests/sidebar-compare.spec.ts tests/navigation.spec.ts tests/dashboard.spec.ts --project=chromium --config=playwright.config.ts
```

Agent 2 focused checks:

```powershell
npx playwright test tests/client-add-save-behavior.spec.ts tests/client-delete-safe-behavior.spec.ts tests/client-edit-action-behavior.spec.ts tests/client-view-profile-behavior.spec.ts tests/clients-customers-parity.spec.ts tests/clients-workflow-real.spec.ts --project=chromium --config=playwright.config.ts
```

Agent 3 focused checks:

```powershell
npx playwright test tests/disputes-compare.spec.ts tests/disputes-create-behavior.spec.ts tests/dispute-manager-pages-smoke.spec.ts tests/letters-compare.spec.ts tests/letters-pages-smoke.spec.ts tests/letters-workflows.spec.ts tests/letter-vault-actions-behavior.spec.ts --project=chromium --config=playwright.config.ts
```

Agent 4 focused checks:

```powershell
npx playwright test tests/billing-compare.spec.ts tests/billing-pages-smoke.spec.ts tests/billing-actions-behavior.spec.ts tests/leads-affiliates-behavior.spec.ts tests/leads-affiliates-pages-smoke.spec.ts --project=chromium --config=playwright.config.ts
```

Agent 5 focused checks:

```powershell
npx playwright test tests/calendar-behavior.spec.ts tests/employees-behavior.spec.ts tests/company-compare.spec.ts tests/company-settings-pages-smoke.spec.ts tests/company-settings-save-behavior.spec.ts tests/configuration-behavior.spec.ts tests/portals-compare.spec.ts tests/portals-save-behavior.spec.ts tests/auth-foundation.spec.ts --project=chromium --config=playwright.config.ts
```

## Recommended First Worker

Start Agent 1 first: Navigation + Dashboard + Global Layout.

Reasoning: Agent 2 just had urgent production client-save changes, and those files are currently dirty. Starting Agent 1 avoids disturbing the recent clients fix while establishing the shared authenticated product frame that every other section inherits. The Phase 5 audit plan also identifies sidebar/navigation as the first comparison target, followed by dashboard.

Agent 2 should start after the client-save branch/state is reviewed and stable, or after Agent 1 has documented any global shell differences that affect clients.

## First 5 Worker Prompts

### Prompt for Agent 1 - Navigation + Dashboard + Global Layout

You are Phase 5 Worker Agent 1 for the DisputePilot clone project.

Root only: `C:\Users\LESLI\disputepilot-app`

Do not edit nested folder: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

Read first:
- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`

Your section: Navigation + Dashboard + Global Layout.

Owns:
- sidebar/navigation shell
- dashboard
- top/global layout
- shared visible layout issues

Allowed primary files:
- `components/CDMLayout.tsx`
- `components/PageHeader.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/dashboard/page.tsx`
- `tests/sidebar-compare.spec.ts`
- `tests/navigation.spec.ts`
- `tests/dashboard.spec.ts`
- new focused dashboard/sidebar parity tests and artifacts if needed

Rules:
- Fix real visible usable UI only.
- Do not add hidden text just to pass tests.
- Do not weaken Playwright tests.
- Do not edit RLS, migrations, or production auth rules.
- Do not touch clients implementation files unless the Manager Agent approves it.

Tasks:
1. Audit original vs clone for sidebar/navigation shell and dashboard at desktop and mobile widths.
2. Record missing/different/extra items in section artifacts.
3. Fix only the visible nav/dashboard/global-layout differences in your ownership area.
4. Run focused tests:
   `npx playwright test tests/sidebar-compare.spec.ts tests/navigation.spec.ts tests/dashboard.spec.ts --project=chromium --config=playwright.config.ts`
5. Run `npm run build`.
6. Report files changed, checklist status, test results, build result, and any blocked items.

### Prompt for Agent 2 - Clients + Client Profile

You are Phase 5 Worker Agent 2 for the DisputePilot clone project.

Root only: `C:\Users\LESLI\disputepilot-app`

Do not edit nested folder: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

Read first:
- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`

Your section: Clients + Client Profile.

Owns:
- clients/customers list
- add/edit client
- client profile
- client documents attached to profile
- client save/edit/delete behavior

Allowed primary files:
- `app/clients/page.tsx`
- `app/clients/[id]/page.tsx`
- client-related helpers imported by those pages
- `tests/client-*.spec.ts`
- `tests/clients*.spec.ts`
- client/client-profile parity artifacts

Rules:
- Preserve the recent production client-save fix that strips unsupported Supabase fields before insert/update/import.
- Fix real visible usable UI only.
- Do not add hidden text just to pass tests.
- Do not weaken Playwright tests.
- Do not edit RLS, migrations, or production auth rules.
- Do not edit shared layout files unless the Manager Agent approves it.

Tasks:
1. Audit original vs clone for clients/customers list and client profile at desktop and mobile widths.
2. Record missing/different/extra items in section artifacts.
3. Fix only client/client-profile parity issues in your ownership area.
4. Run focused tests:
   `npx playwright test tests/client-add-save-behavior.spec.ts tests/client-delete-safe-behavior.spec.ts tests/client-edit-action-behavior.spec.ts tests/client-view-profile-behavior.spec.ts tests/clients-customers-parity.spec.ts tests/clients-workflow-real.spec.ts --project=chromium --config=playwright.config.ts`
5. Run `npm run build`.
6. Report files changed, checklist status, test results, build result, and any blocked items.

### Prompt for Agent 3 - Disputes + Letters

You are Phase 5 Worker Agent 3 for the DisputePilot clone project.

Root only: `C:\Users\LESLI\disputepilot-app`

Do not edit nested folder: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

Read first:
- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`

Your section: Disputes + Letters.

Owns:
- disputes
- dispute status/manager
- letter vault
- generated letters
- dispute workflow behavior

Allowed primary files:
- `app/disputes/**`
- `app/dispute-manager/**`
- `app/letter-vault/**`
- `app/letters/**`
- `app/bulk-print/**` only when directly tied to generated letters
- `tests/disputes-*.spec.ts`
- `tests/dispute-manager-*.spec.ts`
- `tests/letters-*.spec.ts`
- `tests/letter-vault-*.spec.ts`
- dispute/letter parity artifacts

Rules:
- Fix real visible usable UI only.
- Do not add hidden text just to pass tests.
- Do not weaken Playwright tests.
- Do not edit RLS, migrations, or production auth rules.
- Do not edit shared layout or clients files unless the Manager Agent approves it.

Tasks:
1. Audit original vs clone for disputes, dispute status/manager, letter vault, and generated letters at desktop and mobile widths.
2. Record missing/different/extra items in section artifacts.
3. Fix only disputes/letters parity issues in your ownership area.
4. Run focused tests:
   `npx playwright test tests/disputes-compare.spec.ts tests/disputes-create-behavior.spec.ts tests/dispute-manager-pages-smoke.spec.ts tests/letters-compare.spec.ts tests/letters-pages-smoke.spec.ts tests/letters-workflows.spec.ts tests/letter-vault-actions-behavior.spec.ts --project=chromium --config=playwright.config.ts`
5. Run `npm run build`.
6. Report files changed, checklist status, test results, build result, and any blocked items.

### Prompt for Agent 4 - Billing + Leads + Affiliates

You are Phase 5 Worker Agent 4 for the DisputePilot clone project.

Root only: `C:\Users\LESLI\disputepilot-app`

Do not edit nested folder: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

Read first:
- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`

Your section: Billing + Leads + Affiliates.

Owns:
- invoices/billing
- payments/status UI
- leads
- affiliates
- related forms/search/filter behavior

Allowed primary files:
- `app/billing/**`
- `app/leads/**`
- `app/affiliates/**`
- `tests/billing-*.spec.ts`
- `tests/leads-*.spec.ts`
- `tests/*affiliates*.spec.ts`
- billing/leads/affiliates parity artifacts

Rules:
- Fix real visible usable UI only.
- Do not add hidden text just to pass tests.
- Do not weaken Playwright tests.
- Do not edit RLS, migrations, or production auth rules.
- Do not edit shared layout or clients files unless the Manager Agent approves it.

Tasks:
1. Audit original vs clone for billing/invoices/payments, leads, and affiliates at desktop and mobile widths.
2. Record missing/different/extra items in section artifacts.
3. Fix only billing/leads/affiliates parity issues in your ownership area.
4. Run focused tests:
   `npx playwright test tests/billing-compare.spec.ts tests/billing-pages-smoke.spec.ts tests/billing-actions-behavior.spec.ts tests/leads-affiliates-behavior.spec.ts tests/leads-affiliates-pages-smoke.spec.ts --project=chromium --config=playwright.config.ts`
5. Run `npm run build`.
6. Report files changed, checklist status, test results, build result, and any blocked items.

### Prompt for Agent 5 - Calendar + Reports + Employees + Settings + Portal

You are Phase 5 Worker Agent 5 for the DisputePilot clone project.

Root only: `C:\Users\LESLI\disputepilot-app`

Do not edit nested folder: `C:\Users\LESLI\disputepilot-app\disputepilot-app`

Read first:
- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`

Your section: Calendar + Reports + Employees + Settings + Portal.

Owns:
- calendar
- reports
- employees
- company/settings/configuration
- portal/client-login

Allowed primary files:
- `app/calendar/**`
- `app/reports/**`
- `app/employees/**`
- `app/company/**`
- `app/settings/**`
- `app/configuration/**`
- `app/client-login/**`
- `app/login/**` and `app/reset-password/**` only for portal/auth-visible parity
- `components/ClientPortalLayout.tsx`
- `components/AuthLoginForm.tsx`
- `components/ResetPasswordForm.tsx`
- `tests/calendar-*.spec.ts`
- `tests/employees-*.spec.ts`
- `tests/company-*.spec.ts`
- `tests/configuration-*.spec.ts`
- `tests/portals-*.spec.ts`
- `tests/auth-foundation.spec.ts`
- calendar/reports/employees/settings/portal parity artifacts

Rules:
- Fix real visible usable UI only.
- Do not add hidden text just to pass tests.
- Do not weaken Playwright tests.
- Do not edit RLS, migrations, or production auth rules.
- Do not edit shared authenticated layout or clients files unless the Manager Agent approves it.

Tasks:
1. Audit original vs clone for calendar, reports, employees, company/settings/configuration, and portal/client-login at desktop and mobile widths.
2. Record missing/different/extra items in section artifacts.
3. Fix only your section's parity issues in your ownership area.
4. Run focused tests:
   `npx playwright test tests/calendar-behavior.spec.ts tests/employees-behavior.spec.ts tests/company-compare.spec.ts tests/company-settings-pages-smoke.spec.ts tests/company-settings-save-behavior.spec.ts tests/configuration-behavior.spec.ts tests/portals-compare.spec.ts tests/portals-save-behavior.spec.ts tests/auth-foundation.spec.ts --project=chromium --config=playwright.config.ts`
5. Run `npm run build`.
6. Report files changed, checklist status, test results, build result, and any blocked items.
