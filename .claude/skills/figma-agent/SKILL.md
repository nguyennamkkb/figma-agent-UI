---
name: figma-agent
description: Design, edit, audit and fix UI directly in the user's open Figma file through the figma-agent MCP tools (figma_status, get_design_system, render_tree, update_nodes, execute_code, screenshot…), which drive the figma-agent-UI plugin. Use whenever the user wants to create or design a screen, component or design system in Figma, restyle, move, rename or delete layers, change text/colors/spacing/sizing, review or audit a design, or inspect what a Figma file contains — including Vietnamese phrasings such as "thiết kế màn hình", "tạo UI", "dựng màn hình này", "sửa/đổi màu/chỉnh spacing", "review UI", "rà soát thiết kế", "kiểm tra file Figma" — and whenever Figma is the place the work happens, even if the user never names the tools.
---

# Designing in Figma with figma-agent

The `figma-agent` MCP server talks to the **figma-agent-UI** plugin running inside the user's open Figma file. The canvas is the only state: nothing survives between calls except node ids, so keep every id a write returns (and the `ids` name-path map from `render_tree`).

## 0. Connect and orient

Call `figma_status` first. `files: []` means no file is connected: ask the user to open Figma → Plugins → Development → **figma-agent-UI**, paste the `token` shown by `figma_status`, press Connect. With several files connected, pass `file` (file name or key) to every tool.

If `versionCheck` starts with ⚠️, the plugin open in Figma is an older build than the server: newer tools will answer "Unknown command". Ask the user to close and reopen the plugin; its panel shows `Plugin <version> (<commit>)` to compare.

Design-system work (file skeleton, tokens, styles, component sets, prototype, QA report, handoff) follows the **figma-master** skill; its `references/figma-agent-adapter.md` maps every stage to the tools below.

Two situations need the plugin restarted by hand, so say so plainly instead of retrying: the user closed it, or a previous `execute_code` call never returned (see §6).

## 1. Inspect before you build

1. `get_document_info` — pages, current page, selection, top-level frames.
2. `get_design_system` — local variables with modes and values, paint/text/effect styles, local components with their properties, library components already used. Add `"library"` to `include` only when you need published collections; lower `componentLimit` on huge files.
3. `get_selection` / `get_node` — the frames the user is talking about, `depth: 2`–`3` (raise `maxNodes` if the result says `truncated`).
4. `find_nodes` — locate layers by `types`, `name` substring or `text` substring when the user refers to something you cannot see (`rootId` defaults to the current page).
5. `set_current_page` — switch pages before working on them; every other tool acts on the current page.
6. `list_fonts` — whenever the brief uses a family other than Inter. Never guess style names ("Semi Bold" vs "SemiBold").

Then match what already exists: naming, spacing scale, colors, type styles, components. Fall back to your own choices only where the file has none, and tell the user in one line what you reused.

## 2. Pick the right tool

| Task | Tool |
|---|---|
| New screen / section / card / component tree | `render_tree` — one call per screen or large section |
| Change text, colors, spacing, sizing, variants, resize on existing layers | `update_nodes` — batch them into one call |
| Delete / reorder / reparent / duplicate | `delete_nodes`, `move_nodes`, `clone_node` |
| Anything that might already exist (component, token, style) | `search_design_system` first |
| Page skeleton / rename / reorder pages | `manage_pages` |
| Variables (collections, modes, aliases, scopes) / token JSON | `create_variables`, `import_tokens` (DTCG) |
| Text / paint / effect / grid styles | `create_styles` |
| Component set with variants and TEXT/BOOLEAN/INSTANCE_SWAP properties | `create_component_set` |
| Prototype links, Smart Animate, interactive components | `set_interactions` |
| QA report / bulk fixes | `audit_design`, then `bind_variables`, `rename_by_rule` (both dryRun by default) |
| Long text / large type / narrow / dark checks | `stress_test` |
| Handoff | `annotate`, `set_dev_status`, `export_tokens`, `export_assets`, `render_foundations` |
| Constraints, boolean ops, vector edits, anything else | `execute_code` |
| Look at the result | `screenshot` |
| Show the user where the result is | `select_nodes` |
| Understand the file | `get_document_info`, `get_design_system`, `get_selection`, `get_node`, `find_nodes`, `list_fonts`, `set_current_page` |

## 3. render_tree

Node types: `frame`, `text`, `rect`, `ellipse`, `svg`, `image`, `instance`. Keys are strict — an unknown key is rejected and named in the error.

