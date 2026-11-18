# plan.md template

Write it in the user's language. One file, 8 parts, approved at the end of `start`; updated after each `build`.

```markdown
# <App> — phương án redesign

> File làm việc: "<name>" · Baseline: <date> · Trạng thái: chờ duyệt | đã duyệt <date>

## 1. Mục tiêu và tóm tắt
- Mục tiêu (nguyên văn): > …
- 5 ý: cảm giác · người dùng · mục tiêu kinh doanh · tham chiếu · ràng buộc (ghi "giả định" nếu tự suy ra)
- Quy mô: <n> màn, <n> trạng thái, <n> luồng, <n> dạng màn, <n> liên kết; ước lượng <n> phiên build

## 2. Kiểm kê
| Luồng | Section gốc | Họ màn (mã · dạng màn · trạng thái) |
Sơ đồ luồng chính (mermaid hoặc danh sách cạnh)

## 3. Chẩn đoán bản gốc
(archetypes.md §3: rác, tên, màn ảnh phẳng, design system, CTA, copy, trạng thái thiếu, liên kết, quảng cáo)

## 4. Hướng giao diện
| | A · bám mục tiêu | B · an toàn | C · táo bạo |
| Bảng màu (hex) | Chữ | Bo góc / đổ bóng | Ảnh | CTA | Sửa được gì | Rủi ro |
Hướng đề xuất: … · 3 màn main: <tên> (page Explore, section …)
Ảnh: bảng gốc → mới (giữ / đổi gì) cho các ảnh hero

## 5. Component và CTA
- Component theo dạng màn: …
- Bảng CTA: nút gốc (màn · nhãn) → loại (Purchase / Generate / Primary / Solid / Destructive / Secondary / Text)

## 6. Kế hoạch theo luồng
| Thứ tự | Luồng | Màn mẫu | Trạng thái nhân bản | Màn dùng chung | Trạng thái đề xuất thêm | Rủi ro |

## 7. Nghiệm thu
Kết quả `audit` mới nhất: covered / shared / missing; lỗi CTA; ảnh

## 8. Quyết định và câu hỏi mở
```
