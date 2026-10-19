# Running figma-ui-flow on `figma-agent` (MCP + figma-agent-UI plugin)

The bridge between the workflow (this skill) and the tools (the `figma-agent-tools` skill). Read it when the session has `mcp__figma-agent__*` tools (`figma_status`, `render_tree`…). Parameters and errors for each tool: `figma-agent-tools/references/tool-reference.md`.

## Contents
1. Connection and version
2. Tool mapping table
3. Recipes by stage
4. Screen build loop: level → tool
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
| 1 | 9-page skeleton | `manage_pages{template: true, dryRun: true}` to preview, then run for real |
| 2 | Tokens from JSON | `import_tokens{path, dryRun: true}`: lints like `check_tokens.py`, then run for real |
| 2 | Individual variables | `create_variables{collection, modes, variables, onExisting}` |
| 2 | Text/paint/effect/grid styles | `create_styles{styles: [...]}`; text styles can bind `fontSize: {var}` |
| 2 | Foundations page | `render_foundations{page: "🎨 Foundations"}` |
| 3 | Search first | `search_design_system{query: "button"}` |
| 3 | Component set + properties | `create_component_set{name, variants: [{props, tree}], properties}` |
| 3 | Playground | `stress_test{id, cases, modes}` → `screenshot{id: sectionId}` |
| 4 | 2–3 directions | One section per direction in `🧪 Explore`, each screen in it follows §4 (polished just enough to compare) → **stop at the gate** |
| 5 | Screens by flow | Empty section `render_tree{page: "📱 Screens", tree: {type: "section", name: "<Flow>"}}`, then **each screen per §4** with `parentId` = section; screen name `Flow / Screen / State` |
| 5 | Dark mode | Frame with `variableModes: {"Semantic": "Dark"}` (requires a multi-mode plan) |
| 6 | Prototype | `set_interactions{items: [{id, reactions: [{action: "NAVIGATE", destination, transition: {duration: {var: "duration/base"}, easing: "standard"}}]}], flowStart}` |
| 6 | Interactive component | `set_interactions` on a variant with `action: "CHANGE_TO"`, `destination` = target variant |
| 7 | QA | `audit_design{format: "markdown"}` → paste into the QA report |
| 7 | Fix raw fill/spacing/radius | `bind_variables{rootId}` (dryRun by default) → review `ambiguous` → add `map` → `dryRun: false` |
| 7 | Fix default names | `rename_by_rule{rootId}` (dryRun by default) → `dryRun: false` |
| 8 | Annotation | `annotate{items: [{id, label, properties}]}` |
| 8 | Ready for dev | `set_dev_status{ids: [sectionId], status: "READY_FOR_DEV"}` |
| 8 | Tokens to code | `export_tokens{format: "css" \| "swift" \| "kotlin" \| "json", path}` |
| 8 | Assets | `export_assets{ids, format, scales, outDir}` |

Every write tool accepts `page` (id or name). When running multiple agents in parallel, always pass `page` instead of using `set_current_page`.

## 4. Screen build loop: level → tool

Process and checklists: `build-loop.md`. Mechanics: `figma-agent-tools` SKILL.md §4.

| Level | Write | Check |
|---|---|---|
| L0 Prepare | — (images: `gemini-image-mcp` `image_generate{savePath}`) | `search_design_system`, `get_design_system`, `list_fonts` |
| L1 Frame | `render_tree{tree: frame + empty regions}` (1 write) | `get_node{ids:[rootId], depth:1}`, `screenshot{id: rootId}` |
| L2 Regions → blocks | `render_tree{parentId: <region>, tree}` — 1 write per region | `screenshot{id: <region>}` |
| L3 Components | `create_component_set` (Components page) → `delete_nodes` + `render_tree{parentId, index, tree: {type: "instance"}}` | `get_node` on the instance, `screenshot` |
| L4 Content | `update_nodes{updates: [...]}` in batches | `screenshot{id, scale: 1}` |
| L5 Verify | `update_nodes`, `rename_by_rule`, `bind_variables` (dryRun → real) | `audit_design{rootId}`, `stress_test{id}` → `screenshot{id: sectionId}` → `delete_nodes` the section |

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
