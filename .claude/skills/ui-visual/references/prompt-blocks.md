# Prompt blocks — AST entries, generation and asset QC

Prompts follow `asset-generator` (Part A for scenes, Part B for cut-outs). This file only fixes how a visual's pieces are planned and checked.

## §1 AST entry (one per AI layer, in `assets.md`)

```
### AST-02 · mascot-thumbs-up · Cut-out
Spec: 1:1 · target 130 × 130 pt in A1 slot 328 × 110 · key #00FF00 · ref: AST-01
Layer: #7 in recipe.md · blend NORMAL · filter saturation +0.2 · colorWrap OVERLAY 0.3 · bleed right 12%
Prompt:
  <style block, verbatim>
  <subject: who, doing what, expression, facing which way>
  <camera: angle, lens feel>
  <light: from <side>, matches recipe light>
  <coverage: subject spans N% of the frame, nothing cropped>
  <background: solid flat <KEY NAME> (Part B wording)>
Negative: text, letters, numbers, logo, watermark, UI, frame, glow, halo, rim light in <key colour>, drop shadow, reflection, floor, checkerboard
Status: planned | generated | cut | approved
File: visuals/<slug>/assets/AST-02_mascot.png
```

## §2 Style block

One sentence, pasted verbatim in every prompt of the visual (and of its family):

`<render style> · <material> · <palette with 3–5 hex> · <light: direction, colour, softness> · <detail level> · <mood>`

Example: `glossy 3D render, soft rounded vinyl and frosted plastic, palette #1D80F2 #49D5EE #FFFFFF #903CF6, soft key light from upper left with cool cyan rim from the right, clean medium detail, friendly optimistic tech mood`.

## §3 Generation order

1. **Hero asset first** (the subject that carries identity). ◆ the user approves it.
2. Every later asset of the same family passes `refImagePath` = the approved hero file.
3. Scenes after the subject, so the scene light can be written to match it.
4. Aspect: the nearest supported ratio larger than the slot, crop in Figma (FILL).

## §4 Asset QC (before compositing)

| Check | Pass | Fix |
|---|---|---|
| Edge (open `_preview.png` zoom) | no key-colour or opposite-colour ring | regenerate on another key (`#FF00FF`, `#0000FF`) |
| Light direction | same side as recipe light | rewrite the light line, regenerate |
| Style match vs hero | same material, outline, saturation | add `refImagePath`, repeat style block, regenerate |
| Text/logo in image | none | stronger negative, regenerate |
| Coverage | subject fills the stated share, not cropped unless planned | rewrite coverage line |
| Colour drift | small | fix later with `filter` / `colorWrap`, do not regenerate |
| Silhouette | matches the plan in §3 of decode-checklist | regenerate with pose wording |

Max 3 regenerations per asset; after that, change the approach (split the asset, or build the part natively) and note why in `recipe.md`.
