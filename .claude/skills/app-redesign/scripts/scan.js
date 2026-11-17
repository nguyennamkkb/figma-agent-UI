const OPTIONS = { mode: 'scan', pages: null, junk: '\\b(test|seed|tmp|temp|wiring|archive|backup|trash|old|rip|deprecated|unused)\\b', maxTexts: 40 };

const JUNK = new RegExp(OPTIONS.junk, 'i');
const META_NAME = /^(title|note|notes|label|legend|header|container|annotation|sticky|text block|flow\/text-block)\b/i;
const AD_NAME = /(^|[^a-z])(ads?|admob|sponsored|interstitial)([^a-z]|$)|native ?(ad|full|banner|\d)/i;
const AD_TEXT = /^(ad|ads|sponsored|quảng cáo)$/i;
const CTA_NAME = /button|btn|cta/i;
const DIALOG_NAME = /dialog|popup|pop-up|modal|alert|sheet|bottomsheet/i;
const TIME_TEXT = /^\d{1,2}:\d{2}$/;

function isScreenSize(n) {
  return n.width >= 300 && n.height >= 400;
}

function visibleWalk(node, visit) {
  if (node.visible === false) return;
  if (visit(node) === false) return;
  if ('children' in node) for (const c of node.children) visibleWalk(c, visit);
}

function solidFills(n) {
  if (!('fills' in n) || n.fills === figma.mixed || !Array.isArray(n.fills)) return [];
  return n.fills.filter((p) => p.visible !== false);
}

function hex(c) {
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + to(c.r) + to(c.g) + to(c.b);
}

function firstText(n) {
  let found = null;
  visibleWalk(n, (k) => {
    if (found) return false;
    if (k.type === 'TEXT' && k.characters.trim()) {
      found = k.characters.replace(/\s+/g, ' ').trim();
      return false;
    }
  });
  return found;
}

function hasWhiteBand(btn) {
  const visit = (k, alpha) => {
    if (k.visible === false || k.type === 'TEXT') return false;
    const a = k === btn ? 1 : alpha * (k.opacity ?? 1);
    if (k !== btn && (k.type === 'VECTOR' || k.type === 'RECTANGLE' || k.type === 'POLYGON')) {
      const white = solidFills(k).find((p) => p.type === 'SOLID' && p.color.r > 0.95 && p.color.g > 0.95 && p.color.b > 0.95);
      const faint = white && a * (white.opacity ?? 1) <= 0.6;
      const wide = k.width >= btn.width * 0.15 && k.height >= btn.height * 0.8;
      if (faint && wide) return true;
    }
    return 'children' in k && k.children.some((c) => visit(c, a));
  };
  return visit(btn, 1);
}

async function describeInstance(n) {
  const main = await n.getMainComponentAsync();
  if (!main) return { name: n.name, component: null, set: null, variant: null };
  const set = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.name : null;
  return { name: n.name, component: main.name, set, variant: set ? main.name : null };
}

function insideDialog(node, screen) {
  let p = node.parent;
  while (p && p !== screen) {
    if (DIALOG_NAME.test(p.name)) return true;
    p = p.parent;
  }
  return false;
}

