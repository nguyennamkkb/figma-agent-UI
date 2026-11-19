# Kế hoạch lập skill `app-redesign`

> Trạng thái: **skill đã tạo (`.claude/skills/app-redesign`, v1.6.7), chờ chạy thử trên dự án thật** · Ngày: 2026-11-17 · Dự án thử nghiệm: AI Cine Video (file làm việc "AI Cine Video-clone")

---

## 1. Mục tiêu

Skill giúp **clone một ứng dụng trong Figma: thay toàn bộ giao diện, giữ nguyên chức năng**. Người dùng chưa cần kinh nghiệm vẫn làm được theo các bước có điểm duyệt.

Cụ thể, skill phải:

1. **Đọc** file gốc và lập danh sách đầy đủ màn hình, trạng thái và luồng.
2. **Phân tích**: gom màn theo dạng màn, chẩn đoán lỗi của bản gốc, ước lượng khối lượng.
3. **Đưa ra phương án thay đổi toàn diện** dưới dạng một tài liệu duy nhất để người dùng duyệt.
4. **Dẫn dắt việc dựng lại** từng section, dùng các skill đã có.
5. **Nghiệm thu**: chứng minh bản clone không mất chức năng nào so với bản gốc.

### Mô hình làm việc: một file duy nhất

```
File gốc của người dùng ──(người dùng tự nhân bản)──► Bản copy = FILE LÀM VIỆC
   agent không kết nối, không đọc                      agent đọc, chụp baseline, rồi sửa trực tiếp tại đây
```

1. **Hỏi lại trước tiên.** Skill gọi `figma_status`, liệt kê các file đang mở rồi hỏi: *"Sửa trực tiếp trên file `<tên>`, đúng không?"* Chưa có câu trả lời "đúng" thì không ghi gì.
2. **Ghi tên file đã xác nhận** vào `redesign/<app>/project.md`. Mọi lệnh ghi đều truyền `file=<tên đó>`; nếu file khác đang mở thì không được ghi vào file đó.
3. **Chụp baseline trước khi sửa:** quét toàn bộ màn của bản copy lúc còn nguyên → `inventory.baseline.json`, export ảnh hero → `images/source/`. Baseline thay cho bản gốc trong mọi phép so sánh.
4. **Sửa tại chỗ:** nắn lại section theo chức năng (FL-NN), thay từng màn vào đúng vị trí. Màn cũ chuyển sang page `Archive · Before redesign` (không xóa) cho đến khi section đó nghiệm thu xong.

### Không làm

- Không tự vẽ giao diện ngoài quy trình. Việc dựng màn vẫn theo `figma-ui-flow`, chọn style theo `style-direction`, ảnh theo `asset-generator`, bảng quảng cáo theo `ads-board`.
- Không kết nối, không sửa file gốc của người dùng. Chỉ làm trên bản copy đã được xác nhận.
- Không đổi chức năng: không thêm hay bớt màn, trạng thái, luồng hoặc vị trí quảng cáo khi người dùng chưa đồng ý.

---

## 2. Nguyên tắc cốt lõi: 3 lớp

| Lớp | Nội dung | Quy tắc |
|---|---|---|
| **Chức năng** | Màn, trạng thái (rỗng / đã chọn / loading / lỗi / thành công), luồng, điều kiện (Pro, coin, quyền truy cập), vị trí quảng cáo | **Khóa**: bản clone phải có đủ |
| **Nội dung** | Chữ, dữ liệu mẫu, loại ảnh, icon | Giữ ý nghĩa, được viết lại cho rõ, sửa lỗi chính tả |
| **Giao diện** | Token, component, bố cục, ảnh minh họa, hiệu ứng | Đổi tự do theo hướng đã duyệt |

**Tiêu chí hoàn thành:** báo cáo nghiệm thu không còn dòng "Thiếu".

Hai thứ nằm giữa lớp Nội dung và lớp Giao diện có **quy tắc riêng bắt buộc**, xem mục 2.1 và 2.2.

### 2.0 Mức thay đổi L1–L4 (thêm 2026-11-19)

Lớp Giao diện được đổi nhiều hay ít là do **mức thay đổi**, chọn ở `start` và duyệt cùng hướng thiết kế. Cùng thang với `ui-visual`. Chi tiết: `.claude/skills/app-redesign/references/levels.md`.

| Mức | Tên | Giữ nguyên | Được đổi | Ảnh hero | Cách dựng |
|---|---|---|---|---|---|
| **L1** | Đổi màu | bố cục, cấu trúc component, ảnh, chữ | màu, font, bo góc, hiệu ứng | giữ nguyên | sửa tại chỗ, không Archive |
| **L2** | Làm mới (mặc định) | bố cục và thứ tự khối của từng màn | + component, icon, ảnh (đổi tối thiểu), chữ rõ hơn | tạo lại, đổi tối thiểu | dựng lại trên khung màn cũ |
| **L3** | Đổi bố cục | màn, trạng thái, luồng | + thứ tự khối, thứ bậc, điều hướng trong màn | tạo lại, được đổi bố cục ảnh | dựng lại hoàn toàn |
| **L4** | Làm mới toàn bộ | chỉ chức năng | + kiến trúc thông tin (gộp/tách màn), phong cách ảnh mới | phong cách mới, ảnh gốc làm tham chiếu nội dung | dựng lại, gộp/tách ghi `shared`/`dropped` có lý do |

