#!/usr/bin/env bash
# figma-desktop.sh — OS-side companion for the figma-ui-flow skill (references/tools/desktop-flow.md).
# Handles what MCP tools cannot: opening files in Figma desktop, launching the
# dev plugin via the app menu, and creating/renaming files via kimi-webbridge.
#
# Prereqs:
#   - Figma desktop installed (/Applications/Figma.app)
#   - macOS Accessibility granted to the terminal running this script
#     (System Settings -> Privacy & Security -> Accessibility)
#   - kimi-webbridge daemon + browser extension (only for: new, rename, trash)
#
# Usage:
#   figma-desktop.sh windows                  # list Figma window names
#   figma-desktop.sh open-file <url|fileId>   # open file in Figma desktop, wait for window
#   figma-desktop.sh open-plugin              # Plugins -> Development -> figma-agent-UI
#   figma-desktop.sh ensure <url|fileId>      # open-file + open-plugin
#   figma-desktop.sh new <name>               # create file on web, rename in-editor, close tab
#   figma-desktop.sh rename <url|fileId> <new> # open file's editor, rename in-editor, close tab
#   figma-desktop.sh trash <name>              # move web file to trash (smoke-test cleanup)
#   figma-desktop.sh doctor                   # print diagnostics
#
# Verify results with MCP afterwards: figma_status (file connected?),
# figma_doctor (plugin check). This script never touches the canvas.

set -u
FIGMA_APP="Figma"
PLUGIN_NAME="figma-agent-UI"
WEBBRIDGE="http://127.0.0.1:10086/command"
SESSION="figma-skill"

die() { echo "ERROR: $*" >&2; exit 1; }

wb() { # wb <json-body> — POST to kimi-webbridge, fail on transport error
  curl -s --max-time 60 -X POST "$WEBBRIDGE" -H 'Content-Type: application/json' -d "$1" \
    || die "kimi-webbridge unreachable at $WEBBRIDGE (is the daemon running?)"
}

wb_check() {
  local st
  st=$(curl -s --max-time 10 -X POST "$WEBBRIDGE" -H 'Content-Type: application/json' -d '{"action":"list_tabs"}') || return 1
  echo "$st" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') else 1)" 2>/dev/null
}

to_url() { # to_url <url|fileId> -> full https URL
  case "$1" in
    http*) echo "$1" ;;
    *)     echo "https://www.figma.com/design/$1/" ;;
  esac
}

cmd_windows() {
  osascript -e 'tell application "System Events"' \
            -e 'tell process "Figma"' \
            -e 'return name of every window' \
            -e 'end tell' -e 'end tell' 2>&1
}