async function describeScreen(f, page, section) {
  const texts = [];
  const instances = [];
  const images = [];
  const ads = [];
  const ctas = [];
  const reactions = [];
  const instanceNodes = [];
  const ctaNodes = [];
  let nodeCount = 0;
  visibleWalk(f, (n) => {
    nodeCount++;
    if (n.type === 'TEXT') {
      const t = n.characters.replace(/\s+/g, ' ').trim();
      if (t.length > 1 && !TIME_TEXT.test(t) && texts.length < OPTIONS.maxTexts && !texts.includes(t)) texts.push(t.slice(0, 120));
      if (AD_TEXT.test(t)) ads.push({ id: n.id, name: 'text:' + t, y: Math.round(n.absoluteTransform[1][2] - f.absoluteTransform[1][2]) });
    }
    for (const p of solidFills(n)) {
      if (p.type === 'IMAGE' && p.imageHash) {
        const hero = n.width >= f.width * 0.4 && n.height >= f.height * 0.25;
        images.push({ hash: p.imageHash, id: n.id, name: n.name, w: Math.round(n.width), h: Math.round(n.height), hero });
      }
    }
    if ('reactions' in n && n.reactions && n.reactions.length) {
      for (const r of n.reactions) {
        const actions = r.actions || (r.action ? [r.action] : []);
        for (const a of actions) if (a && a.destinationId) reactions.push({ from: n.id, trigger: r.trigger ? r.trigger.type : null, to: a.destinationId, navigation: a.navigation || null });
      }
    }
    if (n !== f && n.type !== 'TEXT' && AD_NAME.test(n.name) && n.width >= 120 && n.height >= 40) {
      ads.push({ id: n.id, name: n.name, w: Math.round(n.width), h: Math.round(n.height), y: Math.round(n.absoluteTransform[1][2] - f.absoluteTransform[1][2]) });
      return false;
    }
    const looksCta = n !== f && (n.type === 'INSTANCE' || n.type === 'FRAME' || n.type === 'COMPONENT') && n.height >= 32 && n.height <= 72 && n.width >= 72;
    if (looksCta && (CTA_NAME.test(n.name) || n.type === 'INSTANCE')) {
      ctaNodes.push(n);
    }
    if (n.type === 'INSTANCE' && n !== f) {
      instanceNodes.push(n);
      return CTA_NAME.test(n.name) ? false : undefined;
    }
  });
  const seenCta = new Set();
  for (const n of ctaNodes) {
    const label = firstText(n);
    if (!label || TIME_TEXT.test(label) || /status ?bar/i.test(n.name)) continue;
    let isCta = CTA_NAME.test(n.name);
    let info = null;
    if (n.type === 'INSTANCE') {
      info = await describeInstance(n);
      isCta = isCta || CTA_NAME.test(info.component || '') || CTA_NAME.test(info.set || '');
      if (/status ?bar/i.test((info.component || '') + ' ' + (info.set || ''))) isCta = false;
    }
    if (!isCta) continue;
    let p = n.parent;
    let nested = false;
    while (p && p !== f) {
      if (seenCta.has(p.id)) nested = true;
      p = p.parent;
    }
    if (nested) continue;
    seenCta.add(n.id);
    const fills = solidFills(n);
    ctas.push({
      id: n.id,
      label: label.slice(0, 60),
      kind: n.type === 'INSTANCE' ? 'instance' : 'local',
      set: info ? info.set : null,
      variant: info ? info.variant || info.component : null,
      gradient: fills.some((x) => x.type.indexOf('GRADIENT') === 0),
      fill: fills.length && fills[0].type === 'SOLID' ? hex(fills[0].color) : fills.length ? fills[0].type : null,
      effects: 'effects' in n ? n.effects.filter((e) => e.visible).length : 0,
      mirror: hasWhiteBand(n),
      inDialog: insideDialog(n, f),
      w: Math.round(n.width),
      h: Math.round(n.height),
    });
  }
  for (const n of instanceNodes.slice(0, 80)) {
    let p = n.parent;
    let nestedInInstance = false;
    while (p && p !== f) {
      if (p.type === 'INSTANCE') nestedInInstance = true;
      p = p.parent;
    }
    if (nestedInInstance) continue;
    const d = await describeInstance(n);
    instances.push(d.set ? d.set + ' / ' + d.component : d.component || d.name);
  }
  const meta = !isScreenSize(f) || META_NAME.test(f.name);
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    page: page.name,
    section: section ? section.name : null,
    sectionId: section ? section.id : null,
    junk: !!(section && JUNK.test(section.name)) || JUNK.test(page.name),
    kind: meta ? 'meta' : 'screen',
    x: Math.round(f.absoluteTransform[0][2]),
    y: Math.round(f.absoluteTransform[1][2]),
    w: Math.round(f.width),
    h: Math.round(f.height),
    flat: nodeCount <= 3 && images.length > 0,
    nodeCount,
    texts,
    instances: [...new Set(instances)],
    images,
    ads,
    ctas,
    reactions,
  };
}

