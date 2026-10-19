---
name: figma-agent
description: Design, edit and review UI directly in Figma through the figma-agent MCP tools (render_tree, update_nodes, execute_code, screenshot…). Use whenever the user asks to create, change, restyle, audit or inspect a Figma screen, component, design system or layer while the figma-agent-UI plugin is open.
---

# Designing in Figma with figma-agent

The `figma-agent` MCP server talks to the **figma-agent-UI** plugin running in the user's Figma file. Nothing is kept between calls except node ids: keep the ids every write returns.

## 0. Connect

Call `figma_status` first. If `files` is empty, ask the user to open Figma → Plugins → Development → **figma-agent-UI**, paste the `token` from the status output, and press Connect. If several files are connected, pass `file` (file name) to every tool.

## 1. Inspect before you build

1. `get_document_info`: pages, selection, top-level frames.
2. `get_design_system`: variables (with modes), styles, local components, library components already used.
3. `get_selection` / `get_node`: the frames the user is talking about, with depth 2–3.
4. `list_fonts` when the file or brief uses a font other than Inter. Never guess style names.

Match what exists: naming, spacing scale, colors, type styles and components. Fall back to your own choices only when the file has none. Then tell the user in one line what you'll reuse.

## 2. Pick the right tool

| Task | Tool |
|---|---|
| New screen / section / card | `render_tree` (one call per screen or large section) |
| Change text, colors, spacing, sizing, variants on existing layers | `update_nodes` (batch them) |
| Delete / reorder / reparent / duplicate | `delete_nodes`, `move_nodes`, `clone_node` |
| Components and variants, variables and modes, styles, prototyping, constraints, boolean ops, anything else | `execute_code` |
| Check the result | `screenshot` |
| Show the user | `select_nodes` |

## 3. render_tree vocabulary

Node types: `frame`, `text`, `rect`, `ellipse`, `svg`, `image`, `instance`. Unknown keys are rejected; the error lists the bad key.

```jsonc
{
  "type": "frame", "name": "Login", "width": 390, "height": 844,
  "layout": "VERTICAL",            // HORIZONTAL | VERTICAL | NONE (auto layout)
  "padding": [48, 24],             // n | [v, h] | [t, r, b, l]
  "gap": 16,                       // or "AUTO" = space-between
  "justify": "START",              // primary axis: START | CENTER | END | SPACE_BETWEEN
  "align": "CENTER",               // counter axis: START | CENTER | END | BASELINE
  "fill": "#FFFFFF",               // hex, {var:"color/bg"}, {style:"Surface"}, gradient, {image:url}, or an array (top first)
  "radius": 16,                    // or [tl, tr, br, bl]
  "stroke": { "color": "#E2E8F0", "width": 1, "align": "INSIDE" },
  "effects": "md",                 // none|sm|md|lg|xl, [{y,blur,spread,color}], [{backgroundBlur:20}], {style:"Shadow/md"}
  "variableModes": { "Theme": "Dark" },
  "children": [
    { "type": "text", "text": "Welcome back", "fontSize": 28, "fontWeight": 700,
      "color": "#0F172A", "lineHeight": "120%", "letterSpacing": "-2%", "widthMode": "FILL" },
    { "type": "svg", "svg": "<svg …lucide icon…>", "width": 20, "color": "#64748B" },
    { "type": "image", "src": "https://…/photo.jpg", "width": 342, "height": 200, "radius": 12, "scaleMode": "FILL" },
    { "type": "instance", "component": "Button", "variant": { "Variant": "Primary", "Size": "Large" },
      "texts": { "Label": "Sign in" }, "widthMode": "FILL" }
  ]
}
```

