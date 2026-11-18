"""Analyse a baseline inventory written by scan.js and draft the redesign map.

Usage:
    python3 analyze.py <redesign/<app>/inventory.baseline.json> [--out <dir>]

Reads the inventory (scan.js mode "scan", saved with execute_code{savePath}) and writes
into <dir> (default: the inventory's folder):
    analysis.json    flows, families (one screen + its states), duplicates, archetypes,
                     proposed codes, diagnosis counts
    screen-map.json  draft map baseline screen -> proposed code/name, filled by build
    analysis.md      the same, as tables for the plan and for the user

Junk sections/pages and meta frames (titles, notes) are listed but not analysed.
Files without Sections: wide title frames (meta, >= 1000 px wide, with text) act as
sections for the screens below them on the same page.
Only the Python standard library is used.
"""

import argparse
import json
import re
import sys
from pathlib import Path

ARCHETYPES = [
    ("splash", r"splash|welcome to|loading\.\.\.|please wait, loading", r"splash"),
    ("language", r"choose language|select language|english.*japan|language", r"language|lang"),
    ("onboarding", r"\bnext\b|get started|skip", r"onboard|^ob\d|^30\d|intro|walkthrough"),
    ("paywall", r"/week|/month|/year|restore|subscription|premium|free trial|billed", r"iap|paywall|premium|subscri|pro\b"),
    ("coin-purchase", r"coins?|purchase now|refill", r"coin|credit|top ?up"),
    ("home", r"discover|trending|for you|see all|try now", r"home|discover|main|dashboard"),
    ("template-detail", r"try now|use template|prompt|subject:", r"template|detail"),
    ("tutorial", r"\d of \d|got it|tutorial|how to", r"tutorial|guide|tip"),
    ("picker", r"all photos|recents|gallery|select photo|choose image|screenshot|selfies|favou?rites", r"choose image|picker|gallery|select photo|album"),
    ("crop", r"\bcrop\b|rotate|horizontal|vertical|flip", r"crop"),
    ("setup", r"upload|aspect ratio|generate|add photo|tap to upload|swap face", r"setup|upload|choose image|face ?swap|config"),
    ("processing", r"processing|generating|please wait|swapping|removing|regenerat|\d+%", r"processing|loading|generating|progress"),
    ("result", r"result|download|saved|share to|create new|regenerate", r"result|download|save|share"),
    ("report", r"report|inappropriate|send report", r"report"),
    ("editor", r"change bg|filter|adjust|makeup|background|opacity|pick colou?r", r"edit|change ?bg|background|collage"),
    ("settings", r"settings|rate app|feedback|share app|privacy policy|terms", r"setting|profile|account"),
    ("dialog", r"are you sure|allow|permission|cancel|discard|no internet|try again|error|time ?out", r"dialog|popup|alert|modal|permission"),
    ("ad", r"^ad$|sponsored|install", r"native full|interstitial|^ad\b|app ?open"),
]

FEEDBACK_ARCHETYPES = {"dialog", "processing", "ad"}

STATE_FEATURES = [
    ("Loading", r"loading|skeleton|shimmer|placeholder|spinner|progress|please wait|generating|processing|swapping|regenerat|removing"),
    ("Toast", r"toast|snackbar|please upload|is required|failed|error"),
    ("Dialog", r"dialog|popup|alert|modal|are you sure|discard|allow|permission"),
    ("Downloading", r"download"),
    ("Saved", r"saved|success"),
    ("Empty", r"tap to upload|add photo|empty|no item|nothing here"),
    ("Sheet", r"sheet|bottom ?sheet"),
    ("Keyboard", r"keyboard"),
]


def words(texts):
    out = set()
    for t in texts:
        for w in re.findall(r"[a-zA-ZÀ-ỹ0-9%]+", t.lower()):
            if len(w) > 1:
                out.add(w)
    return out


def signature(s):
    return (
        tuple(sorted(s.get("texts", []))),
        tuple(sorted(s.get("instances", []))),
        tuple(sorted(i["hash"] for i in s.get("images", []))),
    )


def jaccard(a, b):
    if not a and not b:
        return 1.0
    return len(a & b) / max(1, len(a | b))


def features(s):
    blob = " ".join([s["name"]] + s.get("texts", []) + s.get("instances", [])).lower()
    return sorted({name for name, rx in STATE_FEATURES if re.search(rx, blob)})


def archetype(s):
    name = s["name"].lower()
    blob = " ".join(s.get("texts", [])).lower()
    best, score = "screen", 0
    for arch, text_rx, name_rx in ARCHETYPES:
        sc = 0
        if re.search(name_rx, name):
            sc += 3
        sc += len(re.findall(text_rx, blob))
        if s.get("ads") and arch == "ad" and re.search(name_rx, name):
            sc += 2
        if sc > score:
            best, score = arch, sc
    return best


