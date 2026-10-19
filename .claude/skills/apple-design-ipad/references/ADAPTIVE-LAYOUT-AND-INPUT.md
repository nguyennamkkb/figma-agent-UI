# Adaptive layout and input — iPad

> Sources: Apple HIG *Layout*, *Split views*, *Sidebars*, *Pointing devices*, *Apple Pencil*, *Keyboards*, *Drag and drop*; WCAG 2.5.x.

## 1. Layout follows the window

- Lay out by **size class and available width**, never by device model. A window can be any size (iPadOS 26 windowing — see `WINDOWS-AND-MULTITASKING.md`), so the layout must flex between compact and regular, not snap between two fixed designs.
- Columns are the unit: one column in compact width, two or three columns (sidebar · content · detail) in regular width.

## 2. Canonical structures

| Structure | SwiftUI shape | Use when |
|---|---|---|
| Sidebar + content + detail | `NavigationSplitView` (2 or 3 columns) | Parent–child hierarchy (mailboxes → messages → message) |
| Content + inspector | Main view + `inspector` | Secondary information only meaningful beside the primary content |
| Adaptive grid | Lazy grid with flexible columns | Large volumes of browsable content |

Parent–child → split view. Secondary-only-beside-primary → inspector (it becomes a sheet in compact width).

## 3. Switching between one and several columns

- With room, show the columns side by side and keep the selection.
- Collapsing to one column: show the detail of the current selection — unless the product is multi-select, then keep the list with its selection.
- Return people to where they were; keep the detail's scroll position and read state when switching items.

## 4. Why iPad input differs

- iPads are held on both sides or rest on a desk, so reachability differs from a phone (the bottom edge is not the comfortable zone).
- People combine inputs: touch, pointer, keyboard and Apple Pencil, sometimes at once.

## 5. Pointer

- Hover predicts, it never reveals: never make hover the only way to find a function.
- The pointer shape and the control's highlight show what is about to be pressed; layout never shifts on hover.

## 6. Keyboard

- Full keyboard access: every element reachable, a visible focus ring.
- Standard shortcuts plus a menu-bar command for every primary action; menus ordered by frequency and grouped; unavailable items are dimmed, never hidden.
- The on-screen keyboard never covers the field being edited.

## 7. Apple Pencil

- Strokes appear instantly; support pressure, azimuth and altitude where drawing matters.
- Hover previews, never activates. Double-tap / squeeze triggers an action that is easy to undo.
- Scribble works in text fields; every Pencil action has a finger or keyboard alternative.

## 8. Drag and drop

- Allow dragging between apps; clear drop destinations; spring-loading to open containers.
- Always a non-drag alternative: a "Move to…" menu, multi-select with batch actions (WCAG 2.5.7).

## 9. Ergonomics and accessibility

- Targets ≥ 44 × 44 pt, including table rows and sidebar items.
- Large text sizes reflow columns instead of clipping; right-to-left layouts mirror columns and navigation.
- Reduce Motion and Reduce Transparency keep bars legible.

## 10. Checklist

- [ ] Layout by size class and width, flexible between them.
- [ ] The right structure chosen (split view, inspector, grid).
- [ ] Selection and scroll position survive column changes.
- [ ] No function depends on hover.
- [ ] Everything works by keyboard; shortcuts and menu commands exist.
- [ ] Pencil actions have alternatives; drag and drop has a non-drag alternative.
- [ ] Targets ≥ 44 pt; large text and RTL do not break the layout.
