# Design system: variables, styles, component

## Mục lục
1. Kiến trúc token 3 tầng
2. Tên và thang giá trị
3. Modes: theme, thương hiệu, mật độ, ngôn ngữ
4. Variables hay Styles?
5. Anatomy và cách dựng component
6. Variants và component properties
7. Bộ component tối thiểu theo nền tảng
8. Thư viện, phát hành và quản trị

---

## 1. Kiến trúc token 3 tầng

```
Primitives  (giá trị thô, 1 mode, ẩn khỏi picker)
   color/blue/600 = #2563EB      space/4 = 16      radius/3 = 12
        │ alias
Semantic    (vai trò, có modes)
   color/action/primary  → Light: blue/600 | Dark: blue/400
   color/text/primary    → Light: gray/900 | Dark: gray/50
   space/inset/md        → space/4
        │ alias (chỉ khi cần)
Component   (riêng một component, khi cần tùy biến độc lập)
   button/primary/bg     → color/action/primary
```

Luật:
- Layer **chỉ bind Semantic** (hoặc Component). Không bind Primitive trực tiếp — nếu không, dark mode và đổi thương hiệu sẽ không ăn.
- Primitive đặt `scopes = []` để không xuất hiện trong picker; Semantic đặt scope đúng loại (fill, text, stroke, gap, radius…).
- Tầng Component chỉ thêm khi một component cần đổi độc lập với hệ thống (ví dụ brand cho phép nút CTA có màu riêng). Đừng tạo sẵn cho mọi component — gấp ba khối lượng bảo trì.

## 2. Tên và thang giá trị

### 2.1 Màu Semantic tối thiểu
| Nhóm | Token |
|---|---|
| `color/bg/` | `default`, `subtle`, `inverse` |
| `color/surface/` | `default`, `raised`, `overlay`, `sunken` |
| `color/text/` | `primary`, `secondary`, `tertiary`, `disabled`, `inverse`, `on-action` |
| `color/icon/` | `primary`, `secondary`, `disabled`, `inverse` |
| `color/border/` | `default`, `subtle`, `strong`, `focus` |
| `color/action/` | `primary`, `primary-pressed`, `secondary`, `destructive`, `disabled` |
| `color/feedback/` | `success`, `warning`, `error`, `info` (+ `-subtle` cho nền) |

### 2.2 Bảng primitive màu
Mỗi màu thương hiệu và màu xám: 10–12 bậc (50, 100 … 900, 950). Tạo bằng không gian màu đồng đều cảm nhận (OKLCH) để các bậc cách đều về độ sáng — tránh bậc giữa bị "bẩn" khi nội suy RGB.

### 2.3 Typography
Thang gợi ý (mobile), mỗi bậc là một text style có tên vai trò:

| Style | Cỡ / dòng | Weight |
|---|---|---|
| `display` | 34 / 41 | Bold |
| `title/lg` | 28 / 34 | Bold |
| `title/md` | 22 / 28 | Semi Bold |
| `title/sm` | 20 / 25 | Semi Bold |
| `body/lg` | 17 / 22 | Regular |
| `body/md` | 15 / 20 | Regular |
| `label` | 13 / 18 | Medium |
| `caption` | 12 / 16 | Regular |

- iOS: bám Dynamic Type text styles (Large Title, Title 1–3, Headline, Body, Callout, Subheadline, Footnote, Caption 1–2) để dev map 1-1.
- Android: bám thang Material 3 (Display / Headline / Title / Body / Label × L/M/S).
- Web: 16px body, tỷ lệ thang 1.2–1.25.
- Line-height theo bội số 4 khi có thể. Letter-spacing âm nhẹ cho cỡ lớn, dương nhẹ cho chữ in hoa nhỏ.
- Font family, weight, size có thể là variable (string/number) để đổi theo thương hiệu hoặc mật độ.

### 2.4 Số
| Nhóm | Thang |
|---|---|
| `space/` | 0, 0.5(2), 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64) |
| `radius/` | none 0, sm 4, md 8, lg 12, xl 16, 2xl 24, full 999 |
| `border-width/` | thin 1, thick 2 |
| `size/icon/` | sm 16, md 20, lg 24 |
| `size/touch/` | min 44 (iOS) / 48 (Android) |

### 2.5 Elevation và motion
- Elevation: 3–4 bậc shadow là effect style (`elevation/1…4`); ở dark mode dùng thêm màu surface sáng dần thay vì chỉ shadow.
- Motion: `duration/fast 150ms`, `duration/base 250ms`, `duration/slow 400ms`; easing `standard`, `decelerate` (vào), `accelerate` (ra), `spring` (tương tác kéo). Lưu dạng number variable + tài liệu easing.

## 3. Modes

| Collection | Modes thường gặp |
|---|---|
| Semantic color | Light, Dark (+ High contrast nếu cần) |
| Brand | Brand A, Brand B (white-label) |
| Density / Size | Compact, Default, Comfortable |
| Content (string) | vi, en — để test độ dài chữ |

- Đặt mode ở cấp frame/Section: cả màn hình đổi theo, không cần nhân đôi màn.
- Mỗi mode phải **đủ giá trị cho mọi variable** — mode thiếu giá trị sẽ rơi về mặc định và gây lỗi khó thấy.
- Prototype có thể đổi mode khi chạy (ví dụ nút bật dark mode).

## 4. Variables hay Styles?

