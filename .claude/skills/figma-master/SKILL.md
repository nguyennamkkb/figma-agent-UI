---
name: figma-master
description: Chuẩn vận hành Figma cấp "master" cho cả AI agent (thao tác qua Figma MCP — use_figma, get_metadata, search_design_system…) lẫn designer: cấu trúc file và đặt tên, Auto Layout, variables/design token, component và variants, quy trình sáng tạo từ brief đến polish (kể cả Motion, shader, Make, Code Layers), QA và handoff Dev Mode. Dùng khi người dùng muốn dựng, dọn, review hoặc chuẩn hóa file Figma, tạo design system/thư viện component, khám phá hướng UI sáng tạo, chuẩn bị bàn giao cho dev, đánh giá trình độ Figma, hoặc gọi /figma-master — kể cả khi họ chỉ nói "vẽ giúp tôi màn hình này trên Figma" hay "file Figma của tôi lộn xộn quá".
---

# figma-master — Chuẩn vận hành & sáng tạo trên Figma

Skill độc lập, không phụ thuộc pipeline nào. Một chuẩn, hai người thực thi:

- **Chế độ Agent** — có Figma MCP (remote): agent tự đọc và ghi lên canvas theo chuẩn này.
- **Chế độ Designer** — không có MCP, hoặc người dùng muốn tự làm: agent xuất **hướng dẫn thao tác từng bước**, checklist, bảng token/naming để người làm theo.

Gọi `SKILL_DIR` là thư mục chứa file này.

## Bản đồ tài liệu — đọc đúng file, đúng lúc

| Khi cần | Đọc |
|---|---|
| Phiên có tool `figma-agent` (`figma_status`, `render_tree`…) — **đọc trước** | `references/figma-agent-adapter.md` |
| Thao tác Figma bằng MCP (mọi lần ghi lên canvas) | `references/agent-mcp.md` |
| Cấu trúc page, đặt tên layer/frame, Auto Layout, grid | `references/file-standards.md` |
| Variables, token, styles, component, variants, thư viện | `references/design-system.md` |
| Moodboard, khám phá hướng, critique, Motion, shader, AI | `references/creative-process.md` |
| QA, accessibility, Dev Mode, bàn giao cho dev (iOS/Android/Web) | `references/handoff-qa.md` |
| Đánh giá trình độ, lộ trình học, phím tắt | `references/skill-ladder.md` |
| Kiểm tra file token JSON (tên, alias, tương phản) | `scripts/check_tokens.py` |
| Mẫu brief / mẫu báo cáo QA | `assets/brief.template.md`, `assets/qa-report.template.md` |
| Mẫu token JSON 2 tầng có Light/Dark | `assets/tokens.example.json` |

Không đọc hết một lượt. Mỗi giai đoạn bên dưới ghi rõ file nào cần.

## 10 luật gốc (thắng mọi thói quen cá nhân)

1. **Không có giá trị trần.** Màu, cỡ chữ, spacing, radius, shadow luôn gắn variable hoặc style. Một mã hex gõ tay trong layer là lỗi.
2. **Auto Layout mặc định.** Mọi frame chứa nội dung dùng Auto Layout; chỉ dùng vị trí tự do cho lớp trang trí, ảnh nền, overlay — và đặt tên rõ là `decor/…`.
3. **Tìm trước khi tạo.** Trước khi vẽ một thành phần, tìm trong thư viện (agent: `search_design_system`). Tạo mới chỉ khi chắc chắn chưa có.
4. **Tên có nghĩa, không tên mặc định.** Không còn `Frame 12`, `Rectangle 4`, `Group 7` trong bất kỳ thứ gì bàn giao.
5. **Ngữ nghĩa trước, giá trị sau.** Token đặt theo vai trò (`color/text/primary`), không theo giá trị (`blue-500`) — trừ tầng primitive.
6. **Khám phá rộng trước khi đi sâu.** Mọi bài toán sáng tạo có ít nhất 2–3 hướng thật sự khác nhau trước khi polish một hướng.
7. **Mọi trạng thái đều được vẽ.** Default, pressed, disabled, loading, empty, error, nội dung dài, chữ lớn, dark mode.
8. **Tách vùng nháp và vùng chuẩn.** Khám phá ở page `🧪 Explore`; chỉ thứ đã duyệt mới vào `✅ Ready`.
9. **Không phá hủy.** Agent không xóa, không ghi đè thứ người dùng làm; sửa trên bản sao hoặc branch, có xác nhận trước khi đổi thứ ngoài phạm vi.
10. **Kiểm chứng bằng mắt.** Sau mỗi lần ghi, chụp lại (`get_screenshot`) và so với ý định. Không báo "xong" khi chưa nhìn.

## Quy trình 8 giai đoạn

