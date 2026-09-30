# Deployment and Environment Handoff

Documentation/config handoff for buyer deployment and environment variables. Placeholder values only. Do not put real secrets, passwords, tokens, API keys, or credentials in this file or in committed env templates.

## Purpose

This document gives a buyer a practical map of environment variables, local setup, Vercel setup, Supabase setup, Playwright test settings, and secret-rotation steps needed to take over or recreate DisputePilot deployment infrastructure.

It is based on repository inspection, not assumptions about private seller accounts. Anything not directly verified from repo references is marked TODO/unknown.

## Repo-Verified Environment Variables

The repo was inspected for `process.env`, `NEXT_PUBLIC_`, `SUPABASE`, `VERCEL`, `STRIPE`, `EMAIL`, `SMTP`, `TWILIO`, `OPENAI`, `API_KEY`, `SECRET`, `TOKEN`, `BASE_URL`, `E2E_EMAIL`, `E2E_PASSWORD`, `ORIGINAL_E2E_EMAIL`, and `ORIGINAL_E2E_PASSWORD`.

Verified runtime/test variables:

| Variable | Required? | Where found | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Required for Supabase-backed app features | `lib/supabase.ts`, `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `app/settings/configuration/page.tsx` | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required for Supabase-backed app features | `lib/supabase.ts`, `lib/supabase-browser.ts`, `lib/supabase-server.ts` | Public Supabase anon key. |
| `OPENAI_API_KEY` | Optional unless AI endpoints are used | `app/api/rewrite-letter/route.ts`, `app/api/analyze-credit/route.ts` | Calls OpenAI chat completions for letter rewriting and credit analysis. |
| `RESEND_API_KEY` | Optional unless send-email API is used | `app/api/send-email/route.ts` | Sends email through Resend. |
| `BASE_URL` | Optional/test-only | Most Playwright specs | Overrides tested app URL. Defaults to `http://127.0.0.1:3201`. |
| `E2E_EMAIL` | Test-only | `tests/helpers/loginIfNeeded.ts` | Authenticated live smoke login email. |
| `E2E_PASSWORD` | Test-only | `tests/helpers/loginIfNeeded.ts` | Authenticated live smoke login password. |
| `ORIGINAL_E2E_EMAIL` | Internal audit-only | `tests/full-visual-audit.spec.ts` | Original reference-site visual audit login email. |
| `ORIGINAL_E2E_PASSWORD` | Internal audit-only | `tests/full-visual-audit.spec.ts` | Original reference-site visual audit login password. |
| `CI` | CI/test behavior | `playwright.config.ts` | Controls Playwright retries, workers, forbidOnly, and server reuse. |
| `NODE_ENV` | Runtime auth behavior | `lib/api-auth.ts` | Allows test auth header only outside production. |

Discovered but not verified as active runtime integration:

| Variable | Repo evidence | Status |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Existing ignored `.env.local.example` only | TODO/unknown. No verified runtime code reads it. Do not claim Stripe billing is live until implemented/verified. |
| `STRIPE_PUBLISHABLE_KEY` | Existing ignored `.env.local.example` only | TODO/unknown. No verified runtime code reads it. |
| SMTP variables | Search target requested; no verified runtime code found | TODO/unknown. Add only if email provider changes from Resend or SMTP integration is implemented. |
| Twilio variables | Search target requested; no verified runtime code found | TODO/unknown. Add only if SMS integration is implemented. |
| Vercel token variables | Search target requested; no verified runtime code found | TODO/unknown. Configure deployment through buyer-owned Vercel project/account, not committed env files. |

## Required vs Optional Variables

Required for production-like app runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional runtime features:

- `OPENAI_API_KEY` for AI letter rewriting and credit analysis endpoints.
- `RESEND_API_KEY` for the send-email API route.

Test/local only:

- `BASE_URL`
- `CI`
- `E2E_EMAIL`
- `E2E_PASSWORD`

Internal original visual audit only:

- `ORIGINAL_E2E_EMAIL`
- `ORIGINAL_E2E_PASSWORD`

Unknown/unverified optional billing/integration placeholders:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- SMTP/Twilio variables, if future code adds them.

## Local Setup Steps

1. Work only in root project:

   ```powershell
   cd C:\Users\LESLI\disputepilot-app
   ```

2. Do not use or edit the nested folder unless explicitly intended:

   ```text
   C:\Users\LESLI\disputepilot-app\disputepilot-app
   ```

3. Install dependencies:

   ```powershell
   npm install
   ```

4. Create a local env file from the template:

   ```powershell
   Copy-Item .env.example .env.local
   ```

5. Replace placeholders in `.env.local` with buyer-owned values only.

6. Start local dev server:

   ```powershell
   npm run dev -- --hostname 127.0.0.1 --port 3201
   ```

7. Run main local tests with `BASE_URL` unset unless intentionally testing a deployed URL:

   ```powershell
   npx playwright test --project=chromium --config=playwright.config.ts
   ```

## Vercel Setup Steps

1. Create or transfer a buyer-owned Vercel project.
2. Connect the buyer-owned GitHub repository or imported repo.
3. Configure build settings according to the Next.js project defaults unless buyer deployment requires otherwise.
4. Add environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` if AI endpoints are enabled.
   - `RESEND_API_KEY` if email sending is enabled.
5. Do not add original audit credentials to production Vercel env unless there is a documented internal-only reason.
6. Deploy a preview first, then production after smoke testing.
7. Confirm the deployment URL and update buyer docs if it changes.

TODO/unknown:

- Verify final production domain and DNS ownership.
- Verify whether buyer wants to recreate rather than transfer the existing Vercel project.
- Verify whether any Vercel project-level secrets or analytics settings exist outside repo evidence.

## Supabase / Database Setup Notes

Repo-verified facts:

- Browser/server Supabase helpers read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase-server.ts` throws if those values are missing.
- Package dependencies include `@supabase/supabase-js` and `@supabase/ssr`.

