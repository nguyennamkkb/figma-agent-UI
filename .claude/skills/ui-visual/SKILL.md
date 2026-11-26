---
name: ui-visual
description: Professional UI visuals in Figma — banners, promo/VIP cards, popups with an illustrated header, hero and thumbnail art, coupons, topic cards, empty/success art. Measures a reference visual's style DNA and layer recipe instead of guessing, decides per layer what is AI-generated (scene or cut-out), native vector/effect or live text, generates the pieces through asset-generator, and composites them with filters, blend modes, masks, glows, glass strokes and frame-breaking subjects, then checks a QA rubric. Commands — `/ui-visual clone REF [L1-L4] [changes]`, `/ui-visual create BRIEF [ref]`, `/ui-visual extract REF`. Use when the user wants a visual "like this one", "sao chép visual này nhưng đổi…", "làm banner/popup/coupon theo phong cách này", "tạo ảnh minh hoạ ghép nhiều lớp", "phân tích visual". Not for whole screens (figma-ui-flow, screen-from-image).
---

# ui-visual — measure, decompose, generate, composite, prove

A premium UI visual is never one generated picture. It is a stack: an AI scene graded with image filters, textures in blend modes, light painted natively (glows, beams, sparkles), glass cards with gradient strokes, live text, and a cut-out subject that breaks the frame. This skill rebuilds that stack on purpose, one decision at a time.

Let `SKILL_DIR` be this folder. Answer the user in their language (Vietnamese when they write Vietnamese).

## 1. Hard rules

1. **Measure before you describe.** Every reference that is a Figma node is read with `scripts/decode.js` (execute_code + `savePath`) before any claim about its colours, blends or proportions. An image-only reference goes through `style-direction/scripts/extract_palette.py`; its values are marked *estimated*.
2. **Text is never generated.** Titles, prices, numbers, CTA labels are live Figma text. Light, glow, sparkles and geometric shapes are native. AI makes only scenes and cut-out subjects (`references/layer-taxonomy.md`).
3. **Proportions, not pixels.** Every measured value is turned into a ratio of its container (`scripts/ratios.py`) and recomputed for the target slot.
4. **Change level is fixed first.** `L1` reskin · `L2` re-subject · `L3` recompose · `L4` new-in-style (`references/decode-checklist.md` §0). It decides what may move.
5. **No borrowed identity.** A clone keeps the style DNA, never the source brand's mascot, logo, photos or copy — those are replaced in every level except an explicit internal L1 of the user's own asset.
6. **Image MCP fixed at intake.** Both gemini and muse on → ask which one in step 0, before any work, and use it for every layer (`asset-generator` → "Image MCP — pick one before any work"). Where the steps say Gemini / `image_generate` / `refImagePath`, read the chosen MCP's call and reference parameter.
7. **Gates (◆) stop the command.** Do not continue past a gate in the same turn.
8. **Every piece passes its own check** before compositing (asset QC in `references/prompt-blocks.md` §4), and the whole passes `references/qa-rubric.md` before handoff.
9. Scratch work on the canvas is removed after verification; the user's existing frames are never edited unless named as the target. `node.clone()` parents the copy to the **current page**, not the reference's parent: move it next to the reference (`parent.appendChild(copy)`) and check the page before compositing. A page switched inside `execute_code` does not carry to the next tool call: pass `page` to `render_tree` / `execute_code`, then verify the created node's page. In `render_tree`, text inside a frame without auto layout fails; wrap copy in an auto-layout frame placed absolutely.

## 2. Project folder (in the repo, outside this skill)

```
visuals/<slug>/
  brief.md          level, slot, copy, constraints, decisions, status        (template: references/recipe-template.md §1)
  decode.json       decode.js on the reference (savePath)
  ratios.md         ratios.py on decode.json (+ --target for the new slot)
  recipe.md         style DNA + layer table + variation plan                 (template: references/recipe-template.md §2)
  assets.md         AST-NN entries with prompts                              (references/prompt-blocks.md)
  assets/raw/       image_generate outputs
  assets/           cut-out PNGs (remove_bg.py) and graded scenes
  qa.md             rubric results, screenshots referenced by path
```

## 3. The pipeline (8 steps, shared by all commands)

