# Quy trình sáng tạo trên Figma

## Mục lục
1. Mô hình vận hành: Hiểu → Mở rộng → Thu hẹp → Đánh bóng
2. Brief sáng tạo và câu hỏi đúng
3. Tham chiếu và moodboard
4. Phân kỳ: kỹ thuật tạo hướng khác nhau thật sự
5. Critique và hội tụ
6. Đánh bóng thị giác (polish)
7. Chuyển động: Smart Animate và Figma Motion
8. Vật liệu mới và AI trên canvas
9. Thói quen của người làm giỏi

---

## 1. Mô hình vận hành

```
HIỂU ──► MỞ RỘNG ──► THU HẸP ──► ĐÁNH BÓNG
brief     2–3 hướng   chọn + quy tắc   pixel, motion
          (Explore)   (gate người dùng) (Screens)
```
- Mở rộng nhanh và thô: low-fi, grayscale, không lo pixel. Mục tiêu là số lượng ý tưởng khác nhau.
- Thu hẹp bằng tiêu chí (từ brief), không bằng cảm tính "thấy đẹp".
- Đánh bóng chỉ hướng đã chọn. Đánh bóng sớm là lãng phí và làm người duyệt bám vào chi tiết.

## 2. Brief sáng tạo

Ngoài brief sản phẩm (xem `assets/brief.template.md`), chốt thêm:
- **Cảm xúc chủ đạo:** 3 tính từ, mỗi tính từ kèm "không phải" (ví dụ: *ấm áp — không phải trẻ con*).
- **Khoảnh khắc chìa khóa:** 1–2 màn hình quyết định ấn tượng (onboarding, home, kết quả). Mọi hướng khám phá sẽ áp lên chính các màn này để so sánh công bằng.
- **Thứ không được đổi:** logo, màu thương hiệu, quy ước nền tảng bắt buộc.
- **Thước đo:** người dùng phải làm được gì nhanh hơn/dễ hơn.

## 3. Tham chiếu và moodboard

1. Thu thập 15–30 tham chiếu từ nhiều nguồn: sản phẩm cùng ngành, **ngoài ngành** (tạp chí, kiến trúc, bao bì, game, poster), thiên nhiên, chất liệu.
2. Dán vào page Explore, nhóm theo chủ đề: màu, typography, bố cục, hình ảnh, chuyển động, chi tiết vi mô.
3. **Chú thích từng tham chiếu**: lấy *nguyên lý* gì ("thứ bậc thông tin bằng cỡ chữ cực lớn", "màu nền đổi theo nội dung"), không chỉ "đẹp".
4. Rút ra 3–5 nguyên lý chung → đó là nguyên liệu cho các hướng.

Agent: có thể dùng `generate_figma_design` chụp giao diện tham chiếu đang chạy làm ảnh tham khảo; luôn ghi nguồn; không dùng làm thiết kế cuối.

## 4. Phân kỳ — tạo hướng khác nhau thật sự

Kiểm tra "khác thật sự": nếu che màu đi mà hai hướng trông giống nhau → chưa khác.

### 4.1 Trục để tạo khác biệt
| Trục | Cực A ↔ Cực B |
|---|---|
| Mật độ | Thoáng, một ý mỗi màn ↔ Dày, bảng điều khiển |
| Thứ bậc | Chữ dẫn dắt (editorial) ↔ Hình ảnh dẫn dắt |
| Cấu trúc | Danh sách/thẻ quen thuộc ↔ Không gian/canvas tự do |
| Giọng | Nghiêm túc, công cụ ↔ Vui, cá tính |
| Chất liệu | Phẳng, viền mảnh ↔ Chiều sâu, kính, bóng đổ, shader |
| Chuyển động | Tĩnh, tức thời ↔ Liên tục, vật lý |

Chọn 2–3 tổ hợp cực khác nhau → mỗi tổ hợp là một hướng.