Tool arguments: `tree` (required), `parentId` + `index` to build *inside* an existing frame instead of on the page, `defaultFont` when the product does not use Inter, `select: false` to keep the user's view still.

```jsonc
{
  "type": "frame", "name": "Login", "width": 390, "height": 844,
  "layout": "VERTICAL",            // HORIZONTAL | VERTICAL | NONE (auto layout)
  "padding": [48, 24],             // n | [v, h] | [t, r, b, l]
  "gap": 16,                       // or "AUTO" = space-between
  "justify": "START",              // primary axis: START | CENTER | END | SPACE_BETWEEN
  "align": "CENTER",               // counter axis: START | CENTER | END | BASELINE
  "fill": "#FFFFFF",               // hex | {var:"color/bg"} | {style:"Surface"} | gradient | {image:"https://…"} | array (top first)
  "radius": 16,                    // n or [tl, tr, br, bl]
  "stroke": { "color": "#E2E8F0", "width": 1, "align": "INSIDE" },   // width: n or [t,r,b,l]; also dash: [4,4]
  "effects": "md",                 // none|sm|md|lg|xl | [{x,y,blur,spread,color,type}] | [{layerBlur:8}] | [{backgroundBlur:20}] | {style:"Shadow/md"}
  "variableModes": { "Theme": "Dark" },
  "children": [
    { "type": "text", "text": "Welcome back", "fontSize": 28, "fontWeight": 700,
      "color": "#0F172A", "lineHeight": "120%", "letterSpacing": "-2%",
      "widthMode": "FILL", "maxLines": 1 },
    { "type": "svg", "svg": "<svg …lucide icon…>", "width": 20, "color": "#64748B" },
    { "type": "image", "src": "https://…/photo.jpg", "width": 342, "height": 200, "radius": 12, "scaleMode": "FILL" },
    { "type": "instance", "component": "Button", "variant": { "Variant": "Primary", "Size": "Large" },
      "texts": { "Label": "Sign in" }, "properties": { "Show icon": true }, "widthMode": "FILL" }
  ]
}
```

Exact shapes for the two paints people get wrong:

```jsonc
"fill": { "gradient": "LINEAR", "angle": 135, "stops": [ { "color": "#F59E0B", "position": 0 }, { "color": "#EF4444", "position": 1 } ] }
"effects": [ { "type": "DROP", "x": 0, "y": 4, "blur": 12, "spread": 0, "color": "#00000026" } ]   // type: "DROP" | "INNER" (not DROP_SHADOW)
```

Other keys: `widthMode`/`heightMode` (`FIXED|HUG|FILL`), `minWidth`/`maxWidth`/`minHeight`/`maxHeight`, `absolute` + `x`/`y`, `opacity`, `visible`, `rotation`, `clip`, `wrap` + `counterGap`, `component: true` (the frame becomes a component) + `description`, and on text `fontFamily`, `fontStyle`, `textAlign`, `verticalAlign`, `textCase`, `decoration`, `textStyle`. Any number may be `{ "var": "spacing/4" }` to bind a variable.

Sizing rules, the source of most failures:

- Auto-layout frames without `width`/`height` hug their content. `widthMode: "FILL"` only works inside an auto-layout parent and never on the root; the error is explicit and safe to retry because the partial tree is removed.
- Text wraps only when it has a width — `widthMode: "FILL"` or a fixed `width`. A long label in a row needs `FILL` on the text or on its container, otherwise it overflows.
- Compose with `gap`, `padding`, `justify` and `align`; reach for `x`/`y` only on `absolute: true` children, non-auto-layout parents or the root.
- Common canvases: 390×844 (iPhone 15), 1440 desktop; 16–24 px side padding on mobile.

The result returns `rootId`, `created` and `ids` keyed by name path (`"Login/Form/Email"`). Name layers meaningfully — those paths are how you address them afterwards.

## 4. update_nodes

```jsonc
{ "updates": [ { "id": "12:34", "props": { "text": "New", "fill": { "var": "color/primary" } } } ] }
```

