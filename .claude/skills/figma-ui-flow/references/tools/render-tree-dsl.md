# render_tree / update_nodes DSL

## Contents
1. Arguments
2. Node vocabulary
3. Paints and effects people get wrong
4. Sizing rules (the source of most failures)
5. Building in passes
6. Traps met on real builds
7. update_nodes

---

## 1. Arguments

`tree` (required) · `parentId` + `index` to build **inside** an existing frame · `defaultFont` when the product does not use Inter · `select: false` to keep the user's view still.

Result: `rootId`, `created`, `bounds`, `ids` keyed by name path (`"Login/Form/Email"`; repeats get `#2`, `#3`). Keys are strict — an unknown key is rejected and named in the error, and the partial tree is removed.

## 2. Node vocabulary

Types: `frame`, `text`, `rect`, `ellipse`, `svg`, `image`, `instance`, `section`, `connector`.

```jsonc
{
  "type": "frame", "name": "Login", "width": 390, "height": 844,
  "layout": "VERTICAL",            // HORIZONTAL | VERTICAL | NONE (auto layout)
  "padding": [48, 24],             // n | [v, h] | [t, r, b, l]; also paddingTop… singly
  "gap": 16,                       // or "AUTO" = space-between
  "justify": "START",              // primary axis: START | CENTER | END | SPACE_BETWEEN
  "align": "CENTER",               // counter axis: START | CENTER | END | BASELINE
  "fill": "#FFFFFF",               // hex | {var} | {style} | gradient | {image} | array (top first)
  "radius": 16,                    // n or [tl, tr, br, bl]
  "stroke": { "color": "#E2E8F0", "width": 1, "align": "INSIDE" },   // width n or [t,r,b,l]; dash [4,4]
  "effects": "md",                 // none|sm|md|lg|xl | [{x,y,blur,spread,color,type}] | [{layerBlur}] | [{backgroundBlur}] | {style}
  "layoutGrids": { "preset": "mobile" },   // or [{pattern, count, gutter, margin}] | {style}
  "device": "mobile",              // screen preset: mobile 393×852 | tablet 834×1194 | duo-outer 466×678 | duo-inner 951×669 → size, clip, grid + safe area
  "orientation": "landscape",      // with device: swap width/height (tablet 1194×834)
  "safeArea": false,               // with device: drop the safe-area bands (mobile top 59 / bottom 34, tablet 24 / 20)
  "variableModes": { "Semantic": "Dark" },
  "children": [
    { "type": "text", "text": "Welcome back", "fontSize": 28, "fontWeight": 700,
      "color": "#0F172A", "lineHeight": "120%", "letterSpacing": "-2%",
      "widthMode": "FILL", "maxLines": 1 },
    { "type": "svg", "svg": "<svg …lucide icon…>", "width": 20, "height": 20, "color": "#64748B" },
    { "type": "image", "src": "/abs/path/or/https/url.png", "width": 342, "height": 200, "radius": 12, "scaleMode": "FILL" },
    { "type": "instance", "component": "Button", "variant": { "Variant": "Primary" },
      "texts": { "Label": "Sign in" }, "properties": { "Show icon": true }, "widthMode": "FILL" }
  ]
}
```

Other keys: `widthMode`/`heightMode` (`FIXED|HUG|FILL`), `min/maxWidth`, `min/maxHeight`, `absolute` + `x`/`y`, `opacity`, `visible`, `locked`, `rotation`, `clip` (both `true` and `false` round-trip), `wrap` + `counterGap`, `component: true` (+ `description`); on text `fontFamily`, `fontStyle`, `textAlign`, `verticalAlign`, `textCase`, `decoration`, `maxLines`, `textStyle`. Grids accept `count: "auto"` (= Figma Infinity). `get_node` returns every key above, so its output replays into `update_nodes`. **Any number may be `{ "var": "space/4" }`** and any colour `{ "var": "color/text/primary" }` — use them whenever the file has tokens.

