# Version spec

One YAML file per version: `sources/<flow>/specs/<version>.yaml` inside this skill. It fixes the screen order, names, types and ad placement of that version. Once the user approves it, the board must match it.

```yaml
version: V1.9.0
flow: First Open
wireframe: ../wireframes/V1.9.0.png
screens:                    # row 1 order = user path with ads
  - { code: "101",  name: "101 - Splash",           type: splash,      ad: banner, content: splash }
  - { code: "102",  name: "102 - Inter Splash",     type: inter,       ad: inter }
  - { code: "201",  name: "201 - LFO1",             type: lang-empty,  ad: native, layout: Header-Media-CTA }
  - { code: "202",  name: "202 - LFO2",             type: lang-picked, ad: native, layout: Header-Media-CTA }
  - { code: "301",  name: "301 - OB1",              type: onboarding,  ad: native, layout: Header-CTA-Media, content: ob1 }
  - { code: "302a", name: "302a_NoAds - OB2a",      type: onboarding,  ad: none,   content: ob2 }
  - { code: "302c", name: "302c - OB2c",            type: native-full, ad: native-full, close: Top-left }
  - { code: "306",  name: "306 - Onboarding Inter", type: inter,       ad: inter }
edges:                      # labels only; arrows always follow the screens order
  - { from: "101 - Splash", to: "102 - Inter Splash", label: "7s" }
offFlow:                    # drawn in the image but not on the path → sub-section, never in row 1
  - { name: "308 - OB7 · Theme", type: custom, ad: native, layout: Header-CTA }
notes:                      # inconsistencies and decisions, shown as a yellow note
  - "Sơ đồ thiếu cạnh 301 → 302a: thứ tự lấy theo vị trí."
```

## Fields
| Field | Values |
|---|---|
| `code` | screen code as written in the flow (`101`, `302a`, `C2B`); may repeat (two states of one screen, a fallback show) |
| `name` | exact frame name; unique inside the version; `edges` refer to it |
| `type` | `splash`, `inter`, `lang-empty`, `lang-picked`, `onboarding`, `native-full`, `loading`, `all-set`, `custom` (built by hand from the wireframe; extend `archetypes.md` before reusing it) |
| `ad` | `none`, `banner`, `native`, `native-full`, `inter` |
| `layout` | Native variant: `Header-CTA-Media`, `Header-Media-CTA`, `CTA-Media`, `CTA-Media-Header`, `Header-CTA` |
| `close` | Native Full variant: `Top-left`, `None · CTA top` |
| `content` | content key defined in the project's `rules.md` (background image, art) |

## Writing a spec from an image
Read `wireframes/<version>.png` (zoom into parts with an image crop when the text is small) and fill the spec:
1. **Path**: the boxes joined by arrows, from the start dot to the end dot = `screens`, in that order. A box with a missing arrow is placed by its position; write a note.
2. **Ad format** per screen: the name says Inter → `inter`, `NoAds` → `none`; otherwise the preload / display boxes attached to it (banner / native / inter). Unit ids are read only to know the format, never copied.
3. **Wireframe of each screen** (the big frames under the diagram): ad block with Media + CTA + "Icon, title, subtitle" → `native` and its `layout` from top to bottom order; full-height Media with an X or a CTA on top → `native-full` + `close`; no ad block → `none`.
4. **Content**: match the onboarding page to a content key of `rules.md` (same page = same key across versions).
5. Screens drawn as wireframes but absent from the path → `offFlow`.
6. Arrow labels written on the diagram → `edges` (shorten: "After 7s" → `7s`, "First-time click on a language" → `Tap`).
7. No `TODO` left. Show the spec as a table to the user before building.