cmd_open_file() { # open-file <url|fileId>
  [ $# -ge 1 ] || die "open-file needs <url|fileId>"
  local url; url=$(to_url "$1")
  open -a "$FIGMA_APP" "$url" || die "cannot open $url with $FIGMA_APP"
  # wait up to 30s for a Figma window to exist
  local i win
  for i in $(seq 1 15); do
    sleep 2
    win=$(cmd_windows 2>/dev/null) && [ -n "$win" ] && [ "$win" != "" ] && break
  done
  echo "windows: $(cmd_windows 2>/dev/null)"
}

cmd_open_plugin() {
  # NOTE: Quick Actions (Cmd+/) gets stuck on dev plugins — use the menu path.
  osascript -e 'tell application "Figma" to activate' \
    -e 'delay 0.5' \
    -e 'tell application "System Events"' \
    -e 'tell process "Figma"' \
    -e 'click menu item "'"$PLUGIN_NAME"'" of menu 1 of menu item "Development" of menu 1 of menu bar item "Plugins" of menu bar 1' \
    -e 'end tell' -e 'end tell' \
    || die "menu click failed (is Figma running? Accessibility granted?)"
  echo "plugin menu clicked"
}

cmd_ensure() { # ensure <url|fileId>
  [ $# -ge 1 ] || die "ensure needs <url|fileId>"
  cmd_open_file "$1"
  cmd_open_plugin
  echo "done — verify with figma_status (expect the file listed)"
}

# ---- web helpers (kimi-webbridge) ----
# Files-page rows are JS-driven buttons (no href/fileId in DOM), and Recents
# sort newest-first — so rows are picked by order + a freshness guard, never
# by fileId. Guards abort instead of touching the wrong file.

web_file_id() { # web_file_id <editor-url> -> fileId or empty
  echo "$1" | python3 -c "import re,sys; m=re.search(r'/design/([A-Za-z0-9]+)', sys.stdin.read()); print(m.group(1) if m else '')"
}

web_close_silent() {
  curl -s --max-time 10 -X POST "$WEBBRIDGE" -H 'Content-Type: application/json' \
    -d "{\"action\":\"close_session\",\"args\":{},\"session\":\"$SESSION\"}" >/dev/null 2>&1 || true
}

# web_count_rows <name> -> number of same-name file rows on the Files page
web_count_rows() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys
t = json.dumps(json.load(sys.stdin)['data']['tree'])
import re
print(len(re.findall(r'\"role\": \"group\", \"name\": \"$1\"', t)))"
}

# web_pick_row <row-name> <max-age-min> -> 0-based index of the freshest
# same-name row within the guard (Recents = newest first). Empty = abort.
# Used only when several rows share the name (trash ambiguity guard).
web_pick_row() {
  local name="$1" maxmin="$2"
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.load(sys.stdin)['data']['tree']
rows = []
def walk(n):
    if isinstance(n, dict):
        kids = n.get('children') or []
        if n.get('role') == 'group' and isinstance(n.get('name'), str) and n.get('name'):
            btn = next((c for c in kids if isinstance(c, dict) and c.get('role') == 'button'
                        and (c.get('name') or '').endswith(', Design file')), None)
            if btn:
                m = re.search(r'\"name\": \"(\d+) (second|minute|hour)s? ago\"', json.dumps(kids))
                j = re.search(r'\"name\": \"just now\"', json.dumps(kids))
                age = None
                if j:
                    age = 0.0
                elif m:
                    v = int(m.group(1)); u = m.group(2)
                    age = v / 60.0 if u == 'second' else (v if u == 'minute' else v * 60)
                rows.append((btn.get('name'), age))
        for c in kids:
            walk(c)
    elif isinstance(n, list):
        for c in n: walk(c)
walk(t)
k = 0
for label, age in rows:
    if label == '$name, Design file':
        if age is not None and age <= $maxmin:
            print(k); break
        k += 1
"
}

# web_contextmenu_kth <aria-label> <k> — right-click k-th button with that label
web_contextmenu_kth() {
  wb "{\"action\":\"evaluate\",\"args\":{\"code\":\"(() => { const els=[...document.querySelectorAll('button')].filter(x=>((x.getAttribute('aria-label')||x.textContent||'').trim())==='$1'); const el=els[$2]; if(!el) return JSON.stringify({found:false}); const r=el.getBoundingClientRect(); el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2,button:2})); return JSON.stringify({found:true}); })()\"},\"session\":\"$SESSION\"}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['data'].get('value','{}'))" \
    | grep -q '"found": *true'
}

# web_menu_ref <menuitem-name> -> @e ref or empty
web_menu_ref() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.dumps(json.load(sys.stdin)['data']['tree'])
m = re.search(r'\"name\": \"$1\".*?\"ref\": \"(@e\d+)\"', t)
print(m.group(1) if m else '')"
}

web_press_enter() {
  wb "{\"action\":\"evaluate\",\"args\":{\"code\":\"(() => { const el=document.activeElement; el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,bubbles:true})); return JSON.stringify({ok:true}); })()\"},\"session\":\"$SESSION\"}" >/dev/null
}

web_rename_input_ref() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.dumps(json.load(sys.stdin)['data']['tree'])
m = re.search(r'textbox.*?\"name\": \"Rename file\".*?\"ref\": \"(@e\d+)\"', t)
print(m.group(1) if m else '')"
}

# web_button_ref <exact-name> -> @e ref of a button, or empty
web_button_ref() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.dumps(json.load(sys.stdin)['data']['tree'])
m = re.search(r'\"role\": \"button\", \"name\": \"$1\".*?\"ref\": \"(@e\d+)\"', t)
print(m.group(1) if m else '')"
}

# web_filename_btn_ref -> @e ref of the "<name>, file name" button, or empty
web_filename_btn_ref() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.dumps(json.load(sys.stdin)['data']['tree'])
m = re.search(r'\"role\": \"button\", \"name\": \"([^\"]+), file name\".*?\"ref\": \"(@e\d+)\"', t)
print(m.group(2) if m else '')"
}

# web_file_rename_input_ref -> @e ref of the in-editor "File name" textbox
web_file_rename_input_ref() {
  wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" | python3 -c "
import json,sys,re
t = json.dumps(json.load(sys.stdin)['data']['tree'])
m = re.search(r'\"role\": \"textbox\", \"name\": \"File name\".*?\"ref\": \"(@e\d+)\"', t)
print(m.group(1) if m else '')"
}

