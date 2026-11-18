#!/usr/bin/env python3
"""
ratios.py — Turn a decode.js measurement into proportion rules and recompute them for a new slot.

Input is the JSON written by scripts/decode.js (execute_code savePath). Every value that
shapes the look (type size, blur, stroke, radius, shadow, subject coverage and overflow,
rotation ladder, with 90/180 degree flips told apart from tilts; pill radii stay h/2) is expressed as a ratio of its container, then multiplied back for the
target size. Height drives type, width drives subject coverage, the geometric mean
(sqrt(sx * sy)) drives blur, stroke, radius and shadows. Floors keep strokes >= 1 px and
text >= 11 pt.

Usage:
  python3 ratios.py visuals/<slug>/decode.json
  python3 ratios.py decode.json --target 360x200
  python3 ratios.py decode.json --target 328x110 --out visuals/<slug>/ratios.md
  python3 ratios.py decode.json --json

Exit code: 0 = ok, 1 = cannot read the input.
"""
import argparse
import json
import math
import sys

MIN_TEXT = 11
MIN_STROKE = 1


def fmt(v, d=2):
    if isinstance(v, float):
        return f"{v:.{d}f}".rstrip("0").rstrip(".")
    return str(v)


def half(v):
    return round(v * 2) / 2


def parse_target(s, w, h):
    if not s:
        return w, h
    try:
        a, b = s.lower().split("x")
        return float(a), float(b)
    except ValueError:
        sys.exit("--target must look like 360x200")


def collect(d, tw, th):
    root = d["root"]
    W, H = root["width"], root["height"]
    sx, sy = tw / W, th / H
    sg = math.sqrt(sx * sy)
    rules = {"root": {"width": W, "height": H, "aspect": round(W / H, 3), "target": [tw, th], "scale": {"x": round(sx, 3), "y": round(sy, 3), "mean": round(sg, 3)}},
             "type": [], "blur": [], "stroke": [], "radius": [], "shadow": [], "subjects": [], "rotation": []}
    for L in d["layers"]:
        if L.get("hidden"):
            continue
        x, y, w, h = L["box"]
        name = L["name"][:40]
        if L.get("text") and isinstance(L["text"].get("size"), (int, float)):
            size = L["text"]["size"]
            r = size / H
            rules["type"].append({"layer": name, "font": L["text"]["font"], "size": size, "ratioH": round(r, 3),
                                  "target": max(MIN_TEXT, round(size * sy)), "chars": L["text"]["chars"][:30]})
        for e in L.get("effects", []):
            size = max(w, h, 1)
            if e["type"] in ("LAYER_BLUR", "BACKGROUND_BLUR"):
                rules["blur"].append({"layer": name, "type": e["type"], "radius": e["radius"], "layerSize": round(size, 1),
                                      "ratioSize": round(e["radius"] / size, 3), "target": round(e["radius"] * sg, 1)})
            elif e["type"] in ("DROP_SHADOW", "INNER_SHADOW"):
                rules["shadow"].append({"layer": name, "type": e["type"], "offset": e.get("offset"), "radius": e["radius"],
                                        "color": f"{e.get('color')}@{e.get('alpha')}", "ratioH": round(e["radius"] / max(h, 1), 3),
                                        "target": {"offset": [round(v * sg, 1) for v in e.get("offset", [0, 0])], "radius": round(e["radius"] * sg, 1)}})
        if isinstance(L.get("strokeWeight"), (int, float)) and L.get("strokes"):
            sw = L["strokeWeight"]
            glass = any(s.get("type", "").startswith("GRADIENT") and any(st["alpha"] == 0 for st in s.get("stops", [])) for s in L["strokes"])
            rules["stroke"].append({"layer": name, "weight": sw, "ratioH": round(sw / max(h, 1), 3), "glass": glass,
                                    "target": max(MIN_STROKE, half(sw * sg))})
        if L.get("radius"):
            short = max(min(w, h), 1)
            pill = L["radius"] / short >= 0.5
            rules["radius"].append({"layer": name, "radius": L["radius"], "ratioShort": round(L["radius"] / short, 3),
                                    "target": "pill (h/2)" if pill else round(L["radius"] * sg)})
        is_image = any(f.get("type") == "IMAGE" for f in L.get("fills", []))
        if L["depth"] > 0 and (L.get("breaksFrame") or L.get("breaksCard") or (is_image and w * h < 0.6 * W * H)):
            ov = L["breaksCard"]["overflow"] if L.get("breaksCard") else L.get("overflow", [0, 0, 0, 0])
            rules["subjects"].append({"layer": name, "type": L["type"], "breaksFrame": bool(L.get("breaksFrame")),
                                      "breaksCard": L["breaksCard"]["card"][:24] if L.get("breaksCard") else "",
                                      "coverageW": round(w / W, 3), "coverageH": round(h / H, 3),
                                      "overflowShare": [round(v / max(w if i % 2 == 0 else h, 1), 3) for i, v in enumerate(ov)],
                                      "targetSize": [round(w * sx), round(w * sx * h / max(w, 1))], "blend": L.get("blend")})
        rot = L.get("rotation")
        if rot and L["depth"] <= 3 and abs(rot) >= 1:
            flip = abs(abs(rot) - 180) < 1 or abs(abs(rot) - 90) < 1
            rules["rotation"].append({"layer": name, "depth": L["depth"], "rotation": rot,
                                      "kind": "flip (texture variation)" if flip else "tilt", "opacity": L.get("opacity", 1)})
    return rules


