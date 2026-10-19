---
name: apple-design-iphone-duo
description: "Senior-level iPhone Duo (dual-display foldable iPhone) design skill for the Apple ecosystem. Use when designing or auditing iPhone Duo experiences — device poses, size-class transitions, reserved regions (fold, cameras), displacement patterns, split vs overlay arrangements, vertical toolbars/tab bars, continuity of state across displays, multitasking, scenes, hinge, and camera. Self-contained 14-section operating skill with a deep reference library (POSES, RESERVED-REGIONS, ARRANGEMENTS, VERTICAL-BARS, CONTINUITY-AND-SCENES, ADOPTION-TESTING) plus components, guidelines, specs, image analysis and assets."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPhone Duo (foldable)"
  updated: "2026-09-24"
---

# iPhone Duo Design — Senior Skill

<!-- refs -->
> **References:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [POSES](references/POSES.md) · [RESERVED-REGIONS](references/RESERVED-REGIONS.md) · [ARRANGEMENTS](references/ARRANGEMENTS.md) · [VERTICAL-BARS](references/VERTICAL-BARS.md) · [CONTINUITY-AND-SCENES](references/CONTINUITY-AND-SCENES.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md)

> **Version note:** iPhone Duo hardware, SDK 27.x and Tech Talk details come from sources read on 2026-09-24. Verify them against the current Human Interface Guidelines and SDK before treating them as fact.





> Background sources: HIG *Designing for iPhone Duo* (9/2026) + **6 Tech Talks 2026**: *Design for iPhone Duo*,
> *Prepare your app*, *Raise the bar*, *Strike a pose*, *Leverage multiple displays and scenes*,
> *Build a great camera experience* + apple.com/iphone-duo specs.

## 1. Platform Mindset

- **What it's for:** a folding iPhone with **two displays** (outer 5.4" / inner 7.6"), a
  **hinge**, and **two front cameras**. Folded = the familiar phone; open = the largest display ever on an iPhone.
- **User context:** folded one-handed on the go ↔ open two-handed at a table; **switching poses continuously
  within one session**; may stand like a tent, fold like a book, rest on an edge.
- **Platform goal:** **continuity across poses** — same app, same state, only the arrangement changes.
  Opening/folding must **never** break the flow, lose data, or change functionality.
- **Hard constraints:** two different display ratios; the **fold** splits the display when partially folded; **camera
  regions** (outer always present, inner only when active); **asymmetric safe area & layout margins** since controls hug one edge;
  a continuously-angled hinge; **50/50 multitasking** support, **multiple scenes**, **scene accessories**.
- **Design consequences:** design **resizable** by size class, **no** fixed widths, **no** display
  dependence; **one source of state**; **chrome hugging one edge**; **displacement** instead of redraw.

## 2. Design Principles

**WHEN designing on iPhone Duo → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Design for **2 size classes** (outer = compact width, inner = regular) | Design a layout per pose / hard-code "7.6 inch" | The same app runs in 6 poses, many ratios |
| Keep **functionality + state** identical across both displays | Hide/swap features per display | Users open/fold constantly |
| Only **add one hierarchy level** on the inner display | Stuff in unrelated content | The large display adds context, doesn't change the job |
| Let **controls hug the trailing edge** (the system handles it) | Hand-build a horizontal bar for outer | Outer is **wide–short**; vertical room must be preserved |
| Use **system components** to auto-avoid the fold | Hand-draw controls over the fold | A button landing exactly on the fold is very hard to tap |
| Use **ArangementView** when the layout is split/overlay | Wrap navigation **inside** the arrangement | Arrangements provide no navigation infrastructure |
| **Displace** interactive elements away from the center | Displace **scrolling content** | Scrolling self-adapts; shifting breaks continuity |
| Handle **each safe-area edge separately** | Assume both sides are equal | Duo safe areas are **asymmetric** |
| Use **size classes**, environment, scene bounds | `UIScreen.main`, orientation checks | Will deprecate; inner **ignores** orientation |
| Keep the **same physical edge** in RTL | Mirror the bar to the other edge | The bar is hardware-bound (camera) |

