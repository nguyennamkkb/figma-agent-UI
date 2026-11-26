# `/app-redesign build [FL-NN|section link] [L1|L2|L3|L4]`

Redesign one flow with the approved direction, at the flow's change level (`levels.md`): `project.md` → Flows → Level, else the project `Level`. A level after the flow code overrides it; write the new level in `project.md` before building. No argument → the first flow of `plan.md` whose status in `project.md` is not `done`. Requires `project.md` `Status: start/done` (otherwise run `start`; with a section link, `section-link.md` §3).

Before §0, every run: a section link → resolve it to `FL-NN` (`section-link.md` §1–2). Then, if any flow is already `review`/`done`/`trial` or this flow was built before, ask "same way or another" ◆ (`section-link.md` §4) — also when the flow was named by `FL-NN`. Another way → `section-link.md` §5 instead of the steps below.

| Level | Sections of this file to run |
|---|---|
| L1 | §0 (light), §2-L1, §3 (only if links broke), §4, §5 — no §1, no Archive |
| L2 | §0, §1 (minimum change), §2 on the baseline skeleton, §3, §4, §5 |
| L3 / L4 | §0, §1, §2, §3, §4, §5 (L4: also merges/splits, §2.6) |

Every call passes `file: "<working file>"`. Build **myself, in this session** — no sub-agents.

## 0. Foundations (first build only)

Skip when `project.md` says `foundations: done`.

1. `get_design_system` on the working file: reuse existing collections/styles where they fit; never delete the old ones before handoff.
2. Tokens of the approved direction → `import_tokens` / `create_variables` (Primitives + Semantic; one mode if the plan allows only one) and `create_styles` (text styles, effect styles, gradient paint styles).
3. Components on `02 · Components` (create the page if missing). **L1**: only the parts the baseline already repeats as hand-built copies, styled with the new tokens, plus the `Button` set; keep each part's structure and size. **L2–L4**: one per repeated part of the archetypes in `analysis.md`: top bar, bottom nav, cards, chips, list rows, sheets, dialogs, toasts, ad slots (a native ad slot on Home is full width with cornerRadius 0, never a rounded card), and the full **`Button` set** of `cta-rules.md` (Primary, Purchase with the two bands, Generate, Solid, Destructive, Secondary, Text, Disabled). Variants via `create_component_set`; effects live in the variants.
4. Convert the 3 approved Explore screens to tokens + instances (they become the masters for their archetypes). At L1 the Explore screens were recoloured copies: the decisions move to the tokens; the copies stay on Explore.
5. `project.md`: `foundations: done` + component ids.

## 1. Images of the flow ◆ (L2–L4)

L1 skips this step: add the flow's hero hashes to `image-map.json` → `keep` (colour grading only if the user asked, as an image filter on the node, not a new image). L2–L4: from `image-map.json` / the flow's baseline screens with `hero` images: generate each new image from its source with the level's treatment (`imagery.md` → Change by level), place source | new side by side on Explore, ask the user. Approved → record `newFile`, `approved: true`; the hash is filled after placing. Flows without hero images skip this gate.

## 2-L1. Restyle in place (L1 only)

For each screen of the flow, on the baseline frame itself (no clone, no Archive):

1. Bind fills, strokes, text and effects to the new tokens/styles (`bind_variables` dry run first, then apply; `update_nodes` for what the binder cannot match).
2. Swap hand-built buttons for `Button` instances of the right class (`cta-rules.md`), and repeated hand-built parts for the L1 components, keeping position and size.
3. Do not move, resize, reorder or delete blocks; do not touch image fills.
4. Rename the frame with `proposedName`; `screen-map.json`: `currentId` = the same id, `status: "built"`.

Then go to §3 (only if a swap broke a link) and §4.

## 2. Rebuild the screens (L2–L4)

For each family of the flow (order of `screen-map.json`):

1. **Master first**: build the family's main state with the figma-ui-flow loop (layout → fill → lock), from tokens and components, keeping every element the baseline frame carries (texts, inputs, ad slot, CTA class, status bar). Copy rewrites → `copyMap` in `screen-map.json`. **L2**: Pass 1 copies the baseline frame's skeleton — same blocks, same order, same height class (fixed or scrolling); only the parts inside the blocks are redesigned. **L3**: block order, grouping, hierarchy and in-screen navigation change; the master clears the minimum bar (`levels.md` §1.1: ≥ 3 moves, ≥ 1 structural, silhouette test) and its entry gets `moves`. **L4**: see step 6.
2. **States by cloning the master** (`clone_node`), then change only what differs (toast, loading overlay, selected item, dialog).
3. **Swap in place**: move the baseline frame to `Archive · Before redesign` (`move_nodes`, keep its name + suffix ` · before`), put the new frame at the baseline frame's position inside the flow section, name it with `proposedName`.
4. Update `screen-map.json`: `currentId`, `status: "built"`.
5. Missing mandatory states listed in the plan (approved) → build them now and add entries with `baselineId: null` to `extras`.
6. **L4 only — merged or split screens** (as approved in the plan): a merged screen carries every state and action of the screens it replaces; pin each of those baseline entries to it (`currentId`, `status: "shared"`, `note: "merged into <code>"`). A split screen: pin the baseline entry to the part holding its main state and list the other parts in `extras` with `why`.

Section: keep the flow's section, rename it `FL-NN · <Flow name>`; resize to fit. Sections that mix functions are split as the plan says.

## 3. Links

- Re-attach connectors whose ends pointed at archived frames to the new frames (connector gotcha in `figma-ui-flow/references/process/stage-recipes.md`: create without label, set a short label after).
- Shared screens (picker, paywall, language used by several flows): build once, link from the other flows, mark the other baseline entries `shared` with the target `currentId`.
- Update the text flow / prototype links if the file has them (`set_interactions`).

## 4. Self-audit

1. Rescan the flow's page → `inventory.current.json` (same `pages` as the baseline).
2. `parity.py … --flow FL-NN --level <flow level>`. Fix every `missing`, `CTA-LOCAL`, `CTA-MIRROR`, `LVL-LAYOUT` (L1/L2: a block moved; put it back or ask to raise the level) and clear warnings yourself; questions that need a decision go to the user.
3. `audit_design{rootId: <section>}` + `stress_test` on the masters; fix Blockers.

## 5. Report ◆

Screenshot the section (and 1–2 key screens at full size; at L2 next to the archived baseline frame), the flow's level, the parity counts and anything left open. `project.md`: flow status `review`. After the user approves: `done`, then propose the next flow.
