# Letter Vault Visual/Function Difference Checklist

## Artifacts Inspected

- Original desktop screenshot: `parity-results/letters/desktop-original.png` (1447x1059, last written 2026-05-19 20:27:05)
- Clone desktop screenshot: `parity-results/letters/desktop-clone.png` (1440x6851, last written 2026-05-19 20:27:05)
- Original mobile screenshot: `parity-results/letters/mobile-original.png` (511x1240, last written 2026-05-19 20:27:05)
- Clone mobile screenshot: `parity-results/letters/mobile-clone.png` (758x14540, last written 2026-05-19 20:27:05)
- Test inspected: `tests/letters-compare.spec.ts`
- Clone implementation inspected: `app/letter-vault/page.tsx`
- Relevant redirect inspected: `app/letters/vault/page.tsx`
- Related saved letters page inspected only for route context: `app/letters/page.tsx`

## Brutal Checklist

### Title/Breadcrumb Differences

- [ ] Original desktop title is a compact `Letter Vault` heading below the top bar with a small circular icon to the left.
- [ ] Clone desktop title matches text, but the clone screenshot adds subtitle text under it: `View templates, create client-ready drafts, and edit saved letters.` Original does not show this subtitle.
- [ ] Original has a large instruction panel directly below the title with `BACK`, centered helper copy, and a right-aligned `Training Videos` dropdown.
- [ ] Clone screenshot does not show the original instruction panel first. It starts with `Training Videos`, `Manual Letters`, and `Response Letters` management panels.
- [ ] Original top/header chrome differs: original has the full Client Dispute Manager Software logo, top help dropdown, icon strip, avatar/user block, and footer badges. Clone uses a dark sidebar/topbar layout with simplified `DP` logo and different user/company placement.
- [ ] No explicit breadcrumb trail is visible in either screenshot.

### Layout/Order Differences

- [ ] Original desktop order: title, instruction panel, tab strip, row-list content grouped by letter category.
- [ ] Clone desktop order: title/subtitle, top-right `Add Manual Letter`, training video panel, manual letter action panel, response letter action panel, filter tabs, search input, templates list, right preview panel, saved letters panel.
- [ ] Original content area is one primary centered/contained surface. Clone desktop uses a two-column application layout with template cards on the left and preview/saved panels on the right.
- [ ] Original rows are compact horizontal bands. Clone rows are tall cards with category labels, descriptions, checkboxes, and `View`/`Use Template` buttons.
- [ ] Original desktop full-page screenshot height is 1059px. Clone desktop full-page screenshot is 6851px, indicating the clone renders far more visible list content and extra panels.
- [ ] Original has the onboarding checklist overlay and `Need Help?` button covering the lower-left portion of the row list. Clone does not show the same onboarding checklist overlay in the desktop screenshot.
- [ ] Original footer trial/membership/security copy is visible at the bottom of the desktop viewport. Clone desktop screenshot is so long the comparable footer is not visible in the captured top section.

### Tabs/Navigation Differences

- [ ] Original primary tabs are exactly five wide pill tabs: `CREDIT BUREAU LETTERS`, `CREDITOR'S LETTERS`, `COLLECTOR'S LETTERS`, `RESPOND LETTERS`, `MANUAL LETTERS`.
- [ ] Clone screenshot has a different filter-tab row: `All (58)`, `Dispute Flow Letters`, `General Letters`, `Credit Bureau Letters`, `Collector's Letters`, `Creditor's Letters`, `Respond Letters`, `Campaign Letters`.
- [ ] Original active tab is `CREDIT BUREAU LETTERS` with a blue pill background.
- [ ] Clone active filter is `All (58)`, not the original `CREDIT BUREAU LETTERS`.
- [ ] Original tabs sit immediately above the row-list surface. Clone filters sit below several management panels.
- [ ] Clone includes `Campaign Letters` as a visible navigation/filter category. Original screenshot does not show a `Campaign Letters` top tab.

### Table/List Header Differences

- [ ] Original list header starts with `Dispute Flow Letters`, then `Pre-Step (Optional)`, then compact rows.
- [ ] Clone desktop list header is `Templates`, not the original category-first row surface.
- [ ] Original then shows `General Letters` lower in the same row surface.
- [ ] Clone repeats category names inside every card as blue labels instead of using only group section headers.
- [ ] Original has no search input above the list.
- [ ] Clone has `Search templates by title, description, or category`.

