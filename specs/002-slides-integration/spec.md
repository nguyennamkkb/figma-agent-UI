# Feature Specification: Slides Integration

**Feature Branch**: `test/figma-motion` (spec directory independent of branch)

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Test tiếp với slide — dùng speckit nghĩ về một bước tiến lớn của slide, tài liệu hóa tất cả các trường hợp, sau đó code luôn"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent đọc deck Slides (Priority: P1)

Người dùng mở plugin trong file Figma Slides (template "How to Use Figma Slides" hoặc deck thật). Agent đọc cấu trúc deck: grid 2D (hàng × slide), từng slide (kích thước 1920×1080, layoutGrids, fill, transitions), nội dung trong slide (text/shapes/groups/instances), và slide đang focus.

**Why this priority**: Đọc là nền tảng an toàn (read-only). Không đọc đúng thì mọi ghi đều mù.

**Independent Test**: Với deck mẫu đang mở, `get_document_info` thấy `SLIDE_GRID` + `SLIDE`; `get_node{ids:[slideId], depth:2}` trả đúng 16 con, text tiếng Việt có dấu đầy đủ, fill `{var}` giữ nguyên bí danh.

**Acceptance Scenarios**:

1. **Given** deck có 1 hàng × 2 slides, **When** agent gọi `execute_code{getSlideGrid/getCanvasGrid}`, **Then** nhận đúng ma trận 1×2 theo thứ tự trình chiếu.
2. **Given** slide chứa text + gradient + instance remote, **When** serialize, **Then** text/font/size, gradient stops, component key remote đều có mặt; interactive elements gắn `readOnly: true`.

---

### User Story 2 - Agent ghi nội dung vào slide (Priority: P1)

Agent tạo text/hình chữ nhật/ellipse/vector vào slide có sẵn bằng `render_tree{parentId: slideId}` hoặc `execute_code`, chữ tiếng Việt có dấu render đúng, một lệnh ghi là một undo step, lỗi không để lại rác.

**Why this priority**: Giá trị cốt lõi: dựng slide, chèn tiêu đề, minh họa mà không phá deck mẫu.

**Independent Test**: Trên slide thử, một `render_tree` tạo text 64pt + rect bo góc; screenshot thấy chữ có dấu; một Cmd+Z xóa sạch.

**Acceptance Scenarios**:

1. **Given** slide rỗng vùng dưới, **When** tạo text "Xin chào Slides — tiếng Việt có dấu", **Then** text xuất hiện ở tọa độ yêu cầu, font đã load, không lỗi `layoutSizing`.
2. **Given** `render_tree` lỗi giữa chừng (id cha sai), **When** trả lỗi, **Then** slide không còn node dở nào.

---

### User Story 3 - Agent quản lý slides/grid (Priority: P2)

Agent tạo slide mới (`createSlide(row,col)`), tạo hàng (`createSlideRow`), sắp xếp lại grid (`getCanvasGrid`/`setCanvasGrid`), đọc slide đang focus (`focusedSlide`), nhân bản/xóa/di chuyển slide.

**Why this priority**: "Bước tiến lớn" của deck là cấu trúc: thêm/sắp xếp slide, không chỉ vẽ trong slide.

**Independent Test**: Tạo slide mới ở (0,0) rồi đếm grid tăng từ 1×1 lên 1×2; `setCanvasGrid` đảo thứ tự rồi đảo lại thành công.

**Acceptance Scenarios**:

1. **Given** deck 1 slide, **When** `createSlide(0,0)`, **Then** slide mới đứng đầu grid, tên theo yêu cầu.
2. **Given** deck 2 hàng, **When** `setSlideGrid` thiếu 1 slide, **Then** API từ chối (phải truyền đủ mọi slide hiện có) — plugin báo lỗi rõ, deck không đổi.
3. **Given** đang ở Single Slide View, **When** tạo node không kèm parent, **Then** node rơi vào `focusedSlide` (hành vi Figma), plugin tài liệu hóa và khuyến nghị luôn truyền `parentId` tường minh.

