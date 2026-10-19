---
name: apple-design-watch
description: "Senior-level Apple Watch (watchOS) product design skill for the Apple ecosystem. Use when designing or auditing watchOS experiences — complications, Smart Stack, RelevanceKit, controls, Live Activities on the wrist, Always-On, Digital Crown, haptics, navigation and layout grids, health/workout features, and watchOS 26/27 APIs. Self-contained 14-section operating skill plus a deep reference library (API, COMPLICATIONS, SMART-STACK-AND-RELEVANCE, NAVIGATION-AND-LAYOUT, LIVE-ACTIVITIES-ON-WATCH, ALWAYS-ON-AND-HAPTICS, ADOPTION-TESTING), components, guidelines, specs, image analysis and assets."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "Apple Watch (watchOS)"
  updated: "2026-09-24"
---

# Apple Watch Design — Senior Skill

<!-- refs -->
> **References:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [COMPLICATIONS](references/COMPLICATIONS.md) · [SMART-STACK-AND-RELEVANCE](references/SMART-STACK-AND-RELEVANCE.md) · [NAVIGATION-AND-LAYOUT](references/NAVIGATION-AND-LAYOUT.md) · [LIVE-ACTIVITIES-ON-WATCH](references/LIVE-ACTIVITIES-ON-WATCH.md) · [ALWAYS-ON-AND-HAPTICS](references/ALWAYS-ON-AND-HAPTICS.md) · [SYNC-AND-CONNECTIVITY](references/SYNC-AND-CONNECTIVITY.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md) · [GLANCE-AND-MICRO-INTERACTION](references/GLANCE-AND-MICRO-INTERACTION.md)

> **Version note:** watchOS 26/27, Xcode 27 and WWDC26 details come from sources read on 2026-09-24. Verify them against the current Human Interface Guidelines and SDK before treating them as fact.



> Background sources: Apple HIG (Designing for watchOS, Complications, Notifications, Playing haptics, Digital Crown,
> Always-On, Action button, Watch faces) + **WWDC26 watchOS Group Lab**, WWDC25 334/278,
> WWDC24 10068/10098/10205/10084, WWDC23 10026/10029/10138 + WWDC26 *Principles of great design*.

## 1. Platform Mindset

- **Purpose:** bring critical information & actions to the **wrist** in **1–3 seconds**, no need to
  pull out the phone. The most **personal** device Apple has ever made (worn on the body, always on).
- **User context:** walking / working out / in a meeting / cooking; hands busy; quick glances; outdoors;
  sometimes **offline** (in the woods, at sea).
- **Platform goal:** *glanceable interaction* — the **"Apple Watch Moment"**: if you have **10 seconds**
  of attention, what do you show?
- **Native constraints:** tiny screen (multiple sizes, curved edges), no keyboard, tightly limited
  battery & runtime (watchdog), the **Digital Crown** as the signature interaction axis, haptics as the primary feedback channel.
- **Design consequences:** 1 screen = 1 idea; minimum text; action on the first screen; **no forms**; design for
  **glance** first, **interact** second, **exit** immediately.

## 2. Design Principles

**WHEN designing on Apple Watch → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Surface the most important information first | Make users scroll to find the point | Interaction time is extremely short |
| **1–2 step** flow to action | Multi-step wizards, long forms | One hand, in a hurry |
| Short labels **≤ 3 words** | Long sentences, jargon | Small screen, skimming |
| Max **2–3 controls/row** (3 glyph buttons or 2 text buttons) | Cramming in buttons | Fingers are bigger than controls |
| **Crown** for scroll/adjust **+ touch alternative** | Requiring the Crown to function | Different a11y & habits |
| Haptics of the right type, at the right moment | Gratuitous/constant buzzing | Loses signal value |
| **Always-On**: keep primary content, dim secondary | Distracting UI changes | Quick glance, no interaction |
| Complication/Smart Stack as the **primary entry** | Forcing users to open the app first | The watch face is the home screen |
| Pick the **right surface**: control/widget/Live Activity | Using a widget for actionable work | Each type has its own primary purpose |
| Design for **offline & first launch** | Assuming always-on connectivity | Watches get worn where there is no signal |

**Golden rule:** *If describing a Watch screen takes more than one sentence, that screen is too complex.*

## 3. Information Architecture

