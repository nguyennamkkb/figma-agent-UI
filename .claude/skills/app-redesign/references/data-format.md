# Project files and formats

All files live in `redesign/<app-slug>/` at the repo root (not in the skill).

## project.md (template)

```markdown
# <App name> — redesign

- Working file: "<Figma file name>" (confirmed <date>; the copy, not the original)
- Original: "<original file name>" (never connected; its links are looked up in the copy, section-link.md)
- Scope: whole app | pilot FL-NN (start with a section link)
- Screen pages: <page names scanned for the baseline>
- Level: L1 | L2 | L3 | L4 (references/levels.md; "assumption" until approved)
- Status: start/1 file confirmed | start/done — level <Ln>, direction <X> approved | build | handed off
- foundations: todo | done (components: Button <id>, …; collections: …)

## Redesign goal
> <verbatim text after /app-redesign start>

| Point | Value | Source |
|---|---|---|
| Feel / style | … | user / assumption |
| Audience | … | |
| Business goal | … | |
| References | … | |
| Constraints | … | |

## Flows
| Flow | Section (current) | Level | Way | Status | Notes |
|---|---|---|---|---|---|
| FL-01 · Splash, Onboarding, IAP | <id> | = project / L1–L4 | = project / as FL-NN / trial <direction> / exception <direction> | todo / trial / review / done | |

## Decisions
- <date> — <decision> (user)

## Open questions
- …
```

## inventory.*.json (scan.js)

```
{ file, scannedAt, pages:[{id,name}],
  designSystem:{ variables, collections[], paintStyles, textStyles, componentSetsOnScannedPages, componentsOnScannedPages },
  sections:[{ id, name, page, parent, junk, x, y, w, h }],
  screens:[{ id, name, type, page, section, sectionId, junk, kind:"screen"|"meta",
             x, y, w, h, flat, nodeCount,
             texts:[string ≤120, ≤40 per screen, visible only, clock "9:41" dropped],
             instances:["Set / Variant" | "Component"]   top-level instances only,
             images:[{ hash, id, name, w, h, hero }]      hero = ≥40% width and ≥25% height of the screen,
             ads:[{ id, name, w, h, y }]                  layers named ad/ads/native…/interstitial/sponsored, or an "Ad" text,
             ctas:[{ id, label, kind:"instance"|"local", set, variant, gradient, fill, effects, mirror, inDialog, w, h }],
             reactions:[{ from, trigger, to, toScreen, navigation }] }],
  connectors:[{ id, name, page, from, to, fromScreen, toScreen, label }] }
```

`kind: "meta"` = smaller than 300×400 or named Title/Note/Label/Header/Container…; `junk` = section or page name matches test/seed/tmp/wiring/archive/backup/old/rip/deprecated/unused. Both are ignored by the analysis and parity.

## screen-map.json (analyze.py draft, edited by hand and by build)

```
{ "level": "L2",                       project level (copied from project.md; parity.py reads it)
  "levels": { "FL-03": "L1" },           per-flow overrides
  "sections": { "<baseline section name>": "<current section name>" },
  "screens": [ { "baselineId", "baselineName", "baselineSection", "flow": "FL-03",
                 "archetype", "code": "SCR-12", "proposedName": "SCR-12 · AI Video Setup · Empty",
                 "currentId": null | "<node id>", "status": "todo|built|shared|dropped", "note": "" } ],
                 L1: currentId = baselineId (restyled in place). L4 merge: status "shared", note "merged into <code>".
                 L3 master: "moves": ["S1","S2","P1"] (levels.md §1.1).
  "extras": [ "<current node id>" | { "id", "why" } ],
  "copyMap": { "<baseline text>": "<new text>" } }
```

`analyze.py` never overwrites an existing `screen-map.json` (it writes `screen-map.draft.json`).

## image-map.json

```
{ "images": [ { "sourceHash", "sourceFile": "images/source/…png", "screens": ["<baseline id>"],
                "newFile": "images/new/…png", "newHash": null|"…", "approved": false, "keepChange": "…" } ],
  "keep": [ "<hash of an image deliberately kept, e.g. user photos or partner logos>" ] }
```

## analysis.json / parity.json

Written by the scripts; read them, do not edit. `parity.json.results[].verdict` ∈ covered, shared, elsewhere, duplicate, dropped, missing; `results[].level` and `results[].order` (text order agreement, L1/L2 only); `issues[].code` per `audit.md` §2.
