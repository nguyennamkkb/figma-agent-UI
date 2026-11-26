# Desktop flow: files, plugin, cleanup

> **Run only when the user asks for it explicitly.** The script drives Figma's GUI (keystrokes, menu clicks); by default the agent asks the user to open files and the plugin themselves (`connect.md` §1).

OS-side companion to the MCP tools: `scripts/figma-desktop.sh`. The MCP tools
cannot open files, launch the plugin, create files, or rename them — this script
covers exactly those gaps. **It never touches the canvas**; verify every step
with `figma_status` / `figma_doctor` afterwards.

Prereqs (all three, checked by `doctor`):

1. Figma desktop running (`/Applications/Figma.app`).
2. macOS Accessibility granted to the terminal running the agent
   (System Settings → Privacy & Security → Accessibility). Without it,
   every `osascript` keystroke/menu click fails with error 1002.
3. kimi-webbridge daemon + browser extension — only needed for `new`/`trash`.

## Scenario 1 — ensure file + plugin before work

Agent check first: `figma_status`. Target file id known (project note, URL).

| `figma_status` shows | Do |
|---|---|
| file listed | nothing (already open) |
| file missing | `figma-desktop.sh ensure <url\|fileId>` (opens URL in desktop, then launches plugin), then `figma_status` again |
| `files: []` | plugin not running at all → `open-plugin`, then `figma_status` |

`ensure` = `open-file` + `open-plugin`. File URL form:
`https://www.figma.com/design/<fileId>/`. A bare fileId is accepted too.

## Scenario 2 — file does not exist yet: create + rename

`figma-desktop.sh new <project-name>`:

1. kimi-webbridge opens `https://figma.new` (lands on a fresh draft),
   polls until the URL contains `/design/<fileId>`.
2. Renames **inside the file's own editor** (no Files page, no recency
   guessing): click File (left sidebar) → double-click the
   `"<name>, file name"` button → the rename input is a real DOM textbox →
   fill → Enter. Verified against the tab title/URL.
3. `close_session` — the web tab group is always closed so nothing lingers.

Output ends with `fileId: <id>` — save it in the project note. Then continue
with Scenario 1 (`ensure <fileId>`).

Why in-editor and not the Files page: the editor toolbar is canvas-drawn
(no DOM node for the name — tested: synthetic clicks summon no input), so the
sidebar name button is the only scriptable rename path. An earlier Files-page
variant (right-click row → Rename) worked but needed fragile freshness guards
and a canvas "touch" trick to disambiguate duplicate Untitleds; the in-editor
flow acts inside the file, so it cannot hit the wrong one. The sidebar
double-click remains the human equivalent.

Limits: `figma.new` opens in the **browser**, never in desktop — the desktop
open is always a separate `open-file` step. File creation needs a logged-in
browser session (the user's own login via the extension).

## Scenario 2b — rename an existing file on web

`figma-desktop.sh rename <url|fileId> <new-name>`:

1. Opens the file's own editor tab (precise by URL — no name matching).
2. Same in-editor rename as Scenario 2 (File → double-click name → fill →
   Enter → verify via title/URL).
3. `close_session`.

The old Files-page variant (freshest-row + 15-min guard + canvas "touch" to
force recency) is retired — kept in git history only. Trash (`trash <name>`)
still uses the Files page + freshness guard because trashing exists only
there; it refuses when no fresh match exists.

## Scenario 3 — reopen plugin when it dropped

Symptom: `figma_status` → `files: []`, or `figma_doctor` plugin check red.

`figma-desktop.sh open-plugin` clicks
Plugins → Development → **figma-agent-UI** and returns. Token is saved from
the first Connect, so it reconnects by itself — no paste step on reopen.

Do NOT use Quick Actions (Cmd+/ + type name + Enter) for this: it stalls on
dev plugins (verified 2026-11-10: keystrokes ran without error but nothing
launched). Menu path works every time.

Afterwards `figma_status` must list the file; if `versionCheck` warns, the user
closes and reopens the plugin (rebuild first if the server was upgraded).

## Scenario 4 — cleanup during/after development

- Web tabs: `new` and `trash` always `close_session` when done. If a run dies
  mid-way, rerun with the same session name (`figma-skill`) and close it.
- Smoke-test files: `figma-desktop.sh trash <fileId>` (Files → Move to trash).
- Canvas sections from QA: `stress_test` sections are deleted via
  `delete_nodes` (see `tool-reference.md`), not by this script.
- Never delete or rename the user's files without asking — except files this
  flow created for testing and the user approved for removal.

## `doctor` output map

`figma-desktop.sh doctor` prints Figma window names + webbridge status:

- window missing → `open-file` first.
- `extension_connected: false` → user opens the browser / installs the
  extension (https://www.kimi.com/features/webbridge); `new`/`trash` wait.
- menu click error 1002 → Accessibility missing (see prereqs).
- `files: []` after `open-plugin` → plugin panel opened on the wrong file:
  `open-file` the target first, then `open-plugin` again.

## Known web flakiness (verified 2026-11-10)

- Fresh `figma.new` editor tabs can stall mid-boot (frozen partial a11y tree,
  sidebar never appears — not fixed by waiting or by bringing the browser
  forward). Fix: reload the same URL once (`web_rename_in_editor` does this
  automatically after 30 s of missing sidebar), then proceed.
- `snapshot` follows the session's tab: every flow closes the session first
  and `web_navigate_verified` aborts unless the snapshot URL matches the
  navigated URL — never act on a mismatched snapshot.
- Trash always asks for confirmation — the script clicks the confirm dialog
  and verifies the row is gone (count 0), otherwise it fails loudly.
