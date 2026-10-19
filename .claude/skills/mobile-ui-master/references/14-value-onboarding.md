# Value Onboarding — Narrative, Personalization, and Permission Priming
> Load this file ONLY when: `mode=ui` target `onboarding` (§11 ui-onboarding row).
> Do NOT load when: splash/showcase/standard screens, or `mode=review` concept/lowfi/prototype (review reads the onboarding `SCR` / `WF-SCR` files instead).
> Key sections: one-outcome-per-moment; narrative vs demo vs seeded content; permission priming order.
> In the `ios-*` spec chain the whole 7–13 screen flow (sequence, personalization map, paywall, compliance) is designed by the `ios-onboarding` skill; this file supplies the craft for its narrative, quiz, demo and seeded-state screens. The "≤ 3 narrative pages" rule below limits value-narrative pages inside that longer flow — it is not a cap on the flow.

## Purpose

Use this reference when designing onboarding that must **earn continuation** rather than describe the product. Value onboarding proves one outcome per moment — through narrative, interactive demonstration, or seeded content — before asking the user for anything (answers, configuration, or system permissions). A user who reaches the end of onboarding without experiencing value has seen marketing, not onboarding.

This reference covers the onboarding tier between launch and first real use: welcome, value-narrative paging, personalization quiz, permission priming, and the first seeded/empty state. Splash behavior itself is out of scope here.

## When to use

- Designing a welcome + value-narrative sequence for a first-time user.
- Deciding whether a question belongs in a personalization quiz or must be deferred as post-value configuration.
- Specifying an interactive demo that replaces a static feature preview.
- Writing permission-priming copy tied to a concrete user action.
- Designing the first content state (seeded sample vs. true empty) as a continuation of onboarding.
- Reviewing an onboarding flow for ask-before-value inversions.

## When NOT to use

- Designing the splash/launch screen itself (brand mark, loading, routing) — that is a system screen, not a persuasion surface.
- Designing paywall, login, or account-creation logic — value onboarding may precede them, but it does not specify them.
- Designing returning-user re-engagement (tips, changelogs, feature announcements) — those assume value already experienced.
- Auditing motion curves, tokens, or platform behaviour in isolation — cite the motion/platform references instead.

## Non-negotiable rules

### MUST

- Prove value before asking: no quiz question, configuration choice, or permission request may precede the first experienced value moment unless the value itself requires it.
- Limit value-narrative paging to at most 3 pages; each page carries exactly one value plus its proof (claim + evidence on the same page, never a claim page followed by a proof page).
- Keep the welcome page to a single viewport with no scrolling; narrative pages after welcome MAY scroll vertically when the proof needs it.
- Replace static feature previews with an interactive demo wherever the value can be touched, tried, or manipulated; a demo the user operates beats a screenshot the user views.
- Classify every requested input as either `personalization-quiz` or `admin-config` (see decision framework); never mix the two on one screen.
- Make every quiz step brief, explain why it is asked, offer Skip, show progress, and pay off downstream (the answer visibly shapes what follows — e.g. a mood pick that seeds the first draft).
- Default-first every `admin-config` item (reminder times, theme, units, notification preferences): ship a sensible default, defer the control until after first value.
- Prime permissions at the moment of use, with the concrete benefit stated at the point of request; never bundle permission asks upfront during onboarding.
- Treat the first content state as onboarding's final page: a seeded sample that demonstrates value, or an empty state with one next action — never a blank list.

### MUST NOT

- Present onboarding as a static deck of promotional cards (feature tour, "3 things our app does") with no proof, interaction, or payoff.
- Block Finish behind forced validation (required quiz answers, mandatory toggles, compulsory permission grants) — completion must never be held hostage by inputs that serve the product more than the user.
- Ask configuration questions before demonstrating value (theme pickers, reminder-time pickers, notification opt-ins on page one).
- Request two or more system permissions in one onboarding moment; each permission needs its own at-use context.
- Let narrative paging exceed 3 pages to accommodate more marketing claims — cut claims instead.

### SHOULD

- Put the strongest proof first: the page-1 value should be the one the user can feel in the demo, not the one marketing prefers.
- Keep quiz payoff visible within the same session (seeded content, adapted demo, reordered first screen) so the user connects answering with benefit.
- Write priming copy as benefit + scope ("to show runs near you, only while you use the map"), not as system instruction.
- End onboarding on an action, not a confirmation: the last element hands the user something to do with demonstrated value.

## Decision framework — quiz vs. config

Classify each requested input before placing it:

```text
Does the answer visibly change what the user experiences next?
├─ yes -> personalization-quiz candidate
│         (requires: brief + why-explained + Skip + progress + downstream payoff)
└─ no
   ↓
Is it a preference, schedule, appearance, or channel choice?
├─ yes -> admin-config: defaults-first, deferred until after first value
└─ no -> remove: it is neither personalization nor configuration
```

Quiz contract (all five required):

```text
Brief:          answerable in one tap / one short input
Why-explained:  one line stating what changes because of the answer
Skip:           always available, never punished
Progress:       position shown (step x of N, N = the real number of remaining steps)
Payoff:         the answer observably shapes the demo, seed, or first screen
```