Buyer setup recommendations:

- Use a buyer-owned Supabase project or formally transfer the existing project.
- Review schema, RLS policies, auth settings, storage buckets, backups, and tenant isolation before real customer data.
- Rotate keys during transfer/recreation.
- Do not use seller personal Supabase projects for buyer production.
- Confirm storage buckets and uploaded files contain only clean demo data before transfer.

TODO/unknown:

- Verify actual production schema and RLS policy state in Supabase directly.
- Verify whether migrations or seed files exist/need creation.
- Verify storage bucket names and access policies.

## Playwright Test Env Notes

Main local command:

```powershell
npx playwright test --project=chromium --config=playwright.config.ts
```

Repo-verified behavior:

- `playwright.config.ts` starts `npm run dev -- --hostname 127.0.0.1 --port 3201`.
- Most tests use `BASE_URL || 'http://127.0.0.1:3201'`.
- `CI` changes retries, worker count, forbidOnly, and server reuse.
- Playwright sends `x-disputepilot-test-auth: 1` in test contexts; `lib/api-auth.ts` only honors this outside production.

Common local recommendation:

- Leave `BASE_URL` unset for normal local suite runs.
- Set `BASE_URL` only when intentionally testing a deployed app.

## Live Smoke Test Env Notes

Live smoke tests can use:

```powershell
$env:BASE_URL="https://<buyer-demo-deployment>"
$env:E2E_EMAIL="<demo-admin-email@example.test>"
$env:E2E_PASSWORD="<demo-admin-password>"
npx playwright test tests/live-public-routes-smoke.spec.ts tests/live-authenticated-smoke.spec.ts --project=chromium --config=playwright.config.ts
```

Rules:

- Use buyer-owned demo credentials only.
- Do not use personal credentials.
- Do not commit live credentials.
- Clear env variables from the shell after testing if needed.

## Original Visual Audit Env Notes

Internal audit variables:

```powershell
$env:ORIGINAL_E2E_EMAIL="<original-audit-email>"
$env:ORIGINAL_E2E_PASSWORD="<original-audit-password>"
```

Repo-verified behavior:

- `tests/full-visual-audit.spec.ts` uses these only for original reference-site login.
- The audit is report-only and should not fail solely on visual differences.
- If original login is unavailable, original comparison may be blocked or limited.

Buyer-facing guidance:

- Do not include original-site credentials in sale packages.
- Do not rely on original-site access for buyer demos.
- Keep original comparison tooling internal unless buyer specifically requests technical diligence context.

## Secret Rotation Checklist

Before buyer transfer or production use:

- [ ] Rotate Supabase anon/project keys if transferring an existing project.
- [ ] Rotate any Supabase service keys if they exist outside repo evidence.
- [ ] Rotate OpenAI key.
- [ ] Rotate Resend key.
- [ ] Rotate payment provider keys if billing integration is added/verified.
- [ ] Rotate Vercel tokens and GitHub tokens if any were used by seller accounts.
- [ ] Remove original-site credentials from local shells, password managers, docs, and generated artifacts.
- [ ] Delete or regenerate local `.env.local` files.
- [ ] Confirm no real secrets exist in git history or sale archives.

## Buyer Transfer / Recreation Checklist

- [ ] Transfer or recreate GitHub repository under buyer ownership.
- [ ] Transfer or recreate Vercel deployment/project.
- [ ] Transfer or recreate Supabase project/database/storage.
- [ ] Set all environment variables from `.env.example` using buyer-owned values.
- [ ] Configure buyer-owned domain/DNS.
- [ ] Configure buyer-owned email provider if using `RESEND_API_KEY`.
- [ ] Configure buyer-owned AI provider if using `OPENAI_API_KEY`.
- [ ] Verify billing provider separately before monetization.
- [ ] Run local Chromium suite: `358 passed` is the latest known baseline.
- [ ] Run live smoke tests against buyer deployment.
- [ ] Confirm generated artifacts are not included in buyer package unless sanitized.

## Unknowns / TODOs Needing Verification

- Whether the buyer will transfer or recreate the current Vercel project.
- Whether the buyer will transfer or recreate the current Supabase project.
- Actual Supabase schema, RLS, storage, backup, and tenant isolation readiness.
- Whether Stripe/payment env vars should be implemented; current repo scan did not verify active Stripe runtime usage.
- Whether SMTP/Twilio/SMS integrations are needed; current repo scan did not verify active runtime usage.
- Whether final production domain differs from the currently documented deployment URL.
- Whether all generated screenshots/audit artifacts are sanitized before buyer distribution.

## Common Mistakes To Avoid

- Leaving `BASE_URL` set to production during local test runs when intending to test the local dev server.
- Committing `.env`, `.env.local`, `.env.*.local`, or any file containing real credentials.
- Committing `audit-results/`, `test-results/`, `playwright-report/`, traces, videos, or screenshots.
- Relying on the seller's personal Vercel, Supabase, GitHub, OpenAI, Resend, payment, or domain accounts.
- Putting original visual audit credentials into buyer-facing docs or production deployment settings.
- Treating optional/local/demo env values as proof of production readiness.

## Related Files

- `.env.example`
- `.gitignore`
- `playwright.config.ts`
- `lib/supabase.ts`
- `lib/supabase-browser.ts`
- `lib/supabase-server.ts`
- `lib/api-auth.ts`
- `app/api/send-email/route.ts`
- `app/api/rewrite-letter/route.ts`
- `app/api/analyze-credit/route.ts`
- `tests/helpers/loginIfNeeded.ts`
- `tests/full-visual-audit.spec.ts`