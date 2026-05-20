# Round 2 Disputes Route Discovery / Parity Report

Date: 2026-05-20

## Routes Discovered

- `/disputes`
- `/disputes/status`
- `/disputes/furnisher-addresses`
- `/disputes/ai-metro-2-letters`
- `/disputes/dispute-playbook`
- `/disputes/[id]`

Sidebar/navigation already contains the confirmed dispute links under `Dispute Manager`: All Disputes, Dispute Status, Furnisher Addresses, AI/Metro 2 Letters, and Dispute Playbook. No navigation edit was needed.

## Files Changed

- `app/disputes/page.tsx`
- `tests/disputes-compare.spec.ts`
- `parity-results/disputes/missing-from-clone.json`
- `parity-results/disputes/different-from-original.json`
- `parity-results/disputes/extra-in-clone.json`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/desktop-clone.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/disputes/mobile-clone.png`
- `agents/reports/round-2-disputes-report.md`

## Exact Gaps Found

- `missing-from-clone.json`: `[]`
- `different-from-original.json`: original `/User/DisputeCenter` could not be confirmed because the original site redirected to `https://www.clientdisputemanager.com/Home/Index?aspxerrorpath=/User/DisputeCenter`.
- `extra-in-clone.json`: `/disputes/[id]` exists in the clone as a dynamic dispute detail route beyond the confirmed static dispute routes.

## Fixes Made

- Made the first visible `/disputes` surface stricter for the original app context:
  - changed the primary surface to `Dispute Manager` / `All Disputes`;
  - added visible workflow summary cards for all, active, awaiting response, and completed disputes;
  - added customer/furnisher/account/bureau/letter search;
  - added status and bureau filters plus a clear action;
  - added a visible empty state when filters return no dispute records.
- Updated the focused disputes parity spec to:
  - discover routes directly from `app/disputes`;
  - verify confirmed dispute routes respond in the clone;
  - verify visible dispute manager controls and table columns;
  - write `missing-from-clone.json`, `different-from-original.json`, and `extra-in-clone.json`;
  - record original route/session limitations without weakening clone assertions.

## Focused Test Result

Command:

```bash
npx playwright test "tests/.*disputes.*\.spec\.ts" --project=chromium --config=playwright.config.ts
```

Result: passed, 5 tests.

## Build Result

Command:

```bash
npm run build
```

Result: passed. Next.js 16.2.1 production build completed successfully.

## Blocked Items

- Exact original Dispute Center parity remains blocked by the original route/session behavior. The run redirected from `/User/DisputeCenter` to `/Home/Index?aspxerrorpath=/User/DisputeCenter`, matching the previous audit concern that the original route cannot currently be inspected as an authenticated Dispute Center page.
