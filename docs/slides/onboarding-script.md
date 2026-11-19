# Kịch bản slide: Làm quen Figma Agent

- **Người xem:** designer, PM, người mới trong team. Không cần biết code.
- **Mục tiêu:** sau buổi giới thiệu, người xem tự mở được plugin, biết agent làm được những gì và ra được lệnh đầu tiên.
- **Thời lượng:** 15–20 phút, 20 slide.
- **Giọng văn:** câu ngắn, nói theo lợi ích ("bạn được gì"). Không dùng thuật ngữ MCP, WebSocket, cổng, token kỹ thuật.
- **Từ dùng thống nhất:** *Agent* = trợ lý AI · *Plugin* = cửa sổ Figma Agent trong Figma · *Mã kết nối* = token · *Kỹ năng* = skill.

Mỗi slide gồm 4 phần: **Trên slide** (chữ hiện ra), **Hình** (minh hoạ), **Lời nói** (ghi chú cho người trình bày), **Thời gian**.

---

## Phần 1. Mở đầu

### Slide 1 · Bìa
- **Trên slide:** "Figma Agent: bạn nói, AI vẽ ngay trong Figma" · tên người trình bày · ngày.
- **Hình:** ảnh chụp một file Figma, góc phải là ô chat và plugin đang chạy.
- **Lời nói:** "Hôm nay mình giới thiệu một trợ lý giúp bạn làm việc trong Figma bằng lời nói. Sau 20 phút, mọi người sẽ tự dùng được."
- **Thời gian:** 0:30

### Slide 2 · Những việc lặp lại
- **Trên slide:** 3 thẻ: "Dựng lại cùng một kiểu màn hình" · "Đổi tên, dọn layer, gom màu" · "Làm 10 phiên bản banner".
- **Hình:** đồng hồ cát và chồng frame giống nhau.
- **Lời nói:** hỏi người xem: "Một tuần bạn mất bao nhiêu giờ cho những việc này?" Dừng lại để họ nghĩ.
- **Thời gian:** 1:00

### Slide 3 · Figma Agent là gì
- **Trên slide:** "Một trợ lý AI làm việc trực tiếp trong file Figma của bạn. Nó đọc được, vẽ được, sửa được và tự nhìn lại kết quả."
- **Hình:** 3 biểu tượng: con mắt (đọc), cây bút (vẽ/sửa), máy ảnh (tự kiểm tra).
- **Lời nói:** nhấn mạnh rằng agent không tạo ảnh chết. Nó tạo layer thật, có auto layout, component và màu theo hệ thống, nên bạn sửa tiếp được như file mình tự làm.
- **Thời gian:** 1:00

### Slide 4 · Một vòng làm việc
- **Trên slide:** 4 bước ngang: ① Bạn mô tả → ② Agent dựng trong Figma → ③ Agent tự chụp lại và sửa lỗi → ④ Bạn duyệt hoặc góp ý.
- **Hình:** sơ đồ vòng tròn, bước ④ quay lại bước ①.
- **Lời nói:** "Bạn luôn là người duyệt. Agent làm từng bước và dừng lại chờ bạn đồng ý ở những chỗ quan trọng."
- **Thời gian:** 1:00

---

## Phần 2. Bắt đầu

### Slide 5 · Cài đặt (làm một lần)
- **Trên slide:** 3 bước: "Cài Node.js, Git, VS Code rồi chạy một dòng lệnh (slide 6)" · "Thêm plugin vào Figma desktop" · "Mở lại ứng dụng AI (Claude Code / OpenCode / Codex)".
- **Hình:** 3 ô số lớn 1-2-3, mỗi ô có một ảnh chụp màn hình nhỏ.
- **Lời nói:** "Chỉ làm một lần. Nếu vướng, nhờ người hỗ trợ hoặc gõ cho agent: *kiểm tra kết nối Figma giúp tôi*." Không giải thích lệnh làm gì.
- **Thời gian:** 1:00

### Slide 6 · Cài môi trường, rồi chạy lệnh
- **Trên slide:** 3 phần mềm cài một lần, rồi 1 dòng lệnh:
  1. **Node.js** bản LTS mới nhất (26.13.1): https://nodejs.org/en/download
  2. **Git**: https://git-scm.com/install/windows (Windows; máy Mac thường đã có sẵn)
  3. **VS Code**, không gian làm việc: https://code.visualstudio.com/download
  4. Mở Terminal, dán: `npx -y --prefer-online github:nguyennamkkb/figma-agent-UI install`
- **Hình:** không ảnh; dải màu chàm với 3 bước, ô lệnh nền tối.
- **Lời nói:** cài đủ môi trường trước, nếu chưa có Node.js thì lệnh `npx` không chạy. Cài mặc định, không cần chỉnh gì.
- **Thời gian:** 1:30

