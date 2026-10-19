# Deliverable and Review Protocol

## Purpose

Use this reference to turn design reasoning into an artifact that can be reviewed and implemented without guessing. It defines the expected screen specification, review gates, finding severity, and engineering-readiness contract.

## Non-negotiable rules

### MUST

- Deliver intent, state, behavior, constraints, and acceptance criteria — not screenshots alone.
- Separate source-backed requirements from assumptions.
- Cover loading, empty, error, disabled, processing, and success when relevant.
- Define scroll/persistent/keyboard/adaptive behavior where it affects implementation.
- Include accessibility semantics and content resilience.
- Map shared components/tokens/patterns when a design system exists.
- Review use-case fidelity and perceptual fidelity before visual polish.
- Use severity based on task impact, not reviewer preference.

### MUST NOT

- Leave engineering to infer what happens on tap, dismissal, failure, or repeated submission.
- Specify only one ideal content state.
- Mix unresolved product assumptions into implementation requirements without labeling them.
- Report taste-based review comments as blockers.
- Approve polished screens that fail the documented use case or accessibility-critical path.

## Screen specification

Use this structure when a full screen spec is requested:

```text
SCREEN: <name>

Purpose:
Source/use-case references:
Entry conditions:
Exit/success condition:
Required actions:
Secondary actions:
Unknown/assumed decisions:

Perceptual intent:
- First Glance:
- immediate understanding:
- scan trace:
- focal / supporting / peripheral:
- CTA attention timing:

Information hierarchy:
1.
2.
3.

Regions:
- Navigation:
- Main content:
- Persistent controls:
- Overlay/sheet/dialog:

Layout rules:
- horizontal gutter:
- vertical rhythm:
- fixed / fit / fill behavior:
- scroll ownership:
- safe-area behavior:
- keyboard behavior:
- compact behavior:
- tablet/large-width behavior:

Components:
- name / semantic purpose / variant / state / token mapping

Interactions:
- trigger -> feedback -> state transition -> result -> recovery

States:
- loading:
- content:
- empty:
- error:
- disabled:
- processing:
- success:

Accessibility:
- labels/semantics:
- focus order:
- Dynamic Type/font scale:
- touch target:
- non-color cues:
- reduced motion:

Motion:
- transition / role / token / interruption / reduced-motion behavior

Analytics / validation:
- hypothesis if relevant:
- primary event/metric:
- guardrail:

Acceptance criteria:
- MUST ...
- SHOULD ...
```

Do not populate irrelevant fields with invented behavior; mark `N/A` or `UNKNOWN` where appropriate.

## Perceptual review gate

Before geometry/pixel review:

- Intended First Glance is explicit.
- The highest-salience element deserves that attention weight.
- Scan order matches information/decision dependency.
- Supporting content helps interpretation without competing.
- Peripheral content remains discoverable without stealing attention.
- CTA becomes unmistakable at the correct decision moment.
- Hierarchy survives grayscale, missing imagery, longer copy, and relevant state changes.
- The composition was not chosen only because it matches a familiar screen category or named scan pattern.

A critical perceptual mismatch blocks visual sign-off even if the screen is polished.

## Flow review gate

Before pixel review:

- Every screen has a purpose.
- Every task screen has one primary action, or a clear read-only purpose.
- Entry and success/exit paths are explicit.
- Back/cancel/undo behavior is explicit where needed.
- Required information exists before the action that depends on it.
- Loading, empty, error, and recovery are covered.
- Permission/system interruptions are covered when applicable.
- Destructive/high-consequence actions have prevention or recovery.
- No creative decision silently changes a locked requirement.

Any failed critical item blocks visual sign-off.

## Geometry review gate

- No arbitrary absolute coordinates for standard flow layout.
- Scroll regions and persistent controls do not overlap.
- Safe areas and keyboard are accounted for.
- Text wrapping does not destroy hierarchy.
- Components define fixed/fit/fill or equivalent sizing behavior.
- Compact and larger widths have intentional rules.
- Long localization and large text have a viable reflow path.

## Visual review gate

- There is one focal point where the task requires one.
- Primary CTA is visually dominant.
- Secondary surfaces do not all compete for attention.
- Accent color is scarce and semantic.
- Typography establishes hierarchy without relying only on size.
- Repetition supports rhythm rather than card soup.
- The screen remains coherent with imagery missing or delayed.
- The visual concept has a product reason, not only a style label.

## Accessibility review gate

