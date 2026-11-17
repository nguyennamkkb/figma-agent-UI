---
name: ads-board
description: Build and maintain an "Ads" board in Figma that shows where ads appear in an app's flows, version by version (e.g. First Open V1.7 → V2.0) — one section per version with an ads row and a no-ads row on a fixed column grid, plus a shared Ads Kit (Native / Banner / Native Full / Interstitial components, coded assets). Works from a source folder kept inside the skill (sources/<flow>/: rules.md + one YAML spec and one wireframe image per version); ships with the First Open source (V1.7.0–V2.0.0). Invoke as `/ads-board <version>` (e.g. `/ads-board 1.6.0`), `/ads-board <flow> <version>`, `/ads-board all`, `/ads-board diff <v1> <v2>`. Use when the user asks to draw/redraw all versions or one named version of an ads flow, add a new version, compare versions, or says "vẽ trang Ads", "vẽ lại bản V1.9", "thêm phiên bản mới", "luồng có quảng cáo / không quảng cáo", "ads-board". Figma mechanics come from figma-agent-tools; screen quality bar from figma-ui-flow.
---

# ads-board — ads flow board, version by version

The board is a rendering of a **source folder inside this skill**; nothing is drawn from memory or from the original flow document. Ad unit ids are not part of the board.

```
sources/<flow>/           e.g. sources/first-open/ (shipped: V1.5.0, V1.6.0, V1.7.0, V1.8.0, V1.9.0, V2.0.0)
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
| Ads Kit: components, variants, tokens, assets | `references/ads-kit.md` |
| Base screens of the app (where each screen type is copied from) | `sources/<flow>/rules.md` → "Base screens" |
| Plugin helpers to build a section | `references/builder.md` |
| Diff two versions | `scripts/spec_diff.py` |

Always read `sources/<flow>/rules.md` first. A new flow (another module, another app) gets its own `sources/<flow>/` folder with the same three parts: its ids and decisions override the defaults of this skill.

## Arguments
| Call | Meaning |
|---|---|
| `/ads-board 1.6.0` or `V1.6.0` | flow = the only folder in `sources/` (ask if several); version normalised to `V1.6.0`. Spec exists → **B** (rebuild that section). No spec → **C** (add the version). |
| `/ads-board <flow> <version>` | same, in `sources/<flow>/` |
| `/ads-board all` | **A** |
| `/ads-board diff <v1> <v2>` | run `spec_diff.py` and show the table, draw nothing |
| `/ads-board matrix` | draw the optional Version matrix (screen × version, changed cells highlighted) from all specs |
| no argument | list the versions in `sources/<flow>/specs/` and which ones have a section on the board (`rules.md`), then ask |

The wireframe image of a new version: use `wireframes/<version>.png` if it is there; otherwise ask the user for the image (screenshot of the diagram + wireframes) and save it there. Never read the original flow document.

## Page structure (fixed)

| Order | Section | Content |
|---|---|---|
| 2 | `Ads Kit · components` | assets, backgrounds, ad components, `ad/cta` token (no masters: screens come from the app's base screens) |
| (3) | `Version matrix` — optional, only on `/ads-board matrix` | screen × version table from the specs; not kept up to date automatically |
| 4… | `<NN> · <Flow> <version>` | one per version, stacked top → bottom oldest → newest |

## Workflows

Gate = show the user a short table and wait for "ok" before drawing.

### A. Build everything
1. Read `rules.md` and every spec. A spec with `TODO` is not buildable: finish it from its wireframe image first (`spec-format.md`).
2. Ads Kit once (`ads-kit.md`); screens are cloned from the base screens of `rules.md`. No Legend on the canvas: the conventions live in `naming.md` and `layout-grid.md`.
3. Each version section (`layout-grid.md`): row 1 ads flow → row 2 no-ads flow → arrows → notes → off-flow sub-section. Screenshot the section after each version.

### B. Build or rebuild one version
1. Read `rules.md` and only that version's spec. Reuse the Kit; never touch other sections. Kit ids of `rules.md` not found on the page → rebuild the Kit first (`ads-kit.md` → "Rebuilding the Kit") and write the new ids to `rules.md`.
2. Section exists → clear its children except `Title`, rebuild in place (keeps the section id and its position). Missing → create it at the next slot of the stack.

### C. Add a version (newer, older or in between)
1. The user provides the new flow as an image (screenshot or export of the diagram and wireframes). Save it as `wireframes/<version>.png`; never keep or read the source document format.
2. Write `specs/<version>.yaml` by reading the image (`spec-format.md` → "Writing a spec from an image"), starting from a copy of the nearest existing version (the next newer one when the new version is older).
3. `python3 scripts/spec_diff.py specs/<older>.yaml specs/<newer>.yaml [--map 101=A1,…]` (always older → newer) → **Gate:** spec table + diff. Skip the gate only when the user already said to draw right away.
4. Missing ad format, Native layout or screen type in the Kit → add it to the Kit (and to the references) first.
5. Create the section at its place in the time-ordered stack (oldest on top) and move the later sections down (`y += height + 400` each). Unchanged screens: clone from the nearest version's section (both rows). Changed or new screens: clone the base screen of their type (`rules.md`) and apply `archetypes.md`. A new onboarding page needs a new `content` key: generate its image in the series style (asset-generator, the previous page as reference), add it to `Ads Kit · backgrounds` with its code prefix and to `rules.md`.
6. Notes: the new version's own `notes` go in its section; the "Thay đổi so với <older>" note always goes in the newer section of the pair. Add the section id to `rules.md`. (Version matrix only if the user asks: `/ads-board matrix`.)

### D. Change an existing version
Edit the spec (and `rules.md` if a decision changes), then rebuild only the affected screens by name (both rows) and their arrows. Never hand-edit the board without updating the source folder in the same turn.

## Rules that always apply
- Frame names are exactly the spec's names; see `naming.md`.
- Row 2 stays aligned to row 1's columns; ad-only screens leave an empty column crossed by the arrow.
- A screen with a regular Native ad always has a `· No Ads` twin in row 2.
- Inconsistencies found in a wireframe are never silently fixed: build what the image says, record it in the spec's `notes`, show it as a yellow note, or ask.
- Screen layout rules of the project still apply (CTA pinned bottom, no orphan words, honest copy, no amber strokes).
- After each section: screenshot it, check arrows are attached and no screen overlaps.
- Copy on screens comes from `rules.md` (content key → image, title, subtitle). A new key gets its copy written there first, checked for orphan words at 360 px.
- Pager: steps follow the order of the onboarding pages with a pager in the version, capped at the Pager component's last step; record the mapping in the spec when pages > steps.
- Finish by updating `rules.md` (section id, new keys) and the memory of the project if any.
