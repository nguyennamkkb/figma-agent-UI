"""Bake the onboarding bottom fade into a hero image (opaque pixels, no alpha).

Usage:
    python3 bake_fade.py in.png out.png [start] [end] [--bg #FBF6F3] [--blur 0.03] [--lead 0.08]

start / end   fraction of the image height where the fade begins and where the image is
              fully the background colour (default 0.76 -> 0.92, the AI Chatbot F4 model)
--bg          the screen background hex the image melts into (the frame fill)
--blur        Gaussian blur radius as a fraction of the width, applied progressively
--lead        the blur starts this fraction of the height above `start`

Bottom part: progressive Gaussian blur, then a smoothstep blend to --bg; below `end` the
image is the flat background, so text placed there sits on a solid colour. Needs numpy
and Pillow.
"""

import argparse

import numpy as np
from PIL import Image, ImageFilter


def hex_rgb(value):
    v = value.lstrip("#")
    if len(v) != 6:
        raise argparse.ArgumentTypeError(f"bad hex colour: {value}")
    return np.array([int(v[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def smoothstep(y, start, end):
    t = np.clip((y - start) / (end - start), 0, 1)
    return t * t * (3 - 2 * t)


def bake(src, dst, start, end, bg, blur, lead):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    sharp = np.asarray(im, dtype=np.float32)
    soft = np.asarray(im.filter(ImageFilter.GaussianBlur(radius=w * blur)), dtype=np.float32)
    y = np.linspace(0, 1, h)[:, None, None]
    to_bg = smoothstep(y, start, end)
    to_soft = smoothstep(y, start - lead, end - lead)
    out = (sharp * (1 - to_soft) + soft * to_soft) * (1 - to_bg) + bg * to_bg
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst)
    return w, h


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("start", nargs="?", type=float, default=0.76)
    ap.add_argument("end", nargs="?", type=float, default=0.92)
    ap.add_argument("--bg", type=hex_rgb, default=hex_rgb("#FBF6F3"))
    ap.add_argument("--blur", type=float, default=0.03)
    ap.add_argument("--lead", type=float, default=0.08)
    a = ap.parse_args()
    if not 0 <= a.start < a.end <= 1:
        ap.error("need 0 <= start < end <= 1")
    w, h = bake(a.src, a.dst, a.start, a.end, a.bg, a.blur, a.lead)
    print(f"{a.dst} {w}x{h} fade {a.start:.2f}->{a.end:.2f} (y {round(a.start * h)}->{round(a.end * h)})")


if __name__ == "__main__":
    main()
