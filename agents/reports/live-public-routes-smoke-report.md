# Live Public Routes Smoke Report

Live URL: https://disputepilot-app.vercel.app

Command run:

```powershell
$env:BASE_URL="https://disputepilot-app.vercel.app"
npx playwright test tests/live-public-routes-smoke.spec.ts --project=chromium --config=playwright.config.ts
```

Result: Fail to execute in this sandbox. Playwright exited before running tests with `Error: spawn EPERM` while the configured `webServer` attempted to start `npm run dev -- --hostname 127.0.0.1 --port 3201`.

Public routes checked by the new spec:

- `/public/forms/client-auto-signup`
- `/public/forms/website-lead-form`
- `/public/forms/affiliate-website-form`
- `/embed/website-lead-form.js`
- `/embed/affiliate-website-form.js`

Live HTTP fallback checks:

- `/public/forms/client-auto-signup`: HTTP 200, HTML response, did not contain `Business Login`.
- `/public/forms/website-lead-form`: HTTP 200, HTML response, did not contain `Business Login`.
- `/public/forms/affiliate-website-form`: HTTP 200, HTML response, did not contain `Business Login`.
- `/embed/website-lead-form.js`: HTTP 200, JavaScript response, did not contain `Business Login`, included `/public/forms/website-lead-form`.
- `/embed/affiliate-website-form.js`: HTTP 200, JavaScript response, did not contain `Business Login`, included `/public/forms/affiliate-website-form`.

Unexpected Business Login routes: none observed in fallback HTTP checks. Playwright browser form-submission checks did not execute because of the `spawn EPERM` launch failure.

App files changed: none.
