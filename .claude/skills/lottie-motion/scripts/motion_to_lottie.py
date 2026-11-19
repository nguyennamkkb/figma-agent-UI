"""Convert a compact motion specification to Lottie JSON.

Usage:
  python3 scripts/motion_to_lottie.py examples/payment-success.spec.json examples/payment-success.lottie.json
  python3 scripts/motion_to_lottie.py --check examples/payment-success.lottie.json

Run from the skill folder (`.claude/skills/lottie-motion`).

The input format is intentionally smaller than Lottie. It covers the motion
patterns used by the mobile motion playbook: opacity, translation, scale,
rotation and fill colour on rectangles, ellipses and text, plus image layers
with transforms and opacity.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys

EASINGS = {
    "linear": (0.0, 0.0, 1.0, 1.0),
    "ease_in": (0.42, 0.0, 1.0, 1.0),
    "ease_out": (0.0, 0.0, 0.58, 1.0),
    "ease_in_out": (0.42, 0.0, 0.58, 1.0),
    "standard": (0.2, 0.0, 0.0, 1.0),
    "emphasized": (0.05, 0.7, 0.1, 1.0),
    "spring": (0.34, 1.56, 0.64, 1.0),
}


def parse_hex(value):
    text = value.strip().lstrip("#")
    if len(text) == 3:
        text = "".join(ch * 2 for ch in text)
    if len(text) == 6:
        text += "FF"
    if len(text) != 8:
        raise ValueError(f"màu không hợp lệ: {value}")
    r, g, b, a = (int(text[i : i + 2], 16) / 255 for i in (0, 2, 4, 6))
    return [round(r, 5), round(g, 5), round(b, 5), round(a, 5)]


def bezier(easing):
    if easing is None:
        easing = "linear"
    if isinstance(easing, (list, tuple)):
        if len(easing) != 4:
            raise ValueError(f"cubic-bezier cần 4 số: {easing}")
        return tuple(float(x) for x in easing)
    if easing not in EASINGS:
        raise ValueError(f"easing chưa hỗ trợ: {easing}")
    return EASINGS[easing]


def ms_to_frame(ms, fps):
    return int(round(float(ms) / 1000.0 * fps))


def clean_points(points, duration_ms):
    ordered = sorted(
        ({"at": max(0.0, min(float(p["at"]), duration_ms)), **p} for p in points),
        key=lambda p: p["at"],
    )
    if not ordered:
        return []
    unique = []
    for point in ordered:
        if unique and point["at"] == unique[-1]["at"]:
            unique[-1] = point
        else:
            unique.append(point)
    return unique


def keyframes(points, fps, duration_ms, transform, scalar=False):
    points = clean_points(points, duration_ms)
    if not points:
        return None
    if len(points) == 1:
        value = transform(points[0]["value"])
        return {"a": 0, "k": value[0] if scalar else value}
    frames = []
    for index, point in enumerate(points):
        frame = {"t": ms_to_frame(point["at"], fps), "s": transform(point["value"])}
        if index + 1 < len(points):
            following = points[index + 1]
            frame["e"] = transform(following["value"])
            x1, y1, x2, y2 = bezier(point.get("easing"))
            frame["o"] = {"x": [round(x1, 5)], "y": [round(y1, 5)]}
            frame["i"] = {"x": [round(x2, 5)], "y": [round(y2, 5)]}
        frames.append(frame)
    seen = {}
    for frame in frames:
        seen[frame["t"]] = frame
    return {"a": 1, "k": [seen[t] for t in sorted(seen)]}


def sample(points, at, fallback):
    points = clean_points(points, float("inf"))
    if not points:
        return fallback
    if at <= points[0]["at"]:
        return points[0]["value"]
    if at >= points[-1]["at"]:
        return points[-1]["value"]
    for index in range(len(points) - 1):
        left, right = points[index], points[index + 1]
        if left["at"] <= at <= right["at"]:
            span = right["at"] - left["at"]
            ratio = 0.0 if span == 0 else (at - left["at"]) / span
            return left["value"] + (right["value"] - left["value"]) * ratio
    return points[-1]["value"]


def track_times(layer):
    times = set()
    for name in ("translate_x", "translate_y", "position"):
        for point in layer.get(name, []):
            times.add(float(point["at"]))
    return sorted(times)


def easing_at(layer, at):
    for name in ("translate_x", "translate_y", "position"):
        for point in layer.get(name, []):
            if float(point["at"]) == at:
                return point.get("easing", "linear")
    return "linear"


def position_prop(layer, fps, duration_ms, base_x, base_y):
    if layer.get("position"):
        return keyframes(
            layer["position"],
            fps,
            duration_ms,
            lambda value: [float(value[0]), float(value[1]), 0],
        )
    times = track_times(layer)
    if not times:
        return {"a": 0, "k": [round(base_x, 3), round(base_y, 3), 0]}
    points = []
    for at in times:
        x = sample(layer.get("translate_x", []), at, 0.0)
        y = sample(layer.get("translate_y", []), at, 0.0)
        points.append(
            {
                "at": at,
                "value": [base_x + x, base_y + y],
                "easing": easing_at(layer, at),
            }
        )
    return keyframes(
        points,
        fps,
        duration_ms,
        lambda value: [round(float(value[0]), 3), round(float(value[1]), 3), 0],
    )


def opacity_prop(layer, fps, duration_ms):
    built = keyframes(
        layer.get("opacity", []),
        fps,
        duration_ms,
        lambda value: [round(float(value) * 100.0, 3)],
        scalar=True,
    )
    return built if built else {"a": 0, "k": 100}


def scale_prop(layer, fps, duration_ms):
    if layer.get("scale"):
        return keyframes(
            layer["scale"],
            fps,
            duration_ms,
            lambda value: [
                round(float(value) * 100.0, 3),
                round(float(value) * 100.0, 3),
                100,
            ],
        )
    if layer.get("scale_x") or layer.get("scale_y"):
        times = sorted(
            {
                float(p["at"])
                for p in layer.get("scale_x", []) + layer.get("scale_y", [])
            }
        )
        points = []
        for at in times:
            x = sample(layer.get("scale_x", []), at, 1.0)
            y = sample(layer.get("scale_y", []), at, 1.0)
            points.append(
                {
                    "at": at,
                    "value": [x, y],
                    "easing": (
                        layer.get("scale_x", [{}])[0].get("easing", "linear")
                        if layer.get("scale_x")
                        else layer.get("scale_y", [{}])[0].get("easing", "linear")
                    ),
                }
            )
        return keyframes(
            points,
            fps,
            duration_ms,
            lambda value: [
                round(float(value[0]) * 100.0, 3),
                round(float(value[1]) * 100.0, 3),
                100,
            ],
        )
    return {"a": 0, "k": [100, 100, 100]}


def rotation_prop(layer, fps, duration_ms):
    rotation = layer.get("rotation")
    if isinstance(rotation, (int, float)):
        return {"a": 0, "k": round(float(rotation), 3)}
    built = keyframes(
        rotation or [],
        fps,
        duration_ms,
        lambda value: [round(float(value), 3)],
        scalar=True,
    )
    return built if built else {"a": 0, "k": 0}


def color_value(value):
    if isinstance(value, str):
        return parse_hex(value)
    if isinstance(value, (list, tuple)) and len(value) == 4:
        return [round(float(x), 5) for x in value]
    raise ValueError(f"màu không hợp lệ: {value}")


def fill_prop(layer, fps, duration_ms):
    fill = layer.get("fill", "#000000")
    if isinstance(fill, list):
        built = keyframes(fill, fps, duration_ms, color_value)
        return built if built else {"a": 0, "k": color_value(fill[0])}
    return {"a": 0, "k": color_value(fill)}


def transform_shape():
    return {
        "ty": "tr",
        "p": {"a": 0, "k": [0, 0]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 0, "k": [100, 100]},
        "r": {"a": 0, "k": 0},
        "o": {"a": 0, "k": 100},
        "sk": {"a": 0, "k": 0},
        "sa": {"a": 0, "k": 0},
        "nm": "Transform",
    }


def shape_layer(layer, index, fps, duration_ms):
    width = float(layer["width"])
    height = float(layer["height"])
    x = float(layer["x"])
    y = float(layer["y"])
    kind = layer["type"]
    if kind == "rect":
        shape = {
            "ty": "rc",
            "d": 1,
            "s": {"a": 0, "k": [width, height]},
            "p": {"a": 0, "k": [0, 0]},
            "r": {"a": 0, "k": float(layer.get("radius", 0))},
            "nm": "Rectangle",
        }
    else:
        shape = {
            "ty": "el",
            "d": 1,
            "s": {"a": 0, "k": [width, height]},
            "p": {"a": 0, "k": [0, 0]},
            "nm": "Ellipse",
        }
    return {
        "ddd": 0,
        "ind": index,
        "ty": 4,
        "nm": layer.get("name", f"Shape {index}"),
        "sr": 1,
        "ks": {
            "o": opacity_prop(layer, fps, duration_ms),
            "r": rotation_prop(layer, fps, duration_ms),
            "p": position_prop(layer, fps, duration_ms, x + width / 2, y + height / 2),
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": scale_prop(layer, fps, duration_ms),
        },
        "ao": 0,
        "shapes": [
            shape,
            {
                "ty": "fl",
                "c": fill_prop(layer, fps, duration_ms),
                "o": {"a": 0, "k": 100},
                "r": 1,
                "nm": "Fill",
            },
            transform_shape(),
        ],
        "ip": 0,
        "op": ms_to_frame(duration_ms, fps),
        "st": 0,
        "bm": 0,
    }


def image_layer(layer, index, fps, duration_ms, assets, base_dir):
    width = float(layer["width"])
    height = float(layer["height"])
    x = float(layer["x"])
    y = float(layer["y"])
    asset_id = f"image_{index}"
    source = layer["src"]
    path = source if os.path.isabs(source) else os.path.join(base_dir, source)
    embed = layer.get("embed", True)
    if embed:
        with open(path, "rb") as handle:
            payload = base64.b64encode(handle.read()).decode("ascii")
        mime = mimetypes.guess_type(path)[0] or "image/png"
        asset = {
            "id": asset_id,
            "w": int(width),
            "h": int(height),
            "u": "",
            "p": f"data:{mime};base64,{payload}",
            "e": 1,
        }
    else:
        asset = {
            "id": asset_id,
            "w": int(width),
            "h": int(height),
            "u": layer.get("u", "images/"),
            "p": os.path.basename(path),
            "e": 0,
        }
    assets.append(asset)
    return {
        "ddd": 0,
        "ind": index,
        "ty": 2,
        "nm": layer.get("name", f"Image {index}"),
        "refId": asset_id,
        "sr": 1,
        "ks": {
            "o": opacity_prop(layer, fps, duration_ms),
            "r": rotation_prop(layer, fps, duration_ms),
            "p": position_prop(layer, fps, duration_ms, x + width / 2, y + height / 2),
            "a": {"a": 0, "k": [width / 2, height / 2, 0]},
            "s": scale_prop(layer, fps, duration_ms),
        },
        "ao": 0,
        "ip": 0,
        "op": ms_to_frame(duration_ms, fps),
        "st": 0,
        "bm": 0,
    }


def text_layer(layer, index, fps, duration_ms):
    width = float(layer.get("width", 0))
    height = float(layer.get("height", 0))
    x = float(layer["x"])
    y = float(layer["y"])
    size = float(layer.get("font_size", 16))
    font = layer.get("font", "Inter")
    color = color_value(layer.get("fill", "#000000"))
    document = {
        "s": size,
        "f": font,
        "t": layer.get("text", ""),
        "j": 0,
        "tr": 0,
        "lh": round(size * 1.2, 3),
        "ls": 0,
        "fc": color[:3],
    }
    anchor_x = width / 2 if width else 0
    anchor_y = height / 2 if height else 0
    return {
        "ddd": 0,
        "ind": index,
        "ty": 5,
        "nm": layer.get("name", f"Text {index}"),
        "sr": 1,
        "ks": {
            "o": opacity_prop(layer, fps, duration_ms),
            "r": rotation_prop(layer, fps, duration_ms),
            "p": position_prop(layer, fps, duration_ms, x + anchor_x, y + size + anchor_y),
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": scale_prop(layer, fps, duration_ms),
        },
        "ao": 0,
        "t": {
            "d": {"k": [{"t": 0, "s": document}]},
            "p": {},
            "m": {"g": 1, "a": {"a": 0, "k": [0, 0]}},
            "a": [],
        },
        "ip": 0,
        "op": ms_to_frame(duration_ms, fps),
        "st": 0,
        "bm": 0,
    }


def build(spec, base_dir="."):
    width = int(spec["width"])
    height = int(spec["height"])
    fps = float(spec.get("fps", 60))
    duration_ms = float(spec["duration_ms"])
    if width <= 0 or height <= 0:
        raise ValueError("width và height phải > 0")
    if fps <= 0:
        raise ValueError("fps phải > 0")
    if duration_ms <= 0:
        raise ValueError("duration_ms phải > 0")
    layers = spec.get("layers") or []
    if not layers:
        raise ValueError("cần ít nhất một layer")
    fonts = {}
    assets = []
    output = []
    for index, layer in enumerate(layers, start=1):
        kind = layer.get("type")
        if kind in ("rect", "ellipse"):
            output.append(shape_layer(layer, index, fps, duration_ms))
        elif kind == "image":
            output.append(image_layer(layer, index, fps, duration_ms, assets, base_dir))
        elif kind == "text":
            font = layer.get("font", "Inter")
            fonts[font] = {
                "fName": font,
                "fFamily": font,
                "fStyle": "Regular",
                "ascent": 75,
            }
            output.append(text_layer(layer, index, fps, duration_ms))
        else:
            raise ValueError(f"layer type chưa hỗ trợ: {kind}")
    output.reverse()
    frames = ms_to_frame(duration_ms, fps)
    doc = {
        "v": "5.12.2",
        "fr": fps,
        "ip": 0,
        "op": max(1, frames),
        "w": width,
        "h": height,
        "nm": spec.get("name", "Motion"),
        "ddd": 0,
        "assets": assets,
        "fonts": {"list": list(fonts.values())},
        "layers": output,
    }
    if spec.get("background"):
        doc["bg"] = parse_hex(spec["background"])
    return doc


def all_keyframes(value):
    found = []
    if isinstance(value, dict):
        if value.get("a") == 1 and isinstance(value.get("k"), list):
            for frame in value["k"]:
                if isinstance(frame, dict) and "t" in frame:
                    found.append(frame["t"])
        for child in value.values():
            found.extend(all_keyframes(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(all_keyframes(child))
    return found


def validate(doc):
    errors = []
    for key in ("v", "fr", "ip", "op", "w", "h", "layers"):
        if key not in doc:
            errors.append(f"thiếu field {key}")
    if errors:
        return errors
    if doc["op"] <= doc["ip"]:
        errors.append("op phải lớn hơn ip")
    if doc["fr"] <= 0:
        errors.append("fr phải > 0")
    for layer in doc["layers"]:
        label = layer.get("nm", layer.get("ind"))
        if "ks" not in layer:
            errors.append(f"{label}: thiếu ks")
        if layer.get("op", 0) <= layer.get("ip", 0):
            errors.append(f"{label}: op <= ip")
        for frame in all_keyframes(layer):
            if frame < doc["ip"] or frame > doc["op"]:
                errors.append(f"{label}: keyframe {frame} ngoài {doc['ip']}..{doc['op']}")
    if any(layer.get("ty") == 5 for layer in doc["layers"]) and not doc.get("fonts"):
        errors.append("có text layer nhưng thiếu fonts")
    return errors


def summary(doc):
    keyframes = sum(len(all_keyframes(layer)) for layer in doc["layers"])
    return {
        "name": doc.get("nm"),
        "size": [doc.get("w"), doc.get("h")],
        "fps": doc.get("fr"),
        "frames": [doc.get("ip"), doc.get("op")],
        "duration_ms": round(float(doc.get("op", 0)) / float(doc.get("fr", 1)) * 1000, 2),
        "layers": len(doc.get("layers", [])),
        "keyframes": keyframes,
        "fonts": [f.get("fFamily") for f in doc.get("fonts", {}).get("list", [])],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output", nargs="?")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--minify", action="store_true")
    args = parser.parse_args()
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    if args.check:
        errors = validate(data)
        print(json.dumps({"valid": not errors, "errors": errors, "summary": summary(data)}, ensure_ascii=False, indent=2))
        return 0 if not errors else 1
    if not args.output:
        raise SystemExit("cần output path khi không dùng --check")
    doc = build(data, os.path.dirname(os.path.abspath(args.input)))
    errors = validate(doc)
    if errors:
        raise SystemExit("\n".join(errors))
    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(doc, handle, ensure_ascii=False, separators=(",", ":") if args.minify else None, indent=None if args.minify else 2)
        handle.write("\n")
    print(json.dumps({"valid": True, "output": args.output, "summary": summary(doc)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
