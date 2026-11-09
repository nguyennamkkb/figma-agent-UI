# Quickstart: FigJam Integration validation

Proves the feature end-to-end on a real board. Run after `npm run build`.

## Prerequisites

1. Scratch FigJam board (never a live workshop board).
2. Plugin open in the FigJam file, connected (token already in `~/.figma-agent/token`).
3. `figma_status` shows the FigJam file, `versionCheck` ✅, `missingCommands` empty.

## Validation scenarios

### 1. Read the board (FR-003, SC-001)

1. `get_document_info` → board name + pages listed.
2. Select a sticky + shape + connector → `get_selection` shows `STICKY` text/author, `SHAPE_WITH_TEXT` shape/text, `CONNECTOR` from/to endpoints.
3. `get_node{ids:[<tableId>], depth:1}` → rows/columns/cell matrix.

Expected: every in-scope type identified; widgets/stamps carry `readOnly: true`.

### 2. Build a workshop starter (FR-004, SC-002)

One `render_tree` call: section "Workshop" + 2 labeled shapes joined by a connector + 3 colored stickies + 2×3 table.

Expected: all nodes placed, connector endpoints correct, one Cmd+Z removes everything.

### 3. Batch edit + failure isolation (FR-005, SC-003)

1. `update_nodes` retitles 2 stickies + 1 bad id → valid edits apply, bad id in `failed`.
2. `render_tree` with connector `from` pointing at a deleted id → error, board unchanged (zero leftovers).

### 4. Design-only refusal (FR-009, SC-004)

`set_interactions`, `bind_variables`, `create_variables` against the board → each returns the Design-only message, board unchanged.

### 5. Reconnect + version (FR-012, SC-005)

Close and reopen the plugin → auto-connects, no retyping. `figma_status` still ✅.

## Regression

`npm run typecheck && npm run lint && npm test` green; Design canvas checklist in `TESTING.md` unaffected.
