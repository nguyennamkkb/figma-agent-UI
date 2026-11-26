# Stage recipes on figma-agent — stage → task → tool

The 8 stages of SKILL.md mapped to figma-agent calls. Per-screen build (Pass 0–3) → `build-loop.md` §13; tool parameters → `../tools/tool-reference.md`; copying screens from another file → `../tools/copy-between-files.md`; a whole flow with subagents → `flow-with-subagents.md`.

| Stage | Task | Tool |
|---|---|---|
| 0 | Orientation | `figma_status` → `get_document_info` → `get_design_system` |
| 1 | 7-page skeleton | `manage_pages{template: true, dryRun: true}` to preview, then run for real; `render_tree{tree: assets/cover.render-tree.json}` on `🏠 Cover` → `update_nodes` for the parts in `../standards/file-standards.md` §1.3; brief as a `Brief · <Product>` frame next to it |
| 2 | Tokens from JSON | `import_tokens{path, dryRun: true}`: lints like `check_tokens.py`, then run for real |
| 2 | Individual variables | `create_variables{collection, modes, variables, onExisting}` |
| 2 | Text/paint/effect/grid styles | `create_styles{styles: [...]}`; text styles can bind `fontSize: {var}` |
| 2 | Foundations page | `render_foundations{page: "01 · Foundations"}` |
| 3 | Search first | `search_design_system{query: "button"}` |
| 3 | Component set + properties | `create_component_set{name, variants: [{props, tree}], properties}` |
| 3 | Playground | `stress_test{id, cases, modes}` → `screenshot{id: sectionId}` |
| 4 | 2–3 directions | One section per direction (`Explore · <Direction>`) in `06 · Explore (WIP)`, each screen in it is a Sketch per §4 (Pass 1–2, just enough to compare) → **stop at the gate** |
| 5 | Flow Section | `render_tree{page: "05 · Screens & Flows", tree: assets/flow-section.render-tree.json}` with `name`, `x`/`y`, `width` and the title texts set → `update_nodes{id: <section>, props: {stroke: {color: "#FFFFFF73", width: 1, align: "INSIDE"}, radius: 12}}` (`../standards/file-standards.md` §2.2.1) |
| 5 | Screens in the flow | **each screen per §4** (first one New build, the rest From template) with `parentId` = flow Section and absolute `x`/`y` on the §2.2.1 grid (row top 304, left 200, gap 80, next row +400); frames named `SCR-NN · <Screen> · <State>` / `FBK-NN · …`; after each row `update_nodes` the Section and `Title` width/height to fit |
| 5 | Note | `render_tree{parentId: <flow Section>, tree: assets/note.render-tree.json}` with `x`/`y` 40 under its frame |
| 5 | Second theme *(theme = Both only)* | `clone_node` the finished flow Section → `FL-NN · <Flow> · Dark` under it, `variableModes: {"Semantic": "Dark"}` on its frames (requires a multi-mode plan). Single theme: skip |
| 5 | Text flow | `render_tree{tree: assets/flow.render-tree.json}` at the top of `05`, one `FL-NN.Exx  FROM @id --[nav: action]--> TO @id` line per edge (`@id` = the screen's `Default` frame id) (`../standards/file-standards.md` §2.2.2) |
| 5 | Connectors *(only on request)* | read `flow/text` → per line (minus `ENTRY`, same-ends merged) compute magnets from the frames' `absoluteBoundingBox` → **one `render_tree` per connector** (calls may run in parallel; `execute_code` cannot clone connectors): `{parentId: <source Section>, select: false, tree: {type: "connector", name: "FL-NN.Exx · <nav: action>", from, to, fromMagnet, toMagnet, lineType: "ELBOWED", stroke: {color: "#FFFFFF66", width: 4}, text?: <branch label>}}` → one `execute_code` pass for what render_tree does not set on connectors: label `text.fontName`/`fontSize`/`fills` white, `cornerRadius` 24, caps → verify count and attached ends. The first call copies a connector into a `figma-agent/connector-seed` Section on the **current page**; when wiring is done move it to `06 · Explore (WIP)` (the next run makes a new one) (rules: `../standards/file-standards.md` §2.2.1) |
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
