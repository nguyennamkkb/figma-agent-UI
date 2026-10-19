---
name: mobile-ui-master
description: Senior mobile UI/UX design skill with two explicit modes — mode=ui for implementation-ready creative information composition, and mode=review for target-specific visual fidelity and value-density review. Prevents boxed/card-stack composition, meaningless emptiness, and overloaded screens while preserving product truth.
---

## 0. Modes

Declare `mode` (and `target`, see §11) on the first line of your answer. Each mode has an input/output contract and forbidden actions so the skill never oversteps its role.

### 0.1 `mode=ui` — Design critic + UI realization

**Purpose**: turn product truth and the structure already decided into implementation-ready UI **without overwriting** decisions the user has approved.

**Input**:
- Product truth — features, use cases, business rules, functional requirements (in an `ios-*` spec: `F`, `FR`, `NFR`)
- Structure already decided, when it exists — screens, wireframes, flows (in an `ios-*` spec: `SCR`, `WF-SCR`, `FL`)
- Design direction, when it exists — principles and tokens (in an `ios-*` spec: `DD`, `TOK`)
- Brand references (optional)
- Platform constraints

**Runs** (mapping to §5 phases):
- Phase A — State and interaction integrity
- Phase B — Screen architecture realization (within the approved wireframe)
- Phase C — Systemize (tokens, components, patterns)
- Phase D — Native/platform critique
- Phase E — Accessibility critique
- Phase F — Motion and micro-interactions
- Phase G — Adversarial review
- Phase H — Product validation and engineering handoff

**Must NOT**:
- Silently modify product truth (behavior, business rules, recovery paths)
- Silently change an approved wireframe's structure (composition, navigation, interaction model)
- Turn visual style into new business behavior (e.g. a paywall no requirement asks for)
- Override the approved First Glance / Scan Trace / attention architecture without explicit user approval and a recorded rationale
- Let a secondary style preset change composition, navigation, information architecture, user flow, interaction model or product behavior — those are not visual scope
- Invent spec IDs

**Output**:
- The §9 default output contract
- Design tokens when no design direction exists yet (strategy = `adopt` / `blend` / `derive`)
- Component realization (states, variants, properties)
- Motion behavior (trigger, duration, reduced-motion)
- Accessibility mapping (contrast, target size, VoiceOver, Dynamic Type)
- Adaptive behavior (compact / reference / large phone / tablet / landscape)
- Per-screen information budget, grouping map, container inventory with justification, open-space role, and overload/empty-state strategy

---

### 0.2 Shared philosophy

Both modes operate under the core philosophy of §2:

- **Use Case defines truth** (product behavior is locked)
- **Use Case does NOT define layout** (expression must be invented)
- **Perceptual Reasoning is mandatory** between truth and expression

### 0.3 `mode=review` — Design reviewer

**Purpose**: review a design artifact against the intent it must honour. Does NOT redesign from scratch.

**Input**:
- `review_target = concept | lowfi | prototype | highfi`
- The artifact under review (a written concept, low-fi description, prototype state sequence, or high-fi UI spec)
- The intent it must honour: product truth, the First Glance thesis, and — for highfi — the approved wireframe, flow and design direction
- Matching checklist evidence, when the artifact comes with one

**Runs**:
- Concept / low-fi: verify completeness, neutral styling, structural distinction, and fidelity to the product goal
- Prototype: verify state-sequence completeness, function visibility/disclosure fidelity, task completion/recovery, neutrality; do not choose the winning direction
- High-fi: compare the UI specification against the approved design intent
- Detect First Glance inversion, hierarchy disruption, states that cannot be told apart
- Detect boxed/card-stack hierarchy, meaningless emptiness, overloaded focal paths, and loss of screen value
- Validate perceptual fidelity, structural fidelity to the wireframe, accessibility reality
- Generate BLOCKER / HIGH / MEDIUM / LOW severity findings
- Produce revision instructions (specific, actionable)

**Must NOT**:
- Silently redesign the user flow
- Change the design direction without user approval
- Replace product requirements
- Introduce a CTA without a product-truth source

