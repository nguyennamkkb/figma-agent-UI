"""Re-render a Figma Motion timeline outside Figma, frame by frame, to check choreography.

Usage:
    python3 render_frames.py <scene.json> <out-dir> [--step 0.1] [--from 0] [--to END] [--gif] [--per-sheet 20]

<scene.json> is written by the export snippet in references/figma-export.md §4.3 (execute_code + savePath, with
Motion closed): {size, duration, nodes: {id: {box, opacity, tracks}}, layers: [{id, parents, png, render}]}.
Writes <out-dir>/t_SS.SS.png per step, <out-dir>/sheet-N.png contact sheets with time labels and, with --gif,
<out-dir>/preview.gif. Transforms: TRANSLATION_X/Y offsets, ROTATION degrees counter-clockwise, SCALE_X/Y, OPACITY;
origin = layer centre; parents are applied outermost first. Nested clipping is ignored. Stdlib + Pillow only.
"""
import base64
import io
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DEFAULTS = {"TRANSLATION_X": 0.0, "TRANSLATION_Y": 0.0, "ROTATION": 0.0, "SCALE_X": 1.0, "SCALE_Y": 1.0}


def bezier_y(x, x1, y1, x2, y2):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        t = (lo + hi) / 2
        bx = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
        lo, hi = (t, hi) if bx < x else (lo, t)
    t = (lo + hi) / 2
    return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3


def ease(key, p):
    if key["e"] == "HOLD":
        return 0.0
    if key["e"] == "LINEAR" or not key.get("bz"):
        return p
    bz = key["bz"]
    return bezier_y(p, bz["x1"], bz["y1"], bz["x2"], bz["y2"])


def sample(track, t):
    if t <= track[0]["t"]:
        return track[0]["v"]
    for a, b in zip(track, track[1:]):
        if a["t"] <= t <= b["t"]:
            p = (t - a["t"]) / (b["t"] - a["t"]) if b["t"] > a["t"] else 1.0
            return a["v"] + (b["v"] - a["v"]) * ease(a, p)
    return track[-1]["v"]


def values(node, t):
    out = {k: sample(node["tracks"][k], t) if k in node["tracks"] else d for k, d in DEFAULTS.items()}
    out["OPACITY"] = sample(node["tracks"]["OPACITY"], t) if "OPACITY" in node["tracks"] else node["opacity"]
    return out


def mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)] for i in range(3)]


def shift(x, y):
    return [[1, 0, x], [0, 1, y], [0, 0, 1]]


def local(node, v):
    cx = node["box"]["x"] + node["box"]["w"] / 2
    cy = node["box"]["y"] + node["box"]["h"] / 2
    r = math.radians(v["ROTATION"])
    rot = [[math.cos(r), math.sin(r), 0], [-math.sin(r), math.cos(r), 0], [0, 0, 1]]
    scale = [[v["SCALE_X"], 0, 0], [0, v["SCALE_Y"], 0], [0, 0, 1]]
    m = mul(shift(cx + v["TRANSLATION_X"], cy + v["TRANSLATION_Y"]), rot)
    return mul(mul(m, scale), shift(-cx, -cy))


def inverse(m):
    a, b, c = m[0]
    d, e, f = m[1]
    det = a * e - b * d
    ia, ib, id_, ie = e / det, -b / det, -d / det, a / det
    return (ia, ib, -(ia * c + ib * f), id_, ie, -(id_ * c + ie * f))


def render(scene, images, t):
    w, h = int(scene["size"][0]), int(scene["size"][1])
    canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    nodes = scene["nodes"]
    for layer in scene["layers"]:
        chain = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        alpha = 1.0
        for nid in layer["parents"] + [layer["id"]]:
            v = values(nodes[nid], t)
            chain = mul(chain, local(nodes[nid], v))
            alpha *= v["OPACITY"]
        if alpha <= 0.001:
            continue
        img = images[layer["id"]]
        rb = layer["render"]
        k = rb["w"] / img.width if img.width else 1.0
        placed = mul(mul(chain, shift(rb["x"], rb["y"])), [[k, 0, 0], [0, k, 0], [0, 0, 1]])
        warped = img.transform(canvas.size, Image.AFFINE, inverse(placed), Image.BICUBIC)
        if alpha < 1:
            warped.putalpha(warped.getchannel("A").point(lambda a: int(a * alpha)))
        canvas.alpha_composite(warped)
    return canvas.convert("RGB")


def contact_sheet(frames, path, cols=5, thumb=(270, 360)):
    rows = math.ceil(len(frames) / cols)
    pad = 28
    sheet = Image.new("RGB", (cols * thumb[0], rows * (thumb[1] + pad)), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 20)
    except OSError:
        font = ImageFont.load_default()
    for i, (t, im) in enumerate(frames):
        x, y = (i % cols) * thumb[0], (i // cols) * (thumb[1] + pad)
        sheet.paste(im.resize(thumb, Image.LANCZOS), (x, y + pad))
        draw.text((x + 8, y + 3), f"{t:.2f}s", fill=(200, 30, 70), font=font)
    sheet.save(path)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    opt = lambda k, d: float(args[args.index(k) + 1]) if k in args else d
    scene = json.loads(Path(args[0]).read_text())
    out = Path(args[1])
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.png"):
        old.unlink()
    step, start = opt("--step", 0.1), opt("--from", 0.0)
    end = opt("--to", scene["duration"])
    per = int(opt("--per-sheet", 20))
    images = {l["id"]: Image.open(io.BytesIO(base64.b64decode(l["png"]))).convert("RGBA") for l in scene["layers"]}
    frames = []
    for i in range(int(round((end - start) / step)) + 1):
        t = round(start + i * step, 3)
        im = render(scene, images, t)
        im.save(out / f"t_{t:05.2f}.png")
        frames.append((t, im))
    for k in range(0, len(frames), per):
        contact_sheet(frames[k:k + per], out / f"sheet-{k // per + 1}.png")
    if "--gif" in args:
        small = [im.resize((im.width // 2, im.height // 2), Image.LANCZOS) for _, im in frames]
        small[0].save(out / "preview.gif", save_all=True, append_images=small[1:], duration=int(step * 1000), loop=0)
    print(f"{len(frames)} frames, {math.ceil(len(frames) / per)} sheets -> {out}")


if __name__ == "__main__":
    main()
