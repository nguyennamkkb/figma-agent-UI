# Perceptual Reasoning — First Glance, Scan Pattern, Attention Architecture

## Purpose

This is the bridge between **understanding the use case** and **drawing the interface**.

The agent must not jump from requirements to components, nor select a layout because a screen resembles a known category. Before composition, form a perceptual hypothesis about what the user should notice, understand, discover, and act on.

The goal is not to force a universal eye-tracking pattern. The goal is to make the agent actively reason about attention for this specific use case.

## Core philosophy

```text
Use Case defines WHAT must remain true.
Perceptual reasoning decides WHAT should be noticed and in what order.
Creative composition decides HOW that attention flow becomes a screen.
References and guidelines challenge the result; they do not design it automatically.
```

A technically correct hierarchy can still feel generic. A visually novel screen can still misdirect attention. Perceptual reasoning exists to prevent both failures.

## Non-negotiable rules

### MUST

- Form a **First Glance hypothesis** before selecting components or a screen template.
- Simulate the likely attention sequence before deciding final composition.
- Distinguish what should be **focal**, **supporting**, and **peripheral**.
- Connect every dominant visual decision to user intent, content meaning, or task progression.
- Generate multiple plausible attention/composition hypotheses when more than one interpretation is reasonable.
- Let the use case constrain truth, not prematurely dictate layout.
- Re-evaluate attention when content becomes long, empty, loading, erroneous, selected, or disabled.

### MUST NOT

- Choose a layout merely because the screen is called “detail”, “form”, “dashboard”, “onboarding”, or another familiar category.
- Use `F-pattern`, `Z-pattern`, center-out, bottom-up, card stack, hero-detail, or any named pattern as an automatic answer.
- Begin creativity at color, radius, shadow, card, or component styling level.
- Make the largest element the focal point without explaining why it deserves first attention.
- Assume the primary CTA must always win the first glance; sometimes the user must understand content or state before acting.
- Treat a reference image as a composition to copy unless its hierarchy is explicitly required.
- optimize for novelty if it makes the attention path less understandable.

## Step 1 — First Glance hypothesis

Imagine the user sees the screen for roughly the first moment, before consciously inspecting details.

Answer compactly:

```text
FIRST GLANCE
What should win attention first?
What should the user understand immediately?
What should they feel or infer about the state/task?
What must NOT win attention yet?
Why is this correct for the use case?
```

Examples of possible first-glance anchors:

- the object being edited;
- current status/result;
- a critical question;
- a comparison;
- a selected choice;
- a visual preview;
- an urgent warning;
- the primary action — when immediate action is genuinely the task.

These are examples, not a preferred list.

## Step 2 — Scan hypothesis

Then model what the user should discover next.

Do not describe every pixel. Describe **attention transitions**:

```text
SCAN TRACE
1. Focal anchor -> why attention starts here
2. Supporting evidence/context -> what becomes understandable next
3. Decision/control -> what can now be chosen or changed
4. Confirmation/action -> when the user is ready to proceed
5. Peripheral/optional content -> what may remain discoverable without competing
```

The order can be vertical, horizontal, radial, spatial, progressive, or interaction-driven. It can change between compact and large layouts.

## Step 3 — Attention architecture

Classify meaningful content into three levels:

### Focal

The element or relationship that should dominate the current moment.

### Supporting

Information or controls needed to interpret, compare, or act on the focal content.

### Peripheral

Useful but non-critical content that should remain accessible without stealing attention.

Then check:

```text
Does visual prominence match task importance?
Does reading/discovery order match decision dependency?
Does any decorative element interrupt the intended scan?
Does the CTA appear at the moment the user has enough information to act?
Does state feedback temporarily deserve to become focal?
```

## Step 4 — Interaction gravity

Attention is not only visual. Interactive elements attract intention because users expect them to do something.

For important controls, reason about:

- proximity to the object they affect;
- whether the control should appear before, during, or after a decision;
- whether persistent availability helps or distracts;
- whether direct manipulation is more natural than detached controls;
- whether selection feedback keeps attention anchored to the changed object;
- whether keyboard, gestures, sheets, or system UI will shift the attention path.

## Step 5 — Visual rhythm

Use rhythm to control scan speed.

Agent may manipulate:

- spacing density;
- scale contrast;
- repetition;
- alignment breaks;
- image-to-text ratio;
- typography contrast;
- grouping boundaries;
- whitespace pauses;
- progressive disclosure;
- motion during state change.