**Golden rule:** *Folding/unfolding is a resize — not a "reload" of the experience.*

## 3. Information Architecture

| Structure | Outer (compact) | Inner (regular) |
|---|---|---|
| Navigation stack | ✓ one branch | ✓ keep the stack, add columns when wide |
| Tab bar | ✓ (vertical at the edge) | ✓ — **optionally** becomes a **sidebar** (for info-dense apps) |
| Split view (NavigationSplitView) | 1 pane (collapsed) | 2 panes, spreading around the fold; **50/50** when partially folded |
| **ArrangementView** | split → 1 view; overlay → layered | split 2 regions; overlay separates when folded |
| Sidebar | ✗ | ✓ on inner (replacing the tab bar where apt) |
| Sheet | Buttons stacked **vertically**; vertical bar may be off (1-button sheet) | **Centered**, **horizontal** bar |
| Alert / menu / context menu | System auto-avoids the fold | Auto-avoids the fold |
| Modal / full-screen | Media/camera | Media, work, canvas |
| Multi-window (scene) | **CANNOT create new windows** | ✓ can create |

Rule: **same navigation tree, different presentation**. A pose change loses no `navigation path`,
no selection, no scroll/form/media reset.

## 4. Layout Rules

### 4.1 Size class per pose
| Position | Portrait | Landscape | Notes |
|---|---|---|---|
| Outer | compact H + regular V | compact H + compact **V** | like a regular iPhone |
| Inner | **regular H + regular V** | regular H + regular V | room for a sidebar |

- **Inner ignores `supportedInterfaceOrientations`** → use size classes.
- **Never reference the main screen** (use environment/trait/scene bounds).
- `UIRequiresFullScreen` is still honored but the app **still resizes**; inner **scales** even in multitasking.

### 4.2 Reserved regions (3 regions)
- **Outer camera (occlusion):** always present, expanding into the **Dynamic Island** with Live Activities.
- **Inner camera (occlusion):** only active while the camera runs; inactive ⇒ **invisible, width = 0**.
- **Fold (division):** only active when **partially folded**; when flat ⇒ inactive, **width = 0**.
- API: `reservedRegion` (GeometryProxy / UIView), `ReservedRegion` / `UIView.ReservedRegion`;
  also query **inactive** ones for structural decisions (e.g. grids with an **even column count** when a division region exists).

### 4.3 Displacement (instead of redraw)
- Self-adapting elements → **move alone**; related elements → **move together** (keep relationships).
- **Never** displace scrolling content (article/feed/list/document).
- Book-fold → alerts/menus gather in the **trailing half**; propped on table → **upper** = glanceable content, **lower** = controls.
- Preserve context: a focused search field stays **above the keyboard**, only width/position changes.
- Handled by the system: alerts, context menus, sheets, action sheets, menus, popovers, split views,
  buttons/menus/toolbar buttons (fold avoidance).

### 4.4 Layout rules
- **No fixed widths, breakpoints, or display-tied metrics.**
- Use **layout margins + horizontal safe area insets** (offsets dodge controls automatically).
- **Asymmetric:** handle each edge separately; backgrounds extend past the safe area (`ignoresSafeArea`).
- **Concentric corners:** `ConcentricRectangle` / `UICornerConfiguration` (iOS 26+).
- **Centered content** usually needs an **offset** so controls don't cover it.
- Grids: **even column counts** with a division region; widen spacing at the fold; keep each cell inside its region.
- **Non-scrolling immersive** layouts (Calculator) may span **full width**; may **mix** (full-width background/header,
  inset scrolling content).

