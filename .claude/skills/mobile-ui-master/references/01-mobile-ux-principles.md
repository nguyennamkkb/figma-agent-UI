# Mobile UX Principles

## Purpose

Use this reference to protect task clarity and product intent. It is primarily a **critique lens** for a proposed design, not a generator of screen composition. A mobile screen is not a collection of decorative elements; it is a solution to one user goal in one concrete state.

## Core questions

Before designing a screen, resolve:

1. What is the user trying to accomplish here?
2. What is the single primary action?
3. What information must be understood before that action?
4. What happens immediately after the action?
5. What happens when data is loading, empty, invalid, unavailable, or fails?

If these cannot be answered from the source material, mark the missing item as `UNKNOWN`; do not invent product behavior to make the UI feel complete.

## Non-negotiable rules

### MUST

- Identify one primary user goal for each task-oriented screen.
- Identify one visually dominant primary CTA when the screen requires an action.
- Present decision-critical information before the decision or CTA.
- Expose meaningful system status for processing, success, failure, and disabled conditions.
- Preserve user control through Back, Cancel, Undo, Retry, or confirmation when consequences justify it.
- Prefer recognition over recall: keep current context, selection, and relevant choices visible.
- Prevent avoidable errors before displaying error messages when possible.
- Keep interaction semantics consistent across equivalent patterns.

### MUST NOT

- Add actions, business rules, or outcomes not supported by the use case.
- Make secondary actions visually compete with the primary CTA.
- Use a modal, sheet, extra navigation level, or hidden gesture only to avoid resolving information hierarchy.
- Depend on a static mockup to imply behavior; important interactions require trigger, state, feedback, result, and recovery.
- Treat visual polish as compensation for unclear flow, unknown data, or missing states.

### SHOULD

- Remove content that does not help the current decision, action, orientation, or trust.
- Use language, icons, and interaction models that map to concepts users already understand.
- Keep destructive or high-consequence actions deliberate without adding unnecessary friction to routine actions.

## Decision framework

When deciding whether an element belongs on a screen, classify it:

```text
Does it help the user understand where they are?
├─ yes -> keep if needed for orientation
└─ no
   ↓
Does it provide information required for the primary decision/action?
├─ yes -> prioritize before CTA
└─ no
   ↓
Does it enable the primary task or a necessary recovery path?
├─ yes -> keep with appropriate hierarchy
└─ no
   ↓
Is it required by business/platform/accessibility constraints?
├─ yes -> keep, but minimize interruption
└─ no -> remove, defer, or progressively disclose
```

## Interaction contract

For every important action, define:

```text
Trigger:
Precondition:
Immediate feedback:
State transition:
Success result:
Failure result:
Recovery / back path:
```

If any field is unknown and changes product behavior, flag it rather than guessing.

## Hierarchy rules

- The primary CTA should be unmistakable by the time the user has enough information to act; it does not have to win the first glance when comprehension must come first.
- Required context precedes the CTA spatially or through a clear progressive sequence.
- Secondary actions can be visible but must use lower emphasis.
- Tertiary actions should usually live in contextual menus, detail regions, or later steps when they are not needed for the primary task.
- Do not create hierarchy only by increasing size; combine placement, spacing, contrast, type weight, and grouping.

## Applied heuristics

- **System status:** show processing, completion, failure, selection, and disabled states promptly.
- **Match with real-world expectations:** use understandable copy, symbols, and interaction models.
- **User control:** provide a safe exit or reversal where needed.
- **Consistency:** the same pattern should preserve meaning and behavior.
- **Error prevention:** disable impossible actions, validate at the right time, and confirm destructive actions when recovery is costly.
- **Recognition over recall:** expose relevant context and current state.
- **Intentional minimalism:** retain only what serves the current task or decision.

## Anti-patterns

Reject or challenge:

- multiple equally prominent CTAs;
- decorative hero content that pushes the actual task below the fold without product value;
- card containers around every section merely to make the UI feel designed;
- mandatory information hidden behind “More” just to simplify the first viewport;
- confirmation dialogs for harmless reversible actions;
- destructive actions styled like normal primary actions;
- generic empty states with no next step;
- loading indicators with no context when the user needs to know what is happening.

## Validation checklist

Before approving UX logic, verify:

- [ ] The user goal is explicit.
- [ ] The primary CTA or read-only purpose is explicit.
- [ ] Required information appears before the decision.
- [ ] Secondary actions do not compete visually.
- [ ] Loading, empty, error, success, and disabled behavior are accounted for when relevant.
- [ ] High-consequence actions have prevention or recovery.
- [ ] No product behavior was invented for visual convenience.
- [ ] The flow can be explained as states and transitions, not only screenshots.

## Expected agent output

When this reference is relevant, the agent should be able to produce at least:

```text
User goal:
Primary action:
Required information:
Secondary actions:
System states:
Recovery paths:
Unknown product decisions:
UX risks:
```

## Related references

- `02-mobile-screen-architecture.md` for screen structure and state composition.
- `04-mobile-accessibility-review.md` for accessibility gates.
- `00-perceptual-reasoning.md` for First Glance and scan/attention reasoning.
- `10-creative-direction-protocol.md` for creative exploration after product truth is locked.

## Sources

- [NN/G — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
