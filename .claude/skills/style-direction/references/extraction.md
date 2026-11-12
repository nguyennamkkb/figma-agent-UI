# Reliable extraction

Goal: every value in the DNA table can be traced to where it came from, and nothing guessed reaches the tokens unconfirmed.

## Confidence levels

| Level | Source | Enters tokens |
|---|---|---|
| **measured** | read from a Figma file (`get_design_system`, `get_node`) or a code/theme file | yes |
| **estimated** | computed from an image with `extract_palette.py` or a measurement with a known scale | yes, after snapping |
| **guessed** | judgement: named style without a source, font identification, motion from a still image | only after the user confirms |

Record each value as `value · raw · source · confidence`, e.g. `radius/card 16 · 15.7 · ref.png card corner · estimated`.

## From a Figma file (best)

1. `get_design_system` → variables and styles: copy colours, text styles, spacing, radius exactly.
2. `get_node{ids, depth: 3}` on one representative screen → fills, font family/size/weight/line-height, padding, gap, radius as used.
3. Count usage roughly (backgrounds vs surfaces vs accents) to get the colour ratio.

## From an image

1. **Scale:** know the device width in pt/dp. iPhone screenshots: 1179 px → 393 pt (@3x), 1290 → 430, 1170 → 390, 750 → 375 (@2x). Android: 1080 px wide ≈ 412 dp (×2.625) or 360 dp (×3), 1440 px ≈ 412 dp (×3.5). Pass it as `--points`.
2. **Colours:** `python3 SKILL_DIR/scripts/extract_palette.py ref.png --points 393 --colors 8`. Output: each colour's hex, area share, lightness, saturation, a role hint (background / surface / text / accent), the scale factor, and WCAG contrast of the main pairs. Crop status bars, photos and illustrations first (`--crop x,y,w,h`) when they would dominate the palette.
3. **Sizes:** measure spacing, radius, type height in px, divide by the scale. Type size from cap height: size ≈ cap height ÷ 0.7.
4. **Fonts:** name 2–3 candidates (guessed) and the traits that matter (geometric/humanist, x-height, width). Choose the token font from the traits.
5. **Snap:** spacing to the 4-grid (2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64), radius to the nearest of the set in use, type to a scale ratio (1.125–1.25 for apps). Keep the raw value.

## Verify

- Rebuild one card or list row with the snapped tokens, screenshot it beside the reference crop at the same scale. Same principles (ratio, rhythm, contrast, radius character)? If not, adjust the tokens.
- Run `check_tokens.py` on the token file; contrast failures are fixed in the Semantic layer, not by editing primitives copied from the reference.
- Do not reproduce the reference's layout, content, logos, illustrations or photos.
