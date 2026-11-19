# Figma Motion → Lottie/dotLottie

## 1. Native export (recommended for Figma-authored UI motion)

Requirements:

- A **top-level frame** containing the animated layers. Layers inside a component instance are fine; the frame is what exports.
- Edit access and copying/sharing allowed.
- Figma Motion open beta. Access is on Starter, Professional, Education, Organization and Enterprise.

Steps:

1. Select the **top-level frame**. Frames with animation show the Motion icon.
2. Open **Export** in the right panel.
3. Switch to the **Animated** tab.
4. Choose the format:
   - **Lottie** — one animation, raw JSON, no built-in compression.
   - **dotLottie** — ZIP with animation(s), images/fonts where applicable; multiple animations per file.
   - **MP4 / WebM / GIF / SVG** — preview only, not the production asset.
5. Set size and frame rate. Above 1920×1080 or 30 fps requires a paid plan.
6. Export. The file opens in a tab; download it.
7. Save into `motion/<project>/assets/` with the motion ID, not `Frame 123`.

If the **Animated** tab or the Lottie/dotLottie option is missing, your Figma plan/build does not expose it. Update Figma, check the file permissions, or use the Python generator/LottieFiles path. Do not claim native export without seeing the format in the tab.

Lottie limitations from Figma:

| Figma feature | Lottie result |
|---|---|
| Shaders | Unsupported; flat image |
| Video | Unsupported; export MP4/WebM/GIF |
| Angular gradients | Unsupported; flat image |
| Drop shadows, noise, glass | Partial; appearance frozen at the first frame |
| Text | Font-dependent; outline or bundle |
| Masks/effects | Supported with runtime caveats; test |
| Complex blend modes | Partial |

## 2. Pre-export checklist

- [ ] Frame is top-level; layers are inside it.
- [ ] Timeline duration and fps match the spec.
- [ ] Layer names match the spec; no `Frame 123`, `Rectangle 4`.
- [ ] No expressions, 3D, luma mattes, merge paths or angular gradients unless tested.
- [ ] Text is outlined or the font is bundled/known.
- [ ] Images are compressed and bundled.
- [ ] Reduce-motion alternative exists.
- [ ] Loop boundary is clean (first frame = last frame for loops).
- [ ] The final frame equals the static screen.

## 3. Verify in Figma Motion

1. Toolbar → **Motion**.
2. Select the top-level frame.
3. Timeline shows a track per animated layer.
4. Scrub to 0 / 25 / 50 / 75 / 100% and compare with the spec.
5. Press Play; check timing and choreography.
6. Check the right panel **Animations** list and timeline track names.
7. Check the final frame.

`figma.motion.playheadPosition` is read-only. To verify with an agent, open Motion manually and use GUI automation or screenshots; the plugin API cannot set the playhead.

## 4. Figma Motion API traps (figma-agent 1.6.11, typings 1.142.0)

| Trap | Reality |
|---|---|
| Playback control | `playheadPosition` is read-only; no play/pause/loop API |
| Main component animation | `applyAnimationStyle` on a `COMPONENT` fails: `Cannot write animations to product components via the plugin API` |
| Instances/frames | Allowed |
| Preset readback | `node.animationStyles` works; `node.animations` is empty for preset styles |
| Manual keyframes | `node.manualKeyframeTracks` and `node.animations` both show them |
| Timeline owner | The containing top-level frame; children share it |
| Default timeline | 2 s on a new frame; `setTimelineDuration` works |
| TIMING variables | Store **seconds**; spec uses **milliseconds** |
| Token binding | `props.duration`, `props.easing`, `props.distance` accept `VARIABLE_ALIAS`; top-level `duration` accepts a number only |
| Clone | `clone_node` keeps animation; `copy_nodes`/`paste_nodes` lose it |
| `get_node` | No motion summary yet; read via `execute_code` |
| Native export | UI action; no MCP tool |
| Rewriting a track | `applyManualKeyframeTrack` **merges** with the keyframes already on that property; old keyframes at other times survive. Call `removeManualKeyframeTrack({type:'PROPERTY', name})` first, then apply |
| Auto-keyframe at the playhead | While Motion is open, changing an animated property from the plugin (e.g. `node.opacity = 1` "just to export") makes Figma record a keyframe **at the playhead**. Never touch animated properties on the original; work on a clone or close Motion |
| Export / screenshot with Motion open | `exportAsync`, `absoluteRenderBounds` and `screenshot` render the state **at the playhead**, even on a clone whose tracks were removed. `x`, `y`, `width`, `height`, `rotation`, `relativeTransform`, `absoluteBoundingBox` stay static. Close Motion before exporting static layers |
| `SCALE_XY` | Needs a `VECTOR` value; use `SCALE_X` + `SCALE_Y` (FLOAT) |
| `TRANSLATION_X/Y` | Offset from the layer's static position (`baseValue` 0), not an absolute position |
| `ROTATION` | Degrees, positive = counter-clockwise; origin = layer centre |
| Easing | Set on a keyframe, it shapes the segment **from** that keyframe to the next; the last keyframe's easing is unused. Default is a cubic `(0.5, 0, 0.5, 1)` |
| Skew / perspective | No skew track. Fake a flat perspective quad with nested frames — see §4.2 |
| `relativeTransform` with skew | Figma normalises the axes to unit length; put the scale into `width`/`height` |
| Hidden layers | A `visible: false` layer stays hidden on the timeline; after toggling visibility for checks, restore it and re-scan the frame (`findAll(n => !n.visible)`) |

