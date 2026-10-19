# Complications & watch faces — watchOS

> Synthesized from HIG *Complications*, *Watch faces* + WWDC23 *Build widgets for the Smart Stack*,
> WWDC25 *What's new in watchOS 26*.
> Images: `assets/complications-intro.png`, `assets/complication-*.png`, `assets/gauge-*.png`, `assets/watch-face.png`.

## 1. Position & role

Complications are the app's **primary entry point** on the wrist: users **glance at the watch face** instead of opening the app.
Goal: **one data point, read in 1–3 seconds**.

Image `assets/complications-intro.png` shows the **slots** around the watch face: *Top Left (Earth)*,
*Date*, *Middle (Your Schedule — text style: time + title + subtitle)*, *Bottom Left (Activity rings)*,
*Bottom Middle (Compass — dial)*, *Bottom Right (Temperature — gauge 72, range 64/88)*.
⇒ **Design per slot**, not per "screen".

## 2. Families (WatchKit/WidgetKit)

| Family | Shape | Use for | Notes |
|---|---|---|---|
| `accessoryCircular` | small round | 1 number/1 state, gauge, icon | Content must stay inside the **bezel safe area** |
| `accessoryRectangular` | horizontal rectangle | 2–3 lines (time + title + subtitle) | **Also the shape used in the Smart Stack** |
| `accessoryInline` | 1 line | short phrase/symbol + text | Single line, easily clipped |
| `accessoryCorner` | corner | 1 value in the corner | Tied to specific watch faces |
| *(graphic) circular stack / image / text* | large round | icon+text stack, image, gauge | Image `complication-circular-stack-text.png`: "AAPL" + "121.96" |

> **Support as many families as makes sense**; you can ship **multiple variants per family**.

## 3. Gauges — pick by data

| Type | Use when | Image |
|---|---|---|
| **Closed gauge** | Value is a 0–100% proportion / has an endpoint | `assets/gauge-closed-text.png` |
| **Open gauge + range** | Value has a **range** (sensible min/max) | `assets/gauge-open-range-text.png` — large number in the middle ("72"), range labels below ("55 76"), marker for the current position |

- Pick ring/gauge **by data type**, not aesthetics.
- Gradient/arc color **encodes zones** (blue→yellow→orange) ⇒ must stay readable when color is lost (tinted).

## 4. Per-face rendering (tinted)

- `widgetAccentable()` — content **tints to match the watch face**.
- `widgetAccentedRenderingMode(...)`:
  - `nil` = not applied (as if never called)
  - `primary` = tints the primary content (usually white)
  - `accent` = tints with the **face's accent color** (on watch, accent = face color)
  - `desaturated` = desaturates images
- Images must **look good in tinted mode** — verify all 3 modes.

## 5. Backgrounds

- `containerBackground(for: .widget)` — **only in the Smart Stack**, NEVER on the watch face.
- On the watch face: the background is decided by the system/face ⇒ design **transparent/high-contrast**, never assume your own background.

## 6. Layout & limits

- **Dial view:** max **4 corner controls** without covering primary content.
- Text in round families must fit **inside the bezel safe area** (`assets/bezel-circular-text.png`).
- A complication carries **one idea**; multiple metrics ⇒ split into another family or use a relevant widget (multiple cards).

## 7. Complication checklist

- [ ] Support **every applicable family**; variants for each.
- [ ] One data point per family; readable in 1–3 seconds.
- [ ] Tinted mode OK (`widgetAccentable`, verified `primary`/`accent`/`desaturated`).
- [ ] Never color-only (gauge/ring stays readable without color).
- [ ] Text fits the bezel; no clipping in round/inline families.
- [ ] Backgrounds: `containerBackground` for Smart Stack only; transparent on the face.
- [ ] Data is **fresh**, with stale/placeholder states.
