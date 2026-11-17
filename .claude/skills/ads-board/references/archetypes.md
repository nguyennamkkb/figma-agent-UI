# Screen archetypes

Each `type` maps to a **base screen** of the app (`rules.md` → "Base screens", e.g. page 05 · FL-01). Building = clone the base screen by name, remove its old ad layer, place the Ads Kit component of the spec, apply content / pager / project decisions, rename. No separate masters, never copy a version section.

| `type` | With ads (row 1) | No-ads twin (row 2) |
|---|---|---|
| `splash` | Splash art full screen; `Ad / Banner` 360×64 at y 736; Content and fade moved up 64 | Banner removed; Content and fade moved down 64 |
| `inter` | Empty 360×800 frame + `Ad / Interstitial` at 0,0 | — (empty column) |
| `lang-empty` | `Top bar` `Right=Check`, back hidden, check **hidden**, title "Choose language"; language list in Content; `list-fade` above the ad; `Ad / Native` at the bottom (y = 800 − ad height) | Ad removed; Content to the bottom (`800 − y`), `list-fade` at the bottom |
| `lang-picked` | Same, first language selected, check **visible** | Same twin rule |
| `onboarding` (ad bottom) | hero image (`content`) height = ad.y; fade above the ad; Content (title, subtitle, pager, Next) right above the ad; `Ad / Native <layout>` at the bottom | Cloned from the no-ads base screen (`rules.md`): hero full 360×800, fade y 360 h 440, Content y 600; title, subtitle, pager step and button label copied from row 1 |
| `onboarding` with `footer: true` (or a `layout` starting with CTA) | Footer `Next` pinned at y 800 − 12 − 48; ad above the footer; hero to ad.y | Same twin rule as above |
| `native-full` | Empty frame + `Ad / Native Full <close>` at 0,0; name gets ` - Native Full` | — (empty column) |
| `loading` | Content centred (logo, title, subtitle, progress); `Ad / Native Header-CTA` pinned bottom (y = 800 − ad height); Content resized to end at the ad, glow moved with it (the base screen has no CTA) | The base `· No Ads` frame |
| `all-set` | Same as loading (badge, title, subtitle; no CTA in the base screen) | Same twin rule |
| `loading` / `all-set` with `ad: none` | The base `· No Ads` frame | Same frame, same name |
| `custom` (off-flow only so far) | Base `SCR-07 · Onboarding · All Set · No Ads` stripped to title + subtitle, parts from the wireframe with app components (`builder.md` → "Off-flow sub-section"), copy from `rules.md` | — (off-flow has no row 2) |

## Shared screen rules
- Status bar on every screen; bottom CTA at y 724 (52 tall, 24 from the bottom).
- An ad never overlaps the bottom CTA or the footer; content above an ad never hides behind it (fade, not overlap).
- A new type: add its base screen to `rules.md` → "Base screens", a row here, and the value to `spec-format.md` before using it in a spec.
