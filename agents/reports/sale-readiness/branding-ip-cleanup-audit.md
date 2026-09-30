# Branding/IP Cleanup Audit

Date: 2026-09-30

Scope: report-only technical/content audit of the root repository for branding, clone/IP, original-platform references, copied-looking portal/training copy, and sale-package hygiene. This is not legal advice. It identifies items that should be reviewed before showing the product to serious buyers or listing it for sale.

Nested folder excluded from review/edit scope: `C:\Users\LESLI\disputepilot-app\disputepilot-app`.

## Executive Summary

The repository still contains several buyer-facing and visible app references to Client Dispute Manager and original-platform domains. The highest-priority cleanup items are in app UI, not only internal docs:

- The main app shell visibly says `Client Dispute Manager` and `Client Dispute Manager Software`.
- Help/support links point to `clientdisputemanager.com` and `help.clientdisputemanager.com`.
- Dashboard training/resource links include `CDM Credit Boss Skool NEW`, `clientdisputemanager.com/coaching`, and `help.clientdisputemanager.com`.
- Portal/mobile-app UI includes original-style `Client Tracking Portal` / `Affiliate Portal` language and links to `creditrestorationportal.com` and `affiliatecreditrepairportal.com`.
- Activation modal copy says `Activate Your Client Dispute Manager Account Today`.
- Generated parity artifacts include original-site screenshots and should not be included in an external sale package without intentional diligence/legal review.

Internal parity docs and tests contain many expected references to “clone,” “original,” and Client Dispute Manager. These are acceptable as engineering history if kept internal, but should not be buyer-facing marketing material.

## Search Terms Checked

- `Client Dispute Manager`
- `CDM`
- `Credit Boss`
- `clientdisputemanager`
- `creditrestorationportal`
- `affiliatecreditrepairportal`
- Original-platform URLs and original-route references
- `clone`
- `original`
- `WATCH VIDEO`
- `Training Videos`
- `training video placeholder`
- `No hosted video source`
- `logo`, `screenshot`, `desktop-original`, `mobile-original`, `png`, `svg`, `app store`

## Findings By Severity

### Must Fix Before Showing Serious Buyer

#### Visible app shell uses original product branding

- [components/CDMLayout.tsx:229](../../../components/CDMLayout.tsx:229): visible shell text `Client Dispute Manager`.
- [components/CDMLayout.tsx:230](../../../components/CDMLayout.tsx:230): visible subtitle `Client Dispute Manager Software.`
- [components/CDMLayout.tsx:344](../../../components/CDMLayout.tsx:344): activation heading `Activate Your Client Dispute Manager Account Today`.
- [tests/task-behavior.spec.ts:7](../../../tests/task-behavior.spec.ts:7): test expects `Client Dispute Manager`, so any cleanup must update tests in the follow-up pass.
- [tests/live-authenticated-smoke.spec.ts:18](../../../tests/live-authenticated-smoke.spec.ts:18): authenticated smoke expects activation heading with Client Dispute Manager.
- [tests/compare.spec.ts:14](../../../tests/compare.spec.ts:14): compare test includes `Client Dispute Manager`.

Recommended replacement language:

- `Client Dispute Manager` -> `DisputePilot`
- `Client Dispute Manager Software.` -> `DisputePilot Credit Repair Platform.`
- `Activate Your Client Dispute Manager Account Today` -> `Activate Your DisputePilot Account`

#### Visible support/help links point to original platform

- [components/CDMLayout.tsx:305](../../../components/CDMLayout.tsx:305): `mailto:support@clientdisputemanager.com`.
- [components/CDMLayout.tsx:306](../../../components/CDMLayout.tsx:306): `https://help.clientdisputemanager.com`.
- [components/CDMLayout.tsx:307](../../../components/CDMLayout.tsx:307): `https://clientdisputemanager.com/faq`.
- [components/CDMLayout.tsx:308](../../../components/CDMLayout.tsx:308): `https://clientdisputemanager.com/success-path`.
- [components/CDMLayout.tsx:309](../../../components/CDMLayout.tsx:309): `https://clientdisputemanager.com/coaching`.
- [app/help/page.tsx:9](../../../app/help/page.tsx:9): copy references “Client Dispute Manager team.”
- [app/help/page.tsx:10](../../../app/help/page.tsx:10): support email.
- [app/help/page.tsx:15](../../../app/help/page.tsx:15): help center URL.
- [app/help/page.tsx:21](../../../app/help/page.tsx:21): FAQ URL.
- [app/help/page.tsx:27](../../../app/help/page.tsx:27): success-path URL.
- [app/help/page.tsx:33](../../../app/help/page.tsx:33): coaching URL.
- [tests/dashboard-training-resources.spec.ts:12](../../../tests/dashboard-training-resources.spec.ts:12): expects original coaching URL.
- [tests/dashboard-training-resources.spec.ts:15](../../../tests/dashboard-training-resources.spec.ts:15): expects original help URL.

