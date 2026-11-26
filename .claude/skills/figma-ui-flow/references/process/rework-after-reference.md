# Rework a screen after a reference screen

The user points at an existing screen (the **source**) and at one or more screens drawn in another design (the **reference**) and says "sửa lại màn này theo phong cách/mẫu ở trên", "làm giống màn X", "theo style mới". The source gives **what** the screen does; the reference gives **how** it looks and is put together. The result is a new screen that a stranger would group with the reference, never a recoloured source.

## 1. Words → scope (rule)

| The user says | Means | Level |
|---|---|---|
| "theo phong cách / theo mẫu / giống màn X / theo style vừa tạo / áp dụng thiết kế này" | layout patterns + component anatomy + imagery + density + tokens of the reference | **L3** recompose (default) |
| "giống hệt bố cục của X, chỉ thay nội dung" | the reference layout one to one | **L3**, pattern-for-pattern |
| "đổi màu / đổi tông / đổi theme / chỉ màu" | tokens only, layout kept | **L1** reskin |
| "làm mới hơn nhưng giữ bố cục" | tokens + component polish, same layout | **L2** refresh |

Why: designers say "phong cách" for the whole design language. A recolour answers a question nobody asked, and it looks finished, so the mistake is easy to miss (see `../knowledge/traps.md` §4). When the words are unclear, take L3, say so in one line, and go on; ask only when the reference and the source serve such different functions that the mapping in §2 has no match for the main block.

Levels are the same scale as `app-redesign/references/levels.md` and `ui-visual` (L1 reskin · L2 refresh · L3 recompose · L4 new in style).

## 2. Mapping table (Pass 0, written before any write)

Read both screens (`get_node{depth: 3}` + one screenshot each), then fill:

```text
Reference pattern            → Source content that fills it               Note
Header: greeting + avatar    → "Bé Linh hôm nay" + baby photo
Week date strip              → the day picker (today selected)
Hero card: text + 3D art + CTA → next nap prediction "13:10" + "Xem cách tính"   art in the reference's image style
List of cards: tick + 3D icon + title/sub + trailing chip → recent logs (sleep, feed, diaper…)
FAB bottom right             → main action "Ghi giấc ngủ" (+ secondary in a sheet)
—                            → stats row (12h40 / 7 cữ / 6.2 kg)            no pattern: fold into hero sub-line or drop, say which
```

- Every **function and piece of data** of the source has a row (nothing lost: actions, numbers, states, links).
- Every **pattern** of the reference has a row; a pattern with no source content is left out on purpose and named.
- Source blocks with no matching pattern are restyled with the nearest reference anatomy, or merged, and listed in the report.

## 3. Build

1. A **new frame next to the source** (never edit the source in place unless the user says so), named `<source name> · <reference style>`.
2. Template = the **reference screen**, not the source: clone the reference (or reuse its components/instances) and pour the source content in by the mapping. The source is content, not a template (`build-loop.md` §2).
3. Images in the reference's image style (3D icons, illustrations): generate them for the source's subjects (`asset-generator`; image MCP rule there), never reuse the source's images in another style.
4. Tokens and type of the reference; spacing and radius of the reference's components.
5. Normal numeric checks per write (`build-loop.md` §3).

## 4. Accept (before saying done)

- **Side by side:** one screenshot with reference and result next to each other. Tick every reference pattern of §2: present, or absent with the reason written.
- **Silhouette test:** at thumbnail size the result reads like the reference, and does **not** keep the source's silhouette (same block order, same block sizes = it is still L1/L2: redo).
- **Nothing lost:** every source row of §2 has a home in the result.
- Report: the mapping table (short), level used, what was folded or dropped, images generated.