# web_navigate_verified <url> [contains] — close session, open URL in a fresh
# single tab, then poll until the snapshot URL matches (kills wrong-tab bugs).
# Prints the final URL. Aborts if it never matches.
web_navigate_verified() {
  local url="$1" want="${2:-}" i curl_url
  web_close_silent
  wb "{\"action\":\"navigate\",\"args\":{\"url\":\"$url\",\"newTab\":true},\"session\":\"$SESSION\"}" >/dev/null
  [ -z "$want" ] && want="$url"
  for i in $(seq 1 8); do
    sleep 5
    curl_url=$(wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['url'])" 2>/dev/null)
    case "$curl_url" in
      *"$want"*) echo "$curl_url"; return 0 ;;
    esac
  done
  die "snapshot URL never matched ($want) — last: $curl_url"
}

# web_rename_in_editor <new-name> — rename the file open in the current web tab:
# wait 15 s after page open (editor needs it — less is flaky), click File
# (sidebar), double-click "<name>, file name", fill, Enter. Verified by hand.
web_rename_in_editor() {
  local name="$1" ref input ok title i cur fref
  # editor needs ~15 s after open before the sidebar accepts clicks
  sleep 15
  ref=$(web_filename_btn_ref)
  if [ -z "$ref" ]; then
    # tab may have stalled mid-boot: reload once, wait again
    cur=$(wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['url'])" 2>/dev/null)
    [ -n "$cur" ] || die "lost the web tab"
    wb "{\"action\":\"navigate\",\"args\":{\"url\":\"$cur\"},\"session\":\"$SESSION\"}" >/dev/null
    sleep 15
    ref=$(web_filename_btn_ref)
  fi
  [ -n "$ref" ] || die "file name button not found"
  # Click File once (arms the sidebar panel), then double-click the name.
  # If the name button vanished (panel toggled shut), click File once more.
  fref=$(web_button_ref "File")
  [ -n "$fref" ] || die "File button not found in sidebar"
  wb "{\"action\":\"click\",\"args\":{\"selector\":\"$fref\"},\"session\":\"$SESSION\"}" >/dev/null
  sleep 2
  ref=$(web_filename_btn_ref)
  if [ -z "$ref" ]; then
    wb "{\"action\":\"click\",\"args\":{\"selector\":\"$fref\"},\"session\":\"$SESSION\"}" >/dev/null
    sleep 2
    ref=$(web_filename_btn_ref)
  fi
  [ -n "$ref" ] || die "file name button not found after File click"
  ok=$(wb "{\"action\":\"evaluate\",\"args\":{\"code\":\"(() => { const el=[...document.querySelectorAll('button')].find(x=>/, file name\$/.test((x.getAttribute('aria-label')||'').trim())); if(!el) return JSON.stringify({found:false}); const r=el.getBoundingClientRect(); const o={bubbles:true,cancelable:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2,button:0}; el.dispatchEvent(new MouseEvent('mousedown',o)); el.dispatchEvent(new MouseEvent('mouseup',o)); el.dispatchEvent(new MouseEvent('click',o)); el.dispatchEvent(new MouseEvent('mousedown',Object.assign({detail:2},o))); el.dispatchEvent(new MouseEvent('mouseup',Object.assign({detail:2},o))); el.dispatchEvent(new MouseEvent('click',Object.assign({detail:2},o))); el.dispatchEvent(new MouseEvent('dblclick',Object.assign({detail:2},o))); return JSON.stringify({found:true}); })()\"},\"session\":\"$SESSION\"}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['data'].get('value','{}'))")
  echo "$ok" | grep -q '"found": *true' || die "double-click on file name failed"
  sleep 2
  input=$(web_file_rename_input_ref)
  [ -n "$input" ] || die "in-editor rename input did not appear"
  wb "{\"action\":\"fill\",\"args\":{\"selector\":\"$input\",\"value\":\"$name\"},\"session\":\"$SESSION\"}" >/dev/null
  sleep 1
  web_press_enter
  sleep 3
  title=$(wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" \
    | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print(d.get('title','')+' '+d.get('url',''))")
  echo "$title" | grep -q "$name" || die "rename verify failed (title/url: $title)"
  echo "renamed in editor to '$name'"
}