Mỗi luồng có thể chạy mức riêng (`build FL-03 L1`). `parity.py --level` kiểm tra lệch mức: `LVL-LAYOUT` (L1/L2 đổi thứ tự khối), `LVL-SIZE` và `IMG-L1` (L1 đổi khung hoặc ảnh); ở L1 không báo `IMG-SOURCE`.

### 2.1 Ảnh onboarding và ảnh chủ đạo: tạo mới từ ảnh gốc

Ảnh onboarding (splash, OB1–OBn, hero paywall, banner Home, ảnh template) là nơi truyền cảm xúc của app. Đổi giao diện **không được làm mất cảm xúc và chất lượng** của ảnh gốc.

**Quy tắc:** mỗi ảnh mới được tạo bằng cách **dùng chính ảnh gốc làm ảnh tham chiếu** (`refImagePath` của `gemini-image-mcp`), không viết prompt lại từ đầu theo style mới.

| Giữ nguyên (cảm xúc + chất lượng) | Được đổi một chút (để là ảnh mới) |
|---|---|
| Bố cục, góc máy, tiêu cự (ví dụ wide-angle selfie) | Danh tính người (khuôn mặt, kiểu tóc), trang phục |
| Loại chủ thể và hành động (2 cô gái selfie, công chúa…) | Chi tiết bối cảnh, đạo cụ |
| Cảm xúc: vui, phấn khích, kỳ ảo… | Màu nhấn, kéo về bảng màu mới (amber / peach / teal…) |
| Ánh sáng, độ sáng, độ sắc, chất liệu (hyperreal, sáng) | Ánh sáng nhấn nhỏ (rim light, hạt sáng) |
| Tỉ lệ ảnh và vùng trống cho chữ / nút | — |

**Quy trình cho từng ảnh:**
1. `export_assets` ảnh gốc (độ phân giải gốc) vào `redesign/<app>/images/source/`.
2. Viết prompt dạng **"giữ — đổi"**: liệt kê những gì giữ (theo cột trái), rồi chỉ rõ 2–3 điều được đổi.
3. Tạo ảnh với `refImagePath = ảnh gốc`, mỗi lần một ảnh. Ảnh đầu tiên được duyệt sẽ làm tham chiếu phụ cho cả bộ để đồng đều.
4. **Duyệt cạnh nhau:** gốc | mới trên canvas (page Explore), người dùng chọn. Tiêu chí: cùng cảm xúc, chất lượng không thấp hơn, không có lỗi AI (tay, mắt, chữ méo), độ phân giải ≥ ảnh gốc.
5. Thay ảnh vào fill của layer hero cũ (giữ node, chỉ đổi image hash), ghi lại trong `project.md` theo cặp `ảnh gốc → ảnh mới`.

**Bài học từ AI Cine Video (2026-11-16):** bộ ảnh đầu tiên tạo theo prompt style riêng (cinematic vàng/teal tối) bị chê "không hấp dẫn". Làm lại với ảnh gốc làm tham chiếu (`generated-images/onboard-v2/`) thì đạt. Khi người dùng nói "chất liệu giống gốc", nghĩa là dùng ảnh gốc làm tham chiếu.

### 2.2 CTA: đúng loại nút, hiệu ứng nằm trong component

CTA được phân loại theo `figma-ui-flow/references/cta-playbook.md`; skill này không chép lại công thức mà **bắt buộc áp dụng và kiểm tra** nó.

| Loại | Dùng cho | Hiệu ứng | Biến thể component |
|---|---|---|---|
| **Purchase** (nút mua) | Paywall, mua coin, mở Premium: **mọi hành động trả tiền** | Gradient Primary + 2 inner shadow + **2 vạch chéo trắng 25%** (mirror sweep: band A 134×52 tại x48, band B 85×52 tại x11, nghiêng ~47°, bị cắt trong viên thuốc). Khi chạy thật: vạch quét trái → phải 1.2–1.6 s, nghỉ 1.5 s, lặp | `Button / Style=Purchase` |
| **Generate** (tiêu coin) | Nút tạo cuối cùng trước khi trừ coin | Gradient Primary + vạch ngăn + số coin | `Style=Generate` |
| **Primary** | Một hành động chính của màn (Next, Try now, Swap Face) | Gradient + 2 inner shadow, không vạch chéo, không glow ngoài | `Style=Primary` |
| **Dialog primary** | Nút trong dialog | **Solid** `accent/primary`, không gradient, không bóng | `Style=Solid` (cần bổ sung) |
| **Destructive** | Discard, Delete, Log out | Chữ / nền đỏ, **không** dùng màu accent | `Style=Destructive` (cần bổ sung) |
| **Secondary / Text / Disabled** | Lựa chọn phụ, Restore, Privacy, chưa đủ điều kiện | Không hiệu ứng | `Style=Secondary / Text / Disabled` |

