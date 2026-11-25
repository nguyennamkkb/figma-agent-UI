"""Check that the redesigned file still has every function of the baseline.

Usage:
    python3 parity.py <inventory.baseline.json> <inventory.current.json>
                      [--map screen-map.json] [--images image-map.json]
                      [--flow FL-03] [--level L1|L2|L3|L4] [--out <dir>]

Both inventories come from scan.js (mode "scan") on the same working file: the baseline
before any edit, the current one after. screen-map.json (from analyze.py, kept up to date
by build) pins baseline -> current screens and holds "sections", "extras", "copyMap";
image-map.json lists approved new images. Writes parity.json and parity-report.md into
<dir> (default: the current inventory's folder) and prints a one-line summary.

Verdict per baseline screen:
    covered    a current screen carries it (pinned in screen-map or matched by content)
    shared     carried by a screen of another flow that this flow links to
    elsewhere  carried by a screen of another flow with no link from this flow (check)
    duplicate  identical to another baseline screen
    dropped    removed on purpose (screen-map status "dropped" with a note)
    missing    nothing carries it: must be built
Plus CTA rules (references/cta-rules.md), image rules (references/imagery.md) and the
change-level rules (references/levels.md). The level of a baseline screen is --level when
given, else screen-map "levels"[flow], else screen-map "level", else L2. L1/L2 screens get
LVL-LAYOUT when their text order drifts from the baseline (or the height class changes),
L1 screens get LVL-SIZE and IMG-L1, and IMG-SOURCE is not reported at L1. L3 masters get
LVL-LIGHT when their screen-map "moves" miss the minimum bar (>= 3, >= 1 structural S move)
or, with no moves recorded, when their text order agreement is still >= 0.97.
Only the Python standard library is used.
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from analyze import archetype, assign_banner_sections, features, jaccard, signature, words  # noqa: E402

STRICT_FEATURES = {"Loading", "Toast", "Dialog", "Downloading", "Saved", "Empty", "Sheet"}
PAY_LABEL = re.compile(r"purchase|buy|subscribe|start (free )?trial|unlock|go premium|get pro|upgrade|pay\b", re.I)
DESTRUCTIVE_LABEL = re.compile(r"discard|delete|remove|log ?out|sign ?out|erase", re.I)
STRONG_VARIANT = re.compile(r"primary|purchase|generate", re.I)
LEVELS = ("L1", "L2", "L3", "L4")
ORDER_MIN = {"L1": 0.85, "L2": 0.7}
L3_ORDER_MAX = 0.97
L3_MIN_MOVES = 3


def load(p):
    return json.loads(Path(p).read_text()) if p and Path(p).exists() else None


def usable(inv):
    return [s for s in inv.get("screens", []) if s["kind"] == "screen" and not s.get("junk")]


def apply_copy(texts, copy_map):
    out = []
    for t in texts:
        out.append(copy_map.get(t, t))
    return out


def norm_instances(s):
    return {re.sub(r"\s+", " ", i.split("/")[0]).strip().lower() for i in s.get("instances", [])}


def score(b, c, copy_map):
    tw = jaccard(words(apply_copy(b.get("texts", []), copy_map)), words(c.get("texts", [])))
    bi = {i["hash"] for i in b.get("images", [])}
    ci = {i["hash"] for i in c.get("images", [])}
    iw = len(bi & ci) / max(1, len(bi)) if bi else 0.0
    nw = jaccard(norm_instances(b), norm_instances(c))
    sc = 0.65 * tw + 0.2 * iw + 0.15 * nw
    need = set(features(b)) & STRICT_FEATURES
    have = set(features(c))
    if need - have:
        sc *= 0.5
    extra = (have & STRICT_FEATURES) - set(features(b))
    if extra:
        sc *= 0.8
    return sc


def order_agreement(b, c, copy_map):
    bt = apply_copy(b.get("texts", []), copy_map)
    ct = c.get("texts", [])
    common = set(bt) & set(ct)
    if len(common) < 3:
        return None
    x = [t for t in bt if t in common]
    y = [t for t in ct if t in common]
    prev = [0] * (len(y) + 1)
    for xi in x:
        row = [0]
        for j, yj in enumerate(y):
            row.append(prev[j] + 1 if xi == yj else max(prev[j + 1], row[j]))
        prev = row
    return round(prev[-1] / len(common), 2)


def height_class(s):
    return "scroll" if s.get("w") and s.get("h", 0) / s["w"] > 2.6 else "fixed"


def norm_level(v):
    v = (v or "").upper()
    return v if v in LEVELS else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("baseline")
    ap.add_argument("current")
    ap.add_argument("--map")
    ap.add_argument("--images")
    ap.add_argument("--flow")
    ap.add_argument("--level", type=norm_level)
    ap.add_argument("--out")
    ap.add_argument("--threshold", type=float, default=0.3)
    a = ap.parse_args()

    base = load(a.baseline)
    cur = load(a.current)
    if not base or not cur:
        sys.exit("baseline or current inventory not found")
    assign_banner_sections(base)
    assign_banner_sections(cur)
    smap = load(a.map) or {}
    imap = load(a.images) or {}
    copy_map = smap.get("copyMap", {})
    pinned = {e["baselineId"]: e for e in smap.get("screens", [])}
    flow_of = {e["baselineId"]: e.get("flow") for e in smap.get("screens", [])}
    extras_ok = {e if isinstance(e, str) else e.get("id") for e in smap.get("extras", [])}
    project_level = norm_level(smap.get("level")) or "L2"
    flow_levels = {k: norm_level(v) for k, v in smap.get("levels", {}).items()}

    def level_of(baseline_id):
        return a.level or flow_levels.get(flow_of.get(baseline_id)) or project_level

    b_screens = usable(base)
    c_screens = usable(cur)
    c_by_id = {s["id"]: s for s in c_screens}

    edges = set()
    for c in cur.get("connectors", []):
        if c.get("fromScreen") and c.get("toScreen"):
            edges.add((c["fromScreen"], c["toScreen"]))
    for s in c_screens:
        for r in s.get("reactions", []):
            if r.get("toScreen"):
                edges.add((s["id"], r["toScreen"]))

    seen = {}
    results = []
    for b in b_screens:
        sig = signature(b)
        if sig in seen and seen[sig]["sectionId"] == b.get("sectionId"):
            results.append({"baseline": b, "verdict": "duplicate", "of": seen[sig]["id"]})
            continue
        seen.setdefault(sig, b)
        entry = pinned.get(b["id"])
        if entry and entry.get("status") == "dropped":
            results.append({"baseline": b, "verdict": "dropped", "note": entry.get("note", "")})
            continue
        if entry and entry.get("currentId") in c_by_id:
            results.append({"baseline": b, "verdict": "covered", "match": c_by_id[entry["currentId"]], "score": 1.0, "how": "pinned"})
            continue
        best, best_sc = None, 0.0
        for c in c_screens:
            sc = score(b, c, copy_map)
            if sc > best_sc:
                best, best_sc = c, sc
        if best and best_sc >= a.threshold:
            results.append({"baseline": b, "verdict": "covered", "match": best, "score": round(best_sc, 2), "how": "content"})
        else:
            results.append({"baseline": b, "verdict": "missing", "best": best, "score": round(best_sc, 2)})

    votes = {}
    for r in results:
        if r["verdict"] == "covered":
            votes.setdefault(r["baseline"].get("section"), {}).setdefault(r["match"].get("section"), 0)
            votes[r["baseline"].get("section")][r["match"].get("section")] += 1
    sec_map = dict(smap.get("sections", {}))
    for bsec, v in votes.items():
        sec_map.setdefault(bsec, max(v.items(), key=lambda x: x[1])[0])

    for r in results:
        if r["verdict"] != "covered":
            continue
        want = sec_map.get(r["baseline"].get("section"))
        got = r["match"].get("section")
        if want and got != want:
            flow_screens = {s["id"] for s in c_screens if s.get("section") == want}
            linked = any((f, r["match"]["id"]) in edges for f in flow_screens)
            r["verdict"] = "shared" if linked else "elsewhere"
            r["expectedSection"] = want

    if a.flow:
        keep = {e["baselineId"] for e in smap.get("screens", []) if e.get("flow") == a.flow}
        wanted_secs = {e.get("baselineSection") for e in smap.get("screens", []) if e.get("flow") == a.flow}
        results = [r for r in results if r["baseline"]["id"] in keep or r["baseline"].get("section") in wanted_secs]

    matched_ids = {r["match"]["id"] for r in results if r.get("match")}
    scope_secs = {sec_map.get(r["baseline"].get("section")) for r in results}
    extras = [c for c in c_screens if c["id"] not in matched_ids and c["id"] not in extras_ok and (not a.flow or c.get("section") in scope_secs)]

    moves_of = {e["baselineId"]: e.get("moves") for e in smap.get("screens", []) if e.get("moves") is not None}
    issues = []
    cur_level = {}
    for r in results:
        r["level"] = level_of(r["baseline"]["id"])
        m = r.get("match")
        if not m:
            continue
        cur_level.setdefault(m["id"], r["level"])
        b = r["baseline"]
        if r["level"] in ORDER_MIN:
            r["order"] = order_agreement(b, m, copy_map)
            if r["order"] is not None and r["order"] < ORDER_MIN[r["level"]]:
                issues.append(("LVL-LAYOUT", "warn", m["name"], f'{r["level"]}: text order agreement {r["order"]} with baseline {b["name"]} (min {ORDER_MIN[r["level"]]}): blocks moved'))
            if height_class(b) != height_class(m):
                issues.append(("LVL-LAYOUT", "warn", m["name"], f'{r["level"]}: height class {height_class(b)} → {height_class(m)}'))
        if r["level"] == "L3":
            moves = moves_of.get(b["id"])
            if moves is not None:
                structural = [x for x in moves if str(x).upper().startswith("S")]
                if len(moves) < L3_MIN_MOVES or not structural:
                    issues.append(("LVL-LIGHT", "warn", m["name"], f'L3: moves {", ".join(moves) or "none"} — need >= {L3_MIN_MOVES} with >= 1 structural (S): reads as L2+'))
            else:
                order = order_agreement(b, m, copy_map)
                if order is not None and order >= L3_ORDER_MAX:
                    issues.append(("LVL-LIGHT", "warn", m["name"], f'L3: text order agreement {order} with baseline {b["name"]} and no moves recorded: blocks in baseline order, reads as L2+'))
        if r["level"] == "L1":
            if (b.get("w"), b.get("h")) != (m.get("w"), m.get("h")):
                issues.append(("LVL-SIZE", "warn", m["name"], f'L1: frame {b.get("w")}×{b.get("h")} → {m.get("w")}×{m.get("h")}'))
            bh = {i["hash"] for i in b.get("images", []) if i.get("hero")}
            mh = {i["hash"] for i in m.get("images", []) if i.get("hero")}
            if mh - bh:
                issues.append(("IMG-L1", "warn", m["name"], "L1 keeps images: a hero image differs from the baseline"))
    scope = [c for c in c_screens if not a.flow or c.get("section") in scope_secs]
    for c in scope:
        arch = archetype(c)
        strong = 0
        for k in c.get("ctas", []):
            v = k.get("variant") or ""
            where = f'{c["name"]} → "{k["label"]}"'
            if k["kind"] == "local":
                issues.append(("CTA-LOCAL", "error", where, "hand-built button: replace with a Button instance of the right Style"))
            if k.get("mirror") and not re.search(r"purchase", v, re.I):
                issues.append(("CTA-MIRROR", "error", where, f"diagonal bands on a non-Purchase button ({v or 'local'})"))
            if (PAY_LABEL.search(k["label"]) or (arch in ("paywall", "coin-purchase") and re.search(r"continue", k["label"], re.I))) and not k.get("inDialog") and not re.search(r"purchase", v, re.I):
                issues.append(("CTA-PAY", "warn", where, f"money action not on Style=Purchase ({v or 'local'})"))
            if k.get("inDialog") and k.get("gradient"):
                issues.append(("CTA-DIALOG", "warn", where, "dialog button with gradient: use the solid dialog style"))
            if DESTRUCTIVE_LABEL.search(k["label"]) and not re.search(r"destructive|danger", v, re.I):
                issues.append(("CTA-DESTRUCTIVE", "warn", where, f"destructive action not on Style=Destructive ({v or 'local'})"))
            if re.search(r"disabled", v, re.I) and re.search(r"\d", k["label"]):
                issues.append(("CTA-COST", "warn", where, "disabled button shows a number/cost"))
            if not k.get("inDialog") and (STRONG_VARIANT.search(v) or (k["kind"] == "local" and k.get("gradient"))):
                strong += 1
        if strong > 1:
            issues.append(("CTA-MULTI", "warn", c["name"], f"{strong} primary/purchase buttons outside a dialog"))

    base_hero = {i["hash"] for s in b_screens for i in s.get("images", []) if i.get("hero")}
    keep_hashes = set(imap.get("keep", []))
    approved = {e.get("newHash") for e in imap.get("images", []) if e.get("approved")}
    for c in scope:
        for i in c.get("images", []):
            if not i.get("hero"):
                continue
            if i["hash"] in base_hero and i["hash"] not in keep_hashes and cur_level.get(c["id"]) != "L1":
                issues.append(("IMG-SOURCE", "warn", c["name"], f"hero still uses the baseline image {i['hash'][:10]}"))
            elif imap.get("images") and i["hash"] not in base_hero and i["hash"] not in approved and i["hash"] not in keep_hashes:
                issues.append(("IMG-UNAPPROVED", "info", c["name"], f"hero image {i['hash'][:10]} is not an approved entry of image-map.json"))

    counts = {}
    for r in results:
        counts[r["verdict"]] = counts.get(r["verdict"], 0) + 1
    out_dir = Path(a.out) if a.out else Path(a.current).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    def ref(s):
        return {"id": s["id"], "name": s["name"], "section": s.get("section")} if s else None

    data = {
        "flow": a.flow,
        "level": a.level or {"project": project_level, "flows": {k: v for k, v in flow_levels.items() if v}},
        "baseline": base.get("scannedAt"),
        "current": cur.get("scannedAt"),
        "counts": counts,
        "sections": sec_map,
        "results": [
            {
                "verdict": r["verdict"],
                "baseline": ref(r["baseline"]),
                "features": features(r["baseline"]),
                "match": ref(r.get("match")),
                "best": ref(r.get("best")),
                "score": r.get("score"),
                "how": r.get("how"),
                "of": r.get("of"),
                "expectedSection": r.get("expectedSection"),
                "flow": flow_of.get(r["baseline"]["id"]),
                "level": r.get("level"),
                "order": r.get("order"),
            }
            for r in results
        ],
        "extras": [ref(c) for c in extras],
        "issues": [{"code": i[0], "level": i[1], "where": i[2], "detail": i[3]} for i in issues],
    }
    (out_dir / "parity.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")

    lv = a.level or project_level + (" (overrides: " + ", ".join(f"{k} {v}" for k, v in flow_levels.items() if v) + ")" if any(flow_levels.values()) else "")
    md = [f"# Parity report{' — ' + a.flow if a.flow else ''}", "", f"Baseline {base.get('scannedAt')} · current {cur.get('scannedAt')} · level {lv}", ""]
    md += ["## Summary", "", "| Verdict | Count |", "|---|---|"]
    for k in ["covered", "shared", "elsewhere", "duplicate", "dropped", "missing"]:
        md.append(f"| {k} | {counts.get(k, 0)} |")
    md.append(f"| extra (current, unmatched) | {len(extras)} |")
    errors = [i for i in issues if i[1] == "error"]
    warns = [i for i in issues if i[1] == "warn"]
    md.append(f"| CTA/image/level errors | {len(errors)} |")
    md.append(f"| CTA/image/level warnings | {len(warns)} |")
    by_sec = {}
    for r in results:
        sec = r["baseline"].get("section") or "(no section)"
        by_sec.setdefault(sec, {}).setdefault(r["verdict"], 0)
        by_sec[sec][r["verdict"]] += 1
    md += ["", "## Per baseline section", "", "| Baseline section | → current section | covered | shared | elsewhere | duplicate | dropped | missing |", "|---|---|---|---|---|---|---|---|"]
    for sec, v in by_sec.items():
        md.append(f"| {sec} | {sec_map.get(sec, '?')} | " + " | ".join(str(v.get(k, 0)) for k in ["covered", "shared", "elsewhere", "duplicate", "dropped", "missing"]) + " |")
    miss = [r for r in results if r["verdict"] == "missing"]
    md += ["", "## Missing — must be built", ""]
    if miss:
        md += ["| Baseline screen | Section | States/features | Closest current (score) |", "|---|---|---|---|"]
        for r in miss:
            b = r["baseline"]
            best = r.get("best")
            md.append(f"| {b['name']} `{b['id']}` | {b.get('section')} | {', '.join(features(b)) or '—'} | {(best['name'] + ' (' + str(r['score']) + ')') if best else '—'} |")
    else:
        md.append("None.")
    chk = [r for r in results if r["verdict"] == "elsewhere"]
    if chk:
        md += ["", "## Elsewhere — carried by another flow without a link (add a connector or confirm)", ""]
        md += [f"- {r['baseline']['name']} `{r['baseline']['id']}` → {r['match']['name']} ({r['match'].get('section')}); expected in {r.get('expectedSection')}" for r in chk]
    md += ["", "## CTA, image and level issues", ""]
    if issues:
        md += ["| Code | Level | Where | Detail |", "|---|---|---|---|"]
        for i in sorted(issues, key=lambda x: ({"error": 0, "warn": 1, "info": 2}[x[1]], x[0])):
            md.append(f"| {i[0]} | {i[1]} | {i[2]} | {i[3]} |")
    else:
        md.append("None.")
    if extras:
        md += ["", "## Extra current screens (no baseline match; list in screen-map extras if intended)", ""]
        md += [f"- {c['name']} `{c['id']}` ({c.get('section')})" for c in extras]
    low = [r for r in results if r["verdict"] in ("covered", "shared", "elsewhere") and r.get("how") == "content" and r["score"] < 0.45]
    if low:
        md += ["", "## Weak matches — confirm visually or pin in screen-map", ""]
        md += [f"- {r['baseline']['name']} `{r['baseline']['id']}` → {r['match']['name']} `{r['match']['id']}` ({r['score']})" for r in low]
    (out_dir / "parity-report.md").write_text("\n".join(md) + "\n")
    print(json.dumps({"counts": counts, "extras": len(extras), "errors": len(errors), "warnings": len(warns), "report": str(out_dir / "parity-report.md")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
