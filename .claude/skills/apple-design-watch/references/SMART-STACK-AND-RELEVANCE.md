# Smart Stack, RelevanceKit & Picking the Right Space — watchOS

> Distilled from WWDC25 *What's new in watchOS 26*, WWDC23 *Build widgets for the Smart Stack*,
> WWDC26 *watchOS Group Lab*, WWDC25 *What's new in widgets*.

## 1. What the Smart Stack holds (watchOS 26+)

| Type | Purpose | Use when |
|---|---|---|
| **Control** | **Actions** (toggle, open a specific view) | "I want to do something right now" |
| **Widget** | **Information** throughout the day (weather, calendar) | "I want to glance at some information" |
| **Live Activity** | Events with a **start/end** (game, flight, delivery) | "Track progress while it unfolds" |

> Selection rule: **what is the primary purpose?** Action → control · Information → widget · Progress → Live Activity.

## 2. Relevance — the right content at the right time

### 2.1 The old way (still works)
- `TimelineEntryRelevance(score:duration:)`: **score** ranks entries within the same timeline; **duration** = how long it stays relevant.
- `RelevantIntentManager` + `RelevantContext` (by **date**) to declare the time windows when a widget should surface.
- `AppIntentRecommendation` for the configuration gallery.

### 2.2 RelevanceKit (watchOS 26)
- Available contexts: **date · sleep schedule · fitness · location · point-of-interest category** (grocery, cafe, beach…).
- `WidgetRelevance` with **attributes** for every related context; return `nil` for unsupported categories.
- **Relevant widgets**: `RelevanceEntry` → `RelevanceEntriesProvider` (`relevance`, `entry`, `placeholder`) → `RelevanceConfiguration`.
  - When several events are relevant at once (e.g. 3 events at 10:00), the system suggests **multiple cards**, one per event — solving the timeline widget's *truncation* problem.
- **Deduping:** `associatedKind` points at the timeline widget's kind ⇒ the system **replaces** the timeline card with the relevant cards.
- Preview: `relevanceEntries`, `relevance`, `RelevanceProvider` for previews per size & condition.

### 2.3 Lessons from the watchOS team (Group Lab)
- **Don't hold the top spot too long** — users will start dismissing it.
- Separate **alerts** from **suggestions**: some information deserves to *show* without necessarily *alerting* (e.g. a noise warning → suggestion first, notification later).
- **Not everything alerts**: sports example — basketball alerts per quarter, soccer alerts per goal.

## 3. Widget updates & budget

| Update path | Notes |
|---|---|
| Timeline + reload policy | With an **expiration** ⇒ refresh guaranteed after it |
| Invalidate from app | When fresh data arrives |
| **APNs push** (watchOS 26) | Every widget on every WidgetKit platform |
| **Watch Connectivity** (watchOS 27) | Push from iPhone to watch ⇒ iOS ↔ watch sync |

**Budget:**
- Watch face = highest tier — updates roughly **every 15–20 minutes** under heavy use.
- Smart Stack: depends on **how often the user looks** (infrequent viewers ⇒ possibly ~once/day).
- The system optimizes by **platform + engagement level**; don't treat widgets like apps.

## 4. Controls on watch (watchOS 26+)

- Appear in **Control Center, Smart Stack, Action button** (Ultra).
- Anatomy: **symbol + title + tint + context**.
- From the **iPhone app** (no Watch app needed) or from the Watch app; same API as iOS.
- iPhone-app controls: the action runs **on iPhone**; controls whose action **foregrounds the iPhone app** ⇒ **don't appear** on watch.
- Configurable: `AppIntentControlConfiguration` + `AppIntentControlValueProvider`.

## 5. Smart Stack checklist

- [ ] Pick the right type: control / widget / Live Activity by **primary purpose**.
- [ ] Configurable widgets where needed (empty recommendations array + availability check).
- [ ] RelevanceKit: attach contexts (date/location/fitness/sleep/POI) — matching **real-world context**.
- [ ] Overlapping events ⇒ **relevant widgets** + `associatedKind` deduping.
- [ ] Pick a fitting update path (timeline/APNs/Watch Connectivity) and respect the budget.
- [ ] Don't abuse the top slot; separate alerts from suggestions.
- [ ] Workout apps: correct activity type + route to earn suggestions.
