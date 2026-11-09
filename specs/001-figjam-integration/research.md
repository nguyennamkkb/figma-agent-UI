# Research: FigJam Integration

**Date**: 2026-11-09 · **Feature**: `specs/001-figjam-integration/spec.md`

All unknowns resolved by reading `@figma/plugin-typings` (bundled) + official FigJam plugin docs. No open NEEDS CLARIFICATION.

## Decision 1: Editor enablement via manifest

- **Decision**: Add `"figjam"` to `editorType` in `manifest.json` (`["figma", "figjam"]`); detect runtime editor with `figma.editorType === 'figjam'` in plugin commands.
- **Rationale**: `editorType` gates both where the plugin appears and which creation APIs exist (`createSticky`, `createShapeWithText`, `createConnector`, `createCodeBlock`, `createTable`, `createGif` throw unless the manifest includes figjam). `figma.editorType` is the documented runtime discriminator (`'figma' | 'figjam' | 'dev' | 'slides' | 'buzz'`).
- **Alternatives considered**: Two separate plugins (Design + FigJam) — rejected: doubles build/panel/token plumbing for zero benefit; one bundle already stamps version+build for both.

## Decision 2: DSL extension shape (render_tree / update_nodes)

- **Decision**: Add five DSL node types to the shared zod union in `src/shared/schemas.ts`, reusing `baseProps` (name/x/y/fills/strokes/effects/opacity):
  - `sticky`: `{ text, color?, isWide? }` → `figma.createSticky()`, text via `TextSublayerNode` (font load required, like TEXT).
  - `shape`: `{ shape, text?, ... }` (`shape` = `ShapeWithTextNode['shapeType']`) → `figma.createShapeWithText()`.
  - `connector`: `{ from, to, lineType?, caps?, text? }` (`from`/`to` = node ids) → `figma.createConnector()`, then assign `connectorStart`/`connectorEnd` endpoint objects.
  - `code`: `{ code, language? }` → `figma.createCodeBlock()`.
  - `table`: `{ rows, columns, cells? }` (`cells` = row-major string matrix) → `figma.createTable()`, then fill via `cellAt(r, c).text.characters`.
  - Media/gif: reuse existing `image` spec (rectangle + IMAGE fill works in both editors); `createGif` deferred unless the manual test proves a need.
- **Rationale**: Keeps one DSL, one `build()` recursion, one rollback wrapper. `baseProps` reuse means placement/selection/ids-map behavior is identical.
- **Alternatives considered**: Separate `render_figjam` tool — rejected: duplicatesitt rollout, rollback, ids-map, and server `prepare()` (image inlining) logic.

## Decision 3: Connector endpoint resolution within one call

- **Decision**: Two-pass build — pass 1 builds every non-connector node (recording ids-map keys as usual), pass 2 builds connectors resolving `from`/`to` against either literal node ids or ids-map keys produced in pass 1 of the same call.
- **Rationale**: The professional use case (shape → connector → shape in one call) is otherwise impossible without a second round-trip; literal ids still work for wiring pre-existing nodes.
- **Alternatives considered**: Ids-only (two calls per diagram) — rejected: doubles latency and breaks the "one call per region" flow rule.

## Decision 4: Read path (serialize.ts)

- **Decision**: Extend `Serializer.node()` with FigJam branches; everything else (depth cap, `maxNodes` truncation, hex colors, `{var}` aliases) is editor-agnostic and untouched:
  - `STICKY`: `text.characters` (+ author via `authorName`).
  - `SHAPE_WITH_TEXT`: `shapeType` + text.
  - `CONNECTOR`: `connectorLineType`, start/end endpoint summary (node id + position), caps, label text.
  - `TABLE`: `numRows`/`numColumns` + cell text matrix via `cellAt` (bounded by the same maxNodes budget).
  - `CODE_BLOCK`: `code` (truncated like TEXT) + `codeLanguage`.
  - `MEDIA`: type + dimensions (+ `playerUrl` when present).
  - `WIDGET`/`STAMP`/`BOOLEAN_OPERATION` in FigJam: serialize header only + `readOnly: true` marker.
  - `MEDIA`: type + dimensions (+ `playerUrl` when present, board-budget permitting).
- **Rationale**: Same vocabulary philosophy as Design (`get_node` returns DSL-compatible fields). Variables/styles branches are skipped in FigJam (no variables API there — `figma.variables` Design-only).
- **Alternatives considered**: Full cell-by-cell children recursion for tables — rejected: explodes node budget; matrix summary is what the agent needs.

## Decision 5: Design-only gating

- **Decision**: Gate in the **plugin** (`main.ts` command wrapper or per-command guard via `figma.editorType`), refusing with a fixed vocabulary: `"<tool> is Design-only and has no effect on this FigJam board."` Tools gated: `set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `render_foundations`, `create_component_set`, `stress_test`, `get_design_system`, `search_design_system` (library/variable search is Design-centric).
- **Rationale**: Plugin-side is the single choke point — the MCP server stays editor-agnostic and multi-file routing keeps working. `safeToRetryWithoutCanvasRead: true` since nothing mutates.
- **Alternatives considered**: Server-side gating by tracking each file's editor — rejected: duplicates state the plugin already owns; hello/info would need a protocol bump.

## Decision 6: What keeps working unchanged in FigJam

- **Decision**: No changes needed for `get_document_info`, `set_current_page`, `manage_pages` (FigJam has pages), `get_selection`, `get_node`, `find_nodes`, `list_fonts` (returns installed fonts; FigJam text uses them), `screenshot` (`exportAsync` works on FigJam nodes), `select_nodes`, `delete/move/clone`, `export_assets`, `execute_code`.
- **Rationale**: Verified against typings — these APIs are editor-agnostic. `update_nodes` needs only the FigJam text-sublayer path (Decision 7).
- **Alternatives considered**: None — minimal diff is the point.

## Decision 7: Text editing on FigJam sublayers

- **Decision**: Add a FigJam text path in `apply.ts`: when the node is STICKY/SHAPE_WITH_TEXT/TABLE_CELL/CONNECTOR, load the font then assign `node.text.characters` (TextSublayerNode shares the font-loading requirement with TextNode). Reuse `resolveFill` for `fills` (all five types mix in `MinimalFillsMixin`).
- **Rationale**: `applyText` targets `TextNode` only; sublayers need the same treatment through a different handle.
- **Alternatives considered**: Converting sublayer edits via `execute_code` — rejected: loses batch `failed`-per-id semantics and undo grouping.

## Decision 8: UI panel, token, hub

- **Decision**: No changes. `ui.html` is editor-agnostic postMessage plumbing; the token file, hub election, port range, and version-stamp check work identically. The panel shows the FigJam file name like any other file.
- **Rationale**: Verified by reading `main.ts` clientInfo + bridge — nothing in the path is Design-specific.

## Decision 9: Testing strategy

- **Decision**: `tests/figjam.test.ts` (zod DSL validation incl. connector refs and table matrix bounds) + serializer unit tests against stub FigJam nodes + reuse of the existing fake-plugin e2e harness if it can host FigJam types, else a stub-node harness; manual checklist appended to `TESTING.md` for a scratch FigJam board (create/read/connect/undo/reconnect/Design-only error).
- **Rationale**: Matches repo bar (unit + e2e + manual canvas). E2E cannot run FigJam for real in CI — same limitation as Design canvas tests today.
