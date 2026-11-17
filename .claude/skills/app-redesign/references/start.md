# `/app-redesign start <redesign goal>`

Goal: understand the app completely, then show the user where it can go. **No variables, styles or components of the file are created or changed in this command**; it adds the pages `06 · Explore (WIP)` (if missing) and `Archive · Before redesign`, and draws 3 screens on Explore.

Resume rule: read `redesign/*/project.md` first. If a project for this file exists, continue from its `Status` line instead of starting over (no rescan when `inventory.baseline.json` exists).

## 1. Choose and confirm the working file ◆

Call `figma_status`, then:

| Situation | Do |
|---|---|
| No file connected (or bridge not listening) | Stop. Tell the user: open **the copy** in Figma desktop → Plugins → Development → figma-agent-UI → paste the token → Connect; say "xong" when done. Re-check on reply. |
| The goal names a file that is connected | Ask: *"Sửa trực tiếp trên file `<tên>`, đúng không?"* |
| The goal names a file that is not connected | Say it is not connected, list connected files; ask to open it or pick one of the list |
| No file named, 1 connected | Ask: *"Sửa trực tiếp trên file `<tên>` (đang mở page `<page>`), đúng không?"* |
| No file named, ≥ 2 connected | `AskUserQuestion`: *"Sửa trực tiếp trên file nào?"* — one option per file (name + current page) + "File khác, chưa mở" |
| `project.md` already names a file | Connected → use it without asking; not connected → ask the user to open that file |

Then ask once: *"File này là bản copy, không phải file gốc, đúng không?"* — the skill edits it in place. If `figma_status.versionCheck` warns, ask the user to reopen the plugin before scanning.

Create `redesign/<app-slug>/project.md` (template in `data-format.md`) with the file name, date, goal (verbatim) and `Status: start/1 file confirmed`.

## 2. Read the redesign goal

The text after `start` is free. Split it into five points and write them in `project.md` → *Redesign goal*:

| Point | Examples |
|---|---|
| Feel / style | modern, clean, cinematic, playful, glassmorphism, premium |
| Audience | Gen Z, parents, creators |
| Business goal | raise subscriptions, retention, fewer drop-offs in onboarding |
| References | image path, URL, app name, named style |
| Constraints | keep brand colour, dark only, keep illustrations, platform |

Missing points that change the result (feel, audience, references): ask up to 3 short questions in one `AskUserQuestion`. "Tùy bạn" → decide from the app itself and mark it *assumption* in the plan.

## 3. Baseline scan

1. Read `SKILL_DIR/scripts/scan.js`. Run it with `OPTIONS.mode = 'survey'` (no `savePath`): pages with screen counts and section names.
2. Pick the **screen pages** (pages holding the app's screens/flows; not cover, foundations, icons, components, junk like `RIP`/`Archive`). Unsure → ask with the survey list.
3. Run `mode: 'scan'`, `pages: [those pages]`, `savePath: <abs>/redesign/<app>/inventory.baseline.json`, `timeoutMs: 300000`. Very large files: scan page by page into `inventory.baseline.<n>.json` and merge the `screens`, `sections`, `connectors` arrays with a short Python one-off.
4. Export hero images for imagery work later: collect `images[].id` where `hero: true` from the inventory (Python), `export_assets{ids, format: "PNG", scales: [1], outDir: <abs>/redesign/<app>/images/source}`. Skip duplicates by hash.

## 4. Understand the functions

1. `python3 SKILL_DIR/scripts/analyze.py redesign/<app>/inventory.baseline.json` → `analysis.json`, `analysis.md`, `screen-map.json` (draft).
2. Review the draft — the script groups by text similarity; you decide:
   - families (one screen + states): merge or split where the script is wrong; give each state a clear name (`Default`, `Filled`, `Loading`, `Toast · Empty photo`…);
   - archetypes (`archetypes.md`): fix misclassified ones; check the **mandatory states** of each archetype and list the ones the baseline itself lacks (do not invent them; propose them in the plan);
   - flows: one section of the baseline = one flow `FL-NN`; reorder by the user journey (splash/onboarding first, settings last); a section mixing functions → propose a split;
   - edges: connectors and prototype links; where none exist, read the order of frames and the CTA labels.
3. Look at the baseline: one `screenshot` per flow section (scale small) and the main screens. Note the diagnosis (`archetypes.md` §3).
4. Edit `screen-map.json` by hand (codes, proposed names, `flow`). Keep it the single source of truth for names.

## 5. Research the directions

1. Measure the current style (colours, type, radius, density, imagery) from screenshots and `get_design_system`.
2. With a reference image or named style: run **style-direction** to decode its DNA.
3. Propose 2–3 directions scored against the goal: **A** follows the goal literally, **B** safer, **C** bolder. For each: palette (hex), type pair, radius/elevation, imagery treatment, CTA look, what it fixes from the diagnosis, risk.
4. Write `redesign/<app>/plan.md` from `plan-template.md` (in the user's language).

## 6. Three main screens ◆

1. Pick 3 screens that carry the app: usually **Home**, the **core creation/setup** screen, and the **Paywall** (else the most-used screen per archetype).
2. On `06 · Explore (WIP)` create a Section `Direction A · <name>` and build the 3 screens with figma-ui-flow's build loop (Sketch mode): same content and functions as the baseline frames; local colours and text (no variables/styles/components created), auto layout, real copy.
3. Images: generate the needed hero images **from the baseline image as reference** (`imagery.md`), one at a time.
4. Directions B/C: one screen each (Home) or a moodboard frame, to compare.
5. Screenshot the 3 screens, show them with the plan summary, ask the user to pick/adjust. Update `project.md` `Status: start/done — direction <X> approved` only after the user says so.

Next command: `/app-redesign build`.
