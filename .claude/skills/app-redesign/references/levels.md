# Change levels — how far the look may move

Every redesign runs at one level, **L1 to L4**, chosen in `start` and written in `project.md` → `Level`. A flow may run at another level (`project.md` → Flows → Level; `build FL-NN L1`). The **Function layer is locked at every level**: same screens, states, flows, conditions and ad placements; parity must pass. The CTA rules (`cta-rules.md`) apply at every level.

Same scale as ui-visual (`ui-visual/references/decode-checklist.md`): L1 reskin, L2 refresh, L3 recompose, L4 new in style.

## 1. The four levels

| Level | Name | Kept | Changes | Hero images | How `build` works |
|---|---|---|---|---|---|
| **L1** | Reskin | layout, component structure, images, copy | colours, type, radius, elevation, effects | kept (hashes in `image-map.json` → `keep`) or colour-graded only | **restyle in place**: bind tokens, swap local parts for components; no new frames, no Archive |
| **L2** | Refresh | layout and block order of every screen | + new component designs, icon set, imagery, copy clarity | regenerated with the minimum change (`imagery.md` §L2) | rebuild each screen on the baseline frame's skeleton (same blocks, same order) |
| **L3** | Recompose | screens, states, flows | + block order, grouping, hierarchy, in-screen navigation pattern (tabs ↔ segmented, list ↔ grid), sizes; **must clear the minimum bar (§1.1)** | regenerated; composition and subject may change, emotion kept (`imagery.md` §L3) | full rebuild (`build.md` §2) |
| **L4** | New in style | functions only | + information architecture: screens merged or split, entry points moved, new art direction | new art direction; the source image is a reference for subject and emotion only (`imagery.md` §L4) | full rebuild; every merge/split recorded as `shared` / `dropped` with the user's reason |

What each level never does:

- **L1** never moves, resizes or reorders a block, never replaces an image.
- **L2** never reorders blocks or changes the screen's height class (fixed ↔ scrolling).
- **L3** never merges or splits screens, never moves a function to another flow, and never ships a master that misses the minimum bar (§1.1).
- **L4** never drops a function: a merged screen still carries every state and action of the screens it replaces.

## 1.1 L3 minimum bar — a recompose must read as a new layout

Restyling the same skeleton and swapping the tab bar or a list for a carousel is **L2+**, not L3. Every L3 master screen (the main state of each family) makes **at least 3 layout moves, at least 1 of them structural (S)**:

| Code | Move | Counts when |
|---|---|---|
| **S1** | Reorder | a main block changes rank (composer moves to the top, creation cards above the greeting, the CTA leaves the bottom) |
| **S2** | Regroup | blocks are merged into one surface or one block is split (greeting + composer in one hero card, two sections fused into a bento, a section collapsed into a chip row) |
| **S3** | Re-rank | one block becomes the clear primary (≥ 40 % of the first viewport) or a former primary is demoted (big card → row, row → chip) |
| **P1** | Pattern | an in-screen pattern changes: tab bar ↔ pill + FAB, list ↔ carousel / grid, tabs ↔ segmented, inline ↔ sheet; one move per block |
| **P2** | Grid | column count or card proportions change (2 equal cards → 1 large + 2 small, 2 columns → full-width rows) |
| **P3** | Size | a main block's height changes by ≥ 30 % |
| **P4** | Fold | the set of blocks visible in the first viewport (above 800 px) changes |

Then the **silhouette test**: put the baseline and the new master side by side at 25 % zoom with text unreadable. A person must not take them for the same layout. If they would, add moves.

Write the moves in `screen-map.json` on the master entry (`"moves": ["S1", "S2", "P1"]`); `parity.py --level L3` warns `LVL-LIGHT` when a master has fewer than 3 moves or no S move, and, when no moves are recorded, when its text order still matches the baseline (agreement ≥ 0.97). A flow that cannot clear the bar without hurting the function stays at L2: record it as L2, do not call it L3.

Example: Home with the same block order (greeting → composer → 2 creation cards → AI Assistant → Recent) but a pill nav + FAB, carousels for AI Assistant and Recent and taller creation cards = P1, P1, P1 and no S move → **L2+**. To reach L3 add, for example: composer merged into the hero card with the greeting (S2), creation cards turned into one large AI Video card + a smaller AI Image card (P2, S3), Recent moved above AI Assistant (S1).

## 2. Picking the level from the goal

`/app-redesign start <goal> [L1|L2|L3|L4]`. An explicit level wins. Otherwise read the goal:

| The goal says | Level |
|---|---|
| "đổi màu", "đổi font", "theme tối", "đổi tông thương hiệu", "dark mode", "rebrand colours" | L1 |
| "hiện đại hơn", "làm mới", "đẹp hơn", "premium hơn", "phong cách <style>" while keeping the layout | L2 |
| "sắp xếp lại", "dễ dùng hơn", "đổi bố cục", "Home rõ hơn", "giảm bước" | L3 |
| "làm lại như app mới", "đổi cấu trúc", "gộp màn", "art direction mới", "phong cách 3D/khác hẳn" | L4 |
| "app anh em", "đẩy thêm 1 app", "phát hành app mới cùng chức năng", "khác bản gốc", "clone dự án" (sibling, `questions.md`) | L3 (L4 if the IA may change) |
| unclear, or a mix | **L3** for a sibling, **L2** for a refresh (default), marked *assumption* |

The level decides the scope of the whole project: always confirm it with the 4 questions ◆ (`start.md` §5.5, `questions.md` §3), together with the direction. When the goal mixes levels by area ("đổi màu toàn app, làm lại Onboarding"), propose a project level plus per-flow overrides.

## 3. What the level changes in each command

| Step | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| `start` directions A/B/C | palettes + type on the current layout | component + imagery variants on the current layout | layouts of the 3 main screens, each clearing §1.1, the directions differing in their S moves | concepts (IA sketch + style) |
| `start` 3 main screens | recoloured copies of the baseline frames | rebuilt on the baseline skeleton | rebuilt freely | rebuilt freely, IA note beside them |
| `build` foundations | tokens + text/effect styles; components only for parts the screens already repeat | full set (`build.md` §0) | full set | full set |
| `build` images ◆ | skipped (images kept) unless colour grading is asked | minimum-change regeneration | regeneration, composition free | new art direction |
| `build` screens | in place, no Archive | new frame per screen, old → Archive | same; masters record their `moves` (§1.1) | same, plus merged/split screens |
| `audit` parity | `--level L1`: IMG-SOURCE silent, LVL-LAYOUT on | `--level L2`: LVL-LAYOUT on | `--level L3`: LVL-LIGHT on | `--level L4` |

## 4. Self-check before each gate

1. Which level is this flow at, and does every change I made fit inside it (§1 "never does")?
2. Did a change slip one level up (a reordered block at L2, a replaced image at L1)? Revert it or ask the user to raise the level for this flow.
3. At L3: does every master clear §1.1 (≥ 3 moves, ≥ 1 S, silhouette test) and list its `moves`?
4. At L4: does each merged or split screen list, in `screen-map.json`, the baseline screens it carries?
5. Is the level of every flow written in `project.md`?
