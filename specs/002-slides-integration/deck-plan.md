# Deck Plan: giới thiệu figma-agent-UI

**Ngày**: 2026-11-09 · **File**: deck `figma-agent` (instanceId `efa87f754f2d43b3`) · **Theme**: Warm Glow Editorial (sáng) · **Trạng thái**: đã dựng 12 slide; QA 0 blocker.

> **Nguồn nội dung:** `deck-script.md` (Draft 3). Tệp này chỉ là kế hoạch dựng; mọi câu chữ lấy từ deck-script.

## 1. Brief

- **Sản phẩm**: bộ slide giới thiệu `figma-agent-UI` (plugin Figma + máy chủ MCP cho trợ lý AI).
- **Người xem**: nhà thiết kế, sản phẩm, kỹ thuật nội bộ.
- **Mục tiêu**: sau buổi trình bày, người xem hiểu công cụ là "người phụ việc biết đọc tệp Figma", thấy 3 nhóm điểm mạnh, và đồng ý thử **1 luồng trong 30 ngày**.
- **Ràng buộc**:
  - Chỉ tiếng Việt; tên riêng/thuật ngữ chuẩn được giữ nguyên.
  - Không logo, không QR, không thông tin liên hệ.
  - Được dùng số ước lượng, có ghi chú.
  - Figma Slides: không component thật, không Section, luôn truyền `parentId`.
- **Thành công**:
  - 12 slide, đọc trong 8–10 phút.
  - Mỗi slide một ý; không tràn chữ, không lệch lưới.
  - Mọi màu/chữ dùng biến và text style của theme.
  - Người xem trả lời được: nó là gì, khác gì Figma AI, bắt đầu thế nào.

## 2. Outline chốt (12 slide)

| # | Tiêu đề | Ý chính | Nền |
|---|---|---|---|
| 1 | Bớt làm lại | Mở bằng lợi ích, không bằng tên công cụ | Vàng |
| 2 | Thời gian mất ở đâu | 4 chỗ hao thời gian không ai thấy | Kem |
| 3 | Định vị | Người phụ việc biết đọc tệp, không phải công cụ vẽ | Kem |
| 4 | Cách hoạt động | Bạn nói → nó đọc tệp → dựng → bạn duyệt | Kem |
| 5 | 3 nhóm điểm mạnh | Nhanh hơn · Đúng hệ thống hơn · Ít rào cản hơn | Kem |
| 6 | Tốc độ | 1 lệnh thay cho 30 thao tác; bảng trước/sau | Kem |
| 7 | Đúng hệ thống | Token, bố cục tự động, kiểm tra, thử tải | Kem |
| 8 | Ít rào cản | Người không chuyên tạo bản nháp; nhà thiết kế duyệt | Kem |
| 9 | So sánh | Làm tay / Figma AI / figma-agent-UI | Kem |
| 10 | Bằng chứng | Deck này dựng bằng chính công cụ; 12 slide từ 1 tệp markdown | Vàng |
| 11 | 30 ngày | 1 luồng, 1 quyết định, 4 tuần | Kem |
| 12 | Kết | Thử trên bản sao; hiệu quả thì mở rộng | Vàng |

## 3. Foundations

Dùng đúng theme đang có trong tệp; không tạo bảng màu mới.

- **Bảng màu Warm Glow Editorial**:
  - `Color 3` #FCF5E6 — nền kem cho slide nội dung.
  - `Color 5` #ECC363 — nền vàng cho cover, bằng chứng, kết.
  - `Color 7` #53453A — chữ chính, divider.
  - `Color 6` #7C7167 — chữ phụ, footer.
  - `Color 4` #F4FDAF — line art, highlight.
  - `Color 1` #FFFFFF — panel, bảng.
  - Không dùng cyan/slate/violet/pink của bộ Semantic cũ.
- **Text styles** (tracking **0%** cho toàn bộ — tiếng Việt):
  - `Header 1` — Instrument Sans 180/90%: số lớn, tiêu đề ngắn.
  - `Header 2` — Instrument Sans 140/90%: cover/kết dài.
  - `Header 3` — Instrument Sans 80/110%: tiêu đề slide.
  - `Header 4` — Geist Mono 40/90%: eyebrow, meta, số thứ tự.
  - `Body 1` — Instrument Sans 40/130%: câu dẫn, câu chốt.
  - `Body 2` — Instrument Sans 24/140%: body, bảng.
  - `Card/title` — Instrument Sans Bold 40: tiêu đề cột/card.
