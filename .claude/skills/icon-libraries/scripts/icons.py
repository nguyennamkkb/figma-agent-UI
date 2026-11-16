#!/usr/bin/env python3
"""Find and download open-source icons without a browser: Phosphor and Tabler.

Sources are npm packages served by jsDelivr (no API key, no login):
  phosphor  @phosphor-icons/core  1,512 icons, weights regular thin light bold fill duotone, 256 viewBox, filled shapes
  tabler    @tabler/icons         5,491 icons, styles outline (all) and filled (about 1,050), 24 viewBox, 2 px strokes
Catalogues (names, tags, categories) are parsed as text, never executed, and cached in
~/.cache/icon-libraries/<lib>-<version>.json.

Usage:
  icons.py search "upload cloud" [--lib tabler|phosphor|all] [--category media] [--limit 20]
  icons.py get home star --lib tabler --weight outline --out ./icons [--color #FFB547] [--size 24] [--stroke 1.5]
  icons.py get house --lib phosphor --weight fill --stdout
  icons.py get star --lib phosphor --weight all --out ./icons
  icons.py info home --lib tabler
  icons.py categories --lib tabler

--weight defaults to regular (phosphor) or outline (tabler); "all" fetches every weight the
icon has. --stroke only applies to tabler outline. --color replaces currentColor, --size sets
width and height. Tabler SVGs lose their invisible 24x24 guide path and class attribute so
they import into Figma as clean vectors. Every command prints JSON; a missing icon exits 1
and lists close names.
"""

import argparse
import difflib
import json
import os
import re
import sys
import urllib.request

CDN = "https://cdn.jsdelivr.net/npm/{pkg}@{ver}/{path}"
RESOLVE = "https://data.jsdelivr.com/v1/packages/npm/{pkg}/resolved"
CACHE_DIR = os.path.expanduser("~/.cache/icon-libraries")
TABLER_GUIDE = re.compile(r'\s*<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*/>')


def fetch(url, attempts=3):
    request = urllib.request.Request(url, headers={"User-Agent": "icon-libraries-skill"})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read().decode("utf-8")
        except Exception:
            if attempt == attempts - 1:
                raise


def parse_phosphor(source):
    enums = {}
    for body, var in re.findall(r"\(\(\w+\) => \((.*?)\w+\)\)\((\w+) \|\| \{\}\)", source, re.S):
        enums[var] = dict(re.findall(r"\w+\.(\w+) = \"([^\"]+)\"", body))

    def enum_value(ref):
        var, key = ref.strip().split(".")
        return enums.get(var, {}).get(key, key.lower())

    icons = []
    for block in re.split(r"\n  \{\n", source)[1:]:
        name = re.search(r'name: "([^"]+)"', block)
        if not name:
            continue
        cats = re.search(r"categories: \[(.*?)\]", block, re.S)
        tags = re.search(r"tags: \[(.*?)\]", block, re.S)
        icons.append({
            "name": name.group(1),
            "categories": [enum_value(c) for c in cats.group(1).split(",") if c.strip()] if cats else [],
            "tags": [t for t in re.findall(r'"([^"]+)"', tags.group(1)) if t != "*new*"] if tags else [],
            "weights": PHOSPHOR_WEIGHTS,
        })
    return icons


def parse_tabler(source):
    return [
        {
            "name": icon["name"],
            "categories": [icon["category"].lower()] if icon.get("category") else [],
            "tags": [str(t) for t in icon.get("tags", [])],
            "weights": sorted(icon.get("styles", {}).keys(), key=lambda w: TABLER_WEIGHTS.index(w)),
        }
        for icon in json.loads(source).values()
    ]


def phosphor_path(name, weight):
    return f"assets/{weight}/{name}.svg" if weight == "regular" else f"assets/{weight}/{name}-{weight}.svg"


def tabler_path(name, weight):
    return f"icons/{weight}/{name}.svg"


def clean_tabler(svg):
    svg = TABLER_GUIDE.sub("", svg)
    svg = re.sub(r'\s*class="[^"]*"', "", svg)
    return re.sub(r">\s+<", "><", re.sub(r"\s*\n\s*", " ", svg)).replace(" >", ">").strip()


