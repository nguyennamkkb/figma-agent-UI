# watchOS API & Platform (latest)

> Compiled from WWDC26 *watchOS Group Lab* + WWDC25 *What's new in watchOS 26* +
> WWDC24/23 (Live Activities on Watch, Smart Stack widgets, watchOS 10 design) + HIG.
> **Note:** re-verify names/availability in Xcode & Apple Developer Documentation before use.

## 1. Architecture & platform

| Item | Details |
|---|---|
| **arm64** | Apple Watch Series 9+, Ultra 2 run **arm64** from watchOS 26; enable **Standard Architectures** in Xcode; mind `Float/Int` differences and pointer math; the simulator on Apple Silicon is already arm64 |
| Runtime | Tightly constrained (watchdog timeouts, few cores) — design lightweight background work, never hold sessions open needlessly |
| First launch | No time budget before first open → **bundle the essentials**, load the rest in the background; always show something before a spinner; plan for **fully offline** |
| Graphics | **SceneKit deprecated (watchOS 26)** → use **SwiftUI Canvas** (GPU, fast); **no RealityKit on watch** |

## 2. Design system & Liquid Glass

| Item | Details |
|---|---|
| Design language watchOS 10+ | Apps built for **watchOS 10+** automatically pick up the **new style** for toolbars/controls; still re-run to check legibility |
| watchOS 26 | New materials/controls, new app icons (**Icon Composer**), changes to watch faces & Control Center |
| watchOS 27 | **Refined Liquid Glass**: darker edges/clearer speculars, content separates while scrolling to preserve legibility, better performance, **interactive glass** (draggable buttons) |
| Users | **No dedicated slider clarity/tint on watch** (mostly dark UI, small screen); still respect **Reduce Transparency / Increase Contrast** |
| Transitions | Presentations use full-screen **thin material**; navigation bars have **variable blur**; `containerBackground` for full-screen backgrounds |

## 3. Complications & WidgetKit

| Task | API / notes |
|---|---|
| Modern complications | **WidgetKit** (watchOS 9+); don't use ClockKit for anything new |
| Families | accessoryCircular · accessoryRectangular · accessoryInline · accessoryCorner (+ Smart Stack uses `.accessoryRectangular`); design **every family** when possible |
| Face tinting | `widgetAccentable()`, `widgetAccentedRenderingMode(...)` — `nil` (default) · `primary` · `accent` (matches face color) · `desaturated` |
| Background | `containerBackground(for: .widget)` — visible only in the Smart Stack, **not** on the watch face |
| Gauge | Choose **closed** (proportion) vs **open + range** (interval) by data type; large value centered, range label below |
| Corner controls | Dial views support up to **4 corner controls** without covering content |

## 4. Smart Stack & RelevanceKit

| Task | API / notes |
|---|---|
| Legacy entry priority | `TimelineEntryRelevance(score:duration:)` — score ranks entries within the same timeline, duration = how long it stays relevant |
| Legacy relevant intents | `RelevantIntentManager`, `RelevantContext` (dates…), `AppIntentRecommendation` |
| **RelevanceKit** (watchOS 26) | Richer `RelevantContext`: **date, sleep schedule, fitness, location, point-of-interest category**; `WidgetRelevance` with attributes; **relevant widget** support |
| **Relevant widgets** | `RelevanceEntry` · `RelevanceEntriesProvider` (`relevance` + `entry` + `placeholder`) · `RelevanceConfiguration`; **multiple cards at once** for different events |
| Deduping | `associatedKind` on `RelevanceConfiguration` pointing at the timeline widget's `WidgetConfiguration` → the system **replaces** the timeline card with relevant cards |
| Preview | Preview with `relevanceEntries`, `relevance`, `RelevanceProvider` — per size/condition |
| Configurable widgets | Return an **empty array** for recommendations ⇒ users configure it themselves (with an availability check for watchOS 26) |
| Configurable controls | `AppIntentControlConfiguration` + `AppIntentControlValueProvider` (same as iOS) |
| Other tips | Workout apps earn suggestions with the right **`HKWorkoutActivityType`**, correct start/end, plus `HKWorkoutRouteBuilder` |

## 5. Controls on Apple Watch (watchOS 26+)

| Item | Details |
|---|---|
| Where they appear | **Control Center · Smart Stack · Action button** (Ultra) |
| Anatomy | Symbol + title + **tint** + context |
| Source | From the **iPhone app** (even without a Watch app) or from the Watch app — **same API as iOS** |
| Behavior | Tapping on watch executes **on iPhone** (for iPhone-app controls); controls whose action **foregrounds the iPhone app** **don't** appear on watch |
| Picking a type | **Control** = action; **Widget** = information; **Live Activity** = event with a start/end |

## 6. Live Activities on Apple Watch (watchOS 11+)

| Item | Details |
|---|---|
| Automatic | iOS Live Activities **appear automatically in the Smart Stack**; use **compact leading/trailing** views (from the Dynamic Island) unless customized |
| Customizing | `supplementalActivityFamilies(.small)` on `WidgetConfiguration`; read the **`activityFamily`** environment: `.small` = Smart Stack, `.medium` = iOS Lock Screen |
| Opening the app | Info.plist: **“Supports Launch for Live Activity Attribute Types”** (empty = all activities; or list each `ActivityAttributes`) |
| Updates | Sync **automatically** to watch (no separate push token needed); **budgeted**; **high-frequency** supported on request |
| Limited connectivity | Start / End / alerting updates are **prioritized**; the system shows “last connected” in the Smart Stack |
| Alerting updates | On the watch face: opens the Smart Stack → shows the alert → shows the Live Activity; app foreground: bottom banner with compact views |
| Always-On | The system switches to **dark + reduced luminance**; use **`isLuminanceReduced`** to drop/dim bright elements; `preferredColorScheme(.light)` still goes dark in Always-On; use **semantic colors** |

