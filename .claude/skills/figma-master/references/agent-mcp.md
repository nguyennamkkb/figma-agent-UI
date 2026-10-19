# Agent vận hành Figma qua MCP

## Mục lục
1. Điều kiện và kiểm tra kết nối
2. Bộ tool và khi nào dùng
3. Vòng lặp chuẩn: Đọc → Tìm → Ghi nhỏ → Nhìn → Sửa
4. Luật an toàn khi ghi
5. Công thức Plugin API thường dùng
6. Lỗi hay gặp và cách xử lý
7. Khi không có MCP

> Danh sách tool của Figma MCP thay đổi theo thời gian. Luôn tin danh sách tool thực tế trong phiên hơn tài liệu này. Nếu môi trường có skill chính thức `figma-use` của Figma, đọc nó cho chi tiết Plugin API; file này lo phần **quy trình và chuẩn chất lượng**.

---

## 1. Điều kiện và kiểm tra kết nối

- Ghi lên canvas cần **Figma MCP server remote** (`https://mcp.figma.com/mcp`, đăng nhập OAuth). Server desktop (chạy qua app Figma) chỉ đọc, không ghi.
- Ghi vào file ngoài Drafts cần **Full seat**. Tính năng ghi có thể đang ở beta và sau này tính phí theo lượt dùng.
- Tool đọc có rate limit theo gói; tool ghi thường được miễn. → Đừng gọi đọc thừa (ví dụ chụp screenshot cả page khi chỉ cần một frame).
- Lỗi quyền hoặc không thấy file: gọi `whoami` để biết đang đăng nhập tài khoản nào, rồi báo người dùng.

## 2. Bộ tool và khi nào dùng

| Tool | Dùng khi | Ghi chú |
|---|---|---|
| `whoami` | Lỗi quyền, kiểm tra tài khoản/seat | |
| `get_metadata` | Bước đầu tiên với mọi file/node: lấy cây layer (ID, tên, loại, vị trí, kích thước) dạng XML gọn | Rẻ. Dùng để chia nhỏ trước khi gọi tool nặng. Không dùng cho file Figma Make |
| `get_screenshot` | Nhìn thiết kế; kiểm chứng sau khi ghi | Chụp đúng node cần, không chụp cả page lớn |
| `get_design_context` | Lấy ngữ cảnh đầy đủ (cấu trúc + style + code tham chiếu) của một node để hiểu hoặc chuyển sang code | Nặng — chia nhỏ bằng `get_metadata` trước |
| `get_variable_defs` | Liệt kê variables/styles đang dùng trong vùng chọn | Dùng trong audit token |
| `search_design_system` | **Bắt buộc trước khi tạo component**: tìm component, variable, style có sẵn trong thư viện đã kết nối | Luật gốc số 3 |
| `use_figma` | Mọi thao tác ghi: tạo/sửa/xóa page, frame, component, variant, variable, style, text, ảnh; và cả kiểm tra (chạy JS chỉ đọc) | Chạy JavaScript Plugin API trong file |
| `generate_figma_design` | Chụp một app/web đang chạy thành layer Figma | Ra layer phẳng, không nối thư viện → chỉ dùng để tham chiếu/mockup nhanh, không làm nguồn thiết kế chuẩn |
| `create_new_file` | Tạo file Design/FigJam trống | |
| `generate_diagram` | Vẽ sơ đồ (flowchart, sequence, gantt) trong FigJam | Hợp cho user flow, sitemap ở giai đoạn brief |
| Code Connect (các tool `*code_connect*`) | Nối component Figma với component trong codebase | Giai đoạn bàn giao |

Nguyên tắc chọn: **`use_figma` cho ghi có cấu trúc** (dùng component và variable thật); `generate_figma_design` chỉ khi cần chụp nhanh giao diện đang chạy.

## 3. Vòng lặp chuẩn

```
ĐỌC      get_metadata (page/node) → hiểu cấu trúc, tìm node ID
NHÌN     get_screenshot (node mục tiêu) → hiểu thị giác hiện tại
TÌM      search_design_system → component/variable/style dùng lại được
LẬP KẾ   Liệt kê các lần ghi nhỏ, mỗi lần một đơn vị có thể kiểm tra
GHI      use_figma — một đơn vị (một component, một section, một màn)
NHÌN     get_screenshot node vừa ghi → so với ý định
SỬA      Lệch thì sửa ngay trước khi ghi đơn vị tiếp theo
```

Kích thước một lần ghi hợp lý: một component kèm variants; một bộ variable collection; một màn hình. Không gộp "cả design system" vào một script.

