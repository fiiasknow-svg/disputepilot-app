# Dispute Manager Button Fixes Complete Report

Date: 2026-05-21

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). The nested `disputepilot-app\` folder was not edited.

## Checklist Items Fixed

- `/disputes/status` row checkbox now selects exactly once when clicked directly, shows `Update 1 Selected`, and still supports the batch status modal.
- `/disputes/[id]` `Assign Letter` now immediately creates a visible queued letter row in `Letters Sent` and shows a visible status message.
- `/disputes/[id]` `Assign & Queue` now immediately creates a visible queued letter row in `Letters Sent` and shows a visible status message.
- `/disputes/[id]` `View Letter` now opens a visible letter preview modal with title, status, round, date, and content, plus Close.
- `/disputes/[id]` `Download PDF` now triggers a real text export download when no PDF utility is available, using a filename based on the letter title.
- `/disputes/[id]` `Advance to Round N` now updates the visible dispute round and status locally immediately, adds the new round to Round History, and shows confirmation.
- `/disputes/ai-metro-2-letters` now has a usable deterministic workflow: template selection, client/account/bureau/reason/facts inputs, Generate Draft, preview, Copy Draft, Save/Queue Locally, and navigation to `/letters/ai-rewriter`.
- Furnisher Addresses blank `Add Creditor` now shows visible validation for missing Company Name while preserving localStorage behavior.

## Files Changed

- `app/disputes/status/page.tsx`
- `app/disputes/[id]/page.tsx`
- `app/disputes/ai-metro-2-letters/page.tsx`
- `app/dispute-manager/furnisher-addresses/page.tsx`
- `tests/disputes-status-selection-behavior.spec.ts`
- `tests/dispute-detail-workflow-behavior.spec.ts`
- `tests/disputes-ai-metro-2-letters-behavior.spec.ts`
- `tests/furnisher-addresses-validation.spec.ts`
- `agents/reports/disputes-buttons-complete-report.md`

## Focused Test Results

- `npm run build`: passed.
- `npx playwright test "tests/.*dispute.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 15/15.
- `npx playwright test "tests/.*furnisher.*\.spec\.ts" --project=chromium --config=playwright.config.ts`: passed, 1/1.

## Full Suite Result

- `npx playwright test --project=chromium --config=playwright.config.ts`: passed, 250/250.

## Deferred Items

- Broad Supabase persistence for `/disputes` create/save durability remains deferred.
- Broad Supabase persistence for furnisher address durability remains deferred; current behavior remains localStorage-backed.
- Dispute detail letter assignment uses local visible queue behavior immediately and attempts a safe `dispute_letters` insert only when an account-backed Supabase session is available. If unavailable, the queued row is local-only.
- Round history persistence as separate durable records remains deferred. The dispute `round`/`status` update is attempted, but visible Round History is local when no backend support is available.
- Original-comparison decisions remain deferred for `/disputes/[id]` `+ Create Letter`, `/disputes/dispute-playbook` workflow behavior, and any broader original CDM parity differences.

## Generated Artifacts Changed By Test Run

- `manual-workflow-audit.json`
- `parity-results/disputes/desktop-original.png`
- `parity-results/disputes/mobile-original.png`
- `parity-results/letters/desktop-original.png`
- `parity-results/letters/mobile-original.png`
- `test-results/.last-run.json`
- `playwright-report/index.html`

No commits or pushes were made.