### Slide 7 · Mỗi lần dùng
- **Trên slide:** "Mở file Figma → Plugins → Figma Agent → (lần đầu) dán mã kết nối → Connect. Thấy chấm xanh là xong."
- **Hình:** ảnh plugin trước và sau khi kết nối, khoanh tròn chấm xanh.
- **Lời nói:** lần đầu cần dán mã kết nối, có thể hỏi agent "cho tôi mã kết nối Figma". Từ lần sau plugin tự kết nối.
- **Thời gian:** 1:00

### Slide 8 · Làm quen cửa sổ plugin
- **Trên slide:** chú thích 3 vùng: trạng thái kết nối · nhật ký các việc agent đang làm · menu ⋯ (đổi kích thước, chọn file cho agent làm việc).
- **Hình:** ảnh plugin 300×300 có 3 mũi tên chú thích.
- **Lời nói:** "Nhật ký cho bạn biết agent vừa làm gì. Muốn agent làm trên file khác thì chọn file trong menu ⋯."
- **Thời gian:** 0:45

---

## Phần 3. Agent làm được gì

### Slide 9 · Bản đồ chức năng
- **Trên slide:** 4 nhóm lớn:
  1. **Thiết kế màn hình:** vẽ màn, luồng, chọn phong cách
  2. **Hình ảnh:** ảnh minh hoạ, icon, banner/popup
  3. **Dự án lớn:** làm lại giao diện app, bảng quảng cáo
  4. **Chăm sóc file:** dọn file, design system, kiểm tra, bàn giao
- **Hình:** lưới 2×2, mỗi nhóm một màu.
- **Lời nói:** "Mỗi nhóm có một kỹ năng riêng. Bạn không cần nhớ tên kỹ năng, cứ nói việc bạn muốn làm, agent sẽ tự chọn."
- **Thời gian:** 0:45

### Slide 10 · Vẽ màn hình và luồng
- **Trên slide:** "Vẽ giúp tôi màn hình đăng nhập cho app ví điện tử." Agent dựng theo 3 lượt: **khung → nội dung → kiểm tra**.
- **Hình:** 3 ảnh chụp cùng một màn hình qua 3 lượt (khối xám → đầy đủ → đã soát).
- **Lời nói:** với việc lớn, agent hỏi brief, đưa 2–3 hướng thiết kế để bạn chọn, rồi mới dựng từng màn. Mỗi màn được hoàn thiện xong mới làm màn tiếp theo.
- **Thời gian:** 1:00

### Slide 11 · Chọn phong cách
- **Trên slide:** "Làm giống ảnh này" / "Phong cách glassmorphism". Agent đưa ra 3 hướng: **An toàn · Cân bằng · Táo bạo**.
- **Hình:** 3 thẻ màu và chữ mẫu đặt cạnh nhau.
- **Lời nói:** agent đo màu, chữ và độ bo góc từ ảnh mẫu thay vì đoán, sau đó tạo bộ màu dùng chung cho cả file.
- **Thời gian:** 0:45

### Slide 12 · Hình ảnh và icon
- **Trên slide:** "Tạo ảnh minh hoạ onboarding đồng bộ cả bộ" · "Tách nền trong suốt cho mascot" · "Lấy icon upload, kiểu nét mảnh".
- **Hình:** dải 4 ảnh onboarding cùng phong cách, một mascot nền trong suốt, một hàng icon.
- **Lời nói:** ảnh trong cùng một bộ giữ đúng phong cách và bảng màu. Icon lấy từ hai thư viện miễn phí với hơn 7.000 icon.
- **Thời gian:** 1:00

### Slide 13 · Banner, popup, coupon (ui-visual)
- **Trên slide:** 3 lệnh:
  - **clone**: sao chép một visual có sẵn, chọn mức thay đổi từ L1 (chỉ đổi màu) đến L4 (làm mới theo cùng phong cách)
  - **create**: làm mới từ mô tả
  - **extract**: phân tích "công thức" của một visual đẹp
- **Hình:** banner gốc và 4 phiên bản L1 → L4.
- **Lời nói:** đây là phần gây ấn tượng nhất. Agent tách visual thành các lớp (ảnh AI, vật thể tách nền, hiệu ứng, chữ thật) rồi ghép lại, nên chữ vẫn sửa được.
- **Thời gian:** 1:15

### Slide 14 · Làm lại giao diện app (app-redesign)
- **Trên slide:** "Giao diện mới, chức năng giữ nguyên". 3 lệnh: **start** (hiểu app, đề xuất hướng, vẽ 3 màn chính để duyệt) → **build** (làm lại từng luồng) → **audit** (kiểm tra không thiếu màn, nút, liên kết, quảng cáo).
- **Hình:** màn cũ và màn mới đặt cạnh nhau, kèm một danh sách kiểm tra toàn dấu ✓.
- **Lời nói:** luôn làm trên bản sao của file. Trước khi sửa, agent chụp lại toàn bộ hiện trạng nên cuối cùng chứng minh được là không mất gì.
- **Thời gian:** 1:00

