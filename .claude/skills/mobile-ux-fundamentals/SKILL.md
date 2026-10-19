---
name: mobile-ux-fundamentals
description: "Platform-agnostic mobile UI/UX fundamentals for product designers and AI agents: touch targets, interaction states, primary/secondary hierarchy, presentation surfaces (sheet/dialog/snackbar/banner), state lifecycle (idle/loading/empty/error/offline), feedback and response-time limits, thumb-zone ergonomics, gestures and accessibility (WCAG 2.5.x). Use when designing, auditing, or reviewing any mobile screen, flow, wireframe, or design system — or when a decision must be justified with numbers rather than taste. Complements the Apple platform skills (apple-design-iphone, apple-design-ipad, apple-design-watch, apple-design-widget, apple-design-iphone-duo)."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform mobile (iOS / Android / mobile web)"
  updated: "2026-09-25"
---

# Mobile UX Fundamentals — Senior Skill

> **References:** [TOUCH-AND-TARGETS](references/TOUCH-AND-TARGETS.md) · [INTERACTION-STATES](references/INTERACTION-STATES.md) · [HIERARCHY](references/HIERARCHY.md) · [PRESENTATION](references/PRESENTATION.md) · [STATE-LIFECYCLE](references/STATE-LIFECYCLE.md) · [FEEDBACK-AND-TIMING](references/FEEDBACK-AND-TIMING.md) · [GESTURES-AND-A11Y](references/GESTURES-AND-A11Y.md) · [EVIDENCE](references/EVIDENCE.md) · [SOURCES](references/SOURCES.md)

> Sources: WCAG 2.2 (W3C), Apple HIG, Material Design 3, IBM Carbon, Nielsen Norman Group,
> Steven Hoober's ergonomics research + industry practice.
> This is the shared **foundation layer**; when working in the Apple ecosystem, pair it with the matching platform skill.

## 1. Platform Mindset

- **What the phone is in daily life:** a **personal, always-with-you device used while distracted**.
  Users are typically: one-handed, on the move, in bright light, with something else waiting.
- **Goal:** help them finish the task **fast, clearly, and forgivingly** — not to show off design.
- **Root constraints:** (1) fingers are bigger than pixels; (2) small screen ⇒ short attention; (3) shifting context
  (network, light, one hand, battery); (4) users **don't read, they scan**.
- **Consequences:** large enough touch areas · one goal/screen · clear hierarchy · complete states · instant feedback ·
  short flows with an exit.

## 2. Design Principles

**WHEN designing mobile → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Touch areas ≥ **44×44 pt / 48×48 dp** (floor **24×24 px**) | 16 px icon with no expanded touch area | Fingers aren't as precise as a mouse |
| **One primary action** per screen | Many equally prominent buttons | Multiple primaries cancel each other out |
| Primary action in the **green zone** (bottom) | Important CTA in the top corner | The thumb can't reach / must switch hands |
| Button labels = **verb + outcome** | Generic "OK", "Submit", "Continue" | Users need to know *what will happen* |
| Feedback in **< 100 ms** for every tap | Silence after tapping | Users wonder "did it register?" |
| Design **loading/empty/error/offline** alongside the main screen | Only the happy path | First-time users meet the empty state first |
| Errors state the **cause + fix** | "Something went wrong" | An unrecoverable error = dead end |
| Offer **undo** for destructive actions | Confirm everything | Undo is gentler; confirms cause fatigue |
| Every gesture has a **fallback** | Hidden gesture as the only path | Undiscoverable + poor a11y |
| Design for **one-handed use, left and right** | Assume two hands, right hand | 49% use one hand, 33% of them left-handed |

**Golden rule:** *If users have to think about "where to tap" or "what just happened",
the design is failing.*

## 3. Information Architecture

| Decision | Guidance |
|---|---|
| **Depth vs breadth** | Prefer **broader over deeper**: 3–5 same-level items > a 5-level tree |
| **Primary navigation** | Bottom navigation/tab bar (3–5 items), stable, never self-rearranging |
| **Drilling down** | Push/navigation stack for one branch; ≤ 3 levels to core content |
| **Separate tasks** | Modal/sheet — always with a clear Close/Back |
| **Secondary content** | Progressive disclosure (menu, expand, nested) |
| **Secondary actions on an item** | Context menu / overflow, **never** put the primary action there |
| **Destructive actions** | Separated from the primary action; need confirm or undo |

**Principle:** every screen answers 3 questions — *Where am I? What can I do? How do I get out?*

## 4. Layout Rules

- **Thumb zone (Hoober):** Green (bottom center) = primary actions · Yellow (lower halves on both sides) = secondary ·
  Red (top, far corners) = rarely used. **67%** of one-handed users use the **right** thumb.
