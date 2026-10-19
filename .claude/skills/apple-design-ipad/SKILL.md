---
name: apple-design-ipad
description: "Senior-level iPad (iPadOS) product design skill for the Apple ecosystem. Use when designing or auditing iPad apps — multitasking/Split View/Slide Over/Stage Manager, sidebars, split views, pointer & keyboard, Apple Pencil, drag & drop, popovers, and adaptive layouts. Self-contained: 14-section operating skill with component library, a11y, review checklist, failure modes, tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPad (iPadOS)"
  updated: "2026-09-24"
---

# iPad Design — Senior Skill

<!-- refs -->
> **References:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [WINDOWS-AND-MULTITASKING](references/WINDOWS-AND-MULTITASKING.md) · [NAVIGATION-SIDEBAR-TABS](references/NAVIGATION-SIDEBAR-TABS.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md) · [ADAPTIVE-LAYOUT-AND-INPUT](references/ADAPTIVE-LAYOUT-AND-INPUT.md)





> Background sources: Apple HIG (Designing for iPadOS, Split views, Sidebars, Multitasking, Drag and drop,
> Pointing devices, Keyboards, Apple Pencil and Scribble, Windows, Popovers) + WWDC25 208.

## 1. Platform Mindset

- **Built for:** *creation & productivity* on a large touch screen, with pen and keyboard.
  iPad is a "canvas + lightweight workstation", not a scaled-up iPhone.
- **User context:** seated (desk, chair, sofa), often two-handed; multitasking across apps; typing,
  touching, and drawing in turn; attached keyboard/trackpad; possibly Stage Manager with multiple windows.
- **Platform goal:** *creation & productivity* — getting "real" work done (writing, drawing, building, editing,
  managing) while keeping the directness of touch.
- **Native constraints:** **resizable** windows, multitasking that changes size classes constantly, pointer with hover.
- **Design consequence:** design for **every window size**, not one "screen size";
  treat pen/mouse/keyboard as first-class citizens; allow multiple parallel contexts.

## 2. Design Principles

**WHEN designing on iPad → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Design to **size class + resize** | Hard-code to screen/device | Windows resize constantly (Stage Manager, Split View) |
| Use the **sidebar** for top-level navigation | Force the iPhone tab bar onto iPad | Wide screens need horizontal navigation structure |
| Use **split view** for master–detail | Make users go back and forth | Comparing & working in parallel is iPad's strength |
| Support **pointer + hover** as an enhancement layer | Depend on hover to trigger actions | Hover is for **prediction**, not action |
| Offer **multi-window / multi-scene** where sensible | Lock the app to a single window | People want two documents side by side |
| Support **Apple Pencil with instant, direct strokes** | Require a tap before drawing | The pen must be "touch means ink" |
| Fully support **keyboard + shortcuts** | Treat the keyboard as a rare accessory | iPad is often the primary work machine |
| Keep features **unchanged** when resizing | Change functionality with window size | Perceptual stability |

**Golden rule:** *If the app works well without keyboard/mouse, and works even better with them — that's
correct iPad design.*

## 3. Information Architecture

| Structure | Use when | NOT for |
|---|---|---|
| **Sidebar** (leading) | Many peer areas (≥4), need fast jumps | Only 2–3 destinations (use segmented controls/tabs) |
| **Split view** (2–3 columns) | Master–detail, browse + view in parallel | Simple linear content |
| **Three-column** | Library → list → detail | Narrow windows (collapses to 1–2 columns on its own) |
| **Push (navigation stack)** | Going deep within one branch of the detail column | Cross-comparison |
| **Tab bar** | 3–5 destinations, in **compact** (Slide Over/narrow) | `regular width` (becomes a sidebar) |
| **Popover** | Short choice anchored to one point, item attributes | Multi-step flows (use a sheet) |
| **Sheet** | Separate task; forms | Content needing parallel browsing with the parent |
| **Modal / full-screen** | Focus (media, full-screen drawing) | Small tasks |
| **Inspector** (trailing) | Attributes of the selected object | Primary content (inspector is secondary) |

**Width transformation:** `compact` → tab bar + 1 column; `regular` → sidebar + 2–3 columns.
Sidebars must be **collapsible** and keep their state as the window narrows.

## 4. Layout Rules

- **Size class follows the window, not the device.** `regular width` when wide enough; `compact` for Slide Over/narrow.
- **No fixed window size:** windows resize freely (see `references/WINDOWS-AND-MULTITASKING.md`); design for
  compact and regular widths and every size in between.
- **Multitasking:** Slide Over (narrow → compact), Split View (split in half → can be regular/compact),
  Stage Manager (multiple free windows → continuous resize).
