# Runtime support matrix

Source: Lottie supported-features matrix (Airbnb) and dotLottie specification. Symbols: 👍 supported, ⛔ not supported, ❔ partial/unknown. This is a planning table, not a guarantee — test the exact runtime version you ship.

| Feature | Android | iOS Core Animation | iOS Main Thread | Web SVG | Web Canvas |
|---|---|---|---|---|---|
| Shape / rect / ellipse / group | 👍 | 👍 | 👍 | 👍 | 👍 |
| Polystar | 👍 | 👍 | 👍 | 👍 | 👍 |
| Repeater | 👍 | 👍 | ⛔ | 👍 | 👍 |
| Trim path (individually) | 👍 | 👍 | 👍 | 👍 | 👍 |
| Trim path (simultaneously) | 👍 | ⛔ | 👍 | 👍 | 👍 |
| Fill / stroke colour | 👍 | 👍 | 👍 | 👍 | 👍 |
| Linear / radial gradient | 👍 | 👍 | 👍 | 👍 | 👍 |
| Transform / parenting | 👍 | 👍 | 👍 | 👍 | 👍 |
| Auto-orient | ⛔ | ⛔ | ⛔ | 👍 | 👍 |
| Skew | ❔ | 👍 | 👍 | 👍 | 👍 |
| Linear / bezier / hold easing | 👍 | 👍 | 👍 | 👍 | 👍 |
| Mask path / opacity | 👍 | 👍 | 👍 | 👍 | 👍 |
| Mask add / subtract | 👍 | 👍 | 👍 | 👍 | 👍 |
| Mask intersect | 👍 | 👍 | 👍 | ⛔ | ⛔ |
| Alpha matte | 👍 | 👍 | 👍 | 👍 | 👍 |
| Luma matte | ⛔ | ⛔ | ⛔ | ❔ | ❔ |
| Merge paths | 👍 (KitKat+) | ⛔ | ⛔ | ⛔ | ⛔ |
| Text glyphs | 👍 | ⛔ | ⛔ | 👍 | 👍 |
| Text fonts | 👍 | 👍 | 👍 | 👍 | 👍 |
| Text transform / fill / stroke | 👍 | 👍 | 👍 | 👍 | 👍 |
| Text range selectors | ⛔ | ⛔ | ⛔ | 👍 | 👍 |
| Images | 👍 | 👍 | 👍 | 👍 | 👍 |
| Precomps | 👍 | 👍 | 👍 | 👍 | 👍 |
| Time stretch / time remap | 👍 | 👍 | 👍 | 👍 | 👍 |
| Markers | 👍 | 👍 | 👍 | 👍 | 👍 |
| Fill/stroke/tint effects | ⛔ | ⛔ | ⛔ | 👍 | 👍 |
| Gaussian blur | 👍 (4.1+) | ⛔ | ⛔ | ❔ | ❔ |
| Drop shadow | 👍 (4.1+) | 👍 | 👍 | ❔ | ❔ |
| Expressions | ⛔ | ⛔ | ⛔ | 👍 | 👍 |
| 3D layers | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| Blend modes | partial | partial | partial | partial | partial |

## Platform notes

### Android (lottie-android)

- Drop shadows and blur are applied per fill/stroke, not per layer; overlapping shapes can darken.
- Blur/shadow may clip at precomp bounds; add padding.
- Merge paths are supported on KitKat+; do not assume iOS will match.
- Test on a low-end device; masks and effects are the main cost.

### iOS (lottie-ios)

- Lottie 4+ uses Core Animation by default; it falls back to the main-thread engine when a feature is unsupported.
- Merge paths and some complex boolean shapes are not supported by Core Animation.
- Core Animation and main thread can render some shapes differently; test the actual path.
- Luma mattes are not supported; use alpha matte.

### Web (lottie-web)

- SVG, Canvas and HTML renderers have different support; SVG is the most feature-complete but can be slower with many nodes.
- Expressions and range selectors are web-only; they are not portable to mobile.
- Test the production renderer, not only the LottieFiles preview.

### dotLottie

- v1.0: widely supported; `manifest.json`, `animations/`, optional `images/`.
- v2.0: `a/` and `i/`, themes, state machines, fonts; runtime support varies.
- A raw Lottie JSON is smaller for one animation with no assets; dotLottie wins when bundling images/fonts or multiple animations.
- State machines are not a replacement for app navigation/business logic.

## Runtime QA rule

Do not hand off on “it plays in the preview”. Test:

1. The exact runtime and version in the app.
2. iOS and Android (and web if shipped).
3. A low-end device for long/looping animations.
4. Reduce Motion on both platforms.
5. Pause/resume, background/foreground, and repeated loops.
6. Memory after 60 s of looping.