### Slide 15 · Bảng quảng cáo (ads-board)
- **Trên slide:** "Vẽ bảng vị trí quảng cáo của luồng First Open bản 1.9" · "So sánh bản 1.8 và 1.9".
- **Hình:** một section có 2 hàng thẳng cột: có quảng cáo / không quảng cáo.
- **Lời nói:** dành cho team sản phẩm và quảng cáo. Mỗi phiên bản là một section, nhìn vào là biết quảng cáo nằm ở đâu.
- **Thời gian:** 0:45

### Slide 16 · Chăm sóc file và bàn giao
- **Trên slide:** "File lộn xộn quá, dọn giúp tôi" · "Kiểm tra màn này còn lỗi gì" · "Thử màn này với chữ dài" · "Ghi chú và đánh dấu sẵn sàng cho dev" · "Viết tài liệu DESIGN.md".
- **Hình:** layer panel trước (Frame 123, Rectangle 45) và sau (đặt tên gọn gàng).
- **Lời nói:** các thao tác hàng loạt như đổi tên hay gắn màu đều cho xem trước, bạn đồng ý thì agent mới áp dụng.
- **Thời gian:** 1:00

### Slide 17 · Không chỉ Figma Design
- **Trên slide:** **FigJam:** sticky note, sơ đồ, bảng · **Slides:** dựng slide (như bộ slide này).
- **Hình:** một bảng FigJam nhỏ và một slide.
- **Lời nói:** "Bộ slide bạn đang xem cũng do agent dựng." (Chỉ nói câu này nếu đúng như vậy.)
- **Thời gian:** 0:30

---

## Phần 4. Dùng kỹ năng trong thực tế

Tag là cách gọi đích danh một kỹ năng: gõ `/` + tên kỹ năng + lệnh + đối tượng + yêu cầu. Không có tag, agent vẫn tự chọn kỹ năng theo câu nói; có tag, agent chạy đúng quy trình của kỹ năng đó, có các điểm dừng để bạn duyệt.

### Slide 18 · Gọi kỹ năng bằng tag
- **Trên slide:** cấu trúc một tag, 4 phần:
  - `/ui-visual` · **Kỹ năng**: gọi đúng chuyên gia
  - `clone` · **Lệnh**: việc cần làm
  - `[link mẫu]` · **Mẫu**: chọn frame hoặc dán link Figma
  - `L2 · chủ đề Tết` · **Yêu cầu**: thay đổi bạn muốn
- **Hình:** nhân vật đất sét gắn nhãn lên một tấm thiết kế.
- **Lời nói:** chỉ 3 kỹ năng lớn cần tag: ui-visual, app-redesign, ads-board. Việc khác cứ nói bình thường.
- **Thời gian:** 1:00

### Slide 19 · Bảng tag dùng hằng ngày
- **Trên slide:** bảng 3 cột: Bạn muốn · Gõ · Ví dụ thực tế.
  | Bạn muốn | Gõ | Ví dụ thực tế |
  |---|---|---|
  | Banner, popup giống mẫu | `/ui-visual clone` | /ui-visual clone [link banner VIP] L2 đổi sang chủ đề Tết |
  | Visual mới từ mô tả | `/ui-visual create` | /ui-visual create popup đánh giá 5 sao, giống ảnh này |
  | Học công thức một visual | `/ui-visual extract` | /ui-visual extract [link popup Rate] |
  | Làm lại giao diện app | `/app-redesign start` | /app-redesign start hiện đại, giữ màu thương hiệu L2 |
  | Bảng quảng cáo một phiên bản | `/ads-board` | /ads-board 1.9.0 |
  | So sánh hai phiên bản | `/ads-board diff` | /ads-board diff 1.8.0 1.9.0 |
- **Lời nói:** chụp màn hình bảng này để dùng hằng ngày.
- **Thời gian:** 1:00

### Slide 20 · Thực tế 1: banner theo mẫu
- **Trên slide:** 3 bước, kỹ năng ui-visual:
  1. **Chỉ vào mẫu:** chọn banner trong Figma hoặc copy link
  2. **Gõ tag:** `/ui-visual clone [link] L2 chủ đề Tết`
  3. **Duyệt và góp ý:** agent đưa phương án, dừng chờ bạn; đồng ý thì ghép lớp và tự kiểm tra
  - Mức thay đổi: L1 đổi màu · L2 đổi nhân vật · L3 đổi bố cục · L4 làm mới cùng phong cách
- **Lời nói:** chọn mức nhỏ nhất đủ dùng. Muốn giữ bố cục thì L1–L2.
- **Thời gian:** 1:00