function collectFrames(container, section, out) {
  for (const c of container.children) {
    if (c.type === 'SECTION') collectFrames(c, c, out);
    else if (c.type === 'GROUP') collectFrames(c, section, out);
    else if (c.type === 'FRAME' || c.type === 'COMPONENT' || c.type === 'INSTANCE') out.push({ node: c, section });
  }
  return out;
}

async function survey() {
  const pages = [];
  for (const page of figma.root.children) {
    await page.loadAsync();
    const frames = collectFrames(page, null, []);
    const screens = frames.filter((x) => isScreenSize(x.node) && !META_NAME.test(x.node.name));
    const sections = page.children.filter((c) => c.type === 'SECTION').map((s) => s.name);
    pages.push({ id: page.id, name: page.name, junk: JUNK.test(page.name), screens: screens.length, sections: sections.slice(0, 30), sampleScreens: screens.slice(0, 6).map((x) => x.node.name) });
  }
  return { file: figma.root.name, current: figma.currentPage.name, pages };
}

async function scan() {
  const wanted = OPTIONS.pages;
  const pages = figma.root.children.filter((p) => !wanted || wanted.includes(p.id) || wanted.includes(p.name));
  const screens = [];
  const sections = [];
  const connectors = [];
  const ownerOf = new Map();
  for (const page of pages) {
    await page.loadAsync();
    const walkSections = (container, parentName) => {
      for (const c of container.children) {
        if (c.type === 'SECTION') {
          sections.push({ id: c.id, name: c.name, page: page.name, parent: parentName, junk: JUNK.test(c.name), x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) });
          walkSections(c, c.name);
        }
      }
    };
    walkSections(page, null);
    for (const { node, section } of collectFrames(page, null, [])) {
      const d = await describeScreen(node, page, section);
      screens.push(d);
      ownerOf.set(node.id, node.id);
      node.findAll(() => true).forEach((k) => ownerOf.set(k.id, node.id));
    }
    for (const c of page.findAllWithCriteria({ types: ['CONNECTOR'] })) {
      const from = c.connectorStart && c.connectorStart.endpointNodeId;
      const to = c.connectorEnd && c.connectorEnd.endpointNodeId;
      connectors.push({ id: c.id, name: c.name, page: page.name, from: from || null, to: to || null, fromScreen: from ? ownerOf.get(from) || null : null, toScreen: to ? ownerOf.get(to) || null : null, label: c.text && c.text.characters ? c.text.characters.trim().slice(0, 60) : '' });
    }
  }
  for (const s of screens) for (const r of s.reactions) r.toScreen = ownerOf.get(r.to) || null;
  const paint = await figma.getLocalPaintStylesAsync();
  const textStyles = await figma.getLocalTextStylesAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let componentSets = 0;
  let components = 0;
  for (const page of pages) {
    componentSets += page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).length;
    components += page.findAllWithCriteria({ types: ['COMPONENT'] }).length;
  }
  return {
    file: figma.root.name,
    scannedAt: new Date().toISOString(),
    pages: pages.map((p) => ({ id: p.id, name: p.name })),
    designSystem: { variables: variables.length, collections: collections.map((c) => c.name + ' (' + c.modes.length + ' modes)'), paintStyles: paint.length, textStyles: textStyles.length, componentSetsOnScannedPages: componentSets, componentsOnScannedPages: components },
    sections,
    screens,
    connectors,
  };
}

return OPTIONS.mode === 'survey' ? await survey() : await scan();
