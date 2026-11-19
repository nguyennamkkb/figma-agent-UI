# Optimization — small, fast, predictable

Lottie is rendered every frame. File size is only half the problem; the other half is per-frame work: masks, effects, large images, deep precomps, too many layers and baked keyframes.

## 1. Budgets

| Item | Default | Hard warning |
|---|---|---|
| File size | ≤ 500 KB | > 500 KB |
| Layers | ≤ 100 | > 100 |
| Keyframes | ≤ 500 | > 500 |
| Duration | ≤ 10 s | > 10 s |
| FPS | 30 or 60 | > 60 or non-integer |
| Images | ≤ 2048 px each | > 2048 px |
| Masks/effects | 0 unless tested | present |
| Text | outlined or bundled | raw font dependency |
| Precomp depth | ≤ 3 | deeper |

Override only with a written reason in the spec.

## 2. Structural optimization

1. **Remove unused layers and assets.** A hidden layer still costs memory in some players.
2. **Merge static shapes.** One shape layer with several paths is cheaper than many layers.
3. **Use precomps for repeated groups**, not for one-off nesting.
4. **Flatten before export.** Boolean/merge operations baked in Figma are safer than Lottie merge paths.
5. **Prefer shapes over masks.** A rounded rect or trim path usually replaces a mask.
6. **Avoid null-parent chains** deeper than necessary; each parent is a transform lookup.

## 3. Keyframes

- Use the fewest keyframes that describe the motion; ease between them.
- Do not bake every frame from a simulation unless the asset is short and tested.
- Remove redundant keyframes with identical values.
- Keep keyframes inside `ip..op`.
- Use hold keyframes for discrete steps; do not duplicate values.
- Round times to integer frames; sub-frame keyframes are wasted.
- Round values: position 0.1 px, scale 0.1%, opacity 1%, colour 2–3 decimals.

## 4. Shapes and paths

- Simplify vector paths; remove invisible points.
- Avoid hundreds of points per path; split or simplify.
- Trim path is cheaper than a mask for draw-on.
- Stroke dashes are supported but add work; use sparingly.
- Gradients: linear/radial only; angular is unsupported.
- Merge paths: avoid for iOS; flatten.
- Repeaters: supported on many runtimes but can explode layer count at render time.

## 5. Text

- Outline text for pixel-identical rendering and no font dependency.
- If text must stay editable, bundle the font in dotLottie v2 and verify the runtime.
- Avoid per-character animation on mobile; range selectors are web-only in many players.
- Use native text for localized/dynamic content; Lottie text is static.

## 6. Images

- Prefer vector. If an image is required, compress to WebP or optimized PNG.
- Resize to the maximum display size × device pixel ratio; do not ship 4K images.
- Bundle images in dotLottie; raw Lottie external paths break easily.
- Reuse image assets across animations.
- Avoid full-screen raster in a looping animation; it dominates memory and battery.

## 7. Effects and masks

| Feature | Cost | Rule |
|---|---|---|
| Mask | Per-frame path clipping | Replace with shape/trim; test if unavoidable |
| Alpha matte | Extra layer compositing | Acceptable if tested |
| Luma matte | Unsupported on mobile | Avoid |
| Drop shadow | Per-shape on Android | Bake or accept static |
| Blur/noise/glass | Partial/unsupported | Bake into vector/image |
| Blend mode | Partial | Avoid unless tested |

## 8. JSON hygiene

- Minify for delivery; keep a pretty version in the repo for diffing.
- Remove `meta` and editor-only data if the runtime ignores it.
- Keep `nm` and layer names; they help debugging and handoff.
- Use relative, lowercase file names.
- Do not include unused `assets` or `fonts`.
- Keep `v` at a version the runtime supports.

## 9. dotLottie

- Use dotLottie for multiple animations, images, fonts, themes or state machines.
- v1 is widely supported: `manifest.json` + `animations/` + optional `images/`.
- v2 adds `a/`, `i/`, themes and state machines; verify runtime support.
- Compression is built in; avoid duplicate images.
- For a single animation with no assets, raw Lottie JSON is smaller and simpler.

## 10. Runtime profiling

Measure, do not guess:

- File size and parse time.
- First-frame time.
- Frame time / dropped frames on a low-end Android device.
- Memory after 60 s of loop.
- Battery/CPU for ambient loops.
- iOS Core Animation vs main-thread rendering.
- Web SVG vs Canvas vs HTML renderer.

A 200 KB file with masks can be slower than a 1 MB file of simple shapes.

## 11. Optimization checklist

- [ ] Audit passes; score ≥ 80.
- [ ] File size within budget.
- [ ] Layer/keyframe counts within budget.
- [ ] No unused assets/layers.
- [ ] No masks/effects unless tested.
- [ ] No merge paths/luma mattes/expressions/3D.
- [ ] Text outlined or font bundled.
- [ ] Images compressed and bundled.
- [ ] Keyframes reduced and rounded.
- [ ] JSON minified for delivery.
- [ ] Loop boundary and final frame checked.
- [ ] Runtime profiling done on a real device.
