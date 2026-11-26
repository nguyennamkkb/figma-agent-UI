# CTA playbook — classify, build, verify

A CTA is a promise about what happens next. One screen gets **one primary promise**; every other action is demoted until the hierarchy is obvious at a glance. This file covers the classes of CTA, how each is built (anatomy, states, effects), and how to check it before handoff.

Use it in Stage 3 (component), Stage 5 (every screen) and Stage 7 (QA).

## 1. Classify before you draw

List every action on the screen, choose the one primary action, then assign a class. The class decides the look — never pick the look first.

| Class | Purpose | Visual weight | Typical context | Component style |
|---|---|---|---|---|
| **Primary** | The one action that completes the screen | Filled, highest contrast, accent colour | Bottom bar, form footer, empty state | `Style=Primary` |
| **Secondary** | A real alternative (Cancel, Skip, Change) | Tonal fill or outline, no accent | Beside a primary, inside cards | `Style=Secondary` |
| **Tertiary / text** | Low-emphasis navigation or inline edit | Text only, accent or neutral | Rows, headers, "Restore", "Privacy Policy" | `Style=Text` |
| **Destructive** | Irreversible action | Red text or red fill, never accent | Delete, discard, log out | `Style=Destructive` |
| **Purchase** | Money action (IAP, subscription, coins) | Strongest finish, used once per screen | Paywall, coin packs, checkout | `Style=Purchase` |
| **Disabled** | A class above whose prerequisites are unmet | Neutral surface, muted label, no effect | Same slot as the action | `Style=Disabled` |
| **Chip / inline action** | Compact action inside content | Pill 32–36 high, glass or tonal | Hero "Try now", toolbar | `Style=Chip`, `Size=sm` |
| **Top-bar action** | Small contextual action | 36-high pill or icon button | Crop "Done", modal close | Inside the `Top bar` component |

Rules:

1. **One primary per viewport.** Two filled accent buttons = no hierarchy. Demote one to Secondary or move it into a menu.
2. **Purchase is a separate class, not "Primary with more shadow".** It may carry the mirror finish; nothing else does.
3. **Dialogs cap at two actions** — Secondary left, Primary right (LTR), or one Primary alone. Dialog primaries stay solid/flat: the scrim and small width make gloss and gradients noisy.
4. **Destructive never borrows the accent colour**, even on a dark UI.
5. **Repeat ≥ 3 times → component.** A CTA drawn as a local frame is a defect; the effect must live in the component so it updates everywhere.
6. **Effects belong to the variant.** Never leave a per-instance fill/effect override on a screen: it drifts, and it breaks when the component changes.

## 2. Context → size → variant

| Context | Width | Height | Placement | Class |
|---|---|---|---|---|
| Bottom action bar | Screen − 32 (16 margins) | 48–52 | Pinned above safe area, unstyled hint below | Primary |
| Dialog | Panel − 48, or half-width when two actions | 48–52 | Last row of the dialog | Primary (solid) / Secondary |
| In-content card | Hug, min 120 | 40–48 | Trailing or below the card content | Secondary / Text |
| Hero overlay | Hug | 32–36 | Under the headline, thumb reachable | Chip |
| Top bar | Hug | 32–36 | Trailing edge | Top-bar action |
| Sheet footer | Sheet − 40 | 48–52 | Last row, above the disclosure note | Primary / Purchase |

Full-width is the default for the one primary action; a full-width Secondary is usually a mistake — it competes with the Primary.

## 3. Anatomy (default scale)

| Part | Value |
|---|---|
| Height | 48 or 52; `52` for purchase, `48` for compact |
| Radius | `999` pill, or `12` in a squarer system — one or the other, never mixed |
| Horizontal padding | 20–24 |
| Label | 16/20 semibold (Lexend, SF, Roboto per brand), sentence case, action verb + object |
| Icon | 20–24, same colour as the label, gap 8 to the label |
| Min width | 120; max label 2 lines is a rewrite, not a wrap |
| Label colour | On accent: near-black `#1A1208` on amber, `#0B0B0B` on lime. Never white on a light accent |

