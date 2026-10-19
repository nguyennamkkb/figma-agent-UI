---
name: apple-design-iphone
description: "Senior-level iPhone (iOS) product design skill for the Apple ecosystem. Use when designing new iPhone screens, reviewing/auditing wireframes and UX flows, choosing navigation or layout, specifying components, or checking accessibility — for any app on iPhone (iOS 18–26+, Liquid Glass era). Self-contained: mindset, principles, IA, layout, component library, screens, patterns, interaction, a11y, performance, review checklist, failure modes, design-system tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPhone (iOS)"
  updated: "2026-09-24"
---

# iPhone Design — Senior Skill

<!-- refs -->
> **References:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md)






> Background sources: Apple HIG (Layout, Typography, Color, Materials, Motion, Accessibility, Navigation & search,
> Tab bars, Toolbars, Buttons, Lists & tables, Menus & actions, Modality, Searching, Onboarding, Feedback,
> Loading, Settings, Undo & redo, Entering data) + WWDC25 (356, 219, 323, 284, 359, 220, 337, 316).

## 1. Platform Mindset

- **Built for:** getting things done fast, in hand, anytime, anywhere. A *personal* device,
  *always with you*, the center of the Apple ecosystem.
- **User context:** one-handed, on the move, split attention, changing light, sometimes opened
  for 5–20 seconds to do one thing and then put away.
- **Platform goal:** *fast task completion* + *glanceable return*. Not the place for long
  workflows, dense data tables, or complex input.
- **Root constraints:** narrow screen (compact width), thumbs covering content, text entry is expensive.
- **Design consequences:** one screen = one goal; short flows; progressive disclosure; everything
  important within thumb reach; exiting is always easy.

## 2. Design Principles

**WHEN designing on iPhone → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Put key content in the top half & near the leading edge | Put the primary action in the corner farthest from the thumb | Reading order runs top→bottom; one-handed grip |
| Use a tab bar for 3–5 peer sections | Cram in >5 tabs or nested tabs | Users need to see the whole navigation map |
| Use progressive disclosure (menus, sheets, nesting) | Show every option on one screen | Too many choices slow decisions down |
| Separate controls from content with Liquid Glass + scroll edge effect | Put solid/semi-opaque backgrounds under controls | Controls must float above content, not cut it off |
| Respect the safe area & Dynamic Island | Let content slide under the Dynamic Island | Hardware hides content |
| Support Dynamic Type up to the largest size | Lock font sizes / rigid layouts | Users depend on large text |
| Allow a clear modal exit (Close/Done/swipe down) | Trap users in multi-step flows | Fear of getting stuck = reluctance to use |
| Use system components first | Build custom controls when one already exists | Free behavior & a11y, familiar |

**Golden rule:** *If a flow needs more than 3 screens to complete a common task on iPhone,
that flow is wrong.*

## 3. Information Architecture

| Structure | Use when | Don't use when |
|---|---|---|
| **Tab bar** (bottom, 3–5 items) | 3–5 peer sections users switch between often | >5 sections, or sections that depend on each other |
| **Hierarchy / push** | Drilling into details along one branch | Frequent lateral jumps are needed |
| **Modal (sheet)** | A separate task with clear done-or-cancel | Content needing back-and-forth with the parent screen |
| **Full-screen modal** | Immersive experiences (media, camera, onboarding) | Small tasks that don't need to block context |
| **Popover** | Short choices anchored to one point (usually iPad) | On iPhone: use a sheet/action sheet |
| **Action sheet / alert** | Irreversible decisions, clear cancel | Plain information (use banner/inline) |
| **Context menu (long-press)** | Secondary actions on one item | Primary actions (must be visible) |
| **Overlay / HUD** | Short progress that doesn't block for long | Long states (use inline progress) |

**Hierarchy principle:** each screen has **one** visual focus; the title says *where you are*, never
repeats content; lateral navigation = tab bar, vertical = push, tasks = modal.

## 4. Layout Rules

- **Size class is truth:** portrait iPhone = `compact width`; landscape iPhone (mostly) = `compact height`.
  Decide layout by size class, **not** by device/idiom.