### 4.2 Kỹ thuật
- **Crazy 8s:** 8 phương án bố cục cho một màn trong 8 phút (low-fi frames 393×852 xếp lưới).
- **Đảo ngược:** "Nếu màn này không được có danh sách thì sao?"
- **Phóng đại:** đẩy một thuộc tính lên cực đại (chữ 96px, một màu duy nhất) rồi lùi lại.
- **Mượn ngành khác:** bố cục tạp chí cho app tài chính; giao diện game cho app học.
- **Ràng buộc nhân tạo:** chỉ 2 màu; chỉ 1 font, 2 cỡ; không icon.
- **Biến thể nhanh bằng mode:** đã có variable thì tạo mode thử nghiệm (`Exp – Warm`, `Exp – Mono`) và đổi mode cả màn để so sánh tức thì.

### 4.3 Trình bày hướng
Mỗi hướng một Section trong Explore:
- Tên gợi hình (không phải "Option A"): "Tạp chí buổi sáng", "Bảng điều khiển yên tĩnh".
- Ý tưởng một câu.
- 1–2 màn chìa khóa + bảng màu/chữ mini.
- Điểm mạnh, rủi ro, hợp với ai.

## 5. Critique và hội tụ

### 5.1 Khung critique (dùng cho người và agent)
1. **Mục tiêu:** hướng này giúp người dùng đạt mục tiêu trong brief tốt đến đâu?
2. **Thứ bậc:** nhìn 3 giây, mắt đi đâu trước, sau? Có đúng thứ tự ưu tiên?
3. **Nhất quán:** cùng một loại thứ có trông giống nhau?
4. **Cảm xúc:** đúng 3 tính từ trong brief? Có rơi vào cực "không phải"?
5. **Khả thi:** dev làm được trong ràng buộc? Accessibility có vấn đề?
6. **Khác biệt:** có điểm nào người dùng nhớ được?

Phản hồi theo dạng: *quan sát → tác động → đề xuất*. Tránh "không thích".

### 5.2 Hội tụ
- Người dùng chọn hoặc trộn. Ghi lại **lý do chọn** và **lý do loại** vào page Brief.
- Chuyển hướng thắng thành quy tắc: cập nhật token, text style, component. Hướng thua → Archive (không xóa).

## 6. Đánh bóng thị giác

Checklist polish theo thứ tự hiệu quả:
1. **Căn chỉnh và nhịp:** mọi khoảng cách thuộc thang spacing; các cạnh thẳng hàng; nhịp dọc đều.
2. **Typography:** tối đa 2 family; độ tương phản cỡ chữ rõ giữa các cấp; độ dài dòng hợp lý; không mồ côi một chữ cuối đoạn ở tiêu đề.
3. **Màu:** màu nhấn chỉ cho thứ quan trọng (quy tắc 60-30-10 làm điểm khởi đầu); trạng thái dùng màu feedback nhất quán.
4. **Quang học:** căn icon theo quang học (icon tam giác "play" lệch phải nhẹ); text trong nút căn giữa theo mắt, không chỉ theo hộp.
5. **Góc bo lồng nhau:** bo trong = bo ngoài − padding (để đường cong song song).
6. **Chi tiết vi mô:** độ dày viền đồng nhất, shadow cùng nguồn sáng, ảnh cùng tông.
7. **Nội dung thật:** thay lorem ipsum bằng nội dung thật hoặc gần thật; tên dài, số lớn, ảnh xấu.
8. **Thử dark mode và cỡ chữ lớn** — polish không chỉ cho trường hợp đẹp.

## 7. Chuyển động

### 7.1 Khi nào chuyển động
| Mục đích | Ví dụ |
|---|---|
| Dẫn hướng không gian | Đẩy màn, mở sheet từ dưới lên, phóng thẻ thành chi tiết |
| Phản hồi | Nút co nhẹ khi nhấn, rung khi sai mật khẩu |
| Trạng thái | Skeleton → nội dung, loading → thành công |
| Cá tính (dùng tiết kiệm) | Minh họa onboarding, ăn mừng hoàn thành |

Không có mục đích → không animate.

