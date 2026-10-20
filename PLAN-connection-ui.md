# Kế hoạch: Cải thiện kết nối MCP ↔ Plugin & Tối ưu UI plugin

> Trạng thái: **chờ duyệt**. File này là checklist làm việc — tick từng mục khi hoàn thành.
> Nhánh làm việc: `dev`. Quy trình: làm → tự kiểm → **user review → mới commit**.

| | |
|---|---|
| Ngày lập | 2026-10-20 |
| Base | `dev` (từ `main` @ `4861318`) |
| Phạm vi | PR1 (kết nối) + PR2 (negotiation/realtime) + PR3 (UI) |
| Ngoài phạm vi | Hub multi-client, đổi transport MCP, publish plugin |

---

## 0. Bối cảnh — vì sao làm

Kiến trúc hiện tại:

```
Claude Code / openCode ──stdio──► MCP server (dist/server.mjs)
                                    │  WebSocket ws://localhost:3055 + token
                                    ▼
                                  ui.html (iframe plugin) ──postMessage──► code.js (sandbox)
```

Đã xác minh live (2026-10-20): server `1.1.3 (e834b3e+dirty)`, port 3055, 1 file Figma kết nối (`Untitled` · `📱 Screens`), version khớp, 32 tool.

### 8 vấn đề đã xác minh

| # | Vấn đề | Bằng chứng | Mức độ |
|---|---|---|---|
| C1 | Trùng port 3055 → **mọi tool chết**, MCP vẫn khởi động | `bridge.ts:70-72` (`break` khi EADDRINUSE) | 🔴 |
| C2 | Port hardcode ở 3 nơi → đổi port = sửa 3 file + re-import plugin | `protocol.ts:6`, `ui.html:73`, `manifest.json:14` | 🔴 |
| C3 | Không có chẩn đoán khi hỏng (port/token/version/manifest) | — | 🟡 |
| C4 | `figma_status` trả **token plaintext** → rò vào context LLM | `index.ts:139` | 🟡 |
| C5 | Plugin bản cũ → lỗi chung chung "Unknown command" | `main.ts:90` | 🟡 |
| C6 | Nhiều file Figma → `pick()` đoán bừa theo `lastSeen`; `fileKey=null` với file Untitled | `bridge.ts:186` | 🟡 |
| C7 | Lệnh dài (tới 300s) không có tín hiệu đang chạy; `selectionchange` khai báo nhưng không bao giờ bắn | `protocol.ts:41` vs `main.ts:157` | 🟢 |
| C8 | `figma.ui.resize` có handler sẵn nhưng `ui.html` không bao giờ gửi → panel kẹt 360×480 | `main.ts:146` | 🟢 |

### Đã loại trừ (không cần sửa)

- **Timeout client**: `timeout` của openCode = timeout *lấy danh sách tool*, không phải tool call. Claude Code mặc định `MCP_TOOL_TIMEOUT` ~28h, idle 30 phút (stdio) → không cắt lệnh dài. Vẫn ghi rõ trong README và gửi progress notification cho an toàn.
- **dynamic-page**: đã test live — `page` scoping chạy đúng trên `🧩 Components` rồi trả lại `📱 Screens`. `figma.root.children` vẫn liệt kê page dù `documentAccess: dynamic-page`.
- **`directTools`**: đã grep binary Claude Code (`claude.exe` + `darwin-arm64/claude`) — có `alwaysLoad`, **không có** `directTools`; docs cũng không liệt kê → field no-op với Claude Code. **Quyết định: giữ nguyên, chỉ ghi chú trong README.**

---

## 1. Quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Phạm vi | PR1 + PR2 + PR3 (không làm hub multi-client) |
| Port | Server dò port trống `3055…3075`; plugin probe dải; `devAllowedDomains` liệt kê tường minh 21 cổng |
| `directTools` | Giữ trong `.mcp.json`, ghi chú README |
| UI | Theme Figma (`--figma-color-*`) + accent `#3DD6F5` / `#070B16` từ `design/carplay-widget.tokens.json` |
| Token trong `figma_status` | Mask mặc định, `includeToken: true` để lấy |

