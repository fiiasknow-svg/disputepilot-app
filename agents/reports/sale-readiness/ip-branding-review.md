# IP and Branding Review

This is not legal advice. Attorney review is recommended before marketing, sale, or transfer.

## Clone/IP Risk Items to Review

- Screen structure and navigation copied from or modeled after Client Dispute Manager.
- Feature naming that may match original product terminology too closely.
- Dashboard, client, dispute, billing, letter vault, calendar, portals, and settings workflows that were compared against the original.
- Visual audit route mappings to `https://www.clientdisputemanager.com`.
- Any screenshots, parity artifacts, or reports that include original-site captures.
- Any use of original product names in code, tests, docs, links, or generated artifacts.

## Branding/Copy References to Review

Repo search found references to Client Dispute Manager / original URLs in docs, prompts, reports, tests, and visual audit tooling. Examples include:

- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-final-audit-report.md`
- `agents/prompts/*`
- `agents/reports/full-visual-audit-setup-report.md`
- Compare and visual audit tests under `tests/`

These may be acceptable as internal audit history, but they should be reviewed before sharing a sale package externally.

## Original-Style or Third-Party Portal Links

Review portal/mobile-app routes and tests for links to external portal/app-store resources. Some portal-related tests reference external portal login/app URLs. Buyer should decide whether to replace these with DisputePilot-owned links, neutral placeholders, or final partner URLs.

## Third-Party Libraries/Licenses to Review

Current package dependencies include:

- Next.js
- React
- React DOM
- Supabase SSR/client libraries
- Resend
- Playwright
- Tailwind CSS
- TypeScript
- ESLint / Next ESLint config

Buyer should run a dependency license and vulnerability review, for example:

```powershell
npm ls
npm audit
```

Also review transitive dependencies in `package-lock.json`.

## Suggested Cleanup Before External Buyer Sharing

- Replace or qualify clone/original-app language in outward-facing materials.
- Keep original comparison tooling internal unless buyer specifically wants it.
- Remove or segregate original screenshots/artifacts if they are not needed for diligence.
- Prepare a neutral DisputePilot product demo flow using only DisputePilot branding.
- Ask counsel to review product name, logo, screenshots, terms, privacy policy, and any claims about parity with the original app.
