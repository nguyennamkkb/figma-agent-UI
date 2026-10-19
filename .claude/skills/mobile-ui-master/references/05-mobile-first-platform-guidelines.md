# Mobile-first and Platform Guidelines

## Purpose

Use this reference to keep product intent consistent while expressing the experience through native mobile conventions. Mobile-first means starting from real mobile constraints rather than shrinking a desktop composition.

## Mobile-first constraints

Design from:

- one-handed use and thumb reach;
- limited viewport;
- imprecise touch;
- short/fragmented attention;
- unstable or interrupted connectivity;
- keyboard and system UI intrusion;
- safe areas and device cutouts;
- permissions and OS-controlled states;
- device rotation and larger mobile/tablet windows when relevant.

## Priority order

When constraints conflict, resolve in this order:

1. User task and primary CTA.
2. Information required before the task.
3. Touch target, safe area, keyboard, and reachability.
4. Flow on compact mobile width.
5. Platform-native behavior.
6. Adaptive layout for tablet/foldable/large window.
7. Pixel-level cross-platform similarity.

## Invariant vs native override

Classify decisions into two layers.

### Product invariants

Normally shared across platforms:

- user goal and outcome;
- business rules;
- information architecture at the semantic level;
- required content;
- state meanings;
- eligibility/validation;
- analytics intent;
- brand principles.

### Native overrides

May differ to match platform expectations:

- navigation container;
- back behavior;
- sheet/dialog presentation;
- standard controls;
- typography mapping;
- system icons where appropriate;
- elevation/material treatment;
- keyboard conventions;
- haptics/feedback;
- permission/system flows;
- large-screen navigation.

Do not force iPhone, iPad, watch and widget surfaces to be pixel-identical if doing so weakens native behavior.

## Non-negotiable rules

### MUST

- Preserve product intent and semantic states across platforms.
- Follow native expectations for navigation, back, modal presentation, standard controls, and system gestures.
- Respect safe areas and system bars for interactive/readable content.
- Define keyboard behavior for input flows.
- Keep critical gestures discoverable and provide an alternate path where the action is important.
- Provide immediate or continuous feedback for gestures/direct manipulation.
- Review compact phone, representative phone, large phone, tablet/large window, and landscape when relevant.
- Review light/dark, text scaling, keyboard, offline/failure, and long copy.

### MUST NOT

- Shrink desktop UI into mobile without reprioritizing information and actions.
- Recreate another platform's navigation/controls purely for pixel consistency.
- Conflict with edge/system gestures.
- Make a custom gesture the sole way to complete an important task.
- Stretch phone controls to extreme widths on tablet without reconsidering composition.
- Place important controls inside unsafe regions because the background is edge-to-edge.

## Platform decision procedure

For each screen/pattern:

1. Lock product invariant behavior.
2. Identify the target platforms and minimum supported form factors.
3. Identify native navigation/back expectations.
4. Map modal/sheet/dialog behavior.
5. Map standard controls before inventing custom ones.
6. Review system permissions and interruptions.
7. Review keyboard and text-input conventions.
8. Map semantic colors/type/components through the platform layer.
9. Define haptic/motion behavior where meaningful.
10. Define large-screen adaptation independently from phone geometry.

## iOS expression guide

Use native iOS conventions where they fit the documented task:

- predictable navigation-stack back behavior;
- platform-appropriate sheets/full-screen presentations depending on task context;
- standard controls and interaction semantics when they solve the need;
- safe-area-aware content and bottom actions;
- Dynamic Type and accessibility semantics;
- system gestures without conflict;
- platform-appropriate feedback/haptics when useful.

Do not copy another platform's component appearance or navigation behavior merely to maintain visual parity.

## Gesture decision framework

```text
Is the gesture a platform-standard behavior?
├─ yes -> use if it matches the task
└─ no
   ↓
Is it a frequent, direct-manipulation task where gesture adds clear value?
├─ no -> prefer visible control
└─ yes
   ↓
Can the user discover it and see continuous feedback?
├─ no -> redesign or teach contextually
└─ yes
   ↓
Is there an alternate path for critical completion?
├─ no -> add one
└─ yes -> custom gesture may be appropriate
```

## Adaptive layout procedure

Do not define tablet as `phone × scale`.

Ask:

- Can supporting context remain visible beside the primary task?
- Can navigation become persistent?
- Can content scan more efficiently in multiple columns?
- Should controls retain bounded readable widths?
- Does landscape expose a useful side-by-side relationship?
- Can the user avoid unnecessary drill-down because more space is available?

Adapt density and navigation only when doing so improves the task.

## Hardware/context stress test

At minimum, consider:

```text
compact phone
reference phone
large phone
tablet / large window
landscape
light / dark
large text
keyboard visible
poor/no network
long localization
system permission interruption
```

Not every task requires every case, but excluded cases should be intentional.

## Anti-patterns

- desktop toolbar shrunk into a phone header;
- bottom controls colliding with home/system gesture regions;
- custom swipe that conflicts with system back/navigation;
- the same layout forced onto iPhone, iPad, watch and widget surfaces with non-native behavior;
- tablet UI with giant full-width phone buttons;
- controls placed at visually convenient but ergonomically poor positions with no task reason;
- system permission requested without surrounding context when the product flow requires explanation;
- landscape ignored when the app supports it and layout becomes unusable.

## Validation checklist

- [ ] Product invariants are separated from platform expression.
- [ ] Navigation/back behavior matches target platform expectations.
- [ ] Modal/sheet/dialog choice is intentional.
- [ ] Safe areas/system bars are respected.
- [ ] Keyboard behavior is defined.
- [ ] Critical gestures are discoverable and have alternatives.
- [ ] Compact phone remains usable.
- [ ] Tablet/large-window layout is intentionally recomposed where useful.
- [ ] Text scaling, theme, long copy, and failure states are reviewed.
- [ ] Consistency across Apple surfaces (iPhone, iPad, watch, widgets) is semantic rather than forced pixel equality.

## Expected agent output

When platform adaptation matters, return:

```text
Shared product invariants:
Target platforms/form factors:
iOS mapping:
Navigation/back differences:
Modal/sheet differences:
Control differences:
Gesture differences:
Safe-area/system-bar behavior:
Keyboard behavior:
Phone layout:
Tablet/large-window adaptation:
Platform-specific risks:
```

## Related references

- `02-mobile-screen-architecture.md` for structural layout decisions.
- `04-mobile-accessibility-review.md` for accessibility constraints.
- `06-scalable-design-system.md` for invariant tokens and platform mapping.

## Sources

- [Apple HIG — Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