def table(rows, cols):
    if not rows:
        return "_none_\n"
    out = "| " + " | ".join(cols) + " |\n|" + "---|" * len(cols) + "\n"
    for r in rows:
        out += "| " + " | ".join(fmt(r.get(c, "")) if not isinstance(r.get(c), (list, dict)) else json.dumps(r.get(c)) for c in cols) + " |\n"
    return out


def markdown(rules, d):
    R = rules["root"]
    s = d.get("summary", {})
    md = [f"# Ratios — {d['root']['name']}\n",
          f"Source {fmt(R['width'])} × {fmt(R['height'])} (aspect {R['aspect']}) → target {fmt(R['target'][0])} × {fmt(R['target'][1])} · scale x {R['scale']['x']} · y {R['scale']['y']} · mean {R['scale']['mean']}\n",
          "## Summary\n",
          f"- Layers {s.get('nodes')} · images {s.get('images')} · texts {s.get('texts')} · masks {s.get('masks')} · rotated {s.get('rotated')} · depth {s.get('depthMax')}",
          f"- Blends: {json.dumps(s.get('blends', {}))}",
          f"- Fonts: {json.dumps(s.get('fonts', {}), ensure_ascii=False)}",
          "- Palette: " + ", ".join(f"{p['color']} {round(p['share'] * 100)}%" for p in s.get("palette", [])[:10]) + "\n",
          "## Type (height drives)\n", table(rules["type"], ["layer", "font", "size", "ratioH", "target", "chars"]),
          "## Blur (blur ÷ layer size)\n", table(rules["blur"], ["layer", "type", "radius", "layerSize", "ratioSize", "target"]),
          "## Strokes (weight ÷ layer height)\n", table(rules["stroke"], ["layer", "weight", "ratioH", "glass", "target"]),
          "## Radius (radius ÷ short side)\n", table(rules["radius"], ["layer", "radius", "ratioShort", "target"]),
          "## Shadows\n", table(rules["shadow"], ["layer", "type", "offset", "radius", "color", "ratioH", "target"]),
          "## Subjects (coverage of the root, overflow beyond the root or the card it breaks ÷ own size: left, top, right, bottom)\n",
          table(rules["subjects"], ["layer", "type", "breaksFrame", "breaksCard", "coverageW", "coverageH", "overflowShare", "targetSize", "blend"]),
          "## Rotation ladder\n", table(rules["rotation"], ["layer", "depth", "rotation", "kind", "opacity"])]
    return "\n".join(md)


def main():
    ap = argparse.ArgumentParser(description="Proportion rules from decode.js output")
    ap.add_argument("decode")
    ap.add_argument("--target", help="WxH of the new slot, e.g. 360x200")
    ap.add_argument("--out", help="write markdown here")
    ap.add_argument("--json", action="store_true", help="print JSON instead of markdown")
    a = ap.parse_args()
    try:
        with open(a.decode, encoding="utf-8") as f:
            d = json.load(f)
    except (OSError, ValueError) as e:
        print(f"cannot read {a.decode}: {e}", file=sys.stderr)
        sys.exit(1)
    if "root" not in d:
        print("not a decode.js output (no root)", file=sys.stderr)
        sys.exit(1)
    tw, th = parse_target(a.target, d["root"]["width"], d["root"]["height"])
    rules = collect(d, tw, th)
    if a.json:
        print(json.dumps(rules, ensure_ascii=False, indent=1))
        return
    md = markdown(rules, d)
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"wrote {a.out}: {len(rules['type'])} type, {len(rules['blur'])} blur, {len(rules['subjects'])} subjects")
    else:
        print(md)


if __name__ == "__main__":
    main()
