# Security, Secrets, and Privacy Scan

Date: 2026-09-30

Scope: report-only scan of the root repository at `C:\Users\LESLI\disputepilot-app`, excluding the nested `disputepilot-app/` folder. This is not legal advice and is not a replacement for a professional security review.

## Executive Summary

No committed full private keys, GitHub tokens, Vercel tokens, OpenAI keys, Resend keys, Stripe secret keys, or Twilio auth tokens were verified in the source/docs sample scanned.

Important sale-readiness risks remain:

- Local ignored files exist and likely contain sensitive operational state: `.env.local`, `auth-original.json`, `.vercel/`, `test-results/`, and `playwright-report/`.
- Tracked parity artifacts include original-site screenshots under `parity-results/`; these should not be included in a buyer-facing package without sanitization and ownership/privacy review.
- Visible/demo code still contains personal-looking names and realistic-looking `.com` email addresses. These may be fake, but they should be replaced with reserved-domain demo data before a serious buyer demo or transfer.
- Some flows store provider tokens/settings in `localStorage` and clearly say no backend connection is created. This is acceptable for a demo only, but should be disclosed.
- Production security/multi-tenant readiness still needs a separate review of Supabase RLS, storage, auth, billing, email delivery, and deployment ownership before real customer data.

## Scope Scanned

Verified searches covered:

- App/source files: `app/`, `components/`, `lib/`
- Tests and helpers: `tests/`
- Internal docs and sale-readiness docs: `docs/`, `agents/reports/`, `agents/prompts/`
- Root config/template files: `.gitignore`, `.env.example`, `.env.local.example`, `playwright.config.ts`, `package.json`
- Generated/local artifact presence checks: `.env.local`, `auth-original.json`, `audit-results/`, `test-results/`, `playwright-report/`, `parity-results/`, `manual-workflow-audit.json`, `.vercel/`

The nested folder `disputepilot-app/` was excluded from all intended review work.

## Search Terms and Patterns Checked

- Secret words: `password`, `secret`, `token`, `api_key`, `apikey`, `private_key`
- Private-key markers: `BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE KEY`, `BEGIN OPENSSH PRIVATE KEY`
- Provider patterns: `sk_live_`, `sk_test_`, `pk_live_`, `pk_test_`, `whsec_`, `ghp_`, `github_pat_`, `AIza`, `xoxb-`, `SG.`
- Environment variables: `process.env`, `NEXT_PUBLIC_`, `SUPABASE`, `VERCEL`, `STRIPE`, `EMAIL`, `SMTP`, `TWILIO`, `OPENAI`, `API_KEY`, `SECRET`, `TOKEN`, `BASE_URL`, `E2E_EMAIL`, `E2E_PASSWORD`, `ORIGINAL_E2E_EMAIL`, `ORIGINAL_E2E_PASSWORD`
- Original platform terms: `clientdisputemanager`, `creditrestorationportal`, `affiliatecreditrepairportal`, `auth-original`
- Personal-data patterns: email addresses, phone-number shapes, SSN-like shapes, credit-card-like digit groups
- Security shortcut terms: `TODO`, `FIXME`, `unsafe`, `bypass`, `temporary`, `local-only`, `saved locally`, `No backend`, `No real`, `production`

## Verified Findings by Severity

### Blocker

No committed full secret or private-key blocker was verified in the scanned files.

Before any buyer transfer, treat the local working copy itself as sensitive because ignored local files are present.

### High

#### Local environment file exists

- `.env.local`: present in the working tree, ignored by `.gitignore`, 574 bytes.
- Pattern-only check found references to `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and Stripe-related variables. Values were not printed or copied into this report.

Risk: may contain live Supabase, OpenAI, Stripe, or other operational secrets.

Recommendation: do not share this file. Rotate any secrets it contains before transfer, then provide only `.env.example` to the buyer.

#### Original-site authenticated session file exists

- `auth-original.json`: present in the working tree, ignored by `.gitignore`, 6124 bytes.
- `.gitignore:32` protects `auth-original.json`.

Risk: may contain original-site session cookies or authentication state.

Recommendation: delete locally before packaging or screen-sharing the repository. Rotate/revoke original-site access if that account was real.

#### Tracked original-site screenshot artifacts exist

Examples from `git ls-files` and asset scan:

- `parity-results/letters/desktop-original.png`
- `parity-results/letters/mobile-original.png`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/agent-4-live-audit/billing/desktop-original.png`
- `parity-results/agent-4-live-audit/leads/desktop-original.png`
- `parity-results/agent-4-live-audit/affiliates/desktop-original.png`

