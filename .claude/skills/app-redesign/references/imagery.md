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

## Onboarding images — the fade-bottom template (mandatory)

Model: `examples/onboarding-fade-reference.png` (720×1160, tall portrait). The fade is **generated inside the image**: never crop a finished image and add an alpha ramp afterwards (rejected 2026-11-18).

What the model image does, and every onboarding image must do:

| Band (of the height) | Content |
|---|---|
| 0–90 % | the scene at full detail down to 90 %: main subject in the upper two thirds, a foreground element pushing toward the camera (hand, card, object), a background in action with depth (debris, light, haze), lower parts (body, ground, props) still detailed |
| 90–100 % | short fade: the scene dissolves smoothly into the screen background colour, reaching it at the very bottom edge |

The fade band is **10 % of the height, no more** (user, 2026-11-18: a 35 % fade left the open zone too long). Smooth (no hard line, no band); the colour it fades to is the screen background (dark apps: near-black; Mist-type light apps: the `bg/canvas` hex).

### Prompt template (fill the brackets, keep the order)

```
[Medium: hyperrealistic cinematic photo | glossy 3D render], tall vertical portrait 9:16.
[Main subject] [doing the feature's action], with a clear [emotion], placed in the upper two thirds of the frame.
Foreground: [element] pushing toward the camera with strong wide-angle perspective.
Background: [scene in action that tells the feature], depth with [particles / light streaks / haze], [warm light] against [cool light].
Palette: [hex values of the direction].
Bottom fade: the scene stays fully detailed down to 90 percent of the image height; only the lowest 10 percent fades smoothly into a solid [background name] [#hex], reaching plain [#hex] exactly at the bottom edge, no hard edge, no band.
```

With a source image (redesign): start with "Recreate the reference image faithfully: same composition, same subject, same text, same quality. Change only: …", then the Palette and Bottom fade lines. The source decides the subject; the template decides the fade and the bottom zone.

### One image for the Ads and the No Ads version

Each onboarding page has **one** image used by both versions; never generate a separate Ads image.

1. Source: the **full, uncropped** artwork of the page (export the separated Thumb/image layer, not the cropped hero of one version).
2. Generate at 9:16 with the template above.
3. Measure where the detail ends (last row with luminance std > 6; models land between 70 and 95 %, not exactly 90). Place the same hash in both versions, fill mode FILL, 360×640, `y = min(0, title.y − detailEnd × 640 − 8)`: the detail stops just above the title. Hide the old `Fade` layer.
4. Wrap the hero in a group with an alpha mask (`Hero fade mask`, linear gradient opaque to 90 %, transparent at 100 %) so the image edge melts into the screen's own background (the screen background is not a flat colour, a bare image edge shows a seam).
5. Check both versions by screenshot: no image detail behind the title or subtitle, no hard edge at the fade, no second status bar from a phone mockup.

Lesson (AI Chatbot, 2026-11-18): full-height images ran behind the No Ads titles, separate Ads images doubled the set, and a crop with an alpha ramp added afterwards was rejected. The user gave the model image: the fade must be part of the generated picture.

Cut-out assets (icons, stickers, mascots) follow asset-generator Part B. User photos, partner logos and screenshots of real products are not regenerated: list their hashes in `image-map.json` → `keep`.

Lesson (AI Cine Video, 2026-11-16): onboarding images made from a new style prompt (dark cinematic gold/teal) were rejected as unattractive; regenerated with the original images as reference they were approved. "Chất liệu giống gốc" means: use the source image as reference.
