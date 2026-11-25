# plan.md template

Write it in the user's language. One file, 8 parts, approved at the end of `start`; updated after each `build`.

```markdown
# <App> — phương án redesign

> File làm việc: "<name>" · Baseline: <date> · Trạng thái: chờ duyệt | đã duyệt <date>

## 1. Mục tiêu và tóm tắt
- Mục tiêu (nguyên văn): > …
- Mục đích: app anh em (khác bản gốc, phát hành thêm) | làm mới chính app này
- 5 ý: cảm giác · người dùng · mục tiêu kinh doanh · tham chiếu · ràng buộc (ghi "giả định" nếu tự suy ra)
- Trả lời 4 câu hỏi: hướng · mức · sáng/tối · phong cách ảnh (và phương án đã gợi ý); các trục còn lại là giả định theo hướng đã chọn
- Mức thay đổi: L1 đổi màu · L2 làm mới (giữ bố cục) · L3 đổi bố cục (mỗi màn chính ≥ 3 nước đổi bố cục, có ≥ 1 nước cấu trúc) · L4 làm mới toàn bộ — mức chọn, lý do, luồng nào khác mức chung
  | Mức | Giữ nguyên | Được đổi | Ảnh hero |
- Quy mô: <n> màn, <n> trạng thái, <n> luồng, <n> dạng màn, <n> liên kết; ước lượng <n> phiên build

## 2. Kiểm kê
| Luồng | Section gốc | Họ màn (mã · dạng màn · trạng thái) |
Sơ đồ luồng chính (mermaid hoặc danh sách cạnh)

## 3. Chẩn đoán bản gốc
(archetypes.md §3: rác, tên, màn ảnh phẳng, design system, CTA, copy, trạng thái thiếu, liên kết, quảng cáo)

## 4. Hướng giao diện
Bảng khoảng cách 10 trục (questions.md §2): bản gốc | A | B | C — app anh em: mỗi hướng khác bản gốc ≥ 6/10 trục, luôn gồm họ màu, phong cách ảnh, bố cục; khác cả các app anh em đã phát hành
| | A · bám mục tiêu | B · an toàn | C · táo bạo |   (cả 3 hướng nằm trong mức đã chọn)
| Bảng màu (hex) | Chữ | Bo góc / đổ bóng | Ảnh | CTA | Sửa được gì | Rủi ro |
Hướng đã chọn: … (lý do) · hướng bị loại: … (lý do) · 3 màn main: <tên> (page Explore, section …)
Ảnh: bảng gốc → mới (giữ / đổi gì) cho các ảnh hero

## 5. Component và CTA
- Component theo dạng màn: …
- Bảng CTA: nút gốc (màn · nhãn) → loại (Purchase / Generate / Primary / Solid / Destructive / Secondary / Text)

## 6. Kế hoạch theo luồng
| Thứ tự | Luồng | Mức | Cách làm (theo hướng chung / theo FL-NN / thử riêng) | Màn mẫu | Trạng thái nhân bản | Màn dùng chung | Gộp/tách (L4) | Trạng thái đề xuất thêm | Rủi ro |

## 7. Nghiệm thu
Kết quả `audit` mới nhất: covered / shared / missing; lỗi CTA; ảnh

## 8. Quyết định và câu hỏi mở
```
