# Known Issues and Limitations

Severity is ranked for sale readiness, not necessarily for local demo usability.

## Blocker

### Original visual comparison requires valid original-site login

The full visual audit can capture clone routes, but original-page comparison depends on valid access to `https://www.clientdisputemanager.com`. Current project status says original comparison is blocked by original login failure. Without this, visual parity evidence is incomplete.

### Security, multi-tenant, database, and storage readiness must be reviewed before real customer data

The repo includes Supabase migrations, RLS policy work, and tests, but a buyer must verify the actual production/buyer Supabase project, auth settings, RLS policies, storage policies, public routes, and API routes before storing real customer data.

## High

### Production billing/subscription readiness must be verified

Billing screens and workflows are covered by tests, and Stripe placeholder env vars exist. Real checkout, subscriptions, invoices, pay-per-deletion charging, webhook handling, tax, cancellation, receipts, and live keys require buyer verification.

### Email/SMS/provider delivery is not fully proven

`RESEND_API_KEY` is used by the email API route, and tests cover visible failure/success states. Buyer must verify real delivery, sender domain setup, compliance, and any SMS provider integration. Repo evidence did not confirm a live SMS provider.

### Portal videos are placeholders until final URLs/assets exist

Portal/mobile-app video controls are tested as visible placeholder dialogs. Final video URLs/assets should be supplied before a polished buyer demo or customer launch.

### Clone/IP exposure requires legal review

The app was built as a clone-style project with original Client Dispute Manager comparison tooling. Buyer should review copy, navigation, screen layout, feature naming, and external links for IP/trademark/trade dress risk.

## Medium

### Some pages use local/demo fallback behavior when Supabase is unavailable or slow

Recent fixes intentionally make pages resolve to local/demo rows or empty states instead of indefinite loading. This improves demo reliability but means visible UI success is not always proof of backend persistence.

### Live deployment ownership/settings need transfer verification

The repo records `https://disputepilot-app.vercel.app`, but Vercel ownership, environment variables, domain configuration, and deployment history must be verified during handoff.

### Public forms may save locally when backend persistence is unavailable

Public website lead, affiliate, client auto-signup, and self-service flows have local/demo behavior in tests. Buyer should verify desired backend persistence path before production use.

### Generated artifacts can clutter handoff

Visual audits and Playwright runs produce screenshots, reports, and JSON artifacts. These should be cleaned or intentionally included as evidence before a sale package is shared.

## Low

### README is still the default Next.js starter README

The root `README.md` does not yet describe DisputePilot setup in buyer-ready terms. This sale-readiness package fills that gap, but the root README may still be worth replacing later.

### Cross-browser status is not currently the headline verified result

The current confirmed full-suite result is Chromium: `358 passed`. Firefox/WebKit projects exist in Playwright config but are not the latest stated full-suite verification.

### Original-route mapping still contains review-dependent areas

The visual audit now records mapping confidence and fallbacks. Some routes are clone-only or depend on original app navigation availability.

## Unknowns/TODOs

- TODO: Confirm buyer-owned production Supabase schema and data state.
- TODO: Confirm final domain and DNS transfer path.
- TODO: Confirm whether production storage buckets contain transferable customer/demo files.
- TODO: Confirm final demo credentials through a secure channel.
- TODO: Confirm operating costs for Vercel, Supabase, OpenAI, Stripe, Resend, domains, and any SMS provider.
- TODO: Confirm legal entity, terms, privacy policy, data processing, and compliance obligations.