### Row/Empty State Differences

- [ ] Original rows are single-line green letter titles with three circular icon actions aligned on the right.
- [ ] Clone rows are card-like items with checkbox, blue category label, black title, gray description, and rectangular `View` / `Use Template` actions.
- [ ] Original visible first rows: `Personal Information Letter`, `1-Initial dispute.`, `2-How did you verify the account.`, `3-Other credit bureaus deleted it.`, `4-Creditor did not validate it.`, `5- New and relevant information.`, `6 - Legal options explored.`, then `General Letters`.
- [ ] Clone visible first rows include similar template names but with changed punctuation/spacing in places, descriptions, and more categories intermixed because `All (58)` is active.
- [ ] Original rows alternate very subtle white/off-white horizontal bands. Clone cards are separated by bordered rounded rectangles.
- [ ] Original desktop does not show a `Saved Letters` empty state. Clone does show `Saved Letters` and `No saved letters yet. Use a template or add a manual letter.`
- [ ] Original manual empty state is not visible in the captured default screenshot.
- [ ] Clone has a saved-letter empty state in the default screenshot, which is extra UI.

### Button/Action Differences

- [ ] Original default screenshot shows `BACK` and collapsed `Training Videos`.
- [ ] Clone default screenshot shows `Add Manual Letter`, `Letter Vault Training Video`, `Move Letters Training Video`, `Select All`, `Delete All`, `Move Letters`, `Letter Preview`, `Undo Deleted Letters`, `Move Manual Letters`, response buttons, `View`, `Use Template`, and `Create From This Template`.
- [ ] Original row actions are icon-only circular buttons: green, orange, blue.
- [ ] Clone row actions are text buttons: `View` and `Use Template`.
- [ ] Original does not show `Add Manual Letter` as a top-right page button in the screenshot.
- [ ] Clone does not show the original `BACK` button in the available clone screenshot.
- [ ] Clone exposes management actions by default that original hides behind dropdowns/other interaction states.

### Modal/Form Differences

- [ ] No original modal/form screenshot exists in `parity-results/letters/`.
- [ ] No clone modal/form screenshot exists in `parity-results/letters/`.
- [ ] Clone code contains a letter editor panel with fields: `Client / Customer`, `Bureau / Recipient`, `Dispute Reason / Type`, `Account / Creditor`, `Template / Letter Type`, `Subject / Title`, `Body / Content`, `Notes`, `Cancel`, `Save Letter`.
- [ ] Clone code contains a preview panel with `Create From This Template`.
- [ ] The original modal/form behavior cannot be visually verified from current artifacts.
- [ ] Missing artifact: original training dropdown-open screenshot.
- [ ] Missing artifact: clone training dropdown-open screenshot.
- [ ] Missing artifact: original manual/add/edit letter modal screenshot.
- [ ] Missing artifact: clone manual/add/edit letter modal screenshot.
- [ ] Missing artifact: original letter preview screenshot.
- [ ] Missing artifact: clone letter preview screenshot.

### Visual Style Differences

- [ ] Original uses a light gray app background, white content surfaces, rounded pill tabs, green row text, soft drop shadows, and compact spacing.
- [ ] Clone uses dark navy sidebar chrome, white cards, many rectangular bordered controls, blue labels, dark navy action buttons, and a much denser management-dashboard style.
- [ ] Original sidebar is light, with a blue highlighted `Company` section and nested items. Clone sidebar is dark with `Letter Vault` selected directly.
- [ ] Original desktop row surface has a large white card with minimal visible borders. Clone has many individual bordered cards.
- [ ] Original typography appears larger/bolder in section headings and very compact in rows. Clone row cards mix small blue labels, descriptions, and button text.
- [ ] Original has visible onboarding/checklist overlay styling that clone screenshot lacks.
- [ ] Original mobile remains closer to the original desktop visual language, with overlay checklist and row actions visible. Clone mobile collapses into a narrow, extremely tall card stack with text wrapping badly.

### Extra Clone-Only UI

