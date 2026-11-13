# Running figma-ui-flow on `figma-agent` (MCP + figma-agent-UI plugin)

The bridge between the workflow (this skill) and the tools (the `figma-agent-tools` skill). Read it when the session has `mcp__figma-agent__*` tools (`figma_status`, `render_tree`…). Parameters and errors for each tool: `figma-agent-tools/references/tool-reference.md`.

## Contents
1. Connection and version
2. Tool mapping table
3. Recipes by stage
4. Screen build loop: pass → tool
5. Limitations: tell the user

---

## 1. Connection and version

- Call `figma_status` first. `files: []` means no file is connected yet: ask the user to open Figma → Plugins → Development → **figma-agent-UI**, paste the `token`, and click Connect.
- Read `versionCheck`. If it shows ⚠️, the plugin open in Figma is a different build from the server, and new tools will return `Unknown command`. Ask the user to **close the plugin and reopen it**. The plugin panel shows a `Plugin <version> (<commit>)` line for comparison.
- Can write to any file the user has open; no remote Figma MCP or Full seat required. Plan limits still apply: for example, the free plan allows only 1 mode per collection.

## 2. Tool mapping table

| Master calls | Use in figma-agent | Notes |
|---|---|---|
| `whoami` | `figma_status` | Includes user, file, version |
| `get_metadata` | `get_document_info`, then `get_node{ids, depth}` | JSON, not XML |
| `get_screenshot` | `screenshot{id}` | `id` is singular |
| `get_design_context` | `get_node{ids, depth: 3}` | Same vocabulary as `render_tree` |
| `get_variable_defs` | `get_design_system{usedIn: nodeId}` | Tokens/styles bound within the node |
| `search_design_system` | `search_design_system{query}` | Rule #3: call before creating |
| `use_figma` (structured writes) | Dedicated tools in §3; `execute_code` is only an escape hatch | |
| `use_figma` (read-only audit) | `audit_design` | No need to write the §5.7 snippet yourself |
| `generate_figma_design`, `create_new_file`, `generate_diagram`, Code Connect | — | Not available. See §5 |

**Priority:** dedicated tools → `render_tree`/`update_nodes` → `execute_code`. Dedicated tools validate their input, return ids, and clean up on failure. `execute_code` does not.

## 3. Recipes by stage