Risk: screenshots may include third-party/original-platform UI, account state, or private data. Because these files are tracked, they can be included in repository transfer unless intentionally removed or disclosed.

Recommendation: keep these internal only. Before buyer-facing sharing, either remove from the external sale package, sanitize, or move to a private diligence archive after attorney review.

### Medium

#### Personal-looking account/display name is hardcoded in visible app surfaces

Verified locations:

- `components/CDMLayout.tsx:243`
- `components/CDMLayout.tsx:251`
- `components/CDMLayout.tsx:331`
- `components/AcademyPage.tsx:71`
- `app/company/settings/page.tsx:155`
- `app/billing/pay-per-deletion/page.tsx:27`
- `app/billing/BillingWorkspace.tsx:46`
- `app/billing/BillingWorkspace.tsx:55`
- `app/billing/BillingWorkspace.tsx:62`

Redacted example: `<PERSON_NAME>` is displayed as the signed-in user, certificate recipient, company setting value, and billing demo client.

Risk: may expose a real person or make the demo look unsanitized.

Recommendation: replace with clearly fake demo names such as `Alex Demo`, `Jordan Sample`, or `Casey Test`, and update tests only where they assert visible copy.

#### Realistic-looking demo emails use public `.com` domains

Verified examples:

- `app/company/manage-emails/page.tsx:21` through `app/company/manage-emails/page.tsx:26`
- `app/clients/page.tsx:33`
- `app/clients/page.tsx:53`
- `app/billing/pay-per-deletion/page.tsx:27`
- `app/disputes/[id]/page.tsx:43`
- `app/disputes/status/page.tsx:20`
- `app/disputes/status/page.tsx:30`

Redacted example: `<first.last>@email.com` and `<name>@example.com`.

Risk: these appear fake, but `.com` examples are less clearly reserved for documentation/demo than `example.test`.

Recommendation: convert demo data to `example.test` addresses where possible.

#### Local/demo fallback and localStorage secrets are intentionally present

Verified locations:

- `app/settings/configuration/page.tsx:400`: integration setup saved locally with masked secrets and no backend connection.
- `app/settings/configuration/page.tsx:912`: local setup only; no real provider connection or backend secret storage.
- `app/automation/zapier/page.tsx:36`: stores connection token in `localStorage`.
- `app/automation/go-highlevel/page.tsx:30`: stores API token in `localStorage`.
- `app/company/manage-emails/page.tsx:156`: SMTP settings saved locally.
- `app/public/forms/client-auto-signup/page.tsx:40`: signup saved locally; no hosted portal/billing/email/e-signature created.
- `app/public/forms/self-service-signup/page.tsx:33`: self-service signup saved locally; Stripe, portal hosting, email, and e-signature delivery are not connected.

Risk: acceptable for demo behavior only. It is not production-grade secret handling.

Recommendation: disclose clearly in buyer demos and handoff docs. For production, move provider credentials to server-side encrypted storage or external provider configuration.

#### Non-production test-auth bypass exists

- `lib/api-auth.ts:8`: accepts `x-disputepilot-test-auth: 1` only when `NODE_ENV !== "production"`.
- `docs/phase-3-auth-data-isolation-audit.md:23` documents the bypass.

Risk: low if production environment is correct; higher if deployment misconfigures `NODE_ENV`.

Recommendation: verify production `NODE_ENV=production` and add a live negative test that the test auth header does not bypass auth in production.

### Low

#### Placeholder Stripe-like tokens are used as examples

Verified locations:

