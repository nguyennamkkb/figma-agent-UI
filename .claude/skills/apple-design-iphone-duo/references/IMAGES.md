# Knowledge from images — iPhone Duo (in-depth analysis)

Direct analysis of 22 images in `assets/` (read by eye + cross-checked against HIG/Tech Talks).

## 1. Poses & form factor

| Image | Knowledge |
|---|---|
| `assets/poses.png` | **6 poses**: (1) folded vertically, camera at the top corner; (2) propped tilted like a tent; (3) opened flat (wide slab); (4) **book-fold** — screen curved in a V shape, fold splitting it in two; (5) opened vertically (tall); (6) resting on its edge (trapezoid). Every pose has a home indicator. ⇒ Test **all 6**, not just open/fold. |
| `assets/anatomy-outer.png` | Outer: front camera at a **corner**, always present; hinge on the inner edge. |
| `assets/anatomy-inner.png` | Inner: **center fold** + inner camera **hidden under the display**. |
| `assets/duo-dimensions-open.jpg` / `duo-dimensions-close.jpg` | Open ratio (wide slab) vs folded (tall bar); buttons/ports on the **side edge**. |
| `assets/duo-display.jpg` | Inner landscape: Lock Screen **centered**, accessories pushed to corners (weather at top-right, quick actions at bottom-right). ⇒ The inner display is a **landscape space**. |

## 2. Reserved regions

| Image | Knowledge |
|---|---|
| `assets/reserved-inner-fold-camera.png` | Inner: **vertical band in the middle = fold region** (division); **circle in the top-right half = inner camera** (occlusion). The fold region splits the display into **2 usable areas**. |
| `assets/reserved-outer-camera.png` | Outer: corner camera area — **always present**, expanding into the Dynamic Island with Live Activities. |

## 3. Vertical bars & layout

| Image | Knowledge |
|---|---|
| `assets/vertical-bars-layout.png` | **The Duo's golden diagram**: vertical band on the right edge, top to bottom = **Dynamic Island → status bar (9:41+wifi) → toolbar (back, …) → tab bar (Photos/Albums/Search)**. Content fills the entire left area. ⇒ Controls are **single-edge chrome**; content is asymmetric. |
| `assets/compression-toolbar.png` | When outer landscape runs out of room: **toolbar compresses into overflow**, **tab bar stays** (navigation-focused — the default). |
| `assets/compression-tabbar.png` | Task-oriented mode: **tab bar compresses into a single control**, **toolbar stays** (the task's actions). |
| `assets/pane-controls.png` | Mail on inner: the **leading pane's** controls sit **atop that pane**; the **content pane's** controls run **down the right edge**. ⇒ Controls travel with the content region they affect, not all pushed to the edge. |
| `assets/mail-compact.png` | Outer: 1 pane (email content). |
| `assets/mail-full.png` | Inner: **2 panes** — list (leading, narrower) + content (trailing). ⇒ "One more hierarchy level", same functionality. |
| `assets/splitview-open.png` | Notes **opened flat**: leading pane **narrower** than the content pane. |
| `assets/splitview-folded.png` | Notes **partially folded**: both panes **equally wide**, **the fold is the natural divider**; right edge has a vertical toolbar (expand/share/…) + floating compose button; leading pane has its own controls at top + search at bottom. ⇒ The system rebalances panes around the fold. |
| `assets/splitview-multitasking.png` | Two side-by-side apps: **each app's controls sit at its outer edge** (left ↔ left, right ↔ right), away from the fold. |
| `assets/calculator-full-width.png` | Calculator: iPhone 16 = **4 columns × 5**; Duo outer = **5 columns × 4**. ⇒ Outer is **wide–short** → add columns, drop rows; layout spans full width since no bar is needed. |

## 4. Arrangements

| Image | Knowledge |
|---|---|
| `assets/arrangement-split.png` | Inner: primary (purple) **left half** + secondary (blue) **right half**, vertical divider in the middle. Status bar at **top-right**. |
| `assets/arrangement-overlay.png` | Inner: secondary **covers the full display**; primary is a **rounded card pinned to the bottom, horizontally centered** (bottom-aligned). ⇒ Overlay = floating layer, not a split. |
| `assets/hero-inner.png` / `hero-outer.png` | Home Screen on both displays — icon grid stretched horizontally. |

## 5. Rules distilled

1. **Same app, two display tiers:** outer = 1 pane/1 tier; inner = 2 panes/extra tier — **functionality unchanged**.
2. **Chrome hugs one edge** (trailing) on outer + inner landscape; **exception** is inner portrait (horizontal bar).
3. **The fold is the natural dividing line:** 50/50 split when folded, offset panes when flat; controls/interactions **avoid the fold**; scrolling content need not.
4. **Each region keeps its own controls** (pane controls) — don't push everything to the edge.
5. **Overlay differs from split in kind:** split divides in two (main–detail, must never cover each other); overlay layers (foreground/background, partial covering is acceptable).
6. **Deliberate compression:** navigation-focused → toolbar compresses first; task-oriented → tab bar compresses first; outer landscape compresses most often.
7. **Outer is wide–short ⇒ add columns, drop rows** (Calculator 5×4), don't stretch vertically.
