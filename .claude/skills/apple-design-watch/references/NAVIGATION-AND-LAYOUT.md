# Navigation, Layout & Materials — watchOS

> Distilled from WWDC23 *Design and build apps for watchOS 10* (Jennifer Patton & Matthew Koonce)
> + HIG *Designing for watchOS*.

## 1. The principle: "Apple Watch Moment"

- Core question: **"10 seconds of user attention — what information do I show?"**
- **Brief & focused:** drop extra tabs/levels; e.g. News on watch keeps only the **top 5 stories**, with a **vertical stack + inline expansion** feed.
- **Finite data first** (Heart Rate: concise numbers before the full-screen animation).
- **The Digital Crown is the primary interaction axis** (scroll, paging, precise adjustment) **but always provide a touch alternative**.
- Start design from: **which widget is best for the Smart Stack**, then architect the app around it.

## 2. Three navigation models

| Model | Use when | Rules |
|---|---|---|
| **NavigationSplitView** | Has a **source list + detail** (weather, stocks) | Source list **folds under** detail, opened with 1 tap; **seed the selection** to open straight into detail (use location/recency/frequency); detail clear enough to need **no title**; source list needs no title/close button ⇒ short bar, more comparable data visible |
| **TabView** | 2–5 **peer** regions, vertical scrolling | `verticalPage`; **one tab stretches with content** (localization/large text); animation driven by **selection** + `matchedGeometryEffect` (e.g. Activity rings collapsing into the toolbar); inner `List` expands on its own |
| **NavigationStack** | Deep hierarchy | **Large title on the first view**, never on child views with a back button; the new push animation emphasizes the selected view |

**Pick the model that reaches the "Apple Watch Moment" with the fewest interactions.**

## 3. Three base layouts (system grid)

Grid built from the **screen curvature** (found in **Apple Design Resources**), adapting to every size.

| Layout | For | Notes |
|---|---|---|
| **Dial-based** | Dense info, quick glances | Full-screen color/imagery; up to **4 corner controls**; use `scenePadding` for correct insets |
| **Infographic** | Chart/graph + text blocks + metrics | Pair visual data with numbers |
| **List** | Browse/search items | Vertical scrolling; compact rows |

## 4. Bars & controls

- `topBarLeading` / `topBarTrailing` — **the clock shifts to center** when a corner button is added.
- Primary action buttons go in the **bottom bar** (e.g. Now Playing: play/pause); use `controlSize` for **large/emphasized** buttons.
- SwiftUI uses the **same grid** ⇒ **no manual padding needed**.

## 5. Color & materials

- **4 full-screen background material levels:** `ultraThin` · `thin` · `regular` · `thick`.
- **Full-screen background gradients** tinted by accent — used to **set the tone** and **distinguish tabs** (Move/Exercise/Stand).
- **Color signals:** solar gradient (World Clock), color shifts on state change (Timer: black → orange when done).
- **Vibrant fill** for control/platter cells + **vibrant text**: primary · secondary · tertiary · quaternary.
- Presentations use **full-screen thin material** (seeing the blurred background ⇒ knowing where you are).
- **Variable-blur navigation bar** when scrolling.
- `containerBackground` for full-screen view backgrounds.

## 6. Navigation/layout checklist

- [ ] Answers the "Apple Watch Moment" within **10 seconds**.
- [ ] Exactly 1 of the 3 navigation models picked; ≤ 2–3 levels.
- [ ] Exactly 1 of the 3 base layouts picked; grid/`scenePadding` instead of hand-placed padding.
- [ ] Crown is primary **and** a touch alternative exists.
- [ ] Materials/vibrant text follow the hierarchy; backgrounds use `containerBackground`.
- [ ] Toolbar placements correct; the clock stays visible.
- [ ] Large text/localization ⇒ tabs stretch, never clip.