| # | Step | Output | Gate |
|---|---|---|---|
| 0 | Intake: level, slot, copy, constraints | `brief.md` | ◆ only if a user-only answer is missing |
| 1 | Read the reference: eye path, light, depth, DNA; run `decode.js` | `decode.json`, DNA section of `recipe.md` | |
| 2 | Decompose every layer → Scene / Cut-out / Native / Text, with blend, filter, mask, effect | layer table in `recipe.md` | |
| 3 | Variation plan: keep / change / flex; new subject silhouette check; identity check | variation section in `recipe.md` | ◆ approve plan (L2+) |
| 4 | Ratios recomputed for the target slot | `ratios.md` | |
| 5 | Asset plan: one `AST-NN` per AI layer, prompt from blocks | `assets.md` | |
| 6 | Generate → cut out → QC, hero asset first, then it becomes `refImagePath` | `assets/` | ◆ approve hero asset |
| 7 | Composite bottom → top in Figma (`render_tree` + `scripts/compose.js`) | the visual | |
| 8 | QA rubric, side by side with the reference; fix the specific layer | `qa.md` | ◆ handoff |

The questions to ask yourself at each step are in `references/decode-checklist.md`. Do not skip them; write the answers into `recipe.md`.

## 4. Commands

### `/ui-visual extract <ref>`
Steps 0 (slot = the reference's), 1, 2, 4 → `recipe.md` + `ratios.md`. Ends with a short summary: DNA in 5 lines, the 3 things that make it look premium, the layer count by type. No generation, no canvas writes.

### `/ui-visual clone <ref> [L1|L2|L3|L4] [changes]`
Full pipeline. Default level `L2` when the user says "đổi chút" without detail; ask (◆) when the change touches layout or subject and is unclear. Build the clone next to the reference (`h.freeSpot()` or the slot the user names), never on top of it.

### `/ui-visual create <brief> [ref]`
Full pipeline at `L4`. Without a reference, pick the archetype (`references/archetypes.md`) and the style through `style-direction` (one direction, or three to choose from when the brief is open), then run steps 2–8 on that archetype's default layer stack.

## 5. Where the details are

| Need | File |
|---|---|
| Self-questions per step, change levels | `references/decode-checklist.md` |
| Layer decision tree, what AI cannot do well | `references/layer-taxonomy.md` |
| Native recipes: glass stroke, glow, beam, sparkle, color blob, CTA 2-band, ticket, fade, ground shadow, color wrap, image grading | `references/blend-recipes.md` |
| Archetypes: layer stack + ratios for banner, popup, hero, thumb, coupon, topic card | `references/archetypes.md` |
| AST entry, style block, negative block, asset QC, regeneration table | `references/prompt-blocks.md` |
| QA tests and pass marks | `references/qa-rubric.md` |
| brief.md / recipe.md templates | `references/recipe-template.md` |
| Cut-out mechanics, key colours, `remove_bg.py` | `asset-generator` Part B |
| Taste gate, coverage, composite split | `asset-generator/references/style-library.md` §1, §3, §5 |

## 6. Scripts

| Script | Run | Does |
|---|---|---|
| `scripts/decode.js` | `execute_code` body; set `OPTIONS.rootId`; pass `savePath: visuals/<slug>/decode.json` | Layer tree with boxes, ratios to the root, fills (solid / gradient stops / image filters), strokes, effects, blend, masks, rotation, overflow + `breaksFrame` (escapes the root) + `breaksCard` (escapes a sibling card it overlaps), text specs; summary with palette shares, blend and effect counts, fonts |
| `scripts/ratios.py` | `python3 ratios.py decode.json [--target 360x200] [--out ratios.md]` | Turns the measurements into rules (font ÷ height, blur ÷ size, stroke ÷ height, radius ÷ short side, subject coverage and overflow, rotation ladder) and recomputes them for the target |
| `scripts/compose.js` | `execute_code` body; set `OPTIONS.parentId` and `OPTIONS.ops` | Ops: `filter`, `blend`, `glow`, `blob`, `beam`, `sparkle`, `glassStroke`, `glass`, `groundShadow`, `colorWrap`, `ticket`, `fade`. Returns the created/changed id per op, errors per op without stopping the batch |

Images reach the canvas through `render_tree` (`image` node, `src` = absolute local path); `compose.js` then works on their node ids. Read a script file and paste its body into `execute_code` with `OPTIONS` filled in; do not edit the script itself per run.
