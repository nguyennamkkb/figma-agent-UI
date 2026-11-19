# Python generator — compact motion spec → Lottie

`scripts/motion_to_lottie.py` is a stdlib-only generator for simple, deterministic Lottie assets. It is not a replacement for native Figma export when text stagger, path trim, effects or images are required.

## 1. Run

From the skill folder:

```bash
python3 scripts/motion_to_lottie.py examples/payment-success.spec.json examples/payment-success.lottie.json
python3 scripts/motion_to_lottie.py --check examples/payment-success.lottie.json
python3 scripts/motion_to_lottie.py spec.json out.json --minify
```

## 2. Spec schema

```json
{
  "name": "Payment success",
  "width": 390,
  "height": 700,
  "fps": 60,
  "duration_ms": 700,
  "background": "#F0FDF4",
  "layers": [
    {
      "name": "Photo",
      "type": "image",
      "src": "images/hero.png",
      "x": 20,
      "y": 40,
      "width": 350,
      "height": 220,
      "opacity": [{"at": 0, "value": 0, "easing": "ease_out"}, {"at": 250, "value": 1}]
    }
  ]
}
```

### Root

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | no | Animation name |
| `width` / `height` | number | yes | Canvas at 1×, > 0 |
| `fps` | number | no | Default 60 |
| `duration_ms` | number | yes | > 0; converted to frames |
| `background` | hex | no | Transparent when omitted |
| `layers` | array | yes | Render order is handled by the generator |

### Layer

| Field | Applies to | Notes |
|---|---|---|
| `type` | all | `rect`, `ellipse`, `text`, `image` |
| `src` | image | Path relative to the spec file, or absolute in a build script |
| `embed` | image | `true` (default) inlines base64; `false` writes an external `u`/`p` reference |
| `width` / `height` | image | Display size in px, independent of the file size |
| `name` | all | Used as Lottie layer name |
| `x` / `y` | all | Top-left in px |
| `width` / `height` | rect/ellipse | Shape size |
| `radius` | rect | Corner radius |
| `fill` | all | Hex string or keyframe array |
| `opacity` | all | 0–1; scalar keyframes |
| `translate_x` / `translate_y` | all | px; scalar keyframes |
| `position` | all | Absolute `[x, y]` keyframes; overrides translate |
| `scale` | all | 1 = 100%; scalar keyframes |
| `scale_x` / `scale_y` | all | Separate axes |
| `rotation` | all | Degrees |
| `text` / `font` / `font_size` | text | Font family, size |
| `width` / `height` | text | Optional anchor box |

Keyframe point:

```json
{"at": 250, "value": 24, "easing": "ease_out"}
```

- `at` in ms, clamped to `0..duration_ms`.
- `value` number, `[x, y]` for position, hex for fill.
- `easing` optional; default `linear`.

## 3. Easing names

| Name | cubic-bezier |
|---|---|
| `linear` | (0, 0, 1, 1) |
| `ease_in` | (0.42, 0, 1, 1) |
| `ease_out` | (0, 0, 0.58, 1) |
| `ease_in_out` | (0.42, 0, 0.58, 1) |
| `standard` | (0.2, 0, 0, 1) |
| `emphasized` | (0.05, 0.7, 0.1, 1) |
| `spring` | (0.34, 1.56, 0.64, 1) — approximation |

Custom: pass `[x1, y1, x2, y2]`.

## 4. Supported

- Rect, ellipse, text and image layers.
- Image layers embed as base64 by default, so one JSON file is self-contained.
- Opacity, translate X/Y, absolute position, scale, separate scale X/Y, rotation.
- Static and animated fill colour.
- Static and animated text opacity/transform.
- Layer order, fonts list, canvas, fps, duration.
- Cubic-bezier easing.
- Validation and `--check` mode.

## 5. Not supported (use native Figma export)

- Text stagger by character/word/line.
- Path trim / vector draw-on.
- Masks, mattes, merge paths, repeaters.
- Gradients, effects, blur/shadow.
- Components/variants, smart animate.
- Exact spring physics (approximated).
- Text baseline exactness (approximate; outline/native for pixel-perfect).
- Multiple animations in one file (use dotLottie pack).

## 6. Batch pattern

```bash
for spec in motion/*/spec/*.json; do
  name=$(basename "$spec" .json)
  python3 scripts/motion_to_lottie.py "$spec" "motion/$name/$name.lottie.json"
  python3 scripts/lottie_audit.py "motion/$name/$name.lottie.json" --markdown > "motion/$name/qa/audit.md"
done
```

Keep one spec per motion ID; do not generate from the Figma layer names alone.

## 7. Text caveat

Lottie text uses a baseline anchor; the generator places text at `y + font_size`. This is close but not identical to Figma's bounding box. For pixel-perfect text, outline the text in Figma and export native, or adjust `position` after visual QA.

## 8. License

The generator uses Python stdlib only. `python-lottie` is AGPL-3.0-or-later; do not add it to a commercial pipeline without a license review. The audit script uses stdlib only.