`section`: `{type: "section", name, children: [frames], gap 200, padding 80, fill}` — screens of one flow, auto-placed left to right.

`connector` (flow arrows between screens, Design and FigJam; optional — only when the user asks for wired screens): `{type: "connector", name, from, to, fromMagnet, toMagnet, lineType, caps, text, opacity, stroke}`. `from`/`to` are node ids or same-call ids-map keys; magnets `AUTO|TOP|BOTTOM|LEFT|RIGHT|CENTER` (default AUTO, CENTER for STRAIGHT). Start on the tapped element (button, tile, icon), end on the target screen frame; `text` labels a branch. In Design files Figma plugins cannot create connectors from scratch: the first call copies any existing connector of the file into a `figma-agent/connector-seed` section on the current page (reused by later calls on that page; move it off a presentation page when done) and new connectors are cloned from it, inheriting its stroke, caps and opacity. Connectors still attached at both ends are preferred; one with a frozen elbow route (dragged by hand, or pasted without the shapes it joined) is skipped because copies keep that route. If none is usable the call fails — ask the user to copy a connector together with both shapes it joins (or a whole `figma-agent/connector-seed` section from another file) into this file. The inherited stroke may be invisible on the canvas (e.g. white on a white section): pass `stroke: {color}` and `opacity: 1` when it is; for a translucent line put the alpha in the colour (`#FFFFFF66`), since node `opacity` also fades the label. Label font, size and colour are not render_tree keys on connectors: set `text.fontName`/`fontSize`/`fills` with `execute_code`. `execute_code` cannot clone connectors — create each with render_tree. An endpoint inside an instance attaches to the outermost instance. A `text` wider than the gap between the two frames makes Figma route the elbow far around the canvas: create the connector without `text` and set a short label afterwards with `execute_code`. `STRAIGHT` only accepts `CENTER`/`NONE` magnets. `update_nodes` re-attaches ends but does not change `lineType` or repair a bad route: delete and recreate. The bounds a write returns for a connector are often stale: check the route with a `screenshot` of the Section. Deleting a frame deletes every connector attached to it. One call per connector, `parentId` = the flow section:

```jsonc
{ "parentId": "<section id>", "select": false,
  "tree": { "type": "connector", "name": "Home → Detail", "from": "<button id>", "fromMagnet": "RIGHT",
            "to": "<screen id>", "toMagnet": "LEFT", "text": "tap card" } }
```

### Icon slot (icon button, list leading icon, tab icon)

```jsonc
{ "type": "frame", "name": "icon-button/back", "width": 44, "height": 44, "widthMode": "FIXED", "heightMode": "FIXED",
  "layout": "HORIZONTAL", "justify": "CENTER", "align": "CENTER",      // both CENTER, always
  "radius": 999, "fill": { "var": "surface/raised" },
  "children": [ { "type": "svg", "svg": "<svg …24×24 viewBox…>", "width": 24, "height": 24, "color": "#…" } ] }
```

Off-centre icons come from: no `layout` (icon stuck at 0,0), `justify`/`align` left at START or swapped (`justify: "END", align: "START"` = top-right), uneven `padding` (`[0,0,8,8]` pushes it up-right), a slot resized later without auto layout, or a glyph that is itself off-centre (a text arrow `→`, an SVG whose path is not centred in its viewBox). `justify` is the slot's own primary axis: horizontal in a HORIZONTAL slot, vertical in a VERTICAL one — set both to CENTER and the axis does not matter. Use SVG, not text characters, for icons. `render_tree`, `update_nodes` and `create_component_set` measure every icon slot (≤ 64×64 frame with one icon) they touch and return `warnings: ["icon-offcenter …"]` with the cause; fix that slot before moving on.

## 3. Paints and effects people get wrong