- **Safe area:** iPad has a home indicator; windows in Stage Manager have their own title bars.
- **On-screen keyboard:** covers the bottom — scroll content and keep the focused field visible.
- **Landscape is first-class**, but portrait must not break.
- **Pointer:** virtual hover region expansion (pointer "snaps" to controls) — keep hit regions ≥ 44×44 pt with spacing between
  adjacent targets; don't let hover shift layout.
- **Pencil:** don't block drawing areas with finger zones; distinguish finger vs. pen where needed (Pencil-only zones);
  support left/right hands (avoid placing controls where the hand covers them).
- **Dynamic Type** is still mandatory; large windows don't exempt large-text support.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Sidebar** | Top-level navigation | Header, sections, items (icon+label) | selected/collapsed/editing | Collapsible; preserve selection; support item drag & drop | Each item = 1 element; announce hierarchy | Overlong sidebar with no groups |
| **Split view** | Master–detail | 2–3 columns, divider, collapse | expanded/collapsed/overlay | Allow divider drag; remember ratio; smooth collapse | Focus per column | Empty detail column with no placeholder |
| **Popover** | Short choice | Arrow, content, optional title | open/closed | Use for item attributes; dismiss on outside tap | Focus into popover; return focus | Popover holding a long flow |
| **Table / List (multi-column)** | Structured data | Columns, header, rows | sort/multi-select | Support sort + column resize; multi-select gets an action bar | Header announces sort state | Desktop-dense table hard to touch |
| **Pointer menu / Context menu** | Fast contextual actions | Preview + actions | open/closed | Complements, doesn't replace visible actions | Right-click/menu-button equivalent | Primary actions buried |
| **Keyboard shortcut bar** | Accelerators | Contextual shortcut groups | — | Use **standard** shortcuts (⌘N, ⌘S, ⌘F…); don't override system ones | Every shortcut has a menu equivalent | Shortcuts only, no UI |
| **Drag & drop** | Move data | Drag item, drop zone, preview | idle/dragging/hover-drop | Support dragging **between apps**; clear drop zones; spring-loading to open | Alternative available (Move to… menu) | Drag & drop as the only way |
| **Pencil canvas** | Draw/annotate | Canvas, tool palette, layers | idle/drawing/eraser | "Touch means ink"; use pressure/azimuth/tilt; customizable double-tap | Scribble for text entry; toolbar alternative | Stroke lag; forcing tool selection before drawing |
| **Segmented control** | Switch view mode | 2–5 segments | selected | Use for modes, not forms | Announce selection | Too many segments |
| **Toolbar** | Contextual actions | Leading/trailing items | enabled/disabled | Group sensibly; avoid more than 5–6 items; use overflow | Clear labels for VoiceOver | Toolbar duplicating sidebar |
| **Empty/Loading/Error** | States | Icon, message, CTA | — | Detail columns need placeholders, never blank | Readable | Forgotten because "the screen is big" |

## 6. Screen Inventory

| Screen | Goal | iPad notes |
|---|---|---|
| Launch / Home | Get in fast | Support multiple windows (multi-scene) |
| Library / Browser | Browse a content library | Sidebar + flexible grid/list, sort/filter |
| Editor / Canvas | Create & edit | Toolbar + inspector; Pencil; undo/redo; multi-window |
| Detail / Reader | View/edit one item | Rich detail column; can open its own window |
| Search | Find | Search in the sidebar; results in the middle column |
| Settings | Configure | Can be its own window (⌘,) |
| Export / Share | Get data out | Share sheet + Files; drag & drop out of the app |
| Empty / Error / Loading | States | Placeholder in every column |

## 7. UX Patterns

**Browse · Create · Edit · Compare · Multi-task · Drag & drop · Handoff · Share**

- **Compare:** allow 2 documents open (split or 2 windows) — iPad's biggest advantage.
- **Create/Edit:** Pencil + keyboard + undo/redo is the trio; autosave + "saved" state.
- **Multi-task:** don't take the whole screen unless needed; respect Slide Over/Split.
- **Continuity:** Handoff, Universal Clipboard, Sidecar — treat as defaults.

## 8. Interaction Model

| Input | Rules |
|---|---|
| **Touch** | ≥ 44×44 pt; edge controls clear of hand-hold zones |
| **Pointer / Trackpad** | Hover to preview/highlight; cursor reshapes with context; never use hover to trigger |
| **Keyboard** | Full keyboard access + standard shortcuts + menu bar (⌘) equivalents; Tab moves focus |
| **Apple Pencil** | Instant strokes; pressure/azimuth/tilt; hover to *predict* (not activate); customizable double-tap, prefer easy-to-undo actions |
| **Gestures** | Pinch zoom, 2-finger scroll, drag & drop, Scribble, 3–4 finger app switching (system) |
| **Voice / Siri** | Voice control for primary tasks |
| **Controller** | If a game: support standard controllers |

