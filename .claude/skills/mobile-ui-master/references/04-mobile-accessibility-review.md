# Mobile Accessibility and UI Review

## Purpose

Accessibility is part of the design definition, not a final audit. A visually attractive interface is incomplete if users cannot read it, reach it, activate it, understand its state, or operate it with assistive technologies.

Use this reference as a design gate and review protocol.

## Non-negotiable rules

### MUST

- Provide adequately sized and separated touch targets.
- On iOS, prefer controls around `44 x 44 pt` for comfortable interaction.
- Respect the source WCAG 2.2 minimum target/spacing baseline of `24 x 24 CSS px` where applicable.
- Give icon-only controls an accessible name/label.
- Keep assistive focus order aligned with logical reading and action order.
- Support text scaling/Dynamic Type without clipping, overlap, or loss of critical CTA.
- Use non-color cues for important meaning and state.
- Keep critical controls usable with platform accessibility and alternative input methods where applicable.
- Review accessibility in loading, error, disabled, selected, and modal states, not only default content.

### MUST NOT

- Hide a critical action because larger text no longer fits.
- Convey error, success, selection, or severity through color alone.
- Make an icon-only control understandable only through visual convention when an accessible label can be provided.
- Reorder visual content in a way that produces a nonsensical focus/reading order.
- Make a custom gesture the only path to a critical action.
- Treat disabled text or borders as exempt from being visually distinguishable.

## Accessibility-first design sequence

For each interactive screen:

1. Establish semantic reading order.
2. Identify interactive elements and accessible names.
3. Validate touch target geometry and spacing.
4. Validate text scaling/wrapping behavior.
5. Validate status and selection without color.
6. Define focus behavior for navigation, modal presentation, errors, and dynamic content.
7. Check keyboard/voice/assistive alternatives where applicable.
8. Check contrast across themes and states.
9. Check reduced-motion behavior if motion is used.
10. Stress-test long content and small screens.

## Control checklist

- Touch target is large enough for imprecise touch.
- Adjacent targets are not easy to activate accidentally.
- Icon-only controls have a meaningful accessible label.
- Control state (`selected`, `disabled`, `expanded`, etc.) is available semantically where relevant.
- Error text is associated with the field/action that caused it.
- Focus does not become trapped unintentionally in custom containers.
- The active task remains reachable after the keyboard appears.

## Text and content resilience

Test:

- longer localization;
- larger font/Dynamic Type;
- multi-line button/label behavior when allowed;
- truncation only where loss of content is acceptable;
- content reflow instead of overlap;
- primary CTA visibility and reachability after text expands.

If a design only works at one font size, it is structurally fragile.

## Review order

### 1. Flow and state

- Can the user tell where they are and what to do next?
- Are loading, empty, error, success, disabled, and long-content states designed?
- Do consequential actions have an appropriate escape, undo, or confirmation path?

### 2. Accessibility semantics and control behavior

- Are targets reachable and named?
- Does focus order match the intended task?
- Are important states represented beyond color?
- Can text scale without losing functionality?

### 3. Geometry

- No clipping, overlap, or accidental off-screen control.
- Safe area, keyboard, and persistent CTA do not cover content.
- Spacing and wrapping stay coherent.
- Normal flow avoids absolute coordinates.

### 4. Visual hierarchy

- There is one clear focal point when the task needs one.
- Surface, typography, and color establish hierarchy rather than equal emphasis.
- The screen remains balanced in light/dark modes and on different sizes.

## Accessibility severity gate

Use these severities during review:

- `BLOCKER`: prevents completion of a critical use case for an accessibility mode or removes access to a required action/information.
- `HIGH`: substantial difficulty, confusing focus/order, missing important semantic state, or severe text/target issue.
- `MEDIUM`: resilience or consistency problem that can reduce usability under scaling/theme/device changes.
- `LOW`: polish issue with limited task impact.

A `BLOCKER` prevents design sign-off.

## Anti-patterns

- visual labels removed in favor of ambiguous icons;
- tiny close buttons in corners;
- tap target exactly equal to the visible icon bounds;
- focus order following implementation order instead of task order;
- fixed-height text containers that clip at larger sizes;
- low-opacity disabled content that becomes unreadable;
- animation required to understand a state change with no reduced-motion equivalent;
- drag/swipe-only delete, reorder, or confirm interaction without another path.

## Validation checklist

- [ ] Touch target and spacing are appropriate.
- [ ] Icon-only controls are named accessibly.
- [ ] Focus/reading order follows the task.
- [ ] Text scaling does not clip, overlap, or hide critical action.
- [ ] Color is not the only meaningful cue.
- [ ] Key text/icon/border states remain visually distinguishable.
- [ ] Keyboard and persistent controls do not cover the active task.
- [ ] Custom gestures have alternatives for critical actions.
- [ ] Loading/error/modal state semantics are considered.
- [ ] Reduced motion is considered where animation matters.

## Expected agent output

When accessibility is in scope, return:

```text
Accessibility assumptions:
Touch-target risks:
Semantic labels/states:
Focus order:
Dynamic Type / font-scale behavior:
Non-color cues:
Keyboard/alternative input behavior:
Reduced-motion behavior:
BLOCKER/HIGH findings:
Required fixes before sign-off:
```

## Related references

- `01-mobile-ux-principles.md` for flow and task clarity.
- `02-mobile-screen-architecture.md` for resilient layout.
- `07-mobile-motion-microinteractions.md` for reduced-motion behavior.

## Sources

- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [W3C WCAG 2.2 — Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
