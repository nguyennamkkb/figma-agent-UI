"""Audit a Lottie JSON file before it reaches a runtime.

Usage:
  python3 scripts/lottie_audit.py examples/payment-success.lottie.json
  python3 scripts/lottie_audit.py examples/payment-success.lottie.json --markdown
  python3 scripts/lottie_audit.py file.json --max-layers 80 --max-keyframes 400 --max-size-kb 300

The audit is read-only. Blockers exit with code 1; warnings do not.
"""
import argparse
import json
import os
import sys

LAYER_TYPES = {
    0: "precomp",
    1: "solid",
    2: "image",
    3: "null",
    4: "shape",
    5: "text",
    6: "audio",
    7: "video",
}

LIMITS = {
    "layers": 100,
    "keyframes": 500,
    "size_kb": 500,
    "fps": 60,
    "duration_s": 10,
    "image_px": 2048,
    "keyframes_per_layer": 60,
}


def walk(node, path, on_dict, on_list=None):
    if isinstance(node, dict):
        on_dict(node, path)
        for key, value in node.items():
            walk(value, f"{path}.{key}", on_dict, on_list)
    elif isinstance(node, list):
        if on_list:
            on_list(node, path)
        for index, value in enumerate(node):
            walk(value, f"{path}[{index}]", on_dict, on_list)


def keyframe_groups(layer):
    groups = []

    def on_dict(node, path):
        if node.get("a") == 1 and isinstance(node.get("k"), list):
            frames = [frame for frame in node["k"] if isinstance(frame, dict) and "t" in frame]
            if frames:
                groups.append((path, frames))

    walk(layer, layer.get("nm", "layer"), on_dict)
    return groups


def shape_hits(layer):
    hits = {
        "trim_paths": 0,
        "merge_paths": 0,
        "gradients": 0,
        "angular_gradients": 0,
        "repeaters": 0,
        "path_points": 0,
    }

    def on_dict(node, path):
        kind = node.get("ty")
        if kind == "tm":
            hits["trim_paths"] += 1
        elif kind == "mm":
            hits["merge_paths"] += 1
        elif kind == "rp":
            hits["repeaters"] += 1
        elif kind in ("gf", "gs"):
            hits["gradients"] += 1
            if node.get("t") == 3:
                hits["angular_gradients"] += 1
        elif kind == "sh":
            data = node.get("ks", {}).get("k")
            if isinstance(data, dict):
                data = data.get("i") or data.get("v")
            if isinstance(data, list):
                hits["path_points"] += len(data)

    walk(layer, layer.get("nm", "layer"), on_dict)
    return hits


def layer_frames(layer):
    groups = keyframe_groups(layer)
    frames = [frame.get("t") for _, group in groups for frame in group]
    return frames, groups


