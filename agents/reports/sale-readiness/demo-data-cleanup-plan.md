# Demo Data Cleanup Plan

Documentation-only plan for preparing DisputePilot demos and transfer materials. This file separates repo-verified facts from recommendations/TODOs and does not include credentials, secrets, or private data.

## 1. Purpose

Demo data cleanup matters because buyer demos and transfers can expose more than intended: personal names, private account references, screenshots, reports, local storage artifacts, environment variables, uploaded files, or original-platform data. A clean demo package lets a buyer evaluate the product surface without receiving private data or credentials.

Risks reduced:

- Accidental disclosure of personal or customer information.
- Accidental transfer of credentials, API keys, tokens, or private account access.
- Confusion between fake demo data and real production readiness.
- IP/branding risk from original-platform screenshots, exports, or credentials.
- Buyer diligence issues caused by raw test artifacts or private local files.

Repo-verified facts:

- Sale-readiness docs are stored under `agents/reports/sale-readiness/`.
- Latest verified local Chromium Playwright suite status recorded in project state: `358 passed`.
- Generated test/audit artifacts can be produced by Playwright and audit runs.

Recommendations/TODOs:

- Confirm any live/demo database state directly before buyer demos.
- Confirm all screenshots and exported artifacts are sanitized before sharing.
- Use only fake demo identities and placeholder credentials in buyer-facing materials.

## 2. Data Inventory Checklist

Inspect these locations before a buyer demo or transfer:

- [ ] Source files: `app/`, `components/`, `lib/`, `data/`, `public/`, and other root project source folders.
- [ ] Docs: `README.md`, `docs/`, `agents/reports/`, and `agents/reports/sale-readiness/`.
- [ ] Test fixtures and test data: `tests/`, helper files, generated JSON fixtures, and any committed sample files.
- [ ] Local storage/demo fallbacks: browser localStorage values created during demos/tests; clear or reseed with fake data.
- [ ] Supabase/database records: clients, leads, disputes, billing, portal settings, forms, users, storage metadata, and auth records.
- [ ] Environment variables: local `.env*` files, Vercel env vars, CI secrets, Supabase keys, API tokens, SMTP/payment provider secrets.
- [ ] Screenshots: demo screenshots, Playwright screenshots, visual audit screenshots, browser captures, and image assets.
- [ ] Audit artifacts: `audit-results/`, `parity-results/`, `manual-workflow-audit.json`, comparison JSON, and visual diff outputs.
- [ ] Playwright reports: `test-results/`, `playwright-report/`, traces, videos, screenshots, and error contexts.
- [ ] Uploaded files/storage: local uploads, Supabase storage buckets, sample documents, contracts, images, logos, and downloads.
- [ ] Public form submissions: website lead form submissions, affiliate form submissions, public intake records, and embed test submissions.
- [ ] Buyer docs: sale package, setup docs, handoff checklist, demo walkthrough, screenshots, and any sent archives.

## 3. Sensitive Data To Remove Before Showing Or Transferring

Remove or sanitize:

- Real names.
- Real email addresses.
- Real phone numbers.
- Real home or business addresses unless buyer-owned/public and approved.
- Client dispute data.
- Credit report data, scores, tradelines, account numbers, creditor details, bureau data, or Metro 2 data tied to a real person.
- Uploaded documents, IDs, contracts, credit reports, screenshots, letters, or attachments containing private data.
- Original-site credentials or session files.
- API keys, tokens, passwords, OAuth secrets, SMTP credentials, payment keys, Supabase service keys, Vercel tokens, GitHub tokens, AI provider keys.
- Screenshots containing account names, browser profiles, private URLs, private records, or original-platform data.
- Any original-platform export data.
- Raw Playwright traces/videos/screenshots if they include private data.
- Local browser storage values that contain personal or private demo history.

## 4. Recommended Clean Demo Dataset

Use clearly fake records. Keep the dataset small enough to understand quickly and broad enough to demonstrate workflows.

Recommended dataset size:

- 5 demo clients.
- 3 leads.
- 2 affiliates.
- 3 disputes.
- 3 letters.
- 2 invoices/payments.
- 2 calendar reminders.
- 2 uploaded sample documents.
- 1 portal configuration.
- 1 automation configuration.

Example fake demo clients:

