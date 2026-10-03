# DisputePilot Buyer One-Page Overview

Date: 2026-10-03

## Product Summary

DisputePilot is a credit repair/dispute management SaaS starter platform for operators who need one place to manage customers, leads, disputes, letters, billing workflows, reminders, company settings, documents, portals, and training/support surfaces.

The intended buyer is a credit repair operator, SaaS buyer/operator, agency serving credit repair businesses, or developer/team that wants a vertical SaaS foundation rather than starting from a blank application.

The business problem it addresses: credit repair teams need organized client records, dispute workflows, letter preparation, intake/lead handling, follow-up reminders, billing screens, and operational settings in a single web app.

## Current Verified Status

- Full local Chromium Playwright suite last verified as `358 passed`.
- Live Vercel deployment exists at `https://disputepilot-app.vercel.app`; ownership/settings still need handoff verification.
- Sale-readiness documentation exists under `agents/reports/sale-readiness/`.
- Latest known visual route audit captured 34 application pages with `cloneErrorCount: 0` and `clone404Count: 0`.
- Original-side visual comparison depends on valid original-site login/session access and is not currently a complete buyer-facing certification.

## Feature Highlights

- Customer/client management, profiles, filters, bulk actions, and visible empty/fallback states.
- Leads, affiliate workflows, public intake forms, CSV import/export, and bulk email surfaces.
- Dispute management, dispute detail/status pages, furnishers, and dispute workflow screens.
- Letter vault/workflows plus AI rewriter and credit analysis API surfaces when configured.
- Calendar, reminders, tasks, and dashboard follow-up workflows.
- Billing pages for invoices, payments, services/products, subscriptions, credit-card setup, and pay-per-deletion screens.
- Company settings, employees/outsourcers, roles/permissions, email settings, contracts, forms, and documents/images pages.
- Automation/integration pages for Zapier, GoHighLevel, website lead nurturing, and related setup flows.
- Portals/mobile app page, help/training/academy/support surfaces, partner resources, and sale-readiness documentation.
- Broad Playwright coverage plus visual audit tooling for route screenshot review.

## Technical Stack Summary

Repo-verified stack:

- Next.js `16.2.1`, React `19.2.4`, TypeScript, Tailwind CSS, ESLint.
- Playwright test suite with Chromium as the last verified passing project.
- Supabase client libraries and required public Supabase env vars for Supabase-backed features.
- Vercel deployment URL is documented in repo materials.
- Optional OpenAI API usage exists for rewrite/analysis endpoints when `OPENAI_API_KEY` is configured.
- Optional Resend email API usage exists when `RESEND_API_KEY` is configured.
- Stripe/Twilio/SMTP production integrations are TODO/unknown unless a buyer verifies or implements them.

## Included in Sale/Handoff

- Source code and project history.
- Playwright tests and visual audit tooling.
- Sale-readiness docs, buyer handoff checklist, technical setup, and testing summary.
- Deployment/environment handoff docs and placeholder `.env.example`.
- Buyer demo walkthrough and demo data cleanup plan.
- Security/secrets/privacy scan report.
- IP/branding review materials for buyer diligence.
- Live deployment transfer/recreation notes.

## Known Limitations / Buyer Diligence

- Production security, database, storage, auth, and multi-tenant readiness must be reviewed before storing real customer data.
- Billing/subscription readiness must be verified before monetizing as a live SaaS.
- Some workflows use local/demo fallback behavior when backend services are unavailable or not configured.
- Original visual comparison requires valid original-site access.
- Portal videos are placeholders unless final video URLs/assets are supplied.
- Buyer should review branding/IP exposure and third-party library/license obligations with appropriate advisors.

## Ideal Buyer Profile

- Credit repair operator.
- SaaS buyer/operator.
- Agency serving credit repair businesses.
- Developer or team seeking a vertical SaaS starter platform.

## Suggested Buyer Next Steps

1. Review a private demo using placeholder demo credentials only.
2. Review the sale-readiness docs and known limitations.
3. Run the Playwright suite locally.
4. Review deployment/env handoff and recreate infrastructure under buyer-owned accounts.
5. Review security, privacy, IP/branding, and third-party license reports.
6. Decide whether to operate as an internal tool, rebrand, or finish production SaaS hardening.

## Private Demo Checklist

- Live URL: `https://disputepilot-app.vercel.app`.
- Demo credentials: `<demo-admin-email>` / `<demo-admin-password>`.
- Test result summary ready: `358 passed` in local Chromium Playwright suite.
- Known limitations disclosed before the walkthrough.
- Transfer checklist and environment handoff docs ready for buyer review.