def audit(doc, file_path, limits):
    blockers = []
    warnings = []
    recommendations = []
    features = {
        "layers_by_type": {},
        "masks": 0,
        "mattes": 0,
        "effects": 0,
        "expressions": 0,
        "merge_paths": 0,
        "trim_paths": 0,
        "gradients": 0,
        "angular_gradients": 0,
        "repeaters": 0,
        "images": 0,
        "precomps": 0,
        "text": 0,
        "three_d": 0,
        "blend_modes": 0,
        "time_remap": 0,
        "hidden": 0,
        "path_points": 0,
    }

    if not isinstance(doc, dict):
        return finish({}, file_path, ["root phải là JSON object"], warnings, recommendations, features, limits, 0)

    for field in ("v", "fr", "ip", "op", "w", "h", "layers"):
        if field not in doc:
            blockers.append(f"thiếu field bắt buộc: {field}")
    if blockers:
        return finish(doc, file_path, blockers, warnings, recommendations, features, limits, 0)
    if not isinstance(doc.get("layers"), list):
        blockers.append("layers phải là array")
        return finish(doc, file_path, blockers, warnings, recommendations, features, limits, 0)

    fps = doc.get("fr")
    ip = doc.get("ip")
    op = doc.get("op")
    if not isinstance(fps, (int, float)) or fps <= 0:
        blockers.append("fr phải là số > 0")
    if not isinstance(ip, (int, float)) or not isinstance(op, (int, float)) or op <= ip:
        blockers.append("op phải lớn hơn ip")
    if doc.get("w", 0) <= 0 or doc.get("h", 0) <= 0:
        blockers.append("w và h phải > 0")
    if isinstance(fps, (int, float)) and fps > 0 and op > ip:
        duration_s = (op - ip) / fps
    else:
        duration_s = 0
    size_kb = round(os.path.getsize(file_path) / 1024, 2) if os.path.exists(file_path) else 0
    if size_kb > limits["size_kb"]:
        blockers.append(f"file {size_kb} KB vượt ngân sách {limits['size_kb']} KB")
        recommendations.append("Xoá asset/layer thừa, giảm keyframe, minify JSON hoặc dùng dotLottie.")

    layers = doc.get("layers") or []
    if len(layers) > limits["layers"]:
        warnings.append(f"{len(layers)} layer vượt ngưỡng {limits['layers']}")
        recommendations.append("Gộp shape cùng nhóm vào precomp hoặc giảm layer.")
    if duration_s > limits["duration_s"]:
        warnings.append(f"duration {duration_s:.2f}s vượt ngưỡng {limits['duration_s']}s")
        recommendations.append("Cắt ngắn hoặc chia asset; animation dài làm tăng pin và CPU.")
    if isinstance(fps, (int, float)) and fps > limits["fps"]:
        warnings.append(f"fps {fps} vượt ngưỡng {limits['fps']}")
        recommendations.append("Dùng 30 hoặc 60 fps; tránh fps lẻ.")
    if isinstance(fps, (int, float)) and fps > 0 and abs(fps - round(fps)) > 0.001:
        warnings.append(f"fps không nguyên: {fps}")
        recommendations.append("Làm tròn fps về 30 hoặc 60 để tránh sai frame.")

    fonts = doc.get("fonts", {}).get("list", [])
    font_names = {font.get("fName") for font in fonts if isinstance(font, dict)}
    assets = doc.get("assets") or []
    image_assets = [asset for asset in assets if isinstance(asset, dict) and asset.get("p")]
    if image_assets:
        features["images"] += len(image_assets)
        for asset in image_assets:
            if not asset.get("u") and not str(asset.get("p", "")).startswith("data:"):
                warnings.append(f"image asset {asset.get('id')} không có thư mục u; runtime có thể không tìm thấy ảnh")
            width, height = asset.get("w", 0), asset.get("h", 0)
            if width > limits["image_px"] or height > limits["image_px"]:
                warnings.append(f"image {asset.get('id')} {width}×{height} vượt {limits['image_px']} px")
                recommendations.append("Nén ảnh hoặc dùng dotLottie để đóng gói asset.")
    precomp_assets = [asset for asset in assets if isinstance(asset, dict) and asset.get("layers")]
    features["precomps"] += len(precomp_assets)

    total_keyframes = 0
    for index, layer in enumerate(layers):
        if not isinstance(layer, dict):
            blockers.append(f"layer {index} không phải object")
            continue
        kind = layer.get("ty")
        features["layers_by_type"][LAYER_TYPES.get(kind, str(kind))] = features["layers_by_type"].get(LAYER_TYPES.get(kind, str(kind)), 0) + 1
        if kind not in LAYER_TYPES:
            warnings.append(f"layer {layer.get('nm', index)} có type lạ: {kind}")
        if layer.get("ddd") == 1:
            features["three_d"] += 1
            blockers.append(f"layer {layer.get('nm', index)} là 3D; Lottie không hỗ trợ 3D")
        if layer.get("masksProperties"):
            features["masks"] += 1
            warnings.append(f"layer {layer.get('nm', index)} dùng mask; tốn CPU và dễ lệch giữa runtime")
        if layer.get("tt"):
            features["mattes"] += 1
            warnings.append(f"layer {layer.get('nm', index)} dùng track matte; kiểm tra luma matte trên mobile")
        if layer.get("ef"):
            features["effects"] += 1
            warnings.append(f"layer {layer.get('nm', index)} có effect; hỗ trợ không đồng đều")
            recommendations.append("Bake shadow/blur vào vector hoặc dùng native; effect trong Lottie thường không animate.")
        if layer.get("bm", 0) not in (0, None):
            features["blend_modes"] += 1
            warnings.append(f"layer {layer.get('nm', index)} dùng blend mode; hỗ trợ hạn chế")
        if layer.get("h") == 1:
            features["hidden"] += 1
        if layer.get("tm"):
            features["time_remap"] += 1
            warnings.append(f"layer {layer.get('nm', index)} dùng time remap; kiểm tra runtime")
        if kind == 5:
            features["text"] += 1
            document = layer.get("t", {}).get("d", {}).get("k", [])
            if not document:
                warnings.append(f"text layer {layer.get('nm', index)} không có document")
            if not font_names:
                blockers.append(f"text layer {layer.get('nm', index)} nhưng thiếu fonts.list")
            warnings.append(f"text layer {layer.get('nm', index)} phụ thuộc font của runtime")
            recommendations.append("Outline text hoặc bundle font; text Lottie phụ thuộc font của runtime.")
        hits = shape_hits(layer)
        features["trim_paths"] += hits["trim_paths"]
        features["merge_paths"] += hits["merge_paths"]
        features["gradients"] += hits["gradients"]
        features["angular_gradients"] += hits["angular_gradients"]
        features["repeaters"] += hits["repeaters"]
        features["path_points"] += hits["path_points"]
        if hits["merge_paths"]:
            warnings.append(f"layer {layer.get('nm', index)} dùng merge paths; iOS thường không hỗ trợ")
            recommendations.append("Flatten shape hoặc thay merge paths bằng boolean đã bake.")
        if hits["angular_gradients"]:
            blockers.append(f"layer {layer.get('nm', index)} dùng angular gradient; Lottie không hỗ trợ")
            recommendations.append("Đổi sang linear/radial gradient hoặc ảnh tĩnh.")
        frames, groups = layer_frames(layer)
        total_keyframes += len(frames)
        if len(frames) > limits["keyframes_per_layer"]:
            warnings.append(f"layer {layer.get('nm', index)} có {len(frames)} keyframe; dấu hiệu bake từng frame")
            recommendations.append("Giảm keyframe, dùng easing; bake từng frame làm file nặng.")
        for path, group in groups:
            times = [frame.get("t") for frame in group]
            for at in times:
                if not isinstance(at, (int, float)) or at < ip or at > op:
                    blockers.append(f"{layer.get('nm', index)} {path}: keyframe {at} ngoài {ip}..{op}")
            if len(times) != len(set(times)):
                warnings.append(f"{layer.get('nm', index)} {path}: keyframe trùng thời điểm")
            if times != sorted(times):
                warnings.append(f"{layer.get('nm', index)} {path}: keyframe không tăng dần")
            for frame in group[:-1]:
                if "e" not in frame:
                    warnings.append(f"{layer.get('nm', index)} {path}: keyframe thiếu e ở t={frame.get('t')}")
                    break

    features["expressions"] = count_expressions(doc)
    if features["expressions"]:
        blockers.append(f"có {features['expressions']} expression; mobile runtime không hỗ trợ")
        recommendations.append("Bake expression thành keyframe hoặc bỏ expression.")
    if features["gradients"] and not features["angular_gradients"]:
        features["gradients"] = features["gradients"]

    duplicate_names = duplicate_layer_names(layers)
    if duplicate_names:
        warnings.append(f"tên layer trùng: {', '.join(sorted(duplicate_names)[:5])}")

    if total_keyframes > limits["keyframes"]:
        warnings.append(f"tổng {total_keyframes} keyframe vượt ngưỡng {limits['keyframes']}")
        recommendations.append("Giảm keyframe hoặc chia asset.")
    if not doc.get("nm"):
        warnings.append("thiếu nm (tên animation)")

    return finish(doc, file_path, blockers, warnings, recommendations, features, limits, duration_s, size_kb, total_keyframes)


