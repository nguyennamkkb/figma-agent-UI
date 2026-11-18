# Decode checklist — the questions behind every step

Answer each question in `recipe.md` in one line. "Not sure" is allowed only with the reason and the check that would settle it.

## §0 Intake (step 0)

### Change level

| Level | Name | Keep | Change | Typical ask |
|---|---|---|---|---|
| **L1** | Reskin | layout, subject, DNA | colours, copy | "đổi màu tím, đổi chữ" |
| **L2** | Re-subject | layout, DNA | subject / mascot / objects | "giữ banner, thay robot bằng con mèo" |
| **L3** | Recompose | DNA | layout, size, subject | "làm bản popup dọc theo style này" |
| **L4** | New in style | DNA only | everything | "bộ visual cho app fitness theo style này" |

### Questions
1. Which archetype is the output (banner, popup header, hero, thumb, coupon, topic card, other)? → `archetypes.md`.
2. Slot size in pt and the device scale; is the slot fixed or does it stretch (width FILL)?
3. What surrounds it: light or dark surface, other cards, safe area? A visual on white needs its own edge (stroke, shadow or fade).
4. Exact copy: title, subtitle, CTA, numbers. Longest language? Plan for +30% length.
5. Brand constraints: required colours, existing mascot, fonts, logo usage.
6. Which answers can only the user give? Ask those (◆); infer the rest and write the assumption.

## §1 Read the reference (step 1)

### Visual reading
1. **Eye path:** what is seen 1st, 2nd, 3rd? (usually subject → number/title → CTA)
2. **Premium factors:** name three concrete techniques (e.g. glass stroke, light beams in LINEAR_DODGE, subject breaking the frame).
3. **Light:** source position, colour, hardness; shadow direction. Is the light consistent across all pieces?
4. **Depth:** how many planes (backdrop → mid → subject → foreground)? What separates them (blur, scale, opacity, overlap)?
5. **Motion cues:** italic type, rotated cards (angles), diagonal beams, particles.
6. **Colour structure:** 60/30/10 split, lead colour, where the accent sits, gradient directions.
7. **Type roles:** display (shock number / italic promo), UI (labels), size ratio title ÷ body.
8. **Render style:** 3D clay, glossy 3D, flat vector, photo, line art. Same for all pieces?
9. **Edges:** radius family, strokes, notches, frame breaks.

### Technical reading (`decode.js` summary + layers)
1. Which layers are images, which are vectors, which are text? (`summary.images`, `counts`)
2. Blend modes in use and on what (`summary.blends`, layer `blend`).
3. Image grading: `fills[].filters` per image layer — which way was each picture pushed?
4. Masks and boolean shapes (`mask`, `booleanOp`) — what shapes the pictures?
5. Effects: blur radii vs. layer size, background blur on glass, shadow colour (tinted or black?).
6. `breaksFrame: true` (escapes the root) and `breaksCard` (escapes the card it sits on) — what breaks out, by what share of its own size?
7. Gradient strokes on cards/buttons (strokes with alpha stops 0.5 → 0 → 0.5 = glass edge).

## §2 Decompose (step 2)

For each layer bottom → top, fill one row of the layer table:

`# · name · kind (Scene | Cut-out | Native | Text) · source (AST-NN / recipe / copy) · blend · opacity · filters · mask · effects · notes`

Questions per layer:
1. Does it carry text or numbers? → Text.
2. Is it light (glow, beam, sparkle, rim) or pure geometry? → Native (`blend-recipes.md`).
3. Is it transparent / glass / liquid / smoke? → Native build, not a cut-out (`layer-taxonomy.md` §3).
4. Does it fill its box edge to edge with no needed transparency? → Scene.
5. Is it a subject over other layers? → Cut-out.
6. Must it match another piece (same mascot, same object family)? → note the `refImagePath` chain.
7. Can one AI layer replace several reference layers without losing control? Merge only if no layer needs its own blend or motion.

## §3 Variation plan (step 3)

1. **Keep list (DNA):** palette hexes, gradient directions, radius family, stroke recipe, light recipe, type families, render style.
2. **Change list (content):** subject, copy, accent objects, colours (L1).
3. **Flex list (composition):** size, position, rotation ladder, number of accents — what may move to fit the new slot.
4. **Silhouette check:** does the new subject occupy the same shape as the old one (round ↔ round, tall ↔ tall)? If not, which layout element moves to compensate?
5. **Hierarchy check:** after the change, is the eye path still subject → title → CTA? Does the title still sit on the calm side of the picture?
6. **Contrast check (planned):** text over picture needs a calm zone or a color blob/scrim behind it.
7. **Identity check:** nothing of the source brand remains (mascot, logo, photo, slogan, exact illustration). For L1 on the user's own asset, write "own asset".
8. **Direction check:** the subject looks or points toward the title / CTA.

◆ For L2–L4, show the variation plan and the subject idea (one sentence + silhouette) and wait.

## §4 Ratios (step 4)

Run `ratios.py decode.json --target WxH`. Then ask:
1. Which values must not scale linearly? (stroke ≥ 1 px, text ≥ 11 pt, tap target ≥ 44 pt)
2. Does the subject still overflow by the same share? Does the overflow hit a neighbour or the screen edge?
3. When the aspect ratio changes (L3), which axis drives each ratio (width for subject coverage, height for type)?

## §5–§8

Prompts and asset QC: `prompt-blocks.md`. Composite order: `archetypes.md` + `blend-recipes.md`. QA: `qa-rubric.md`.