```jsonc
"fill": { "gradient": "LINEAR", "angle": 135, "stops": [ { "color": "#F59E0B", "position": 0 }, { "color": "#EF4444", "position": 1 } ] }
"fill": [ { "image": "/abs/bg.png", "scaleMode": "FILL" }, { "gradient": "LINEAR", "angle": 180, "stops": [ { "color": "#0B061800", "position": 0.3 }, { "color": "#0B0618E6", "position": 0.66 } ] } ]
"effects": [ { "type": "DROP", "x": 0, "y": 4, "blur": 12, "spread": 0, "color": "#00000026" } ]   // DROP | INNER (not DROP_SHADOW)
```

## 4. Sizing rules (the source of most failures)

- Auto-layout frames without `width`/`height` **hug** their content.
- A frame **without `layout`** keeps a given `width` + `height`. With neither it shrinks to its children (a 44×44 icon button becomes 22×22). With only one it gets **100** on the other axis (`height: 44` alone → 100×44: a pill instead of a circle). Its children sit at (0,0) and are never centred. For an icon slot or round button use `layout: "HORIZONTAL"`, `justify: "CENTER"`, `align: "CENTER"`, plus both sizes.
- A frame dropped into a **Section** (no auto layout) lands at (0,0) on top of its siblings: wrap the set in an auto-layout frame, or give `x`/`y`.
- `{var: "space/9"}` resolves by name. When Primitives and Semantic share a name the bare name binds the non-primitive one; write `"Primitives/space/9"` only for foundations charts that show the primitive tier.
- `widthMode: "FILL"` only inside an auto-layout parent, never on the root (explicit error, safe retry).
- Text wraps only with a width — `widthMode: "FILL"` or fixed `width`. A long label in a row needs `FILL` on the text, otherwise it overflows.
- Compose with `gap`, `padding`, `justify`, `align`; `x`/`y` only on `absolute: true` children (the parent must have auto layout), children of `layout: "NONE"` parents (plain `x`/`y`, no `absolute`) or the root.
- Push a footer down with `justify: "SPACE_BETWEEN"` on the parent, or give the middle region `heightMode: "FILL"`.
- Canvases: 390×844 (iPhone 15), 393×852, 360×800 (Android), 1440 desktop. Mobile side padding 16–24.

## 5. Building in passes

**Screen frames:** `device: "mobile"` (393×852, iOS and Android) or `device: "tablet"` (834×1194, `orientation: "landscape"` for 1194×834) sets the fixed size, `clip: true`, the platform column grid and two safe-area row bands (orange, layout grid only — no layers, nothing in exports). Explicit `width`/`height`/`clip`/`layoutGrids` win (explicit `layoutGrids` also drops the safe-area bands); test sizes (375, 440) = `device` + `width`. Keep content out of the bands: header `paddingTop` ≥ the top band, footer `paddingBottom` ≥ the bottom band.

**Duo foldable:** `device: "duo-outer"` (466×678, radius 0/40/40/0) and `"duo-inner"` (951×669, radius 36) have a fixed height and no status bar or home indicator. The system UI is an 84 px rail on the right: safe-area column (orange) + `overlay/system-chrome` (camera on outer, time, status; absolute, locked). Inner adds `overlay/hinge` (x 462, 27 wide): keep text and controls off it. Build the screen as `layout: "HORIZONTAL"` → `Content` (FILL, padding 20) + `Vertical Bar` (84 FIXED, FILL height, padding top 172 outer / 122 inner, 24 right, 12 left): Back → prominent action → toolbar group → flexible space → tab bar (inner: compressed to the selected tab, sidebar navigates). `orientation` is ignored.

Pass mechanics (process and checks: `../process/build-loop.md`):

```text
Pass 1  render_tree{tree: <frame + regions + sized placeholder blocks>}   → rootId, ids
        get_node{ids:[rootId], depth:2}  →  one screenshot{id: rootId}
Pass 2  create_component_set{…}  for blocks repeated ≥ 3×
        render_tree{parentId: ids["Screen/Content/Hero"], tree}          → fill a placeholder in place
        delete_nodes + render_tree{parentId: <region>, index, tree}      → or replace it (instance, image)
        update_nodes{updates:[…]}                                        → text, icons, colours in batches
        get_node / write bounds after each write → one screenshot{id: rootId} at the end
Pass 3  audit_design{rootId} → stress_test{id: rootId} → update_nodes fixes → screenshot{id, scale: 1}
```