def count_expressions(node):
    count = 0

    def on_dict(value, path):
        nonlocal count
        if value.get("expr"):
            count += 1

    walk(node, "doc", on_dict)
    return count


def duplicate_layer_names(layers):
    seen = set()
    duplicates = set()
    for layer in layers:
        name = layer.get("nm")
        if not name:
            continue
        if name in seen:
            duplicates.add(name)
        seen.add(name)
    return duplicates


def finish(doc, file_path, blockers, warnings, recommendations, features, limits, duration_s, size_kb=0, total_keyframes=0):
    score = 0 if blockers else max(0, 100 - min(50, len(warnings) * 4))
    if blockers:
        grade = "F"
    elif score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"
    summary = {
        "file": file_path,
        "name": doc.get("nm"),
        "version": doc.get("v"),
        "size": [doc.get("w"), doc.get("h")],
        "fps": doc.get("fr"),
        "frames": [doc.get("ip"), doc.get("op")],
        "duration_s": round(duration_s, 3),
        "layers": len(doc.get("layers") or []),
        "keyframes": total_keyframes,
        "file_kb": size_kb,
        "fonts": [font.get("fFamily") for font in doc.get("fonts", {}).get("list", []) if isinstance(font, dict)],
    }
    return {
        "valid": not blockers,
        "score": score,
        "grade": grade,
        "summary": summary,
        "blockers": blockers,
        "warnings": warnings,
        "recommendations": list(dict.fromkeys(recommendations)),
        "features": features,
        "limits": limits,
    }


