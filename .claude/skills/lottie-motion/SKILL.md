---
name: lottie-motion
description: Design and export production-grade Lottie/dotLottie animations for mobile and web — motion brief, motion spec, motion tokens, Figma Motion authoring, native Figma Lottie/dotLottie export, Python generation, structural audit, runtime compatibility, optimization, QA and developer handoff. Invoke as `/lottie-motion start <brief>`, `/lottie-motion build [MOT-ID]`, `/lottie-motion audit <file>`, `/lottie-motion handoff [MOT-ID]`. Use when the user asks to design or export Lottie, convert Figma Motion to Lottie/dotLottie, make an SVG/icon/loading/success animation, optimize or audit a Lottie file, prepare a motion handoff, or says "xuất Lottie", "làm animation Lottie", "dotLottie", "tối ưu Lottie", "kiểm tra Lottie", "Figma Motion sang Lottie", "bàn giao animation". Figma mechanics come from figma-agent-tools; screen design from figma-ui-flow.
---

# lottie-motion — design for the runtime, export once

Lottie is a **delivery format**, not a design file. A timeline that looks perfect in Figma can fail on a phone because of masks, effects, fonts, images or unsupported features. This skill designs for the runtime first, then exports and proves it.

```
brief → motion spec → tokens → path decision → Figma design → animate → export → audit → visual QA → runtime QA → handoff
```

## Commands

| Call | What it does |
|---|---|
| `/lottie-motion start <brief>` | Classify the motion, choose the delivery path, write the motion spec and token set, plan the asset. Gate: user approves spec + path + budgets. |
| `/lottie-motion build [MOT-ID]` | Build/refresh the Figma frame and animation, export Lottie/dotLottie (native or Python), run audit. Gate: audit valid, score ≥ 80, visual frames pass. |
| `/lottie-motion audit <file>` | Read-only audit of a Lottie JSON: structure, feature risks, budgets, keyframes, text, images, score. Prints blockers/warnings. |
| `/lottie-motion handoff [MOT-ID]` | Package spec, asset, preview, compatibility report, iOS/Android notes and QA. Gate: user approves the package. |

No argument: list `motion/*/spec/*.yaml` and ask which motion to work on.

## Hard rules

1. **Spec before animation.** No keys are touched until the motion spec exists: purpose, trigger, states, choreography, duration, easing, interruption, reduce-motion alternative, platform and implementation.
2. **Choose the path before drawing.** The export path decides what you may draw. Changing it late usually means rebuilding.
3. **Vector-first.** Raster is allowed only when the image is the subject (photo, texture). Every raster is a size and runtime risk.
4. **Text is a runtime decision.** Outline text for identical rendering, or bundle the font (dotLottie v2). Never rely on a font that may be absent on the device.
5. **No unsupported feature without a test.** Expressions, 3D, luma mattes, merge paths, angular gradients, effects, video and shaders are blocked or partial on mobile. Test on the target runtime or remove them.
6. **Budgets are part of the spec.** Defaults: ≤ 500 KB, ≤ 100 layers, ≤ 500 keyframes, ≤ 10 s, 30/60 fps, one animation per asset. A project may override with a reason.
7. **Loop boundary is designed.** First and last frame must match for seamless loops; test the wrap, not only the middle.
8. **Reduce Motion is a second asset or a state change.** Lottie does not read the OS setting; the app chooses. Spec the alternative.
9. **Audit every export.** `lottie_audit.py` must pass with no blockers before handoff. A visual-only check is not enough.
10. **Version everything.** Motion ID, asset version, checksum, runtime versions, source Figma frame. Handoff without version is not handoff.

## Choose the path

| Situation | Path | Why |
|---|---|---|
| UI/icon/illustration designed in Figma, top-level frame, needs text stagger, path draw, masks or Figma-native fidelity | **Figma Motion → native Lottie/dotLottie export** | Figma exports the actual timeline; highest fidelity, least re-authoring |
| Batch, parameterised, simple transform/opacity/colour/text, pre-cut image layers | **Python generator** (`scripts/motion_to_lottie.py`) | Deterministic, no UI, easy to generate many variants |
| Interactive prototype, click/tap states, state machine | **LottieFiles / dotLottie** or native prototype | State machine support varies; test the runtime |
| Complex character, vector morph, effects-heavy | **After Effects + Bodymovin/LottieFiles** | More authoring control; audit remains mandatory |
| Gesture-driven, navigation, data-bound, business state | **Native** (SwiftUI/Compose) | Lottie cannot follow a finger or app state |
| Complex physics, particles, 3D | **Native / Rive / engine** | Lottie is not a physics engine |

### Lottie JSON or dotLottie?

| Use | Choose |
|---|---|
| One animation, runtime accepts JSON, smallest file | **Lottie JSON** (minified) |
| Multiple animations, images, fonts, themes, state machine | **dotLottie** |
| Preview for review only | MP4/WebM/GIF/SVG, not the production asset |

