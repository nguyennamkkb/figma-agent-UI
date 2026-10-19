# render_tree / update_nodes DSL

## Contents
1. Arguments
2. Node vocabulary
3. Paints and effects people get wrong
4. Sizing rules (the source of most failures)
5. Building level by level
6. update_nodes

---

## 1. Arguments

`tree` (required) · `parentId` + `index` to build **inside** an existing frame · `defaultFont` when the product does not use Inter · `select: false` to keep the user's view still.

Result: `rootId`, `created`, `bounds`, `ids` keyed by name path (`"Login/Form/Email"`; repeats get `#2`, `#3`). Keys are strict — an unknown key is rejected and named in the error, and the partial tree is removed.

## 2. Node vocabulary

Types: `frame`, `text`, `rect`, `ellipse`, `svg`, `image`, `instance`, `section`.

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

Other keys: `widthMode`/`heightMode` (`FIXED|HUG|FILL`), `min/maxWidth`, `min/maxHeight`, `absolute` + `x`/`y`, `opacity`, `visible`, `rotation`, `clip`, `wrap` + `counterGap`, `component: true` (+ `description`); on text `fontFamily`, `fontStyle`, `textAlign`, `verticalAlign`, `textCase`, `decoration`, `textStyle`. **Any number may be `{ "var": "space/4" }`** and any colour `{ "var": "color/text/primary" }` — use them whenever the file has tokens.

`section`: `{type: "section", name, children: [frames], gap 200, padding 80, fill}` — screens of one flow, auto-placed left to right.

## 3. Paints and effects people get wrong

```jsonc
"fill": { "gradient": "LINEAR", "angle": 135, "stops": [ { "color": "#F59E0B", "position": 0 }, { "color": "#EF4444", "position": 1 } ] }
"fill": [ { "image": "/abs/bg.png", "scaleMode": "FILL" }, { "gradient": "LINEAR", "angle": 180, "stops": [ { "color": "#0B061800", "position": 0.3 }, { "color": "#0B0618E6", "position": 0.66 } ] } ]
"effects": [ { "type": "DROP", "x": 0, "y": 4, "blur": 12, "spread": 0, "color": "#00000026" } ]   // DROP | INNER (not DROP_SHADOW)
```

## 4. Sizing rules (the source of most failures)

- Auto-layout frames without `width`/`height` **hug** their content.
- `widthMode: "FILL"` only inside an auto-layout parent, never on the root (explicit error, safe retry).
- Text wraps only with a width — `widthMode: "FILL"` or fixed `width`. A long label in a row needs `FILL` on the text, otherwise it overflows.
- Compose with `gap`, `padding`, `justify`, `align`; `x`/`y` only on `absolute: true` children, `layout: "NONE"` parents or the root.
- Push a footer down with `justify: "SPACE_BETWEEN"` on the parent, or give the middle region `heightMode: "FILL"`.
- Canvases: 390×844 (iPhone 15), 393×852, 360×800 (Android), 1440 desktop. Mobile side padding 16–24.

## 5. Building level by level

The build loop in figma-ui-flow writes one level or one region per call:

```jsonc
// L1 — frame + empty named regions (allowed in one call)
{ "tree": { "type": "frame", "name": "Paywall / Timeline", "width": 390, "height": 844,
  "layout": "VERTICAL", "fill": { "var": "color/bg/default" }, "layoutGrids": { "preset": "mobile" },
  "children": [
    { "type": "frame", "name": "Header",  "layout": "HORIZONTAL", "widthMode": "FILL", "padding": [54, 24, 8, 24], "justify": "SPACE_BETWEEN", "align": "CENTER" },
    { "type": "frame", "name": "Content", "layout": "VERTICAL",   "widthMode": "FILL", "heightMode": "FILL", "padding": [0, 24], "gap": 24 },
    { "type": "frame", "name": "Footer",  "layout": "VERTICAL",   "widthMode": "FILL", "padding": [12, 24, 34, 24], "gap": 8 }
  ] } }

// L2 — one region per call, into the id returned for "Paywall / Timeline/Content"
{ "parentId": "<Content id>", "tree": { "type": "frame", "name": "Timeline", "layout": "VERTICAL", "widthMode": "FILL", "children": [ … ] } }
```

- Empty frames show nothing in a screenshot: give regions a temporary tint (`fill: "#FF00001A"`) during L1 if you need to see them, then `update_nodes` the fill back (or to the token) at L2.
- Read the frame back with `get_node{ids:[rootId], depth: 1}` to confirm `widthMode`/`heightMode`/padding before filling it.
- Need a block in the middle of a region later? `render_tree{parentId, index}`.

## 6. update_nodes

```jsonc
{ "updates": [ { "id": "12:34", "props": { "text": "New", "fill": { "var": "color/primary" } } } ] }
```

`props` accepts every render_tree key that makes sense on an existing node, plus on instances `variant`, `properties` (by name; `#id` suffix optional), `texts` (by text layer name) and `component` (swap). Text inside an instance: id `I1006:42;1006:41`. Failures come back per item in `failed`; the rest landed.