def markdown_report(result):
    lines = []
    lines.append(f"# Lottie audit — {result['summary'].get('name') or result['summary']['file']}")
    lines.append("")
    lines.append(f"**Score:** {result['score']}/100 ({result['grade']}) · **Valid:** {'yes' if result['valid'] else 'no'}")
    lines.append("")
    summary = result["summary"]
    lines.append("| Field | Value |")
    lines.append("|---|---|")
    for key in ("file", "version", "size", "fps", "frames", "duration_s", "layers", "keyframes", "file_kb", "fonts"):
        lines.append(f"| {key} | {summary.get(key)} |")
    lines.append("")
    for title, key in (("Blockers", "blockers"), ("Warnings", "warnings"), ("Recommendations", "recommendations")):
        lines.append(f"## {title}")
        if result[key]:
            for item in result[key]:
                lines.append(f"- {item}")
        else:
            lines.append("- none")
        lines.append("")
    lines.append("## Features")
    lines.append("| Feature | Count |")
    lines.append("|---|---|")
    for key, value in result["features"].items():
        if isinstance(value, dict):
            lines.append(f"| {key} | {value} |")
        elif value:
            lines.append(f"| {key} | {value} |")
    lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file")
    parser.add_argument("--markdown", action="store_true")
    parser.add_argument("--max-layers", type=int, default=LIMITS["layers"])
    parser.add_argument("--max-keyframes", type=int, default=LIMITS["keyframes"])
    parser.add_argument("--max-size-kb", type=float, default=LIMITS["size_kb"])
    parser.add_argument("--max-fps", type=float, default=LIMITS["fps"])
    parser.add_argument("--max-duration", type=float, default=LIMITS["duration_s"])
    args = parser.parse_args()
    try:
        with open(args.file, encoding="utf-8") as handle:
            doc = json.load(handle)
    except (OSError, json.JSONDecodeError) as error:
        print(json.dumps({"valid": False, "blockers": [f"không đọc được JSON: {error}"], "warnings": [], "recommendations": []}, ensure_ascii=False, indent=2))
        return 1
    limits = {
        "layers": args.max_layers,
        "keyframes": args.max_keyframes,
        "size_kb": args.max_size_kb,
        "fps": args.max_fps,
        "duration_s": args.max_duration,
        "image_px": LIMITS["image_px"],
        "keyframes_per_layer": LIMITS["keyframes_per_layer"],
    }
    result = audit(doc, args.file, limits)
    print(markdown_report(result) if args.markdown else json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
