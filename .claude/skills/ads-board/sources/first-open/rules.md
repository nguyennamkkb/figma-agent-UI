# Ads board · First Open — project rules

Source of truth for page **07 - Ads** of the Figma file "figma-agent-AI Cine Video- namnnl". General rules: the `ads-board` skill (`SKILL.md`, `references/`); this file only holds what is specific to this flow. The original draw.io document is no longer used: `specs/` and `wireframes/` replace it.

## Folder
| Path | Content |
|---|---|
| `rules.md` | this file |
| `specs/<version>.yaml` | one spec per version (screens, edges, off-flow, notes) |
| `wireframes/<version>.png` | the version's flow diagram and wireframes, image only |

## Board
- Page `07 - Ads` (id 19:4118). Section prefix `07 · First Open`.
- Stack at x −3224, 400 apart: Ads Kit 25:16157 (y 0) → V1.5.0 25:16177 (2788) → V1.6.0 25:18778 (6292) → V1.7.0 25:17841 (9796) → V1.8.0 25:19568 (13300) → V1.9.0 25:20410 (16804, 4304 tall: off-flow 25:21074) → V2.0.0 25:21340 (21508). A new version goes at its place in time order; the later sections move down by `height + 400`.
- 2026-11-17: page 07 emptied on purpose and rebuilt from scratch with the skill (Kit + all six versions).
- Row labels "Có quảng cáo" / "Không quảng cáo"; copy of the screens in English as in the app, notes in Vietnamese.

## Base screens (the app's real screens)
Read from page `05 · Screens & Flows`, section **FL-01 · Splash, Onboarding, IAP** (4:25), by frame name. Never copy a version section of page 07 and never keep separate masters: a change made in FL-01 flows into the next build.

| `type` | Base frame (with ads) | Base frame (no ads) |
|---|---|---|
| `splash` | `SCR-01 · Splash · Default` | same frame (no banner) |
| `lang-empty` | `SCR-02 · Language · Default` | `SCR-02 · Language · No Ads` |
| `lang-picked` | `SCR-02 · Language · Selected` | `SCR-02 · Language · Selected` without its ad (list down to the bottom) |
| `onboarding` | `SCR-03 · Onboarding · Page 1` (ad bottom, Next in Content) | `SCR-03 · Onboarding · Page 1 · No Ads` |
| `onboarding` + `footer` | `SCR-03 · Onboarding · Page 1`, Next moved to a `Footer · Next` under the ad | `SCR-03 · Onboarding · Page 1 · No Ads` |
| `loading` | `SCR-07 · Onboarding · Setting Up` | `SCR-07 · Onboarding · Setting Up · No Ads` |
| `all-set` | `SCR-07 · Onboarding · All Set` | `SCR-07 · Onboarding · All Set · No Ads` |
| `inter`, `app-open`, `native-full` | no base screen: empty 360×800 frame + the Ad component | — (empty column) |

On every clone: remove the old ad layer (`Ad / Native 272`), place the Ads Kit component of the spec (`archetypes.md`), apply the content key (image, title, subtitle), the pager step and the project decisions below.

## Ads Kit (ids)
| Part | Id |
|---|---|
| Ad / Native set (`Layout`) | 19:6999 |
| Ad / Banner | 19:7000 |
| Ad / Native Full set (`Close`) | 19:7048 |
| Ad / Interstitial (`Title#19:0`, `Unit#19:1`) | 19:7049 |
| Ads Kit · components (section) | 25:16157 |
| Ads Kit · assets | 25:16158 |
| Ads Kit · backgrounds | 25:16164 |
| Token `Semantic/ad/cta` | VariableID:19:11250 (#E8953A) |
| Top bar `Right=Check` (language screens) | 25:12794 |

## Content keys → assets and copy
| `content` | Asset layer | Title | Subtitle | Screens |
|---|---|---|---|---|
| `splash` | `101_A1_bg_splash` | AI CINE VIDEO | — | 101 / A1 |
| `ob1` | `301_C1_bg_ob1` | Photos That Move | Turn any photo into a cinematic AI video. | 301 / C1 |
| `ob2` | `302a_C2A_bg_ob2` | Go Beyond Reality | Imagine it. Create it. Watch it come alive. | 302a / C2A |
| `ob3` | `302b_C3_bg_ob3` | Bring Memories to Life | Watch the moments you love move again. | 302b / C3 |
| `ob4` | `302d_C5_bg_ob4` | Your Story, Your Way | Star in the movie only you could imagine. | 302d / C5 / 303 (V1.5) |
| `ob5` | `307_C6_bg_ob5` | Share the Magic | Make your friends laugh, cry and say “wow”. | 307 / C6 |
| `ob6` | `305_bg_ob6` (`generated-images/onboard-v2/ob6-every-frame.png`) | Frame by Frame | Step into scenes from your own photos. | 305 (V1.5) |
| `gift` | `308_gift` | — | — | 308 Gift |

Shared ad assets: `AST-402_ad_media_16x9`, `AST-403_ad_media_9x16`, `AST-404_ad_icon`. Fictional advertiser "Petal Island: Merge & Build", CTA "Install".

## Custom screens (off-flow, V1.9.0)
| Frame | Copy | Parts |
|---|---|---|
| `308 - OB7 · Theme` | Choose your theme / You can change it anytime in Settings. | Language item ×3: ☀️ Light (selected), 🌙 Dark, 📱 System; Native Header-CTA above a Primary `Next` |
| `308 - OB7 · Workspace Ready` | Your studio is ready / Personalised from the choices you made. / caption "Preview of your workspace" | preview card 240×300 (`301_C1_bg_ob1`), Native Header-CTA above a Primary `Next` |
| `308 - OB7 · Gift` | You’ve unlocked a special reward / A limited offer for new members. / "Unlocks in 5 s" / "Claim before it expires · 23:59:47" | `308_gift` 140×140, Text `Next` top-left (as the wireframe), Native Header-CTA at the bottom |
| `101 - Loading (wireframe)` | copy of `SCR-07 · Onboarding · Setting Up` | Native Header-CTA at the bottom |

## Project decisions
- Language screens: FL-01 already uses `Top bar` `Right=Check` (title "Choose language", back hidden). Check icon hidden on LFO1 (`lang-empty`), shown on LFO2 (`lang-picked`).
- Interstitial: grey placeholder, title "Inter Ads" ("Inter Ads · Show bù" for the fallback show).
- Ad CTA colour = `ad/cta`, a slightly darker tone of the app's orange button.
- People in imagery: young East Asian women.
