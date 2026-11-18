# Blend recipes — native techniques with numbers

Values measured on a reference set (AI Chatbot promo visuals). Scale them with the ratios given; `compose.js` op names in brackets.

## §1 Blend-mode map

| Mode | Use for | Why |
|---|---|---|
| `SCREEN` | sparkles, light textures, bubble shine | black vanishes, only light remains |
| `LINEAR_DODGE` | glows, beams, halos (opacity 0.3–0.5) | adds light, saturates toward white |
| `COLOR_DODGE` | thin light streaks, phone/screen uplight | hot, contrasty highlights |
| `COLOR_BURN` | texture over a gradient/scene | deepens colour, adds grain without grey |
| `MULTIPLY` | shadows, dark texture | darkens, keeps hue |
| `OVERLAY` / `SOFT_LIGHT` | environment tint on a cut-out (`colorWrap`) | pushes colour into mid-tones |
| `HARD_LIGHT` | glossy reflections on devices | punchy, keeps edges |
| `COLOR` | force a scene into the palette hue | keeps luminance, swaps hue |

## §2 Image grading (`filter`)

Range −1…1. Grade every AI picture so the set reads as one.

| Goal | Settings |
|---|---|
| Vivid cool promo background | saturation +0.7, temperature −0.25, highlights +0.2, shadows +0.25 |
| Texture layer before COLOR_BURN | saturation 0 → −1, contrast −0.3, highlights −0.4 |
| Lift a dark subject | shadows +0.5 |
| Match a warm scene | temperature +0.2, tint +0.05 |
| Pale pattern at 10% | exposure +1, saturation −1 (white-out), opacity 0.1 |

## §3 Light

- **Glow** [`glow`]: ellipse, colour = palette light tone, opacity 0.5, LINEAR_DODGE, blur = **0.67 × diameter**. Place behind the subject or under the title.
- **Big haze** [`glow` with `height`]: ellipse ≈ 0.8 × frame width, opacity 0.48, LINEAR_DODGE, blur 0.3–0.4 × width. Two stacked (cyan + deep blue) = studio light.
- **Beam** [`beam`]: rect w ≈ 0.22 × frame width, h ≈ 1 × frame height, gradient colour → transparent at 0.88, opacity 0.3–0.8, LINEAR_DODGE, blur ≈ 0.3 × w, rotate ±1–3° for a fan.
- **Sparkle** [`sparkle`]: 4-point star, inner radius 0.22, radial white (0.06) → black (1), SCREEN; size 3–6% of frame width; 3–5 per visual, never symmetric.
- **Streaks**: 1 px wide vertical lines 30–135 px, COLOR_DODGE, scattered = data / speed feel.
- **Fade to page** [`fade`]: 9 eased alpha stops 0 → 1 from `start` (0.8 = only the last 20%), colour = page background.

## §4 Glass and edges

- **Glass stroke** [`glassStroke`]: gradient white α0.5 → α0 (0.5) → α0.5, angle 135°, INSIDE. Weight ≈ **2–3% of the block height** (banner 110 → 3, button 29 → 1.5, card → 1).
- **Glass card** [`glass`]: white α0.7–0.85, BACKGROUND_BLUR ≈ 10, drop shadow black α0.1 (1.6, 3.2) blur 12, glass stroke 1.
- **Bubble**: circle, white α0.25 + BACKGROUND_BLUR 16 + drop shadow white α0.2 blur 16; copy above with an image fill in SCREEN.
- **Color blob** [`blob`]: ellipse ≈ 0.7 × card width at the card bottom, saturated darker palette colour, blur ≈ 0.8 × size. Makes white text readable without a scrim.

## §5 Buttons

**CTA two bands** (render_tree): outer frame clip, radius = h/2, gradient darker (bottom lip); inner frame 3 px shorter, gradient light → main (e.g. `#AB6CF9 → #0BA6F4` or `#D8F1FD → #A7DFFB`), glass stroke 1–1.5; optional "Light" group: two slanted white rects at 15% opacity across the button. Label bold, gradient fill on light buttons (`#903CF6 → #0A96DC`).

## §6 Shapes

- **Ticket** [`ticket`]: rect radius ≈ 0.13 × short side minus two circles Ø ≈ 0.22 × height centred on the side edges. `mask: true` to clip a picture into it.
- **Rotated card ladder**: 3°, 34°, 61° (or ±10–15° pairs); opacity 1 → 0.85 → 0.7; each card a glass card.

## §7 Subject

- **Frame break**: the subject sits outside the clipped background frame, in the parent; overflow 10–15% of its own size on one side (top for popups, right/top for banners).
- **Ground shadow** [`groundShadow`]: ellipse 0.6 × subject width, 6% of its height, palette dark (`#052E61`) α0.15–0.2, blur 0.4 × height, under the feet.
- **Environment wrap** [`colorWrap`]: alpha-mask clone of the subject + palette colour rect in OVERLAY α0.2–0.4 (gradient from the light side). Makes a cut-out "sit" in the scene. A pure white subject barely changes in OVERLAY: use SOFT_LIGHT or COLOR at 0.15 instead.
- **Display number**: heavy rounded face (e.g. Nunito Black) ≈ 0.5 × visual height, gradient white → palette tint, drop shadow palette-dark α0.15 (4, 2) blur 8; small side label rotated −90°.
