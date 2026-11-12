# File standards, naming and layout

## Contents
1. File and page structure
2. Naming rules
3. Auto Layout — mandatory standard
4. Frame sizes and layout grids by platform
5. Sections, status and versions
6. File hygiene

---

## 1. File and page structure

### 1.1 Splitting files
| File type | Contains | Who edits |
|---|---|---|
| `[Brand] Foundations` | Variables, styles, icons, brand imagery | Design system owner |
| `[Brand] Components` | Component library, published as a Library | Design system owner |
| `[Product] – [Feature]` | Screens, flows, prototype for one feature | Feature designer |
| `[Product] – Explorations` | Free-form ideas, never used as a source of truth | Anyone |

Small projects (one person, one app) may merge Foundations + Components into the product file, but still keep separate pages.

### 1.2 Standard page order (default for every new file)
```
🏠 Cover                 cover frame + the Brief frame
01 · Foundations         one `Foundations` frame: swatches, type specimen, spacing, radius, elevation
02 · Components          main components + Playground
03 · Templates           reusable screen templates and content packs, cloned to start new screens
04 · Assets              images, illustrations, icons, stickers, backgrounds
05 · Screens & Flows     one Section per screen, the flow overview, adaptive layouts, prototype wiring
06 · Explore (WIP)       directions, moodboards, drafts, stress tests, and the Archive sections
```
- Page names are exact: two-digit number, ` · ` (space, middle dot, space), title. Only Cover has an emoji and no number. `manage_pages{template: true}` creates exactly these 7 pages.
- A page still being worked out keeps the `(WIP)` suffix; drop it when the page is stable (Explore keeps it for good).
- Need another page? Add the next number (`07 · Prototype`, `08 · Handoff`…); never renumber existing pages.
- There is no Brief, Prototype, Ready or Archive page: the brief is a frame on Cover, prototype wiring lives on the screens in `05`, "Ready" is the Dev Mode status of a screen Section, and rejected work goes to an `Archive · …` Section in `06`.

### 1.3 Cover
One frame `Cover · <Product>` on `🏠 Cover`, built from `assets/cover.render-tree.json` (team standard): 3840×2160, black `#070707`, blurred colour glows, a huge title, a divider, an info row. Render it with `render_tree{tree}` (no `parentId`), then replace only these parts:

| Part (layer path) | Replace with | Rule |
|---|---|---|
| `Title/Text` | `<PRODUCT> (<PHASE>)`, e.g. `HOME AI (F3)` | Anton 600, uppercase look; ≤ 12 characters fits one line — longer: lower `fontSize` (keep `lineHeight` ≈ 0.65 × size) |
| `Info/Meta/Team/Value` | `<BU>: <lead>` | one line |
| `Info/Meta/Dev/Value` | developer name(s) | one line |
| `Info/Meta/Owner/Value` | product owner | one line |
| `Info/Meta/Timeline/Value` | `Start: DD/MM - End: DD/MM/YYYY` | one line |
| `Info/Badges/Type` | variant `Type`: `figma` / `figjam` | the file type |
| `Info/Badges/Progress` | variant `Process`: `in progress` / `review` / `pending` / `approved` (shows COMPLETED) / `update` / `maintain` / `suspened` | change the variant when the status changes; never edit the badge text |
| frame name | `Cover · <Product>` | |

Everything else (background, `decor/…` glows, fonts, sizes, divider, spacing) stays as in the template. Labels (`Team`, `Dev`, `Owner`, `Timeline`) stay in English.

- Badges are instances of the team's `Type` and `Progress` components. If the file can't resolve them (render fails with "No published component"), enable the team library or copy the two component sets into the file, then render again; as a last resort draw pills: radius 120, padding 24/32, Open Sans Bold 36 uppercase, fills `Gradient/Orange` `#FB9847→#FE6321` (in progress), `Gradient/Green` `#5DDD5E→#1F7E23` (approved), radial.
- Pick the cover with **Set as thumbnail** (right-click the frame) so the file browser shows it.
- The `Brief · <Product>` frame sits to the right of the cover, not inside it.

