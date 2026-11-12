#!/usr/bin/env python3
"""
extract_palette.py — Measure the colour palette of a reference screenshot so style values are estimated, not eyeballed.

Output for each colour: hex, area share, lightness, saturation, a role hint
(background / surface / text / accent / muted), the px → pt/dp scale and WCAG contrast of the main pairs.
Values are "estimated": round-trip them through the Style brief with that confidence.

Requires: Python 3, Pillow, numpy  (pip install pillow numpy)

Usage:
  python3 extract_palette.py ref.png
  python3 extract_palette.py ref.png --min-share 0.2           # keep tiny accents (default drops < 0.5%)
  python3 extract_palette.py ref.png --points 393              # device width in pt/dp → scale factor
  python3 extract_palette.py ref.png --colors 10 --crop 0,140,1179,2000
  python3 extract_palette.py ref.png --json                    # machine-readable result

Exit code: 0 = ok, 1 = cannot read the image.
"""
import argparse
import colorsys
import json
import sys

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.stderr.write("extract_palette.py needs Pillow and numpy: pip install pillow numpy\n")
    sys.exit(1)

SAMPLE_SIDE = 256
KMEANS_ROUNDS = 20
MERGE_DISTANCE = 12.0
NEUTRAL_LIGHTNESS = (3, 97)


def load_pixels(path, crop):
    image = Image.open(path).convert("RGBA")
    width, height = image.size
    if crop:
        x, y, w, h = crop
        image = image.crop((x, y, x + w, y + h))
    sample = image.copy()
    sample.thumbnail((SAMPLE_SIDE, SAMPLE_SIDE), Image.NEAREST)
    data = np.asarray(sample, dtype=np.float64).reshape(-1, 4)
    opaque = data[data[:, 3] > 200][:, :3]
    return opaque, width, height


