# Scalable Mobile Design System

## Purpose

A Design System is not a screenshot library. It is a governed set of reusable decisions with a path into implementation. It should make common product problems faster and more consistent without preventing new product solutions.

Use this reference when creating, extending, or mapping UI into a reusable system.

## System layers

```text
Foundations
  color, typography, spacing, radius, elevation, motion
        ↓
Semantic tokens
  surface, content, primary, error, spacing intent, content states
        ↓
Components
  button, input, row, card, tab, sheet, navigation, etc.
        ↓
Patterns
  form, list, empty state, confirmation, onboarding, picker, etc.
        ↓
Screen compositions
  rules for combining patterns for real tasks
```

Keep these layers separate enough that brand or platform changes do not require rebuilding every screen.

## Token hierarchy

### Primitive tokens

Raw ingredients:

```text
palette values
spacing scale
font families/weights
radius scale
motion values
```

### Semantic tokens

Intent:

```text
color/content/primary
color/surface/default
space/screen/gutter
space/section/gap
motion/feedback/fast
```

### Component tokens

Component-specific decisions:

```text
button/primary/background/default
input/border/focused
card/radius/default
```

UI should normally consume semantic/component tokens, not primitives directly.

## Non-negotiable rules

### MUST

- Give every component a clear semantic purpose.
- Define variants, properties, and state matrix.
- Define token mapping.
- Define anatomy, content constraints, min/max behavior, wrapping, and touch target.
- Define interaction behavior: default, pressed, focused, selected, loading, disabled, error where relevant.
- Define accessibility semantics and platform-specific overrides.
- Document when a component should and should not be used.
- Keep product invariants separate from platform-native expression.
- Provide governance/versioning for shared tokens/components.

### MUST NOT

- Create a component because one screen looks visually unique.
- Fork an existing component only to change spacing/color that should be a variant or token.
- Expose raw primitive values as the normal screen-level API when semantic roles exist.
- Publish a component without behavior/state/content constraints.
- Force a shared cross-platform component to ignore native navigation/control semantics.
- Fix recurring consistency problems independently on every screen when the root cause is systemic.

## Reuse decision tree

Before creating a new component:

```text
Can an existing component solve the same semantic job with a supported variant?
├─ yes -> reuse or add a justified variant
└─ no
   ↓
Can a composition of existing primitives/components solve the need without new reusable behavior?
├─ yes -> create a pattern or screen-local composition
└─ no
   ↓
Does the new behavior/anatomy repeat or clearly deserve reuse across contexts?
├─ yes -> candidate shared component
└─ no -> keep screen-local until reuse is proven
```

The `80%` intuition may help: if an existing component solves most of the semantic need, prefer extending it carefully rather than creating a near-duplicate. This is a heuristic, not a hard numeric gate.

## Component contract

A shared component spec should include:

```text
Name:
Purpose:
Use when:
Do not use when:
Anatomy:
Variants:
Properties:
State matrix:
Content rules:
Min/max/wrapping:
Touch target:
Semantic token mapping:
Events:
Loading/error behavior:
Accessibility semantics:
Platform override (iPad / watch / widget):
Owner:
Version / status:
```

Engineering should not need to infer component behavior from screenshots.

## State matrix template

```text
                 default  pressed  focused  selected  loading  disabled  error
Visual             ✓        ✓        if       if        if        ✓       if
Interaction        ✓        ✓        ✓        ✓         limited   none    defined
Accessibility      ✓        ✓        ✓        ✓         ✓         ✓       ✓
```

Only include states that are semantically relevant, but define them explicitly.

## Pattern vs component

Use a **component** when the reusable unit owns a stable anatomy/behavior/API.

Use a **pattern** when the solution is a repeatable composition of multiple components for a task, such as:

- form submission;
- empty state with recovery;
- confirmation flow;
- filter/search experience;
- onboarding sequence;
- media picker;
- compare-and-confirm.

Use a **screen composition** when the arrangement is tied to a broader use case and may not deserve an independent reusable API.

Do not turn every recurring visual arrangement into a component.

## Multi-platform model

Share:

- token meaning;
- product semantics;
- component purpose;
- content model;
- state names when equivalent;
- accessibility intent.

Allow platform mapping for:

- navigation;
- sheet/dialog behavior;
- standard controls;
- typography specifics;
- material/elevation;
- haptics;
- motion details;
- system icons;
- keyboard/system interactions.

Document which properties are invariant and which can be natively overridden.

## Design-system creation workflow

1. Inventory product/use cases before designing a component catalog.
2. Extract recurring semantic jobs, not recurring screenshots.
3. Define foundations and semantic tokens.
4. Define high-frequency primitives/components.
5. Define component state/accessibility contracts.
6. Define task patterns.
7. Test components inside real screen compositions.
8. Identify missing variants before inventing one-off components.
9. Map to platform implementation.
10. Establish ownership, change proposal, versioning, and deprecation rules.

## Minimum component families

When creating a broad mobile Design System, consider coverage across these semantic families rather than chasing a raw component count:

```text
Actions
Inputs
Selection
Navigation
Content display
Lists/collections
Feedback/status
Progress/loading
Overlays/modals
Search/filter
Media
Data visualization
Date/time
Empty/error states
Containers/layout helpers
```

The exact catalog should follow product needs. Do not manufacture 60 superficial variants merely to meet a number.

## Governance

Track and review:

- system adoption;
- duplicate components;
- unsupported forks;
- handoff/implementation friction;
- recurring consistency bugs;
- accessibility defects;
- time required to ship common patterns.

Use a proposal/review/release process for shared changes. Maintain changelog, version/deprecation path, and an owner for important system areas.

## Anti-patterns

- `ProfileCard`, `ProfileInfoCard`, `UserProfileCard`, `ProfileStatsCard` created for small cosmetic differences;
- one-off spacing/color hard-coded inside screens;
- primitive token names leaking into product semantics everywhere;
- component variants with no documented reason or usage rule;
- giant “universal” components with dozens of unrelated flags;
- forcing platform-specific behaviors through one identical implementation abstraction;
- design library updated without implementation/version alignment;
- screenshots treated as the component specification.

## Validation checklist

- [ ] Foundations, semantic tokens, components, patterns, and screen compositions are distinguishable.
- [ ] Screen UI consumes semantic/component tokens where appropriate.
- [ ] Existing components are evaluated before new ones are created.
- [ ] New components have a semantic reason and reuse case.
- [ ] Component state matrix is explicit.
- [ ] Content/wrapping/min/max/touch behavior is explicit.
- [ ] Accessibility semantics are defined.
- [ ] Platform invariants and overrides are documented.
- [ ] Shared changes have ownership/versioning/deprecation strategy.
- [ ] The system is tested through real use cases, not only component-gallery screenshots.

## Expected agent output

When designing or extending a system, return:

```text
System scope:
Product/use-case coverage:
Foundation tokens:
Semantic tokens:
Existing components to reuse:
New component candidates:
Patterns:
Screen compositions:
Component contracts/state matrices:
Platform mappings:
Accessibility constraints:
Governance/versioning notes:
Duplicate/over-abstraction risks:
```

## Related references

- `03-mobile-color-system.md` for semantic color roles.
- `05-mobile-first-platform-guidelines.md` for platform mapping.
- `11-deliverable-and-review-protocol.md` for implementation-ready specs.

## Sources

- [Material 3 — Color roles and tokens](https://m3.material.io/styles/color/roles)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines)