| Structure | Use when | Avoid when |
|---|---|---|
| **Complication** (watch face) | 1 glanceable data point | Complex content, multi-step flows |
| **Smart Stack — Widget** | All-day info (weather, calendar) | Actionable tasks |
| **Smart Stack — Control** | Quick actions (toggle, open view) | Long data displays |
| **Smart Stack — Live Activity** | Events with a **start–end** | Static content |
| **Vertical page (TabView)** | 2–5 peer regions | Deep navigation trees |
| **NavigationSplitView** | Source list + detail | Single screen only |
| **NavigationStack** | 2–3 level hierarchy | Peer-level content |
| **Notification** | Updates from outside the app | Used in place of the main screen |
| **Modal / full-screen** | Short, focused tasks | Long flows |

Tab bars **don't** fit. Navigation = complication/Smart Stack → app → **≤ 2 levels**.

## 4. Layout Rules

- **System grid** built from the **screen curvature**, adapting to every size (found in Apple Design Resources).
- **Three base layouts:**
  - **Dial-based** — dense information, full-screen color/imagery, max **4 corner controls**; use `scenePadding`.
  - **Infographic** — chart/graph + text blocks + metrics.
  - **List** — browsing/finding, vertical scroll.
- **Bars:** `topBarLeading` / `topBarTrailing` (clock shifts to center); primary action in the **bottom bar**;
  `controlSize` for larger buttons.
- **Full-screen background materials:** `ultraThin` · `thin` · `regular` · `thick`; **vibrant fill** for controls;
  text in **primary → quaternary** hierarchy; `containerBackground` for backgrounds.
- **Bezel:** round-family content must stay inside the bezel safe area.
- **Always-On:** dark + reduced luminance; `isLuminanceReduced`.
- **Landscape/rotation:** only with a reason (photos, QR) — controlled autorotation.
- **Keyboard:** almost never used — use Crown, dictation, Scribble, pick lists instead.
- **Complication sizes (HIG):** 42/44.5/47/50 pt (84/89/94/100 px @2x); 27/28.5/31/32 pt (54/57/62/64 px @2x);
  11/11.5 pt (22/23 px @2x) for the smallest variant.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Complication** | Data on the watch face | Family + data + label | current/stale/placeholder | WidgetKit (watchOS 9+); support **every family**; multiple variants | Clear labels; never color alone | Only 1 family; stale data unflagged |
| **Smart Stack Widget** | Contextual info | Entry + view + relevance | placeholder/preview/current | RelevanceKit for right-time surfacing; `containerBackground` | Readable; never color alone | Hogging the top spot too long |
| **Control** | Quick action | Symbol + title + tint + context | on/off/updating | Control Center/Smart Stack/Action button; configured via AppIntent | Clear title + value | Foreground iPhone app action → won't appear |
| **Live Activity** | Progress tracking | compact/minimal/expanded | active/ended/stale | `supplementalActivityFamilies(.small)`; dedicated `.small` layout | `isLuminanceReduced`; semantic colors | Alerting on every change; lingering after completion |
| **Notification** | Update/action invitation | App name, title, body, actions | short look/long look | Short; 1 primary action; don't repeat the app | Buttons ≥ 44 pt; fully readable | Long content, multiple vague actions |
| **Gauge / Ring** | Progress/data | Ring/arc + value | determinate/indeterminate | **Closed** = proportion; **Open + range** = interval; range labels | Readable value; never color alone | Decorative meaningless gauge |
| **Dial view** | Dense info + corner controls | Full-screen + ≤4 corner controls | — | `scenePadding`; keep content clear of the bezel | Readable at small sizes | Cramming in too many numbers |
| **Digital Crown** | Precise scroll/adjust | Crown + haptic | — | Use for lists/values; **with touch alternative** | Has alternative | Requiring the Crown |
| **Action button** | Off-screen action | Physical button + feedback | press/long-press | Assign the **core function**; labels ≤ 3 words | Never the sole path | Retraining established habits |
| **Watch face** | Personalization | Complications + color | — | Support multiple faces; tinted; full-screen color | Good contrast | Photos that break tinted mode |
| **List** | Select/browse | Row + icon + label | selected | ≤ 5–7 items per view; clear grouping | Row = 1 element | Long ungrouped lists |
| **Haptics** | Non-visual feedback | Semantic buzz per context | success/warning/failure | Right semantics; no overuse | Paired with visual representation | Constant buzzing that annoys |
| **Empty/Loading/Error** | States | Icon + 1 line + action | — | Short, with an exit; **first launch must show something** | Readable | Endless spinner |
| **Reorder (watchOS 27)** | Container ordering | Draggable list | idle/dragging | New reorderable API in SwiftUI | Has alternative | No feedback while dragging |

