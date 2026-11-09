# Research: Slides Integration

**Date**: 2026-11-09 · **Feature**: `specs/002-slides-integration/spec.md`

Nguồn: `@figma/plugin-typings` (bundled) + đo live trên deck "How to Use Figma Slides" (editor `slides`, grid 1×1 rồi 1×2 sau khi tạo slide). Không còn NEEDS CLARIFICATION chặn code.

## Decision 1: Bật editor Slides qua manifest

- **Decision**: `editorType` thành `["figma", "figjam", "slides"]`; runtime phân biệt bằng `figma.editorType === 'slides'` mỗi lệnh (không cache — cùng bundle phục vụ mọi file).
- **Rationale**: `editorType` gating nơi plugin hiện + API tạo slide (`createSlide`, `createSlideRow` ném nếu manifest thiếu). Live cho thấy dev-plugin chạy được trong Slides kể cả khi manifest chưa khai — nhưng bản release phải khai đúng để user cài từ Community thấy được.
- **Alternatives considered**: Plugin riêng cho Slides — loại: nhân đôi build/panel/token vô ích.

## Decision 2: Cái bẫy lớn nhất — Single Slide View tự treo node vào focusedSlide

- **Decision**: Mọi write trong Slides **bắt buộc `parentId` tường minh** (slide/frame cần chứa). Tài liệu + quickstart cấm rely vào default parenting. `renderTree` mặc định `figma.currentPage` chỉ dùng cho Design/FigJam; trong Slides nếu thiếu `parentId` thì hoặc báo lỗi hướng dẫn, hoặc resolve về `focusedSlide` và ghi rõ trong kết quả (chọn: báo lỗi nhẹ + auto-fallback có ghi chú — đã chọn **fallback có ghi chú** để tương thích hành vi Figma gốc).
- **Rationale**: Typings: *"khi ở Single Slide View, mọi create* append vào focused slide thay vì canvas"*. Agent không kèm parent sẽ vẽ nhầm slide. Live: `execute_code{createText + appendChild(slide)}` tường minh luôn đúng; `render_tree` không parent trong Slides là trường hợp duy nhất còn mập mờ.
- **Alternatives considered**: Ép `parentId` bắt buộc trong schema Slides — loại: phá tính tương thích schema chung; fallback có ghi chú vừa an toàn vừa không đổi contract.

## Decision 3: Mở rộng DSL — thêm `slide` (và `slide-row` khi cần)

- **Decision**: Thêm `SlideSpec` vào union `TreeNode`: `{ type: 'slide', row?, col?, transition?, skipped? }` → `figma.createSlide(row, col)`; children là nội dung slide (build đệ quy như frame). `slide-row` hoãn lại trừ khi manual test đòi (hàng chỉ là nhóm trình bày, `setCanvasGrid` đã sắp được hàng).
- **Rationale**: Hôm nay tạo slide chỉ có `execute_code`; chuyên nghiệp phải là DSL một lệnh như FigJam (`sticky`/`shape`). Children của slide build y như children của frame — tái dùng `build()` + rollback.
- **Alternatives considered**: Tool MCP mới `create_slide` — loại: trùng `render_tree` pipeline (rollback/ids-map/undo); mở rộng union rẻ hơn.

## Decision 4: Đọc — serializer học SLIDE/SLIDE_GRID/SLIDE_ROW + transition/skipped

- **Decision**: `Serializer.node()` thêm nhánh:
  - `SLIDE`: size 1920×1080, `layoutGrids`, fill, `transition: {style, duration}` (qua `getSlideTransition()`), `isSkippedSlide`, `childCount` + children như frame.
  - `SLIDE_GRID`/`SLIDE_ROW`: header + `childCount` + children (không cố serialize geometry vô nghĩa).
  - `INTERACTIVE_SLIDE_ELEMENT`: header + `readOnly: true` + `elementType`.
  - Mọi nhánh khác (TEXT/RECT/ELLIPSE/GROUP/FRAME/INSTANCE/VECTOR…) **giữ nguyên** — live chứng minh đã đúng (text 72pt, gradient LINEAR, instance remote key đều serialize chuẩn).