## 9. Accessibility

- **VoiceOver:** sidebar/split announce structure; column changes announced; focus never jumps around.
- **Dynamic Type:** multi-column tables must reflow, never clip text.
- **Pointer a11y:** cursor size follows system settings; no precision required.
- **Pencil/Scribble:** Scribble for handwriting entry; every Pencil action has a touch/keyboard alternative.
- **Contrast/Motion:** same as iOS; respect Reduce Motion/Transparency.
- **Checklist:** [ ] VoiceOver per column · [ ] Dynamic Type max · [ ] keyboard-only ·
  [ ] pointer hover not required · [ ] Scribble · [ ] contrast · [ ] reduce motion.

## 10. Performance Rules

- No jank when **resizing windows** (cheap layout math, avoid heavy relayout per frame).
- No cognitive overload: sidebar + max 3 columns; one goal per column.
- No deep hierarchy: sidebar stays flat, not many nested levels.
- No heavy animation during multitasking; animations must be cheap to run smoothly in small windows.
- No complex navigation: keep sidebar selection stable; column collapse has clear animation.

## 11. Senior Review Checklist

- [ ] **Adaptivity:** runs at compact, regular, every window ratio, both orientations.
- [ ] **Navigation:** sensible sidebar/split; animated level changes with preserved state.
- [ ] **Hierarchy:** one role per column; empty detail has a placeholder.
- [ ] **Accessibility:** section 9 passes.
- [ ] **Discoverability:** every action has UI + shortcut + menu (⌘) equivalents.
- [ ] **Keyboard/Pointer:** fully operable by keyboard; hover never required.
- [ ] **Pencil:** instant strokes; hover preview; standard double-tap; left/right-hand support.
- [ ] **Performance:** smooth resize; no jank.
- [ ] **Empty/Error/Loading:** present in every column.
- [ ] **Multi-window:** opening/closing scenes loses no data.

## 12. Failure Modes

| Failure | Why it's wrong |
|---|---|
| Porting iPhone UI verbatim, scaled up | Wastes space; no master–detail; redundant tab bar |
| Hard-coding to "11-inch iPad" | Stage Manager/Split resize windows constantly |
| Using hover as the only action | Trackpad vs. touch differ; poor a11y |
| Popover holding a long form | Popovers are short choices; long forms need sheets |
| Desktop-dense tables | Narrow columns hard to touch; text breaks at Dynamic Type |
| Non-collapsible sidebar | Eats space in narrow windows |
| Ignoring the keyboard | iPad is often the primary machine, with Magic Keyboard |
| Pencil stroke lag / forced tool switch | Breaks the "real pen" feel |
| Drag & drop as the only way | Undiscoverable, poor a11y |
| No multi-window design | Users open 2 windows → state breaks |

## 13. Design System Rules (token)

| Category | Rule |
|---|---|
| **Typography** | SF Pro/Dynamic Type; allow large sizes on wide screens; long-form content prefers width-capped columns for readability |
| **Spacing** | 4/8 pt rhythm; more generous content margins than iPhone; 12/24 pt control padding |
| **Radius** | Consistent; system controls keep system radii; windows have their own system radius |
| **Elevation** | Material/Liquid Glass for bars & panels; avoid heavy shadows inside windows |
| **Motion** | 200–400 ms; smooth column expand/collapse; respect Reduce Motion |
| **Color** | Semantic; dark mode first-class; sidebar/material per system |
| **Adaptivity** | Every layout defined by `compact`/`regular`, never by "iPad" in general |

## 14. AI Decision Framework

```
IF platform == iPad
THEN
  Primary goal  = creation & productivity
  Layout        = by THE WINDOW's size class; compact→1 column+tab bar; regular→sidebar+2–3 columns
  Navigation    = sidebar + split view (master–detail); popovers for short choices
  Input         = touch + pointer(hover) + keyboard(shortcuts/menu) + Pencil
  Priorities    = 1) Content  2) Actions  3) Lateral navigation
  Required      = good resize · multi-window state · keyboard · empty-column placeholders
  Avoid         = hard-coded sizes · hover-only · scaled-up iPhone UI · dense desktop tables

IF content is master–detail            THEN split view + sidebar
IF window is narrow (compact)          THEN collapse to tab bar + push, same features
IF comparing 2 items                   THEN allow 2 windows / 2 columns
IF user has a Pencil                   THEN hover preview (no activation) + easy-to-undo double-tap
IF user has a keyboard                 THEN standard shortcuts + menu ⌘ + Tab focus
IF an action is only in long-press/hover THEN ADD a visible button/menu
IF data is long with many columns      THEN cap reading width + reflow for Dynamic Type
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).