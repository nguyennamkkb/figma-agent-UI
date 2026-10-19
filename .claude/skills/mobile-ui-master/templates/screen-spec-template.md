# Screen Spec — <screen name>

## 1. Product truth

- User goal:
- Entry condition:
- Success/exit condition:
- Required information:
- Required actions:
- Business rules:

## 2. Perceptual intent

### First Glance

- What should win attention first:
- Immediate understanding:
- Desired mental/emotional impression:
- What must not compete yet:
- Why this fits the use case:

### Scan trace

1. Focal anchor:
2. Supporting context/evidence:
3. Decision/control:
4. Confirmation/action:
5. Peripheral/optional content:

### Attention architecture

- Focal:
- Supporting:
- Peripheral:
- Interaction gravity:
- State-sensitive attention shifts:

## 3. Selected creative thesis

<One paragraph explaining the mental model, composition idea, and why it wins without changing the use case.>

- Memorable idea:
- Main trade-off:
- Alternative attention hypothesis considered:

## 4. Structure

```text
ScreenRoot
├── NavigationRegion
├── MainContent
└── Persistent/ContextualRegion (only when justified)
```

## 5. Information hierarchy

1.
2.
3.

## 6. Layout rules

- Horizontal gutter:
- Vertical rhythm:
- Fixed / fit / fill:
- Scroll ownership:
- Safe area:
- Keyboard:
- Compact width:
- Large phone:
- Tablet / landscape:
- Missing imagery/content fallback:

## 7. Components and tokens

| Element | Component/Pattern | Semantic purpose | Variant | State | Semantic tokens |
|---|---|---|---|---|---|
| | | | | | |

## 8. State matrix

| State | Attention shift | User sees | Available actions | Transition / recovery |
|---|---|---|---|---|
| Loading | | | | |
| Content | | | | |
| Empty | | | | |
| Error | | | | |
| Disabled | | | | |
| Processing | | | | |
| Success | | | | |

## 9. Interaction rules

- Trigger -> immediate feedback -> state -> result -> recovery
- Control-to-object relationship:
- Gesture alternative when relevant:

## 10. Accessibility

- Touch targets:
- Accessibility labels:
- Focus order:
- Dynamic Type/font scale:
- Contrast / non-color cues:
- Reduced motion:

## 11. Motion

- Trigger:
- Purpose / attention continuity:
- Token:
- Interruption:
- Reduced motion:

## 12. Analytics / hypothesis

- Hypothesis:
- Primary metric:
- Guardrails:

## 13. Acceptance criteria

- MUST
- SHOULD
- MAY

## 14. Assumptions / unresolved decisions

-

## 15. Perceptual + use-case self-check

- [ ] Correct element wins First Glance.
- [ ] Scan order matches decision dependency.
- [ ] CTA becomes dominant at the right moment.
- [ ] Visual hierarchy survives grayscale / missing imagery / longer copy.
- [ ] Creative idea does not change product truth.
