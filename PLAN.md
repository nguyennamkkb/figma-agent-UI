# Kế hoạch tích hợp: AI Agent ⇄ Figma Plugin

Mục tiêu: Claude Code (hoặc bất kỳ MCP client nào) **đọc, tạo, sửa và tự kiểm tra** thiết kế trên Figma thông qua plugin này, phủ được đa số chức năng của Plugin API.

## 1. Kiến trúc

```
Claude Code ──stdio──► MCP server (Node, server/)
                         │  WebSocket server 127.0.0.1:3055 + token
                         ▼
                       ui.html (iframe plugin) ──postMessage──► code.js (sandbox, figma API)
```

- MCP server **tự chạy WS server**, không cần relay riêng như cursor-talk-to-figma.
- Giao thức request/response:
  - `→ {id, command, params}`
  - `← {id, ok:true, result}` | `{id, ok:false, error, safeToRetryWithoutCanvasRead}` | `{id, progress}`
- Mỗi lệnh có timeout (mặc định 30s). Mỗi plugin kết nối gửi `hello {fileKey, fileName, user}` để MCP biết đang nói chuyện với file nào.

## 2. Cấu trúc thư mục (đã triển khai)

```
manifest.json            # id gốc, dynamic-page, devAllowedDomains ws://localhost:3055, permissions currentuser/teamlibrary
ui.html                  # WS client, token, trạng thái, nhật ký lệnh, ô test render_tree
src/shared/              # protocol.ts, schemas.ts (zod: DSL + input tool), values.ts (màu, gradient, font, length)
src/plugin/              # main.ts (dispatcher + hàng đợi), apply.ts, paints.ts, fonts.ts, resources.ts, serialize.ts, sanitize.ts
src/plugin/commands/     # read.ts, render.ts, write.ts, execute.ts
src/server/              # index.ts (MCP stdio + tool), bridge.ts (WS), images.ts (tải ảnh)
.claude/skills/figma-agent/SKILL.md
.mcp.json, examples/, tests/, TESTING.md
```

## 3. Bộ tool MCP (16 tool)

`figma_status`, `get_document_info`, `set_current_page`, `get_selection`, `get_node`, `find_nodes`, `get_design_system`, `list_fonts`, `screenshot`, `select_nodes`, `render_tree`, `update_nodes`, `delete_nodes`, `move_nodes`, `clone_node`, `execute_code`.

So với dự kiến, đã gộp để agent ít phải chọn tool:
- `set_text`, `set_instance_props`, `swap_component`, `bind_variable`, `set_image_fill` → thuộc tính của `update_nodes`.
- `create_instance`, `create_svg` → node `instance`/`svg` của `render_tree`.

## 4. Tiến độ

- [x] P0: git init, manifest, esbuild, tsconfig plugin/server, eslint typed linting
- [ ] P0 spike trong Figma thật: WS từ iframe và `AsyncFunction` trong sandbox → **TESTING.md mục A, E**
- [x] P1: bridge WS (token, 127.0.0.1 + ::1, heartbeat, nhiều file, timeout), UI plugin, dispatcher có hàng đợi, `.mcp.json`
- [x] P2: serialize (hex, tên biến/style, sizing, component), tool đọc, design system, fonts, screenshot
- [x] P3: execute_code (helper `h`, sanitize kết quả, commitUndo, timeout phía server)
- [x] P4: render_tree DSL v2 (7 loại node, variables, styles, gradient, ảnh, svg, rollback, đặt chỗ trống, font tự khớp tên style)
- [x] P5: update/delete/move/clone/select, instance variant/properties/texts/swap
- [x] P6: skill `.claude/skills/figma-agent/SKILL.md` + instructions của MCP server
- [x] P7: 48 test tự động (unit, bridge, MCP e2e với plugin giả, smoke test bundle)
- [ ] P7: checklist thủ công trong Figma → **TESTING.md**

## 5. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| `eval`/`AsyncFunction` bị chặn trong sandbox | Spike ở P0; figma-console-mcp đã làm được nên khả năng cao chạy được |
| Plugin phải đang mở mới nhận lệnh | `get_status` báo rõ; UI giữ kết nối + reconnect |
| Ảnh base64 lớn làm tốn context | scale mặc định 0.5, giới hạn 1024px |
| `execute_code` có toàn quyền trên file | chỉ bind 127.0.0.1, token, log mọi lệnh trên UI, khuyến nghị thử trên bản sao |
| Nhiều file Figma cùng mở | mỗi kết nối gắn `fileKey`; tool nhận `fileKey` tuỳ chọn |
| API trong skill `use_figma` (`createAutoLayout`, `query`, `screenshot`) không có trong typings 1.142.0 | tự viết helper tương đương |

## 6. Mặc định đã chọn (có thể đổi)

- Agent: **Claude Code qua MCP stdio**; không gọi LLM từ trong plugin.
- Cổng **3055**, chỉ localhost.
- TypeScript + esbuild, giữ plugin ở thư mục gốc.
