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

## Native on Home
A Native ad placed on a Home screen (tab / dashboard, not onboarding or language) is edge to edge: width = the screen width (FILL, no side margin), `cornerRadius` 0 on the ad frame, its media and its background, no outer card inset or shadow. The inner padding (12/16) stays for the text and CTA. Applies to every Layout variant and to the clone/instance on the screen; the same rule holds when the app is redesigned (`app-redesign`).

## Adding to the Kit
- New Native layout → new variant in `Ad / Native` with the same child names; then add it to `spec-format.md`.
- New ad format → new component + a row in `archetypes.md` + an `ad` value in `spec-format.md`.
- System parts used by the screens (e.g. `Top bar Right=Check`, `Icon button Icon=check`) live in the app's design system, not in the Kit.

## Rebuilding the Kit
When the Kit ids of `rules.md` are not on the page (Kit deleted), rebuild it before any version section, at the top of the stack:
1. Section `Ads Kit · components`. The Ad components often survive a deletion detached from the page (`getNodeByIdAsync` still returns them, `parent` null): append them back by id. Recreate a component only when its id returns null.
2. `Ads Kit · backgrounds`: one 180×320 tile per row of the content-key table of `rules.md`, named as its asset layer. Image = the hero of the matching base screen (same image, no upload); a key with no base screen uses its file path from `rules.md` (upload with `render_tree` `image src`).
3. `Ads Kit · assets`: the shared `AST-4xx_*` ad images from `generated-images/ads/`. Screen art such as `308_gift` goes in `Ads Kit · backgrounds` so the builder finds it by name.
4. Write the new section, assets and backgrounds ids to `rules.md`.

Image hashes are never stored in the source folder: the builder reads them from the `Ads Kit · backgrounds` tiles by asset name.

