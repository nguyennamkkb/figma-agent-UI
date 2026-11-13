import {
  cleanEffects,
  cleanPaints,
  fallbackFontStyle,
  fitPadding,
  fixedAxes,
  measureDiff,
  type ImageRef,
  type Json,
  type Layout,
  type Measured,
  type SnapNode,
  type SnapSegment,
} from '../../shared/snapshot';
import { listFonts } from '../fonts';
import { freeSpot, getNode, getSceneNode } from '../util';

export interface SnapshotReadParams {
  ids: string[];
  exclude?: string[];
  availableFonts?: string[];
  mode?: 'full' | 'shell' | 'child';
}

export interface SnapshotImagesParams {
  refs: ImageRef[];
  videoScale?: number;
}

export type SnapshotWriteParams =
  | { op: 'root'; node: SnapNode; images: Record<string, string>; parentId?: string; x?: number; y?: number; replaceId?: string }
  | { op: 'child'; node: SnapNode; images: Record<string, string>; parentId: string }
  | { op: 'finalize'; node: SnapNode; rootId: string; replaceId?: string };

const VECTOR_TYPES = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'POLYGON']);
const FRAME_TYPES = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP']);

interface ReadState {
  exclude: Set<string>;
  available: Set<string> | null;
  refs: Map<string, ImageRef>;
  fonts: Set<string>;
  outlined: number;
  skipped: string[];
  jobs: (() => Promise<void>)[];
  dropped: WeakSet<SnapNode>;
  shallow: Set<string>;
  childIds: Map<string, string[]>;
}

async function runPool(jobs: (() => Promise<void>)[], size: number): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      await job();
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, jobs.length) }, worker));
}

function prune(node: SnapNode, dropped: WeakSet<SnapNode>): void {
  if (!node.kids) return;
  node.kids = node.kids.filter((k) => !dropped.has(k));
  for (const k of node.kids) prune(k, dropped);
}

const SHAPE_TYPES = new Set(['RECTANGLE', 'ELLIPSE']);

function isShapeOnly(node: SceneNode): boolean {
  if (VECTOR_TYPES.has(node.type) || SHAPE_TYPES.has(node.type)) return true;
  return node.type === 'GROUP' && node.children.every((c) => c.visible === false || isShapeOnly(c));
}

function hasMask(node: SceneNode): boolean {
  return 'children' in node && (node as ChildrenMixin).children.some((c) => 'isMask' in c && (c as SceneNode & { isMask: boolean }).isMask);
}

function isVectorOnly(node: SceneNode): boolean {
  if (VECTOR_TYPES.has(node.type)) return true;
  if (node.type !== 'GROUP') return false;
  return hasMask(node) || node.children.every((c) => c.visible === false || isShapeOnly(c));
}

function relBox(node: SceneNode, parentAbs: { x: number; y: number }) {
  const box = ('absoluteRenderBounds' in node ? node.absoluteRenderBounds : null) ?? node.absoluteBoundingBox;
  const bbox = node.absoluteBoundingBox;
  if (!box || !bbox) return { x: node.x, y: node.y, w: node.width, h: node.height, ox: 0, oy: 0 };
  return { x: bbox.x - parentAbs.x, y: bbox.y - parentAbs.y, w: bbox.width, h: bbox.height, ox: box.x - bbox.x, oy: box.y - bbox.y };
}

function absOf(node: BaseNode): { x: number; y: number } {
  const box = 'absoluteBoundingBox' in node ? (node as SceneNode).absoluteBoundingBox : null;
  if (box) return { x: box.x, y: box.y };
  return { x: 0, y: 0 };
}

function layoutOf(node: FrameNode | ComponentNode | InstanceNode | ComponentSetNode): Layout | undefined {
  if (node.layoutMode === 'NONE' || node.layoutMode === 'GRID') return undefined;
  return {
    mode: node.layoutMode,
    padding: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft],
    gap: node.itemSpacing,
    counterGap: node.layoutWrap === 'WRAP' ? node.counterAxisSpacing ?? 0 : undefined,
    wrap: node.layoutWrap === 'WRAP',
    justify: node.primaryAxisAlignItems,
    align: node.counterAxisAlignItems,
    primarySizing: node.primaryAxisSizingMode,
    counterSizing: node.counterAxisSizingMode,
    strokesInLayout: node.strokesIncludedInLayout,
    reverseZ: node.itemReverseZIndex,
  };
}

