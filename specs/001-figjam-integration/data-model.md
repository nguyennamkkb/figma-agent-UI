# Data Model: FigJam Integration

**Date**: 2026-11-09 · No persisted storage; entities are DSL specs, serialized views, and routing state. All new, no migrations.

## 1. DSL specs (agent → plugin, zod in `src/shared/schemas.ts`)

| Spec | Key fields | Validation rules |
|---|---|---|
| `StickySpec` (`type: 'sticky'`) | `text: string`, `color?: Fill`, `isWide?: boolean` | `text` non-empty; color = hex or `{var}` (vars resolve Design-side; in FigJam a `{var}` fill is a lint error at `prepare`, not silent fallback) |
| `ShapeSpec` (`type: 'shape'`) | `shape: ShapeType`, `text?: string` | `shape` ∈ `ShapeWithTextNode['shapeType']` enum (SQUARE, DIAMOND, CHEVRON …); unknown value → zod error listing valid values |
| `ConnectorSpec` (`type: 'connector'`) | `from`, `to: string` (node id or same-call ids-map key), `lineType?: ELBOWED\|STRAIGHT\|CURVED`, `caps?: {start?, end?}`, `text?` | `from`/`to` must resolve post-pass-1 or the whole call rolls back; self-loop (`from === to`) rejected |
| `CodeSpec` (`type: 'code'`) | `code: string`, `language?: CodeLanguage` | `code` non-empty; `language` ∈ typings enum, default PLAINTEXT |
| `TableSpec` (`type: 'table'`) | `rows: int ≥ 1`, `columns: int ≥ 1`, `cells?: string[][]` | `cells` dimensions must equal rows×columns when present; cap rows×columns ≤ 400 (board-budget guard) |

All five reuse `baseProps` (name, x/y, width/height sizing where the API allows, fills, strokes, effects, opacity, visible, locked). `TreeNode` discriminated union gains the five variants; `UpdateProps` gains `text` routing to the sublayer path + connector `from`/`to` reassignment.

## 2. Serialized views (plugin → agent, `serialize.ts`)

| Node type | Emitted fields |
|---|---|
| STICKY | `text`, `author` (authorName), fill hex |
| SHAPE_WITH_TEXT | `shape` (shapeType), `text` |
| CONNECTOR | `lineType`, `caps`, `from: {id, name}`, `to: {id, name}`, label `text` |
| TABLE | `rows`, `columns`, `cells: string[][]` (within node budget, else `cellsTruncated: true`) |
| CODE_BLOCK | `code` (400-char truncation like TEXT), `language` |
| MEDIA | `type` + dimensions (+ `playerUrl` when present) |
| WIDGET / STAMP / BOOLEAN_OPERATION (FigJam) | header + `readOnly: true`, no creation path |

Existing caps apply unchanged: `depth`, `maxNodes: 300` with `childrenTruncated`, paint/style aliasing skipped when inapplicable.

## 3. Routing & gating state (no new persisted state)

- **Editor detection**: `figma.editorType` read per command invocation in the plugin (never cached — the same bundle serves both editors across files).
- **Design-only refusal** (FR-009 vocabulary, `safeToRetryWithoutCanvasRead: true`): `set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `render_foundations`, `create_component_set`, `stress_test`, `get_design_system`, `search_design_system`.
- **Multi-file routing**: unchanged — file picker/`file` param/`preferredFileKey` pinning already disambiguate; a FigJam board appears as one more connected file.

## 4. State transitions

- `ConnectorSpec.from/to`: unresolved string → resolved node (pass 2) → endpoint assigned; any failure → `RolledBackError`, board unchanged.
- Board write lifecycle (unchanged from Design): build → single `commitUndo` → ids-map returned; failure mid-build → root removed.