- `app/company/self-service-signup/page.tsx:108`: `sk_live_...`, `pk_live_...`, `whsec_...` placeholders.
- `app/billing/credit-card-setup/page.tsx:175`: `pk_live_...` placeholder.
- `app/billing/credit-card-setup/page.tsx:240`: `pk_test_local` default demo value.
- `tests/billing-buttons-complete.spec.ts:84`: `pk_test_visible` test value.

Risk: these are placeholders/test values, not verified real keys.

Recommendation: keep placeholders visibly fake; avoid showing `sk_live_` wording in buyer demos unless explaining configuration placeholders.

#### Original-platform references remain in internal docs/tests

Examples:

- `tests/sidebar-compare.spec.ts:4`
- `tests/full-visual-audit.spec.ts:19`
- `docs/phase-5-original-clone-parity-audit-plan.md:5`
- `agents/reports/sale-readiness/branding-ip-cleanup-audit.md:14`
- `agents/reports/sale-readiness/deployment-env-handoff.md:208`

Risk: not a secret issue, but not buyer-facing marketing material.

Recommendation: keep internal diligence docs separate from buyer-facing package, or provide them only when explicitly relevant to technical/legal due diligence.

### Informational

#### Environment template appears placeholder-only

- `.env.example:17`: `NEXT_PUBLIC_SUPABASE_URL=https://<buyer-project-ref>.supabase.co`
- `.env.example:18`: `NEXT_PUBLIC_SUPABASE_ANON_KEY=<buyer-supabase-anon-key>`
- `.env.example:31` and `.env.example:32`: test-only demo email/password placeholders.
- `.env.example:39` and `.env.example:40`: original audit placeholders.
- `.env.example:46`: `OPENAI_API_KEY=<buyer-openai-api-key>`
- `.env.example:49`: `RESEND_API_KEY=<buyer-resend-api-key>`
- `.env.example:57` through `.env.example:70`: commented optional provider placeholders.

No real values were verified in `.env.example`.

#### Ignore rules protect common local secret/artifact files

Verified:

- `.gitignore:13`: `.env`
- `.gitignore:14`: `.env.local`
- `.gitignore:18`: `.env.local.example`
- `.gitignore:27`: `playwright-report/`
- `.gitignore:28`: `test-results/`
- `.gitignore:32`: `auth-original.json`
- `.gitignore:40`: `.vercel/`
- `.gitignore:69`: `.env.*.local`

`audit-results/` is expected to be ignored as part of the deployment/env handoff cleanup work.

## Files Requiring Manual Review

- `.env.local`: inspect locally only, rotate all real secrets, never share.
- `auth-original.json`: remove from demo/transfer workspace; verify no original-site session remains.
- `.vercel/`: contains deployment project linkage; recreate under buyer account or remove before transfer package.
- `test-results/` and `playwright-report/`: remove before buyer demos; screenshots/traces may contain private state.
- `parity-results/`: tracked original/clone audit evidence; exclude from public sale package unless sanitized.
- `manual-workflow-audit.json`: tracked/generated audit data; review before sharing.
- `components/CDMLayout.tsx`: personal-looking visible account name.
- `components/AcademyPage.tsx`: personal-looking certificate recipient.
- `app/company/settings/page.tsx`: personal-looking default company/user value.
- `app/company/manage-emails/page.tsx`: realistic-looking email log demo data.
- `app/billing/pay-per-deletion/page.tsx` and `app/billing/BillingWorkspace.tsx`: personal-looking demo billing client.
- `app/automation/zapier/page.tsx` and `app/automation/go-highlevel/page.tsx`: localStorage token handling.
- `lib/api-auth.ts`: non-production test-auth bypass guard.
- `agents/reports/sale-readiness/branding-ip-cleanup-audit.md`: internal audit content with original-platform references.

## Confirmed Safe Placeholders

- `.env.example` uses placeholder values and comments; no full real secrets were verified there.
- `.env.local.example` uses the same placeholder-style values from the current scan.
- Test emails using `example.test` are safe demo/test-domain patterns.
- Phone numbers in `555-0100` style are appropriate demo data.
- Stripe-like strings ending in `...`, `pk_test_local`, or `pk_test_visible` are placeholders/test strings, not verified real provider secrets.

