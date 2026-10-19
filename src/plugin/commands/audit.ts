// figma-master Giai đoạn 7 — read-only QA audit of a page or subtree.
// The heuristics live in ../../shared/audit.ts (unit-tested); this file only
// collects node data from the Figma tree.
import type { AuditInput } from '../../shared/schemas';
import {
  buildReport,
  contrastVerdict,
  isOffScale,
  isRedundantWrapper,
  nameProblem,
  targetSeverity,
  toQaMarkdown,
  type Issue,
  type RGB,
} from '../../shared/audit';
import { getNode } from '../util';

const CHECK_GROUPS: Record<string, string[]> = {
  names: ['default-name', 'blacklisted-name'],
  tokens: ['raw-fill', 'raw-text'],
  layout: ['no-autolayout', 'redundant-wrapper', 'off-scale-spacing'],
  a11y: ['contrast', 'small-target'],
  hygiene: ['hidden-layer', 'orphan-token'],
};

// Names that make a layer an interactive target (master: button, tab, chip,
// field, row…). Icons are excluded on purpose: their glyph is small but the
// hit area belongs to the interactive ancestor.
const INTERACTIVE = /^(Button|Tab(\/|$)|Chip|Link|Input|Field|Row|Item|Toggle|Checkbox|Radio|Segment|FAB)/;

const isScene = (n: BaseNode): n is SceneNode => 'visible' in n;