function collectPaints(node: SceneNode, paints: readonly Paint[] | typeof figma.mixed, state: ReadState): Json[] {
  if (paints === figma.mixed) return [];
  const out: Json[] = [];
  for (const p of cleanPaints(paints)) {
    if (p.type === 'IMAGE' && typeof p.imageHash === 'string') {
      state.refs.set(p.imageHash, { key: p.imageHash, kind: 'hash', hash: p.imageHash });
      out.push(p);
    } else if (p.type === 'VIDEO') {
      const key = `node:${node.id}`;
      state.refs.set(key, { key, kind: 'node', nodeId: node.id });
      out.push({ type: 'IMAGE', scaleMode: 'FILL', imageHash: key, visible: p.visible !== false, opacity: typeof p.opacity === 'number' ? p.opacity : 1 });
    } else out.push(p);
  }
  return out;
}

function hasVideo(node: SceneNode): boolean {
  return 'fills' in node && Array.isArray(node.fills) && (node.fills as Paint[]).some((p) => (p.type as string) === 'VIDEO' && p.visible !== false);
}

function strokeWeight(node: SceneNode & MinimalStrokesMixin): number | [number, number, number, number] {
  const w = node.strokeWeight;
  if (w !== figma.mixed) return w;
  const n = node as unknown as IndividualStrokesMixin;
  return [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight];
}

function radiusOf(node: SceneNode): number | [number, number, number, number] | undefined {
  if (!('cornerRadius' in node)) return undefined;
  const r = (node as unknown as CornerMixin).cornerRadius;
  if (r !== figma.mixed) return r;
  const n = node as unknown as RectangleCornerMixin;
  return [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius];
}

