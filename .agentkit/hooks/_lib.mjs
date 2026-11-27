import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const read = (p) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
};
export const readJson = (p, fallback = null) => {
  const t = read(p);
  if (t == null) return fallback;
  try {
    return JSON.parse(t);
  } catch {
    return fallback;
  }
};
export function writeAtomic(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = path.join(path.dirname(p), `.${path.basename(p)}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, p);
}
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
export function withLock(dir, fn) {
  const lock = path.join(dir, '.lock');
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; ; i++) {
    try {
      fs.mkdirSync(lock);
      break;
    } catch {
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > 15000) fs.rmSync(lock, { recursive: true, force: true });
      } catch {
      }
      if (i > 200) throw new Error(`desk is locked (${lock}); remove it if no desk command is running`);
      sleep(25);
    }
  }
  try {
    return fn();
  } finally {
    fs.rmSync(lock, { recursive: true, force: true });
  }
}

export async function readStdinJson() {
  if (process.stdin.isTTY) return {};
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  try {
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
}

export const today = () => new Date().toISOString().slice(0, 10);
export const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
export const toPosix = (p) => p.split(path.sep).join('/');

export function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export const DESK = '.desk';
export const MANIFEST = '.agentkit.json';

export function findRoot(start) {
  let d = path.resolve(start || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(d, MANIFEST)) || fs.existsSync(path.join(d, DESK))) return d;
    const up = path.dirname(d);
    if (up === d) return path.resolve(start || process.cwd());
    d = up;
  }
}
export const projectDir = (input = {}) => findRoot(process.env.AGENTKIT_ROOT || process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());

export function deskRoot(root) {
  if (process.env.AGENTKIT_DESK_ROOT) return path.resolve(process.env.AGENTKIT_DESK_ROOT);
  const common = git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']);
  if (common && path.basename(common) === '.git') {
    const main = path.dirname(common);
    if (path.resolve(main) !== path.resolve(root) && fs.existsSync(path.join(main, DESK))) return main;
  }
  return root;
}
export function mainRoot(root) {
  const common = git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']);
  return common && path.basename(common) === '.git' ? path.dirname(common) : root;
}

export function findManifest(root) {
  const p = path.join(root, MANIFEST);
  const data = readJson(p);
  if (data && data.nghe && !data.profession) data.profession = data.nghe;
  return data ? { path: p, base: root, data } : null;
}

export function emitContext(event, text) {
  if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }) + '\n');
}
export function contextOf(stdout) {
  const t = (stdout ?? '').trim();
  if (!t) return '';
  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t);
      return j.hookSpecificOutput?.additionalContext ?? j.reason ?? '';
    } catch {
    }
  }
  return t;
}

const statePath = (droot) => path.join(droot, DESK, '.state.json');
export function readState(droot) {
  return readJson(statePath(droot), null) ?? { session: 0, sessions: [] };
}
export function writeState(droot, s) {
  try {
    writeAtomic(statePath(droot), JSON.stringify(s, null, 2) + '\n');
  } catch {
  }
}
export function bumpSession(droot) {
  const s = readState(droot);
  s.session = (s.session ?? 0) + 1;
  s.sessions = [...(s.sessions ?? []), today()].slice(-50);
  delete s.teamAllowed;
  delete s.reminded;
  writeState(droot, s);
  return s;
}

export const JOURNAL_MAX = 256 * 1024;
export function journal(droot, entry) {
  const f = path.join(droot, DESK, '.journal.jsonl');
  try {
    fs.appendFileSync(f, JSON.stringify({ t: nowIso(), ...entry }) + '\n');
    if (fs.statSync(f).size > JOURNAL_MAX) {
      const lines = (read(f) ?? '').split('\n').filter(Boolean);
      writeAtomic(f, lines.slice(Math.floor(lines.length / 2)).join('\n') + '\n');
    }
  } catch {
  }
}
export function sessionJournal(droot, session) {
  return (read(path.join(droot, DESK, '.journal.jsonl')) ?? '')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter((e) => e && e.s === session);
}

const RULE_HEAD = /^### ([A-Z]+-\d+)\s*[·|-]\s*(P[0-3]|override|off)\s*$/;
export const LOCAL_RULES = 'rules.local.md';

export function parseRules(text) {
  const lines = (text ?? '').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const rules = [];
  const bad = [];
  const preamble = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('### ')) {
      const m = RULE_HEAD.exec(line.trim());
      if (!m) {
        bad.push(line);
        cur = null;
        continue;
      }
      cur = { id: m[1], kind: m[2], lines: [] };
      rules.push(cur);
    } else if (cur && line.startsWith('## ')) {
      cur = null;
      preamble.push(line);
    } else if (cur) cur.lines.push(line);
    else preamble.push(line);
  }
  for (const r of rules) {
    r.body = r.lines.join('\n').trim();
    r.why = /^- Why:\s*(.+)$/m.exec(r.body)?.[1]?.trim() ?? null;
    r.check = /^- Check:\s*(.+)$/m.exec(r.body)?.[1]?.trim() ?? null;
    r.summary = r.body.split('\n').find((l) => l.trim() && !l.startsWith('- ')) ?? r.why ?? '';
    delete r.lines;
  }
  return { preamble: preamble.join('\n').trim(), rules, bad };
}

export function removeRuleSection(text, id) {
  const out = [];
  let skip = false;
  for (const line of (text ?? '').split('\n')) {
    if (line.startsWith('### ')) skip = new RegExp(`^### ${id}\\s*[·|-]`).test(line);
    else if (line.startsWith('## ') || line.startsWith('# ')) skip = false;
    if (!skip) out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function listReview(droot) {
  const out = [];
  for (const sub of ['review', 'archive']) {
    const dir = path.join(droot, DESK, sub);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => /^[PU]-.*\.md$/.test(f));
    } catch {
      continue;
    }
    for (const f of files.sort()) {
      const text = read(path.join(dir, f)) ?? '';
      const id = f.startsWith('P-') ? /^P-\d+/.exec(f)?.[0] ?? f.replace(/\.md$/, '') : f.replace(/\.md$/, '');
      out.push({
        id,
        kind: id[0],
        file: path.join(dir, f),
        archived: sub === 'archive',
        title: /^# [^:]+:\s*(.*)$/m.exec(text)?.[1]?.trim() ?? f,
        status: (/^- Status:\s*(\w+)/im.exec(text)?.[1] ?? 'pending').toLowerCase(),
        text,
      });
    }
  }
  return out;
}