### 4.5 Hardware tokens (verified)
| Category | Inner display | Outer display |
|---|---|---|
| Size | 7.6" folding OLED | 5.4" OLED |
| Resolution | 1878 × 2670 px | 1398 × 2034 px |
| Density | 430 ppi | 460 ppi |
| Points (3×) | **626 × 890 pt** | **466 × 678 pt** |
| Refresh | ProMotion up to 120 Hz | — |
| Brightness | 1000 / 1600 / 3000 nits (typical/HDR/outdoor) | — |
| Front camera | under-display 1080p60 (max) | ultrawide 4K120 (max) |

## 5. Component Library

| Component | Where used | Duo behavior | Best practice | Common mistake |
|---|---|---|---|---|
| **Adaptive container** | everywhere | Size class changes on pose change | Follow size class; cheap reflow | Rebuilding the display on fold |
| **Split view** (`NavigationSplitView`/`UISplitViewController`) | inner | Outer: collapse to 1 pane; inner: 2 panes, **50/50 when folded** | Let the system handle it; keep selection | Empty column with no placeholder |
| **ArrangementView (split)** | inner | Splits horizontally when wider>tall, vertically when taller>wide; axis limits ⇒ sometimes only 1 view | Use when the layout is an HStack/VStack; **navigation outside** | Placing inside a List/ScrollView |
| **ArrangementView (overlay)** | inner | Layered; **separates to both sides when folded**; collapsible; `overlayArrangementZIndex` | Use with a foreground/background relationship | Using when main–detail must never cover |
| **Vertical toolbar** | outer + inner landscape | Items at the trailing edge; top=navigation (Back/Close), then prominent (Done) | Provide **title + symbol**; prefer symbol-only; `AxisBehavior` when needed | Hand-rolled detached toolbar; manual spacing |
| **Vertical tab bar** | outer + inner landscape | Bottom-aligned in the vertical band; may become a **sidebar** on inner | 3–5 items; keep selection across pose changes | Losing the selected tab when expanding |
| **Sheet** | both | Outer: **vertical** buttons (or off); inner: **centered**, horizontal bar; dodges the fold | Use system sheets for free fold avoidance | Sheet resets on fold |
| **Alert / menu / popover** | both | Auto-avoids reserved regions | Use the system ones | Hand-rolled → lands on the fold |
| **List / Grid** | both | 1 column (outer) → more columns (inner) | Even columns with a division; widen spacing at the fold | Cramming 3 columns into outer |
| **Media + PiP** | both | PiP pinned to **top**; app compresses vertically; fold → video takes half the display | Adapt in real time to height | Interrupting on pose change |
| **Camera preview** | inner (+ outer accessory) | 2 front cameras; virtual auto-switch (1080p60, no depth) or individual devices + direction coordinator | Offset preview when there is spare room; `dynamicAspectRatio`; rotation coordinator; mirror when a rear camera faces the user | Preview flipped/mirrored wrongly when switching displays |
| **Scene accessory** | outer | `CameraCaptureAccessory` when full screen on inner + camera active; availability is **dynamic** | Track availability; register with the camera view | Assuming the accessory is always there |
| **Live Activity / Dynamic Island** | outer | Dynamic Island **expands vertically** in the edge band | Never cover the camera region | Placing important items right above the Dynamic Island |
| **Status bar** | outer + inner landscape | **Vertical** in the edge band | Let the system handle it | Drawing a fake status bar |
| **Empty / Loading / Error** | both | Persist across poses | A placeholder in every pane | Blank display on pose change |

### 5.1 New iPhone Duo APIs (summary)