async function readNode(node: SceneNode, parent: BaseNode, parentAuto: boolean, state: ReadState): Promise<SnapNode | null> {
  if (node.visible === false || state.exclude.has(node.id)) return null;
  const parentAbs = absOf(parent);
  const base: SnapNode = {
    t: 'FRAME',
    name: node.name,
    x: node.x,
    y: node.y,
    w: node.width,
    h: node.height,
  };
  if ('opacity' in node && node.opacity !== 1) base.opacity = node.opacity;
  if ('blendMode' in node && node.blendMode !== 'PASS_THROUGH' && node.blendMode !== 'NORMAL') base.blendMode = node.blendMode;
  if ('layoutPositioning' in node) base.positioning = node.layoutPositioning;
  if (parentAuto && 'layoutSizingHorizontal' in node) {
    base.sizingH = node.layoutSizingHorizontal;
    base.sizingV = node.layoutSizingVertical;
    if ('layoutGrow' in node && node.layoutGrow) base.grow = node.layoutGrow;
  }
  if (!parentAuto && 'constraints' in node) base.constraints = { ...node.constraints };

  if (isVectorOnly(node)) {
    const box = relBox(node, parentAbs);
    const flow = parentAuto && base.positioning !== 'ABSOLUTE';
    const snap: SnapNode = { ...base, t: 'SVG', x: flow ? node.x : box.x, y: flow ? node.y : box.y, w: box.w, h: box.h, svg: '', ox: box.ox, oy: box.oy };
    state.jobs.push(async () => {
      try {
        snap.svg = await node.exportAsync({ format: 'SVG_STRING', svgOutlineText: true });
      } catch {
        state.dropped.add(snap);
        state.skipped.push(`${node.name} (${node.id})`);
      }
    });
    return snap;
  }

  if ('rotation' in node && node.rotation && !parentAuto) base.rotation = node.rotation;
  if ('fills' in node) base.fills = collectPaints(node, node.fills, state);
  if ('strokes' in node && node.strokes.length) {
    base.strokes = cleanPaints(node.strokes);
    base.strokeAlign = node.strokeAlign;
    base.strokeWeight = strokeWeight(node);
    if ('dashPattern' in node && node.dashPattern.length) base.dash = [...node.dashPattern];
  }
  if ('effects' in node && node.effects.length) base.effects = cleanEffects(node.effects);
  const r = radiusOf(node);
  if (r !== undefined && r !== 0) base.radius = r;
  if ('cornerSmoothing' in node && node.cornerSmoothing) base.smoothing = node.cornerSmoothing;

  if (node.type === 'TEXT') {
    const segments: SnapSegment[] = node
      .getStyledTextSegments(['fontName', 'fontSize', 'fills', 'lineHeight', 'letterSpacing', 'textCase', 'textDecoration'])
      .map((s) => ({
        start: s.start,
        end: s.end,
        font: { ...s.fontName },
        size: s.fontSize,
        fills: cleanPaints(s.fills),
        lineHeight: { ...s.lineHeight } as Json,
        letterSpacing: { ...s.letterSpacing } as Json,
        textCase: s.textCase,
        decoration: s.textDecoration,
      }));
    for (const s of segments) state.fonts.add(`${s.font.family}|${s.font.style}`);
    const out: SnapNode = {
      ...base,
      t: 'TEXT',
      text: {
        chars: node.characters,
        segments,
        alignH: node.textAlignHorizontal,
        alignV: node.textAlignVertical,
        autoResize: node.textAutoResize,
        maxLines: node.maxLines,
        truncation: node.textTruncation,
      },
    };
    delete out.fills;
    const missing = state.available && segments.some((s) => !state.available!.has(`${s.font.family}|${s.font.style}`));
    if (missing) {
      const box = relBox(node, { x: node.absoluteBoundingBox?.x ?? 0, y: node.absoluteBoundingBox?.y ?? 0 });
      const outline = { svg: '', ox: box.ox, oy: box.oy };
      out.text!.outline = outline;
      state.outlined++;
      state.jobs.push(async () => {
        try {
          outline.svg = await node.exportAsync({ format: 'SVG_STRING', svgOutlineText: true });
        } catch {
          delete out.text!.outline;
          state.outlined--;
        }
      });
    }
    return out;
  }

  if (node.type === 'ELLIPSE') {
    return { ...base, t: 'ELLIPSE', arc: { ...node.arcData } as Json };
  }
  if (node.type === 'RECTANGLE') return { ...base, t: 'RECTANGLE' };

  if (node.type === 'SECTION') {
    if (state.shallow.has(node.id)) {
      state.childIds.set(node.id, node.children.filter((c) => c.visible !== false && !state.exclude.has(c.id)).map((c) => c.id));
      return { ...base, t: 'SECTION', kids: [] };
    }
    const kids: SnapNode[] = [];
    for (const c of node.children) {
      const s = await readNode(c, node, false, state);
      if (s) kids.push(s);
    }
    return { ...base, t: 'SECTION', kids };
  }

  if (FRAME_TYPES.has(node.type)) {
    const out: SnapNode = { ...base, t: 'FRAME' };
    let layout: Layout | undefined;
    if (node.type === 'GROUP') {
      out.clip = false;
      out.fills = [];
    } else {
      const f = node as FrameNode;
      out.clip = f.clipsContent;
      layout = layoutOf(f);
      if (layout) out.layout = layout;
      if (f.layoutGrids.length) out.grids = JSON.parse(JSON.stringify(f.layoutGrids));
    }
    if (hasVideo(node)) {
      out.kids = [];
      return out;
    }
    if (state.shallow.has(node.id)) {
      const ids = (node as ChildrenMixin).children.filter((c) => c.visible !== false && !state.exclude.has(c.id)).map((c) => c.id);
      state.childIds.set(node.id, ids);
      out.kids = [];
      return out;
    }
    const kids: SnapNode[] = [];
    for (const c of (node as ChildrenMixin).children) {
      const s = await readNode(c as SceneNode, node, !!layout, state);
      if (!s) continue;
      if (node.type === 'GROUP' && s.t !== 'SVG') {
        s.x -= node.x;
        s.y -= node.y;
      }
      kids.push(s);
    }
    out.kids = kids;
    return out;
  }
  return null;
}

