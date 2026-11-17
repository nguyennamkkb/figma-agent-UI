# builder — build one version section from the base screens

Tested on `/ads-board 1.6.0` (V1.6.0 rebuilt from page 05 · FL-01, identical to the previous board). One `execute_code` call per version section.

1. Fill the constants from `sources/<flow>/rules.md`: `BASE_SECTION` (flow section of the base screens), `B` (base frame names), `KIT` (Ads Kit component ids), `PAGER_ID`, `CONTENT` (content key → image hash, title, subtitle), `PAGER_STEP`, and `SECTION` (the version section; create it first at its slot of the stack with the `Title` and the two `Row label` texts).
2. Paste the spec's `screens` as `SPEC`.
3. Run. It clears the section except `Title` and `Row label …`, builds row 1 and the aligned row 2, and returns both id lists.
4. Arrows: `execute_code` cannot clone connectors. For each consecutive pair in `r1` and in `r2`, call `render_tree` `{type: "connector", from, to, fromMagnet: "RIGHT", toMagnet: "LEFT"}` with `parentId` = section id; `branches` from BOTTOM to BOTTOM. Then set labels from `spec.edges` with `execute_code` (copy `text.fontName`, `fontSize`, `fills` from an existing labelled connector) and add the yellow notes at y 2404 (`layout-grid.md`).
5. Screenshot the section and the screens with a footer.

