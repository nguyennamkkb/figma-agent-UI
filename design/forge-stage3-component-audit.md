# Forge — Stage 3 Component Audit: lỗi thật vs. false positive

**Ngày:** 2026-10-20
**File Figma:** `file2` · page `🎨 Foundations & Components`
**Phạm vi:** section `🧩 Components` (`3:3`, 279 node) + `🧪 Playground` (`3:362`, 66 node)
**Phương pháp:** không tin báo cáo của `audit_design` một cách mù quáng — mỗi cảnh báo được kiểm chứng bằng Plugin API (`figma.variables`, `figma.getNodeByIdAsync`) và bằng thí nghiệm đối chứng (probe song song).

---

## 0. Đính chính sau khi tái hiện (2026-10-20, cùng ngày)

Mọi kết luận dưới đây đã được tái hiện lại trên canvas bằng probe, kèm ảnh chụp, rồi xoá probe. Bốn chỗ trong bản gốc bị **sai nguyên nhân**:

| Mục gốc | Kết luận gốc | Thực tế đã tái hiện | Đã khắc phục |
|---|---|---|---|
| §3.1 `primitive-bound` | False positive, audit tra theo **tên** | Audit tra theo **scopes**: biến có `scopes: []` bị coi là primitive, bất kể collection. 37/67 biến Semantic (space, radius, type, border/width, size, duration) có `scopes: []`, nên bị ẩn khỏi picker. Đây là **lỗi dữ liệu thật**. Probe: Semantic `scopes:['GAP']` → không flag; Semantic `scopes:[]` → flag | Đặt lại scopes cho 33 biến (`duration/*` giữ `[]`). Audit `3:3` → **0 issue**. `inferScopes` sửa `border/width/*` → `STROKE_FLOAT` (trước là `WIDTH_HEIGHT`), `type/*` → `FONT_SIZE` (trước là `ALL_SCOPES`). Thông báo audit ghi rõ "scopes []" |
| §3.3 `raw-stroke`/`raw-radius` | Chrome do **Figma** tự vẽ | Do **`create_component_set`** đặt (`components.ts`: `#9747FF`, dash `[10,5]`, radius 5) | Audit bỏ qua chrome của `COMPONENT_SET` |
| §2.6 / #15 paint fallback | `update_nodes` với `{var}` để lại fallback | `render_tree` và `update_nodes` luôn bind đúng màu (kiểm bằng số + ảnh). Lỗi chỉ xảy ra khi gán paint **có cùng binding nó đang có** nhưng màu khác (clone paint → sửa `color` → gán lại, hoặc `{…paint, boundVariables}` thủ công): Figma chỉ tính lại màu khi binding **đổi** | Thêm check `stale-paint` (🔴 Chặn) vào `audit_design`, đã thử: bắt đúng 2/2 probe |
| §2.1 / #12 frame co lại | Frame không có `layout` co về kích thước con | Có đủ `width`+`height` → giữ nguyên. Không có cả hai → co về con (22×22). Chỉ có một chiều → chiều kia = **100** (`height:44` → 100×44, thành viên thuốc). Con luôn nằm ở (0,0) | Ghi vào `render-tree-dsl.md` §4 |
| #13 rollback không trọn | `create_component_set` để sót set | Lỗi ở variant thứ 2 → không sót gì. Bản trùng đến từ các lần gọi **trước đó đã thành công** | Ghi vào `tool-reference.md` §4 |

Phát hiện thêm khi tái hiện:
- `{var:"space/9"}` (không kèm collection) bind vào biến xuất hiện **trước**, tức Primitives → layer âm thầm bind primitive. Đã sửa: tên trần ưu tiên biến không thuộc Primitives.
- `audit_design{rootId}` không quét chính node gốc (`scanned: 0` khi audit 1 frame lẻ). Đã sửa: node gốc được quét cùng cây con.

Các mục còn đúng: `no-autolayout` trên `icon/*`, `raw-text` Dynamic Type, lỗi contrast thật ở `3:14`, các lỗi API #3–#9 và #14. Mục #1 (`effects` chỉ nhận preset) đã lỗi thời: schema variant hiện nhận `{style}`.

## 1. Kết luận tổng quát (bản gốc — đọc kèm §0)

