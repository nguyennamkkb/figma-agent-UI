# API & WidgetKit / ActivityKit Platform

> Consolidated from WWDC26 *WidgetKit foundations*, *Live Activities essentials*, WWDC25 *What's new in
> widgets* / *What's new in watchOS 26*, WWDC24/23 (controls, Smart Stack, Live Activities on Watch).
> **Verify names/availability in Xcode before use.**

## 1. Basic Widget

| Component | Role |
|---|---|
| **Entry** (`TimelineEntry` / `RelevanceEntry`) | Data used to render one state |
| **Provider** (`AppIntentTimelineProvider` / `RelevanceEntriesProvider`) | Creates entries + **advises WidgetKit when to update** |
| **Configuration** (`AppIntentConfiguration` / `RelevanceConfiguration`) | Binds provider + entry + view |
| **View** | SwiftUI; use `containerBackground(for: .widget)` |
| **Families** | `systemSmall` · `systemMedium` · `systemLarge` · `systemExtraLarge`; **accessory**: `circular` · `rectangular` · `inline` · `corner` |
| **Placeholder** | No-data-yet state (redacted) |
| **Previews** | `#Preview` per family/size; preview relevance to preview Smart Stack |

## 2. Updates (freshness)

| Channel | When to use | Notes |
|---|---|---|
| **Timeline + reload policy** | Data changes on a schedule | Has **expiration** ⇒ guarantees a refresh after that |
| **Invalidate from app** | Fresh data available right now | `WidgetCenter.reloadTimelines` |
| **APNs push** (watchOS 26+ / all platforms) | Server pushes updates | Use for news/prices… |
| **Watch Connectivity push** (watchOS 27) | Push from iPhone to watch | Keeps iOS ↔ watch in sync |
| **RelevanceKit** (watchOS 26) | Content matched to **context** | Context: date · sleep · fitness · location · POI |
| **Relevant widget** | Multiple cards per event | `RelevanceEntry` + `associatedKind` to avoid duplicates |

**Budget:** watch face ~**15–20 minutes** while in active use · Smart Stack follows view frequency ·
the system optimizes by **platform + engagement level**.

## 3. Interaction

- **Interactive widget**: `Button` / `Toggle` with an **App Intent** — simple, safe, easy-to-understand actions.
- **Control** (watchOS 26 / iOS 18+): WidgetKit control for **Control Center, Smart Stack, Action button**;
  composed of **symbol + title + tint + value**; configured with `AppIntentControlConfiguration` +
  `AppIntentControlValueProvider`; can come from the **iPhone app** (no watch app required).
- **Snippet**: small interactive UI inside a link/App Intent.
- **No**: scrolling, text input, or complex gestures inside a widget.

## 4. Live Activities (ActivityKit)

| Item | Details |
|---|---|
| Declaration | `ActivityAttributes`; start/end/end early |
| Surfaces | Lock Screen · **Dynamic Island** (compact leading/trailing, minimal, expanded) · StandBy |
| On watch | **Appears automatically in Smart Stack** (watchOS 11+); customize with `supplementalActivityFamilies(.small)` + read `activityFamily` (`.small` = Smart Stack, `.medium` = iOS Lock Screen) |
| Opening the watch app | Info.plist “Supports Launch for Live Activity Attribute Types” |
| Updates | Sync automatically to watch; **has a budget**; supports **high-frequency** on request |
| Limited connectivity | Start/End/alerting **take priority**; shows “last connected” |
| Always-On | `isLuminanceReduced`; the system switches to dark + dims |
| Selective alerts | Don't alert on every change (e.g. sports: alert on major milestones only) |

## 5. Rendering & style

| Item | Details |
|---|---|
| Background | `containerBackground(for: .widget)` — only visible in Smart Stack, not on the watch face |
| Tint | `widgetAccentable()` + `widgetAccentedRenderingMode` (`nil`/`primary`/`accent`/`desaturated`) |
| Margins | **16 pt** standard; **11 pt** when grouping is needed; must be **concentric** with the corner radius |
| Type | **≥ 11 pt**; **medium** weight or higher for key information |
| Live Activity | Lock Screen margin **14 pt**; Dynamic Island corner **44 pt**; compact view (system truncates tall content); 2× scale when opened |
| Resize (visionOS) | Widget templates scale **75%–125%** |
| Tinted mode | Must stay legible with color removed |

## 6. Platforms

| Platform | Differences |
|---|---|
| iOS/iPadOS | Home Screen, Lock Screen accessories, StandBy, Control Center |
| watchOS | Watch face (complication), **Smart Stack**, RelevanceKit, controls |
| macOS | Desktop widgets; notification center |
| visionOS | Widgets floating in space, depth |
| CarPlay | Widgets on the car display (same size class as Smart Stack) |

## 7. Recipe

```
1) Pick a surface: widget (information) / Live Activity (start–end) / control (action) / complication
2) Design one idea; type ≥11pt; 16pt concentric margins; tinted OK
3) Pick an update channel: timeline policy → APNs → Watch Connectivity → relevance
4) Minimal interaction: App Intent button/toggle; tap → deep link to the right screen
5) Live Activity: compact/minimal/expanded + supplementalActivityFamilies(.small) + isLuminanceReduced
6) Test: every family/size, tinted, dark/light, Always-On, 75–125% resize, budget
```
