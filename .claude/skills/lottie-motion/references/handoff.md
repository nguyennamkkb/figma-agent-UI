# Handoff — what the developer actually needs

A Figma link is not an animation handoff. The developer needs the asset, the spec, the runtime behaviour and the proof.

## 1. Package

```
motion/<project>/
├── spec/
│   └── MOT-012.yaml
├── tokens.json
├── assets/
│   ├── MOT-012.json              Lottie JSON (if used)
│   └── MOT-012.lottie            dotLottie (if used)
├── preview/
│   └── MOT-012.mp4               review only
├── compatibility/
│   └── runtime-report.md
├── implementation/
│   ├── ios.md
│   └── android.md
└── qa/
    └── checklist.md
```

Optional: `design/figma-link.md` with the file, page, frame and node id.

## 2. Motion spec — required fields

Use `assets/motion-spec.template.yaml`. The fields that change implementation:

| Field | Why |
|---|---|
| `motion_id` | Stable identifier across Figma, code and QA |
| `name` | Human name |
| `category` | Micro / navigation / gesture / system / expressive / ambient |
| `platforms` | iOS, Android, web |
| `format` | Lottie, dotLottie, native, MP4 |
| `purpose` | Why the motion exists; review criterion |
| `trigger` | When it starts |
| `initial_state` / `final_state` | What changes |
| `animation.duration_ms` / `fps` / `canvas` | Implementation values |
| `animation.loop` / `playback` | Runtime behaviour |
| `choreography[]` | Target, property, from/to, start/end, easing |
| `tokens` | Duration/easing/distance used |
| `lottie.text_strategy` | Outline or bundled font |
| `interruption` | What happens on rapid taps/background/foreground |
| `accessibility.reduce_motion` | The alternative |
| `implementation.preferred` / `fallback` | Lottie vs native |
| `qa[]` | Test commitments |

## 3. Runtime report

Write `compatibility/runtime-report.md`:

```markdown
# Runtime report — MOT-012

| Runtime | Version | Result | Notes |
|---|---|---|---|
| iOS (lottie-ios) | 4.x | pass | Core Animation; no merge paths |
| Android (lottie-android) | 6.x | pass | shadow rendered per shape |
| Web (lottie-web SVG) | 5.x | pass | not shipped on mobile |
| dotLottie player | x.y | pass | v1 package |

- File: assets/MOT-012.json · 287 KB · checksum sha256:…
- Device: iPhone 13 / Pixel 4a / Chrome 120
- Performance: first frame 80 ms; 60 fps steady; memory stable after 60 s
- Known limits: text outlined; no masks; no effects
```

## 4. iOS notes

- Runtime version and how the asset is loaded.
- `loopMode` / play once; how to stop/reset.
- Reduce Motion selection (`UIAccessibility.isReduceMotionEnabled`).
- Background/foreground behaviour.
- Memory/performance note.
- Fallback if the asset fails to load.

## 5. Android notes

- Runtime version; Compose vs View.
- `repeatCount`, `setRepeatMode`, `playAnimation`.
- Reduce Motion: `Settings.Global.ANIMATOR_DURATION_SCALE == 0` (or app setting).
- Background/foreground and lifecycle.
- Shadow/blur caveats.
- Fallback.

## 6. Versioning

- Asset version in the spec (`revision` + date).
- Checksum in the runtime report.
- Never overwrite an asset in place without a version bump.
- Keep the previous asset for rollback.
- Name files with the motion ID, not the screen name only.

## 7. Handoff checklist

- [ ] Spec complete and approved.
- [ ] Lottie/dotLottie audit passes.
- [ ] Preview exported.
- [ ] Runtime report with real versions/devices.
- [ ] iOS and Android notes.
- [ ] Reduce Motion alternative.
- [ ] Interruption/replay behaviour.
- [ ] Checksum and version.
- [ ] Rollback asset.
- [ ] Owner and date.

## 8. Example

`examples/payment-success.spec.json` and `examples/payment-success.lottie.json` are the working pair. The spec follows the compact Python schema; the handoff spec is the richer YAML template.
