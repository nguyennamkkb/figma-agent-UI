# Contracts: FigJam Integration

No new MCP tools. Same tool names, extended inputs/outputs. The contract below is what agents and tests pin against.

## 1. `render_tree` — FigJam DSL additions

```jsonc
// sticky brainstorm cluster
{ "type": "sticky", "name": "idea-1", "text": "Onboarding checklist", "color": "#FFE066" }
// flow shape
{ "type": "shape", "name": "step", "shape": "ROUNDED_RECTANGLE", "text": "Sign up", "fill": "#E0F2FE" }
// connector, endpoints may be ids-map keys from the SAME call ("Board/step")
{ "type": "connector", "name": "flow", "from": "Board/step", "to": "1:234",
  "lineType": "ELBOWED", "caps": { "end": "ARROW_EQUILATERAL" } }
// code + table
{ "type": "code", "code": "npm test", "language": "BASH" }
{ "type": "table", "rows": 2, "columns": 3,
  "cells": [["a", "b", "c"], ["d", "e", "f"]] }
```

Rules: `from`/`to` resolve against pass-1 ids-map keys first, literal node ids second; unresolvable → whole call fails, board unchanged (`RolledBackError`). `cells` must be exactly rows×columns; rows×columns ≤ 400.

## 2. `get_node` — FigJam serialized shapes

```jsonc
{ "id": "1:10", "name": "idea-1", "type": "STICKY", "text": "Onboarding checklist", "author": "Nam", "fill": "#FFE066" }
{ "id": "1:11", "type": "CONNECTOR", "lineType": "ELBOWED",
  "from": { "id": "1:8", "name": "step" }, "to": { "id": "1:9", "name": "review" } }
{ "id": "1:12", "type": "TABLE", "rows": 2, "columns": 3, "cells": [["a","b","c"],["d","e","f"]] }
{ "id": "1:13", "type": "WIDGET", "readOnly": true }
{ "id": "1:14", "type": "MEDIA", "width": 320, "height": 240 }
```

## 3. Design-only refusal vocabulary (FR-009)

Any gated tool called on a FigJam board returns:

```jsonc
{ "ok": false, "error": "<tool> is Design-only and has no effect on this FigJam board.",
  "safeToRetryWithoutCanvasRead": true }
```

Gated: `set_interactions`, `annotate`, `set_dev_status`, `bind_variables`,
`create_variables`, `create_styles`, `import_tokens`, `export_tokens`,
`render_foundations`, `create_component_set`, `stress_test`,
`get_design_system`, `search_design_system`.
