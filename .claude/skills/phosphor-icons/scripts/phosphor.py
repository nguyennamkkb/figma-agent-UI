#!/usr/bin/env python3
"""Find and download Phosphor icons (phosphoricons.com, MIT) without a browser.

Source: the npm package @phosphor-icons/core served by jsDelivr. Its dist/index.mjs
holds the catalogue (name, tags, categories) and assets/<weight>/<name>.svg the icons.
The catalogue is parsed as text (never executed) and cached in ~/.cache/phosphor-icons.

Usage:
  phosphor.py search "upload cloud" [--category media] [--limit 20]
  phosphor.py get house heart --weight regular --out ./icons [--color #FFB547] [--size 24]
  phosphor.py get star --weight fill --stdout
  phosphor.py get house --weight all --out ./icons
  phosphor.py categories
  phosphor.py info house

Weights: regular, thin, light, bold, fill, duotone (or "all"). Duotone icons draw the
second tone with opacity 0.2 of currentColor. Names are kebab-case as on the website;
with a duotone or fill weight the file is <name>-<weight>.svg, as in the package.
Every command prints JSON; a missing icon exits 1 and lists close names.
"""

import argparse
import difflib
import json
import os
import re
import sys
import urllib.request

PACKAGE = "@phosphor-icons/core"
CDN = "https://cdn.jsdelivr.net/npm/{pkg}@{ver}/{path}"
RESOLVE = "https://data.jsdelivr.com/v1/packages/npm/{pkg}/resolved"
WEIGHTS = ["regular", "thin", "light", "bold", "fill", "duotone"]
CACHE_DIR = os.path.expanduser("~/.cache/phosphor-icons")


def fetch(url, attempts=3):
    request = urllib.request.Request(url, headers={"User-Agent": "phosphor-icons-skill"})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read().decode("utf-8")
        except Exception:
            if attempt == attempts - 1:
                raise


def resolve_version(version):
    if version and version != "latest":
        return version
    try:
        return json.loads(fetch(RESOLVE.format(pkg=PACKAGE)))["version"]
    except Exception:
        cached = sorted(f[:-5] for f in os.listdir(CACHE_DIR) if f.endswith(".json")) if os.path.isdir(CACHE_DIR) else []
        if cached:
            return cached[-1]
        raise


def parse_enums(source):
    enums = {}
    for body, var in re.findall(r"\(\(\w+\) => \((.*?)\w+\)\)\((\w+) \|\| \{\}\)", source, re.S):
        enums[var] = dict(re.findall(r"\w+\.(\w+) = \"([^\"]+)\"", body))
    return enums


def parse_catalogue(source):
    enums = parse_enums(source)

    def enum_value(ref):
        var, key = ref.strip().split(".")
        return enums.get(var, {}).get(key, key.lower())

    icons = []
    for block in re.split(r"\n  \{\n", source)[1:]:
        name = re.search(r'name: "([^"]+)"', block)
        if not name:
            continue
        pascal = re.search(r'pascal_name: "([^"]+)"', block)
        cats = re.search(r"categories: \[(.*?)\]", block, re.S)
        figma = re.search(r"figma_category: (\w+\.\w+)", block)
        tags = re.search(r"tags: \[(.*?)\]", block, re.S)
        code = re.search(r"codepoint: (\d+)", block)
        icons.append({
            "name": name.group(1),
            "pascal_name": pascal.group(1) if pascal else None,
            "categories": [enum_value(c) for c in cats.group(1).split(",") if c.strip()] if cats else [],
            "figma_category": enum_value(figma.group(1)) if figma else None,
            "tags": [t for t in re.findall(r'"([^"]+)"', tags.group(1)) if t != "*new*"] if tags else [],
            "codepoint": int(code.group(1)) if code else None,
        })
    return icons


def load_catalogue(version):
    version = resolve_version(version)
    path = os.path.join(CACHE_DIR, f"{version}.json")
    if os.path.exists(path):
        with open(path) as f:
            return version, json.load(f)
    source = fetch(CDN.format(pkg=PACKAGE, ver=version, path="dist/index.mjs"))
    icons = parse_catalogue(source)
    if not icons:
        raise RuntimeError("Catalogue format changed: no icons parsed")
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


def file_name(name, weight):
    return f"{name}.svg" if weight == "regular" else f"{name}-{weight}.svg"