export function setStatus(file, status, note = '') {
  let text = read(file) ?? '';
  if (/^- Status:.*$/im.test(text)) text = text.replace(/^- Status:.*$/im, `- Status: ${status}`);
  else text = text.replace(/^(# .*\n)/, `$1- Status: ${status}\n`);
  text = text.replace(/^(- Status:.*\n)/im, `$1- Reviewed: ${today()}${note ? ` — ${note}` : ''}\n`);
  fs.writeFileSync(file, text);
}

export function lintLocalRules(droot, text, prev = null) {
  const errors = [];
  const { rules, bad } = parseRules(text);
  for (const b of bad) errors.push(`rules.local.md: bad heading "${b.trim()}". Use "### ID · P0-P3|override|off".`);
  const seen = new Set();
  for (const r of rules) {
    if (seen.has(r.id)) errors.push(`rules.local.md: ${r.id} appears twice.`);
    seen.add(r.id);
  }
  if (prev != null) {
    const before = new Map(parseRules(prev).rules.map((r) => [r.id, r.kind + '\n' + r.body]));
    const approved = new Set(listReview(droot).filter((p) => p.kind === 'P' && ['approved', 'applied'].includes(p.status)).map((p) => p.id));
    for (const r of rules) {
      if (before.get(r.id) === r.kind + '\n' + r.body) continue;
      const cited = [...r.body.matchAll(/P-\d+/g)].map((m) => m[0]);
      if (!cited.some((id) => approved.has(id)))
        errors.push(`rules.local.md: ${r.id} is new or changed but cites no approved proposal. Run \`node .agentkit/desk.mjs propose …\`, ask the user, and after their yes add "- Why: P-00N …" to the rule.`);
    }
  }
  return errors;
}

function findPatch(v) {
  if (typeof v === 'string') return v.includes('*** Begin Patch') ? v : null;
  if (Array.isArray(v)) {
    for (const x of v) {
      const r = findPatch(x);
      if (r) return r;
    }
  } else if (v && typeof v === 'object')
    for (const x of Object.values(v)) {
      const r = findPatch(x);
      if (r) return r;
    }
  return null;
}

export function parseApplyPatch(text) {
  const ops = [];
  let cur = null;
  let hunk = null;
  for (const line of text.split('\n')) {
    let m;
    if ((m = /^\*\*\* (Add|Update|Delete) File: (.+)$/.exec(line))) {
      cur = { op: m[1].toLowerCase(), path: m[2].trim(), moveTo: null, add: [], hunks: [] };
      ops.push(cur);
      hunk = null;
    } else if (!cur || /^\*\*\* (Begin|End) Patch/.test(line) || line === '*** End of File') continue;
    else if ((m = /^\*\*\* Move to: (.+)$/.exec(line))) cur.moveTo = m[1].trim();
    else if (cur.op === 'add') {
      if (line.startsWith('+')) cur.add.push(line.slice(1));
    } else if (cur.op === 'update') {
      if (line.startsWith('@@')) cur.hunks.push((hunk = []));
      else if (/^[ +-]/.test(line) || line === '') {
        if (!hunk) cur.hunks.push((hunk = []));
        hunk.push({ t: line[0] ?? ' ', s: line.slice(1) });
      }
    }
  }
  return ops;
}

function applyHunks(content, hunks) {
  let text = content ?? '';
  for (const h of hunks) {
    const oldS = h.filter((l) => l.t !== '+').map((l) => l.s).join('\n');
    const newS = h.filter((l) => l.t !== '-').map((l) => l.s).join('\n');
    if (!oldS) return null;
    const i = text.indexOf(oldS);
    if (i < 0) return null;
    text = text.slice(0, i) + newS + text.slice(i + oldS.length);
  }
  return text;
}

const pick = (o, ...keys) => keys.map((k) => o?.[k]).find((v) => v != null);

export function normalizeWrites(root, toolName, ti = {}, base = root) {
  const abs = (p) => path.resolve(base || root, p);
  const patch = findPatch(ti);
  if (patch) {
    return parseApplyPatch(patch).flatMap((op) => {
      if (op.op === 'add') return [{ path: abs(op.path), next: op.add.join('\n') + '\n' }];
      if (op.op === 'delete') return [{ path: abs(op.path), next: null, deleted: true }];
      const next = applyHunks(read(abs(op.path)), op.hunks);
      return op.moveTo ? [{ path: abs(op.path), next: null, deleted: true }, { path: abs(op.moveTo), next }] : [{ path: abs(op.path), next }];
    });
  }
  const file = pick(ti, 'file_path', 'filePath', 'path', 'notebook_path');
  if (!file || typeof file !== 'string') return [];
  const p = abs(file);
  const name = String(toolName ?? '').toLowerCase();
  const content = pick(ti, 'content');
  if (typeof content === 'string' && /write|create/.test(name)) return [{ path: p, next: content }];
  const list = Array.isArray(ti.edits)
    ? ti.edits.map((e) => ({ o: pick(e, 'old_string', 'oldString', 'oldText'), n: pick(e, 'new_string', 'newString', 'newText'), all: pick(e, 'replace_all', 'replaceAll') }))
    : [{ o: pick(ti, 'old_string', 'oldString', 'oldText'), n: pick(ti, 'new_string', 'newString', 'newText'), all: pick(ti, 'replace_all', 'replaceAll') }];
  if (list.every((e) => typeof e.o === 'string')) {
    let text = read(p) ?? '';
    for (const e of list) {
      if (e.o === '' && !text) text = e.n ?? '';
      else if (!text.includes(e.o)) return [{ path: p, next: null }];
      else text = e.all ? text.split(e.o).join(e.n ?? '') : text.replace(e.o, () => e.n ?? '');
    }
    return [{ path: p, next: text }];
  }
  return [{ path: p, next: null }];
}

const W = (list) => new RegExp(`(?<![\\p{L}])(?:${list})(?![\\p{L}])`, 'iu');
export const SIGNALS = {
  correction: W("không phải|sai rồi|sai|nhầm|đừng|không được|làm lại|chưa đúng|vẫn lỗi|vẫn chưa|wrong|incorrect|don't|do not|stop|revert|undo|that's not|not what i|still broken|still failing"),
  urgent: W('gấp|khẩn|ngay bây giờ|ngay lập tức|quan trọng|ưu tiên|trước tiên|urgent|asap|important|priority|critical|blocker|blocking'),
  remember: W('nhớ|ghi nhớ|luôn luôn|luôn|không bao giờ|từ giờ|từ nay|remember|always|never|from now on|going forward'),
  later: W('để sau|làm sau|lúc khác|khi nào rảnh|tuần sau|later|someday|sometime|next week|not now'),
  wait: W('chờ|đợi|hold|on hold|wait for|waiting for|blocked by|pending'),
  drop: W('bỏ đi|bỏ qua|bỏ việc|bỏ cái|bỏ luôn|thôi khỏi|không cần nữa|không làm nữa|huỷ|hủy|cancel|drop it|skip it|never mind|forget it'),
  team: W('song song|chia việc|giao việc|worker|đội|nhóm agent|parallel|delegate|team|orchestrate|worktree'),
  approve: /^\s*(ok|oke|okay|yes|yep|ừ|ừm|uh|đồng ý|duyệt|được|được rồi|chốt|làm đi|go ahead|approve[d]?|lgtm|sounds good)\b/iu,
};
export function detectSignals(prompt) {
  return Object.entries(SIGNALS)
    .filter(([, re]) => re.test(prompt ?? ''))
    .map(([k]) => k);
}
export const words = (s) => (String(s).toLowerCase().normalize('NFC').match(/[\p{L}\p{N}_]{3,}/gu) ?? []);
export const STOP = new Set(
  'the and for with this that from have not are you your but was what when then them they into about there please also just like need make sure use using should would could can will one two all any more some cho của các những được trong với này một là có không và thì để khi đã sẽ đang lại nữa thôi rồi bạn mình tôi làm nhé nha giúp nên hay hoặc cũng như việc cái đó kia sau trước ngày tuần tháng giờ học dùng xem cần muốn'.split(' '),
);