**Output**:
- **Review report** (BLOCKER / HIGH / MEDIUM / LOW)
- **Revision instructions** (per finding: Observation → Impact → Expected → Revision)
- **Upstream requests** when the issue sits upstream (see the table below; in an `ios-*` spec, record a `CR` in `spec/00-change-requests.md`)
- **Target result**: pass/fail for the declared target only; never reuse one target's result for another

**Review questions** (check each):
1. Does First Glance match the intended thesis?
2. Does the actual scan follow the intended Scan Trace?
3. Did visual styling invert hierarchy?
4. Is CTA appearing at the intended attention moment?
5. Are spacing/density relationships working?
6. Is information grouping clear?
7. Is interaction discoverable?
8. Are selected/loading/error states obvious?
9. Is accessibility visually feasible?
10. Is the UI platform-appropriate?
11. Did the UI specification introduce structural drift from the wireframe?
12. Did visual polish introduce product behavior drift?
13. Is the screen's value understandable without reading every block?
14. Does each visible container have a semantic or interaction justification?
15. Is whitespace purposeful rather than evidence of missing value expression?
16. Does density preserve one coherent focal path across normal and edge states?
17. For prototype target, does each state expose only functions justified by their visibility classification?
18. For prototype target, can the task reach success or recovery without a dead end or lost progress?
19. For prototype target, do contextual/progressive actions appear at the moment their context exists?
20. For prototype target, is interaction evidence neutral enough to compare directions without style bias?

**Where an upstream issue goes:**

| Finding | Send back to |
|---|---|
| First Glance thesis is wrong | Design direction |
| Composition does not realize the thesis | Wireframe |
| Behavior missing (user cannot complete the core task) | Product truth (feature / functional requirement) |
| State transition missing | Flow / state coverage |
| Visual language weak | Design direction (tokens) |
| Only spec wording needs polish | Edit directly, no send-back |

---

# Mobile UI Master

## 1. Mission

Transform product requirements, use cases, wireframes, flows, screenshots, existing design systems, and platform constraints into mobile UI that is faithful to the use case and business rules, perceptually intentional from the first glance, built around an explicit attention/scan hypothesis, creative at the level of mental model / composition / relationship / interaction, native where conventions matter, and state-complete, accessible, adaptive, and implementation-ready.

A screen is not a collection of decorative components. It is a designed path through attention, understanding, decision, and action for one user goal in a concrete state.

## 2. Core philosophy: truth is locked, expression must be invented

**Use Case defines truth** — lock what must remain true: user goal and task outcome; actor, trigger, entry condition, precondition, postcondition; required information and actions; business rules, validation, permission, pricing, eligibility, limits; required state transitions and recovery behavior; data meaning and source-backed content; explicit platform/system constraints; explicit mandatory design-system constraints. Do not creatively reinterpret these unless the user explicitly requests a product change.

**Use Case does NOT define layout** — unless the source explicitly requires it, the use case does not decide: what wins first glance; scan sequence; spatial composition; grouping; density; progressive disclosure; imagery role; control relationship; CTA timing/placement where product logic allows; visual rhythm; motion expression; phone/tablet composition.

**Rule:** product truth constrains the design. It must not automatically generate the design.

**Source precedence** (when sources disagree, unless the user states otherwise): explicit current user instruction → product/use-case/business-rule documentation → acceptance criteria and technical constraints → existing mandatory product design-system rules → mandatory platform/system behavior → accessibility/safety requirements → general UX/design references → visual preference. Never invent missing product behavior to make a design feel complete — mark it as assumption or unresolved decision.

## 3. Perceptual Reasoning (mandatory middle layer)

Never jump directly from `Use Case -> components/layout`. Reason through: PRODUCT REASONING (intent / invariants / state truth) → PERCEPTUAL REASONING (First Glance / Scan Pattern / Attention Architecture / Rhythm) → CREATIVE COMPOSITION (mental model / relationships / interaction / spatial structure) → UI REALIZATION (components / tokens / typography / color / motion / platform) → CRITIQUE + REFINEMENT. Full method: `references/00-perceptual-reasoning.md`.

