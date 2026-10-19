# Windows & multitasking — iPad

> Sources: WWDC25 208 (*Elevate the design of your iPad app*), 282 (*Make your UIKit app more flexible*),
> WWDC26 251 (*Modernize your UIKit app*).

## 1. Window model (iPadOS 26)

- Every multitasking-capable app has a **resize handle at the bottom-right corner**; drag it to turn
  full-screen into a **floating window** over the wallpaper.
- **Window controls** sit on the toolbar's **leading edge**: tap → expand; **press-and-hold** → layout
  shortcuts (split columns, full screen…).
- **Compatibility mode:** apps not yet updated ⇒ the system grows the safe area above the toolbar and places
  window controls on the leading edge — **compatibility only**, wastes space.
- **Recommendation:** **wrap the toolbar around the window controls** so they share a row ⇒ drop the extra
  safe area and give content more room.

## 2. "Additive" multitasking

- Opening a document ⇒ **creates a new window** per document (drop the "open in place" single-window overwrite).
- Windows **live until the user closes them** ⇒ state has value, don't destroy it.
- Consequence: windows can **pile up** ⇒ give each a **descriptive name** so the window picker stays useful.

## 3. Scenes — the foundation of flexibility

- **A scene = one UI instance** of the app: hosts view controllers/views, receives external data (URLs/deep links),
  **saves/restores its own state**, provides context (screen, window geometry).
- **Multiple independent scenes** ⇒ each scene has its own lifecycle/state.
- **Scene types** for distinct experiences (e.g. a compose scene for messaging); iOS 26 allows **mixing
  SwiftUI + UIKit scene types**.
- **The UIScene life cycle becomes mandatory** in the major release after iOS 26 when building with the new SDK
  (multiple scenes remain encouraged, not required).
- **Minimum size:** `UISceneSizeRestrictions` (declared as a scene connects). Too large a min
  **reduces displayable columns** ⇒ loses flexibility.

## 4. Smooth resize

- **Don't break layout:** resize changes must leave no permanent damage; **revert to the previous
  state when possible**.
- **Heavy assets:** use `isInteractivelyResizing` — re-render only **after** the interaction ends.
- **Column widths:** set sensible **min/max/preferred** widths per column; **resize columns by dragging the separator**
  (pointer reshapes by direction).
- **Expanded/collapsed traits:** `splitViewLayoutEnvironment` to switch UI (e.g. disclosure indicator when collapsed).
- **Orientation:** once the UI is adaptive, orientation is nearly **redundant**; lock orientation only in
  special cases (driving games…) via the preference API.

## 5. Dropping "compatibility modes"

| Old | Status | Replace with |
|---|---|---|
| `UIRequiresFullscreen` | **Deprecated**, will be ignored | Adaptive layout by size class |
| Scale/letterbox for new screens | **Gone** when building with SDK 26 | Design for every size |
| "Open in place" for documents | Not recommended | **A new window per document** |

## 6. Windows & multitasking checklist

- [ ] Toolbar **wraps** window controls (no compatibility placement).
- [ ] Each document **opens its own window**; windows have **descriptive names**.
- [ ] Adopt the **UIScene life cycle**; multiple scenes where sensible.
- [ ] `UISceneSizeRestrictions` sets a sensible min (doesn't block columns).
- [ ] Resize doesn't break layout; heavy assets update only after interaction.
- [ ] Sensible column min/max/preferred widths; inspector collapse ⇒ sheet.
- [ ] Drop `UIRequiresFullscreen`; drop scale/letterbox assumptions.
- [ ] Test: small floating windows, two-sided Split View, Slide Over, Stage Manager, RTL, Dynamic Type.
