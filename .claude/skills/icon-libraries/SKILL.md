---
name: icon-libraries
description: Find and download open-source icons (Phosphor 1,512 icons × 6 weights, Tabler 5,491 icons outline + filled, both MIT) by name or keyword with scripts/icons.py, as SVG files or inline SVG markup for Figma (render_tree svg node). No browser, API key or login — reads the @phosphor-icons/core and @tabler/icons npm packages through jsDelivr. Use when the user wants an icon ("lấy icon", "tìm icon upload", "icon Phosphor", "icon Tabler", "thêm icon vào Figma", "icon set cho app"), needs a consistent icon set, or names phosphoricons.com or tabler.io/icons. Do NOT use for raster illustrations or mascots (asset-generator).
---

# Icon libraries

phosphoricons.com and tabler.io/icons have no public API. Both sites ship icons from MIT npm packages. The script reads those packages from jsDelivr:
- The catalogue (name, tags, category) is parsed as text and never executed. It is cached in `~/.cache/icon-libraries/`.
- The SVGs are fetched one file per icon and weight.

| Library | Package | Icons | Weights | Drawing |
|---|---|---|---|---|
| `phosphor` | `@phosphor-icons/core` | 1,512 | regular thin light bold fill duotone (all icons) | filled shapes, viewBox 256 |
| `tabler` | `@tabler/icons` | 5,491 | outline (all), filled (≈1,050) | 2 px strokes, viewBox 24 — `--stroke` changes the width |

**Which library to use:**
- Phosphor: six consistent weights, including duotone, and good bold/fill states.
- Tabler: more icons, especially devices, brands, letters and numbers. Its stroke icons stay editable in Figma, where you can change the stroke width.
- Use one library and one weight per app.

## Commands

```bash
S=<skill dir>/scripts/icons.py
python3 -I $S search "cloud upload"                       # both libraries; every word must match
python3 -I $S search arrow --lib tabler --category arrows --limit 10
python3 -I $S info star                                    # tags, categories, weights, CDN URL per weight
python3 -I $S get home star --lib tabler --out <abs dir> [--weight filled] [--stroke 1.5] [--color "#FFB547"] [--size 24]
python3 -I $S get house --lib phosphor --weight fill --stdout   # SVG markup inside the JSON, no files
python3 -I $S get star --lib phosphor --weight all --out <abs dir>   # one sub-folder per weight
python3 -I $S categories --lib tabler
```

- `get` takes exactly one `--lib`, `phosphor` by default. The default `--weight` is `regular` for Phosphor and `outline` for Tabler.
- SVGs use `currentColor`. `--color` swaps it for a hex. Phosphor duotone draws its second tone at `opacity="0.2"`.
- Tabler SVGs come back cleaned: the invisible 24×24 guide path and `class` are removed, and the markup is on one line. They import into Figma as clean vectors.
- The output is JSON. A missing name exits 1 and lists `suggestions`. A missing weight lists `available`. Pick from the list and run again; never invent names.
- `--version <x.y.z>` pins a package. The default is latest.

## Workflow

1. **Search by meaning, in English.** Translate a Vietnamese request first. Run `search` with both libraries, then pick the library whose result fits the app's style.
2. **Lock one library and one weight for the whole set.**
   - Outline UI uses Phosphor `regular`/`light` or Tabler `outline`.
   - Selected states use Phosphor `fill` or Tabler `filled`. Check with `info` that every icon in the set has that weight.
3. **Put the icons into Figma.**
   - Run `get … --stdout`, then place the markup in a `render_tree` `svg` node of 24×24 (or 20/16 to match the system).
   - Bind the colour afterwards with `update_nodes` and `{var}`, on fills for Phosphor and on strokes for Tabler outline. Never keep a hardcoded hex.
4. **Make reused icons into components.** An icon used more than once becomes a component named `Icon/<Name>`, at 24×24 with a transparent frame.
5. **Write files for code handoff.** Use `get … --out <abs dir>`. Files are named `<name>.svg`, or `<weight>/<name>.svg` with `all`.

## Gotchas

- Names are kebab-case, as on the sites, and the two libraries name things differently: Phosphor `house` / `cloud-arrow-up`, Tabler `home` / `cloud-upload`. Look names up per library.
- Tabler outline is stroke-only. Changing the stroke width in Figma after import is fine. If you scale the frame, either scale the strokes or keep the 24 grid.
- Brand logos (Phosphor `brands`, Tabler `brand`) belong to their owners, so check the brand's own rules.
- **If a catalogue fails to parse** ("no icons parsed"): delete `~/.cache/icon-libraries/<lib>-*` and pin an older `--version`.
- **When jsDelivr is unreachable:** the same paths work on `https://unpkg.com/<package>@<ver>/...`.
- Both libraries are MIT. Attribution is not required, but it is appreciated.