### 7.2 Smart Animate (prototype)
- Hai frame có layer **cùng tên, cùng cấp** → Figma nội suy vị trí, kích thước, độ mờ, màu, xoay.
- Đặt tên layer nhất quán giữa các frame là điều kiện bắt buộc.
- Interactive components: tạo tương tác giữa các variant (Default → Pressed khi nhấn) để mọi instance tự có tương tác.
- Variables + conditional: `if count > 0 → hiện badge`, đổi mode khi bật dark mode.

### 7.3 Figma Motion (timeline, nếu tài khoản có)
- Animation theo keyframe ngay trên canvas: vị trí, scale, xoay, opacity, easing; dùng cho micro-interaction, chuyển cảnh, minh họa động.
- Thuộc tính shader cũng có thể đặt keyframe → hiệu ứng nền, ánh sáng động.
- Thời lượng và easing lấy từ motion tokens (`design-system.md` mục 2.5).
- Luôn xuất kèm thông số cho dev: duration, delay, easing (cubic-bezier hoặc spring stiffness/damping), thuộc tính thay đổi.
- Thiết kế phương án **Reduce Motion**: thay trượt/phóng bằng fade ngắn hoặc chuyển tức thì.

## 8. Vật liệu mới và AI trên canvas

> Các tính năng dưới đây đã được Figma công bố năm 2026, một số đang beta, triển khai dần và thường chỉ có ở gói trả phí. Kiểm tra tài khoản có tính năng nào trước khi đưa vào quy trình.

| Công cụ | Dùng để | Lưu ý chuẩn |
|---|---|---|
| **Shader fills/effects** | Nền, ánh sáng, nhiễu, kính, gradient động | Là "vật liệu" — đặt thành style/token, dùng nhất quán; kiểm tra tương phản chữ trên nền shader; có phương án tĩnh cho Reduce Motion và máy yếu |
| **Figma agent (AI trong Figma)** | Sinh bản nháp, đổi bố cục, dọn tên layer, tạo biến thể nhanh | Coi đầu ra là bản nháp ở Explore; luôn đối chiếu luật gốc (token, Auto Layout, tên) trước khi đưa vào Screens |
| **Weave tools** | Tạo/chỉnh ảnh, minh họa, đồ họa bằng luồng AI dạng node | Ghi lại workflow/prompt đã dùng để tái tạo được; kiểm tra quyền dùng hình ảnh |
| **Generative plugins** (tạo plugin bằng prompt) | Tự động hóa việc lặp lại của riêng team: đổi tên hàng loạt, sinh dữ liệu, kiểm tra | Kiểm tra plugin trên bản sao trước khi chạy trên file thật |
| **Figma Make** | Prototype có code, chạy được, từ prompt hoặc thiết kế | Tốt để thử tương tác phức tạp và test với người dùng; nguồn chuẩn vẫn là file Design |
| **Code Layers / Figma Sites** | Layer code tương tác trên canvas; xuất bản thiết kế thành web | Tách rõ phần "thiết kế chuẩn" và phần "thử nghiệm code" bằng Section riêng |

Agent: khi người dùng yêu cầu sáng tạo bằng AI, vẫn áp vòng lặp Mở rộng → Thu hẹp: tạo nhiều biến thể nhỏ, trình bày có tên và lý do, chờ chọn.

## 9. Thói quen của người làm giỏi

- **Thiết kế với nội dung thật** từ sớm; nội dung quyết định bố cục.
- **Grayscale trước, màu sau** — nếu thứ bậc không đứng được ở grayscale, màu không cứu được.
- **Zoom 100% thường xuyên**, xem trên thiết bị thật (Figma mirror/app) — canvas phóng to đánh lừa cỡ chữ và vùng chạm.
- **Đặt tên ngay khi tạo** — tốn 2 giây bây giờ, đỡ 2 giờ khi bàn giao.
- **Phím tắt là tốc độ**: xem `skill-ladder.md` mục 3.
- **Một nguồn sự thật**: sửa ở component chính, không sửa ở instance rồi detach.
- **Ghi lý do**: mỗi quyết định thiết kế quan trọng có một dòng "vì sao" (comment hoặc annotation).
