# New APIs for iPhone Duo (SwiftUI + UIKit / AVKit)

> Collected from 6 Tech Talks 2026 (*Design*, *Prepare*, *Raise the bar*, *Strike a pose*,
> *Leverage multiple displays and scenes*, *Camera*).
> **Note:** names/availability per documentation at the time of 2026-09; some APIs are tied to a specific SDK
> (iOS 26, iOS 27, **iOS 27.1**). Always re-verify in Xcode/Apple Developer Documentation.

## 1. Readiness by SDK

| SDK | Behavior gained |
|---|---|
| before iOS 27 | App runs; outer uses the left status-bar area; inner at a familiar size |
| iOS 27 | Expands left of the status-bar area on inner (thanks to iPhone resizing support) |
| **iOS 27.1** | **Full screen + vertical bars**; **ReservedRegion** and **Arrangement** available |

## 2. Layout, size class, corner radius

| Purpose | SwiftUI | UIKit | Notes |
|---|---|---|---|
| Read size class | `@Environment(\.horizontalSizeClass/\.verticalSizeClass)` | `UITraitCollection` | Source of truth instead of orientation |
| Concentric corners | `ConcentricRectangle` | `UICornerConfiguration` | iOS 26+; updated for Duo shapes |
| Background past safe area | `ignoresSafeArea(...)` | use `view.bounds` | Foreground inside safe area, background past it |
| Insets | `safeAreaInsets` (environment) | `safeAreaInsets`, `safeAreaLayoutGuide` | **Asymmetric** — handle each edge |

## 3. Reserved regions (iOS 27.1)

| Purpose | SwiftUI | UIKit |
|---|---|---|
| Access the region | `GeometryProxy.reservedRegion(...)` inside `GeometryReader` / `onGeometryChange` | `UIView.reservedRegion(...)` |
| Region frame | — | `frame` (of `UIView.ReservedRegion`) |
| Filter by state | only **active** by default | `includeInactive` to also fetch inactive ones |
| Region kind | `.division` (fold), `.occlusion` (camera) | counterparts |
| Push content out of the region | `ReservedRegion` | `UIView.ReservedRegion` |

**Usage rule:** query only **active** to dodge the present; also query **inactive** for structural decisions
(e.g. a grid with an **even column count** when a division region exists even while flat).

## 4. Arrangements (iOS 27.1)

| Purpose | SwiftUI | UIKit |
|---|---|---|
| Container | `ArrangementView(primary:secondary:)` | `UIArrangementViewController` (+ `primaryViewController`, `secondaryViewController`) |
| Pick the kind | `.arrangementViewStyle(.split / .overlay)` | `updateArrangement(...)` with `UISplitArrangement` |
| Constrain the axis (split) | `.axes(...)` | axis config on `UISplitArrangement` |
| Overlay layer | `@Environment(\.overlayArrangementZIndex)` | `stateForViewPlacement(...)` → `zIndex` |
| Collapse secondary | supported | supported |

**Prohibitions:** placing a navigation container **inside** an arrangement; placing an arrangement **inside** a `List`/`ScrollView`.

## 5. Bars — vertical bars, axis, overflow

| Purpose | SwiftUI | UIKit |
|---|---|---|
| Item display priority | `ToolbarItemVisibilityPriority` | `UIBarButtonItemVisibilityPriority` |
| Pick who compresses first | `ToolbarVerticalCompressionBehavior` | `UIVerticalBarCompressionBehavior` |
| Merge app overflow into the system menu | `ToolbarOverflowMenu` | `additionalOverflowItems` |
| Item axis | `AxisBehavior` (`.horizontal`, `.verticalPreferred`…) | counterparts |
| Know you're in a vertical bar | `@Environment(\.toolbarVerticalEdge)` | matching trait |
| Enable/disable the vertical bar | `toolbarVerticalBehavior`, `preferredVerticalBarBehavior` | counterparts |
| Special positions | `cancellationAction` (Back/Close), `topBarPinnedTrailing` (prominent) | leading item + `leftItemSupplementsBackButton = false`; `pinnedTrailingGroup` |
| Standard badge (turns text→symbol-only) | Badge API (iOS 26) | Badge API (iOS 26) |

**Remember:** **symbol-only** items go on the vertical axis; **text-only** stays horizontal; items that **toggle symbol↔text**
use `horizontal-only`; every item should have **both title + symbol**; **never add your own spacing** (use groups).

## 6. Window / scene / accessory

| Purpose | API |
|---|---|
| Create a new window (only **inner**) | scene APIs; `UIWindowSceneActivationAction` (auto-hides when unavailable) |
| Attach secondary UI on the other display | **scene accessory**: `sceneAccessory` modifier |
| Camera accessory | **`CameraCaptureAccessory`** (when the app is full screen on inner + camera session active) |
| Track accessory availability | `onAvailabilityChange` / observation tracking |
| Handle scene-request errors | outer **cannot** create new windows |

## 7. Hinge

| Purpose | API |
|---|---|
| Listen to the hinge | `onHingeChange` (SwiftUI) · `UIHingeInteraction` (UIKit) |
| Data | **closed / partially open / fully open** states + **continuous angle** |
| Note | `nil` when the device **has no hinge** → check existence + **reset state**; for **effects**, not layout |

## 8. Camera (AVKit / AVFoundation)

| Purpose | API |
|---|---|
| Find the front camera | `AVCaptureDeviceDiscoverySession`, position `.front` (+ Wide/Ultra Wide) |
| Auto-switch cameras per pose | **Virtual Front Camera** (common features only: **1080p60, no depth**) |
| Full capability per camera | device type **outer ultrawide** (4K120) · **inner ultrawide** (1080p60) — **depth only with individual cameras** |
| Auto-switch on open/fold | **`AVCaptureDeviceDirectionCoordinator`** (UIView + device types + change handler) |
| Pass safely across actors | **`AVCaptureDeviceDescriptor`** (main-actor safe, sendable) |
| Correct-orientation preview | **rotation coordinator**; then **turn off sensor-orientation compensation** |
| Preview aspect per display | `dynamicAspectRatio` on `AVCaptureDevice` (square sensor) |
| How the preview fills its bounds | `videoGravity` on `AVCaptureVideoPreviewLayer` |
| Mirror | Enable mirror when a **rear camera faces the user** (natural selfie feel) |

## 9. Tooling (not APIs)

| Tool | Job |
|---|---|
| **Xcode 27.1** | SDK for the full Duo experience |
| **Device Hub** | Run the iPhone Duo simulator; **open / close / rotate / fold** buttons |
| **App Resizability skill** | Audit resize best practices (supports SwiftUI + Duo) |
| Apple Design Resources | Margins & safe areas, screenshot specifications |

## 10. API coordination recipes

```
1) Read size class        -> decide 1 pane / 2 panes
2) Read reservedRegion    -> dodge fold + camera; even-column grid
3) Pick container         -> NavigationSplitView (main–detail) or ArrangementView (split/overlay)
4) Bars                   -> let the system switch axes; set AxisBehavior + visibility priority + compression
5) Hinge                  -> interaction effects only (not layout)
6) Camera                 -> virtual by default; individual devices + direction coordinator when depth/4K needed
7) Scene/accessory        -> new windows on inner only; accessory tracks availability
8) Test                   -> Device Hub 6 poses × 2 orientations × 2 multitasking sides × RTL
```