- **Size by position:** top edge ~**11 mm**, middle ~**7 mm**, bottom ~**12 mm** (the thumb meets the
  bottom at a flatter angle ⇒ needs a larger touch area).
- **Rhythm & margins:** 4/8 pt grid; 16 pt screen margins; 12/24 pt control padding.
- **Safe area:** leave room for notch/status bar/home indicator; scrollable content may run under bars.
- **One column** on phones; no multi-column tables.
- **Dynamic Type / font scale:** layout must reflow, never clip text; secondary text ≥ 11 pt.
- **Density:** airier than desktop; group with whitespace, not heavy rules.
- **Orientation:** portrait is the default; landscape only with a reason (media, games).
- **Keyboard:** must not cover the field being edited; has the right Done/Next key for the keyboard type.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Button** | Action | Label ± icon, container, hit area | enabled/disabled/pressed/loading (+hover/focus) | 1 primary/view; secondary/tertiary/ghost descending; verb labels | ≥44×44; contrast 3:1/4.5:1; focus ring | Multiple primaries; vague labels; loading hiding the label |
| **Icon button** | Compact action | Icon + expanded hit area | like button | Expand touch area with padding; tooltip/hidden label | `aria-label`/`accessibilityLabel` | 16 px icon with no padding |
| **Text field** | Input | Label, field, helper/error | idle/focus/error/disabled/filled | Label **always visible**; right keyboard type; autofill | Error states the fix; linked label | Placeholder as label; generic errors |
| **List / row** | Sequential data | Leading, content, trailing | default/pressed/selected/disabled | One row = 1 item; swipe has an alternative | Row = 1 element; meaningful enough | Shrunken desktop table |
| **Card** | Grouped content | Media, title, meta, action | default/pressed/selected | 1 primary action/card; no nested cards | Whole card is 1 target or has clear buttons | Nested cards, many links |
| **Bottom navigation** | Same-level navigation | 3–5 items icon+label | selected/unselected/badge | Never > 5; keeps state; icon+label | Announces "tab x of y" | Switching tabs = destructive action |
| **Search** | Find | Field + suggestions + results | idle/typing/results/empty/error | Recents + suggestions; empty has hints | More than a placeholder | No results with no suggestions |
| **Filter / chip** | Narrow results | Chip ± icon | on/off/disabled | Shows active filters + "Clear all" | Chip = toggle, announces state | Implicit filters |
| **Bottom sheet** | Contextual task | Grabber, header, content, detents | collapsed/expanded/dismissed | **Short** interactions; has Close + Back; **no stacking** | Focus into sheet; returns focus | Sheet holding a long flow; stacked sheets |
| **Dialog / alert** | Blocking decision | Title, message, ≤2 buttons | open/closed | Only when a **decision** is needed; clear cancel button | Focus on default button | Abusing it for every notice |
| **Snackbar / toast** | Light feedback | Text ± 1 action | appears/dismissed | ≤1 action; doesn't cover nav/FAB; no stacking | Live region announces | The only path to a core use case |
| **Banner** | Persistent state | Icon + text ± action | info/warning/error | Offline/disconnected/global errors | role/status | Banner carrying the only action |
| **Skeleton** | Loading | Blocks matching layout | shimmer | Matches real layout; shown for work that may exceed 1 s, not before ~200 ms; cap ~5 s | `aria-hidden` blocks + `aria-busy` container | Skeleton mismatching layout ⇒ shift |
| **Empty state** | Explains emptiness | Visual, header, explainer, CTA | first-run/no-results/error | Answers *what/why/what-next*; doubles as onboarding | Readable | Blank screen |
| **Error state** | Error + recovery | Icon, message, action | inline/field/page | Specific, actionable, recoverable | Announced via screen reader | "Something went wrong" |
| **Progress** | Progress | bar/ring/spinner | determinate/indeterminate | Determinate when % known; > 10 s cancellable | Announces value | Indeterminate spinner for known work |

### 5.1 Key numbers

| Category | Value |
|---|---|
| Minimum touch area (legal, WCAG 2.5.8 AA) | **24×24 CSS px** (or equivalent spacing) |
| Touch area to build | **44×44 pt** (Apple) · **48×48 dp** (Material); enhanced AAA **44×44** |
| Size by position | top ~11 mm · middle ~7 mm · bottom ~12 mm |
| Feedback | **< 100 ms**; > 1 s needs an indicator; > 10 s needs progress + cancel |
| Skeleton | for work that may exceed 1 s: show it once content is pending (not before ~200 ms, to avoid flashing); cap **~5 s** |
| Contrast | text **4.5:1** (large 3:1); UI/graphics **3:1** |
| Rhythm/margins | 4/8 pt grid; 16 pt margins; 12/24 pt padding |
| State layer (Material) | hover 8% · focus 10% · press 10% · drag 16% · disabled 38% |