| Area | Key APIs (SwiftUI · UIKit) |
|---|---|
| Size class / corner radius | `horizontalSizeClass` · `UITraitCollection`; `ConcentricRectangle` · `UICornerConfiguration` (iOS 26+) |
| **Reserved regions** | `GeometryProxy.reservedRegion` · `UIView.reservedRegion` (`ReservedRegion` · `UIView.ReservedRegion`); `.division` / `.occlusion` kinds; `includeInactive` |
| **Arrangements** | `ArrangementView` · `UIArrangementViewController`; `.arrangementViewStyle(.split/.overlay)`; `.axes(...)`; `overlayArrangementZIndex` |
| **Bars** | `AxisBehavior`; `ToolbarItemVisibilityPriority`; `ToolbarVerticalCompressionBehavior`; `ToolbarOverflowMenu`; `toolbarVerticalEdge`; `toolbarVerticalBehavior`; `cancellationAction`/`topBarPinnedTrailing` · `pinnedTrailingGroup`/`leftItemSupplementsBackButton`; Badge API (iOS 26) |
| **Scene / accessory** | `UIWindowSceneActivationAction`; `sceneAccessory`; `CameraCaptureAccessory`; `onAvailabilityChange` |
| **Hinge** | `onHingeChange` · `UIHingeInteraction` — closed / partially open / fully open + **continuous angle**; `nil` ⇒ reset state |
| **Camera** | Virtual Front Camera; outer/inner ultrawide device types; `AVCaptureDeviceDirectionCoordinator`; `AVCaptureDeviceDescriptor`; rotation coordinator; `dynamicAspectRatio`; `videoGravity` |

> Full table (purpose · usage · availability · coordination recipes): [references/API.md](references/API.md).
> Most Duo APIs ship with **SDK 27.1**; `Concentric*` and Badge date from **iOS 26**. Never touch
> `UIScreen.main`, never check orientation.

## 6. Screen Inventory

| Screen | Outer | Inner |
|---|---|---|
| Lock / Always-On | Quick glance, hide sensitive data | Centered Lock Screen, accessories in corners |
| Home / Feed | 1 column | Expanded columns / 2 columns |
| List ↔ Detail (Mail) | **1 pane** (list **or** detail) | **2 panes** side by side |
| Notes (master–detail) | 1 pane | Offset panes when open; **50/50 when folded** |
| Media / Reader | Phone-like | Immersive, reframed to the ratio |
| Camera / FaceTime | Quick capture | Large viewfinder + **teleprompter/secondary preview on outer** |
| Multitasking | — | 2 apps side-by-side; controls at outer edges |
| Editor / Create | Quick tasks | Work space, clear undo |
| Settings | 1 column | Wide column/2 columns |
| Empty / Error / Loading | Unchanged | Placeholder per pane |

## 7. UX Patterns

**Continue · Expand · Split · Overlay · Displace · Pin · Fold**

- **Continue:** opening mid-session → resume exactly where left off (video, form, scroll, selection).
- **Expand:** inner adds context (secondary column, metadata) — **functionality unchanged**.
- **Split vs Overlay:** main–detail that must never cover → **split**; foreground/background tolerating cover → **overlay**.
- **Displace:** only controls & short content; **never** scrolling content.
- **Pin:** PiP pinned to top; app compresses vertically in real time.
- **Fold:** the fold is the **natural dividing line**; the system nudges interactions off the fold.

## 8. Interaction Model

| Input | Rule |
|---|---|
| **Touch** | ≥ 44×44 pt on both displays; interactions avoid the fold |
| **Edge bars** | Back/Close on top → prominent → remaining groups; **no manual spacing** |
| **Fold / Hinge** | `onHingeChange` / `UIHingeInteraction`: closed / partially open / fully open + **continuous angle**; for **effects**, not layout; nil ⇒ reset state |
| **Multitasking** | Drag apps by the home indicator; 50/50; controls at outer edges; PiP pinned to top |
| **Scenes** | Multiple UI instances (if iPad already supports); **only inner creates new windows**; handle errors |
| **Keyboard** | Keyboard + accessory bar **stay with the keyboard** (never go vertical) |
| **Camera** | Virtual front camera (auto) **or** individual devices + **direction coordinator** (descriptor, main-actor safe) + **rotation coordinator** |
| **RTL** | Bar keeps the **same physical edge**; content mirrors around the bar |
| **Voice / Pencil / Pointer** | As on iOS/iPadOS; every key action gets an alternative path |

