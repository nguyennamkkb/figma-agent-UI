# Read sheet — one per screen, written before the screen is drawn

The sheet is the plan the `render_tree` follows. Four parts, short lines, no prose. Shared parts (tokens, components, image style block) are written once for the set and referenced from each sheet.

## 1. Template

```text
SCR-NN · <name>                     picture width <w> → 393 (×<f>)

FUNCTION
  purpose      what the user comes here for (one line)
  main action  the one thing to tap; where it sits
  hierarchy    1st / 2nd / 3rd thing the eye reads
  real data    numbers, names, states that must stay meaningful
  repeated     blocks that repeat here or on other screens → component

LAYOUT TREE  (frame: VERTICAL, padding T R B L, gap)
  Region            dir  gap  padding      width / height     notes
  ├ Header          H    AUTO  0           FILL / HUG         SPACE_BETWEEN
  ├ …
  absolute         nodes that overlap or break a frame, with x/y
  overflow         rows that run past the edge (clip: false)
  scroll           the region that would scroll in the app
  column           T + blocks + gaps + B = <sum> ≤ 852

TOKENS  (estimated)
  bg / surface / surface-2 / text / text-2 / accent / accent-2   hex each
  type             family; sizes title / section / body / caption, weights
  radius           card / chip / button
  shadow           only if visible

IMAGES
  IMG-NN  slot w×h · role (why it is here) · subject · emotion · light · palette · material · angle
  style block      → shared, one paragraph (see §3)

INVENTED / UNREADABLE
  what the picture did not show or could not be read
```

## 2. Worked example — SCR-01 · Gamified Savings (built on the baby-tracker file, node `52:5438`)

```text
SCR-01 · Gamified Savings           picture 315 → 393 (×1.25)

FUNCTION
  purpose      see saving progress as a game: level, today's mission, badges, best record
  main action  the mission card (accept / Skip); badges "Show more" second
  hierarchy    level badge + XP → mission → badges → record
  real data    level number, XP bar, "$10" mission amount, badge names, record value
  repeated     round icon button (Back, Filter, Open) · badge tile ×3 · grey card (Mission, Record)

LAYOUT TREE  (frame 393×852: VERTICAL, padding 56 24 32 24, gap 24, radius 48, clip)
  Region            dir  gap   padding        width / height   notes
  ├ Header          H    AUTO  0              FILL / HUG       Back 56 ○ · Filter 56 ○, SPACE_BETWEEN
  ├ Title           text                      HUG              DM Sans Bold 28, -1 %
  ├ Level           H    20    0              FILL / HUG       badge 112 ○ (image) + info VERTICAL gap 12 FILL
  ├ Divider         rect                      FILL / 1
  ├ Mission         H    10    16 14          FILL / HUG       latte 50×42 FIT · text VERTICAL gap 4 FILL · Skip chip HUG
  ├ Badges header   H    AUTO  0              FILL / HUG       "Your Badges" SemiBold 18 · Show more H gap 8
  ├ Badges          H    AUTO  0              FILL / HUG       3 tiles 108 wide, VERTICAL gap 8, align CENTER
  └ Record          H    16    16             FILL / HUG       trophy circle 100 ○ · text VERTICAL gap 6 FILL
  absolute         Record/Open 40 ○ at top-right (x 289, y 16)
  overflow         none
  scroll           whole content below Header
  column           56 + 56+36+112+1+74+28+143+132 + 7×24 + 32 = 838 ≤ 852

TOKENS  (estimated)
  bg #FFFFFF · surface #F4F5F7 · button #F2F4F1 · chip #E8E9EE · divider #EFEFEF
  text #141414 · text-2 grey · trophy plate #EFEBDC
  type DM Sans; 28 Bold / 18 SemiBold / 14–15 body / 12 caption
  radius card 22–26 · buttons and chips 999 · screen 48
  shadow screen only: #6B4FA0 12 %, y 24, blur 60

IMAGES
  IMG-01  112×112 · level badge, the reward the screen is about · shield with number · proud, playful · soft top light · warm purple + gold · glossy 3D toy · front
  IMG-02  50×42 · mission object, makes "coffee" readable at a glance · latte cup · cosy · soft · cream + brown · same 3D · ¾ view
  IMG-03…05  badge tiles · cup, piggy bank, grocery bag medals · collectible · same light and material
  IMG-06  trophy in the record circle · achievement · gold
  style block      one paragraph shared by IMG-01…06 (§3)

INVENTED / UNREADABLE
  mission sub-copy rewritten (too small in the shot); status bar left out
```

Notes that came from this build: the mission line wrapped onto two lines at 14 px, fixed by 12 px and tighter padding — check long single-line copy against its real width in the sheet, not after the render.

## 3. Image style block — from emotion to prompt

Write it once for the set, from what the images in the picture make the user feel, then the craft that produces that feeling:

```text
<material> <subject type> for a <app category> app, <emotion words: 2–3>, <light: direction + softness>,
<palette: 3–5 hex from the picture>, <shape language: rounded / chunky / thin>, <detail level>,
<camera: front / ¾ / top>, centred, no text, no logo, plain <key colour> background
```

Example (the set above): `glossy 3D toy-like icon for a savings game app, proud and playful, soft top-left light with a gentle rim, palette #7B5CFA #F5C24B #FFFFFF #2B2B2B, chunky rounded shapes, medium detail, ¾ view, centred, no text, no logo, plain green background`.

Per image, append only the subject and its role-specific detail. Emotion words come first in the reading ("why is this image here, what should the user feel"), the craft words follow from them; a "cosy" latte gets warm soft light and steam, a "proud" badge gets a rim light and a shine.
