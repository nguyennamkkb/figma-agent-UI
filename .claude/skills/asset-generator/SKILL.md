---
name: asset-generator
description: Generates production-ready AI image prompts and cut-out transparent PNG assets for app design work in Figma. Part A writes one-shot prompts for 1:1, 3:4, 4:3, 2:3, 3:2, 16:9, 9:16 and 9:19.5 plus a Series mode that keeps a whole app image set consistent (style block, hex palette, taste gate, coverage). Part B generates ONE cut-out asset (icon, mascot, sticker, illustration, object) on a chromakey background with the Gemini image MCP and removes it into a clean transparent PNG via scripts/remove_bg.py with no fringe. Use when the user asks to write an image prompt, plan onboarding or in-app illustrations, fill an image asset list (_assets.md), create visual art prompts for Midjourney Flux DALL-E Stable Diffusion Imagen, or needs a transparent-background asset or background removal from a chromakey image. Do NOT trigger on CSS layout, front-end image resizing, or Python image processing code requests.
---

# Asset Generator

Two modes in one skill. Pick once per request, then follow only that part.

| Request | Mode |
|---|---|
| Write a prompt for a scene, hero, background, illustration, photo, marketing visual, or an `_assets.md` entry | **Part A — Prompt** |
| Generate one cut-out subject (icon, mascot, sticker, object, badge) on a chromakey background and remove it into a transparent PNG | **Part B — Cut-out** |

A scene that fills its slot uses Part A. A subject laid over native UI uses Part B.

## Image MCP — pick one before any work

Two image MCPs are supported. Every skill that generates images (`screen-from-image`, `ui-visual`, `app-redesign`, `ads-board`, `figma-ui-flow`) follows this section.

| MCP | Generate | Reference image | Background | Output |
|---|---|---|---|---|
| **gemini-image-mcp** | `bridge_status` (workers ≥ 1) → `image_generate{prompt, aspectRatio, outputDir}` | `refImagePath` (one) | opaque, JPEG: key colour + `remove_bg.py` for cut-outs | `filePath` |
| **muse2api** | `muse_health` → `muse_generate_image{prompt, size, n, output_dir}` | `image_paths` (up to 4 local files) | `background: "transparent"` cuts out itself (keys on green, see Step 2), or `"opaque"` | file paths in the result |

