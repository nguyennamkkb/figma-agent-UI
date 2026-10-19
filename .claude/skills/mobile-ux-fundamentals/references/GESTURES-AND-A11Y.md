# Gestures & accessibility

> Sources: WCAG 2.2 — SC 2.5.1 Pointer Gestures, SC 2.5.7 Dragging Movements, SC 2.5.2 Pointer Cancellation.

## 1. WCAG 2.5.1 Pointer Gestures (Level A)

- Any function using **multipoint** (2+ fingers) or **path-based** input (the path matters: straight swipe,
  drawing a shape) must have a **single-pointer, path-free alternative** — unless the gesture is **essential**.
- **Path-based** = direction/path matters. **Dragging** (only start/end points matter) falls under 2.5.7.
- **WCAG 2.2 addition:** the 2.5.1 alternative must **not** rely on **dragging** alone (that fails 2.5.7).

## 2. WCAG 2.5.7 Dragging Movements (Level AA)

- Any function requiring a **drag** must work with a **single pointer without dragging** (tap/click), unless dragging is essential.
- Valid alternatives:
  - **Up/down arrow buttons** to reorder step by step.
  - A **"Move to…" menu** to pick a destination.
  - Selecting multiple items + batch actions.
  - A numeric input instead of a slider.
- **Don't** use swipe/flick as the alternative (violates 2.5.1).

## 3. SC 2.5.2 Pointer Cancellation

- Actions should fire on **release** (not on press) ⇒ lets users drag out to cancel.
- Offer **undo** once the action has happened.

## 4. Mobile design implications

- Every gesture (swipe, pinch, drag, long-press, rotate) needs a **visible alternative**.
- Hidden gestures ⇒ **undiscoverable** + poor a11y ⇒ add a hint/onboarding or an equivalent button.
- Slider: tap on the track or +/- buttons.
- Carousel: prev/next buttons (swiping must not be required).
- List ordering: an "Edit" mode with move buttons, not drag-and-drop only.
- **Keyboard/switch/voice** must achieve the equivalent function; logical focus order.

## 5. Accessibility checklist (mobile)

- [ ] **Target size:** ≥ 24×24 px (AA), goal 44 pt / 48 dp; enough spacing.
- [ ] **Gestures:** single-pointer alternative for every gesture; drag has a no-drag path.
- [ ] **Cancellation:** fires on release; has undo.
- [ ] **Contrast:** text ≥ 4.5:1 (large ≥ 3:1); UI ≥ 3:1; never color-only.
- [ ] **Screen reader:** full label/value/role; reading order = visual order; states announced.
- [ ] **Text scaling / spacing:** supports the largest size; no clipped text (SC 1.4.12).
- [ ] **Reflow:** usable at 320 px without two-dimensional scrolling (SC 1.4.10).
- [ ] **Orientation:** no hard-locked orientation unless required (SC 1.3.4).
- [ ] **Motion:** respect Reduce Motion; no flashing.
- [ ] **Focus:** clear ring; no traps; return focus when a modal closes.