## Redacted Examples Only

Use this format in buyer-facing docs and handoff notes:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<buyer-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<buyer-supabase-anon-key>
OPENAI_API_KEY=<redacted-openai-key>
RESEND_API_KEY=<redacted-resend-key>
STRIPE_SECRET_KEY=<redacted-stripe-secret>
E2E_EMAIL=<demo-admin-email@example.test>
E2E_PASSWORD=<redacted-demo-password>
ORIGINAL_E2E_EMAIL=<internal-audit-email>
ORIGINAL_E2E_PASSWORD=<redacted-original-audit-password>
```

Do not paste real values into docs, tickets, screenshots, chat, or sale materials.

## Personal/Test Data Cleanup Recommendations

- Replace visible personal-looking names with fake demo names from `demo-data-cleanup-plan.md`.
- Prefer `example.test` for all demo emails.
- Prefer `555-0100` through `555-0199` style phone numbers.
- Replace realistic email logs with clearly fake demo recipients.
- Remove local screenshots, traces, videos, and reports before demos unless intentionally sanitized.
- Keep original-platform audit artifacts out of buyer-facing folders.

## Secrets Rotation Checklist

- [ ] Rotate Supabase anon/service keys if any were used by the seller locally.
- [ ] Rotate OpenAI keys.
- [ ] Rotate Resend/email provider keys.
- [ ] Rotate Stripe test/live keys and webhook secrets.
- [ ] Rotate Twilio/SMS keys if ever configured.
- [ ] Rotate Vercel tokens and recreate project linkage under buyer ownership.
- [ ] Revoke original-site audit credentials or sessions.
- [ ] Invalidate local `auth-original.json` sessions.
- [ ] Remove seller-owned demo account passwords from shells, password managers, browser profiles, and docs.
- [ ] Confirm buyer gets new credentials through a secure channel outside the repository.

## Pre-Sale Privacy Checklist

- [ ] Delete or exclude `.env.local`, `.vercel/`, `auth-original.json`, `test-results/`, `playwright-report/`, and unsanitized `audit-results/`.
- [ ] Decide whether tracked `parity-results/` should remain in the transferred repo or move to a private diligence archive.
- [ ] Replace personal-looking visible demo names.
- [ ] Replace realistic `.com` demo emails with `example.test`.
- [ ] Confirm no screenshots show real accounts, names, emails, dashboard data, or original-site private pages.
- [ ] Confirm public form demo submissions contain fake data only.
- [ ] Confirm Supabase database/storage contains no real customer data.
- [ ] Confirm buyer docs contain placeholders only.

## Buyer Transfer Security Checklist

- [ ] Transfer or recreate GitHub repository access with least privilege.
- [ ] Transfer or recreate Vercel project under buyer-owned account.
- [ ] Transfer or recreate Supabase project and storage under buyer-owned account.
- [ ] Configure fresh environment variables from `.env.example`.
- [ ] Remove all seller-owned credentials from deployment settings.
- [ ] Create buyer-owned demo admin account.
- [ ] Verify production auth, RLS, storage policies, and API route authorization.
- [ ] Verify billing/email/AI providers are buyer-owned and configured intentionally.
- [ ] Run the full Playwright suite after buyer-owned environment setup.
- [ ] Run live smoke tests against buyer deployment with `BASE_URL` set intentionally.

## Follow-Up Codex Tasks

Report-only; do not implement during this scan.

1. Replace hardcoded personal-looking demo names and related test expectations with safe demo identities.
2. Convert app demo emails from `.com` examples to `example.test`.
3. Create a sanitized buyer demo seed file if the product will ship with sample data.
4. Add a pre-sale cleanup script that removes ignored local artifacts and verifies `git status`.
5. Add a secret-scan CI check such as Gitleaks or TruffleHog with an allowlist for known placeholders.
6. Add a production negative smoke test confirming `x-disputepilot-test-auth` is ignored in production.
7. Decide whether tracked `parity-results/` should be removed from sale-transfer branches or kept in an internal diligence branch.
