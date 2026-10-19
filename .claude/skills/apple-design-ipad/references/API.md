# iPadOS platform API (latest)

> Compiled from WWDC25 208 (*Elevate the design of your iPad app*), 282 (*Make your UIKit app more
> flexible*), 356 (*new design system*), WWDC24 10147 (*tab & sidebar*), WWDC26 251 (*Modernize your
> UIKit app*). **Re-verify names/availability in Xcode before use.**

## 1. Windowing & scenes (iPadOS 26+)

| Item | Details |
|---|---|
| **Windows** | Every multitasking-capable app has a **handle at the bottom-right corner** for dragging into a floating window |
| **Window controls** | Sit on the toolbar's **leading edge**; tap to expand, **press-and-hold** for layout-creation shortcuts |
| **Additive windows** | Opening a document ⇒ **creates a new window** per document (no "open in place"); windows **live until closed** |
| **Window names** | Give each window a **descriptive name** (e.g. document name) — the window list menu is built from it |
| **Scene life cycle** | `UIScene` becomes **mandatory** in the major release after iOS 26 when building with the new SDK; multiple scenes encouraged |
| **State restoration** | Each scene saves/restores its own state; use `restoreInteractionState`/activity |
| **Minimum size** | `UISceneSizeRestrictions` — declare the preferred minimum as the scene connects |
| **Orientation lock** | `prefersInterfaceOrientationLocked` + `setNeedsUpdateOfPrefersInterfaceOrientationLocked`; observe via `didUpdateEffectiveGeometry` |
| **Heavy resize** | `isInteractivelyResizing` — update large assets only **after** the interaction ends |
| **Dropped** | `UIRequiresFullscreen` is **deprecated** and will be ignored; building with **SDK 26** means the system no longer **scales/letterboxes** |

## 2. Container view controllers (most flexible)

| Container | New capabilities |
|---|---|
| **UISplitViewController** | **Interactive column resize** (drag the separator; pointer reshapes by direction); **min/max/preferred width** per column; **`splitViewLayoutEnvironment`** trait (expanded/collapsed) to switch UI (e.g. show a disclosure indicator when collapsed); first-class **inspector column** (trailing; when collapsed it ⇒ becomes a **sheet** automatically) |
| **UITabBarController** | Tab bar **auto-positions by platform** (iPhone: bottom; Mac: toolbar/sidebar; visionOS: ornament; iPad: **top**, next to navigation); **morph tab bar ↔ sidebar**; **tab groups** (e.g. Library → Artists/Albums); managing navigation controller + `displayedViewControllersFor` delegate |
| **General rule** | Wrap UI in system containers for free adaptivity; **be careful not to set min widths too large** (reduces displayable columns) |

## 3. Navigation: sidebar ↔ tab bar

| Task | SwiftUI | UIKit |
|---|---|---|
| Adaptive sidebar | `tabViewStyle(.sidebarAdaptable)` | `tabBarController.mode = .tabSidebar` |
| Groups | `TabSection` | `UITabGroup` |
| Tabs | `Tab { }` (title + image + selection) | `UITab` (assigned to `tabs`) |
| Search | `.search` role (default title/icon/pinned) | `UISearchTab` |
| Customization | `TabViewCustomization` + `AppStorage` + `customizationID` | `allowsHiding`, `preferredPlacement`, `allowsReordering`, `displayOrderIdentifiers` |
| Hide/exclude from customization | `defaultVisibility`, `customizationBehavior` | `UITab.isHidden`, `sidebarOnly` |
| Drop onto tab | `.dropDestination` | `operationForAcceptingItemsFromDropSession`, `acceptItemsFromDropSession` |
| Other | sidebar header/footer, swipe actions, context menus, tab-anchored popovers | similar |

- **Tab bars prefer FILLED glyphs; sidebars prefer OUTLINE** — declare the **outline** variant and the system picks filled automatically.
- Tab bars have 3 zones: **fixed** (key, not customizable) · **customizable** (drag & drop) · **pinned** (always last, e.g. Search).

## 4. Pointer, Pencil, keyboard, drag & drop

| Input | Details (iPadOS 26) |
|---|---|
| **Pointer** | New **pixel-exact 1:1** shape, **no** more magnetize/rubber-band; **highlight is a liquid-glass platter** overlaid on the control (replacing the old pointer morph); reshapes with context (column resize, drop, hand…); hover only for **prediction** |
| **Apple Pencil** | Instant strokes; **pressure** ⇒ weight/darkness; **azimuth** ⇒ direction; **altitude** ⇒ tilt; **hover** to preview (not to activate); **double-tap** for easy-to-undo actions; Scribble for text entry |
| **Keyboard** | Full keyboard access; standard shortcuts; **menu bar** lists + assigns shortcuts |
| **Drag & drop** | Drag between apps, spring-loading, drop on tabs; always provide an alternative (a "Move to…" menu, arrow buttons) |
| **Menu bar** | Opens via pointer at the top edge or swipe down; structure: **app menu → system menus → custom menus**; order by **frequency of use**, group into sections, submenus for the rest, assign symbols + shortcuts; **View menu** holds tabs + sidebar toggles; **never hide menus/items** by context (unavailable items stay in place but **dimmed**) |

## 5. Layout & visual foundation

| Item | Details |
|---|---|
| **Toolbar + window controls** | **Wrap the toolbar around the window controls** so they share a row (avoids reserving safe area above — "above toolbar" placement is only **compatibility**) |
| **Asymmetric safe area** | The sidebar creates an asymmetric inset for the adjacent column; **backgrounds** extend under the sidebar; **content** stays in the safe area |
| **Layout margins** | Insets from the safe area; use layout guides for content inside containers |
| **Window controls & UI** | Use the layout guide with **horizontal corner adaptation** for bars at the top of the scene; system components (`UINavigationBar`) avoid window controls automatically |
| **Scroll edge effect** | Content draws **under** the toolbar via the edge effect (soft by default; avoid mixing/stacking soft+hard) |
| **Content extension** | Extend content under the toolbar/sidebar; matters most for **small floating windows** |
| **Concentricity** | `ConcentricRectangle`/`UICornerConfiguration` (iOS 26) — sidebar/toolbar nest neatly inside the window |
| **Resize must not break layout** | Resize changes **must not** damage the layout; **revert to the previous state when possible** (opportunistic revert) |
| **Bleed content** | Images/heroes may bleed full-bleed; text/controls stay in the margins |

## 6. Recipe

```
1) Pick navigation: tab bar (start) → sidebar as the hierarchy grows; flexible morph
2) Wrap in system containers: UISplitViewController / UITabBarController
3) Windowing: toolbar wraps window controls; new window per document; name windows
4) Layout by size class + safe area + layout guides (avoid window controls)
5) Interaction: 1:1 pointer + highlight; Pencil with full pressure/azimuth/altitude/hover; menu bar + shortcuts
6) Adapt: resize never breaks layout; sensible min/max/preferred widths; isInteractivelyResizing for heavy assets
7) A11y: targets ≥ 44pt; Dynamic Type; VoiceOver; no hover dependence
8) Test: multiple windows, two-sided Split View, Slide Over, Stage Manager, RTL, large text
```