Figma Motion native export supports Lottie JSON and dotLottie plus MP4/WebM/GIF/SVG for preview. The Python packer in this skill bundles JSON + images into dotLottie v1; use native dotLottie when fonts or many assets are involved.

## `/lottie-motion start <brief>`

1. Read the brief and classify the motion: micro-interaction, navigation, gesture, system feedback, expressive or ambient.
2. Ask only for what is missing: trigger, initial/final state, interruption, reduce-motion expectation, target platforms, runtime versions, file-size budget.
3. Choose the path from the table. If the answer is native, say so and stop — do not force Lottie.
4. Copy `assets/motion-spec.template.yaml` to `motion/<project>/spec/<MOT-ID>.yaml`; fill every field that affects rendering.
5. Copy `assets/motion-tokens.example.json` to `motion/<project>/tokens.json`; keep the project's scale, not the defaults.
6. Plan the asset: canvas, fps, duration, loop, text strategy, images, masks, effects, expected file size.
7. Validate: `python3 scripts/spec_check.py motion/<project>/spec/<MOT-ID>.yaml --markdown`. Fix errors before the gate.
8. **Gate:** show a short table (path, canvas, fps, duration, loop, text, budgets, unsupported risks). Wait for "ok".

Project data lives outside the skill:

```
motion/<project>/
├── spec/MOT-012.yaml
├── tokens.json
├── assets/
├── preview/
├── compatibility/
├── implementation/
└── qa/
```

## `/lottie-motion build [MOT-ID]`

1. Read the spec and tokens. If the spec is incomplete, go back to `start`. Run `python3 scripts/spec_check.py <spec> --markdown`.
2. Build/reuse the Figma frame with `figma-ui-flow` and `figma-agent-tools`. The animated frame must be a **top-level frame** for native animation export.
3. Animate:
   - **Figma Motion:** until a dedicated `set_motion` tool exists, use `execute_code` with `applyAnimationStyle` / `applyManualKeyframeTrack` / `setTimelineDuration`. Read `references/figma-export.md` for the exact calls and traps.
   - **Prototype:** use `set_interactions` for Smart Animate / transitions; read `figma-agent-tools`.
   - **Python path:** write the compact spec JSON (see `references/python-generator.md`) and run `scripts/motion_to_lottie.py`.
4. Export:
   - Native: select the top-level frame → **Export → Animated → Lottie** (single) or **dotLottie** (bundle) → save to `motion/<project>/assets/`.
   - Python: `python3 scripts/motion_to_lottie.py spec.json assets/<name>.json`.
5. Audit: `python3 scripts/lottie_audit.py assets/<name>.json --markdown`. Fix blockers; review warnings.
6. Visual QA: frames at 0/25/50/75/100%, loop boundary, text clipping, final frame equals the static screen. Compare with Figma Motion scrub.
   Before export, check the choreography every 0.1 s: close Motion, export the scene (`references/figma-export.md` §4.3), run `python3 scripts/render_frames.py <scene.json> <out-dir> --step 0.1` and read the `sheet-N.png` contact sheets — pauses, jumps, stray keys and wrong angles show up there, not in a single screenshot.
   Iterate in small steps: one beat (one object, one move) per change, shown in Figma before the next.
7. **Gate:** audit valid + score ≥ 80 + visual pass. Record the evidence in `qa/`.

### Figma Motion API traps

- `figma.motion.playheadPosition` is **read-only**; scrub/play is manual UI or GUI automation.
- Main **components** reject animation writes: `Cannot write animations to product components via the plugin API`. Apply to instances or wrapper frames.
- Preset styles do **not** appear in `node.animations`; read them from `animationStyles`. Manual keyframe tracks do appear in `animations`.
- `TIMING` variables store **seconds**; playbook specs use **milliseconds**. Convert `ms / 1000`.
- `copy_nodes` / `paste_nodes` lose animation; `clone_node` keeps it.
- `get_node` currently has no motion summary; use `execute_code` until the tool exists.
- Native export is a UI action; `figma-agent` cannot click it. Use the manual steps or the Python path.
- `applyManualKeyframeTrack` **merges** with the existing track: `removeManualKeyframeTrack` first, and write the whole timeline from one table (`figma-export.md` §4.1).
- With Motion open, setting an animated property (opacity, position…) from the plugin **adds a keyframe at the playhead**. Edit static values with Motion closed, then read back keyframe counts.
- With Motion open, `exportAsync` / `screenshot` / `absoluteRenderBounds` render the **playhead state** (even on clones); `x/y/width/height/rotation` stay static. Close Motion before exporting assets.
- `SCALE_XY` wants a vector value: use `SCALE_X` + `SCALE_Y`. `TRANSLATION_X/Y` is an offset from the static position; `ROTATION` is degrees, counter-clockwise, around the layer centre; easing on a key drives the segment that starts there.
- No skew/perspective track: fake a perspective tilt with nested wrappers rotate → squash → rotate (SVD), then cross-fade into a baked image (`figma-export.md` §4.2).
- Hidden layers stay hidden in the timeline: check `visible` after cloning or rebuilding.

