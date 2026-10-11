# Screenshot and Demo Video Capture Plan

Current date: 2026-10-11

Scope: buyer-facing screenshot and demo-video capture plan for DisputePilot. This is a documentation-only planning file. Do not include credentials, secrets, private data, original-site credentials, or unsanitized original-platform materials in screenshots, videos, filenames, or buyer packages.

## 1. Purpose

Screenshots and a short demo video help buyers understand the product faster, reduce uncertainty, and support a higher asking price by showing that DisputePilot is more than a code archive. A polished capture package can demonstrate the breadth of the app, clean demo data, tested workflows, sale-readiness docs, and a clear path to commercialization.

All screenshots and videos should use clean fake demo data only. Do not show personal data, real customer records, real credentials, private browser tabs, local `.env` files, password managers, original-site credentials, or unsupported production/revenue claims.

## 2. Pre-Capture Checklist

- [ ] Confirm `git status` is clean or only contains intentional documentation changes.
- [ ] Check the live deployment or local demo URL immediately before capture.
- [ ] Confirm the full Chromium suite recently passed; latest known result in docs is `358 passed`.
- [ ] Confirm clean demo data is visible across the app.
- [ ] Confirm no private data, real customer records, real emails, real phone numbers, or personal names are visible.
- [ ] Confirm no original-site credentials or original-site private pages are visible.
- [ ] Reset browser zoom to 100%.
- [ ] Use a clean browser profile or incognito/private window if possible.
- [ ] Hide bookmarks, personal browser extensions, downloaded files, notifications, and personal browser UI if possible.
- [ ] Close unrelated tabs and local files.
- [ ] Use a consistent viewport, preferably desktop width for primary captures.
- [ ] Avoid showing terminal commands that expose local paths beyond the root project unless needed.
- [ ] Avoid showing `.env`, `.env.local`, provider dashboards, password managers, or account settings.
- [ ] Prepare a short limitations statement before recording.

## 3. Screenshot List

| Screenshot target | Route/page | What should be visible | What to avoid showing | Suggested buyer caption |
| --- | --- | --- | --- | --- |
| Login or app entry screen | `/login`, `/business-login`, or current app entry | Clean DisputePilot entry/login surface, no real credentials filled in. | Passwords, saved autofill dropdowns, personal browser accounts. | "Clean app entry point for private demo and buyer review." |
| Dashboard | `/dashboard` | Populated dashboard widgets, clean fake activity, reminders, tasks, and navigation. | Empty states, loading spinners, personal names, real revenue claims. | "Operational dashboard with demo-safe activity and workflow overview." |
| Sidebar/navigation | Any authenticated app page with sidebar visible | Full navigation breadth across dashboard, clients, disputes, billing, company, automation, training, and support areas. | Broken/expanded menus that look cluttered, unrelated browser UI. | "Broad vertical SaaS navigation for credit repair/dispute operations." |
| Customers/clients list | `/clients` | Fake clients, statuses, search/filter/action controls. | Real customer data, personal emails, empty table. | "Client management surface with populated demo-safe records." |
| Client profile | Client profile page from a fake client | Profile tabs, workflow areas, letters/portal/documents context if available. | Real documents, private uploads, broken tabs. | "Client profile workflow for account, letters, portal, and document context." |
| Leads | `/leads` | Fake leads, statuses, sources, add/import/search/filter controls. | Real lead data, external inboxes, personal contact info. | "Lead pipeline for intake and follow-up workflows." |
| Affiliate leads/forms | `/leads/affiliates`, `/leads/affiliate-website-form`, `/affiliates/website-form` | Affiliate records, referral workflow, form builder/public form surface. | Real affiliate data, real payout info, undisclosed placeholder links. | "Affiliate/referral workflow and public form surfaces for growth channels." |
| Disputes | `/disputes` and one dispute detail page if useful | Fake disputes, statuses, bureaus/items, action controls. | Real credit data, real bureau files, empty screens. | "Dispute management workflow with demo-safe dispute records." |
| Letters / AI rewriter | `/letters`, `/letters/ai-rewriter`, or `/letter-vault` | Letter vault, saved letters, AI rewriter input/output surface. | Claims of legal advice, real customer letters, API keys. | "Letter workflow and AI rewriter surface for premium dispute operations." |
| Calendar/reminders | `/calendar` | Fake reminders/events, calendar controls, save/read actions. | Personal calendar items, local notifications, empty reminder table. | "Calendar and reminder workflow for operational follow-up." |
| Billing pages | `/billing`, `/billing/invoices`, `/billing/payment-history`, `/billing/services-products` | Billing UI surfaces, invoices/payments/payment history/service screens with fake data. | Claims that live payments are production-ready, real card data, provider dashboards. | "Billing workflow surfaces ready for buyer-owned payment integration." |
| Company settings | `/company/settings` | Demo Company details, settings controls, safe demo contact info. | Real company data, production credentials, private domains unless intended. | "Company configuration surface with demo-safe settings." |
| Employees | `/employees` | Team/employee management surface, roles, permissions, invite/task controls if visible. | Real employee data, personal emails, internal account info. | "Team operations and employee management surface." |
| Images/documents/contracts/forms | `/company/images-documents`, `/company/digital-contracts`, public forms | Document management, digital contracts, form/intake workflow surfaces. | Real uploads, private contracts, signatures, customer IDs. | "Documents, contracts, and intake areas for onboarding and evidence workflows." |
| Automation/integrations | `/automation`, Zapier/GoHighLevel routes if useful | Integration cards, save/test states, workflow automation surfaces. | Provider API keys, live account dashboards, unsupported delivery claims. | "Automation and integration surfaces for premium setup packages." |
| Portals/mobile app | `/company/portals` | Portal/mobile settings, safe demo URLs, placeholder/video controls if disclosed. | Real portal credentials, private app-store accounts, undisclosed placeholders. | "Portal/mobile configuration surface for branded client access." |
| Help/training/support | `/help`, `/academy/credit-repair`, training pages | Help, training, academy, support/community surfaces. | Copyrighted/private course materials unless cleared, personal support inboxes. | "Training and support surfaces that can support onboarding or coaching bundles." |
| Test results | Terminal or test report summary | Command/result showing latest known `358 passed`, date if freshly run. | Secrets in terminal history, `.env` output, unrelated commands. | "Automated test evidence: latest known Chromium suite result, 358 passed." |
| Sale-readiness docs folder/index | `agents/reports/sale-readiness/index.md` in editor or file explorer | Sale-readiness docs list, buyer handoff materials, monetization/outreach/capture docs. | Credentials, local private files, original-site credentials. | "Buyer handoff packet with sale-readiness, testing, deployment, and monetization docs." |