Recommended replacement language/targets:

- `support@clientdisputemanager.com` -> `support@disputepilot.com` or `<buyer-support-email>`.
- `Help Center` link -> `/help` or buyer-owned help URL.
- `FAQ` link -> `/help` or buyer-owned FAQ URL.
- `Success Path` -> `Getting Started` with local route or buyer-owned resource.
- `1-on-1 Coaching` -> `Book Onboarding` with buyer-owned scheduling URL or “Coming soon” if no URL exists.

#### Dashboard uses CDM/Credit Boss/original-platform resource labels

- [app/dashboard/page.tsx:331](../../../app/dashboard/page.tsx:331): `CDM Credit Boss Skool NEW`.
- [app/dashboard/page.tsx:334](../../../app/dashboard/page.tsx:334): `https://clientdisputemanager.com/coaching`.
- [app/dashboard/page.tsx:337](../../../app/dashboard/page.tsx:337): `https://help.clientdisputemanager.com`.
- [tests/dashboard-training-resources.spec.ts:9](../../../tests/dashboard-training-resources.spec.ts:9): expects `CDM Credit Boss Skool NEW`.
- [agents/reports/final-whole-app-dead-controls-checklist.md:203](../final-whole-app-dead-controls-checklist.md:203): internal report documents the resource labels.
- [agents/reports/academy-training-buttons-function-checklist.md:133](../academy-training-buttons-function-checklist.md:133): internal checklist references `CDM Credit Boss Skool NEW`.

Recommended replacement language:

- `CDM Credit Boss Skool NEW` -> `DisputePilot Training Hub` or `Credit Repair Training Hub`.
- `1 to 1` -> `1-on-1 Onboarding`.
- `Help Center` can remain as a generic label, but URL should be buyer-owned/local.

#### Portal page points to original/third-party portal domains and uses source-like copy

- [app/company/portals/page.tsx:22](../../../app/company/portals/page.tsx:22): `Client Tracking Portal`.
- [app/company/portals/page.tsx:26](../../../app/company/portals/page.tsx:26): “Watch the video below to see what your clients experience inside the Client Tracking Portal.”
- [app/company/portals/page.tsx:28](../../../app/company/portals/page.tsx:28): “Preview what your clients see inside the Client Tracking Portal - no login required.”
- [app/company/portals/page.tsx:29](../../../app/company/portals/page.tsx:29): `Client Tracking Portal Q&A`.
- [app/company/portals/page.tsx:40](../../../app/company/portals/page.tsx:40): `https://www.creditrestorationportal.com/Account/Login`.
- [app/company/portals/page.tsx:43](../../../app/company/portals/page.tsx:43): `Affiliate Portal`.
- [app/company/portals/page.tsx:48](../../../app/company/portals/page.tsx:48): “Preview the Affiliate Portal view - see exactly what your partners will see.”
- [app/company/portals/page.tsx:60](../../../app/company/portals/page.tsx:60): `https://www.affiliatecreditrepairportal.com/Account/Login`.
- [app/company/portals/page.tsx:164](../../../app/company/portals/page.tsx:164): visible portal overview copy references Client Tracking Portal and Affiliate Portal.
- [app/company/portals/page.tsx:210](../../../app/company/portals/page.tsx:210): `Client Tracking Portal Mobile Application`.
- [app/company/portals/page.tsx:212](../../../app/company/portals/page.tsx:212): mobile Client Tracking Portal copy.
- [app/company/portals/page.tsx:216](../../../app/company/portals/page.tsx:216): mobile app download copy.
- [tests/portals-compare.spec.ts:19](../../../tests/portals-compare.spec.ts:19): expects `Client Tracking Portal`.
- [tests/portals-compare.spec.ts:32](../../../tests/portals-compare.spec.ts:32): expects `creditrestorationportal.com`.
- [tests/portals-compare.spec.ts:46](../../../tests/portals-compare.spec.ts:46): expects `affiliatecreditrepairportal.com`.
- [tests/company-settings-pages-smoke.spec.ts:42](../../../tests/company-settings-pages-smoke.spec.ts:42): expects `Client Tracking Portal`.
- [tests/company-settings-pages-smoke.spec.ts:47](../../../tests/company-settings-pages-smoke.spec.ts:47): expects `creditrestorationportal.com`.
- [tests/company-settings-pages-smoke.spec.ts:50](../../../tests/company-settings-pages-smoke.spec.ts:50): expects `affiliatecreditrepairportal.com`.

