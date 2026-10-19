# QA và bàn giao

## Mục lục
1. Checklist QA 6 nhóm
2. Accessibility chi tiết
3. Mức lỗi và báo cáo
4. Dev Mode và annotation
5. Map token sang code
6. Code Connect và sau bàn giao

---

## 1. Checklist QA 6 nhóm

### A. Cấu trúc
- [ ] Page đúng chuẩn, Cover cập nhật trạng thái.
- [ ] Không layer tên mặc định; tên màn theo `Flow / Screen / State`.
- [ ] Không layer ẩn thừa, không frame lạc ngoài Section.
- [ ] Instance không bị detach (hoặc có ghi lý do).

### B. Token
- [ ] Mọi fill/stroke/text color bind Semantic variable hoặc style.
- [ ] Mọi text dùng text style.
- [ ] Spacing, radius bind variable; không số lẻ ngoài thang (13, 17, 22…).
- [ ] Đổi mode Light/Dark: không phần tử nào giữ nguyên màu sai.

### C. Layout
- [ ] Frame nội dung dùng Auto Layout; resize không vỡ (xem `file-standards.md` 3.5).
- [ ] Vùng an toàn thiết bị được tôn trọng.
- [ ] Căn lề theo grid; khoảng cách nhất quán giữa các màn cùng loại.

### D. Trạng thái
- [ ] Có: dữ liệu bình thường, rỗng, đang tải, lỗi, không mạng.
- [ ] Nội dung cực dài (tên 40 ký tự, số 9 chữ số), cực ngắn, thiếu ảnh.
- [ ] Mọi phần tử tương tác có Pressed/Focused/Disabled.
- [ ] Bàn phím mở (mobile): input không bị che.

### E. Accessibility (chi tiết mục 2)
- [ ] Tương phản đạt ngưỡng.
- [ ] Vùng chạm ≥ 44 (iOS) / 48 (Android).
- [ ] Không truyền thông tin chỉ bằng màu.
- [ ] Cỡ chữ lớn nhất không vỡ bố cục.

### F. Nội dung
- [ ] Không lorem ipsum ở màn bàn giao.
- [ ] Chính tả, dấu tiếng Việt, cách viết số/ngày/tiền tệ nhất quán.
- [ ] Giọng văn microcopy nhất quán (nút là động từ: "Lưu", "Tiếp tục").
- [ ] Thông báo lỗi nói rõ chuyện gì và cách khắc phục.

## 2. Accessibility chi tiết

| Hạng mục | Ngưỡng / quy tắc |
|---|---|
| Tương phản chữ thường | ≥ 4.5 : 1 (WCAG AA) |
| Chữ lớn (≥ 24px thường hoặc ≥ 18.66px đậm) | ≥ 3 : 1 |
| Thành phần UI, icon mang nghĩa, viền input | ≥ 3 : 1 so với nền kề |
| Vùng chạm | ≥ 44×44 pt (iOS), ≥ 48×48 dp (Android), ≥ 24×24 CSS px tối thiểu (web, khuyến nghị 44) |
| Cỡ chữ động | Kiểm tra iOS Dynamic Type lớn nhất (AX) / Android font scale 200%: chữ xuống dòng, không bị cắt |
| Focus | Web và bàn phím: có focus ring rõ (`color/border/focus`), thứ tự focus hợp lý |
| Màu | Lỗi = màu đỏ **và** icon/chữ; biểu đồ phân biệt được khi mù màu |
| Chuyển động | Có phương án Reduce Motion; không nhấp nháy > 3 lần/giây |
| Nhãn | Icon button có nhãn trợ năng (ghi annotation `a11y label: "Đóng"`) |

Đo tương phản: plugin kiểm tra tương phản trong Figma, hoặc `scripts/check_tokens.py` cho các cặp token khai báo trong JSON.

## 3. Mức lỗi và báo cáo