**Hằng số dùng chung (nguồn sự thật duy nhất): `src/shared/protocol.ts`**
- `DEFAULT_PORT = 3055`
- `DEFAULT_PORT_RANGE = 21` → dải 3055–3075
- `PROTOCOL_VERSION` 1 → 2

**Contract protocol v2 (đã viết xong trong `src/shared/protocol.ts`)**
```ts
ClientInfo  += commands?: string[]            // lệnh plugin build hỗ trợ
ClientInfo  += preferredFileKey?: string|null // file người dùng ghim trong panel
PluginToServer.event += selection?: SelectionSummary[]   // v2, selectionchange
ServerToPlugin = RequestMessage | NoticeMessage
NoticeMessage = { type:'notice'; notice:'files'; files: FileSummary[] }
```

**Cơ chế đồng bộ port giữa `protocol.ts` và `ui.html`**
- Figma đọc `ui.html` trực tiếp từ đĩa (không bundle) → không thể import hằng số từ TS.
- Giải pháp: `scripts/build.mjs` đọc `DEFAULT_PORT`/`DEFAULT_PORT_RANGE` từ `src/shared/protocol.ts` bằng regex, rồi **inject** mảng port vào `ui.html` giữa marker `/* @ports-start */ … /* @ports-end */`.
- Build **fail** nếu marker mất → không build sai âm thầm.
- Test `tests/ui-consistency.test.ts` chặn lệch giữa protocol ↔ ui.html ↔ manifest.

---

## 2. PR1 — Kết nối: không còn "chết cả hệ thống" + `figma_doctor`

### 2.1 `src/shared/protocol.ts`
- [x] `DEFAULT_PORT_RANGE = 21` (export cùng `DEFAULT_PORT`)
- [x] `PROTOCOL_VERSION = 2`
- [x] `ClientInfo` thêm: `commands?: string[]`, `preferredFileKey?: string | null`, `role?: 'plugin' | 'proxy'`
- [x] `ServerToPlugin` thêm `NoticeMessage`:
  ```ts
  export type NoticeMessage =
    | { type: 'notice'; notice: 'files'; files: Array<{ fileName: string; fileKey: string | null; currentPage: string }> }
    | { type: 'notice'; notice: 'activity'; command: string; state: 'running' | 'done' | 'failed'; ms?: number };
  ```
- [x] `ServerToPlugin = RequestMessage | NoticeMessage`
- [x] Ngoại lệ: `PROTOCOL_VERSION` bump → client cũ (v1) vẫn phải chạy được. Server **không** được phép từ chối client v1; mọi tính năng mới chỉ bật khi client báo `protocol >= 2` / có `commands`.

### 2.2 `src/server/bridge.ts`
- [x] `BridgeOptions` thêm `portRange?: number` (mặc định `DEFAULT_PORT_RANGE`)
- [x] `start()`: lặp candidate `port … port+portRange-1`; với mỗi port thử bind `127.0.0.1` rồi `::1`
- [x] `EADDRINUSE` → **sang port kế tiếp**, không `break`
- [x] Lưu `actualPort`; `get port()` trả `actualPort ?? opts.port`
- [x] `status()` thêm: `port` (thực tế), `portRange`, `ports` (mảng candidate), `preferredFile`
- [x] `pick(file)`: ưu tiên client có `info.preferredFileKey` khớp → nếu vẫn >1 client mở → **throw lỗi liệt kê tên file** (thay vì đoán theo `lastSeen`)
- [x] Merge `client.info` khi nhận `hello`/`event`: `{ ...client.info, ...msg.info }` để không mất `commands`/`preferredFileKey`
- [x] `request()`: nếu `client.info?.commands` tồn tại và **không** chứa command → throw `PluginError` với message nêu rõ lệnh thiếu
- [x] Gửi `notice:'files'` tới mọi client mỗi khi tập client đổi (thêm/xoá)

**Ngoại lệ bắt buộc xử lý:**

