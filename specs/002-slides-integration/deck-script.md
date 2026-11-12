# Kịch bản deck: figma-agent-UI

> **Trạng thái:** Đã dựng 12 slide — QA 0 blocker, 18 gợi ý tương phản trên nền ảnh đã xem bằng mắt.
> **Ngày:** 2026-11-09 · **Người viết:** Nguyễn Lương Nam.
> **Nguồn nội dung:** tệp này. **Kế hoạch dựng:** `deck-plan.md`.
> **Định dạng:** Figma Slides, 1920 × 1080, 12 slide.
> **Ngôn ngữ:** Chỉ tiếng Việt. Tên riêng và thuật ngữ chuẩn (Figma, token, component, auto layout) được giữ nguyên khi không có từ tiếng Việt tương đương.

**Ba quyết định đã chốt:**

1. **Được dùng số ước lượng** — giữ các khoảng thời gian ở slide 6, kèm ghi chú "ước lượng nội bộ".
2. **Không cần logo / QR / liên hệ** — slide 12 kết bằng lời mời, không có thông tin liên hệ.
3. **Chỉ tiếng Việt** — toàn bộ chữ trên slide là tiếng Việt; không làm bản tiếng Anh song song.

---

## 0. Tóm tắt một trang

| Hạng mục | Nội dung |
|---|---|
| **Người xem** | Nhà thiết kế, sản phẩm, kỹ thuật nội bộ. Không phải người rành kỹ thuật Figma. |
| **Mục tiêu** | Hiểu figma-agent-UI là gì, thấy 3 nhóm điểm mạnh, và đồng ý thử **1 luồng trong 30 ngày**. |
| **Thông điệp lớn** | Không phải công cụ vẽ. Là người phụ việc biết đọc tệp Figma — để nhóm bớt làm lại. |
| **3 nhóm điểm mạnh** | 1) Nhanh hơn · 2) Đúng hệ thống hơn · 3) Ít rào cản hơn. |
| **Bằng chứng** | Deck này được dựng bằng chính công cụ: 1 tệp markdown → 12 slide; sửa kịch bản → trợ lý cập nhật. |
| **Khác biệt chính** | Không dùng credit Figma AI. Không bị Figma giới hạn số lượt yêu cầu. Chạy trên máy, trên tệp thật. |
| **Lời kêu gọi** | Thử trên bản sao. Chọn 1 luồng. Đo trong 30 ngày. Hiệu quả thì mở rộng. |

**Câu chốt dùng xuyên suốt:**

```text
Bớt làm lại. Thêm thời gian để nghĩ.
```

---

## 1. Học mẫu "Warm Glow Editorial"

### 1.1 Mẫu đang có

Slide mẫu hiện tại trên Figma Slides: **"Warm Glow Editorial Theme"** (node `6:1543`).

```text
Nền vàng ấm + quầng sáng mềm
Tiêu đề lớn, căn giữa, Instrument Sans 180/90%, tracking 0% (tiếng Việt)
Đường kẻ 2px, rộng 800, màu nâu
Nhãn Geist Mono 40/90%, tracking 0%
Chấm vuông 8×8 giữa các nhãn
Line art mảnh ở đáy, màu vàng nhạt, 2px
Lưới 6 cột, lề 40, gutter 40
```

### 1.2 DNA cần giữ