- **Lỗi đã gặp**: tracking âm làm chữ Việt dính ("Một lệnh" → "Mộtlệnh"); đã đặt 0% cho mọi style và text node. Với câu dài, tránh số đứng riêng (viết "một" thay "1") nếu khoảng trắng quanh số bị bóp.
- **Lưới**: 6 cột, gutter 40, lề 40; vùng chữ an toàn x=80 → 1840.
- **Không cần Foundations page riêng**: Slides không có Pages kiểu Design; biến + style là foundations, kiểm chứng bằng `get_design_system`.

## 4. Masters

Slides không có `createComponent`; dùng khung mẫu + `clone_node`.

| Mẫu | Dùng cho | Ghi chú |
|---|---|---|
| `cover/gold` | Slide 1, 10, 12 | Copy fill + line art từ slide mẫu `6:1543` |
| `statement/cream` | Slide 2, 3, 7, 8 | Nền `Color 3`; eyebrow Geist Mono; tiêu đề 80 |
| `three-column` | Slide 5, 8 | 3 cột 560, gap 40; đường kẻ đầu cột |
| `before-after` | Slide 6 | 2 cột 900; cột phải panel trắng viền vàng |
| `comparison` | Slide 9 | 3 cột 520/560/760; cột phải panel trắng |
| `timeline` | Slide 11 | 4 bước 430; đường trục vàng |
| `proof/gold` | Slide 10 | Số lớn 180; 3 số nhỏ; pipeline |
| `closing/gold` | Slide 12 | Như cover, không liên hệ |
| `footer` | Slide kem | Geist Mono 24; trái tên deck, phải số trang |

Sửa một nơi, clone lại các slide dùng nó. Không dựng từng slide từ đầu.

## 5. Thứ tự dựng

1. **Pass 0 — Chuẩn bị**: đọc `deck-script.md`; xác nhận 12 slide; lấy đúng biến/style; copy fill + line art từ slide mẫu `6:1543`.
2. **Pass 1 — Khung**: dựng `cover/gold` (slide 1) với vùng đặt chỗ có kích thước; kiểm tra số; chụp 1 ảnh.
3. **Pass 2 — Nội dung**: điền slide 1; duyệt thị giác; sau đó clone `statement/cream` cho slide 2, `three-column` cho 5/8, `before-after` cho 6, `comparison` cho 9, `timeline` cho 11.
4. **Pass 3 — Khóa**: kiểm tra 0 lỗi chặn, không tràn chữ, đúng lưới; chụp từng slide.
5. **Slide vàng 10, 12**: clone `cover/gold`, thay nội dung; giữ line art và divider.
6. **Cuối**: rà soát toàn bộ 12 slide, xuất thử PDF, trình bày thử 8–10 phút.

## 6. QA + Definition of Done mỗi slide

- 0 lỗi chặn; không còn chỗ giữ chỗ.
- Chỉ dùng bảng màu Warm Glow; không cyan/slate/violet/pink.
- Tương phản chữ thường ≥ 4.5:1; chữ lớn ≥ 3:1.
- Không tên lớp mặc định; không giá trị thô ngoài primitives.
- Chữ dài không tràn; kiểm tra xuống dòng thủ công (thử tải không chạy trong Slides).
- Đúng lưới 6 cột, lề 40, footer y=1020.
- Mỗi slide một điểm nhấn; line art chỉ ở slide vàng.
- Đã chụp ảnh từng slide ở 100% và đọc bằng mắt.
- Đã xuất thử PDF 16:9.

**Kết quả QA 2026-11-09:** 0 blocker; 18 gợi ý `needs-check` do nền ảnh (đã xem bằng mắt); các should-fix còn lại là `raw-text` (local override tracking tiếng Việt) và `no-autolayout` của khung nội dung tuyệt đối — chấp nhận cho deck Slides.

## 7. Thích ứng Slides đã đo live

- `create_variables` / `create_styles` / `import_tokens` / `export_tokens` / `get_design_system` / `search_design_system` mở gate (đã kiểm chứng live).
- Giữ gate: prototype, dev-mode, `bind_variables`, component set, stress, foundations-page.
- Slide tự đổi tên theo số (`1`, `2`, `-` khi bỏ qua) — không chống.
- `setSlideTransition` reset cờ bỏ qua — plugin ghi chuyển cảnh trước, `skipped` sau.
- Luôn truyền `parentId` khi tạo nút trong slide; không dựa vào slide đang focus.
- Không dùng Section trong Slides.
