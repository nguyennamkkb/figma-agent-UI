# Mobile Screen Architecture

## Purpose

Use this reference **after First Glance, scan/attention reasoning, and a creative direction have been proposed**. Its job is to turn that perceptual thesis into robust screen geometry, scroll ownership, persistent regions, state behavior, and adaptive rules without flattening the idea into a default template.

## Screen contract

Describe every screen with:

```text
Purpose:
Entry condition:
Success / exit condition:
Primary action:
Primary information:
Secondary information:
Navigation region:
Persistent controls:
Scrollable region:
Input / keyboard behavior:
States:
Adaptive behavior:
```

A screen without a clear contract is not implementation-ready. The contract validates a creative direction; it should not replace perceptual reasoning.

## Non-negotiable rules

### MUST

- Define the screen purpose and primary task before choosing layout patterns.
- Define loading, content, empty, error, and interactive states when applicable.
- Use structural layout relationships such as padding, gap, alignment, distribution, and containers for normal flow.
- Respect safe areas for readable and interactive content.
- Anchor persistent CTA/navigation structurally rather than with guessed coordinates.
- Give scrollable content enough inset so persistent controls and system regions do not obscure it.
- Define which region owns scrolling; avoid accidental nested scrolling.
- Describe keyboard behavior for input-heavy screens.
- Change composition intentionally on larger widths rather than only stretching phone UI.

### MUST NOT

- Start from `x/y` coordinates for normal responsive flow.
- Use overlays when elements are not semantically or visually overlapping.
- Put multiple independent vertical scroll regions on a phone unless the use case truly requires them.
- Keep phone information density unchanged on tablet simply by widening cards.
- Hide required information behind navigation solely to reduce visual complexity.
- Let a persistent CTA cover long content, keyboard, or home indicator regions.

## Default anatomy

Use this as a baseline, not a mandatory visual template:

```text
ScreenRoot
├── NavigationRegion
├── MainContent
│   └── ScrollableContent when needed
└── PersistentBottomRegion when the primary action must remain available
```

Backgrounds or imagery may extend edge-to-edge when intentional. Readable content and controls still need appropriate safe-area handling.

## Screen realization procedure

Start from the selected perceptual thesis, then make it implementable:

1. **Restate the perceptual thesis** — what wins First Glance and what is the intended scan trace?
2. **Preserve decision dependency** — required information must remain available before the decision/action that needs it.
3. **Translate relationships into regions** — decide which elements belong together because of meaning/interaction, not because a component catalog groups them.
4. **Resolve navigation model** — choose the native navigation mechanism that preserves the intended context.
5. **Describe content topology** — name the resulting topology only after the composition exists; do not select it by screen category.
6. **Resolve CTA behavior** — decide when it becomes prominent, whether it is inline/persistent/contextual, and why.
7. **Assign scroll ownership** — decide what moves, what remains anchored, and how that affects attention continuity.
8. **Define persistent/contextual regions** — only where ongoing context or action truly justifies them.
9. **Define state variants** — preserve understandable attention continuity across loading, empty, error, disabled, processing, and success.
10. **Stress-test compact width** — no clipping, overlap, hidden actions, or broken scan order.
11. **Stress-test content expansion** — longer localization, Dynamic Type/font scale, missing imagery, unexpected item counts.
12. **Adapt for large space** — reconsider simultaneity, grouping, navigation, and focal relationships rather than stretching the phone layout.

## Content topology diagnostic vocabulary

Use this only to challenge or describe a composition after reasoning about First Glance and scan flow. It is not a lookup table for selecting a layout:

```text
Is the user progressing through dependent steps?
├─ yes -> sequential / progressive flow
└─ no
   ↓
Is the primary task finding or scanning one item among many?
├─ yes -> list / grid / searchable collection
└─ no
   ↓
Does the user need to compare multiple candidates at once?
├─ yes -> comparison / side-by-side / aligned attributes
└─ no
   ↓
Is one object the clear focus?
├─ yes -> detail / hero-detail composition
└─ no
   ↓
Is the user monitoring multiple independent signals/actions?
├─ yes -> dashboard / grouped hub
└─ no
   ↓
Does the task center on direct manipulation of content?
├─ yes -> canvas / workspace / tool-driven composition
└─ no -> grouped content based on information hierarchy
```

