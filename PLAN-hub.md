# Hub: một cổng cho mọi agent

## Vấn đề

Mỗi agent (Claude Code, Pi/omp, opencode…) tự chạy `node dist/server.mjs` qua
stdio. Trước đây mỗi server bind cổng trống đầu tiên trong 3055–3075, nên có
N agent là N cổng. Plugin chỉ giữ **một** kết nối → chỉ một server có plugin,
các agent còn lại báo "No Figma file is connected". Nhiều cổng trống còn làm
panel thất bại nhiều lần, và Chromium trì hoãn WebSocket.

## Thiết kế

```
Figma plugin ──ws──▶ 3055 [hub: server của agent A]
                          ▲            ▲
             ws role=agent│            │ws role=agent
              [server agent B]   [server agent C]   (không mở cổng)
```

- Server khởi động: thử bind 3055.
  - Được → **hub**: nhận plugin như cũ, nhận thêm agent (`?role=agent`).
  - `EADDRINUSE` → nối vào 3055 làm **agent**, gửi `agent-hello`, chờ `welcome`.
  - Không có `welcome` (figma-agent bản cũ hoặc tiến trình khác chiếm cổng) →
    báo lỗi rõ trong `figma_status`/`figma_doctor`, thử lại định kỳ. Không
    nhảy sang 3056.
- Agent gửi `agent-request` → hub gọi `request()` của chính nó (chọn file, ghim
  file, kiểm tra plugin cũ giữ một chỗ) → trả `agent-response`, giữ nguyên
  `safeToRetryWithoutCanvasRead`.
- Hub đẩy `hub-state` (file đang nối, lệnh plugin hỗ trợ, file ghim, số agent)
  mỗi khi đổi → `status()`/`missingCommands()` phía agent vẫn đồng bộ.
- Hub thoát → agent từ chối lệnh đang chờ với `safeToRetry=false`, chờ ngẫu
  nhiên 50–300 ms rồi bầu lại: ai bind được 3055 thì làm hub, còn lại nối vào.
  Plugin tự kết nối lại.
- Plugin đã chạy lệnh tuần tự (`queue` trong `src/plugin/main.ts`), nên nhiều
  agent dùng chung một plugin không ghi chồng lên nhau.
- `FIGMA_AGENT_HUB=0` → chế độ cũ (mỗi server một cổng trong dải).

## Việc làm

- [x] protocol v3: `agent-hello`, `welcome`, `agent-request`, `agent-response`, `hub-state`
- [x] `Bridge`: chế độ hub/agent, bầu lại khi hub thoát, `status()` thêm `role`, `hub`, `agents`
- [x] `index.ts`: bật hub mặc định, ghi port file khi lên hub, `figma_doctor` hiểu vai trò agent
- [x] `ui.html`: thử cổng đã nhớ + 3055 trước, chỉ quét cả dải khi cần
- [x] Test: relay, agent không thành "file", failover, cổng bị chiếm bởi thứ khác, sai token
- [x] README, TESTING.md

## Rủi ro

- Hub thoát giữa lệnh: lệnh có thể đã ghi một phần → `safeToRetry=false`.
- Lệnh dài của agent này làm agent khác chờ (giống hiện nay, plugin vốn tuần tự).
