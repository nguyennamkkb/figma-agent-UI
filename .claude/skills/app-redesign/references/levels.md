# Change levels — how far the look may move

Every redesign runs at one level, **L1 to L4**, chosen in `start` and written in `project.md` → `Level`. A flow may run at another level (`project.md` → Flows → Level; `build FL-NN L1`). The **Function layer is locked at every level**: same screens, states, flows, conditions and ad placements; parity must pass. The CTA rules (`cta-rules.md`) apply at every level.

Same scale as ui-visual (`ui-visual/references/decode-checklist.md`): L1 reskin, L2 refresh, L3 recompose, L4 new in style.

## 1. The four levels

| Level | Name | Kept | Changes | Hero images | How `build` works |
|---|---|---|---|---|---|
| **L1** | Reskin | layout, component structure, images, copy | colours, type, radius, elevation, effects | kept (hashes in `image-map.json` → `keep`) or colour-graded only | **restyle in place**: bind tokens, swap local parts for components; no new frames, no Archive |
| **L2** | Refresh | layout and block order of every screen | + new component designs, icon set, imagery, copy clarity | regenerated with the minimum change (`imagery.md` §L2) | rebuild each screen on the baseline frame's skeleton (same blocks, same order) |
| **L3** | Recompose | screens, states, flows | + block order, hierarchy, in-screen navigation pattern (tabs ↔ segmented, list ↔ grid), sizes | regenerated; composition and subject may change, emotion kept (`imagery.md` §L3) | full rebuild (`build.md` §2) |
| **L4** | New in style | functions only | + information architecture: screens merged or split, entry points moved, new art direction | new art direction; the source image is a reference for subject and emotion only (`imagery.md` §L4) | full rebuild; every merge/split recorded as `shared` / `dropped` with the user's reason |

What each level never does:

- **L1** never moves, resizes or reorders a block, never replaces an image.
- **L2** never reorders blocks or changes the screen's height class (fixed ↔ scrolling).
- **L3** never merges or splits screens, never moves a function to another flow.
- **L4** never drops a function: a merged screen still carries every state and action of the screens it replaces.

## 2. Picking the level from the goal

`/app-redesign start <goal> [L1|L2|L3|L4]`. An explicit level wins. Otherwise read the goal:

| The goal says | Level |
|---|---|
| "đổi màu", "đổi font", "theme tối", "đổi tông thương hiệu", "dark mode", "rebrand colours" | L1 |
| "hiện đại hơn", "làm mới", "đẹp hơn", "premium hơn", "phong cách <style>" while keeping the layout | L2 |
| "sắp xếp lại", "dễ dùng hơn", "đổi bố cục", "Home rõ hơn", "giảm bước" | L3 |
| "làm lại như app mới", "đổi cấu trúc", "gộp màn", "art direction mới", "phong cách 3D/khác hẳn" | L4 |
| unclear, or a mix | **L2** (default), marked *assumption* |

The level decides the scope of the whole project: always confirm it at the `start` gate ◆ (`start.md` §6), together with the direction. When the goal mixes levels by area ("đổi màu toàn app, làm lại Onboarding"), propose a project level plus per-flow overrides.

## 3. What the level changes in each command

| Step | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| `start` directions A/B/C | palettes + type on the current layout | component + imagery variants on the current layout | layouts of the 3 main screens | concepts (IA sketch + style) |
| `start` 3 main screens | recoloured copies of the baseline frames | rebuilt on the baseline skeleton | rebuilt freely | rebuilt freely, IA note beside them |
| `build` foundations | tokens + text/effect styles; components only for parts the screens already repeat | full set (`build.md` §0) | full set | full set |
| `build` images ◆ | skipped (images kept) unless colour grading is asked | minimum-change regeneration | regeneration, composition free | new art direction |
| `build` screens | in place, no Archive | new frame per screen, old → Archive | same | same, plus merged/split screens |
| `audit` parity | `--level L1`: IMG-SOURCE silent, LVL-LAYOUT on | `--level L2`: LVL-LAYOUT on | `--level L3` | `--level L4` |

## 4. Self-check before each gate

1. Which level is this flow at, and does every change I made fit inside it (§1 "never does")?
2. Did a change slip one level up (a reordered block at L2, a replaced image at L1)? Revert it or ask the user to raise the level for this flow.
3. At L4: does each merged or split screen list, in `screen-map.json`, the baseline screens it carries?
4. Is the level of every flow written in `project.md`?