**Quy tắc:**
1. Vạch chéo **chỉ** có trên nút Purchase. Không nút nào khác được có.
2. Mỗi màn chỉ một nút Primary hoặc Purchase.
3. Hiệu ứng nằm trong **biến thể component**, không vẽ tay và không override trên instance. Nút mua chép nguyên từ bản gốc (frame có `Rectangle 41981/41982`) phải đổi thành instance `Style=Purchase`.
4. Giá coin chỉ hiện trên nút ở màn cuối trước khi trừ coin. Trạng thái Disabled không hiện giá.
5. Nhãn nút nói rõ việc sẽ xảy ra. Nếu đổi nhãn so với bản gốc (ví dụ "Continue" → "Start Premium"), ghi vào `copy-map` để nghiệm thu không báo thiếu.

**Kiểm tra CTA khi chạy thử trên AI Cine Video (2026-11-17):**

| Phát hiện | Vị trí | Việc cần làm |
|---|---|---|
| Nút mua là frame vẽ tay (có vạch chéo), không phải instance | SCR-08 Paywall `13:7834` | Thay bằng instance `Style=Purchase`, giữ nhãn |
| Dialog dùng Primary gradient thay vì Solid | FBK-02…08, FBK-12, FBK-17, FBK-18 | Thêm `Style=Solid`, đổi các nút trong dialog |
| "Discard" dùng Primary (màu accent) | FBK-14 | Thêm `Style=Destructive` |
| Hai nút Primary cùng lúc | FBK-14 (Swap Face + Discard), SCR-15 Report Step 2/3 (Create New + Send report) | Hạ một nút xuống, hoặc xác nhận là nằm dưới scrim |
| "Go Premium" / "Unlock Premium" (hành động trả tiền) | FBK-12 (bản gốc), FBK-16 | Kiểm tra: nút trả tiền phải là Purchase hoặc Secondary dẫn tới Paywall |
| Đúng chuẩn | SCR-16 Coin Purchase = `Style=Purchase`; SCR-12 = `Style=Generate` | — |

---

## 3. Ba lệnh của skill

Skill chỉ có **3 lệnh**: `/app-redesign start [L1–L4]`, `/app-redesign build [FL-NN] [L1–L4]`, `/app-redesign audit`. Các việc nhỏ (quét, phân tích, viết phương án, chọn hướng, tạo ảnh, dựng token/component, vá lỗi, bàn giao, xem tiến độ) đều nằm bên trong 3 lệnh này. ◆ = chỗ lệnh dừng lại chờ bạn duyệt.

### 3.1 `/app-redesign start [mô tả mục tiêu redesign] [L1|L2|L3|L4]` — khởi động, hiểu dự án, đề xuất hướng mới

Sau `start` bạn viết tự do **mục tiêu redesign**, bao nhiêu cũng được. Ví dụ:

```
/app-redesign start hiện đại, sạch, nền tối, nhắm Gen Z, cảm giác điện ảnh, giữ tông ảnh gốc
/app-redesign start giống style ảnh /Users/me/ref/app-x.png, sáng, nhiều khoảng trắng, nút bo tròn
/app-redesign start làm premium hơn để tăng mua gói, Paywall nổi bật, bỏ cảm giác rẻ tiền
```

Skill đọc mô tả theo 5 ý: **cảm giác / style**, **người dùng mục tiêu**, **mục tiêu kinh doanh** (tăng mua gói, giữ chân…), **tham chiếu** (ảnh, link, tên app, tên style), **ràng buộc** (giữ màu thương hiệu, sáng/tối…).
- Mục tiêu được ghi vào `project.md` → mục **Mục tiêu redesign**, và là tiêu chí chấm 2–3 hướng đề xuất: một hướng bám sát mô tả, các hướng còn lại thử biến thể (an toàn hơn / táo bạo hơn).
- Có ảnh tham chiếu thì chạy `style-direction` để đo style DNA của ảnh đó.
- Không viết mô tả, hoặc thiếu ý quan trọng, thì skill hỏi tối đa 3 câu ngắn (cảm giác mong muốn, người dùng, có tham chiếu không). Bạn trả lời "tùy bạn" thì skill tự đề xuất dựa trên app gốc và ghi rõ đó là giả định.
- Có thể nhắc tên file ngay trong mô tả (`/app-redesign start file "AI Cine Video-clone", hiện đại hơn`). Không nhắc thì bước 1 tự hỏi.

**Bước 1 — chọn và xác nhận file làm việc** (skill gọi `figma_status`, rồi xử lý theo bảng; chưa xác nhận xong thì không ghi gì):

