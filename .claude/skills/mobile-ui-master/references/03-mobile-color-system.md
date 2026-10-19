# Mobile Color System

## Purpose

Use color as a semantic hierarchy and brand-expression system, not as a list of disconnected hex values. Design and code should both understand what a color means and where it is allowed to appear.

## Semantic model

Start from roles such as:

```text
surface / onSurface
surfaceContainer / outline
primary / onPrimary
primaryContainer / onPrimaryContainer
secondary / onSecondary
tertiary / onTertiary
error / onError
```

Primitive palette values support these roles; UI should consume semantic or component roles whenever possible.

## Non-negotiable rules

### MUST

- Assign colors by semantic role before assigning raw values.
- Reserve `primary` for important action/identity hierarchy.
- Keep `error` specific to error/destructive semantics; do not reuse it decoratively.
- Define light and dark behavior for custom semantic tokens.
- Verify text and important non-text cues remain distinguishable across states.
- Pair color with text, icon, shape, pattern, or another cue when meaning is critical.
- Test colors with imagery, translucency/material, and real content where those affect contrast.

### MUST NOT

- Use color only because a section feels visually empty.
- Give primary, secondary, and tertiary accents equal visual weight.
- Hard-code a platform/system semantic color when a dynamic semantic equivalent exists.
- Communicate selection, validation, status, or severity by color alone.
- Treat the same raw red/green/blue value as having the same cultural meaning in every market.

### SHOULD

- Let neutral surfaces carry most of the interface.
- Treat saturated color as scarce visual currency.
- Control mood using tone/lightness and saturation as much as hue.
- Prefer semantic mapping that can survive brand refresh, dark mode, or platform adaptation.

## Palette construction workflow

1. **Define product emotion** — e.g. calm, clinical, playful, energetic, luxurious; tie it to product/user context, not generic adjectives.
2. **Choose a base strategy** — monochromatic, analogous, complementary/split-complementary, or another deliberate relationship.
3. **Build neutral surfaces first** — background, elevated/container surfaces, outlines, text hierarchy.
4. **Assign one dominant accent role** — usually primary action/identity.
5. **Add secondary/tertiary roles only when they solve a hierarchy or category problem.**
6. **Define semantic status roles** — error and any required status meanings.
7. **Map light/dark variants** by semantic outcome rather than naïve inversion.
8. **Map component states** — default, pressed, selected, disabled, focus, error.
9. **Validate contrast and non-color cues.**
10. **Stress-test with imagery and dense screens** to ensure accent remains scarce.

## Composition strategies

### Monochromatic

One hue across different tones. Useful for calm, cohesive products and when content should dominate.

### Analogous

Neighboring hues. Useful when the interface needs richer emotional range without strong conflict.

### Complementary / split-complementary

Use contrast sparingly for focal actions or critical data points. Do not spread opposing saturated hues equally across the screen.

## Semantic hierarchy example

```text
Neutral surfaces -> 70–90% of visual field
Primary accent   -> important action / identity
Secondary        -> supporting hierarchy
Tertiary         -> rare contextual distinction
Error            -> failure/destructive semantics only
```

The percentages are a thinking aid, not a required measurable rule.

## Contrast and accessibility

Source baseline:

- normal text: minimum `4.5:1` against its background;
- large text: minimum `3:1` against its background.

Also review enabled, pressed, selected, disabled, dark-mode, image-overlay, and translucent states. Passing contrast for default text alone is insufficient if key interaction states become indistinguishable.

## Brand expression without hierarchy damage

Allow brand personality through:

- accent hue and tonal curve;
- surface warmth/coolness;
- imagery relationship;
- gradients when they have a defined role;
- component-specific emphasis;
- chart/data palette where categories require distinction.

Do not let brand expression override task clarity. A beautiful palette that makes every component equally prominent has failed.

## Anti-patterns

- exporting a palette of raw hex values with no semantic mapping;
- using gradients on every primary surface;
- multiple saturated cards competing with one another;
- gray disabled states that become unreadable;
- success/error communicated only as green/red;
- dark mode created by simple color inversion;
- low-contrast text placed over uncontrolled imagery;
- using error color as a decorative brand accent.

## Validation checklist

- [ ] Each important color has a semantic role.
- [ ] Primary accent remains visually scarce and meaningful.
- [ ] Error color is reserved for error/destructive semantics.
- [ ] Light and dark mappings are defined.
- [ ] Important text meets the stated contrast baseline.
- [ ] Selection/status/error are not communicated by color alone.
- [ ] Disabled/pressed/selected states remain distinguishable.
- [ ] The palette remains coherent with real imagery/content.
- [ ] Platform semantic colors are used appropriately where relevant.

## Expected agent output

When creating or reviewing a color system, provide:

```text
Creative/color thesis:
Primitive palette direction:
Semantic role mapping:
Primary/secondary/tertiary usage rules:
Surface hierarchy:
Status colors:
Light mapping:
Dark mapping:
Component-state mapping:
Contrast/accessibility risks:
Anti-patterns to avoid for this product:
```

## Related references

- `04-mobile-accessibility-review.md` for accessibility validation.
- `06-scalable-design-system.md` for token layers.
- `10-creative-direction-protocol.md` for visual personality and creative boundaries.

## Sources

- [Material 3 — Color roles](https://m3.material.io/styles/color/roles)
- [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [W3C WCAG 2.2 — Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