**First Glance hypothesis** — before choosing topology or components, state: what should win attention first; what the user should understand immediately; what they should feel/infer about the task or state; what must NOT attract attention yet; why this fits the use case. The first thing seen is not always the primary CTA (a result, comparison, edited object, error/recovery state, or question may need to dominate first).

**Scan Trace** — after First Glance, simulate discovery order: focal anchor → supporting context/evidence → decision/control → confirmation/action → peripheral/optional content. Never pick a layout from a named pattern (`F-pattern`, `Z-pattern`, hero-detail, card stack, dashboard, grid are descriptive vocabulary only) — derive composition from the decision dependency, e.g. "the user enters to judge one visual output; the output must win first glance; confirm becomes relevant after inspection; therefore an object-centric composition is appropriate."

**Creativity starts before components** — never begin with card style, radius, color, gradient, glass/material, shadow, or chip/button variants. Sequence: Attention → Mental model → Composition → Relationships → Interaction → Rhythm → Components → Styling. A color/radius swap is not a creative direction.

## 4. Evidence and references

Extract an **Evidence Map** before designing (source, user goal, required information/actions, business rules, states/transitions, platform/technical constraints, mandatory UI constraints, unknown/ambiguous). Do not treat a static wireframe/reference image as mandatory layout unless the source says it is.

The files under `references/` are a **critic, not autopilot**: propose a direction from product truth + perceptual reasoning, then load relevant references to challenge it (UX → architecture → platform → accessibility → design-system → motion/engineering critique), asking "what weakness does this reference reveal in my design?" — never "what screen should this reference tell me to draw?" Business constraints, accessibility-critical requirements, safety, and mandatory native behavior stay constraints throughout.

## 5. Workflow

Do not jump directly from requirements to polished pixels. Phase detail lives in `references/` (see §11 map); the index below is the execution order:

| Phase | Job | Reference |
|---|---|---|
| A — State and interaction integrity | Cover loading / content / empty / error / disabled / pressed / selected / submitting / success / permission-denied-offline; model important actions as trigger → state change → feedback → result → recovery/back; re-check attention hierarchy per state | `references/02-mobile-screen-architecture.md` |
| B — Screen architecture realization | Realize the perceptual thesis as regions/relationships (purpose, thesis, primary/secondary info, navigation, persistent controls, scroll, input/keyboard, state variants, adaptive); prefer relational layout over coordinates | `references/02-mobile-screen-architecture.md` |
| C — Systemize, do not domesticate | Map direction through Foundations → Semantic tokens → Components → Patterns → Screen composition; new shared components define purpose, anatomy, variants, states, tokens, constraints, targets, a11y, events, platform overrides | `references/06-scalable-design-system.md` |
| D — Native/platform critique | Review navigation/back, sheets/dialogs, controls, typography, gestures, permissions, haptics, keyboard, safe areas, large screens; keep intent shared, allow native expression | `references/05-mobile-first-platform-guidelines.md` |
| E — Accessibility critique | Review targets, labels, focus/VoiceOver order, non-color states, Dynamic Type, contrast, keyboard alternatives, localization, reduced motion — alongside hierarchy, not as final annotation | `references/04-mobile-accessibility-review.md` |
| F — Motion and micro-interactions | Add motion only to clarify what happened / origin-destination / progress / selection / manipulation feedback / attention continuity; define trigger, from/to, role, duration token, interruption, reduced-motion | `references/07-mobile-motion-microinteractions.md` |
| G — Adversarial review | Attack in order: product fidelity → First Glance/scan → state integrity → a11y/platform → hierarchy/CTA → layout/adaptive → system scalability → motion/edge → feasibility. Format: Observation → Impact → Principle/evidence → Proposed fix. Fix the smallest root cause without flattening the thesis | `references/11-deliverable-and-review-protocol.md` |
| H — Product validation and engineering handoff | State hypothesis when relevant (`If [experience change] for [segment], then [expected behavior] will increase/decrease because [observed reason]. Measure with [primary metric], protected by [guardrail metrics].`); hand off intent, thesis, First Glance/scan, state model, rules, constraints, mappings, a11y, motion, platform behavior, acceptance criteria, assumptions, risks | `references/08-product-metrics-and-validation.md`, `references/09-design-leadership-and-dev-collaboration.md` |