Không phải task nào cũng chạy đủ 8. Xác định điểm vào ở Giai đoạn 0, rồi chạy từ đó. Có **gate người duyệt** sau giai đoạn 1, 4 và 7.

### Giai đoạn 0 — Tiếp nhận và định vị

1. Xác định chế độ: có tool ghi Figma trong phiên không — Figma MCP remote (`use_figma`, `get_metadata`…) **hoặc** `figma-agent` (`figma_status`, `render_tree`, `search_design_system`…)? Có → Agent. Với `figma-agent`: đọc `references/figma-agent-adapter.md` để đổi tên tool, gọi `figma_status` và xử lý cảnh báo `versionCheck` trước khi làm. Không có tool → Designer (vẫn chạy cùng quy trình, đầu ra là hướng dẫn). Nếu người dùng muốn Agent nhưng thiếu tool: nói rõ cần mở plugin figma-agent-UI (hoặc kết nối Figma MCP remote), rồi tiếp tục ở chế độ Designer.
2. Phân loại yêu cầu và chọn điểm vào:

| Yêu cầu | Bắt đầu ở |
|---|---|
| Dự án mới từ con số 0 | GĐ 1 |
| "Dọn / chuẩn hóa file này" | GĐ 7 (audit) → quay lại GĐ 2–3 để sửa |
| Tạo design system / thư viện | GĐ 2 → 3 |
| Vẽ màn hình mới trong file đã có hệ thống | GĐ 5 |
| "Tìm ý tưởng / làm đẹp hơn / sáng tạo hơn" | GĐ 4 |
| Prototype, animation | GĐ 6 |
| Bàn giao cho dev | GĐ 7 → 8 |
| Đánh giá trình độ / học Figma | `references/skill-ladder.md` |

3. Agent: nếu có link file, đọc cấu trúc trước (`get_metadata` theo page) để biết file đang có gì. Không đoán.

### Giai đoạn 1 — Brief và nền file → *gate*

Đọc `references/file-standards.md` và `assets/brief.template.md`.

1. Chốt brief tối thiểu: sản phẩm, người dùng, nền tảng (iOS / Android / Web / đa nền), mục tiêu kinh doanh, ràng buộc (thương hiệu có sẵn, deadline, accessibility), tiêu chí thành công. Thiếu thì hỏi — tối đa 3–4 câu, gộp một lần.
2. Dựng khung file theo chuẩn page (Cover, Brief, Explore, Foundations, Components, Screens, Prototype, Ready, Archive).
3. **Gate:** trình brief một trang + khung file. Chờ người dùng xác nhận trước khi đi tiếp.

### Giai đoạn 2 — Nền tảng (Foundations)

Đọc `references/design-system.md` mục 1–4.

1. Variables 3 tầng: **Primitives** (bảng màu thô, thang số) → **Semantic** (vai trò, có modes Light/Dark…) → **Component** (chỉ khi thực sự cần).
2. Typography scale, spacing scale (lưới 4/8), radius, elevation, motion tokens.
3. Đặt `scopes` cho từng variable để chỉ hiện đúng chỗ dùng.
4. Nếu có token dạng JSON: chạy `python3 SKILL_DIR/scripts/check_tokens.py <file.json>` và sửa hết lỗi trước khi đi tiếp.
5. Dựng page Foundations hiển thị trực quan mọi token (swatch, type specimen, spacing ruler).

### Giai đoạn 3 — Component

Đọc `references/design-system.md` mục 5–8.

1. Thứ tự dựng: nguyên tử (icon, text, divider) → thành phần cơ bản (button, input, chip, avatar) → tổ hợp (card, list row, nav bar, tab bar, sheet).
2. Mỗi component: anatomy rõ, Auto Layout đúng, bind 100% token, component properties thay vì variant thừa, đủ trạng thái, có mô tả và link tài liệu.
3. Đặt tên variant theo dạng `Property=Value`. Property đặt tên thống nhất toàn thư viện.
4. Dựng trang "Playground" kiểm tra từng component: kéo giãn, chữ dài, đổi mode, đổi kích thước.

### Giai đoạn 4 — Khám phá sáng tạo → *gate*

Đọc `references/creative-process.md`.

1. Thu thập tham chiếu và dựng moodboard có chú thích "lấy gì từ đây".
2. Phân kỳ: tạo **2–3 hướng thật sự khác nhau** (khác về ý tưởng, không chỉ khác màu), mỗi hướng áp vào cùng 1–2 màn hình "chìa khóa".
3. Mỗi hướng kèm: tên, ý tưởng một câu, điểm mạnh, rủi ro, hợp với ai.
4. **Gate:** dừng cho người dùng chọn hoặc trộn. Đây là quyết định tốn kém nhất nếu sai — không tự chọn thay.
5. Hội tụ: biến hướng đã chọn thành quy tắc (cập nhật token và component), rồi mới polish.

