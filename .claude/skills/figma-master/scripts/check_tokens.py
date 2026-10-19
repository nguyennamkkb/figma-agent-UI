#!/usr/bin/env python3
"""
check_tokens.py — Kiểm tra file design token JSON trước khi nhập vào Figma hoặc chuyển cho dev.

Định dạng hỗ trợ: W3C Design Tokens (DTCG) — token là object có "$value" (và "$type" tuỳ chọn),
nhóm lồng nhau, alias dạng "{color.blue.600}". Modes khai báo trong
"$extensions": {"modes": {"light": <value>, "dark": <value>}}.

Kiểm tra:
  1. Tên: mỗi đoạn tên chữ thường, số, gạch ngang (kebab-case).
  2. Alias: trỏ tới token tồn tại, không vòng lặp.
  3. Tầng: nhóm gốc tên chứa "primitive" phải là giá trị thô;
     nhóm gốc tên chứa "semantic" nên là alias (cảnh báo nếu là giá trị thô).
  4. Spacing/radius: giá trị số thuộc lưới 4 (cho phép 0, 1, 2, 999).
  5. Tương phản WCAG cho các cặp tự suy ra (text/icon/on-action với nền) và cặp khai báo qua --pair.

Dùng:
  python3 check_tokens.py tokens.json
  python3 check_tokens.py tokens.json --pair color.text.primary color.bg.default 4.5
  python3 check_tokens.py tokens.json --json      # xuất kết quả dạng JSON

Mã thoát: 0 = không lỗi (có thể có cảnh báo), 1 = có lỗi.
"""
import argparse
import json
import re
import sys

NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
ALIAS_RE = re.compile(r"^\{([^{}]+)\}$")
HEX_RE = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")


def flatten(node, path, out):
    """Trả về dict: 'a.b.c' -> token object."""
    if isinstance(node, dict) and "$value" in node:
        out[".".join(path)] = node
        return
    if isinstance(node, dict):
        for k, v in node.items():
            if k.startswith("$"):
                continue
            flatten(v, path + [k], out)


def mode_values(token):
    """Trả về dict mode -> value. Không có modes thì {'default': $value}."""
    modes = (token.get("$extensions") or {}).get("modes")
    if isinstance(modes, dict) and modes:
        return dict(modes)
    return {"default": token["$value"]}


def resolve(name, mode, tokens, stack=None):
    stack = stack or []
    if name in stack:
        raise ValueError("vòng lặp alias: " + " → ".join(stack + [name]))
    if name not in tokens:
        raise KeyError(name)
    vals = mode_values(tokens[name])
    v = vals.get(mode, vals.get("default", tokens[name]["$value"]))
    m = ALIAS_RE.match(v) if isinstance(v, str) else None
    if m:
        return resolve(m.group(1), mode, tokens, stack + [name])
    return v