- Interactive targets are large enough and separated.
- Icon-only controls have accessible names.
- Focus order matches reading/action order.
- Meaning is not conveyed by color alone.
- Text scaling does not hide actions or cause overlap.
- Important contrast holds across states/themes.
- Critical custom gestures have a non-gesture alternative.
- Reduced-motion behavior exists where relevant.

## Design-system review gate

- Existing semantic components were evaluated before creating new ones.
- New variants/components have a documented semantic reason.
- Raw values do not bypass tokens without justification.
- States and content constraints match the component contract.
- Platform-native overrides are not blocked by a false pixel-parity requirement.
- Screen-local exceptions are identified so they do not silently become duplicate components.

## Engineering readiness gate

Engineering should not have to guess:

- what happens on tap;
- when CTA is enabled;
- duplicate-submit prevention;
- loading behavior;
- error text/retry placement/behavior;
- empty state behavior;
- content limits/wrapping;
- sheet/dialog dismissal rules;
- pagination and end/empty behavior where relevant;
- selected/pressed/focus states;
- scroll/persistent region ownership;
- keyboard behavior;
- adaptive behavior;
- animation lifecycle;
- accessibility semantics;
- platform-specific differences.

If engineering must guess a product-significant behavior, the design is not implementation-ready.

## Review severity

Use:

- `BLOCKER` — breaks the use case, business rule, accessibility-critical path, or implementation feasibility.
- `HIGH` — significantly harms task success, recovery, native behavior, or critical hierarchy.
- `MEDIUM` — responsiveness, consistency, maintainability, resilience, or system-quality issue.
- `LOW` — polish issue with limited task impact.

## Finding format

```text
[SEVERITY] Observation
Impact:
Evidence/principle:
Fix:
```

Prefer the smallest fix that solves the underlying issue. If the same issue appears repeatedly, consider a system-level correction.

## Use-case + perceptual fidelity gate

Before final approval answer `PASS` or `FAIL`:

1. Can the user complete the documented goal?
2. Is every required decision input present before the action?
3. Are business rules represented correctly?
4. Did any creative decision invent/remove product behavior?
5. Does the correct element/state win First Glance?
6. Does the scan sequence match decision dependency?
7. Does the primary action become unmistakable at the right moment?
8. Are critical states/recovery paths covered and are their attention shifts coherent?
9. Is navigation/back behavior predictable?
10. Does the design survive long text, missing imagery, keyboard, safe area, and small screens?
11. Is accessibility-critical completion preserved?
12. Can engineering implement the behavior without guessing key decisions?

Any critical `FAIL` blocks sign-off.

## Anti-patterns

- screenshot-only handoff;
- redlines/numbers with no behavior/state explanation;
- happy-path-only prototypes;
- review comments such as “make it cleaner” without observable impact;
- `BLOCKER` used for visual preference;
- assumptions written as requirements;
- component names that do not match the design system/implementation vocabulary;
- final approval without compact/large-text/error-state review.

## Validation checklist

- [ ] Screen spec includes purpose, hierarchy, regions, states, behavior, and acceptance criteria.
- [ ] Assumptions are labeled.
- [ ] Flow gate passes before visual gate.
- [ ] Geometry, accessibility, and design-system gates are reviewed.
- [ ] Engineering-readiness questions can be answered.
- [ ] Findings use impact-based severity.
- [ ] Use-case + perceptual fidelity gate passes.
- [ ] Remaining risks and unknowns are explicit.

## Expected agent output

For a full implementation-ready deliverable, return:

```text
Use Case Lock:
Perceptual intent (First Glance + Scan Trace):
Selected creative thesis:
Screen specification(s):
State matrix:
Component/token mapping:
Platform/adaptive rules:
Accessibility rules:
Motion rules if relevant:
Analytics/validation if relevant:
Acceptance criteria:
Assumptions/unknowns:
Review findings:
Use-case + perceptual fidelity gate:
Remaining risks:
```

When the user asks for only one artifact — e.g. Figma brief, critique, component contract, prompt — output only that artifact while still applying the relevant gates internally.

## Related references

- `00-perceptual-reasoning.md` for First Glance and scan/attention gates.
- `01-mobile-ux-principles.md` for flow/task gates.
- `02-mobile-screen-architecture.md` for geometry/adaptive specification.
- `04-mobile-accessibility-review.md` for accessibility severity.
- `06-scalable-design-system.md` for component readiness.
- `09-design-leadership-and-dev-collaboration.md` for review communication.