Other keys: `widthMode`/`heightMode` (`FIXED|HUG|FILL`), `min/maxWidth`, `min/maxHeight`, `absolute` + `x`/`y`, `opacity`, `visible`, `rotation`, `clip`, `wrap` + `counterGap`, `component: true` (frame becomes a component) + `description`, text `fontFamily`, `fontStyle`, `textAlign`, `verticalAlign`, `textCase`, `decoration`, `maxLines`, `textStyle`. Any number can be `{ "var": "spacing/4" }` to bind a variable. Pass `defaultFont` to the tool when the product uses another family.

Sizing rules, the most common failures:
- Auto-layout frames without `width`/`height` hug their content. `widthMode: "FILL"` only works inside an auto-layout parent, and not on the root.
- Text wraps only when it has a width: `widthMode: "FILL"` or a fixed `width`. Long labels in rows need `FILL` on the text or its container.
- Use `gap`, `padding` and `justify`/`align` instead of `x`/`y`. `x`/`y` only work for `absolute: true` children, non-auto-layout parents or the root.
- Mobile: 390×844 (iPhone 15), 16–24 px side padding. Desktop: 1440 wide.

The result has `rootId` and `ids` keyed by name path (`"Login/Form/Email"`). Name layers meaningfully so the paths are useful later.

## 4. update_nodes

Same properties, applied to existing ids: `{ "updates": [{ "id": "12:34", "props": { "text": "New", "fill": {"var": "color/primary"} } }] }`. Instances also take `variant`, `properties` (component props by name), `texts` (by text layer name) and `component` (swap). Partial failures are listed in `failed`.

## 5. execute_code rules

Body of an async function with `figma` and `h`. Use top-level `await` and **`return`** a value; `console.log` is not returned.
- Colors are 0–1 `{r,g,b}`; opacity goes on the paint. `h.solid('#3B82F6')` builds a SolidPaint.
- `fills`, `strokes` and `effects` are immutable arrays: clone, edit, reassign.
- Load fonts before touching text: `await h.loadNodeFonts(node)` for existing text, `await figma.loadFontAsync(font)` for new fonts. `lineHeight`/`letterSpacing` take `{unit, value}`.
- `await figma.getNodeByIdAsync(id)`, `await figma.setCurrentPageAsync(page)`, `await instance.getMainComponentAsync()`; the sync variants throw (dynamic-page).
- `resize()` resets sizing to FIXED: resize first, then set `layoutSizingHorizontal/Vertical`. Append to the auto-layout parent before setting `FILL`.
- `figma.variables.setBoundVariableForPaint(...)` returns a new paint; assign it. Set `variable.scopes` explicitly when creating variables.
- Read `componentPropertyDefinitions` only on a COMPONENT_SET or a standalone COMPONENT.
- Put new top-level nodes at `h.freeSpot()`, never on top of existing frames.
- Never call `figma.closePlugin()`. Keep calls under 30 s, or pass `timeoutMs`.
- Return `{ createdNodeIds, mutatedNodeIds, … }`.

## 6. Verify and iterate

- After composing a screen: `screenshot` the root. Look for clipped or overflowing text, wrong wrapping, overlaps, misalignment, inconsistent spacing, poor contrast and leftover placeholder text.
- Fix the specific nodes with `update_nodes`; don't rebuild the screen. Screenshot once more after the fix, then stop.
- If a write fails with `safeToRetryWithoutCanvasRead: false`, read the canvas (`get_node`) before retrying. If the same error repeats twice, change approach instead of retrying.
- `render_tree` removes a partial result on failure (its error is safe to retry).

## 7. Design quality checklist

- Reuse design-system components, variables and styles. Hardcode a value only when nothing fits, and keep it on a consistent scale (4/8 px spacing, a type scale such as 12/14/16/20/24/32).
- Real-looking content in the user's language; no lorem ipsum unless asked.
- Clear hierarchy: one primary action per screen, at most 2–3 font weights, contrast ≥ 4.5:1 for body text.
- Name every frame (`Header`, `Card/Balance`, `Button/Primary`) and repeat structure through components when an element appears 3+ times.
- Icons as SVG (e.g. Lucide markup) recolored with `color`, not emoji, unless the style calls for it.
