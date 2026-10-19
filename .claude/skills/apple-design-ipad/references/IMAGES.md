# Image knowledge — iPad (in-depth analysis)

Direct analysis of the images in `assets/` (viewed) cross-checked against HIG/WWDC.

| Image | Knowledge |
|---|---|
| `assets/split-view-horizontal.png` | Horizontal split: **2 panes + divider**, leading pane narrower; content runs close to the safe area (iPad uses nearly the whole surface). ⇒ iPad is a **multi-pane space**, not a scaled-up iPhone. |
| `assets/split-view-multiple.png` | Multiple panes coexist; each pane has its own role; collapsing loses no context. |
| `assets/sidebar-intro.png` | Sidebar = **collapsible** leading column for top-level navigation; replaces the tab bar at `regular width`. |
| `assets/popover-attached.png` | **Attached** popover anchored to its source by an arrow ⇒ clear cause–effect relationship; dismisses on outside tap. |
| `assets/popover-detached.png` | **Detached** popover = **inspector/property** panel (name, time, attendees) ⇒ popovers hold **short forms**, not long flows. |
| `assets/padding-without-bezel.png` | **Bezel-less** element (text "Button"): **24 pt** padding on each side. |
| `assets/padding-with-bezel.png` | **Bezeled** element (round button): ~**12 pt** padding around the bezel. |
| `assets/padding-glyph.png` | Glyphs need padding to reach an adequate touch target. |
| `assets/pencil-pressure.png` | **Pressure** ⇒ stroke weight/darkness (curve thickening gradually). |
| `assets/pencil-azimuth.png` | **Azimuth** = nib direction (graduated ring + beam) ⇒ changes the stroke like a flat pencil. |
| `assets/pencil-altitude.png` | **Altitude** = tilt angle ⇒ different tilt effects. |
| `assets/pointer-pointing-hand.png` | Pointer **reshapes with context**; hover to *predict*, not to activate. |

## Takeaways for iPad

1. **Multi-pane by default:** split/sidebar/inspector instead of pushing screens.
2. **Short, contextual popups:** popovers for choices/attributes; long forms go in sheets.
3. **Touch targets measured from padding:** 24 pt (no bezel) / 12 pt (bezel); glyphs need extra padding.
4. **Pencil is a real tool:** pressure + azimuth + altitude ⇒ instant, lag-free strokes.
5. **Pointer is for prediction only:** reshapes with context; never use hover as the sole action.
6. **Resizable windows ⇒ layout must follow size class**, not "iPad" in general.