---

### User Story 4 - Chạy native trong editor Slides (Priority: P2)

Plugin mở được trong Slides, connect bằng cùng token, `figma_status` hiện file Slides, định tuyến đa file (Slides + Design + FigJam) không nhầm.

**Why this priority**: Không mở được trong Slides thì mọi story trên vô nghĩa. Manifest hôm nay thiếu `slides`.

**Independent Test**: Mở plugin trong Slides → connect thành công; `figma.editorType === 'slides'`; Design file song song không bị chạm.

**Acceptance Scenarios**:

1. **Given** plugin mở trong Slides, **When** connect, **Then** status hiện tên deck + `editorType: slides`.
2. **Given** 3 editors cùng connect, **When** gọi lệnh kèm `file`, **Then** đúng file nhận lệnh; thiếu `file` thì server hỏi lại thay vì đoán.

---

### User Story 5 - Công cụ Design-only suy giảm优雅 trong Slides (Priority: P3)

Các thao tác vô nghĩa trong Slides (prototype interactions kiểu Design, dev-mode annotations/status, bind variables, component set, stress test…) trả lời rõ ràng thay vì lỗi API khó hiểu. Danh sách chốt sau khi kiểm live từng tool.

**Why this priority**: Chuyên nghiệp là giải thích ranh giới, không để agent phá deck bằng lệnh sai editor.

**Independent Test**: Mỗi tool trong danh sách gọi vào Slides trả message `Design-only` (hoặc `Unsupported-in-Slides`), board không đổi, `safeToRetryWithoutCanvasRead: true`.

**Acceptance Scenarios**:

1. **Given** deck Slides, **When** gọi `set_interactions`, **Then** nhận giải thích Design-only, deck nguyên vẹn.
2. **Given** deck Slides, **When** `screenshot` slide, **Then** nhận ảnh xem được.

---

### User Story 6 - Được test như Design/FigJam (Priority: P3)

Unit test zod + serializer stubs cho SLIDE/SLIDE_GRID/SLIDE_ROW + e2e fake-plugin + checklist thủ công trên deck thật (đọc/ghi/slide mới/grid/undo/reconnect/lỗi HUG).

**Why this priority**: Ngang hàng repo (vitest + TESTING.md) để Slides support không mục sau merge.

**Independent Test**: `npm test` xanh khi không mở Figma; checklist đi hết trong một phiên trên deck scratch.

**Acceptance Scenarios**:

1. **Given** không mở Figma, **When** chạy suite, **Then** mọi test Slides pass.
2. **Given** deck scratch, **When** đi checklist, **Then** đọc/ghi/slide/grid/undo/reconnect đều đúng như tài liệu.

---

### Edge Cases