Mỗi script `use_figma` nên:
- Bắt đầu bằng việc lấy node theo ID (`await figma.getNodeByIdAsync(id)`) hoặc tìm page theo tên — không dựa vào vùng chọn hiện tại của người dùng.
- `return` một object nhỏ mô tả kết quả (ID node tạo ra, số lượng, cảnh báo) để bước sau dùng tiếp.
- Bọc trong `try/catch` và trả lỗi rõ ràng.

## 4. Luật an toàn khi ghi

1. **Phạm vi:** chỉ ghi trong page/section người dùng chỉ định, hoặc page do agent tạo (`🧪 Explore`, `🤖 Agent sandbox`).
2. **Không xóa** node người dùng tạo. Cần thay thế → tạo bản mới bên cạnh, đổi tên bản cũ thành `old/…` và hỏi người dùng có xóa không.
3. **Sửa thứ quan trọng** (component chính trong thư viện, variable đang được dùng rộng) → báo trước phạm vi ảnh hưởng (bao nhiêu instance), chờ đồng ý.
4. **Ưu tiên branch** (nếu gói hỗ trợ) cho thay đổi lớn trên file thư viện.
5. **Không đổi tên/xóa variable** đang được bind — sẽ làm vỡ mọi nơi dùng. Thêm variable mới, chuyển dần, rồi mới dọn.
6. **Ghi nhật ký:** cuối phiên, liệt kê mọi node ID đã tạo/sửa trong báo cáo.

## 5. Công thức Plugin API thường dùng

> Mẫu tham khảo. Khi API báo lỗi, đọc thông báo lỗi và tài liệu Plugin API hiện hành — đừng đoán lại cùng một cách.

### 5.1 Chuyển page và lấy node
```js
const page = figma.root.children.find(p => p.name === '🧪 Explore');
await figma.setCurrentPageAsync(page);          // không gán figma.currentPage trực tiếp
const node = await figma.getNodeByIdAsync('12:34');
```

### 5.2 Variables: collection, modes, alias, scopes
```js
// Primitives — 1 mode
const prim = figma.variables.createVariableCollection('Primitives');
prim.renameMode(prim.modes[0].modeId, 'Value');
const blue600 = figma.variables.createVariable('color/blue/600', prim, 'COLOR');
blue600.setValueForMode(prim.modes[0].modeId, { r: 0.145, g: 0.388, b: 0.922, a: 1 });
blue600.scopes = [];                             // primitive: ẩn khỏi picker, chỉ để alias

// Semantic — Light/Dark
const sem = figma.variables.createVariableCollection('Semantic');
const light = sem.modes[0].modeId; sem.renameMode(light, 'Light');
const dark = sem.addMode('Dark');
const actionPrimary = figma.variables.createVariable('color/action/primary', sem, 'COLOR');
actionPrimary.setValueForMode(light, figma.variables.createVariableAlias(blue600));
actionPrimary.setValueForMode(dark,  figma.variables.createVariableAlias(blue400));
actionPrimary.scopes = ['FRAME_FILL', 'SHAPE_FILL'];

// Số: spacing / radius
const space4 = figma.variables.createVariable('space/4', sem, 'FLOAT');   // 16
space4.scopes = ['GAP', 'WIDTH_HEIGHT'];
```
Màu trong Plugin API là 0–1, không phải 0–255. Chuyển hex: `r = parseInt(hex.slice(1,3),16)/255`.

### 5.3 Bind variable vào node
```js
// Fill / stroke: phải tạo paint mới
const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
frame.fills = [figma.variables.setBoundVariableForPaint(base, 'color', actionPrimary)];

// Thuộc tính số
frame.setBoundVariable('itemSpacing', space2);
frame.setBoundVariable('paddingLeft', space4);   // tương tự paddingRight/Top/Bottom
frame.setBoundVariable('topLeftRadius', radiusMd); // và 3 góc còn lại
```

### 5.4 Auto Layout
```js
const f = figma.createFrame();
f.name = 'Card';
f.layoutMode = 'VERTICAL';             // 'HORIZONTAL' | 'VERTICAL' | 'NONE' (| 'GRID' nếu có)
f.primaryAxisSizingMode = 'AUTO';      // hug theo trục chính
f.counterAxisSizingMode = 'FIXED';
f.itemSpacing = 8;
f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = 16;
f.primaryAxisAlignItems = 'MIN';       // MIN | CENTER | MAX | SPACE_BETWEEN
f.counterAxisAlignItems = 'MIN';
parent.appendChild(f);
f.layoutSizingHorizontal = 'FILL';     // chỉ đặt SAU khi đã nằm trong cha có Auto Layout
f.clipsContent = true;
```