Recommended replacement language:

- `Client Tracking Portal` -> `Client Portal`.
- `Affiliate Portal` -> `Referral Partner Portal` or `Affiliate Portal` only if buyer owns that branding.
- `Client Tracking Portal Mobile Application` -> `Client Portal Mobile Access`.
- Original URLs -> buyer-owned portal URLs, local public routes, or explicit “configure final portal URL” placeholders.

#### Original screenshots/artifacts should not be included in sale package by default

Original-site screenshots and audit data are present under `parity-results/`:

- `parity-results/agent-4-live-audit/**/desktop-original.png`
- `parity-results/agent-4-live-audit/**/mobile-original.png`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/letters/desktop-original.png`
- `parity-results/letters/mobile-original.png`
- `parity-results/agent-4-live-audit/audit-snapshots.json`
- `parity-results/agent-4-live-audit/original-owned-links.json`
- `parity-results/agent-5-audit/original-links.json`

Recommendation: keep these internal for engineering diligence only. Do not include them in buyer-facing decks, marketplace listings, public repos, or screenshots unless counsel and the buyer intentionally request them for diligence.

### Should Fix Before Listing For Sale

#### Sale-readiness docs still use clone/original language in buyer-facing package

- [agents/reports/sale-readiness/README.md:7](README.md:7): “functional clone-style product inspired by Client Dispute Manager workflows.”
- [agents/reports/sale-readiness/README.md:16](README.md:16): “Latest clone-only visual audit result...”
- [agents/reports/sale-readiness/README.md:61](README.md:61): “IP exposure from clone-style implementation.”
- [agents/reports/sale-readiness/sale-package.md:7](sale-package.md:7): “clone visual audit captures...”
- [agents/reports/sale-readiness/sale-package.md:83](sale-package.md:83): “Clone visual audit captures...”
- [agents/reports/sale-readiness/known-issues-and-limitations.md:29](known-issues-and-limitations.md:29): heading `Clone/IP exposure requires legal review`.
- [agents/reports/sale-readiness/known-issues-and-limitations.md:31](known-issues-and-limitations.md:31): says app was built as “clone-style.”
- [agents/reports/sale-readiness/buyer-handoff-checklist.md:112](buyer-handoff-checklist.md:112): “Review clone-style screens...”
- [agents/reports/sale-readiness/ip-branding-review.md:5](ip-branding-review.md:5): `Clone/IP Risk Items`.

Recommended buyer-facing replacements:

- “clone visual audit” -> “visual regression audit” or “route screenshot audit.”
- “clone-style product” -> “credit-repair operations platform modeled around common dispute-management workflows.”
- “original-site comparison” -> “legacy reference-site comparison” in internal diligence only.
- Keep frank clone/IP wording in internal legal/engineering docs, but label those docs “internal diligence.”

#### Training/video labels imply videos exist, while many are placeholders

Visible UI that is honest once opened but may overpromise at button level:

- [components/PageHeader.tsx:99](../../../components/PageHeader.tsx:99): generic `Training Videos`.
- [app/dashboard/page.tsx:256](../../../app/dashboard/page.tsx:256): `Training Videos` button routes to academy.
- [app/company/portals/page.tsx:178](../../../app/company/portals/page.tsx:178): `WATCH VIDEO`.
- [app/company/portals/page.tsx:377](../../../app/company/portals/page.tsx:377): placeholder text says no hosted training video is connected.
- [app/letter-vault/page.tsx:616](../../../app/letter-vault/page.tsx:616): `Training Videos`.
- [app/letter-vault/page.tsx:621](../../../app/letter-vault/page.tsx:621): `Letter Vault Training Video`.
- [app/letter-vault/page.tsx:622](../../../app/letter-vault/page.tsx:622): `Move Letters Training Video`.
- [app/letter-vault/page.tsx:830](../../../app/letter-vault/page.tsx:830): `Training video placeholder`.
- [app/employees/page.tsx:540](../../../app/employees/page.tsx:540): `Training Videos`.
- [app/employees/page.tsx:688](../../../app/employees/page.tsx:688): `Employees Training Videos`.
- [app/employees/page.tsx:696](../../../app/employees/page.tsx:696): `Employee training video placeholder`.
- [app/employees/page.tsx:698](../../../app/employees/page.tsx:698): no hosted employee training video source connected.
- [components/AcademyPage.tsx:280](../../../components/AcademyPage.tsx:280): no hosted video source connected for lesson.

Recommended replacement language until assets exist:

- `Training Videos` -> `Training` or `Training Library`.
- `WATCH VIDEO` -> `Preview Training Placeholder` or `Open Training Info`.
- `Letter Vault Training Video` -> `Letter Vault Training Guide`.
- `Move Letters Training Video` -> `Move Letters Training Guide`.
- Add clear “video assets pending” language near the button, not only inside modal.

#### Default Next/Vercel public SVGs remain

Public starter assets exist:

- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`

