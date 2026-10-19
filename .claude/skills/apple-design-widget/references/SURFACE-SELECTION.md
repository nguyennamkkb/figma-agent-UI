# Choosing the Right Surface — Widget / Live Activity / Control / Complication

> Sources: WWDC25 *What's new in watchOS 26* / *What's new in widgets*, WWDC26 *WidgetKit foundations*,
> *Live Activities essentials*, HIG (Widgets, Live Activities, Controls).

## 1. Deciding Questions

| Purpose | Surface |
|---|---|
| **Display information** all day, updating on schedule/context | **Widget** (Home/Lock/Smart Stack) |
| **Track progress** with a **start – end** | **Live Activity** |
| **Perform an action** quickly (toggle, open a view) | **Control** |
| One data point right on the **watch face** | **Complication** (WidgetKit) |
| Update **outside the app**, needs the user's attention | **Notification** |

> "Primary purpose" decides: **action → control** · **information → widget** · **progress → Live Activity**.

## 2. Quick Comparison

| | Widget | Live Activity | Control | Complication |
|---|---|---|---|---|
| Lifetime | Persistent | Has start–end | Persistent | Persistent |
| Updates | Timeline / push / relevance | Realtime + push | On interaction/push | Timeline / push |
| Interaction | App Intent (limited) | App Intent / tap | 1 tap | Tap opens app |
| Surfaces | Home, Lock, StandBy, Smart Stack | Lock, Dynamic Island, StandBy, Smart Stack | Control Center, Smart Stack, Action button | Watch face |
| Budget | Yes | Yes (wider while active) | — | Yes |

## 3. When NOT to Use

- **Widget** for work that needs frequent actions ⇒ use a **control**.
- **Live Activity** for static content ⇒ wastes budget, adds noise.
- **Control** for displaying long information ⇒ use a widget.
- **Notification** as a replacement for the app's main screen.
- **Complication** for complex content ⇒ use a relevant widget (multiple cards).

## 4. Update Strategy

```
Scheduled data (weather, calendar)        -> timeline + reload policy
Data that changes NOW (prices, scores)    -> APNs push / invalidate from app
Needs RIGHT CONTEXT (place, time, fitness) -> RelevanceKit (watchOS 26+)
Push from iPhone to watch                 -> Watch Connectivity (watchOS 27)
Events with start–end                     -> Live Activity (realtime updates + clear ending)
```

## 5. Budget & Expectations

- Watch face (heavy use): ~**15–20 minutes**/update.
- Smart Stack: follows **how often the user views it** (rarely viewed ⇒ ~once/day).
- Live Activity: updates lag when the wrist is down, but **raising the wrist shows the latest**.
- **Don't treat a widget like an app** — no continuous updates, no held sessions.

## 6. Surface-Selection Checklist

- [ ] Is the primary purpose information / progress / action?
- [ ] Clear start–end ⇒ Live Activity.
- [ ] Needs 1 tap ⇒ control.
- [ ] On watch ⇒ consider complication + relevance.
- [ ] Pick the right update channel + respect the budget.
- [ ] If many overlapping events ⇒ relevant widget + `associatedKind`.
- [ ] Tap always opens the **right screen** (deep link).
