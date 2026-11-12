---
name: style-direction
description: Pick the visual style of a mobile app (iOS, Android, or both) from a named style, a reference image or Figma file, or a bare product brief — measure the style's DNA with recorded confidence instead of guessing, propose 3 directions (Safe / Balanced / Bold) that work on every target platform, and hand off one Style brief plus a DTCG token file to figma-ui-flow. Use for "make it look like this", "glassmorphism style", "match this screenshot", "find a style for my app", "phong cách cho app", "làm giống ảnh này", "chọn style cho iOS và Android". Token setup and screen building continue in figma-ui-flow.
---

# style-direction — choose the style, then hand off

Act as a mobile Art Director. **Decode a style's principles; never copy its layout, content, logos or illustrations.** This skill ends at an approved direction. Tokens are imported and screens are built by **figma-ui-flow** (Stage 2 onward, three-pass build loop, `SCR-NN` naming). Let `SKILL_DIR` be the folder of this file.

## 1. Start

| Input | Mode |
|---|---|
| A named style (Swiss, glassmorphism, neo-brutalism, Japanese minimal…) | **A** |
| A reference image, link or Figma file | **B** |
| Only a product brief | **C** |

Ask at most 3 questions, in one message, only for what is missing: what the app does and for whom, **platform (iOS / Android / Both)**, **theme (Light / Dark / Both)**. Unanswered → assume, and write the assumptions at the top of the Style brief.

Write **3 feeling words** (A/B: your first reaction to the style; C: from the product goal). They are the benchmark for every later decision.

## 2. Extract the DNA — measured, not guessed

Every value gets a source and a confidence: **measured** (read from data), **estimated** (computed from an image), **guessed** (judgement). Read `references/extraction.md` for the procedure.

- **Figma file:** read real values with `get_design_system` and `get_node` (fills, fonts, sizes, radius, spacing) → measured.
- **Image:** `python3 SKILL_DIR/scripts/extract_palette.py <image> --points <device width>` → colours with area share, px→pt/dp scale, contrast of the top pairs → estimated. Measure spacing and radius on the image with that scale.
- **Named style / no source:** describe it from knowledge → guessed.
- Snap to scales (spacing on the 4-grid, type on a ratio); keep the raw value next to the snapped one.
- **Guessed values never enter tokens without the user's confirmation.**

Fill the DNA table: colour (ratio, saturation, where the accent lives), type (scale ratio, weights, tracking), shape (radius, strokes, geometric/organic), density (spacing, rhythm), depth (flat/shadow/blur), material (grain, gradient, imagery), motion. Then keep **2–3 principles**; everything else may change for the product.

## 3. Signature move

Exactly one memorable element (a card shape, a way to show data, a transition, a type detail). Everything around it stays restrained.

## 4. Three directions → gate

| Direction | Meaning |
|---|---|
| **Safe** | platform conventions first, light touch of the style |
| **Balanced** | the default recommendation |
| **Bold** | pushes the style, trade-offs stated |

Each: name, 3 feeling words, principles kept, signature move, palette (hex + role), font pairing per platform, radius/spacing, risks. **Every direction must work on every target platform**: the style lives in the brand layer (colour, type personality, shape, material, signature); navigation, controls, touch targets and system type follow each platform — see `references/platform-mapping.md`. A direction that only works by breaking one platform's navigation is rejected.

Prove each direction on **one hard screen** (dense list or form) as a figma-ui-flow Sketch, not on the hero screen.

**Gate:** stop for the user to pick or mix. Unattended → Balanced, and say so.

## 5. Verify, then hand off

1. Rebuild one sample from the chosen direction's tokens (a card or list row), screenshot it next to the reference (mode B), fix tokens until the principles read the same. Fix tokens, not layers.
2. Squint test and 5-second test on the Sketch; contrast ≥ 4.5:1 for body text in each chosen theme.
3. Output **one Style brief** (into the `Brief · <Product>` frame on `🏠 Cover`, or `spec/STY-01.md`): assumptions, 3 feeling words, DNA table with source + confidence per value, principles kept, signature move, chosen direction + why the others were rejected, platform notes.
4. Output **`tokens.json`** (DTCG, Primitive → Semantic, modes = the theme choice), checked with `python3 ../figma-ui-flow/scripts/check_tokens.py tokens.json`, ready for `import_tokens`.
5. Continue in **figma-ui-flow Stage 2**.

## Pitfalls

- Copying the reference instead of its principles.
- Eyeballed hex codes and sizes presented as facts — always state the confidence.
- One direction per platform — the brand layer is shared; only the platform layer differs.
- Proving a style on the hero screen only.
- Effects (glass, gradient, shadow) used "for style" with no role.