### 5.1 Key new APIs (summary)

| Area | Key APIs |
|---|---|
| Architecture | **Standard Architectures / arm64** (Series 9+, Ultra 2, watchOS 26+) |
| Complication/Widget | **WidgetKit**; `widgetAccentable()` · `widgetAccentedRenderingMode`; `containerBackground(for: .widget)` |
| **RelevanceKit** (26) | `RelevantContext` (date/sleep/fitness/location/POI) · `WidgetRelevance` · `RelevanceEntry` · `RelevanceEntriesProvider` · `RelevanceConfiguration` · `associatedKind` |
| Legacy relevance | `TimelineEntryRelevance(score:duration:)` · `RelevantIntentManager` · `AppIntentRecommendation` |
| **Controls** (26) | WidgetKit control; Control Center/Smart Stack/Action button; `AppIntentControlConfiguration` + `AppIntentControlValueProvider` |
| Live Activity | `supplementalActivityFamilies(.small)` · `activityFamily` · key “Supports Launch for Live Activity Attribute Types” · `isLuminanceReduced` |
| Updates | timeline reload policy · **APNs push (26)** · **Watch Connectivity (27)** |
| Navigation | `NavigationSplitView` · `TabView` (verticalPage) · `NavigationStack` · `matchedGeometryEffect` |
| Layout | `scenePadding` · toolbar `topBarLeading`/`topBarTrailing` · `controlSize` · `containerBackground` · material ultraThin→thick · text primary→quaternary · **reorderable API (27)** |
| Health | WorkoutKit · **heart-rate zones + cycling power zones (27)** · perimenopause/menopause (27) · workout insights/buddy (27) |
| Intelligence (27) | **Foundation Models** (network-mediated: PCC needs entitlement / language model protocol; always provide a fallback) · Vision · Core AI |
| Graphics | **SceneKit deprecated (26)** → **SwiftUI Canvas** (no RealityKit on watch) |
| Tooling | **Xcode 27** · **Device Hub** (watch ↔ Mac direct, peer-to-peer, 5 GHz) |

> Full table: [references/API.md](references/API.md).

### 5.2 Compatibility, connectivity & iPhone ↔ Watch sync

| Area | Rule |
|---|---|
| **Companion / Independent / Family Setup** | WatchConnectivity **only** with a paired iPhone; **Family Setup ⇒ no companion** → use iCloud Keychain / Core Data + CloudKit / URLSession |
| **Picking the tool** | Keychain+iCloud (small, sensitive, rarely changing) · Core Data+CloudKit (DB, no companion needed) · **WatchConnectivity** (data that lives on only one side; optimizes the paired experience) · **URLSession background** (server calls) · Sockets (audio streaming) |
| **WatchConnectivity** | `applicationContext` (one dict, **overwrite** = latest value wins) · `transferUserInfo` (queued, **in order**, cancellable) · `transferFile` (inbox, **handle synchronously** in the callback) · `sendMessage` (needs **reachability** + reply) · `transferCurrentComplicationUserInfo` (priority, has a **budget**) |
| **Reachability** | **Asymmetric**: the iOS app can be woken in the background ⇒ reachable far more often; the Watch extension needs foreground/high-priority background |
| **State sync** | Single source of truth; push data the phone already has to the watch for a **fast launch**; the watch receives only what it needs (Core Data with multiple configurations) |
| **Background** | URLSession background + `sendsLaunchEvents`; with a visible complication: **≤ 4 refreshes/hour** spaced **≥ 15 minutes** apart; **always mark tasks complete** |
| **Widget / Live Activity** | Widget: APNs (**26**) / Watch Connectivity (**27**); Live Activity **syncs itself**, counts against the budget |
| **Architecture** | **arm64 / Standard Architectures** (Series 9+, Ultra 2, watchOS 26+); test on real hardware **without the debugger attached** |

> Details + failure modes + checklist: [references/SYNC-AND-CONNECTIVITY.md](references/SYNC-AND-CONNECTIVITY.md).

## 6. Screen Inventory

