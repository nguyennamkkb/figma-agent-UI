# Vertical Bars (toolbar / tab bar / navigation) — iPhone Duo

> Distilled from HIG *Designing for iPhone Duo* (Vertical controls section) +
> Tech Talk *Raise the bar with iPhone Duo* + *Design for iPhone Duo*.
> Images: `assets/vertical-bars-layout.png`, `assets/compression-tabbar.png`, `assets/compression-toolbar.png`, `assets/pane-controls.png`.

## 1. Why bars move to the edge

The outer display is **wider but shorter** than a regular iPhone. To **preserve vertical room for content** and bring
controls **within thumb reach**, controls that normally sit top/bottom **move to the (trailing) edge**.

- **Still the same components**, just arranged differently.
- Position carries over when opening onto **inner landscape** ⇒ seamless.
- **Only exception:** the inner display in **portrait** keeps the **horizontal** bar (enough vertical room).
- The vertical band at the edge is a **shared zone** between system and app: **Dynamic Island → status bar → toolbar →
  tab bar**, top to bottom (`assets/vertical-bars-layout.png`).
- In **Split View multitasking**, each app places controls at **its own outer edge** (left app → controls left).
- Being hardware-bound, the bar **stays on the same physical edge** even in **RTL**; content re-flows around it.

## 2. Per-container constraints (easy to get wrong)

| Context | Behavior |
|---|---|
| Split view | **Only the detail column** joins the vertical bar; other columns keep horizontal bars |
| Inspector (expanded) | Gets **no** separate vertical bar (the detail column's bar already exists) — avoids duplication |
| Sheet — outer | Has a toolbar → renders **vertically** |
| Sheet — inner | **Centered**, items stay **horizontal** |
| Sheet `preferredPlacement` | Placed **left** → no vertical bar; placed **right** → vertical bar |
| Accessory bar (above keyboard) | **Stays with the keyboard**, never switches to the vertical axis |
| Tab bar + toolbar | May **coexist** in the vertical band (e.g. Fitness) |

## 3. Item ordering

Keep a clear **top→bottom hierarchy**:

1. **Top:** primary navigation — **Back / Close**.
2. **Next:** prominent action — **Done**.
3. **Rest:** keep the **original groups**; the system inserts **vertical gaps** between groups arriving from the top
   bar vs the bottom bar.

| Task | SwiftUI | UIKit |
|---|---|---|
| Custom back/close | `cancellationAction` | leading item + `leftItemSupplementsBackButton = false` (default) |
| Prominent action | `topBarPinnedTrailing` | `pinnedTrailingGroup` |
| Item groups | `ToolbarItemGroup` | `UIBarButtonItemGroup` |

**Don't add your own spacing** — groups handle it; manual spacing drifts when space changes.

## 4. Item axis (Axis behavior)

- **Horizontal** bar: items have **fixed height**, flexible width.
- **Vertical** bar: items have **fixed width**, flexible height ⇒ **suits symbol-only items**.
- Picking a representation: has an icon → prefer the **icon** (it survives the axis switch); **text-only** → **stays horizontal**;
  in overflow → show **both title + icon**.
- **Always provide both title and symbol** for an item (even image items), since the system uses the title in
  overflow/expanded forms.
- `AxisBehavior` API is for:
  - Items that **toggle symbol ↔ text** (e.g. Edit) → set **`horizontal-only`** so they don't jump axes.
  - **Complex custom views** → stay horizontal by default; if vertical is supported → set **`vertical-preferred`**.
- **Badge API (iOS 26+):** turns a "text + symbol" item (e.g. an inbox count) into a **symbol-only** one
  ⇒ fits the vertical bar while staying glanceable.
- Judging text: if the text only **reinforces** the symbol → drop it; if it carries **independent information**
  (e.g. a cart showing the total) → **keep it on the horizontal bar**.

## 5. Custom views in the vertical bar

- Must **fit the bar's fixed width** **or** have a vertically adaptive layout.
- Consider adjusting metrics for the vertical form (e.g. hide the title, slightly shorter to make room).
- Read `toolbarVerticalEdge` (environment/trait) to know you're in a vertical bar (nil = not possible).
- The vertical bar has **no scroll-edge effect** by default; it **gains a background** with **Reduce Transparency** ⇒
  custom content must stay legible in both cases.
- **Flexible spacer = 0** on the vertical axis; **fixed spacers** keep their minimum size.

## 6. Overflow & compression

- Outer **landscape** overflows **more** due to limited vertical room; the keyboard / Picture-in-Picture also
  compete for space.
- Decide who stays visible longest:
  - **Navigation-focused** (e.g. Podcasts) → **toolbar compresses first**, keeping the tab bar & primary destinations.
    This is the **default**.
  - **Task-oriented** (e.g. Games) → **tab bar compresses first**, keeping the task's actions
    (`toolbarCompressionBehavior`).
- **Merge the app's overflow into the system menu** (`ToolbarOverflowMenu` / `additionalOverflowItems`).
- **Reserve "…" for overflow**; use a different symbol for other menus.
- **Visibility priority:** by default overflows **bottom-up**; may be set **high/low/custom**.
  Set it **per group first**, then **per item** as needed.
  Keep preferentially: frequently used actions (Compose/New Note) and items carrying **important state (badge)**.

## 7. When to turn the vertical bar OFF

Not every app should go vertical:
- **Single-page, bottom-heavy** (e.g. Calculator) → consider staying horizontal so content fills the display.
- **Sheets with only 1 control** (e.g. a Close button) → turn the vertical bar off to save space.
- API: `toolbarVerticalBehavior` / `preferredVerticalBarBehavior`.

## 8. Vertical bar checklist

- [ ] Bar lives in a standard navigation container (TabView/NavigationStack); **no** standalone UIToolbar.
- [ ] Order: Back/Close on top → prominent action → remaining groups.
- [ ] Every item has **both title + symbol**.
- [ ] Symbol-only for fitting items; badges replace count text.
- [ ] Symbol↔text toggling items set `horizontal-only`.
- [ ] Custom views: fit the fixed width or provide a vertical layout; read `toolbarVerticalEdge`.
- [ ] Overflow: merge custom menus into the system one; set visibility priority per group then item.
- [ ] Pick the right compression behavior (navigation-focused vs task-oriented).
- [ ] Verify RTL, Reduce Transparency, and the both-bars-compressed case.
