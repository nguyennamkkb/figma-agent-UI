# Creative Direction Protocol
> Load this file ONLY when: the user explicitly asks this skill for divergent design directions, or `mode=review` target `highfi` with a written divergence reason. Closed in all other rows (§11). (In the `ios-*` spec chain, direction work happens in `ios-design-direction`.)
> Key sections: invariants vs variables; divergence/convergence; direction card.

## Contents
- Purpose + Core model — when divergence starts
- Creative boundary (Invariants / Variables) — what can move
- Non-negotiable rules (MUST / MUST NOT) — hard fences
- Creative thesis + Divergence protocol + Direction card — producing directions
- Personality levers + Stress-test + Convergence — choosing the winner
- Originality, Reference-as-critic, Anti-patterns, Rationale, Validation, Output — finishing

## Purpose

Use this reference after the use-case invariants and initial perceptual hypothesis are understood.

Its job is not to select a fashionable UI pattern. Its job is to force the agent to produce **meaningfully different ways for the user to perceive and move through the same product truth**, then converge without weakening the use case.

Creativity should begin at attention, mental model, composition, relationship, and interaction — not at card styling.

## Core model

```text
Product truth
-> First Glance hypothesis
-> Scan/attention hypothesis
-> divergent mental models
-> composition hypotheses
-> stress-test
-> converge
-> references critique
-> refine
```

## Creative boundary

### Invariants — locked

Do not alter unless the user explicitly requests a product change:

- user goal and outcome;
- required information;
- required actions;
- business/validation rules;
- state transitions and recovery requirements;
- critical platform/system constraints;
- accessibility obligations;
- source-backed content/data meaning.

### Design variables — flexible

May be explored aggressively:

- what wins first glance;
- scan sequence and attention rhythm;
- information grouping;
- object-centric vs task-centric mental model;
- composition and spatial relationship;
- content density;
- progressive vs simultaneous presentation;
- CTA timing and placement when product logic allows;
- interaction model and direct manipulation;
- imagery/illustration role;
- surface/depth language;
- typography character;
- semantic accent strategy;
- contextual education;
- motion and micro-interactions;
- phone/tablet composition.

## Non-negotiable rules

### MUST

- Begin from a perceptual hypothesis, not a component catalog.
- Create directions that differ in attention path or mental model, not merely appearance.
- Explain each direction through user/product reasoning.
- Preserve all locked invariants.
- Stress-test long copy, compact width, missing imagery, states, accessibility, and engineering complexity.
- Converge to one coherent thesis rather than mixing unrelated ideas.
- Challenge familiar solutions when they are chosen only from habit.

### MUST NOT

- Invent product behavior to justify a concept.
- Call palette/radius/illustration swaps separate directions when attention and structure are identical.
- Start by choosing `card`, `grid`, `hero`, `sheet`, or other components and then force content into them.
- Use a named scan/layout pattern as an automatic recipe.
- Hide required information to make the first viewport cleaner.
- Depend on obscure gestures, unreadable typography, or excessive motion for originality.
- Make every region expressive; one strong idea requires quiet supporting UI.

## Creative thesis

Write a concise thesis after the first attention hypothesis:

```text
The user should first perceive [focal meaning/object/state],
then discover [supporting sequence],
so they can [decision/action] with [desired mental/emotional quality].

Express this through:
- [composition behavior]
- [interaction/hierarchy behavior]
- [visual rhythm/personality behavior]
```

Avoid empty labels such as `modern`, `premium`, or `beautiful` unless they are translated into observable choices.

## Divergence protocol

Generate at least three candidates when the task has meaningful design freedom.

Each candidate should differ in at least two of:

- First Glance anchor;
- scan trace;
- mental model;
- information hierarchy;
- content topology;
- density;
- CTA timing/placement;
- progressive disclosure;
- interaction model;
- role of imagery/context;
- large-screen adaptation.

Useful axes for brainstorming — not mandatory archetypes:

```text
object-centric <-> task-centric
inspection <-> direct manipulation
immersive <-> dense/scannable
progressive <-> simultaneous
context-first <-> action-first
single focal object <-> comparison
quiet <-> expressive
```

The agent may invent better axes for the actual use case.

## Direction card

For each candidate, summarize:

```text
Direction name:
First Glance:
Scan trace:
Mental model:
Distinctive composition idea:
Primary interaction:
Why it fits the use case:
Main trade-off:
Failure risk:
```

Direction names should describe the design idea, not just a style adjective.

## Visual personality levers

After structural divergence, tune personality intentionally:

```text
Density       sparse <-> dense
Geometry      soft <-> precise
Contrast      quiet <-> dramatic
Typography    neutral <-> expressive
Imagery       functional <-> immersive
Whitespace    compact <-> spacious
Layering      flat <-> dimensional
Motion        restrained <-> expressive
```

These levers refine a direction; they do not create the direction by themselves.

## Stress-test each direction

Ask:

- Does the correct thing win the first glance?
- Is the next discovery sequence understandable without explanation?
- Is required information available before the decision that depends on it?
- Is any business rule hidden by visual simplification?
- Does the concept still work if hero imagery is delayed or unavailable?
- Does it survive 30–50% longer copy?
- Does it work at compact width and large text?
- Are loading/empty/error states still coherent?
- Does a high-salience element deserve its attention weight?
- Does elegance depend on a custom gesture?
- Is the concept reusable or a one-off exception?
- Is engineering complexity proportional to user value?
- Does tablet/landscape preserve the thesis without merely stretching it?

Reject directions that collapse under these checks.

## Convergence framework

Do not select by taste alone. Compare:

| Criterion | Weight |
|---|---:|
| Use-case fidelity | 25% |
| Perceptual clarity / attention fit | 25% |
| Task clarity | 15% |
| Accessibility and resilience | 10% |
| Platform fit | 10% |
| Distinctiveness | 10% |
| System scalability | 5% |

A direction with use-case fidelity below `4/5` cannot win.

A direction whose First Glance/scan hierarchy contradicts the task cannot win even if visually distinctive.

Treat scoring as a comparison aid, not fake mathematical precision.

## One memorable idea

Prefer one strong idea per important screen, such as:

- the object itself becoming the navigation/decision anchor;
- a comparison that dominates the viewport because comparison is the task;
- control appearing at the exact object it changes;
- a progressive reveal matching the user's decision sequence;
- a spatial layout mirroring the real-world mental model;
- an expressive preview that immediately communicates outcome;
- a data visualization tied directly to a decision;
- a tactile manipulation that makes state change self-explanatory.

The memorable idea must emerge from the use case and attention model, not from decoration for its own sake.

## Originality without novelty debt

Prefer originality from:

- attention architecture;
- hierarchy;
- relationship between content and controls;
- spatial composition;
- interaction feedback;
- direct manipulation;
- context-aware component composition;
- purposeful brand expression;
- adaptive use of larger screens.

Avoid originality that depends on:

- hidden navigation;
- obscure gestures;
- unreadable typography;
- excessive animation;
- unusual control semantics with no learnability benefit;
- component proliferation;
- decorative complexity disconnected from task value.

## Reference-as-critic rule

Once a viable direction exists, challenge it using the relevant references.

Do not ask:

```text
What layout does the guideline tell me to use?
```

Ask:

```text
What weakness does this guideline reveal in my proposed design?
What must be corrected without destroying the perceptual thesis?
```

Exceptions: explicit product rules, safety/accessibility requirements, and mandatory native behavior remain constraints throughout generation.

## Anti-patterns

- three directions with the same scan trace and different colors;
- giant gradient hero because the screen feels empty;
- default `header -> hero -> cards -> CTA` composition with no reasoning;
- glass/blur/material applied to every container;
- card soup as a substitute for grouping logic;
- chips/pills for every choice;
- decorative charts with no decision or insight;
- reference-image mimicry that copies surfaces but not attention logic;
- mixing visual fragments from multiple directions with no coherent thesis;
- rejecting an unconventional but clear idea simply because it is not in a known pattern catalog.

## Rationale format

Explain the final choice concisely:

```text
Product truth
-> perceptual hypothesis
-> composition decision
-> user effect
-> trade-off
-> critic findings/refinement
```

## Validation checklist

- [ ] Locked product constraints are explicit.
- [ ] First Glance is explicit.
- [ ] Scan trace is explicit.
- [ ] Directions differ in mental model/attention, not only styling.
- [ ] All directions preserve required actions/information/states.
- [ ] Structural creativity happened before component styling.
- [ ] Stress tests cover compact width, long copy, accessibility, missing imagery, and failure states.
- [ ] Selected direction passes use-case fidelity `>= 4/5`.
- [ ] Attention hierarchy matches task importance.
- [ ] One memorable idea dominates rather than many effects.
- [ ] References refined the idea rather than replacing reasoning.
- [ ] Trade-offs are explicit.

## Expected agent output

When creative exploration is requested, return a concise summary:

```text
Locked invariants:
First Glance hypothesis:
Scan hypothesis:

Direction A:
- First Glance:
- Scan trace:
- Mental model:
- Core idea:
- Trade-off:

Direction B: ...
Direction C: ...

Selected direction:
Why it wins:
Critic-driven refinements:
Memorable idea:
Remaining risk:
```

Do not expose private chain-of-thought. Provide conclusions and concise design rationale.

## Related references

- `00-perceptual-reasoning.md` for First Glance and attention architecture.
- `01-mobile-ux-principles.md` for product/task integrity.
- `02-mobile-screen-architecture.md` for robust composition realization.
- `04-mobile-accessibility-review.md` for accessibility critique.
- `05-mobile-first-platform-guidelines.md` for native behavior critique.
- `06-scalable-design-system.md` for systemization after the direction is chosen.
