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
- Section ids: V1.7.0 19:4119 · V1.8.0 19:4816 · V1.9.0 19:5513 · V2.0.0 19:6219 · Ads Kit 19:7064.
- Row labels "Có quảng cáo" / "Không quảng cáo"; copy of the screens in English as in the app, notes in Vietnamese.

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

## Content keys → assets
| `content` | Asset layer | Screens |
|---|---|---|
| `splash` | `101_A1_bg_splash` | 101 / A1 |
| `ob1` | `301_C1_bg_ob1` — "Photos That Move" | 301 / C1 |
| `ob2` | `302a_C2A_bg_ob2` — "Go Beyond Reality" | 302a / C2A |
| `ob3` | `302b_C3_bg_ob3` — "Bring Memories to Life" | 302b / C3 |
| `ob4` | `302d_C5_bg_ob4` — "Your Story, Your Way" | 302d / C5 |
| `ob5` | `307_C6_bg_ob5` — "Share the Magic" | 307 / C6 |
| `gift` | `308_gift` | 308 Gift |

Shared ad assets: `AST-402_ad_media_16x9`, `AST-403_ad_media_9x16`, `AST-404_ad_icon`. Fictional advertiser "Petal Island: Merge & Build", CTA "Install".

## Project decisions
- Language screens: title "Choose language" only (no hint line); check icon hidden on LFO1, shown on LFO2.
- Interstitial: grey placeholder, title "Inter Ads" ("Inter Ads · Show bù" for the fallback show).
- Ad CTA colour = `ad/cta`, a slightly darker tone of the app's orange button.
- People in imagery: young East Asian women.
