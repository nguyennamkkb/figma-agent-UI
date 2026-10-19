# Splash and Launch
> Load this file ONLY when: `mode=ui` target `splash` (§11 ui-splash row).
> Do NOT load when: onboarding/showcase/standard screens, or any `mode=review` target except highfi with a launch surface in scope.
> Key sections: launch-vs-splash-vs-entry separation; cold-start budget; failure fallback.

## Purpose

Decide whether a launch-time surface is needed at all, and keep the three
launch concepts strictly separated: system launch screen, branded splash, and
onboarding entry. The default is fast cold start into real content with no
branded interlude. A gate screen exists only to route, within a stated time
budget, with a defined failure fallback.

## Taxonomy

Three distinct concepts. Do not merge them.

- **System launch screen:** platform-owned placeholder shown while the app
process starts. It MUST resemble the first screen (same background, same
skeleton structure). No logo lockup, no tagline, no marketing copy, no
progress indicator, no interactive control.
- **Branded splash:** a deliberate full-screen brand moment (logo, animation,
illustration). It is an opt-in creative choice, never a loading necessity.
- **Onboarding entry:** the first value-driven screen of the first-run flow.
It is product content, not a launch artifact, and it MUST be reachable through
the route table rather than hardwired to app start.

Decision order: system launch screen first (always, minimal), then route,
then — only if justified — splash or onboarding entry.

## No-splash rule

Remove the branded splash when all of the following hold:

```text
cold start is fast AND
no blocking gate (auth, config, migration) forces a wait AND
the first screen can render content, skeleton, or empty state immediately
```

In that case enter real content directly. A splash that only fills time the
app does not need is a defect, not branding.

A branded splash is justifiable only with an explicit reason recorded in the
spec (e.g. required brand beat, staged asset preload with real progress),
plus a fixed maximum duration and a skip path.

## Gate screen contract

A gate screen (first-run check, session check, lock check, mandatory update
check) is a router, not a destination. Specify it with:

```text
Route table:
first-run      -> onboarding entry
returning      -> home / last content
locked/session -> auth / lock
forced-update  -> update gate (only when product truth requires it)
fallback       -> safe destination on check failure or timeout
Time budget:   <~2s total for all launch checks
Failure fallback: named screen + retry or continue-degraded path
```

Rules:

- Every launch condition maps to exactly one destination. No unmapped state.
- Time budget is stated in the spec as a row, not implied by animation length.
- On timeout or check failure, the fallback fires. The gate never spins
indefinitely and never strands the user on a logo.
- The gate shows the first screen's structure or a neutral skeleton, never a
brand hero.

## Non-negotiable rules

### MUST

- Keep the system launch screen visually identical to the first screen's base.
- Define the route table before designing any splash or onboarding visual.
- State the launch time budget explicitly (<~2s).
- Define the failure fallback destination and its recovery action.
- Route onboarding entry through the route table (first-run branch).

### MUST NOT

- Use the system launch screen as a logo, tagline, or marketing surface.
- Add a branded splash to mask slow initialization instead of fixing startup.
- Gate first content behind onboarding when the user has no first-run reason.
- Show fake or indeterminate progress that is not tied to a real check.
- Require dismissing legal, promo, or rating content before first content.

## When to use

- Use the system launch screen guidance on every app: match it to the first
screen with no branding.
- Use the gate contract whenever launch branches (first-run vs. returning,
locked vs. unlocked, forced update vs. normal).
- Use a branded splash only with a recorded justification, a fixed maximum
duration, and a skip path.
- Use onboarding entry guidance when the first-run branch fires and the spec
needs a value-driven first screen.

## When NOT to use

- Do NOT add a branded splash for a fast cold start with no blocking gate;
enter content directly.
- Do NOT use this reference to design onboarding content sequencing or
value messaging; it covers entry routing only.
- Do NOT use a gate screen as a home for legal footers, promos, changelogs,
or ratings.
- Do NOT apply launch timing to in-app navigation transitions or state
loading; those belong to their own screens.

## Anti-patterns

- brand-hero splash: full-screen logo moment with no recorded justification
or skip path, delaying first content.
- legal-footer showcase: terms, licenses, or attribution occupying launch
attention before the user reaches any value.
- fake progress: determinate bar or percentage disconnected from real checks,
or an indeterminate spinner masking unbounded work.
- gate-as-destination: route checks that accumulate content, CTAs, or promos
instead of routing within budget.
- hardwired onboarding: first-run flow unreachable except by reinstall,
because it bypasses the route table.
- launch-screen bait-and-switch: launch placeholder with a different
background, theme, or structure than the first screen, causing a visible flash.

## Spec mapping (`ios-*` spec)

| Spec surface | What to write |
|---|---|
| `05-flows.md` entry edges + launch-time `NFR` | One `ENTRY:first-launch` / `ENTRY:launch` edge per launch condition with its destination; time budget (<~2s) in the NFR; failure-fallback edge with recovery action |
| `03-screens/_inventory.md` › Splash and onboarding | List at most: launch screen (not an SCR), gate (if branching), splash only if justified, onboarding entry as first-run destination |
| Splash / gate `SCR` › Functional blocks | Gate: entry condition, route table, time budget, fallback; splash only if kept: justification, max duration, skip path |
| `WF-SCR` › States | Launch check states: loading (checking), success (routed), error (timed out → fallback); no stranded checking state |
| `FR` acceptance criteria | No-splash acceptance for fast cold starts; fallback fires on timeout/failure |
| Native structure | Launch surfaces stay native: no bespoke brand system, no custom progress invention |
| `WF-SCR` › Layout regions (relief) | Launch contributes relief by ending fast: route within budget, no brand interlude, skeleton continuity into first content |

## Enforcement items

- `route-table-present`: the gate spec contains a route table with
first-run → onboarding, returning → home, lock → auth, and a named failure
fallback. Missing branch or missing fallback fails the check.
- `time-budget-present`: the spec states an explicit launch time budget
(<~2s) covering all launch checks. An implied duration (animation length,
spinner) does not satisfy the check.

## Validation checklist

- [ ] System launch screen matches the first screen with no logo or copy.
- [ ] Route table covers first-run, returning, lock, and fallback.
- [ ] Time budget is stated explicitly (<~2s).
- [ ] Failure fallback names a destination and a recovery action.
- [ ] No branded splash unless justification, max duration, and skip exist.
- [ ] Fast cold start with no gate enters content directly.
- [ ] Onboarding entry is a route-table destination, not a hardwired start.
- [ ] No fake progress or gate-as-destination content.

## Expected agent output

When launch is in scope, return:

```text
Launch taxonomy applied:
Route table:
Time budget:
Failure fallback:
Splash decision (removed | kept + justification):
Onboarding entry destination:
Launch risks:
```

## Related references

- `00-perceptual-reasoning.md` §State-sensitive attention for continuity
between launch placeholder and first content.
- `01-mobile-ux-principles.md` §Decision framework for keeping launch a
routing decision rather than a destination.
- `02-mobile-screen-architecture.md` §State-first architecture for
checking/routed/timed-out launch states.
- `07-mobile-motion-microinteractions.md` §Motion decision framework for
rejecting artificial launch progress.
- `12-creative-information-composition.md` §7. Gate for value-density relief
at entry screens.

## Sources

- [Apple HIG — Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
