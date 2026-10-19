# Chuẩn file, đặt tên và bố cục

## Mục lục
1. Cấu trúc file và page
2. Quy tắc đặt tên
3. Auto Layout — chuẩn bắt buộc
4. Kích thước frame và layout grid theo nền tảng
5. Section, trạng thái và phiên bản
6. Vệ sinh file

---

## 1. Cấu trúc file và page

### 1.1 Chia file
| Loại file | Chứa | Ai sửa |
|---|---|---|
| `[Brand] Foundations` | Variables, styles, icon, ảnh thương hiệu | Chủ design system |
| `[Brand] Components` | Thư viện component, publish làm Library | Chủ design system |
| `[Product] – [Feature]` | Màn hình, luồng, prototype của một tính năng | Designer tính năng |
| `[Product] – Explorations` | Ý tưởng tự do, không dùng làm nguồn chuẩn | Ai cũng được |

Dự án nhỏ (một người, một app) được gộp Foundations + Components vào cùng file sản phẩm, nhưng vẫn giữ page riêng.

### 1.2 Thứ tự page chuẩn
```
📘 Cover            ảnh bìa: tên, trạng thái, người phụ trách, ngày cập nhật
📝 Brief            mục tiêu, người dùng, ràng buộc, link tài liệu
🧪 Explore          nháp, moodboard, các hướng khám phá
🎨 Foundations      hiển thị variables/styles (swatch, type specimen, spacing)
🧩 Components       component chính + Playground
📱 Screens          màn hình theo luồng
▶️ Prototype        luồng đã nối để test
✅ Ready for dev    chỉ chứa thứ đã duyệt
🗄 Archive          bản cũ, hướng bị loại (không xóa, để tra lại lý do)
```
Emoji giúp quét nhanh danh sách page; nếu team không thích emoji, dùng tiền tố số `00 Cover`, `10 Brief`…

### 1.3 Cover
Frame 1920×960, gồm: tên dự án, trạng thái (🟡 In progress / 🟢 Ready / ⚪ Archived), người phụ trách, ngày cập nhật cuối, link PRD/ticket. Cập nhật mỗi lần đổi trạng thái.

## 2. Quy tắc đặt tên

### 2.1 Chung
- Dùng `/` để tạo phân cấp: Figma tự gom nhóm trong picker (`color/text/primary`, `Button/Primary`).
- Chữ thường + gạch ngang cho token: `color/surface/raised`, `space/4`.
- Chữ Hoa Đầu cho component và property: `List Row`, `State=Pressed`.
- Tiếng Anh cho tên kỹ thuật (token, component, layer) để khớp code; tiếng Việt được dùng cho nội dung, mô tả, annotation.

### 2.2 Màn hình
`[Flow] / [Screen] / [State]` — ví dụ `Checkout / Payment / Error – card declined`.
Thêm hậu tố nền tảng khi đa nền: `… / iOS`, `… / Android`.

### 2.3 Layer bên trong
| Loại | Tên | Ví dụ |
|---|---|---|
| Vùng bố cục | danh từ chức năng | `header`, `content`, `footer`, `actions` |
| Text | vai trò | `title`, `subtitle`, `body`, `label`, `caption` |
| Icon | `icon/<tên>` | `icon/chevron-right` |
| Ảnh | `image/<nội dung>` | `image/avatar` |
| Trang trí tự do | `decor/<mô tả>` | `decor/blob-top` |
| Lớp phủ | `overlay/<mô tả>` | `overlay/scrim` |

Tên layer nên trùng tên biến/thuộc tính dev sẽ dùng — giúp đọc Dev Mode và Code Connect dễ hơn.

### 2.4 Cấm
`Frame 123`, `Group 4`, `Rectangle 9`, `Copy`, `Final`, `Final-final-v2`, tên có ngày tháng trong layer.

## 3. Auto Layout — chuẩn bắt buộc

### 3.1 Khi nào
- **Có:** mọi container nội dung — button, card, list, form, nav, toàn bộ màn hình.
- **Không:** ảnh minh họa, lớp trang trí, vị trí tuyệt đối có chủ đích (badge góc → dùng "Ignore auto layout"/absolute position bên trong frame Auto Layout).

### 3.2 Hành vi kích thước
| Thiết lập | Dùng khi |
|---|---|
| **Hug** | Kích thước theo nội dung: button, chip, tag |
| **Fill** | Lấp đầy cha: text trong card, row trong list, input trong form |
| **Fixed** | Chỉ khi có lý do thật: icon 24×24, avatar, frame thiết bị |