| Tình huống | Hành vi mong muốn |
|---|---|
| Tất cả 21 port đều bận | Server **vẫn** khởi động MCP (không crash). `status().error` = "Không tìm được port trống trong 3055-3075". `pick()` trả lỗi rõ, `figma_doctor` báo cách xử lý (`lsof -i :3055-3075`) |
| `127.0.0.1` được bind nhưng `::1` bị từ chối | Chấp nhận 1 trong 2 → vẫn listen, chỉ log warning. Không coi là lỗi |
| `::1` không tồn tại trên máy | Bỏ qua, chỉ bind IPv4 |
| `EADDRINUSE` xảy ra giữa chừng (race) | Thử port kế tiếp, tối đa hết dải |
| `host` được truyền tường minh qua option (test) | Bỏ qua logic fallback, dùng đúng host+port đó (test hiện tại dùng `port: 0` → giữ nguyên semantics) |
| Plugin ngắt kết nối giữa lúc đang chờ lệnh | `PluginError('The Figma plugin disconnected before answering.', false)` — **giữ nguyên** |
| Token sai | `ws.close(4001, 'invalid token')` — **giữ nguyên**; UI bắt riêng code 4001 |

### 2.3 `src/server/index.ts`
- [x] Đọc `FIGMA_AGENT_PORT` + `FIGMA_AGENT_PORT_RANGE` (env, có default)
- [x] Sau `bridge.start()`: ghi `~/.figma-agent/port` bằng **atomic write** (ghi file `.tmp` → `rename`) — tránh đọc file rỗng nếu bị kill giữa chừng
- [x] Log khởi động: `listening on ws://localhost:<actualPort> (candidates 3055-3075)` + gợi ý `pbcopy < ~/.figma-agent/token`
- [x] `figma_status`: **mask token** (chỉ 4 ký tự cuối), thêm `includeToken?: boolean` → khi `true` mới trả token đầy đủ
- [x] `figma_status` thêm: `missingCommands`, `preferredFile`, `protocol`, `portRange`
- [x] Tool mới `figma_doctor` (readOnly), không cần bridge → hoạt động kể cả khi plugin chưa mở
  - [x] check `server`: version + build
  - [x] check `port`: đang listen? port thật? dải candidate?
  - [x] check `token`: có token không (masked)
  - [x] check `plugin`: danh sách file đang kết nối + version
  - [x] check `version`: plugin build == server build?
  - [x] check `capability`: lệnh nào server có mà plugin thiếu
  - [x] check `manifest`: đọc `manifest.json` (resolve từ `import.meta.url` → `../manifest.json`), parse `networkAccess.devAllowedDomains`, kiểm tra **port thật có được phủ không**
  - [x] Output: `{ ok, checks: [{ id, ok, title, detail, fix? }], nextSteps: string[] }`
- [x] `figma_doctor` phải đọc được `manifest.json` khi chạy từ `dist/server.mjs`

**Ngoại lệ bắt buộc xử lý:**

| Tình huống | Hành vi mong muốn |
|---|---|
| `manifest.json` không tìm thấy (đóng gói lạ) | check `manifest` = `ok:false` + detail "không đọc được manifest.json" — **không throw**, tool vẫn trả kết quả |
| `manifest.json` JSON hỏng | Bắt try/catch → check `manifest` fail với lý do parse, không làm hỏng cả tool |
| `devAllowedDomains` dùng `["*"]` hoặc không có port | Coi là **phủ tất cả** → check pass, kèm ghi chú "wildcard, không cần import lại" |
| `figma_status` gọi với `includeToken` không phải boolean | Zod loại → lỗi schema chuẩn |
| Token rỗng (file `~/.figma-agent/token` bị xoá) | `loadToken()` tự sinh token mới như hiện tại — **giữ nguyên** |
| `figma_doctor` gọi khi bridge chưa start xong | Trả `ok:false` ở check `port`, không throw |

### 2.4 `manifest.json`
- [x] `devAllowedDomains`: 21 entry `ws://localhost:3055` … `ws://localhost:3075`
- [x] Giữ nguyên `allowedDomains: ["none"]` và `reasoning`
- [x] **Không** đụng `id`, `api`, `permissions`, `documentAccess`

