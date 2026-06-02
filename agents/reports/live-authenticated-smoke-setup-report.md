# Live Authenticated Smoke Setup Report

## Files Added

- `tests/helpers/loginIfNeeded.ts`
- `tests/live-authenticated-smoke.spec.ts`

## Credential Env Presence

- `E2E_EMAIL`: present
- `E2E_PASSWORD`: present

Values were not printed.

## Test Command / Result

Command run:

```powershell
$env:BASE_URL="https://disputepilot-app.vercel.app"
npx playwright test tests/live-authenticated-smoke.spec.ts --project=chromium --config=playwright.config.ts
```

Result: failed before browser/test execution.

Observed output:

```text
E2E_EMAIL_PRESENT=True
E2E_PASSWORD_PRESENT=True
Error: spawn EPERM
```

The failure occurred during Playwright startup, before the live auth helper could reach Business Login. The current `playwright.config.ts` includes a `webServer` command, and this sandbox rejected the process spawn.

Additional verification:

```powershell
npx tsc --noEmit --pretty false --target ES2017 --lib dom,dom.iterable,esnext --module esnext --moduleResolution bundler --strict --esModuleInterop --isolatedModules --skipLibCheck tests/helpers/loginIfNeeded.ts tests/live-authenticated-smoke.spec.ts
```

Result: passed.

Repo-wide `npx tsc --noEmit --pretty false` still reports pre-existing type errors in other test files.

## Auth Failures

- None observed. The requested Playwright run did not get far enough to submit Business Login.
- The helper now throws a clear error if Business Login is shown and `E2E_EMAIL` or `E2E_PASSWORD` is missing.
- The helper also reports Business Login status text if sign-in submits but the dashboard shell never appears.

## Next Action

Rerun the requested Playwright command in an environment where the configured Playwright `webServer` process can spawn, or use a live-only Playwright config without `webServer` for this authenticated smoke spec.
