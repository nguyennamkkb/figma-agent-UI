---
name: apple-design-widget
description: "Senior-level Widget/WidgetKit design skill for the Apple ecosystem (iOS/iPadOS/watchOS/macOS/visionOS). Use when designing or auditing widgets, Live Activities, Lock Screen accessories, Control Center controls, StandBy, and interactive snippets — sizes, timelines, tinted mode, margins, glanceability, interaction. Self-contained 14-section operating skill with component library, a11y, review checklist, failure modes, tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "Widget / WidgetKit"
  updated: "2026-09-24"
---

# Widget Design — Senior Skill

<!-- refs -->
> **References:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [SURFACE-SELECTION](references/SURFACE-SELECTION.md) · [FRESHNESS-AND-LEGIBILITY](references/FRESHNESS-AND-LEGIBILITY.md)








> Background: Apple HIG (Widgets, Live Activities, Controls, Snippets) + WWDC25 278/255/281,
> WWDC24 10098.

## 1. Platform Mindset

- **What it exists for:** bringing **one piece of live information** out of the app — Home Screen, Lock Screen,
  Control Center, StandBy, watch face — so users get it **at a glance** without opening the app.
- **User context:** multitasking; glancing at the phone on the desk; device locked; charging
  (StandBy); working out (Watch).
- **Platform goal:** *at-a-glance value* + *deep link into action*. A widget is not a mini app.
- **Native constraints:** no scrolling, no text input, updates on a **timeline**, very limited space,
  limited interaction (App Intents).
- **Design consequences:** 1 widget = 1 idea; large/bold type; standard margins; hide sensitive data when locked;
  tap opens the app in the right context.

## 2. Design Principles

**WHEN designing a widget → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Pick the **1 most important piece of information** per widget | Cram in multiple goals | Users only glance |
| Use large type, **medium weight or higher**; little small type | Thin, small type | Reading in sunlight/at a glance |
| **16 pt** margins (11 pt minimum when tight) | Flush to the edge | Avoids cramped feel, improves legibility |
| **Concentric** layout matching the corner radius | Uneven margins | Visual harmony |
| Hide sensitive info when the device is locked | Show balances/private messages | Privacy on the Lock Screen |
| Update on time (timeline/push) | Update continuously | System limits & battery |
| Tap opens the **right related screen** | Open the app at a generic home | The user already has context |
| Use App Intent interactions for toggles/actions | Force opening the app for simple actions | Adds value in place |

**Golden rule:** *If a widget needs an explanation to be understood, it isn't done yet.*

## 3. Information Architecture

| Structure | Use when | DON'T use when |
|---|---|---|
| **widgetSmall** | 1 metric / 1 state | Lists with many items |
| **widgetMedium** | 1 goal + 1–2 secondary items | Dense data tables |
| **widgetLarge / ExtraLarge** | A few peer items, small grid | Content that needs scrolling |
| **accessoryCircular** | 1 status metric (watch face/Lock) | Long content |
| **accessoryRectangular** | 2–3 lines | Long paragraphs |
| **accessoryInline** | Single line | Lots of information |
| **accessoryCorner** | 1 value in a corner | Complex content |
| **Live Activity (compact/minimal/expanded)** | Ongoing progress | Static content |
| **Control Center control** | Toggles, quick actions | Complex configuration |
| **StandBy** | Glancing while charging, landscape | Text input |
| **Smart Stack** | Multiple widgets rotating by context | A single purpose |

Rule: **one widget = one idea**; when hierarchy is needed, use a larger size instead of compressing content.

## 4. Layout Rules

- **Standard margins:** **16 pt** for most widgets; **11 pt** is fine when grouping content/graphics.
- **Type:** use fonts **≥ 11 pt**; smaller type is hard for many people to read.
- **Live Activity:** Lock Screen margin **14 pt**; Dynamic Island corner radius **44 pt**; tapping transitions
  to the Lock Screen scaled up **2×**; keep the Lock Screen view compact — the system truncates tall content (check the current limit in the HIG).
- **Concentric:** margins/spacing must be **concentric** with the container's corner radius.
- **Tinted/vibrant:** content must look good in tinted mode (Lock Screen/tinted Home).
- **Dynamic Type/scale:** widgets can be scaled; content must survive size changes.
- **No scrolling, no text input** — everything fits inside the frame.
- **Template resize (visionOS):** widget templates scale **75%–125%** — design to survive both extremes.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Widget (static)** | Glance at information | Container + content + optional label | placeholder/current/stale | 1 idea; large type; standard margins | Full labels; never color alone | Stale data unmarked; too many items |
| **Interactive button** | In-place action | Label/icon + intent | idle/in-progress/done | Only simple, clear actions; state feedback | Clear labels; state announced | Vague actions; no feedback |
| **Toggle (control)** | On/off | Symbol + title + value | on/off/updating | Update accurately on interaction/push | State announced | Color change not announced |
| **Progress / Gauge** | Progress | Bar/ring + value | determinate/indeterminate | Use when there is real progress | Value readable | Indeterminate gauge for known data |
| **Timeline entries** | Time-based updates | Entries + policy | current/future/stale | Update on time, don't abuse | New content re-announced | Late/missing updates |
| **Live Activity** | Ongoing progress | compact/minimal/expanded | active/ended/stale | Realtime-changing content; clear ending | State readable | Abused for static content |
| **Control** | Control Center action | Symbol + title + value | active/inactive/config | Suggestive symbol; hint text; hide when locked | Clear title + value | Cryptic symbol; no hint |
| **Snippet** | Small interactive UI in links/App Intents | Compact view | — | Use familiar UI; keep compact | Good contrast | Cramming complex UI in |
| **Placeholder / Empty** | No data yet | Neutral content | placeholder/redacted | Keep layout stable | Reads "loading" | Flashing/jumping layout |

