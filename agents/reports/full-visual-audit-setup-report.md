# Full Visual Audit Setup Report

## Scope

- Adds `tests/full-visual-audit.spec.ts` in the root project.
- Audits 17 mapped route surfaces at desktop `1440x1000` and mobile `390x844` viewports.
- Captures the original site and the clone without changing application UI code.
- Uses explicit route objects with `label`, `originalPath`, `clonePath`, `routeMappingConfidence`, and optional notes.
- Separates known original paths from guessed paths so route mapping issues do not masquerade as visual differences.

## Safety Behavior

- Optionally signs into the original Business Login with `ORIGINAL_E2E_EMAIL` and `ORIGINAL_E2E_PASSWORD`.
- Reuses the authenticated original browser storage state across both audit viewports.
- Uses `auth-original.json` when credentials are absent and that local storage state is available.
- Marks original login redirects as `blocked-original-session` instead of failing.
- Records skipped, passed, or failed original login metadata without exposing credential values.
- Records original and clone navigation or screenshot errors in report entries.
- Marks original URLs containing `/Home/Index?aspxerrorpath=` as `original-route-fallback`.
- Marks other original redirects away from the requested mapped URL as `original-unexpected-redirect`.
- Marks clone HTTP `404` responses as `clone-error`.
- Skips pixel comparison for clone-only routes, original route fallbacks, unexpected original redirects, blocked original sessions, original errors, and clone errors.
- Clears the audit screenshot directory before each run so stale comparison artifacts are not retained.
- Compares captured original/clone pairs with `sharp`, records changed pixels and percentages, and writes diff PNGs.
- Does not assert visual equality; screenshot differences and comparison errors remain report-only.
- Fails only when browser/test runtime or report generation prevents a complete 34-entry report.

## Route Mapping

The audit no longer assumes the original and clone share the same path. Each route is mapped independently:

- `exact`: the original path is known from an existing compare test or a confirmed route.
- `guessed`: the original path is a best-effort legacy-route guess.
- `clone-only`: no original equivalent is currently encoded in the compare tests.
- `needs-review`: an attempted original mapping reached a route fallback or otherwise needs manual route review.

Known exact mappings currently include:

- Dashboard: clone `/dashboard`, original `/`
- Clients: clone `/clients`, original `/User/ClientIndex`
- Leads: clone `/leads`, original `/WebLeads/MyWebLeads`
- Billing: clone `/billing`, original `/PaymentProcessor` because the original Billing parent is menu-only in the captured account
- Disputes: clone `/disputes`, original `/User/DisputeCenter`
- Dispute Status: clone `/disputes/status`, original `/home/quickview`
- Furnisher Addresses: clone `/dispute-manager/furnisher-addresses`, original `/CreditorsCollectors/CreditorsCollectorsList`
- Letter Vault: clone `/letter-vault`, original `/LetterVault`
- Calendar: clone `/calendar`, original `/Reminder`
- Company Settings: clone `/company/settings`, original `/Settings`
- Team Messages: clone `/company/team-messages`, original `/Messages`
- Portals / Mobile App: clone `/company/portals`, original `/Settings/PortalsMobileApp`

Corrected clone audit paths:

- Documents now audits clone `/company/images-documents` instead of `/documents` because no root `/documents` route exists.
- Portals / Mobile App now audits clone `/company/portals` instead of `/portals` because no root `/portals` route exists.

Clone-only mappings currently include AI Letter Rewriter, Help, Automation, Images/Documents, and Documents because the captured original navigation either has no direct original equivalent or exposes only a non-navigating menu item for that surface.

If a mapped original route redirects to `https://www.clientdisputemanager.com/Home/Index?aspxerrorpath=...`, the entry is reported as `original-route-fallback`, its mapping confidence is promoted to `needs-review`, and its diff status remains `not-compared`. If it redirects somewhere else unexpectedly, it is reported as `original-unexpected-redirect` and is also excluded from pixel comparison.

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

The JSON and markdown reports include mapping metadata:

- `exactMappingCount`
- `guessedMappingCount`
- `needsReviewMappingCount`
- `cloneOnlyCount`
- `originalFallbackCount`
- `originalUnexpectedRedirectCount`
- `clone404Count`

The markdown report summarizes valid compared mappings, original fallback mappings needing review, unexpected original redirects needing review, clone 404 mappings, and the top visual diffs only from valid compared mappings.

## Validation

Command run:

```powershell
npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts
```

Result: passed, `1 passed` in approximately 1.8 minutes.

- Original login attempted: no
- Original login status: `skipped`
- Report entries: 34
- Original captured: 0
- Original blocked by login/session: 24
- Original errors: 0
- Clone captured: 34
- Clone errors: 0
- Entries marked `not-compared`: 34 because the original session was blocked in this validation run
- Exact route mappings: 12
- Guessed route mappings: 0
- Clone-only route mappings: 5
- Original route fallbacks: 0
- Original unexpected redirects: 0
- Clone 404s: 0
- Screenshot files include clone captures for all 34 entries and blocked original login-page captures for the 24 original routes attempted