- Single Slide View tự động treo node mới vào `focusedSlide` thay vì `currentPage` — mọi write phải kèm `parentId` tường minh; tài liệu cấm rely vào default parenting trong Slides.
- `setSlideGrid`/`setCanvasGrid` đòi truyền **đủ mọi slide** — thiếu là lỗi; plugin không tự vá grid.
- `layoutSizingHorizontal/Vertical` (HUG tự gán) ném lỗi trong Slides khi cha không phải auto-layout — đã gặp live (`render_tree` text fail); fix: chỉ tự gán HUG ngoài Slides.
- `getTopLevelFrame()` chỉ chạy trong Design — gọi trong Slides ném; serialize/read không được dùng nó.
- Slide transition (`get/setSlideTransition`) + `isSkippedSlide` là thuộc tính slide, không phải frame thường.
- `INTERACTIVE_SLIDE_ELEMENT` (poll/embed/youtube…) chỉ đọc, không tạo/sửa qua API tạo hình cơ bản.
- Template deck dùng variables/styles remote (`How To Use Figma Slides/White`) — đọc giữ bí danh `{var}`/`{style}`, không resolve bừa.
- Deck hàng trăm slide: đọc phải giới hạn (depth/limit), không dump cả deck.
- Plugin build cũ (thiếu lệnh Slides): cảnh báo stale-build phải nổ như Design/FigJam.
- Không bao giờ test trên deck thuyết trình thật — chỉ deck scratch/bản sao template.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST tài liệu hóa bản đồ dùng Slides chuyên nghiệp (workflows → node types → API) biện minh phạm vi.
- **FR-002**: System MUST cho phép plugin chạy trong editor Slides với cùng token (manifest `editorType` gồm `slides`).
- **FR-003**: System MUST đọc deck: grid 2D, hàng, slide (size/fill/layoutGrids/transition/skipped), nội dung slide, slide đang focus, selection.
- **FR-004**: System MUST tạo/sửa nội dung trong slide (text có dấu, shapes, vectors, frames) qua `render_tree{parentId: slideId}` + `update/move/clone/delete`; mỗi write một undo; lỗi không để rác.
- **FR-005**: System MUST quản lý cấu trúc deck: `createSlide(row,col)`, `createSlideRow`, đọc/sắp xếp grid (`getCanvasGrid`/`setCanvasGrid`, tương thích `get/setSlideGrid` deprecated), `focusedSlide`, clone/delete/reorder slides.
- **FR-006**: System MUST không tự gán `layoutSizing` HUG trong Slides (chỉ ngoài Slides); `widthMode/heightMode` tường minh vẫn đi qua và báo lỗi thật nếu API từ chối.
- **FR-007**: System MUST định tuyến đúng file khi nhiều editors cùng connect; mơ hồ thì hỏi, không đoán.
- **FR-008**: System MUST từ chối优雅 các tool vô nghĩa trong Slides bằng message cố định, không đổi gì, `safeToRetryWithoutCanvasRead: true`.
- **FR-009**: System MUST giữ nguyên bí danh `{var}`/`{style}` khi đọc; surface interactive elements read-only.
- **FR-010**: System MUST giới hạn output đọc (depth/limit/maxNodes) cho deck lớn.
- **FR-011**: System MUST tái dùng phát hiện build cũ (version stamp) cho Slides.
- **FR-012**: System MUST phủ unit test + e2e không cần Figma + checklist thủ công deck thật cho logic Slides mới.

### Key Entities

- **Deck**: file Slides; chứa page → `SLIDE_GRID` → hàng → `SLIDE` (1920×1080). Thứ tự trong grid là thứ tự trình chiếu.
- **Slide**: khung trình chiếu; có transition, skipped flag, fill/layoutGrids; cha của mọi nội dung trình bày.
- **Focused slide**: slide đang mở trong Single Slide View; nơi Figma tự treo node tạo mới khi thiếu parent tường minh.
- **Interactive slide element**: poll/embed/youtube… — nội dung chỉ đọc.
- **Design-only operation (trong Slides)**: prototype interactions kiểu Design, annotations/dev status, bind variables, component set… — chốt danh sách sau kiểm live.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Agent lạ đọc deck mẫu chỉ bằng lệnh đọc mà kể đúng cấu trúc grid + loại node + text có dấu, không thiếu/sai loại nào.
- **SC-002**: Agent dựng 1 slide mới (tiêu đề có dấu + 1 hình + 1 chú thích) trong ≤ 2 write calls, mỗi call một undo xóa sạch.
- **SC-003**: Mọi write lỗi để lại đúng 0 node rác qua 10 lần fault-injection liên tiếp.
- **SC-004**: 100% tool trong danh sách cấm gọi vào Slides trả message cố định, deck không đổi.
- **SC-005**: Người mới mở plugin trong Slides và đọc thành công trong 5 phút bằng đúng token cũ.

## Assumptions

- Agent đã connect qua token hiện có; không thêm cơ chế auth mới.
- Không author widget/interactive element mới; chỉ đọc.
- Timer FigJam, Buzz editor ngoài phạm vi iteration này.
- Kiểm thủ công trên deck scratch/bản sao template, không bao giờ deck thuyết trình thật.
- Tái dùng hub routing + stale-build detection hiện có, không phát minh lại.