def style_svg(svg, color, size):
    if color:
        svg = svg.replace("currentColor", color)
    if size:
        svg = svg.replace("<svg ", f'<svg width="{size}" height="{size}" ', 1)
    return svg


def suggestions(name, icons):
    names = [i["name"] for i in icons]
    close = difflib.get_close_matches(name, names, n=5, cutoff=0.6)
    partial = [n for n in names if name in n][:5]
    return list(dict.fromkeys(close + partial))[:8]


def cmd_search(args, version, icons):
    words = [w for w in re.split(r"[\s,]+", args.query.lower().replace("_", "-")) if w]
    pool = [i for i in icons if not args.category or any(args.category.lower() in c for c in i["categories"] + [i["figma_category"] or ""])]
    ranked = sorted(((score(i, words), i) for i in pool), key=lambda p: -p[0])
    hits = [{"name": i["name"], "tags": i["tags"][:8], "categories": i["categories"]} for s, i in ranked if s > 0][: args.limit]
    return {"version": version, "query": args.query, "count": len(hits), "icons": hits}


def cmd_get(args, version, icons):
    known = {i["name"] for i in icons}
    weights = WEIGHTS if args.weight == "all" else [args.weight]
    saved, missing, svgs = [], [], []
    for name in args.names:
        name = name.lower().replace("_", "-").replace(" ", "-")
        if name not in known:
            missing.append({"name": name, "suggestions": suggestions(name, icons)})
            continue
        for weight in weights:
            svg = style_svg(fetch(CDN.format(pkg=PACKAGE, ver=version, path=f"assets/{weight}/{file_name(name, weight)}")), args.color, args.size)
            if args.stdout:
                svgs.append({"name": name, "weight": weight, "svg": svg})
                continue
            out_dir = os.path.join(args.out, weight) if len(weights) > 1 else args.out
            os.makedirs(out_dir, exist_ok=True)
            path = os.path.abspath(os.path.join(out_dir, f"{name}.svg"))
            with open(path, "w") as f:
                f.write(svg)
            saved.append({"name": name, "weight": weight, "path": path})
    result = {"version": version, "missing": missing}
    result["svgs" if args.stdout else "saved"] = svgs if args.stdout else saved
    return result


def cmd_categories(args, version, icons):
    counts = {}
    for icon in icons:
        for c in icon["categories"]:
            counts[c] = counts.get(c, 0) + 1
    return {"version": version, "total": len(icons), "categories": dict(sorted(counts.items()))}


def cmd_info(args, version, icons):
    match = next((i for i in icons if i["name"] == args.name), None)
    if not match:
        return {"version": version, "missing": [{"name": args.name, "suggestions": suggestions(args.name, icons)}]}
    urls = {w: CDN.format(pkg=PACKAGE, ver=version, path=f"assets/{w}/{file_name(args.name, w)}") for w in WEIGHTS}
    return {"version": version, "icon": match, "urls": urls}


def main():
    parser = argparse.ArgumentParser(description="Search and download Phosphor icons")
    parser.add_argument("--version", default="latest", help="@phosphor-icons/core version (default latest)")
    sub = parser.add_subparsers(dest="command", required=True)

    search = sub.add_parser("search", help="Rank icons by name, tags and category")
    search.add_argument("query")
    search.add_argument("--category")
    search.add_argument("--limit", type=int, default=20)

    get = sub.add_parser("get", help="Download SVGs by exact name")
    get.add_argument("names", nargs="+")
    get.add_argument("--weight", default="regular", choices=WEIGHTS + ["all"])
    get.add_argument("--out", default="./phosphor-icons")
    get.add_argument("--color", help="Replace currentColor, e.g. #FFB547")
    get.add_argument("--size", type=int, help="Set width/height in px (viewBox stays 256)")
    get.add_argument("--stdout", action="store_true", help="Print SVG markup in the JSON instead of writing files")

    sub.add_parser("categories", help="List categories with icon counts")
    info = sub.add_parser("info", help="Metadata and CDN URLs of one icon")
    info.add_argument("name")

    args = parser.parse_args()
    try:
        version, icons = load_catalogue(args.version)
        handler = {"search": cmd_search, "get": cmd_get, "categories": cmd_categories, "info": cmd_info}[args.command]
        result = handler(args, version, icons)
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)}))
        sys.exit(2)
    ok = not result.get("missing")
    print(json.dumps({"ok": ok, **result}, ensure_ascii=False, indent=1))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
