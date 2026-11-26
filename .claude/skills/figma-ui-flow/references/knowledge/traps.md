# Traps met on real builds — the knowledge log

Things that go wrong **without a clear error**, or with an error that does not name the cause. Error text → cause → fix lives in `troubleshooting.md`; this file holds what was learned on real screens.

**Format of a new entry:** `- **<symptom or trigger>** <cause> → <fix>. *(seen: <date>, <file / screen>)*`. Add the entry here the first time; when the same trap is met a second time, promote it to a rule in the file of its layer (`../process/`, `../standards/`, `../tools/`) and leave this line pointing there. Never delete an entry: a fixed plugin bug stays with the version that fixed it, for users on older builds.

## 1. render_tree and the canvas
*(seen: 2026-11-26, baby-tracker "Gamified Savings" rebuild, 3 screens)*

- **Text outside auto layout** (a child of a `layout: "NONE"` frame or of the page) is sized with `textAutoResize`, not layout sizing: no `width` → it hugs (`WIDTH_AND_HEIGHT`), a `width` → it wraps at that width (`HEIGHT`). Plugins before 1.6.19 failed the whole tree with `set_layoutSizingVertical: node must be an auto-layout frame…`; on an older plugin put such labels in a small auto-layout row (`widthMode: "FILL"` + `textAlign`).
- **`color` on an `svg` node recolours every solid fill and stroke inside it.** A two-colour icon (a bag whose handle is drawn in the background colour, a flag) loses its details: leave `color` out and keep the colours in the markup.
- **SVG `<pattern>` fills do not import reliably** (hatched bars, striped tracks come out flat or black). Render the hatching to a PNG at 3× (PIL) and place it as an `image`; regenerate the PNG when the sizes change.
- **No rich text in `render_tree`.** One word in another colour or weight ("**Save $10** on coffee") → render the text, then `execute_code`: `setRangeFills(start, end, [h.solid(hex)])` / `setRangeFontName` after loading the font.
- **Content that runs past the screen edge** (tabs, carousels peeking at the sides): the row gets `clip: false`, the screen frame keeps `clip: true`; a carousel is a `layout: "NONE"` frame with the side cards at negative / overflowing `x`.
- **Two-size numbers** ("$79" big, ".00" small): two text nodes in a `HORIZONTAL` frame with `align: "BASELINE"`.
- Emoji inside text (`"Hey, Den 👋🏻"`) render with any font; no special handling.

## 2. Copying a picture into screens
*(seen: 2026-11-26, same build; used by `screen-from-image`; the render_tree traps above apply too)*

- **A width inside auto layout needs `widthMode: "FIXED"`**, otherwise the frame hugs and clips absolute children (same for height). Rule: `../tools/render-tree-dsl.md` §4.
- **Long single-line copy** wraps once real fonts load: check the line width in the sheet (characters × ~0.55 × font size) against the slot.
- **muse `background: transparent` keys on green**: a green subject (fox with leaves, a map) gets flagged; check the edges by eye, or generate on magenta and run `remove_bg.py`.
- **Generated images have margins**: trim to the alpha bbox before placing, or the subject looks smaller than in the picture.

## 3. Images on screens

- **Onboarding hero fade** drawn by the image model never lands on the exact background hex or height → generate the scene only and bake the fade with `app-redesign/scripts/bake_fade.py` (recipe: `app-redesign/references/imagery.md` → "Onboarding images — the baked bottom fade"). *(seen: 2026-11-26, AI Chatbot F4 `13002:22650`)*