### Slide 21 · Thực tế 2: làm lại giao diện app
- **Trên slide:** 4 bước, kỹ năng app-redesign:
  0. **Nhân bản file gốc** (Duplicate), làm trên bản sao
  1. `/app-redesign start hiện đại L2`: kèm mục tiêu và mức, 3 màn chính để duyệt hướng
  2. `/app-redesign build FL-01`: làm lại từng luồng
  3. `/app-redesign audit FL-01`: kiểm tra không thiếu màn, nút, quảng cáo
  - Mức thay đổi: L1 đổi màu tại chỗ · L2 làm mới, giữ bố cục (mặc định) · L3 đổi bố cục · L4 làm mới toàn bộ
- **Lời nói:** mỗi luồng xong mới sang luồng tiếp theo. FL-01 là mã luồng agent ghi trong kế hoạch. Không ghi mức thì agent tự suy ra (mặc định L2) và hỏi lại; mỗi luồng có thể chạy mức riêng, ví dụ chỉ đổi màu phần Cài đặt.
- **Thời gian:** 1:00

### Slide 22 · Điểm dừng: agent chờ bạn quyết
- **Trên slide:** 3 cách trả lời ở điểm dừng:
  - **Đồng ý:** "OK, làm tiếp"
  - **Sửa:** "Chọn hướng 2, nút to hơn"
  - **Dừng:** "Dừng ở đây, giữ bản hiện tại"
- **Hình:** nhân vật đất sét cầm biển dừng, bên cạnh dấu ✓.
- **Lời nói:** agent không tự đi tiếp qua điểm dừng. Trả lời càng cụ thể, vòng sửa càng ít.
- **Thời gian:** 0:45

---

## Phần 5. Dùng cho tốt

### Slide 23 · Cách ra lệnh hiệu quả
- **Trên slide:** công thức: **Việc + Cho ai/app gì + Phong cách hoặc mẫu + Giới hạn**.
  - ✗ "Vẽ paywall"
  - ✓ "Vẽ paywall cho app học tiếng Anh, giống phong cách ảnh này, 3 gói, gói năm được chọn sẵn, nút mua ở đáy màn hình"
- **Hình:** 2 bong bóng chat, một đỏ và một xanh.
- **Lời nói:** chọn sẵn frame trong Figma rồi nói "màn đang chọn" để agent hiểu bạn đang nói đến màn nào. Lệnh bằng tiếng Việt vẫn chạy tốt.
- **Thời gian:** 1:15

### Slide 24 · An toàn
- **Trên slide:** "Làm trên bản sao file quan trọng" · "Cmd+Z hoàn tác từng bước của agent" · "Xem nhật ký trong plugin" · "Duyệt ở mỗi bước dừng".
- **Hình:** biểu tượng chiếc khiên với 4 dấu ✓.
- **Lời nói:** agent có quyền sửa file đang mở, nên làm việc với file gốc thì luôn nhân bản trước.
- **Thời gian:** 0:45

### Slide 25 · Khi gặp sự cố
- **Trên slide:** bảng 3 dòng:
  - Agent báo chưa kết nối → mở plugin, bấm Connect
  - Plugin báo bản cũ → đóng rồi mở lại plugin
  - Plugin đứng im → đóng và mở lại plugin
  - Câu cứu cánh: **"Kiểm tra kết nối Figma giúp tôi"**
- **Hình:** 3 biểu tượng cảnh báo kèm cách xử lý.
- **Lời nói:** phần lớn sự cố đều xử lý được bằng cách mở lại plugin.
- **Thời gian:** 0:45

### Slide 26 · Thử ngay và kênh hỗ trợ
- **Trên slide:** bài tập 10 phút:
  1. Mở một file trống, kết nối plugin
  2. Gõ: "Vẽ màn hình chào mừng cho app ghi chú, phong cách tối giản"
  3. Góp ý một lần: "Nút to hơn, đổi màu chính sang xanh lá"
  4. Gõ: "Kiểm tra màn này"
  
  Kênh hỗ trợ: [điền]
- **Hình:** ảnh màn chào mừng do agent làm, kèm mã QR hoặc link tài liệu.
- **Lời nói:** mời mọi người làm thử ngay tại chỗ, rồi dành 5 phút cho hỏi đáp.
- **Thời gian:** 1:00

---

## Gợi ý dàn trang
- Tỉ lệ 16:9, nền sáng, mỗi nhóm chức năng ở slide 8 có một màu nhấn và màu đó được dùng lại ở các slide 9–15.
- Mỗi slide tối đa 1 tiêu đề, 3–5 dòng chữ và 1 hình lớn.
- Ảnh minh hoạ nên lấy từ kết quả thật trong các file đã làm (redesign AI Chatbot, banner VIP Mist, popup Rate, bảng First Open) thay vì ảnh mẫu.
