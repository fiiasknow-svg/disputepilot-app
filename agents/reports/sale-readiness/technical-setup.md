# Technical Setup

## Prerequisites

- Node.js compatible with Next.js `16.2.1`.
- npm.
- Git.
- Playwright browser dependencies.
- Supabase project if running against real backend data.
- Vercel account for production deployment.

## Install

```powershell
npm install
```

## Development Server

```powershell
npm run dev
```

Playwright local tests start their own dev server at:

```text
http://127.0.0.1:3201
```

## Build

```powershell
npm run build
```

## Main Playwright Command

```powershell
npx playwright test --project=chromium --config=playwright.config.ts
```

Latest verified result: `358 passed`.

## Focused Audit Command

```powershell
npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts
```

The visual audit is report-only for visual differences. It writes:

- `audit-results/full-visual-audit/report.json`
- `audit-results/full-visual-audit/report.md`
- `audit-results/full-visual-audit/screenshots/`

## Live Smoke Commands

Public live smoke:

```powershell
$env:BASE_URL="https://disputepilot-app.vercel.app"
npx playwright test tests/live-public-routes-smoke.spec.ts --project=chromium --config=playwright.live.config.ts
```

Authenticated live smoke:

```powershell
$env:BASE_URL="https://disputepilot-app.vercel.app"
$env:E2E_EMAIL="buyer-demo-admin@example.com"
$env:E2E_PASSWORD="replace-with-secure-demo-password"
npx playwright test tests/live-authenticated-smoke.spec.ts --project=chromium --config=playwright.live.config.ts
```

Use buyer-owned credentials. Do not commit credentials.

## Environment Variable Template

Use placeholder names only in docs and examples:

```text
NEXT_PUBLIC_SUPABASE_URL=<buyer-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<buyer-supabase-anon-key>
OPENAI_API_KEY=<buyer-openai-api-key>
STRIPE_SECRET_KEY=<buyer-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<buyer-stripe-publishable-key>
RESEND_API_KEY=<buyer-resend-api-key>
BASE_URL=<deployment-url-for-tests>
E2E_EMAIL=<buyer-demo-admin-email>
E2E_PASSWORD=<buyer-demo-admin-password>
ORIGINAL_E2E_EMAIL=<original-site-audit-email-if-available>
ORIGINAL_E2E_PASSWORD=<original-site-audit-password-if-available>
```

Repo evidence: `.env.local.example` includes Supabase, OpenAI, and Stripe placeholders. `app/api/send-email/route.ts` uses `RESEND_API_KEY`. Live smoke helpers use `BASE_URL`, `E2E_EMAIL`, and `E2E_PASSWORD`. Full visual audit uses `ORIGINAL_E2E_EMAIL` and `ORIGINAL_E2E_PASSWORD`.

## Troubleshooting

- If Playwright output changes files under `audit-results/`, `parity-results/`, `test-results/`, `playwright-report/`, or JSON audit outputs, decide whether to keep or clean those generated artifacts before commit.
- If Supabase is missing, unavailable, or slow, several pages show local/demo fallback data so the UI remains usable. This is intentional but should not be mistaken for verified production persistence.
- If live smoke tests accidentally use `playwright.config.ts`, the local web server may start. For live deployment checks, prefer `playwright.live.config.ts`.
- If original visual comparison captures no original pages, check `ORIGINAL_E2E_EMAIL`, `ORIGINAL_E2E_PASSWORD`, and original-site login/session behavior.
- If authenticated live smoke reaches Business Login and fails, verify `E2E_EMAIL`, `E2E_PASSWORD`, Supabase auth settings, and deployment environment variables.

## Folder Warning

Use the root project:

```text
C:\Users\LESLI\disputepilot-app
```

Avoid the nested folder unless explicitly intended:

```text
C:\Users\LESLI\disputepilot-app\disputepilot-app
```
