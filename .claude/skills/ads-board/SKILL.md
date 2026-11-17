---
name: ads-board
description: Build and maintain an "Ads" board in Figma that shows where ads appear in an app's flows, version by version (e.g. First Open V1.7 → V2.0) — one section per version with an ads row and a no-ads row on a fixed column grid, plus a shared Ads Kit (Native / Banner / Native Full / Interstitial components, coded assets). Works from a source folder kept inside the skill (sources/<flow>/: rules.md + one YAML spec and one wireframe image per version); ships with the First Open source (V1.7.0–V2.0.0). Use when the user asks to draw/redraw all versions or one named version of an ads flow, add a new version, compare versions, or says "vẽ trang Ads", "vẽ lại bản V1.9", "thêm phiên bản mới", "luồng có quảng cáo / không quảng cáo", "ads-board". Figma mechanics come from figma-agent-tools; screen quality bar from figma-ui-flow.
---

# ads-board — ads flow board, version by version

The board is a rendering of a **source folder inside this skill**; nothing is drawn from memory or from the original flow document. Ad unit ids are not part of the board.

```
sources/<flow>/           e.g. sources/first-open/ (shipped: V1.7.0, V1.8.0, V1.9.0, V2.0.0)
  rules.md                project rules: page, section and Kit ids, content keys → assets, project decisions
  specs/<version>.yaml    screens, edges, off-flow, notes of one version (fixed once approved)
  wireframes/<version>.png  the version's flow diagram + wireframes, image only
```

| Need | Read |
|---|---|
| The First Open source: ids, content keys, decisions, 4 specs, 4 wireframes | `sources/first-open/` |
| Spec format, writing a spec from a wireframe image | `references/spec-format.md` |
| Page and section layout, rows, columns, arrows, notes | `references/layout-grid.md` |
| Names of screens, layers, assets, sections | `references/naming.md` |
| Screen types → how each screen is built (with and without ads) | `references/archetypes.md` |
| Ads Kit: components, variants, tokens, assets, screen masters | `references/ads-kit.md` |
| Plugin helpers to build a section | `references/builder.md` |
| Diff two versions | `scripts/spec_diff.py` |

Always read `sources/<flow>/rules.md` first. A new flow (another module, another app) gets its own `sources/<flow>/` folder with the same three parts: its ids and decisions override the defaults of this skill.

## Page structure (fixed)

| Order | Section | Content |
|---|---|---|
| 1 | `Legend` | Naming rules, row meaning, note colours, arrow labels |
| 2 | `Ads Kit · components` | assets, backgrounds, ad components, screen masters, `ad/cta` token |
| 3 | `Version matrix` | screen × version table: ad format + layout per cell, changed cells highlighted |
| 4… | `<NN> · <Flow> <version>` | one per version, stacked top → bottom oldest → newest |

## Workflows

Gate = show the user a short table and wait for "ok" before drawing.

### A. Build everything
1. Read `rules.md` and every spec. A spec with `TODO` is not buildable: finish it from its wireframe image first (`spec-format.md`).
2. Ads Kit once (`ads-kit.md`), then Legend.
3. Each version section (`layout-grid.md`): row 1 ads flow → row 2 no-ads flow → arrows → notes → off-flow sub-section. Screenshot the section after each version.
4. Version matrix last.

### B. Build or rebuild one version
1. Read `rules.md` and only that version's spec. Reuse the Kit; never touch other sections.
2. Section exists → clear its children except `Title`, rebuild in place (keeps the section id and its position). Missing → create it at the next slot of the stack.
3. Update that version's column in the Version matrix.

### C. Add a new version
1. The user provides the new flow as an image (screenshot or export of the diagram and wireframes). Save it as `wireframes/<version>.png`; never keep or read the source document format.
2. Write `specs/<version>.yaml` by reading the image (`spec-format.md` → "Writing a spec from an image"), starting from a copy of the previous spec.
3. `python3 scripts/spec_diff.py specs/<prev>.yaml specs/<new>.yaml [--map 101=A1,…]` → **Gate:** spec table + diff.
4. Missing ad format, Native layout or screen type in the Kit → add it to the Kit (and to the references) first.
5. Create the section below the last version. Unchanged screens: clone from the previous version's section (both rows). Changed or new screens: build from the screen masters.
6. Yellow note "Thay đổi so với <prev>" from the diff; add the column to the Version matrix; add new ids to `rules.md`.

### D. Change an existing version
Edit the spec (and `rules.md` if a decision changes), then rebuild only the affected screens by name (both rows) and their arrows. Never hand-edit the board without updating the source folder in the same turn.

## Rules that always apply
- Frame names are exactly the spec's names; see `naming.md`.
- Row 2 stays aligned to row 1's columns; ad-only screens leave an empty column crossed by the arrow.
- A screen with a regular Native ad always has a `· No Ads` twin in row 2.
- Inconsistencies found in a wireframe are never silently fixed: build what the image says, record it in the spec's `notes`, show it as a yellow note, or ask.
- Screen layout rules of the project still apply (CTA pinned bottom, no orphan words, honest copy, no amber strokes).
- After each section: screenshot it, check arrows are attached and no screen overlaps.
