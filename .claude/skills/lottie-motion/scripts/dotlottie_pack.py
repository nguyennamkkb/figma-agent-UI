"""Pack a Lottie JSON file into a dotLottie v1 package.

Usage:
  python3 scripts/dotlottie_pack.py examples/payment-success.lottie.json examples/payment-success.lottie
  python3 scripts/dotlottie_pack.py input.json output.lottie --id payment-success --loop --theme-color "#F0FDF4"
  python3 scripts/dotlottie_pack.py input.json output.lottie --no-autoplay --base-dir assets

dotLottie v1 is a ZIP with manifest.json, animations/<id>.json and optional images/.
Use Figma's native dotLottie export when the animation contains images or fonts.
"""
import argparse
import json
import os
import sys
import zipfile


def image_path(asset, base_dir):
    path = asset.get("p")
    folder = asset.get("u", "")
    if not path:
        return None
    candidates = [
        os.path.join(base_dir, folder, path),
        os.path.join(base_dir, path),
        path,
    ]
    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate
    return None


def pack(input_path, output_path, animation_id, loop, autoplay, theme_color, base_dir):
    with open(input_path, encoding="utf-8") as handle:
        animation = json.load(handle)
    images = []
    missing = []
    for asset in animation.get("assets", []) or []:
        if not isinstance(asset, dict) or not asset.get("p"):
            continue
        if asset.get("e") == 1 or str(asset.get("p", "")).startswith("data:"):
            continue
        source = image_path(asset, base_dir)
        if not source:
            missing.append(asset.get("id") or asset.get("p"))
            continue
        name = os.path.basename(source)
        images.append((source, name))
        asset["u"] = ""
        asset["p"] = f"images/{name}"
        asset["e"] = 0
    manifest = {
        "version": "1",
        "generator": "figma-agent lottie-motion",
        "activeAnimationId": animation_id,
        "animations": [
            {
                "id": animation_id,
                "autoplay": autoplay,
                "loop": loop,
                "themeColor": theme_color,
            }
        ],
    }
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        archive.writestr(f"animations/{animation_id}.json", json.dumps(animation, ensure_ascii=False, separators=(",", ":")))
        for source, name in images:
            archive.write(source, f"images/{name}")
    with zipfile.ZipFile(output_path) as archive:
        entries = [entry.filename for entry in archive.infolist()]
    return {
        "output": output_path,
        "animation_id": animation_id,
        "images": len(images),
        "missing_images": missing,
        "size_kb": round(os.path.getsize(output_path) / 1024, 2),
        "entries": entries,
    }


def verify(output_path):
    problems = []
    with zipfile.ZipFile(output_path) as archive:
        names = archive.namelist()
        if "manifest.json" not in names:
            problems.append("thiếu manifest.json")
        else:
            manifest = json.loads(archive.read("manifest.json"))
            if manifest.get("version") != "1":
                problems.append("manifest version phải là \"1\"")
            ids = [item.get("id") for item in manifest.get("animations", [])]
            for animation_id in ids:
                if f"animations/{animation_id}.json" not in names:
                    problems.append(f"thiếu animations/{animation_id}.json")
    return problems


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--id", default=None)
    parser.add_argument("--loop", action="store_true")
    parser.add_argument("--no-autoplay", action="store_true")
    parser.add_argument("--theme-color", default="#FFFFFF")
    parser.add_argument("--base-dir", default=None)
    args = parser.parse_args()
    animation_id = args.id or os.path.splitext(os.path.basename(args.output))[0]
    base_dir = args.base_dir or os.path.dirname(os.path.abspath(args.input))
    result = pack(
        args.input,
        args.output,
        animation_id,
        args.loop,
        not args.no_autoplay,
        args.theme_color,
        base_dir,
    )
    problems = verify(args.output)
    result["valid"] = not problems
    result["problems"] = problems
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