cmd_new() { # new <name> — create via figma.new, rename in-editor, close tab
  [ $# -ge 1 ] || die "new needs <name>"
  trap web_close_silent EXIT
  local name="$1"
  wb_check || die "kimi-webbridge not healthy (daemon? extension connected?)"
  web_close_silent # drop any stale tab from a previous run
  local url fid
  # want the post-redirect editor URL, not the figma.new landing URL
  url=$(web_navigate_verified "https://figma.new" "figma.com/design/")
  fid=$(web_file_id "$url")
  [ -n "$fid" ] || die "new file never yielded a fileId ($url)"
  echo "created: $fid"
  web_rename_in_editor "$name"
  web_close_silent
  trap - EXIT
  echo "renamed to '$name', web tab closed — fileId: $fid"
}

cmd_rename() { # rename <url|fileId> <new-name> — in the file's own editor tab
  [ $# -ge 2 ] || die "rename needs <url|fileId> <new-name>"
  trap web_close_silent EXIT
  local target="$1" name="$2" url
  url=$(to_url "$target")
  wb_check || die "kimi-webbridge not healthy"
  web_navigate_verified "$url" "figma.com/design/" >/dev/null
  web_rename_in_editor "$name"
  web_close_silent
  trap - EXIT
  echo "renamed to '$name', web tab closed"
}

cmd_trash() { # trash <name> — move web file to trash (smoke-test cleanup)
  # Unique name -> trash it directly. Duplicates -> only the freshest row
  # within 15 min, else abort rather than risk the wrong file.
  [ $# -ge 1 ] || die "trash needs <name>"
  trap web_close_silent EXIT
  local name="$1"
  wb_check || die "kimi-webbridge not healthy"
  web_navigate_verified "https://www.figma.com/files/" "figma.com/files" >/dev/null
  local total k
  total=$(web_count_rows "$name")
  [ "$total" -ge 1 ] || die "no '$name' row found"
  if [ "$total" -eq 1 ]; then
    k=0
  else
    k=$(web_pick_row "$name" 15)
    [ -n "$k" ] || die "ambiguous '$name' ($total rows) and none fresh — aborting"
  fi
  web_contextmenu_kth "$name, Design file" "$k" || die "right-click failed"
  sleep 2
  local ref
  ref=$(web_menu_ref "Move to trash")
  [ -n "$ref" ] || die "Move to trash not found for '$name'"
  wb "{\"action\":\"click\",\"args\":{\"selector\":\"$ref\"},\"session\":\"$SESSION\"}" >/dev/null
  sleep 3
  # confirm dialog ("Move file to trash" heading + confirm button of same name)
  local confirm
  confirm=$(web_menu_ref "Move file to trash")
  if [ -n "$confirm" ]; then
    wb "{\"action\":\"click\",\"args\":{\"selector\":\"$confirm\"},\"session\":\"$SESSION\"}" >/dev/null
    sleep 4
  fi
  local n
  n=$(wb "{\"action\":\"snapshot\",\"args\":{},\"session\":\"$SESSION\"}" \
    | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)['data']['tree']).count('$name'))")
  [ "$n" -eq 0 ] || die "trash verify failed ('$name' still listed)"
  echo "trashed '$name'"
  web_close_silent
  trap - EXIT
  echo "web tab closed"
}

cmd_doctor() {
  echo "== Figma windows =="
  cmd_windows 2>&1
  echo "== webbridge =="
  ~/.kimi-webbridge/bin/kimi-webbridge status 2>&1 | head -5 || echo "(webbridge binary missing)"
  echo "== hints =="
  echo "- file missing from figma_status -> open-file <url>, then open-plugin, then re-check"
  echo "- plugin menu click fails -> grant Accessibility to this terminal, Figma must be running"
  echo "- Quick Actions (Cmd+/) stalls on dev plugins -> always use the Plugins menu path"
}

case "${1:-}" in
  windows)    cmd_windows ;;
  open-file)  shift; cmd_open_file "$@" ;;
  open-plugin) cmd_open_plugin ;;
  ensure)     shift; cmd_ensure "$@" ;;
  new)        shift; cmd_new "$@" ;;
  rename)     shift; cmd_rename "$@" ;;
  trash)      shift; cmd_trash "$@" ;;
  close-web)  web_close_silent; echo "web session closed" ;;
  doctor)     cmd_doctor ;;
  *) echo "usage: $0 {windows|open-file <url|id>|open-plugin|ensure <url|id>|new <name>|rename <url|id> <new>|trash <name>|close-web|doctor}" >&2; exit 2 ;;
esac
