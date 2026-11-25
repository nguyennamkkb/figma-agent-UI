---
name: app-redesign
description: Redesign the UI of an existing app in Figma without changing what it does — usually a sibling app that must read as another product, to publish one more app with the same functions. The user duplicates the original file, the agent works only in that confirmed copy, takes a baseline scan before any edit, understands every screen, state and flow, answers its own self-questions (distance from the original on 10 axes), asks the user at most 4 questions (direction A/B/C, level, light/dark, image style) before drawing anything, then shows 3 main screens to approve, then rebuilds flow by flow at a chosen change level (L1 reskin, L2 refresh, L3 recompose, L4 new in style) and proves nothing was lost (screens, states, links, ads, CTA classes, hero images). Three commands only — `/app-redesign start <redesign goal> [L1|L2|L3|L4] [section link]`, `/app-redesign build [FL-NN|section link] [L1–L4]`, `/app-redesign audit [FL-NN|section link]`; a Figma section link runs that one flow alone (a pilot), and when other flows were already redesigned the agent asks whether to follow the same way or try another. Use when the user wants to clone, reskin, restyle, modernise or "làm lại giao diện" an app/project while keeping its functions, says "redesign app này", "clone dự án", "thiết kế lại UI giữ chức năng", "làm lại từng luồng", "kiểm tra bản redesign có thiếu gì", or names one of the three commands. Screen building follows figma-ui-flow, styles style-direction, images asset-generator, ads ads-board, tool mechanics figma-agent-tools.
---

# app-redesign — new UI, same functions

The product keeps every function; only the look changes. Usually the goal is a **sibling app**: the original is not bad, the user needs a version that reads as another product to publish one more app, so the look moves far from the original (`references/questions.md`). A goal that asks to fix or keep the same app is a **refresh**. Three layers decide what may move:

| Layer | Contains | Rule |
|---|---|---|
| **Function** | screens, states (empty / filled / loading / error / success), flows, conditions (Pro, coins, permissions), ad placements | **Locked** — the redesign must carry all of it |
| **Content** | copy, sample data, kind of image, icons | Keep the meaning; may be rewritten for clarity, typos fixed (log rewrites in `copyMap`) |
| **Look** | tokens, components, layout, imagery, effects | Free, within the approved direction **and the change level** |

How far the Look may move is the **change level**, set in `start` and confirmed with the direction (`references/levels.md`):

| Level | Changes | Kept |
|---|---|---|
| **L1** Reskin | colours, type, radius, effects; restyled in place | layout, components' structure, images |
| **L2** Refresh (default for a refresh) | + components, icons, imagery (minimum change), copy clarity | layout and block order |
| **L3** Recompose (default for a sibling) | + block order, grouping, hierarchy, in-screen navigation; each master ≥ 3 layout moves incl. 1 structural (`levels.md` §1.1) | screens, states, flows |
| **L4** New in style | + information architecture (merge/split screens), art direction | functions only |

A flow may run at another level than the project (`build FL-NN L1`).

Two items have mandatory rules: **hero/onboarding images are regenerated from the original image as reference** (`references/imagery.md`), and **every CTA is a component instance of the right class; only Purchase carries the two diagonal bands** (`references/cta-rules.md`).

Let `SKILL_DIR` be this folder. Answer the user in their language (Vietnamese when they write Vietnamese).

## 1. Hard rules