| Tình huống | Skill làm gì |
|---|---|
| **Chưa file nào mở plugin** (hoặc bridge chưa chạy) | Dừng lại và hướng dẫn: mở **bản copy** trong Figma desktop → Plugins → Development → figma-agent-UI → dán token → Connect. Bạn báo "xong" thì skill kiểm tra lại. |
| **Có nhắc tên file**, file đó **đang mở** | Hỏi xác nhận: *"Sửa trực tiếp trên file `<tên>`, đúng không?"* |
| **Có nhắc tên file**, file đó **chưa mở** | Báo file chưa kết nối, liệt kê các file đang mở; hỏi bạn mở file đó hay chọn một file trong danh sách |
| **Không nhắc tên**, **1 file** đang mở | Hỏi xác nhận: *"Sửa trực tiếp trên file `<tên>` (page hiện tại `<page>`), đúng không?"* |
| **Không nhắc tên**, **≥ 2 file** đang mở | Hỏi chọn: *"Sửa trực tiếp trên file nào?"* kèm danh sách (tên file + page đang mở); có lựa chọn "File khác, chưa mở" |
| Dự án **đã có `project.md`** (chạy `start` lần 2) | File đã xác nhận còn mở → dùng tiếp, không hỏi lại; đã đóng → nhắc mở lại đúng file đó |

Sau khi bạn chọn, skill hỏi thêm một câu: *"File này là bản copy, không phải file gốc, đúng không?"*, vì skill sẽ sửa trực tiếp trên file. Plugin khác phiên bản server thì skill nhắc mở lại plugin trước khi quét.

**Không sửa variables, styles hay component có sẵn của file.** Chỉ thêm page Explore và Archive, và vẽ 3 màn đề xuất.

| Bước trong lệnh | Việc làm | Quy trình |
|---|---|---|
| 1. Chọn + xác nhận file ◆ | Theo bảng ở trên: chưa mở → hướng dẫn mở; 1 file → hỏi xác nhận; nhiều file → hỏi chọn; xác nhận là bản copy; tạo `redesign/<app>/project.md` | B0 |
| 2. Quét baseline | Đọc toàn bộ file trước khi sửa: màn, trạng thái, luồng, chữ, CTA, ảnh, quảng cáo; export ảnh hero | B1 |
| 3. Hiểu chức năng | Gom màn trùng, tách trạng thái, xếp dạng màn, vẽ bản đồ luồng, chẩn đoán lỗi | B2 |
| 4. Nghiên cứu phương án | Style DNA của app gốc + **mục tiêu redesign** (+ ảnh tham chiếu nếu có) → 2–3 hướng thiết kế mới, mỗi hướng ghi rõ đáp ứng mục tiêu thế nào; viết `plan.md` (8 phần) | B2–B3 |
| 5. Vẽ 3 màn main ◆ | Trên page Explore: **3 màn chính** (ví dụ Home, một màn tạo nội dung, Paywall) theo hướng bám sát mục tiêu nhất (các hướng khác có moodboard / 1 màn mẫu để so). Ảnh tạo từ ảnh gốc làm tham chiếu; màu và chữ để giá trị cục bộ, chưa thành token | B3 |

**Kết thúc:** bạn duyệt 3 màn và `plan.md`. Có thể yêu cầu chỉnh rồi chạy lại `start` (lệnh chạy tiếp từ chỗ đang dừng, không quét lại nếu file chưa đổi).

### 3.2 `/app-redesign build [FL-NN] [L1–L4]` — làm lại từng luồng

Không ghi `FL-NN` thì làm luồng tiếp theo theo thứ tự trong `plan.md`, ở mức ghi cho luồng đó. L1 bỏ bước ảnh và sửa màn tại chỗ; L2 dựng lại trên khung màn cũ; L3/L4 dựng lại hoàn toàn (mục 2.0).

| Bước trong lệnh | Việc làm | Quy trình |
|---|---|---|
| 0. Nền tảng (chỉ lần build đầu) | Biến hướng đã duyệt thành variables, text style, component theo dạng màn, bộ `Button` đủ loại CTA (Purchase có 2 vạch chéo, Solid, Destructive…); cập nhật 3 màn main sang token | B4 |
| 1. Ảnh của luồng ◆ | Ảnh onboarding/hero của luồng: tạo từ ảnh gốc, đặt cạnh nhau gốc \| mới để bạn duyệt | mục 2.1 |
| 2. Dựng lại | Mỗi dạng màn làm 1 bản mẫu → nhân trạng thái → thay vào đúng vị trí (màn cũ sang Archive) → text flow + connector | B5 |
| 3. Tự kiểm tra | Chạy `audit` cho luồng vừa làm; tự vá các lỗi rõ ràng (thiếu trạng thái, CTA sai loại); lỗi cần quyết định thì hỏi bạn | B6 |
| 4. Báo cáo ◆ | Screenshot luồng + kết quả audit; bạn duyệt xong mới sang luồng sau | — |

### 3.3 `/app-redesign audit [FL-NN]` — kiểm tra và bàn giao

Chỉ đọc, trừ khi bạn đồng ý cho vá. Không ghi `FL-NN` thì kiểm tra cả file.

| Bước trong lệnh | Việc làm | Quy trình |
|---|---|---|
| 1. Tiến độ | Luồng nào xong, luồng nào chưa, bước tiếp theo nên làm | — |
| 2. So với baseline | Đủ chức năng: màn, trạng thái, luồng, quảng cáo; kiểm tra CTA (mục 2.2) và ảnh (mục 2.1) | B6 |
| 3. Chất lượng | `audit_design` (token, contrast, tên layer), `stress_test` (chữ dài, nội dung rỗng) | B6 |
| 4. Báo cáo | `parity-report.md`; hỏi **"Vá các lỗi này không?"**, bạn đồng ý thì vá | B6 |
| 5. Bàn giao (khi mọi luồng đạt) ◆ | Bảng mã cũ → mới, ghi chú cho dev, đánh dấu Ready for dev; hỏi trước khi dọn page Archive | B7 |

