# Letters Buttons / Function Checklist

Scope: root app only (`C:\Users\LESLI\disputepilot-app`). Nested `disputepilot-app\` was not inspected or edited.

No app files, tests, commits, or pushes were changed. This is a code/test audit only; no full suite was run.

## Routes Found

- `/letters` -> `app/letters/page.tsx`
- `/letter-vault` -> `app/letter-vault/page.tsx`
- `/letters/vault` -> redirects to `/letter-vault` from `app/letters/vault/page.tsx`
- `/bulk-print` -> `app/bulk-print/page.tsx`
- `/letters/ai-rewriter` -> `app/letters/ai-rewriter/page.tsx`
- `/disputes/ai-metro-2-letters` -> `app/disputes/ai-metro-2-letters/page.tsx`

Note: requested `/letters/bulk-print` was not found. Bulk print is implemented at `/bulk-print`.

## Working Buttons / Links / Controls

### Shared Layout Navigation

- [x] `Bulk Print` sidebar link
  - Expected: navigate to bulk print.
  - Current: `Link` to `/bulk-print` in `components/CDMLayout.tsx`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `Letters` sidebar group
  - Expected: expand/collapse letter links.
  - Current: toggles expanded state.
  - Type: opens/closes navigation group.
  - Needs real fix: no.

- [x] `All Letters`
  - Expected: navigate to all letters.
  - Current: `Link` to `/letters`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `Letter Vault`
  - Expected: navigate to letter vault.
  - Current: `Link` to `/letter-vault`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `AI Rewriter`
  - Expected: navigate to AI rewriter.
  - Current: `Link` to `/letters/ai-rewriter`.
  - Type: navigates.
  - Needs real fix: no.

### `/letters`

- [x] `Use Letter Vault`
  - Expected: navigate to letter vault.
  - Current: `Link href="/letter-vault"`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `AI Rewriter`
  - Expected: navigate to AI rewriter.
  - Current: `Link href="/letters/ai-rewriter"`; covered in `manual-workflow-audit.spec.ts`.
  - Type: navigates.
  - Needs real fix: no.

- [x] `Create Letter`
  - Expected: open create editor.
  - Current: opens `Letter editor`, pre-fills title/type, clears message.
  - Type: opens form/editor.
  - Needs real fix: no.

- [x] `Search letters`
  - Expected: filter saved letters.
  - Current: filters local `letters` by client, recipient, reason, account, type, title, body, notes.
  - Type: filters.
  - Needs real fix: no.

- [x] Editor fields: `Client / Customer`, `Bureau / Recipient`, `Dispute Reason / Type`, `Account / Creditor`, `Template / Letter Type`, `Subject / Title`, `Body / Content`, `Notes`
  - Expected: edit draft values.
  - Current: controlled local inputs/textareas update draft state.
  - Type: edits form state.
  - Needs real fix: no.

- [x] `Cancel`
  - Expected: close editor without saving.
  - Current: closes editor.
  - Type: closes/cancels.
  - Needs real fix: no.

- [x] `Save Letter`
  - Expected: save new or edited letter.
  - Current: saves into component state and shows confirmation; covered in `letters-workflows.spec.ts` and `manual-workflow-audit.spec.ts`.
  - Type: saves locally.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

- [x] Card `Edit`
  - Expected: open saved letter in editor.
  - Current: opens editor with selected local letter; covered in `letters-workflows.spec.ts`.
  - Type: edits.
  - Needs real fix: no.

### `/letter-vault` and `/letters/vault`

- [x] `/letters/vault`
  - Expected: route to letter vault.
  - Current: server redirects to `/letter-vault`.
  - Type: navigates/redirects.
  - Needs real fix: no.

- [x] `Training Videos`
  - Expected: open training menu.
  - Current: toggles menu visibility; covered in `letters-pages-smoke.spec.ts`.
  - Type: opens/closes menu.
  - Needs real fix: no for menu button; child video actions are broken.

- [x] Category tabs: `CREDIT BUREAU LETTERS`, `CREDITOR'S LETTERS`, `COLLECTOR'S LETTERS`, `RESPOND LETTERS`, `MANUAL LETTERS`
  - Expected: switch visible template category.
  - Current: updates `activeTab`, resets search/confirmation.
  - Type: tabs/filter.
  - Needs real fix: no.

- [x] Row icon `i` / aria-label `View {template}`
  - Expected: show template details.
  - Current: opens tools panel and updates template details.
  - Type: opens details panel.
  - Needs real fix: no.

- [x] Row icon `+` / aria-label `Use {template}`
  - Expected: create draft from template.
  - Current: opens tools and editor with template body/title.
  - Type: opens form/generates draft from template.
  - Needs real fix: no.

- [x] Row icon `>` / aria-label `Preview {template}`
  - Expected: preview template.
  - Current: same as View: opens tools panel and template details.
  - Type: opens details/preview.
  - Needs real fix: no, unless original product required a distinct preview modal.

- [x] `Open letter tools` / `Close letter tools`
  - Expected: show/hide tool area.
  - Current: toggles `toolsOpen`; covered in tests.
  - Type: opens/closes panel.
  - Needs real fix: no.

- [x] `Add Manual Letter`
  - Expected: open blank/manual letter editor.
  - Current: opens editor with manual starter body; covered in `letter-vault-actions-behavior.spec.ts`.
  - Type: opens form.
  - Needs real fix: no.

- [x] `Select All`
  - Expected: select visible filtered templates.
  - Current: selects `filtered` template ids and shows confirmation; covered in `letters-workflows.spec.ts`.
  - Type: selects.
  - Needs real fix: no.

- [x] `Delete All`
  - Expected: delete selected templates, or visible templates if none selected.
  - Current: adds ids to local deleted list, clears selection, confirms; covered in `letters-workflows.spec.ts`.
  - Type: deletes locally.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

- [x] `Move Letters`
  - Expected: move selected templates to chosen category.
  - Current: overrides category locally and switches active tab; covered in `letters-workflows.spec.ts`.
  - Type: moves locally.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

- [x] `Undo Deleted Letters`
  - Expected: restore recently deleted templates.
  - Current: removes last deleted ids from local deleted list; covered in `letters-workflows.spec.ts`.
  - Type: restores locally.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

- [x] `Move Manual Letters`
  - Expected: probably move manual letters.
  - Current: calls the same `moveSelectedLetters` function as `Move Letters`.
  - Type: moves selected templates locally.
  - Needs real fix: ambiguous; label and behavior may not match.

- [x] `Move to Letter Category`
  - Expected: choose target category for move actions.
  - Current: updates `moveCategory`.
  - Type: edits selection/filter target.
  - Needs real fix: no.

- [x] `Search letter templates`
  - Expected: filter templates by title, description, category.
  - Current: filters visible tools template list; covered in `letters-workflows.spec.ts`.
  - Type: filters.
  - Needs real fix: no.

- [x] Template checkbox `Select {template}`
  - Expected: select/unselect a template.
  - Current: toggles id in `selectedTemplateIds`.
  - Type: selects.
  - Needs real fix: no.

- [x] Template card `View`
  - Expected: show template details.
  - Current: updates selected template; covered in `letters-workflows.spec.ts`.
  - Type: opens details.
  - Needs real fix: no.

- [x] Template card `Use Template`
  - Expected: create draft from template.
  - Current: opens editor with template values; covered in `letters-workflows.spec.ts`.
  - Type: opens form/generates draft from template.
  - Needs real fix: no.

- [x] `Create From This Template`
  - Expected: create draft from selected template.
  - Current: opens editor from selected template.
  - Type: opens form/generates draft from template.
  - Needs real fix: no.

- [x] Letter editor fields, `Cancel`, `Save Letter`
  - Expected: edit and save generated/manual letter.
  - Current: controlled fields; save stores in local `savedDrafts`; edit reopens saved local draft; covered in `letters-workflows.spec.ts`.
  - Type: edits/saves locally.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

- [x] Saved letter `Edit`
  - Expected: reopen saved draft.
  - Current: opens editor with saved local draft.
  - Type: edits.
  - Needs real fix: no.

### `/bulk-print`

- [x] Main tabs: `Print Queue`, `Credit Bureau Addresses`, `Print Automation`
  - Expected: switch sections.
  - Current: updates `tab`.
  - Type: tabs.
  - Needs real fix: no.

- [x] Queue subtabs: `Current Queue`, `Archive`
  - Expected: switch current/archive rows and clear selected rows.
  - Current: updates `queueTab`, resets page and checked map.
  - Type: tabs/filter.
  - Needs real fix: possible data classification issue for `resolved`; see ambiguous section.

- [x] Header `Select All`
  - Expected: select printable rows.
  - Current: selects all `filteredRows`, not only current page.
  - Type: selects.
  - Needs real fix: no.

- [x] Header/table row checkboxes
  - Expected: select rows for printing.
  - Current: header toggles page rows; row checkbox toggles individual row.
  - Type: selects.
  - Needs real fix: no.

- [x] Search input
  - Expected: filter by client, letter, account.
  - Current: filters rows and resets page.
  - Type: filters.
  - Needs real fix: no.

- [x] `All Bureaus`, `All Rounds`, `All Statuses`
  - Expected: filter queue.
  - Current: filters rows and resets page.
  - Type: filters.
  - Needs real fix: no.

- [x] `Clear filters`
  - Expected: reset active filters.
  - Current: visible only when filters are active; resets filters/page.
  - Type: clears.
  - Needs real fix: no.

- [x] Row `View`
  - Expected: open dispute letter preview.
  - Current: opens detail modal for the row.
  - Type: opens modal.
  - Needs real fix: no.

- [x] Modal `x` and `Close`
  - Expected: close preview.
  - Current: sets `viewDispute` to null.
  - Type: closes modal.
  - Needs real fix: no.

- [x] `Deselect All`
  - Expected: clear selected rows.
  - Current: clears `checked`.
  - Type: clears.
  - Needs real fix: no.

- [x] `Prev` / `Next`
  - Expected: paginate.
  - Current: updates page within bounds and disables at ends.
  - Type: paginates.
  - Needs real fix: no.

- [x] Bureau address `Copy`
  - Expected: copy bureau address.
  - Current: writes to clipboard and temporarily changes label to `Copied`; no error handling.
  - Type: copies.
  - Needs real fix: no, though clipboard failure handling would improve resilience.

- [x] Automation rule toggle switch
  - Expected: toggle rule active/inactive.
  - Current: updates local `rules` state.
  - Type: toggles.
  - Needs real fix: ambiguous for persistence; see ambiguous section.

### `/letters/ai-rewriter`

- [x] `Letter Type`
  - Expected: choose source letter type.
  - Current: updates `letterType`; sample and rewrite use selected value.
  - Type: edits/selects.
  - Needs real fix: no.

- [x] `Tone`
  - Expected: choose rewrite tone.
  - Current: updates `tone`; generated rewrite includes it.
  - Type: edits/selects.
  - Needs real fix: no.

- [x] `Focus / Strategy`
  - Expected: choose rewrite focus.
  - Current: updates `focus`; generated rewrite includes it.
  - Type: edits/selects.
  - Needs real fix: no.

- [x] `Load Sample`
  - Expected: load sample letter.
  - Current: loads sample for selected type or default; covered in multiple tests.
  - Type: generates/loads sample.
  - Needs real fix: no.

- [x] `Clear / Reset`
  - Expected: clear original, output, error, count.
  - Current: clears all local state; covered in `letters-workflows.spec.ts`.
  - Type: clears.
  - Needs real fix: no.

- [x] Original letter textarea
  - Expected: accept pasted/typed original.
  - Current: controlled textarea updates original and character count.
  - Type: edits.
  - Needs real fix: no.

- [x] `Rewrite with AI`
  - Expected: rewrite pasted letter.
  - Current: if original is blank, sets error; if present, creates deterministic local rewrite after 200ms; covered in tests.
  - Type: generates.
  - Needs real fix: ambiguous because it does not call the existing `/api/rewrite-letter`; see ambiguous section.

- [x] `Use as Original`
  - Expected: move rewritten text back to original for another pass.
  - Current: copies rewritten into original, updates char count, clears rewritten.
  - Type: edits/swaps.
  - Needs real fix: no.

- [x] `Copy`
  - Expected: copy rewritten letter.
  - Current: writes rewritten text to clipboard and temporarily changes label; visible in tests.
  - Type: copies.
  - Needs real fix: no, though clipboard failure handling would improve resilience.

### `/disputes/ai-metro-2-letters`

- [x] `Letter Type / Template`, `Client Name`, `Account / Furnisher`, `Bureau / Recipient`, `Dispute Reason`, `Facts / Evidence`
  - Expected: configure Metro 2 draft.
  - Current: controlled fields update local state.
  - Type: edits/selects.
  - Needs real fix: no.

- [x] `Generate Draft`
  - Expected: generate draft from inputs.
  - Current: validates required fields, writes generated draft to preview; covered in `disputes-ai-metro-2-letters-behavior.spec.ts`.
  - Type: generates.
  - Needs real fix: no.

- [x] `Copy Draft`
  - Expected: copy generated draft.
  - Current: warns if no draft; otherwise copies to clipboard; covered in test.
  - Type: copies.
  - Needs real fix: no.

- [x] `Save/Queue Locally`
  - Expected: save or queue generated draft.
  - Current: saves to `localStorage` under `disputepilot.ai-metro-2-drafts`; covered in test.
  - Type: saves/queues locally.
  - Needs real fix: ambiguous for production queue integration; see ambiguous section.

- [x] `Open AI Rewriter`
  - Expected: navigate to AI rewriter.
  - Current: `router.push("/letters/ai-rewriter")`; covered in test.
  - Type: navigates.
  - Needs real fix: no.

## Broken / Non-Functional Buttons

- [ ] `/letter-vault` `BACK`
  - Expected behavior: navigate back to previous page or to a known letters/dashboard route.
  - Current behavior: plain `<button type="button">BACK</button>` with no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: add `useRouter` and call `router.back()` with a fallback link/button to `/letters` or `/dashboard` if there is no history.
  - Files likely needing edits: `app/letter-vault/page.tsx`.
  - Focused test: update `tests/letters-workflows.spec.ts` or add `tests/letter-vault-actions-behavior.spec.ts` coverage that clicking `BACK` changes URL/history or reaches the expected fallback.

- [ ] `/letter-vault` `Letter Vault Training Video`
  - Expected behavior: open a training video/modal/link.
  - Current behavior: menu child button has no `onClick`, no link, no modal.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: convert to link with real training URL or open an in-app modal/player with a configured source.
  - Files likely needing edits: `app/letter-vault/page.tsx`; possibly a shared training-video component if one exists.
  - Focused test: click `Training Videos`, click `Letter Vault Training Video`, assert modal/player/link target appears.

- [ ] `/letter-vault` `Move Letters Training Video`
  - Expected behavior: open a training video/modal/link.
  - Current behavior: menu child button has no `onClick`, no link, no modal.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: convert to link with real training URL or open an in-app modal/player with a configured source.
  - Files likely needing edits: `app/letter-vault/page.tsx`.
  - Focused test: click `Training Videos`, click `Move Letters Training Video`, assert modal/player/link target appears.

- [ ] `/letter-vault` `Letter Preview`
  - Expected behavior: preview selected/current letter/template.
  - Current behavior: no `onClick`; does nothing.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: wire to selected template or selected saved draft; if no selection, show confirmation/status telling user to select a letter. Reuse the existing `selectedTemplate` details panel or add a preview modal.
  - Files likely needing edits: `app/letter-vault/page.tsx`.
  - Focused test: select a template, click `Letter Preview`, assert preview content is visible; also test no-selection status.

- [ ] `/letter-vault` `Respond Credit Bureau`
  - Expected behavior: start/create response letter workflow for bureau response.
  - Current behavior: no `onClick`; does nothing.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: open editor with a Respond Credit Bureau template/category or filter/switch to `Respond Letters` with a clear selected response template.
  - Files likely needing edits: `app/letter-vault/page.tsx`, possibly `letterTemplates.ts`.
  - Focused test: click `Respond Credit Bureau`, assert editor opens with response template/category or tab switches to response letters.

- [ ] `/letter-vault` `Respond Creditor`
  - Expected behavior: start/create creditor response letter workflow.
  - Current behavior: no `onClick`; does nothing.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: open editor with a creditor response draft or filter to creditor response templates.
  - Files likely needing edits: `app/letter-vault/page.tsx`, possibly `letterTemplates.ts`.
  - Focused test: click `Respond Creditor`, assert response draft/editor state.

- [ ] `/letter-vault` `Respond Collector`
  - Expected behavior: start/create collector response letter workflow.
  - Current behavior: no `onClick`; does nothing.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: open editor with a collector response draft or filter to collector response templates.
  - Files likely needing edits: `app/letter-vault/page.tsx`, possibly `letterTemplates.ts`.
  - Focused test: click `Respond Collector`, assert response draft/editor state.

- [ ] `/bulk-print` `+ New Rule`
  - Expected behavior: create a print automation rule.
  - Current behavior: button has no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: open a New Rule form/modal and append/persist a rule on save.
  - Files likely needing edits: `app/bulk-print/page.tsx`.
  - Focused test: switch to `Print Automation`, click `+ New Rule`, assert form/modal opens and saving adds a visible rule.

- [ ] `/bulk-print` automation rule `Edit`
  - Expected behavior: edit selected automation rule.
  - Current behavior: button has no `onClick`.
  - Type: does nothing.
  - Needs real fix: yes.
  - Recommended exact fix: open an edit form/modal seeded with that rule; save updates `rules` and eventually persisted backend state.
  - Files likely needing edits: `app/bulk-print/page.tsx`.
  - Focused test: switch to `Print Automation`, click first `Edit`, assert fields are populated and save changes visible rule text/status.

## Ambiguous / Needs Original Comparison

- [ ] `/letters` `Save Letter`
  - Current: saves only to component state; lost on reload and not connected to clients, disputes, bulk print, or database.
  - Why ambiguous: tests validate local workflow only, but page copy says saved/generated letters before review, print, or send.
  - Recommended fix if original expects persistence: save to Supabase `dispute_letters` or a dedicated letters table, then reload from backend.
  - Files likely needing edits: `app/letters/page.tsx`, `lib/supabase-browser.ts`, possible schema/API route.
  - Focused test: create a letter, reload `/letters`, assert it remains visible.

- [ ] `/letter-vault` `Save Letter`, `Delete All`, `Move Letters`, `Undo Deleted Letters`, `Move Manual Letters`
  - Current: all changes are local component state only; deleted/moved/saved state is lost on reload.
  - Why ambiguous: this may be acceptable for a prototype, but a real letter vault usually persists custom letters/category changes.
  - Recommended fix if original expects persistence: persist saved drafts and template overrides/deletes in backend keyed by account/user; decide whether template deletes hide defaults per account.
  - Files likely needing edits: `app/letter-vault/page.tsx`, `letterTemplates.ts`, backend/API or Supabase tables.
  - Focused test: save/move/delete a draft/template, reload, assert expected persisted state.

- [ ] `/letter-vault` `Move Manual Letters`
  - Current: identical behavior to `Move Letters`; it moves currently selected template ids, not specifically manual letters.
  - Why ambiguous: label implies a different manual-letter-only workflow.
  - Recommended fix: either rename it to match behavior or implement a manual-letter selection/move path.
  - Files likely needing edits: `app/letter-vault/page.tsx`.
  - Focused test: create a manual letter, click `Move Manual Letters`, assert the manual saved draft changes category.

- [ ] `/letter-vault` row `Preview {template}` icon
  - Current: same action as `View`.
  - Why ambiguous: if original UI had separate preview behavior, this is incomplete; if details panel is preview, it is fine.
  - Recommended fix if original differs: open a dedicated preview modal or print-style preview.
  - Files likely needing edits: `app/letter-vault/page.tsx`.
  - Focused test: click row preview icon, assert expected preview surface, not just selected details if different.

- [ ] `/bulk-print` `Print Selected`, row `Print`, bottom `Print N Letters`, modal `Print This Letter`
  - Current: calls `window.print()` after a short local processing delay. It does not render a selected-letter-only print document, does not mark rows printed, and row/modal print still prints the page UI rather than a generated letter document.
  - Why ambiguous: technically opens browser print, but likely not a real bulk letter print workflow.
  - Recommended fix: build a print-rendering state/view for selected row ids, call print after rendering only selected letters, then optionally update statuses to printed.
  - Files likely needing edits: `app/bulk-print/page.tsx`; possibly print-specific component/API for generated letter content.
  - Focused test: select two rows, click print, stub `window.print`, assert only selected ids are in print view and status/confirmation updates.

- [ ] `/bulk-print` `Current Queue` / `Archive`
  - Current: `resolved` rows appear in `archiveRows` but are not excluded from `activeRows`, so resolved items can appear in both queue modes.
  - Why ambiguous: archive probably should include resolved, current queue probably should exclude resolved.
  - Recommended fix: define status ownership clearly; likely exclude `resolved` from current queue.
  - Files likely needing edits: `app/bulk-print/page.tsx`.
  - Focused test: seed pending/resolved/archived rows, assert resolved appears only in Archive.

- [ ] `/bulk-print` automation rule toggle
  - Current: toggles local state only; lost on reload and no scheduling/automation side effect.
  - Why ambiguous: visible rule state works, but "Print Automation Rules" implies persistence and actual automation.
  - Recommended fix: persist rule active state and connect to actual automation scheduler/queue.
  - Files likely needing edits: `app/bulk-print/page.tsx`, automation API/backend.
  - Focused test: toggle rule, reload, assert active state persists.

- [ ] `/letters/ai-rewriter` `Rewrite with AI`
  - Current: deterministic client-side rewrite; does not call existing `app/api/rewrite-letter/route.ts`.
  - Why ambiguous: page title and labels say AI, but code is a local template rewrite. Existing tests only verify deterministic output.
  - Recommended fix: call `/api/rewrite-letter` with original, letter type, tone, focus; keep deterministic fallback/error state if API fails.
  - Files likely needing edits: `app/letters/ai-rewriter/page.tsx`, `app/api/rewrite-letter/route.ts`.
  - Focused test: mock `/api/rewrite-letter`, click rewrite, assert request payload and rendered API response.

- [ ] `/disputes/ai-metro-2-letters` `Save/Queue Locally`
  - Current: writes to localStorage only, not visible in `/letters`, `/letter-vault`, or `/bulk-print`.
  - Why ambiguous: label says queue, which implies integration with letter workflows or print queue.
  - Recommended fix: save generated draft to the same backend/model used by letters and/or create a print queue item.
  - Files likely needing edits: `app/disputes/ai-metro-2-letters/page.tsx`, `app/letters/page.tsx`, `app/bulk-print/page.tsx`, backend/API.
  - Focused test: save/queue draft, navigate to target queue/list, assert the draft appears.

## Downloads / Print / Copy Coverage

- Downloads: no visible letter download controls were found in the audited routes.
- Print actions found: `/bulk-print` only. All print buttons call `window.print()` and need original comparison for whether that is sufficient.
- Copy actions found: bureau address copy, AI rewriter copy, Metro 2 draft copy. All use `navigator.clipboard.writeText`; tests cover some happy paths but not clipboard failure.

## Existing Relevant Tests

- `tests/letters-workflows.spec.ts`
  - Covers `/letter-vault` view/use/save/edit, `/letters` create/edit, Letter Vault search/select/move/delete/undo, AI rewriter input/rewrite/reset.

- `tests/letters-pages-smoke.spec.ts`
  - Covers route visibility for `/letters`, `/letters/vault`, `/letter-vault`, `/letters/ai-rewriter`; validates selected top-level controls.

- `tests/letter-vault-actions-behavior.spec.ts`
  - Covers opening letter tools and `Add Manual Letter` without app error.

- `tests/bulk-print-behavior.spec.ts`
  - Minimal smoke: clicks first bulk-print-ish action and checks no app error. Does not validate actual print/automation behavior.

- `tests/operational-pages-smoke.spec.ts`
  - Covers `/bulk-print` visibility and top-level button presence only.

- `tests/workflow-interactions-smoke.spec.ts`
  - Covers `/letters/ai-rewriter` sample/rewrite/copy visibility.

- `tests/manual-workflow-audit.spec.ts`
  - Covers `/letters` create/save/edit/cancel and AI rewriter navigation; covers `/letters/ai-rewriter` sample/rewrite/copy visibility.

- `tests/disputes-ai-metro-2-letters-behavior.spec.ts`
  - Covers Metro 2 generate/copy/local save/navigation.

## Highest Priority Fix List

1. Wire no-op Letter Vault buttons: `BACK`, training video items, `Letter Preview`, `Respond Credit Bureau`, `Respond Creditor`, `Respond Collector`.
2. Wire Bulk Print automation buttons: `+ New Rule`, rule `Edit`.
3. Decide and implement real print output behavior for `/bulk-print` instead of printing the whole UI.
4. Decide persistence model for letters/vault/bulk automation state.
5. Decide whether AI Rewriter should call `app/api/rewrite-letter/route.ts`; if yes, replace local deterministic rewrite with API-backed rewrite and tested fallback.