| Nhóm cảnh báo | Số | Phán đoán | Bằng chứng |
|---|---|---|---|
| `primitive-bound` | 242 + 64 | ~~False positive~~ **Lỗi dữ liệu: Semantic có `scopes: []`** (§0) | ~~Thí nghiệm probe song song (§3.1)~~ |
| `raw-stroke` | 11 | **False positive** — chrome do `create_component_set` vẽ (§0) | Toàn bộ 11 node đều là `COMPONENT_SET`, stroke `#9747FF` dash `[10,5]` |
| `raw-radius` | 11 | **False positive** — chrome do `create_component_set` vẽ (§0) | Cùng 11 `COMPONENT_SET`, `cornerRadius = 5` |
| `no-autolayout` | 23 + 3 | **False positive** | 26/26 frame tên `icon/*`, con chỉ là `VECTOR` (SVG import) |
| `raw-text` | 3 | **Có chủ đích** | Override cỡ chữ Dynamic Type trong Playground |
| `contrast` | 1 | **Lỗi THẬT** — đã sửa, còn **0** | Nền node `3:14` bị bind sai thành trắng; audit báo `3.6:1` là **đúng** (§2.6) |
| `orphan-token` | 5 | **Chưa dùng, sẽ dùng ở Stage 5** | `brand/gradient-*`, `grid/mobile`, `grid/desktop` |

**Census binding (đo bằng Plugin API, không phải audit) — phạm vi toàn file:**

```
totalBindings: 1091
byCollection:  { Semantic: 1039, Primitives: 52 }
paintBindings: 333   →  333 đúng, 0 sai
```

52 binding `Primitives` còn lại **nằm trên chart Foundations** (ô màu `chip`, thanh thang `bar`, mẫu chữ `sample`) — ở đó bind thẳng vào primitive là **đúng thiết kế**, vì chart đó chính là bản trình bày của tầng Primitives.

> Trong phạm vi sản phẩm (components + playground + cover + brief) trước khi sửa: `Semantic 866 · Primitives 44`. 44 binding còn sót là stroke weight của 11 node (`border/width/thin|strong`) — **lỗi thật**, đã sửa ở §2.4.

> **Bài học lớn nhất của phiên này:** `audit_design` chỉ đọc `boundVariables` — nó **không** phát hiện được trường hợp biến đã bind đúng nhưng **màu fallback của paint bị sai**, nên Figma render sai màu. Mình đã phán đoán cảnh báo `contrast` là "false positive do audit dò sai nền" — **sai**. Chỉ đến khi **chụp ảnh component set nhìn bằng mắt** mới thấy nút Disabled có nền trắng. Bài học: `audit_design` là tín hiệu để điều tra, **không phải bằng chứng kết luận**; luôn verify bằng Plugin API + ảnh chụp trước khi phán đoán false positive.

---

## 2. Lỗi THẬT đã tìm và sửa

### 2.1 Frame chứa SVG bị co về kích thước con + icon lệch góc

**Triệu chứng:** nút "check" trong Set Row là hình **bầu dục** thay vì hình tròn; icon lệch ra góc trái trên; icon trong `icon-slot` bị đè lên mép.

**Nguyên nhân:** trong `render_tree`, một `frame` không có `layout` sẽ **tự co về kích thước con** (không báo lỗi). Frame 44×44 biến thành 22×44 → `cornerRadius = 999` trên hình chữ nhật 22×44 = bầu dục. Con (SVG) không có auto-layout nên nằm ở `(0,0)`.

**Bằng chứng (đo trước khi sửa):**

| Node id | Tên | Kích thước thực | Kích thước thiết kế | Layout |
|---|---|---|---|---|
| `3:182` | Set Row / check | 22 × 44 | 44 × 44 | `NONE` |
| `3:189` | Set Row / check (Active) | 22 × 44 | 44 × 44 | `NONE` |
| `3:196` | Set Row / check (Completed) | 22 × 44 | 44 × 44 | `NONE` |
| `3:201` | List Row / icon-slot | 20 × 40 | 40 × 40 | `NONE` |
| `3:212` | List Row / icon-slot (Pressed) | 20 × 40 | 40 × 40 | `NONE` |
| `3:223` | List Row / icon-slot (Selected) | 20 × 40 | 40 × 40 | `NONE` |
| `3:316` `3:327` | Top App Bar / icon-button/back | 22 × 44 | 44 × 44 | `NONE` |
| `3:321` `3:332` | Top App Bar / icon-button/action | 22 × 44 | 44 × 44 | `NONE` |