```js
const G = id => figma.getNodeByIdAsync(id);
const SECTION = 'VERSION SECTION ID';
const BASE_SECTION = '4:25';
const B = { splash: 'SCR-01 · Splash · Default', langD: 'SCR-02 · Language · Default', langS: 'SCR-02 · Language · Selected', langN: 'SCR-02 · Language · No Ads', ob: 'SCR-03 · Onboarding · Page 1', obN: 'SCR-03 · Onboarding · Page 1 · No Ads' };
const KIT = { native: '19:6999', full: '19:7048', banner: '19:7000', inter: '19:7049' };
const PAGER_ID = '7:1026';
const CONTENT = { splash: ['HASH'], ob1: ['HASH', 'Title', 'Subtitle'] };
const PAGER_STEP = { ob1: 1 };
const SPEC = { screens: [] };

const BASE_SEC = await G(BASE_SECTION);
const base = n => BASE_SEC.findOne(f => f.type === 'FRAME' && f.name === n);
const NAT = await G(KIT.native), FULL = await G(KIT.full), BANNER = await G(KIT.banner), INTER = await G(KIT.inter), PAGER = await G(PAGER_ID);
const SEC = await G(SECTION);
for (const c of [...SEC.children]) { if (c.removed) continue; if (c.name === 'Title' || c.name.startsWith('Row label')) continue; c.remove(); }
const COL = i => 200 + i * 440;
function cl(key, name) { const f = base(B[key]).clone(); SEC.appendChild(f); f.name = name; const old = f.findChild(n => n.name === 'Ad / Native 272'); if (old) old.remove(); return f; }
function empty(name) { const f = figma.createFrame(); SEC.appendChild(f); f.name = name; f.resize(360, 800); f.clipsContent = true; f.fills = base(B.splash).fills; return f; }
function adInst(s) {
  let i;
  if (s.ad === 'banner') { i = BANNER.createInstance(); i.name = 'Ad · Banner'; }
  else if (s.ad === 'inter' || s.ad === 'app-open') { i = INTER.createInstance(); i.name = s.ad === 'inter' ? 'Ad · Inter' : 'Ad · App Open'; }
  else if (s.ad === 'native-full') { i = FULL.children.find(c => c.name === 'Close=' + s.close).createInstance(); i.name = 'Ad · Native Full · ' + s.close; }
  else { i = NAT.children.find(c => c.name === 'Layout=' + s.layout).createInstance(); i.name = 'Ad · Native · ' + s.layout; }
  return i;
}
async function txt(f, k) { const c = f.findChild(n => n.name === 'Content'); const [, t, s] = CONTENT[k]; for (const [n, v] of [['title', t], ['subtitle', s]]) { const x = c.findOne(m => m.name === n); await h.loadNodeFonts(x); x.characters = v; } }
function hero(f, k, hgt) { const r = f.findChild(n => n.name === 'hero'); if (hgt) r.resize(360, hgt); r.fills = [{ type: 'IMAGE', imageHash: CONTENT[k][0], scaleMode: 'FILL' }]; }
function pager(f, k) { const p = f.findOne(n => n.type === 'INSTANCE' && n.name === 'Pager'); if (p) p.swapComponent(PAGER.children.find(c => c.name === 'Step=' + PAGER_STEP[k])); }
async function obNoAds(name, s) { const f = cl('obN', name); hero(f, s.content); await txt(f, s.content); pager(f, s.content); return f; }

const r1 = [], r2 = [];
for (let i = 0; i < SPEC.screens.length; i++) {
  const s = SPEC.screens[i]; let f, t = null;
  if (s.type === 'splash') {
    f = cl('splash', s.name);
    if (s.ad === 'banner') { for (const k of ['Content', 'fade']) f.findChild(n => n.name === k).y -= 64; const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 736; }
    t = f.clone(); SEC.appendChild(t); t.name = s.name + ' · No Ads';
    const ta = t.findChild(n => n.name.startsWith('Ad · ')); if (ta) { ta.remove(); for (const k of ['Content', 'fade']) t.findChild(n => n.name === k).y += 64; }
  } else if (s.type === 'inter' || s.type === 'native-full') {
    f = empty(s.type === 'native-full' ? s.name + ' - Native Full' : s.name);
    const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 0;
    if (s.ad === 'inter' || s.ad === 'app-open') a.setProperties({ 'Title#19:0': s.ad === 'app-open' ? 'App Open / Inter Ads' : 'Inter Ads', 'Unit#19:1': s.name });
  } else if (s.type.startsWith('lang')) {
    const picked = s.type === 'lang-picked';
    f = cl(picked ? 'langS' : 'langD', s.name);
    const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 800 - a.height;
    const c = f.findChild(n => n.name === 'Content'); c.resize(360, a.y - c.y);
    const lf = f.findChild(n => n.name === 'list-fade'); lf.y = a.y - lf.height;
    if (picked) { t = cl('langS', s.name + ' · No Ads'); const tc = t.findChild(n => n.name === 'Content'); tc.resize(360, 800 - tc.y); const tl = t.findChild(n => n.name === 'list-fade'); tl.y = 800 - tl.height; }
    else t = cl('langN', s.name + ' · No Ads');
  } else if (s.type === 'onboarding') {
    if (s.ad === 'none') { f = await obNoAds(s.name, s); t = f.clone(); SEC.appendChild(t); }
    else {
      f = cl('ob', s.name); await txt(f, s.content);
      const a = adInst(s); f.appendChild(a); const c = f.findChild(n => n.name === 'Content');
      if (s.footer) { const foot = c.findChild(n => n.name === 'footer'); f.appendChild(foot); foot.name = 'Footer · Next'; foot.x = c.x; foot.y = 800 - 12 - foot.height; a.x = 0; a.y = foot.y - 8 - a.height; }
      else { a.x = 0; a.y = 800 - a.height; }
      hero(f, s.content, a.y); const fd = f.findChild(n => n.name === 'fade'); fd.y = a.y - fd.height; c.y = a.y - c.height; pager(f, s.content);
      t = await obNoAds(s.name + ' · No Ads', s);
    }
  }
  f.x = COL(i); f.y = 304; r1.push([f.id, f.name]);
  if (t) { t.x = COL(i); t.y = 1504; r2.push([t.id, t.name]); }
}
return { r1, r2 };
```

Types not covered yet (`loading`, `all-set`, `custom`): clone their base screen from `rules.md`, remove `Ad / Native 272`, place `Ad / Native Header-CTA` at y 556 (twin: base `· No Ads` frame). Add them here once a version uses them.
