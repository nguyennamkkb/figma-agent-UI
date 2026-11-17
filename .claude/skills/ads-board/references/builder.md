# builder — build one version section from the base screens

Tested on every First Open version (V1.5.0 → V2.0.0, page 05 · FL-01 as base screens), including an insert in the middle of the stack (V1.6.0), an off-flow sub-section (V1.9.0) and a rebuild in place with `SECTION_ID` (V1.7.0: same id and position). One `execute_code` call per version section, then one `render_tree` call per arrow.

## Steps
1. Fill the inputs at the top of the code from the spec and `sources/<flow>/rules.md`:
   - `VERSION`, `SECTION_ID` (existing section → rebuilt in place, keeps its id and position) or `null` (created at `Y`).
   - `Y` = bottom of the previous section + 400; `H` = 3104, or 4304 when the spec has `offFlow`. `MOVE_DOWN` = ids of the later sections when the version is inserted in the middle (each moves down by `H + 400`).
   - `SPEC` = the spec's `screens` (only the fields used: `name`, `type`, `ad`, `layout`, `close`, `content`, `footer`).
   - `NOTES` = `[title, lines]` boxes: the spec's `notes` (`Ghi chú <version>`), and `Thay đổi so với <older>` from `spec_diff.py` (always in the newer section of the pair).
   - `B`, `KIT`, `BG_ID`, `PAGER_ID`, `CONTENT` (content key → asset layer name, title, subtitle), `PAGER_STEP` from `rules.md`. Image hashes are read from the `Ads Kit · backgrounds` tiles by asset name, never stored.
2. Run it. It returns the row 1 and row 2 frame ids in column order.
3. Arrows (`execute_code` cannot create or clone connectors): one `render_tree` `{type: "connector", from, to, fromMagnet: "RIGHT", toMagnet: "LEFT"}` per consecutive pair of `r1`, then of `r2`, with `parentId` = section id; `branches` BOTTOM → BOTTOM. Do **not** pass `text`: some labels (e.g. `Loaded`) make the connector geometry break (bounds of thousands of px). Set every label afterwards with `execute_code`: `await figma.loadFontAsync(c.text.fontName); c.text.characters = label; c.text.fontSize = 20;`.
4. `offFlow` → see "Off-flow sub-section" below.
5. Check: every connector has both endpoints and a height under 600, no 360-wide frames overlap, sections 400 apart. Screenshot the section, then screens with a footer or a new type.

