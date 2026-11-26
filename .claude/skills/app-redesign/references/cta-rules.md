# CTA rules for a redesign

Recipes (gradients, inner shadows, band geometry, sizes, states) live in `figma-ui-flow/references/standards/cta-playbook.md`; this file says which class each button of the baseline becomes and what `audit` checks.

## 1. Class → variant

| Class | Used for | Effect | `Button` variant |
|---|---|---|---|
| **Purchase** | every money action: paywall subscribe/continue, coin packs, unlock premium | Primary gradient + 2 inner shadows + **two white diagonal bands at 25%** (mirror sweep; band A 134×52 at x 48, band B 85×52 at x 11 on a 328×52 pill, ~47°, clipped). Runtime: bands sweep left → right 1.2–1.6 s, 1.5 s pause, loop | `Style=Purchase` |
| **Generate** | last step before spending coins | Primary gradient + divider + cost | `Style=Generate` |
| **Primary** | the one main action of a screen | gradient + 2 inner shadows; no bands, no outer glow | `Style=Primary` |
| **Solid** | primary action inside a dialog / small panel | solid accent, no gradient, no shadow | `Style=Solid` |
| **Destructive** | discard, delete, log out | red, never the accent | `Style=Destructive` |
| **Secondary / Text / Disabled** | alternatives, Restore, links, unmet prerequisites | no effect | `Style=Secondary / Text / Disabled` |

## 2. Rules

1. The bands exist **only** on Purchase.
2. One Primary/Purchase/Generate per screen outside dialogs.
3. Effects live in the variant; never a hand-built frame or a per-instance override. A baseline button copied as a frame (e.g. layers `Rectangle 41981/41982` for the bands) becomes a `Style=Purchase` instance.
4. Cost appears only on the last button before spending; Disabled shows no cost.
5. Labels say what happens; a changed label goes into `copyMap` so parity still matches.
6. Dialogs: max two actions, Secondary + Solid (or Destructive).
7. Bands drawn by code: copy the paths, opacity and glow of the baseline Purchase button (read its band vectors), and set `strokes = []` — `figma.createVector()` adds a black 1 px stroke by default.

## 3. Mapping the baseline

During `start` §4 list every CTA from `inventory.baseline.json` (`screens[].ctas`) with its proposed class in `plan.md` §5. Money actions are found by label and screen archetype (paywall, coin-purchase), not by look.

## 4. Checks (`audit`)

CTA-LOCAL, CTA-MIRROR (errors), CTA-PAY, CTA-DIALOG, CTA-DESTRUCTIVE, CTA-MULTI, CTA-COST (warnings) — see `audit.md` §2. Detection is heuristic (`scan.js` finds buttons by name `button|btn|cta` or by an instance of a Button component, 32–72 px high, with a label; bands = a faint white shape ≥ 15% wide and ≥ 80% high inside the button); look at the screen before calling a warning a defect.