## 7. Navigation

| Structure | Use when | Notes |
|---|---|---|
| **NavigationSplitView** | Has source list + detail (weather, stocks) | Source list **folds under** detail, opened by tap; **seed the selection** to open straight into detail; detail should be clear enough to need no title |
| **TabView** | 2–5 peer regions, vertical scrolling | `verticalPage` style; **one tab may stretch** with content (localization, large text); animation driven by **selection** + `matchedGeometryEffect`; inner lists expand on their own |
| **NavigationStack** | Deep hierarchy | **Large title on the first view**, never on child views with a back button |

## 8. Layout, bars & materials

| Item | Details |
|---|---|
| System grid | Based on **screen curvature**; found in **Apple Design Resources** |
| 3 base layouts | **Dial-based** (dense info, full-screen color, ≤4 corner controls) · **Infographic** (chart + text + metric) · **List** (scroll to browse) |
| Insets | `scenePadding` for correct dial-view insets |
| Toolbar | `topBarLeading` / `topBarTrailing` placements (the clock shifts to center), primary buttons in the **bottom bar**; `controlSize` for large/emphasized buttons |
| Material | `ultraThin` · `thin` · `regular` · `thick` for full-screen backgrounds; **vibrant fill** for control/platter cells; text **primary/secondary/tertiary/quaternary** |
| Background | `containerBackground` + accent-tinted gradients; use color to **signal** (time of day, status) |
| Navigation bar | **variable blur** as content scrolls underneath |

## 9. Input & feedback

| Item | Details |
|---|---|
| **Digital Crown** | `digitalCrownRotation` (SwiftUI); the Crown is the **primary interaction axis** (scroll, paging, precise adjustment) **but always provide a touch alternative** |
| **Action button** | Binds the core function (Ultra); watchOS 26 brings **controls** to the Action button |
| **Double tap / gestures** | System gestures; don't invent hidden custom gestures |
| **Haptics** | Tactile feedback in place of sound/visuals; use the **right type at the right moment** |
| Dictation / Scribble | The primary text entry — avoid keyboards |
| Reorder (watchOS 27) | New **reorderable** API in SwiftUI (what Apple used to build Control Center) — the first draggable container sorting on watch |

## 10. Health & Workout

| Item | Details |
|---|---|
| WorkoutKit | Custom workouts, goals/pacers, **alerts** (power, pace), on-watch previews |
| **Heart rate zones + cycling power zones** (watchOS 27) | Flexible API; for use **during** workouts **and** post-workout analysis (time in zone) |
| **Perimenopause / menopause** (watchOS 27) | New HealthKit API |
| Workout insights / buddy (watchOS 27) | Performance comparisons across weeks/months/years; workout experiences |
| Correct activity type | Use the right `HKWorkoutActivityType` + start/end + route to earn Smart Stack suggestions |

## 11. Widget updates (update paths)

| Path | Details |
|---|---|
| Timeline + reload policy | With an **expiration** ⇒ refresh guaranteed after it (the system may hold the old timeline briefly) |
| Invalidate from app | Call reload when fresh data arrives |
| **APNs push updates** | Since **watchOS 26** (every WidgetKit platform) |
| **Watch Connectivity updates** | Since **watchOS 27** — push from iPhone to watch |
| Budget | Watch face = highest tier, updates ~**every 15–20 minutes** while in active use; Smart Stack depends on **how often the user looks** (possibly ~once/day for infrequent viewers) |
| Docs | Apple: *Keeping your widget up to date*; WWDC26 *WidgetKit foundations* |

## 12. Intelligence on watch (watchOS 27)

| Framework | Notes |
|---|---|
| **Foundation Models** | Runs **over the network** (not on-device, doesn't borrow the iPhone model): **PCC** (needs entitlement) or a provider following the **language model protocol** (Claude/Gemini support coming, or conform yourself) |
| Check before calling | Availability-check API; **always have a fallback** (no cellular, quota exhausted, token usage) |
| Good fits | Summarizing long text for the small screen, making text easier to parse, insights from health data |
| Vision · Core AI | Present on watchOS 27 |

## 13. Tooling & testing

| Item | Details |
|---|---|
| Xcode 27 | Faster build/watch debugging; remember **Standard Architectures** (arm64) |
| **Device Hub** | Connects **watch ↔ Mac directly** (no iPhone proxy) ⇒ better reliability & throughput; needs a network allowing **peer-to-peer** (some corporate networks block it); newer watches have **5 GHz** Wi-Fi |
| Testing | Still test on **multiple Apple Watch generations** (no two users are alike) + Device Hub for more configurations |
| Feedback | File via Feedback Assistant + Developer Forums when hitting platform limits |

## 14. Coordination recipe

```
1) Pick the system space: Control (action) / Widget (information) / Live Activity (has start–end)
2) Complication: design every family, support tinting (widgetAccentable), backgrounds via containerBackground
3) Smart Stack: attach RelevanceKit (date/location/fitness/sleep/POI) + relevant widgets for multiple cards
4) Updates: timeline policy + APNs (26) / Watch Connectivity (27), respect the budget
5) Live Activity: supplementalActivityFamilies(.small) + activityFamily + isLuminanceReduced
6) Navigation: NavigationSplitView / TabView(verticalPage) / NavigationStack
7) Layout: system grid, dial/infographic/list, scenePadding, toolbar placements, vibrant text/fill
8) Input: Crown (+ touch alternative), Action button, haptics, dictation
9) Test: Device Hub across generations + arm64 + Always-On + limited connectivity + offline first launch
```