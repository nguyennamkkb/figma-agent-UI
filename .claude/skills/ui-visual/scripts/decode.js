const OPTIONS = { rootId: '', maxDepth: 12, maxNodes: 1500 };

const root = await figma.getNodeByIdAsync(OPTIONS.rootId);
if (!root) return { error: 'root not found: ' + OPTIONS.rootId };

const box = root.absoluteBoundingBox || { x: root.x, y: root.y, width: root.width, height: root.height };
const RW = box.width;
const RH = box.height;
const round = (v, d = 2) => (typeof v === 'number' ? Math.round(v * 10 ** d) / 10 ** d : v);
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

const palette = new Map();
const blends = {};
const effectStats = {};
const fonts = {};
const counts = { nodes: 0, images: 0, masks: 0, rotated: 0, texts: 0, vectors: 0, booleans: 0 };
let depthMax = 0;
let truncated = false;

function addColor(c, a, weight) {
  if ((a ?? 1) < 0.05) return;
  const k = hex(c);
  palette.set(k, (palette.get(k) || 0) + weight);
}

function paint(p, area) {
  if (p.visible === false) return null;
  const out = { type: p.type };
  if (p.opacity !== undefined && p.opacity < 1) out.opacity = round(p.opacity);
  if (p.blendMode && p.blendMode !== 'NORMAL') out.blend = p.blendMode;
  if (p.type === 'SOLID') {
    out.color = hex(p.color);
    addColor(p.color, p.opacity, area);
  } else if (p.type.startsWith('GRADIENT')) {
    out.stops = p.gradientStops.map((s) => ({ color: hex(s.color), alpha: round(s.color.a), pos: round(s.position) }));
    out.transform = p.gradientTransform.map((r) => r.map((v) => round(v, 3)));
    for (const s of p.gradientStops) addColor(s.color, s.color.a, area / p.gradientStops.length);
  } else if (p.type === 'IMAGE') {
    out.scaleMode = p.scaleMode;
    out.imageHash = p.imageHash;
    if (p.filters) {
      const f = {};
      for (const [k, v] of Object.entries(p.filters)) if (v) f[k] = round(v);
      if (Object.keys(f).length) out.filters = f;
    }
  }
  return out;
}

function effect(e) {
  if (e.visible === false) return null;
  const out = { type: e.type, radius: round(e.radius) };
  if (e.offset) out.offset = [round(e.offset.x), round(e.offset.y)];
  if (e.spread) out.spread = round(e.spread);
  if (e.color) {
    out.color = hex(e.color);
    out.alpha = round(e.color.a);
  }
  if (e.blendMode && e.blendMode !== 'NORMAL') out.blend = e.blendMode;
  (effectStats[e.type] = effectStats[e.type] || []).push(round(e.radius));
  return out;
}

const layers = [];

