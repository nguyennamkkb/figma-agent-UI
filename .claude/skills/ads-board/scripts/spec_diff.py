"""Compare two ads-board version specs and print what changed.

Usage:
  python3 spec_diff.py specs/V1.9.0.yaml specs/V2.0.0.yaml [--map 101=A1,102=A2,201=B1,202=B2,301=C1]

Screens are matched by code (and occurrence, when a code repeats), so a renamed
screen shows as a rename, not as removed + added. --map renames the codes of the
old spec (old=new) before matching, for versions that renumbered screens. Prints
added, removed, reordered screens and changed type / ad / layout / close /
content as a Markdown list for the user gate and the "Thay đổi so với" note.
"""
import argparse, sys

import yaml

FIELDS = ('type', 'ad', 'layout', 'close', 'content', 'footer')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('old')
    ap.add_argument('new')
    ap.add_argument('--map', default='')
    a = ap.parse_args()
    old = yaml.safe_load(open(a.old, encoding='utf-8'))
    new = yaml.safe_load(open(a.new, encoding='utf-8'))
    rename = dict(p.split('=') for p in a.map.split(',') if '=' in p)

    def keyed(screens, mapped):
        seen, out = {}, []
        for s in screens:
            code = str(s.get('code', s['name']))
            code = rename.get(code, code) if mapped else code
            seen[code] = seen.get(code, 0) + 1
            out.append(((code, seen[code]), s))
        return out

    old_k = keyed(old['screens'], True)
    new_k = keyed(new['screens'], False)
    o = dict(old_k)
    n = dict(new_k)
    o_order = [k for k, _ in old_k]
    n_order = [k for k, _ in new_k]
    lines = [f"# {old['version']} → {new['version']}"]
    for k in n_order:
        if k not in o:
            s = n[k]
            extra = s.get('layout') or s.get('close')
            lines.append(f"- Thêm `{s['name']}` ({s['type']}, ad: {s['ad']}{' · ' + extra if extra else ''})")
    for k in o_order:
        if k not in n:
            lines.append(f"- Bỏ `{o[k]['name']}`")
    common_old = [k for k in o_order if k in n]
    common_new = [k for k in n_order if k in o]
    if common_old != common_new:
        lines.append('- Đổi thứ tự: ' + ' → '.join(n[k]['name'] for k in common_new))
    for k in common_new:
        diffs = [f"{f}: {o[k].get(f)} → {n[k].get(f)}" for f in FIELDS if o[k].get(f) != n[k].get(f)]
        oname, ocode = o[k]['name'], str(o[k].get('code', ''))
        if ocode in rename and oname.startswith(ocode):
            oname = rename[ocode] + oname[len(ocode):]
        if oname != n[k]['name']:
            diffs.insert(0, f"tên: `{o[k]['name']}` → `{n[k]['name']}`")
        if diffs:
            lines.append(f"- `{n[k]['name']}`: " + '; '.join(diffs))
    if len(lines) == 1:
        lines.append('- Không có thay đổi')
    sys.stdout.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
