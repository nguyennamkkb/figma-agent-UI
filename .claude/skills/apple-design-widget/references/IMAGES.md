# Image Knowledge — Widget / Live Activity / Control

Direct analysis of Apple's illustration images in `assets/`.

| Image | HIG Page | Takeaway |
|---|---|---|
| `assets/live-activity-lock-screen.png` | Live Activities | A Live Activity is a **dark, concentrically rounded card** floating over the wallpaper. Layout: **left** = icon + count ("3 items"); **right** = people involved + rating (stars); **center** = key info "Arriving in **8 minutes**" with the **dynamic value in an accent color**. Everything fits compactly without covering the clock/system buttons. |
| `assets/live-activity-margins.png` | Live Activities | The expanded variant has an **action row** "Contact Juan C." (wide capsule button, teal) — actions sit below the content. Note the **concentric margins** with the card's corner radius, never flush to the edge. |
| `assets/live-activity-compact.png` / `expanded.png` / `minimal.png` | Live Activities | 3 variants: **minimal** (one line, glanceable), **compact** (two symmetric zones), **expanded** (full + actions). Same event, different amounts of information. |
| `assets/live-activity-dynamic-island.png` | Live Activities | In the Dynamic Island, content must survive the **44 pt corner radius** and both compact/expanded modes; never place text against the top **sensor region**. |
| `assets/control-anatomy.png` | Controls | Control Center: **Symbol image + Title + Value** inside a **glass capsule**. Symbol on the left (in a circular disc), Title/Value stacked on the right. All three elements are enough to understand the state without opening the app. |
| `assets/widget-tinted.png` | Widgets | **Tinted** mode: all content in a single monochrome tone, hierarchy carried by **size & weight** (code "AAPL" + large value "247.77"), thin sparkline. Still readable thanks to good contrast. |
| `assets/widget-small.png` / `medium.png` / `large.png` | Widgets | Same calendar data, three sizes: **small** = 1 idea, **medium** = 1 idea + context, **large** = multiple rows. When going large, add more information — **don't enlarge the type**. Reserve room at the bottom of medium/large for the **widget name**. |

## Lessons for Widget Design

1. **One card = one idea**, hierarchy through type size/weight, key value largest.
2. **Dynamic content stands out** (accent color) — e.g. "8 minutes" — so the eye catches it first.
3. **Margins concentric with the corner radius**; keep safe areas for the Dynamic Island and the widget name.
4. **Tinted mode is mandatory:** must stay legible with color removed; never communicate by color alone.
5. **A control needs Symbol + Title + Value**; if Value is missing, the on/off state must still be clear.
6. **Actions sit below the content**, as a wide capsule button in the expanded Live Activity.
