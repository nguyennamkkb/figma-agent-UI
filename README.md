# figma-agent-UI

Plugin Figma + MCP server giúp AI agent (Claude Code, OpenCode, Codex, Pi, hoặc bất kỳ MCP client nào) **đọc, tạo, sửa và tự chụp màn hình kiểm tra** thiết kế ngay trong file Figma đang mở.

```
MCP client ──stdio──► MCP server (dist/server.mjs)
                          │  WebSocket ws://localhost:3055 (chỉ loopback, có token)
                          ▼
                        ui.html (iframe plugin) ──postMessage──► code.js (figma API)
```

## Yêu cầu

- **Figma desktop** (macOS hoặc Windows): plugin dạng development chỉ import được trong app desktop.
- **Node.js ≥ 20** và **git** (cách A cài trực tiếp từ GitHub).
- Một MCP client: Claude Code, OpenCode, Codex, Pi, hoặc client bất kỳ hỗ trợ MCP qua stdio.
- Tuỳ chọn: Python 3 cho script kiểm tra token của skill `figma-ui-flow`.

## Cài đặt

### Cách A: npx (khuyên dùng, không cần clone)

```bash
npx -y --prefer-online github:nguyennamkkb/figma-agent-UI install
```

Lệnh này cài bản mới nhất của nhánh `main`. Muốn ghim một phiên bản cố định thì thêm tag: `github:nguyennamkkb/figma-agent-UI#v1.5.2`.

