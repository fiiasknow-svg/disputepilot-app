# Sale Package

## One-Page Buyer Overview Draft

DisputePilot is a credit-repair and dispute-management web application built with Next.js, React, Supabase, and Playwright. It includes business/admin workflows for clients, disputes, billing, letters, leads, affiliates, calendars, company settings, automations, employees, training resources, public intake forms, and partner resources.

The current repository is in a strong private-demo state. The latest verified local Chromium Playwright suite passed with `358 passed`, and the route screenshot audit captures all 34 route screenshots with zero route capture errors and zero route 404s. Original-site visual comparison is currently limited by original login access.

The sale should be positioned as a functional SaaS codebase and demo-ready product foundation, not as a fully verified production business with completed payment, email/SMS, legal/IP, and security due diligence.

## Feature List

- Auth foundation with business/customer login routes and protected route checks.
- Dashboard with customer actions, revenue filters, messages, reminders, and tasks.
- Client/customer management with add/edit/delete, status, search, filters, pagination, bulk export/delete, profile, letters, portal tabs, and document download behavior.
- Leads and affiliates with website forms, affiliate forms, CSV import/export, bulk email UI, public submission routes, and local/demo fallback behavior.
- Dispute management with dispute creation, status workflows, detail pages, rounds, letters, furnisher addresses, and AI Metro 2 letter workflow.
- Letter vault, saved letters, AI rewriter, previews, drafts, downloads, and template workflows.
- Billing screens for overview, invoices, payments, payment history, services/products, credit-card setup, subscription, and pay-per-deletion flows.
- Calendar, reminders, task management, and iCal export.
- Company settings, configuration, portals/mobile app settings, manage emails, notify automation, team messages, client auto signup, self-service signup, images/documents, and digital contracts.
- Automation pages for Zapier, GoHighLevel, website lead nurturing, and integration settings.
- Employees/outsourcers with roles, permissions, local invites, tasks, export, and training panel.
- Academy/training, help/community, partner resources, get-customers resources, and operational route coverage.
- Playwright test suite and visual audit tooling.
- Supabase migrations, RLS policy materials, and verification SQL scripts.

## Suggested Screenshots/Demo Flow

1. Login/dashboard overview.
2. Add a new client and open the client profile.
3. Create or view a dispute and assign a letter.
4. Open Letter Vault and preview/download a letter.
5. Submit a public website lead form and show the lead in `/leads`.
6. Show billing overview and credit-card setup screen with placeholder/test configuration.
7. Show calendar reminder and task workflow.
8. Show company settings, portals/mobile app settings, and images/documents.
9. Show automation/Zapier or GoHighLevel configuration.
10. Show Playwright result summary and sale-readiness docs.

## Demo Credentials

Do not store real credentials in git.

Use a secure channel to share:

```text
Demo URL: <buyer-demo-url>
Business/Admin Email: <buyer-demo-admin-email>
Business/Admin Password: <secure-temporary-password>
Client Portal Email: <buyer-demo-client-email>
Client Portal Password: <secure-temporary-password>
```

Rotate or revoke seller-controlled credentials after handoff.

## Operating Costs to Verify

- Vercel hosting and bandwidth.
- Supabase database, auth, storage, and bandwidth.
- OpenAI API usage for AI analysis/rewriter endpoints.
- Resend email sending and domain authentication.
- Stripe fees and subscription/payment infrastructure.
- Domain registration and DNS.
- Any future SMS provider.
- Monitoring/logging/error tracking if added.

## Transfer Checklist Summary

- Transfer or recreate GitHub repository.
- Transfer or recreate Vercel deployment.
- Transfer or recreate Supabase project and verify migrations/RLS.
- Reconfigure all environment variables with buyer-owned keys.
- Set final domain and auth redirect URLs.
- Verify email/payment/provider integrations.
- Create buyer demo credentials.
- Run full local test suite and live smoke tests.
- Complete security, IP/branding, and legal review.

## What to Disclose to Buyers

- Latest local Chromium suite passed: `358 passed`.
- Clone visual audit captures are healthy, but original comparison is blocked by original login failure.
- Some UI paths use local/demo fallback when Supabase is unavailable or slow.
- Portal video controls are placeholders until final video URLs/assets exist.
- Production billing/subscription readiness is not fully verified.
- Email/SMS/provider delivery must be verified with buyer-owned accounts.
- Security, multi-tenant isolation, database, storage, and legal/IP review remain required before real customer data.

## Minimum Private-Demo Readiness Checklist

- [ ] Clean git state.
- [ ] Buyer-facing demo deployment available.
- [ ] Demo credentials created and verified.
- [ ] `npx playwright test --project=chromium --config=playwright.config.ts` passes locally.
- [ ] Public forms and core client/dispute/letter workflows demonstrated.
- [ ] Known limitations disclosed.
- [ ] No real secrets in docs or repo.

## Ideal Sale-Ready Checklist

- [ ] Buyer-owned Vercel deployment passes live public and authenticated smoke tests.
- [ ] Buyer-owned Supabase project is migrated, RLS-verified, and multi-tenant tested.
- [ ] Stripe billing and webhooks are verified in test mode, with a live-mode launch plan.
- [ ] Email provider domain is verified and delivery is tested.
- [ ] Storage/files policy is verified.
- [ ] Security review completed.
- [ ] IP/branding/legal review completed.
- [ ] Root README updated for buyer/operator setup.
- [ ] Generated artifacts cleaned or intentionally packaged as diligence evidence.
