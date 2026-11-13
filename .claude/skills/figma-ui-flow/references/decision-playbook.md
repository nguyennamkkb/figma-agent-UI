# Decision playbook — why this screen, why this way

Think before drawing, in proportion to the screen: a few lines, not a document. Never block on missing data — assume, mark it `(assumed)`, keep building.

## Value test

A design is worth building when it solves a real problem for the right users, serves the current business goal, lets users understand and finish with little friction, and can be checked. Looks raise perceived quality; they don't replace these.

## Brief additions (Stage 1)

- **Priority now:** acquisition / activation / retention / revenue / referral — pick one.
- **Aha moment:** the first result that makes the app feel worth using.
- **Money:** free / IAP / subscription / ads / hybrid.
- **Primary metric + guardrail:** one outcome to move, one thing that must not get worse (retention, task completion, refunds, trust).

## Screen contract (Pass 0)

Every screen, one line each:

1. **Purpose** — why it exists; no purpose or progress → don't draw it.
2. **Entry → exit** — where the user comes from, in what state; where they go next; can they go back.
3. **Primary action** — one.
4. **Information order** — first, second, the rest (hidden or later).
5. **States** — which of loading / empty / error / success / disabled / permission / offline apply.

**Key screens** (onboarding, paywall, checkout, permission, first-run home) add:

6. **Success signal + guardrail** — the behaviour that proves it works, what must not get worse.
7. **Hypothesis** — "If <change>, <behaviour> improves because <reason>."

## Monetization rules

- Value before the ask: paywall or upgrade appears after the aha moment or when the user hits a premium need or a fair limit — not on first open, not blocking the core task.
- Paywall shows benefits, free limits, price, period, trial terms, a visible close and Restore purchases. No fake timers or hidden prices.
- Ads at natural breaks; rewarded ads are opt-in; never interrupt the core action. Slot sizes (native full 360 × 800, inline native fixed height pinned to the bottom): `file-standards.md` §4.5.
- Hybrid: the free path stays useful; don't degrade it to force an upgrade.
- Credits/coins: the cost shows on the CTA only on the last screen before spending (`Generate Now | 40`). Earlier or disabled CTAs show no cost: put this in the button's Disabled variant, not per screen.
- Packs: honest comparisons only. No "Save %" when the unit price is the same. Translate the amount into what it buys (`≈ 60 videos`) and give every pack a visible selection control (radio), not only a tinted card.

## Layout rules learned on real flows

- Bottom action row pinned to the bottom margin (360 × 800: y 712, 36 from the bottom). The main image or player is centred in the height left between the top bar and that row. When other blocks share the space (toast, share row), centre the group.
- An empty input state teaches before it asks: put photo tips with good/bad examples in the free space, not a second hint inside the upload slot.
- Options that are shapes (aspect ratio, layout) show a tiny proportional icon next to the label.

## Before handoff — 4 questions

Answer in the report, one line each: **Why build it? Why this way? How do we know it worked? What could it harm?**

Record important decisions (problem, options, choice, reason, metric) in the brief's *Decisions made* table — not every screen.