Do not treat this tree as permission to change the documented flow, and do not choose topology merely from a screen category. If a perceptual hypothesis supports an unconventional composition, keep it unless robustness/usability critique disproves it.

## CTA placement decision

```text
Does the CTA require reviewing content immediately above it?
├─ yes -> place inline near the decision
└─ no
   ↓
Must the CTA remain available while content scrolls?
├─ yes -> persistent bottom/action region
└─ no
   ↓
Is the action contextual to a specific row/object?
├─ yes -> keep it with that object
└─ no -> place at the end of the natural task sequence
```

A persistent CTA should not be used simply because it looks modern.

## Scroll ownership

- Prefer one primary vertical scroll owner on compact phone screens.
- Horizontal carousels are acceptable when the content relationship is obvious and discovery remains sufficient.
- Keep headers fixed only if the retained context or action justifies the lost viewport space.
- If a bottom region is persistent, account for its full interactive height in scroll content insets.
- A sheet should have clear ownership between sheet drag and inner scrolling.

## State-first architecture

Treat UI as a function of state and event:

```text
current screen state + user/system event -> next UI state
```

Minimum state considerations:

- `loading`: contextual progress or skeleton where structure is useful;
- `content`: normal state;
- `empty`: explanation plus safe next action;
- `error`: understandable failure plus retry or alternate path;
- `disabled`: condition is visible or inferable;
- `pressed/focused/selected`: interaction feedback;
- `processing`: prevent duplicate submission where needed;
- `success`: communicate outcome and next destination when relevant.

Structure should not jump unpredictably between these states unless the task itself changes.

## Sizing model

Classify important dimensions as:

- `fixed`: platform/control minimums, icons, deliberately bounded controls;
- `fit`: content determines size within constraints;
- `fill`: consume remaining available space.

Prefer relationships over isolated numeric guesses:

```text
screen gutter
section gap
row gap
alignment
content priority
min/max width
aspect relationship
```

## Adaptive composition

Large screens provide an opportunity to change structure, not merely scale.

Possible adaptations include:

- single-column list -> list + detail split;
- step-by-step navigation -> persistent supporting context beside the active step;
- full-screen modal editor -> centered/bounded workspace with surrounding context;
- one-column cards -> multi-column grid when scanning benefits;
- compact navigation -> sidebar/split navigation where platform conventions support it.

Preserve the same product intent and semantic state while changing presentation.

## Anti-patterns

- absolute positioning for ordinary content flow;
- persistent bottom bars without content inset;
- nested vertical scrolling with unclear gesture ownership;
- forcing every screen into a card stack;
- full-width controls stretched excessively on tablet;
- a huge hero region that delays the primary task;
- “responsive” layouts that only multiply every dimension by a scale factor;
- keyboard opening and covering the active field or CTA;
- empty/error states that use a completely unrelated layout hierarchy.

## Validation checklist

- [ ] Purpose and primary task are explicit.
- [ ] Information topology matches the task.
- [ ] Scroll ownership is explicit.
- [ ] Persistent regions are structurally anchored.
- [ ] Safe area and keyboard behavior are defined.
- [ ] Loading/content/empty/error structures remain coherent.
- [ ] Long copy and large text do not destroy the hierarchy.
- [ ] Compact phone is viable.
- [ ] Large-screen adaptation changes layout intentionally where useful.
- [ ] Engineering can implement the layout without guessing coordinate behavior.

## Expected agent output

When using this reference, produce a screen architecture such as:

```text
Screen purpose:
Content topology:
Navigation model:
Regions:
Information order:
Primary CTA placement:
Scroll owner:
Persistent regions:
State variants:
Keyboard behavior:
Compact behavior:
Tablet/large-width behavior:
Layout risks:
```

## Related references

- `00-perceptual-reasoning.md` for First Glance and attention flow before architecture realization.
- `01-mobile-ux-principles.md` for task and hierarchy constraints.
- `05-mobile-first-platform-guidelines.md` for platform-specific structure.
- `06-scalable-design-system.md` for component and pattern mapping.

## Sources

- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
