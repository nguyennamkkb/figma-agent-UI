# Section link — run one flow from a Figma link

The user may paste a Figma section link instead of `FL-NN`, in any command: "thử luồng này trước", `/app-redesign build <link> L3`, `/app-redesign start <goal> L3 <link>`. The link sets the **scope**: that flow alone, whatever the order in `plan.md`. Before any write, check what was already redesigned and ask whether this flow follows the same way (§4).

## 1. Recognise the link

`https://www.figma.com/design|file/<fileKey>/<slug>?node-id=<a>-<b>` → node id `a:b` (the `-` becomes `:`).

| The link points to | It means |
|---|---|
| a node in the working file (`fileKey` = `figma_status` file key; when the key is null, `slug` = the working file name) | **scope** — this file |
| the original file (another key, `project.md` → `Original`, or a name without "Copy") | never connect to it. A duplicated file keeps node ids: say so, look the same id up in the working copy, and confirm the section name with the user |
| another file, an image, an app | **reference** (`start.md` §2) |

No working file confirmed yet → `start.md` §1 first. A link in `start` text can be both a scope and a reference only if the user says so.

## 2. Resolve it to a flow

1. `get_node{id, depth: 0}` on the working file. Not found → tell the user, ask for the link again (Figma → right-click the section → Copy link to selection).
2. Climb to the flow section: a SECTION is the scope; a frame or layer inside → its parent section (remember the screen for the report); a file without sections → the title frame `analyze.py` uses as the section.
3. Map the section to a flow: `inventory.baseline.json` → `sections[].id` → `screen-map.json` `flow` (or `project.md` → Flows → Section). Not in the baseline (added or renamed later) → `scan.js` on its page into `inventory.baseline.<n>.json` (it is still untouched, so it is a valid baseline), merge, give it the next `FL-NN`, ask the user for its name.
4. Say it back in one line before going on: *"Link → section `<name>` → FL-05 · <name> (<n> màn, <n> trạng thái, trạng thái `todo`, mức L2)."*

## 3. Scope = that flow alone

- Only that flow is analysed in detail, built and audited (`audit FL-NN`). Other flows stay untouched and keep their status.
- **No project yet** (`start <goal> [Ln] <link>`) — a **pilot start**: confirm the file, scan the baseline of every screen page as usual (read-only; the baseline must exist before any edit), but run the analysis, diagnosis, directions and the main screens on this flow only — the main screens come from its families (fewer than 3 if it has fewer). `plan.md` §6 holds only this flow; the other flows are listed in §2 as *chưa lên kế hoạch*. `project.md`: `Scope: pilot FL-NN`. After the pilot is approved, `start` without a link extends the plan to the remaining flows with the pilot's direction and level as the default.
- **Project exists** (`start`/`build` with a link) — do not rerun `start`. Direction not approved yet (`Status` before `start/done`) → run `start.md` §5–6 with this flow's screens as the main screens. Then §4, then `build.md` for this flow.

## 4. Earlier work → ask which way ◆

Before any write, read what was already changed: flows in `project.md` with status `review`, `done` or `trial`; `screen-map.json` entries `built`/`shared`; `foundations: done`; the approved direction and level.

| Found | Do |
|---|---|
| Nothing edited yet | No question: use the approved direction and the flow's level (or the level given with the link) |
| Other flows edited | Ask (below) |
| This flow itself already `review`/`done` | Ask the same question as *redo*: same way (fix, polish) or another way. Before rebuilding, move the current frames to `Archive · Before redesign` with suffix ` · rev<n>`; rebuild from the baseline frames and source images, not from the current version |

One `AskUserQuestion`, standing on its own — name what was done:

> *"FL-02 · Onboarding đã làm theo hướng A · <tên hướng>, mức L3 (ảnh <cách xử lý>, component <các bộ chính>). FL-05 · <tên> làm theo cách đó hay khác?"*

| Option | Then |
|---|---|
| **Theo cách đã sửa** (Recommended) | Same direction, tokens, components, image treatment; level = the level given with the link, else the level of the edited flows. Normal `build` |
| **Cùng hướng, đổi mức** | Ask the level if not given; per-flow override (`levels.md`); same tokens and components |
| **Hướng khác — thử riêng** | §5 trial |

Several edited flows that differ from each other → one option per distinct way ("theo FL-02", "theo FL-04"). A free-text answer is mapped onto these rows and said back. Write the answer in `project.md` → Flows → Way and Decisions.

## 5. Another way = a trial

A trial never changes what the edited flows use.

1. Build on `06 · Explore (WIP)` in a Section `Trial · FL-NN · <direction>`: local values, local parts; shared variables, styles and components untouched; the flow's baseline frames stay in place (no Archive). The new direction gets its own short research (`start.md` §5, one direction unless the user asks for options) inside the flow's level.
2. Images ◆ with the level's treatment (`imagery.md`).
3. The whole flow — every family and state — so it can be judged as a flow. Function check by hand: a table baseline screen/state → trial frame; nothing missing (parity runs after adoption, the Explore page is outside the scanned pages).
4. Report ◆ with three choices:

| Choice | Then |
|---|---|
| **Áp cho cả dự án** | The trial direction becomes the project direction: update `plan.md` §4, change the variables, styles and components in place (bound nodes of the edited flows follow), rebuild the flow in place (`build.md` §2), put the edited flows back to `review` and run `audit` on them |
| **Chỉ luồng này** | Exception: values that differ go into a collection `Flow · FL-NN` (aliasing Primitives where possible), parts that differ become components under `FL-NN /`, the shared `Button` set is reused unless the CTA look differs; rebuild in place; write the exception in `project.md` and `plan.md` §4 |
| **Bỏ, theo cách cũ** | Move the trial section to `Archive · Before redesign` as `Trial · FL-NN · rejected`; build the flow the earlier way |

`project.md` flow status while the trial waits: `trial`.
