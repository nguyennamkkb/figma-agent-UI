# Mobile Motion and Micro-interactions

## Purpose

Motion must explain interaction or state. Animation is justified only when it clarifies what happened, where content moved, system progress, selection/context change, or direct manipulation.

If the motion cannot answer a UX question, remove it.

## Motion roles

- **Feedback:** pressed state, haptic, validation, success, error, loading.
- **Continuity:** preserve spatial/contextual relationship during presentation or navigation.
- **Hierarchy:** guide attention to an important change.
- **Direct manipulation:** keep UI coupled to drag, swipe, reorder, scrub, zoom, or similar input.

## Non-negotiable rules

### MUST

- Give each meaningful animation a UX role.
- Keep direct interaction feedback fast and predictable.
- Use shared duration/easing/spring tokens instead of arbitrary values per screen.
- Define interruption/retargeting behavior for interactive or stateful animation.
- Provide reduced-motion behavior when motion carries meaningful visual movement.
- Keep gesture-driven animation synchronized with user input.
- Let completion/error feedback reflect the actual system state.

### MUST NOT

- Delay a completed action to finish an animation.
- Use animation to disguise slow network/system work.
- Require the user to watch an animation before continuing when no product rule requires it.
- Use excessive motion to make ordinary navigation feel “premium.”
- Create important meaning that disappears when motion is reduced.
- Assume every animation runs uninterrupted from start to finish.

## Motion decision framework

```text
Does motion explain state, continuity, progress, hierarchy, or direct manipulation?
├─ no -> remove it
└─ yes
   ↓
Can the same clarity be achieved more simply without motion?
├─ yes -> prefer simpler feedback unless motion adds meaningful continuity
└─ no
   ↓
Is the animation interruptible or affected by user/system state changes?
├─ yes -> define retarget/interruption behavior
└─ no
   ↓
Would reduced motion remove essential meaning?
├─ yes -> create a non-motion equivalent
└─ no -> proceed with a shared motion token
```

## State-transition matrix

Common transitions:

```text
default -> pressed -> loading -> success | error
collapsed <-> expanded
unselected <-> selected
presented <-> dismissed
idle <-> direct manipulation <-> settled
```

For each transition define:

```text
Trigger:
From state:
To state:
Motion role:
Visual property changing:
Duration/spring token:
Haptic/feedback if relevant:
Interruption behavior:
Reduced-motion behavior:
```

## Expressiveness hierarchy

Use the least expressive motion that communicates the task.

```text
Routine control feedback -> restrained
Common navigation/state   -> consistent system motion
Important state change    -> noticeable but concise
Hero/brand moment         -> expressive only when it does not delay the task
Direct manipulation       -> tightly coupled to input
```

A product should usually have one coherent motion language rather than unrelated effects per screen.

## Micro-interaction checklist

For buttons, toggles, selection, save/submit, drag, expand/collapse, or similar controls, ask:

- Is there immediate feedback?
- Can users distinguish pressed from disabled?
- Does processing prevent duplicate action when necessary?
- Does success/error appear in context?
- Does feedback survive rapid repeated interaction?
- Can the state be understood without relying on animation alone?

## Anti-patterns

- bounce/spring on every element;
- long entrance animations for routine screens;
- content fading out and back in when a smaller state update would suffice;
- artificial progress animation detached from real progress;
- loading shimmer continuing after data arrives;
- celebratory animation after trivial repeated actions;
- motion tokens bypassed by screen-local magic numbers;
- navigation transition used to imply a hierarchy that the information architecture does not actually have.

## Validation checklist

- [ ] Every motion has a defined UX role.
- [ ] Interaction feedback is immediate enough for the task.
- [ ] Shared tokens are used.
- [ ] Loading/progress reflects real state.
- [ ] Animation does not block completed actions.
- [ ] Interruption/retargeting is defined where needed.
- [ ] Reduced-motion behavior is defined.
- [ ] Meaning remains understandable without animation alone.
- [ ] The motion language is consistent across equivalent patterns.

## Expected agent output

When motion is relevant, return:

```text
Motion thesis:
Motion roles used:
Transition matrix:
Token mapping:
Gesture coupling:
Interruption behavior:
Reduced-motion behavior:
Haptic/feedback notes:
Performance/complexity risks:
Animations intentionally omitted:
```

## Related references

- `04-mobile-accessibility-review.md` for reduced-motion/accessibility checks.
- `05-mobile-first-platform-guidelines.md` for native gesture behavior.
- `10-creative-direction-protocol.md` for expressive hero moments within product constraints.

## Sources

- [Material 3 — Motion physics system](https://m3.material.io/styles/motion/overview)
- [Apple HIG — Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
