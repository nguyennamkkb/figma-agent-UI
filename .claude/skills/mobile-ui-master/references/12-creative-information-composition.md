# Creative Information Composition and Screen Value Density

## Purpose

Use this reference after Product Truth and the initial perceptual hypothesis are known, but before content is turned into cards or components. It prevents two common failures:

- **boxed composition** — every information group becomes a rounded container, producing card-in-card hierarchy;
- **value imbalance** — a screen feels empty because its value is not expressed, or overloaded because several decisions are compressed into one viewport.

The goal is not to fill space. The goal is to make the screen's value, evidence, and next action legible through relationships, sequence, scale, alignment, proximity, and purposeful visual carriers.

## 1. Screen Value Contract

Before choosing regions or components, state:

```text
Screen value: What useful understanding, progress, or outcome does this screen deliver?
Primary meaning: What must the user understand first?
Primary decision/action: What decision or action belongs here now?
Minimum evidence: What must be visible before that decision is safe?
Supporting context: What helps but must not compete?
Deferred content: What can appear later, on demand, or on another screen?
Memorable carrier: What content-led device makes the value immediately tangible?
```

If the value cannot be expressed in one sentence, the screen probably mixes goals or lacks a clear job.

## 2. Information Budget

Budget attention, not item count.

- **Focal**: one dominant meaning, object, state, or decision.
- **Supporting**: only the evidence required to understand or trust the focal value.
- **Contextual**: content shown near the moment it becomes useful.
- **Deferred**: detail that remains accessible without occupying the primary scan path.
- **Suppressed**: content that must not compete in the current state.

Required information must remain available before the decision that depends on it. Progressive disclosure is not permission to hide product truth.

### Under-filled screen

First distinguish a true empty state from an under-designed normal state.

- A true empty state explains what is absent, previews the value when useful, and offers a safe next action.
- A normal state with little content should strengthen the focal object, outcome preview, direct manipulation, contextual education, or next meaningful action.
- Do not add decorative cards, metrics, tips, or duplicated copy merely to occupy space.
- Whitespace must have a role: isolate the focal value, create pacing, reserve an interaction area, or signal completion.

### Overloaded screen

When a screen contains too much information:

1. Identify whether several independent user goals are competing.
2. Keep information required for the current decision visible.
3. Summarize repeated detail and reveal it contextually.
4. Use comparison, sequence, timeline, or spatial grouping when those relationships are the actual meaning.
5. Split the flow only when the content belongs to a different decision or outcome.

Dense does not mean cramped. Sparse does not mean empty.

## 3. Compose Relationships Before Containers

Choose the relationship that communicates the information:

- sequence or narrative progression;
- comparison on aligned attributes;
- cause and effect;
- object with controls attached to the object they affect;
- timeline or progression;
- spatial/canvas relationship;
- editorial hierarchy using type, rhythm, imagery, and open space;
- data visualization tied directly to a decision;
- progressive reveal matching the user's decision sequence.

Only after the relationship works should components be assigned.

### Container Justification Test

A visible container is justified when it provides at least one concrete function:

- independent interaction or selection boundary;
- repeated comparable unit;
- persistent state/status boundary;
- draggable, collapsible, removable, or independently navigable object;
- necessary surface separation from background/content behind it.

If grouping remains clear through proximity, alignment, type hierarchy, divider, background field, or whitespace, remove the container.

### Boxed-composition failures

- wrapping every heading + paragraph pair in a card;
- nesting decorative cards inside a parent card;
- giving unrelated regions identical rounded rectangles and equal visual weight;
- using a card stack as the default answer before information relationships are known;
- turning the whole screen into a dashboard when the user has one primary task;
- using empty containers as spacing devices.

## 4. Creative Information Carriers

Select at most one dominant carrier per important screen, derived from its product value:

- the primary object itself becomes the navigation or decision anchor;
- an outcome preview demonstrates value before controls;
- a comparison surface aligns meaningful differences;
- an editorial opening establishes meaning, followed by a quiet task path;
- inline controls appear beside the content they change;
- a timeline or progress path communicates sequence;
- a visualization turns data into a decision;
- a spatial canvas mirrors the user's mental model;
- progressive reveal follows uncertainty reduction.

These are prompts for reasoning, not layout presets. Supporting UI should remain quieter than the carrier.

## 5. Mode Responsibilities

### Wireframe / structural realization

- Commit the information budget, grouping map, container justifications, open-space role, and overload strategy.
- State the relationships in prose ("the total sits above the list because the decision depends on it") — no ASCII drawings, visual tokens or default card wrappers.
- Stress-test normal, empty, loading, error, returning, and power-user density.

### `mode=ui`

- Preserve the approved value contract and structural grouping.
- Use typography, scale, alignment, imagery, color, motion, and whitespace as hierarchy tools before adding surfaces.
- Audit every visible container and remove decorative nesting.

### `mode=review`

- Compare the rendered screen with the Screen Value Contract.
- Flag lost value, boxed hierarchy, meaningless emptiness, overloaded focal paths, and premature disclosure.
- A polished render does not pass when the primary value or action is obscured.

## 6. Required Output per Screen

```text
Screen value sentence:
Primary meaning and action:
Minimum evidence visible now:
Supporting and deferred information:
Dominant information carrier:
Grouping map and relationship type:
Container inventory with justification:
Open-space role:
Overload / long-content strategy:
Empty-state value and next action:
```

## 7. Gate

Fail the design when any of these remain unresolved:

- the screen's value cannot be stated clearly;
- multiple competing primary decisions have no deliberate sequence;
- required evidence appears after the decision that needs it;
- every information group is expressed as the same container pattern;
- decorative card nesting is the main hierarchy mechanism;
- the normal state is empty because value expression is missing;
- the empty state has neither useful explanation/value preview nor a next action;
- density hides the focal meaning, primary action, recovery, or state change;
- whitespace or decoration occupies space without an attention/task role.

Pass only when value is legible, density is intentional across states, and containers are consequences of semantics rather than the default composition language.
