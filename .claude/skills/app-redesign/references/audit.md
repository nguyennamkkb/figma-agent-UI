# `/app-redesign audit [FL-NN]`

Read-only until the user says yes. No argument → whole file.

## 1. Progress

From `project.md` + `screen-map.json`: flows done / in review / todo, entries still `todo`, open questions. If the baseline does not exist yet, stop and point to `start`.

## 2. Rescan and compare

1. `scan.js` mode `scan`, same `pages` as the baseline (add the pages the redesign created for flows, never Explore or Archive), `savePath: …/inventory.current.json`.
2. `python3 SKILL_DIR/scripts/parity.py inventory.baseline.json inventory.current.json --map screen-map.json --images image-map.json [--flow FL-NN]`.
3. Read `parity-report.md`. Verdicts per baseline screen:

| Verdict | Meaning | Action |
|---|---|---|
| covered | a current screen carries it (pinned or matched by content) | none; weak matches (score < 0.45) → look and pin in `screen-map.json` |
| shared | carried by another flow's screen that this flow links to | none |
| elsewhere | carried by another flow's screen with no link from this flow | add the connector, or pin as shared if the link exists in another form |
| duplicate | identical to another baseline frame | none |
| dropped | removed on purpose (`status: "dropped"`, note) | confirm the note has the user's reason |
| missing | nothing carries it | build it (the state/screen named in the row) |

Matching: pinned `currentId` first; otherwise text similarity (after `copyMap`), shared image hashes, component names; a baseline state feature (Loading, Toast, Dialog, Downloading, Saved, Empty, Sheet) must exist in the candidate or the score halves. Sections are mapped by majority (override in `screen-map.json` → `sections`).

4. CTA and image codes:

| Code | Level | Rule |
|---|---|---|
| CTA-LOCAL | error | hand-built button frame → Button instance of the right Style |
| CTA-MIRROR | error | diagonal bands on a non-Purchase button |
| CTA-PAY | warn | money action (purchase, subscribe, unlock, upgrade, paywall Continue) not on `Style=Purchase` |
| CTA-DIALOG | warn | gradient button inside a dialog → solid dialog style |
| CTA-DESTRUCTIVE | warn | Discard/Delete/Log out not on `Style=Destructive` |
| CTA-MULTI | warn | more than one Primary/Purchase/Generate outside dialogs |
| CTA-COST | warn | a Disabled button shows a cost/number |
| IMG-SOURCE | warn | a hero still shows the baseline image (not regenerated) — fine if listed in `image-map.json` → `keep` |
| IMG-UNAPPROVED | info | a new hero image is not an approved entry of `image-map.json` |

Heuristics can be wrong: open the screen before reporting a warning as a defect.

## 3. Quality

`audit_design{rootId: <flow section>}` for each flow in scope and `stress_test` on one master per archetype. Report Blockers first.

## 4. Report and fix

Answer with: counts table, the `missing` list, errors, warnings that you confirmed, quality Blockers, and the next step. Ask *"Vá các lỗi này không?"*. On yes: fix (same rules as `build.md` §2–3), rescan, rerun parity, report again.

## 5. Handoff ◆ (whole file, every flow `done`, 0 missing, 0 errors)

1. `handoff.md` in the project folder: baseline → current table (codes, names, ids), copy changes, dropped items with reasons, components and tokens list.
2. `set_dev_status{READY_FOR_DEV}` on the flow sections; `annotate` where behaviour needs a note (animations, conditions).
3. Ask before deleting `Archive · Before redesign` and the Explore leftovers.
4. `project.md` `Status: handed off`.