- [ ] Page subtitle: `View templates, create client-ready drafts, and edit saved letters.`
- [ ] Top-right `Add Manual Letter` button.
- [ ] Always-visible `Training Videos` panel with both video buttons.
- [ ] Always-visible `Manual Letters` management panel.
- [ ] Always-visible `Response Letters` management panel.
- [ ] Filter tabs including `All (58)`, `Dispute Flow Letters`, `General Letters`, and `Campaign Letters`.
- [ ] Search input.
- [ ] `Templates` label.
- [ ] Right-side letter preview panel.
- [ ] `Create From This Template` button.
- [ ] `Saved Letters` panel and empty state.
- [ ] Per-template descriptions.
- [ ] Per-row `View` and `Use Template` buttons.

### Missing Original UI In Clone Screenshot

- [ ] Original instruction panel with `BACK`, centered helper copy, and collapsed right `Training Videos` dropdown.
- [ ] Original five top category tabs in the default position and style.
- [ ] Original row-list-only surface without search/filter cards.
- [ ] Original compact green row titles with three right-side circular icon actions.
- [ ] Original `Dispute Flow Letters` / `Pre-Step (Optional)` / `General Letters` grouping as the main visible structure.
- [ ] Original onboarding checklist overlay on desktop and mobile.
- [ ] Original `Need Help?` floating button placement and badge.
- [ ] Original footer/trial/security presentation within the comparable viewport.

### Click/Function Behavior Differences

- [ ] Original `Training Videos` appears collapsed by default. Clone screenshot has training videos expanded/always visible as a panel.
- [ ] Original row actions appear to be icon actions with no text labels. Clone actions are explicit `View` and `Use Template`.
- [ ] Clone supports selecting templates via checkboxes and `Select All`; original screenshot only shows row icon controls and does not show checkbox rows.
- [ ] Clone supports delete/move/undo actions directly in the visible default screen. Original screenshot does not expose these actions by default.
- [ ] Clone supports search/filtering by template metadata. Original screenshot does not show search.
- [ ] Clone preview is visible by default for the selected template. Original screenshot does not show a preview panel by default.
- [ ] Clone saved drafts are local in-page state based on inspected code; original save/create persistence behavior is unknown from current screenshots.
- [ ] `tests/letters-compare.spec.ts` writes `missing-from-clone.json`, `different-from-original.json`, and `extra-in-clone.json`, but all three are currently `[]` despite the screenshot-visible differences above. Current JSON artifacts are not trustworthy as a visual parity source.

### Mobile Differences

- [ ] Original mobile screenshot is 511x1240. Clone mobile screenshot is 758x14540, showing a massive page-height mismatch.
- [ ] Original mobile top chrome keeps the original logo/help/avatar arrangement.
- [ ] Clone mobile keeps the dark left sidebar visible, consuming horizontal space and forcing the page content into a very narrow column.
- [ ] Original mobile shows the title, instruction panel, onboarding overlay, a partial original row list, footer buttons, and security copy in a short viewport.
- [ ] Clone mobile shows the title/subtitle, add/manual/training/response panels, filters, search, preview, saved panel, then a huge list of narrow cards.
- [ ] Clone mobile cards wrap letter titles and descriptions into unreadably narrow vertical text columns.
- [ ] Original mobile row actions remain circular icons. Clone mobile row actions are tiny rectangular buttons wedged beside wrapped text.
- [ ] Original mobile has the onboarding checklist overlay. Clone mobile does not show it.
- [ ] Original mobile has the `Need Help?` button overlay. Clone mobile does not match that visible placement.

### Blockers/Missing Artifacts

- [ ] No screenshots are missing for the basic desktop/mobile default comparison; all four default screenshots exist in `parity-results/letters/`.
- [ ] Missing interaction screenshots block modal/dropdown parity review: training dropdown open, add manual letter/editor open, preview open, after selecting rows, after moving/deleting rows, and manual-letter empty state.
- [ ] Existing test only captures default desktop/mobile screenshots and text/marker parity. It does not capture the interaction states needed for modal/form and behavior comparison.
- [ ] To regenerate the existing default artifacts, run: `npx playwright test tests/letters-compare.spec.ts`.
- [ ] To generate the missing modal/form artifacts, extend `tests/letters-compare.spec.ts` or add a focused Letter Vault visual spec that clicks the relevant controls and saves screenshots under `parity-results/letters/`.