Worked example: a mood pick ("What do you want tonight?") that seeds the first draft list. The answer is brief, the prompt line explains the draft will be built from it, Skip yields a generic-but-real draft, progress is shown, and the seeded screen reflects the pick. A reminder-time picker fails this test: it changes nothing the user experiences next, so it is `admin-config` — default it, defer it.

## Narrative structure

```text
Welcome (no-scroll, 1 viewport)
  identity + single entry action + Skip
        ↓
Value page 1..3 (max 3, vertical scroll allowed per page)
  one value + its proof per page (demo fragment, sample, or evidence)
        ↓
Personalization quiz (only quiz-classified inputs, all five contract items)
        ↓
Interactive demo (operable, not viewable) reusing quiz payoff where present
        ↓
Seeded first state (sample content demonstrating value, or empty + one action)
```

Permission priming never appears as a stage in this sequence. It attaches to the at-use action that needs it, wherever that action first occurs — inside the demo, at the seeded state, or later in normal use.

## Spec mapping (`ios-*` spec)

- **Onboarding `SCR` › Functional blocks:** quiz-classified inputs are declared as the personalization block — each row carries `Required?` (always `no` + Skip rule), `default` (the Skip-time fallback), `payoff` (the downstream element the answer shapes), and `skip` (Skip behaviour + recovery). `admin-config` items are NOT rows here; they are recorded as deferred with their defaults and reappear on their post-value screens.
- **Onboarding `SCR` › Functional blocks (order of value):** the value proof on each narrative page is a block whose description names naming the user value it evidences (e.g. the demo control that proves page 2's claim, with the value cited, never a styling reason).
- **`FR` acceptance criteria:** the no-scroll Given/When/Then sample applies to the **narrative tier only** — the welcome page asserts single-viewport/no-scroll; narrative pages assert one-value-plus-proof per page and cap at 3. Quiz Skip behaviour and at-use permission timing each get their own criterion.
- **`WF-SCR` › Layout regions + States:** the primary region carries the per-page proof; the page's one value is stated in the region's role; `S-empty` specifies the seeded first state and its next action.

## Anti-patterns

Reject or challenge:

- deck-of-cards promotion: N static cards describing features with illustrations and Next buttons, no proof or interaction on any page;
- forced validation blocking Finish: required answers, mandatory toggles, or compulsory grants before the user may complete onboarding;
- config-before-value: reminder times, theme, units, or notification choices requested before any value is experienced;
- bundled upfront permission asks: two or more system permissions requested during onboarding without at-use context;
- claim-then-proof split: a page stating a benefit whose evidence lives on a later page (or nowhere);
- quiz without payoff: answers collected, acknowledged with a generic "Thanks!", and never visibly used;
- static preview parading as demo: screenshots or auto-playing loops where an operable demo was possible;
- blank first list: onboarding ends on an empty content screen with no sample and no next action.

## Validation checklist

Before approving value onboarding, verify:

- [ ] **[REQUIRED]** `value-proof-present` — every narrative page pairs its one value claim with proof on the same page; no claim-only page exists.
- [ ] **[REQUIRED]** `personalization-block-complete` — every quiz block in the onboarding `SCR` carries Required?/default/payoff/skip; every `admin-config` item is deferred with a recorded default and appears on no onboarding screen.
- [ ] **[REQUIRED]** `narrative-noscroll-gwt` — an `FR` acceptance criterion carries a no-scroll Given/When/Then for the welcome page (single viewport); narrative pages are capped at 3 with one value + proof each.
- [ ] The welcome page fits one viewport without scrolling.
- [ ] At most 3 narrative pages exist; each holds exactly one value + proof.
- [ ] The demo is operable by the user, not a static preview or loop.
- [ ] Every permission request is tied to its at-use action with benefit stated; none are bundled upfront.
- [ ] Skipping every skippable step still lands the user on a seeded, valuable first state.
- [ ] Finish is reachable without answering, configuring, or granting anything.

## Expected agent output

When this reference is relevant, the agent should be able to produce at least:

```text
Narrative pages (≤3, one value + proof each):
Quiz-classified vs. admin-config inputs:
Quiz contract per question (brief / why / Skip / progress / payoff):
Demo interaction (what the user operates):
At-use permission points (action + benefit copy):
Seeded first state (sample or empty + next action):
SCR blocks / FR acceptance / WF-SCR mapping:
Unknown product decisions:
```

## Related references

- `00-perceptual-reasoning.md` (§Step 1–§Step 3) for the First Glance and attention reasoning each narrative page needs before composition.
- `01-mobile-ux-principles.md` (§Non-negotiable rules) for task clarity, primary-action hierarchy, and state coverage applied to quiz and demo screens.
- `02-mobile-screen-architecture.md` (§Scroll ownership) for single scroll-owner discipline on narrative pages and the welcome no-scroll viewport.
- `07-mobile-motion-microinteractions.md` (§Motion roles) for giving page transitions and demo feedback a state-explaining role only.
- `12-creative-information-composition.md` (§1–§2) for the per-page value contract and attention budget behind one-value-plus-proof.

## Sources

- [NN/G — Onboarding tutorials vs. contextual guidance](https://www.nngroup.com/articles/mobile-onboarding/)
- [Apple Human Interface Guidelines — Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
