# Phase 5 Final Live Smoke Audit

Date: 2026-05-14

## Scope

This is the final manual live smoke checklist for the deployed Vercel app after the Phase 3 production RLS rollout and Phase 4 security hardening work. It does not change runtime behavior, RLS, migrations, or production data.

Current checkpoint:

- Production business RLS is applied and verified for `employees`, `leads`, `clients`, `invoices`, `disputes`, `calendar_events`, and `affiliates`.
- Production skipped `statuses` and `dispute_letters` because those tables do not exist.
- Client portal identity planning is complete; disposable schema and portal RLS verification passed.
- Production portal schema/RLS has not been applied.
- `dp_auth` is ignored for production private route protection.
- Duplicate sidebar React key warnings were fixed.
- Automated Chromium suite passes `225/225`.

## Git Checkpoint

`git status --short` before this checklist was added was clean.

`git log -10 --oneline`:

```text
607e01a Fix duplicate sidebar React keys
49d787c Harden dp auth bridge in production
6b67b3c Audit dp auth bridge
f5901c9 Record client portal RLS verification
b4a1e34 Add client portal RLS verification draft
d4fc2ef Add client portal context helper
98b3f3d Fix portal users readiness schema tolerance
ab05ba6 Add staged client portal users schema
2be8ecd Draft client portal RLS plan
77e35fe Audit client portal isolation
```

## Documents Reviewed

- `docs/phase-3-rls-completion-audit.md`
- `docs/phase-4-client-portal-isolation-audit.md`
- `docs/phase-4-dp-auth-bridge-audit.md`

## Live Smoke Checklist

Use the deployed Vercel app URL and a real production business user. Record pass/fail, timestamp, browser, account, and any observed error text for each item.

| Area | Manual check | Expected result | Result |
| --- | --- | --- | --- |
| Logged-out route protection | Log out fully, clear app cookies if needed, then open `/dashboard`. | Redirects to `/login?next=%2Fdashboard`; no private shell is visible. | Pending |
| Login | Sign in from `/login` with a production business user. | Login succeeds and lands on `/dashboard` or the requested private route. | Pending |
| Session persistence | Refresh `/dashboard` after login. | Dashboard remains available through verified Supabase session cookies. | Pending |
| Dashboard | Open `/dashboard`. | Page loads without visible runtime/app errors. | Pending |
| Employees | Open `/employees`, create or update a safe test employee, refresh. | Saved employee remains visible after reload; errors are clear if save is blocked. | Pending |
| Leads | Open `/leads`, add a safe test lead, refresh. | Lead list loads; new lead remains visible after reload. | Pending |
| Clients | Open `/clients`, add a safe test client, refresh. | Client list loads; new client remains visible after reload. | Pending |
| Billing | Open `/billing` and `/billing/invoices`. | Billing summary and invoices page load without visible runtime/app errors. | Pending |
| Disputes list | Open `/disputes`. | Disputes page loads and account-owned disputes are visible. | Pending |
| Disputes status/edit | Open `/disputes/status` and perform a safe status/edit workflow. | Status/edit action completes or returns a clear visible error. | Pending |
| Calendar | Open `/calendar`, add a safe test event, refresh. | Calendar loads; event remains visible after reload. | Pending |
| Affiliates | Open `/leads/affiliates`, add a safe test affiliate, refresh. | Affiliate list loads; new affiliate remains visible after reload. | Pending |
| Settings | Open `/settings/configuration`. | Configuration page loads without visible runtime/app errors. | Pending |
| API auth | From a logged-out context, POST to `/api/send-email`, `/api/analyze-credit`, and `/api/rewrite-letter`. | Each route returns `401` JSON: `{ "error": "Authentication required" }`. | Pending |
| Runtime errors | Watch browser console and visible UI during the walkthrough. | No visible app/runtime errors; no duplicate React key warnings. | Pending |

## Production Data Caution

- Use clearly named test records where add/save flows are required.
- Do not alter real customer data during smoke checks.
- Do not apply migrations or RLS changes as part of this audit.
- If a workflow fails, capture the visible error, browser console message, account, route, and exact time before retrying.

## Remaining Launch Blockers / Follow-up

- Portal routes/pages are not fully built yet.
- Production portal schema/RLS has not been applied yet.
- Production portal apply decision should wait until portal pages use `getCurrentClientPortalContext()` and the production portal enablement column is confirmed.
- `dp_auth` is hardened for production route protection, but the app still sets and clears the compatibility cookie. Remove that client-side bridge after production login remains stable with Supabase SSR cookies only.
- Final UX polish remains, including any issues found during this manual live audit.
- Any failed checklist item above becomes a launch blocker until resolved or explicitly accepted.

## Production Retest Notes

After this checklist passes, record:

- Vercel deployment URL and deployment id.
- Supabase project id/name.
- Tester account email.
- Browser and OS.
- Pass/fail result for each checklist row.
- Any manual cleanup performed for smoke-test records.
