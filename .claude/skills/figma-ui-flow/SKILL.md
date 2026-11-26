---
name: figma-ui-flow
description: Everything for building UI in Figma with the figma-agent MCP — the process (11 rules, 8 stages with approval gates, a three-pass outside-in screen build loop, Definition of Done), the standards (files and naming, tokens and components, CTA) and the manual for every figma-agent tool (render_tree, update_nodes, get_node, screenshot, audit_design, stress_test, import_tokens, create_component_set, bind_variables, copy_nodes, execute_code…), plus troubleshooting and a traps log. Use it whenever a figma-agent tool is about to be called, even for one small edit, and whenever the user wants to design or build screens, flows, a design system or components, clean up or QA a file, hand off, or hits a plugin error — e.g. "vẽ màn hình", "thiết kế paywall", "file Figma lộn xộn", "sửa màu layer", "chỉnh spacing", "xoá layer", "plugin báo lỗi". Specialised flows (screen-from-image, ui-visual, app-redesign, ads-board, lottie-motion) use their own skill and come here for mechanics.
---

# figma-ui-flow — process, standards and tools for UI in Figma

One skill answers four questions, in this order: **what to do and in which order** → **to what standard** → **with which tool** → **what to do when it breaks**. One standard, two executors:

- **Agent mode** — a Figma write tool is available (`figma-agent` or the remote Figma MCP): the agent reads and writes the canvas itself according to this standard.
- **Designer mode** — no MCP, or the user wants to do it themselves: the agent outputs **step-by-step instructions**, checklists, and token/naming tables for the person to follow (`references/tools/remote-figma-mcp.md` §6).

Let `SKILL_DIR` be the directory containing this file. Do not read everything at once: start from one of the two doors below and read only the files it names.

## Quick path — one small edit (no stages)

"Change this colour", "move that", "delete these layers", "screenshot the frame": the 8 stages do not apply.

