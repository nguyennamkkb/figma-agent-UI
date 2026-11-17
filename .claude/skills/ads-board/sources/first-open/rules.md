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
- Section ids (stacked oldest → newest at x −3224): V1.5.0 25:12928 · V1.6.0 25:13755 · V1.7.0 19:4119 · V1.8.0 19:4816 · V1.9.0 19:5513 · V2.0.0 19:6219 · Ads Kit 19:7064.
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
| Ads Kit · assets | 19:6934 |
| Ads Kit · backgrounds | 25:12916 |
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

## Project decisions
- Language screens: FL-01 already uses `Top bar` `Right=Check` (title "Choose language", back hidden). Check icon hidden on LFO1 (`lang-empty`), shown on LFO2 (`lang-picked`).
- Interstitial: grey placeholder, title "Inter Ads" ("Inter Ads · Show bù" for the fallback show).
- Ad CTA colour = `ad/cta`, a slightly darker tone of the app's orange button.
- People in imagery: young East Asian women.
