# Interaction states

> Sources: Material Design 3 (states, state layers), Carbon Design System, component practice.

## 1. Standard state set

| State | Meaning | Representation |
|---|---|---|
| **Enabled** | Default, interactive | Standard component styling |
| **Disabled** | Not interactive | Reduced color/elevation, **~38% opacity**; **no** focus/hover/press |
| **Hover** | Pointer resting on the element | state layer **+8%** (subtle fade) — pointer only |
| **Focused** | Keyboard/voice navigation | state layer **+10%** + a clear **focus ring** |
| **Pressed** | Tap/click | state layer **+10%**, **high-emphasis**, ripple/composition change; only **1 pressed** at a time |
| **Dragged** | Dragging the element | state layer **+16%** |

## 2. State layer (Material)

- Three-layer structure: **container → state layer → content**.
- The state layer uses the **content's color** (usually an "on color") at a % opacity.
- Standard values: **hover 8 · focus 10 · press 10 · drag 16 · disabled 38**.
- **The state layer is smaller than the interactive target**: state layer 40 dp but **target 48 dp** —
  don't let the small layer fool you into thinking the target is small.

## 3. Principles

- States **can combine** (selected + hover, focused + selected) — don't design them as mutually exclusive.
- **Two visual indicators** per state (never color alone) — ensures a11y.
- **Disabled takes no focus** and doesn't respond to hover/press; disabled **doesn't need to meet contrast**.
- **Apply consistently** across every component in the system.
- A screen's boot state (loading, empty, error) is a **different kind** — see
  [STATE-LIFECYCLE.md](STATE-LIFECYCLE.md).

## 4. Commonly forgotten extra states (mobile)

| State | Rule |
|---|---|
| **Loading (in-control)** | Keep the **label**, add a spinner; disabled but **not hidden**; re-enable when done/on error |
| **Error (field)** | Border/message states **how to fix**; don't just change color |
| **Success** | Confirm with **more than color** (icon + text) |
| **Selected / On / Off** | Announced to screen readers (value/role) |
| **Stale / Refreshing** | Say the data may be old; offer refresh |

## 5. Anti-patterns

- Hiding the focus ring; using **color** alone to signal disabled; disabled still clickable;
- Loading wiping out the label (user loses context);
- Mixing state styles ad hoc across components;
- Using a pressed state for an action that doesn't actually fire (dishonest feedback).

## 6. Checklist

- [ ] Enough enabled/disabled/pressed (+ hover/focus where pointer/keyboard exist).
- [ ] Focus ring clearly **visible**; never obscured.
- [ ] Disabled is non-interactive & unfocusable.
- [ ] Loading keeps the label + is cancellable when long.
- [ ] Every state is announcable for a11y.
- [ ] States consistent system-wide; state-layer % per token.