Quy tắc ngón tay: **cha Fixed hoặc Fill, con Fill hoặc Hug.** Text dài để Fill + auto height để tự xuống dòng.

### 3.3 Spacing
- `gap` và `padding` luôn bind variable spacing (thang 4/8: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- Dùng **gap** giữa phần tử, **padding** cho viền trong — không chèn rectangle trong suốt làm khoảng cách.
- `Space between` cho thanh điều hướng, header có hai đầu.
- Min/max width cho text đọc dài (≈ 45–75 ký tự mỗi dòng trên web) và cho component co giãn.
- Wrap cho chip, tag; Grid layout (nếu bản Figma có) cho lưới thẻ.

### 3.4 Lồng nhau
Không lồng quá sâu không cần thiết: nếu một frame chỉ có một con và không có padding/fill/stroke riêng, bỏ nó đi. Độ sâu điển hình một màn hình: 4–6 cấp.

### 3.5 Kiểm tra
Kéo giãn chiều ngang màn hình 320 → 430 (mobile) hoặc 1280 → 1920 (web): không chồng chéo, không cắt chữ, khoảng cách giữ nguyên.

## 4. Kích thước frame và layout grid theo nền tảng

### 4.1 Mobile
| Nền tảng | Frame thiết kế chính | Kiểm tra thêm | Grid gợi ý |
|---|---|---|---|
| iOS | 393 × 852 (iPhone cỡ chuẩn) | 375 (nhỏ), 440 (Pro Max) | 4 cột, margin 16, gutter 8–16 |
| Android | 360 × 800 hoặc 412 × 915 | 600+ (máy gập/tablet) | 4 cột, margin 16, gutter 8–16 |

Tôn trọng vùng an toàn: status bar, Dynamic Island, home indicator (iOS); status bar, gesture bar (Android). Dùng frame thiết bị/khung an toàn làm lớp tham chiếu, không vẽ nội dung đè lên.

### 4.2 Tablet và Web
| Breakpoint | Frame | Grid |
|---|---|---|
| Tablet | 768 / 834 / 1024 | 8 cột, margin 24–32, gutter 16–24 |
| Desktop | 1280 / 1440 | 12 cột, max content 1120–1200, gutter 24 |
| Wide | 1920 | 12 cột, nội dung không kéo vô hạn — có max width |

> Kích thước thiết bị thay đổi theo đời máy. Khi dự án nhắm thiết bị cụ thể, kiểm tra lại kích thước hiện hành.

### 4.3 Grid
- Lưu layout grid thành **style** dùng chung (`grid/mobile`, `grid/desktop`).
- Baseline grid 4 cho mobile để text thẳng hàng; không bắt buộc cho web.

## 5. Section, trạng thái và phiên bản

- **Section** để nhóm màn hình theo luồng; đặt tên Section = tên flow. Đánh dấu "Ready for dev" theo Section.
- Nhãn trạng thái trên canvas (component hoặc sticky): `🟡 WIP`, `🔵 In review`, `🟢 Approved`, `🔴 Needs changes`.
- **Phiên bản:** lưu version thủ công (Save to version history) ở mỗi mốc: trước khi đổi hướng lớn, sau mỗi gate duyệt, trước khi publish thư viện. Tên version: `v1.2 – Thêm dark mode cho Settings`.
- **Branching** (nếu gói có): mọi thay đổi lớn trên file thư viện đi qua branch + review rồi mới merge.

## 6. Vệ sinh file

Trước mỗi lần trình hoặc bàn giao:
1. Xóa layer ẩn không dùng, frame thử nghiệm lạc ra ngoài Explore.
2. Không còn tên mặc định (chạy audit ở `agent-mcp.md` mục 5.7 hoặc plugin rename).
3. Không còn style/variable mồ côi (định nghĩa nhưng không dùng) — hoặc ghi chú lý do giữ.
4. Detach instance chỉ khi bắt buộc và ghi lý do; instance detach là nợ thiết kế.
5. Ảnh nặng: nén trước khi chèn; ảnh minh họa dùng ảnh thật hoặc placeholder có kích thước đúng tỷ lệ.
6. Canvas gọn: màn hình xếp lưới thẳng hàng, khoảng cách đều (ví dụ 200px giữa màn, 400px giữa Section).
