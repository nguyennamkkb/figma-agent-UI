# Layout grid

## Page
- Sections stacked vertically, gap 400: the Ads Kit (no masters, no Legend on the canvas), then versions oldest → newest. A newer version goes under the last one; an older or in-between one is inserted at its place and the later sections move down. The optional Version matrix (`/ads-board matrix`) goes between the kit and the versions.
- Version section: width = `200 + columns × 440 + 160` (min 6480), height 2504; 3104 when it has notes (notes at y 2404); +1200 more for an off-flow sub-section.

## Version section
```
┌ <NN> · <Flow> <version> ─────────────────────────────────────────────┐
│ Title (number chip + name)                                  y 0–100  │
│ "Có quảng cáo"                                              y 236    │
│ [s1]→[s2]→[s3]→ … row 1, ads flow                           y 304    │
│ "Không quảng cáo"                                           y 1436   │
│ [s1]──────→[s3]→ … row 2, no-ads flow, same columns         y 1504   │
│ notes + "Wireframe ngoài luồng" sub-section                 y 2404+  │
└──────────────────────────────────────────────────────────────────────┘
```
- Screen frames 360 × 800. Column i → `x = 200 + i × 440`.
- Row labels: Inter Bold 28, white, `Row label · Có quảng cáo` / `Row label · Không quảng cáo`.

## Row 1 — ads flow
Every `screens` entry of the spec, in order, one column each.

## Row 2 — no-ads flow (aligned)
For column i, by the row-1 screen's `ad`:
| row-1 `ad` | row 2 |
|---|---|
| `inter`, `native-full` | empty column (screen does not exist without ads) |
| `native` | `· No Ads` twin built per `archetypes.md` |
| `banner` | `· No Ads` twin: banner removed, content back in place |
| `none` | clone, same name |

## Arrows
- Created with `render_tree` connector, one call each, `parentId` = version section, `RIGHT → LEFT` magnets.
- Row 1: between consecutive screens; label from `edges` (`7s`, `Tap`, `Next`, `Swipe`, `Loaded`), set afterwards with `execute_code` (`c.text.characters`).
- Row 2: between consecutive existing screens, skipping empty columns (the arrow crosses the gap); name prefix `No Ads ·`, no label.
- `branches`: one extra arrow per branch from the `from` screen's BOTTOM to the `to` screen's BOTTOM (elbow under row 1), label = condition; the main row keeps the default path.
- State changes of one screen (e.g. Loading → All Set) are consecutive columns, never a vertical arrow.

## Notes and off-flow
- Yellow `#FFE477` note: the spec's `notes` (naming / flow inconsistencies), one bullet each. Pink note: ideas. White text never on yellow.
- `offFlow` screens: nested section `Wireframe ngoài luồng <version> (không có trong sơ đồ)` below row 2; no arrows into the main rows.