- **Rationale**: Cùng triết lý Design/FigJam (trả về từ vựng DSL-tương thích). Không đụng `getTopLevelFrame()` (Design-only, ném trong Slides).
- **Alternatives considered**: Full serialize transition enum dài — giữ nguyên object `{style, duration, curve}` của API, không rút gọn.

## Decision 5: Guard layoutSizing trong Slides (bug gặp live)

- **Decision**: Trong `applyPlacement`, chỉ **tự gán** `HUG` khi `editorType !== 'slides'`. `widthMode/heightMode` tường minh của agent vẫn gán (lỗi thật của API được phép nổ để agent học).
- **Rationale**: Live: `render_tree` text trong slide fail `in set_layoutSizingHorizontal: node must be an auto-layout frame or a child of an auto-layout frame` vì auto-HUG. Rect (không HUG) pass. Direct `createText` pass. Fix một dòng, đã build.
- **Alternatives considered**: try/catch nuốt lỗi sizing — loại: che lỗi agent cần thấy khi họ cố tình set FILL sai chỗ.

## Decision 6: Grid API — mới + deprecated song song

- **Decision**: Dùng `getCanvasGrid`/`setCanvasGrid` khi tồn tại, fallback `getSlideGrid`/`setSlideGrid` (deprecated nhưng template cũ vẫn trả). `set*` **đòi đủ mọi slide** — thiếu là lỗi, plugin không tự vá.
- **Rationale**: Typings đánh deprecated cặp cũ, nhưng deck live trả cả hai. Hỗ trợ cả hai thì mọi deck đều chạy.
- **Alternatives considered**: Chỉ dùng API mới — loại: gãy deck/client cũ.

## Decision 7: Design-only trong Slides — bảo thủ trước, nới sau khi đo live

- **Decision**: Tạm áp cùng danh sách FigJam (`set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `render_foundations`, `create_component_set`, `stress_test`, `get_design_system`, `search_design_system`) + từ chối khi `editorType === 'slides'` với message `"<tool> is Design-only and has no effect in this Slides deck."`. Task live đo từng tool: cái nào chạy tốt trong Slides thì **ungate** có ghi chú (variables/styles nhiều khả năng sống trong Slides vì template dùng chúng).
- **Rationale**: An toàn hơn hối hận trên deck người khác. Plugin-side guard là choke point duy nhất như FigJam.
- **Alternatives considered**: Ungate hết rồi chặn dần — loại: rủi ro phá deck.

## Decision 8: Những gì giữ nguyên

- **Decision**: `get_document_info`, `set_current_page`, `manage_pages`, `get_selection`, `get_node`, `find_nodes`, `list_fonts`, `screenshot`, `select_nodes`, `delete/move/clone`, `export_assets`, `execute_code`, single-undo `commitUndo`, rollback `RolledBackError`, hub routing, token, version stamp — không đổi.
- **Rationale**: Live xác nhận đọc/selection/screenshot/multi-file đều chạy trong Slides. `update_nodes` chỉ cần đường HUG-guard (Decision 5).
- **Alternatives considered**: Không có — diff tối thiểu là mục tiêu.

## Decision 9: Chiến lược test

- **Decision**: `tests/slides.test.ts` — zod `SlideSpec` (row/col/transition/skipped, children), serializer stubs (SLIDE transition/skipped, GRID/ROW, INTERACTIVE readOnly), guard HUG (auto-HUG bị chặn trong Slides, tường minh vẫn qua), refusal vocabulary Slides; manual checklist vào `TESTING.md` §Slides + `quickstart.md` (đọc/ghi/slide/grid/undo/reconnect/lỗi HUG/dấu tiếng Việt).
- **Rationale**: Ngang bar repo (unit + e2e + manual canvas). E2E Slides thật không chạy trong CI — như Design/FigJam.
