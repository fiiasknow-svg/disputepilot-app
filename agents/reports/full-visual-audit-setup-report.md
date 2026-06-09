# Full Visual Audit Setup Report

## Scope

- Adds `tests/full-visual-audit.spec.ts` in the root project.
- Audits 17 requested routes at desktop `1440x1000` and mobile `390x844` viewports.
- Captures the original site and the clone without changing application UI code.

## Safety Behavior

- Optionally signs into the original Business Login with `ORIGINAL_E2E_EMAIL` and `ORIGINAL_E2E_PASSWORD`.
- Reuses the authenticated original browser storage state across both audit viewports.
- Uses `auth-original.json` when credentials are absent and that local storage state is available.
- Marks original login redirects as `blocked-original-session` instead of failing.
- Records skipped, passed, or failed original login metadata without exposing credential values.
- Records original and clone navigation or screenshot errors in report entries.
- Clears the audit screenshot directory before each run so stale comparison artifacts are not retained.
- Compares captured original/clone pairs with `sharp`, records changed pixels and percentages, and writes diff PNGs.
- Does not assert visual equality; screenshot differences and comparison errors remain report-only.
- Fails only when browser/test runtime or report generation prevents a complete 34-entry report.

## Optional Original Login

Run with original credentials in PowerShell:

```powershell
$env:ORIGINAL_E2E_EMAIL="original-account@example.com"
$env:ORIGINAL_E2E_PASSWORD="original-account-password"
npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts
```

Run without credentials:

```powershell
Remove-Item Env:ORIGINAL_E2E_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:ORIGINAL_E2E_PASSWORD -ErrorAction SilentlyContinue
npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts
```

When credentials are missing, login is reported as `skipped`. When login fails, it is reported as `failed`; clone capture and report generation continue.

## Outputs

- `audit-results/full-visual-audit/report.json`
- `audit-results/full-visual-audit/report.md`
- `audit-results/full-visual-audit/screenshots/`

## Validation

Command run:

```powershell
npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts
```

Result: passed, `1 passed` in approximately 1.7 minutes.

- Original login attempted: no
- Original login status: `skipped`
- Report entries: 34
- Original captured: 0
- Original blocked by login/session: 34
- Original errors: 0
- Clone captured: 34
- Clone errors: 0
- Entries marked `not-compared`: 34 because the original session was blocked in this validation run
- Screenshot files: 68 total, including blocked original login-page captures