| Screen | Goal | Notes |
|---|---|---|
| Complication / watch face | Glanceable data | 1 data point, tinted, updated on time |
| Smart Stack | Contextual suggestions | RelevanceKit; don't hog the top too long |
| App Home | Entry point | 1 primary action |
| List / Picker | Quick selection | Short, Crown-assisted |
| Detail | View/listen | Minimal text, action up front |
| Active session (workout/timer) | Continuous tracking | Priority metrics; Always-On matters |
| Notification | Quick triage | Act right on the notification |
| Settings (thin) | Minimal customization | Good defaults; few choices |
| Permission | Permission request | Right moment, short explanation |
| Empty / Offline / Error | States | First launch & offline must have content |

## 7. UX Patterns

**Glance · Notify · Quick-action · Track · Timer · Remote · Confirm · Suggest**

- **Glance:** latest data on the complication/Smart Stack; open the app to learn more.
- **Suggest (RelevanceKit):** surface the widget for the right **real-world context** (place, time, fitness, sleep).
- **Track (workout):** quick start → metrics + Always-On during the session → clear finish.
- **Notify:** short look → long look; distinguish **alert** vs **suggestion**.
- **Confirm:** instant haptic feedback.
- **Quick-action (control):** 1 tap, no app opening.

## 8. Interaction Model

| Input | Rule |
|---|---|
| **Touch** | ≥ 44×44 pt; avoid curved edges |
| **Digital Crown** | Scroll/adjust; light haptic at detents; **always provide a touch alternative** |
| **Side / Action button** | Core function; labels ≤ 3 words; watchOS 26 attaches **controls** to the Action button (Ultra) |
| **Gestures** | Double tap & system gestures; no invented hidden gestures |
| **Voice** | Dictation + Siri instead of keyboards |
| **Haptics** | Primary feedback channel (confirmations/warnings/rhythm) |
| **Keyboard** | Minimize; when forced → dictation/Scribble |
| **Reorder (27)** | Drag-to-reorder containers (new reorderable API) |

## 9. Accessibility

- **VoiceOver:** every element labeled; complications read their values; reading order matches visuals.
- **Dynamic Type:** large text shrinks content volume — design for it (stretching tabs, expanding lists).
- **Contrast:** meet the standard; **never convey information by color alone** (especially complications/gauges).
- **Reduce Transparency / Increase Contrast:** bars & materials must stay legible.
- **Motion:** reduce motion; Always-On stays **non-distracting**.
- **Haptics:** supplementary, never the only channel.
- **Checklist:** [ ] VoiceOver · [ ] Dynamic Type · [ ] contrast · [ ] reduce transparency/motion ·
  [ ] meaningful haptics · [ ] Crown-free operation · [ ] every action has an alternative.

## 10. Performance Rules

- **Battery & runtime:** strict watchdog, few cores ⇒ background work **light, tight, justified**; no held sessions.
- **Update budgets:** face widget ~15–20 min while in use; Smart Stack follows viewing frequency;
  Live Activity has its own budget — **never treat it like a foreground app**.
- **No jank** with realtime data (workouts).
- **No cognitive overload:** 1 screen = 1 idea; ≤ 3 primary lines.
- **No deep hierarchy:** ≤ 2 push levels.
- **No heavy animation:** short, purposeful animation; respect Reduce Motion.
- **First launch/offline:** content immediately, rest loads in background, clear offline state.

## 11. Senior Review Checklist

- [ ] **Glanceability:** the screen is understood in **≤ 3 seconds**.
- [ ] **Navigation:** complication to action in ≤ 2 steps; always escapable.
- [ ] **Hierarchy:** most important info on top / in the primary slot.
- [ ] **Accessibility:** section 9 passes.
- [ ] **Discoverability:** no hidden gestures; no Crown dependency.
- [ ] **Performance:** sane battery & updates; no jank; budgets respected.
- [ ] **Empty/Loading/Error/Offline:** short, escapable, with content when offline.
- [ ] **Always-On:** dims correctly, non-distracting.
- [ ] **Haptics:** right type, right moment.
- [ ] **Complication:** every family; tinted OK; fresh data.
- [ ] **Smart Stack:** right control/widget/Live Activity; contextually relevant; no hogging the top.
- [ ] **Architecture:** arm64/Standard Architectures; tested across generations + Device Hub.

## 12. Failure Modes

