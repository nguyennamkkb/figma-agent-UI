# Presentation surfaces

> Sources: NN/g (bottom sheet), Material (sheets/snackbars/dialogs), industry practice.

## 1. Surface picker

| Surface | Blocks interaction? | Use when | Don't use when |
|---|---|---|---|
| **Dialog / Alert** | **Yes** | A **decision** is needed to continue; high-importance information | Ordinary information; overuse |
| **Bottom sheet (modal)** | Yes | Contextual task, **3+ actions** needing no explanation; replaces inline menus on mobile | Long flows; stacked sheets |
| **Bottom sheet (standard)** | No | **Supporting** details/controls, main content still visible | Full-screen content needed |
| **Snackbar** | No | **Light feedback** after an action; **0–1 action** | Multiple actions; the **only** path to a core use case |
| **Toast** | No | Short system notice, **no action**, not swipeable | An action is needed |
| **Banner** | No (usually) | **Persistent** state (offline/disconnected/global error) | Transient notices |
| **Inline** | No | Field errors, in-context states | Global information |

## 2. Bottom sheet — NN/g rules

- **Allow Back to dismiss** (users read it as a regular page).
- **Always include a clear Close button**.
- **Never stack** sheets (users can't tell Back from the stack's X apart).
- Only for **short interactions**; don't turn a sheet into a multi-step flow.
- Keep the relevant **background content visible** — that's the sheet's advantage.
- **Don't** justify it with "easy to reach" (the common reachability misconception).
- When a sheet expands full-screen: add a **dismiss button in the header** (left) and still support pull-down.
- An expanded sheet can **cover bottom nav/FAB** ⇒ consider layer order.

## 3. Dialog — rules

- Only for **important information/decisions** because it **blocks** the user.
- **≤ 2 buttons**; a clear cancel; the destructive button distinguished by color **and** position.
- Focus the safe default; read the full title + message; return focus on close.
- Don't use dialogs for ordinary information ("alert fatigue").

## 4. Snackbar / toast — Material rules

- Place at screen **bottom**; **never cover** targets/navigation/FAB (push FAB up).
- Mobile: max **2 lines**; desktop/tablet: **1 line**.
- **No icons**; **never** the only path to a core use case; **no** stacking.
- With an action, follow dialog spacing/affordance; **≥ 2 actions ⇒ dialog**.
- Auto-dismiss; allow swipe-to-dismiss (except toast, which isn't dismissible).

## 5. General rules

- **One surface at a time**; no layered stacking.
- A blocking surface must have a **clear exit** (Close/Back/Cancel).
- Long content ⇒ a **dedicated screen**, never crammed into a sheet/dialog.
- Persistent states (offline/errors) ⇒ **banner/inline**, not a vanishing snackbar.
- Always preserve **context**: the user must know where they are after dismissing.

## 6. Checklist

- [ ] Need to **block** for a decision? → dialog/alert.
- [ ] **Short** task + background must stay visible? → bottom sheet with Close + Back.
- [ ] Just **transient feedback**? → snackbar ≤ 1 action.
- [ ] **Persistent** state? → banner/inline.
- [ ] No stacking; no dialog abuse; no core use case buried in a snackbar.
- [ ] Focusable/readable; has an exit; context preserved.
