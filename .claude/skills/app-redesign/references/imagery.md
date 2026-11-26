# Hero and onboarding images — regenerate from the source

Onboarding, splash, paywall hero, home banners and template art carry the app's emotion. The redesign must **keep the emotion and the quality** of the original images. Rule: every new image is generated with **the original image as reference** (`gemini-image-mcp` → `image_generate{refImagePath}`), never from a fresh style prompt.

| Keep (emotion + quality) | Change a little (so it is a new image) |
|---|---|
| composition, camera angle, lens (e.g. wide-angle selfie) | identity of people (face, hair), outfit |
| subject type and action | background details, props |
| emotion (joy, excitement, wonder…) | accent colours pulled toward the new palette |
| light, brightness, sharpness, material (hyperreal, bright) | small light accents (rim light, sparkles) |
| aspect ratio and the empty zone for text / CTA | — |

Minimum change: another identity + one background detail + the accent colours. Less than that is a copy; more than that loses the emotion.

## Change by level (`levels.md`)

The table above is the **L2** treatment. The level of the flow decides how far an image moves; the reference is always the source image, and the onboarding fade template below applies whenever a new image is made.

| Level | Treatment | Reference use | Gate |
|---|---|---|---|
| **L1** | keep the image (hash → `image-map.json` → `keep`); colour grading only if asked, as an image filter on the node | — | none |
| **L2** | minimum change: keep composition, subject, emotion, light, ratio; change identity + one background detail + accent colours | `refImagePath` = source, "Recreate faithfully … change only" | ◆ source \| new |
| **L3** | composition, camera and subject pose may change to fit the new layout; keep subject type, action, emotion, material and quality | `refImagePath` = source, prompt describes the new framing | ◆ source \| new |
| **L4** | new art direction (medium, palette, mood of the approved direction); keep only what the image says (feature, emotion) | source as content reference + the first approved new image as style reference for the rest of the set | ◆ the first image of the set as a style test, then the set |

At L3 and L4 the "Keep" column above shrinks to the image's message and emotion; never drop below the quality of the source (resolution, sharpness, no AI defects).

## Procedure (one image at a time)

1. Source file: `redesign/<app>/images/source/` (exported during `start`; re-export at 2× with `export_assets` if the source is small).
2. Prompt in two blocks: **Keep:** the left column, described concretely for this image. **Change:** the 2–3 changes. Add the palette hex values of the approved direction and "no text, no letters, no UI".
3. `image_generate{prompt, aspectRatio closest to the slot, refImagePath: <source>, savePath: redesign/<app>/images/new/<screen>-<role>.png}`. The first approved image becomes a second reference for the rest of the set (consistency).
4. `Read` the result; reject on AI defects (hands, eyes, warped text), lower resolution than the source, or a different mood.
5. Side by side on Explore: `source | new` frames with the screen code as title; ask the user ◆.
6. Approved → place it into the hero layer's fill (keep the node, change the image), add the entry to `image-map.json` with `approved: true` and the new hash (read it back with `get_node`).

## Onboarding images — the baked bottom fade (mandatory)

Model: AI Chatbot F4, frame `Compare · OB2b · E · fade 76→92%` (`13002:22650`): hero 360×640 at the top of a 360×800 screen whose fill is the background colour (`#FBF6F3`), the fade baked into the image pixels from 76 % to 92 % of its height, the copy block (pager, title, body) starting at y ≈ 592 (92 % of 640) on the flat colour, Next button below. Earlier model kept for the scene recipe: `examples/onboarding-fade-reference.png`.

Two steps: **the AI makes the scene, the script makes the fade.** A fade drawn by the image model lands anywhere between 70 and 95 % and never hits the exact hex; `bake_fade.py` is exact and repeatable.