| ID | Name | Email | Phone | Address | Status |
| --- | --- | --- | --- | --- | --- |
| demo-client-001 | Alex Demo | demo-client-001@example.test | 555-0100 | 123 Demo Street, Sample City, ST 10001 | Active |
| demo-client-002 | Jordan Sample | demo-client-002@example.test | 555-0101 | 124 Demo Street, Sample City, ST 10002 | New |
| demo-client-003 | Casey Test | demo-client-003@example.test | 555-0102 | 125 Demo Street, Sample City, ST 10003 | In Review |
| demo-client-004 | Morgan Placeholder | demo-client-004@example.test | 555-0103 | 126 Demo Street, Sample City, ST 10004 | Disputing |
| demo-client-005 | Riley Example | demo-client-005@example.test | 555-0104 | 127 Demo Street, Sample City, ST 10005 | Completed Demo |

Example fake leads:

| ID | Name | Email | Phone | Source | Status |
| --- | --- | --- | --- | --- | --- |
| demo-lead-001 | Taylor Lead | demo-lead-001@example.test | 555-0110 | Website Demo Form | New |
| demo-lead-002 | Jamie Inquiry | demo-lead-002@example.test | 555-0111 | Referral Demo | Contacted |
| demo-lead-003 | Quinn Prospect | demo-lead-003@example.test | 555-0112 | Affiliate Demo | Qualified |

Example fake affiliates:

| ID | Name | Email | Phone | Status |
| --- | --- | --- | --- | --- |
| demo-affiliate-001 | North Demo Partners | demo-affiliate-001@example.test | 555-0120 | Active |
| demo-affiliate-002 | Sample Referral Group | demo-affiliate-002@example.test | 555-0121 | Pending |

## 5. Demo Data Naming Conventions

Use obviously fake values:

- Names: Alex Demo, Jordan Sample, Casey Test, Morgan Placeholder, Riley Example.
- Emails: `demo-client-001@example.test`, `demo-lead-001@example.test`, `demo-affiliate-001@example.test`.
- Phone numbers: `555-0100`, `555-0101`, `555-0110`, `555-0120`.
- Addresses: `123 Demo Street`, `124 Demo Street`, `Sample City`, `ST 10001`.
- Company names: `Demo Credit Services`, `Sample Repair Group`, `Example Dispute Co.`.
- Documents: `sample-proof-of-address.pdf`, `demo-intake-form.pdf`.
- Payment references: `DEMO-INV-001`, `DEMO-PAY-001`.
- Dispute references: `DEMO-DISPUTE-001`.

Avoid:

- Real public figures.
- Real customers or acquaintances.
- Real business names unless buyer-owned and approved.
- Real domains other than reserved test domains such as `example.test`.
- Real account, bureau, creditor, card, SSN, DOB, or credit-report-like values.

## 6. Cleanup Checklist Before Buyer Demo

- [ ] Clear generated `audit-results/`.
- [ ] Clear generated `test-results/` and `playwright-report/`.
- [ ] Restore or remove generated `parity-results/` and `manual-workflow-audit.json` unless intentionally showing sanitized internal evidence.
- [ ] Run `git status --short --untracked-files=all` and confirm only intended docs or clean working tree.
- [ ] Confirm no credentials in docs.
- [ ] Confirm no `.env*` files are included in any buyer package.
- [ ] Confirm no original screenshots are included in buyer-facing materials.
- [ ] Confirm demo account only has fake data.
- [ ] Confirm public forms do not expose private submissions.
- [ ] Clear browser localStorage/sessionStorage or reseed with fake demo data.
- [ ] Confirm browser tabs, address bar, bookmarks, password manager prompts, and terminal windows do not reveal private accounts.
- [ ] Confirm portal/mobile/video placeholders are labeled honestly.
- [ ] Confirm screenshots for buyer docs are freshly captured from fake demo data only.

Suggested cleanup commands for generated artifacts:

```powershell
git restore manual-workflow-audit.json parity-results
git clean -fd audit-results test-results playwright-report
```

## 7. Cleanup Checklist Before Transfer

- [ ] Rotate all secrets before handoff.
- [ ] Remove local `.env*` files from transfer package or provide template only.
- [ ] Confirm `.env.example` or setup docs use placeholder names only.
- [ ] Transfer or recreate database under buyer-owned Supabase/project account.
- [ ] Recreate storage buckets or transfer only sanitized sample files.
- [ ] Remove personal accounts and personal browser/session artifacts.
- [ ] Remove original-site credentials, sessions, screenshots, and exports.
- [ ] Export clean seed/demo data only.
- [ ] Provide buyer with setup docs and environment variable template.
- [ ] Confirm Vercel, Supabase, GitHub, domain, payment, email/SMS, AI, and integration providers are buyer-owned or intentionally transferred.
- [ ] Confirm all service tokens are rotated after transfer.
- [ ] Confirm logs, monitoring, and analytics do not contain private historical demo data.

## 8. Recommended Seed/Demo Data Structure