def kmeans(pixels, count, seed=7):
    rng = np.random.default_rng(seed)
    unique = np.unique(pixels.round(), axis=0)
    count = max(1, min(count, len(unique)))
    centers = [pixels[rng.integers(len(pixels))]]
    for _ in range(1, count):
        distance = np.min([np.sum((pixels - c) ** 2, axis=1) for c in centers], axis=0)
        total = distance.sum()
        if total == 0:
            break
        centers.append(pixels[rng.choice(len(pixels), p=distance / total)])
    centers = np.array(centers)
    for _ in range(KMEANS_ROUNDS):
        labels = np.argmin(((pixels[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2), axis=1)
        moved = np.array([pixels[labels == i].mean(axis=0) if np.any(labels == i) else centers[i] for i in range(len(centers))])
        if np.allclose(moved, centers, atol=0.5):
            centers = moved
            break
        centers = moved
    labels = np.argmin(((pixels[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2), axis=1)
    shares = np.bincount(labels, minlength=len(centers)) / len(pixels)
    return centers, shares


def drop_small(entries, min_share):
    kept = [e for e in entries if e["share"] * 100 >= min_share] or entries[:1]
    total = sum(e["share"] for e in kept)
    for entry in kept:
        entry["share"] /= total
    return kept


def merge_close(centers, shares):
    merged = []
    for center, share in sorted(zip(centers, shares), key=lambda item: -item[1]):
        for entry in merged:
            if np.linalg.norm(entry["rgb"] - center) < MERGE_DISTANCE:
                total = entry["share"] + share
                entry["rgb"] = (entry["rgb"] * entry["share"] + center * share) / total
                entry["share"] = total
                break
        else:
            merged.append({"rgb": np.array(center, dtype=np.float64), "share": float(share)})
    return [entry for entry in merged if entry["share"] > 0]


def to_hex(rgb):
    return "#" + "".join(f"{int(round(max(0, min(255, v)))):02X}" for v in rgb)


def relative_luminance(rgb):
    channels = []
    for value in rgb / 255.0:
        channels.append(value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4)
    r, g, b = channels
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    high, low = max(la, lb), min(la, lb)
    return (high + 0.05) / (low + 0.05)


def describe(entries):
    background = entries[0]
    for entry in entries:
        h, l, s = colorsys.rgb_to_hls(*(entry["rgb"] / 255.0))
        entry["hue"] = round(h * 360)
        entry["lightness"] = round(l * 100)
        neutral = not (NEUTRAL_LIGHTNESS[0] < entry["lightness"] < NEUTRAL_LIGHTNESS[1])
        entry["saturation"] = 0 if neutral else round(s * 100)
    for index, entry in enumerate(entries):
        ratio = contrast(entry["rgb"], background["rgb"])
        if index == 0:
            role = "background"
        elif entry["saturation"] >= 45 and 20 <= entry["lightness"] <= 80:
            role = "accent"
        elif ratio >= 4.5:
            role = "text"
        elif ratio < 1.6:
            role = "surface"
        else:
            role = "muted"
        entry["role"] = role
        entry["contrastOnBackground"] = round(ratio, 2)
    return entries


def pairs(entries):
    result = []
    texts = [e for e in entries if e["role"] in ("text", "accent", "muted")]
    grounds = [e for e in entries if e["role"] in ("background", "surface")]
    for text in texts:
        for ground in grounds:
            ratio = contrast(text["rgb"], ground["rgb"])
            result.append({
                "fg": to_hex(text["rgb"]),
                "bg": to_hex(ground["rgb"]),
                "ratio": round(ratio, 2),
                "body": "pass" if ratio >= 4.5 else ("large-only" if ratio >= 3 else "fail"),
            })
    return sorted(result, key=lambda item: -item["ratio"])


def parse_crop(text):
    parts = [int(v) for v in text.split(",")]
    if len(parts) != 4 or parts[2] <= 0 or parts[3] <= 0:
        raise argparse.ArgumentTypeError("crop must be x,y,w,h with positive w and h")
    return parts


def main():
    parser = argparse.ArgumentParser(description="Measure the colour palette of a reference screenshot.")
    parser.add_argument("image")
    parser.add_argument("--colors", type=int, default=8, help="clusters before merging (default 8)")
    parser.add_argument("--points", type=float, help="device width in pt/dp, e.g. 393 (iPhone) or 412 (Android)")
    parser.add_argument("--crop", type=parse_crop, help="x,y,w,h in image pixels, e.g. to drop the status bar or a photo")
    parser.add_argument("--min-share", type=float, default=0.5, help="drop colours under this %% of the area, e.g. anti-aliased edges (default 0.5)")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    try:
        pixels, width, height = load_pixels(args.image, args.crop)
    except (OSError, ValueError) as error:
        sys.stderr.write(f"cannot read {args.image}: {error}\n")
        return 1
    if len(pixels) == 0:
        sys.stderr.write("no opaque pixels to measure\n")
        return 1

    centers, shares = kmeans(pixels, args.colors)
    entries = describe(drop_small(merge_close(centers, shares), args.min_share))
    scale = round(width / args.points, 3) if args.points else None

    palette = [{
        "hex": to_hex(e["rgb"]),
        "share": round(e["share"] * 100, 1),
        "role": e["role"],
        "lightness": e["lightness"],
        "saturation": e["saturation"],
        "hue": e["hue"],
        "contrastOnBackground": e["contrastOnBackground"],
    } for e in entries]
    result = {
        "image": args.image,
        "pixels": {"width": width, "height": height},
        "scale": {"pxPerPoint": scale, "points": args.points, "heightInPoints": round(height / scale) if scale else None},
        "confidence": "estimated",
        "palette": palette,
        "pairs": pairs(entries),
    }

    if args.json:
        print(json.dumps(result, indent=2))
        return 0

    print(f"{args.image}  {width}×{height}px" + (f"  →  {args.points:g}×{height / scale:.0f} pt/dp  (×{scale})" if scale else ""))
    print("confidence: estimated — snap values and record them in the Style brief\n")
    print(f"{'hex':<9}{'share':>7}  {'role':<11}{'L':>4}{'S':>5}{'hue':>5}  contrast vs bg")
    for item in palette:
        print(f"{item['hex']:<9}{item['share']:>6}%  {item['role']:<11}{item['lightness']:>4}{item['saturation']:>5}{item['hue']:>5}  {item['contrastOnBackground']}:1")
    if result["pairs"]:
        print("\npairs (body text needs 4.5:1)")
        for pair in result["pairs"][:8]:
            print(f"  {pair['fg']} on {pair['bg']}  {pair['ratio']}:1  {pair['body']}")
    if not scale:
        print("\ntip: pass --points <device width> to convert px measurements to pt/dp")
    return 0


if __name__ == "__main__":
    sys.exit(main())