## 4. 5-Minute Demo Video Script

Exact order of screens:

1. App entry/login.
2. Dashboard and sidebar.
3. Clients list and one client profile.
4. Leads and affiliates.
5. Disputes and letters/AI rewriter.
6. Billing pages and calendar/reminders.
7. Company settings, portals/mobile, automation.
8. Test result summary and sale-readiness docs.
9. Closing screen on buyer docs or dashboard.

Short talk track:

1. "DisputePilot is a credit repair and dispute management SaaS starter platform prepared for buyer review."
2. "This demo uses clean fake data only."
3. "The app brings together the main operator workflows: clients, leads, affiliates, disputes, letters, billing surfaces, reminders, documents, portals, automation, and settings."
4. "The value is in the working product surface, clean demo, test coverage, and buyer handoff documentation."
5. "It should not be treated as a current-revenue business or fully production-hardened billing/security system."
6. "A buyer would complete production payment integration, security/privacy review, buyer-owned deployment, provider setup, and launch hardening before charging customers."

What to say honestly:

- The app is a tested SaaS starter platform.
- The demo data is fake and buyer-safe.
- The latest known local Chromium suite result is `358 passed`.
- Billing pages exist, but production payment readiness must be verified or completed.
- Security/privacy, backend persistence, provider accounts, and launch hardening remain buyer diligence items.

What not to overclaim:

- Do not claim current revenue.
- Do not claim live production billing is finished.
- Do not claim the app is ready for real customer data without security review.
- Do not claim legal/IP clearance without attorney review.
- Do not describe local/demo fallback behavior as proof of production persistence.

## 5. 8-Minute Demo Video Script

Use this version for a slightly deeper product and technical walkthrough.

1. Opening: Position DisputePilot as a credit repair/dispute management SaaS starter platform.
2. Dashboard: show populated overview and explain the operator command center.
3. Navigation: briefly show the breadth of the sidebar without clicking every route.
4. Clients/profile: show fake client list, profile tabs, and workflow depth.
5. Leads/affiliates/forms: show growth, referral, and intake surfaces.
6. Disputes/letters/AI: show dispute records, letter vault, and AI rewriter surface as premium workflow areas.
7. Billing/calendar: show billing UI surfaces and reminders while clearly saying production payments need buyer verification.
8. Documents/contracts/portals: show onboarding, evidence, contract, and client-facing access surfaces.
9. Automation/company/settings: show integration and configuration story.
10. Tests: show latest known full Chromium result of `358 passed` or a fresh run if available.
11. Docs/deployment handoff: show sale-readiness index, deployment/env handoff, monetization roadmap, and buyer outreach package.
12. Limitations disclosure: state that buyer must finish payment integration, security/privacy review, buyer-owned infrastructure, provider setup, legal/IP review, and launch hardening.
13. Closing: summarize ideal buyer and next steps.

Suggested technical/product talk track:

"The goal here is to show that a buyer is not starting from a blank repo. DisputePilot already has a broad product surface, clean fake demo data, automated test coverage, and handoff documentation. The remaining work is commercialization: buyer-owned deployment, production billing, provider setup, security review, and launch execution."

## 6. 15-Minute Buyer Call Demo Flow

Use this flow for a live buyer call where questions may interrupt the demo.

What to show:

1. 1 minute: Open with positioning and limitations.
2. 2 minutes: Dashboard and navigation breadth.
3. 3 minutes: Clients list and client profile.
4. 2 minutes: Leads, affiliates, and public forms.
5. 2 minutes: Disputes, letters, and AI rewriter.
6. 2 minutes: Billing pages and calendar/reminders.
7. 1 minute: Company settings, portals/mobile, automation, documents/contracts.
8. 1 minute: Testing summary and sale-readiness docs.
9. 1 minute: Next steps and buyer diligence.

What to skip:

- Deep code walkthrough unless the buyer asks.
- Provider dashboards, credentials, `.env` files, or private accounts.
- Original-reference materials.
- Long page-by-page navigation that slows down momentum.
- Unverified claims about production billing, security, current revenue, or legal clearance.

When to mention limitations:

- At the start: set expectations that this is a SaaS starter platform.
- During billing: clarify production payment integration must be verified or completed.
- During documents/data: clarify real customer data requires security/privacy review.
- At the end: summarize remaining buyer diligence as the path to commercial launch, not as a surprise.

## 7. Demo Video Opening Script

"DisputePilot is a credit repair and dispute management SaaS starter platform prepared for buyer review. This walkthrough uses clean fake demo data only. The app includes a broad tested product surface across clients, leads, affiliates, disputes, letters, billing pages, reminders, documents, portals, automation, company settings, and training/support areas. It also includes buyer handoff documentation, a monetization roadmap, deployment and environment notes, and a latest known local Chromium Playwright suite result of 358 passed. This is not being presented as a current-revenue business or a fully production-ready billing/security system; it is a polished starter platform for a buyer who wants to commercialize or white-label it."

## 8. Demo Video Closing Script

"That is the DisputePilot buyer demo package. The included assets are the root application, clean demo data, broad product workflows, Playwright test coverage, sale-readiness documentation, deployment and environment handoff notes, monetization roadmap, buyer outreach package, and known limitations. The ideal buyer is a credit repair operator, coach, agency, SaaS buyer, or developer/team that wants a vertical SaaS foundation and can finish production payment integration, security/privacy review, buyer-owned deployment, provider setup, and launch hardening. The practical next step is a private technical review, a buyer Q&A call, and verification of the exact handoff commit and deployment path."

## 9. File Naming And Folder Organization

Suggested package structure if media is captured later:

```text
buyer-package/
  screenshots/
    01-login-entry.png
    02-dashboard.png
    03-sidebar-navigation.png
    04-clients-list.png
    05-client-profile.png
    06-leads.png
    07-affiliates-forms.png
    08-disputes.png
    09-letters-ai-rewriter.png
    10-calendar-reminders.png
    11-billing-pages.png
    12-company-settings.png
    13-employees.png
    14-documents-contracts-forms.png
    15-automation-integrations.png
    16-portals-mobile.png
    17-help-training-support.png
    18-tests-358-passed.png
    19-sale-readiness-docs-index.png
  videos/
    disputepilot-5-minute-demo.mp4
    disputepilot-8-minute-demo.mp4
  docs/
    buyer-one-page-overview.md
    monetization-roadmap.md
    buyer-outreach-package.md
    screenshot-video-capture-plan.md
    final-sale-readiness-scorecard.md
    known-issues-and-limitations.md
    deployment-env-handoff.md
    testing-summary.md
```

Do not create large media files in the repo unless intentionally packaging deliverables. Review screenshots/videos before sharing or archiving.

## 10. Quality Checklist

- [ ] Text is readable at normal viewing size.
- [ ] Screenshots are not blurry, cropped awkwardly, or mid-loading.
- [ ] No private information is visible.
- [ ] No credentials, secrets, `.env` files, provider keys, or password managers appear.
- [ ] Browser UI is clean with no distracting bookmarks, extensions, notifications, or unrelated tabs.
- [ ] No broken loading states, 404 pages, runtime errors, or obvious accidental empty states are visible.
- [ ] Obvious placeholders are either avoided or disclosed professionally.
- [ ] No original-platform screenshots are included unless separately sanitized and intentionally approved for internal diligence.
- [ ] DisputePilot branding is consistent.
- [ ] Demo data is clearly fake and professional.
- [ ] Billing screenshots do not imply production payments are finished.
- [ ] Security/privacy claims are limited to repo-supported evidence.
- [ ] The test screenshot clearly shows `358 passed` only if that result is current or clearly labeled as latest known.

## 11. Follow-Up Task List

1. Capture screenshots from the list above using clean demo data.
2. Record a 5-minute demo video for quick buyer outreach.
3. Optionally record an 8-minute deeper walkthrough for serious buyers.
4. Review all media for private data, credentials, browser clutter, loading states, and unsupported claims.
5. Export or assemble a PDF/ZIP buyer package if desired.
6. Prepare private outreach messages using the buyer outreach package.
7. Keep known limitations ready for buyer calls.
8. Refresh the full test result before serious buyer diligence if the last run is stale.
9. Store any media outside git unless the buyer package is intentionally being versioned.
10. Recheck `git status` before sharing or committing any sale package updates.