**Ngoại lệ:** nếu Figma từ chối 21 entry → giảm dải còn 11 (3055–3065) và set `DEFAULT_PORT_RANGE = 11`; phải sửa **cả** `protocol.ts` **và** `ui.html` (xem 2.6) — có test chặn lệch.

### 2.5 `src/plugin/main.ts` (phần bridge)
- [x] `clientInfo()` trả kèm `commands: Object.keys(commands)`
- [x] Nhận `NoticeMessage` từ server → `figma.ui.postMessage(msg)` để panel nhận
- [x] **Giữ nguyên** handler `resize` (đã có sẵn, PR3 dùng)

**Ngoại lệ:** plugin bản cũ (không gửi `commands`) → server bỏ qua check capability, không hỏi lại.

### 2.6 `ui.html` — probe dải port
- [x] `const PORTS = [/* @ports */ 3055 /* @end */]` → giá trị **do build inject**, không hardcode
- [x] `connect()` mới: thử port đã nhớ trong `clientStorage` trước (fast path ~1ms) → nếu fail thì dò lần lượt `PORTS`, mỗi port timeout 400ms, cái nào `open` thì dùng + lưu lại
- [x] Backoff reconnect (giữ `Math.min(10000, 1000 * 2^retry)`) nhưng **mỗi lần retry phải probe lại** (server có thể đã đổi port)
- [x] Khi `open`: gửi `hello` kèm `preferredFileKey` (lấy từ settings đã lưu)

**Ngoại lệ bắt buộc xử lý:**

| Tình huống | Hành vi mong muốn |
|---|---|
| Không port nào mở | UI hiện "Không tìm thấy MCP server ở 3055-3075" + hướng dẫn, **không** spam retry vô hạn với thông báo dài |
| Một port đang bận bởi thứ khác (không phải figma-agent) | WebSocket `onerror` → bỏ qua port đó, sang port kế tiếp |
| Port trả HTTP 426 (đúng server figma-agent nhưng sai path) | Server hiện trả 426 cho mọi HTTP → coi như "cổng bận", bỏ qua |
| Token sai (code 4001) | Dừng probe, báo "Token sai — kiểm tra ~/.figma-agent/token", **không** retry mù |
| WebSocket API không có (Figma đổi runtime) | Báo rõ lỗi JS thay vì im lặng |
| User đổi `FIGMA_AGENT_PORT` env | Port đó **không** nằm trong dải probe → UI không tìm thấy. Ghi rõ trong README: nếu đổi port env thì phải nằm trong 3055-3075 |

### 2.7 `scripts/build.mjs` — inject port range vào `ui.html`
- [x] Đọc `DEFAULT_PORT`/`DEFAULT_PORT_RANGE` từ `src/shared/protocol.ts` (parse bằng regex, hoặc import file tạm)
- [x] Replace marker `/* @ports */ … /* @end */` trong `ui.html` bằng mảng port thật
- [x] Ghi lại `ui.html` (file này vốn đã được commit → diff hiện rõ khi đổi dải)
- [x] Nếu marker không tồn tại → **fail build** với message rõ

**Ngoại lệ:** nếu `ui.html` bị sửa tay làm mất marker → build fail, không build sai âm thầm.

### 2.8 Test PR1
- [x] `tests/bridge.test.ts`:
  - [x] port fallback: bật một server giả ở port P → `Bridge` start với `port: P` → assert `bridge.port === P+1`
  - [x] `status().port` khớp `bridge.port`
  - [x] `pick()` với 2 client, không truyền `file` → reject, message có **tên cả 2 file**
  - [x] `pick()` với `preferredFileKey` → trả đúng client ưu tiên
  - [x] `request()` tới command không có trong `client.info.commands` → reject với message nêu tên lệnh
- [x] `tests/mcp.e2e.test.ts`:
  - [x] `figma_status` mặc định **không** chứa token đầy đủ; `includeToken: true` → có
  - [x] `figma_doctor` → có `checks[]`, có `ok` boolean
