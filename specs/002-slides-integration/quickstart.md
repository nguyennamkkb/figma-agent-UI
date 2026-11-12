# Quickstart: Slides Integration validation

Chứng minh end-to-end trên deck thật. Chạy sau `npm run build` + **re-import plugin** (manifest đổi `editorType`) + đóng/mở lại plugin.

## Prerequisites

1. Deck scratch (bản sao template "How to Use Figma Slides" — không bao giờ deck thuyết trình thật).
2. Plugin mở trong deck, connected (cùng token `~/.figma-agent/token`).
3. `figma_status` thấy deck, `versionCheck` ✅, `missingCommands` rỗng.

## Validation scenarios

### 1. Đọc deck (FR-003, SC-001)

1. `get_document_info` → thấy `SLIDE_GRID` + `SLIDE`, selection đúng slide đang focus.
2. `get_node{ids:[<slideId>], depth:2}` → 16 con mẫu, text/font/gradient/instance remote đủ.
3. `execute_code{getCanvasGrid() fallback getSlideGrid()}` → ma trận hàng × slide đúng thứ tự.

Expected: deck lạ đọc một lần là kể đúng cấu trúc; interactive elements có `readOnly: true`.

### 2. Ghi có dấu vào slide (FR-004, FR-006, SC-002)

1. `render_tree{parentId: slideId, tree: {frame + text có dấu 64pt + rect bo góc}}` → pass (hết lỗi HUG), screenshot thấy chữ chuẩn.
2. `execute_code` tạo slide (0,0) + text 72pt có dấu → grid tăng 1 cột.

Expected: ≤ 2 write calls cho 1 slide mới hoàn chỉnh; mỗi call một Cmd+Z xóa sạch.

### 3. Grid + focus (FR-005)

1. Đọc grid → `setCanvasGrid` đảo thứ tự → đọc lại đúng → đảo về.
2. Chuyển Single Slide View → tạo node không parent → kết quả có `parentNote` chỉ vào focusedSlide.
3. `setSlideGrid` thiếu 1 slide → lỗi rõ, deck không đổi.

### 4. Từ chối优雅 (FR-008, SC-004)

`set_interactions`, `bind_variables`, `create_variables` vào deck → mỗi cái trả message §3, deck nguyên vẹn (so `get_node` trước/sau).

Ghi chú tool nào **chạy tốt** trong Slides để ungate (variables/styles nhiều khả năng sống).

### 5. Reconnect + version (FR-011, SC-005)

Đóng/mở plugin → tự connect, `figma_status` ✅. `render_tree` lỗi cố ý (parentId sai) → 0 node rác (SC-003, 10 lần fault-injection).

## Regression

`npm run typecheck && npm run lint && npm test` xanh; checklist Design + FigJam trong `TESTING.md` không ảnh hưởng.
