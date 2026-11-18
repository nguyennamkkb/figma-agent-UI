# Archetypes — default layer stacks and ratios

Layers are listed bottom → top. Ratios refer to the archetype's own box (W × H). Start from the stack, then let the reference's `decode.json` override it.

## A1 Promo banner (horizontal, ≈ 3:1, e.g. 328 × 110)

| # | Layer | Kind | Recipe |
|---|---|---|---|
| 1 | Frame, radius ≈ 0.18 H, gradient lead → light | Native | glass stroke 3 |
| 2 | Scene background | Scene | filter vivid-cool |
| 3 | Texture | Scene | COLOR_BURN, filter desaturated |
| 4 | Scene copy rotated 180°, opacity 0.6 | Scene | breaks repetition |
| 5 | Glow under the text | Native | `glow` ≈ 0.55 H |
| 6 | Title (italic display ≈ 0.18 H) + subtitle (≈ 0.09 H) + CTA (H ≈ 0.29 H) | Text / Native | CTA two bands |
| 7 | Subject right side, 35–40% of W, bleeds top/right 10–15% | Cut-out | `colorWrap`, faces left |
| 8 | 3–4 sparkles | Native | SCREEN |

## A2 Popup with illustrated header (e.g. rate app, reward)

| # | Layer | Kind | Recipe |
|---|---|---|---|
| 1 | Header container radius 28, palette gradient | Native | glass stroke |
| 2 | Pattern at 10% (white-out filter) | Scene | |
| 3 | Header title as a styled word-mark (italic caps) | Text or vector | |
| 4 | Subject on the header's right, ≈ 0.5 W, bleeds above the header card by ≈ 30% of its height (decode `breaksCard`) | Cut-out | ground shadow optional |
| 5 | White sheet inset 8, radius 24, top at ≈ 0.33 H | Native | |
| 6 | Title (with an accent word in the palette colour), body muted, control (stars / options), CTA two bands | Text / Native | |
| 7 | Close button top-right outside the sheet, white α0.06 | Native | |

## A3 Hero / thumbnail illustration (portrait 9:10, e.g. 360 × 408)

| # | Layer | Kind | Recipe |
|---|---|---|---|
| 1 | Solid lead colour | Native | |
| 2 | Scene (stage, grid floor, light room), shadows +0.5 | Scene | |
| 3 | Scene copy rotated 90°/180° at 0.5 | Scene | depth texture |
| 4 | Device / stage object with HARD_LIGHT + COLOR_DODGE uplight | Cut-out or Native | |
| 5 | Floating UI cards (chat bubbles…) on a rotation ladder, glass | Native + Text | `glass`, rotated |
| 6 | Light streaks COLOR_DODGE + uplight SCREEN | Native | |
| 7 | Subject (mascot) on the stage, ≈ 0.5 W | Cut-out | ground shadow |
| 8 | Top haze: 2 glows + 3–5 beams LINEAR_DODGE | Native | |
| 9 | Fade to page at the bottom (start 0.8) | Native | `fade` |

## A4 Object cluster thumbnail (landscape, e.g. 360 × 220)

Scene backdrop (or none) + main cut-out (phone, product) + mascot cut-out in an ALPHA mask group + 4–6 small 3D accents (chat bubble, coin, heart), each with a soft tinted drop shadow (`#0A2D5C` α0.1, (4, 4), blur 16), placed on a loose ring around the subject, rotations −15…+15°.

## A5 Coupon / discount ticket (e.g. 328 × 180)

| # | Layer | Kind | Recipe |
|---|---|---|---|
| 1 | Ticket shape as ALPHA mask, radius 24, notches Ø 40 at mid-height | Native | `ticket` mask:true |
| 2 | Scene (confetti / gradient bokeh), saturation +1 | Scene | |
| 3 | Frost layer white α0.01 + BACKGROUND_BLUR 4 | Native | smooths the scene |
| 4 | Confetti cut-outs at the edges | Cut-out | |
| 5 | Label "1000 Credits" with icon (0.13 H) | Text | tinted shadow |
| 6 | Display number ≈ 0.5 H + rotated "OFF" | Text | gradient fill + shadow |
| 7 | Old price α0.5, new price solid | Text | |
| 8 | Reassurance line outside the ticket, muted | Text | |

## A6 Topic card (tilted, e.g. 184 × 204, used in pairs)

Gradient fill (bright 3-stop or warm 2-stop) · color blob at the bottom-left (blur 100–110) · 3D object illustration top area, cropped by the card · title + subtitle + round action chip at the bottom · rotation ±10–15°, two cards overlapping by ≈ 20% with glass bubbles between them.

## Picking an archetype for a new slot

| Slot shape | Archetype |
|---|---|
| W/H ≥ 2.5 | A1 |
| Modal with a header | A2 |
| W/H 0.75–1.0, storytelling | A3 |
| W/H 1.4–1.8, product focus | A4 |
| Price / discount | A5 |
| Grid of categories | A6 |
