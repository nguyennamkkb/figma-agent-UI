# figma-agent-UI

Plugin Figma + MCP server giúp AI agent (Claude Code, hoặc bất kỳ MCP client nào) **đọc, tạo, sửa và tự chụp màn hình kiểm tra** thiết kế ngay trong file Figma đang mở.

```
Claude Code ──stdio──► MCP server (dist/server.mjs)
                          │  WebSocket ws://localhost:3055 (chỉ loopback, có token)
                          ▼
                        ui.html (iframe plugin) ──postMessage──► code.js (figma API)
```

## Cài đặt

```bash
npm install
npm run build          # code.js (plugin) + dist/server.mjs (MCP server)
```

1. **Figma desktop** → Plugins → Development → *Import plugin from manifest…* → chọn `manifest.json`.
2. **Claude Code**: mở thư mục này, `.mcp.json` sẽ đăng ký server `figma-agent` (chấp nhận khi được hỏi). Với client khác, chạy `node /đường/dẫn/dist/server.mjs` qua stdio.
3. Lấy token: `cat ~/.figma-agent/token` (tạo ở lần chạy đầu), hoặc gọi tool `figma_status`.
4. Trong Figma chạy plugin **figma-agent-UI**, dán token → **Connect**. Token được lưu, lần sau plugin tự kết nối.

Biến môi trường: `FIGMA_AGENT_TOKEN` (cố định token), `FIGMA_AGENT_PORT` (mặc định 3055, đổi thì phải sửa `devAllowedDomains` trong manifest và `PORT` trong `ui.html`), `FIGMA_AGENT_MAX_OUTPUT` (giới hạn ký tự kết quả, mặc định 20000).

## Tool

| Nhóm | Tool |
|---|---|
| Kết nối | `figma_status` (kèm `versionCheck`: cảnh báo khi plugin trong Figma khác bản build của server) |
| Đọc | `get_document_info`, `set_current_page`, `get_selection`, `get_node`, `find_nodes`, `get_design_system` (`usedIn`: token đang bind trong một node), `list_fonts`, `search_design_system` |
| Tạo | `render_tree`: dựng cả màn hình từ cây JSON (section/frame/auto layout/layout grid, text, rect, ellipse, svg, image, instance) |
| Sửa | `update_nodes`, `delete_nodes`, `move_nodes`, `clone_node`, `select_nodes` |
| Design system | `manage_pages`, `create_variables`, `import_tokens` (DTCG, lint giống `check_tokens.py`), `create_styles`, `render_foundations`, `create_component_set` |
| Prototype | `set_interactions` (Smart Animate, motion token, interactive component, flow start) |
| QA | `audit_design`, `stress_test`, `bind_variables`, `rename_by_rule` (hai tool sau mặc định dryRun) |
| Bàn giao | `annotate`, `set_dev_status`, `export_tokens` (json/css/swift/kotlin), `export_assets` |
| Mọi thứ khác | `execute_code`: chạy JS Plugin API (`figma`, helper `h`) |
| Kiểm tra | `screenshot`: trả PNG để agent tự nhìn |

Mọi tool nhận `page` (id/tên) để chạy trên page đó rồi trả page cũ, nên nhiều agent chạy song song không ghi nhầm page.

**Phiên bản:** mỗi lần nâng cấp plugin thì tăng `version` trong `package.json`. `npm run build` gắn version + commit vào cả plugin và server. Bảng plugin hiện `Plugin <version> (<commit>)`, còn `figma_status` báo ⚠️ khi plugin đang mở là bản cũ: đóng và mở lại plugin trong Figma.

Quy trình và quy tắc cho agent nằm ở `.claude/skills/figma-agent/SKILL.md` (Claude Code tự nạp); quy trình design system 8 giai đoạn ở `.claude/skills/figma-master/` (đọc `references/figma-agent-adapter.md`). Ví dụ DSL: `examples/fintech-wallet.json` (dán vào ô *Test render_tree locally* trong plugin để thử không cần agent).

## Phát triển

```bash
npm run watch       # rebuild code.js khi sửa src/plugin
npm run typecheck   # plugin + server
npm run lint
npm test            # unit + bridge + MCP end-to-end (cần build trước) + smoke test bundle
```

| Thư mục | Nội dung |
|---|---|
| `src/shared/` | protocol, schema zod (nguồn duy nhất cho DSL và input tool), hàm thuần (màu, gradient, font) |
| `src/plugin/` | sandbox: dispatcher, apply thuộc tính, serialize, các command |
| `src/server/` | MCP server, WebSocket bridge, tải ảnh |
| `tests/` | vitest |

Kiểm thử thủ công trong Figma: xem `TESTING.md`.

## Bảo mật

- Server chỉ nghe trên `127.0.0.1`/`::1` và yêu cầu token (`~/.figma-agent/token`, quyền 600).
- `execute_code` có toàn quyền trên file đang mở; plugin hiển thị nhật ký mọi lệnh. Nên thử trên bản sao file quan trọng. Mỗi lệnh ghi là một bước undo (Cmd+Z).
- `localhost` chỉ có trong `devAllowedDomains`, nên khi publish plugin sẽ không có quyền mạng.
