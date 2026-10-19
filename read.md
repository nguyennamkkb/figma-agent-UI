Để Plugin của bạn không bị bó buộc vào vài mẫu (template) cố định mà có thể **tự do sáng tạo bất kỳ giao diện nào** (từ App Ngân hàng, E-commerce, Mạng xã hội cho đến Dashboard), bạn cần nâng cấp `code.ts` thành một **Trình kết xuất cây đệ quy (Recursive UI Tree Renderer)**.

### Nguyên lý để AI Agent "Sáng tạo UI" trên Figma

Thay vì viết các hàm cứng nhắc như `createLoginScreen()`, bạn hãy biến Plugin thành một "trình duyệt thu nhỏ" hiểu được **Cây cấu trúc Auto Layout lồng nhau (Nested Auto Layout Tree)**:

1. **AI Agent đóng vai trò Giám đốc sáng tạo:** Khi bạn yêu cầu *"Thiết kế màn hình đặt đồ ăn hiện đại"*, AI sẽ tự phối màu (Hex), tự chia bố cục (Header, Search bar, Banner, Danh sách món ăn ngang, Card món ăn, Bottom Tab Bar) dưới dạng một cây JSON giống hệt như cách lập trình viên viết HTML/Flexbox.
2. **Plugin (`code.ts`) đóng vai trò Họa sĩ thực thi:** Đọc cây JSON đó theo kiểu đệ quy (vòng lặp lồng nhau) — cứ gặp `FRAME` là tạo Auto Layout, gặp `TEXT` là viết chữ, gặp `RECTANGLE` là vẽ hình khối/ảnh, tự động chuyển đổi mã màu Hex, bo góc (`cornerRadius`) và đổ bóng (`shadow`).

---

### Bước 1: Thay thế toàn bộ file `manifest.json`

Mở file `manifest.json` trong thư mục `Agent-Bridge` vừa tạo và dán đoạn cấu hình mở quyền kết nối cổng `8080` này vào:

```json
{
  "name": "Agent-Bridge",
  "id": "agent-creative-ui-bridge",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["ws://localhost:8080", "http://localhost:8080"],
    "reasoning": "Cho phép AI Agent gửi cấu trúc UI sáng tạo qua WebSocket"
  }
}

```

---

### Bước 2: Thay thế file `ui.html` (Cầu nối + Nút Test trực tiếp)