- [x] `tests/ui-consistency.test.ts` (mới):
  - [x] port trong `ui.html` (đã inject) == `DEFAULT_PORT`…`DEFAULT_PORT+DEFAULT_PORT_RANGE-1` từ `protocol.ts`
  - [x] `manifest.json` `devAllowedDomains` phủ **đúng** dải đó

### 2.9 Xác minh PR1
- [x] `npm run typecheck` sạch
- [x] `npm run lint` sạch
- [ ] `npm test` xanh
- [x] `npm run build` xong
- [ ] **Thủ công trong Figma**: Plugins → Development → figma-agent-UI → **Import lại manifest.json** (bắt buộc — Figma cache manifest)
- [ ] Thủ công: dừng server hiện tại, chạy lại → `figma_status` báo đúng port thật
- [ ] Thủ công: mở 2 MCP client cùng lúc → client thứ 2 lấy port trống, `figma_doctor` báo rõ
- [ ] Thủ công: `figma_doctor` với manifest chưa re-import → check `manifest` fail, có `fix`

---

## 3. PR2 — Capability negotiation + activity realtime + chọn file đích

### 3.1 Capability negotiation
- [x] `main.ts` gửi `commands: Object.keys(commands)` trong `hello`
- [x] `bridge.request()`: nếu `client.info?.commands` có mặt và không chứa command → throw `PluginError`:
  `"Plugin đang mở là bản cũ, chưa hỗ trợ lệnh '<cmd>'. Thiếu: <danh sách>. Đóng và mở lại plugin trong Figma (Plugins → Development) sau khi chạy npm run build."`
  - `safeToRetryWithoutCanvasRead = true`
- [x] `figma_status` thêm `missingCommands` (lệnh server có, plugin thiếu)
- [x] Ngoại lệ: client v1 (không có `commands`) → bỏ qua check, hành vi như cũ

### 3.2 Activity realtime
- [x] `main.ts`: khi nhận request → `figma.ui.postMessage({ type:'activity', command, state:'running' })` **trước** khi enqueue
- [x] Khi xong → `state:'done'` + `ms` (đã có sẵn trong response)
- [x] Ngoại lệ: command lỗi → `state:'failed'`; UI phải hiện đỏ chứ không để spinner kẹt
- [x] Ngoại lệ: lệnh xếp hàng (queue) → hiện `queued` nếu đang chờ lệnh trước

### 3.3 `selectionchange`
- [x] `main.ts`: `figma.on('selectionchange', ...)` → post event kèm selection rút gọn `[{ id, name, type }]`
- [x] `protocol.ts`: `event` mang thêm `selection?`
- [x] `figma_status` thêm `lastSelection`
- [x] Ngoại lệ: selection rỗng → gửi `[]`, không gửi `null`; debounce ~150ms để không spam khi user kéo nhiều node

### 3.4 Chọn file đích từ panel
- [x] `bridge` gửi `notice:'files'` tới mọi client khi tập client đổi
- [x] `main.ts` relay `notice` xuống UI
- [x] `ui.html` render dropdown danh sách file → chọn → lưu `preferredFileKey` vào `clientStorage` → gửi lại `hello`
- [x] `bridge.pick()` ưu tiên `preferredFileKey`
- [x] Ngoại lệ: file đóng giữa lúc → `notice` cập nhật danh sách, dropdown tự bỏ lựa chọn cũ
- [x] Ngoại lệ: 2 file **trùng tên** → dropdown hiện kèm `fileKey`/`currentPage` để phân biệt; `pick()` so khớp `fileKey` trước `fileName`

### 3.5 Test PR2
- [x] `bridge.test.ts`: client báo `commands: ['get_document_info']` → `request('render_tree')` reject đúng message; client không báo `commands` → vẫn gửi được
- [x] `mcp.e2e.test.ts`: `figma_status.missingCommands` đúng khi fake plugin báo thiếu lệnh

