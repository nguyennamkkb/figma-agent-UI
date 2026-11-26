# Building it — element choice and traps

## 1. Element → how to build it

| In the picture | Build as | Why / note |
|---|---|---|
| Cards, buttons, chips, dividers, progress bars, rings | native frames and shapes | editable, exact radius and colour |
| Bar or line charts, sparklines | native rectangles / `svg` path | an image chart cannot follow new data |
| Gradients, glows, soft shadows | fill gradient, `effects` | never baked into an image |
| Icons (outline, filled, duotone) | `icon-libraries` `icons.py`, closest name and weight, inline `svg` | one batch per screen; match stroke weight to the picture |
| Mascots, objects, 3D icons, illustrations | AI cut-out (`asset-generator` Part B) with the reference crop and the style block | trim to the alpha bbox, place with `scaleMode: "FIT"` |
| Photos (people, food, places) | AI scene in the slot's ratio | `FILL` into the slot |
| Hatching, stripes, dotted textures | PNG rendered with PIL at 3× | SVG `<pattern>` does not import (§2) |
| Maps, complex backdrops | AI scene or PNG | crop to the slot |
| Avatars | AI portrait, round mask (`radius: 999`) | |
| Status bar, home indicator | leave out unless the user wants device chrome | listed in the report |

## 2. Traps met on real builds

- **Text outside auto layout** (child of a `layout: "NONE"` frame or the page): sized with `textAutoResize`. No `width` → hugs; `width` → wraps. Plugins before 1.6.19 failed the whole tree; on an old plugin wrap such labels in an auto-layout row.
- **`color` on an `svg` recolours every fill and stroke inside it**: leave it out for two-colour icons (a bag with a handle in the background colour) and keep the colours in the markup.
- **SVG `<pattern>`** comes out flat or black: render the texture to a PNG at 3×.
- **No rich text in `render_tree`**: one word in another colour or weight → `execute_code` `setRangeFills` / `setRangeFontName` after the render.
- **Rows past the screen edge** (tabs, peeking carousels): the row `clip: false`, the screen `clip: true`; a carousel is a `layout: "NONE"` frame with side cards at negative or overflowing `x`.
- **Two-size numbers** ("$79" + ".00"): two texts in a `HORIZONTAL` frame, `align: "BASELINE"`.
- **A width inside auto layout needs `widthMode: "FIXED"`**, otherwise the frame hugs and clips absolute children (same for height).
- **Long single-line copy** wraps once real fonts load: check the line width in the sheet (characters × ~0.55 × font size) against the slot.
- **muse `background: transparent` keys on green**: a green subject (fox with leaves, a map) gets flagged; check the edges by eye, or generate on magenta and run `remove_bg.py`.
- **Generated images have margins**: trim to the alpha bbox before placing, or the subject looks smaller than in the picture.
- Emoji inside text render with any font.