Labels: "Purchase now", "Start 3-day free trial", "Generate video", "Allow camera" — say what happens. Ban "OK", "Submit", "Continue" when a specific verb exists ("Continue" is acceptable only for multi-step wizards).

## 4. States

| State | Fill | Label | Notes |
|---|---|---|---|
| Default | Class fill | Class label | — |
| Pressed | Fill + 12% black overlay, or scale 0.98 | Unchanged | Ripple on Android, opacity on iOS |
| Disabled | `#23232D` (surface/overlay) | `#948E87` (text/tertiary) | No gradient, no shadow, no border. Explain the prerequisite in a hint below, not in the label |
| Loading | Same fill, interaction off | Spinner + "Processing…" or keep label | Keep the width; never collapse the bar |
| Focus (web) | 2px ring, offset 2 | Unchanged | Ring uses the accent token |
| Success | Optional short label swap | "Saved" | Revert after 1.5 s |

Never fake disabled with 50% opacity on a gradient: it reads as a rendering bug. Use the neutral surface.

## 5. Effect catalog

Effects are layered on the base fill, in this order: **fill → inner bevel/glow → glare band → label**. Keep at most three effects; stacking gloss + outer glow + border + bands produces mud.

### 5.1 Glossy (primary CTA)

For the amber accent, at 52 high:

- Fill: linear gradient, horizontal, 4 stops — `#FFD88A` 0%, `#FFB547` 40%, `#FF8A3D` 75%, `#FF6B4A` 100%.
- Inner shadow 1: `#FFF3DC`, y `1`, blur `4`, spread `2` — sharp top rim.
- Inner shadow 2: `#FFD08A`, y `0.5`, blur `18`, spread `2` — soft glow inside.
- No drop shadow. (A coloured outer glow reads as neon, a different style; only add it deliberately.)
- Label `#1A1208`.

Lime variant of the same recipe: `#E8FC78` 0 → `#D2F925` 36% → `#86F82B` 68% → `#9AF972` 100%, rim `#F2FEC9`, glow `#E4FC9A`, label `#0B0B0B`.

### 5.2 Mirror sweep (purchase CTA only)

A mirror finish is **not** a metallic gradient. It is the base fill plus one or two **white diagonal bands** — the static frame of a highlight that sweeps left → right at runtime.

- Base: the Primary gradient + the two inner shadows above.
- Band geometry on a 328×52 pill (scale proportionally): two white parallelograms, opacity `25%`, no stroke, ~47° slant, clipped by the pill (`clipsContent` on the component), placed behind the label:
  - band A — 134×52 at x `48`, path `M 55.44 0 L 134 0 L 81.03 51.64 L 0 51.64 Z`
  - band B — 85×52 at x `11`, path `M 59.08 0 L 85 0 L 28.38 51.64 L 0 51.64 Z`
- Static frame: bands parked on the left third. In code/prototype they translate from `-40%` to `140%` width, 1.2–1.6 s, ease-in-out, 1.5 s pause, loop; disable under Reduce Motion.
- Never fill the whole button with alternating light/dark metallic stops — that is chrome/gold, a different style, and it hides the label.

### 5.3 Basic solid (dialogs, dense UI)

- Fill: solid `accent/primary` (amber `#FFB547`), label `#1A1208`.
- No gradient, no inner shadow, no band.
- Use for every dialog primary, and anywhere two CTAs sit side by side in a small panel.

### 5.4 Secondary / tertiary

- Secondary: `#23232D` (or `#FFFFFF` 10%), label `#FFFFFF`; no effects.
- Tertiary: no fill, label uses `accent/primary` or `text/secondary`.

## 6. Build the component

