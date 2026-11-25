# `/app-redesign start <redesign goal> [L1|L2|L3|L4] [section link]`

Goal: understand the app completely, then show the user where it can go — usually a **sibling app**: same functions, read as another product (`questions.md`). **No variables, styles or components of the file are created or changed in this command**; it adds the pages `06 · Explore (WIP)` (if missing) and `Archive · Before redesign`, and draws 3 screens on Explore.

Resume rule: read `redesign/*/project.md` first. If a project for this file exists, continue from its `Status` line instead of starting over (no rescan when `inventory.baseline.json` exists).

Section link in the text: after §1, resolve it (`section-link.md` §1–2). A link into the working file is the **scope**, not a reference: no project yet → pilot start on that flow (`section-link.md` §3); project exists → `section-link.md` §3–4, then `build` that flow.

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

The text after `start` is free; a trailing `L1`–`L4` is the change level. Split the rest into five points and write them in `project.md` → *Redesign goal*:

| Point | Examples |
|---|---|
| Feel / style | modern, clean, cinematic, playful, glassmorphism, premium |
| Audience | Gen Z, parents, creators |
| Business goal | raise subscriptions, retention, fewer drop-offs in onboarding |
| References | image path, URL of another file, app name, named style (a link into the working file is a scope, `section-link.md`) |
| Constraints | keep brand colour, dark only, keep illustrations, platform |

Do not ask here. Missing points are answered by the self-questions (`questions.md` §1) and marked *assumption*; the only questions of `start` are the 4 of §5.5. Write `Purpose: sibling | refresh` (`questions.md`, intro): a goal that does not ask to fix or keep the same app → sibling.

**Change level** (`levels.md` §2): explicit `L1`–`L4` wins; otherwise infer it from the goal, default **L3** for a sibling (**L2** for a refresh), and mark it *assumption*. A goal that mixes areas ("đổi màu toàn app, làm lại Onboarding") gets a project level plus per-flow overrides. Write `Level:` in `project.md`; the level is confirmed in §5.5 (question 2), not asked separately here.

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
   - flows: one section of the baseline = one flow `FL-NN` (files without Sections: `analyze.py` uses the wide title frames — meta, ≥ 1000 px, with text — as sections for the screens below them on the same page); reorder by the user journey (splash/onboarding first, settings last); a section mixing functions → propose a split;
   - edges: connectors and prototype links; where none exist, read the order of frames and the CTA labels.
3. Look at the baseline: one `screenshot` per flow section (scale small) and the main screens. Note the diagnosis (`archetypes.md` §3).
4. Edit `screen-map.json` by hand (codes, proposed names, `flow`). Keep it the single source of truth for names.

## 5. Research the directions

1. Measure the current style on the 10 axes of `questions.md` §2 (colour family, theme, type, shape, material, image style, layout, navigation, icons, copy tone) from screenshots, `get_node` and `get_design_system`. Read `project.md` → *Released siblings*.
2. With a reference image or named style: run **style-direction** to decode its DNA.
3. Answer the self-questions (`questions.md` §1) and fill the distance table (§2): sibling → every direction differs from the original on ≥ 6/10 axes, always colour family, image style and layout, and from each released sibling.
4. Propose 3 directions scored against the goal, **all inside the chosen level** (`levels.md` §3: at L1 they differ in palette and type only, at L2 in components and imagery on the same layouts, at L3 in layouts — each clearing the minimum bar of `levels.md` §1.1 and differing in their structural moves, at L4 in concept): **A** follows the goal literally, **B** safer, **C** bolder. A direction that needs a higher level is shown as a note ("needs L3"), not drawn. For each: evocative name, 3 feeling words with a "not" pole, palette (hex), type pair, radius/elevation, material, imagery style, navigation, signature move, axes changed vs the original, risk.
5. Write `redesign/<app>/plan.md` from `plan-template.md` (in the user's language).

## 5.5 Ask the user — 4 questions at most ◆

Nothing is drawn or generated before this. Show a short summary in the chat (what the app does, the original on the 10 axes, the 3 directions in one line each, the assumptions), then one `AskUserQuestion` with the questions of `questions.md` §3: **direction (A/B/C with previews) · level · theme · image style**. Leave out a question the goal already answers. Stop until the user answers.

Write the answers in `project.md` → *Answers* / *Decisions* and `plan.md` §1, §4; `Level:` and the direction lose their *assumption* mark. `Status: start/answered — level <Ln>, direction <X>`.

## 6. Three main screens ◆

1. Pick 3 screens that carry the app: usually **Home**, the **core creation/setup** screen, and the **Paywall** (else the most-used screen per archetype).
2. On `06 · Explore (WIP)` create a Section `Direction <X> · <name>` for the chosen direction only and build the 3 screens with figma-ui-flow's build loop (Sketch mode): same content and functions as the baseline frames; local colours and text (no variables/styles/components created), auto layout, real copy. **L1**: clone the 3 baseline frames into the section and recolour them (fills, text styles, radius, effects only). **L2**: rebuild on each baseline frame's skeleton (same blocks, same order). **L3/L4**: rebuild freely (L3: each screen clears `levels.md` §1.1; write its moves under the screen, e.g. `S2 · S3 · P1 · P2`); at L4 put a short IA note (merged/split screens, moved entry points) beside the screens.
3. Images: L1 keeps the baseline images. L2–L4: generate the needed hero images **from the baseline image as reference** (`imagery.md`, treatment of the level), one at a time.
4. The other directions are not drawn; they stay in `plan.md` §4 as rejected, with the reason.
5. Screenshot the 3 screens next to their baseline frames (silhouette test of `questions.md` §2), show them with the plan summary and the distance table, ask the user to approve or adjust. No new questions here beyond "approve / adjust"; a change of level or direction redraws the main screens. Update `project.md` `Status: start/done — level <Ln>, direction <X> approved` only after the user says so.

Next command: `/app-redesign build`.