PHOSPHOR_WEIGHTS = ["regular", "thin", "light", "bold", "fill", "duotone"]
TABLER_WEIGHTS = ["outline", "filled"]
LIBS = {
    "phosphor": {
        "package": "@phosphor-icons/core",
        "catalogue": "dist/index.mjs",
        "parse": parse_phosphor,
        "weights": PHOSPHOR_WEIGHTS,
        "default": "regular",
        "path": phosphor_path,
        "clean": lambda svg: svg,
        "site": "https://phosphoricons.com",
    },
    "tabler": {
        "package": "@tabler/icons",
        "catalogue": "icons.json",
        "parse": parse_tabler,
        "weights": TABLER_WEIGHTS,
        "default": "outline",
        "path": tabler_path,
        "clean": clean_tabler,
        "site": "https://tabler.io/icons",
    },
}


def resolve_version(lib, version):
    if version and version != "latest":
        return version
    try:
        return json.loads(fetch(RESOLVE.format(pkg=LIBS[lib]["package"])))["version"]
    except Exception:
        prefix = f"{lib}-"
        cached = sorted(f[len(prefix):-5] for f in os.listdir(CACHE_DIR) if f.startswith(prefix)) if os.path.isdir(CACHE_DIR) else []
        if cached:
            return cached[-1]
        raise


def load_catalogue(lib, version):
    spec = LIBS[lib]
    version = resolve_version(lib, version)
    path = os.path.join(CACHE_DIR, f"{lib}-{version}.json")
    if os.path.exists(path):
        with open(path) as f:
            return version, json.load(f)
    icons = spec["parse"](fetch(CDN.format(pkg=spec["package"], ver=version, path=spec["catalogue"])))
    if not icons:
        raise RuntimeError(f"{lib} catalogue format changed: no icons parsed")
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(path, "w") as f:
        json.dump(icons, f)
    return version, icons


def score(icon, words):
    total = 0
    name_parts = icon["name"].split("-")
    for word in words:
        best = 0
        if word == icon["name"]:
            best = 100
        elif word in name_parts:
            best = 60
        elif word in icon["name"]:
            best = 40
        elif word in icon["tags"]:
            best = 30
        elif any(word in t for t in icon["tags"]):
            best = 15
        elif any(word in c for c in icon["categories"]):
            best = 10
        if not best:
            return 0
        total += best
    return total - len(name_parts)


def style_svg(svg, color, size, stroke):
    if color:
        svg = svg.replace("currentColor", color)
    if stroke is not None:
        svg = re.sub(r'stroke-width="[^"]*"', f'stroke-width="{stroke}"', svg, count=1)
    if size:
        svg = re.sub(r'\s(width|height)="[^"]*"', "", svg[: svg.index(">")]) + svg[svg.index(">"):]
        svg = svg.replace("<svg ", f'<svg width="{size}" height="{size}" ', 1)
    return svg


def suggestions(name, icons):
    names = [i["name"] for i in icons]
    close = difflib.get_close_matches(name, names, n=5, cutoff=0.6)
    partial = [n for n in names if name in n][:5]
    return list(dict.fromkeys(close + partial))[:8]


def selected_libs(lib):
    return list(LIBS) if lib == "all" else [lib]


def cmd_search(args):
    words = [w for w in re.split(r"[\s,]+", args.query.lower().replace("_", "-")) if w]
    results = {}
    for lib in selected_libs(args.lib):
        version, icons = load_catalogue(lib, args.version)
        pool = [i for i in icons if not args.category or any(args.category.lower() in c for c in i["categories"])]
        ranked = sorted(((score(i, words), i) for i in pool), key=lambda p: -p[0])
        hits = [{"name": i["name"], "weights": i["weights"], "tags": i["tags"][:8], "categories": i["categories"]} for s, i in ranked if s > 0][: args.limit]
        results[lib] = {"version": version, "count": len(hits), "icons": hits}
    return {"query": args.query, "results": results}