function walk(n, depth, path, clippedByAncestor) {
  if (counts.nodes >= OPTIONS.maxNodes) {
    truncated = true;
    return;
  }
  counts.nodes++;
  depthMax = Math.max(depthMax, depth);
  const b = n.absoluteBoundingBox || { x: 0, y: 0, width: n.width, height: n.height };
  const x = b.x - box.x;
  const y = b.y - box.y;
  const area = Math.max(1, b.width * b.height);
  const L = {
    path,
    depth,
    id: n.id,
    type: n.type,
    name: n.name,
    box: [round(x), round(y), round(b.width), round(b.height)],
    ratio: [round(x / RW, 3), round(y / RH, 3), round(b.width / RW, 3), round(b.height / RH, 3)],
  };
  if (n.visible === false) L.hidden = true;
  if (n.rotation) {
    L.rotation = round(n.rotation);
    counts.rotated++;
  }
  if (n.opacity !== undefined && n.opacity < 1) L.opacity = round(n.opacity);
  if (n.blendMode && n.blendMode !== 'PASS_THROUGH' && n.blendMode !== 'NORMAL') {
    L.blend = n.blendMode;
    blends[n.blendMode] = (blends[n.blendMode] || 0) + 1;
  }
  if (n.isMask) {
    L.mask = n.maskType;
    counts.masks++;
  }
  if (n.clipsContent) L.clip = true;
  if ('cornerRadius' in n && n.cornerRadius !== figma.mixed && n.cornerRadius > 0) L.radius = round(n.cornerRadius);
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    L.layout = { mode: n.layoutMode, gap: n.itemSpacing, padding: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft] };
  }
  const overflow = [round(-x), round(-y), round(x + b.width - RW), round(y + b.height - RH)];
  if (depth > 0 && overflow.some((v) => v > 0.5)) {
    L.overflow = overflow.map((v) => Math.max(0, v));
    L.breaksFrame = !clippedByAncestor;
  }
  if ('fills' in n && n.fills !== figma.mixed && n.fills.length) {
    const fills = n.fills.map((p) => paint(p, area)).filter(Boolean);
    if (fills.length) L.fills = fills;
    if (n.fills.some((p) => p.type === 'IMAGE' && p.visible !== false)) counts.images++;
  }
  if ('strokes' in n && n.strokes.length) {
    const strokes = n.strokes.map((p) => paint(p, 0)).filter(Boolean);
    if (strokes.length) {
      L.strokes = strokes;
      L.strokeWeight = n.strokeWeight === figma.mixed ? 'mixed' : round(n.strokeWeight);
      L.strokeAlign = n.strokeAlign;
    }
  }
  if ('effects' in n && n.effects.length) {
    const effects = n.effects.map(effect).filter(Boolean);
    if (effects.length) L.effects = effects;
  }
  if (n.type === 'TEXT') {
    counts.texts++;
    const font = n.fontName === figma.mixed ? 'mixed' : n.fontName.family + ' ' + n.fontName.style;
    fonts[font] = (fonts[font] || 0) + 1;
    L.text = {
      chars: n.characters.slice(0, 120),
      font,
      size: n.fontSize === figma.mixed ? 'mixed' : round(n.fontSize),
      lineHeight: n.lineHeight === figma.mixed ? 'mixed' : n.lineHeight.unit === 'AUTO' ? 'AUTO' : round(n.lineHeight.value),
      letterSpacing: n.letterSpacing === figma.mixed ? 'mixed' : round(n.letterSpacing.value),
      align: n.textAlignHorizontal,
    };
  }
  if (n.type === 'VECTOR' || n.type === 'STAR' || n.type === 'POLYGON') counts.vectors++;
  if (n.type === 'BOOLEAN_OPERATION') {
    counts.booleans++;
    L.booleanOp = n.booleanOperation;
  }
  if (n.type === 'INSTANCE') L.instanceOf = n.name;
  layers.push(L);
  if (depth < OPTIONS.maxDepth && 'children' in n) {
    const clips = clippedByAncestor || !!n.clipsContent;
    n.children.forEach((c, i) => walk(c, depth + 1, path + '/' + i, clips));
  }
}

walk(root, 0, '0', false);

const siblingsByParent = new Map();
for (const L of layers) {
  if (L.depth === 0) continue;
  const parent = L.path.slice(0, L.path.lastIndexOf('/'));
  if (!siblingsByParent.has(parent)) siblingsByParent.set(parent, []);
  siblingsByParent.get(parent).push(L);
}
const isCard = (L) => !L.hidden && L.radius && (L.clip || L.fills) && L.box[2] * L.box[3] >= 0.15 * RW * RH;
const hasPicture = (L) => (L.fills || []).some((f) => f.type === 'IMAGE') || ['GROUP', 'INSTANCE', 'FRAME'].includes(L.type);
for (const group of siblingsByParent.values()) {
  const cards = group.filter(isCard);
  for (const L of group) {
    if (L.hidden || cards.includes(L) || !hasPicture(L)) continue;
    const [x, y, w, h] = L.box;
    for (const c of cards) {
      const [cx, cy, cw, ch] = c.box;
      const overlaps = x < cx + cw && x + w > cx && y < cy + ch && y + h > cy;
      if (!overlaps || w * h >= cw * ch) continue;
      const out = [cx - x, cy - y, x + w - (cx + cw), y + h - (cy + ch)].map((v) => Math.max(0, round(v)));
      if (out.some((v) => v > 0.5)) {
        L.breaksCard = { card: c.name, cardId: c.id, overflow: out, share: out.map((v, i) => round(v / (i % 2 ? h : w), 3)) };
        break;
      }
    }
  }
}

const total = [...palette.values()].reduce((a, b) => a + b, 0) || 1;
const paletteOut = [...palette.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 24)
  .map(([color, w]) => ({ color, share: round(w / total, 3) }));

return {
  root: { id: root.id, name: root.name, type: root.type, width: round(RW), height: round(RH) },
  summary: { ...counts, depthMax, truncated, blends, effects: effectStats, fonts, palette: paletteOut },
  layers,
};