### 5.5 Text
```js
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }); // tên style có dấu cách
const t = figma.createText();
t.fontName = { family: 'Inter', style: 'Semi Bold' };
t.characters = 'Tiêu đề';
t.textAutoResize = 'WIDTH_AND_HEIGHT'; // hoặc 'HEIGHT' khi text fill chiều ngang
await t.setTextStyleIdAsync(styleHeadingMd.id); // ưu tiên style thay vì set từng thuộc tính
```
Luôn `loadFontAsync` mọi font trước khi đổi `characters` hoặc thuộc tính chữ, kể cả với text có sẵn.

### 5.6 Component, variants, properties
```js
const make = (state) => {
  const c = figma.createComponent();
  c.name = `Size=md, State=${state}`;
  // ... dựng Auto Layout, bind token
  return c;
};
const set = figma.combineAsVariants(['default','pressed','disabled'].map(make), page);
set.name = 'Button';

// Text property và boolean property
const labelKey = set.addComponentProperty('Label', 'TEXT', 'Button');
const iconKey  = set.addComponentProperty('Has icon', 'BOOLEAN', false);
for (const v of set.children) {
  v.findOne(n => n.name === 'label').componentPropertyReferences = { characters: labelKey };
  v.findOne(n => n.name === 'icon').componentPropertyReferences  = { visible: iconKey };
}
set.description = 'Nút hành động chính. Dùng 1 nút Primary mỗi màn.';
```

### 5.7 Audit chỉ đọc (dùng ở GĐ 7)
```js
const page = await figma.getNodeByIdAsync(PAGE_ID);
const issues = [];
const DEFAULT = /^(Frame|Rectangle|Ellipse|Group|Vector|Text|Line|Polygon|Star) \d+$/;
page.findAll(n => {
  if (DEFAULT.test(n.name)) issues.push({ id: n.id, type: 'default-name', name: n.name });
  if ('fills' in n && Array.isArray(n.fills)) {
    n.fills.forEach((p, i) => {
      if (p.type === 'SOLID' && p.visible !== false && !(n.boundVariables?.fills?.[i]) && !n.fillStyleId)
        issues.push({ id: n.id, type: 'raw-fill', name: n.name });
    });
  }
  if (n.type === 'FRAME' && n.layoutMode === 'NONE' && n.children.length > 1 && !n.name.startsWith('decor/'))
    issues.push({ id: n.id, type: 'no-autolayout', name: n.name });
  return false;
});
return { total: issues.length, sample: issues.slice(0, 50) };
```
Trả mẫu giới hạn (50) để không tràn ngữ cảnh; tổng số để báo cáo.

## 6. Lỗi hay gặp

| Triệu chứng | Nguyên nhân / cách xử lý |
|---|---|
| `Cannot write to node with unloaded font` | Chưa `loadFontAsync` đúng family + style |
| Font "SemiBold" không tìm thấy | Tên style có dấu cách: `Semi Bold`, `Extra Bold` |
| `layoutSizingHorizontal` báo lỗi | Node chưa nằm trong cha có Auto Layout — append trước rồi mới đặt |
| Gán `figma.currentPage` lỗi | Dùng `await figma.setCurrentPageAsync(page)` |
| Màu sai hoàn toàn | Dùng 0–255 thay vì 0–1 |
| Bind fill không ăn | Phải gán mảng paint mới từ `setBoundVariableForPaint` |
| Tool `use_figma` không xuất hiện | Đang dùng server desktop, client chưa hỗ trợ ghi, hoặc cần cài lại/xác thực lại server remote |
| Rate limit | Giảm gọi đọc: dùng `get_metadata` rồi đọc đúng node; gộp kiểm tra vào một script `use_figma` |

## 7. Khi không có MCP

Chuyển sang chế độ Designer: cùng quy trình, đầu ra là hướng dẫn thao tác cho người. Với mỗi bước ghi rõ:
- **Ở đâu:** panel/menu (ví dụ: Right sidebar → Auto layout → `+`, hoặc phím `Shift + A`).
- **Làm gì:** giá trị cụ thể, tên cụ thể.
- **Kiểm tra:** dấu hiệu đúng (ví dụ: "kéo giãn card, nội dung tự xuống dòng, padding giữ 16").

Có thể kèm bảng token dạng JSON để người dùng nhập bằng plugin import variables, sau khi đã chạy `scripts/check_tokens.py`.