```
Button (component set)
├─ Style=Primary      │ gradient + gloss
├─ Style=Secondary    │ tonal fill
├─ Style=Text         │ no fill
├─ Style=Destructive  │ red
├─ Style=Purchase     │ gradient + gloss + 2 mirror bands
└─ Style=Disabled     │ neutral surface, muted label
```

- Properties: `Label` (text), `Style` (variant), `Size` (variant only if the system really has 2–3 sizes), icon booleans or instance-swap slots. Keep the set ≤ ~50 variants (`design-system.md` §6.4).
- Extra decorative layers (bands, glare, spinner) are **children of the component variant**, not of instances. Figma's API cannot add children to an instance or edit a nested instance's contents — anything the CTA needs must exist in the variant, behind the auto-layout label and with `layoutPositioning = ABSOLUTE`.
- Variant-level effects only. If one context needs a different finish (dialog = solid, purchase = mirror), add a variant; do not scatter overrides.
- Name variants `Style=Value`, description in the component: intent, when to use, when not to.
- Bind every colour, radius, spacing and font size to tokens; the gradient stops may be a paint style (`accent/cta-gradient`).

## 7. Screen-level checks (Stage 5)

1. Exactly one Primary/Purchase per viewport; every other action is Secondary/Text.
2. CTA sits in the thumb zone, 16 px from the screen edge, above the safe area and below the keyboard.
3. There is a visible way back, and the primary action never hides the close/back affordance.
4. Disabled CTA always has a nearby reason ("Add a photo to continue") and the reason disappears when the state changes.
5. Purchase CTA shows price, period, trial terms and Restore in the same view; the label states the charge ("Purchase now · $39.99" if there is room).
6. The ad slot's "Install" button belongs to the ad component — never convert it to the app CTA.

## 8. QA checklist

- Label contrast ≥ 4.5:1 on the fill; disabled labels still ≥ 3:1 where possible.
- Touch target ≥ 48 dp / 44 pt including padding; ≥ 8 px between targets.
- Label fits one line at the smallest supported width; no clipped descenders; `stress_test` + screenshot.
- Loading and disabled keep the layout stable (no jump, no width change).
- Mirror band never obscures the label: it sits behind it, opacity ≤ 30%.
- Dark and light themes both checked (`stress_test` in each mode).
- Pressed/loading states exist in the component, not improvised per screen.
- No CTA built from a local frame anywhere in the approved section.

## 9. Anti-patterns

- **Gloss on everything** — hierarchy disappears; gloss is for the primary, mirror for purchase, solid for dialogs.
- **Gradient + outer glow + border + bands** all at once → muddy, and the label loses contrast.
- **Chrome/gold metallic bands** used as "mirror" → the label drowns and it reads as a different brand.
- **Two stacked full-width CTAs** (the second is almost always a text link).
- **Fake urgency** on purchase (countdown that resets, "only today") — ban it.
- **Per-instance effect overrides** → silent drift from the system.
- **Disabled = 50% opacity of a gradient** → looks broken; use the neutral surface.
- **Copying an ad CTA** into the app's CTA style, or vice versa.

## 10. Handoff notes

| Platform | Gloss | Mirror sweep |
|---|---|---|
| CSS | `background: linear-gradient(...)` + `box-shadow: inset …` ×2 | `::before` with `transform: skewX(-47deg)`, `background: #fff`, `opacity:.25`, clipped by `overflow:hidden`, `@keyframes` translateX |
| Android (Compose) | `Brush.linearGradient` + `drawWithContent` for inner shadows | `Canvas` + `clipPath(pill)` + rotated `drawRect(Color.White.copy(alpha=.25f))`, animate offset |
| iOS (SwiftUI) | `LinearGradient` + `.overlay` inner shadow via `.shadow(.inner)` | rotated `Rectangle` overlay, `.mask(pill)`, `.offset(x:)` with `withAnimation(.easeInOut.repeatForever())` |

Ship the effect as part of the component contract: sizes, stop positions, opacities and band angles are values, not "make it shiny".
