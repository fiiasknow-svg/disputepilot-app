# Full Visual Audit Setup Report

## Scope

- Adds `tests/full-visual-audit.spec.ts` in the root project.
- Audits 17 requested routes at desktop `1440x1000` and mobile `390x844` viewports.
- Captures the original site and the clone without changing application UI code.

## Safety Behavior

- Uses `auth-original.json` for the original site when that local storage state is available.
- Marks original login redirects as `blocked-original-session` instead of failing.
- Records original and clone navigation or screenshot errors in report entries.
- Does not assert visual equality and records every entry as `diffStatus: not-compared`.
- Fails only when browser/test runtime or report generation prevents a complete 34-entry report.

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

- Report entries: 34
- Original captured: 0
- Original blocked by login/session: 34
- Original errors: 0
- Clone captured: 34
- Clone errors: 0
- Entries marked `not-compared`: 34
- Screenshot files: 68 total, including blocked original login-page captures
