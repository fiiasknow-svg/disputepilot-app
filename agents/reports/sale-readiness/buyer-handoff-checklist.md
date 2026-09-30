# Buyer Handoff Checklist

## Repository Transfer

- [ ] Transfer GitHub repository ownership or grant buyer admin access.
- [ ] Confirm latest commit handed over: `4b8c549`.
- [ ] Confirm default branch and branch protection rules.
- [ ] Confirm no secrets are committed to git history.
- [ ] Confirm generated artifacts are excluded or cleaned before final transfer.
- [ ] Explain that the root project is `C:\Users\LESLI\disputepilot-app` and the nested `disputepilot-app` folder should be avoided unless intentionally used.

## Vercel Deployment Transfer/Recreation

- [ ] Transfer existing Vercel project or recreate from repository.
- [ ] Confirm live URL: `https://disputepilot-app.vercel.app`.
- [ ] Re-enter environment variables in buyer-owned Vercel project.
- [ ] Run a production deployment from the handed-over commit.
- [ ] Run public and authenticated smoke tests against the buyer-owned deployment.
- [ ] Verify Vercel build command, install command, Node version, and deployment region settings.

## Database/Supabase Transfer or Recreation

- [ ] Decide whether to transfer the existing Supabase project or recreate it from migrations.
- [ ] Review `supabase/migrations/` and `supabase/tests/`.
- [ ] Verify production schema matches repository migrations.
- [ ] Verify account ownership/RLS policies for all real data tables.
- [ ] Verify existing production data ownership/backfill state.
- [ ] Verify auth settings, redirect URLs, and email templates.
- [ ] Document whether buyer receives production data, demo data only, or a clean database.

## Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `BASE_URL` for live smoke tests when needed.
- [ ] `E2E_EMAIL` and `E2E_PASSWORD` for authenticated live smoke tests, if provided.
- [ ] `ORIGINAL_E2E_EMAIL` and `ORIGINAL_E2E_PASSWORD` only for original-site visual audit access, if available.

Do not place real credentials in these docs.

## Demo Credentials

- [ ] Create buyer demo business/admin account.
- [ ] Create buyer demo client portal account if portal flow is included.
- [ ] Confirm credentials work on the transferred deployment.
- [ ] Share credentials through a secure channel, not in git.
- [ ] Rotate or delete seller-owned demo credentials after transfer.

## Domain Transfer

- [ ] Identify production domain to transfer or configure.
- [ ] Transfer registrar ownership or update DNS to buyer-owned Vercel project.
- [ ] Verify SSL certificate issuance.
- [ ] Update Supabase auth redirect URLs for the final domain.
- [ ] Update webhook URLs and email links that reference the old domain.

## Storage/Files

- [ ] Identify where uploaded documents/images are stored today.
- [ ] Verify whether current file flows are local/session/demo only or backed by Supabase Storage.
- [ ] Transfer storage buckets if real assets exist.
- [ ] Verify file access policies before using real customer documents.

## Billing/Payment Provider

- [ ] Verify Stripe or other payment provider integration status.
- [ ] Confirm subscription, invoices, payments, pay-per-deletion, and webhook behavior in production.
- [ ] Replace placeholder/test keys with buyer-owned live keys only after review.
- [ ] Verify refund, cancellation, tax, receipt, and compliance needs.

## Email/SMS Providers

- [ ] Verify Resend email API route with buyer-owned `RESEND_API_KEY`.
- [ ] Verify invitation, bulk email, notification, and automation delivery expectations.
- [ ] Identify SMS provider status. Repo evidence did not confirm a live SMS integration.
- [ ] Configure sender domains, SPF/DKIM/DMARC, and unsubscribe/compliance handling.

## Tests

- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Run `npx playwright test --project=chromium --config=playwright.config.ts`.
- [ ] Run focused visual audit: `npx playwright test tests/full-visual-audit.spec.ts --project=chromium --config=playwright.config.ts`.
- [ ] Run live public smoke tests with `BASE_URL` set to the deployment.
- [ ] Run authenticated live smoke tests with buyer-owned test credentials.

## Known Limitations

- [ ] Original visual comparison requires valid original Client Dispute Manager login/session.
- [ ] Some pages intentionally fall back to local/demo state when Supabase is unavailable or slow.
- [ ] Portal videos currently use placeholder dialogs until final assets/URLs exist.
- [ ] Billing/subscription production readiness requires verification.
- [ ] Email/SMS/provider delivery must be verified.
- [ ] Security and data isolation require buyer review before real customer data.

## Security Review

- [ ] Audit auth and protected routes.
- [ ] Audit Supabase RLS in buyer-owned project.
- [ ] Review public routes and API routes.
- [ ] Scan git history and Vercel/Supabase settings for secrets.
- [ ] Review dependency vulnerabilities.
- [ ] Review logging for accidental PII/secrets.
- [ ] Run a multi-tenant isolation test using separate accounts.

## IP/Branding Review

- [ ] Review clone-style screens and workflows against Client Dispute Manager.
- [ ] Replace any Client Dispute Manager references or original-style wording.
- [ ] Review portal/external links that point to third-party/original services.
- [ ] Review third-party library licenses.
- [ ] Have counsel review IP, branding, terms, privacy, and data-processing obligations.