These are standard starter assets, not necessarily copied from the source product, but they should be removed if unused or verified under their original license before packaging.

#### Backup file should be reviewed

- `components/CDMLayout.tsx.backup2` exists and appears to contain copied/old layout code with inline SVGs and app shell content.

Recommendation: decide whether this backup file belongs in the sale package. If not needed, remove it in a later cleanup pass after confirming no imports reference it.

### Disclose Or Review With Attorney

#### Internal docs are explicit about cloning and original parity

Examples:

- [docs/phase-5-original-clone-parity-audit-plan.md:1](../../../docs/phase-5-original-clone-parity-audit-plan.md:1): `Phase 5 Original-vs-Clone Parity Audit Plan`.
- [docs/phase-5-original-clone-parity-audit-plan.md:5](../../../docs/phase-5-original-clone-parity-audit-plan.md:5): matching live clone to original Client Dispute Manager app.
- [docs/phase-5-manager-agent-plan.md:7](../../../docs/phase-5-manager-agent-plan.md:7): “make the DisputePilot clone match the original Client Dispute Manager app.”
- [docs/phase-5-final-audit-report.md:7](../../../docs/phase-5-final-audit-report.md:7): original app URL.
- [DISPUTEPILOT_PROGRESS_REPORT.md:1](../../../DISPUTEPILOT_PROGRESS_REPORT.md:1): `DisputePilot Clone Progress Report`.
- [DISPUTEPILOT_PROGRESS_REPORT.md:98](../../../DISPUTEPILOT_PROGRESS_REPORT.md:98): original app URL.
- [agents/prompts/agent-1-nav-dashboard.txt:1](../../prompts/agent-1-nav-dashboard.txt:1), [agent-2](../../prompts/agent-2-clients-profile.txt:1), [agent-3](../../prompts/agent-3-disputes-letters.txt:1), [agent-4](../../prompts/agent-4-billing-leads.txt:1), [agent-5](../../prompts/agent-5-calendar-settings.txt:1): worker prompts call it a clone project.

Recommendation: keep these as internal engineering history only. Do not package them as marketing collateral. If sharing repo access with buyer, proactively disclose that these are internal parity/history docs and not public-facing claims.

#### Tests intentionally encode original references

Examples:

- [tests/full-visual-audit.spec.ts:13](../../../tests/full-visual-audit.spec.ts:13): original base URL.
- [tests/compare.spec.ts:4](../../../tests/compare.spec.ts:4): original URL.
- [tests/disputes-compare.spec.ts:7](../../../tests/disputes-compare.spec.ts:7): original dispute center URL.
- [tests/portals-compare.spec.ts:32](../../../tests/portals-compare.spec.ts:32): `creditrestorationportal.com`.
- [tests/portals-compare.spec.ts:46](../../../tests/portals-compare.spec.ts:46): `affiliatecreditrepairportal.com`.