> Detail: [TOUCH-AND-TARGETS](references/TOUCH-AND-TARGETS.md) · [INTERACTION-STATES](references/INTERACTION-STATES.md).

## 6. Screen Inventory

| Screen | Goal | Must have |
|---|---|---|
| Splash / Launch | Instant transition | No ads, no blocking |
| Onboarding | Value orientation | Short, has Skip; asks for permissions in context |
| Sign-in | Fast entry | Autofill/passkey; no long forms |
| Home / Feed | Content entry point | 1 focus; stable nav |
| Search | Find & discover | Recents, suggestions, empty state |
| Detail | Decision | Key info on the first screen; clear CTA |
| Create / Edit | Content creation | Autosave or Done; **undo** |
| Profile / Settings | Identity & customization | Separate account vs settings; good defaults |
| Notifications / Inbox | Updates | Grouped by time; quick actions |
| **States** (loading/empty/error/offline) | Status | **Designed alongside the main screen** |

## 7. UX Patterns

**Browse · Search · Discover · Create · Edit · Transact · Notify · Onboard · Recover**

- **Browse → Detail:** keep scroll position when going back.
- **Search:** 4 mandatory states (idle/typing/results/empty) + network errors.
- **Create/Edit:** undo/redo; exiting mid-way must warn if data would be lost.
- **Transact:** clear steps, progress, no data loss on error.
- **Notify:** distinguish **alerts** (need to know now) vs **suggestions** (gentle).
- **Onboard:** empty state = onboarding; has Skip on every step.
- **Recover:** errors say how to fix; offline has replacement content; easy retry.

## 8. Interaction Model

| Input | Rule |
|---|---|
| **Touch** | ≥ 44×44 pt/48 dp; safe spacing; taps respond instantly |
| **Gestures** | Standard gestures only; **every gesture has an alternative** (WCAG 2.5.1); drags have a no-drag path (2.5.7) |
| **Keyboard** | Logical focus order; clear focus ring; standard shortcuts |
| **Voice** | Every primary action has a voice path; readable labels |
| **Pointer** | Hover only to *predict*, never to trigger |
| **Feedback** | Visual + haptic within < 100 ms; semantically consistent |
| **Cancellation** | Actions fire on **release** (not on press); cancellable |

## 9. Accessibility

- **Target size:** ≥ 24×24 px (AA) — ideally 44/48; adjacent controls need spacing.
- **Gestures:** alternatives for multipoint/path-based (2.5.1) and dragging (2.5.7).
- **Contrast:** text ≥ 4.5:1 (large ≥ 3:1); UI/graphics ≥ 3:1; **never** color-only.
- **Screen reader:** every element has label/value/role; reading order = visual order; states announced.
- **Text scaling:** supports the largest sizes; no clipping/occlusion; text spacing doesn't break (1.4.12).
- **Motion:** respects Reduce Motion; avoids flashing/oscillation.
- **Focus:** clearly visible focus ring; no focus traps; returns focus when a modal closes.
- **Checklist:** [ ] targets · [ ] gestures · [ ] contrast · [ ] labels · [ ] text scale ·
  [ ] focus · [ ] reduce motion · [ ] no color-only.

## 10. Performance Rules

- **Response thresholds:** < 100 ms instant · ≤ 1 s keeps flow · ≤ 10 s keeps attention · > 10 s needs progress + cancel.
- **No jank:** hold 60 fps; avoid nested shadows/blurs.
- **No layout shift:** skeletons match layout; images have dimensions upfront.
- **No cognitive overload:** 1 goal/screen; ≤ 3 same-level choices.
- **No deep hierarchy:** ≤ 3 levels to core content.
- **No decorative animation:** every motion has a purpose; ~150–300 ms for small UI changes, up to ~400 ms for full-screen transitions.
- **Loading:** never leave users staring at a white screen; useful content early.

## 11. Senior Review Checklist

- [ ] **Touch:** every target ≥ 44/48; adjacent controls have enough spacing.
- [ ] **Hierarchy:** exactly 1 primary/screen; button labels are verbs; consequences clear.
- [ ] **Ergonomics:** primary action in the green zone; one-handed test (left + right).
- [ ] **Navigation:** everywhere in ≤ 3 steps; always know where you are & how to exit.
- [ ] **States:** has **idle · loading · empty · error** (+ partial/offline) — not just the happy path.
- [ ] **Feedback:** < 100 ms; > 1 s has an indicator; > 10 s has progress + cancel.
- [ ] **Accessibility:** section 9 passes.
- [ ] **Gestures:** every gesture has an alternative; drags have a no-drag path.
- [ ] **Performance:** no jank, no layout shift, no white-screen spinner.
- [ ] **Copy:** short, specific, states the outcome; errors state the fix.

