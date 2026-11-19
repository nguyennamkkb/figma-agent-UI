"""Validate a lottie-motion spec before design or export.

Usage:
  python3 scripts/spec_check.py motion/<project>/spec/MOT-012.yaml
  python3 scripts/spec_check.py assets/motion-spec.template.yaml --markdown

Requires PyYAML. Exit code 1 when there are errors.
"""
import argparse
import json
import sys

try:
    import yaml
except ImportError:
    yaml = None

FORMATS = {"lottie", "dotlottie", "native", "mp4", "webm", "gif", "svg"}
PLATFORMS = {"ios", "android", "web"}
CATEGORIES = {"micro", "navigation", "gesture", "system", "expressive", "ambient", "component", "feedback"}
TEXT_STRATEGIES = {"outline", "bundled", "system", "none"}
PREFERRED = {"lottie", "dotlottie", "native"}


def require(data, key, errors, prefix=""):
    if not isinstance(data, dict) or key not in data:
        errors.append(f"thiếu {prefix}{key}")
        return None
    return data[key]


def check(data):
    errors = []
    warnings = []
    if not isinstance(data, dict):
        return {"valid": False, "errors": ["root phải là object"], "warnings": [], "summary": {}}

    for key in ("motion_id", "name", "category", "platforms", "format", "purpose", "trigger", "initial_state", "final_state", "animation", "lottie", "accessibility", "implementation", "qa"):
        require(data, key, errors)

    motion_id = data.get("motion_id")
    if motion_id and not isinstance(motion_id, str):
        errors.append("motion_id phải là string")
    if isinstance(motion_id, str) and not motion_id.strip():
        errors.append("motion_id rỗng")

    category = data.get("category")
    if category and category not in CATEGORIES:
        warnings.append(f"category lạ: {category} (dùng {', '.join(sorted(CATEGORIES))})")

    platforms = data.get("platforms") or []
    if not isinstance(platforms, list) or not platforms:
        errors.append("platforms phải là array không rỗng")
    else:
        unknown = set(platforms) - PLATFORMS
        if unknown:
            errors.append(f"platforms lạ: {', '.join(sorted(unknown))}")

    fmt = data.get("format")
    if fmt and fmt not in FORMATS:
        errors.append(f"format lạ: {fmt}")

    animation = data.get("animation") or {}
    duration = animation.get("duration_ms")
    fps = animation.get("fps", 60)
    canvas = animation.get("canvas") or {}
    if not isinstance(duration, (int, float)) or duration <= 0:
        errors.append("animation.duration_ms phải > 0")
    if fps not in (30, 60):
        warnings.append(f"fps {fps}; nên dùng 30 hoặc 60")
    if not isinstance(canvas.get("width"), (int, float)) or canvas.get("width", 0) <= 0:
        errors.append("animation.canvas.width phải > 0")
    if not isinstance(canvas.get("height"), (int, float)) or canvas.get("height", 0) <= 0:
        errors.append("animation.canvas.height phải > 0")
    choreography = animation.get("choreography") or []
    if not isinstance(choreography, list) or not choreography:
        errors.append("animation.choreography phải có ít nhất 1 mục")
    else:
        for index, item in enumerate(choreography):
            prefix = f"choreography[{index}]."
            require(item, "target", errors, prefix)
            require(item, "property", errors, prefix)
            start = item.get("start_ms")
            end = item.get("end_ms")
            if not isinstance(start, (int, float)) or not isinstance(end, (int, float)):
                errors.append(f"{prefix}start_ms/end_ms phải là số")
            else:
                if end <= start:
                    errors.append(f"{prefix}end_ms phải lớn hơn start_ms")
                if isinstance(duration, (int, float)) and end > duration:
                    errors.append(f"{prefix}end_ms {end} vượt duration {duration}")
    if animation.get("loop") and not (data.get("accessibility") or {}).get("reduce_motion"):
        warnings.append("loop=true nhưng chưa có reduce_motion")

    lottie = data.get("lottie") or {}
    strategy = lottie.get("text_strategy")
    if strategy and strategy not in TEXT_STRATEGIES:
        errors.append(f"lottie.text_strategy lạ: {strategy}")
    if data.get("format") in ("lottie", "dotlottie") and strategy not in ("outline", "bundled", "none"):
        warnings.append("Lottie có text nhưng text_strategy chưa outline/bundled; rủi ro font")
    budgets = data.get("budgets") or {}
    if budgets:
        for key in ("max_size_kb", "max_layers", "max_keyframes"):
            for source in (budgets, lottie):
                value = source.get(key)
                if value is not None and (not isinstance(value, (int, float)) or value <= 0):
                    errors.append(f"budget {key} phải > 0")
                    break

    accessibility = data.get("accessibility") or {}
    if not accessibility.get("reduce_motion"):
        warnings.append("chưa có accessibility.reduce_motion")
    implementation = data.get("implementation") or {}
    preferred = implementation.get("preferred")
    if preferred and preferred not in PREFERRED:
        errors.append(f"implementation.preferred lạ: {preferred}")
    if data.get("format") in ("lottie", "dotlottie") and preferred == "native":
        warnings.append("format Lottie nhưng implementation.preferred = native; kiểm tra lại")

    qa = data.get("qa") or []
    if not isinstance(qa, list) or not qa:
        warnings.append("qa rỗng; handoff không có test commitment")

    summary = {
        "motion_id": motion_id,
        "name": data.get("name"),
        "category": category,
        "format": fmt,
        "platforms": platforms,
        "duration_ms": duration,
        "fps": fps,
        "canvas": canvas,
        "choreography": len(choreography) if isinstance(choreography, list) else 0,
        "loops": bool(animation.get("loop")),
        "budgets": budgets or {"max_size_kb": 500, "max_layers": 100, "max_keyframes": 500},
    }
    return {"valid": not errors, "errors": errors, "warnings": warnings, "summary": summary}


def markdown(result):
    lines = [f"# Spec check — {result['summary'].get('motion_id') or 'unknown'}", ""]
    lines.append(f"**Valid:** {'yes' if result['valid'] else 'no'}")
    lines.append("")
    lines.append("| Field | Value |")
    lines.append("|---|---|")
    for key, value in result["summary"].items():
        lines.append(f"| {key} | {value} |")
    lines.append("")
    for title, key in (("Errors", "errors"), ("Warnings", "warnings")):
        lines.append(f"## {title}")
        if result[key]:
            for item in result[key]:
                lines.append(f"- {item}")
        else:
            lines.append("- none")
        lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file")
    parser.add_argument("--markdown", action="store_true")
    args = parser.parse_args()
    if yaml is None:
        print(json.dumps({"valid": False, "errors": ["thiếu PyYAML: pip install pyyaml"], "warnings": [], "summary": {}}, ensure_ascii=False, indent=2))
        return 1
    try:
        with open(args.file, encoding="utf-8") as handle:
            data = yaml.safe_load(handle)
    except (OSError, yaml.YAMLError) as error:
        print(json.dumps({"valid": False, "errors": [f"không đọc được YAML: {error}"], "warnings": [], "summary": {}}, ensure_ascii=False, indent=2))
        return 1
    result = check(data)
    print(markdown(result) if args.markdown else json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
