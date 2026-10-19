# Poses & Size Classes — iPhone Duo

> Distilled from HIG *Designing for iPhone Duo* + Tech Talks *Design for iPhone Duo*,
> *Prepare your app for iPhone Duo*, *Strike a pose with adaptive layouts*.
> Images: `assets/poses.png`, `assets/vertical-bars-layout.png`, `assets/splitview-open.png`, `assets/splitview-folded.png`.

## 1. Six poses (read from `assets/poses.png`)

| # | Pose | Display | Visual traits | Strategy |
|---|---|---|---|---|
| 1 | **Closed** (folded) | Outer | Wider–shorter than a regular iPhone; corner camera | Compact width; quick one-handed tasks |
| 2 | **Tent / standing** (propped on edge) | Outer+Inner | Standing upright, hands-free | Glanceable content in the upper region; controls in the lower region |
| 3 | **Open landscape** | Inner | Wide flat slab, horizontal | 2 columns, media, multitasking |
| 4 | **Partially folded (book)** | Inner | Display curved through the center (fold) splitting 2 regions | Displacement: avoid the fold; interactive elements shift to both sides |
| 5 | **Open portrait** | Inner | Tall; horizontal bar returns | Familiar iPhone layout, more stacked content |
| 6 | **Propped on edges** | Inner/Outer | Leaning tilt | Media above, controls on the stable surface |

## 2. Size class per pose (from Tech Talk *Prepare your app*)

| Position | Portrait | Landscape | Notes |
|---|---|---|---|
| **Outer** | compact **H** + regular **V** | compact H + compact **V** | Like a regular iPhone |
| **Inner** | regular H + regular V | regular H + regular V | Room for a sidebar |

Mandatory rules:
- **The inner display IGNORES `supportedInterfaceOrientations`** — never check orientation to decide layout; use **size classes**.
- **Never reference the "main screen"** in code (ambiguous, will be deprecated on two-display devices). Use environment / trait collection / scene bounds.
- On the inner display, the app **scales** even in Split View multitasking; `UIRequiresFullScreen` is still honored but the app **still resizes** on open/fold.

## 3. Only two layouts to design

> "A compact width layout for the outer display and a regular width layout for the inner display
> give you the fundamentals for every pose."

- **Don't** design a separate layout per pose.
- **Don't** use fixed widths, breakpoints, or metrics tied to one specific display.
- Use **layout margins + safe area insets** (including horizontal insets) → offsets avoid controls automatically.
- If the app is already "freely resizable" (like on iPad / iPhone Mirroring), it is nearly ready.

## 4. Layout per pose — field rules

### Closed (outer)
- Controls **hug the right (trailing) edge**: Dynamic Island → status bar → toolbar → tab bar, top to bottom (`assets/vertical-bars-layout.png`).
- The left content area is about as wide as a regular iPhone ⇒ keep the familiar iPhone experience.
- Sheets: buttons may stack **vertically**; the vertical bar may be **turned off** for a 1-button sheet (the sheet stops before the camera, the status bar shifts on its own).

### Inner — landscape
- The vertical bar stays on the **same edge** as outer ⇒ seamless when opening.
- Split view: columns widen; Notes adjusts each pane's width so both stay clearly visible (`assets/splitview-open.png`).
- 2-app multitasking: each app places controls at **its own outer edge** (left app → controls left).

### Inner — portrait
- **Exception:** enough vertical room ⇒ the **horizontal** bar returns, like the familiar iPhone.
- Sheets use the standard horizontal bar (both landscape and portrait).

### Partially folded (book)
- The curved display splits inner into 2 usable regions; **the fold is the natural dividing line**.
- Text/images **shift away from the center**; interactive elements move out to both sides (easier to tap).
- **Scrolling content need not avoid the fold** (scrolling itself handles continuity).
- Split view: the system rebalances both columns to **50/50** so both stay legible (`assets/splitview-folded.png`).
- Grids: keep outer margins, **widen the gap around the fold** ⇒ each cell sits fully inside its region.
- Sheets/alerts/menus/buttons **avoid the fold on their own** (system components).

### Propped / tent
- **Upper** region = glanceable content viewed from afar (media, status).
- **Lower** region = interactive controls (stable touch surface).
- A "table-top" layout is **optional**; if built, it must keep the **same controls + same hierarchy** as other poses.

## 5. Pose checklist

- [ ] Exercise 6 poses in Device Hub (open/close/rotate/fold).
- [ ] No fixed widths / screen references / orientation checks.
- [ ] State + functionality preserved across pose changes.
- [ ] Large Dynamic Type: layout restructures, never clips text.
- [ ] Asymmetric safe area & layout margins handled per edge.
- [ ] Panes/splits adjust around the fold; grids use even column counts.
