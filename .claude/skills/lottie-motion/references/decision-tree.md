# Decision tree — which motion, which format, which path

## 1. Should this be Lottie at all?

Ask in order:

1. **Does it depend on a finger, scroll position, navigation or app data?**
   - Yes → native (SwiftUI/Compose/gesture APIs). Lottie plays a fixed timeline; it cannot follow a drag or read business state.
2. **Is it an independent visual asset** (icon, illustration, loading, success, empty state, onboarding accent)?
   - Yes → Lottie is a good candidate.
3. **Is it a whole-screen navigation transition?**
   - Usually native navigation; Lottie can be a decorative overlay, not the transition itself.
4. **Does it need a state machine** (idle → loading → success → error, tap/hover states)?
   - dotLottie state machine or native; test runtime support.
5. **Is it physics, particles, 3D or character performance?**
   - Native, Rive, or a game engine; Lottie is not the right tool.

If the answer is native, say so and stop. A Lottie file that fights the platform is worse than no Lottie.

## 2. Which authoring/export path?

| Path | Best for | Strengths | Limits |
|---|---|---|---|
| **Figma Motion → native Lottie/dotLottie** | UI motion authored in Figma; top-level frame; text stagger, path draw, masks, Figma-native fidelity | Exports the real timeline; Lottie + dotLottie + MP4/WebM/GIF/SVG; least re-authoring | UI action (figma-agent cannot click it); Figma feature support limits; one animation per Lottie file |
| **Python generator** (`motion_to_lottie.py`) | Batch, parameterised, simple transform/opacity/colour/text, test data | Deterministic, no UI, easy variants, stdlib only | No text stagger/path trim/effects/images; text baseline approximated |
| **LottieFiles for Figma** | Prototype interactions, state machine, dotLottie | State machine, preview, feature checker | Support varies by plugin/runtime version; check matrix |
| **After Effects + Bodymovin/LottieFiles** | Character, complex vector, effects-heavy | Maximum authoring control | Heavy; effects may still not export; audit mandatory |
| **Native** | Gestures, navigation, data-bound, business state | Correct platform behaviour, accessibility | Not reusable as an asset; per-platform work |

## 3. Lottie JSON or dotLottie?

| Need | Choose | Reason |
|---|---|---|
| One animation, runtime accepts JSON, smallest file | Lottie JSON | No container overhead; easy to version/diff |
| Multiple animations in one package | dotLottie | One file, manifest lists all |
| Images or fonts bundled | dotLottie | Lottie JSON references external files; dotLottie packages them |
| Themes (light/dark, brand) | dotLottie v2 | Theme support |
| State machine | dotLottie v2 | State machine support |
| Preview for review | MP4/WebM/GIF/SVG | Not interactive; not the production asset |

dotLottie v1 is widely supported (ZIP: `manifest.json`, `animations/`, optional `images/`). dotLottie v2 uses `a/` and `i/`, adds themes and state machines; verify runtime support before choosing v2.

## 4. Canvas, fps, duration

| Decision | Default | Notes |
|---|---|---|
| Canvas | The component/screen size in logical px, 1× | Lottie is vector; export at 1× and scale in the app |
| FPS | 30 for UI, 60 for expressive | 24/25 only if the project requires it; avoid odd fps |
| Duration | 150–300 ms micro, 300–500 ms component, 500–800 ms expressive | Longer needs a reason; check retention and battery |
| Loop | Off for feedback, on for ambient/loading | Seamless: first frame = last frame |
| Background | Transparent unless the asset is a full screen | Full-screen Lottie should match the app background token |

## 5. Text strategy

| Situation | Strategy |
|---|---|
| Text is part of the visual, identical on all platforms | **Outline** the text (convert to vector) |
| Text must stay editable / localized | Bundle the font in dotLottie v2; verify runtime |
| Text uses a system font | Prefer native text; Lottie font metrics differ |
| Text stagger / per-character animation | Figma Motion native export; test mobile (range selectors are web-only in many runtimes) |

## 6. Feature risk decision

| Feature | Decision |
|---|---|
| Mask | Use only if a shape/trim path cannot do it; test both platforms |
| Luma matte | Avoid; use alpha matte or bake |
| Merge paths | Avoid for iOS; flatten/bake |
| Drop shadow / blur / noise / glass | Bake into vector or accept static first-frame appearance |
| Angular gradient | Avoid; Lottie does not support it |
| Expression | Avoid for mobile; bake keyframes |
| 3D layer | Avoid; Lottie has no 3D |
| Image | Bundle in dotLottie; compress; avoid full-screen large images |
| Time remap | Only if the target runtime supports it; test |

## 7. Handoff decision

- If the app is native and the motion is interaction-critical → native implementation, Lottie only as a visual reference.
- If the asset is reusable across screens/apps → Lottie/dotLottie.
- If the motion must match the Figma timeline exactly → native Figma export, not a re-authored approximation.
- If the asset is generated per user/data → native or a parameterised Lottie with dynamic properties, not a new file per user.