### Clients

| Field | Example | Notes |
| --- | --- | --- |
| id | `demo-client-001` | Stable fake ID. |
| name | `Alex Demo` | Clearly fake. |
| email | `demo-client-001@example.test` | Reserved test domain. |
| phone | `555-0100` | Fake 555-0100 range. |
| address | `123 Demo Street, Sample City, ST 10001` | Fake address. |
| status | `Active` | Use visible statuses already supported by the app. |

### Leads

| Field | Example | Notes |
| --- | --- | --- |
| id | `demo-lead-001` | Stable fake ID. |
| name | `Taylor Lead` | Clearly fake. |
| source | `Website Demo Form` | Avoid real partner names. |
| status | `New` | Use expected app statuses. |

### Affiliates

| Field | Example | Notes |
| --- | --- | --- |
| id | `demo-affiliate-001` | Stable fake ID. |
| name | `North Demo Partners` | Fake organization. |
| email | `demo-affiliate-001@example.test` | Reserved test domain. |
| commissionStatus | `Demo Pending` | Clearly fake. |

### Disputes

| Field | Example | Notes |
| --- | --- | --- |
| id | `DEMO-DISPUTE-001` | Fake reference. |
| client | `Alex Demo` | Link to fake client. |
| bureau | `Demo Bureau A` | Avoid implying real bureau data. |
| item | `Demo Credit Card Account` | No real account numbers. |
| status | `Draft` | Use app-supported status. |

### Letters

| Field | Example | Notes |
| --- | --- | --- |
| id | `DEMO-LETTER-001` | Fake reference. |
| title | `Demo Initial Dispute Letter` | Avoid legal claims. |
| client | `Alex Demo` | Fake client. |
| status | `Draft` | Safe default. |

### Billing

| Field | Example | Notes |
| --- | --- | --- |
| invoice | `DEMO-INV-001` | Fake invoice number. |
| client | `Alex Demo` | Fake client. |
| amount | `$99.00` | Demo only. |
| status | `Demo Unpaid` | Avoid real payment claim. |
| payment | `DEMO-PAY-001` | Fake payment reference. |

### Calendar

| Field | Example | Notes |
| --- | --- | --- |
| reminder | `Call Alex Demo about intake checklist` | Fake task. |
| date | Future demo date | Avoid real appointments. |
| status | `Open` | Simple visible status. |

### Documents

| Field | Example | Notes |
| --- | --- | --- |
| file | `sample-proof-of-address.pdf` | Sanitized sample only. |
| type | `Demo Document` | Clearly fake. |
| owner | `Alex Demo` | Fake client. |

### Automation

| Field | Example | Notes |
| --- | --- | --- |
| name | `Demo New Lead Notification` | Fake workflow. |
| provider | `Demo Provider` | Do not include real tokens. |
| status | `Disabled` | Safe default until configured. |

### Portal Settings

| Field | Example | Notes |
| --- | --- | --- |
| portalName | `DisputePilot Demo Portal` | Fake/demo label. |
| portalUrl | `https://portal.disputepilot.com/demo/client` | Placeholder until buyer-owned URL. |
| referralUrl | `https://portal.disputepilot.com/demo/referrals` | Placeholder until buyer-owned URL. |
| videoStatus | `Placeholder` | Do not claim real hosted videos. |

## 9. What Should NOT Be Included In Sale Package

- Original app credentials.
- Real customer data.
- Raw Playwright reports with private screenshots, traces, or videos.
- Old `audit-results/` unless sanitized and explicitly marked internal.
- `.env` files or local env files.
- Personal account tokens.
- Private Supabase, Vercel, GitHub, payment, email/SMS, AI, or integration tokens.
- Browser profile data, cookies, localStorage dumps, or saved sessions.
- Original-platform exports or screenshots containing private data.
- Uploaded documents containing real identities, addresses, credit reports, IDs, contracts, or account data.

## 10. Follow-Up Implementation Tasks For Codex

Do not implement these in this documentation pass. Future tasks can be run separately:

- Add a `demo-seed` data file if appropriate, using only fake `example.test` identities.
- Add or update `.env.example` if missing, with placeholder variable names only.
- Add a cleanup script if appropriate, limited to generated artifacts and clearly documented safe paths.
- Add sanitized docs screenshots only after verifying they contain fake demo data.
- Verify no secret-like strings before sale using repository scans.
- Verify no real emails, phone numbers, addresses, credit-report data, or uploaded private files are included in the sale package.
- Add a buyer-safe screenshot folder or archive only after manual review.
- Add a README note explaining how to reseed/reset demo data if a formal seed flow is created.