def assign_banner_sections(inv):
    banners = [
        m for m in inv.get("screens", [])
        if m["kind"] == "meta" and not m.get("junk") and m["w"] >= 1000 and m["h"] <= 400 and m.get("texts")
    ]
    known = {sec["id"] for sec in inv.get("sections", [])}
    for b in banners:
        if b["id"] not in known:
            inv.setdefault("sections", []).append(
                {"id": b["id"], "name": b["texts"][0], "page": b["page"], "parent": None, "junk": False, "x": b["x"], "y": b["y"], "w": b["w"], "h": b["h"], "banner": True}
            )
            known.add(b["id"])
    for s in inv.get("screens", []):
        if s.get("sectionId") or s["kind"] != "screen":
            continue
        above = [b for b in banners if b["page"] == s["page"] and b["y"] <= s["y"] and s["x"] >= b["x"] - 200]
        if above:
            b = max(above, key=lambda x: x["y"])
            s["sectionId"], s["section"] = b["id"], b["texts"][0]
    return inv


def section_order(sections):
    order = {}
    for i, sec in enumerate(sorted(sections, key=lambda x: (x["page"], x["y"], x["x"]))):
        order[sec["id"]] = i
    return order


def reading_order(screens):
    rows = []
    for s in sorted(screens, key=lambda x: x["y"]):
        for row in rows:
            if abs(row[0]["y"] - s["y"]) < 200:
                row.append(s)
                break
        else:
            rows.append([s])
    out = []
    for row in rows:
        out.extend(sorted(row, key=lambda x: x["x"]))
    return out


def base_name(name):
    n = re.split(r"[/·|]", name)[0]
    n = re.sub(r"\s+\d+$", "", n.strip())
    return n.strip().lower()


def build_families(screens):
    families = []
    for s in screens:
        ws = words(s.get("texts", []))
        placed = None
        for fam in families:
            head = fam["screens"][0]
            same_base = base_name(head["name"]) == base_name(s["name"])
            sim = jaccard(words(head.get("texts", [])), ws)
            if fam["section"] == s.get("sectionId") and (sim >= 0.6 or (same_base and sim >= 0.3)):
                placed = fam
                break
        if placed:
            placed["screens"].append(s)
        else:
            families.append({"section": s.get("sectionId"), "screens": [s]})
    return families


def state_label(s, head, used):
    own = set(features(s)) - (set(features(head)) if s is not head else set())
    for name, _ in STATE_FEATURES:
        if name in own and name not in used:
            return name
    if s is head:
        return "Default"
    i = 2
    while f"Variant {i}" in used:
        i += 1
    return f"Variant {i}"