1. `figma_status`; several files open → pass `file` to every call; a ⚠️ `versionCheck` → `references/tools/connect.md` §1.
2. Find the node: `get_selection`, `find_nodes{name|text}` or `get_node{ids, depth}`. Keep every id; ids are the only state between calls.
3. Pick the tool: dedicated tool → `render_tree` / `update_nodes` → `execute_code` last (`references/tools/tool-reference.md` §0).
4. Write, then read the numbers back (the write's `bounds` or `get_node`); screenshot only if the edit is visual. Failed write → `safeToRetryWithoutCanvasRead` decides (`references/knowledge/troubleshooting.md` → Errors and retries).
5. Never delete or overwrite what the user made without asking.

## Words that set the scope

- "theo phong cách / theo mẫu / giống màn X / theo style vừa tạo" about a **screen** = its layout patterns, component anatomy, imagery, density **and** tokens → rebuild (L3), not a recolour.
- "đổi màu / đổi tông / đổi theme / chỉ màu" = tokens only (L1).
- "phong cách" about a whole app with no reference screen = visual direction → `style-direction`.
Full table and levels: `references/process/rework-after-reference.md` §1.

## Door 1 — by task

| Task | Read, in this order |
|---|---|
| Rework an existing screen after another screen or style ("sửa màn này theo phong cách/mẫu ở trên") | `references/process/rework-after-reference.md` → `build-loop.md` → `references/knowledge/traps.md` §4 |
| Draw a new screen (file has a system) | `references/process/build-loop.md` → `references/tools/render-tree-dsl.md` → `references/knowledge/traps.md` |
| New project from scratch | the 8 stages below, from Stage 1; per stage the tool calls are in `references/process/stage-recipes.md` |
| Design system: tokens, styles, components | `references/standards/design-system.md` → `references/process/stage-recipes.md` (Stages 2–3) → `references/tools/execute-code.md` when no tool fits |
| Buttons and CTAs | `references/standards/cta-playbook.md` |
| Page structure, naming, flow Sections, grids, ad slots | `references/standards/file-standards.md` |
| Explore directions, critique, motion | `references/process/creative-process.md` (style from a reference → `style-direction`) |
| Why this screen, screen contract, monetization | `references/process/decision-playbook.md` |
| QA, accessibility, handoff | `references/process/handoff-qa.md` |
| A flow of 15+ frames with subagents | `references/process/flow-with-subagents.md` |
| Copy screens from another Figma file, exactly | `references/tools/copy-between-files.md` |
| Only the official Figma MCP (`use_figma`) is connected | `references/tools/remote-figma-mcp.md` |
| Open files / plugin from the OS (only when the user asks) | `references/tools/desktop-flow.md` + `scripts/figma-desktop.sh` |
| Skill assessment, learning Figma | `references/process/skill-ladder.md` |
| Redraw screens from a picture · a banner or popup visual · restyle an app · ads board · Lottie | skills `screen-from-image` · `ui-visual` · `app-redesign` · `ads-board` · `lottie-motion` |

## Scripts and assets

| When you need | Use |
|---|---|
| Check a token JSON file (names, aliases, contrast) | `scripts/check_tokens.py` |
| Brief template / QA report template | `assets/brief.template.md`, `assets/qa-report.template.md` |
| Flow Section (title bar + frame) / reviewer note / text flow | `assets/flow-section.render-tree.json`, `assets/note.render-tree.json`, `assets/flow.render-tree.json` |
| Cover page / screen frames per device | `assets/cover.render-tree.json`, `assets/frames/<device>.render-tree.json` |
| Two-level token JSON template with Light/Dark (theme = Both; for a single theme keep only that mode's key) | `assets/tokens.example.json` |
| Open a file or the plugin from macOS (only when the user asks) | `scripts/figma-desktop.sh` |

Do not read everything at once. Each stage below states which file it needs.

## Door 2 — by symptom

| You see | Read |
|---|---|
| An error message from a tool | `references/knowledge/troubleshooting.md` only: search the message text; a matching row is the answer, open another file only if the row links to it |
| `files: []`, ⚠️ `versionCheck`, `Unknown command`, time-outs | `references/tools/connect.md` + `references/knowledge/troubleshooting.md` → Connection and versions |
| Wrong size: a frame hugged, text overflows or clips, a footer floats | `references/tools/render-tree-dsl.md` §4 → `references/process/build-loop.md` §3 |
| Wrong colour, a recoloured icon, a flat pattern, a missing image edge, an onboarding hero fade | `references/knowledge/traps.md` |
| A reworked screen came back as the old screen recoloured | `references/process/rework-after-reference.md` + `references/knowledge/traps.md` §4 |
| `audit_design` finding that looks wrong | `references/knowledge/troubleshooting.md` → Audit false positives |
| `execute_code` hangs or throws | `references/tools/execute-code.md` §0 + `references/knowledge/troubleshooting.md` → Plugin API |
| What the plugin cannot do (publish, Code Connect, multi-mode on free plan) | `references/tools/connect.md` §3 |

## How the knowledge is kept

| Layer | Folder | Holds |
|---|---|---|
| Process — what, in which order | `references/process/` | build loop, stage recipes, subagents, decisions, creative, QA and handoff, skill ladder |
| Standards — to what bar | `references/standards/` | file and naming, design system, CTA |
| Tools — how | `references/tools/` | connect, tool reference, render_tree DSL, execute_code, copy between files, remote MCP, desktop flow |
| Knowledge — when it breaks | `references/knowledge/` | troubleshooting (error → fix), traps (learned on real builds) |

- **One home per fact.** Other files keep a one-line summary and a link to the home, so a skim still gives the point and an edit happens in one place.
- **Each fact has a kind and a shape:** rule (must / never + why), default (X unless Y), procedure (steps with gates), recipe (copyable JSON or JS), trap (symptom → cause → fix, with date and where seen), lookup (table).
- **New lessons go to `references/knowledge/traps.md` first**, in the trap shape. Met a second time → promote it to a rule in the right layer and leave the trap line pointing there. Nothing is deleted.
- Images are generated through gemini-image-mcp or muse2api; when both are on, ask the user which one before the task (`asset-generator` → "Image MCP").

## Theme scope — Light, Dark, or Both (decided once, in the brief)

Drawing a second theme roughly doubles colour, QA and review work, so the theme is a **brief decision, not a default**. Before any token or screen work, the user picks one of:

| Choice | Semantic colour collection | Screens drawn | Checks |
|---|---|---|---|
| **Light only** | 1 mode named `Light` | Light only | contrast in Light |
| **Dark only** | 1 mode named `Dark` | Dark only | contrast in Dark |
| **Both** | 2 modes `Light` + `Dark` (needs a paid Figma plan; the free plan allows 1 mode) | built in the **primary** theme; the other theme is a mode switch on a copy at the end, never redrawn | contrast + `stress_test` in both modes, mode-switch QA |

Rules:
- Ask it in Stage 1 together with the other brief questions; record it on the brief's **Theme** line. If the user does not answer, use the theme of their reference image, else **Light only**, and say so.
- **Sketch** mode never asks: it uses the reference's theme, else Light.
- Single theme: no Dark/Light variants, no theme states, no mode checks — skip every step below marked *(Both only)*. Still bind every colour to Semantic tokens, so adding the second theme later is just adding a mode and filling its values.
- **Both:** pick the primary theme (the one most users see first). Build, review and reach DoD in the primary theme; add the second theme after Stage 4's direction is approved, by filling the second mode's values and switching `variableModes` on a copy of each finished screen. Never duplicate screens to repaint them by hand.
- Changing the choice later: single → Both = add a mode and fill values; Both → single = delete the unused mode. Neither requires redrawing.

**Platform knowledge in other skills** — load it when the screen belongs to that platform; do not copy it here:

| Need | Skill |
|---|---|
| Touch targets, states, feedback, sheet/dialog/snackbar, thumb zone, gestures | `mobile-ux-fundamentals` |
| Layout, information density, avoiding card stacks/meaningless emptiness, visual review | `mobile-ui-master` |
| iPhone / iPad / Watch / Widget per HIG | `apple-design-iphone`, `apple-design-ipad`, `apple-design-watch`, `apple-design-widget` |
| Visual style from a named style, reference image or brief; reliable DNA extraction; iOS + Android mapping | `style-direction` |
| Redraw screens from an image (screenshot, Dribbble shot, mockup) fast, first screen approved before the rest | `screen-from-image` |
| Prompts for illustrations, hero images, backgrounds; transparent cut-out assets | `asset-generator` |

## 11 core rules (they override any personal habit)

1. **No raw values.** Color, font size, spacing, radius, and shadow are always bound to a variable or style. A hand-typed hex code in a layer is a defect.
2. **Auto Layout by default.** Every frame that holds content uses Auto Layout; free positioning is only for decoration, background images, and overlays — and those are clearly named `decor/…`.
3. **Search before you create.** Before drawing an element, search the library (agent: `search_design_system`). Create something new only when you are sure it does not exist.
4. **Meaningful names, no default names.** No `Frame 12`, `Rectangle 4`, `Group 7` in anything handed off.
5. **Semantics first, values second.** Tokens are named by role (`color/text/primary`), not by value (`blue-500`) — except at the primitive level.
6. **Explore wide before going deep.** Every creative problem gets at least 2–3 genuinely different directions before one is polished.
7. **Every state is drawn.** Default, pressed, disabled, loading, empty, error, long content, large text — in the themes chosen in the brief (see *Theme scope*), and only those.
8. **Keep draft and approved areas separate.** Explore and stress-test on `06 · Explore (WIP)`; only approved screens live on `05 · Screens & Flows`, marked Ready for dev per flow Section; rejected work moves to an `Archive · …` Section in `06`.
9. **Non-destructive.** The agent does not delete or overwrite the user's work; edit on a copy or branch, and confirm before changing anything out of scope.
10. **Check numbers every write, eyes every pass.** After every write, read back sizes (`get_node`): fixed sizes kept, children fit, FILL/HUG as planned. At the end of each pass, screenshot the screen and compare it with the intent; screenshot an individual block only when it is visually unusual. Never report "done" without looking.
11. **One screen at a time, outside-in, in three passes.** Pass 1 Layout (frame + regions + sized placeholder blocks, locked while empty) → Pass 2 Fill (components first, then content by cluster) → Pass 3 Lock (audit + stress → DoD). Pick the mode first: Sketch, From template, or New build. Start the next screen only once the current one meets the Definition of Done. Details: `references/process/build-loop.md`.

## The 8-stage process

Not every task runs all 8. Determine the entry point in Stage 0, then run from there. There is a **human approval gate** after Stages 1, 4, and 7.

### Stage 0 — Intake and orientation

1. Determine the mode: does the session have a Figma write tool — the remote Figma MCP (`use_figma`, `get_metadata`…) **or** `figma-agent` (`figma_status`, `render_tree`, `search_design_system`…)? Yes → Agent. With `figma-agent`: read `references/tools/connect.md`, call `figma_status` and resolve any `versionCheck` warning before starting; the tool for each stage is in `references/process/stage-recipes.md`, for each pass in `references/process/build-loop.md` §13. No tool → Designer (same process, the output is instructions). If the user wants Agent mode but the tools are missing: say clearly that they need to open the figma-agent-UI plugin (or connect the remote Figma MCP), then continue in Designer mode.
2. Classify the request and choose the entry point:

| Request | Start at |
|---|---|
| New project from scratch | Stage 1 |
| "Clean up / standardize this file" | Stage 7 (audit) → back to Stages 2–3 to fix |
| Create a design system / library | Stage 2 → 3 |
| Draw a new screen in a file that already has a system | Stage 5 |
| Rework an existing screen after a reference screen | Stage 5 with `references/process/rework-after-reference.md` |
| "Find ideas / make it prettier / more creative" | Stage 4 |
| Prototype, animation | Stage 6 |
| Developer handoff | Stage 7 → 8 |
| Skill assessment / learning Figma | `references/process/skill-ladder.md` |

3. Agent: read the file structure first (pages, top-level frames, existing design system) to know what the file contains. Do not guess.

### Stage 1 — Brief and file foundation → *gate*

Read `references/standards/file-standards.md` and `assets/brief.template.md`.

1. Lock a minimal brief: product, users, **platform (iOS / Android / Both / Web)**, **theme (Light only / Dark only / Both — see *Theme scope*)**, business goal (priority now, aha moment, monetization, one metric + guardrail — `references/process/decision-playbook.md`), constraints (existing brand, deadline, accessibility), success criteria. Ask about anything missing — at most 3–4 questions, batched in one message; the platform and theme questions are always among them unless the user already said it. **Both platforms:** one shared token set and component library; design the primary platform first and redraw only screens whose patterns differ in an `Adaptive · Android` (or `Adaptive · iOS`) Section — see `style-direction/references/platform-mapping.md`.
2. Set up the file skeleton with the 7 standard pages — `🏠 Cover`, `01 · Foundations`, `02 · Components`, `03 · Templates`, `04 · Assets`, `05 · Screens & Flows`, `06 · Explore (WIP)` — build the cover from `assets/cover.render-tree.json` (parts to replace: `references/standards/file-standards.md` §1.3) and put the brief as a `Brief · <Product>` frame next to it. Name every Section and screen per `references/standards/file-standards.md` §2.2 (`FL-NN · <Flow>`, `SCR-NN · <Screen> · <State>`).
3. **Gate:** present a one-page brief + the file skeleton. Wait for the user's confirmation before continuing.

### Stage 2 — Foundations

Read `references/standards/design-system.md` sections 1–4.

1. Variables in 3 levels: **Primitives** (raw palette, number scales) → **Semantic** (roles; modes = the brief's theme choice: 1 mode for a single theme, `Light` + `Dark` for Both) → **Component** (only when truly needed).
2. Typography scale, spacing scale (4/8 grid), radius, elevation, motion tokens.
3. Set `scopes` on each variable so it only appears where it applies.
4. If tokens exist as JSON: run `python3 SKILL_DIR/scripts/check_tokens.py <file.json>` and fix every error before continuing.
5. Build a Foundations page that visualizes every token (swatches, type specimen, spacing ruler).

### Stage 3 — Components

Read `references/standards/design-system.md` sections 5–8. When the component is a button or CTA, also read `references/standards/cta-playbook.md` — class before look, effects per class, no per-instance overrides.

1. Build order: atoms (icon, text, divider) → basic elements (button, input, chip, avatar) → composites (card, list row, nav bar, tab bar, sheet).
2. Each component: clear anatomy, correct Auto Layout, 100% token binding, component properties instead of redundant variants, all states, a description and documentation link.
3. Name variants as `Property=Value`. Name properties consistently across the whole library.
4. Build a "Playground" page to test each component: stretch it, long text, change sizes, switch modes *(Both only)*.

### Stage 4 — Creative exploration → *gate*

Read `references/process/creative-process.md`. When the user names a style, gives a reference image, or asks for "a style" for the app, run the **`style-direction`** skill for this stage: it measures the reference's DNA with confidence levels, proposes Safe / Balanced / Bold directions valid on every target platform, and returns a Style brief + `tokens.json` that feed back into Stage 2.

1. Gather references and build a moodboard annotated with "what to take from this".
2. Diverge: create **2–3 genuinely different directions** (different in concept, not just color), each applied to the same 1–2 "key" screens.
3. Each direction comes with: a name, a one-sentence idea, strengths, risks, who it suits.
4. **Gate:** stop for the user to choose or mix. This is the most expensive decision to get wrong — do not choose on their behalf.
5. Converge: turn the chosen direction into rules (update tokens and components), and only then polish.

### Stage 5 — Build screens (the outside-in loop)

Read `references/process/build-loop.md` — **mandatory** for every screen.

1. **Pick the mode:** **Sketch** (quick idea, Stage 4), **From template** (a similar screen exists: clone and edit what differs), **New build** (complex, no template), **From a reference image** (recreate a screenshot or shot: the `screen-from-image` skill). First screen of a set = New build, the rest = From template.
2. **Pass 0 Prepare:** the screen contract (`references/process/decision-playbook.md`: purpose, entry → exit, one primary action, information order, states), real content, a region map down to block sizes, which blocks repeat (→ components), images generated up front.
3. **Pass 1 Layout (1–2 writes):** start from `assets/frames/<device>.render-tree.json` (`references/standards/file-standards.md` §4.3) — root frame at the platform size + named regions + **sized placeholder blocks** carrying their final Auto Layout. Numeric check, then one screenshot: the screen should already read as the final layout in grey boxes.
4. **Pass 2 Fill:** components first for anything repeated ≥ 3 times (Stage 3), then fill placeholders **by cluster** (several blocks per write) and add real text, icons, images in batches. Numeric check after each write; one screenshot at the end of the pass, extra ones only for unusual blocks.
5. **Pass 3 Lock:** audit + stress + one final screenshot, fix until it meets the **Definition of Done** (skipped in Sketch).
6. Screen meets DoD → report in one line → only then move to the next screen, in From-template mode. State variants (empty, loading, error, long text, large text) are From-template screens of the one that met DoD. *(Both only)* the second theme is a `variableModes` switch on a copy, made after all screens meet DoD in the primary theme.
7. Lay out `05 · Screens & Flows` per `references/standards/file-standards.md` §2.2.1–2.2.2:
   - `Flow · <Product>` text flow first (`assets/flow.render-tree.json`): one `FL-NN.Exx  FROM @id --[nav: action]--> TO @id` transition per line, the source of truth for flows and the prototype.
   - Then **one Section per user flow**, `FL-NN · <Flow>` in journey order (entry → core features → settings), from `assets/flow-section.render-tree.json`: numbered title bar, dark frame, all Sections stacked with one x and width. Frames shared by many flows (dialogs, settings) go in a catalog Section.
   - Inside a Section: the happy path on the main row left → right, states and feedback (`FBK-NN`) right after their screen, branches (alternatives, errors, upsells) on rows below starting under the frame they leave from; 80 between frames, rows 400 apart. Frames `SCR-NN · <Screen> · <State>[ · <Theme>]`; each frame lives once.
   - What a frame cannot show (animation, conditions, ad slots) goes in a yellow `Note · <Topic>` beside it (`assets/note.render-tree.json`).
   - Connector lines are optional: draw them only when the user asks — wiring is slow to build and verify, and the text flow already carries the logic. When asked, draw one per text-flow line (§2.2.1: magnets by position, labels only on branches, white text).

### Stage 6 — Prototype and motion

Read `references/process/creative-process.md` sections 7–8.

1. Prototype the main flow first, secondary branches later. Use interactive components for micro-interactions (toggle, tab, accordion) so you don't have to wire every screen.
2. Use variables + conditional logic when the prototype needs state (cart, login, counter).
3. Motion (Smart Animate / Figma Motion): every animation has a reason — guidance, feedback, or spatial continuity. Duration and easing come from motion tokens. Always provide a Reduce Motion alternative.
4. If the deliverable is a Lottie/dotLottie asset, continue with the `lottie-motion` skill after the Figma motion is approved: spec, export, audit, runtime QA and handoff.

### Stage 7 — QA → *gate*

Read `references/process/handoff-qa.md` sections 1–3, use `assets/qa-report.template.md`.

1. Run the 6-group QA checklist: structure, tokens, layout, states, accessibility, content. For every action button run the CTA checklist (`references/standards/cta-playbook.md` §8): one primary per viewport, contrast, target size, disabled reason, loading stability.
2. Log issues by severity: **Blocker** (must be fixed before handoff), **Should fix**, **Nice to have**.
3. Agent: check whatever can be checked automatically (default names, values not bound to tokens, frames without Auto Layout, contrast, text overflow) with the read-only audit/stress tools; check the rest via screenshots. State clearly which warnings are false positives.
4. **Gate:** present the QA report; move on to handoff only after the Blocker items are fixed.

### Stage 8 — Handoff

Read `references/process/handoff-qa.md` sections 4–6.

1. Mark Ready for dev per flow Section (`FL-NN · …`), write annotations for behavior that isn't visible (logic, edge cases, animation, accessibility).
2. Map tokens to code (Swift/Kotlin/CSS) using the table in `references/process/handoff-qa.md`. If Code Connect is available, connect components to the real code.
3. Write the library version changelog; publish the library with a description of the changes.

## Output by mode

**Agent:** real changes in the Figma file + a short report: what was created/edited (with node IDs or links), which decisions were locked, what remains open; at handoff, one line each for the 4 questions in `references/process/decision-playbook.md`. Don't re-describe what the user can open and see for themselves.

**Designer:** an instruction document containing: goal → steps (numbered, naming the exact menu/shortcut/panel) → value tables (tokens, naming) → self-check checklist. Each step is specific enough to follow without guessing.

## Self-check before reporting done

- No default-named layers remain in the scope worked on.
- No hand-typed colors/font sizes/spacing outside the primitive level.
- Content frames all use Auto Layout; test resizing doesn't break them.
- All states are present in the chosen theme(s) — and no screens were drawn for a theme the brief did not choose.
- Body text contrast ≥ 4.5:1, large text and UI elements ≥ 3:1.
- Agent: screenshotted and reviewed the final result; deleted nothing out of scope.
- Every screen went through Pass 1 → 3 (Sketch: 1 → 2) and met the Definition of Done before the next screen started.
- Passed the human approval gates corresponding to the stages that were run.

## Common pitfalls

- **Jumping straight to pixels** without a brief and tokens → everything must be redone when the direction changes.
- **Variant explosion** (Size × State × Icon × Theme = hundreds) → use boolean/instance-swap properties and variable modes instead of variants.
- **Dark mode by duplicating screens** → use modes on the Semantic collection.
- **Drawing both themes by default** → the brief decides the theme; a single-theme project never gets Dark/Light variants or mode checks.
- **Groups instead of Frames** → Groups have no Auto Layout, padding, or clipping; use Groups only for illustrations.
- **"Creative" = adding effects** → creativity lies in how content is organized and the emotion it evokes; effects only serve the idea.
- **Agent writes a big chunk before checking** (a whole finished screen, or all 3 screens, in one write) → errors pile on errors and fixing costs many times more. Lock the layout with placeholders first, then fill.
- **Checking too densely** (a screenshot after every small block) → slow and token-heavy, and most shots find nothing. Check numbers every write with `get_node`, look once per pass.
- **Polishing before the gate** → building out all 3 directions in detail before the user has chosen. In Stage 4, build each direction in Sketch mode (Pass 1–2), just enough to compare, then stop.
- **Copying a famous app verbatim** → references must state which principle is being taken, not the surface.
