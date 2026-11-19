# Lottie QA — four layers plus handoff

A Lottie is ready only when all four layers pass. A green audit is necessary, not sufficient.

## 1. Structural audit

Run:

```bash
python3 scripts/lottie_audit.py <file.json> --markdown
```

Pass criteria:

- No blockers.
- Score ≥ 80 (A or B).
- File size, layers, keyframes and duration within the project budget.
- Every text layer has fonts or is outlined.
- Images exist and are bundled.
- No unsupported feature without a written test note.

Blockers (examples):

- Invalid JSON, missing `v`/`fr`/`ip`/`op`/`w`/`h`/`layers`.
- Keyframe outside `ip..op`.
- 3D layer, expression, angular gradient.
- Text without fonts.
- Image asset with a missing path.
- File over the hard budget.

Warnings that need a decision:

- Masks, mattes, merge paths, effects, repeaters, blend modes, time remap.
- Text layers (font dependency).
- Large images, many layers/keyframes, long duration, high fps.

## 2. Motion review (does it match the spec?)

- Timing matches the spec (duration, delay, stagger).
- Easing matches the intended feel; no accidental linear.
- Distance and scale are consistent with tokens.
- Choreography hierarchy is correct (what enters first, what follows).
- No layer moves without a reason.
- Final frame equals the static screen.
- Loop: first frame = last frame; no jump at the wrap.
- Interruption/replay behaviour is defined.

Evidence: scrub in Figma Motion at 0/25/50/75/100%, or render frames with the target player; compare side by side with the spec.

## 3. Visual QA

For each asset:

- [ ] Frame 0, 25, 50, 75, 100% match the spec.
- [ ] No clipped text or shape at any frame.
- [ ] No visible jump at the loop boundary.
- [ ] No missing image/font.
- [ ] Colours match tokens; no unintended opacity.
- [ ] Composition holds at 1×, 2×, 3× scale.
- [ ] Final frame is stable and matches the app screen.
- [ ] Preview (MP4/GIF) matches the Lottie.

## 4. Technical / runtime QA

- [ ] iOS: exact lottie-ios version; Core Animation vs main thread; no unsupported feature.
- [ ] Android: exact lottie-android version; low-end device; shadow/blur clipping.
- [ ] Web: exact lottie-web renderer (SVG/Canvas/HTML); expressions/range selectors only if web.
- [ ] dotLottie: runtime supports v1/v2, themes/state machines if used.
- [ ] First-frame time acceptable.
- [ ] Frame time / dropped frames acceptable.
- [ ] Memory stable after 60 s loop.
- [ ] Pause/resume, background/foreground, repeated loops.
- [ ] No crash on missing font/image.

## 5. Accessibility QA

- [ ] Reduce Motion alternative exists (static frame or short cross-fade).
- [ ] Essential information is not conveyed only by motion.
- [ ] Screen reader announcement/label is defined.
- [ ] Motion does not block interaction; no forced wait to continue.
- [ ] Contrast of text/icon remains valid in the final frame.
- [ ] Flashing/rapid motion is within safe limits.

Lottie does not read the OS Reduce Motion setting. The app must choose the reduced asset or state.

## 6. Performance QA

- [ ] File size within budget.
- [ ] No masks/effects unless tested.
- [ ] No giant images.
- [ ] No per-frame baked keyframes.
- [ ] Layer/keyframe counts within budget.
- [ ] Profiled on a real low-end device.
- [ ] Long loop does not leak memory or heat the device.

## 7. Handoff QA

- [ ] Motion ID and asset version match the spec.
- [ ] Lottie/dotLottie opens in the target player.
- [ ] Spec, asset, preview, compatibility and iOS/Android notes are present.
- [ ] Checksum recorded.
- [ ] Rollback asset/version noted.
- [ ] Owner and date recorded.

## 8. Scorecard

| Layer | Weight | Pass |
|---|---|---|
| Structural audit | 30% | No blockers, score ≥ 80 |
| Motion match | 25% | Spec frames and choreography match |
| Visual | 15% | No clipping/jump/missing assets |
| Runtime | 20% | iOS + Android (+ web) pass |
| Accessibility | 10% | Reduce Motion + no motion-only info |

A 90+ asset is handoff-ready. 75–89 is “fix warnings or document”. Below 75 or any blocker is not ready.

## 9. Failure signatures

| Symptom | Likely cause |
|---|---|
| Works in Figma, blank on Android | Unsupported feature (luma matte, merge path, expression) or missing image path |
| Text jumps to another font | Font not bundled/installed; outline instead |
| Shadow looks doubled on Android | Per-shape shadow on overlapping fills; flatten/bake |
| Loop jumps | First/last frame differ; intermission not set |
| File huge | Baked per-frame keyframes, large images, unused layers |
| Slow on old phones | Masks, effects, many layers, large images |
| Animation stops after one play | `loop` not set in manifest/app; asset is once-only |
| Reduced motion ignored | App doesn't select the reduced asset; Lottie can't read OS setting |