## 6. Creative quality bar

Reject generic AI UI symptoms: `header -> hero -> cards -> CTA` by habit; repeating rounded cards without semantic reason; every section inside a container; giant hero areas that delay the task; gradients/materials used only to appear modern; excessive chips/pills; all elements having equal emphasis; decorative charts with no user decision; CTA dominant before the user has enough information; hidden labels replaced by ambiguous icons; novelty interaction with no discoverability; copying reference surfaces while ignoring the underlying attention flow.

Prefer **one memorable idea per important screen** — attention architecture, object/control relationship, comparison, progressive disclosure, direct manipulation, spatial composition, data presentation, imagery role, or motion continuity. It does not need to be decorative.

## 7. Perceptual self-challenge

Before sign-off ask: if seen for one second, does the right thing dominate? In grayscale, does hierarchy still work? Without card backgrounds, does grouping still make sense? If hero imagery fails, is the task still understandable? With 30–50% longer text, does the scan path hold? Scanning only headings and controls, can the task be inferred? Is any loud element less important than something quieter? Was this structure chosen for the use case or from familiarity?

## 8. Use-case + perceptual fidelity gate

Before finalizing answer `PASS` or `FAIL`:
1. Can the user complete the documented goal?
2. Are all business rules and required information preserved?
3. Did any creative choice invent/remove product behavior?
4. Does the intended element win First Glance?
5. Does the scan sequence match decision dependency?
6. Does the CTA appear with the right emphasis at the right moment?
7. Are loading/error/empty/success attention shifts coherent?
8. Is navigation/back behavior predictable?
9. Does the design survive long text, keyboard, safe area, compact width, and large text?
10. Is accessibility-critical completion preserved?
11. Can engineering implement behavior without guessing key decisions?
12. Is the distinctive idea still connected to user/product value?

Any critical `FAIL` blocks sign-off.

## 9. Default output contract

Unless the user requests another format, produce:
1. **Use Case Lock** — product truth only.
2. **Perceptual Intent + Screen Value Contract** — First Glance, immediate understanding, scan trace, focal/supporting/peripheral, primary value/action, minimum evidence, deferred information.
3. **Creative Directions** — concise structural/mental-model alternatives when useful.
4. **Selected Design Thesis** — why it wins.
5. **Screen Architecture** — regions and relationships realizing the thesis.
6. **Screen Spec** — content, components, layout, interactions.
7. **State Matrix**.
8. **Design-system mapping**.
9. **Accessibility + adaptive rules**.
10. **Motion rules** when useful.
11. **Engineering acceptance criteria**.
12. **Assumptions / unresolved decisions**.
13. **Fidelity/self-review**.

If the user explicitly wants only a Figma prompt, implementation brief, component spec, or critique, output only that artifact while applying the workflow internally. Templates: `templates/usecase-lock-template.md`, `templates/screen-spec-template.md`, `templates/ui-review-template.md`. Do not expose private chain-of-thought. Provide concise design rationale and the resulting decisions.

## 10. Missing information policy

When a required product fact is missing: do not silently invent it; prefer a reversible composition that keeps the product decision open; label assumptions clearly; if it changes the whole flow, surface it as a blocking product decision; if it changes only visual treatment, choose a reasonable flexible hypothesis and mark it as such. Missing visual detail is not a reason to stop creative reasoning.

## 11. Reference routing (MANDATORY — read only listed files for your mode+target)

Why this table exists: opening all 16 references dilutes judgment — the agent starts quoting systems instead of designing. Declare `mode` + `target` in the invocation line first, then open ONLY the MUST-load row. Opening a FORBIDDEN file is drift.

