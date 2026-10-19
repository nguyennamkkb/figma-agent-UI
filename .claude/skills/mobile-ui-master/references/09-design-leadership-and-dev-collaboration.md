# Design Leadership and Developer Collaboration

## Purpose

Use this reference to explain design decisions, involve engineering at the right time, produce implementable handoff, and review UI by product outcome rather than aesthetic preference.

## Decision narrative

Defend the solution, not personal taste.

Use:

```text
Problem and evidence
-> user + business goal
-> options and trade-offs
-> recommended solution
-> success measure
-> remaining risk
```

Avoid statements such as “it looks more modern” unless the claimed change is tied to hierarchy, task success, brand intent, platform fit, or a measurable outcome.

## Non-negotiable rules

### MUST

- Explain design decisions through problem, evidence, outcome, and trade-off.
- Involve engineering early when architecture, performance, persistence, permission, API, offline behavior, or complex animation may constrain the solution.
- Handoff intent, states, behavior, constraints, and acceptance criteria — not only screenshots.
- Separate `MUST`, `SHOULD`, `MAY`, platform-specific, and deferrable requirements when prioritization matters.
- Validate high-risk technical concepts with a prototype/scoped experiment when appropriate.
- Review flow/state before visual polish.
- Make critique specific, observable, and connected to user/product impact.
- Document reusable decisions and repeated failures so the team can improve the system.

### MUST NOT

- Reject/approve UI based primarily on taste.
- Bring engineering in only after a high-risk interaction has been fully polished.
- Leave developers to infer loading, error, enabled, dismissal, navigation, or responsive behavior.
- Treat pixel parity as more important than native platform behavior.
- Turn critique into personal judgment.
- Create screen-local fixes for repeated design-system problems without investigating the root cause.

## Engineering involvement trigger

Bring engineering into the design loop early when any of these are material:

```text
architecture
performance
large data sets
persistence/offline
permissions/system APIs
network-dependent states
custom rendering/canvas
complex gesture ownership
complex animation lifecycle
media/camera
platform-specific limitations
accessibility implementation risk
```

The purpose is not to reduce ambition automatically; it is to understand feasibility and trade-offs while the design is still flexible.

## Handoff contract

A developer should be able to answer without guessing:

- what the screen is for;
- what happens on every important action;
- when controls are enabled/disabled;
- loading/submitting behavior;
- error and retry behavior;
- empty state behavior;
- navigation/back/dismiss rules;
- content min/max/wrapping constraints;
- scroll and persistent-region behavior;
- component/token mapping;
- accessibility semantics;
- animation lifecycle;
- platform-specific differences;
- adaptive layout behavior;
- acceptance criteria.

## Review order

Always review in this order:

1. User flow and state logic.
2. Accessibility and platform behavior.
3. Information hierarchy, content, and CTA.
4. Layout, components, tokens, and responsive behavior.
5. Motion, visual polish, and edge cases.

Do not spend a critique session debating shadows while a recovery state is missing.

## Feedback format

Use:

```text
Observation -> Impact -> Principle/evidence -> Proposed fix
```

Example shape:

```text
[HIGH] The destructive action uses the same emphasis as the primary save action.
Impact: increases accidental activation risk and weakens task hierarchy.
Evidence/principle: primary/secondary action hierarchy and error prevention.
Fix: demote destructive action and add confirmation only if the action is difficult to recover.
```

## Decision log

For non-trivial decisions, record:

```text
Decision:
Context/problem:
Options considered:
Chosen option:
Why:
Trade-offs:
Owner:
Revisit condition:
Affected components/patterns:
```

This prevents future teams from repeating the same debate without context.

## Design critique behavior

Good critique asks:

- What problem is this solving?
- Which requirement is locked?
- What evidence or principle supports the hierarchy?
- What alternative was considered?
- What breaks at long copy / large text / small screen / failure state?
- Is this a screen-level exception or a system-level need?
- What would engineering have to guess?

Avoid prescribing pixels before understanding the underlying problem.

## Mentorship principles

- Explain reasoning, not only the final answer.
- Ask designers to articulate problem, hypothesis, alternatives, and evidence before pixel critique.
- Use critique to improve the system, not to rank people.
- Give ownership with clear boundaries and review at meaningful decision points.
- Capture repeated patterns and mistakes as team knowledge.

## Anti-patterns

- “make it cleaner/more premium” with no outcome definition;
- design handoff as screenshots only;
- requirements hidden inside chat messages and not reflected in acceptance criteria;
- late discovery that a custom interaction conflicts with architecture/platform limits;
- designers and developers maintaining separate component names/states;
- review comments focused on spacing while use-case logic remains unresolved;
- technical constraints used as automatic reasons to reject exploration without testing alternatives.

## Validation checklist

- [ ] Recommendation is framed around problem/outcome, not taste.
- [ ] Important alternatives/trade-offs are explicit.
- [ ] Engineering is involved early where risk warrants it.
- [ ] Handoff covers states, behavior, constraints, and accessibility.
- [ ] Review follows flow -> accessibility/platform -> hierarchy -> system/layout -> polish.
- [ ] Feedback is observable and actionable.
- [ ] Systemic problems are escalated to the design system instead of repeatedly patched.
- [ ] Important decisions can be revisited through a decision log.

## Expected agent output

When collaboration/review is relevant, return:

```text
Problem/evidence:
User/business goal:
Options considered:
Recommendation:
Trade-offs:
Engineering risks/questions:
MUST / SHOULD / MAY / DEFER:
Acceptance criteria:
Review findings by severity:
Decision-log entry if needed:
```

## Related references

- `01-mobile-ux-principles.md` for UX reasoning.
- `06-scalable-design-system.md` for component/system ownership.
- `08-product-metrics-and-validation.md` for success measurement.
- `11-deliverable-and-review-protocol.md` for handoff/review artifact format.
