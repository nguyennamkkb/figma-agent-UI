# Hệ thống bố cục: deck "Làm quen Figma Agent"

Mọi slide đều dựng theo tài liệu này. Nội dung lấy từ `onboarding-script.md`.

## 1. Khung và lưới
- Slide 1920 × 1080. Nền `bg` #F6F5F0, trùng với nền của ảnh Gemini nên ảnh hoà vào slide, không lộ viền.
- Lưới 12 cột: lề trái/phải **120**, cột **118**, khoảng cách cột **24**.
  Cột n bắt đầu tại x = 120 + (n−1) × 142.
- Lề trên **96**, lề dưới **80**. Không đặt chữ ra ngoài vùng an toàn (x 120–1800, y 96–1000).
- Khoảng cách chỉ dùng các bước: 8 · 12 · 16 · 24 · 32 · 48 · 64.

## 2. Vùng cố định (slide nội dung)

| Vùng | Vị trí | Chứa | Quy tắc |
|---|---|---|---|
| **Z1 · Header** | x 120, y 96, rộng 1680 | Eyebrow → Title → Lead (cách nhau 16) | Luôn ở cùng một chỗ trên mọi slide. Title 1 dòng, Lead 1 dòng |
| **Z2 · Nội dung** | x 120, y 344 → 952 (cao 608), rộng 1680 | Thẻ, danh sách, ảnh, bảng | Căn trên. Nội dung ngắn thì để trống phía dưới, không giãn ra cho đầy |
| **Z3 · Footer** | y 1000, cao 32, rộng 1680 | Trái: "Figma Agent · Làm quen" + tên phần. Phải: "08 / 20" | Chữ 18, màu `ink-3`. Không có ở slide bìa |

Bố cục chia đôi trong Z2: **chữ ở cột 1–6** (x 120, rộng 828), **ảnh ở cột 8–12** (x 1114, rộng 686). Cột 7 để trống làm khoảng thở.

## 3. Cấp thông tin (text style)

| Cấp | Style | Cỡ / độ đậm / line-height | Dùng cho |
|---|---|---|---|
| 0 | `deck/display` | 128 ExtraBold, 100% | Tên deck ở bìa |
| 1 | `deck/title` | 68 ExtraBold, 110% | Tiêu đề slide, mỗi slide 1 cái |
| 2 | `deck/lead` | 30 Regular, 140% | Câu dẫn ngay dưới tiêu đề |
| — | `deck/eyebrow` | 22 Bold, IN HOA, +6% | Phần / nhóm, nằm trên tiêu đề |
| 3 | `deck/h3` | 36 Bold, 120% | Tiêu đề thẻ |
| 4 | `deck/h4` | 28 Bold, 130% | Tiêu đề dòng danh sách |
| 5 | `deck/body` | 24 Regular, 145% | Mô tả thẻ, câu lệnh mẫu |
| 6 | `deck/body-s` | 22 Regular, 145% | Mô tả dòng danh sách |
| — | `deck/label` | 18 Bold, IN HOA, +6% | Nhãn nhỏ ("THỬ NÓI") |
| — | `deck/chip` | 20 Bold | Số thứ tự 01–04 |
| — | `deck/command` | Geist 24 SemiBold | Tên lệnh (clone, start…) |
| — | `deck/footer` | 18 Medium | Footer |

Eyebrow viết theo mẫu: slide trong một phần là "PHẦN n · tên phần"; slide 9–15 là "NHÓM 0n · tên nhóm". Footer nhắc lại tên phần, có chấm màu của nhóm.

Quy tắc: mỗi slide chỉ có một cấp 1. Không bỏ cấp (không đặt body ngay dưới title mà thiếu lead hoặc h3). Không để chữ lẻ một mình ở dòng cuối. Mô tả trong thẻ tối đa 2 dòng. Danh sách tối đa 5 mục.

## 4. Màu
- Chữ: `ink` #1F1D2B (tiêu đề) · `ink-2` #4A4760 (lead, body) · `ink-3` #8A8798 (footer, meta).
- Bề mặt: `bg` #F6F5F0 · `surface` #FFFFFF (thẻ) · `line` #ECE8E1 (viền 2 px, bên trong).
- Màu nhấn theo nhóm: `screens` #5B5BD6 · `images` #F2765A · `projects` #14A38B · `care` #F2B33D.
  Phần 1, 2, 4 dùng `screens`; slide 9–15 dùng màu của nhóm mình. Màu nhấn chỉ dùng cho eyebrow, chip, pill lệnh và nền nhạt (tint 8–12%), không dùng cho thân chữ.
- Bo góc: thẻ 32 · dòng 24 · ô ảnh 20 · ô nhạt 20 · pill 999.

## 5. Khuôn slide

| Khuôn | Z2 gồm | Slide |
|---|---|---|
| **T1 Bìa** | Chữ ở cột 1–6, căn giữa theo chiều dọc; ảnh tràn phải | 1 |
| **T2 Thẻ** | 3–4 thẻ ngang (ảnh 300 + chip + h3 + body) | 2, 8 |
| **T3 Các bước** | 3–4 bước ngang, có mũi tên giữa các bước | 4, 5, 6 |
| **T4 Chia đôi** | Trái: danh sách dòng (h4 + body-s) + ô "Thử nói"; phải: ảnh 686 × 515 | 3, 9–16, 18 |
| **T5 Ảnh có chú thích** | Ảnh chụp ở giữa, 3 chú thích đánh số | 7 |
| **T6 So sánh** | Hai cột ✗ / ✓ | 17 |
| **T7 Bảng** | Bảng 3 dòng, có câu cứu cánh ở dưới | 19 |
| **T8 Kết** | Bài tập 4 bước + kênh hỗ trợ | 20 |

## 6. Ảnh
- Gemini, phong cách đất sét 3D theo `01-cover.png` (luôn truyền làm `refImagePath`), nền #F6F5F0, không có chữ.
- Tỉ lệ: bìa 16:9 · thẻ 1:1 · chia đôi 4:3. Lưu ở `generated-images/onboarding/<số slide>-<tên>.png`.