Lệnh này chạy được trên macOS, Windows và Linux, và làm 3 việc:
- copy plugin ra `~/.figma-agent/plugin/` (Windows: `%USERPROFILE%\.figma-agent\plugin\`)
- cài 9 skill vào thư mục skill **global** của Claude Code (`~/.claude/skills/`), OpenCode (`~/.config/opencode/skills/`) và agent chung (`~/.agents/skills/`, Codex và Pi đọc thư mục này); skill cũ cùng tên bị thay bằng bản mới, và skill đã gộp/thay thế (`app-asset-generator`, `generating-oneshot-image-prompts`, `ios-style-screen-creator`) bị xoá
- thêm MCP server `figma-agent` vào Claude Code (user scope), OpenCode (`~/.config/opencode/opencode.json`), Codex (`~/.codex/config.toml`, hoặc `$CODEX_HOME/config.toml`) và Pi (`~/.pi/agent/mcp.json`, hoặc `$PI_CODING_AGENT_DIR/mcp.json`; muốn chỉ dùng trong một dự án thì chép entry sang `.pi/mcp.json` của dự án đó), mỗi file đều có backup `.bak`; trên Windows lệnh tự dùng `cmd /c npx`

Lần chạy đầu mất vài chục giây vì phải tải và build.

Sau đó làm tay một lần:
1. **Figma desktop** → Plugins → Development → *Import plugin from manifest…* → chọn `~/.figma-agent/plugin/manifest.json`.
2. **Khởi động lại** Claude Code / OpenCode / Codex / Pi (hoặc `/reload` trong Pi) để client chạy server.
3. **Lấy token** (sinh ở lần server chạy đầu): macOS `pbcopy < ~/.figma-agent/token` · Windows `type %USERPROFILE%\.figma-agent\token | clip` · Linux `cat ~/.figma-agent/token`. Hoặc hỏi agent gọi tool `figma_status`.
4. Trong file Figma, chạy plugin **figma-agent-UI**, dán token → **Connect**. Lần sau plugin tự kết nối.

| Lệnh | Việc |
|---|---|
| `npx -y --prefer-online github:nguyennamkkb/figma-agent-UI install` | cài hoặc nâng cấp lên bản mới nhất (`#<tag>` để ghim phiên bản) |
| `… doctor` | kiểm tra Node, git, plugin, skill, cấu hình MCP, token, cổng 3055 |
| `… uninstall` | gỡ những gì `install` đã thêm (giữ token; plugin trong Figma gỡ tay) |

Tuỳ chọn của `install`/`uninstall`/`doctor`:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `--client claude,opencode,codex,pi` | chỉ cấu hình các client này (mặc định: cả bốn) |
| `--skills-to claude,opencode,agents` | chỉ cài skill vào các thư mục này (mặc định: cả ba) |
| `--no-skills` / `--no-mcp` | bỏ qua skill / bỏ qua cấu hình MCP |
| `--dry-run` | chỉ in ra sẽ thay đổi gì |

**Nâng cấp:** chạy lại lệnh `install` ở trên (`--prefer-online` bắt npx lấy commit mới nhất thay vì bản trong cache; vẫn ra bản cũ thì xoá `~/.npm/_npx` rồi chạy lại), khởi động lại client, rồi đóng và mở lại plugin trong Figma. Không cần import lại manifest, trừ khi bản mới sửa `manifest.json`.

**Client khác** (Claude Desktop, Cursor…): thêm tay vào file cấu hình MCP của client:

```json
{ "mcpServers": { "figma-agent": { "command": "npx", "args": ["-y", "github:nguyennamkkb/figma-agent-UI"] } } }
```

Trên Windows dùng `"command": "cmd", "args": ["/c", "npx", "-y", "github:nguyennamkkb/figma-agent-UI"]`.

### Cách B: clone (để phát triển)

```bash
git clone https://github.com/nguyennamkkb/figma-agent-UI.git
cd figma-agent-UI
npm install
npm run build          # code.js (plugin) + dist/server.mjs (MCP server)
```

- **Chỉ dùng trong thư mục repo:** Claude Code đọc `.mcp.json` và `.claude/skills/` của repo khi mở thư mục này (chấp nhận khi được hỏi). Import `manifest.json` ở gốc repo vào Figma.
- **Dùng ở mọi project:** chạy `node bin/figma-agent-ui.mjs install`. Lệnh này giống cách A nhưng cấu hình MCP trỏ thẳng vào `dist/server.mjs` của bản clone (`node <đường dẫn>`) thay vì `npx`.
- **Cập nhật:** `git pull && npm install && npm run build`, rồi đóng và mở lại plugin.

### Nhiều agent dùng chung

Nhiều agent (Claude Code, OpenCode, Codex…) dùng chung **một cổng**: server khởi động đầu tiên làm *hub* ở 3055 và giữ kết nối với plugin; các server sau nối vào hub, lệnh của chúng đi qua hub. Agent giữ hub thoát thì các agent còn lại tự bầu hub mới và plugin tự kết nối lại. `figma_status` cho biết `role` (`hub`/`agent`) và số `agents`. Không cần chạy service nền: mỗi client tự khởi chạy server.

Đặt `FIGMA_AGENT_HUB=0` để tắt hub: khi đó mỗi server tự lấy một cổng trống trong dải 3055–3075 và ghi cổng thật vào `~/.figma-agent/port`; panel plugin dò đúng dải đó.

> `devAllowedDomains` trong `manifest.json` liệt kê **21 cổng** `ws://localhost:3055…3075`. Sửa `manifest.json` ⇒ **phải import lại plugin trong Figma** (Figma cache manifest lúc import).

Biến môi trường: `FIGMA_AGENT_TOKEN` (cố định token), `FIGMA_AGENT_PORT` (mặc định 3055), `FIGMA_AGENT_HUB=0` (tắt hub), `FIGMA_AGENT_PORT_RANGE` (mặc định 21), `FIGMA_AGENT_PORT_FILE` (nơi ghi port thật, mặc định `~/.figma-agent/port`), `FIGMA_AGENT_MANIFEST` (đường dẫn `manifest.json` cho `figma_doctor`), `FIGMA_AGENT_MAX_OUTPUT` (giới hạn ký tự kết quả, mặc định 20000), `FIGMA_AGENT_PLUGIN_DIR` (nơi `install` copy plugin, mặc định `~/.figma-agent/plugin`).

### Timeout

- Codex: `install` đặt `startup_timeout_sec = 120` (lần chạy `npx` đầu phải tải và build) và `tool_timeout_sec = 300` cho các tool dài.
- Pi: `install` đặt `timeout: 300` (giây, mỗi request); tool mặc định ở chế độ `codemode` của Pi — đổi `exposure` trong `/mcp` nếu muốn, lần `install` sau vẫn giữ lựa chọn đó.
- OpenCode: `timeout` trong `opencode.json` là thời gian **lấy danh sách tool**, không phải thời gian chạy tool → không cần chỉnh.
- Claude Code: mặc định rất dài (`MCP_TOOL_TIMEOUT`), idle 30 phút với stdio → không cần chỉnh. Nếu đặt `timeout` riêng cho server trong `.mcp.json`, đặt ≥ 300000 cho các tool dài (`import_tokens`, `render_foundations`, `execute_code`).

> Ghi chú: `directTools` trong `.mcp.json` **không** được Claude Code hỗ trợ (đã kiểm tra binary + tài liệu) — giữ lại để tương thích client khác, nhưng với Claude Code nó không có tác dụng.

### Sự cố thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Agent báo chưa kết nối plugin | Mở plugin trong file Figma, dán token, Connect. Chạy `… doctor` hoặc tool `figma_doctor` |
| `figma_status` cảnh báo lệch version | Plugin trong Figma là bản cũ: chạy lại `install` (hoặc `npm run build`), đóng rồi mở lại plugin |
| Token bị từ chối | Token trong plugin khác `~/.figma-agent/token`: dán lại token mới, hoặc xoá file token rồi khởi động lại client |
| `npx` lỗi 404 / đòi đăng nhập | Máy chưa có quyền truy cập repo GitHub hoặc thiếu git |
| `npx` chạy xong không in gì (exit 128) | Git không lấy được repo: chưa có quyền vào repo private hoặc sai tag (nếu có ghim tag). Kiểm tra bằng `git ls-remote https://github.com/nguyennamkkb/figma-agent-UI` |
| Client không thấy tool `figma-agent` | Khởi động lại client; kiểm tra bằng `claude mcp get figma-agent`, `opencode mcp list`, `codex mcp get figma-agent` hoặc `pi mcp list` |
| Plugin bị treo sau `execute_code` | Vòng lặp vô hạn làm chết sandbox: đóng và mở lại plugin (server không cần khởi động lại) |

## Tool

| Nhóm | Tool |
|---|---|
| Kết nối | `figma_status` (kèm `versionCheck`: cảnh báo khi plugin trong Figma khác bản build của server; token được **mask**, thêm `includeToken: true` để lấy đầy đủ), `figma_doctor` (chẩn đoán 1 lệnh: port, token, plugin, version, capability, manifest — mỗi lỗi kèm cách sửa) |
| Đọc | `get_document_info`, `set_current_page`, `get_selection`, `get_node`, `find_nodes`, `get_design_system` (`usedIn`: token đang bind trong một node), `list_fonts`, `search_design_system` |
| Tạo | `render_tree`: dựng cả màn hình từ cây JSON (section/frame/auto layout/layout grid, text, rect, ellipse, svg, image, instance). Trên board FigJam dựng bằng FigJam types: `sticky`, `shape`, `connector` (from/to là id hoặc key cùng lệnh), `code`, `table` |
| Sửa | `update_nodes`, `delete_nodes`, `move_nodes`, `clone_node`, `select_nodes` |
| Design system | `manage_pages`, `create_variables`, `import_tokens` (DTCG, lint giống `check_tokens.py`), `create_styles`, `render_foundations`, `create_component_set` |
| Prototype | `set_interactions` (Smart Animate, motion token, interactive component, flow start) |
| QA | `audit_design`, `stress_test`, `bind_variables`, `rename_by_rule` (hai tool sau mặc định dryRun) |
| Bàn giao | `annotate`, `set_dev_status`, `export_tokens` (json/css/swift/kotlin), `export_assets` |
| Mọi thứ khác | `execute_code`: chạy JS Plugin API (`figma`, helper `h`) |
| Kiểm tra | `screenshot`: trả PNG để agent tự nhìn |

Mọi tool nhận `page` (id/tên) để chạy trên page đó rồi trả page cũ, nên nhiều agent chạy song song không ghi nhầm page.

**Phiên bản:** mỗi lần nâng cấp plugin thì tăng `version` trong `package.json`. `npm run build` gắn version + commit vào cả plugin và server. Bảng plugin hiện `Plugin <version> (<commit>)`, còn `figma_status` báo ⚠️ khi plugin đang mở là bản cũ: đóng và mở lại plugin trong Figma. Server cũng **tự nhận diện lệnh thiếu**: plugin báo danh sách lệnh nó hỗ trợ, nên gọi tool chưa có sẽ ra thông báo *"plugin là bản cũ, thiếu lệnh X"* thay vì "Unknown command".

**Panel plugin (300×300):** panel mặc định nhỏ gọn 300×300. Menu `⋯` gộp mọi thứ: đổi kích thước (S 240×240 · M 300×300 · L 420×560), thu phóng 80–150%, chọn file đích cho agent, developer mode, và chi tiết kết nối (port, user, phiên bản, file key, số lệnh). Nhật ký lệnh ở giữa panel, có lọc / xoá / sao chép / mở rộng JSON. Mọi thành phần nằm trong luồng — không có gì chồng lên nhau.

**FigJam:** plugin chạy trong FigJam (`editorType` gồm `figma`, `figjam`, `slides`; sửa manifest ⇒ import lại plugin). Trên board FigJam, `render_tree`/`update_nodes` dùng FigJam types (`sticky`, `shape`, `connector`, `code`, `table`); các tool Design-only (prototype, dev-mode, variables/styles) từ chối với message rõ ràng. Chi tiết: `specs/001-figjam-integration/` + mục J trong `TESTING.md`.

**Figma Slides:** agent đọc và dựng slide trong deck Slides. 7 tool chỉ dành cho Design bị từ chối (`set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_component_set`, `stress_test`, `render_foundations`); variables, styles và token (`create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `get_design_system`, `search_design_system`) vẫn dùng được. Chi tiết: `specs/002-slides-integration/`.

**Skill:** repo kèm 10 skill trong `.claude/skills/`, được `install` cài global:

| Skill | Dùng cho |
|---|---|
| `figma-ui-flow` | một skill cho cả quy trình, chuẩn và tool: 11 luật, 8 giai đoạn có gate, vòng dựng màn 3 lượt; kiến thức chia 4 tầng `references/process/` (làm gì) · `standards/` (chuẩn nào) · `tools/` (sổ tay mọi tool MCP, DSL `render_tree`, `execute_code`) · `knowledge/` (lỗi → cách sửa, nhật ký bẫy); gộp từ `figma-agent-tools` cũ |
| `asset-generator` | viết prompt ảnh theo tỉ lệ và bộ ảnh nhất quán cho app, và sinh asset nền trong suốt bằng `gemini-image-mcp` (gộp từ `app-asset-generator` + `generating-oneshot-image-prompts`) |
| `design-md-writer` | viết `DESIGN.md` mô tả design system cho agent |
| `style-direction` | chọn phong cách cho app iOS/Android: từ tên phong cách, ảnh tham chiếu hoặc brief; đo DNA có mức tin cậy (`scripts/extract_palette.py`), 3 hướng Safe/Balanced/Bold, xuất Style brief + `tokens.json` (thay `ios-style-screen-creator`) |
| `icon-libraries` | tìm và tải icon mã nguồn mở Phosphor (1.512 × 6 weight) và Tabler (5.491, outline + filled), MIT, theo tên/từ khoá bằng `scripts/icons.py`: SVG ra file hoặc markup để dán vào Figma, không cần trình duyệt hay API key (thay `phosphor-icons`) |
| `ads-board` | dựng trang Ads trên Figma theo từng phiên bản luồng: mỗi bản 1 section, hàng có quảng cáo + hàng không quảng cáo thẳng cột, Ads Kit dùng chung; nguồn nằm trong skill `sources/<flow>/` (`rules.md`, spec YAML, ảnh wireframe; kèm sẵn First Open V1.7–V2.0), `scripts/spec_diff.py` so 2 phiên bản |
| `app-redesign` | làm lại giao diện app đã có mà giữ nguyên chức năng, thường là app anh em để phát hành thêm (khác bản gốc ≥ 6/10 trục; sau khi phân tích chỉ hỏi tối đa 4 câu — hướng A/B/C, mức, sáng/tối, phong cách ảnh — trước khi vẽ): `start <mục tiêu> [L1–L4] [link section]` / `build [FL-NN|link section] [L1–L4]` / `audit [FL-NN|link section]` trên bản sao đã xác nhận; dán link section để làm thử riêng một luồng, nếu đã có luồng được sửa thì skill hỏi làm theo cách đó hay cách khác (cách khác = bản thử trên page Explore), 4 mức thay đổi (L1 đổi màu tại chỗ · L2 làm mới, giữ bố cục · L3 đổi bố cục · L4 làm mới toàn bộ), quét baseline trước khi sửa, kiểm tra không thiếu màn, trạng thái, liên kết, quảng cáo, CTA, ảnh hero (`scripts/scan.js`, `analyze.py`, `parity.py`) |
| `ui-visual` | tạo visual UI chuyên nghiệp (banner, popup có header minh hoạ, hero, thumbnail, coupon, topic card): `clone <ref> [L1–L4]` sao chép có kiểm soát mức thay đổi, `create <brief>`, `extract <ref>`; đo mẫu bằng `scripts/decode.js`, tính tỷ lệ cho slot mới bằng `ratios.py`, sinh từng mảnh bằng `gemini-image-mcp` + `asset-generator`, ghép lớp bằng `compose.js` (filter ảnh, blend, mask, glow, viền kính, phá khung), kiểm tra bằng 12 bài QA |
| `lottie-motion` | thiết kế và xuất Lottie/dotLottie chuẩn chuyên gia: `start <brief>` (motion spec + tokens + chọn đường xuất), `build [MOT-ID]` (Figma Motion hoặc Python generator + audit), `audit <file>` (cấu trúc, feature risk, budget, score), `handoff [MOT-ID]` (spec, asset, preview, runtime report, iOS/Android notes); kèm `scripts/spec_check.py`, `motion_to_lottie.py`, `lottie_audit.py`, `dotlottie_pack.py`, ma trận runtime iOS/Android/web và QA 4 lớp |
| `screen-from-image` | vẽ lại một hoặc nhiều màn từ ảnh (screenshot, shot Dribbble, mockup) nhanh nhất: phiếu đọc mỗi màn (chức năng, cây auto layout, token, cảm xúc ảnh) rồi một `render_tree` mỗi màn; nhiều màn thì dựng 1 màn tiêu biểu để duyệt trước. Ảnh tạo bằng gemini-image-mcp hoặc muse2api — bật cả hai thì skill hỏi dùng cái nào trước khi làm |

Ví dụ DSL: `examples/fintech-wallet.json` (dán vào ô *Test render_tree locally* trong plugin để thử không cần agent).

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
| `src/server/` | MCP server, WebSocket bridge, tải ảnh, lệnh `install`/`doctor`/`uninstall` (`setup.ts`) |
| `bin/` | điểm vào `npx`: chạy server hoặc lệnh cài đặt |
| `.claude/skills/` | skill đi kèm (được `install` cài global) |
| `tests/` | vitest |

Kiểm thử thủ công trong Figma: xem `TESTING.md`.

## Bảo mật

- Server chỉ nghe trên `127.0.0.1`/`::1` và yêu cầu token (`~/.figma-agent/token`, quyền 600 trên macOS/Linux; Windows dựa vào quyền thư mục user).
- `execute_code` có toàn quyền trên file đang mở; plugin hiển thị nhật ký mọi lệnh. Nên thử trên bản sao file quan trọng. Mỗi lệnh ghi là một bước undo (Cmd+Z).
- `localhost` chỉ có trong `devAllowedDomains`, nên khi publish plugin sẽ không có quyền mạng.

## Giấy phép

MIT © 2026 Nguyen Luong Nam. Xem [LICENSE](LICENSE).
