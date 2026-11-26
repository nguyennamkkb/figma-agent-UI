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

The full list lives in `figma-ui-flow/references/knowledge/traps.md` (one log for every skill; add new traps there). Read it before the first `render_tree`. The ones that bite most when copying a picture: text outside auto layout, `color` on a multi-colour `svg`, SVG `<pattern>`, no rich text, rows past the edge, two-size numbers on `BASELINE`, a width inside auto layout without `FIXED`, long single-line copy, muse keying on green, margins around generated images.