Mình đã tích hợp sẵn cả kết nối WebSocket với AI Agent lẫn một ô nhập JSON trực tiếp trên giao diện để bạn có thể **bấm nút test khả năng sáng tạo ngay lập tức** mà chưa cần bật server:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 12px; margin: 0; background: #f8fafc; color: #0f172a; }
    .status { padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 10px; background: #fee2e2; color: #991b1b; }
    .status.connected { background: #dcfce7; color: #166534; }
    textarea { width: 100%; height: 150px; box-sizing: border-box; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; resize: vertical; }
    button { width: 100%; margin-top: 8px; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div id="status" class="status">⚡ WS: Đang chờ Agent (ws://localhost:8080)...</div>
  <textarea id="jsonInput" placeholder="Dán JSON cấu trúc UI do AI sáng tạo vào đây để vẽ thử..."></textarea>
  <button id="renderBtn">🎨 Vẽ giao diện lên Canvas</button>

  <script>
    const statusEl = document.getElementById('status');
    const jsonInput = document.getElementById('jsonInput');

    // 1. Kết nối tự động với AI Agent qua WebSocket
    function connectWS() {
      const ws = new WebSocket('ws://localhost:8080');
      ws.onopen = () => {
        statusEl.innerText = '✅ Đã kết nối trực tiếp với AI Agent!';
        statusEl.className = 'status connected';
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        parent.postMessage({ pluginMessage: data }, '*');
      };
      ws.onclose = () => {
        statusEl.innerText = '⚡ WS: Đang chờ Agent (ws://localhost:8080)...';
        statusEl.className = 'status';
        setTimeout(connectWS, 3000);
      };
    }
    connectWS();

    // 2. Nút bấm test vẽ trực tiếp từ khung Textarea
    document.getElementById('renderBtn').onclick = () => {
      try {
        const tree = JSON.parse(jsonInput.value);
        parent.postMessage({ pluginMessage: { action: 'RENDER_UI', tree } }, '*');
      } catch (e) {
        alert('Lỗi định dạng JSON: ' + e.message);
      }
    };
  </script>
</body>
</html>

```

---

### Bước 3: Thay thế file `code.ts` (Bộ máy Render UI vạn năng)

Đây là "trái tim" giúp Plugin sáng tạo không giới hạn. Nó hỗ trợ lồng ghép vô hạn các tầng Auto Layout, chuyển mã màu `#HEX`, bo góc, viền, đổ bóng và căn chỉnh kích thước linh hoạt (`FILL`, `HUG`, `FIXED`):

```typescript
figma.showUI(__html__, { width: 320, height: 280 });

// Hàm chuyển mã màu Hex (#FF5733) sang hệ màu RGB (0 -> 1) của Figma
function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

// Hàm đệ quy: Tự động dựng mọi cấu trúc UI bất kỳ do AI Agent truyền xuống
async function buildNode(spec: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode> {
  let node: SceneNode;

  if (spec.type === 'TEXT') {
    const text = figma.createText();
    const style = spec.fontWeight === 'Bold' ? 'Bold' : spec.fontWeight === 'Medium' ? 'Medium' : 'Regular';
    await figma.loadFontAsync({ family: 'Inter', style });
    text.fontName = { family: 'Inter', style };
    text.characters = spec.text || '';
    text.fontSize = spec.fontSize || 14;
    if (spec.color) {
      text.fills = [{ type: 'SOLID', color: hexToRgb(spec.color) }];
    }
    if (spec.textAlign) {
      text.textAlignHorizontal = spec.textAlign; // 'LEFT' | 'CENTER' | 'RIGHT'
    }
    parent.appendChild(text);
    node = text;
  } else {
    // Mặc định tạo FRAME hỗ trợ Auto Layout (dùng cho cả Screen, Card, Button, Input, Icon box...)
    const frame = figma.createFrame();
    frame.name = spec.name || 'Container';
    frame.resize(spec.width || 100, spec.height || 100);

    // 1. Cấu hình Auto Layout (Flexbox)
    if (spec.layoutMode && spec.layoutMode !== 'NONE') {
      frame.layoutMode = spec.layoutMode; // 'HORIZONTAL' | 'VERTICAL'
      frame.itemSpacing = spec.gap !== undefined ? spec.gap : 8;
      frame.paddingTop = spec.paddingTop ?? spec.padding ?? 0;
      frame.paddingBottom = spec.paddingBottom ?? spec.padding ?? 0;
      frame.paddingLeft = spec.paddingLeft ?? spec.padding ?? 0;
      frame.paddingRight = spec.paddingRight ?? spec.padding ?? 0;

      if (spec.alignItems) frame.counterAxisAlignItems = spec.alignItems; // 'MIN' | 'CENTER' | 'MAX'
      if (spec.justifyContent) frame.primaryAxisAlignItems = spec.justifyContent; // 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
    }

    // 2. Màu nền (Background Fill)
    if (spec.bg) {
      frame.fills = [{ type: 'SOLID', color: hexToRgb(spec.bg), opacity: spec.opacity ?? 1 }];
    } else {
      frame.fills = []; // Trong suốt nếu không truyền bg
    }

    // 3. Bo góc (Corner Radius)
    if (spec.radius !== undefined) {
      frame.cornerRadius = spec.radius;
    }

    // 4. Viền (Border / Stroke)
    if (spec.borderColor) {
      frame.strokes = [{ type: 'SOLID', color: hexToRgb(spec.borderColor) }];
      frame.strokeWeight = spec.borderWidth || 1;
    }

    // 5. Đổ bóng hiện đại (Drop Shadow)
    if (spec.shadow) {
      frame.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.08 },
        offset: { x: 0, y: 4 },
        radius: 12,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
    }

    // QUAN TRỌNG: Phải gắn vào node cha trước khi chỉnh chế độ FILL / HUG
    parent.appendChild(frame);

    // 6. Đệ quy vẽ tất cả các phần tử con bên trong (nếu có)
    if (spec.children && Array.isArray(spec.children)) {
      for (const childSpec of spec.children) {
        await buildNode(childSpec, frame);
      }
    }

    node = frame;
  }

  // 7. Xử lý co giãn kích thước linh hoạt ('FILL' | 'HUG' | 'FIXED') sau khi đã nằm trong Auto Layout cha
  if ('layoutSizingHorizontal' in node && spec.widthMode) {
    node.layoutSizingHorizontal = spec.widthMode;
  }
  if ('layoutSizingVertical' in node && spec.heightMode) {
    node.layoutSizingVertical = spec.heightMode;
  }

  return node;
}

figma.ui.onmessage = async (msg) => {
  if (msg.action === 'RENDER_UI' && msg.tree) {
    try {
      const rootNode = await buildNode(msg.tree, figma.currentPage);
      figma.currentPage.selection = [rootNode];
      figma.viewport.scrollAndZoomIntoView([rootNode]);
      figma.notify('✨ AI đã vẽ xong giao diện!');
    } catch (err: any) {
      figma.notify('❌ Lỗi vẽ UI: ' + err.message, { error: true });
      console.error(err);
    }
  }
};

```

*(Lưu ý: Sau khi lưu `code.ts`, hãy đảm bảo cửa sổ Terminal đang chạy `npm run watch` để nó tự động cập nhật sang `code.js`).*

---

### Bước 4: Thử nghiệm ngay khả năng "Sáng tạo UI" trên Figma

Bây giờ, bạn hãy bật lại Plugin trên Figma (`Cmd + Option + P`), copy đoạn JSON mô phỏng một màn hình **Fintech / Ví điện tử hiện đại** do AI sinh ra dưới đây, dán vào ô Textarea của Plugin và bấm **"🎨 Vẽ giao diện lên Canvas"**:

```json
{
  "name": "Fintech Wallet Home",
  "width": 393,
  "height": 852,
  "layoutMode": "VERTICAL",
  "bg": "#F8FAFC",
  "padding": 24,
  "gap": 20,
  "children": [
    {
      "name": "Header",
      "layoutMode": "HORIZONTAL",
      "widthMode": "FILL",
      "heightMode": "HUG",
      "justifyContent": "SPACE_BETWEEN",
      "alignItems": "CENTER",
      "children": [
        {
          "name": "Greeting",
          "layoutMode": "VERTICAL",
          "heightMode": "HUG",
          "widthMode": "HUG",
          "gap": 4,
          "children": [
            { "type": "TEXT", "text": "Xin chào buổi chiều 👋", "fontSize": 13, "color": "#64748B" },
            { "type": "TEXT", "text": "Minh Nguyễn", "fontSize": 20, "fontWeight": "Bold", "color": "#0F172A" }
          ]
        },
        {
          "name": "Avatar",
          "width": 44,
          "height": 44,
          "radius": 22,
          "bg": "#E2E8F0",
          "layoutMode": "HORIZONTAL",
          "alignItems": "CENTER",
          "justifyContent": "CENTER",
          "children": [
            { "type": "TEXT", "text": "MN", "fontSize": 14, "fontWeight": "Bold", "color": "#334155" }
          ]
        }
      ]
    },
    {
      "name": "Balance Card",
      "layoutMode": "VERTICAL",
      "widthMode": "FILL",
      "heightMode": "HUG",
      "bg": "#1E293B",
      "radius": 20,
      "padding": 24,
      "gap": 16,
      "shadow": true,
      "children": [
        { "type": "TEXT", "text": "Tổng số dư khả dụng", "fontSize": 13, "color": "#94A3B8" },
        { "type": "TEXT", "text": "128.500.000 ₫", "fontSize": 32, "fontWeight": "Bold", "color": "#FFFFFF" },
        {
          "name": "Action Row",
          "layoutMode": "HORIZONTAL",
          "widthMode": "FILL",
          "heightMode": "HUG",
          "gap": 12,
          "children": [
            {
              "name": "Send Btn",
              "layoutMode": "HORIZONTAL",
              "widthMode": "FILL",
              "heightMode": "HUG",
              "bg": "#3B82F6",
              "radius": 12,
              "padding": 12,
              "justifyContent": "CENTER",
              "children": [
                { "type": "TEXT", "text": "Chuyển tiền", "fontSize": 14, "fontWeight": "Bold", "color": "#FFFFFF" }
              ]
            },
            {
              "name": "Topup Btn",
              "layoutMode": "HORIZONTAL",
              "widthMode": "FILL",
              "heightMode": "HUG",
              "bg": "#334155",
              "radius": 12,
              "padding": 12,
              "justifyContent": "CENTER",
              "children": [
                { "type": "TEXT", "text": "Nạp ví", "fontSize": 14, "fontWeight": "Medium", "color": "#FFFFFF" }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Recent Transactions",
      "layoutMode": "VERTICAL",
      "widthMode": "FILL",
      "heightMode": "HUG",
      "gap": 12,
      "children": [
        { "type": "TEXT", "text": "Giao dịch gần đây", "fontSize": 16, "fontWeight": "Bold", "color": "#0F172A" },
        {
          "name": "Tx Item 1",
          "layoutMode": "HORIZONTAL",
          "widthMode": "FILL",
          "heightMode": "HUG",
          "bg": "#FFFFFF",
          "radius": 14,
          "padding": 16,
          "justifyContent": "SPACE_BETWEEN",
          "alignItems": "CENTER",
          "borderColor": "#E2E8F0",
          "children": [
            {
              "name": "Info",
              "layoutMode": "VERTICAL",
              "widthMode": "HUG",
              "heightMode": "HUG",
              "gap": 4,
              "children": [
                { "type": "TEXT", "text": "Highlands Coffee", "fontSize": 15, "fontWeight": "Bold", "color": "#0F172A" },
                { "type": "TEXT", "text": "Hôm nay, 08:30", "fontSize": 12, "color": "#64748B" }
              ]
            },
            { "type": "TEXT", "text": "- 55.000 ₫", "fontSize": 15, "fontWeight": "Bold", "color": "#EF4444" }
          ]
        }
      ]
    }
  ]
}

```

---

### Bước 5: Cách dạy AI Agent tự động sáng tạo theo chuẩn này (System Prompt)

Khi bạn kết nối Claude, GPT hoặc Cursor với Plugin này, bạn chỉ cần đưa cho AI **System Prompt** quy định cấu trúc JSON trên:

> *"Bạn là Senior UI/UX Designer. Khi người dùng yêu cầu thiết kế bất kỳ màn hình nào, hãy trả về cấu trúc JSON khớp với schema của hàm `buildNode` (sử dụng `layoutMode: HORIZONTAL | VERTICAL`, `widthMode: FILL | HUG | FIXED`, `bg`, `radius`, `padding`, `gap`, `shadow` và mảng `children` đệ quy). Hãy phối màu hiện đại theo chuẩn Tailwind CSS / Apple HIG và gửi lệnh `{ action: 'RENDER_UI', tree: ... }` qua cổng WebSocket `ws://localhost:8080`."*

Nếu bạn muốn kết nối thẳng với **Claude Desktop** hoặc **Cursor**, mình có thể viết tiếp cho bạn 1 file `mcp-server.js` (chỉ khoảng 40 dòng code) để bạn gõ lệnh trong khung chat của Claude/Cursor là màn hình tự nhảy lên Figma ngay lập tức. Bạn đang dự định dùng AI Agent nào để điều khiển?