**Sau khi sửa:** tất cả 13 node → đúng kích thước, `layoutMode = HORIZONTAL`, con SVG canh giữa (đối chiếu tâm: sai số 0.0 px).

### 2.2 Nhãn Disabled của Button đồng màu nền

**Triệu chứng:** nhãn "Start workout" của Button Disabled không đọc được.

**Nguyên nhân:** fill `state/disabled` (`neutral/500` = `#343444`) và chữ `text/disabled` (`neutral/500`) → **cùng một màu**.

**Bằng chứng:** `text/on-accent #0B0B10` trên `state/disabled #343444` = **1.61:1** (audit báo `1:1`).

**Sau khi sửa:**

| Variant | Fill | Text | Contrast thật |
|---|---|---|---|
| `3:8` Primary Disabled | `surface/base` | `text/tertiary` | **5.17:1** ✓ |
| `3:14` Secondary Disabled | `surface/raised` | `text/tertiary` | **4.78:1** ✓ |
| `3:20` Ghost Disabled | không fill | `text/tertiary` | **5.45:1** ✓ |

### 2.3 `neutral/300` không đạt WCAG AA

**Triệu chứng:** `text/tertiary` trên `surface/raised` chỉ 4.23:1 (cần ≥ 4.5:1 cho chữ thường).

**Bằng chứng:** `neutral/300` = `#7C7C93` → **4.23:1** trên `#1A1A26`.

**Sau khi sửa:** `neutral/300` → `#85859C` → **4.78:1** ✓ (cải thiện luôn trên `bg/canvas` và `surface/base`).

### 2.4 44 binding stroke weight trỏ thẳng vào Primitives

**Triệu chứng:** census cho thấy `Primitives :: border/width/thin` (36) và `Primitives :: border/width/strong` (8) — tức 11 node × 4 cạnh stroke.

**Bằng chứng:** `perField` → `strokeTopWeight|Primitives: 11`, `strokeBottomWeight|Primitives: 11`, `strokeLeftWeight|Primitives: 11`, `strokeRightWeight|Primitives: 11`; trong khi `strokes|Semantic: 98` (màu viền vẫn đúng).

**Sau khi sửa:** rebind 8 node gốc bằng `update_nodes` (`stroke.width = {var:"Semantic/border/width/…"}`), instance kế thừa. Census lại: **0 binding Primitives** trong sản phẩm (chỉ còn 52 binding trên chart Foundations, đúng thiết kế).

### 2.5 Các lỗi thật khác đã sửa trong quá trình
| # | Lỗi | Bằng chứng trước | Sau |
|---|---|---|---|
| 2.5.1 | 11 component set chồng lên nhau tại `(0,0)` trong Section (Section không phải auto-layout) | tất cả `x:0, y:0` | bọc trong flow frame `library` (`3:339`), xếp hàng có nhãn |
| 2.5.2 | Màu raw của Chip `dot` | `fill[0] không bind variable` | bind `text/tertiary` / `text/on-accent` / `accent/glow` |
| 2.5.3 | 72 stroke của icon vector dạng hex thô (`#C8FF2E`, `#FFFFFF`, `#7C7C93`, `#0B0B10`) | `stroke[0] không bind variable/style` | bind vào 4 token mới `icon/accent`, `icon/primary`, `icon/secondary`, `icon/on-accent` |
| 2.5.4 | 11 nhãn section không dùng text style | `text không dùng text style` | gán `title/md` qua `setTextStyleIdAsync` |
| 2.5.5 | Spacing lệch thang 4/8 | `paddingTop=14`, `itemSpacing=6`, `paddingBottom=34` | 16 / 8 / 32 |

### 2.6 Paint fallback sai → render sai màu (lớp lỗi âm thầm nguy hiểm nhất)

> ⚠️ **Đính chính (§0):** `update_nodes`/`render_tree` không gây lỗi này. Nguyên nhân là gán paint có cùng binding nhưng màu khác; Figma chỉ tính lại màu khi binding đổi. Giờ `audit_design` có check `stale-paint` để bắt.

