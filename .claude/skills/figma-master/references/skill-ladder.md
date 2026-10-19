# Thang năng lực Figma (chuẩn đánh giá + lộ trình học)

## Mục lục
1. 6 cấp năng lực và tiêu chí đạt
2. Bài kiểm tra thực hành theo cấp
3. Phím tắt cốt lõi
4. Cách agent dùng file này

---

## 1. 6 cấp năng lực

Mỗi cấp chỉ "đạt" khi làm được **tất cả** tiêu chí, không cần tra cứu.

### Cấp 1 — Thao tác nền (Beginner)
- Tạo frame, shape, text, chèn ảnh; Pen tool vẽ icon đơn giản; boolean (union, subtract).
- Căn chỉnh, phân bố, layer, group vs frame.
- Fill, stroke, effect (shadow, blur), export PNG/SVG/PDF.
- Bình luận, chia sẻ file, xem version history.

### Cấp 2 — Bố cục UI (Junior)
- Auto Layout thành thạo: hướng, gap, padding, Hug/Fill/Fixed, wrap, absolute position bên trong, min/max.
- Constraints cho frame không Auto Layout; layout grid lưu thành style.
- Text style, color style, effect style.
- Dựng một màn hình mobile resize 320–430 không vỡ.

### Cấp 3 — Component (Mid)
- Component, instance, override, swap, reset.
- Variants đặt tên `Property=Value`; component properties (text, boolean, instance swap).
- Base component, nested component, slot.
- Interactive components (Default → Pressed).
- Publish và dùng Team Library.

### Cấp 4 — Hệ thống (Senior)
- Variables 3 tầng, alias, scopes, modes (Light/Dark, brand, density).
- Typography scale và spacing scale khớp nền tảng (Dynamic Type / Material 3).
- Prototype có logic: variables, conditional, expressions.
- Dev Mode, annotation, Ready for dev; QA theo checklist.
- Quản trị thư viện: semver, deprecate, analytics, branching.

### Cấp 5 — Sáng tạo và chuyển động (Lead)
- Dẫn quy trình Hiểu → Mở rộng → Thu hẹp → Đánh bóng; tổ chức critique.
- Tạo 3 hướng khác biệt thật cho một brief trong một buổi.
- Smart Animate, Figma Motion, motion tokens, phương án Reduce Motion.
- Dùng shader, Weave, Figma agent như vật liệu có chuẩn — không phải hiệu ứng ngẫu hứng.

### Cấp 6 — Master
- Thiết kế design system đa thương hiệu/đa nền tảng và vận hành nó cho cả team.
- Tự động hóa: viết hoặc tạo plugin (Plugin API / generative plugins), vận hành agent qua Figma MCP an toàn.
- Nối design ↔ code: Code Connect, token pipeline (Figma → JSON → Swift/Compose/CSS), Figma Make / Code Layers cho prototype có code.
- Dạy lại người khác; viết chuẩn (như skill này) và cải tiến nó.

## 2. Bài kiểm tra thực hành

| Cấp | Bài | Đạt khi |
|---|---|---|
| 1 | Vẽ lại một icon set 6 icon 24×24 bằng Pen + boolean | Nét đều, căn pixel, export SVG sạch |
| 2 | Màn đăng nhập mobile | 100% Auto Layout, resize không vỡ, style cho chữ và màu |
| 3 | Button + Input + List row hoàn chỉnh | Đủ trạng thái, properties, không quá 30 variant/component |
| 4 | Mini design system Light/Dark + 3 màn dùng nó | Đổi mode cả màn không lỗi; check_tokens.py không báo lỗi |
| 5 | Brief "app thói quen buổi sáng" → 3 hướng → chọn 1 → prototype động | Ba hướng khác nhau khi che màu; motion có thông số |
| 6 | Agent dựng lại bài cấp 4 qua MCP + nối Code Connect 3 component | Không vi phạm luật gốc; báo cáo node ID đầy đủ |

## 3. Phím tắt cốt lõi (macOS)

Windows: đổi `⌘` → `Ctrl`, `⌥` → `Alt`. Phím tắt có thể khác theo bàn phím/ngôn ngữ — xem `?` hoặc menu Help → Keyboard shortcuts trong Figma.

| Việc | Phím |
|---|---|
| Frame / Rectangle / Text / Pen | `F` / `R` / `T` / `P` |
| Thêm Auto Layout | `⇧ A` |
| Bọc vùng chọn trong frame | `⌥ ⌘ G` |
| Group / Ungroup | `⌘ G` / `⇧ ⌘ G` |
| Tạo component | `⌥ ⌘ K` |
| Detach instance | `⌥ ⌘ B` |
| Đổi tên layer | `⌘ R` |
| Chọn con / chọn cha | `Enter` / `⇧ Enter` |
| Đo khoảng cách | giữ `⌥` + rê chuột |
| Copy / Paste thuộc tính | `⌥ ⌘ C` / `⌥ ⌘ V` |
| Ẩn/hiện layer | `⇧ ⌘ H` |
| Khóa layer | `⇧ ⌘ L` |
| Zoom vừa tất cả / vùng chọn / 100% | `⇧ 1` / `⇧ 2` / `⇧ 0` |
| Bật/tắt layout grid | `⌃ G` |
| Bật/tắt Dev Mode | `⇧ D` |
| Quick actions (tìm lệnh, plugin) | `⌘ /` hoặc `⌘ K` |
| Chèn ảnh | `⇧ ⌘ K` |

## 4. Cách agent dùng file này

- Người dùng hỏi "tôi đang ở mức nào": hỏi họ tự đánh dấu tiêu chí mỗi cấp, hoặc xem một file họ làm (qua MCP) và chấm theo tiêu chí — nêu bằng chứng cụ thể cho mỗi kết luận.
- Người dùng muốn học: đề xuất lộ trình từ cấp hiện tại, mỗi tuần một nhóm tiêu chí + một bài thực hành ở mục 2.
- Không chấm cảm tính; mỗi nhận xét gắn với một tiêu chí.