1. **One working file, confirmed first.** The user duplicates their original; the agent never connects to or edits the original. Before the first write of a project, ask which open file to edit and confirm it is the copy (`references/start.md` §1). Every figma-agent call passes `file: "<confirmed name>"`.
2. **Baseline before edits.** The first `start` scans the working file untouched → `inventory.baseline.json`. The baseline stands in for the original in every comparison; never overwrite it.
3. **Nothing is deleted while a flow is open.** Replaced screens (L2–L4) move to the page `Archive · Before redesign`; only `audit` (handoff, with the user's yes) clears it. L1 restyles frames in place: the copy file and the baseline scan are the way back.
4. **Stay inside the level.** A change above the flow's level (a reordered block at L2, a replaced image at L1) is reverted or the user raises the level for that flow.
5. **Functions are not added or dropped silently.** A screen/state the redesign does not need is marked `dropped` in `screen-map.json` with the user's reason.
6. **Approval gates (◆) stop the command.** Do not continue past a gate in the same turn.
7. **Ask before drawing, at most 4 questions.** After the analysis, answer the self-questions yourself, then one `AskUserQuestion` with at most 4 questions (direction, level, theme, image style — `references/questions.md`) before any frame or image is made. A sibling keeps nothing visual of the original by default and differs from it on ≥ 6 of 10 axes.
8. **A section link = that flow alone.** Resolve it to `FL-NN` and say it back; before writing, if any flow was already redesigned, ask whether this flow follows the same way or another (`references/section-link.md`). Another way is a trial on Explore that never touches what the edited flows use.
9. Scans are read-only `execute_code` runs with `savePath`: the JSON goes to disk, never through the conversation.

## 2. Project folder (in the repo, outside this skill)

```
redesign/<app-slug>/
  project.md                 working file, redesign goal, decisions, status per flow   (template: references/data-format.md)
  inventory.baseline.json    scan.js before any edit
  inventory.current.json     scan.js after each build / audit
  analysis.json · analysis.md   analyze.py
  screen-map.json            baseline screen → code/name → current node, status
  image-map.json             source image → new image, approved
  images/source/  images/new/
  plan.md                    the redesign plan the user approves (references/plan-template.md)
  parity.json · parity-report.md   parity.py
```

`<app-slug>` = kebab-case of the app name (ask if the file name is unclear). Use absolute paths in tool calls.

## 3. The three commands

| Command | Does | Writes to Figma | Ends at |
|---|---|---|---|
| `/app-redesign start <redesign goal> [L1–L4] [section link]` | confirm the file → baseline scan → understand functions → self-questions + distance table → 3 directions on paper → **4 questions ◆** → `plan.md` → **3 main screens** of the chosen direction on page `06 · Explore (WIP)` (local values; no variables, styles or components touched) | Explore + Archive pages only | ◆ user approves the level, a direction and the plan |
| `/app-redesign build [FL-NN\|section link] [L1–L4]` | first run: foundations (variables, text styles, components, full `Button` set) · then one flow at its level: images ◆ (L2–L4) → L1 restyle in place / L2–L4 rebuild screens in place (old → Archive) → links → self-audit → report | yes | ◆ user approves the flow |
| `/app-redesign audit [FL-NN\|section link]` | progress → rescan → parity vs baseline (screens, states, links, ads, CTA, images) → `audit_design` + `stress_test` → report → fix on yes → handoff when every flow passes | only after the user says yes | report / ◆ handoff |

No argument: `build` takes the next flow of `plan.md` at the level written for it, `audit` checks the whole file. A level after `build FL-NN` overrides that flow's level (recorded in `project.md`). Re-running `start` resumes where it stopped (no rescan if the baseline exists). A Figma section link in place of `FL-NN` (or in the `start` text) scopes the command to that flow: pilot start, one-flow build or audit (`references/section-link.md`).

Vietnamese phrasings: "chỉ đổi màu" → level L1, "giữ bố cục" → L2, "sắp xếp lại" → L3, "làm như app mới" → L4, "app anh em", "đẩy thêm 1 app" → sibling (L3); "bắt đầu redesign", "phân tích dự án", "đề xuất hướng mới" → `start`; "vẽ lại FL-03", "làm luồng tiếp" → `build`; "thử luồng này trước", "làm riêng section này" + link → section link (`references/section-link.md`); "kiểm tra", "so với bản gốc", "còn thiếu gì", "đang tới đâu", "bàn giao" → `audit`.

## 4. Where the details are

| Need | Read |
|---|---|
| Sibling vs refresh, self-questions, the 10-axis distance table, the 4 user questions | `references/questions.md` |
| Change levels L1–L4: what each keeps and changes, picking the level from the goal, effect on every step | `references/levels.md` |
| A section link: resolve it to a flow, pilot / one-flow scope, ask "same way or another" when flows were already edited, trial | `references/section-link.md` |
| `start` step by step: file choice, goal parsing, level, baseline, analysis, directions, 3 main screens | `references/start.md` |
| `build` step by step: foundations, per-flow loop, archive, links, screen-map upkeep | `references/build.md` |
| `audit` step by step: rescan, verdicts, CTA/image codes, fixing, handoff | `references/audit.md` |
| Files and JSON formats, `project.md` template | `references/data-format.md` |
| Screen archetypes, mandatory states, diagnosis checklist | `references/archetypes.md` |
| Hero/onboarding images from the source image | `references/imagery.md` |
| CTA classes, effects, checks | `references/cta-rules.md` (recipes: `figma-ui-flow/references/cta-playbook.md`) |
| The plan document the user approves | `references/plan-template.md` |
| Scripts | `scripts/scan.js` (inside Figma), `scripts/analyze.py`, `scripts/parity.py` |

## 5. Scripts

```
execute_code{ file, code: <scan.js with OPTIONS edited>, savePath: "<abs>/redesign/<app>/inventory.baseline.json", timeoutMs: 300000 }
python3 SKILL_DIR/scripts/analyze.py redesign/<app>/inventory.baseline.json
python3 SKILL_DIR/scripts/parity.py redesign/<app>/inventory.baseline.json redesign/<app>/inventory.current.json --map redesign/<app>/screen-map.json --images redesign/<app>/image-map.json [--flow FL-03] [--level L1]
```

`scan.js`: read the file, edit only the first line (`OPTIONS`): `mode: 'survey'` lists pages with screen counts (small, no `savePath` needed); `mode: 'scan'` with `pages: ['<page name>', …]` writes the inventory. The scan is read-only. Requires figma-agent ≥ 1.6.7 (`savePath`); on an older server, ask the user to update and reconnect the MCP server.
