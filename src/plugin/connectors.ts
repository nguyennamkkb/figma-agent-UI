import { findNode } from './util';

export const CONNECTOR_SEED_NAME = 'figma-agent/connector-seed';

export type Magnet = 'AUTO' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER';
type Side = 'from' | 'to';

const SEED_ROUTE_SLACK = 100;
const MAX_SEED_CANDIDATES = 25;

export async function newConnector(scratch: SceneNode[]): Promise<ConnectorNode> {
  if (typeof (figma as { createConnector?: unknown }).createConnector === 'function') return figma.createConnector();
  const seed = await ensureSeed();
  const holder = seed.clone();
  scratch.push(holder);
  const copy = holder.findChild((n) => n.type === 'CONNECTOR') as ConnectorNode | null;
  if (!copy) throw new Error(`The "${CONNECTOR_SEED_NAME}" section lost its connector; delete it and retry.`);
  return copy;
}

export function discardScratch(scratch: SceneNode[]): void {
  for (const n of scratch.splice(0)) {
    if (!n.removed) n.remove();
  }
}

export function defaultMagnet(node: ConnectorNode): Magnet {
  return node.connectorLineType === 'STRAIGHT' ? 'CENTER' : 'AUTO';
}

export async function attachEndpoint(node: ConnectorNode, side: Side, ref: string, magnet: Magnet): Promise<string> {
  const target = await findNode(ref);
  if (!target) throw new Error(`Connector "${side}" target not found: ${ref}.`);
  if (target.type === 'DOCUMENT' || target.type === 'PAGE') throw new Error(`Connector "${side}" cannot attach to a ${target.type}.`);
  try {
    setEndpoint(node, side, target.id, magnet);
    return target.id;
  } catch (e) {
    const outer = outermostInstance(target);
    if (!outer || outer.id === target.id) throw e;
    setEndpoint(node, side, outer.id, magnet);
    return outer.id;
  }
}

export function endpointId(node: ConnectorNode, side: Side): string | undefined {
  const ep = side === 'from' ? node.connectorStart : node.connectorEnd;
  return 'endpointNodeId' in ep ? ep.endpointNodeId : undefined;
}

function setEndpoint(node: ConnectorNode, side: Side, id: string, magnet: Magnet): void {
  const endpoint = { endpointNodeId: id, magnet } as ConnectorEndpoint;
  if (side === 'from') node.connectorStart = endpoint;
  else node.connectorEnd = endpoint;
}

function outermostInstance(node: BaseNode): InstanceNode | null {
  let found: InstanceNode | null = null;
  for (let p: BaseNode | null = node; p && p.type !== 'PAGE'; p = p.parent) {
    if (p.type === 'INSTANCE') found = p;
  }
  return found;
}

async function ensureSeed(): Promise<SectionNode> {
  const existing = figma.currentPage.findChild(
    (n) => n.type === 'SECTION' && n.name === CONNECTOR_SEED_NAME && n.children.some((c) => c.type === 'CONNECTOR'),
  ) as SectionNode | null;
  if (existing && hasCleanRoute(existing)) return existing;
  if (existing) existing.remove();
  const sources = await findSourceConnectors();
  if (sources.length === 0) {
    throw new Error(
      'Figma Design plugins cannot create connectors from scratch: draw or paste one connector anywhere in this file (any page), then retry. It is copied once into a "' +
        CONNECTOR_SEED_NAME +
        '" section and reused.',
    );
  }
  for (const source of sources) {
    const seed = await buildSeed(source);
    if (hasCleanRoute(seed)) return seed;
    seed.remove();
  }
  throw new Error(
    'Every connector in this file carries a frozen elbow route (hand-dragged, or pasted without the shapes it joined), which copies inherit and plugins cannot reset. Copy a connector together with both shapes it connects from another file (or a "' + CONNECTOR_SEED_NAME + '" section) into this file, then retry.',
  );
}

function hasCleanRoute(seed: SectionNode): boolean {
  const line = seed.findChild((n) => n.type === 'CONNECTOR');
  if (!line) return false;
  return line.width <= seed.width + SEED_ROUTE_SLACK && line.height <= seed.height + SEED_ROUTE_SLACK;
}

async function findSourceConnectors(): Promise<ConnectorNode[]> {
  const pages = [figma.currentPage, ...figma.root.children.filter((p) => p.id !== figma.currentPage.id)];
  const found: ConnectorNode[] = [];
  for (const page of pages) {
    await page.loadAsync();
    for (const hit of page.findAllWithCriteria({ types: ['CONNECTOR'] })) {
      if (hit.parent?.type === 'SECTION' && hit.parent.name === CONNECTOR_SEED_NAME) continue;
      found.push(hit);
      if (found.length >= MAX_SEED_CANDIDATES) return byAttachment(found);
    }
  }
  return byAttachment(found);
}

function isAttached(node: ConnectorNode): boolean {
  return [node.connectorStart, node.connectorEnd].every(
    (ep) => 'endpointNodeId' in ep && !('position' in ep && ep.position),
  );
}

function byAttachment(list: ConnectorNode[]): ConnectorNode[] {
  return [...list.filter(isAttached), ...list.filter((n) => !isAttached(n))];
}

function cloneHolder(source: ConnectorNode): SceneNode {
  const parent = source.parent;
  if (!parent) throw new Error('The source connector has no parent.');
  if (parent.type === 'PAGE') {
    const index = parent.children.indexOf(source);
    const wrapper = figma.createSection();
    parent.appendChild(wrapper);
    wrapper.x = 0;
    wrapper.y = 0;
    try {
      wrapper.appendChild(source);
      return wrapper.clone();
    } finally {
      parent.insertChild(Math.min(index, parent.children.length), source);
      wrapper.remove();
    }
  }
  return (parent as SceneNode).clone();
}

async function buildSeed(source: ConnectorNode): Promise<SectionNode> {
  const holder = cloneHolder(source);
  try {
    const copy = (holder as SceneNode & ChildrenMixin).findAllWithCriteria({ types: ['CONNECTOR'] })[0];
    if (!copy) throw new Error('Could not copy the source connector.');
    const seed = figma.createSection();
    figma.currentPage.appendChild(seed);
    seed.name = CONNECTOR_SEED_NAME;
    const spot = seedSpot(figma.currentPage.children.filter((n) => n.id !== seed.id && n.id !== holder.id));
    seed.x = spot.x;
    seed.y = spot.y;
    seed.resizeWithoutConstraints(400, 200);
    const a = anchor('seed-a', 20);
    const b = anchor('seed-b', 360);
    seed.appendChild(a);
    seed.appendChild(b);
    seed.appendChild(copy);
    copy.connectorLineType = 'ELBOWED';
    setEndpoint(copy, 'from', a.id, 'RIGHT');
    setEndpoint(copy, 'to', b.id, 'LEFT');
    copy.name = 'connector';
    await clearLabel(copy);
    return seed;
  } finally {
    if (!holder.removed) holder.remove();
  }
}

async function clearLabel(node: ConnectorNode): Promise<void> {
  if (!node.text.characters) return;
  const font = node.text.fontName;
  if (font !== figma.mixed) await figma.loadFontAsync(font);
  node.text.characters = '';
}

function anchor(name: string, x: number): RectangleNode {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(20, 20);
  r.x = x;
  r.y = 90;
  return r;
}

function seedSpot(siblings: readonly SceneNode[]): { x: number; y: number } {
  let minX = Infinity;
  let minY = Infinity;
  for (const n of siblings) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
  }
  if (minX === Infinity) return { x: 0, y: -400 };
  return { x: Math.round(minX), y: Math.round(minY - 400) };
}
