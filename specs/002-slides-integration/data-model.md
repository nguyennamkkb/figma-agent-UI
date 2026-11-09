# Data Model: Slides Integration

**Date**: 2026-11-09 · Không persisted storage; entities là DSL specs, serialized views, routing state. All new, no migrations.

## 1. DSL specs (agent → plugin, zod trong `src/shared/schemas.ts`)

| Spec | Key fields | Validation rules |
|---|---|---|
| `SlideSpec` (`type: 'slide'`) | `row?: int ≥ 0`, `col?: int ≥ 0`, `transition?: { style?, duration? }`, `skipped?: boolean`, `children?: TreeNode[]` | `row/col` khi có phải ≥ 0; `transition.style` ∈ enum SlideTransition của typings; children build đệ quy như frame |
| (hoãn) `SlideRowSpec` | — | Chưa thêm; hàng quản lý qua `setCanvasGrid`. Thêm khi manual test chứng minh cần |

`SlideSpec` tái dùng `baseProps` ở mức hợp lý (name/x/y bỏ qua cho slide — vị trí do grid quyết; fills/strokes/effects áp cho nội dung, không cho slide container). `TreeNode` union thêm `SlideSpec`; `UpdateProps` thêm `skipped?: boolean` + `transition` cho slide.

## 2. Serialized views (plugin → agent, `serialize.ts`)

| Node type | Emitted fields |
|---|---|
| SLIDE | `width/height` (1920×1080), `layoutGrids`, `fill` (+ `{var}` bí danh), `transition {style, duration, curve}`, `skipped`, `childCount` + children |
| SLIDE_GRID / SLIDE_ROW | `childCount` + children (hàng → slides), không geometry |
| INTERACTIVE_SLIDE_ELEMENT | `elementType`, `readOnly: true`, header hình học |
| TEXT/RECT/ELLIPSE/GROUP/FRAME/INSTANCE/VECTOR trong slide | giữ nguyên như Design (đã đúng live) |

Caps hiện có giữ nguyên: `depth`, `maxNodes: 300` + `childrenTruncated`.

## 3. Routing & gating state (không persisted state mới)

- **Editor detection**: `figma.editorType` đọc mỗi lệnh (không cache).
- **Slides refusal** (tạm, FR-008; chốt sau đo live): cùng 13 tools FigJam — `set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `render_foundations`, `create_component_set`, `stress_test`, `get_design_system`, `search_design_system`. Vocabulary: `"<tool> is Design-only and has no effect in this Slides deck."`, `safeToRetryWithoutCanvasRead: true`.
- **Parenting rule**: write Slides thiếu `parentId` → fallback `focusedSlide ?? currentPage`, trả thêm `parentNote` trong kết quả để agent biết node rơi vào đâu.
- **Multi-file routing**: không đổi — deck Slides là thêm một file trong hub.

## 4. State transitions

- `SlideSpec(row,col)` → `createSlide(row, col)` → slide mới trong grid → children build vào slide → single `commitUndo` → ids-map. Lỗi giữa chừng → `RolledBackError`, grid + canvas nguyên vẹn (slide dở bị gỡ).
- Grid reorder: đọc grid → sắp lại mảng (đủ mọi slide) → `setCanvasGrid` → deck đổi thứ tự; thiếu slide → API từ chối, không đổi gì.
- `layoutSizing` trong Slides: không tự gán HUG; giá trị tường minh đi thẳng tới API (đúng thì ăn, sai thì lỗi thật).