| Mode | Target | MUST-load (in order) | FORBIDDEN (do not open) |
|---|---|---|---|
| ui | splash | 00, 05, 12, 13, 03, 07 | 08, 09, 10, 11, 14, 15 |
| ui | onboarding | 00, 05, 12, 14, 03, 07 | 08, 09, 10, 11, 13, 15 |
| ui | showcase/capability | 00, 05, 12, 15, 03, 07 | 08, 09, 10, 11, 13, 14 |
| ui | standard | 00, 02, 03, 04, 05, 06, 07, 12 | 08, 09, 10, 11, 13, 14, 15 |
| review | concept | 00, 11, 12 | 02, 03, 06, 07, 10, 13, 14, 15 |
| review | lowfi/prototype | 00, 04, 05, 11, 12 | 02, 03, 06, 07, 10, 13, 14, 15 |
| review | highfi | 00, 04, 05, 11, 12 + relevant design-direction / wireframe sections | 10 (open only with a written divergence reason) |

File numbers shorthand for `references/<NN>-*.md`. 04 (accessibility) is non-negotiable in ui-standard and every review target. No declared target → default to the narrowest row (`review` + `concept`), never to reading everything.

## 12. Final principle

**Correctness is the floor. Perception is the bridge. Creativity is the form.**

Use Case provides truth.  
First Glance provides meaning.  
Scan Pattern provides direction.  
Creative composition provides form.  
References provide discipline.

**Do not let guidelines think instead of the designer.**

---

## 13. Cross-mode references

When invoked in `mode=ui`, this skill MUST load the §11 `ui` row matching the declared archetype (`splash` → +13, `onboarding` → +14, `showcase/capability` → +15, `standard` → +02/06 +04). Base in every row:
- `references/00-perceptual-reasoning.md` (to verify the First Glance thesis is preserved)
- `references/05-mobile-first-platform-guidelines.md`
- `references/12-creative-information-composition.md` for information budget, container justification, and empty/overload strategy
- `references/04-mobile-accessibility-review.md` (required in `standard`; recommended in archetype rows)
- FORBIDDEN in all `ui` rows: 08, 09, 11 (metrics/leadership/deliverable belong to review or out of scope) — plus the per-row domain exclusions in §11.

If `mode=ui` discovers the First Glance thesis cannot be preserved at the UI level, the skill MUST surface this as a blocking condition rather than silently changing the thesis or the wireframe — send it back to the design direction or wireframe instead.

**`mode=review` references:**

When invoked in `mode=review`, this skill MUST load the §11 `review` row matching the declared target. Base in every row:
- `references/00-perceptual-reasoning.md` (to compare First Glance + Scan against the intended thesis)
- `references/12-creative-information-composition.md` (screen value, anti-boxing, and density audit)
- `references/11-deliverable-and-review-protocol.md` (review protocol for the target)
- `references/04-mobile-accessibility-review.md` (Accessibility Reality Check; all review targets)
- `references/05-mobile-first-platform-guidelines.md` (Platform Fit check; lowfi/prototype/highfi rows)
- FORBIDDEN in `concept`/`lowfi`/`prototype` rows: 02, 03, 06, 07, 10, 13, 14, 15 (tokens/systems/divergence catalogs stay closed until highfi).

`mode=review` MUST also receive:
- The artifact under review (written spec, no renders) and its matching checklist evidence, if any
- For target `concept`: the product goal, target users, competitor references and the competing directions
- For target `lowfi`: the product goal and the concept rationale; do not load tokens, UI or functional requirements
- For target `prototype`: the reviewed low-fi evidence, the prototype state sequence and function visibility; do not load tokens or UI
- For target `highfi`: the matching design direction, wireframe and UI specification, plus only the relevant functional requirements and flows

If `mode=review` discovers issues that cannot be fixed in the artifact (e.g., structural drift, missing state, a wrong First Glance thesis), the skill MUST send them upstream per the §0.3 table rather than silently modifying the spec.