### 3.6 Xác minh PR2
- [x] `npm run typecheck && npm run lint && npm test`
- [ ] Thủ công: đóng/mở plugin sau khi build → không còn lỗi "Unknown command"
- [ ] Thủ công: 2 file Figma cùng mở → chọn file trong panel → agent điều khiển đúng file đã chọn
- [ ] Thủ công: lệnh dài (`execute_code` ngủ 5s) → panel hiện spinner ngay

---

## 4. PR3 — UI plugin: layout v2 + zoom + resize

> `ui.html` là **1 file duy nhất** (Figma đọc trực tiếp từ đĩa) → mọi CSS/JS phải inline. Không tách file.

### 4.0 Ràng buộc bổ sung (chốt sau khi review)
| Ràng buộc | Cách thực hiện |
|---|---|
| **Panel nhỏ gọn 300×300** | `figma.showUI(__html__, { width: 300, height: 300 })`; preset mặc định M = 300×300; S 240×240, L 420×560 |
| **Không thành phần nào chồng nhau** | **Cấm tuyệt đối `position: absolute` / `fixed`** — mọi panel nằm trong luồng, đẩy log xuống thay vì phủ lên. Có test chặn (`ui-markup.test.ts`) |
| **Chỉ hiện khi cần** | Toolbar (lọc/xoá/copy) ẩn khi log rỗng · footer dev ẩn khi tắt dev mode · form token chỉ hiện khi chưa kết nối hoặc khi bấm · menu chỉ hiện khi bấm ⋯ · thanh chi tiết gập trong `<details>` |
| **Chỉ 1 panel mở tại một thời điểm** | `PANELS = ['token-panel','menu']` — mở cái này thì đóng cái kia (`aria-expanded` đồng bộ) |

### 4.1 Bố cục mới
```
┌───────────────────────────────────────────────┐
│ ● Untitled · 📱 Screens     [−] 100% [+] [⤢] [⚙]│  header sticky 1 dòng
├───────────────────────────────────────────────┤
│ [🔌 Token] [Tất cả ▾] [🗑] [⧉]                 │  toolbar gọn
│  ⟳ render_tree                    đang chạy…  │  activity dạng bảng
│  ✓ render_tree              142ms   1.2k ▸    │  click → JSON đầy đủ + Copy
│  ✗ screenshot                30s   timeout ▸   │
├───────────────────────────────────────────────┤
│ ⚙ Test render_tree locally  (chỉ khi bật dev)  │  gập, mặc định ẩn
└───────────────────────────────────────────────┘
```

### 4.2 Zoom / density
- [x] `--scale` biến CSS, phạm vi 0.8 – 1.5
- [x] `html { font-size: calc(12px * var(--s)) }` + **chuyển toàn bộ kích thước panel sang `rem`**
- [x] Nút `−` / `%` (reset) / `+` ở header
- [x] Lưu `settings.ui.scale` vào `clientStorage`
- [x] Ngoại lệ: giá trị lưu cũ không hợp lệ (ngoài 0.8–1.5, NaN) → reset về 1
- [x] Ngoại lệ: nếu `rem` làm layout vỡ ở scale 1.5 → fallback `transform: scale()` (ghi chú trong PR)

### 4.3 Resize panel
- [x] Dùng handler `{ type: 'resize', width, height }` **đã có sẵn** ở `main.ts`
- [x] 3 preset gọn: **S 240x240 · M 300x300 (mặc định) · L 420x560** — nằm trong menu, không trong header
- [x] Lưu `settings.ui.w/h` vào `clientStorage`
- [x] Clamp `width ∈ [70,2000]`, `height ∈ [0,4000]`
- [x] Ngoại lệ: `figma.ui.resize` lỗi → plugin báo `resize-error`, panel giữ size cũ + toast
- [x] Ngoại lệ: user kéo viền panel trong Figma → Figma không có API đọc size hiện tại, chấp nhận lệch nhẹ