| Dùng **Variable** | Dùng **Style** |
|---|---|
| Màu đơn sắc, số (spacing, radius, size), chuỗi, boolean | Gradient, nhiều lớp fill, ảnh |
| Cần modes (theme, brand, density) | Effect (shadow, blur) phức tạp |
| Cần dùng trong prototype logic | Text style đầy đủ (gói nhiều thuộc tính) |
| | Layout grid |

Text style vẫn là cách tốt nhất để đóng gói typography; bên trong text style có thể bind variable cho font size/family/weight.

## 5. Anatomy và cách dựng component

### 5.1 Quy trình dựng
1. **Tìm trước** trong thư viện. Có rồi → dùng/mở rộng.
2. **Anatomy:** vẽ sơ đồ phần tử (container, leading icon, label, trailing icon, badge…), ghi phần nào bắt buộc/tùy chọn.
3. **Khung Auto Layout:** container → hàng con, đặt Hug/Fill đúng, padding/gap bind token.
4. **Bind token** cho mọi fill, stroke, text, radius, spacing.
5. **Properties** (mục 6) — ưu tiên property trước variant.
6. **Trạng thái** đủ bộ (mục 6.3).
7. **Mô tả** component: dùng khi nào, không dùng khi nào, link tài liệu.
8. **Kiểm tra trong Playground:** label dài, không icon, hai dòng, cỡ chữ lớn, dark mode, ngôn ngữ khác.

### 5.2 Nguyên tắc
- **Base component** (ẩn, tên bắt đầu `_` hoặc `.`) chứa cấu trúc chung; các biến thể công khai dùng instance của base → sửa một chỗ, ăn mọi nơi.
- Kích thước vùng chạm tối thiểu 44/48 dù phần nhìn thấy nhỏ hơn (thêm padding trong suốt hoặc frame touch target).
- Không đặt margin ngoài trong component — khoảng cách giữa component do cha quyết định.
- **Slot:** chừa vùng nội dung tùy biến bằng instance-swap property trỏ tới placeholder (hoặc tính năng slot nếu bản Figma có), thay vì tạo variant cho mọi tổ hợp nội dung.

## 6. Variants và component properties

### 6.1 Chọn loại property
| Nhu cầu | Dùng |
|---|---|
| Đổi chữ | **Text** property |
| Ẩn/hiện một phần tử | **Boolean** property |
| Đổi icon / đổi khối con | **Instance swap** property (kèm preferred values) |
| Thay đổi cấu trúc hoặc nhiều thuộc tính cùng lúc (size, style, state) | **Variant** |
| Theme, brand, density | **Variable mode** — không phải variant |

### 6.2 Tên
- Property: danh từ ngắn, Chữ Hoa Đầu: `Size`, `Style`, `State`, `Has icon`, `Label`, `Icon`.
- Value: `sm/md/lg`, `Primary/Secondary/Tertiary/Destructive`, `Default/Pressed/Disabled/Loading`.
- Thống nhất toàn thư viện: nếu Button dùng `Size=md` thì Input cũng `Size=md`, không phải `Medium`.

### 6.3 Trạng thái theo loại component
| Component | Trạng thái |
|---|---|
| Button | Default, Pressed (mobile) / Hover (web), Focused, Disabled, Loading |
| Input | Empty, Filled, Focused, Error, Disabled, Read-only (+ helper text, counter) |
| Toggle/Checkbox/Radio | Off/On (+ Indeterminate cho checkbox) × Default/Disabled |
| List row | Default, Pressed, Selected, Disabled, Swipe actions |
| Card | Default, Pressed, Skeleton/Loading |

### 6.4 Chống bùng nổ variant
Ước số variant = tích các giá trị variant. Nếu > ~50 cho một component: chuyển bớt sang boolean/instance-swap/mode, hoặc tách thành hai component.

## 7. Bộ component tối thiểu

**Chung:** Icon, Text link, Button, Icon button, Input, Text area, Select/Picker, Checkbox, Radio, Toggle, Chip/Tag, Badge, Avatar, Divider, Card, List row, Empty state, Toast/Snackbar, Dialog/Alert, Skeleton, Progress, Tooltip (web).

**iOS bổ sung:** Navigation bar (inline/large title), Tab bar, Sheet (detents), Segmented control, Search field, Context menu, Swipe actions. Dựa trên bộ Apple Design Resources khi có thể — không vẽ lại control hệ thống từ đầu.

**Android bổ sung:** Top app bar, Navigation bar/rail, FAB, Bottom sheet, Snackbar, Chips M3. Dựa trên Material 3 Design Kit.

**Web bổ sung:** Header/Nav, Sidebar, Breadcrumb, Table, Pagination, Tabs, Modal, Dropdown menu.

## 8. Thư viện, phát hành và quản trị

1. **Publish** thư viện với mô tả thay đổi rõ: thêm gì, đổi gì, có breaking change không.
2. **Phiên bản ngữ nghĩa** trong mô tả: `2.3.0` (thêm), `2.3.1` (sửa), `3.0.0` (phá vỡ — đổi tên property, xóa variant).
3. **Không đổi tên property hoặc variant value** đã phát hành mà không báo: instance ở file khác sẽ mất override.
4. **Deprecate trước khi xóa:** đổi tên thành `⚠️ Deprecated / Button old`, ghi thay thế bằng gì, giữ ít nhất một chu kỳ phát hành.
5. **Đo mức dùng** (Library analytics nếu gói có): component ít dùng → xem có thừa; nhiều detach → component thiếu linh hoạt.
6. **Một người chịu trách nhiệm** duyệt thay đổi thư viện; mọi người khác đề xuất qua branch hoặc comment.