- **Safe area:** respect the top (Dynamic Island/status bar) and bottom (home indicator). Scrollable content
  may run *under* control bars, but controls must float above.
- **Dynamic Type:** text must expand; horizontal rows may need to **stack vertically** at large sizes; table rows grow
  taller so text isn't clipped; use system styles instead of fixed sizes.
- **Compact width:** one column. Never two content columns on iPhone.
- **Landscape:** for typical apps, keep the familiar experience; avoid revealing layout only in landscape.
  If locking orientation (games/media), still resize well.
- **Margins & rhythm:** standard 16 pt margins; 4/8 pt rhythm; minimum 11 pt type (widgets/annotations).
- **Occlusion:** the thumb zone (bottom) is for primary actions; the top is for info/titles.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Button** | Triggers an action | Label ± icon, background, hit region | normal/pressed/disabled/loading | Max 1 "primary" button per region; labels are **verbs** | Hit region ≥ 44x44 pt; readable labels | Disabled buttons with no explanation; generic "OK" labels |
| **Tab bar** | Peer navigation | 2–5 items, icon + label | selected/unselected/badge | system height — use the system tab bar, never a custom-height copy; not for actions | VoiceOver announces "tab, 2 of 5" | More than 5 tabs; switching tabs = destructive action |
| **Navigation bar / Toolbar** | Screen context + actions | Title, back, actions | inline/large title | Short titles; ≤ 3 actions; Liquid Glass | Header is a heading in the focus order | Cramming 6 actions; titles wrapping to 2 lines |
| **List** | Sequential, scannable data | Row (leading, content, trailing) | plain/inset-grouped; swipe actions | Prefer lists for row-shaped content; rows tall enough for Dynamic Type | Each row = 1 element; swipes have alternatives | Dense desktop-style tables; missing separators |
| **Grid / Collection** | Uniform, visual content | Cell, spacing, section header | grid/horizontal scroll | 2 columns on iPhone; stable cell aspect ratios | Cells have meaningful labels | 4–5 columns on iPhone = unreadable |
| **Search** | Search a large set | Field + scope + results | idle/typing/results/empty | Place within reach; **recents & suggestions**; clear empty states | Don't rely on placeholders alone; labels exist | No results with no suggestions |
| **Filter / Chip** | Narrow the result set | Chip label ± icon, selected state | on/off/disabled | Show applied filters; offer "Clear all" | Chips are toggles, announce state | Hidden filters; users can't tell why results are missing |
| **Carousel** | Browse featured content horizontally | Horizontal cards, peeking next item | idle/dragging | Peek to hint there's more; snap | List alternative for VoiceOver | Horizontal scroll with no affordance; items clipped arbitrarily |
| **Sheet / Bottom sheet** | Secondary task, keeps context | Grabber, header, content, detents | medium/large; dismissible | Detents; swipe down to dismiss; no sheets inside sheets | Focus starts in the sheet; returns focus on dismiss | Sheets holding multi-screen flows |
| **Alert** | Blocking, critical decisions | Title, message, 2 buttons | 1–2 buttons | Only for serious consequences; cancel button on the left/clear | Focus on the default button; read all of title+message | Alerts for every notification |
| **Context menu** | Secondary actions on an item | Preview + action list | open/closed | Secondary actions only; short lists | Long-press has an alternative ("More" button) | Primary action buried in a hidden menu |
| **Empty state** | Explains "empty" + next step | Icon, title, description, CTA | first-run/no-results/error | Always a next CTA; distinguish "nothing yet" vs "not found" | Readable by VoiceOver | Blank screen with no explanation |
| **Loading state** | Shows work in progress | Spinner/skeleton/progress | determinate/indeterminate | <1s: don't show; >1s: skeleton; >10s: progress + cancel | `accessibilityLabel` "loading" | Endless spinners; layout jumps when loading finishes |
| **Error state** | Explains the error + recovery | Icon, message, action | inline/toast/page | Say **what** went wrong and **what to do** next; no bare error codes | Announced via VoiceOver | Just "An error occurred" |
| **Progress indicator** | Progress | Bar/ring/spinner | determinate/indeterminate | Determinate when % is known; place near related content | Update values for VoiceOver | Indeterminate spinners for known-duration tasks |
| **Segmented control** | Pick a view mode (2–5) | Horizontal segments | selected/unselected | For **view modes**, not forms | Announce "selected" | Too many segments → squished text |
| **Toggle / Slider / Stepper** | Adjust values | Control + label + value | on/off/min/max | Apply immediately (no Save needed); clear labels | Operable via VoiceOver adjustable actions | Sliders hiding the current value |
| **Text field** | Text input | Label, field, helper/error | idle/focus/error/disabled | Labels always visible (not placeholder-only); right keyboard type | Errors say how to fix | Placeholders that vanish on typing |
| **Picker / Date picker** | Pick from a value set | Wheel/menu/inline | idle/open | Context-appropriate menu/wheel; sensible defaults | Values are readable | Overlong lists with no search |
| **Toast / Banner** | Non-blocking feedback | Icon + text, auto-dismiss | appears/dismissed | Short; never the only home of an important action | Announced via live regions | Banners carrying action-required info |