### 3.4 Thứ tự một dự án

```
start ◆ ──► build ◆ (FL-01) ──► build ◆ (FL-02) ──► … ──► audit ◆ (cả file + bàn giao)
            └ lần đầu dựng token + component      audit FL-NN chạy được bất cứ lúc nào
```

### 3.5 Gom 12 việc thành 3 lệnh

| Việc (bản trước) | Nằm trong |
|---|---|
| xác nhận file, scan, analyze, plan, direction | `start` |
| images | `start` (ảnh cho 3 màn main) + `build` (ảnh của từng luồng) |
| foundations | `build` (lần đầu) |
| build, fix | `build` |
| parity, handoff, status | `audit` |

**Nói bằng tiếng Việt cũng được:** "bắt đầu redesign file này cho hiện đại hơn", "phân tích dự án" → `start` (phần mô tả được lấy làm mục tiêu); "vẽ lại FL-03", "làm luồng tiếp" → `build`; "kiểm tra", "so với bản gốc", "đang tới đâu rồi", "bàn giao" → `audit`.

---

## 4. Quy trình 7 bước (có điểm duyệt)

```
B0 Chuẩn bị ─► B1 Kiểm kê ─► B2 Phân tích ─► B3 Chọn hướng ◆ ─► B4 Nền tảng ─► B5 Dựng lại ─► B6 Nghiệm thu ◆ ─► B7 Bàn giao
                                                ◆ = điểm duyệt của người dùng
```

| Bước | Đầu vào | Việc làm | Đầu ra | Công cụ / skill |
|---|---|---|---|---|
| **B0 Chuẩn bị** ◆ | Bản copy do người dùng tạo | **Hỏi xác nhận file làm việc**; ghi `project.md`; thêm page chuẩn còn thiếu (Foundations, Components, Archive) mà không đụng page đang có | File làm việc đã xác nhận | `figma_status`, `manage_pages`, `figma-ui-flow` |
| **B1 Kiểm kê** | File làm việc, **trước khi sửa** | Chụp baseline: quét mọi màn (chữ, component, ảnh, quảng cáo, connector, CTA); lọc rác; ghép bản trùng; export ảnh hero | `inventory.baseline.json`, `flows.json`, `images/source/` | `scan.js` (execute_code), `export_assets` |
| **B2 Phân tích** | Inventory | Gom dạng màn; xác định trạng thái; chẩn đoán lỗi gốc; lập bảng mã màn mới (SCR-NN / FBK-NN) | `analysis.md`, `screen-map.json` | `analyze.py` |
| **B3 Chọn hướng** ◆ | Analysis | 2–3 hướng trên 3 màn đại diện; **ảnh onboarding/hero tạo từ ảnh gốc làm tham chiếu** (mục 2.1), duyệt cạnh nhau gốc \| mới | Hướng đã chọn, Style brief, token, ảnh mẫu đã duyệt | `style-direction`, `asset-generator` |
| **B4 Nền tảng** | Token + danh sách dạng màn | Variables, text style, component cho từng dạng màn; **bộ `Button` đủ loại CTA** (Primary, Purchase có vạch chéo, Generate, Solid, Destructive, Secondary, Text, Disabled) | Page Foundations + Components | `figma-ui-flow` (`cta-playbook.md`), `create_variables`, `create_component_set` |
| **B5 Dựng lại** | screen-map + component | Mỗi dạng màn làm 1 bản mẫu → nhân trạng thái → thay vào đúng vị trí (màn cũ sang page Archive), đặt tên theo mã mới → cập nhật text flow + connector. Mọi nút là instance đúng loại; ảnh theo bảng `ảnh gốc → ảnh mới`. Xong một section mới sang section khác | Section FL-NN hoàn chỉnh | `figma-ui-flow`, `asset-generator`, `ads-board` |
| **B6 Nghiệm thu** ◆ | Baseline + file làm việc hiện tại | So từng màn/trạng thái/luồng; **kiểm tra CTA** (mục 2.2) và **kiểm tra ảnh** (còn ảnh gốc chưa thay, ảnh mới chưa duyệt); `audit_design` + `stress_test` | `parity-report.md` | `scan.js` + `parity.py` |
| **B7 Bàn giao** | Clone đạt nghiệm thu | Bảng mã cũ → mới, ghi chú cho dev | `handoff.md`, `set_dev_status` | `figma-agent-tools` |

---

## 5. Cấu trúc thư mục skill