### Giai đoạn 5 — Dựng màn hình

1. Dựng từ component và token đã có; frame theo kích thước chuẩn của nền tảng (xem `file-standards.md` mục 4).
2. Mỗi màn hình đủ các biến thể trạng thái: có dữ liệu, rỗng, đang tải, lỗi, nội dung cực dài, cỡ chữ lớn, dark mode.
3. Sắp xếp theo luồng trái → phải, nhóm bằng Section, đặt tên theo quy tắc `Flow / Screen / State`.
4. Agent: dựng từng màn hình một, chụp kiểm tra sau mỗi màn, không dựng cả luồng trong một lần ghi.

### Giai đoạn 6 — Prototype và chuyển động

Đọc `references/creative-process.md` mục 7–8.

1. Prototype đúng luồng chính trước, nhánh phụ sau. Dùng interactive components cho tương tác vi mô (toggle, tab, accordion) để không phải nối dây từng màn.
2. Dùng variables + conditional logic khi prototype cần trạng thái (giỏ hàng, đăng nhập, bộ đếm).
3. Chuyển động (Smart Animate / Figma Motion): mỗi animation có lý do — dẫn hướng, phản hồi, hay nối không gian. Thời lượng và easing lấy từ motion tokens. Luôn có phương án Reduce Motion.

### Giai đoạn 7 — QA → *gate*

Đọc `references/handoff-qa.md` mục 1–3, dùng `assets/qa-report.template.md`.

1. Chạy checklist QA 6 nhóm: cấu trúc, token, layout, trạng thái, accessibility, nội dung.
2. Ghi lỗi theo mức: **Chặn** (phải sửa trước bàn giao), **Nên sửa**, **Gợi ý**.
3. Agent: kiểm tra tự động được gì thì kiểm (tên mặc định, giá trị không bind token, frame không Auto Layout, tương phản) bằng `use_figma` chỉ đọc; phần còn lại kiểm bằng screenshot.
4. **Gate:** trình báo cáo QA; sửa xong mục Chặn mới sang bàn giao.

### Giai đoạn 8 — Bàn giao (Handoff)

Đọc `references/handoff-qa.md` mục 4–6.

1. Đánh dấu Ready for dev theo Section, viết annotation cho hành vi không nhìn thấy được (logic, edge case, animation, accessibility).
2. Map token sang code (Swift/Kotlin/CSS) theo bảng trong `handoff-qa.md`. Có Code Connect thì nối component với code thật.
3. Ghi changelog phiên bản thư viện; publish thư viện kèm mô tả thay đổi.

## Đầu ra theo chế độ

**Agent:** thay đổi thật trên file Figma + một báo cáo ngắn: đã tạo/sửa gì (kèm node ID hoặc link), quyết định nào đã chốt, việc còn mở. Không mô tả lại những gì người dùng tự mở ra xem được.

**Designer:** một tài liệu hướng dẫn gồm: mục tiêu → các bước thao tác (đánh số, ghi rõ menu/phím tắt/panel) → bảng giá trị (token, naming) → checklist tự kiểm. Mỗi bước đủ cụ thể để làm không phải đoán.

## Self-check trước khi báo xong

- Không còn layer tên mặc định trong phạm vi đã làm.
- Không còn màu/cỡ chữ/spacing gõ tay ngoài tầng primitive.
- Frame nội dung đều dùng Auto Layout; resize thử không vỡ.
- Có đủ trạng thái và dark mode (nếu dự án có modes).
- Tương phản chữ thường ≥ 4.5:1, chữ lớn và thành phần UI ≥ 3:1.
- Agent: đã chụp và nhìn lại kết quả cuối; không xóa thứ ngoài phạm vi.
- Đã qua các gate người duyệt tương ứng với giai đoạn đã chạy.

## Bẫy thường gặp

- **Đi thẳng vào pixel** khi chưa có brief và token → mọi thứ phải làm lại khi đổi hướng.
- **Variant bùng nổ** (Size × State × Icon × Theme = hàng trăm) → dùng boolean/instance-swap property và variable modes thay vì variant.
- **Dark mode bằng cách nhân đôi màn hình** → dùng mode trên collection Semantic.
- **Group thay cho Frame** → Group không có Auto Layout, padding, clip; chỉ dùng Group cho minh họa.
- **"Sáng tạo" = thêm hiệu ứng** → sáng tạo nằm ở ý tưởng tổ chức nội dung và cảm xúc; hiệu ứng chỉ phục vụ ý tưởng.
- **Agent ghi một khối lớn rồi mới kiểm tra** → lỗi chồng lỗi. Ghi nhỏ, kiểm tra, rồi mới ghi tiếp.
- **Copy y nguyên app nổi tiếng** → tham chiếu phải ghi rõ lấy nguyên lý gì, không lấy bề mặt.
