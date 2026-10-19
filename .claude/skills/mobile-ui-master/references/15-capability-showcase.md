# Capability Showcase as Value Proof
> Load this file ONLY when: `mode=ui` target `showcase/capability` (§11 ui-showcase row) or highfi review with a capability surface in scope.
> Do NOT load when: splash/onboarding/standard screens, or `mode=review` concept/lowfi/prototype.
> Key sections: capability-as-evidence test; moment relevance; critique guidance (advisory, never a gate).

## Purpose

Use this reference to decide when a platform capability (watch app, widget, Live Activity, notification, HealthKit integration) may appear inside onboarding or an empty state as proof of product value. A capability showcase is not advertising and not a feature tour; it is evidence that the product solves one real user job, shown at the moment that job is relevant.

This reference is **advisory only**. It provides no gate check and never blocks approval on its own. Enforcement items below are critique guidance for reviewers, not pass/fail gates.

## When to use

- Use a capability showcase when the capability directly resolves a real user job already established by the product use case (e.g. glanceable tracking belongs in a widget because the user checks progress many times per day).
- Use it inside onboarding or an empty state when the surrounding screen already has a contextual reason to mention the capability — the user is setting up the job the capability serves.
- Use contextual, at-the-moment disclosure (TipKit-style) when the trigger is the user approaching the relevant feature or state for the first time, not app launch.
- Use an at-use permission pattern: show the value first, request system permission only when the user acts on the capability, and provide a graceful fallback when the user skips or denies.
- Use one capability per context: one screen, one job, one capability proof.

## When NOT to use

- Do NOT showcase a capability that has no proven user job behind it, even when the platform supports it or competitors advertise it.
- Do NOT batch multiple capabilities into a single upfront carousel, checklist, or "superpower" screen before the user has expressed the underlying need.
- Do NOT request permissions (notifications, HealthKit, location, motion) during onboarding unless the core first task cannot proceed without them; defer to the moment of use.
- Do NOT use a capability showcase to fill an empty onboarding step, to add visual excitement, or to compensate for an unclear value proposition.
- Do NOT repeat a dismissed showcase. A skipped or denied capability returns only through its in-feature entry point, never through a re-prompt on next launch.

## Showcase-vs-gimmick decision

Apply both tests before approving a showcase. If either fails, it is a gimmick: cut it.

```text
Test 1 — Real job:
Does this capability solve a job the user already has in this product?
├─ yes -> continue to Test 2
└─ no  -> gimmick; remove regardless of visual quality

Test 2 — Right moment:
Is the showcase placed where the user is doing (or about to do)
the job it serves, with the trigger tied to that context?
├─ yes -> showcase; keep exactly one per context
└─ no  -> gimmick in this placement; defer to the in-feature moment
```

Additional tie-breakers:

- If the capability needs user data that does not exist yet (no workouts, no tasks, no orders), prefer the empty state of the relevant feature over onboarding.
- If the capability duplicates information already visible on the current screen, it adds no proof; remove it.
- If removing the showcase changes no user decision, it was decoration; remove it.

## At-use permission fallback

Every showcase that leads to a system permission MUST define the skip path:

```text
Value shown:
User action:
Permission requested at:
On allow:
On skip / deny:
Re-entry point (in-feature, no re-prompt):
```

Rules:

- Value precedes the system prompt; never lead with the OS dialog.
- Skipping must leave the current flow fully usable; the capability is enhancement, never a blocker.
- The re-entry point lives inside the feature the capability serves (e.g. a "Add widget" row in settings or the relevant empty state), not in onboarding and not as a launch-time alert.
- Copy must state the concrete benefit ("Get rain alerts for your runs"), never the mechanism ("Enable notifications").

## Anti-patterns

Reject or challenge:

- upfront capability pile-up: watch app + widgets + Live Activity + notifications presented together before any user job;
- permission-first onboarding where OS dialogs precede any demonstrated value;
- generic "supercharge your experience" showcase copy with no named job;
- showcase as decoration: platform badges, device renders, or animation used to make onboarding feel premium;
- re-prompting a denied or dismissed capability on next launch or next onboarding run;
- showcasing a capability the empty state cannot yet populate (e.g. a Live Activity preview with no live data path defined);
- gating core onboarding completion on enabling an optional capability.

## Spec mapping (`ios-*` spec)

- `SCR` › Functional blocks: a capability showcase is a block (`SCR-NN.BNN`) of the screen whose job it serves — onboarding step, empty state, or feature detail — never to a standalone showcase screen. If the screen's goal (per `01-mobile-ux-principles.md` §Core questions) does not need the capability, the showcase has no home; remove it.
- `WF-SCR` › Interactions (placement / disclosure): placement follows progressive disclosure — deferred, contextual, single-item. Onboarding placement is allowed only when the step's task is the job the capability serves; otherwise disclose at first in-feature use, TipKit-style. Permission disclosure always happens at use, after value is shown.

## Checklist (advisory only — no gate)

Reviewer guidance; none of these items blocks approval alone:

- [ ] Each showcased capability maps to one real, established user job.
- [ ] Each showcase passes both showcase-vs-gimmick tests (real job + right moment).
- [ ] No screen presents more than one capability showcase.
- [ ] No upfront batching of capabilities before the underlying need is expressed.
- [ ] Permissions are requested at use, with value shown first.
- [ ] A skip/deny fallback keeps the flow usable and defines an in-feature re-entry point.
- [ ] Dismissed capabilities are never re-prompted at launch.
- [ ] Copy names the user benefit, not the platform mechanism.

## Expected agent output

When this reference is relevant, the agent should be able to produce at least:

```text
Capability:
User job served:
Placement (screen + functional block):
Disclosure trigger (WF-SCR interaction):
Permission point + fallback:
Gimmick-test result:
Unknown product decisions:
```

## Related references

- `01-mobile-ux-principles.md` §Non-negotiable rules for task clarity and recognition over recall.
- `02-mobile-screen-architecture.md` for state composition of onboarding and empty states.
- `00-perceptual-reasoning.md` for attention cost of added showcase content.
- `07-mobile-motion-microinteractions.md` for restrained motion in showcase moments.
- `12-creative-information-composition.md` for keeping showcase copy evidence-based.