## 12. Failure Modes

| Failure | Why it's wrong |
|---|---|
| Target < 24 px or small icon with no padding | Fails WCAG 2.5.8; people with tremor can't use it |
| Multiple primary buttons on one screen | Kills hierarchy; users don't know what to pick |
| Important CTA in the top corner (red zone) | Forces hand-switching/reaching; more errors and drop-offs |
| Placeholder as label | Context vanishes when typing |
| Only the happy path designed | Empty/loading/error are the most common states at first |
| Generic, unrecoverable errors | Dead end; users leave |
| Spinner on a white screen | Doesn't say what's being waited for; feels slow |
| Skeleton mismatching layout | Layout shift when data arrives |
| Hidden gesture as the only path | Undiscoverable; fails 2.5.1 |
| Mandatory drag-and-drop | Fails 2.5.7; hard for people with limited mobility |
| Stacked sheets / sheet holding a long flow | Disorientation, hard to exit |
| Snackbar carrying a core use case | It disappears; not the place for core actions |
| Confirm on every action | Fatigue; prefer undo |
| Forgetting one-handed / large-text tests | Breaks under real conditions |

## 13. Design System Rules (tokens)

| Category | Rule |
|---|---|
| **Touch** | 44 pt / 48 dp (48 px+ recommended for older adults); expand with padding |
| **Spacing** | 4/8 grid; 16 margins; 12/24 control padding; minimum gap between targets = enough that 24 px circles don't overlap |
| **Typography** | Clear scale (display → caption); secondary text ≥ 11 pt; supports font scale |
| **Radius** | Consistent per container; no ad-hoc mixing |
| **Elevation** | Prefer material/contrast over shadows; max 1 shadow layer |
| **Motion** | ~150–300 ms small changes, up to ~400 ms full-screen; ease-out on enter, ease-in on exit; respects Reduce Motion |
| **Color** | Semantic; contrast 4.5:1 text / 3:1 UI; never color-only signalling |
| **States** | Define full enabled/disabled/pressed/loading/focus; Material state layers (8/10/10/16/38%) |
| **Content** | Short microcopy, verbs, states the outcome; errors state the fix |

## 14. AI Decision Framework

```
IF mobile screen/flow
THEN
  Primary goal = finish tasks fast, clearly, forgivingly
  Layout       = 1 column; primary action in green zone; 4/8 rhythm; 16 margins
  Hierarchy    = EXACTLY 1 primary/screen; label = verb + outcome
  States       = REQUIRED idle · loading · empty · error (+ partial/offline if any)
  Feedback     = < 100 ms; > 1 s show indicator; > 10 s show progress + cancel
  Touch        = ≥ 44×44 pt / 48×48 dp (floor 24×24)
  Avoid        = many primaries · CTA in red zone · placeholder-only · dead-end errors ·
                 hidden gestures with no alternative · mandatory drag-and-drop · white spinner

# Picking touch size
IF target < 24 px                          THEN FAIL (WCAG 2.5.8) — add padding or spacing
IF control sits at the top edge            THEN grow the hit region toward 11 mm (≈ 68 pt)
IF control is heavily used at the bottom   THEN grow the hit region toward 12 mm (≈ 74 pt) + place in green zone

# Picking presentation surface
IF a DECISION is needed to continue        THEN dialog/alert (≤2 buttons, clear cancel)
IF task is SHORT + background must show    THEN bottom sheet (has Close + Back, NO stacking)
IF only TRANSIENT feedback                 THEN snackbar (≤1 action)
IF state is PERSISTENT (offline/no net/err) THEN banner
IF content is a long page/info             THEN dedicated screen, not a sheet

# States
IF loading may exceed 1 s                  THEN skeleton matching layout once pending ≥ ~200 ms (no white spinner)
IF loading > 5 s                           THEN switch to progress/timeout + retry
IF data is empty                           THEN empty state: what + why + CTA (onboarding)
IF error                                   THEN specific + actionable + recoverable (retry)
IF data could be lost                      THEN undo > confirm; if destructive ⇒ clear confirm

# Interaction & a11y
IF using gestures (swipe/pinch/drag/long-press) THEN provide a single-pointer alternative
IF drag-and-drop exists                    THEN add buttons/menus to do it without dragging
IF frame > 200 ms                          THEN keep label + spinner (don't hide label)
IF large text scale                        THEN reflow, don't clip text
IF destructive action                      THEN separate from primary + confirm/undo
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).