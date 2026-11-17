# Screen archetypes

Each `type` has one **screen master** in the Kit (`Ads Kit · screen masters`). Building = clone the master, apply the spec (content, ad, layout), rename. Never rebuild a screen type from scratch inside a version section.

| `type` | With ads (row 1) | No-ads twin (row 2) |
|---|---|---|
| `splash` | Splash art full screen; `Ad / Banner` 360×64 at y 736; Content and fade moved up 64 | Banner removed; Content and fade moved down 64 |
| `inter` | Empty 360×800 frame + `Ad / Interstitial` at 0,0 | — (empty column) |
| `lang-empty` | `Top bar` `Right=Check`, back hidden, check **hidden**, title "Choose language"; language list in Content; `list-fade` above the ad; `Ad / Native` at the bottom (y = 800 − ad height) | Ad removed; Content to the bottom (`800 − y`), `list-fade` at the bottom |
| `lang-picked` | Same, first language selected, check **visible** | Same twin rule |
| `onboarding` (ad bottom) | hero image (`content`) height = ad.y; fade above the ad; Content (title, subtitle, pager, Next) right above the ad; `Ad / Native <layout>` at the bottom | Built from the onboarding no-ads master: hero full 360×800, fade y 360 h 440, Content y 600; title, subtitle, pager step and button label copied from row 1 |
| `onboarding` (`layout` starts with CTA, footer below ad) | Footer `Next` pinned at y 800 − 12 − 48; ad above the footer; hero to ad.y | Same twin rule as above |
| `native-full` | Empty frame + `Ad / Native Full <close>` at 0,0; name gets ` - Native Full` | — (empty column) |
| `loading` | Content centred (title, subtitle, progress or spinner); `Ad / Native Header-CTA` at y 556; Disabled CTA at the bottom | Ad removed; Content height = 724 − y so it re-centres |
| `all-set` | Same as loading, Primary CTA | Same twin rule |

## Shared screen rules
- Status bar on every screen; bottom CTA at y 724 (52 tall, 24 from the bottom).
- An ad never overlaps the bottom CTA or the footer; content above an ad never hides behind it (fade, not overlap).
- A new type: add a master to the Kit, a row here, and the value to `spec-format.md` before using it in a spec.
