# `/app-redesign build [FL-NN]`

Rebuild one flow in place with the approved direction. No argument → the first flow of `plan.md` whose status in `project.md` is not `done`. Requires `project.md` `Status: start/done` (otherwise run `start`).

Every call passes `file: "<working file>"`. Build **myself, in this session** — no sub-agents.

## 0. Foundations (first build only)

Skip when `project.md` says `foundations: done`.

1. `get_design_system` on the working file: reuse existing collections/styles where they fit; never delete the old ones before handoff.
2. Tokens of the approved direction → `import_tokens` / `create_variables` (Primitives + Semantic; one mode if the plan allows only one) and `create_styles` (text styles, effect styles, gradient paint styles).
3. Components on `02 · Components` (create the page if missing) — one per repeated part of the archetypes in `analysis.md`: top bar, bottom nav, cards, chips, list rows, sheets, dialogs, toasts, ad slots, and the full **`Button` set** of `cta-rules.md` (Primary, Purchase with the two bands, Generate, Solid, Destructive, Secondary, Text, Disabled). Variants via `create_component_set`; effects live in the variants.
4. Convert the 3 approved Explore screens to tokens + instances (they become the masters for their archetypes).
5. `project.md`: `foundations: done` + component ids.

## 1. Images of the flow ◆

From `image-map.json` / the flow's baseline screens with `hero` images: generate each new image from its source (`imagery.md`), place source | new side by side on Explore, ask the user. Approved → record `newFile`, `approved: true`; the hash is filled after placing. Flows without hero images skip this gate.

## 2. Rebuild the screens

For each family of the flow (order of `screen-map.json`):

1. **Master first**: build the family's main state with the figma-ui-flow loop (layout → fill → lock), from tokens and components, keeping every element the baseline frame carries (texts, inputs, ad slot, CTA class, status bar). Copy rewrites → `copyMap` in `screen-map.json`.
2. **States by cloning the master** (`clone_node`), then change only what differs (toast, loading overlay, selected item, dialog).
3. **Swap in place**: move the baseline frame to `Archive · Before redesign` (`move_nodes`, keep its name + suffix ` · before`), put the new frame at the baseline frame's position inside the flow section, name it with `proposedName`.
4. Update `screen-map.json`: `currentId`, `status: "built"`.
5. Missing mandatory states listed in the plan (approved) → build them now and add entries with `baselineId: null` to `extras`.

Section: keep the flow's section, rename it `FL-NN · <Flow name>`; resize to fit. Sections that mix functions are split as the plan says.

## 3. Links

- Re-attach connectors whose ends pointed at archived frames to the new frames (connector gotcha in figma-agent-tools: create without label, set a short label after).
- Shared screens (picker, paywall, language used by several flows): build once, link from the other flows, mark the other baseline entries `shared` with the target `currentId`.
- Update the text flow / prototype links if the file has them (`set_interactions`).

## 4. Self-audit

1. Rescan the flow's page → `inventory.current.json` (same `pages` as the baseline).
2. `parity.py … --flow FL-NN`. Fix every `missing`, `CTA-LOCAL`, `CTA-MIRROR` and clear warnings yourself; questions that need a decision go to the user.
3. `audit_design{rootId: <section>}` + `stress_test` on the masters; fix Blockers.

## 5. Report ◆

Screenshot the section (and 1–2 key screens at full size), the parity counts and anything left open. `project.md`: flow status `review`. After the user approves: `done`, then propose the next flow.