## 9. Accessibility

- **VoiceOver:** focus & reading order **preserved across pose changes**; announce major layout changes.
- **Dynamic Type:** both displays; layout restructures (2 columns → 1), never clips text.
- **Touch targets:** ≥ 44×44 pt on inner and outer; **avoid the fold**.
- **Contrast:** meets standard on both displays; watch glass/Liquid Glass over content.
- **Transparency/Motion:** vertical bar **gains a background** with **Reduce Transparency**; honor Reduce Motion
  on reflow.
- **Checklist:** [ ] focus/state across poses · [ ] Dynamic Type on both displays · [ ] touch targets ·
  [ ] fold avoidance · [ ] reduce transparency/motion · [ ] RTL keeps the bar edge · [ ] hide sensitive data when folded.

## 10. Performance Rules

- **Never reload** data on pose change — cache + **one source of state**.
- Reflow must be **cheap** (frame/size changes only), never rebuild the view tree.
- Don't cram 2 purposes into the inner display; one role per pane.
- No heavy animation on fold/unfold; prefer short/instant reflow.
- No deep hierarchies; keep the navigation stack across pose changes.
- **Many scenes/2 displays = 2 view trees**: manage memory; 1 direction coordinator **per view**.
- Camera: turn off sensor-orientation compensation after adopting the rotation coordinator.

## 11. Senior Review Checklist

- [ ] **Continuity:** folding/unfolding mid-session loses no media/form/scroll/selection/navigation path.
- [ ] **Pose matrix:** all **6 poses** exercised (closed, open P/L, book, propped, tent).
- [ ] **Size class:** only compact H (outer) & regular (inner); no fixed widths / main screen / orientation checks.
- [ ] **Reserved regions:** fold properly dodged (controls/interactions), scrolling content **not** displaced;
      inner camera active/inactive OK; even-column grid.
- [ ] **IA:** outer 1 pane ↔ inner 2 panes; only **one more** hierarchy level; no tab lost on expand.
- [ ] **Bars:** vertical on outer + inner landscape; horizontal on inner portrait; correct ordering; sensible overflow/priority;
      RTL keeps the edge.
- [ ] **Arrangement:** right split/overlay choice; navigation **outside**; not inside a List/ScrollView.
- [ ] **Multitasking/scenes:** left/right split; PiP pinned to top; new scenes on inner only + error handling.
- [ ] **Accessibility:** section 9 passes.
- [ ] **Empty/Loading/Error:** persist across poses, placeholder per pane.
- [ ] **Build SDK 27.1** + run **App Resizability**.

## 12. Failure Modes

