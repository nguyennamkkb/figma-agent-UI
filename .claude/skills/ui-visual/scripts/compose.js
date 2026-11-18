const OPTIONS = { parentId: '', ops: [] };

const rgb = (hex) => {
  const v = hex.replace('#', '');
  const n = v.length === 3 ? v.split('').map((c) => c + c).join('') : v.slice(0, 6);
  return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255 };
};
const rgba = (hex, a = 1) => ({ ...rgb(hex), a });
const solid = (hex, opacity = 1) => ({ type: 'SOLID', color: rgb(hex), opacity });

function angleTransform(deg) {
  const r = (deg * Math.PI) / 180;
  const dx = Math.sin(r);
  const dy = -Math.cos(r);
  return [
    [dx, dy, 0.5 - 0.5 * dx - 0.5 * dy],
    [-dy, dx, 0.5 + 0.5 * dy - 0.5 * dx],
  ];
}
const linear = (deg, stops) => ({
  type: 'GRADIENT_LINEAR',
  gradientTransform: angleTransform(deg),
  gradientStops: stops.map(([hex, a, position]) => ({ color: rgba(hex, a), position })),
});
const radial = (stops) => ({
  type: 'GRADIENT_RADIAL',
  gradientTransform: [
    [1, 0, 0],
    [0, 1, 0],
  ],
  gradientStops: stops.map(([hex, a, position]) => ({ color: rgba(hex, a), position })),
});
const layerBlur = (radius) => ({ type: 'LAYER_BLUR', radius, visible: true });
const bgBlur = (radius) => ({ type: 'BACKGROUND_BLUR', radius, visible: true });
const drop = (hex, a, x, y, radius, spread = 0) => ({
  type: 'DROP_SHADOW', color: rgba(hex, a), offset: { x, y }, radius, spread, visible: true, blendMode: 'NORMAL',
});

async function node(id) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) throw new Error('node not found: ' + id);
  return n;
}

function frameAncestor(n) {
  let p = n.parent;
  while (p && (p.type === 'GROUP' || p.type === 'BOOLEAN_OPERATION')) p = p.parent;
  return p;
}

function place(n, parent, x, y, index) {
  if (index === undefined) parent.appendChild(n);
  else parent.insertChild(Math.min(index, parent.children.length), n);
  if ('layoutMode' in parent && parent.layoutMode !== 'NONE') n.layoutPositioning = 'ABSOLUTE';
  const frame = parent.type === 'GROUP' || parent.type === 'BOOLEAN_OPERATION' ? frameAncestor(n) : parent;
  const base = parent.type === 'GROUP' || parent.type === 'BOOLEAN_OPERATION' ? frame.absoluteTransform : null;
  if (base) {
    const pbox = parent.absoluteBoundingBox;
    n.x = pbox.x - base[0][2] + x;
    n.y = pbox.y - base[1][2] + y;
  } else {
    n.x = x;
    n.y = y;
  }
}

function boxInParent(n) {
  const a = n.absoluteBoundingBox;
  const p = n.parent;
  const pa = p.type === 'GROUP' || p.type === 'BOOLEAN_OPERATION' ? p.absoluteBoundingBox : { x: p.absoluteTransform[0][2], y: p.absoluteTransform[1][2] };
  return { x: a.x - pa.x, y: a.y - pa.y, width: a.width, height: a.height };
}

async function parentOf(op) {
  return node(op.parentId || OPTIONS.parentId);
}

