"""Compare two ads-board version specs and print what changed.

Usage:
  python3 spec_diff.py specs/V1.9.0.yaml specs/V2.0.0.yaml [--map 101=A1,102=A2,201=B1,202=B2,301=C1]

Screens are matched by name. --map renames leading screen codes of the old
spec (old=new) before matching, for versions that renumbered screens. Prints
added, removed, reordered screens and changed type / ad / layout / close /
content as a Markdown list for the user gate and the "Thay đổi so với" note.
"""
import argparse, re, sys

import yaml

FIELDS = ('type', 'ad', 'layout', 'close', 'content')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('old')
    ap.add_argument('new')
    ap.add_argument('--map', default='')
    a = ap.parse_args()
    old = yaml.safe_load(open(a.old, encoding='utf-8'))
    new = yaml.safe_load(open(a.new, encoding='utf-8'))
    rename = dict(p.split('=') for p in a.map.split(',') if '=' in p)

    def key(name):
        m = re.match(r'^(\S+?)(?=[\s_\-]|$)', name)
        return rename[m.group(1)] + name[m.end():] if m and m.group(1) in rename else name

    o = {key(s['name']): s for s in old['screens']}
    n = {s['name']: s for s in new['screens']}
    o_order = [key(s['name']) for s in old['screens']]
    n_order = [s['name'] for s in new['screens']]
    lines = [f"# {old['version']} → {new['version']}"]
    for k in n_order:
        if k not in o:
            s = n[k]
            extra = s.get('layout') or s.get('close')
            lines.append(f"- Thêm `{k}` ({s['type']}, ad: {s['ad']}{' · ' + extra if extra else ''})")
    for k in o_order:
        if k not in n:
            lines.append(f"- Bỏ `{o[k]['name']}`")
    common_old = [k for k in o_order if k in n]
    common_new = [k for k in n_order if k in o]
    if common_old != common_new:
        lines.append('- Đổi thứ tự: ' + ' → '.join(common_new))
    for k in common_new:
        diffs = [f"{f}: {o[k].get(f)} → {n[k].get(f)}" for f in FIELDS if o[k].get(f) != n[k].get(f)]
        if diffs:
            lines.append(f"- `{k}`: " + '; '.join(diffs))
    if len(lines) == 1:
        lines.append('- Không có thay đổi')
    sys.stdout.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