## 6. Screen Inventory

| Surface | Goal | Notes |
|---|---|---|
| Home Screen widget | Quick glance | 1 idea; tinted mode |
| Lock Screen accessory | Glance while locked | Hide sensitive data |
| Live Activity (Lock/DI) | Track progress | compact/minimal/expanded; clean ending |
| Control Center | Quick actions | Symbol + title + value + hint |
| StandBy | Glance while charging | Large type, high contrast |
| Smart Stack | Rotate by context | Prioritize the right moment |
| Watch complication | Glance on the wrist | See Apple Watch skill |

## 7. UX Patterns

**Glance · Live-progress · Quick-toggle · Deep-link · Context-rotate (Smart Stack)**

- **Glance:** latest data immediately, no need to open the app.
- **Live-progress:** start → update → end; never leave a state "hanging".
- **Quick-toggle:** 1 tap changes state, immediate feedback.
- **Deep-link:** tap → the related screen (not a generic home).

## 8. Interaction Model

| Input | Rule |
|---|---|
| **Tap** | Opens a deep link or runs an App Intent |
| **Button/Toggle** | Only simple, safe, easy-to-understand actions |
| **Scrolling** | ❌ none in widgets |
| **Keyboard/Voice** | ❌ none in widgets (use the app instead) |
| **Focus (watchOS/macOS)** | Support focus navigation for interactive elements |
| **VoiceOver** | Every element has a label; states are announced |

## 9. Accessibility

- **VoiceOver:** labels for every value; never color alone.
- **Dynamic Type:** type ≥ 11 pt; survives 75–125% scaling.
- **Contrast:** passes even in tinted mode.
- **Motion:** minimal animation; no flashing.
- **Privacy:** hide sensitive info on Lock Screen/Always-On.
- **Checklist:** [ ] VoiceOver labels · [ ] ≥11 pt · [ ] tinted mode · [ ] contrast ·
  [ ] never color alone · [ ] hide sensitive data · [ ] stable placeholder.

## 10. Performance Rules

- Respect the update budget (timeline): update when needed, not "because we can".
- Avoid large/poorly compressed images; use vector/text content.
- No heavy animation in widgets/Live Activities.
- Don't cram content → a widget must "read in 1 second".
- Never go stale silently: mark the update time when needed.
- Live Activity: end on time, never leave orphaned states.

## 11. Senior Review Checklist

- [ ] **Glanceability:** understood in ≤1–2 seconds.
- [ ] **Information hierarchy:** 1 key idea; secondary parts don't dominate.
- [ ] **Accessibility:** section 9 passes (especially tinted & type ≥11 pt).
- [ ] **Discoverability:** tap opens the right screen; no hidden actions.
- [ ] **Performance:** sensible updates, no stale data.
- [ ] **Empty/Loading/Error:** stable placeholder, no layout jumps.
- [ ] **Privacy:** sensitive data hidden when locked.
- [ ] **Sizes:** designed for small→large + accessories; survives 75–125%.
- [ ] **Interactive:** toggles/buttons have state feedback.
- [ ] **Margins:** 16 pt (or 11 pt) and concentric with the corner radius.

## 12. Failure Modes

| Failure | Why it's wrong |
|---|---|
| Widget as a mini app | No scrolling/input → useless |
| Small type (<11 pt) | Unreadable in sunlight, poor a11y |
| Cramming many metrics | Can't glance |
| Continuous updates | Exceeds budget, drains battery, gets throttled |
| Showing sensitive data when locked | Privacy leak |
| Tap opens the app at a generic home | Loses context, adds steps |
| Live Activity for static content | Wrong purpose, adds noise |
| Off margins, flush to the edge | Looks cramped, unprofessional |
| Not testing tinted mode | Broken color on the Lock Screen |
| No placeholder | Layout jumps when data arrives |

## 13. Design System Rules (token)

| Category | Rule |
|---|---|
| **Typography** | ≥ 11 pt; medium weight or higher for key info; small type used sparingly |
| **Spacing** | 16 pt margins (11 pt minimum); spacing **concentric** with the corner radius |
| **Radius** | Follow the system; content must fit concentrically |
| **Elevation** | No shadows; use system contrast/materials |
| **Motion** | Minimal; no flashing; clear state transitions |
| **Color** | Semantic; works in tinted/vibrant; never color alone |
| **Adaptivity** | Survives 75–125% scaling; covers all sizes & accessories |

## 14. AI Decision Framework

```
IF type == Widget / Live Activity / Control
THEN
  Primary goal  = glanceable value + deep link
  Layout        = 1 idea; type ≥11pt; 16pt margins (min 11pt); concentric
  Updates       = on-time timeline/push, never continuous
  Input         = tap (deep link) + App Intents (toggle/action)
  Priority      = 1) Information  2) Quick action  3) Open app
  Required      = tinted OK · sensitive data hidden · stable placeholder · all sizes
  Avoid         = scrolling · text input · small type · multiple goals · continuous updates

IF content is "happening now"    THEN Live Activity (compact+expanded), clear ending
IF simple action (on/off)        THEN Control/App Intent, don't open the app
IF needs >1 goal                 THEN split the widget or grow the size, never compress
IF private data                  THEN hide when locked/Always-On
IF updates are irregular         THEN timeline policy + clear stale state
IF content needs a long read     THEN open the app — the widget is for glancing only
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).