### Apply a preset

```js
const id = node.applyAnimationStyle('Position', {
  duration: 0.4,
  timelineOffset: 0,
  props: { type: 'slide_in', direction: 'bottom', distance: 40 }
});
```

### Manual keyframes

```js
node.applyManualKeyframeTrack(
  { type: 'PROPERTY', name: 'OPACITY' },
  {
    baseValue: { type: 'FLOAT', value: 1 },
    keyframes: [
      { timelinePosition: 0, value: { type: 'FLOAT', value: 0 } },
      { timelinePosition: 0.4, value: { type: 'FLOAT', value: 1 } }
    ]
  }
);
```

### Timeline duration

```js
frame.setTimelineDuration(frame.timelines[0].id, 0.7);
```

### Custom style

```js
const style = figma.createCustomAnimationStyle();
style.name = 'Motion/Press';
await style.addAnimationEntryAsync('Scale', { type: 'scaleIn', amount: 96, duration: 0.12 });
node.applyAnimationStyle(style.id, { type: 'CUSTOM', timelineOffset: 0 });
```

### 4.1 Write the whole timeline from one table

Keep the choreography in one object (node id → property → `[t, value, easing]`), clear every track in the frame, then write all of it. Re-running it is idempotent; editing one track by hand is how stray keyframes appear.

```js
const E = { out:{type:'EASE_OUT'}, inout:{type:'EASE_IN_AND_OUT'}, lin:{type:'LINEAR'}, hold:{type:'HOLD'} };
const C = {
  '8:726': { OPACITY: [[0.4,0,'out'],[0.64,1]], ROTATION: [[0.8,0,'inout'],[0.88,-9,'inout'],[1.0,9,'inout'],[1.12,0]] },
  '8:1416': { OPACITY: [[2.75,0,'out'],[3.15,1]], TRANSLATION_X: [[2.75,120,'out'],[3.2,0]] }
};
const root = await figma.getNodeByIdAsync(FRAME_ID);
for (const n of root.findAll(() => true))
  for (const p of Object.keys(n.manualKeyframeTracks || {})) n.removeManualKeyframeTrack({ type: 'PROPERTY', name: p });
for (const [id, props] of Object.entries(C)) {
  const n = await figma.getNodeByIdAsync(id);
  for (const [prop, kfs] of Object.entries(props))
    n.applyManualKeyframeTrack({ type: 'PROPERTY', name: prop }, { keyframes: kfs.map(([t, v, e]) => ({ timelinePosition: t, value: { type: 'FLOAT', value: v }, ...(e ? { easing: E[e] } : {}) })) });
}
root.setTimelineDuration(root.timelines[0].id, 7.6);
```

