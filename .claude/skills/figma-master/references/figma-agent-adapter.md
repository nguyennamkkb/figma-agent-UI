# Chạy figma-master trên `figma-agent` (MCP + plugin figma-agent-UI)

Đọc file này **thay cho** `agent-mcp.md` §1–2 khi phiên có tool `mcp__figma-agent__*` (hoặc tên tool không có tiền tố: `figma_status`, `render_tree`…). Quy trình, luật gốc và chuẩn chất lượng giữ nguyên, chỉ khác tên tool.

## Mục lục
1. Kết nối và phiên bản
2. Bảng đối chiếu tool
3. Công thức theo giai đoạn
4. Tham số dễ nhầm
5. Giới hạn: phải nói với người dùng

---

## 1. Kết nối và phiên bản

- Gọi `figma_status` trước tiên. `files: []` nghĩa là chưa có file nào: nhờ người dùng mở Figma → Plugins → Development → **figma-agent-UI**, dán `token`, bấm Connect.
- Đọc `versionCheck`. Nếu có ⚠️ thì plugin đang mở trong Figma là bản build khác server, và tool mới sẽ báo `Unknown command`. Nhờ người dùng **đóng plugin rồi mở lại**. Bảng plugin hiện dòng `Plugin 1.1.0 (<commit>)` để đối chiếu.
- Ghi được lên mọi file người dùng mở; không cần Figma MCP remote hay Full seat. Giới hạn theo gói vẫn áp dụng: ví dụ gói free chỉ cho 1 mode mỗi collection.

## 2. Bảng đối chiếu tool

| Master gọi | Dùng trong figma-agent | Ghi chú |
|---|---|---|
| `whoami` | `figma_status` | Có user, file, version |
| `get_metadata` | `get_document_info`, rồi `get_node{ids, depth}` | JSON, không phải XML |
| `get_screenshot` | `screenshot{id}` | `id` số ít |
| `get_design_context` | `get_node{ids, depth: 3}` | Cùng từ vựng với `render_tree` |
| `get_variable_defs` | `get_design_system{usedIn: nodeId}` | Token/style đang bind trong node |
| `search_design_system` | `search_design_system{query}` | Luật #3: gọi trước khi tạo |
| `use_figma` (ghi có cấu trúc) | Tool chuyên dụng ở §3; `execute_code` chỉ là lối thoát | |
| `use_figma` (audit chỉ đọc) | `audit_design` | Không cần tự viết snippet §5.7 |
| `generate_figma_design`, `create_new_file`, `generate_diagram`, Code Connect | — | Không có. Xem §5 |

**Ưu tiên:** tool chuyên dụng → `render_tree`/`update_nodes` → `execute_code`. Tool chuyên dụng tự kiểm tra đầu vào, trả id và tự dọn khi lỗi. `execute_code` thì không.

## 3. Công thức theo giai đoạn

| GĐ | Việc | Tool |
|---|---|---|
| 0 | Định vị | `figma_status` → `get_document_info` → `get_design_system` |
| 1 | Khung 9 page | `manage_pages{template: true, dryRun: true}` để xem trước, rồi chạy thật |
| 2 | Token từ JSON | `import_tokens{path, dryRun: true}`: lint giống `check_tokens.py`, rồi chạy thật |
| 2 | Variables lẻ | `create_variables{collection, modes, variables, onExisting}` |
| 2 | Text/paint/effect/grid style | `create_styles{styles: [...]}`; text style bind được `fontSize: {var}` |
| 2 | Page Foundations | `render_foundations{page: "🎨 Foundations"}` |
| 3 | Tìm trước | `search_design_system{query: "button"}` |
| 3 | Component set + properties | `create_component_set{name, variants: [{props, tree}], properties}` |
| 3 | Playground | `stress_test{id, cases, modes}` → `screenshot{id: sectionId}` |
| 4 | 2–3 hướng | Mỗi hướng một `render_tree{page: "🧪 Explore", tree: {type: "section", name: "Hướng A – …", children: [...]}}` → **dừng ở gate** |
| 5 | Màn hình theo flow | `render_tree{page: "📱 Screens", tree: {type: "section", name: "<Flow>", children: [màn…]}}`; frame có `layoutGrids: {preset: "mobile"}`; tên màn `Flow / Screen / State` |
| 5 | Dark mode | Frame có `variableModes: {"Semantic": "Dark"}` (cần gói nhiều mode) |
| 6 | Prototype | `set_interactions{items: [{id, reactions: [{action: "NAVIGATE", destination, transition: {duration: {var: "duration/base"}, easing: "standard"}}]}], flowStart}` |
| 6 | Interactive component | `set_interactions` trên variant với `action: "CHANGE_TO"`, `destination` = variant đích |
| 7 | QA | `audit_design{format: "markdown"}` → dán vào báo cáo QA |
| 7 | Sửa raw-fill/spacing/radius | `bind_variables{rootId}` (mặc định dryRun) → xem `ambiguous` → thêm `map` → `dryRun: false` |
| 7 | Sửa tên mặc định | `rename_by_rule{rootId}` (mặc định dryRun) → `dryRun: false` |
| 8 | Annotation | `annotate{items: [{id, label, properties}]}` |
| 8 | Ready for dev | `set_dev_status{ids: [sectionId], status: "READY_FOR_DEV"}` |
| 8 | Token sang code | `export_tokens{format: "css" \| "swift" \| "kotlin" \| "json", path}` |
| 8 | Asset | `export_assets{ids, format, scales, outDir}` |

Mọi tool ghi đều nhận `page` (id hoặc tên). Khi chạy song song nhiều agent, luôn truyền `page` thay vì `set_current_page`.

## 4. Tham số dễ nhầm

- `get_node.ids` là **mảng**; `screenshot.id` là **chuỗi**.
- `update_nodes{updates: [{id, props}]}`: không phải `ops` hay `properties`.
- Màu trong DSL là hex (`"#2563EB"`) hoặc `{var: "color/action/primary"}`; trong `execute_code` là 0–1.
- Alias trong `create_variables`: `{alias: "color/gray/900"}` hoặc `{alias: "Primitives/color/gray/900"}`.
- `bind_variables` và `rename_by_rule` **mặc định `dryRun: true`**. Phải gọi lần hai với `dryRun: false` mới ghi.
- `create_component_set`: tên layer trong `targets` phải trùng tên layer trong `tree` của mọi variant.
- Motion token lưu bằng **mili giây** (`duration/base = 250`); `set_interactions` tự đổi sang giây.

## 5. Giới hạn: phải nói với người dùng

| Việc | Lý do | Thay bằng |
|---|---|---|
| Publish library, version history, branch | Plugin API không làm được | Agent soạn changelog semver (design-system §8); người dùng bấm Publish |
| Code Connect | Công cụ riêng của Figma | `export_tokens` + annotation có tên component code |
| Nhiều mode trên gói free | Figma báo `Limited to 1 modes only` | `create_variables`/`import_tokens` vẫn ghi mode đầu và trả cảnh báo; Dark mode chỉ có khi nâng gói |
| Figma Motion timeline, shader | Chưa có Plugin API | Ghi thông số trong `annotate` |
| Library component (chưa dùng trên page) | Plugin API không liệt kê | Hỏi người dùng tên/key, hoặc kéo một instance vào page rồi `get_design_system` |
| Vòng lặp vô hạn trong `execute_code` | Không ngắt được, plugin bị Figma đóng | Dùng tool chuyên dụng; vòng lặp luôn có giới hạn |