def cmd_get(args):
    if args.lib == "all":
        raise ValueError("get needs one library: --lib phosphor or --lib tabler")
    spec = LIBS[args.lib]
    version, icons = load_catalogue(args.lib, args.version)
    by_name = {i["name"]: i for i in icons}
    weight = args.weight or spec["default"]
    if weight != "all" and weight not in spec["weights"]:
        raise ValueError(f"{args.lib} weights: {', '.join(spec['weights'])} or all")
    saved, missing, svgs = [], [], []
    for name in args.names:
        name = name.lower().replace("_", "-").replace(" ", "-")
        icon = by_name.get(name)
        if not icon:
            missing.append({"name": name, "suggestions": suggestions(name, icons)})
            continue
        weights = icon["weights"] if weight == "all" else [weight]
        if weight not in ("all", *icon["weights"]):
            missing.append({"name": name, "weight": weight, "available": icon["weights"]})
            continue
        for w in weights:
            raw = fetch(CDN.format(pkg=spec["package"], ver=version, path=spec["path"](name, w)))
            svg = style_svg(spec["clean"](raw), args.color, args.size, args.stroke if w == "outline" else None)
            if args.stdout:
                svgs.append({"name": name, "weight": w, "svg": svg})
                continue
            out_dir = os.path.join(args.out, w) if weight == "all" else args.out
            os.makedirs(out_dir, exist_ok=True)
            path = os.path.abspath(os.path.join(out_dir, f"{name}.svg"))
            with open(path, "w") as f:
                f.write(svg)
            saved.append({"name": name, "weight": w, "path": path})
    result = {"lib": args.lib, "version": version, "missing": missing}
    result["svgs" if args.stdout else "saved"] = svgs if args.stdout else saved
    return result


def cmd_categories(args):
    out = {}
    for lib in selected_libs(args.lib):
        version, icons = load_catalogue(lib, args.version)
        counts = {}
        for icon in icons:
            for c in icon["categories"]:
                counts[c] = counts.get(c, 0) + 1
        out[lib] = {"version": version, "total": len(icons), "categories": dict(sorted(counts.items()))}
    return out


def cmd_info(args):
    out, missing = {}, []
    for lib in selected_libs(args.lib):
        spec = LIBS[lib]
        version, icons = load_catalogue(lib, args.version)
        match = next((i for i in icons if i["name"] == args.name), None)
        if not match:
            missing.append({"lib": lib, "name": args.name, "suggestions": suggestions(args.name, icons)})
            continue
        urls = {w: CDN.format(pkg=spec["package"], ver=version, path=spec["path"](args.name, w)) for w in match["weights"]}
        out[lib] = {"version": version, "icon": match, "urls": urls}
    return {"results": out, "missing": missing if not out else []}


def main():
    parser = argparse.ArgumentParser(description="Search and download Phosphor and Tabler icons")
    parser.add_argument("--version", default="latest", help="Package version (default latest)")
    sub = parser.add_subparsers(dest="command", required=True)

    def lib_arg(p, default):
        p.add_argument("--lib", default=default, choices=list(LIBS) + ["all"])

    search = sub.add_parser("search", help="Rank icons by name, tags and category")
    search.add_argument("query")
    lib_arg(search, "all")
    search.add_argument("--category")
    search.add_argument("--limit", type=int, default=20)

    get = sub.add_parser("get", help="Download SVGs by exact name")
    get.add_argument("names", nargs="+")
    lib_arg(get, "phosphor")
    get.add_argument("--weight", help="phosphor: regular thin light bold fill duotone; tabler: outline filled; or all")
    get.add_argument("--out", default="./icons")
    get.add_argument("--color", help="Replace currentColor, e.g. #FFB547")
    get.add_argument("--size", type=int, help="Set width/height in px")
    get.add_argument("--stroke", type=float, help="Tabler outline stroke width (default 2)")
    get.add_argument("--stdout", action="store_true", help="Print SVG markup in the JSON instead of writing files")

    categories = sub.add_parser("categories", help="List categories with icon counts")
    lib_arg(categories, "all")
    info = sub.add_parser("info", help="Metadata and CDN URLs of one icon")
    info.add_argument("name")
    lib_arg(info, "all")

    args = parser.parse_args()
    handler = {"search": cmd_search, "get": cmd_get, "categories": cmd_categories, "info": cmd_info}[args.command]
    try:
        result = handler(args)
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)}))
        sys.exit(2)
    ok = not result.get("missing")
    print(json.dumps({"ok": ok, **result}, ensure_ascii=False, indent=1))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