function solidColor(node: SceneNode): RGB | null {
  const paints = 'fills' in node && Array.isArray(node.fills) ? node.fills : [];
  // The last visible paint is the topmost one.
  for (let i = paints.length - 1; i >= 0; i--) {
    const p = paints[i];
    if (p.type === 'SOLID' && p.visible !== false) {
      if (p.opacity !== undefined && p.opacity < 0.95) return null; // blended with what is behind
      return p.color;
    }
    if (p.visible !== false && (p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL' || p.type === 'IMAGE')) return null;
  }
  return null;
}

// Real backdrop: nearest ancestor with a resolvable solid fill. Gradients and
// images return null so the caller reports "needs-check" instead of a wrong ratio.
function backdropOf(node: SceneNode): RGB | null {
  let cur: BaseNode | null = node.parent;
  while (cur && cur.type !== 'PAGE' && cur.type !== 'DOCUMENT') {
    if (isScene(cur)) {
      const paints = 'fills' in cur && Array.isArray(cur.fills) ? cur.fills : [];
      const hasPaint = paints.some((p) => p.visible !== false);
      if (hasPaint) return solidColor(cur);
    }
    cur = cur.parent;
  }
  return { r: 1, g: 1, b: 1 };
}

const bound = (node: SceneNode, field: string): boolean => {
  const bv = (node as SceneNode & { boundVariables?: Record<string, unknown> }).boundVariables;
  return !!bv && !!bv[field];
};

export async function auditDesign(p: AuditInput) {
  const root = p.rootId ? await getNode(p.rootId) : figma.currentPage;
  const enabled = new Set((p.checks?.length ? p.checks : Object.keys(CHECK_GROUPS)).flatMap((g) => CHECK_GROUPS[g] ?? []));
  const issues: Issue[] = [];
  const nodes: SceneNode[] = [];

  if (root.type === 'PAGE' || 'children' in root) {
    const walk = (n: BaseNode) => {
      if (!isScene(n)) return;
      nodes.push(n);
      for (const c of (n as ChildrenMixin).children ?? []) walk(c);
    };
    for (const child of (root as ChildrenMixin).children) walk(child);
  }

  for (const n of nodes) {
    const rect = 'x' in n ? { x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height) } : undefined;
    const push = (kind: Issue['kind'], detail?: string) => issues.push({ id: n.id, kind, name: n.name, detail, rect });

    // A + D5/D6 — naming
    if (enabled.has('default-name') || enabled.has('blacklisted-name')) {
      const problem = nameProblem(n.name);
      if (problem && enabled.has(problem)) push(problem);
    }

    // A1 / G2 — raw values (only meaningful once the file has tokens, but the
    // finding is exactly "this value is not bound", so it is always valid).
    if (enabled.has('raw-fill') && 'fills' in n && Array.isArray(n.fills)) {
      const styleId = 'fillStyleId' in n ? n.fillStyleId : '';
      n.fills.forEach((paint, i) => {
        if (paint.type === 'SOLID' && paint.visible !== false && !bound(n, 'fills') && !styleId) {
          push('raw-fill', `fill[${i}] không bind variable/style`);
        }
      });
    }
    if (enabled.has('raw-text') && n.type === 'TEXT') {
      const styleId = (n as TextNode).textStyleId;
      if (!styleId || styleId === figma.mixed) push('raw-text', 'text không dùng text style');
    }

    // A2 / D7 — auto layout
    if (enabled.has('no-autolayout') && n.type === 'FRAME') {
      const f = n as FrameNode;
      if (f.layoutMode === 'NONE' && f.children.length > 1 && !/^(decor|overlay)\//.test(f.name)) {
        push('no-autolayout', `${f.children.length} lớp con nhưng layout NONE`);
      }
    }
    if (enabled.has('redundant-wrapper') && n.type === 'FRAME') {
      const f = n as FrameNode;
      if (
        isRedundantWrapper({
          type: 'FRAME',
          childCount: f.children.length,
          hasVisual:
            (Array.isArray(f.fills) && f.fills.length > 0) ||
            (Array.isArray(f.strokes) && f.strokes.length > 0) ||
            f.effects.length > 0 ||
            f.cornerRadius !== 0 ||
            f.clipsContent,
          hasPadding: f.paddingTop + f.paddingRight + f.paddingBottom + f.paddingLeft > 0,
        })
      ) {
        push('redundant-wrapper', 'frame chỉ bọc 1 lớp, không có style/padding riêng');
      }
    }

    // D9 — spacing on the 4/8 scale
    if (enabled.has('off-scale-spacing') && 'layoutMode' in n && (n as FrameNode).layoutMode !== 'NONE') {
      const f = n as FrameNode;
      const fields: [string, number | typeof figma.mixed][] = [
        ['itemSpacing', f.itemSpacing],
        ['counterAxisSpacing', f.counterAxisSpacing ?? 0],
        ['paddingTop', f.paddingTop],
        ['paddingRight', f.paddingRight],
        ['paddingBottom', f.paddingBottom],
        ['paddingLeft', f.paddingLeft],
      ];
      const bad = fields.filter(([, v]) => typeof v === 'number' && isOffScale(v));
      if (bad.length) push('off-scale-spacing', bad.map(([k, v]) => `${k}=${String(v)}`).join(', '));
    }

    // E — contrast (B2)
    if (enabled.has('contrast') && n.type === 'TEXT') {
      const t = n as TextNode;
      if (t.fills === figma.mixed) continue;
      const fg = solidColor(t);
      if (!fg) continue;
      const bg = backdropOf(t);
      if (!bg) {
        // Unverifiable is not a violation: keep it as a "nice" note so a
        // gradient backdrop never blocks handoff on its own.
        issues.push({ id: n.id, kind: 'contrast', name: n.name, detail: 'needs-check: nền gradient/ảnh — không tính được tỉ lệ', rect, severity: 'nice' });
        continue;
      }
      const weight = t.fontName === figma.mixed ? undefined : t.fontName.style;
      const v = contrastVerdict(fg, bg, t.fontSize === figma.mixed ? 14 : t.fontSize, weight);
      if (!v.pass) push('contrast', `${v.ratio}:1 < ${v.need}:1 (cần ${v.need === 3 ? 'chữ lớn' : 'chữ thường'})`);
    }

    // E — tap target (B3): only real interactive layers, never icon glyphs.
    if (enabled.has('small-target') && 'width' in n && INTERACTIVE.test(n.name)) {
      const sev = targetSeverity(n.width, n.height);
      if (sev) issues.push({ id: n.id, kind: 'small-target', name: n.name, detail: `${Math.round(n.width)}×${Math.round(n.height)} < 44pt`, rect, severity: sev });
    }

    // G1 — hygiene
    if (enabled.has('hidden-layer') && n.visible === false) push('hidden-layer');
  }

  // Orphan styles: defined locally but referenced by nothing in the audited tree.
  if (enabled.has('orphan-token')) {
    const used = new Set<string>();
    for (const n of nodes) {
      for (const key of ['fillStyleId', 'strokeStyleId', 'effectStyleId', 'textStyleId'] as const) {
        if (key in n) {
          const v = (n as unknown as Record<string, unknown>)[key];
          if (typeof v === 'string' && v) used.add(v);
        }
      }
    }
    const [paint, text, effect] = await Promise.all([
      figma.getLocalPaintStylesAsync(),
      figma.getLocalTextStylesAsync(),
      figma.getLocalEffectStylesAsync(),
    ]);
    for (const s of [...paint, ...text, ...effect]) {
      if (!used.has(s.id)) issues.push({ id: s.id, kind: 'orphan-token', name: s.name, detail: 'style không được dùng' });
    }
  }

  const report = buildReport(root.type === 'PAGE' ? `page ${root.name}` : `node ${root.name} (${root.id})`, nodes.length, issues, p.limit);
  if (p.format === 'markdown') {
    return {
      markdown: toQaMarkdown(report, { file: figma.root.name, author: `figma-agent · ${figma.currentUser?.name ?? 'agent'}` }),
      counts: report.counts,
      severity: report.severity,
    };
  }
  return {
    scope: report.scope,
    scanned: report.scanned,
    totalIssues: report.issues.length,
    counts: report.counts,
    severity: report.severity,
    samples: report.samples,
    truncated: report.truncated,
  };
}
