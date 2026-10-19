# Reserved Regions & Displacement — iPhone Duo

> Distilled from HIG *Designing for iPhone Duo* (Reserved regions, Dynamic layouts sections) +
> Tech Talk *Strike a pose with adaptive layouts on iPhone Duo*.
> Images: `assets/reserved-outer-camera.png`, `assets/reserved-inner-fold-camera.png`, `assets/anatomy-inner.png`.

## 1. What a reserved region is

An area of the display that **content must avoid covering** or that **components must auto-adjust** to dodge.
Treat it like "window controls" on iPadOS — a normal layout region to adapt to.

There are **two kinds**:

| Kind | Behavior | On Duo |
|---|---|---|
| **Occlusion region** | Doesn't split the region, only **occludes** (like a small frame inside the bounds) | Outer front camera; inner camera (FaceTime) |
| **Division region** | **Splits** one large region into several smaller usable ones | The fold (folding region) |

## 2. The three concrete reserved regions

### 2.1 Outer front camera — occlusion
- **Always present**; **expands into the Dynamic Island** with Live Activities.
- When controls sit at the edge, the system **auto-arranges** elements so nothing overlaps.
- Image `assets/vertical-bars-layout.png`: the Dynamic Island is the topmost element of the vertical band on the right.

### 2.2 Inner front camera — occlusion
- **Only active while the camera is running** (under-display). When inactive: **invisible, width = 0**.
- When the camera turns on, the UI **shifts over** to make room.
- Image `assets/reserved-inner-fold-camera.png`: the camera circle in the top-right half.
- If the viewfinder is central to the app: **keep important content/controls clear of this area**.

### 2.3 The fold — division
- **Conditional**: only active while the device is **partially folded**. When opened flat: **inactive, width = 0**.
- When folded, it splits the inner display into 2 regions; the center band (where the display curves) is **removed from the usable area**.
- Image `assets/reserved-inner-fold-camera.png`: the vertical band mid-display = the fold region.

## 3. API

| Task | SwiftUI | UIKit |
|---|---|---|
| Read the region | `GeometryProxy.reservedRegion` (inside `GeometryReader` / `onGeometryChange`) | `UIView.reservedRegion(...)` |
| Get its frame | — | region's `frame` |
| Filter by active | only **active** returned by default | `includeInactive` to also fetch inactive ones |
| Region kind | `.division`, `.occlusion` | counterparts |
| Push content out of the region | `ReservedRegion` | `UIView.ReservedRegion` |
| Concentric corners | `ConcentricRectangle` (iOS 26+) | `UICornerConfiguration` |

> Use **inactive regions** for high-level decisions: e.g. a grid picks an **even column count** when a
> division region exists, whether or not it is currently active.

## 4. Displacement — shift instead of redraw

**Definition:** adjusting the *frames* of existing elements to fit the available space, keeping important
content **visible, tappable, unobstructed** when the device is partially folded.

### 4.1 Principles
- **Scope:** elements that can self-adapt **move alone**; **related elements move together** to preserve relationships.
- **Don't move too far from the source** — it weakens the visual relationship (e.g. a context menu must travel with
  the selected photo, not jump to the opposite half).
- **Never displace continuous scrolling content** (articles, feeds, documents, lists) — scrolling already
  adapts them; shifting breaks continuity.
- **Purpose decides the destination**, and the destination may change with usage:
  - Book-fold → alerts/menus gather in the **trailing half** (near where they appear once the device closes).
  - Propped on a table → **upper region** for content viewed from afar; **lower region** for touch controls.
- **Prefer keeping context:** a focused search field stays **above the keyboard**; when opened, the field widens,
  but when folded its position and width adapt to stay above the view being searched.
- **Adapted attributes:** usually **position + size**, but may be some other visual attribute.

### 4.2 What the system does for free (use before rolling your own)
- Alerts, context menus, sheets, action sheets, menus, popovers → **auto-avoid reserved regions**.
- Split view (e.g. Reminders) → keeps **both columns** by adjusting widths to **50/50**.
- Buttons/menus/toolbar buttons get **"nudged" off the fold** (hard to tap when landing exactly on it).
- The fold becomes a **natural dividing line** for the layout.

### 4.3 When you must do it yourself
- Use the **ReservedRegion API** for custom UI / custom bars / edge-to-edge.
- Grids: widen spacing around the fold, keep each container inside its own region.
- Audit **centered** layouts — most need an **offset** so controls don't cover them.

### 4.4 Quick decision table

```
Continuous scrolling content (article, feed, list)   -> NO displacement (scrolling handles it)
Menu/alert/popover attached to one element           -> moves WITH that element
Alert in book-fold                                   -> gather in the trailing half
Media when propped on a table                        -> region above; controls -> region below
Focused search                                       -> stays above the keyboard, adapt width/position
Multi-cell grid                                      -> keep outer margins, widen spacing at the fold, even columns
Custom bar/edge-to-edge                              -> ReservedRegion API
```

## 5. Reserved regions checklist

- [ ] Use system components for alerts/menus/sheets/buttons (free fold avoidance).
- [ ] Custom UI: read `reservedRegion`, including **inactive** ones when making structural decisions.
- [ ] Grids: **even** column count with a division region; widen spacing at the fold.
- [ ] Scrolling content is **not** displaced.
- [ ] Check the inner camera in **active/inactive** states.
- [ ] Check centered layouts → offset correctly.