- `render_tree` with `parentId` appends into that frame (`index` to insert at a position). The new subtree's `ids` keys start at the subtree root, not the screen.
- Give regions their final sizing in Pass 1: `widthMode: "FILL"` inside the vertical root, `heightMode: "FILL"` for the scrolling content, `HUG` for header/footer. Placeholder blocks get a fixed size, a temporary tint (`#FF00001A`) and, if they will hold children, their final `layout`/`gap`/`padding`.
- A frame given a `width` inside auto layout must also get `widthMode: "FIXED"`, otherwise it hugs its content and clips absolute children (same for height).
- One write may fill several neighbouring placeholders: wrap them in the region's call, or send consecutive calls without screenshots in between.
- A placeholder's fixed height was an estimate: set `heightMode: "HUG"` once real content defines it.

The build loop locks the layout first, then fills it:

```jsonc
// Pass 1 — frame + regions + sized placeholder blocks (1 call)
{ "tree": { "type": "frame", "name": "Paywall / Timeline", "device": "mobile",
  "layout": "VERTICAL", "fill": { "var": "color/bg/default" },
  "children": [
    { "type": "frame", "name": "Header",  "layout": "HORIZONTAL", "widthMode": "FILL", "padding": [54, 24, 8, 24], "justify": "SPACE_BETWEEN", "align": "CENTER" },
    { "type": "frame", "name": "Content", "layout": "VERTICAL",   "widthMode": "FILL", "heightMode": "FILL", "padding": [0, 24], "gap": 24, "children": [
      { "type": "frame", "name": "Hero",     "widthMode": "FILL", "height": 208, "fill": "#FF00001A" },
      { "type": "frame", "name": "Timeline", "widthMode": "FILL", "height": 216, "layout": "VERTICAL", "gap": 16, "fill": "#FF00001A" } ] },
    { "type": "frame", "name": "Footer",  "layout": "VERTICAL",   "widthMode": "FILL", "padding": [12, 24, 34, 24], "gap": 8, "children": [
      { "type": "frame", "name": "CTA", "widthMode": "FILL", "height": 56, "fill": "#FF00001A" } ] }
  ] } }

// Pass 2 — fill a placeholder in place (it already has its layout) …
{ "parentId": "<Timeline id>", "tree": { "type": "instance", "component": "Timeline step", "widthMode": "FILL" } }
// … or replace one: delete_nodes the placeholder, then insert at its index
{ "parentId": "<Footer id>", "index": 0, "tree": { "type": "instance", "component": "Button", "variant": { "Variant": "Primary" }, "widthMode": "FILL" } }
```

- Placeholder tints show the layout in the Pass 1 screenshot; clear them (`update_nodes` fill → token, or `[]`) when filling.
- Read the frame back with `get_node{ids:[rootId], depth: 2}` to confirm sizing modes and that everything fits before filling.
- A frame with a `width` inside auto layout also needs `widthMode: "FIXED"`, or it hugs its content.

## 6. Traps met on real builds

Moved to `../knowledge/traps.md` (one list for every skill): text outside auto layout, `svg` `color`, SVG `<pattern>`, rich text, rows past the edge, two-size numbers, emoji.


## 7. update_nodes

```jsonc
{ "updates": [ { "id": "12:34", "props": { "text": "New", "fill": { "var": "color/primary" } } } ] }
```

`props` accepts every render_tree key that makes sense on an existing node, plus on instances `variant`, `properties` (by name; `#id` suffix optional), `texts` (by text layer name) and `component` (swap); on connectors `from`/`to` and `fromMagnet`/`toMagnet` re-attach an end (a magnet alone keeps the current target). Text inside an instance: id `I1006:42;1006:41`. Failures come back per item in `failed`; the rest landed.
