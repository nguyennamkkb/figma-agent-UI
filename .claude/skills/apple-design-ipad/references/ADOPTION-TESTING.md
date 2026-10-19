# Adoption & Testing — iPad

> Sources: WWDC25 208/282, WWDC26 251, WWDC24 10147, HIG.

## 1. To do when adopting iPadOS 26+

| Task | Details |
|---|---|
| **Adopt scene life cycle** | `UIScene` becomes **mandatory** in the major release after iOS 26 when building with the new SDK |
| **Drop compatibility modes** | `UIRequiresFullscreen` is deprecated; drop scale/letterbox assumptions |
| **Toolbar wraps window controls** | Avoid "above toolbar" placement (compatibility only) |
| **Additive windows** | One window per document; give each window a **descriptive name** |
| **System containers** | `UISplitViewController` (column resize/inspector) + `UITabBarController` (tab↔sidebar) |
| **New navigation** | `Tab`/`TabSection` (SwiftUI), `UITab`/`UITabGroup` (UIKit), `sidebarAdaptable`/`tabSidebar` |
| **New pointer** | Re-test hover/highlight: **1:1** pointer, no magnetize; highlight is a liquid-glass platter |
| **Menu bar** | Every app gets its own menu bar: order by frequency, group, symbols + shortcuts; **never hide items** |
| **Smooth resize** | `isInteractivelyResizing` for heavy assets; don't break layout; revert when possible |
| **Minimum size** | `UISceneSizeRestrictions` — set a sensible min (don't block column count) |

## 2. Test matrix

| Axis | Values |
|---|---|
| Size | Compact (Slide Over/narrow) → Medium → Expanded → Large (small floating window ↔ full) |
| Orientation | Portrait · Landscape |
| Multitasking | Full · Split View (left/right) · Slide Over · Stage Manager (multiple windows) |
| Windows | 1 window · multiple windows in the same app · smallest allowed window |
| Navigation | Tab bar ↔ sidebar morph; collapsed/expanded split; inspector open/close |
| Input | Touch · pointer (hover/highlight, column resize) · keyboard (shortcuts, focus) · Pencil (pressure/azimuth/altitude/hover/double-tap) · drag & drop |
| A11y | Dynamic Type max · VoiceOver · Reduce Motion/Transparency · Full Keyboard Access · RTL |
| Data | Empty · loading · error · offline; state preserved across resize/window changes |

## 3. Common integration mistakes

| Mistake | Why it's wrong |
|---|---|
| Still using `UIRequiresFullscreen` | It will be ignored; the app won't resize correctly |
| Hiding menu items by context | Breaks spatial memory; the menu bar loses predictability |
| Window min width set too large | Reduces displayable columns; loses flexibility |
| "Open in place" for documents | Overwrites the window; loses context — use additive windows |
| No window names | Window picker menu becomes useless |
| Hover as the only way to reveal a feature | Pointer/touch/keyboard must be equivalent |
| Re-rendering assets every frame during resize | Jank; use `isInteractivelyResizing` |
| Sidebar/tab doesn't morph | Loses flexibility; the goal is width-based adaptivity |

## 4. Adoption checklist

- [ ] Scene life cycle; multiple windows; window names.
- [ ] System containers for nav; tab↔sidebar morph; inspector collapse ⇒ sheet.
- [ ] Toolbar wraps window controls; full menu bar + shortcuts; items never hidden.
- [ ] New pointer OK; Pencil covers all attributes; keyboard + drag & drop have alternatives.
- [ ] Resize doesn't break layout; sensible min size; compatibility modes removed.
- [ ] Run the §2 matrix; test on real hardware and many window sizes.