| Band (of the image height) | Content |
|---|---|
| 0–76 % | the scene at full detail: main subject in the upper two thirds, a foreground element toward the camera, a background in action with depth |
| 68–92 % | progressive Gaussian blur (starts 8 % above the fade) |
| 76–92 % | smoothstep blend into the screen background hex |
| 92–100 % | flat background colour: the copy block starts here |

### 1. Generate the scene

```
[Medium: hyperrealistic cinematic photo | glossy 3D render], tall vertical portrait 9:16.
[Main subject] [doing the feature's action], with a clear [emotion], placed in the upper two thirds of the frame.
Foreground: [element] pushing toward the camera with strong wide-angle perspective.
Background: [scene in action that tells the feature], depth with [particles / light streaks / haze], [warm light] against [cool light].
Palette: [hex values of the direction].
The lower quarter stays simple and continuous (floor, table, soft background, the subject's body): no faces, hands, text or key objects below 75 percent of the height. No fade, no border, no text, no UI.
```

With a source image (redesign): start with "Recreate the reference image faithfully: same composition, same subject, same quality. Change only: …", then the Palette line and the lower-quarter line. The source decides the subject; the template decides the bottom zone.

### 2. Bake the fade

```
python3 SKILL_DIR/scripts/bake_fade.py redesign/<app>/images/new/<screen>-hero.png redesign/<app>/images/new/<screen>-hero.faded.png 0.76 0.92 --bg <screen background hex>
```

- `--bg` is the exact fill of the onboarding frame (`bg/canvas` of the direction; dark apps their near-black). Never fade to a colour the frame does not have.
- Defaults 0.76 → 0.92 fit a 360×640 hero with the copy at y ≈ 592. When the copy starts elsewhere, set `end = copy top / hero height` and keep the band about 16 % (`start = end − 0.16`).
- Check the result with `Read`: no key detail (face, hands, phone screen) inside the fade, no visible band, bottom rows equal to the hex. A key detail in the fade → move the subject up (regenerate or crop the top before baking), do not shorten the fade.

### 3. Place it, one image for the Ads and the No Ads version

Each onboarding page has **one** image used by both versions; never generate a separate Ads image.

1. Source: the **full, uncropped** artwork of the page (export the separated Thumb/image layer, not the cropped hero of one version).
2. Hero = rectangle 360×640 at x 0, y 0 (behind the status bar), fill the baked image, scale mode FILL; the frame fill is the same hex as `--bg`, so the image bottom melts into the screen without a mask or seam.
3. Copy block top ≥ `end × 640` (592 with the defaults); the No Ads version and the Ads version move the copy and the CTA, never the image. If the Ads version needs the copy higher, rebake with a smaller `end` for both versions (one image) rather than letting text sit on the scene.
4. No extra `Fade` layer or alpha mask on top: the fade is in the pixels. Hide an old `Fade` layer left from the baseline. A mask is only needed when the screen background is not a flat colour (gradient, aura): then bake to its colour at the hero's bottom edge and add a short alpha mask (last 4 %) to hide the seam.
5. Check both versions by screenshot: no image detail behind the title or subtitle, no hard edge at the fade, no second status bar from a phone mockup.

Lessons: AI Chatbot 2026-11-18 — full-height images ran behind the No Ads titles, separate Ads images doubled the set, a crop with a transparent alpha ramp added afterwards was rejected (seam on the screen background), a 35 % fade left the open zone too long. AI Chatbot F4 2026-11-26 — the approved fade is baked opaque into the image, 76 → 92 % with progressive blur, to the frame's exact background hex (`bake_fade.py`).

Cut-out assets (icons, stickers, mascots) follow asset-generator Part B. User photos, partner logos and screenshots of real products are not regenerated: list their hashes in `image-map.json` → `keep`.

Lesson (AI Cine Video, 2026-11-16): onboarding images made from a new style prompt (dark cinematic gold/teal) were rejected as unattractive; regenerated with the original images as reference they were approved. "Chất liệu giống gốc" means: use the source image as reference.