```
.claude/skills/app-redesign/
  SKILL.md                         router: lệnh, bước, khi nào đọc file nào
  references/
    process.md                     chi tiết B0–B7, điểm duyệt, mẹo
    inventory-format.md            định dạng inventory.json / flows.json / screen-map.json
    matching.md                    cách ghép màn baseline ↔ màn hiện tại (chữ, component, ảnh, vị trí)
    archetypes.md                  danh sách dạng màn chuẩn của app mobile + trạng thái bắt buộc
    diagnosis-checklist.md         các lỗi hay gặp ở file gốc
    plan-template.md               khung tài liệu "Phương án thay đổi toàn diện"
    parity-rules.md                thế nào là Đủ / Thiếu / Dùng chung / Trùng / Thừa
    imagery.md                     tạo ảnh mới từ ảnh gốc: bảng giữ / đổi, mẫu prompt, quy trình duyệt cạnh nhau
    cta-rules.md                   bảng loại CTA → biến thể, quy tắc, checklist; công thức chi tiết trỏ sang figma-ui-flow/cta-playbook.md
  scripts/
    scan.js                        code execute_code: quét một page → JSON
    analyze.py                     inventory → nhóm trùng, dạng màn, bảng mã màn, analysis.md
    parity.py                      inventory.baseline + inventory.current + screen-map → parity-report.md

redesign/<app>/                    dữ liệu từng dự án, ở gốc repo, NGOÀI skill (ví dụ redesign/ai-cine-video/)
    project.md                     file làm việc, mục tiêu redesign, page, section id, quyết định đã duyệt
    inventory.baseline.json        chụp file làm việc trước khi sửa (thay cho bản gốc)
    inventory.current.json         quét lại sau mỗi section
    flows.json
    screen-map.json                màn baseline ↔ mã màn mới ↔ node hiện tại
    image-map.json                 ảnh gốc (hash, màn) ↔ ảnh mới (file, hash) ↔ trạng thái duyệt
    images/source/                 ảnh gốc export để làm tham chiếu
    plan.md                        tài liệu phương án (bản người dùng duyệt)
    parity-report.md               báo cáo nghiệm thu mới nhất
```

Script Python có docstring hướng dẫn sử dụng ở đầu file (theo quy ước của repo). Không viết comment trong code.

---

## 6. Thiết kế từng thành phần

### 6.1 `scan.js` — quét (B1, B6)

Chạy qua `execute_code` với tham số `file` + `page`, chỉ đọc. Mỗi màn (FRAME / COMPONENT / INSTANCE trong SECTION hoặc GROUP) xuất ra:

| Trường | Ý nghĩa |
|---|---|
| `id`, `name`, `section`, `x`, `y`, `w`, `h` | Định danh + vị trí (để biết thứ tự trong luồng) |
| `texts[]` | Chữ hiển thị (bỏ giờ ở status bar, chữ ẩn) |
| `instances[]` | Tên component đang dùng (Toast, loading, Dialog…) |
| `images[]` | Hash ảnh (6 ký tự đầu) |
| `ads[]` | Vùng quảng cáo nhận được qua tên / chữ "Ad", "Sponsored" |
| `ctas[]` | Mỗi nút: nhãn, loại (instance → tên biến thể; frame vẽ tay → `LOCAL`), có vạch chéo hay không, có gradient / bóng hay không, nằm trong dialog hay không |
| `heroImages[]` | Ảnh lớn (≥ 40% chiều rộng màn): hash, kích thước, layer chứa; dùng cho `image-map.json` |
| `flat` | `true` nếu màn chỉ là ảnh chụp (≤ 3 node) |
| `signature` | Tập chữ + instance + ảnh hiển thị, dùng để ghép |

Connector xuất ra `flows.json`: `from`, `to`, `label`.

**Lọc rác:** section có tên chứa `test`, `seed`, `tmp`, `wiring`; node lạc ngoài section; frame `Title`, `Note`, `Container` (đánh dấu là `meta` thay vì bỏ hẳn).

**Giới hạn output:** mỗi lần quét 1 section nếu file lớn (giới hạn 20 000 ký tự); script nhận `sectionIds` làm tham số.

### 6.2 `analyze.py` — phân tích (B2)

1. **Nhóm trùng:** hai màn có `signature` giống hệt nhau → "Trùng" (ví dụ 2 màn "Home/ Choose Template" ở AI Cine Video).
2. **Trạng thái:** các màn cùng tên hoặc cùng bố cục, chỉ khác vài phần tử → một màn + nhiều trạng thái. Đặt tên trạng thái theo phần khác biệt: có `loading` → Loading; có `Toast` → Error/Toast; có ảnh người dùng → Filled…
3. **Dạng màn:** gán mỗi màn vào một dạng trong `archetypes.md` (Splash, Language, Onboarding, Paywall, Home, Template detail, Setup, Picker, Crop, Processing, Result, Dialog, Settings, Coin purchase…).
4. **Bảng mã màn:** đề xuất `SCR-NN · <Màn> · <Trạng thái>` / `FBK-NN` cho dialog và overlay → `screen-map.json`.
5. **Chẩn đoán:** đếm màu / cỡ chữ không bind token, component bị detach, tên trùng, lỗi chính tả, trạng thái bị thiếu so với `archetypes.md` (ví dụ Setup không có trạng thái lỗi).
6. **Ước lượng:** số dạng màn × độ khó + số trạng thái nhân bản → số buổi làm.