export async function snapshotRead(p: SnapshotReadParams) {
  const state: ReadState = {
    exclude: new Set(p.exclude ?? []),
    available: p.availableFonts ? new Set(p.availableFonts) : null,
    refs: new Map(),
    fonts: new Set(),
    outlined: 0,
    skipped: [],
    jobs: [],
    dropped: new WeakSet(),
    shallow: new Set(p.mode === 'shell' ? p.ids : []),
    childIds: new Map(),
  };
  const started = Date.now();
  const roots: SnapNode[] = [];
  for (const id of p.ids) {
    const node = await getSceneNode(id);
    const parent = node.parent ?? figma.currentPage;
    if (p.mode === 'child') {
      const auto = 'layoutMode' in parent && (parent as FrameNode).layoutMode !== 'NONE' && (parent as FrameNode).layoutMode !== 'GRID';
      const snap = await readNode(node, parent, auto, state);
      if (!snap) continue;
      if (parent.type === 'GROUP' && snap.t !== 'SVG') {
        snap.x -= parent.x;
        snap.y -= parent.y;
      }
      roots.push(snap);
      continue;
    }
    const snap = await readNode(node, parent, false, state);
    if (!snap) throw new Error(`${id} is hidden or excluded.`);
    snap.x = node.x;
    snap.y = node.y;
    delete snap.sizingH;
    delete snap.sizingV;
    delete snap.positioning;
    roots.push(snap);
  }
  await runPool(state.jobs, 6);
  roots.forEach((r) => prune(r, state.dropped));
  return {
    roots: roots.filter((r) => !state.dropped.has(r)),
    childIds: p.mode === 'shell' ? p.ids.map((id) => state.childIds.get(id) ?? []) : undefined,
    imageRefs: [...state.refs.values()],
    fonts: [...state.fonts].sort(),
    outlined: state.outlined,
    skipped: state.skipped,
    ms: Date.now() - started,
  };
}

export async function snapshotImages(p: SnapshotImagesParams) {
  const images: Record<string, string> = {};
  for (const ref of p.refs) {
    if (ref.kind === 'hash' && ref.hash) {
      const img = figma.getImageByHash(ref.hash);
      if (!img) continue;
      images[ref.key] = figma.base64Encode(await img.getBytesAsync());
    } else if (ref.kind === 'node' && ref.nodeId) {
      const node = await getSceneNode(ref.nodeId);
      const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: p.videoScale ?? 2 } });
      images[ref.key] = figma.base64Encode(bytes);
    }
  }
  return { images };
}

const imageHashes = new Map<string, string>();
const fontCache = new Map<string, FontName | null>();

async function tryFont(font: FontName): Promise<FontName | null> {
  const key = `${font.family}|${font.style}`;
  if (fontCache.has(key)) return fontCache.get(key)!;
  try {
    await figma.loadFontAsync(font);
    fontCache.set(key, font);
  } catch {
    fontCache.set(key, null);
  }
  return fontCache.get(key)!;
}

interface WriteState {
  images: Record<string, string>;
  missingFonts: Set<string>;
  fallbacks: { id: string; name: string; fonts: string[] }[];
  pendingFallback?: { node: TextNode; fonts: string[] };
}

export const ORIGINAL_FONT_KEY = 'figma-agent/original-font';
const FALLBACK_FAMILY = 'Inter';

async function fallbackFor(font: FontName): Promise<FontName> {
  const styles = (await listFonts()).filter((f) => f.fontName.family === FALLBACK_FAMILY).map((f) => f.fontName.style);
  const candidate = { family: FALLBACK_FAMILY, style: fallbackFontStyle(font.style, styles) };
  return (await tryFont(candidate)) ?? (await tryFont({ family: FALLBACK_FAMILY, style: 'Regular' }))!;
}

function paintsFor(list: Json[] | undefined, state: WriteState): Paint[] {
  const out: Paint[] = [];
  for (const p of list ?? []) {
    if (p.type === 'IMAGE' && typeof p.imageHash === 'string') {
      const key = p.imageHash;
      let hash = imageHashes.get(key);
      if (!hash && state.images[key]) {
        hash = figma.createImage(figma.base64Decode(state.images[key])).hash;
        imageHashes.set(key, hash);
      }
      if (!hash) continue;
      out.push({ ...(p as unknown as ImagePaint), imageHash: hash });
    } else out.push(p as unknown as Paint);
  }
  return out;
}