const handlers = {
  async filter(op) {
    const n = await node(op.id);
    const keys = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'];
    let touched = 0;
    n.fills = n.fills.map((p) => {
      if (p.type !== 'IMAGE') return p;
      touched++;
      const filters = { ...(p.filters || {}) };
      for (const k of keys) if (op[k] !== undefined) filters[k] = Math.max(-1, Math.min(1, op[k]));
      return { ...p, filters };
    });
    if (!touched) throw new Error('no image fill on ' + op.id);
    return n.id;
  },

  async blend(op) {
    const n = await node(op.id);
    if (op.mode) n.blendMode = op.mode;
    if (op.opacity !== undefined) n.opacity = op.opacity;
    return n.id;
  },

  async glow(op) {
    const parent = await parentOf(op);
    const e = figma.createEllipse();
    e.name = op.name || 'Glow';
    e.resize(op.size, op.height || op.size);
    e.fills = [solid(op.color || '#79B2EC')];
    e.opacity = op.opacity ?? 0.5;
    e.blendMode = op.mode || 'LINEAR_DODGE';
    e.effects = [layerBlur(Math.round(op.size * (op.blurRatio ?? 0.67)))];
    place(e, parent, op.x, op.y, op.index);
    return e.id;
  },

  async blob(op) {
    return handlers.glow({ blurRatio: 0.8, opacity: 1, mode: 'NORMAL', name: 'Color blob', ...op });
  },

  async beam(op) {
    const parent = await parentOf(op);
    const r = figma.createRectangle();
    r.name = op.name || 'Beam';
    r.resize(op.w, op.h);
    r.fills = [linear(180, [[op.color || '#19ABF5', 1, 0], [op.color || '#19ABF5', 0, op.fadeAt ?? 0.88]])];
    r.opacity = op.opacity ?? 0.3;
    r.blendMode = op.mode || 'LINEAR_DODGE';
    r.effects = [layerBlur(op.blur ?? Math.round(op.w * 0.3))];
    place(r, parent, op.x, op.y, op.index);
    if (op.rotation) r.rotation = op.rotation;
    return r.id;
  },

  async sparkle(op) {
    const parent = await parentOf(op);
    const s = figma.createStar();
    s.name = op.name || 'Sparkle';
    s.pointCount = 4;
    s.innerRadius = op.innerRadius ?? 0.22;
    s.resize(op.size, op.size);
    s.fills = [radial([['#FFFFFF', 1, 0.06], ['#000000', 1, 1]])];
    s.blendMode = op.mode || 'SCREEN';
    place(s, parent, op.x, op.y, op.index);
    if (op.rotation) s.rotation = op.rotation;
    return s.id;
  },

  async glassStroke(op) {
    const n = await node(op.id);
    const a = op.alpha ?? 0.5;
    n.strokes = [linear(op.angle ?? 135, [['#FFFFFF', a, 0], ['#FFFFFF', 0, 0.5], ['#FFFFFF', a, 1]])];
    n.strokeWeight = op.weight ?? Math.max(1, Math.round(n.height * 0.02 * 2) / 2);
    n.strokeAlign = 'INSIDE';
    return n.id;
  },

  async groundShadow(op) {
    const obj = await node(op.id);
    const parent = obj.parent;
    const b = boxInParent(obj);
    const w = b.width * (op.widthRatio ?? 0.6);
    const h = Math.max(2, b.height * (op.heightRatio ?? 0.06));
    const e = figma.createEllipse();
    e.name = 'Ground shadow';
    e.resize(w, h);
    e.fills = [solid(op.color || '#052E61', op.alpha ?? 0.18)];
    e.effects = [layerBlur(op.blur ?? Math.max(1, Math.round(h * 0.4)))];
    const idx = parent.children.indexOf(obj);
    place(e, parent, b.x + (b.width - w) / 2 + (op.dx ?? 0), b.y + b.height - h * (op.lift ?? 0.6), idx);
    return e.id;
  },

  async colorWrap(op) {
    const obj = await node(op.id);
    const parent = obj.parent;
    const idx = parent.children.indexOf(obj);
    const b = boxInParent(obj);
    const mask = obj.clone();
    mask.name = 'Wrap mask';
    mask.isMask = true;
    mask.maskType = 'ALPHA';
    const r = figma.createRectangle();
    r.name = 'Env color';
    r.resize(Math.max(1, b.width), Math.max(1, b.height));
    r.fills = op.gradient
      ? [linear(op.angle ?? 180, [[op.color || '#1D80F2', 0, 0], [op.color || '#1D80F2', 1, 1]])]
      : [solid(op.color || '#1D80F2')];
    r.opacity = op.opacity ?? 0.25;
    r.blendMode = op.mode || 'OVERLAY';
    place(r, parent, b.x, b.y);
    const g = figma.group([obj, mask, r], parent, idx);
    g.name = (op.name || obj.name) + ' · wrapped';
    return { group: g.id, mask: mask.id, color: r.id };
  },

  async ticket(op) {
    const parent = await parentOf(op);
    const r = figma.createRectangle();
    r.resize(op.w, op.h);
    r.cornerRadius = op.radius ?? Math.round(Math.min(op.w, op.h) * 0.13);
    const d = op.notch ?? Math.round(op.h * 0.22);
    const left = figma.createEllipse();
    const right = figma.createEllipse();
    left.resize(d, d);
    right.resize(d, d);
    place(r, parent, op.x, op.y);
    place(left, parent, op.x - d / 2, op.y + (op.notchY ?? op.h / 2) - d / 2);
    place(right, parent, op.x + op.w - d / 2, op.y + (op.notchY ?? op.h / 2) - d / 2);
    const s = figma.subtract([r, left, right], parent);
    s.name = op.name || 'Ticket';
    s.fills = op.fill ? [solid(op.fill)] : [solid('#D9D9D9')];
    if (op.mask) {
      s.isMask = true;
      s.maskType = 'ALPHA';
    }
    return s.id;
  },

  async fade(op) {
    const parent = await parentOf(op);
    const r = figma.createRectangle();
    r.name = op.name || 'Fade';
    r.resize(op.w, op.h);
    const start = op.start ?? 0.8;
    const steps = [0, 0.1, 0.18, 0.35, 0.5, 0.65, 0.81, 0.92, 1];
    const stops = steps.map((a, i) => [op.color || '#F1FAFE', a, start + ((1 - start) * i) / (steps.length - 1)]);
    r.fills = [linear(op.angle ?? 180, stops)];
    place(r, parent, op.x ?? 0, op.y ?? 0, op.index);
    return r.id;
  },

  async glass(op) {
    const n = await node(op.id);
    n.fills = [solid('#FFFFFF', op.alpha ?? 0.7)];
    n.effects = [drop('#000000', op.shadowAlpha ?? 0.1, 1.6, 3.2, op.shadowBlur ?? 12), bgBlur(op.blur ?? 10)];
    await handlers.glassStroke({ id: op.id, weight: op.weight ?? 1, alpha: 0.6 });
    return n.id;
  },
};

const results = [];
for (const [i, op] of OPTIONS.ops.entries()) {
  const fn = handlers[op.op];
  if (!fn) {
    results.push({ i, op: op.op, error: 'unknown op' });
    continue;
  }
  try {
    results.push({ i, op: op.op, id: await fn(op) });
  } catch (e) {
    results.push({ i, op: op.op, error: String(e && e.message ? e.message : e) });
  }
}
return { results, ops: Object.keys(handlers) };
