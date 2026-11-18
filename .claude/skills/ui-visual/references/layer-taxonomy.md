# Layer taxonomy — what each layer is made of

## §1 Decision tree

```
Layer carries text, numbers or a price?            → TEXT      live Figma text (+ gradient fill / shadow natively)
Layer is light: glow, beam, rim, sparkle, bokeh?   → NATIVE    blend-recipes.md (LINEAR_DODGE / SCREEN)
Layer is geometry: card, button, ticket, frame?    → NATIVE    render_tree + compose.js
Layer is glass, liquid, smoke, transparent?        → NATIVE    background blur + gradient stroke (+ IMG in SCREEN)
Layer fills its box, no transparency needed?       → SCENE     asset-generator Part A, graded with filters
Layer is a subject over other layers?              → CUT-OUT   asset-generator Part B + remove_bg.py
Layer is an icon?                                  → NATIVE    icon-libraries (SVG), or CUT-OUT if it must be 3D
```

## §2 Kinds

| Kind | Source | Lives in Figma as | Typical treatment |
|---|---|---|---|
| **Scene** | Gemini, aspect from the slot (crop from the nearest of 1:1 · 4:3 · 3:4 · 16:9 · 9:16) | RECTANGLE with IMAGE fill FILL, inside a clipped frame | `filter` (saturation, temperature, highlights/shadows), sometimes a 2nd copy rotated 180° at 0.5–0.6 opacity to break repetition |
| **Texture** | Gemini or a scene reused | RECTANGLE IMAGE | `blend` COLOR_BURN / MULTIPLY / OVERLAY / SOFT_LIGHT, opacity 0.3–1, filters to kill saturation |
| **Cut-out** | Gemini on a key colour → `remove_bg.py` | image node (PNG with alpha), often in an ALPHA mask group | `groundShadow`, `colorWrap`, frame break, slight `filter` to match the scene grade |
| **Native light** | compose.js | ELLIPSE / RECTANGLE / STAR | LAYER_BLUR, LINEAR_DODGE / SCREEN / COLOR_DODGE |
| **Native shape** | render_tree / compose.js | FRAME / BOOLEAN / VECTOR | gradient fills, `glassStroke`, `glass`, drop shadow tinted with the palette |
| **Text** | render_tree | TEXT | gradient fill on display text, tinted drop shadow, rotation for side labels |

## §3 What AI does badly — build it natively instead

| Want | Why AI fails | Native build |
|---|---|---|
| Glow, halo, rim light around a cut-out | chroma removal cuts it or leaves a key-coloured fringe | `glow` behind the subject + `colorWrap` |
| Glass card, bubble, frosted panel | transparency cannot survive a key colour | `glass` op, or bubble = white 25% + BACKGROUND_BLUR 16 + IMG layer in SCREEN |
| Readable text, numbers, prices | misspellings, unfixable later | TEXT |
| Exact brand colours | the model drifts | grade with `filter`, or tint with `colorWrap`, or a SOLID/GRADIENT layer in COLOR mode over the scene |
| Consistent mascot across many visuals | identity drifts | hero asset approved first, then always `refImagePath` |
| Perfect geometry (ticket notches, stars, rings) | wobbly edges | `ticket`, `sparkle`, boolean ops |
| Soft fade into the page | banding, hard edges | `fade` op (9 eased stops) |

## §4 Merge or split

Split when a piece needs its own blend mode, its own motion (rotation, overflow), its own grade, or must be reused. Merge into one scene only background elements that will never move separately (sky + distant shapes). Composite slots (UI bubbles, chips, cards inside the picture): one AST per generated layer, native UI stays native (`asset-generator/references/style-library.md` §3).