Do not maximize all contrast levers. Strong rhythm usually has a few deliberate accents and many quiet supporting relationships.

## Pattern vocabulary — diagnostic, never prescriptive

Named scan/layout patterns may be used to describe an already-reasoned solution, but never to select one automatically.

Possible vocabulary includes:

- linear/top-down;
- center-out;
- object-centric;
- comparison/side-to-side;
- bottom-up action path;
- progressive reveal;
- spatial/canvas-driven;
- F-like dense scanning;
- Z-like broad scanning.

The agent may invent another structure if it better matches the use case.

Bad reasoning:

```text
This is a detail screen -> use hero-detail.
```

Better reasoning:

```text
The user enters to judge one visual result before confirming.
The result must therefore win first glance.
Metadata only supports confidence, so it remains secondary.
The confirmation action appears after the comparison/inspection region.
This leads to an object-centric composition.
```

## Divergence before components

When the design space is not obvious, create at least three perceptual/composition hypotheses that differ in mental model, not surface style.

Examples of divergence dimensions:

```text
object-centric <-> task-centric
immersive <-> information-dense
single focal object <-> comparison
progressive <-> simultaneous
static inspection <-> direct manipulation
context-first <-> action-first
```

Do not name directions only by visual adjectives. Each direction must specify a different attention path.

## State-sensitive attention

The focal hierarchy may change by state.

Examples:

- `loading`: progress/status may temporarily become focal;
- `error`: recovery and cause may outrank normal content;
- `selected`: the changed selection and consequence may deserve emphasis;
- `success`: outcome confirmation may replace the previous action as focal;
- `permission denied`: explanation/recovery may dominate;
- `empty`: next safe action may become the key anchor.

Maintain continuity so the user understands what changed.

## Creative self-challenge

Before accepting a composition, ask:

- If all colors became grayscale, would the attention hierarchy still work?
- If cards lost their backgrounds, would grouping still make sense?
- If hero imagery disappeared, would the task still be understandable?
- If copy grew by 30–50%, would the scan order remain clear?
- If the screen were viewed for one second, would the right thing dominate?
- If the user scans only headings/controls, can they still infer the task?
- Is any high-salience element visually louder than its product importance?
- Did I choose this structure because of the use case, or because it is a familiar UI pattern?

## Relationship with other references

During **generation**, use this reference to reason freely within the locked use case.

After a direction exists, use the other references as critics:

```text
Perceptual hypothesis
-> creative composition
-> UX critique
-> architecture critique
-> platform critique
-> accessibility critique
-> design-system critique
-> motion/engineering critique
-> refine
```

Critical business, safety, accessibility, and platform constraints remain non-negotiable throughout; however, a pattern catalog or guideline should not generate the composition on the agent's behalf.

## Anti-patterns

- `requirements -> card/list/button` with no attention hypothesis;
- giant hero that wins attention only because it is large;
- visual hierarchy derived entirely from component defaults;
- every section equally boxed and equally emphasized;
- CTA made dominant before the user has information needed to decide;
- decorative illustration stealing the first glance from a critical state;
- reference screenshot copied before understanding why its eye path works;
- named scan pattern selected as a shortcut instead of reasoning;
- creative exploration reduced to palette/radius variants.

## Validation checklist

- [ ] First Glance hypothesis is explicit.
- [ ] Intended immediate understanding is explicit.
- [ ] Scan trace is explicit.
- [ ] Focal/supporting/peripheral hierarchy is intentional.
- [ ] CTA timing follows decision readiness, not a blanket rule.
- [ ] At least one alternative attention model was considered when ambiguity exists.
- [ ] Composition was reasoned before component styling.
- [ ] State changes preserve understandable attention continuity.
- [ ] Named patterns are descriptive rather than prescriptive.
- [ ] Other references were used to challenge/refine rather than blindly generate the layout.

## Expected agent output

For a full screen-design task, the perceptual reasoning can be summarized as:

```text
First Glance:
Immediate understanding:
Emotional/mental impression:
Scan trace:
Focal:
Supporting:
Peripheral:
Interaction gravity:
Alternative attention hypothesis considered:
Why the selected attention model fits the use case:
```

Keep this concise. Output the design rationale, not private step-by-step chain-of-thought.

## Related references

- `01-mobile-ux-principles.md` for product/task truth.
- `02-mobile-screen-architecture.md` for realizing the attention model as robust layout.
- `10-creative-direction-protocol.md` for divergence and convergence.
- `11-deliverable-and-review-protocol.md` for validation and handoff.