1. Look at the tools available in the session: `image_generate` (gemini) and/or `muse_generate_image` (muse).
2. **Both on → ask the user which one before starting the task** (one `AskUserQuestion`, or bundled with the skill's own first question), not at the first image. Neither is recommended by default; say in the options what each is better at (gemini: one reference, chromakey we control; muse: up to 4 references, `n` variants, built-in transparency).
3. Only one on → use it, mention it in one line. None on → say so and stop before the image steps; native and text work can continue.
4. The answer holds for the whole task (and the project: write it in the project brief when the skill keeps one). Never switch MCP mid-set without asking: two generators break the series look.
5. Map the steps of this skill to the chosen MCP: Step 4 call, the reference parameter, and for muse with `background: "transparent"` skip `remove_bg.py` unless the subject is green.

# Part A — One-shot image prompts

Transform brief user concepts into **One-Shot Image Generation Prompts** with strict medium consistency, exact color control, and tailored spatial composition across the standard aspect ratios (`1:1`, `3:4`, `4:3`, `2:3`, `3:2`, `16:9`, `9:16`, and the full-screen iPhone ratio `9:19.5`). Ensure the image generator produces the exact intended framing and style on the first run without token contradiction.

## Gotchas
1. **Medium Cross-Contamination (CRITICAL):** Never mix 3D/photographic tokens (*lens focal length, f-stop aperture, shallow depth of field, foreground-to-background layering, realistic surface patina/grain, screen glow, environmental portrait, documentary perspective*) into a **2D Flat Vector / UI Illustration** prompt. Doing so breaks flat rendering and causes unwanted 3D shading or photorealistic artifacts.
2. **Aspect Ratio Blindness:** Never simply append `--ar 16:9` or `--ar 9:16` without adjusting spatial composition phrasing. Always use the medium-appropriate framing directives from Step 2.
3. **Inline Negative Phrasing (Zero-"No" Rule):** Never write negative words (*"no", "not", "without", "nothing", "never", "empty of"*) inside the main positive prompt (e.g., never write *"no gradient, no horizon line, nothing placed"*). Diffusion and transformer models attend to the negated nouns and render them anyway. Express all constraints as affirmative states (*"solid uniform flat fill, seamless background"*) and isolate all exclusions inside the Negative Prompt block.
4. **UI Context Leakage:** When generating illustrations or assets meant to be placed inside a mobile or web app, NEVER mention `"mobile app screen"`, `"UI background"`, or `"website layout"` inside the prompt unless an actual device mockup frame is desired. Models will hallucinate phone bezels, status bars, and buttons. Describe only the visual canvas itself.
5. **Color Drift & Abstract Prose:**
   - Never rely solely on vague color names (*"warm cream", "near-black"*) when assets must share a consistent palette or match a UI background. Always pair semantic color descriptions with explicit Hex codes (e.g., `solid uniform warm cream background #FAF6F0`, `charcoal black ink #1A1918`).
   - Eliminate abstract emotional adjectives (*"trustworthy, even-handed, quiet, deliberate"*) and filler buzzwords (*"8k, masterpiece, best quality, trending on ArtStation"*). Every token must describe a visible physical or geometric property.
6. **Bland by default (CRITICAL for app art):** "minimalist", "single small object", "centred icon", "generous negative space around the perimeter" produce clip art that sits shrunk in the middle of its slot. App images need a subject that acts, a visual metaphor, three depth layers (backdrop shape → subject → floating accents) and a stated coverage ("the group spans 90 percent of the width, cut by the bottom edge"). Run the taste gate and coverage table in `references/style-library.md` §1 and §5 for every app prompt.

## Inputs
- **Core Subject:** The main entity, scene, or graphic concept requested by the user.
- **Medium Mode:**
  - **Mode A (Photography / 3D / Cinematic):** Realistic photography, studio still-life, macro, or 3D renders.
  - **Mode B (2D Flat Vector / UI Spot Illustration):** Flat vector graphics, minimalist icons, spot illustrations, and editorial line art.
- **Target Aspect Ratio:** `1:1`, `3:4`, `4:3`, `2:3`, `3:2`, `16:9`, `9:16` or `9:19.5` (Default to `1:1` primary + quick variants if unspecified). For an app asset, the ratio comes from its surface (the `ios-app-imagery` skill's `references/surfaces.md`).
- **Color Palette / Hex Tokens (Optional):** Specific Hex codes for background, primary ink/stroke, and accent colors (Default to natural palette for Mode A, or specify cohesive Hex tokens if part of a multi-asset series).

## Procedure

### Step 1: Select the Medium Track
Determine whether the target image belongs to **Mode A (Photography / 3D)** or **Mode B (2D Flat Vector / Illustration)**. All subsequent layers MUST strictly follow the selected track.
- *Engineering Flag:* If the requested asset is purely basic geometric primitives (e.g., a blank rounded rectangle border or an exact $N \times M$ mathematical grid with zero organic illustration), include a brief note recommending native code/Figma rendering alongside the AI prompt.

### Step 2: Apply Aspect Ratio Composition Rules (Medium-Specific)
Select and inject the spatial framing directives matching BOTH the target aspect ratio and the selected Medium Mode:

| Aspect Ratio | Mode A: Photography / 3D Directives | Mode B: 2D Flat Vector / UI Illustration Directives |
| :--- | :--- | :--- |
| **`1:1`** (Square) | `Centered composition`, `tight medium or macro shot`, `subject filling 80–90 % of the frame`, `shot on 50mm f/4 lens`. | `Square 2D composition`, `subject group filling 85–90 % of the frame with a thin even margin`, `backdrop shape spanning 75 % of the width behind it`. |
| **`3:4`** (Vertical) | `Vertical portrait framing`, `rule of thirds placement`, `shallow depth of field`, `layered foreground-to-background separation`, `shot on 85mm f/2 lens`. | `Vertical 3:4 layout`, `subject group spanning 90 % of the width and 85 % of the height`, `clean flat 2D hierarchy`, `accents reaching close to the side edges`. |
| **`4:3`** (Horizontal) | `Classic horizontal framing`, `balanced mid-ground subject`, `natural studio or documentary perspective`, `shot on 35mm lens`. | `Horizontal 4:3 layout`, `side-by-side or centred 2D arrangement spanning 90 % of the width`, `strictly flat orthographic 2D plane`. |
| **`16:9`** (Widescreen) | `Cinematic widescreen framing`, `off-center rule of thirds subject`, `expansive horizontal environment`, `horizontal leading lines`, `24mm wide-angle lens`. | `Widescreen 16:9 horizontal composition`, `asymmetric rule-of-thirds 2D layout`, `scene running past the left and right edges`. |
| **`2:3`** (Tall portrait) | `Portrait framing with headroom`, `subject in the upper middle`, `50mm lens`. | `Vertical 2:3 layout`, `subject group in the upper two thirds spanning 90 % of the width`, `plain ground lower third`. |
| **`3:2`** (Wide inset) | `Horizontal 3:2 framing`, `balanced mid-ground subject`, `35mm lens`. | `Horizontal 3:2 layout`, `centred 2D subject group spanning 85–90 % of the width`. |
| **`9:19.5`** (Full-screen iPhone) | `Full-height vertical composition`, `subject in the central band`, `quiet top and bottom edges`, `35mm lens`. | `Full-height 9:19.5 vertical composition`, `scene covering every edge`, `subject in the central band`, `lower third as plain ground inside the scene`. |
| **`9:16`** (Tall Vertical) | `Tall vertical composition`, `strong vertical leading lines`, `full-body or vertical studio framing with generous headroom and foreground depth`. | `Tall 9:16 vertical composition`, `vertically stacked 2D arrangement covering the full width`, `a plain-ground band where the UI overlays`. |

### Step 3: Assemble the 5-Layer One-Shot Formula
Construct the prompt as a single cohesive, affirmative English paragraph ordered from highest to lowest token priority:

> **`[1. Medium & Canvas]` + `[2. Subject & Geometry/Details]` + `[3. State & Arrangement]` + `[4. Aspect-Ratio Framing]` + `[5. Color Palette & Lighting/Fill]`**

#### Track A: Photography / 3D Formula
1. **Layer 1 (Medium & Canvas):** Define the exact photographic style (e.g., *Overhead flat lay studio macro photography*, *Restrained studio still-life photograph*).
2. **Layer 2 (Subject & Micro-Details):** Specify physical materials and tactile textures (e.g., *blank handmade cotton paper sheet with subtle laid-paper grain and soft deckle edges*).
3. **Layer 3 (State & Arrangement):** Describe physical placement and stillness or motion (e.g., *resting flat with a clean vertical gap between the journal and envelope*).
4. **Layer 4 (Aspect-Ratio Framing & Optics):** Insert **Mode A** directives from Step 2 (including focal length and depth of field).
5. **Layer 5 (Lighting & Color Palette):** Specify light direction, shadow softness, and tonal palette with Hex anchors if required (e.g., *soft diffused top-left studio daylight, monochromatic warm cream palette #FAF6F0 with gentle natural edge falloff*).

#### Track B: 2D Flat Vector / UI Illustration Formula
1. **Layer 1 (Medium & Canvas):** Define the 2D graphic medium and solid background color with Hex code (e.g., *Editorial flat vector illustration with a fine even charcoal outline #1A1918 on every shape, on a solid uniform warm cream background #FAF6F0*).
2. **Layer 2 (Subject & Crisp Geometry):** Describe simplified 2D shapes, line weights, and crisp vector edges without 3D textures (e.g., *a young woman in a mustard cardigan #C5A059 reading an open hardback while walking, a small yellow bird perched on her bun, a sprig of leaves and a round wall clock floating beside her*).
3. **Layer 3 (State & Arrangement):** Specify 2D alignment, spacing, and proportions (e.g., *mid-stride, leaning slightly forward, the figure and props spanning 90 percent of the width and 85 percent of the height*).
4. **Layer 4 (Aspect-Ratio Framing):** Insert **Mode B** directives from Step 2 (strictly 2D layout and margin geometry — NO camera lenses or depth-of-field terms).
5. **Layer 5 (Color & Fill Rules):** State exact Hex color assignments and affirmative flat-fill rules (e.g., *strictly two-tone palette using warm cream #FAF6F0 and charcoal black #1A1918, uniform flat unshaded solid fills throughout with crisp vector edges*).

### Step 4: Handle Typography (If Requested)
- If text is required: Enclose the exact string in double quotes (`featuring the exact text "YOUR TEXT"`) and specify font style, color Hex, and placement.
- If text must NOT appear: Do not mention text in the positive prompt; place `text, letters, numbers, typography, watermark, signature` in the Negative Prompt block.

### Step 5: Validation Loop
Verify the drafted prompt against this checklist before outputting. Revise immediately if any check fails:
- [ ] **Zero Medium Contamination:** If Mode B (2D Vector), are all camera lenses (`35mm`, `50mm`), depth terms (`foreground-to-background`, `shallow depth of field`, `environmental portrait`), lighting glow, and realistic aging textures (`patina`, `grain`) completely absent?
- [ ] **Zero Inline Negatives:** Is the positive prompt 100% free of words like `"no"`, `"not"`, `"without"`, `"nothing"`, `"unrung"`, or `"empty of"`?
- [ ] **Zero UI Context Leakage:** Are phrases like `"mobile app screen"` or `"app background"` removed from the positive prompt?
- [ ] **Explicit Color Anchors:** Are semantic color names paired with consistent Hex codes (e.g., `#FAF6F0`, `#1A1918`) when consistency across assets is required?
- [ ] **Zero Abstract Filler:** Are non-visual emotional words (*"trustworthy, quiet, deliberate"*) and junk buzzwords (*"8k, masterpiece"*) stripped out?
- [ ] **Taste and coverage (app art):** Does the prompt pass the taste gate T1–T12 in `references/style-library.md` — a subject that acts, a metaphor, three layers, a lead colour, and a stated coverage so the art fills its slot?

## Series mode (app asset sets)

Use when the request is a set of images for one app (onboarding heroes, empty states, success moments) or an `_assets.md` file in an `ios-*` spec. Read `references/style-library.md` and `references/series-consistency.md` first; the surface, concept, composition and size come from the `ios-app-imagery` skill (its `surfaces.md`, `composition.md` and `ios-asset-sizing.md`).

1. **Style anchor** — decide once, before the first prompt: the style (one of `style-library.md` §2, as chosen in the design direction's imagery treatment) with its style block and character sheet, one fixed style block (a sentence pasted verbatim into every prompt), and the palette (hex values only from the design direction's `### Imagery palette`, user-confirmed). These live inside the prompts; `_assets.md` has no separate anchor section. `AST-01` is generated first and becomes the style reference for every later asset.
2. **Per asset** — one image per `AST-NN` (no light/dark pair), written in this order under `## AST-NN · <name>` (see the `_assets.md` template):
   - Spec line `<aspect> · <size> · SCR-NN`: aspect from the slot, size in pt at the reference device (402 × 874 pt) or the slot width with the @3x px, e.g. `1:1 · 120 pt (@3x 360 px) · SCR-10` (`ios-app-imagery` `ios-asset-sizing.md` §3, §5).
   - Composite slot (text, chips, bubbles or UI mixed into the picture): split it per `style-library.md` §3 — one `AST` per generated layer, native layers stay in the wireframe slot.
   - ```` ```prompt ```` block: only the text the user pastes into the generator, written in the order of `style-library.md` §4 — the style block verbatim + the screen's metaphor as a subject that acts (concrete nouns) + props, floating accents and the backdrop shape + coverage for that slot (`style-library.md` §5) and composition by geometry for that aspect, keeping the slot's text zone plain + palette hex — self-contained and affirmative (UI and text are excluded through the negative block, never with "no …" inside the prompt — Gotcha 3). Every colour is a palette hex value, the background is a solid palette `Ground` hex, and the colours read on both light and dark screens once the ground is removed. Never write "transparent", "transparency", "alpha" or "checkerboard" — models paint a checkerboard (`series-consistency.md` §1.5). No labels, sizes or `--ar` flags in the block.
   - ```` ```negative ```` block: text, letters, numbers, logos, watermark, UI, device frame, shadow, reflection, checkerboard pattern, plus anything the style block excludes.
3. **Validate the set** — every prompt passes the taste gate (`style-library.md` §1) including coverage, letter-free motifs and robust shapes; consecutive images change metaphor and composition; every prompt carries the same style block and only palette hex values; no image depends on baked-in text; full-bleed subjects survive a 390–440 pt crop. After generation, check every file with the `ios-app-imagery` skill's `scripts/measure_coverage.py` (ground, coverage, text contrast) and by eye (letter-like marks, hands, fragile details) before it is used.

## Output Format (Part A)
Always return the final response using this exact template:

### Primary One-Shot Prompt (`[Selected Aspect Ratio]` — `[Mode A: Photography | Mode B: 2D Flat Vector]`)
```text
[Complete 5-Layer Affirmative English Prompt] --ar [X:Y]
```

### Negative Prompt
```text
[Comma-separated exclusions only — every "no/without" idea from the request lives here, never in the positive prompt]
```

### Aspect-Ratio Variants (only when the user did not fix one ratio)
For each other requested ratio, repeat the prompt with Layer 4 swapped for that ratio's directives from Step 2 (same medium track, same Hex anchors):
```text
[Variant prompt] --ar [X:Y]
```

### Notes
- Engineering flag from Step 1, when it applies (render natively instead of generating).
- Validation checklist from Step 5: all items passed.

# Part B — Cut-out asset

One request → **one generated image → one cut-out PNG** ready for Figma.

## Why the usual approach leaves a purple/green ring
Image models cannot output transparent pixels, so the asset is generated on a flat key color and the
key is removed afterwards. Simple removers threshold the distance to the key: an edge pixel that is
70% subject + 30% key is "far enough" to be kept fully opaque, so a 1–2px key-colored ring survives.
Over-aggressive despill then flips it to the opposite color (green → purple, magenta → green).

`scripts/remove_bg.py` fixes this by **unmixing** every edge pixel: it solves how much of the pixel is
subject vs key, removes the key in exactly that proportion, and corrects rim-light spill without
over-correcting. Always use it — never write an ad-hoc remover.

Requirements: `pip install numpy pillow scipy`

## Step 1 — Brief
Confirm only what's missing: asset ID (`AST-###`), subject, style (match the project's design
direction/tokens), main colors. Generate **one** image — no variants unless the user asks.

## Step 2 — Key color
| Subject contains… | Key |
|---|---|
| no strong green (default) | `#00FF00` pure green |
| green (leaves, plants, green brand) | `#FF00FF` pure magenta |
| both green and pink/purple | `#0000FF` pure blue |

The **muse** image MCP (`muse_generate_image{background: "transparent"}`) removes the background itself and always keys on green: for a green subject (green lenses, dollar signs, a world map, plants) its check reports `key color left inside the subject` even when the cut-out is fine. Open the cut-out on a contrasting colour and zoom the edges before using it; if green was eaten, generate it opaque on magenta (template below) and run `remove_bg.py` yourself.

**Recreating a reference shot** (a Dribbble mockup, a screenshot): screenshot the reference at scale 1, crop each asset with PIL (×3 upscale) and pass the crop as the reference image (`image_paths` / `refImagePath`). The new asset matches the reference style on the first try; generate the whole set in parallel, then trim each PNG to its alpha bounding box before placing it with `scaleMode: "FIT"`.

## Step 3 — Prompt (copy this template)
```
[Subject], [style, e.g. flat vector illustration / soft 3D clay / line icon], [colors from the design tokens],
single subject, centered, fully visible, at least 10% empty margin on every side.
BACKGROUND: one solid, flat, uniform pure [KEY NAME] ([HEX]) filling the entire background.
No shadow, no floor, no gradient, no texture, no vignette on the background.
No rim light, no glow, no outline or reflection in [KEY NAME]; the subject contains no [KEY NAME].
Crisp clean edges.
```
Never write "transparent background" — the model paints a fake checkerboard.

## Step 4 — Generate (the MCP picked above)
With muse: `muse_generate_image{prompt, size, background: "transparent", image_paths?, output_dir: "assets/raw"}`, then go to Step 6 (Step 5 only for a green subject or a failed cut-out).

With gemini, call `image_generate` once:
- `prompt`: the filled template
- `aspectRatio`: `"1:1"` (or the asset's shape: `3:4`, `4:3`, `9:16`, `16:9`)
- `outputDir`: e.g. `assets/raw` — **don't** use `savePath` with a `.png` name: the service may return JPEG
- `refImagePath`: an approved asset, when this one must match an existing style/character

Use the `filePath` returned by the tool as the input for Step 5.

## Step 5 — Remove the background
```bash
python scripts/remove_bg.py <filePath> -o assets/AST-004_mascot_happy.png
```
Defaults are measured from the image (key color, gradient, noise, spill width) — pass nothing else
unless Step 6 tells you to. It writes:
- `AST-004_mascot_happy.png` — transparent PNG, trimmed to the subject (+4px), no key color stored anywhere
- `..._original.png` — the untouched generation (temp artifact, deleted on pass)
- `..._preview.png` — the cut-out on white / black / gray + a 5x zoom of the edge (temp artifact, deleted on pass)
- a JSON report on stdout; exit code `0` = pass, `2` = failed checks, `1` = unusable input

## Step 6 — Verify (mandatory)
1. Read the JSON: `pass`, `problems`, `warnings`.
2. **Open `_preview.png` and look at the zoom yourself.** Pass only if there is no purple/green
   ring on either background and the subject isn't clipped.
3. If it fails, apply the fix from `problems` — **at most one retry**:

| Problem | Fix |
|---|---|
| fringe on the edge ring | rerun with the suggested `--edge N` |
| key color left inside the subject | regenerate with the other key color |
| subject touches the border | regenerate with more margin |
| background not a saturated key color | regenerate; the model ignored the background rule |
| `halo` warning | fine if the design has a thin dark/light outline; otherwise check the zoom |

Still failing after one retry → stop and show the user the preview with the problem; don't loop. Keep the preview and original in this fail case.

4. On pass, delete the temp artifacts so only one result image remains:
```bash
rm <output-stem>_original.png <output-stem>_preview.png
```
After this step only `AST-###_<name>.png` exists.

## Step 7 — Deliver
- Send the PNG only (intermediates were deleted on pass). Place it in Figma only if asked.
- Name files `AST-###_<name>.png` (lowercase snake_case).
- Add a row to `spec/assets.md`: ID, screen ID, prompt, key color, file, status (draft/approved).