## Code
```js
const G = id => figma.getNodeByIdAsync(id);
const VERSION = 'V2.0.0';
const SECTION_ID = null;
const Y = 0;
const H = 3104;
const MOVE_DOWN = [];
const SPEC = [];
const NOTES = [['Ghi chú V2.0.0', []], ['Thay đổi so với V1.9.0', []]];
const B = { splash: 'SCR-01 · Splash · Default', langD: 'SCR-02 · Language · Default', langS: 'SCR-02 · Language · Selected', langN: 'SCR-02 · Language · No Ads', ob: 'SCR-03 · Onboarding · Page 1', obN: 'SCR-03 · Onboarding · Page 1 · No Ads', loading: 'SCR-07 · Onboarding · Setting Up', loadingN: 'SCR-07 · Onboarding · Setting Up · No Ads', 'all-set': 'SCR-07 · Onboarding · All Set', 'all-setN': 'SCR-07 · Onboarding · All Set · No Ads' };
const BASE_SECTION = '4:25';
const PAGE_ID = '19:4118';
const KIT = { native: '19:6999', full: '19:7048', banner: '19:7000', inter: '19:7049' };
const BG_ID = 'ADS KIT BACKGROUNDS ID';
const PAGER_ID = '7:1026';
const CONTENT = { splash: ['101_A1_bg_splash'], ob1: ['301_C1_bg_ob1', 'Title', 'Subtitle'] };
const PAGER_STEP = { ob1: 1, ob2: 2, ob3: 3, ob4: 4, ob5: 5 };

await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }); await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const T = (parent, chars, size, style, color) => { const x = figma.createText(); parent.appendChild(x); x.fontName = { family: 'Inter', style }; x.fontSize = size; x.characters = chars; x.fills = [h.solid(color)]; return x; };
for (const id of MOVE_DOWN) { const n = await G(id); n.y += H + 400; }
let SEC = SECTION_ID ? await G(SECTION_ID) : null;
if (SEC) { for (const c of [...SEC.children]) { if (c.removed || c.name === 'Title' || c.name.startsWith('Row label')) continue; c.remove(); } }
else {
  SEC = figma.createSection(); (await G(PAGE_ID)).appendChild(SEC); SEC.name = '07 · First Open ' + VERSION; SEC.x = -3224; SEC.y = Y; SEC.fills = [h.solid('#2C2C2C')];
  const title = figma.createFrame(); SEC.appendChild(title); title.name = 'Title'; title.layoutMode = 'HORIZONTAL'; title.itemSpacing = 20; title.counterAxisAlignItems = 'CENTER'; title.primaryAxisSizingMode = 'AUTO'; title.counterAxisSizingMode = 'AUTO'; title.fills = [];
  const chip = figma.createFrame(); title.appendChild(chip); chip.name = 'chip'; chip.layoutMode = 'HORIZONTAL'; chip.primaryAxisSizingMode = 'AUTO'; chip.counterAxisSizingMode = 'AUTO'; chip.paddingLeft = chip.paddingRight = 20; chip.paddingTop = chip.paddingBottom = 8; chip.cornerRadius = 12; chip.fills = [h.solid('#E8953A')];
  T(chip, '07', 32, 'Bold', '#FFFFFF'); T(title, 'First Open ' + VERSION, 48, 'Bold', '#FFFFFF').name = 'name';
  title.x = 200; title.y = 24;
  for (const [t, y] of [['Có quảng cáo', 236], ['Không quảng cáo', 1436]]) { const x = T(SEC, t, 28, 'Bold', '#FFFFFF'); x.name = 'Row label · ' + t; x.x = 200; x.y = y; }
}
SEC.resizeWithoutConstraints(Math.max(6480, 200 + SPEC.length * 440 + 160), H);

const BASE_SEC = await G(BASE_SECTION);
const base = n => BASE_SEC.findOne(f => f.type === 'FRAME' && f.name === n);
const NAT = await G(KIT.native), FULL = await G(KIT.full), BANNER = await G(KIT.banner), INTER = await G(KIT.inter), PAGER = await G(PAGER_ID), BG = await G(BG_ID);
const img = k => BG.findOne(n => n.name === CONTENT[k][0]).fills.find(p => p.type === 'IMAGE').imageHash;
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
function hero(f, k, hgt) { const r = f.findChild(n => n.name === 'hero'); if (hgt) r.resize(360, hgt); r.fills = [{ type: 'IMAGE', imageHash: img(k), scaleMode: 'FILL' }]; }
function pager(f, k) { const p = f.findOne(n => n.type === 'INSTANCE' && n.name === 'Pager'); if (p) p.swapComponent(PAGER.children.find(c => c.name === 'Step=' + PAGER_STEP[k])); }
async function obNoAds(name, s) { const f = cl('obN', name); hero(f, s.content); await txt(f, s.content); pager(f, s.content); return f; }

const r1 = [], r2 = [];
for (let i = 0; i < SPEC.length; i++) {
  const s = SPEC[i]; let f, t = null;
  if (s.type === 'splash') {
    f = cl('splash', s.name);
    if (s.ad === 'banner') { for (const k of ['Content', 'fade']) f.findChild(n => n.name === k).y -= 64; const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 736; }
    t = f.clone(); SEC.appendChild(t); t.name = s.name + ' · No Ads';
    const ta = t.findChild(n => n.name.startsWith('Ad · ')); if (ta) { ta.remove(); for (const k of ['Content', 'fade']) t.findChild(n => n.name === k).y += 64; }
  } else if (s.type === 'inter' || s.type === 'native-full') {
    f = empty(s.type === 'native-full' ? s.name + ' - Native Full' : s.name);
    const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 0;
    if (s.ad === 'inter' || s.ad === 'app-open') a.setProperties({ 'Title#19:0': s.ad === 'app-open' ? 'App Open / Inter Ads' : (s.name.includes('Show bù') ? 'Inter Ads · Show bù' : 'Inter Ads'), 'Unit#19:1': s.name });
  } else if (s.type.startsWith('lang')) {
    const picked = s.type === 'lang-picked';
    f = cl(picked ? 'langS' : 'langD', s.name);
    const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 800 - a.height;
    const c = f.findChild(n => n.name === 'Content'); c.resize(360, a.y - c.y);
    const lf = f.findChild(n => n.name === 'list-fade'); lf.y = a.y - lf.height;
    if (picked) { t = cl('langS', s.name + ' · No Ads'); const tc = t.findChild(n => n.name === 'Content'); tc.resize(360, 800 - tc.y); const tl = t.findChild(n => n.name === 'list-fade'); tl.y = 800 - tl.height; }
    else t = cl('langN', s.name + ' · No Ads');
  } else if (s.type === 'loading' || s.type === 'all-set') {
    if (s.ad === 'none') { f = cl(s.type + 'N', s.name); t = f.clone(); SEC.appendChild(t); }
    else {
      f = cl(s.type, s.name);
      const a = adInst(s); f.appendChild(a); a.x = 0; a.y = 800 - a.height;
      const c = f.findChild(n => n.name === 'Content'); c.resize(360, a.y - c.y);
      const g = f.findChild(n => n.name === 'glow'); if (g) { const tc = base(B[s.type]).findChild(n => n.name === 'Content'); g.y += (c.height - tc.height) / 2; }
      t = cl(s.type + 'N', s.name + ' · No Ads');
    }
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
  f.x = COL(i); f.y = 304; r1.push(f.id);
  if (t) { t.x = COL(i); t.y = 1504; r2.push(t.id); }
}
let nx = 200;
for (const [head, lines] of NOTES) {
  if (!lines.length) continue;
  const n = figma.createFrame(); SEC.appendChild(n); n.name = 'Note · ' + head; n.layoutMode = 'VERTICAL'; n.itemSpacing = 12; n.paddingLeft = n.paddingRight = 32; n.paddingTop = n.paddingBottom = 28; n.cornerRadius = 16; n.fills = [h.solid('#FFE477')]; n.resize(1600, 100); n.primaryAxisSizingMode = 'AUTO'; n.counterAxisSizingMode = 'FIXED';
  T(n, head, 28, 'Bold', '#1A1A1A');
  for (const line of lines) { const x = T(n, '• ' + line, 22, 'Regular', '#1A1A1A'); x.lineHeight = { unit: 'PIXELS', value: 32 }; x.layoutSizingHorizontal = 'FILL'; }
  n.x = nx; n.y = 2404; nx += 1700;
}
return { sec: SEC.id, r1, r2 };
```

## Off-flow sub-section
Second `execute_code` call, after the main build (section height 4304):
- Nested section `Wireframe ngoài luồng <version> (không có trong sơ đồ)` at x 160, y 2720 in the version section, 1040 tall, fill `#3A3A3A`, its own `Row label · Ngoài luồng` text; frames at x `40 + i × 440`, y 120. No arrows, no row 2.
- Typed screens (`loading`, `all-set`, …) use the same archetype as in the main rows.
- `custom` screens: clone `SCR-07 · Onboarding · All Set · No Ads`, remove `glow` and every `Content` child except `title` / `subtitle` (they keep the app's type styles), set `Content` to top alignment (`primaryAxisAlignItems = 'MIN'`, padding top 56, gap 12), then add the wireframe's parts with the app's components: `Language item` (7:1036, `Language#7:3`, `Flag#7:6`) for option rows, `Button` (7:995, `Label#7:0`, `Style=Primary|Text`) for CTAs, clones of `subtitle` for captions, art from `Ads Kit · backgrounds` by name. Bottom CTA at y 724 (312 × 52, x 24); a Native ad sits right above it (`y = 724 − 12 − ad height`) or at the bottom when the screen has no CTA; resize `Content` to end above them. Copy comes from `rules.md` → "Custom screens".