Recommendation: keep original-reference tests internal. If the product is rebranded away from parity tracking, either archive these tests or move them behind an internal-only audit suite.

#### Partner/resource names may need trademark/affiliate review

Examples:

- [app/partner-resources/merchant-accounts/page.tsx:7](../../../app/partner-resources/merchant-accounts/page.tsx:7): `PayHQ`.
- [app/partner-resources/merchant-accounts/page.tsx:8](../../../app/partner-resources/merchant-accounts/page.tsx:8): `Payroc`.
- [app/partner-resources/merchant-accounts/page.tsx:9](../../../app/partner-resources/merchant-accounts/page.tsx:9): `Stripe`.
- [app/partner-resources/merchant-accounts/page.tsx:10](../../../app/partner-resources/merchant-accounts/page.tsx:10): `Square`.
- [app/partner-resources/monitoring-commissions/page.tsx:7](../../../app/partner-resources/monitoring-commissions/page.tsx:7): `SmartCredit`.
- [app/partner-resources/monitoring-commissions/page.tsx:8](../../../app/partner-resources/monitoring-commissions/page.tsx:8): `MyFreeScore360`.
- [app/partner-resources/monitoring-commissions/page.tsx:9](../../../app/partner-resources/monitoring-commissions/page.tsx:9): `IdentityIQ`.
- [app/partner-resources/rebuild-credit-affiliate/page.tsx:7](../../../app/partner-resources/rebuild-credit-affiliate/page.tsx:7): `Credit Strong`.
- [app/partner-resources/rebuild-credit-affiliate/page.tsx:10](../../../app/partner-resources/rebuild-credit-affiliate/page.tsx:10): `Kikoff`.
- [app/partner-resources/rebuild-credit-affiliate/page.tsx:13](../../../app/partner-resources/rebuild-credit-affiliate/page.tsx:13): `Chime Credit Builder`.

Recommendation: verify affiliate permissions, trademark usage, descriptions, commission claims, and outbound links before sale demo or public listing.

### Acceptable/Internal-Only

- `agents/reports/full-visual-audit-setup-report.md` documents internal audit mechanics and should remain internal.
- `agents/reports/*function-checklist.md` and `*complete-report.md` files are useful engineering history but should not be treated as buyer-facing collateral.
- `tests/*compare.spec.ts` and `tests/full-visual-audit.spec.ts` are acceptable if explicitly classified as internal audit tooling.
- `parity-results/**/missing-from-clone.json`, `different-from-original.json`, and `extra-in-clone.json` can be retained internally as engineering evidence.

## Recommended Replacement Language For Buyer-Facing Wording

| Current wording | Recommended wording |
|---|---|
| Client Dispute Manager | DisputePilot |
| Client Dispute Manager Software | DisputePilot Credit Repair Platform |
| Activate Your Client Dispute Manager Account Today | Activate Your DisputePilot Account |
| CDM Credit Boss Skool NEW | DisputePilot Training Hub |
| Client Tracking Portal | Client Portal |
| Client Tracking Portal Mobile Application | Client Portal Mobile Access |
| Affiliate Portal | Referral Partner Portal |
| clone visual audit | visual regression audit |
| clone-style product | credit-repair operations platform |
| original app/site | legacy reference site, in internal docs only |
| WATCH VIDEO | Open Training Info, until videos exist |
| Training Videos | Training Library, until videos exist |

## App UI Text To Replace

- `Client Dispute Manager`
- `Client Dispute Manager Software.`
- `Activate Your Client Dispute Manager Account Today`
- `CDM Credit Boss Skool NEW`
- `support@clientdisputemanager.com`
- `https://help.clientdisputemanager.com`
- `https://clientdisputemanager.com/faq`
- `https://clientdisputemanager.com/success-path`
- `https://clientdisputemanager.com/coaching`
- `Client Tracking Portal`
- `Client Tracking Portal Q&A`
- `Client Tracking Portal Link`
- `Client Tracking Portal Mobile Application`
- `https://www.creditrestorationportal.com/Account/Login`
- `Affiliate Portal` if buyer does not own/use that brand.
- `https://www.affiliatecreditrepairportal.com/Account/Login`
- `WATCH VIDEO` where no video asset exists.
- `Letter Vault Training Video`, `Move Letters Training Video`, and `Employees Training Videos` unless final videos exist.

