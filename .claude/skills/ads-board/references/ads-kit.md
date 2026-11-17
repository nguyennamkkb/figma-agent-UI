# Ads Kit · components

Built once per file; every version section only uses instances and clones from here.

| Frame / component | Content | Rules |
|---|---|---|
| `Ads Kit · assets` | shared ad images `AST-4xx_*` (media 16:9, media 9:16, advertiser icon) | Fictional advertiser (e.g. "Petal Island: Merge & Build"); images from gemini-image-mcp |
| `Ads Kit · backgrounds` | screen backgrounds and art, named with screen codes (`naming.md`) | 180×320 tiles, image fill FILL; same image hashes as the screens |
| `Ad / Native` (set, prop `Layout`) | `Header-CTA-Media`, `Header-Media-CTA`, `CTA-Media`, `CTA-Media-Header`, `Header-CTA` | Width 360, padding 12/16, gap 10, top stroke; media 328×184; children `header`, `meta`, `ad+title`, `title`, `body`, `cta`, `cta-label`, `media`, `tag` |
| `Ad / Banner` | 360×64: icon, Ad tag, title, CTA pill | |
| `Ad / Native Full` (set, prop `Close`) | `Top-left`: media fills, info block at the bottom, close + Ad tag absolute. `None · CTA top`: info on top, media below, swipe hint | Nothing touches the frame edge: 16 side padding |
| `Ad / Interstitial` | grey `#4A4A4A`, centred `title` (prop `Title`) + `unit` line (prop `Unit`, shows the screen name) | Placeholder only, no fake ad art |
| Base screens (not in the Kit) | the app's real screens of the flow, listed in `rules.md` → "Base screens" (e.g. page 05, FL-01) | The builder clones them **by frame name**, never a version section and never a separate master, so the board follows the app design and version sections can be deleted and rebuilt |
| Token `Semantic/ad/cta` | CTA fill of every ad, a slightly darker tone of the app's primary button | Labels use `text/on-accent` |

## Adding to the Kit
- New Native layout → new variant in `Ad / Native` with the same child names; then add it to `spec-format.md`.
- New ad format → new component + a row in `archetypes.md` + an `ad` value in `spec-format.md`.
- System parts used by the screens (e.g. `Top bar Right=Check`, `Icon button Icon=check`) live in the app's design system, not in the Kit.
