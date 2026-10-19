# Action hierarchy (primary / secondary)

> Sources: Carbon Design System (button guidelines), Material, public design systems,
> industry CTA practice.

## 1. Levels

| Role | Use for | Rule |
|---|---|---|
| **Primary** | The screen's **main** action | **Exactly 1 primary / view** (excluding header/modal/side panel) |
| **Secondary** | Alternative/opposing action ("Cancel", "Back") | Goes in a **pair** with primary; **never alone**; not for positive actions |
| **Tertiary** | Low-emphasis action / sub-task | Standalone or alongside primary when there are multiple CTAs |
| **Ghost** | Least emphasis | Usually paired with primary ("Cancel" in a flow) |
| **Danger** | Destruction (delete/remove) | Has primary/tertiary/ghost variants; **separated** from primary |

## 2. Golden rules

- **One primary per view.** Demote every other CTA.
- **Two primaries side by side cancel each other out** (exception: two deliberately equivalent choices).
- **Don't mix sizes** within one container; keep group sizing consistent.
- **Don't leave a primary "lonely" among many peer buttons** — the hierarchy must read instantly.

## 3. Order & position in a group (mobile)

| Layout | Order |
|---|---|
| **Right**-aligned group | Primary **outermost right** → then descending |
| **Left**-aligned group | Primary **outermost left** → then descending |
| **Fluid** group (full width) | Primary **on the left** (in order) |
| **Bottom-sticky** (screen bottom) | Primary **on the right** — thumb ergonomics |
| Single button at the bottom | **Full width** |

## 4. Labels & content

- Label = a **short verb (1–3 words)** stating the **outcome**: "Save", "Place order", "Delete photo".
- Avoid: generic "OK", "Submit", "Continue" (they don't say what happens).
- Destructive actions: name the object ("Delete 3 items") and the consequence.
- **Prefer undo over confirm** for moderate actions; confirm for serious/irreversible ones.

## 5. Accessibility for hierarchy

- Contrast: buttons ≥ **3:1**, text ≥ **4.5:1**.
- Clear focus ring on every button.
- **Never** convey importance **by color alone** — pair it with position/size/style.
- A disabled button must not be the only path to a core use case without an explanation.

## 6. Checklist

- [ ] Exactly **one** primary/view; other actions demoted.
- [ ] Valid button pair (primary + secondary/tertiary/ghost/danger).
- [ ] Button names are verbs stating the outcome.
- [ ] In-group order follows the §3 table.
- [ ] Destruction has confirm or undo; separated from primary.
- [ ] Contrast passes; focus ring clear; no color-only reliance.
