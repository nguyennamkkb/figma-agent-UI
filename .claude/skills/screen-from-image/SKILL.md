---
name: screen-from-image
description: Redraw one or several app screens from an image (screenshot, Dribbble shot, mockup with several phones, a Figma image node) into editable Figma screens as fast as possible — read each screen's function, its auto-layout tree and the emotion of its images first, then build one screen with one render_tree of real content, generated images and library icons; with two or more screens the first (most representative) screen is built and the agent STOPS for approval before drawing the rest. Invoke as `/screen-from-image <image|link> [screens]`. Use when the user says "vẽ lại ảnh này ra Figma", "dựng lại màn hình từ ảnh", "copy UI từ screenshot", "recreate this Dribbble shot", "vẽ lại 3 màn này". Not for a single banner or popup visual (ui-visual), restyling an existing Figma app (app-redesign) or picking a style only (style-direction).
---

# screen-from-image — understand, build one, approve, build the rest

Speed comes from reading the picture well once, then writing each screen in one `render_tree`, not from skipping the reading. Let `SKILL_DIR` be this folder. Answer the user in their language (Vietnamese when they write Vietnamese).

## 1. Hard rules

1. **No intake questions, no canvas survey.** Place the board in free space next to the reference (`h.freeSpot()` or just below the reference image) and start. Ask only when the image or link cannot be opened, or when **both image MCPs are on**: then ask which one to use before step 1 (`asset-generator` → "Image MCP — pick one before any work") and keep it for every screen of the set.
2. **Understand before drawing.** Every screen built has a read sheet (`references/read-sheet.md`): function, auto-layout tree, tokens, image emotion. The tree in the sheet is the tree you send.
3. **◆ First screen gate.** Two or more screens → build only the first screen (the most representative one: usually Home, or the screen holding the most shared blocks), then stop the turn and wait for approval. Never draw every screen in one go. One screen → no gate.
4. **Auto layout everywhere** except what really overlaps (badges, a subject breaking a card, a carousel peeking past the edge). Absolute children are named and listed in the sheet.
5. **Text is live text, icons come from `icon-libraries`, shapes and charts are native.** AI makes only images: mascots, objects, illustrations, photos (`references/build-traps.md` §1).
6. **One image style block for the whole set**, written from the image emotion of the read sheet and reused in every prompt, so all screens look like one app.
7. **Values read from the picture are estimates.** Say so in the report; never claim exact colours or sizes.
8. **No audit by default.** `audit_design` / `stress_test` run only when the user asks.

## 2. The flow

| # | Step | Output | Calls |
|---|---|---|---|
| 1 | **Read the set**: open the image (screenshot the Figma node at scale 1, or Read the file), count the screens, skim all of them for shared tokens, repeated blocks (tab bar, header, card) and the image style block. Write the full read sheet for the first screen only | shared tokens + components list + style block + sheet for screen 1 | 1–2 |
| 2 | **Assets for screen 1**: crop each image from the reference (×3 from a scale-1 screenshot), launch every generation in parallel with the style block + the crop as reference; fetch icons in one `icons.py` run | `assets/` PNGs, SVG markup | parallel |
| 3 | **Build screen 1**: shared blocks that appear on ≥ 2 screens become components first; then one `render_tree` for the screen, image slots at their final size; drop the images in (`fill.image`, `FIT`) as they arrive | the screen | 2–4 |
| 4 | **Look once**: one `screenshot{id, scale: 1}`, compare with the crop of the reference, fix the specific nodes with `update_nodes` | fixed screen | 1–2 |
| ◆ | **Gate** (≥ 2 screens): show the screenshot, the read sheet, the tokens, the style block, the components to reuse and the estimated values. Stop | | |
| 5 | **The rest, after approval**: generate the remaining images in one parallel batch with the approved style block; then screen by screen: read sheet → `render_tree` reusing components and tokens → images → one screenshot → fixes. Anything that breaks the approved set (a new block with no component, an image off-style) is reported in that turn | all screens | 5–8 per screen |
| 6 | **Report**: screens with ids, what was invented because the picture did not show it, estimated values, assets folder | | |

Budget: about 5–8 tool calls per screen, image generation excluded. A screen that needs more is usually missing a read-sheet decision: go back to the sheet, not to trial and error on the canvas.

## 3. Reading the picture fast

- **Mockup shots** (several phones, device frames, tilted screens): find the screen rectangle, ignore the device and the backdrop. A tilted screen is read for structure only; its sizes come from the straight screens or from the target grid.
- **Scale**: target width 393 × 852 (iOS) unless the picture is clearly Android (360 × 800). Factor = 393 / screen width in the picture (315 → ×1.25). Scale every measured value, then snap to 4.
- **Column budget**: top padding + each block height + gaps + bottom padding ≤ frame height. Mockups grow taller once scaled; adjust gaps (16–24) before shrinking content.
- **Unreadable text**: write plausible copy of the same length and list it in the report.
- **What the picture does not show** (end of a scrolling list, status bar, the other tab states): invent consistently with the visible part and list it.

## 4. Where the details are

| Need | File |
|---|---|
| Read sheet template + a full worked example | `references/read-sheet.md` |
| Element → how to build it, image emotion → prompt, traps met on real builds | `references/build-traps.md` |
| `render_tree` vocabulary, sizing rules | `figma-agent-tools/references/render-tree-dsl.md` |
| Cut-out generation, key colours, `remove_bg.py` | `asset-generator` Part B |
| Icons by name (`icons.py`) | `icon-libraries` |
| Full quality pass when asked (audit, stress, handoff) | `figma-ui-flow/references/build-loop.md` §2–3 |