| Mức | Định nghĩa | Ví dụ |
|---|---|---|
| 🔴 **Chặn** | Sai chức năng, vỡ bố cục, vi phạm accessibility AA, thiếu trạng thái bắt buộc | Không có màn lỗi thanh toán; chữ 3:1 trên nền |
| 🟡 **Nên sửa** | Không nhất quán, nợ hệ thống | Màu gõ tay; spacing 14 |
| 🔵 **Gợi ý** | Cải thiện chất lượng | Thêm micro-interaction; rút gọn copy |

Báo cáo theo `assets/qa-report.template.md`: mỗi lỗi có ID (`QA-01`), mức, vị trí (tên màn + node ID/link), mô tả, đề xuất sửa, trạng thái.

## 4. Dev Mode và annotation

1. **Đánh dấu Ready for dev** theo Section khi đã qua QA. Sửa sau khi đã đánh dấu → Dev Mode hiện "đã thay đổi"; ghi changelog ngắn.
2. **Annotation** cho thứ không nhìn thấy:
   - Hành vi: "Nhấn giữ 0.5s → mở menu ngữ cảnh".
   - Logic: "Nút Thanh toán disabled khi giỏ trống".
   - Edge case: "Tên > 2 dòng → cắt bằng …".
   - Động: duration, easing, thuộc tính thay đổi.
   - Accessibility: nhãn đọc màn hình, thứ tự focus, vai trò (button/heading).
3. **Đo đạc:** không cần redline thủ công — Dev Mode đo được. Chỉ chú thích khi giá trị không suy ra từ token.
4. **Asset:** đánh dấu export cho icon/ảnh (SVG cho icon, PNG/WebP @2x @3x cho ảnh bitmap; PDF/SVG vector cho iOS asset catalog khi phù hợp).
5. **Luồng:** kèm link prototype hoặc sơ đồ luồng; ghi màn bắt đầu.

## 5. Map token sang code

| Figma | SwiftUI | Jetpack Compose | CSS |
|---|---|---|---|
| `color/text/primary` (Light/Dark) | Color asset có Any/Dark appearance → `Color("TextPrimary")` hoặc `extension Color { static let textPrimary }` | `MaterialTheme.colorScheme` / `val TextPrimary` trong theme | `--color-text-primary` trong `:root` và `[data-theme=dark]` |
| `space/4` = 16 | `CGFloat` hằng `Spacing.md` | `Dp` `Spacing.md = 16.dp` | `--space-4: 16px` / `1rem` |
| `radius/lg` = 12 | `.clipShape(.rect(cornerRadius: Radius.lg))` | `RoundedCornerShape(Radius.lg)` | `--radius-lg: 12px` |
| text style `body/lg` | `.font(.body)` (Dynamic Type) hoặc custom font + `relativeTo:` | `MaterialTheme.typography.bodyLarge` | `font: var(--font-body-lg)` |
| elevation | `.shadow(...)` hoặc material | `shadowElevation` / `tonalElevation` | `box-shadow: var(--elevation-2)` |
| motion `duration/base` + easing | `.animation(.snappy(duration:))`, `.spring(...)` | `tween(250, easing)` / `spring()` | `transition: 250ms var(--ease-standard)` |

Quy ước: tên token trong code giữ cùng cấu trúc với Figma (đổi `/` thành camelCase hoặc `-`). Xuất token bằng plugin export variables (định dạng JSON theo chuẩn W3C Design Tokens khi có thể) và chạy `scripts/check_tokens.py` trước khi chuyển.

## 6. Code Connect và sau bàn giao

- **Code Connect:** nối component Figma với component code (đường dẫn file, props mapping) → Dev Mode và agent hiển thị code thật thay vì code sinh tự động. Ưu tiên nối các component dùng nhiều nhất trước.
- **Đối chiếu sau khi dev làm:** chụp màn hình build thật (hoặc `generate_figma_design` từ app đang chạy) đặt cạnh thiết kế, so khác biệt; ghi lỗi như QA.
- **Vòng phản hồi:** thứ dev phải "đoán" → bổ sung vào component description hoặc chuẩn này để lần sau không phải đoán.
