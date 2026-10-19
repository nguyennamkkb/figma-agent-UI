import type { AnyProps, RenderTreeInput, TreeNode } from '../../shared/schemas';
import { parseColor } from '../../shared/values';
import { applyPlacement, applyProps, type ApplyCtx } from '../apply';
import { Resources } from '../resources';
import { freeSpot, getContainer, isAutoLayout, RolledBackError } from '../util';

export async function renderTree(p: RenderTreeInput) {
  const ctx: ApplyCtx = { res: new Resources(), defaultFont: p.defaultFont ?? 'Inter' };
  const parent = p.parentId ? await getContainer(p.parentId) : figma.currentPage;
  const ids: Record<string, string> = {};
  const state = { root: null as SceneNode | null, count: 0 };

  const onPage = parent.type === 'PAGE' && p.tree.x === undefined && p.tree.y === undefined;
  const spot = onPage ? freeSpot((parent as PageNode).children) : null;

  try {
    const root = await build(p.tree, parent, p.index, ctx, [], ids, state);
    if (spot) {
      root.x = spot.x;
      root.y = spot.y;
    }
    if (p.select && root.parent?.type === 'PAGE') {
      figma.currentPage.selection = [root];
      figma.viewport.scrollAndZoomIntoView([root]);
    }
    return {
      rootId: root.id,
      created: state.count,
      bounds: { x: root.x, y: root.y, width: root.width, height: root.height },
      ids,
    };
  } catch (e) {
    if (state.root && !state.root.removed) state.root.remove();
    throw new RolledBackError(`${e instanceof Error ? e.message : String(e)} (nothing was left on the canvas)`);
  }
}

async function build(
  spec: TreeNode,
  parent: BaseNode & ChildrenMixin,
  index: number | undefined,
  ctx: ApplyCtx,
  path: string[],
  ids: Record<string, string>,
  state: { root: SceneNode | null; count: number },
): Promise<SceneNode> {
  const label = spec.name ?? spec.type;
  const here = [...path, label];
  try {
    // Mutable copy: create() may consume or derive some properties.
    const props = { ...spec } as unknown as AnyProps;
    const node = await create(spec, ctx, props);
    if (!state.root) state.root = node;
    state.count++;

    await applyProps(node, props, ctx, true);
    if (index !== undefined) parent.insertChild(Math.min(index, parent.children.length), node);
    else parent.appendChild(node);
    applyPlacement(node, props, true);

    if (spec.type === 'frame' && spec.children?.length) {
      const frame = node as FrameNode;
      for (const child of spec.children) await build(child, frame, undefined, ctx, here, ids, state);
      if (!isAutoLayout(frame) && spec.width === undefined && spec.height === undefined) fitToChildren(frame);
    }

    let key = here.join('/');
    for (let i = 2; key in ids; i++) key = `${here.join('/')}#${i}`;
    ids[key] = node.id;
    return node;
  } catch (e) {
    if (e instanceof PathError) throw e;
    throw new PathError(`At "${here.join(' > ')}": ${e instanceof Error ? e.message : String(e)}`);
  }
}

class PathError extends Error {}

async function create(spec: TreeNode, ctx: ApplyCtx, props: AnyProps): Promise<SceneNode> {
  switch (spec.type) {
    case 'frame': {
      const node = spec.component ? figma.createComponent() : figma.createFrame();
      delete props.component;
      node.fills = []; // transparent unless a fill is given
      // createFrame starts at 100x100; layout frames without a size will hug.
      return node;
    }
    case 'text':
      return figma.createText();
    case 'rect':
      return figma.createRectangle();
    case 'ellipse':
      return figma.createEllipse();
    case 'svg': {
      const node = figma.createNodeFromSvg(spec.svg);
      if (spec.color) recolor(node, spec.color);
      const w = typeof spec.width === 'number' ? spec.width : undefined;
      const h = typeof spec.height === 'number' ? spec.height : undefined;
      // Scale vectors with the frame instead of resizing only the frame.
      const factor = w !== undefined && h !== undefined ? Math.min(w / node.width, h / node.height) : w !== undefined ? w / node.width : h !== undefined ? h / node.height : 1;
      if (factor !== 1 && isFinite(factor) && factor > 0) node.rescale(factor);
      if (w === undefined || h === undefined) {
        delete props.width;
        delete props.height;
      }
      return node;
    }
    case 'image': {
      if (!spec.imageBase64 && !spec.src) throw new Error('image needs src (or imageBase64).');
      const rect = figma.createRectangle();
      const hash = spec.imageBase64
        ? ctx.res.imageHash(spec.imageBase64)
        : (await figma.createImageAsync(spec.src!)).hash;
      const image = figma.getImageByHash(hash);
      const size = image ? await image.getSizeAsync() : { width: 100, height: 100 };
      const w = typeof spec.width === 'number' ? spec.width : undefined;
      const h = typeof spec.height === 'number' ? spec.height : undefined;
      if (w === undefined && h === undefined) Object.assign(props, size);
      else if (w === undefined) props.width = Math.round((size.width / size.height) * h!);
      else if (h === undefined) props.height = Math.round((size.height / size.width) * w);
      if (spec.fill === undefined) rect.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: spec.scaleMode ?? 'FILL' }];
      return rect;
    }
    case 'instance': {
      const c = await ctx.res.component(spec.component);
      const main = c.type === 'COMPONENT_SET' ? c.defaultVariant : c;
      const inst = main.createInstance();
      // The component ref is consumed here; applyProps would treat it as a swap.
      delete props.component;
      return inst;
    }
  }
}

function recolor(root: FrameNode, color: string) {
  const c = parseColor(color);
  const paint: SolidPaint = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
  for (const n of root.findAll(() => true)) {
    if ('fills' in n && Array.isArray(n.fills) && n.fills.some((f: Paint) => f.type === 'SOLID')) n.fills = [paint];
    if ('strokes' in n && n.strokes.some((s) => s.type === 'SOLID')) n.strokes = [paint];
  }
}

function fitToChildren(frame: FrameNode) {
  let w = 0;
  let h = 0;
  for (const c of frame.children) {
    w = Math.max(w, c.x + c.width);
    h = Math.max(h, c.y + c.height);
  }
  if (w > 0 && h > 0) frame.resize(w, h);
}