def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def luminance(rgb):
    def ch(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = luminance(hex_to_rgb(a)), luminance(hex_to_rgb(b))
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def tier_of(name):
    root = name.split(".")[0].lower()
    if "primitive" in root:
        return "primitive"
    if "semantic" in root:
        return "semantic"
    return None


def strip_tier(name):
    parts = name.split(".")
    return ".".join(parts[1:]) if tier_of(name) else name


def auto_pairs(tokens):
    """Suy ra cặp (fg, bg, ngưỡng) từ tên ngữ nghĩa."""
    by_short = {strip_tier(n): n for n in tokens}
    bgs = [by_short[s] for s in ("color.bg.default", "color.surface.default", "color.surface.raised") if s in by_short]
    pairs = []
    for short, full in by_short.items():
        if short.startswith("color.text.") and not short.endswith(("disabled", "inverse", "on-action")):
            pairs += [(full, bg, 4.5) for bg in bgs]
        elif short.startswith("color.icon.") and not short.endswith(("disabled", "inverse")):
            pairs += [(full, bg, 3.0) for bg in bgs]
        elif short in ("color.border.strong", "color.border.focus"):
            pairs += [(full, bg, 3.0) for bg in bgs]
    on_action = by_short.get("color.text.on-action")
    for s in ("color.action.primary", "color.action.destructive"):
        if on_action and s in by_short:
            pairs.append((on_action, by_short[s], 4.5))
    return pairs


def main():
    ap = argparse.ArgumentParser(description="Kiểm tra design token JSON (DTCG).")
    ap.add_argument("file")
    ap.add_argument("--pair", nargs=3, action="append", metavar=("FG", "BG", "MIN"),
                    help="cặp kiểm tra tương phản thêm, ví dụ color.text.primary color.bg.default 4.5")
    ap.add_argument("--json", action="store_true", help="xuất kết quả JSON")
    args = ap.parse_args()

    with open(args.file, encoding="utf-8") as f:
        data = json.load(f)

    tokens = {}
    flatten(data, [], tokens)
    errors, warnings, passes = [], [], []

    if not tokens:
        errors.append("Không tìm thấy token nào có \"$value\".")

    all_modes = set()
    for t in tokens.values():
        all_modes.update(mode_values(t).keys())

    for name, tok in tokens.items():
        # 1. Tên
        bad = [p for p in name.split(".") if not NAME_RE.match(p)]
        if bad:
            errors.append(f"[tên] {name}: đoạn không hợp lệ {bad} (dùng chữ thường-gạch-ngang)")

        vals = mode_values(tok)
        tier = tier_of(name)
        for mode, v in vals.items():
            is_alias = isinstance(v, str) and ALIAS_RE.match(v)
            # 2. Alias
            if is_alias:
                try:
                    resolve(name, mode, tokens)
                except KeyError as e:
                    errors.append(f"[alias] {name} ({mode}): trỏ tới token không tồn tại {e}")
                    continue
                except ValueError as e:
                    errors.append(f"[alias] {name} ({mode}): {e}")
                    continue
            # 3. Tầng
            if tier == "primitive" and is_alias:
                errors.append(f"[tầng] {name}: primitive không được là alias")
            if tier == "semantic" and not is_alias:
                warnings.append(f"[tầng] {name} ({mode}): semantic nên alias tới primitive, đang là giá trị thô {v!r}")

        # Mode thiếu
        if len(vals) > 1 or "default" not in vals:
            missing = (all_modes - {"default"}) - set(vals)
            if missing:
                warnings.append(f"[mode] {name}: thiếu giá trị cho mode {sorted(missing)}")

        # 4. Lưới 4
        short = strip_tier(name)
        if short.split(".")[0] in ("space", "spacing", "radius"):
            for mode in vals:
                try:
                    v = resolve(name, mode, tokens)
                except (KeyError, ValueError):
                    continue
                num = None
                if isinstance(v, (int, float)):
                    num = v
                elif isinstance(v, str):
                    m = re.match(r"^(-?\d+(\.\d+)?)(px)?$", v.strip())
                    if m:
                        num = float(m.group(1))
                if num is not None and num not in (0, 1, 2, 999) and num % 4 != 0:
                    warnings.append(f"[lưới] {name} = {v}: không thuộc lưới 4")

    # 5. Tương phản
    pairs = auto_pairs(tokens)
    for fg, bg, mn in (args.pair or []):
        pairs.append((fg, bg, float(mn)))
    modes_to_check = sorted(all_modes - {"default"}) or ["default"]
    seen = set()
    for fg, bg, mn in pairs:
        for mode in modes_to_check:
            key = (fg, bg, mode)
            if key in seen:
                continue
            seen.add(key)
            try:
                a, b = resolve(fg, mode, tokens), resolve(bg, mode, tokens)
            except (KeyError, ValueError) as e:
                errors.append(f"[tương phản] {fg} / {bg} ({mode}): không giải được token {e}")
                continue
            if not (isinstance(a, str) and HEX_RE.match(a) and isinstance(b, str) and HEX_RE.match(b)):
                warnings.append(f"[tương phản] {fg} / {bg} ({mode}): bỏ qua, chỉ hỗ trợ hex ({a!r}, {b!r})")
                continue
            r = contrast(a, b)
            line = f"{fg} trên {bg} ({mode}): {r:.2f}:1 (cần ≥ {mn})"
            (passes if r >= mn else errors).append(("[tương phản] " if r < mn else "") + line)

    result = {"tokens": len(tokens), "modes": sorted(all_modes),
              "errors": errors, "warnings": warnings, "contrast_pass": passes}
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Token: {len(tokens)} · Modes: {', '.join(sorted(all_modes))}")
        print(f"\nLỖI ({len(errors)}):")
        for e in errors:
            print("  ✗", e)
        print(f"\nCẢNH BÁO ({len(warnings)}):")
        for w in warnings:
            print("  !", w)
        print(f"\nTƯƠNG PHẢN ĐẠT ({len(passes)}):")
        for p in passes:
            print("  ✓", p)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
