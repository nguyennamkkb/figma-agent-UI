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

## Procedure (one image at a time)

1. Source file: `redesign/<app>/images/source/` (exported during `start`; re-export at 2× with `export_assets` if the source is small).
2. Prompt in two blocks: **Keep:** the left column, described concretely for this image. **Change:** the 2–3 changes. Add the palette hex values of the approved direction and "no text, no letters, no UI".
3. `image_generate{prompt, aspectRatio closest to the slot, refImagePath: <source>, savePath: redesign/<app>/images/new/<screen>-<role>.png}`. The first approved image becomes a second reference for the rest of the set (consistency).
4. `Read` the result; reject on AI defects (hands, eyes, warped text), lower resolution than the source, or a different mood.
5. Side by side on Explore: `source | new` frames with the screen code as title; ask the user ◆.
6. Approved → place it into the hero layer's fill (keep the node, change the image), add the entry to `image-map.json` with `approved: true` and the new hash (read it back with `get_node`).

Cut-out assets (icons, stickers, mascots) follow asset-generator Part B. User photos, partner logos and screenshots of real products are not regenerated: list their hashes in `image-map.json` → `keep`.

Lesson (AI Cine Video, 2026-11-16): onboarding images made from a new style prompt (dark cinematic gold/teal) were rejected as unattractive; regenerated with the original images as reference they were approved. "Chất liệu giống gốc" means: use the source image as reference.