| Mistake | Why it's wrong |
|---|---|
| Long forms / many steps | No typing possible; interactions too short |
| Requiring keyboard input | Watch is not an input device |
| Dense content, long text | Can't be glanced |
| Deep navigation | Users give up |
| Supporting only 1 complication family | Misses most watch faces |
| Ignoring Always-On | Dimmed screen loses information |
| Animation abuse | Burns battery, distracts |
| Meaningless haptics | Annoys, destroys signal |
| Digital Crown dependency | Unusable via touch/a11y |
| Using a widget for actionable work | Wrong primary purpose (use a control) |
| Hogging the Smart Stack top too long | Users dismiss the app |
| Alerting on every change | Alert fatigue (e.g. sports: only alert major milestones) |
| Assuming connectivity at first launch | Blank screen/hanging spinner off-coverage |
| Skipping the arm64 architecture | Wrong number types on Series 9+/Ultra 2 |
| Overusing on-device Foundation Models | watchOS 27 runs **over the network** — needs a fallback |

## 13. Design System Rules (token)

| Area | Rule |
|---|---|
| **Typography** | SF Compact/Dynamic Type; big type, few words; secondary text at least 11 pt; labels ≤ 3 words |
| **Spacing** | 4/8 pt rhythm; generous gaps; max **2–3 controls/row** |
| **Complication sizes** | 42/44.5/47/50 pt (84/89/94/100 px @2x); 27/28.5/31/32 pt (54/57/62/64 px @2x); 11/11.5 pt (22/23 px @2x) |
| **Radius** | Respect the screen shape (rounded) & bezel |
| **Elevation** | Almost no shadow; use contrast & system materials |
| **Materials** | full-screen: ultraThin/thin/regular/thick; vibrant fill for controls; `containerBackground` |
| **Text prominence** | primary · secondary · tertiary · quaternary (vibrant) |
| **Motion** | Very short, purposeful; respect Reduce Motion |
| **Color** | Semantic; works in tinted/Always-On; **never color alone** for information |
| **Adaptivity** | Runs well on every size 40–49 mm + **multiple generations**; vertical layout |

## 14. AI Decision Framework

```
IF platform == Apple Watch
THEN
  Primary goal = glanceable interaction ("Apple Watch Moment": 10 seconds)
  Layout       = vertical, 1 idea/screen, ≤ 3 primary lines, 2–3 controls/row, follow the system grid
  Navigation   = complication/Smart Stack → app → ≤ 2 levels; always an exit
  Priority     = 1) Information  2) Action  3) Exit
  Input        = touch + Crown (+touch alternative) + dictation + haptics
  Required     = correct Always-On · labels ≤ 3 words · meaningful haptics · support every size/generation
  Avoid        = forms · keyboards · multi-step · dense content · deep navigation · single family only

# Picking the surface
IF purpose is fast ACTION        THEN Control (Control Center/Smart Stack/Action button)
IF purpose is all-day INFO       THEN Widget (timeline)
IF it is an EVENT with start–end THEN Live Activity (→ rises to Smart Stack automatically)
IF content needs real-world context THEN RelevanceKit (date/sleep/fitness/location/POI)
IF many overlapping events       THEN relevant widget + associatedKind (dedupe)

# Layout & interaction
IF 2–5 peer sections             THEN TabView (verticalPage), tabs stretch with content
IF source list + detail          THEN NavigationSplitView, initialize selection
IF deep hierarchy                THEN NavigationStack (large title on the first view)
IF dense info + corner controls  THEN Dial view (scenePadding, ≤ 4 corner controls)
IF chart/metric                  THEN Infographic layout
IF value needs adjusting         THEN Crown + haptics + touch alternative
IF off-screen action             THEN Action button (≤ 3 words) + haptics

# State & engineering
IF Always-On                     THEN dim secondary, keep primary content; isLuminanceReduced
IF task needs heavy text entry   THEN move to iPhone (or minimal dictation)
IF long session (workout)        THEN metrics + Always-On + clear finish
IF widget needs updates          THEN timeline policy / APNs (26) / Watch Connectivity (27), respect the budget
IF first launch without network  THEN immediate content + background load + offline state
IF using Foundation Models       THEN check availability + fallback (network-only)
IF rendering 3D                  THEN SwiftUI Canvas (SceneKit deprecated; no RealityKit)
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).