### 4.4 Gọn & dễ dùng
- [x] Header 1 dòng: dot + trạng thái + tên file (truncate) + nút menu
- [x] **1 menu duy nhất**: Token · Thu phóng · Kích thước · File đích · Developer mode · `<details>` Chi tiết kết nối
- [x] Form token là **khối trong luồng** (không overlay): input + 👁 + Sao chép + Dán + "đã lưu ✓" + nút Kết nối + gợi ý `pbcopy`
- [x] Activity: filter (Tất cả/Chỉ lỗi) · clear · copy log · click 1 dòng → JSON đầy đủ + Copy
- [x] Kết quả dài → tóm tắt 1 dòng; trạng thái luôn có icon + text
- [x] Ngoại lệ: kết quả JSON > 200KB → chỉ preview + copy raw
- [x] Ngoại lệ: nút Token phải luôn tới được → đặt trong **menu** (không phải toolbar, vì toolbar ẩn khi log rỗng)

### 4.5 Theme & accent
- [x] Nền/chữ/border từ `--figma-color-*` (tự đúng dark/light Figma)
- [x] Accent: `--accent: #3DD6F5` (cyan/400), `--accent-fg: #070B16` (navy/950) — lấy từ `design/carplay-widget.tokens.json`
- [x] Accent chỉ dùng cho focus ring, spinner, active state, dot — **không dùng làm màu chữ trên nền sáng** (contrast)
- [x] Ngoại lệ: Figma có theme tuỳ chỉnh → accent phải đủ tương phản ở cả light và dark; kiểm tra bằng cách đổi theme Figma

### 4.6 Developer mode
- [x] Toggle trong ⚙ → mới hiện ô test `render_tree` (mặc định ẩn)
- [x] Ngoại lệ: bật dev mode thì log hiện cả lệnh local (đã có prefix `(local)`)

### 4.7 A11y
- [x] `role="status" aria-live="polite"` cho trạng thái kết nối
- [x] `focus-visible` ring rõ (dùng accent)
- [x] `@media (prefers-reduced-motion: reduce)` → tắt animation spinner
- [x] Trạng thái luôn có **icon + text**, không chỉ dựa vào màu
- [x] Tất cả nút có `aria-label` khi chỉ có icon

### 4.8 Test PR3
- [x] `plugin.smoke.test.ts`: plugin bundle vẫn evaluate + dispatcher trả lời (đã có, phải xanh)
- [x] Test mới `tests/ui-markup.test.ts` (nhẹ): assert `ui.html` **không** chứa `ws://localhost:3055` hardcode (port phải qua marker) và có đủ id của các thành phần chính (`status`, `log`, `zoom`, `size`, `token`)
- [x] Xác minh thủ công ở **3 bề rộng**: 320 / 380 / 520 — không tràn, không chữ bị cắt
- [x] Xác minh thủ công ở **3 mức zoom**: 80% / 100% / 150%

### 4.9 Xác minh PR3
- [x] `npm run typecheck && npm run lint && npm test`
- [x] `npm run build` → `code.js` đúng version
- [ ] Thủ công: đóng/mở plugin trong Figma → UI mới hiện ra
- [ ] Thủ công: zoom + resize → lưu → đóng/mở lại plugin → vẫn giữ
- [ ] Thủ công: đổi theme Figma sáng/tối → đọc được, đủ contrast

---

## 5. Docs cần cập nhật (làm cuối, sau cả 3 PR)

- [x] `README.md`
  - [x] Port + dải 3055-3075, `FIGMA_AGENT_PORT_RANGE`
  - [x] Tool `figma_doctor` vào bảng tool
  - [x] `figma_status` mask token → dùng `includeToken: true`
  - [x] **Ghi chú `directTools`**: field này không được Claude Code hỗ trợ (đã kiểm tra binary + docs) → giữ để tương thích client khác, nhưng không có tác dụng với Claude Code
  - [x] Timeout: `timeout` của openCode = timeout lấy tool list; Claude Code mặc định rất dài → không cần chỉnh, nhưng nên đặt `timeout` per-server nếu tool dài
  - [x] Lưu ý: đổi `manifest.json` ⇒ phải import lại plugin trong Figma