function applyCommon(n: SceneNode, o: SnapNode, state: WriteState) {
  if (o.fills && 'fills' in n && o.t !== 'TEXT') (n as GeometryMixin).fills = paintsFor(o.fills, state);
  if (o.strokes && 'strokes' in n) {
    const s = n as GeometryMixin & MinimalStrokesMixin;
    s.strokes = o.strokes as unknown as Paint[];
    if (o.strokeAlign) s.strokeAlign = o.strokeAlign as 'CENTER' | 'INSIDE' | 'OUTSIDE';
    if (Array.isArray(o.strokeWeight) && 'strokeTopWeight' in n) {
      const ind = n as unknown as IndividualStrokesMixin;
      [ind.strokeTopWeight, ind.strokeRightWeight, ind.strokeBottomWeight, ind.strokeLeftWeight] = o.strokeWeight;
    } else if (typeof o.strokeWeight === 'number') s.strokeWeight = o.strokeWeight;
    if (o.dash && 'dashPattern' in n) (n as unknown as { dashPattern: number[] }).dashPattern = o.dash;
  }
  if (o.effects && 'effects' in n) (n as BlendMixin).effects = o.effects as unknown as Effect[];
  if (o.radius !== undefined && 'cornerRadius' in n) {
    if (Array.isArray(o.radius)) {
      const r = n as unknown as RectangleCornerMixin;
      [r.topLeftRadius, r.topRightRadius, r.bottomRightRadius, r.bottomLeftRadius] = o.radius;
    } else (n as unknown as CornerMixin).cornerRadius = o.radius;
  }
  if (o.smoothing !== undefined && 'cornerSmoothing' in n) (n as unknown as CornerMixin).cornerSmoothing = o.smoothing;
  if (o.opacity !== undefined && 'opacity' in n) n.opacity = o.opacity;
  if (o.blendMode && 'blendMode' in n) (n as BlendMixin).blendMode = o.blendMode as BlendMode;
}

function place(n: SceneNode, o: SnapNode, parent: BaseNode & ChildrenMixin) {
  const auto = 'layoutMode' in parent && (parent as FrameNode).layoutMode !== 'NONE' && (parent as FrameNode).layoutMode !== 'GRID';
  if (auto) {
    const child = n as unknown as AutoLayoutChildrenMixin & LayoutMixin;
    if (o.positioning === 'ABSOLUTE') {
      child.layoutPositioning = 'ABSOLUTE';
      n.x = o.x;
      n.y = o.y;
    }
    if (o.sizingH) {
      try {
        child.layoutSizingHorizontal = o.sizingH;
      } catch {
        child.layoutSizingHorizontal = 'FIXED';
      }
    }
    if (o.sizingV) {
      try {
        child.layoutSizingVertical = o.sizingV;
      } catch {
        child.layoutSizingVertical = 'FIXED';
      }
    }
    if (o.grow) child.layoutGrow = o.grow;
  } else {
    if (o.rotation && 'rotation' in n) n.rotation = o.rotation;
    n.x = o.x;
    n.y = o.y;
    if (o.constraints && 'constraints' in n) (n as ConstraintMixin).constraints = o.constraints as unknown as Constraints;
  }
}

