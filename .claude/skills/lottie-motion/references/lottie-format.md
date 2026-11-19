# Lottie JSON — the parts that matter

## 1. Minimal document

```json
{
  "v": "5.12.2",
  "fr": 60,
  "ip": 0,
  "op": 42,
  "w": 390,
  "h": 700,
  "nm": "Payment success",
  "ddd": 0,
  "assets": [],
  "fonts": {"list": []},
  "layers": []
}
```

| Field | Meaning | Check |
|---|---|---|
| `v` | Lottie version | Keep a version the target runtime supports |
| `fr` | Frames per second | 30 or 60; avoid odd values |
| `ip` / `op` | In/out frame | `op > ip`; duration = `(op - ip) / fr` seconds |
| `w` / `h` | Canvas in px | Match the design size at 1× |
| `nm` | Animation name | Used in handoff and players |
| `ddd` | 3D flag | Must be `0`; Lottie has no 3D |
| `assets` | Images and precomps | Keep image paths relative |
| `fonts` | Font list for text layers | Must include every `fName` used |
| `layers` | Render order | **First layer is on top**; reverse from Figma's bottom-to-top order |

## 2. Layers

| `ty` | Type | Use |
|---|---|---|
| 0 | Precomp | Reuse a group; references an asset `id` |
| 1 | Solid | Solid colour rectangle |
| 2 | Image | References an image asset |
| 3 | Null | Parent/transform helper |
| 4 | Shape | Rect, ellipse, path, fill, stroke, trim |
| 5 | Text | Text document + font |
| 6 | Audio | Not supported in most runtimes |
| 7 | Video | Not supported in Lottie |

A layer needs:

```json
{
  "ddd": 0,
  "ind": 1,
  "ty": 4,
  "nm": "Card",
  "sr": 1,
  "ks": {
    "o": {"a": 0, "k": 100},
    "r": {"a": 0, "k": 0},
    "p": {"a": 0, "k": [195, 350, 0]},
    "a": {"a": 0, "k": [0, 0, 0]},
    "s": {"a": 0, "k": [100, 100, 100]}
  },
  "ao": 0,
  "shapes": [],
  "ip": 0,
  "op": 42,
  "st": 0,
  "bm": 0
}
```

| Transform | Meaning | Unit |
|---|---|---|
| `o` | Opacity | 0–100, not 0–1 |
| `r` | Rotation | degrees |
| `p` | Position | px, `[x, y, z]` |
| `a` | Anchor point | px |
| `s` | Scale | 100 = 1×, `[x, y, z]` |

`ip`/`op` on a layer clip it to that range; `st` is the start time; `sr` is time stretch.

## 3. Shapes

A shape layer is an array of shape items, usually ending with a transform item:

```json
"shapes": [
  {"ty": "rc", "d": 1, "s": {"a": 0, "k": [160, 160]}, "p": {"a": 0, "k": [0, 0]}, "r": {"a": 0, "k": 12}},
  {"ty": "fl", "c": {"a": 0, "k": [0.23, 0.51, 0.96, 1]}, "o": {"a": 0, "k": 100}, "r": 1},
  {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}, "sk": {"a": 0, "k": 0}, "sa": {"a": 0, "k": 0}}
]
```

| Shape `ty` | Meaning | Notes |
|---|---|---|
| `rc` | Rectangle | `r` = corner radius |
| `el` | Ellipse | `s` = width/height |
| `sh` | Path | `ks.k` has `i`, `o`, `v`, `c` |
| `fl` | Fill | Colour + opacity |
| `st` | Stroke | Width, cap, join |
| `gf` / `gs` | Gradient fill/stroke | Linear/radial only; angular not supported |
| `tm` | Trim path | Draw-on/travel; test individually vs simultaneously |
| `mm` | Merge paths | Android only; avoid for iOS |
| `rp` | Repeater | Supported on most, not iOS Core Animation main-thread? Test |
| `tr` | Transform | Per-group transform |

## 4. Keyframes and easing

A static property:

```json
{"a": 0, "k": 100}
```

An animated scalar:

```json
{
  "a": 1,
  "k": [
    {"t": 0, "s": [0], "e": [100], "o": {"x": [0], "y": [0]}, "i": {"x": [0.58], "y": [1]}},
    {"t": 15, "s": [100]}
  ]
}
```

| Field | Meaning |
|---|---|
| `t` | Frame number |
| `s` | Start value at this keyframe |
| `e` | End value (next keyframe) |
| `o` | Out tangent of this keyframe (cubic-bezier x1/y1) |
| `i` | In tangent of the next keyframe (cubic-bezier x2/y2) |

CSS cubic-bezier `(x1, y1, x2, y2)` maps to `o = (x1, y1)`, `i = (x2, y2)`. Tangents are arrays for multidimensional properties. Hold: use `h: 1` on the keyframe or no `e`.

## 5. Text

Text layers use a text document:

```json
{
  "ty": 5,
  "nm": "Title",
  "t": {
    "d": {"k": [{"t": 0, "s": {"s": 28, "f": "Inter", "t": "Payment sent", "j": 0, "tr": 0, "lh": 34, "ls": 0, "fc": [0.07, 0.09, 0.14]}}]},
    "p": {},
    "m": {"g": 1, "a": {"a": 0, "k": [0, 0]}},
    "a": []
  }
}
```

- `fonts.list` must contain `fName`/`fFamily`/`fStyle`.
- Raw Lottie does not embed fonts; dotLottie v2 can bundle them.
- Text metrics differ across platforms; outline for pixel-identical results.
- Range selectors and per-character 3D are web-only in many runtimes.
- Check the font license before bundling it in dotLottie or an app.

## 6. Assets, images, precomps

Image asset:

```json
{"id": "image_0", "w": 512, "h": 512, "u": "images/", "p": "hero.webp", "e": 0}
```

- `u` + `p` must resolve relative to the runtime.
- dotLottie should store images in `images/` and reference `u: ""`, `p: "images/hero.webp"`.
- Raw Lottie with external images breaks when the path is not shipped.

Precomp asset:

```json
{"id": "comp_0", "layers": []}
```

A precomp layer has `ty: 0` and `refId: "comp_0"`. Keep nesting shallow; deep precomps are slower.

## 7. Masks, mattes, expressions

| Feature | Field | Reality |
|---|---|---|
| Mask | `masksProperties` | Supported, but CPU-heavy; test |
| Alpha matte | layer `tt: 1/2` | Supported on most |
| Luma matte | layer `tt: 3/4` | Not on iOS/Android |
| Expression | `expr` | Web only; not mobile |
| 3D | `ddd: 1` | Not supported |
| Blend mode | `bm` | Partial |
| Time remap | layer `tm` | Check runtime |

## 8. Common mistakes

1. **Layer order reversed.** Lottie draws the first layer on top; Figma's array is bottom-to-top.
2. **Opacity 0–1.** Lottie uses 0–100.
3. **Scale 1.** Lottie uses 100.
4. **Static rotation as an array.** `r.k` should be a number when `a: 0`.
5. **Keyframes outside `ip..op`.** Players clip or ignore them.
6. **Text without fonts.** The runtime falls back or fails.
7. **Image path without `u`.** The asset is not found.
8. **Mask/effect used as a shortcut.** It usually fails on one platform.
9. **Figma keyframes baked every frame.** File size and CPU explode; use easing.
10. **No loop-boundary check.** The jump is visible.