def short(name, n=40):
    return name if len(name) <= n else name[: n - 1] + "…"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inventory")
    ap.add_argument("--out")
    a = ap.parse_args()
    inv_path = Path(a.inventory)
    inv = json.loads(inv_path.read_text())
    assign_banner_sections(inv)
    out_dir = Path(a.out) if a.out else inv_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    sections = {s["id"]: s for s in inv.get("sections", [])}
    sec_rank = section_order(inv.get("sections", []))
    all_screens = inv.get("screens", [])
    screens = [s for s in all_screens if s["kind"] == "screen" and not s.get("junk")]
    ignored = [s for s in all_screens if s not in screens]

    seen = {}
    duplicates = []
    unique = []
    for s in screens:
        sig = signature(s)
        if sig in seen and seen[sig].get("sectionId") == s.get("sectionId"):
            duplicates.append({"id": s["id"], "name": s["name"], "duplicateOf": seen[sig]["id"]})
        else:
            seen.setdefault(sig, s)
            unique.append(s)

    by_section = {}
    for s in unique:
        by_section.setdefault(s.get("sectionId"), []).append(s)
    ordered_sections = sorted(by_section, key=lambda k: sec_rank.get(k, 10_000))

    flows = []
    screen_map = []
    scr_n, fbk_n = 0, 0
    archetype_count = {}
    for fi, sid in enumerate(ordered_sections, start=1):
        sec = sections.get(sid, {"name": "(no section)", "id": None})
        fl_code = f"FL-{fi:02d}"
        fams = build_families(reading_order(by_section[sid]))
        flow = {"code": fl_code, "section": sec["name"], "sectionId": sid, "families": []}
        for fam in fams:
            head = fam["screens"][0]
            arch = archetype(head)
            archetype_count[arch] = archetype_count.get(arch, 0) + 1
            feedback = arch in FEEDBACK_ARCHETYPES
            if feedback:
                fbk_n += 1
                code = f"FBK-{fbk_n:02d}"
            else:
                scr_n += 1
                code = f"SCR-{scr_n:02d}"
            title = re.sub(r"\s+", " ", re.split(r"[/·|]", head["name"])[0]).strip().title() or arch.title()
            used = set()
            states = []
            for s in fam["screens"]:
                st = state_label(s, head, used)
                used.add(st)
                states.append({"id": s["id"], "name": s["name"], "state": st, "features": features(s)})
                screen_map.append(
                    {
                        "baselineId": s["id"],
                        "baselineName": s["name"],
                        "baselineSection": sec["name"],
                        "flow": fl_code,
                        "archetype": arch,
                        "code": code,
                        "proposedName": f"{code} · {title} · {st}",
                        "currentId": None,
                        "status": "todo",
                        "note": "",
                    }
                )
            flow["families"].append({"code": code, "archetype": arch, "title": title, "states": states})
        flows.append(flow)

    edges = []
    for c in inv.get("connectors", []):
        if c.get("fromScreen") and c.get("toScreen"):
            edges.append({"from": c["fromScreen"], "to": c["toScreen"], "label": c.get("label", "")})
    for s in screens:
        for r in s.get("reactions", []):
            if r.get("toScreen"):
                edges.append({"from": s["id"], "to": r["toScreen"], "label": r.get("trigger") or "reaction"})

    name_counts = {}
    for s in screens:
        name_counts[s["name"].strip().lower()] = name_counts.get(s["name"].strip().lower(), 0) + 1
    ctas = [(s, c) for s in screens for c in s.get("ctas", [])]
    diagnosis = {
        "screens": len(screens),
        "uniqueScreens": len(unique),
        "duplicates": len(duplicates),
        "ignoredFrames": len(ignored),
        "junkSections": sorted({s["name"] for s in inv.get("sections", []) if s.get("junk")}),
        "repeatedNames": sorted([n for n, k in name_counts.items() if k > 1]),
        "defaultNames": sorted({s["name"] for s in screens if re.match(r"^(frame|group|rectangle|image)\s*\d*$", s["name"].strip(), re.I)}),
        "flatScreens": [s["name"] for s in screens if s.get("flat")],
        "localCtas": sorted({f'{s["name"]} → {c["label"]}' for s, c in ctas if c["kind"] == "local"}),
        "screensWithAds": len([s for s in screens if s.get("ads")]),
        "edges": len(edges),
        "designSystem": inv.get("designSystem", {}),
    }

    analysis = {
        "file": inv.get("file"),
        "scannedAt": inv.get("scannedAt"),
        "flows": flows,
        "duplicates": duplicates,
        "archetypes": archetype_count,
        "edges": edges,
        "diagnosis": diagnosis,
        "ignored": [{"id": s["id"], "name": s["name"], "why": "junk" if s.get("junk") else "meta"} for s in ignored],
    }
    (out_dir / "analysis.json").write_text(json.dumps(analysis, ensure_ascii=False, indent=1) + "\n")

    sm_path = out_dir / "screen-map.json"
    if sm_path.exists():
        print(f"screen-map.json exists, kept: {sm_path} (draft written to screen-map.draft.json)", file=sys.stderr)
        sm_path = out_dir / "screen-map.draft.json"
    sm_path.write_text(json.dumps({"sections": {}, "screens": screen_map, "extras": [], "copyMap": {}}, ensure_ascii=False, indent=1) + "\n")

    md = [f"# Analysis — {inv.get('file')}", "", f"Scanned {inv.get('scannedAt')}", ""]
    md += ["## Summary", "", "| Item | Count |", "|---|---|"]
    md += [
        f"| Screens (excluding junk/meta) | {len(screens)} |",
        f"| Unique after duplicates | {len(unique)} |",
        f"| Flows (sections) | {len(flows)} |",
        f"| Screen families (one screen + states) | {sum(len(f['families']) for f in flows)} |",
        f"| Archetypes | {len(archetype_count)} |",
        f"| Navigation edges (connectors + prototype) | {len(edges)} |",
        "",
        "## Archetypes",
        "",
        "| Archetype | Families |",
        "|---|---|",
    ]
    md += [f"| {k} | {v} |" for k, v in sorted(archetype_count.items(), key=lambda x: -x[1])]
    for f in flows:
        md += ["", f"## {f['code']} — {f['section']}", "", "| Code | Archetype | States (baseline frame) |", "|---|---|---|"]
        for fam in f["families"]:
            st = "; ".join(f"{x['state']} ({short(x['name'], 32)})" for x in fam["states"])
            md.append(f"| {fam['code']} | {fam['archetype']} | {st} |")
    md += ["", "## Diagnosis", ""]
    for k, v in diagnosis.items():
        if isinstance(v, list):
            md.append(f"- **{k}** ({len(v)}): " + (", ".join(short(x, 50) for x in v[:15]) + (" …" if len(v) > 15 else "") if v else "none"))
        else:
            md.append(f"- **{k}**: {v}")
    if duplicates:
        md += ["", "## Duplicates (identical frames)", ""]
        md += [f"- {d['name']} `{d['id']}` = `{d['duplicateOf']}`" for d in duplicates]
    (out_dir / "analysis.md").write_text("\n".join(md) + "\n")
    print(json.dumps({"flows": len(flows), "families": sum(len(f["families"]) for f in flows), "screens": len(screens), "duplicates": len(duplicates), "written": [str(out_dir / "analysis.json"), str(sm_path), str(out_dir / "analysis.md")]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