- [x] `.claude/skills/figma-agent-tools/references/tool-reference.md`: thêm `figma_doctor`, cập nhật `figma_status` (token masked)
- [x] `.claude/skills/figma-agent-tools/references/troubleshooting.md`: thêm dòng "port bận", "plugin bản cũ", gợi ý chạy `figma_doctor`
- [x] `TESTING.md`: checklist thủ công mới (re-import manifest, probe port, zoom/resize, chọn file)
- [x] `PLAN.md`: cập nhật tiến độ (file này ghi trạng thái cũ 16 tool)
- [x] `design/carplay-widget.tokens.json`: dùng làm nguồn accent cho UI — ghi chú trong README (UI dùng token, không nhúng build)

---

## 6. Thứ tự commit (trên nhánh `dev`)

| # | Commit | Nội dung |
|---|---|---|
| 1 | `feat(protocol): port range, protocol v2, capability fields` | protocol.ts |
| 2 | `feat(bridge): port fallback, preferred file, capability check, notices` | bridge.ts |
| 3 | `feat(server): figma_doctor tool, mask token, atomic port file` | index.ts |
| 4 | `feat(plugin): send command list, relay notices` | main.ts |
| 5 | `feat(mcp): allow full dev domain range for local bridge` | manifest.json |
| 6 | `feat(ui): probe port range, remember working port` | ui.html |
| 7 | `build: inject port range into ui.html` | scripts/build.mjs |
| 8 | `test: port fallback, doctor, token masking, ui consistency` | tests/ |
| 9 | `feat(bridge): activity + selection events` | PR2 |
| 10 | `feat(ui): activity realtime, selection, file picker` | PR2 |
| 11 | `feat(ui): layout v2, zoom, resize` | PR3 |
| 12 | `feat(ui): a11y, developer mode, accent theme` | PR3 |
| 13 | `docs: connection guide, doctor, troubleshooting` | docs |

**Quy trình:** làm xong 1 commit → tự chạy `npm run typecheck && npm run lint && npm test` → **dừng, user review → user duyệt → mới commit**. Không tự push trước khi user xác nhận.

---

## 7. Kế hoạch rollback

| Tình huống | Cách lui |
|---|---|
| Probe port gây rắc rối | `FIGMA_AGENT_PORT_RANGE=1` → chỉ dùng 3055, hành vi như bản cũ (code phải hỗ trợ range=1) |
| `figma_doctor` đọc manifest lỗi | Bỏ qua check `manifest`, tool vẫn trả phần còn lại |
| Capability check gây false-positive (plugin gửi `commands` thiếu) | Chỉ bật check khi `protocol >= 2` **và** `commands.length > 0` |
| UI redesign rối | `git revert` commit PR3; `ui.html` là 1 file → revert sạch |
| Manifest 21 entry bị Figma từ chối | Giảm `DEFAULT_PORT_RANGE` → rebuild → sửa `ui.html` qua build → import lại plugin |

---

## 8. Checklist nghiệm thu cuối

- [x] `npm run typecheck` — 0 error
- [x] `npm run lint` — 0 error
- [x] `npm test` — tất cả xanh
- [x] `npm run build` — sinh `code.js` + `dist/server.mjs`, stamp version đúng
- [x] `figma_status` không lộ token khi không yêu cầu
- [x] `figma_doctor` báo đủ 7 check, mỗi lỗi có `fix`
- [ ] Plugin build cũ → message rõ ràng, không phải "Unknown command"
- [ ] 2 MCP client cùng chạy → không ai chết; cái thứ hai báo lý do
- [ ] Panel: zoom + resize hoạt động, lưu được sau khi đóng/mở plugin
- [x] Panel: activity có spinner, filter, clear, copy, mở rộng JSON
- [ ] Panel đọc được ở theme sáng và tối
- [ ] Panel dùng được ở bề rộng 240 / 300 / 420
- [x] Docs đã cập nhật đầy đủ (README, tool-reference, troubleshooting, TESTING, PLAN)
- [ ] **User đã review và duyệt toàn bộ thay đổi**