## 6. Screen Inventory (sample by app type)

| Screen | Goal | Design notes |
|---|---|---|
| Splash / Launch | Instant handoff | No ads; no blocking |
| Onboarding | Value orientation, permissions at the right moment | Short, with "Skip"; ask when needed |
| Sign-in / Sign-up | Get into the app fast | Sign in with Apple, passkey; no long forms |
| Home / Feed | Main content entry point | 1 focus; stable tab bar |
| Search | Find & discover | Recents + suggestions + empty state |
| Category / Browse | Browse by structure | Clear filters, result counts |
| Detail | Decide | Key info on the first screen; pinned CTA |
| Create / Edit | Create content | Autosave or clear Done; undo |
| Player / Viewer | Consume content | Floating controls, hidden chrome, standard gestures |
| Profile / Account | Identity & settings | Separate "account" from "app settings" |
| Settings | Customize | Logical groups; sensible defaults; nothing mandatory |
| Notifications / Inbox | Updates | Group by time/context; quick actions |
| Empty / Error / Loading | System states | Always design alongside the main screen |

## 7. UX Patterns

**Browse · Search · Discover · Create · Edit · Watch · Listen · Navigate · Track · Share**

- **Browse → Detail:** lists/grids keep scroll position on return.
- **Search:** always has *typing*, *results*, *no results*, *network error* states.
- **Create/Edit:** has **Undo/Redo** (shake or button); leaving mid-way asks if data would be lost.
- **Watch/Listen:** standard gestures (center tap = play/pause; horizontal swipe = seek); no custom inventions.
- **Track/Progress:** progress visible on the item itself, no need to open details.

## 8. Interaction Model

| Input | Rules |
|---|---|
| **Touch** | Hit regions ≥ 44x44 pt; add spacing between adjacent targets where mis-taps are likely |
| **Gestures** | Tap, long-press, swipe, pinch, drag. Only **system-standard** gestures; every hidden gesture needs a visible alternative |
| **Haptics** | Feedback for meaningful actions (success, warnings); no gratuitous buzzing |
| **Keyboard** | Support Full Keyboard Access; respect system shortcuts |
| **Voice** | Voice Control for every action; Siri for frequent tasks |
| **Motion** | Use motion to explain state changes; respect Reduce Motion |
| **Focus order** | Follow reading order; return focus to its origin when a modal closes |

## 9. Accessibility

- **VoiceOver:** every interactive element has a label; sensible grouping; reading order = visual order.
- **Dynamic Type:** support up to the largest size; no clipped/hidden text; layouts reflow.
- **Contrast:** meet minimum standards; use standard contrast tools; never color alone.
- **Motion:** respect Reduce Motion; avoid oscillation near ~0.2 Hz (causes discomfort).
- **Hit region:** ≥ 44x44 pt; ~12 pt padding around bezeled elements, ~24 pt around unbezeled ones.
- **Multiple channels:** core features reachable via >1 input (touch, voice, keyboard, switch).
- **Checklist:** [ ] VoiceOver labels · [ ] Dynamic Type max · [ ] contrast · [ ] reduce motion ·
  [ ] hit regions · [ ] Voice Control · [ ] Full Keyboard Access.