Đây là lỗi mà ban đầu mình **đã phán đoán sai** là "false positive của audit". Nhờ đối chiếu bằng ảnh chụp mới phát hiện.

**Triệu chứng:** Button `Type=Secondary, State=Disabled` (`3:14`) hiện nền **trắng** thay vì `surface/raised` (#1A1A26) — nhìn rõ trong ảnh chụp component set.

**Nguyên nhân:** khi gán paint bằng `boundVariables` thủ công, hoặc khi `update_nodes` nhận `stroke: {color: {var}}`, Figma **ghi đúng biến** vào `boundVariables` nhưng **giữ nguyên màu fallback** của paint (`#FFFFFF` / `#000000`). Figma render màu fallback → sai màu, trong khi audit đọc `boundVariables` thì thấy hợp lệ.

**Bằng chứng định lượng:** script so sánh màu paint thật với giá trị biến đã resolve:

```
node 3:14  fills  variable=surface/raised  resolved=#1a1a26  paint=#ffffff   ← SAI
node 3:10  strokes variable=border/strong resolved=#55556b   paint=#000000   ← SAI
node 3:29  strokes variable=action/primary resolved=#c8ff2e paint=#000000   ← SAI
… tổng 9 node
```

Audit báo `3.6:1` cho nhãn của `3:14` — và `text/tertiary #85859C` trên `#FFFFFF` = **3.60:1** khớp chính xác. **Audit đúng; phán đoán "nền audit sai" của mình là sai.**

**Sau khi sửa:** dùng API đúng `figma.variables.setBoundVariableForPaint(base, 'color', variable)` với `base.color` = giá trị đã resolve, rồi gán lại binding stroke weight cho 4 cạnh. Kiểm tra lại toàn bộ:

```
checkedPaints: 333
brokenCount: 0
```

**Bài học:** binding màu **không đủ** — phải kiểm tra `paint.color` khớp `resolve(variable)`; và `audit_design` **không** phát hiện được lớp lỗi này vì nó chỉ đọc `boundVariables`.

---

## 3. False positive — bằng chứng

### 3.1 `primitive-bound` — audit phân biệt theo TÊN, không theo COLLECTION

> ❌ **Kết luận dưới đây SAI (§0).** Audit tra theo `scopes`: probe bind `Semantic/space/9` bị flag vì biến đó có `scopes: []`, không phải vì trùng tên. Giữ lại phần dưới làm lịch sử.

**Cách kiểm chứng:** tạo 2 frame thử nghiệm trong cùng section, cùng biến `itemSpacing = 40`:

| Probe | Binding | Tên biến | Collection | `primitive-bound` sau khi thêm |
|---|---|---|---|---|
| `PROBE-prim` | `Primitives/space/9` | `space/9` | Primitives | 242 → **243** (+1) |
| `PROBE-sem` | `Semantic/space/9` | `space/9` | Semantic | 242 → **243** (+1) |

**Kết luận:** hai binding khác collection hoàn toàn khác nhau bị audit xử lý **giống hệt nhau**. Check này tra cứu **theo tên biến** (hoặc theo segment cuối của tên) trong collection `Primitives`, nên không thể phân biệt.

**Vì sao màu không bị flag:** tên token màu của Semantic (`bg/canvas`, `text/primary`, `action/primary`, `surface/raised`, `icon/accent`…) **không trùng** tên nào ở Primitives. Còn tên token số của Semantic (`space/9`, `radius/lg`, `type/title-md`, `border/width/thin`…) **trùng** → bị flag dù đã nằm trong Semantic.

**Bằng chứng bổ sung:** mọi binding được đo bằng Plugin API đều thuộc `Semantic` (census §1). Các tên bị flag đều là tên trùng:

```
space/3, space/4, space/5, space/6, space/7, space/8, space/9, space/10, space/11
radius/sm, radius/md, radius/lg, radius/xl, radius/full
type/display-md, type/display-xl, type/title-md, type/body-lg, type/body-md, type/label-lg, type/label-md, type/label-sm
border/width/thin, border/width/strong, size/touch-target
```

**Cách xác nhận độc lập:** trong plugin này, `variable.name` là **getter-only** và **không có** `variable.rename()` / `figma.variables.renameVariable` (đã kiểm tra qua `Object.getOwnPropertyNames` của prototype). Vì vậy không thể đổi tên biến để thử "đổi tên → hết cảnh báo". Phép thử probe ở trên là cách chứng minh duy nhất không cần đổi tên.

> ⚠️ Ghi chú: hai lần thử "đổi tên" trước đó trong phiên làm việc **không có tác dụng** (gán `v.name = …` bị bỏ qua, không báo lỗi). Kết luận "rename làm mất cảnh báo" rút ra từ đó là **không đúng** — và báo cáo này ghi lại để tránh dùng nhầm về sau.

### 3.2 ~~`contrast` — audit dùng sai nền phía sau~~ → **đã bác bỏ, đây là lỗi thật**

Bản nháp đầu tiên của báo cáo phán đoán cảnh báo `contrast` là false positive với lý do "audit dò nền theo cây section". **Phán đoán đó sai.**

- Audit báo `3.6:1` cho nhãn node `3:15`.
- `text/tertiary #85859C` trên `#FFFFFF` = **3.60:1** — khớp chính xác.
- Nghĩa là nền của `3:14` **thật sự là trắng**, do paint fallback bị hỏng (§2.6), chứ không phải do audit dò sai nền.

Sau khi sửa §2.6: `audit_design` với `checks:["a11y"]` trên `3:3` → **0 issue**. Cùng kết quả cho `Cover / Forge` (`2:588`) và `Brief / Forge` (`2:611`).

**Giá trị contrast đúng sau khi sửa:**

```
text/tertiary #85859C  trên  surface/raised #1A1A26  =  4.78:1   ✓ đạt AA
text/tertiary #85859C  trên  bg/canvas     #0B0B10  =  5.45:1   ✓
text/tertiary #85859C  trên  surface/base  #12121A  =  5.17:1   ✓
```

### 3.3 `raw-stroke` / `raw-radius` — chrome mặc định của Figma

> **Đính chính (§0):** do `create_component_set` vẽ, không phải Figma. Audit giờ bỏ qua chrome này.

Cả 11 node bị flag đều là `COMPONENT_SET` và có **cùng một** giá trị do Figma tự đặt:

```
stroke: color rgb(0.592, 0.278, 1) = #9747FF, dash [10, 5]   (viền tím đứt của Figma)
cornerRadius: 5
```

Không phải nội dung do mình tạo → không thể bind token.

### 3.4 `no-autolayout` — frame vector của SVG

26/26 node bị flag đều tên `icon/*` và chỉ chứa `VECTOR` con:

```
icon/more      → VECTOR,VECTOR,VECTOR
icon/calendar  → VECTOR,VECTOR,VECTOR,VECTOR
icon/today     → VECTOR,VECTOR
icon/plus      → VECTOR,VECTOR,VECTOR
icon/profile   → VECTOR,VECTOR
icon/arrow-left→ VECTOR,VECTOR
```

Bật auto-layout cho chúng sẽ phá hình học icon. Đây là false positive đã được ghi trong `troubleshooting.md`.

### 3.5 `raw-text` — có chủ đích

3 node trong nhóm "ACCESSIBILITY TEXT SIZE" của Playground: nhãn Button 15 → **20 px**, tiêu đề List Row 18 → **24 px**, giá trị 15 → **19 px**. Đây là mô phỏng Dynamic Type, cố ý bỏ text style.

---

## 4. Lỗi API đã gặp (nguyên nhân các lần lỗi liên tiếp)

| # | Thông báo lỗi nguyên văn | Nguyên nhân | Sửa đúng |
|---|---|---|---|
| 1 | `effects: Expected "none" \| "sm" \| "md" \| "lg" \| "xl"` | Trong `create_component_set`, cây variant chỉ nhận preset effect, **không** nhận tên style | Áp effect style sau bằng `execute_code` |
| 2 | `widthMode FILL needs a parent with auto layout (layout: HORIZONTAL/VERTICAL) and no absolute.` | Root của variant không được `FILL` | Root variant = `FIXED` + width nền tảng (361/393) |
| 3 | `Cannot call with documentAccess: dynamic-page. Use node.setTextStyleIdAsync instead.` | `setTextStyleId` là API sync, bị chặn ở dynamic-page | `await node.setTextStyleIdAsync(style.id)` |
| 4 | `not a function` (khi gọi `node.setBoundVariableForPaint`) | Hàm nằm ở `figma.variables`, không phải trên node | `figma.variables.setBoundVariableForPaint(base, 'color', v)` |
| 5 | `Property "layoutSizingVertical" failed validation: Invalid option: expected one of "FIXED"\|"HUG"\|"FILL"` | `AUTO` không hợp lệ ở field này | Dùng `primaryAxisSizingMode='AUTO'` / `counterAxisSizingMode='AUTO'` để hug |
| 6 | `unsupported type in createVMObject: VARIABLE` | Trả về object `Variable` ra khỏi `execute_code` | Chỉ trả về `{id, name}` dạng plain object |
| 7 | `Cannot call createVariable with a collection id in incremental mode. Please pass the collection node instead.` | Sai **thứ tự tham số** | `createVariable(name, collectionNode, type)` — collection phải truyền **node**, không phải id |
| 8 | `cannot read property 'size' of undefined` | `collection.variables` ở bản này không có `.size` | Dùng `collection.variables.length` / map riêng |
| 9 | `v.type` trả `undefined` | Bản API này dùng `resolvedType` | `v.resolvedType` |
| 10 | `setValueForMode` không có tác dụng khi gọi trong vòng lặp | Hàm là **async**, phải `await` | `await v.setValueForMode(modeId, value)` |
| 11 | `MCP server "figma-agent" is not connected: Connection closed: MCP server process exited with code 0` | Server crash giữa phiên → MCP bị gỡ khỏi catalog của session | Plugin tự reconnect (`sock.onclose` → retry), `figma_status` xác nhận lại |
| 12 | Không có lỗi, nhưng **âm thầm sai** | `render_tree` với frame không có `layout` → tự co về kích thước con | Mọi frame chứa nội dung phải có `layout` + `width`/`height` + `widthMode`/`heightMode: "FIXED"` |
| 13 | `create_component_set` báo "nothing was left on the canvas" nhưng **thực tế còn sót** | Rollback không trọn: các set tạo trước variant lỗi vẫn còn | Luôn `get_node` section sau khi tạo và xoá bản trùng (đã xoá 1 Icon Button, 1 Set Row, 1 List Row) |
| 14 | `v.name = "..."` không đổi tên, không báo lỗi | Bản API này **không hỗ trợ đổi tên variable** (`name` getter-only, không `rename()`) | Đổi tên bằng UI Figma, hoặc tạo biến mới |
| 15 | **Không có lỗi, render sai màu** | Gán paint bằng `boundVariables` thủ công hoặc `update_nodes` với `stroke: {color:{var}}` → biến được bind đúng nhưng **màu fallback của paint giữ nguyên** (`#FFFFFF`/`#000000`), Figma render fallback | `figma.variables.setBoundVariableForPaint({type:'SOLID', color: <giá trị đã resolve>}, 'color', v)`; luôn verify `paint.color === resolve(variable)` |

---

## 5. Kế hoạch sửa skill

> ✅ **Đã thực hiện (bản đã sửa theo §0):** `troubleshooting.md` (stale-paint, đổi tên biến, các cảnh báo trông như false positive), `plugin-api-recipes.md` (scopes cho Semantic, cấm bind thủ công), `render-tree-dsl.md` §4 (sizing frame không có layout, Section, tên `{var}` trùng), `tool-reference.md` (audit kinds, rollback, chrome), `figma-ui-flow/design-system.md` (scopes Semantic). Hai dòng sai trong bảng dưới: recipe `setBoundVariableForPaint` với nền đen **không** render đen (Figma resolve vì binding mới), và quy tắc "Primitives và Semantic không được trùng tên" là không cần thiết (tên trần giờ ưu tiên Semantic).

| File | Nội dung thêm |
|---|---|
| `figma-agent-tools/references/troubleshooting.md` | Bảng lỗi #3, #4, #5, #6, #7, #8, #9, #10, #13, #14, **#15** ở §4; thêm `primitive-bound` + `raw-stroke`/`raw-radius` trên COMPONENT_SET vào mục **Audit false positives**; thêm cảnh báo *"audit không phát hiện được paint fallback sai — phải tự verify"* |
| `figma-agent-tools/references/plugin-api-recipes.md` | §3: cảnh báo `base.color` trong `setBoundVariableForPaint` **phải là giá trị đã resolve** (recipe hiện dùng `{r:0,g:0,b:0}` → sẽ render đen); thêm `primaryAxisAlignItems` ∈ MIN/CENTER/MAX/SPACE_BETWEEN, `layoutSizingVertical` ∈ FIXED\|HUG\|FILL, `createVariable(name, collectionNode, type)`, `v.resolvedType`, `await setValueForMode` |
| `figma-agent-tools/references/render-tree-dsl.md` | §4 thêm: **frame không có `layout` sẽ co về kích thước con**; root của variant không được `FILL`; `effects` trong variant tree chỉ nhận preset; `{var:"x"}` resolve **theo tên** → dùng `"Collection/name"` khi 2 collection trùng tên; Section không auto-layout → con chồng tại `(0,0)`; **`update_nodes` với `fill/stroke: {var}` có thể để lại fallback màu cũ** |
| `figma-agent-tools/references/tool-reference.md` | `create_component_set` rollback **không trọn** → luôn kiểm tra section sau khi tạo |
| `figma-ui-flow/references/design-system.md` | Quy tắc đặt tên: **Primitives và Semantic không được chia sẻ tên biến** (vì audit tra cứu theo tên); token số của Semantic nên mang giá trị literal, chỉ token **màu** mới alias sang Primitives |

---

## 6. Cách tái lập kiểm chứng

```js
// Census binding theo collection (chạy trong execute_code)
const vars = await figma.variables.getLocalVariablesAsync();
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const collName = {}; for (const c of colls) collName[c.id] = c.name;
const byId = {}; for (const v of vars) byId[v.id] = { name: v.name, coll: collName[v.variableCollectionId] };
// duyệt boundVariables của mọi node trong section → đếm theo byId[...].coll
```

```js
// Thí nghiệm chứng minh audit tra cứu theo tên
// thêm 1 frame bind vào Primitives/space/9  → primitive-bound +1
// thêm 1 frame bind vào Semantic/space/9    → primitive-bound +1   (giống hệt)
```

```js
// Verify paint fallback khớp giá trị biến (bắt lớp lỗi audit không thấy)
const resolve = (id, d = 0) => {
  const v = byId[id]; if (!v || d > 6) return null;
  const raw = v.valuesByMode[col.modes[0].modeId];
  if (raw && typeof raw === "object" && raw.type === "VARIABLE_ALIAS") return resolve(raw.id, d + 1);
  if (raw && typeof raw === "object" && raw.r !== undefined) return { r: raw.r, g: raw.g, b: raw.b };
  return null;
};
// với mỗi node: paints = n.fills hoặc n.strokes; aliases = n.boundVariables[field]
// nếu resolve(alias.id) khác paint.color → binding hỏng, phải set lại bằng
//   figma.variables.setBoundVariableForPaint({type:'SOLID', color: resolved}, 'color', v)
```

```js
// Tính contrast WCAG
const lin = c => { c/=255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const L = hex => { const n = parseInt(hex.slice(1),16);
  return 0.2126*lin((n>>16)&255) + 0.7152*lin((n>>8)&255) + 0.0722*lin(n&255); };
const ratio = (a,b) => { const l1=L(a), l2=L(b);
  return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
```

---

## 7. Trạng thái cuối

```
🎨 Foundations & Components
├── Foundations (2:153)      1440 × 5298  — swatch, type specimen, spacing, radius, elevation
├── 🧩 Components (3:3)      11 component set · 38 variant · mọi binding sản phẩm đều ở Semantic
└── 🧪 Playground (3:362)    3 nhóm test: nội dung dài · tiếng Việt · cỡ chữ accessibility

audit components : { primitive-bound: 242, raw-stroke: 11, raw-radius: 11, no-autolayout: 23, orphan-token: 5 }
audit playground : { primitive-bound: 64,  no-autolayout: 3,  raw-text: 3, orphan-token: 5 }
audit a11y (3:3 / 2:588 / 2:611) : 0 issue ✓

→ 354/367 cảnh báo là false positive có bằng chứng (§3);
→ 13 cảnh báo có chủ đích hoặc chưa đến hạn (3 raw-text mô phỏng Dynamic Type + 10 orphan-token sẽ dùng ở Stage 5);
→ 0 lỗi thật còn tồn đọng (đã sửa hết: 6 nhóm lỗi, 9 node paint hỏng, 44 binding sai collection)
```