## 2. Naming rules

### 2.1 General
- Use `/` to create hierarchy: Figma groups them automatically in the picker (`color/text/primary`, `Button/Primary`).
- Lowercase + hyphens for tokens: `color/surface/raised`, `space/4`.
- Title Case for components and properties: `List Row`, `State=Pressed`.
- English for technical names (tokens, components, layers) to match code; other languages may be used for content, descriptions and annotations.

### 2.2 Sections and screens
Every top-level item on a page is a Section (or the single `Cover`/`Foundations` frame). Parts are joined with ` · `.

| Where | Name | Example |
|---|---|---|
| `05` one Section per screen | `SCR-NN · <Screen>` | `SCR-08 · Paywall` |
| screen frame inside it | `SCR-NN · <Screen> · <State>[ · <Theme>]` | `SCR-08 · Paywall · Default · Dark`, `SCR-09 · Home · Empty` |
| feedback frame (alert, sheet, toast, result triggered by an event) | `FBK-NN · <Screen> · <Event>` | `FBK-06 · Paywall · Purchase Failed` |
| flow overview Section (§2.2.1) | `Flow · <Product>`, thumbnails `flow/SCR-NN · <Screen>`, text flow `flow/text` | `Flow · Lumen` |
| other device sizes | `Adaptive · <Device>[ · <Group>]` | `Adaptive · iPad`, `Adaptive · iPhone Duo · Onboarding` |
| `02` component library | `<Product> · Components — <what is inside>` | `Lumen · Components — icons, buttons, chips` |
| `03` / `04` groups | `<emoji> <Group> · <Kind>` (🧩 templates, 🖼 images) | `🧩 Content Packs · Templates`, `🖼 Wallpapers & Backgrounds` |
| `06` exploration / archive | `Explore · <Topic>`, `Archive · <What and why>` | `Explore · Tab screens redesign`, `Archive · pre-v2 defaults` |

- **Numbers:** `SCR` numbers follow the main flow order (two digits, `SCR-01` first); `FBK` numbers count separately across the whole product. A number is never reused or renumbered — a new screen takes the next free number even if it sits earlier in the flow.
- **State:** Title Case, short: `Default`, `Empty`, `Loading`, `Error`, `Largest Text`, `Filter Empty`. `Default` is always the first frame.
- **Theme suffix** ` · Light` / ` · Dark` only when the brief's theme is **Both**; a single-theme project leaves it off.
- **Layout inside a screen Section:** `Default` top-left, states to the right in reading order, 80 px gaps; feedback frames after the states; the second theme (Both) on the row below its source.

### 2.2.1 Flow overview (`Flow · <Product>`)
One Section at the top of `05 · Screens & Flows`, above the screen Sections. It holds two views of the same flow:

1. **Thumbnails + arrows** for people: a row of scaled copies `flow/SCR-NN · <Screen>` (scale 0.4, label above each) in main-flow order, joined by `flow/arrow N→M` vectors. Arrows are static drawings: they don't follow moved thumbnails.
2. **Text flow** for people and agents: one text layer `flow/text`, monospace, **one transition per line**:

```text
FL-01 Onboarding · FL-02 Make a wallpaper

FL-01.E01  ENTRY:first-launch --[replace]--> SCR-01 Welcome @5:1598
FL-01.E02  SCR-01 @5:1598 --[push: Get started]--> SCR-02 @5:1599
FL-01.E03  SCR-02 @5:1599 --[pop: back]--> SCR-01 @5:1598
FL-02.E01  SCR-10 @5:1607 --[modal-full: New]--> SCR-11 @5:1608
```