`props` accepts everything from §3 that makes sense on an existing node. Instances additionally take `variant`, `properties` (component props by name, `#id` suffix optional), `texts` (keyed by the text layer's name) and `component` to swap the main component. A text layer *inside* an instance has an id of the form `I1006:42;1006:41` — use it when you need to touch one layer rather than the whole instance. Failures are per item: the good updates land and the bad ones come back in `failed`, so read that list instead of assuming the whole call failed.

## 5. Other write tools

- `move_nodes` — `{ids, parentId?, index?, x?, y?}`: reparent, reorder, or move absolutely positioned layers. The node lands inside the new auto-layout parent's flow, so `x`/`y` are for layers outside auto layout.
- `clone_node` — `{id, parentId?, index?, x?, y?}` returns the copy's id.
- `delete_nodes` — `{ids}`; the response separates `deleted` from `missing`.
- `select_nodes` — `{ids, zoom?}`; use it as the last step so the user sees the work.
- Every tool takes `page` (id or name): it runs on that page and restores the previous one, so parallel agents never write to the wrong page. Prefer it over `set_current_page`.
- `render_tree` also builds `{type: "section", name, children}` (screens of one flow, auto-placed 200 px apart) and frame `layoutGrids` (`[{pattern, count, gutter, margin}]`, `{preset: "mobile"}` or `{style}`).

## 6. execute_code

The code is the body of an async function with `figma` and `h` in scope. Use top-level `await` and **`return`** a JSON-friendly value; `console.log` is not returned, but returned nodes are summarised automatically.

- **Never write a loop or wait that cannot finish** (`while (true)`, long `await` chains). The plugin runs the sandbox on one thread and nothing can interrupt it: the MCP call times out on the server, Figma then closes the plugin, the bridge loses the file, and the user has to re-open the plugin by hand. `timeoutMs` protects the agent, not the canvas. Prefer bounded loops (`for (let i = 0; i < nodes.length; i++)`) and keep the call well under 30 s.
- Colors are 0–1 `{r,g,b}` and opacity rides on the paint: `h.solid('#3B82F6')`. `figma.util.rgb` exists, but `figma.util.solid` does not on every build — `h.solid` always does.
- `fills`, `strokes` and `effects` are immutable arrays: clone, edit, reassign.
- Load fonts before touching text: `await h.loadNodeFonts(node)` for existing text, `await h.loadFont({family, style})` for new ones. Styles must be loaded before `textStyle.fontName` or `fontName` can be set. `lineHeight`/`letterSpacing` take `{unit, value}`.
- Use the async APIs under `documentAccess: dynamic-page`: `await figma.getNodeByIdAsync(id)`, `await figma.setCurrentPageAsync(page)`, `await instance.getMainComponentAsync()`. The sync variants throw.
- `resize()` resets sizing to `FIXED`: resize first, then set `layoutSizingHorizontal/Vertical`. Append to the auto-layout parent before setting `FILL`.
- Variables: `figma.variables.createVariable(name, collection, type)`, then `variable.setValueForMode(modeId, value)` — note `ForMode`; `setValueForMode` also needs the mode id from `collection.modes`, and `variable.setValueByMode` does not exist. `figma.variables.setBoundVariableForPaint(paint, field, variable)` returns a new paint — assign it. Set `variable.scopes` explicitly, and remember that Figma plans without variable-mode support reject `collection.addMode` with "Limited to 1 modes only".
- Read `componentPropertyDefinitions` only on a COMPONENT_SET or a standalone COMPONENT.
- Put new top-level nodes at `h.freeSpot()`, never on top of existing frames.
- Never call `figma.closePlugin()`.
- Return `{ createdNodeIds, mutatedNodeIds, … }` so the ids survive into your next call.

## 7. Verify and iterate

- `screenshot` the root after composing a screen (default: the first selected node; `scale` and `maxSize` control size/cost). Read the image for clipped or overflowing text, wrong wrapping, overlaps, misalignment, inconsistent spacing, weak contrast and leftover placeholder text.
- Fix the specific nodes with `update_nodes`; don't rebuild the screen. Screenshot once more after the fix, then stop — the loop ends when the picture is right.
- `safeToRetryWithoutCanvasRead: false` means the failed write may have changed the canvas: read it (`get_node`) before retrying. If the same error repeats twice, change approach rather than retrying.
- `render_tree` failures roll back, and their errors report `true`, so a corrected retry is safe.

## 8. Design quality checklist

- Reuse the file's components, variables and styles. Hardcode only when nothing fits, and stay on a scale (4/8 px spacing; a type ramp such as 12/14/16/20/24/32).
- Real content in the user's language; no lorem ipsum unless asked.
- One primary action per screen, at most 2–3 font weights, body-text contrast ≥ 4.5:1.
- Meaningful layer names (`Header`, `Card/Balance`, `Button/Primary`) and a component once an element repeats 3+ times.
- Icons as SVG (e.g. Lucide markup) recolored with `color`, not emoji, unless the style calls for it.
- Leave the file tidier than you found it: no stray frames, no duplicate layers, and mention anything you created or deleted at top level.
