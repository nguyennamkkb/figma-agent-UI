# builder — plugin helpers

Paste the block at the top of an `execute_code` body, fill `CFG` with the ids from the project's `rules.md` (Ads Kit components, the base-screen section and frame names from "Base screens", `Top bar Right=Check`, background image hashes), then call `buildSection(section, spec)` once per version section. It builds row 1 and the aligned row 2 twins and returns their ids. Arrows are not created here: `execute_code` cannot clone connectors. For each consecutive pair in `row1` and `row2` call `render_tree` `{type: "connector", from, to, fromMagnet: "RIGHT", toMagnet: "LEFT"}` with `parentId` = section id, then set labels from `spec.edges` with `execute_code` (`c.text.characters`).

```js

const CFG = {
  kit: { native: 'ID_Ad/Native set', full: 'ID_Ad/Native Full set', banner: 'ID_Ad/Banner', inter: 'ID_Ad/Interstitial' },
  baseSection: 'ID of the flow section holding the base screens (rules.md)',
  base: { splash: 'SCR-01 · Splash · Default', lang: 'SCR-02 · Language · Default', onboarding: 'SCR-03 · Onboarding · Page 1', onboardingNoAds: 'SCR-03 · Onboarding · Page 1 · No Ads', loading: 'SCR-07 · Onboarding · Setting Up', allSet: 'SCR-07 · Onboarding · All Set' },
  topBarCheck: 'ID_Top bar Right=Check',
  bg: { splash: 'HASH', ob1: 'HASH', ob2: 'HASH', ob3: 'HASH', ob4: 'HASH', ob5: 'HASH' },
  grid: { col0: 200, step: 440, row1: 304, row2: 1504 },
};
const G = id => figma.getNodeByIdAsync(id);
const KIT = { native: await G(CFG.kit.native), full: await G(CFG.kit.full), banner: await G(CFG.kit.banner), inter: await G(CFG.kit.inter) };
const variant = (set, v) => set.children.find(c => c.name === v);
const child = (f, name) => f.findOne(n => n.name === name);
async function setText(node, chars) { await h.loadNodeFonts(node); node.characters = chars; }

function adLayerName(s) { return 'Ad · ' + { banner: 'Banner', native: 'Native', 'native-full': 'Native Full', inter: 'Inter' }[s.ad] + (s.layout ? ' · ' + s.layout : s.close ? ' · ' + s.close : ''); }
function adInstance(s) {
  const comp = s.ad === 'banner' ? KIT.banner : s.ad === 'inter' ? KIT.inter
    : s.ad === 'native-full' ? variant(KIT.full, 'Close=' + s.close) : variant(KIT.native, 'Layout=' + s.layout);
  const i = comp.createInstance(); i.name = adLayerName(s); return i;
}
function place(sec, f, col, row) { sec.appendChild(f); f.x = CFG.grid.col0 + col * CFG.grid.step; f.y = row === 2 ? CFG.grid.row2 : CFG.grid.row1; return f; }
function screenName(s) { return s.ad === 'native-full' ? s.name + ' - Native Full' : s.name; }
async function fromMaster(key, name) { const sec = await G(CFG.baseSection); const m = sec.findOne(n => n.type === 'FRAME' && n.name === CFG.base[key]); const f = m.clone(); f.name = name; const old = f.findChild(n => n.name === 'Ad / Native 272'); if (old) old.remove(); return f; }
function emptyScreen(name) { const f = figma.createFrame(); f.name = name; f.resize(360, 800); f.clipsContent = true; f.fills = [h.solid('#0B0B0F')]; return f; }

const BUILD = {
  async splash(s) { const f = await fromMaster('splash', screenName(s)); if (s.ad === 'banner') { for (const k of ['Content', 'fade']) child(f, k).y -= 64; const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 736; } return f; },
  async inter(s) { const f = emptyScreen(screenName(s)); const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 0; a.setProperties({ 'Title#19:0': /show bù/i.test(s.name) ? 'Inter Ads · Show bù' : 'Inter Ads', 'Unit#19:1': s.name }); return f; },
  async 'native-full'(s) { const f = emptyScreen(screenName(s)); const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 0; return f; },
  async lang(s, picked) {
    const f = await fromMaster('lang', screenName(s));
    const tb = f.findChild(n => n.name === 'Top bar'); tb.findChild(n => n.name === 'done').visible = picked;
    if (s.ad === 'native') { const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 800 - a.height; const c = child(f, 'Content'); c.resize(360, a.y - c.y); const lf = child(f, 'list-fade'); if (lf) lf.y = a.y - lf.height; }
    return f;
  },
  async onboarding(s) {
    if (s.ad !== 'native') { const f = await fromMaster('onboardingNoAds', screenName(s)); child(f, 'hero').fills = [{ type: 'IMAGE', imageHash: CFG.bg[s.content], scaleMode: 'FILL' }]; return f; }
    const f = await fromMaster('onboarding', screenName(s)); const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 800 - a.height;
    const hero = child(f, 'hero'); hero.resize(360, a.y); hero.fills = [{ type: 'IMAGE', imageHash: CFG.bg[s.content], scaleMode: 'FILL' }];
    const fade = child(f, 'fade'); fade.y = a.y - fade.height; const c = child(f, 'Content'); c.y = a.y - c.height; return f;
  },
  async loading(s) { const f = await fromMaster('loading', screenName(s)); if (s.ad === 'native') { const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 556; } return f; },
  async 'all-set'(s) { const f = await fromMaster('allSet', screenName(s)); if (s.ad === 'native') { const a = adInstance(s); f.appendChild(a); a.x = 0; a.y = 556; } return f; },
};
async function buildScreen(s) {
  if (s.type === 'lang-empty') return BUILD.lang(s, false);
  if (s.type === 'lang-picked') return BUILD.lang(s, true);
  return BUILD[s.type](s);
}

async function noAdsTwin(row1, s) {
  if (s.ad === 'inter' || s.ad === 'native-full') return null;
  const f = row1.clone();
  if (s.ad === 'none') return f;
  f.name = s.name + ' · No Ads';
  const ad = f.findChild(n => n.name.startsWith('Ad · ')); if (ad) ad.remove();
  if (s.ad === 'banner') { for (const k of ['Content', 'fade']) child(f, k).y += 64; return f; }
  if (s.type.startsWith('lang')) { const c = child(f, 'Content'); c.resize(360, 800 - c.y); const lf = child(f, 'list-fade'); if (lf) lf.y = 800 - lf.height; return f; }
  if (s.type === 'loading' || s.type === 'all-set') { const c = child(f, 'Content'); c.resize(360, 724 - c.y); return f; }
  f.remove();
  const t = await fromMaster('onboardingNoAds', s.name + ' · No Ads');
  t.findChild(n => n.name === 'hero').fills = row1.findChild(n => n.name === 'hero').fills;
  const src = child(row1, 'Content'), dst = child(t, 'Content');
  await setText(child(dst, 'title'), child(src, 'title').characters);
  await setText(child(dst, 'subtitle'), child(src, 'subtitle').characters);
  const sp = row1.findOne(n => n.type === 'INSTANCE' && n.name === 'Pager'), dp = t.findOne(n => n.type === 'INSTANCE' && n.name === 'Pager');
  if (sp && dp) dp.swapComponent(await sp.getMainComponentAsync());
  return t;
}

async function buildSection(sec, spec) {
  const row1 = [], row2 = [];
  for (let i = 0; i < spec.screens.length; i++) {
    const s = spec.screens[i];
    const f = place(sec, await buildScreen(s), i, 1); row1.push(f.id);
    const t = await noAdsTwin(f, s); if (t) { place(sec, t, i, 2); row2.push(t.id); }
  }
  return { row1, row2 };
}
```