### 6.3 `parity.py` — nghiệm thu (B6)

Ghép màn baseline ↔ màn hiện tại theo thứ tự ưu tiên:

1. `screen-map.json` (đã ghép sẵn ở B2–B5).
2. Chữ chung nhiều nhất (bỏ chữ đã được viết lại; có bảng `copy-map` trong `project.md`).
3. Instance đặc trưng (Toast, loading, Dialog).
4. Thứ tự vị trí trong section.

Kết quả từng màn gốc:

| Kết luận | Điều kiện |
|---|---|
| **Đủ** | Có màn clone tương ứng, đủ trạng thái |
| **Dùng chung** | Không có trong section này nhưng có ở section khác và có connector dẫn tới |
| **Trùng** | Màn gốc giống hệt một màn gốc khác |
| **Thiếu** | Không tìm được → phải làm |
| **Thừa (clone)** | Màn clone không có gốc (ví dụ bản "No Ads"): hợp lệ nếu `project.md` ghi lý do |

Ngoài màn hình, `parity.py` kiểm thêm 2 nhóm:

| Nhóm | Báo lỗi khi |
|---|---|
| **CTA** | Nút vẽ tay (`LOCAL`); vạch chéo trên nút không phải Purchase; hành động trả tiền không dùng Purchase; dialog dùng gradient; Destructive dùng màu accent; > 1 Primary/Purchase trên một màn; giá coin hiện trên nút Disabled |
| **Ảnh** | Màn clone vẫn dùng hash ảnh gốc ở vị trí hero (chưa thay); ảnh mới không có trong `image-map.json` hoặc chưa được duyệt; ảnh mới nhỏ hơn ảnh gốc |

Báo cáo gồm bảng tổng theo section, danh sách "Thiếu" kèm node id của màn gốc, danh sách lỗi CTA và ảnh, kết quả `audit_design` / `stress_test` từng section.

### 6.4 `plan-template.md` — tài liệu phương án

1. Mục tiêu redesign (nguyên văn + 5 ý đã tách) và tóm tắt: số màn, số trạng thái, số luồng, số dạng màn, ước lượng khối lượng.
2. Kiểm kê: bảng màn theo section + sơ đồ luồng.
3. Chẩn đoán bản gốc.
4. Hướng giao diện (sau B3): Style brief, token, bảng ảnh `gốc → mới` (giữ / đổi gì).
5. Component theo dạng màn + bảng CTA (loại → biến thể → màn sử dụng).
6. Kế hoạch theo section: thứ tự, màn mẫu, màn nhân bản, rủi ro.
7. Bảng nghiệm thu (cập nhật sau mỗi section).
8. Quyết định đã duyệt và câu hỏi còn mở.

---

## 7. Lộ trình xây dựng skill

| Mốc | Nội dung | Kiểm chứng trên AI Cine Video | Phiên bản |
|---|---|---|---|
| **M1. `audit`** (quét + nghiệm thu) | `scan.js` (gồm `ctas`, `heroImages`), `parity.py` (màn + CTA + ảnh), `parity-rules.md`, `cta-rules.md`, `inventory-format.md`, `SKILL.md` khung | Tự tìm ra đúng 3 chỗ thiếu (Home · Loading, Setup · Toast, Face Swap · Detecting) và các lỗi CTA ở bảng mục 2.2; không báo nhầm phần dùng chung. *Riêng lần thử này:* AI Cine Video-clone được làm trước khi có quy trình nên không có baseline; dùng một lần bản quét chỉ đọc của file "AI Cine Video" làm `inventory.baseline.json`. Từ dự án sau, baseline luôn chụp từ chính file làm việc | 1.6.7 |
| **M2. `start`** (quét + phân tích + phương án + 3 màn main) | `analyze.py`, `archetypes.md`, `diagnosis-checklist.md`, `plan-template.md`, `imagery.md` | Tạo `plan.md` cho AI Cine Video: gom ~95 màn gốc thành ~12 dạng màn, chẩn đoán đúng (tên trùng, rác, lỗi "Regenrate…"); `image-map.json` liệt kê đủ ảnh onboarding/hero gốc ↔ ảnh onboard-v2 | 1.6.8 |
| **M3. `build` + bàn giao** | `process.md` (B0, B4, B5, B7), liên kết sang `figma-ui-flow` / `style-direction` / `asset-generator` / `ads-board` | Vá 3 chỗ thiếu (Home · Loading trên Cine Reel SCR-10 + connector từ FL-01, Setup · Toast, Face Swap · Detecting); thêm `Style=Solid` + `Style=Destructive`; Paywall dùng instance `Style=Purchase`; chạy lại `audit` → không còn "Thiếu", 0 lỗi CTA | 1.6.9 |
| **M4. Phát hành** | Thêm vào `BUNDLED_SKILLS` (`setup-lib.ts`) + `files` (`package.json`); thử installer trong home tạm; `npm pack --dry-run` | `install` / `doctor` / `uninstall` chạy sạch | 1.7.0 |

Mỗi mốc: bump version, chờ người dùng yêu cầu mới commit/push.

---