| Stage | Task | Tool |
|---|---|---|
| 0 | Orientation | `figma_status` → `get_document_info` → `get_design_system` |
| 1 | 7-page skeleton | `manage_pages{template: true, dryRun: true}` to preview, then run for real; `render_tree{tree: assets/cover.render-tree.json}` on `🏠 Cover` → `update_nodes` for the parts in `file-standards.md` §1.3; brief as a `Brief · <Product>` frame next to it |
| 2 | Tokens from JSON | `import_tokens{path, dryRun: true}`: lints like `check_tokens.py`, then run for real |
| 2 | Individual variables | `create_variables{collection, modes, variables, onExisting}` |
| 2 | Text/paint/effect/grid styles | `create_styles{styles: [...]}`; text styles can bind `fontSize: {var}` |
| 2 | Foundations page | `render_foundations{page: "01 · Foundations"}` |
| 3 | Search first | `search_design_system{query: "button"}` |
| 3 | Component set + properties | `create_component_set{name, variants: [{props, tree}], properties}` |
| 3 | Playground | `stress_test{id, cases, modes}` → `screenshot{id: sectionId}` |
| 4 | 2–3 directions | One section per direction (`Explore · <Direction>`) in `06 · Explore (WIP)`, each screen in it is a Sketch per §4 (Pass 1–2, just enough to compare) → **stop at the gate** |
| 5 | Flow Section | `render_tree{page: "05 · Screens & Flows", tree: assets/flow-section.render-tree.json}` with `name`, `x`/`y`, `width` and the title texts set → `update_nodes{id: <section>, props: {stroke: {color: "#FFFFFF73", width: 1, align: "INSIDE"}, radius: 12}}` (`file-standards.md` §2.2.1) |
| 5 | Screens in the flow | **each screen per §4** (first one New build, the rest From template) with `parentId` = flow Section and absolute `x`/`y` on the §2.2.1 grid (row top 304, left 200, gap 80, next row +400); frames named `SCR-NN · <Screen> · <State>` / `FBK-NN · …`; after each row `update_nodes` the Section and `Title` width/height to fit |
| 5 | Note | `render_tree{parentId: <flow Section>, tree: assets/note.render-tree.json}` with `x`/`y` 40 under its frame |
| 5 | Second theme *(theme = Both only)* | `clone_node` the finished flow Section → `FL-NN · <Flow> · Dark` under it, `variableModes: {"Semantic": "Dark"}` on its frames (requires a multi-mode plan). Single theme: skip |
| 5 | Text flow | `render_tree{tree: assets/flow.render-tree.json}` at the top of `05`, one `FL-NN.Exx  FROM @id --[nav: action]--> TO @id` line per edge (`@id` = the screen's `Default` frame id) (`file-standards.md` §2.2.2) |
| 5 | Connectors *(only on request)* | read `flow/text` → per line (minus `ENTRY`, same-ends merged) compute magnets from the frames' `absoluteBoundingBox` → **one `render_tree` per connector** (calls may run in parallel; `execute_code` cannot clone connectors): `{parentId: <source Section>, select: false, tree: {type: "connector", name: "FL-NN.Exx · <nav: action>", from, to, fromMagnet, toMagnet, lineType: "ELBOWED", stroke: {color: "#FFFFFF66", width: 4}, text?: <branch label>}}` → one `execute_code` pass for what render_tree does not set on connectors: label `text.fontName`/`fontSize`/`fills` white, `cornerRadius` 24, caps → verify count and attached ends. The first call copies a connector into a `figma-agent/connector-seed` Section on the **current page**; when wiring is done move it to `06 · Explore (WIP)` (the next run makes a new one) (rules: `file-standards.md` §2.2.1) |
| 6 | Prototype | read `flow/text` line by line → one reaction per line; `set_interactions{items: [{id, reactions: [{action: "NAVIGATE", destination, transition: {duration: {var: "duration/base"}, easing: "standard"}}]}], flowStart}` |
| 6 | Interactive component | `set_interactions` on a variant with `action: "CHANGE_TO"`, `destination` = target variant |
| 7 | QA | `audit_design{format: "markdown"}` → paste into the QA report |
| 7 | Fix raw fill/spacing/radius | `bind_variables{rootId}` (dryRun by default) → review `ambiguous` → add `map` → `dryRun: false` |
| 7 | Fix default names | `rename_by_rule{rootId}` (dryRun by default) → `dryRun: false` |
| 8 | Annotation | `annotate{items: [{id, label, properties}]}` |
| 8 | Ready for dev | `set_dev_status{ids: [<FL-NN section id>], status: "READY_FOR_DEV"}` |
| 8 | Tokens to code | `export_tokens{format: "css" \| "swift" \| "kotlin" \| "json", path}` |
| 8 | Assets | `export_assets{ids, format, scales, outDir}` |

Every write tool accepts `page` (id or name). When running multiple agents in parallel, always pass `page` instead of using `set_current_page`.

### 3.0 Copying screens from another file (exact)

Use when the user wants a screen "y hệt" the original, or to bring source screens into the clone before restyling. Both files must be open with the plugin connected. Full playbook (fields, what is copied, troubleshooting): `figma-agent-tools/references/copy-between-files.md`.

1. `copy_nodes{file: <source>, ids, name, targetFile: <target>}`: one snapshot per screen or per Section. Read `skipped` and `missingInTarget`.
2. `paste_nodes{file: <target>, page: "06 · Explore (WIP)", snapshot: name, x, y}` next to earlier copies; `exact: true` and an empty `mismatches` mean every layer kept its size. `screenshot` the copy and the source side by side.
3. `fontFallbacks` lists text set in Inter because the target lacks the font: install the font later and swap it (the original is in plugin data `figma-agent/original-font`), or copy again with `outlineMissingFonts: true` when the exact look matters more than editing.
4. Into a flow: `paste_nodes{replaceId: <old frame>}` keeps the slot and name, then rewrite the text-flow `@id`s and redraw connectors (`file-standards.md` §2.2.1 "Replacing a flow's screens").

Never hand-write a cross-file copy with `execute_code`: snapshots on disk avoid the 20k output limit and plugin `clientStorage`, and the tools fix the known traps (hidden padding, masks, outlined-text strokes, video fills).

### 3.1 Building a flow with subagents (masters → states)

A flow of 15–25 frames goes fastest as: **main session prepares → capable agents build masters in parallel → cheap agents clone states → main session reviews and wires.**

1. **Prepare (main session):** export the source photos (`export_assets` on the original's image nodes; hide overlaid badges for the export and restore them), write one shared brief file that every agent reads first. The brief holds: file names and the page to build on, the source frame id → target frame name table, image paths, token and text-style names, component names with their property keys, finished frames to copy patterns from, the house rules, and the tool quirks below.
2. **Masters (e.g. Sonnet, in parallel):** one agent per screen family (home, editor, result…), each on its own canvas area of `06 · Explore (WIP)` (distinct x/y bands). Ask them to name layers clearly and report the frame ids and the key child ids.
3. **States (e.g. Haiku):** after a master lands, an agent clones it per state with explicit steps: which ids to clone, new names and positions, which child to change and how. Cloning beats rebuilding: overlays (scrim, coach mark, progress ring, dialog instance) go on top of a clone.
4. **Review (main session):** screenshot every frame; agents miss duplicated content, orphan words, and badges clipped by `clipsContent` on avatar containers. Fix in place, then swap the frames into the flow Section and redraw the text flow and connectors (`file-standards.md` §2.2.1 "Replacing a flow's screens").

When the main session edits frames an agent is also working on, tell the agent explicitly which layers not to touch. Quirks worth putting in every brief: `h.solid(hex, opacity)` ignores the opacity (use 8-digit hex); multi-paint fills list the top paint first; `absolute: true` only works when the parent has auto layout (otherwise plain `x`/`y`); after setting a `{var}` fill with `update_nodes`, check the rendered colour; a FIXED width inside auto layout needs `widthMode: "FIXED"`.

## 4. Screen build loop: pass → tool

Process, modes and checklists: `build-loop.md`. Mechanics: `figma-agent-tools` SKILL.md §4.

| Pass | Write | Check |
|---|---|---|
| 0 Prepare | — (images: `gemini-image-mcp` `image_generate{savePath}`) | `search_design_system`, `get_design_system`, `list_fonts` |
| 1 Layout | `render_tree{tree: frame + regions + sized placeholder blocks}` (1–2 writes) | `get_node{ids:[rootId], depth: 2}` → one `screenshot{id: rootId}` |
| 2 Fill | `create_component_set` for repeated blocks → `render_tree{parentId: <placeholder or region>, index?}` per cluster (`delete_nodes` the placeholder when replacing it) → `update_nodes` in batches | `get_node` (or the write's `bounds`) after each write; one `screenshot{id: rootId}` at the end; extra screenshots only for unusual blocks |
| 3 Lock | `update_nodes`, `rename_by_rule`, `bind_variables` (dryRun → real) | `audit_design{rootId}`, `stress_test{id}` → `screenshot{id: sectionId}` → `delete_nodes` the section → final `screenshot{id, scale: 1}` |
| From template | `clone_node{id: <screen that met DoD>, parentId}` → `update_nodes` / `render_tree{parentId, index}` for what differs | `get_node` on the edits; `screenshot` of the changed areas; then Pass 3 |

Easy-to-confuse parameters (`ids` array vs `id` string, dryRun defaults, ms vs seconds…): `figma-agent-tools/references/tool-reference.md`.

## 5. Limitations: tell the user

| Task | Reason | Instead |
|---|---|---|
| Publish library, version history, branches | Not possible via the Plugin API | Agent drafts a semver changelog (design-system §8); the user clicks Publish |
| Code Connect | A separate Figma tool | `export_tokens` + annotations with code component names |
| Multiple modes on the free plan | Figma reports `Limited to 1 modes only` | `create_variables`/`import_tokens` still write the first mode and return a warning; Dark mode is only available after upgrading |
| Figma Motion timeline, shaders | No Plugin API yet | Record the parameters in `annotate` |
| Library components (not yet used on the page) | The Plugin API doesn't list them | Ask the user for the name/key, or drag an instance onto the page and then `get_design_system` |
| Infinite loops in `execute_code` | Cannot be interrupted; Figma closes the plugin | Use dedicated tools; always bound loops |