| Thành phần | Giá trị | Vai trò |
|---|---|---|
| **Nền vàng** | `Warm Glow Editorial/Color 5` (#ECC363) + ảnh quầng sáng | Cover, slide bằng chứng, kết |
| **Nền kem** | `Color 3` (#FCF5E6) | Các slide nội dung |
| **Chữ chính** | `Color 7` (#53453A) | Tiêu đề, body |
| **Chữ phụ** | `Color 6` (#7C7167) | Phụ đề, footer |
| **Nhấn sáng** | `Color 4` (#F4FDAF) | Line art, highlight nhẹ |
| **Panel** | `Color 1` (#FFFFFF) | Bảng, card |
| **Tiêu đề lớn** | Instrument Sans Regular, 180/90%, 0% | Cover, số lớn |
| **Tiêu đề vừa** | Instrument Sans Regular, 140/90%, 0% | Cover dài, tuyên bố |
| **Tiêu đề slide** | Instrument Sans Regular, 80/110%, 0% | Đầu slide nội dung |
| **Nhãn** | Geist Mono Regular, 40/90%, 0% | Eyebrow, meta, số thứ tự |
| **Body lớn** | Instrument Sans Regular, 40/130% | Câu dẫn, câu chốt |
| **Body nhỏ** | Instrument Sans Regular, 24/140% | Nội dung, bảng |
| **Đường kẻ** | 2px `Color 7`; 1px `Color 6` 30% | Divider, phân hàng |
| **Chấm** | 8×8 `Color 7` | Ngăn meta |
| **Line art** | Vector 2px `Color 4` | Trang trí đáy |

### 1.3 Cách áp vào deck

- **Slide vàng:** 1 (cover), 10 (bằng chứng), 12 (kết). Dùng lại đúng fill nền + line art của slide mẫu.
- **Slide kem:** 2–9, 11. Nền `Color 3`; chữ `Color 7`; đường kẻ mảnh; không line art dày.
- **Tiêu đề:** dùng `Header 3` 80 cho slide nội dung; `Header 2` 140 cho cover/kết; `Header 1` 180 chỉ cho số lớn hoặc tiêu đề 2–3 từ.
- **Nhãn:** mọi eyebrow, số thứ tự, meta, footer dùng `Header 4` (Geist Mono 40) hoặc Geist Mono 24 cho footer.
- **Màu nhấn:** chỉ dùng vàng, nâu, kem, vàng nhạt. Bỏ cyan/violet/pink/green của bản plan cũ — không hợp với mẫu.
- **Hình khối:** ưu tiên đường kẻ, khoảng trắng, chữ. Card chỉ khi thật cần; panel trắng, viền 1–2px, không đổ bóng.
- **Căn lề:** cover/kết/bằng chứng căn giữa; slide nội dung căn trái trong lưới 6 cột, nhưng tiêu đề có thể căn giữa để giữ nhịp.

### 1.4 Không copy

- Không copy chữ mẫu ("Warm Glow Editorial Theme", "August 2028", "Strategy").
- Không dùng 180px cho tiêu đề dài; sẽ tràn hoặc phải xuống 3–4 dòng.
- Không dùng nền vàng cho slide nhiều chữ; mỏi mắt và giảm tương phản.
- Không lặp line art trên mọi slide; chỉ cover, bằng chứng, kết.
- Không dùng lại đúng bố cục mẫu cho mọi slide; mẫu chỉ là DNA, không phải template nội dung.

---

## 2. Hệ thống trình bày

### 2.1 Khổ và lưới

| Thông số | Giá trị |
|---|---|
| Khổ | 1920 × 1080 (16:9) |
| Lưới | 6 cột, gutter 40, lề 40 |
| Cột | ~273 px |
| Vùng nội dung | x = 40 → 1880, y = 40 → 1040 |
| Vùng chữ an toàn | x = 80 → 1840 cho body; tiêu đề có thể dùng 40 → 1880 |
| Footer | y = 1020, cao 24 |
| Khoảng cách dọc cơ bản | 40 |

**Vùng cố định:**

```text
┌──────────────────────────────────────────────────────────────┐
│ 40                                                           │
│   EYEBROW (Geist Mono 40)                                     │
│   Tiêu đề (Instrument Sans 80/140/180)                        │
│   Câu dẫn (Instrument Sans 40)                                │
│                                                               │
│   Nội dung chính (6 cột)                                      │
│                                                               │
│   Câu chốt                                                    │
│                                                               │
│ FIGMA-AGENT-UI                                    02 / 12     │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Typography

Dùng đúng text styles đã có trong tệp. Không tạo style mới nếu không cần.

| Vai trò | Style | Font | Size / line | Tracking | Dùng cho |
|---|---|---|---|---|---|
| Header 1 | `Header 1` | Instrument Sans Regular | 180 / 90% | 0% | Cover ngắn, số lớn |
| Header 2 | `Header 2` | Instrument Sans Regular | 140 / 90% | 0% | Cover dài, tuyên bố |
| Header 3 | `Header 3` | Instrument Sans Regular | 80 / 110% | 0% | Tiêu đề slide |
| Header 4 | `Header 4` | Geist Mono Regular | 40 / 90% | 0% | Eyebrow, meta, số thứ tự |
| Body 1 | `Body 1` | Instrument Sans Regular | 40 / 130% | 0 | Câu dẫn, câu chốt |
| Body 2 | `Body 2` | Instrument Sans Regular | 24 / 140% | 0 | Body, bảng, card |
| Card/title | `Card/title` | Instrument Sans Bold | 40 / auto | 0 | Tiêu đề card |
| Caption | `Caption` | Inter Regular | 22 / auto | 0 | Ghi chú kỹ thuật; hạn chế |

**Quan trọng — tiếng Việt:** đặt tracking **0%** cho **mọi text style** (Header 1–4, Body 1/2, Card/title, Caption…). Mẫu dùng −7% / −6% chỉ hợp tiếng Anh; với tiếng Việt, dấu và khoảng trắng sẽ dính, chữ như "Một lệnh" thành "Mộtlệnh". Đã sửa toàn bộ text style và text node trong tệp về 0%. Với câu dài, tránh số đứng riêng (viết "một" thay "1") nếu khoảng trắng quanh số bị bóp.

**Giới hạn:**

- Tối đa 3 cỡ chữ trên một slide (không tính footer).
- Body không nhỏ hơn 24pt.
- Header 1/2 tối đa 2 dòng; Header 3 tối đa 2 dòng; Body 1 tối đa 2 dòng.
- Không viết hoa toàn bộ cho câu dài; chỉ dùng cho eyebrow/nhãn.
- Không dùng Inter cho tiêu đề; Inter chỉ cho ghi chú kỹ thuật.

### 2.3 Màu

Dùng biến `Warm Glow Editorial` đã có. Không gõ hex trực tiếp lên lớp.

| Vai trò | Biến | Hex tham chiếu | Dùng cho |
|---|---|---|---|
| Nền vàng | `Warm Glow Editorial/Color 5` | #ECC363 | Cover, bằng chứng, kết |
| Nền kem | `Warm Glow Editorial/Color 3` | #FCF5E6 | Slide nội dung |
| Chữ chính | `Warm Glow Editorial/Color 7` | #53453A | Headline, body |
| Chữ phụ | `Warm Glow Editorial/Color 6` | #7C7167 | Subhead, footer |
| Nhấn sáng | `Warm Glow Editorial/Color 4` | #F4FDAF | Line art, highlight |
| Panel | `Warm Glow Editorial/Color 1` | #FFFFFF | Bảng, card |
| Đen | `Warm Glow Editorial/Color 2` | #000000 | Tránh dùng |

**Quy tắc màu:**

- Chỉ dùng bảng màu Warm Glow. Không dùng cyan/slate/violet/pink của bộ Semantic cũ.
- Mỗi slide có **một** điểm nhấn: vàng, nâu đậm, hoặc vàng nhạt.
- Không gradient, trừ ảnh quầng sáng có sẵn trong slide mẫu.
- Không dùng màu để truyền tải thông tin một mình; luôn kèm chữ hoặc số.
- **Không dùng `Color 5` (#ECC363) làm chữ trên nền kem** — tương phản chỉ 1.67:1. `Color 5` chỉ dùng cho nền, đường kẻ, viền, pill. Chữ nhấn dùng `Color 7` hoặc `Color 6`.
- Tương phản: chữ thường ≥ 4.5:1; chữ lớn ≥ 3:1.

### 2.4 Layout archetypes

Dùng 8 khuôn; không tự phát minh khuôn mới giữa chừng.

| Mã | Tên | Dùng cho | Cấu trúc |
|---|---|---|---|
| `L1` | Title vàng | Slide 1, 12 | Nền vàng + quầng sáng + line art; tiêu đề căn giữa; divider 800; meta Geist Mono |
| `L2` | Statement kem | Slide 2, 3, 7, 8 | Nền kem; eyebrow; tiêu đề 80; câu dẫn 40; nội dung; câu chốt |
| `L3` | Ba cột | Slide 5, 8 | Nền kem; 3 cột 560, gap 40; đường kẻ đầu cột; không card |
| `L4` | Trước / Sau | Slide 6 | Nền kem; 2 cột 900; bảng 4 hàng; cột phải panel trắng |
| `L5` | So sánh | Slide 9 | Nền kem; bảng 3 cột 520/560/760; cột phải panel trắng |
| `L6` | Timeline | Slide 11 | Nền kem; 4 bước 430; đường trục vàng |
| `L7` | Bằng chứng vàng | Slide 10 | Nền vàng; số lớn 180; 3 số nhỏ; pipeline |
| `L8` | Kết vàng | Slide 12 | Nền vàng; tiêu đề 140; divider; meta; không liên hệ |

### 2.5 Signature elements

Dùng lại đúng các chi tiết của mẫu:

1. **Quầng sáng nền** — copy fill từ slide mẫu `6:1543` (ảnh + `Color 5`). Không tự vẽ gradient mới.
2. **Line art đáy** — copy vector `Graphic` từ slide mẫu; stroke `Color 4`, 2px; đặt ở đáy, có thể tràn ra ngoài canvas.
3. **Divider** — 2px, rộng 800, màu `Color 7`, căn giữa; dùng trên slide vàng và một số slide kem.
4. **Chấm vuông** — 8×8, `Color 7`, đặt giữa các mục meta, khoảng cách 40.
5. **Đường kẻ mảnh** — 1px `Color 6` 30%, dùng phân hàng bảng; 2px `Color 7` cho divider chính.
6. **Khoảng trắng** — giữ lề 40; không lấp đầy slide; mỗi khối cách nhau 40–80.

### 2.6 Quy tắc hình ảnh

- **Không ảnh stock.** Chỉ dùng ảnh quầng sáng có sẵn trong mẫu; nếu cần ảnh thật, dùng ảnh chụp Figma.
- **Không icon trang trí.** Số, dấu check, mũi tên mảnh là đủ.
- **Không chữ trên ảnh.** Nếu có ảnh, chữ nằm ở vùng nền riêng.
- **Không shape trang trí.** Chỉ cho phép: quầng sáng, line art, divider, chấm vuông, đường kẻ.
- **Panel tối giản.** Nền trắng/kem, viền 1–2px, không đổ bóng; bo góc 0, trừ pill dùng `radius/full`.

### 2.7 Chuyển động

- Chuyển slide: `DISSOLVE 0.4s` hoặc `NONE`.
- Không animation từng object.
- Nếu cần nhấn: một lần fade nhẹ cho 3 cột ở slide 5. Không bắt buộc.
- Luôn có phương án giảm chuyển động: dùng `NONE`.

### 2.8 Footer và số trang

- **Slide kem (2–9, 11):** footer trái `FIGMA-AGENT-UI`, phải `02 / 12`; Geist Mono 24, `Color 6`, y = 1020.
- **Slide vàng (1, 10, 12):** không footer; dùng meta row căn giữa ở y = 760–820, Geist Mono 40, `Color 7`, gồm tên deck + "Nội bộ 2026" + số trang.
- Không đổi vị trí footer giữa các slide kem.
- Không dùng footer Inter; chỉ Geist Mono.

---

## 3. Slide map

| # | Tiêu đề | Thông điệp | Layout | Nền | Ghi chú |
|---|---|---|---|---|---|
| 01 | Bớt làm lại | Mở đầu bằng lợi ích, không bằng tên công cụ | L1 | Vàng | Cover, line art |
| 02 | Thời gian mất ở đâu | 4 chỗ hao thời gian không ai thấy | L2 + 2×2 | Kem | Không card |
| 03 | Định vị | Người phụ việc biết đọc tệp, không phải công cụ vẽ | L2 + 3 cột | Kem | 3 năng lực |
| 04 | Cách hoạt động | Bạn nói → nó đọc tệp → dựng → bạn duyệt | Timeline ngang | Kem | 4 bước + pill |
| 05 | 3 nhóm điểm mạnh | Nhanh hơn · Đúng hệ thống hơn · Ít rào cản hơn | L3 | Kem | 3 cột |
| 06 | Tốc độ | 1 lệnh thay cho 30 thao tác | L4 | Kem | Bảng trước/sau |
| 07 | Đúng hệ thống | Khó làm sai hơn | L2 + 4 dòng | Kem | Card kiểm tra |
| 08 | Ít rào cản | Người không chuyên cũng bắt đầu được | L3 | Kem | 3 vai |
| 09 | So sánh | 3 cách làm, 1 cách hợp với nhóm | L5 | Kem | Bảng 3 cột |
| 10 | Bằng chứng | Deck này được dựng bằng chính nó | L7 | Vàng | Số lớn |
| 11 | 30 ngày | 1 luồng, 1 quyết định | L6 | Kem | 4 tuần |
| 12 | Kết | Thử trên bản sao. Hiệu quả thì mở rộng | L8 | Vàng | Không liên hệ |

---

## 4. Kịch bản chi tiết

---

### Slide 01 — Cover

**Mục tiêu:** Đặt đúng tâm thế: đây là câu chuyện về thời gian, không phải màn giới thiệu công cụ.

**Bố cục `L1`:**

```text
Nền: copy fill từ slide mẫu 6:1543 (ảnh quầng sáng + Color 5).
Line art: copy vector Graphic từ slide mẫu; stroke Color 4, 2px; đáy slide.

x=40,  y=361   Bớt làm lại.                              (Header 2, 140, center)
               Thêm thời gian để nghĩ.                    (Header 2, 140, center)
x=560, y=713   ───────────────────────────────            (Divider 2px, 800)
x=40,  y=777   figma-agent-UI  ▪  NỘI BỘ 2026  ▪  01 / 12
                                                          (Header 4, 40, center)
```

**Nội dung copy:**

```text
Bớt làm lại.
Thêm thời gian để nghĩ.

figma-agent-UI  ▪  NỘI BỘ 2026  ▪  01 / 12
```

**Ghi chú dựng:**

- Giữ đúng cấu trúc mẫu: tiêu đề 140, divider y=713, meta y=777; không thêm subhead.
- Tiêu đề 140, không phải 180: câu có 6 từ, 180 sẽ tràn.
- Divider 800, 2px, `Color 7`, căn giữa.
- Meta row dùng Geist Mono 40, `Color 7`; chấm vuông 8×8 giữa các mục; gap 40.
- Không thêm logo, không QR, không ảnh.
- Line art nằm dưới chữ, opacity 100%, không che chữ.

**Lời thoại:**

> "Mình muốn bắt đầu bằng một câu không phải về công cụ: thời gian của nhóm đang đi đâu. Deck này không phải để khoe một công cụ mới. Nó là một cách để bớt làm lại."

**Kiểm tra:**

- [ ] Tiêu đề không quá 2 dòng.
- [ ] Không có mã màu trực tiếp.
- [ ] Meta row không tràn; line art không che chữ.

---

### Slide 02 — Vấn đề

**Mục tiêu:** Người xem thấy chính mình trong 4 chỗ hao thời gian.

**Bố cục `L2` + 2×2:**

```text
Nền: Color 3.
x=40,  y=100   VẤN ĐỀ                                    (Header 4, 40, center)
x=40,  y=160   Thời gian không mất ở chỗ vẽ.              (Header 3, 80, center)
x=40,  y=280   Nó mất ở những chỗ không ai nhìn thấy.     (Body 1, 40, center)

2×2, cell 880×220, gap 40:
x=80,   y=400   ô 1
x=1000, y=400   ô 2
x=80,   y=660   ô 3
x=1000, y=660   ô 4

x=40,  y=930   Càng về sau, sửa càng đắt.                 (Body 1, 40, center)
x=40,  y=1020  FIGMA-AGENT-UI                    02 / 12  (Geist Mono 24)
```

**Nội dung copy:**

```text
VẤN ĐỀ

Thời gian không mất ở chỗ vẽ.
Nó mất ở những chỗ không ai nhìn thấy.

01  Tìm lại thành phần
    Mỗi người nhớ một kiểu.

02  Vẽ lại trạng thái
    trống, đang tải, lỗi… lặp đi lặp lại.

03  Sửa token lệch
    Một chỗ đổi, mười chỗ quên.

04  Giải thích cho kỹ thuật
    Bản mô tả nằm trong đầu, không nằm trong tệp.

Càng về sau, sửa càng đắt.
```

**Ghi chú dựng:**

- Mỗi ô có đường kẻ 2px phía trên, dài 880, màu `Color 6` 30%.
- Số `01–04`: Geist Mono 40, `Color 7`; tiêu đề: Instrument Sans 40 bold; mô tả: Body 2 24, `Color 6`.
- Không card, không nền trắng; chỉ đường kẻ và khoảng trắng.
- Giữ 3 trạng thái ngắn, không giải thích thêm; đây là ví dụ, không phải danh sách đầy đủ.

**Lời thoại:**

> "Không ai phàn nàn vì vẽ một màn. Mệt là vẽ lại cùng một màn ở trạng thái thứ ba, rồi sửa token ở mười chỗ, rồi giải thích lại cho kỹ thuật. Càng về sau, sửa càng đắt."

---

### Slide 03 — Định vị

**Mục tiêu:** Định nghĩa công cụ bằng điều nó **không** làm, trước khi nói nó làm được gì.

**Bố cục `L2` + 3 cột:**

```text
Nền: Color 3.
x=40,  y=100   ĐỊNH VỊ                                   (Header 4, 40, center)
x=40,  y=160   Không phải công cụ vẽ.                     (Header 3, 80, center)
x=40,  y=280   Là người phụ việc biết đọc tệp Figma.      (Body 1, 40, center)

3 cột 560, gap 40, x=80, y=420:
cột 1  Đọc được tệp
cột 2  Hiểu hệ thống
cột 3  Tự tay thao tác

x=40,  y=820   Mình vẫn là người quyết định.              (Header 3, 80, center)
x=40,  y=1020  FIGMA-AGENT-UI                    03 / 12
```

**Nội dung copy:**

```text
ĐỊNH VỊ

Không phải công cụ vẽ.
Là người phụ việc biết đọc tệp Figma.

Đọc được tệp
Trang, lớp, thành phần, token, nguyên mẫu.

Hiểu hệ thống
Biết cái gì đã có, cái gì nên tái dùng.

Tự tay thao tác
Tạo, sửa, kiểm tra, chụp ảnh — trong tệp thật.

Mình vẫn là người quyết định.
```

**Ghi chú dựng:**

- 3 cột không card; mỗi cột có đường kẻ 2px phía trên, dài 560, màu `Color 6` 30%.
- Tiêu đề cột: Instrument Sans 40 bold; mô tả: Body 2 24, `Color 6`.
- Không dùng 3 màu khác nhau; giữ một accent.
- Câu chốt 80, căn giữa; đủ khoảng thở với khối trên.

**Lời thoại:**

> "Nó không thay mình nghĩ. Nó đọc được cái mình đã nghĩ và ghi trong tệp. Ba việc: đọc tệp, hiểu hệ thống, và tự tay thao tác. Quyết định cuối vẫn là của mình."

---

### Slide 04 — Cách hoạt động

**Mục tiêu:** Người xem hiểu luồng trong 10 giây, và nhớ hai chữ "chạy trên máy" + "không tốn credit".

**Bố cục timeline ngang:**

```text
Nền: Color 3.
x=40,  y=100   CÁCH HOẠT ĐỘNG                             (Header 4, 40, center)
x=40,  y=160   Bạn nói. Nó đọc tệp. Bạn duyệt.            (Header 3, 80, center)

4 bước 430, gap 40, x=40, y=410:
01 Bạn mô tả
02 Trợ lý đọc tệp
03 Dựng trong Figma
04 Bạn kiểm tra

Đường nối 2px Color 6 30%, y=380.

Pill y=700, căn giữa:
CHẠY TRÊN MÁY · KHÔNG TỐN CREDIT FIGMA AI

x=40,  y=820   Một lệnh. Một bước hoàn tác.              (Header 3, 80, center)
x=40,  y=1020  FIGMA-AGENT-UI                    04 / 12
```

**Nội dung copy:**

```text
CÁCH HOẠT ĐỘNG

Bạn nói. Nó đọc tệp. Bạn duyệt.

01  Bạn mô tả
    Một câu, hoặc một tệp markdown.

02  Trợ lý đọc tệp
    Tài liệu, token, thành phần, quy ước.

03  Dựng trong Figma
    Một lệnh, một bước hoàn tác.

04  Bạn kiểm tra
    Ảnh chụp, kiểm tra, sửa tiếp.

CHẠY TRÊN MÁY · KHÔNG TỐN CREDIT FIGMA AI

Một lệnh. Một bước hoàn tác.
```

**Ghi chú dựng:**

- Số bước: Geist Mono 40, `Color 7`; tiêu đề: Instrument Sans 40 bold; mô tả: Body 2 24.
- Đường nối: 2px, `Color 6` 30%, không mũi tên lớn.
- Pill: nền `Color 1`, viền 2px `Color 5`, chữ Geist Mono 24, `Color 7`, bo `radius/full`.
- Không dùng sơ đồ phức tạp; đây là 4 bước tuyến tính.

**Lời thoại:**

> "Điểm quan trọng: nó không đoán tệp. Nó đọc tệp thật, rồi mới làm. Mọi thứ chạy trên máy mình, qua plugin trên máy. Không đi qua Figma AI trên đám mây, nên không tiêu credit Figma."

---

### Slide 05 — 3 nhóm điểm mạnh

**Mục tiêu:** Chia giá trị thành 3 nhóm dễ nhớ, mỗi nhóm một lời hứa.

**Bố cục `L3`:**

```text
Nền: Color 3.
x=40,  y=100   3 NHÓM ĐIỂM MẠNH                           (Header 4, 40, center)
x=40,  y=160   Nhanh hơn. Đúng hệ thống hơn. Ít rào cản hơn. (Header 3, 80, center)

3 cột 560, gap 40, x=80, y=420:
cột 1  01 · TỐC ĐỘ
cột 2  02 · ĐÚNG HỆ THỐNG
cột 3  03 · ÍT RÀO CẢN

x=40,  y=860   Ba thứ này phải đi cùng nhau.              (Header 3, 80, center)
x=40,  y=1020  FIGMA-AGENT-UI                    05 / 12
```

**Nội dung copy:**

```text
3 NHÓM ĐIỂM MẠNH

Nhanh hơn. Đúng hệ thống hơn. Ít rào cản hơn.

01  TỐC ĐỘ
    1 lệnh thay cho 30 thao tác.
    Dựng màn, nhân trạng thái, sửa hàng loạt.

02  ĐÚNG HỆ THỐNG
    Khó làm sai hơn.
    Token, thành phần, kiểm tra, thử tải.

03  ÍT RÀO CẢN
    Người không chuyên cũng bắt đầu được.
    Mô tả bằng lời, nhận bản nháp đúng chuẩn.

Ba thứ này phải đi cùng nhau.
```

**Ghi chú dựng:**

- 3 cột không card; mỗi cột có đường kẻ 4px phía trên, dài 560.
- Màu đường kẻ: cột 1 `Color 5` vàng; cột 2 `Color 7` nâu; cột 3 `Color 6` xám ấm. Đây là 3 sắc trong cùng bảng màu, không dùng violet/pink/green.
- Số: Geist Mono 40, `Color 7`; tiêu đề: Instrument Sans 40 bold; mô tả: Body 2 24. Đường kẻ giữ 3 màu.
- Không icon.

**Lời thoại:**

> "Ba nhóm này không độc lập. Nhanh mà sai hệ thống thì càng tốn. Đúng hệ thống mà khó dùng thì không ai dùng. Phải đi cùng nhau."

---

### Slide 06 — Tốc độ

**Mục tiêu:** Cho thấy thời gian giảm ở đâu, bằng so sánh trước/sau — và nói rõ đây là mục tiêu, sẽ đo.

**Bố cục `L4`:**

```text
Nền: Color 3.
x=40,  y=100   NHÓM 1 · TỐC ĐỘ                            (Header 4, 40, center)
x=40,  y=160   Một lệnh. Không phải ba mươi cú click.    (Header 3, 80, center)

Header y=340; panel phải y=380, 900×460; 4 hàng bắt đầu y=420, mỗi hàng 100:
cột trái  LÀM TAY
cột phải  VỚI TRỢ LÝ  (panel trắng, viền 2px Color 5)
Dựng 1 màn
Nhân 3 trạng thái
Đổi 1 token toàn tệp
Ghi chú bàn giao

x=40,  y=840   Mục tiêu: cắt 50–70% thời gian lặp lại.   (Body 1, 40, center)
x=40,  y=900   Ước lượng nội bộ. Sẽ đo trong 30 ngày thử nghiệm. (Body 2, 24, center)
x=40,  y=1020  FIGMA-AGENT-UI                    06 / 12
```

**Nội dung copy:**

```text
NHÓM 1 · TỐC ĐỘ

Một lệnh. Không phải ba mươi cú click.

LÀM TAY
Dựng 1 màn                 60–90 phút
Nhân 3 trạng thái          30–45 phút
Đổi 1 token toàn tệp       20–30 phút
Ghi chú bàn giao           30 phút

VỚI TRỢ LÝ
Dựng 1 màn                 10–15 phút
Nhân 3 trạng thái          5–10 phút
Đổi 1 token toàn tệp       2–3 phút
Ghi chú bàn giao           5 phút

Mục tiêu: cắt 50–70% thời gian lặp lại.
Ước lượng nội bộ. Sẽ đo trong 30 ngày thử nghiệm.
```

**Ghi chú dựng:**

- Cột trái: không nền, chữ `Color 6`; cột phải: panel `Color 1`, viền 2px `Color 5`, không đổ bóng.
- Con số: Instrument Sans 40 bold, `Color 7`; cột trái dùng Body 2 24, `Color 6`.
- Đường kẻ 1px `Color 6` 30% giữa các hàng.
- Không dùng biểu đồ cột; bảng đọc nhanh hơn.

**Lời thoại:**

> "Mình không hứa giảm 90%. Mục tiêu khiêm tốn hơn: cắt một nửa thời gian lặp lại. Những con số này là ước lượng nội bộ — 30 ngày thử nghiệm sẽ đo bằng luồng thật của nhóm."

---

### Slide 07 — Đúng hệ thống

**Mục tiêu:** Trả lời nỗi lo "trợ lý vẽ bừa, phá hệ thống".

**Bố cục `L2` + 4 dòng:**

```text
Nền: Color 3.
x=40,  y=100   NHÓM 2 · ĐÚNG HỆ THỐNG                     (Header 4, 40, center)
x=40,  y=160   Không phải vẽ đẹp hơn. Là khó làm sai hơn. (Header 3, 80, center)

4 dòng, x=80, y=400, mỗi dòng 120, rộng 1080:
✓ Token trước, mã màu sau
✓ Bố cục tự động mặc định
✓ Kiểm tra tự động
✓ Thử tải

Card kiểm tra: x=1240, y=400, 600×420, panel trắng, viền 2px Color 5.

x=40,  y=900   0 lỗi chặn trước khi sang màn tiếp theo.  (Body 1, 40, center)
x=40,  y=1020  FIGMA-AGENT-UI                    07 / 12
```

**Nội dung copy:**

```text
NHÓM 2 · ĐÚNG HỆ THỐNG

Không phải vẽ đẹp hơn. Là khó làm sai hơn.

✓ Token trước, mã màu sau
  Mọi màu, chữ, khoảng cách bind vào biến.

✓ Bố cục tự động mặc định
  Khung nội dung co giãn, không vỡ.

✓ Kiểm tra tự động
  Tên mặc định, giá trị thô, tương phản, vùng chạm 44pt.

✓ Thử tải
  Chữ dài, chữ lớn, màn hẹp — trước khi bàn giao.

0 lỗi chặn trước khi sang màn tiếp theo.
```

**Ghi chú dựng:**

- 4 dòng có dấu check nhỏ màu `Color 7`; tiêu đề Instrument Sans 40 bold; mô tả Body 2 24, `Color 6`.
- Card kiểm tra bên phải: panel `Color 1`, viền 2px `Color 5`, padding 32; hiển thị:
  ```text
  KIỂM TRA / 1 MÀN
  Token            ✓
  Bố cục tự động   ✓
  Tương phản       ✓
  Lỗi chặn         0
  ```
  Dùng Geist Mono 24 cho nhãn, Body 2 24 cho giá trị.
- Không dùng bảng lớn; card chỉ là minh hoạ, không phải dữ liệu thật.

**Lời thoại:**

> "Đây là phần ít sexy nhất nhưng quan trọng nhất. Nó không làm mình vẽ đẹp hơn. Nó làm mình khó bỏ sót hơn: token, bố cục tự động, tương phản, chữ dài. 0 lỗi chặn rồi mới sang màn tiếp."

---

### Slide 08 — Ít rào cản

**Mục tiêu:** Nói rõ ai dùng được, và không overclaim "ai cũng thành nhà thiết kế".

**Bố cục `L3`:**

```text
Nền: Color 3.
x=40,  y=100   NHÓM 3 · ÍT RÀO CẢN                       (Header 4, 40, center)
x=40,  y=160   Người không biết thiết kế cũng bắt đầu được. (Header 3, 80, center)

3 cột 560, gap 40, x=80, y=400:
cột 1  NGƯỜI ĐẶT BÀI TOÁN
cột 2  NGƯỜI MỚI
cột 3  NHÀ THIẾT KẾ

x=40,  y=820   Không thay nhà thiết kế. Đổi chỗ làm việc.  (Header 3, 80, center)
x=40,  y=1020  FIGMA-AGENT-UI                    08 / 12
```

**Nội dung copy:**

```text
NHÓM 3 · ÍT RÀO CẢN

Người không biết thiết kế cũng bắt đầu được.

NGƯỜI ĐẶT BÀI TOÁN
Mô tả luồng bằng lời.
Nhận bản nháp để xem lại.

NGƯỜI MỚI
Học bằng cách sửa bản nháp thật,
không phải tệp mẫu.

NHÀ THIẾT KẾ
Duyệt, tinh chỉnh,
quyết định cái gì đủ tốt.

Không thay nhà thiết kế. Đổi chỗ làm việc.
```

**Ghi chú dựng:**

- 3 cột như slide 5 nhưng không số; thay bằng nhãn vai trò Geist Mono 40, `Color 7`.
- Đường kẻ đầu cột cùng một màu `Color 5`, không dùng 3 màu.
- Không icon người dùng; chữ đủ.

**Lời thoại:**

> "Cái này cần nói rõ: nó không biến người không biết thiết kế thành nhà thiết kế. Nó cho họ một điểm bắt đầu đủ tốt để nói chuyện. Nhà thiết kế vẫn là người duyệt và quyết định."

---

### Slide 09 — So sánh

**Mục tiêu:** Đặt 3 cách làm cạnh nhau, làm rõ khác biệt về credit, giới hạn lượt yêu cầu, và hiểu hệ thống.

**Bố cục `L5`:**

```text
Nền: Color 3.
x=40,  y=100   SO SÁNH                                    (Header 4, 40, center)
x=40,  y=160   Ba cách làm. Một cách hợp với nhóm.        (Header 3, 80, center)

Bảng x=40, y=320, rộng 1840, 4 cột:
Tiêu chí: 420  (nhãn "TIÊU CHÍ")
LÀM TAY: 320
FIGMA AI: 400
FIGMA-AGENT-UI: 640 (panel trắng, viền 2px Color 5)

Header 40; 6 hàng, mỗi hàng 90.

x=40,  y=950   Số lượt yêu cầu của trợ lý phụ thuộc ứng dụng/mô hình bạn chọn. (Body 2, 24, center)
x=40,  y=1020  FIGMA-AGENT-UI                    09 / 12
```

**Nội dung bảng:**

| Tiêu chí | Làm tay | Figma AI | figma-agent-UI |
|---|---|---|---|
| **Credit Figma** | Không | Theo gói / credit | **0 credit Figma AI** |
| **Giới hạn lượt yêu cầu** | Không | Theo gói | **Không giới hạn bởi Figma** |
| **Hiểu hệ thống thiết kế** | Trong đầu bạn | Trong phạm vi tính năng | **Đọc trực tiếp biến / thành phần** |
| **Sửa hàng loạt** | Từng lớp | Từng lệnh | **1 lệnh, nhiều nút** |
| **Chạy song song** | Khó | Hạn chế | **Nhiều trợ lý, nhiều tệp** |
| **Cài đặt** | 0 | Có sẵn | **Plugin + MCP (~30 phút)** |

**Ghi chú dựng:**

- Header: Header 4 (Geist Mono 40), `Color 6`; hàng: Body 2 24.
- Cột figma-agent-UI: panel `Color 1`, viền 2px `Color 5`, không đổ bóng; chữ `Color 7`, từ khoá `Color 5`.
- Không dùng dấu `✗` đỏ cho 2 cột kia; chỉ dùng chữ hoặc dấu `✓` nhẹ.
- Đường kẻ 1px `Color 6` 30% giữa các hàng.
- Ghi chú dưới bảng: "Số lượt yêu cầu của trợ lý phụ thuộc ứng dụng/mô hình bạn chọn."

**Lời thoại:**

> "Figma AI rất tốt cho việc bắt đầu nhanh trong Figma. Cái mình cần là một người phụ việc đọc được tệp thật, chạy không bị Figma giới hạn, và không tiêu credit Figma. Đó là chỗ khác nhau. Không phải cuộc thi — là chọn đúng việc."

---

### Slide 10 — Bằng chứng

**Mục tiêu:** Chứng minh bằng chính deck: kịch bản markdown → trợ lý → slide; sửa nhanh.

**Bố cục `L7`:**

```text
Nền: copy fill từ slide mẫu 6:1543 (ảnh quầng sáng + Color 5).
Line art: copy vector Graphic từ slide mẫu; stroke Color 4, 2px; đáy slide.

x=40,  y=200   12                                          (Header 1, 180, center; cao 216)
x=40,  y=430   slide từ một tệp markdown                   (Body 1, 40, center)

x=560, y=520   ───────────────────────────────              (Divider 2px, 800)

3 số nhỏ, y=600, căn giữa:
1 lệnh        cập nhật nhiều slide
0 credit      Figma AI
1 người       duyệt nội dung

Pipeline y=760:
kịch bản markdown  →  trợ lý  →  Figma Slides

x=40,  y=860   Sửa kịch bản trước. Slide theo sau.        (Body 1, 40, center)
x=1640, y=920  10 / 12                                     (Geist Mono 24, phải)
```

**Nội dung copy:**

```text
12
slide từ một tệp markdown

1 lệnh
cập nhật nhiều slide

0 credit
Figma AI

1 người
duyệt nội dung

kịch bản markdown  →  trợ lý  →  Figma Slides

Sửa kịch bản trước. Slide theo sau.
```

**Ghi chú dựng:**

- Số `12`: Header 1 180, `Color 7`, căn giữa; chữ "slide từ một tệp markdown": Body 1 40, `Color 6`.
- 3 số nhỏ: Geist Mono 40, `Color 7`; nhãn: Body 2 24, `Color 6`; gap 80.
- Pipeline: Geist Mono 24, `Color 7`; mũi tên mảnh `Color 5`.
- Line art nằm dưới, không che chữ.
- Không dùng ảnh chụp màn hình; slide này là bằng chứng bằng số.

**Lời thoại:**

> "Đây là phần mình thích nhất: kịch bản là nguồn sự thật. Mình sửa một câu trong markdown, trợ lý cập nhật đúng những slide bị ảnh hưởng. Không phải mở từng slide sửa tay. Deck này là một ví dụ."

---

### Slide 11 — 30 ngày

**Mục tiêu:** Biến sự quan tâm thành một thử nghiệm nhỏ, có đo lường.

**Bố cục `L6`:**

```text
Nền: Color 3.
x=40,  y=100   BẮT ĐẦU                                    (Header 4, 40, center)
x=40,  y=160   30 ngày. Một luồng. Một quyết định.        (Header 3, 80, center)

4 bước 430, gap 40, x=40, y=410:
TUẦN 1  Cài + kết nối
TUẦN 2  Chọn một luồng
TUẦN 3  Đo
TUẦN 4  Quyết định

Đường trục 2px Color 5, y=380.

x=40,  y=820   Thành công = giảm thời gian lặp lại.       (Header 3, 80, center)
x=40,  y=1020  FIGMA-AGENT-UI                    11 / 12
```

**Nội dung copy:**

```text
BẮT ĐẦU

30 ngày. Một luồng. Một quyết định.

TUẦN 1
Cài + kết nối
Plugin, máy chủ MCP, token. Chạy trên bản sao.

TUẦN 2
Chọn một luồng
Một màn, ba trạng thái, một người duyệt.

TUẦN 3
Đo
Thời gian nháp, số lỗi kiểm tra, số vòng sửa.

TUẦN 4
Quyết định
Mở rộng, chỉnh, hoặc dừng.

Thành công = giảm thời gian lặp lại.
```

**Ghi chú dựng:**

- 4 cột, mỗi cột có nhãn tuần Geist Mono 40, `Color 7`; tiêu đề Instrument Sans 40 bold; mô tả Body 2 24.
- Đường trục ngang 2px `Color 5`, chấm tròn nhỏ `Color 7` ở mỗi bước.
- Không dùng timeline cong hoặc trang trí.

**Lời thoại:**

> "Đừng thử cả công ty trong một tuần. Chọn một luồng đủ đau, đủ nhỏ, và đo được. Tuần 4 chỉ cần một quyết định: mở rộng, chỉnh, hoặc dừng. Cả ba đều là kết quả tốt."

---

### Slide 12 — Kết

**Mục tiêu:** Đóng bằng một lời mời nhỏ, rõ, không gây áp lực.

**Bố cục `L8`:**

```text
Nền: copy fill từ slide mẫu 6:1543 (ảnh quầng sáng + Color 5).
Line art: copy vector Graphic từ slide mẫu; stroke Color 4, 2px; đáy slide.

x=40,  y=361   Thử trên bản sao.                          (Header 2, 140, center)
               Hiệu quả thì mở rộng.                       (Header 2, 140, center)
x=560, y=713   ───────────────────────────────              (Divider 2px, 800)
x=40,  y=777   FIGMA-AGENT-UI  ▪  NỘI BỘ 2026  ▪  12 / 12 (Header 4, 40, center)
x=40,  y=860   Bắt đầu với một luồng trong 30 ngày.       (Body 1, 40, center)
```

**Nội dung copy:**

```text
Thử trên bản sao.
Hiệu quả thì mở rộng.

FIGMA-AGENT-UI  ▪  NỘI BỘ 2026  ▪  12 / 12

Bắt đầu với một luồng trong 30 ngày.
```

**Ghi chú dựng:**

- Dùng đúng fill + line art của slide mẫu; không thêm ảnh.
- Divider 800, 2px, `Color 7`, y=713; meta y=777; CTA y=860.
- Meta row Geist Mono 40, `Color 7`; chấm vuông 8×8.
- Không logo, không QR, không thông tin liên hệ.
- Không dùng "Cảm ơn" làm tiêu đề; tiêu đề là lời mời.

**Lời thoại:**

> "Mình không cần mọi người tin ngay. Chỉ cần một luồng, một tháng, một người duyệt. Số liệu sẽ nói. Thử trên bản sao trước — không rủi ro."

---

## 5. Bảng so sánh chi tiết (dùng cho Q&A)

| Tiêu chí | Làm tay | Figma AI | figma-agent-UI |
|---|---|---|---|
| **Cách hoạt động** | Nhà thiết kế thao tác | Câu lệnh trong Figma | Trợ lý đọc tệp qua plugin trên máy |
| **Credit Figma** | Không | Theo gói / credit | Không dùng credit Figma AI |
| **Giới hạn lượt yêu cầu** | Không | Theo gói | Không bị Figma giới hạn |
| **Chi phí khác** | Thời gian người | Gói Figma | Token mô hình của trợ lý (nếu có) |
| **Hiểu hệ thống thiết kế** | Trong đầu nhà thiết kế | Trong phạm vi tính năng | Đọc biến, kiểu, thành phần |
| **Sửa hàng loạt** | Từng lớp | Từng lệnh | 1 lệnh, nhiều nút |
| **Kiểm tra chất lượng** | Thủ công | Hạn chế | Kiểm tra tự động + thử tải |
| **Chạy song song** | Khó | Hạn chế | Nhiều trợ lý, nhiều tệp |
| **Dữ liệu** | Trong Figma | Trên đám mây Figma | Trên máy + loopback, token |
| **Cài đặt** | 0 | Có sẵn | Plugin + MCP (~30 phút) |
| **Phù hợp nhất** | Việc cần phán đoán | Bắt đầu nhanh | Việc lặp lại, hàng loạt, đúng hệ thống |

**Cách nói khi thuyết trình:**

```text
"Không phải cái nào tốt hơn cái nào. Figma AI giỏi bắt đầu nhanh.
figma-agent-UI giỏi việc lặp lại, việc hàng loạt, việc đọc đúng hệ thống của mình.
Chọn theo việc, không theo cảm giác."
```

---

## 6. Số liệu và cách nói trung thực

### 6.1 Được nói

| Câu | Vì sao đúng |
|---|---|
| "1 lệnh thay cho 30+ thao tác" | `render_tree` tạo cả cây nút trong một lệnh. |
| "Không dùng credit Figma AI" | Công cụ chạy qua Plugin API + MCP trên máy, không gọi tính năng AI tính credit của Figma. |
| "Không bị Figma giới hạn lượt yêu cầu" | Figma không đếm/giới hạn lệnh MCP trên máy; giới hạn (nếu có) đến từ ứng dụng/mô hình. |
| "Đọc được biến, kiểu, thành phần" | `get_design_system`, `search_design_system` đọc trực tiếp tệp. |
| "Một bước hoàn tác cho mỗi lệnh ghi" | Plugin `commitUndo` sau mỗi lệnh thay đổi. |
| "Deck này dựng bằng chính công cụ" | Đúng — deck đang được tạo trong Figma Slides qua plugin. |

### 6.2 Không nên nói

| Không nói | Nói thay thế |
|---|---|
| "AI thay nhà thiết kế" | "AI làm phần lặp lại; nhà thiết kế làm phần quyết định." |
| "Ai cũng làm được thiết kế chuyên nghiệp" | "Ai cũng tạo được bản nháp đúng chuẩn; nhà thiết kế duyệt." |
| "Nhanh gấp 10 lần" | "Mục tiêu cắt 50–70% thời gian lặp lại; đo trong thử nghiệm." |
| "Không giới hạn" (nói trống) | "Không bị Figma giới hạn; chi phí mô hình do ứng dụng bạn chọn." |
| "Thay Figma AI" | "Bổ sung cho Figma AI ở việc lặp lại và đọc hệ thống." |
| "Không cần biết Figma" | "Không cần biết vẽ; vẫn cần hiểu luồng và duyệt kết quả." |

### 6.3 Ghi chú trên slide

- Slide 6: "Ước lượng nội bộ. Sẽ đo trong 30 ngày thử nghiệm."
- Slide 9: "Số lượt yêu cầu của trợ lý phụ thuộc ứng dụng/mô hình bạn chọn."
- Slide 10: "Deck này là ví dụ, không phải thước đo chuẩn."

---

## 7. Quy trình cập nhật kịch bản

### 7.1 Nguyên tắc

**Tệp này là nguồn sự thật.** Không sửa chữ trực tiếp trong Figma rồi để markdown lệch.

```text
deck-script.md  →  trợ lý đọc  →  cập nhật đúng slide  →  ảnh chụp  →  duyệt
```

### 7.2 Các bước

1. **Sửa markdown** — đổi tiêu đề, số, hoặc thứ tự slide.
2. **Ghi rõ phạm vi** — ví dụ: "Cập nhật slide 06 theo mục 6; giữ bố cục, chỉ đổi số."
3. **Trợ lý cập nhật** — dùng `update_nodes` cho chữ, `render_tree` nếu thêm khối.
4. **Kiểm tra số** — `get_node` xem khung có tràn không.
5. **Chụp ảnh** — `screenshot` slide vừa sửa.
6. **Duyệt** — người phụ trách nội dung xác nhận; nếu không, sửa tiếp.
7. **Ghi phiên bản** — tăng `v1.x` ở cover/footer nếu cần.

### 7.3 Câu lệnh mẫu

```text
"Cập nhật slide 06:
- Đổi '60–90 phút' thành '45–75 phút'.
- Giữ nguyên bố cục, font, màu.
- Chụp lại slide và báo kích thước chữ."

"Cập nhật slide 09:
- Thêm hàng 'Kiểm tra chất lượng' vào bảng.
- Giữ 3 cột, không đổi độ rộng.
- Kiểm tra không tràn dòng."
```

### 7.4 Khi nào tạo slide mới

- Kịch bản tăng quá 12 slide: tạo slide mới theo `L2` hoặc `L3`, không tự phát minh khuôn.
- Nếu slide mới lặp khuôn: clone slide gần nhất, sửa nội dung.
- Cập nhật lại slide map (mục 3) và số trang toàn bộ.

---

## 8. Checklist kiểm tra chất lượng trước khi trình bày

### 8.1 Nội dung

- [ ] 12 slide, đúng thứ tự, đúng số trang.
- [ ] Mỗi slide một ý; tiêu đề ≤ 12 từ.
- [ ] Không còn chỗ giữ chỗ, không còn chữ mẫu.
- [ ] Không lorem ipsum; không lỗi chính tả tiếng Việt.
- [ ] Số liệu ước lượng có ghi chú; không có claim quá đà.
- [ ] Tên công cụ viết đúng: `figma-agent-UI`.

### 8.2 Thị giác

- [ ] Đúng lưới 6 cột, lề 40, footer y=1020.
- [ ] Đúng bảng màu Warm Glow; không còn cyan/slate/violet/pink.
- [ ] Tối đa 3 cỡ chữ/slide; body ≥ 24pt.
- [ ] Mỗi slide một điểm nhấn; không lạm dụng line art.
- [ ] Không mã màu trực tiếp; tất cả bind biến/kiểu.
- [ ] Không chữ tràn, không chồng, không cắt.
- [ ] Không ảnh stock; không icon trang trí.
- [ ] Tương phản: chữ thường ≥ 4.5:1; chữ lớn ≥ 3:1.
- [ ] Đã xem từng slide ở 100%; đã xuất thử PDF.

### 8.3 Kỹ thuật

- [ ] Tên lớp có nghĩa, không `Frame 12`.
- [ ] Khung nội dung dùng bố cục tự động.
- [ ] Chuyển slide `DISSOLVE 0.4s` hoặc `NONE`.
- [ ] Không có lớp ngoài canvas.
- [ ] Đã chụp toàn bộ deck một lần cuối.

### 8.4 Thuyết trình

- [ ] Đọc thử 12 slide trong 8–10 phút.
- [ ] Mỗi slide có 1 câu chốt dễ nhớ.
- [ ] Chuẩn bị 3 câu hỏi khó: credit, an toàn, thay nhà thiết kế.
- [ ] Biết rõ slide nào là "dừng lại để hỏi".

---

## 9. Phụ lục A — FAQ cho Q&A

**1. Có cần gói Full của Figma không?**
Không cần MCP Figma từ xa. Plugin chạy trên máy qua Plugin API. Một số tính năng như biến/chế độ vẫn phụ thuộc gói Figma của bạn.

**2. Có mất credit Figma không?**
Không dùng credit Figma AI. Công cụ chạy trên máy. Nếu trợ lý gọi mô hình qua API trả phí, chi phí đó thuộc ứng dụng/mô hình bạn chọn.

**3. Có giới hạn số lượt yêu cầu không?**
Figma không giới hạn lệnh MCP trên máy. Giới hạn (nếu có) đến từ ứng dụng/mô hình hoặc chính sách nội bộ.

**4. Có an toàn không?**
Máy chủ chỉ nghe loopback, yêu cầu token, chạy trên tệp bạn mở. Mỗi lệnh ghi là một bước hoàn tác. Khuyến nghị thử trên bản sao trước.

**5. Có thay nhà thiết kế không?**
Không. Nó làm phần lặp lại và bản nháp. Nhà thiết kế vẫn duyệt, tinh chỉnh, quyết định.

**6. Người không biết Figma dùng được không?**
Tạo được bản nháp đúng hệ thống nếu mô tả rõ. Vẫn cần người hiểu luồng và duyệt kết quả.

**7. Cài mất bao lâu?**
Khoảng 30 phút: cài plugin, dựng máy chủ MCP, dán token, kết nối.

**8. Cập nhật kịch bản có nhanh không?**
Có. Sửa tệp markdown, trợ lý cập nhật đúng slide. Không sửa tay từng slide.

**9. Có dùng được với Figma Slides không?**
Có. Plugin hỗ trợ trình soạn Slides; một số công cụ chỉ dành cho Design sẽ trả lời rõ thay vì lỗi.

**10. Nếu trợ lý làm sai thì sao?**
Hoàn tác từng lệnh; kiểm tra và chụp ảnh để xem; làm trên bản sao để an toàn.

---

## 10. Phụ lục B — Phương án tiêu đề khác

Dùng khi cần thử nghiệm nhanh; giữ nguyên cấu trúc slide.

| Slide | Tiêu đề chính | Phương án khác |
|---|---|---|
| 01 | Bớt làm lại. Thêm thời gian để nghĩ. | Việc lặp lại nên do máy. Việc quyết định nên do người. |
| 02 | Thời gian không mất ở chỗ vẽ. | Một màn không khó. Ba trạng thái mới khó. |
| 03 | Không phải công cụ vẽ. | Người phụ việc biết đọc tệp Figma. |
| 05 | Nhanh hơn. Đúng hệ thống hơn. Ít rào cản hơn. | Ba thứ phải đi cùng nhau. |
| 06 | Một lệnh. Không phải ba mươi cú click. | 30 thao tác tay. 1 lệnh. |
| 07 | Không phải vẽ đẹp hơn. | Khó làm sai hơn. |
| 08 | Người không biết thiết kế cũng bắt đầu được. | Không thay nhà thiết kế. Đổi chỗ làm việc. |
| 09 | Ba cách làm. Một cách hợp với nhóm. | Chọn theo việc, không theo cảm giác. |
| 10 | Deck này được dựng bằng chính nó. | Kịch bản trước. Slide sau. |
| 11 | 30 ngày. Một luồng. Một quyết định. | Thử nhỏ. Đo thật. Quyết định nhanh. |
| 12 | Thử trên bản sao. Hiệu quả thì mở rộng. | Một luồng. Một tháng. Một người duyệt. |

---

## 11. Phụ lục C — Ghi chú dựng trong Figma Slides

- **Không có component thật trong Slides.** Dùng khung mẫu + `clone_node`.
- **Luôn truyền `parentId`** khi tạo nút trong slide; không dựa vào slide đang focus.
- **Không dùng Section** trong Slides (thử tải/section không chạy).
- **Biến/kiểu vẫn dùng được** — đã kiểm chứng live.
- **Tên slide tự đổi theo số** — không chống lại hành vi của trình soạn.
- **Ghi chuyển cảnh trước, ghi `skipped` sau** — `setSlideTransition` có thể reset cờ bỏ qua.
- **Kiểm tra xuống dòng thủ công** — thử tải không chạy trong Slides.
- **Chụp ảnh từng slide** sau khi dựng; đọc bằng mắt, không chỉ tin số.
- **Dùng lại slide mẫu `6:1543`** làm nền cho slide vàng; đổi nền sang `Color 3` cho slide kem.

---

## 12. Quyết định và việc tiếp theo

### 12.1 Đã chốt

- [x] Được dùng số ước lượng, có ghi chú.
- [x] Không cần logo / QR / liên hệ.
- [x] Chỉ tiếng Việt.
- [x] Học mẫu "Warm Glow Editorial": nền vàng/kem, Instrument Sans + Geist Mono, divider 2px, line art, lưới 6 cột.
- [x] Đã dựng đủ 12 slide, đúng thứ tự.
- [x] Đã sửa lỗi tracking tiếng Việt: toàn bộ text style và text node về 0%.
- [x] Đã sửa tương phản: chữ nhấn trên nền kem dùng `Color 7`, không dùng `Color 5`.
- [x] QA: 0 blocker; các should-fix còn lại là raw-text/absolute layout (đã ghi nhận).

### 12.2 Việc tiếp theo

1. Duyệt thị giác 12 slide trên Figma Slides.
2. Trình bày thử 8–10 phút; ghi lại chỗ vấp.
3. Nếu cần, tinh chỉnh copy hoặc khoảng trắng; giữ nguyên hệ thống.
4. Chốt phiên bản trình bày; lưu bản sao trước khi chỉnh tiếp.