## Docs Text To Replace Or Keep Internal

Replace or rephrase before buyer-facing sharing:

- [agents/reports/sale-readiness/README.md:7](README.md:7)
- [agents/reports/sale-readiness/sale-package.md:7](sale-package.md:7)
- [agents/reports/sale-readiness/sale-package.md:83](sale-package.md:83)
- [agents/reports/sale-readiness/known-issues-and-limitations.md:31](known-issues-and-limitations.md:31)

Keep internal only:

- `docs/phase-5-original-clone-parity-audit-plan.md`
- `docs/phase-5-manager-agent-plan.md`
- `docs/phase-5-final-audit-report.md`
- `agents/prompts/agent-*.txt`
- `agents/reports/*function-checklist.md`
- `agents/reports/*complete-report.md`
- `agents/reports/full-visual-audit-setup-report.md`
- `DISPUTEPILOT_PROGRESS_REPORT.md`

## Assets To Verify Ownership/License

- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`
- `parity-results/**/desktop-original.png`
- `parity-results/**/mobile-original.png`
- `parity-results/agent-4-live-audit/audit-snapshots.json`
- `parity-results/agent-4-live-audit/original-owned-links.json`
- `parity-results/agent-5-audit/original-links.json`
- Inline SVG icons in `components/PageHeader.tsx`, `components/ClientPortalLayout.tsx`, and `components/CDMLayout.tsx.backup2`.
- Emoji/logo-like partner placeholders in partner resource pages.

## Suggested Order Of Cleanup

1. Rebrand visible app shell and activation modal from Client Dispute Manager to DisputePilot.
2. Replace support/help/coaching URLs with buyer-owned or local routes.
3. Replace dashboard `CDM Credit Boss Skool NEW` and original-platform training links.
4. Replace portal page original URLs and source-like `Client Tracking Portal` copy with neutral DisputePilot/buyer-owned portal language.
5. Make training/video buttons honest at the button level until real video assets exist.
6. Update tests that assert old branding/URLs.
7. Rephrase sale-readiness docs to avoid “clone” in buyer-facing summaries while keeping internal legal/diligence notes frank.
8. Move original screenshots/parity artifacts out of external sale package or mark them internal-only.
9. Review/remove `components/CDMLayout.tsx.backup2` if unused.
10. Run full Chromium suite and focused visual audit after code/test cleanup.

## What Not To Change Yet

- Do not remove parity tests or original comparison tooling until the buyer/seller decides whether internal visual audit history remains useful.
- Do not delete original screenshot artifacts without first deciding whether they are needed for diligence evidence.
- Do not replace third-party/partner names with invented affiliations. Use neutral placeholders if permissions are unknown.
- Do not claim videos, portals, billing, email, SMS, or partner links are live unless verified.
- Do not change production app behavior during this report-only audit.

## Final Checklist For Follow-Up Codex Fix Pass

- [ ] Replace visible `Client Dispute Manager` app-shell branding.
- [ ] Replace activation modal Client Dispute Manager wording.
- [ ] Replace `support@clientdisputemanager.com` with buyer-owned placeholder or route.
- [ ] Replace all `clientdisputemanager.com` links in UI.
- [ ] Replace dashboard `CDM Credit Boss Skool NEW`.
- [ ] Replace portal `creditrestorationportal.com` and `affiliatecreditrepairportal.com` URLs.
- [ ] Rename or neutralize `Client Tracking Portal` copy where buyer does not own that brand.
- [ ] Make training/video controls honest before final assets exist.
- [ ] Update affected tests in the same pass.
- [ ] Rephrase buyer-facing sale-readiness docs to avoid public “clone” positioning.
- [ ] Mark internal parity docs/artifacts as internal-only or move them out of sale package.
- [ ] Verify public assets and backup files.
- [ ] Run `npx playwright test --project=chromium --config=playwright.config.ts`.
- [ ] Run `npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts`.