## `/lottie-motion audit <file>`

Run:

```bash
python3 scripts/lottie_audit.py <file.json> --markdown
```

The audit checks:

- Required fields, dimensions, fps, duration, frame range.
- Keyframes outside the timeline, duplicate/non-monotonic times, missing `e`.
- 3D layers, expressions, angular gradients, text without fonts, missing image paths.
- Masks, mattes, merge paths, effects, repeaters, blend modes, time remap.
- Layer/keyframe/file-size budgets, fps, duration, image dimensions.
- Text dependency and duplicate layer names.

Use `references/qa.md` for the full rubric. A blocker stops handoff; a warning needs a decision and a note.

## `/lottie-motion handoff [MOT-ID]`

Produce the package from `references/handoff.md`:

```
motion/<project>/
├── spec/MOT-012.yaml
├── assets/MOT-012.json
├── assets/MOT-012.lottie          (if dotLottie)
├── preview/MOT-012.mp4
├── compatibility/runtime-report.md
├── implementation/ios.md
├── implementation/android.md
└── qa/checklist.md
```

Include motion ID, trigger, states, choreography, tokens, duration/easing, interruption, reduce-motion alternative, runtime versions, checksum and rollback note.

## Expert rules that prevent most failures

| Risk | Rule |
|---|---|
| Effects/masks look right in Figma, break on mobile | Prefer shapes, trim paths and precomps; masks only when tested. |
| Luma matte works on web, not mobile | Use alpha matte or bake; luma matte is not supported on iOS/Android. |
| Merge paths work on Android, not iOS | Flatten shape or replace with baked boolean. |
| Drop shadow/noise/glass animate in Figma, freeze in Lottie | Effects are partial; bake or accept a static first-frame appearance. |
| Text renders with a different font | Outline text or bundle font; test on both platforms. |
| File is huge/slow | Remove unused layers, reduce keyframes, compress images, dotLottie, avoid effects. |
| Loop jumps | Design first = last frame; test wrap and intermission. |
| Reduce Motion ignored | Ship a reduced asset or a static state; app chooses. |
| Essential information only in motion | Duplicate it in static UI and accessibility labels. |
| "It works in the preview" | Test in the production runtime version, on a low-end device. |

## Budgets (default)

| Item | Default | Action above |
|---|---|---|
| File size | 500 KB | Remove layers/assets, minify, dotLottie |
| Layers | 100 | Merge shapes, precomps |
| Keyframes | 500 | Reduce, ease, avoid per-frame bake |
| Duration | 10 s | Split or shorten |
| FPS | 30 or 60 | Use 30 for simple UI; 60 for expressive |
| Images | 2048 px | Compress/resize; bundle in dotLottie |
| Masks / effects | 0 unless tested | Replace or test on both platforms |
| Text | outlined or bundled | No raw font dependency |

## References

| Need | Read |
|---|---|
| Path decision, format choice, native vs Lottie | `references/decision-tree.md` |
| Lottie JSON structure, layers, keyframes, easing | `references/lottie-format.md` |
| Figma Motion native export + API traps | `references/figma-export.md` |
| Python spec format, generator, limitations | `references/python-generator.md` |
| Size, performance, asset optimization | `references/optimization.md` |
| Feature support on iOS/Android/web/dotLottie | `references/runtime-matrix.md` |
| QA rubric, visual/runtime/accessibility | `references/qa.md` |
| Handoff package and motion spec | `references/handoff.md` |
| Spec template | `assets/motion-spec.template.yaml` |
| Token example (ms + seconds) | `assets/motion-tokens.example.json` |
| Working example | `examples/payment-success.spec.json`, `examples/payment-success.lottie.json` |
| Validate spec | `scripts/spec_check.py` |
| Generate Lottie | `scripts/motion_to_lottie.py` |
| Audit Lottie | `scripts/lottie_audit.py` |
| Pack dotLottie | `scripts/dotlottie_pack.py` |
| Re-render the Figma timeline every 0.1 s (frames, contact sheets, GIF) | `scripts/render_frames.py` + `references/figma-export.md` §4.3 |

## Working example

From the skill folder:

```bash
python3 scripts/spec_check.py assets/motion-spec.template.yaml --markdown
python3 scripts/motion_to_lottie.py examples/payment-success.spec.json examples/payment-success.lottie.json
python3 scripts/lottie_audit.py examples/payment-success.lottie.json --markdown
python3 scripts/dotlottie_pack.py examples/payment-success.lottie.json examples/payment-success.lottie --loop
```

Expected: valid Lottie, 4 layers, 42 frames @ 60 fps, 12 keyframes, audit score A, dotLottie ~1 KB with `manifest.json` + `animations/payment-success.json`.

## Answer style

Answer in the user's language. Vietnamese when they write Vietnamese. Be concrete about path, spec, budgets and evidence; never claim "production-ready" without audit + runtime QA.