## 10. Performance Rules (perceived & technical)

- No jank: 60/120 fps animations; avoid large shadows + nested blurs.
- No cognitive overload: ≤ 1 primary action/screen; ≤ 3 peer choices.
- No deep hierarchies: ≤ 3 push levels to key content.
- No heavy animation: 1–2 purposeful motions per screen; no decorative motion.
- No jumpy navigation: stable tab state; never auto-switch tabs.
- Loading content: skeletons over full-screen spinners; keep scroll position; avoid layout shift.

## 11. Senior Review Checklist

- [ ] **Navigation:** reach anywhere in ≤ 3 steps; always know where you are & how to exit.
- [ ] **Hierarchy:** 1 focus/screen; titles state location; key content on the first screen.
- [ ] **Accessibility:** section 9 fully passes.
- [ ] **Discoverability:** primary actions visible; nothing buried in long-press.
- [ ] **Performance:** no jank; minimal motion; skeleton loading.
- [ ] **Empty states:** have CTAs; distinguish nothing-yet vs not-found.
- [ ] **Error states:** state the cause + recovery.
- [ ] **Loading states:** 1s/10s thresholds; cancel when slow.
- [ ] **Touch targets:** ≥ 44x44 pt; safe spacing.
- [ ] **Dynamic Type & dark mode:** test at the largest size and in both appearances.

## 12. Failure Modes (mistakes juniors often make)

| Mistake | Why it's wrong |
|---|---|
| Porting desktop/iPad UI to iPhone | Two columns + dense tables are unreadable on narrow screens |
| Cramming 6–7 tabs | Beyond cognitive limits; tab bar gets squeezed, labels lost |
| Alerts for every notification | Alerts are hard interrupts; overuse causes "alert fatigue" |
| Placeholders instead of labels | While typing, users lose context |
| Long-press as the only way | Undiscoverable; poor a11y |
| Full-screen spinners for short loads | Feels slow; layout jumps |
| Nested modals | Disorienting; hard to exit |
| Locked type sizes / rigid layouts | Breaks at large Dynamic Type |
| Custom gestures with no alternative | Undiscoverable, conflicts with the system |
| Skipping empty/error/loading states | The most common states get forgotten |

## 13. Design System Rules (tokens)

| Category | Rules |
|---|---|
| **Typography** | SF Pro; Dynamic Type styles (largeTitle…caption); no hard-coding; thin weights → larger sizes; 11 pt minimum for secondary text |
| **Spacing** | 4/8 pt rhythm; standard 16 pt margins; 12/24 pt control padding (with/without bezel) |
| **Radius** | Consistent corner radii per container; system controls keep system radii; no arbitrary radius mixing |
| **Elevation** | Prefer **materials** (Liquid Glass) over shadows; light shadows, max 1 layer |
| **Motion** | ~150–300 ms for small UI changes, up to ~400 ms for full-screen transitions (prefer system springs); springs for direct manipulation; ease-out entering, ease-in exiting; respect Reduce Motion |
| **Color** | System semantic colors; standard contrast; never color alone; dark mode is first-class |
| **Adaptivity** | Size-class layouts; expanding text; components adapt before drawing new ones |

## 14. AI Decision Framework

```
IF platform == iPhone
THEN
  Primary goal   = fast task completion
  Layout         = 1 column, compact width, by size class
  Navigation     = tab bar (3–5) + push; tasks = sheet/modal
  Primary action = 1/screen, within thumb reach, verb labels
  Priorities     = 1) Content  2) Action  3) Exit
  Required       = safe area · Dynamic Type · 44pt · dark mode · empty/error/loading
  Avoid          = multi-column tables · long forms · >5 tabs · long-press-only · nested modals

IF a task needs >3 screens      THEN simplify or move to iPad/Mac
IF content needs multi-column comparison THEN that's an iPad signal, not iPhone
IF lots of text entry needed     THEN prefer autofill/scan/voice, minimize typing
IF destructive action            THEN clear confirm (alert/action sheet) + undo if possible
IF loading >1s                   THEN skeleton; >10s THEN progress + cancel
IF sensitive data                THEN hide on lock; never show on the lock screen
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).