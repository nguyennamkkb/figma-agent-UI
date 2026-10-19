# Troubleshooting figma-agent

## Connection and versions

| Symptom | Cause / fix |
|---|---|
| `figma_status` → `files: []` | Plugin not open or not connected. User: Figma → Plugins → Development → figma-agent-UI, paste `token`, Connect. |
| `listening: false` / port 3055 in use | Another figma-agent server (e.g. another client's MCP) holds the port. Find it (`lsof -i :3055`), ask the user before stopping it, then reconnect the MCP (`/mcp`). |
| `versionCheck` ⚠️, or `Unknown command: <tool>` | Plugin build ≠ server build. User closes and reopens the plugin; after a plugin upgrade the version in `package.json` is bumped so the panel shows it. |
| Every call times out after an `execute_code` | The sandbox is stuck in a loop: Figma will close the plugin. User reopens it; rewrite the code with bounded loops. |
| gemini `workerCount: 0` | Studio tab closed or bridge restarted. User opens/reloads `pageUrl` (or the Gemini Canvas tab); `image_generate` can auto-open it. |

## Writes

| Symptom | Cause / fix |
|---|---|
| `render_tree` "unknown key …" | Strict schema; rename the key (see `render-tree-dsl.md`). Rolled back — retry is safe. |
| "FILL needs an auto-layout parent" | `widthMode/heightMode: "FILL"` on the root or under a `layout: "NONE"` parent. |
| Text overflows its row | Text has no width: add `widthMode: "FILL"` (or a fixed width) so it wraps. |
| Footer not at the bottom | Parent needs `justify: "SPACE_BETWEEN"`, or the middle region `heightMode: "FILL"`. |
| Failure with `safeToRetryWithoutCanvasRead: false` | Canvas may be half-changed: `get_node` the target, then decide. |
| `RolledBackError` from tokens/styles/components | Input validated before writing; nothing changed. Fix and retry. |
| `Limited to 1 modes only` | Figma plan without variable modes. The first mode is written and the rest is a warning; dark mode needs a paid plan. |
| `bind_variables` changed nothing | It defaults to `dryRun: true`. Same for `rename_by_rule`. |
| `bind_variables` never picks a token | Candidates are Semantic variables with matching scopes; primitives (scopes `[]`) are never used. Add `map`. |
| `stress_test` left a section | By design — screenshot `sectionId`, then `delete_nodes` it. |

## Plugin API (`execute_code`)

| Symptom | Cause / fix |
|---|---|
| `Cannot write to node with unloaded font` | `await h.loadNodeFonts(node)` / `h.loadFont({family, style})` first. |
| Font "SemiBold" not found | Style names have spaces: `Semi Bold`, `Extra Bold`; check `list_fonts`. |
| `layoutSizingHorizontal` throws | Node not yet inside an auto-layout parent — append first. |
| Setting `figma.currentPage` throws / sync getter throws | Use `await figma.setCurrentPageAsync(page)`, `getNodeByIdAsync`. |
| Colours completely wrong | 0–255 used instead of 0–1; use `h.solid('#hex')`. |
| Bound fill does not stick | Assign the new paint array returned by `setBoundVariableForPaint`. |
| `setValueByMode is not a function` | It is `setValueForMode(modeId, value)`. |

## Audit false positives (judge, then say so)

- `small-target` on a non-interactive row (table rows, labels): the real target is the card/button around it.
- `no-autolayout` on an SVG icon frame: vectors, not content — fine.
- `contrast: needs-check` over an image/gradient: check the screenshot; add an overlay gradient or a solid backing if in doubt.
