# Kiểm thử thủ công trong Figma

`npm test` kiểm tra schema, bridge, MCP end-to-end (với plugin giả) và việc bundle `code.js` load được. Phần **vẽ thật trên canvas** chỉ kiểm tra được trong Figma desktop. Làm checklist này sau mỗi thay đổi ở `src/plugin/`.

Chuẩn bị: `npm run build`, mở một file Figma nháp, chạy plugin, Connect. Trong Claude Code, `/mcp` phải thấy `figma-agent` connected.

## A. Kết nối (P0/P1)
- [ ] Plugin hiện **Connected · <tên file> · <page>**. Sai token thì hiện *Invalid token*.
- [ ] Tắt Claude Code: plugin chuyển *Waiting for MCP server…* và tự kết nối lại khi mở lại.
- [ ] `figma_status` liệt kê đúng file. Mở 2 file, gọi tool với `file` → đúng file.

## B. Đọc
- [ ] `get_document_info` đúng tên page, top-level frame.
- [ ] Chọn 1 frame → `get_selection` có `layout`, `padding`, `fill` dạng hex hoặc `{var}`, text có `font`.
- [ ] `get_design_system` trên file có variables/styles/components: có modes, giá trị, properties của component set.
- [ ] `list_fonts` với `family: "Inter"` có "Semi Bold".
- [ ] `screenshot` trả ảnh hiển thị được trong Claude Code.

## C. render_tree
- [ ] Dán `examples/fintech-wallet.json` vào ô test trong plugin → Render: màn hình đặt cạnh các frame cũ (không ở 0,0), được chọn và zoom tới.
- [ ] Text trong card không bị cắt; "Highlands Coffee" có `maxLines: 1`; hai nút chia đều chiều ngang; icon SVG màu trắng 16px.
- [ ] Gradient của Balance Card đi từ góc trên trái xuống dưới phải (135°).
- [ ] Gửi cây có `widthMode: "FILL"` ở root → lỗi rõ ràng, **không còn lớp thừa** trên canvas.
- [ ] Ảnh từ URL (qua agent) và từ đường dẫn file local hiển thị đúng tỉ lệ.
- [ ] `instance` với component local theo tên + `variant` + `texts` đổi đúng.
- [ ] `{ "var": "..." }` cho fill và gap → Figma hiển thị biến đã bind.
- [ ] Cmd+Z một lần xoá toàn bộ cây vừa vẽ.

## D. Sửa
- [ ] `update_nodes` đổi text của layer dùng font khác Inter (font load đúng).
- [ ] Đổi `width` của frame auto layout đang HUG chiều cao → chiều cao vẫn HUG.
- [ ] Batch có 1 id sai → các id khác vẫn được cập nhật, id sai nằm trong `failed`.
- [ ] `move_nodes`, `clone_node`, `delete_nodes`, `select_nodes` hoạt động; Cmd+Z hoàn tác từng lệnh.

## E. execute_code
- [ ] `return figma.currentPage.children.length` trả số.
- [ ] Tạo component set 2 variant bằng `figma.combineAsVariants` → trả id.
- [ ] Code lỗi → `safeToRetryWithoutCanvasRead: false`; code sai cú pháp → "Syntax error".
- [ ] Vòng lặp lâu với `timeoutMs: 2000` → server báo timeout, plugin vẫn dùng được sau đó.

## F. Agent end-to-end
Prompt mẫu trong Claude Code:
1. "Thiết kế màn hình đăng nhập mobile cho app ngân hàng, tiếng Việt, dùng design system trong file nếu có."
2. "Chọn frame tôi đang chọn, đổi sang dark mode và tăng khoảng cách giữa các section lên 24."
3. "Rà soát màn hình đang chọn: text bị cắt, spacing lệch, độ tương phản; sửa luôn."

Đạt khi agent: kiểm tra file trước khi dựng, dựng bằng 1–2 lệnh `render_tree`, chụp `screenshot` và tự sửa lỗi nhìn thấy, không để lớp rác khi lỗi.

## G. Kết quả kiểm thử thực tế (Figma desktop)

Đã chạy đủ **16/16 tool** trên một page test riêng rồi xoá page đó (thiết kế gốc không đổi). Trạng thái: `render_tree` (frame/text/rect/ellipse/svg/gradient 135°/`component`/`instance` + `texts`/`{var}`/paint-text-effect style), `update_nodes` (batch + `failed` tách từng id), `move_nodes` (reparent), `clone_node` (parent + index), `delete_nodes`, `select_nodes`, `screenshot`, `get_node`, `find_nodes`, `get_selection`, `get_document_info`, `set_current_page`, `get_design_system`, `list_fonts`, `execute_code`.

Ghi chú để không vấp lại:

- Sai tên tham số sẽ bị Zod chặn trước khi tới Figma: `update_nodes` dùng `updates: [{ id, props }]` (không phải `ops`/`properties`).
- Định dạng gradient trong DSL: `{ gradient: "LINEAR", angle: 135, stops: [{ color, position }] }`; ép style bằng `{ style: "Tên style" }`; text style bằng `textStyle`, effect style bằng `effects: { style }`.
- **API Figma:** biến dùng `setValueForMode(modeId, value)` — `setValueByMode` không tồn tại. `figma.util.rgb` có, nhưng `figma.util.solid` **không** có ở build này → dùng helper `h.solid(hex)`.
- Gói Figma hiện tại **giới hạn 1 mode mỗi collection**: `addMode` báo `Limited to 1 modes only` (lỗi rõ ràng, không hỏng gì).
- `render_tree` lỗi giữa chừng (vd `widthMode: "FILL"` ở root) → dọn sạch, không để lớp rác, `safeToRetryWithoutCanvasRead: true`.
- ⚠️ **`execute_code` không thể ngắt**: một vòng lặp vô hạn (`while(true)`) chặn luồng chính của plugin; server báo timeout 30 s nhưng Figma sẽ tự đóng sandbox, plugin mất kết nối và **phải chạy lại plugin** (Plugins → Development). Server/bridge vẫn sống. Vì vậy `timeoutMs` chỉ ngăn phía MCP chờ, không dừng được code trong plugin — đừng viết vòng lặp không có điều kiện kết thúc.
- Plugin tự kết nối lại sau khi chạy lại (không cần khởi động lại server).
