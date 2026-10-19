# Arrangements — iPhone Duo

> Distilled from HIG *Designing for iPhone Duo* (Arrangement views section) +
> Tech Talk *Strike a pose with adaptive layouts on iPhone Duo*.
> Images: `assets/arrangement-split.png`, `assets/arrangement-overlay.png`.

## 1. Definition

An **arrangement view** = a layout container sitting *between* the navigation container and the content.
It holds **two views**: `primary` + `secondary`, and **self-organizes** by display size, orientation, and
reserved regions.

> Mental model: a function **inputs → outputs**.
> **Inputs:** horizontal/vertical size class · width/height ratio · whether a division region is active.
> **Outputs:** whether a view shows at all · and if so, what its **frame** is.

## 2. The two arrangement kinds

### 2.1 Split arrangement (`assets/arrangement-split.png`)
- **Divides** the area between primary and secondary.
- Default: **splits horizontally** when the region is **wider than tall**; **splits vertically** when **taller than wide**.
- May **constrain the axis** (`axes`): if it cannot split along the **primary** axis, the arrangement shows
  **only one view** (usually the primary).
- Image: primary (purple) left half, secondary (blue) right half, vertical divider.

### 2.2 Overlay arrangement (`assets/arrangement-overlay.png`)
- **Layers** primary over secondary.
- When the device is **partially folded**: the two views **separate to opposite sides** (using the 2 folded regions).
- Normally: primary sits **on top of** secondary (image: primary is a rounded card at the bottom, secondary
  fills the whole display).
- May **collapse the secondary** when it shouldn't appear.
- `overlayArrangementZIndex` (environment) reports primary's layer — use it to switch between
  **collapsed / expanded** forms as the user folds/unfolds.

## 3. When to use which

```
Current layout is HStack / VStack (side-by-side / stacked)   -> split arrangement
Current layout is ZStack (layered)                           -> overlay arrangement
Clear foreground / background relationship                   -> overlay
   (e.g. Accessibility Reader: controls in the foreground, reading content in the background;
    content may be partly covered since it still scrolls)
Clear main–detail relationship                               -> split
   (e.g. Podcasts: the transcript is a detail of the playing podcast; they must NEVER cover each other)
Needs expanding/collapsing + full navigation                 -> NavigationSplitView, not Arrangement
```

Selection rule: **follow the app's existing pattern**; only when no pattern applies should you decide
by foreground/background (overlay) vs main–detail (split) relationship.

## 4. Prohibitions

- ❌ **Don't place a navigation container inside an ArrangementView** (ArrangementView provides no
  navigation infrastructure). Wrap `NavigationSplitView`/`NavigationStack` **outside** the arrangement.
- ❌ **Don't place an ArrangementView inside a `List` / `ScrollView`** — a scrolling view is inherently unfit as
  the parent of a dynamic layout container.

## 5. API

| Task | SwiftUI | UIKit |
|---|---|---|
| Container | `ArrangementView` | `UIArrangementViewController` |
| Set primary/secondary | init parameters | `primaryViewController`, `secondaryViewController` |
| Pick the kind | `arrangementViewStyle` (default `.split`) | `updateArrangement(...)` |
| Constrain the axis | `.axes(...)` on the split style | `UISplitArrangement` with the matching axis |
| Collapse secondary | supported | supported |
| Overlay layer | `overlayArrangementZIndex` | `stateForViewPlacement(...)` → `zIndex` |

## 6. Arrangement checklist

- [ ] Is an arrangement really needed, or is a system component enough?
- [ ] Split: pick the right **axis**; verify the "cannot split" case (only 1 view left).
- [ ] Overlay: verify **partially folded** behavior (2 sides) and **normal** behavior (layered).
- [ ] Navigation sits **outside**; the arrangement is **not** inside a List/ScrollView.
- [ ] Important content is **never covered** when using split.
- [ ] Overlay: partly covered content must still **scroll**.