Rules for the text flow:
- Line = `FL-NN.Exx  FROM @id --[nav: action]--> TO @id`. First line lists the flows `FL-NN <Name>`; `Exx` numbers the edges inside a flow.
- Ends are screen codes `SCR-NN` (or `FBK-NN`) + `@<id>` of that screen's Section (from `render_tree`); the entry edge uses `ENTRY:<trigger>` and names its target (`SCR-01 Welcome @id`). Never `back` or free text as an end.
- `@id` makes a line actionable: `select_nodes`, `get_node`, `screenshot`, or `set_interactions` `destination`. Fill ids once the Sections exist; if a Section is recreated, re-resolve by name `SCR-NN · …` (`find_nodes`) and replace it on every line.
- `nav` is `push | pop | replace | modal | modal-full | dismiss`; `action` is the visible label or gesture (`Save`, `Tab Stats`, `Swipe left`, `back`), 1:1 with a prototype reaction. A condition may follow in the label (`iOS`, `denied (FBK-05)`).
- List every transition, including returns; group by flow, then by FROM screen in order. The text is the source of truth: update it with every screen or transition change and build the prototype from it.

Read it with `get_node{ids: [<flow/text id>]}` (full text up to 5000 characters; `find_nodes` shows only the first 80): split on newlines, and check the line count equals the layer height ÷ line height. Icon-only actions use their glyph or label (`[+]`, `[‹ Today]`). On `06 · Explore` the same Section works for an exploration; set `x`/`y` on the Section.

Draw it from `assets/flow.render-tree.json` (`render_tree{tree}` on `05`, replace `<Product>` and the lines). Thumbnails and arrows need `execute_code` (`clone` → `rescale(0.4)` into the Section, then vectors with `strokeCap: "ARROW_LINES"` on the end vertex).

### 2.3 Inner layers
| Type | Name | Example |
|---|---|---|
| Layout region | functional noun | `header`, `content`, `footer`, `actions` |
| Text | role | `title`, `subtitle`, `body`, `label`, `caption` |
| Icon | `icon/<name>` | `icon/chevron-right` |
| Image | `image/<content>` | `image/avatar` |
| Free decoration | `decor/<description>` | `decor/blob-top` |
| Overlay | `overlay/<description>` | `overlay/scrim` |

Layer names should match the variable/property names dev will use — this makes Dev Mode and Code Connect easier to read.

### 2.4 Forbidden
`Frame 123`, `Group 4`, `Rectangle 9`, `Copy`, `Final`, `Final-final-v2`, dates in layer names.

## 3. Auto Layout — mandatory standard

### 3.1 When
- **Yes:** every content container — buttons, cards, lists, forms, nav, the entire screen.
- **No:** illustrations, decorative layers, intentional absolute positioning (a corner badge → use "Ignore auto layout"/absolute position inside the Auto Layout frame).

### 3.2 Sizing behavior
| Setting | Use when |
|---|---|
| **Hug** | Size follows content: button, chip, tag |
| **Fill** | Fills the parent: text in a card, row in a list, input in a form |
| **Fixed** | Only with a real reason: 24×24 icon, avatar, device frame |

Rule of thumb: **parent Fixed or Fill, child Fill or Hug.** Long text set to Fill + auto height so it wraps.

