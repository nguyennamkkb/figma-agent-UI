# Contracts: Slides DSL

## §1. `render_tree` trong Slides

Tạo nội dung **trong** slide — luôn kèm `parentId` là slide id:

```json
{
  "parentId": "1:518",
  "tree": { "type": "frame", "name": "Tieu de", "children": [
    { "type": "text", "name": "dong-1", "text": "Xin chào Slides — tiếng Việt có dấu", "fontSize": 64 }
  ]}
}
```

Tạo slide mới (children là nội dung slide):

```json
{ "tree": { "type": "slide", "name": "Slide moi", "row": 0, "col": 0, "children": [
  { "type": "text", "name": "tieu-de", "text": "Slide mới tạo bởi agent", "fontSize": 72 }
]}}
```

Quy tắc:

- Thiếu `parentId` trong Slides → fallback `focusedSlide ?? currentPage`, kết quả kèm `parentNote` cho biết node rơi vào đâu. Đừng rely vào đó — luôn truyền tường minh.
- `widthMode/heightMode` không tự gán trong Slides. Muốn FILL/HUG thì truyền tường minh (sai sẽ nhận lỗi thật của API).
- Viết tiếng Việt có dấu bình thường (font load như Design); screenshot kiểm tra sau mỗi write.
- Mỗi write một undo; lỗi giữa chừng rollback sạch (`(nothing was left on the canvas)`).

## §2. `get_node` cho Slides

```json
{ "id": "1:518", "name": "1", "type": "SLIDE", "width": 1920, "height": 1080,
  "fill": { "var": "How To Use Figma Slides/White" },
  "transition": { "style": "NONE", "duration": 0.3 },
  "skipped": false, "childCount": 2 }
```

- `SLIDE_GRID`: `{ "type": "SLIDE_GRID", "childCount": N, "children": [...] }` (hàng → slides).
- `INTERACTIVE_SLIDE_ELEMENT`: thêm `"readOnly": true, "elementType": "POLL|EMBED|..."`.
- Bí danh `{var}`/`{style}` giữ nguyên, không resolve bừa.

## §3. Refusal vocabulary (Slides)

Mọi tool Design-only gọi trong Slides trả đúng mẫu, board không đổi:

```
<tool> is Design-only and has no effect in this Slides deck.
```

`safeToRetryWithoutCanvasRead: true`. Danh sách tạm (chốt sau đo live từng tool): `set_interactions`, `annotate`, `set_dev_status`, `bind_variables`, `create_variables`, `create_styles`, `import_tokens`, `export_tokens`, `render_foundations`, `create_component_set`, `stress_test`, `get_design_system`, `search_design_system`.

## §4. Grid qua `execute_code` (cho tới khi có tool riêng)

```js
// Đọc grid (mới trước, cũ fallback)
const grid = (typeof figma.getCanvasGrid === 'function')
  ? figma.getCanvasGrid() : figma.getSlideGrid();
// Tạo slide đầu deck + text có dấu
const s = figma.createSlide(0, 0);
const t = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
t.characters = 'Slide mới — tiếng Việt có dấu';
s.appendChild(t);
return { slide: s.id, rows: grid.length };
```

`setCanvasGrid`/`setSlideGrid` phải truyền **đủ mọi slide** đang có, nếu không API từ chối và deck giữ nguyên.

## §5. Quirks đã đo live

- Figma tự đặt tên slide theo số thứ tự (`1`, `2`…; slide bị skip hiện `-`). `name` trong SlideSpec vẫn gửi nhưng platform có thể ghi đè.
- `setSlideTransition` reset `isSkippedSlide` — plugin luôn ghi transition trước, skipped sau, nên gọi chung một `update_nodes` vẫn đúng.