| Failure | Why it's wrong |
|---|---|
| Stretching iPhone UI when open | Wastes the large display; overlong reading lines |
| Hard-coding "7.6 inch" / fixed widths | Breaks in other poses and multitasking |
| Checking orientation / using `UIScreen.main` | Inner ignores orientation; main screen will deprecate |
| Resetting to Home on fold/unfold | Breaks continuity |
| Two separate states for two displays | Data drifts on pose change |
| Hand-drawing controls over the fold | Hard to tap; the system already dodges it |
| Displacing scrolling content | Breaks article/feed continuity |
| Placing navigation inside ArrangementView | Arrangements have no navigation infrastructure |
| Creating new windows on outer | Outer **forbids** it |
| Assuming symmetric safe areas | Duo is asymmetric |
| Building a detached toolbar (UIToolbar) | Never switches to the vertical axis |
| Turning the vertical bar off for multi-control sheets but on for 1-button sheets | Wastes room backwards (multi-control sheets need it; 1-button sheets don't) |
| Using virtual camera when depth/4K is needed | Virtual only has common features (1080p60, no depth) |
| Not resetting pitch-bend when hinge is nil | "Ghost" values on hingeless devices |

## 13. Design System Rules (tokens & standards)

| Category | Rule |
|---|---|
| **Typography** | SF Pro / Dynamic Type; cap reading width on inner; **never** scale type with the display |
| **Spacing** | 4/8 pt rhythm; 16 pt margins; 12/24 pt control padding; keep a safe zone around the fold |
| **Radius** | `ConcentricRectangle` / `UICornerConfiguration`; content never touches curved/fold areas |
| **Elevation** | Liquid Glass/system materials; no heavy shadows |
| **Motion** | 200–300 ms reflow on pose change; honor Reduce Motion |
| **Color** | Semantic; dark mode first-class; passing contrast on both displays |
| **Adaptivity** | **Size-class-first**; no display hard-coding; **one source of state** |
| **Bars** | Vertical on outer + inner landscape; item axis per `AxisBehavior`; priority-driven overflow |
| **Poses** | 6 poses; when partially folded ⇒ dodge the fold + 50/50 panes; when propped ⇒ content above / controls below |

## 14. AI Decision Framework

```
IF platform == iPhone Duo
THEN
  Primary goal = continuity across poses (folded = quick, open = expansive)
  Layout       = size-class-first (outer compact H, inner regular) ; 1 column ↔ 2 panes
  Navigation   = same tree; tab bar ↔ sidebar; NEVER reset on pose change
  Chrome       = hug the trailing edge (toolbar/tab bar/status bar) ; inner-portrait exception
  State        = one source of truth; keep scroll/selection/form/media
  Regions      = dodge outer camera (always) & inner camera (when active) & fold (when folded)
  Priority     = 1) Seamlessness  2) Content  3) Actions
  Avoid        = fixed width · main screen · orientation check · 2 states · stopping media ·
                 cramming columns into outer · navigation inside ArrangementView

# Pose change
IF user folds/unfolds mid-session      THEN keep state & position (NEVER restart)
IF device partially folded             THEN dodge the fold; panes → 50/50; alerts/menus gather trailing
IF inner landscape                     THEN keep the vertical bar (seamless with outer)
IF inner portrait                      THEN HORIZONTAL bar (exception)

# Content layout
IF current layout is HStack/VStack     THEN split arrangement
IF current layout is ZStack            THEN overlay arrangement
IF main–detail, must never cover       THEN split view/arrangement
IF foreground–background, may cover     THEN overlay arrangement
IF inner needs one more level          THEN 2 panes (Mail list|detail) — functionality UNCHANGED
IF content scrolls                     THEN NEVER displace
IF grid + division region present      THEN prefer an EVEN column count, widen spacing at the fold

# Bars & overflow
IF outer landscape (wide–short)        THEN overflow likely → set visibility priority (groups first, then items)
IF navigation-focused                  THEN toolbar compresses first (default)
IF task-oriented                       THEN tab bar compresses first
IF item is symbol-only                 THEN vertical axis fits; text-only stays horizontal
IF item toggles symbol↔text            THEN AxisBehavior = horizontal-only
IF 1-control sheet/bottom-heavy app    THEN consider turning the vertical bar OFF

# System & hardware
IF a new window is needed              THEN inner only; use UIWindowSceneActivationAction
IF secondary UI on the other display   THEN scene accessory (CameraCaptureAccessory when camera active)
IF reacting to the hinge               THEN onHingeChange/UIHingeInteraction for EFFECTS (not layout)
IF full camera capability needed       THEN individual devices + direction coordinator (virtual is 1080p60/no depth only)
IF camera/image orientation is off     THEN rotation coordinator + disable sensor compensation
IF layout is centered                  THEN offset to dodge controls; or span full width when non-scrolling
IF Dynamic Type is large               THEN reflow columns (2→1) instead of clipping
```

**Sources:** see [references/SOURCES.md](references/SOURCES.md).