function svgBox(o: SnapNode, svg: string, ox: number, oy: number): FrameNode {
  const box = figma.createFrame();
  box.fills = [];
  box.clipsContent = false;
  box.resize(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
  const v = figma.createNodeFromSvg(svg);
  v.name = 'svg';
  box.appendChild(v);
  v.x = ox;
  v.y = oy;
  return box;
}

function fixSize(n: FrameNode, o: SnapNode) {
  const fixed = fixedAxes(o);
  const w = fixed.width ? o.w : n.width;
  const h = fixed.height ? o.h : n.height;
  if (Math.abs(n.width - w) > 0.01 || Math.abs(n.height - h) > 0.01) n.resize(Math.max(w, 0.01), Math.max(h, 0.01));
  if (!o.layout) return;
  if (fixed.height && n.height > o.h + 0.5) {
    const [top, bottom] = fitPadding(o.h, n.height, n.paddingTop, n.paddingBottom);
    n.paddingTop = top;
    n.paddingBottom = bottom;
    n.resize(n.width, o.h);
  }
  if (fixed.width && n.width > o.w + 0.5) {
    const [left, right] = fitPadding(o.w, n.width, n.paddingLeft, n.paddingRight);
    n.paddingLeft = left;
    n.paddingRight = right;
    n.resize(o.w, n.height);
  }
}

async function buildText(o: SnapNode, state: WriteState): Promise<SceneNode> {
  const t = o.text!;
  const loaded = await Promise.all(t.segments.map((s) => tryFont(s.font as FontName)));
  const missing = [...new Set(t.segments.filter((_, i) => !loaded[i]).map((s) => `${s.font.family}|${s.font.style}`))];
  missing.forEach((f) => state.missingFonts.add(f));
  if (missing.length && t.outline && t.outline.svg) {
    const box = svgBox(o, t.outline.svg, t.outline.ox, t.outline.oy);
    box.name = o.name;
    return box;
  }
  const fonts = await Promise.all(t.segments.map(async (s, i) => loaded[i] ?? (await fallbackFor(s.font as FontName))));
  const n = figma.createText();
  n.fontName = fonts[0];
  n.characters = t.chars;
  if (missing.length) {
    n.setPluginData(ORIGINAL_FONT_KEY, JSON.stringify(missing));
    state.pendingFallback = { node: n, fonts: missing };
  }
  t.segments.forEach((s, i) => {
    n.setRangeFontName(s.start, s.end, fonts[i]);
    n.setRangeFontSize(s.start, s.end, s.size);
    n.setRangeFills(s.start, s.end, paintsFor(s.fills, state));
    n.setRangeLineHeight(s.start, s.end, s.lineHeight as unknown as LineHeight);
    n.setRangeLetterSpacing(s.start, s.end, s.letterSpacing as unknown as LetterSpacing);
    n.setRangeTextCase(s.start, s.end, s.textCase as TextCase);
    n.setRangeTextDecoration(s.start, s.end, s.decoration as TextDecoration);
  });
  n.textAlignHorizontal = t.alignH as TextNode['textAlignHorizontal'];
  n.textAlignVertical = t.alignV as TextNode['textAlignVertical'];
  if (t.truncation === 'ENDING') {
    n.textTruncation = 'ENDING';
    if (t.maxLines) n.maxLines = t.maxLines;
  }
  n.textAutoResize = (t.autoResize === 'TRUNCATE' ? 'NONE' : t.autoResize) as TextNode['textAutoResize'];
  if (t.autoResize === 'NONE' || t.autoResize === 'TRUNCATE') n.resize(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
  else if (t.autoResize === 'HEIGHT') n.resize(Math.max(o.w, 0.01), n.height);
  return n;
}

async function build(o: SnapNode, parent: BaseNode & ChildrenMixin, state: WriteState, withKids = true): Promise<SceneNode> {
  let n: SceneNode;
  if (o.t === 'SVG') {
    n = svgBox(o, o.svg ?? '<svg xmlns="http://www.w3.org/2000/svg"/>', o.ox ?? 0, o.oy ?? 0);
  } else if (o.t === 'TEXT') {
    n = await buildText(o, state);
  } else if (o.t === 'ELLIPSE') {
    const e = figma.createEllipse();
    e.resize(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
    if (o.arc) e.arcData = o.arc as unknown as ArcData;
    n = e;
  } else if (o.t === 'RECTANGLE') {
    const r = figma.createRectangle();
    r.resize(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
    n = r;
  } else if (o.t === 'SECTION') {
    const s = figma.createSection();
    s.resizeWithoutConstraints(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
    n = s;
  } else {
    const f = figma.createFrame();
    f.resize(Math.max(o.w, 0.01), Math.max(o.h, 0.01));
    f.fills = [];
    f.clipsContent = !!o.clip;
    if (o.layout) {
      const l = o.layout;
      f.layoutMode = l.mode;
      [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = l.padding;
      f.itemSpacing = l.gap;
      if (l.wrap) {
        f.layoutWrap = 'WRAP';
        f.counterAxisSpacing = l.counterGap ?? 0;
      }
      f.primaryAxisAlignItems = l.justify as FrameNode['primaryAxisAlignItems'];
      f.counterAxisAlignItems = l.align as FrameNode['counterAxisAlignItems'];
      f.primaryAxisSizingMode = l.primarySizing;
      f.counterAxisSizingMode = l.counterSizing;
      if (l.strokesInLayout !== undefined) f.strokesIncludedInLayout = l.strokesInLayout;
      if (l.reverseZ !== undefined) f.itemReverseZIndex = l.reverseZ;
    }
    if (o.grids) f.layoutGrids = o.grids as unknown as LayoutGrid[];
    n = f;
  }
  n.name = o.name;
  if (state.pendingFallback && state.pendingFallback.node === n) {
    state.fallbacks.push({ id: n.id, name: o.name, fonts: state.pendingFallback.fonts });
    state.pendingFallback = undefined;
  }
  parent.appendChild(n);
  const outlinedText = o.t === 'TEXT' && n.type === 'FRAME';
  applyCommon(n, outlinedText ? { ...o, fills: undefined, strokes: undefined, effects: undefined, radius: undefined } : o, state);
  place(n, o, parent);
  if (withKids && o.kids && o.kids.length && 'appendChild' in n) {
    for (const k of o.kids) await build(k, n as unknown as BaseNode & ChildrenMixin, state);
  }
  if (n.type === 'FRAME' && o.t === 'FRAME') fixSize(n, o);
  return n;
}

function measure(n: SceneNode, o: SnapNode): Measured {
  const out: Measured = { w: n.width, h: n.height };
  if (o.kids && o.kids.length && 'children' in n && o.t !== 'SVG') {
    const kids = (n as ChildrenMixin).children as readonly SceneNode[];
    out.kids = o.kids.map((k, i) => (kids[i] ? measure(kids[i], k) : { w: 0, h: 0 }));
  }
  return out;
}

export async function snapshotWrite(p: SnapshotWriteParams) {
  if (p.op === 'root') {
    const state: WriteState = { images: p.images, missingFonts: new Set(), fallbacks: [] };
    let parent: BaseNode & ChildrenMixin = figma.currentPage;
    let index: number | null = null;
    let x = p.x;
    let y = p.y;
    let name = p.node.name;
    if (p.replaceId) {
      const old = await getSceneNode(p.replaceId);
      parent = old.parent as BaseNode & ChildrenMixin;
      index = parent.children.indexOf(old);
      x = old.x;
      y = old.y;
      name = old.name;
    } else if (p.parentId) {
      parent = (await getNode(p.parentId)) as BaseNode & ChildrenMixin;
    }
    if (x === undefined || y === undefined) {
      const spot = freeSpot(parent.children as readonly SceneNode[]);
      x = x ?? spot.x;
      y = y ?? spot.y;
    }
    const node = await build({ ...p.node, x, y, name, kids: [] }, parent, state, false);
    if (index !== null) parent.insertChild(index + 1, node);
    return { id: node.id, missingFonts: [...state.missingFonts], fallbacks: state.fallbacks };
  }
  if (p.op === 'child') {
    const state: WriteState = { images: p.images, missingFonts: new Set(), fallbacks: [] };
    const parent = (await getNode(p.parentId)) as BaseNode & ChildrenMixin;
    const node = await build(p.node, parent, state);
    return { id: node.id, mismatches: measureDiff(p.node, measure(node, p.node)), missingFonts: [...state.missingFonts], fallbacks: state.fallbacks };
  }
  const root = await getSceneNode(p.rootId);
  if (root.type === 'FRAME') fixSize(root, p.node);
  const rootMismatch = Math.abs(root.width - p.node.w) > 1 || Math.abs(root.height - p.node.h) > 1;
  let replaced: { oldId: string; name: string } | null = null;
  if (p.replaceId) {
    const old = await getSceneNode(p.replaceId);
    replaced = { oldId: old.id, name: old.name };
    old.remove();
  }
  return { id: root.id, rootSize: [root.width, root.height], rootMismatch, replaced };
}
