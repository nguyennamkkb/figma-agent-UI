# Knowledge from images — Apple Watch (deep analysis)

Direct analysis of the 16 images in `assets/`.

## 1. Watch faces & complications

| Image | Insight |
|---|---|
| `assets/complications-intro.png` | Watch face with **slots**: **Top Left** (Earth), **Date** (FRI 23), **Middle** = text complication (**8:00–AM / Yoga / Gym** — time + title + subtitle), **Bottom Left** (Activity rings), **Bottom Middle** (Compass — compass dial), **Bottom Right** (Temperature — gauge showing **72** with range **64–88**). ⇒ Slot-based design, one role per slot; short data, high contrast on dark backgrounds. |
| `assets/watch-face.png` | Three watch faces: **Solar Graph** (full-screen color + line chart + temperature), **GMT** (analog, **complications spread around the bezel**), **Unity Lights** (radial pattern). ⇒ Watch faces use **full-screen color/graphics** and **tint** complications to match the face tone. |
| `assets/complication-circular-stack-text.png` | Round complication: **"AAPL"** (white) + **"121.96"** (green = up). ⇒ Two-line text stack; **color signals up/down** but must stay readable when color is lost. |
| `assets/complication-circular-stack.png` | Sun icon + **7:24**: **icon + a single value** on a pure black background — the "one idea" spirit. |
| `assets/complication-circular-image.png` | **Image** variant of the circular family — images must stay legible when tinted/desaturated. |
| `assets/complication-open-gauge-range.png` | **Open + range gauge** in a circular slot: gradient arc + large centered value + range labels. |
| `assets/complication-closed-gauge-text.png` | **Closed gauge** (full ring) when the value is a proportion/an endpoint. |
| `assets/bezel-circular-text.png` | Text in the circular family must fit inside the **bezel safe area**; long text gets clipped at the curved edge. |

## 2. Gauges

| Image | Insight |
|---|---|
| `assets/gauge-open-range-text.png` | Gradient arc (blue→yellow→orange) encoding **zones**, large **72** in the middle, **55 76** labels below, round marker for the current position. |
| `assets/gauge-closed-text.png` | Closed ring = 0–100% proportion. |

## 3. Notifications

| Image | Insight |
|---|---|
| `assets/notification-short-look.png` | **Short look**: large app icon, **bold title**, 2 lines of description, **centered**, blurred gradient background. |
| `assets/notification-long-look.png` | **Long look**: expands on wrist raise — adds detail + **action buttons**. |
| `assets/notification-intro.png` | Sample notification set: short content, no repetition of the app. |

## 4. Interaction & states

| Image | Insight |
|---|---|
| `assets/digital-crown.png` | The Crown is the **scroll/adjust axis**; always provide a **touch alternative**. |
| `assets/action-button.png` | Action button glyph (arrow + frame) placed on the **system grid** (circles + crosshair). ⇒ Glyphs/icons follow **Apple's standard grid**. |
| `assets/always-on.png` | Glyph for the **dimmed/off** state (phone with a slash) on the grid. ⇒ Always-On must **dim secondary content** and keep primary content. |

## 5. Distilled rules

1. **Design per slot/family**, not per "screen"; one slot carries **one idea**.
2. **Icon + a single value** is the basic unit; text stacks max out at 2–3 lines.
3. **Pick the gauge by the data:** closed = proportion; open + range = interval; always include range labels when needed.
4. **Tint/tinted is the default** on the watch face — never convey information by color alone.
5. **Text must stay inside the bezel**; glyphs follow the system grid.
6. **Notifications come in 2 tiers:** short look (glance) → long look (detail + actions).
7. **Always-On = dim, never distract** — primary content bright, secondary content muted.