### 3.3 Spacing
- `gap` and `padding` always bind to spacing variables (4/8 scale: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- Use **gap** between elements and **padding** for inner edges — never insert transparent rectangles as spacers.
- `Space between` for navigation bars and headers with two ends.
- Min/max width for long reading text (≈ 45–75 characters per line on web) and for flexible components.
- Wrap for chips and tags; Grid layout (if your Figma version has it) for card grids.

### 3.4 Nesting
Don't nest deeper than necessary: if a frame has only one child and no padding/fill/stroke of its own, remove it. Typical depth for a screen: 4–6 levels.

### 3.5 Testing
Stretch the screen width 320 → 430 (mobile) or 1280 → 1920 (web): no overlaps, no clipped text, spacing stays intact.

## 4. Frame sizes and layout grids by platform

### 4.1 Mobile and tablet — one frame each
| Frame | `render_tree` | Size | Grid | Safe area (top / bottom) | Also test |
|---|---|---|---|---|---|
| Mobile (iOS + Android) | `device: "mobile"` | 393 × 852 | 4 columns, margin 16, gutter 16 | 59 / 34 | 375 (small), 412 (Android), 440 (Pro Max) |
| Tablet (iPad + Android tablet) | `device: "tablet"` | 834 × 1194, landscape 1194 × 834 | 8 columns, margin 32, gutter 24 | 24 / 20 | 744 (iPad mini), 1024 (13") |

Every screen frame starts from one of these two; other sizes are only stress tests (`device` + `width`), named `Adaptive · <Device>`. 834 sits in Android's medium width class (600–839 dp) and 1194 in expanded (840–1199 dp).

Respect safe areas: status bar, Dynamic Island, home indicator (iOS); status bar, gesture bar (Android). Use device frames/safe-area frames as reference layers and don't draw content over them.

### 4.2 Web
| Breakpoint | Frame | Grid |
|---|---|---|
| Desktop | 1280 / 1440 | 12 columns, max content 1120–1200, gutter 24 |
| Wide | 1920 | 12 columns, content doesn't stretch indefinitely — has a max width |

> Device sizes change with each hardware generation. When a project targets specific devices, re-check the current dimensions.

### 4.3 Screen templates (`assets/frames/`)
Pass 1 of every screen starts from a JSON skeleton, not from scratch: `assets/frames/<device>.render-tree.json` (`mobile`, `tablet`, `duo-outer`, `duo-inner`). Each holds the root frame (`SCR-NN · <Screen> · <Device>`), the named regions and tinted placeholder blocks. Render it with `render_tree{tree}` (set `x`/`y`), rename the frame, then resize or replace the blocks.

Adding a device or web breakpoint = adding one file, no code change:
- With a preset (`device` in `render_tree`): set `device` and let the preset draw size, grid and system overlays.
- Without a preset (e.g. `web-1440.render-tree.json`): give the root an explicit `width`/`height` and `layoutGrids` per §4.2.
- Keep the region names (`Header`, `Content`, `Footer`, `Block · …`) so the build loop addresses them the same way. `tests/frame-templates.test.ts` validates every file in the folder against the `render_tree` schema.

### 4.4 Grid
- Save layout grids as shared **styles** (`grid/mobile`, `grid/desktop`).
- A 4pt baseline grid on mobile keeps text aligned; optional for web.

## 5. Sections, status and versions

- One **Section per screen** on `05 · Screens & Flows` (`SCR-NN · <Screen>`, §2.2). Mark "Ready for dev" per screen Section in Dev Mode — there is no Ready page.
- Status labels on the canvas (component or sticky): `🟡 WIP`, `🔵 In review`, `🟢 Approved`, `🔴 Needs changes`.
- **Versions:** save versions manually (Save to version history) at each milestone: before a major direction change, after each review gate, before publishing the library. Version name: `v1.2 – Add dark mode to Settings`.
- **Branching** (if your plan has it): every major change to a library file goes through a branch + review before merging.

## 6. File hygiene

Before every presentation or handoff:
1. Delete unused hidden layers, empty text layers, and loose frames/instances sitting outside any Section (they collect at 0,0); experimental work belongs in `06 · Explore (WIP)`.
2. No default names left (run `audit_design` then `rename_by_rule`, or a rename plugin).
3. No orphaned styles/variables (defined but unused) — or note the reason for keeping them.
4. Detach instances only when unavoidable and record why; detached instances are design debt.
5. Heavy images: compress before inserting; illustrations use real images or placeholders with the correct aspect ratio.
6. Tidy canvas: screens laid out in an aligned grid with even spacing (e.g. 200px between screens, 400px between Sections).