## 8. Tiêu chí nghiệm thu skill

- [ ] Chạy trên AI Cine Video: báo đúng 3 chỗ thiếu, 0 báo nhầm.
- [ ] Không có lệnh nào ghi vào file gốc.
- [ ] `plan.md` đủ 8 phần, người chưa có kinh nghiệm đọc hiểu được.
- [ ] Sau khi vá, `audit` báo 100% Đủ / Dùng chung / Trùng.
- [ ] 0 lỗi CTA: vạch chéo chỉ có trên nút Purchase, không còn nút vẽ tay, dialog dùng Solid, Discard dùng Destructive.
- [ ] Mọi ảnh onboarding/hero có cặp `gốc → mới` trong `image-map.json`, đã duyệt cạnh nhau, không còn ảnh gốc ở vị trí hero.
- [ ] Skill hoạt động với một app khác chỉ bằng cách tạo `redesign/<app>/project.md` mới.
- [ ] Installer cài / gỡ skill đúng.

---

## 9. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| File gốc lớn, output vượt 20 000 ký tự | Quét theo từng section, ghi JSON ra đĩa qua script |
| Màn gốc chỉ là ảnh chụp (không có layer) | Đánh dấu `flat`; ghép bằng vị trí + tên; cần người dùng xác nhận bằng screenshot |
| Bản clone viết lại chữ nên khó ghép | `screen-map.json` là nguồn chính; `copy-map` cho các câu đã đổi |
| Tên màn gốc trùng nhau | Ghép bằng chữ + instance + ảnh, không dùng tên |
| Nhầm "dùng chung" thành "thiếu" | Đọc connector; cho phép ghi ngoại lệ trong `project.md` |
| Plugin khác phiên bản server | Kiểm tra `figma_status` trước khi quét |
| Ảnh mới lệch cảm xúc hoặc kém chất lượng hơn gốc | Luôn dùng ảnh gốc làm `refImagePath`; prompt "giữ — đổi"; duyệt cạnh nhau trước khi thay |
| Ảnh mới quá giống gốc (gần như chép) | Bắt buộc đổi ít nhất danh tính người + một chi tiết bối cảnh + màu nhấn |
| Hiệu ứng nút trôi lệch giữa các màn | Hiệu ứng chỉ nằm trong biến thể component; `audit` báo nút `LOCAL` và override |

---

## 10. Quyết định đã chốt (2026-11-17)

| # | Câu hỏi | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 1 | Nơi lưu dữ liệu dự án | **Ngoài skill, trong repo:** `redesign/<app>/` ở gốc repo | Skill chỉ chứa quy trình + script, không chứa dữ liệu dự án; script nhận đường dẫn `redesign/<app>/`; `files` trong `package.json` không ship `redesign/` |
| 2 | Tên skill | **`app-redesign`** | 3 lệnh: `/app-redesign start \| build \| audit` (mục 3) |
| 3 | Màn Home cuối FL-01 | **Cine Reel Video home**, dùng chung SCR-10 (`19:3056`) | Ở M3 không vẽ thêm màn: FL-01 nối connector tới SCR-10 ở FL-03 (`audit` tính là "Dùng chung"), thêm trạng thái **SCR-10 · Home · Loading** cho cả FL-01 và FL-03 |
| 4 | Mức tự động ở B5 | **Tự dựng, không dùng agent** | `process.md` mô tả cách dựng tuần tự trong một phiên: bản mẫu → nhân trạng thái → thay vào section; không có phần brief cho agent |
| 5 | File nào agent đọc và sửa | **Chỉ bản copy (file làm việc)**: không quét file gốc; bước đầu tiên luôn hỏi xác nhận "sửa trực tiếp trên file `<tên>`, đúng không?" | Bước đầu của lệnh `start`; baseline chụp từ file làm việc trước khi sửa; màn cũ chuyển sang page Archive thay vì xóa |
| 6 | Số lệnh | **3 lệnh: `start`, `build`, `audit`** | `start` dừng ở 3 màn main trên page Explore, chưa đụng variables/component; token + component dựng ở lần `build` đầu; vá lỗi và bàn giao nằm trong `audit` |
| 7 | Đầu vào của `start` | **`start` + mô tả mục tiêu redesign** (văn bản tự do, có thể kèm ảnh/link tham chiếu) | Mục tiêu ghi vào `project.md` và `plan.md` mục 1; là tiêu chí chọn hướng; thiếu thì hỏi tối đa 3 câu |
| 8 | Chọn file khi không nhắc tên | **Luôn hỏi**: chưa mở file nào → hướng dẫn mở plugin; 1 file → xác nhận; nhiều file → chọn trong danh sách; thêm câu xác nhận "là bản copy" | Bảng tình huống ở mục 3.1 |
| 9 | Mức thay đổi (2026-11-19) | **L1–L4 như `ui-visual`, mặc định L2**; L1 sửa tại chỗ không Archive; `parity.py` thêm `LVL-LAYOUT` | `references/levels.md`; `start` suy ra mức từ mục tiêu và duyệt cùng hướng; mức riêng theo luồng trong `project.md` và `screen-map.json` |
