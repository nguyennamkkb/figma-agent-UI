# Kịch bản demo: Agent điều khiển FigJam (5 phút)

**Board**: `Untitled` (FigJam) → section **"Demo · Agent x FigJam"**, đọc từ trái sang phải.
**Chuẩn bị**: plugin figma-agent-UI đã Connect; zoom tới section demo; mở sẵn khung chat agent.

## Phút 0:00 – Mở đầu (chỉ vào beat-1)

> "Mọi board FigJam hôm nay đều vẽ tay: kéo sticky, nối mũi tên, kẻ bảng. Agent AI đứng ngoài vì plugin của nó chỉ biết file Design. Hôm nay tôi cho nó vào thẳng board này."

## Phút 0:45 – Câu hỏi (chỉ vào beat-2, hình thoi)

> "Câu hỏi duy nhất: agent có vẽ trực tiếp được không — mà vẫn an toàn cho board đang live?"

## Phút 1:15 – Giải pháp (chỉ vào beat-3 + 3 sticky)

> "Một lệnh duy nhất vẽ cả cụm: sticky brainstorm, shape nối connector thành flow, table tổng hợp, code snippet. Mỗi lệnh là một lần undo — sai thì Cmd+Z, không bao giờ để rác."

## Phút 2:30 – CAO TRÀO: làm live theo yêu cầu khán phòng

Nhờ một người hô bất kỳ: một ý tưởng sticky + một bước flow. Gõ đúng 1 lệnh `render_tree`, cả phòng nhìn board tự vẽ trong vài giây. Ví dụ:

```json
{ "type": "section", "name": "Live", "children": [
  { "type": "sticky", "text": "<ý tưởng vừa hô>", "color": "#FFE066" },
  { "type": "shape", "shape": "ROUNDED_RECTANGLE", "text": "<bước flow>" },
  { "type": "connector", "from": "Live/<shape>", "to": "Live/<shape2>" }
]}
```

## Phút 4:00 – Bằng chứng (chỉ vào table kết quả)

> "Đã test 10 mục: render 1 lệnh ra 8 node, render lỗi board sạch 0 node, tool Design-only tự từ chối, 2 file mở cùng lúc hỏi rõ không đoán bừa."

## Phút 4:30 – Chốt (chỉ vào chevron xanh)

> "Từ nay board workshop dựng trong 1 câu chat. Mời hỏi đáp — mọi câu hỏi khó, tôi bắt agent làm live luôn."

**Tip sân khấu**: để bảng kết quả (table) hiện suốt lúc Q&A; mọi demo lỗi đều là tính năng (rollback sạch cũng là điều đáng khoe).
