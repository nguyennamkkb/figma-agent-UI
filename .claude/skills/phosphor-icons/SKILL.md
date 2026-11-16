---
name: phosphor-icons
description: Find and download Phosphor icons (phosphoricons.com, 1,500+ icons × 6 weights, MIT) by name or keyword with scripts/phosphor.py, as SVG files or inline SVG markup for Figma (render_tree svg node). No browser, API key or login — reads the @phosphor-icons/core npm package through jsDelivr. Use when the user wants an icon ("lấy icon", "tìm icon upload", "icon Phosphor", "thêm icon vào Figma", "icon set cho app"), needs a consistent icon set, or names phosphoricons.com. Do NOT use for raster illustrations or mascots (asset-generator).
---

# Phosphor icons

phosphoricons.com is a static site with no public API: its icons come from the npm package `@phosphor-icons/core`. The script reads that package from jsDelivr — the catalogue (`dist/index.mjs`, parsed as text, never executed) and the SVGs (`assets/<weight>/<name>.svg`). The catalogue is cached per version in `~/.cache/phosphor-icons/`.

## Commands

```bash
S=<skill dir>/scripts/phosphor.py
python3 -I $S search "upload cloud" --limit 10       # rank by name > tags > category; every word must match
python3 -I $S search arrow --category arrows
python3 -I $S info house                             # tags, categories, CDN URL per weight
python3 -I $S get house heart --weight regular --out <abs dir> [--color "#FFB547"] [--size 24]
python3 -I $S get star --weight fill --stdout         # SVG markup inside the JSON, no files
python3 -I $S get star --weight all --out <abs dir>   # one sub-folder per weight
python3 -I $S categories
```

- Weights: `regular` `thin` `light` `bold` `fill` `duotone`. One weight per screen or app — mixing weights looks broken.
- Every SVG is a 256 viewBox with `fill="currentColor"`. `--color` swaps currentColor for a hex. Duotone draws its second tone with `opacity="0.2"`.
- `--size` only sets width and height. Figma also scales the SVG to the node size.
- Output is JSON. A missing name exits 1 and lists `suggestions`. Pick one and run again — never invent names.
- `--version 2.1.1` pins the package. The default is the latest version.

## Workflow

1. **Search by meaning.** Use English keywords: `search "trash"`, `search "photo edit"`. A Vietnamese request gets translated first.
2. **Pick one weight for the whole set.** Match the existing icons: outline UI uses `regular` or `light`, and selected states use `fill`.
3. **Get the SVGs.**
   - For Figma: run `get … --stdout`, then put the markup into a `render_tree` `svg` node of 24×24, or 20/16 to match the design system.
   - Bind the colour afterwards with `update_nodes` and `{var}` on the vector fill. Do not keep a hardcoded hex.
4. **Make reused icons into a component.** An icon used more than once becomes a component named `Icon/<Name>`, at 24×24 with a transparent frame.
5. **Write files for code handoff.** Use `get … --out <abs dir>`. Each file is `<name>.svg`, or `<weight>/<name>.svg` when you ask for `all`.

## Gotchas

- Names are kebab-case, as on the site: `arrow-up-right`, `cloud-arrow-up`, `user-circle`. Underscores and spaces are normalised.
- Brand logos are in the `brands` category, for example `instagram-logo`. Check the brand's own rules before using one.
- **If the catalogue format changes** (the parse error "no icons parsed"): delete the cache and pin an older `--version`.
- **When jsDelivr is unreachable:** the same paths work on `https://unpkg.com/@phosphor-icons/core@<ver>/...`. A full offline set is at `https://phosphoricons.com/assets/phosphor-icons.zip`.
- License is MIT. Attribution is not required, but it is appreciated.