After writing, read every track back and compare its keyframe count with the table; any extra keyframe (often sitting exactly at the user's playhead time) is a stray to remove.

Global edits work on the read-back: scale all times (`t × 0.8` = 20 % faster), or shift every keyframe after a gap (`t − 0.84`) to close a pause — always remove + re-apply, never apply on top.

### 4.2 Perspective without skew: rotate → squash → rotate

Laying an upright layer (a phone held to camera) down onto a surface seen in perspective means mapping a rectangle onto a parallelogram. A 2×2 matrix `M` (columns = where the layer's x and y axes land) decomposes by SVD into `R(a) · diag(sx, sy) · R(b)`. Build it with nesting, outermost first:

```
Wrapper · rotate   ← ROTATION a, TRANSLATION_X/Y, OPACITY
  Wrapper · squash ← SCALE_X sx, SCALE_Y sy
    Layer          ← ROTATION b (plus its own animation)
```

All three share the same size and centre. Of the four equivalent SVD branches (flip both rotations by 180°, or swap the singular values with ±90°), pick the one with the smallest `|a| + |b|` so the motion does not spin. Verify the target statically with a temporary rectangle whose `relativeTransform` = `M` (unit-length columns, scale moved into width/height) laid over the destination, then delete it. End the move with a 0.1–0.15 s cross-fade into the final baked image (e.g. the phone lying on the cup); without that the shapes jump.

Keep content readable through the move: if the layer turns 90° (portrait → landscape), counter-rotate its content (`ROTATION −90` on the picture) so the subject stays level, and decide which end leads from the story (the end with the camera faces the surface it projects onto).

### 4.3 Check the timing frame by frame

The agent cannot scrub the timeline, so re-render it outside Figma:

1. Ask the user to **close Motion** (toolbar), otherwise every export is the playhead state.
2. Export the scene with `execute_code` + `savePath` (script below): one PNG per static layer from a **clone** (never touch the original), each animated ancestor's static box and tracks.
3. `python3 scripts/render_frames.py <scene.json> <out-dir> --step 0.1` writes one frame per 0.1 s plus labelled contact sheets (`sheet-N.png`, 20 frames each); `--from/--to/--step 0.05` zooms on a segment, `--gif` writes a preview.
4. Read the sheets: stops/pauses between steps, wrong order, jumps at cross-fades, layers reappearing (stray keyframes), content leaving its container.
5. When Motion is open, the user's own playback/screenshot is the only ground truth; ask for an MP4 export (Export → Animated → MP4) and cut it with `ffmpeg -i in.mp4 -vf fps=10 f_%03d.png` when exact pixels matter.

The renderer assumes centre origins and ignores nested clipping; it checks choreography, not pixels.

```js
const FRAME_ID = '7:140';
const root = await figma.getNodeByIdAsync(FRAME_ID);
const rb = root.absoluteBoundingBox;
const box = n => { const a = n.absoluteBoundingBox; return { x: a.x - rb.x, y: a.y - rb.y, w: a.width, h: a.height }; };
const tracks = n => Object.fromEntries(Object.entries(n.manualKeyframeTracks || {}).map(([k, b]) => [k, b.keyframes.map(f => ({ t: f.timelinePosition, v: f.value.value, e: f.easing.type, bz: f.easing.easingFunctionCubicBezier || null }))]));
const animated = n => Object.keys(n.manualKeyframeTracks || {}).length > 0;
const deepAnimated = n => 'findAll' in n && n.findAll(animated).length > 0;
const nodes = {}, layers = [];
const exportClone = async (n, parents) => {
  const b = box(n), c = n.clone();
  figma.currentPage.appendChild(c); c.x = -20000; c.y = -20000; c.opacity = 1; c.visible = true;
  if ('children' in n) n.children.forEach((ch, i) => { if (animated(ch) || deepAnimated(ch)) c.children[i].visible = false; });
  const bb = c.absoluteBoundingBox, rr = c.absoluteRenderBounds || bb;
  const bytes = await c.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  c.remove();
  layers.push({ id: n.id, name: n.name, parents, png: figma.base64Encode(bytes), render: { x: b.x + rr.x - bb.x, y: b.y + rr.y - bb.y, w: rr.width, h: rr.height } });
};
const visit = async (n, parents) => {
  if (!n.visible) return;
  nodes[n.id] = { name: n.name, box: box(n), opacity: n.opacity, tracks: tracks(n) };
  await exportClone(n, parents);
  if ('children' in n) for (const ch of n.children) if (animated(ch) || deepAnimated(ch)) await visit(ch, [...parents, n.id]);
};
for (const ch of root.children) await visit(ch, []);
return { size: [rb.width, rb.height], duration: root.timelines[0].duration, nodes, layers };
```

## 5. Native vs Python

| Need | Native Figma export | Python generator |
|---|---|---|
| Text stagger, path draw, masks, effects | Yes, if Figma exports them | No (v1) |
| Exact Figma timeline | Yes | Re-authored approximation |
| Batch/parameterised | No, UI per file | Yes |
| No Figma UI | No | Yes |
| Text baseline | Figma fidelity | Approximate |
| Output | Lottie/dotLottie + video preview | Lottie + dotLottie v1 |

Use native for fidelity. Use Python for batch/variants/test data. If both are used, export native, then audit/normalize with Python.
