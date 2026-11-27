import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, readJson, writeAtomic, withLock, today, nowIso, DESK, findManifest, words, STOP, listReview, parseRules, LOCAL_RULES, git, mainRoot } from './_lib.mjs';

export const VERSION = 2;
export const TASK_OPEN = ['inbox', 'todo', 'doing', 'waiting', 'review'];
export const TASK_CLOSED = ['done', 'dropped', 'failed'];
export const STATUSES = [...TASK_OPEN, ...TASK_CLOSED];
export const PRIOS = ['P0', 'P1', 'P2', 'P3'];
export const CAPS = { goal: 5, pinned: 10, keepClosed: 12, history: 20, undo: 30, todo: 20 };
export const PROMOTE_USES = 3;
export const STALE_SESSIONS = 5;
export const PROPOSE_SEEN = 2;
export const ICON = { inbox: '📥', todo: '⬜', doing: '🔵', waiting: '⏸', review: '🟡', done: '✅', dropped: '⏹', failed: '❌' };
const PREFIX = { task: 'Q', memory: 'M', lesson: 'L' };
const HERE = path.dirname(fileURLToPath(import.meta.url));

export const paths = (droot) => {
  const dir = path.join(droot, DESK);
  return {
    dir,
    json: path.join(dir, 'desk.json'),
    md: path.join(dir, 'DESK.md'),
    html: path.join(dir, 'desk.html'),
    archive: path.join(dir, 'archive.jsonl'),
    undo: path.join(dir, '.undo'),
  };
};
export const hasDesk = (droot) => fs.existsSync(paths(droot).json) || fs.existsSync(path.join(droot, DESK, 'now.md'));

export const emptyDesk = () => ({ version: VERSION, seq: { Q: 0, M: 0, L: 0, P: 0 }, goal: [], items: [], leases: {} });

export function load(droot) {
  const p = paths(droot);
  const d = readJson(p.json);
  if (d && d.version === VERSION) return normalize(d);
  if (fs.existsSync(path.join(p.dir, 'now.md'))) return migrateV1(droot);
  return emptyDesk();
}
function normalize(d) {
  d.seq ??= { Q: 0, M: 0, L: 0, P: 0 };
  d.goal ??= [];
  d.items ??= [];
  d.leases ??= {};
  return d;
}

const sameAs = (desk) => JSON.stringify({ ...desk, updated: undefined });

export function mutate(droot, op, fn, { bookkeeping = false } = {}) {
  const p = paths(droot);
  return withLock(p.dir, () => {
    const before = read(p.json);
    const desk = load(droot);
    const prev = sameAs(desk);
    const res = fn(desk);
    if (res && res.noop) return res;
    if (before != null && sameAs(desk) === prev) return res;
    const light = bookkeeping || !!(res && res.bookkeeping);
    if (before != null && op !== 'undo' && !light) snapshot(droot, op, before);
    save(droot, desk, { views: !light });
    return res;
  });
}

function snapshot(droot, op, text) {
  const dir = paths(droot).undo;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${Date.now()}-${String(op).replace(/[^\w-]/g, '')}.json`), text);
  const all = fs.readdirSync(dir).sort();
  for (const f of all.slice(0, Math.max(0, all.length - CAPS.undo))) fs.rmSync(path.join(dir, f), { force: true });
}

export function save(droot, desk, { views = true } = {}) {
  const p = paths(droot);
  desk.version = VERSION;
  desk.updated = nowIso();
  archiveClosed(droot, desk);
  writeAtomic(p.json, JSON.stringify(desk, null, 2) + '\n');
  if (!views) return;
  try {
    writeAtomic(p.md, renderMd(droot, desk));
    renderHtml(droot, desk);
  } catch {
  }
}

export const tasks = (desk, ...st) => desk.items.filter((i) => i.kind === 'task' && (!st.length || st.includes(i.status)));
export const memories = (desk) => desk.items.filter((i) => i.kind === 'memory');
export const lessons = (desk) => desk.items.filter((i) => i.kind === 'lesson');
export const isLead = (t) => !t.executor || t.executor === 'lead';
export const focus = (desk) => tasks(desk, 'doing').find(isLead) ?? null;

export function find(desk, id, kind = null) {
  const want = String(id ?? '').trim().toUpperCase();
  const norm = /^\d+$/.test(want) ? `Q-${Number(want)}` : want.replace(/^([A-Z])-?0*(\d+)$/, '$1-$2');
  const it = desk.items.find((i) => i.id === norm);
  if (!it) throw new Error(`no ${kind ?? 'item'} ${id} on the desk (node .agentkit/desk.mjs list --all)`);
  if (kind && it.kind !== kind) throw new Error(`${it.id} is a ${it.kind}, not a ${kind}`);
  return it;
}
const nextId = (desk, kind) => {
  const k = PREFIX[kind];
  desk.seq[k] = (desk.seq[k] ?? 0) + 1;
  return `${k}-${desk.seq[k]}`;
};
export function log(it, status, note) {
  const entry = { at: nowIso(), status: status ?? it.status, ...(note ? { note: String(note).slice(0, 400) } : {}) };
  it.history = [...(it.history ?? []), entry].slice(-CAPS.history);
  if (status) it.status = status;
  it.last = today();
}
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)));
const csv = (v) => (Array.isArray(v) ? v : v == null || v === true ? [] : String(v).split(',')).map((x) => x.trim()).filter(Boolean);
const prioOf = (p, d = 'P1') => {
  const v = String(p ?? d).toUpperCase();
  if (!PRIOS.includes(v)) throw new Error(`priority must be P0–P3, not ${p}`);
  return v;
};

function newItem(desk, kind, fields) {
  const it = clean({ id: nextId(desk, kind), kind, created: today(), last: today(), uses: 1, ...fields });
  desk.items.push(it);
  return it;
}

export function depsOpen(droot, desk, t) {
  const byId = new Map(desk.items.map((i) => [i.id, i]));
  return (t.deps ?? []).filter((d) => {
    const x = byId.get(d);
    if (x) return x.status !== 'done';
    return findArchived(droot, d)?.status !== 'done';
  });
}
export const openKids = (desk, t) => tasks(desk).filter((k) => k.parent === t.id && !TASK_CLOSED.includes(k.status));
export const ready = (droot, desk) => sortTasks(tasks(desk, 'todo').filter((t) => !depsOpen(droot, desk, t).length && !openKids(desk, t).length));
export const sortTasks = (list) => [...list].sort((a, b) => a.prio.localeCompare(b.prio) || (b.uses ?? 0) - (a.uses ?? 0) || String(a.created).localeCompare(String(b.created)) || idNum(a) - idNum(b));
const idNum = (i) => Number(String(i.id).split('-')[1] ?? 0);

export function addTask(desk, { text, prio, done, now, next, files, deps, parent, refs, plan, role, executor, tier, level, status, on, until, note }) {
  if (!text || !String(text).trim()) throw new Error('add needs the task text');
  const known = new Set(desk.items.map((i) => i.id));
  for (const d of csv(deps)) if (!known.has(d) && !/^Q-\d+$/.test(d)) throw new Error(`unknown dep ${d}`);
  if (parent) find(desk, parent, 'task');
  const t = newItem(desk, 'task', {
    status: status ?? 'todo',
    prio: prioOf(prio),
    text: String(text).trim(),
    done,
    files: csv(files),
    deps: csv(deps).map((d) => d.toUpperCase()),
    parent: parent ? find(desk, parent).id : undefined,
    refs: csv(refs),
    plan,
    role,
    executor,
    tier,
    level,
    on,
    until,
  });
  log(t, null, note ?? 'added');
  let parked = null;
  if (now) parked = startTask(desk, t.id, { next }).parked;
  return { item: t, parked };
}

export function editItem(desk, id, f) {
  const it = find(desk, id);
  const fields = ['text', 'done', 'next', 'plan', 'role', 'executor', 'tier', 'level', 'agent', 'model', 'on', 'until', 'why', 'proof'];
  const changed = [];
  for (const k of fields)
    if (f[k] !== undefined) {
      if (f[k] === '' || f[k] === false) delete it[k];
      else it[k] = String(f[k]);
      changed.push(k);
    }
  if (f.prio !== undefined) (it.prio = prioOf(f.prio)), changed.push('prio');
  for (const k of ['files', 'deps', 'refs'])
    if (f[k] !== undefined) {
      const v = csv(f[k]);
      if (v.length) it[k] = k === 'deps' ? v.map((d) => d.toUpperCase()) : v;
      else delete it[k];
      changed.push(k);
    }
  if (f.addRef) it.refs = [...new Set([...(it.refs ?? []), ...csv(f.addRef)])];
  if (f.pin !== undefined) it.pin = !!f.pin;
  if (!changed.length && !f.addRef && f.pin === undefined) throw new Error('edit: nothing to change (--text --prio --done --next --files --deps --ref …)');
  log(it, null, `edit ${changed.join(',')}`);
  return it;
}

export function startTask(desk, id, { next, note } = {}) {
  const t = find(desk, id, 'task');
  if (!['todo', 'inbox', 'waiting', 'review', 'doing'].includes(t.status)) throw new Error(`${t.id} is ${t.status}; reopen it with \`resume ${t.id}\` first`);
  let parked = null;
  if (isLead(t)) {
    const cur = focus(desk);
    if (cur && cur.id !== t.id) {
      if (next) cur.next = next;
      log(cur, 'todo', `parked for ${t.id}`);
      parked = cur;
    }
  }
  delete t.on;
  delete t.until;
  log(t, 'doing', note ?? 'started');
  return { item: t, parked };
}

export function setNext(desk, text, id = null) {
  const t = id ? find(desk, id, 'task') : focus(desk);
  if (!t) throw new Error('no task in progress (start one first)');
  t.next = String(text);
  log(t, null, `next: ${text}`);
  return t;
}

export function waitTask(desk, id, { on, until, note } = {}) {
  const t = id ? find(desk, id, 'task') : focus(desk);
  if (!t) throw new Error('wait: which task? (wait Q-7 --on user)');
  if (!on && !until) throw new Error('wait needs --on user|Q-3|"who/what" and/or --until YYYY-MM-DD');
  if (until && !/^\d{4}-\d\d-\d\d$/.test(until)) throw new Error('--until must be YYYY-MM-DD');
  if (on) t.on = String(on).replace(/^q-/i, 'Q-');
  if (until) t.until = until;
  log(t, 'waiting', note ?? `waiting on ${[on, until && `until ${until}`].filter(Boolean).join(' ')}`);
  return t;
}

export function resumeTask(desk, id, { note } = {}) {
  const t = find(desk, id, 'task');
  if (!['waiting', 'dropped', 'failed', 'done', 'review', 'inbox'].includes(t.status)) throw new Error(`${t.id} is ${t.status}; nothing to resume`);
  delete t.on;
  delete t.until;
  delete t.closed;
  log(t, 'todo', note ?? 'resumed');
  return t;
}

export function doneTask(droot, desk, id, { proof, sha, force } = {}) {
  const t = id ? find(desk, id, 'task') : focus(desk);
  if (!t) throw new Error('done: no task in progress; name it (done Q-7 --proof "…")');
  if (TASK_CLOSED.includes(t.status)) throw new Error(`${t.id} is already ${t.status}`);
  const kids = tasks(desk).filter((k) => k.parent === t.id && !TASK_CLOSED.includes(k.status));
  if (kids.length && !force) throw new Error(`${t.id} still has open sub-tasks: ${kids.map((k) => k.id).join(', ')}`);
  if (!proof && !sha && !t.proof && !t.sha) throw new Error(`done needs proof: --proof "<the check that passed>"${t.done ? ` (its check: ${t.done})` : ''}`);
  if (proof) t.proof = String(proof);
  if (sha) t.sha = String(sha).slice(0, 12);
  delete t.next;
  t.closed = today();
  log(t, 'done', proof ?? (sha ? `sha ${sha}` : 'done'));
  const freed = releaseLeases(desk, t.id);
  const woke = wakeWaiting(droot, desk);
  const parents = closeParents(desk);
  return { item: t, freed, woke, parents, next: ready(droot, desk)[0] ?? null };
}

export function dropTask(desk, id, { why } = {}) {
  const it = find(desk, id);
  if (!why) throw new Error('drop needs --why "<reason>" (it is kept in the archive; undo brings it back)');
  if (it.kind !== 'task') {
    desk.items = desk.items.filter((x) => x !== it);
    return { item: it, removed: true };
  }
  const kids = tasks(desk).filter((k) => k.parent === it.id && !TASK_CLOSED.includes(k.status));
  for (const k of kids) (k.why = `parent ${it.id} dropped: ${why}`), (k.closed = today()), log(k, 'dropped', k.why);
  it.why = String(why);
  it.closed = today();
  log(it, 'dropped', why);
  releaseLeases(desk, it.id);
  return { item: it, kids };
}

export function failTask(desk, id, { why } = {}) {
  const t = find(desk, id, 'task');
  if (!why) throw new Error('fail needs --why');
  t.why = String(why);
  log(t, 'failed', why);
  releaseLeases(desk, t.id);
  return t;
}

export function splitTask(desk, id, parts, { files } = {}) {
  const t = find(desk, id, 'task');
  if (!parts.length) throw new Error('split needs the sub-task texts: split Q-7 "part a" "part b"');
  const made = [];
  let prev = null;
  for (const text of parts) {
    const { item } = addTask(desk, { text, prio: t.prio, parent: t.id, plan: t.plan, deps: prev ? [prev.id] : [], files, note: `split from ${t.id}` });
    made.push(item);
    prev = item;
  }
  if (t.status === 'doing' && isLead(t)) log(t, 'todo', `split into ${made.map((m) => m.id).join(', ')}`);
  else log(t, null, `split into ${made.map((m) => m.id).join(', ')}`);
  return { item: t, made };
}

export function wakeWaiting(droot, desk) {
  const woke = [];
  const byId = new Map(desk.items.map((i) => [i.id, i]));
  for (const t of tasks(desk, 'waiting')) {
    const dep = /^Q-\d+$/.test(t.on ?? '') ? byId.get(t.on) : null;
    const depDone = dep ? dep.status === 'done' : /^Q-\d+$/.test(t.on ?? '') && findArchived(droot, t.on)?.status === 'done';
    const due = t.until && t.until <= today();
    if (depDone || due) {
      const why = depDone ? `${t.on} done` : `until ${t.until} reached`;
      delete t.on;
      delete t.until;
      log(t, 'todo', `woke: ${why}`);
      woke.push(`${t.id} (${why})`);
    }
  }
  return woke;
}

function closeParents(desk) {
  const closed = [];
  for (;;) {
    const p = tasks(desk, ...TASK_OPEN).find((x) => {
      const kids = tasks(desk).filter((k) => k.parent === x.id);
      return kids.length && kids.every((k) => TASK_CLOSED.includes(k.status)) && kids.some((k) => k.status === 'done');
    });
    if (!p) return closed;
    p.proof = `sub-tasks done: ${tasks(desk).filter((k) => k.parent === p.id).map((k) => k.id).join(', ')}`;
    p.closed = today();
    log(p, 'done', p.proof);
    closed.push(p.id);
  }
}

export function releaseLeases(desk, holder) {
  const freed = [];
  for (const [name, l] of Object.entries(desk.leases ?? {}))
    if (l.holder === holder) {
      delete desk.leases[name];
      freed.push(name);
    }
  return freed;
}

export function touch(desk, id) {
  const it = find(desk, id);
  it.uses = (it.uses ?? 0) + 1;
  it.last = today();
  return it;
}

const similar = (a, b) => {
  const A = new Set(words(a).filter((w) => !STOP.has(w)));
  const B = new Set(words(b).filter((w) => !STOP.has(w)));
  if (!A.size || !B.size) return false;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n >= Math.min(3, A.size, B.size) && n / Math.min(A.size, B.size) >= 0.6;
};

export function remember(desk, text, { prio, pin, auto } = {}) {
  if (!text || !String(text).trim()) throw new Error('remember needs the fact or decision');
  const dup = memories(desk).find((m) => similar(m.text, text));
  if (dup) {
    dup.uses = (dup.uses ?? 0) + 1;
    dup.last = today();
    if (pin) dup.pin = true;
    return { item: dup, merged: true };
  }
  const it = newItem(desk, 'memory', { prio: prioOf(prio), text: String(text).trim(), pin: pin || undefined, auto: auto || undefined });
  return { item: it, merged: false };
}

export function lesson(desk, text, { auto } = {}) {
  if (!text || !String(text).trim()) throw new Error('lesson needs the text');
  const dup = lessons(desk).find((l) => similar(l.text, text));
  if (dup) {
    dup.seen = (dup.seen ?? 1) + 1;
    dup.last = today();
    return { item: dup, merged: true, ripe: dup.seen >= PROPOSE_SEEN && !dup.proposal };
  }
  const it = newItem(desk, 'lesson', { text: String(text).trim(), seen: 1, auto: auto || undefined });
  return { item: it, merged: false, ripe: false };
}

export function setGoal(desk, lines) {
  const g = lines.flatMap((l) => String(l).split('\n')).map((l) => l.trim()).filter(Boolean);
  if (!g.length) throw new Error('goal needs at least one line');
  if (g.length > CAPS.goal) throw new Error(`goal holds at most ${CAPS.goal} lines: the destination and how we know we arrived`);
  desk.goal = g;
  return g;
}

export function addInbox(desk, text, { auto } = {}) {
  const t = newItem(desk, 'task', { status: 'inbox', prio: 'P2', text: String(text).trim(), auto: auto || undefined });
  log(t, null, 'captured');
  return t;
}

export function fileItem(desk, id, as, prio) {
  const it = find(desk, id);
  if (it.status !== 'inbox') throw new Error(`${it.id} is not in the inbox`);
  if (as === 'task' || as === 'todo') {
    if (prio) it.prio = prioOf(prio);
    log(it, 'todo', 'filed from inbox');
    return it;
  }
  desk.items = desk.items.filter((x) => x !== it);
  if (as === 'memory') return remember(desk, it.text, { prio }).item;
  if (as === 'lesson') return lesson(desk, it.text).item;
  throw new Error('file ID task|memory|lesson [P0-3]');
}

export function undo(droot) {
  const p = paths(droot);
  return withLock(p.dir, () => {
    let all = [];
    try {
      all = fs.readdirSync(p.undo).sort();
    } catch {
    }
    const last = all.pop();
    if (!last) throw new Error('nothing to undo');
    const text = read(path.join(p.undo, last));
    const desk = normalize(JSON.parse(text));
    fs.rmSync(path.join(p.undo, last));
    save(droot, desk);
    return { op: last.replace(/^\d+-/, '').replace(/\.json$/, ''), left: all.length };
  });
}

function staleBefore(state) {
  const s = state?.sessions ?? [];
  return s.length > STALE_SESSIONS ? s[s.length - 1 - STALE_SESSIONS] : null;
}
const DOWN = { P0: 'P1', P1: 'P2', P2: 'P3', P3: null };

export function autoSort(droot, desk, state) {
  const moves = [];
  const cut = staleBefore(state);
  for (const t of tasks(desk, 'todo')) {
    if (!cut || t.last >= cut || t.parent) continue;
    const to = DOWN[t.prio];
    if (to) {
      moves.push(`${t.id} ${t.prio}→${to}`);
      t.prio = to;
      t.last = today();
    } else {
      t.why = `stale: untouched for ${STALE_SESSIONS} sessions`;
      t.closed = today();
      log(t, 'dropped', t.why);
      moves.push(`${t.id} dropped (stale)`);
    }
  }
  const mem = memories(desk);
  for (const m of mem) if (m.pin && cut && m.last < cut) (m.pin = false), moves.push(`${m.id} unpinned (unused)`);
  for (const m of sortMem(mem.filter((x) => !x.pin && (x.uses ?? 0) >= PROMOTE_USES)))
    if (mem.filter((x) => x.pin).length < CAPS.pinned) (m.pin = true), moves.push(`${m.id} pinned (used ${m.uses}×)`);
  const pinned = sortMem(mem.filter((x) => x.pin));
  for (const m of pinned.slice(CAPS.pinned)) (m.pin = false), moves.push(`${m.id} unpinned (over ${CAPS.pinned})`);
  moves.push(...wakeWaiting(droot, desk).map((w) => `${w} → todo`));
  return moves;
}
const sortMem = (list) => [...list].sort((a, b) => a.prio.localeCompare(b.prio) || (b.uses ?? 0) - (a.uses ?? 0));

export function bumpMatches(desk, { text = '', file = null } = {}) {
  const tokens = new Set(words(text).filter((w) => !STOP.has(w)));
  const hit = [];
  for (const it of desk.items) {
    if (it.kind === 'task' && TASK_CLOSED.includes(it.status)) continue;
    let yes = false;
    if (text && new RegExp(`(?<![\\w-])${it.id}(?![\\w-])`, 'i').test(text)) yes = true;
    else if (file && [...(it.refs ?? []), ...(it.files ?? [])].some((r) => file === r || file.endsWith('/' + r) || r.endsWith('/' + file))) yes = it.last !== today();
    else if (text) {
      const own = new Set(words(it.text).filter((w) => !STOP.has(w)));
      let n = 0;
      for (const w of own) if (tokens.has(w)) n++;
      yes = n >= 2 && n >= Math.ceil(0.5 * Math.min(own.size, tokens.size, 6));
    }
    if (yes) {
      if (it.last !== today()) it.uses = (it.uses ?? 0) + 1;
      it.last = today();
      hit.push(it);
    }
  }
  return hit;
}

const archDir = (droot) => path.join(droot, DESK, 'archive');
const startedAt = (t) => (t.history ?? []).find((h) => h.status === 'doing')?.at;
const failsOf = (t) => (t.history ?? []).filter((h) => h.status === 'failed' || /^dispatched .*fails=/.test(h.note ?? '')).length;
export function summary(t, closedAt = null) {
  return clean({
    id: t.id, kind: t.kind, status: t.kind === 'task' ? t.status : 'archived', prio: t.prio, text: t.text, done: t.done,
    proof: t.proof, why: t.why, sha: t.sha, plan: t.plan, role: t.role, executor: t.executor, agent: t.agent, model: t.model,
    route: t.route, parent: t.parent, created: t.created, started: startedAt(t), closed: closedAt ?? t.history?.at(-1)?.at ?? nowIso(),
    fails: failsOf(t) || undefined, uses: t.uses, seen: t.seen, pin: t.pin,
  });
}
function appendArchive(droot, sum) {
  const f = path.join(archDir(droot), `${String(sum.closed).slice(0, 7)}.jsonl`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.appendFileSync(f, JSON.stringify(sum) + '\n');
}
function archiveClosed(droot, desk) {
  const closed = desk.items.filter((i) => i.kind === 'task' && TASK_CLOSED.includes(i.status));
  for (const t of closed) {
    if (t.archived) continue;
    t.archived = today();
    const line = `- ${today()} ${ICON[t.status]} ${t.id} ${t.prio} ${t.text}${t.proof ? ` — ${t.proof}` : ''}${t.why ? ` — ${t.why}` : ''}${t.sha ? ` @${t.sha}` : ''}\n`;
    const md = path.join(archDir(droot), `${today().slice(0, 7)}.md`);
    fs.mkdirSync(path.dirname(md), { recursive: true });
    fs.appendFileSync(md, (fs.existsSync(md) ? '' : `# Archive ${today().slice(0, 7)}\n\n`) + line);
    appendArchive(droot, summary(t));
  }
  const keep = new Set(
    [...closed]
      .sort((a, b) => String(b.history?.at(-1)?.at ?? '').localeCompare(String(a.history?.at(-1)?.at ?? '')) || idNum(b) - idNum(a))
      .slice(0, CAPS.keepClosed)
      .map((t) => t.id),
  );
  desk.items = desk.items.filter((i) => !(i.kind === 'task' && TASK_CLOSED.includes(i.status) && !keep.has(i.id)));
}

const parseLines = (text) =>
  (text ?? '')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
const monthFiles = (droot) => {
  try {
    return fs.readdirSync(archDir(droot)).filter((f) => /^\d{4}-\d\d\.jsonl$/.test(f)).sort().reverse();
  } catch {
    return [];
  }
};
const legacy = (droot) => parseLines(read(paths(droot).archive)).map((e) => ({ ...summary(e.item ?? e, e.at), status: e.status ?? e.item?.status }));

export function findArchived(droot, id) {
  for (const f of monthFiles(droot)) {
    const hit = parseLines(read(path.join(archDir(droot), f))).filter((e) => e.id === id).at(-1);
    if (hit) return hit;
  }
  return legacy(droot).filter((e) => e.id === id).at(-1) ?? null;
}

export function archived(droot, n = 20) {
  let out = [];
  for (const f of monthFiles(droot)) {
    out = [...parseLines(read(path.join(archDir(droot), f))), ...out];
    if (out.length >= n) break;
  }
  if (out.length < n) out = [...legacy(droot), ...out];
  return out.slice(-n);
}

export function restore(droot, desk, id) {
  const want = String(id).toUpperCase();
  if (desk.items.some((i) => i.id === want && !(i.kind === 'task' && TASK_CLOSED.includes(i.status)))) throw new Error(`${want} is on the desk already${want.startsWith('Q-') ? ` (resume ${want})` : ''}`);
  const e = findArchived(droot, want);
  if (!e) throw new Error(`${want} is not in the archive`);
  desk.items = desk.items.filter((i) => i.id !== want);
  const kind = e.kind ?? 'task';
  const { status, closed, started, fails, ...rest } = e;
  const it = clean({ ...rest, kind, ...(kind === 'task' ? { status: 'todo' } : {}), last: today() });
  if (kind === 'task') log(it, null, `restored from the archive (was ${status})`);
  desk.items.push(it);
  return it;
}

export function compact(droot, desk, state) {
  const moves = [];
  const p = paths(droot);
  const old = legacy(droot);
  if (old.length) {
    for (const e of old) appendArchive(droot, e);
    fs.rmSync(p.archive, { force: true });
    moves.push(`archive.jsonl → monthly files (${old.length})`);
  }
  const s = state?.sessions ?? [];
  const cut = (n) => (s.length > n ? s[s.length - 1 - n] : null);
  const memCut = cut(30);
  const lesCut = cut(20);
  const retire = desk.items.filter((i) => (i.kind === 'memory' && !i.pin && memCut && i.last < memCut) || (i.kind === 'lesson' && (i.seen ?? 1) < 2 && !i.proposal && lesCut && i.last < lesCut));
  for (const i of retire) appendArchive(droot, summary(i, nowIso()));
  if (retire.length) {
    desk.items = desk.items.filter((i) => !retire.includes(i));
    moves.push(`retired ${retire.map((i) => i.id).join(', ')} (restore ID brings one back)`);
  }
  const specs = path.join(droot, DESK, 'plans', 'specs');
  let gone = 0;
  try {
    const open = new Set(tasks(desk, ...TASK_OPEN).map((t) => t.id));
    for (const f of fs.readdirSync(specs).filter((x) => x.endsWith('.sent.md'))) {
      const fp = path.join(specs, f);
      if (!open.has(f.replace(/\.sent\.md$/, '')) && Date.now() - fs.statSync(fp).mtimeMs > 30 * 864e5) fs.rmSync(fp), gone++;
    }
  } catch {
  }
  if (gone) moves.push(`deleted ${gone} old sent brief(s)`);
  return moves;
}

const median = (xs) => {
  if (!xs.length) return null;
  const a = [...xs].sort((x, y) => x - y);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};
const hours = (a, b) => (Date.parse(b) - Date.parse(a)) / 36e5;
export const QUIET_MIN = 15;

export function metrics(droot, desk, { now = Date.now(), recent = null } = {}) {
  const arch = recent ?? archived(droot, 400);
  const byId = new Map();
  for (const e of arch) if (e.kind !== 'memory' && e.kind !== 'lesson') byId.set(e.id, e);
  for (const t of tasks(desk, ...TASK_CLOSED)) byId.set(t.id, summary(t));
  const closed = [...byId.values()];
  const week = closed.filter((e) => now - Date.parse(e.closed) < 7 * 864e5);
  const done7 = week.filter((e) => e.status === 'done');
  const cycles = done7.filter((e) => e.started).map((e) => hours(e.started, e.closed));
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * 864e5).toISOString().slice(0, 10);
    return { day, done: done7.filter((e) => String(e.closed).slice(0, 10) === day).length };
  });
  const lastAt = (t) => t.history?.at(-1)?.at;
  const running = tasks(desk, 'doing').filter((t) => !isLead(t));
  const quiet = running.filter((t) => lastAt(t) && now - Date.parse(lastAt(t)) > QUIET_MIN * 6e4).map((t) => ({ id: t.id, minutes: Math.round((now - Date.parse(lastAt(t))) / 6e4) }));
  const asks = tasks(desk, ...TASK_OPEN).filter((t) => t.question);
  const failed = tasks(desk, 'failed');
  const reasons = { red: [], yellow: [] };
  if (failed.length) reasons.red.push(`${failed.length} failed task(s)`);
  for (const q of quiet) (q.minutes > 2 * QUIET_MIN ? reasons.red : reasons.yellow).push(`${q.id} quiet ${q.minutes} min`);
  for (const t of asks) (t.question.at && now - Date.parse(t.question.at) > 30 * 6e4 ? reasons.red : reasons.yellow).push(`${t.id} asks a question`);
  const rv = tasks(desk, 'review');
  if (rv.length) reasons.yellow.push(`${rv.length} report(s) to verify`);
  const inbox = tasks(desk, 'inbox');
  if (inbox.length) reasons.yellow.push(`${inbox.length} unsorted in the inbox`);
  const pend = listReview(droot).filter((r) => !r.archived && r.status === 'pending');
  if (pend.length) reasons.yellow.push(`${pend.length} proposal(s) waiting for you`);
  const level = reasons.red.length ? 'red' : reasons.yellow.length ? 'yellow' : 'green';
  const models = {};
  for (const e of [...closed, ...tasks(desk, 'doing', 'review').map((t) => summary(t))].filter((e) => e.executor === 'orca' || e.agent)) {
    const k = `${e.agent ?? '?'}${e.model ? ':' + e.model : ''}`;
    const m = (models[k] ??= { model: k, dispatched: 0, running: 0, done: 0, failed: 0, escalated: 0, cycles: [] });
    m.dispatched++;
    if (['doing', 'review'].includes(e.status)) m.running++;
    if (e.status === 'done') m.done++;
    if (e.status === 'failed' || e.fails) m.failed++;
    if (/@/.test(e.route ?? '') && e.fails >= 2) m.escalated++;
    if (e.status === 'done' && e.started) m.cycles.push(hours(e.started, e.closed));
  }
  return {
    health: { level, reasons: [...reasons.red, ...reasons.yellow] },
    done7: done7.length,
    closed7: week.length,
    cycleHours: median(cycles),
    rework: done7.length ? done7.filter((e) => e.fails).length / done7.length : 0,
    perDay,
    quiet,
    models: Object.values(models).map(({ cycles: c, ...m }) => ({ ...m, cycleHours: median(c) })),
  };
}

const short = (s, n = 100) => {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};
export const fmt = (t) => `${t.id} ${t.prio ?? ''} ${short(t.text)}`.replace(/\s+/g, ' ');
const owner = (t) => (t.executor && t.executor !== 'lead' ? ` [${[t.role, t.agent && `${t.agent}${t.model ? ':' + t.model : ''}`].filter(Boolean).join(' · ') || t.executor}]` : '');
const waitWhy = (t) => [t.on && `on ${t.on}`, t.until && `until ${t.until}`].filter(Boolean).join(', ');

export function surface(droot, desk, { state = null, moves = [], cmd = 'node .agentkit/desk.mjs' } = {}) {
  const m = findManifest(droot)?.data;
  const out = [];
  out.push(`[desk] ${m?.profession?.title ?? 'Work'} desk · session ${state?.session ?? '?'} · change it only with \`${cmd} <verb>\` (help: \`${cmd} help\`).`);
  out.push(desk.goal.length ? `Goal: ${desk.goal.join(' / ')}` : `Goal: not set → take it from what the user asks for (README and git log are background, not the goal), \`${cmd} goal "…"\`, and say it in one line.`);
  const cur = focus(desk);
  const rd = ready(droot, desk);
  if (cur) out.push(`Now: ${fmt(cur)} · done: ${cur.done ?? '(set it: edit --done)'}${cur.next ? ` · next: ${short(cur.next, 80)}` : ''}`);
  else out.push(rd.length ? `Now: empty → \`${cmd} start ${rd[0].id}\` or take the user's request (\`${cmd} add P1 "…" --done "…" --now\`).` : `Now: empty → the user's next work request becomes the task: \`${cmd} add P1 "…" --done "<check>" --now\`.`);
  const waiting = tasks(desk, 'waiting');
  if (waiting.length) out.push(`Waiting: ${waiting.slice(0, 4).map((t) => `${t.id} (${waitWhy(t)})`).join(', ')}${waiting.length > 4 ? ` +${waiting.length - 4}` : ''}`);
  const up = rd.filter((t) => t !== cur && isLead(t));
  if (up.length) out.push(`Next: ${up.slice(0, 3).map(fmt).join(' | ')}${up.length > 3 ? ` (+${up.length - 3})` : ''}`);
  const team = tasks(desk, 'doing', 'review').filter((t) => !isLead(t));
  const asks = tasks(desk, ...TASK_OPEN).filter((t) => t.question);
  if (team.length || asks.length) {
    const running = team.filter((t) => t.status === 'doing');
    const rev = team.filter((t) => t.status === 'review');
    out.push(`Team: ${running.length} running${running.length ? ` (${running.slice(0, 3).map((t) => `${t.id}${owner(t)}`).join(', ')})` : ''}${rev.length ? `, verify ${rev.map((t) => t.id).join(' ')}` : ''}${asks.length ? `, answer ${asks.map((t) => t.id).join(' ')}` : ''} → \`${cmd} mail\` when woken.`);
  }
  const pinned = sortMem(memories(desk).filter((x) => x.pin));
  if (pinned.length) out.push('Memory: ' + pinned.map((x) => `${x.id} ${short(x.text, 90)}`).join(' · '));
  const inbox = tasks(desk, 'inbox');
  if (inbox.length) out.push(`Inbox: ${inbox.length} → sort before ending (\`${cmd} file ID task|memory|lesson\` or drop).`);
  const review = listReview(droot).filter((r) => !r.archived);
  const approved = review.filter((r) => r.kind === 'P' && r.status === 'approved');
  const pend = review.filter((r) => r.status === 'pending');
  if (approved.length) out.push(`Approved — apply first: ${approved.map((r) => `${r.id} ${r.title}`).join('; ')}`);
  if (pend.length) out.push(`Waiting for the user's decision (do not apply): ${pend.map((r) => r.id).join(', ')}`);
  const ripe = lessons(desk).filter((l) => (l.seen ?? 1) >= PROPOSE_SEEN && !l.proposal);
  if (ripe.length) out.push(`Lessons seen ≥${PROPOSE_SEEN}×: ${ripe.map((l) => l.id).join(', ')} → propose a durable fix (\`${cmd} propose … --from ${ripe[0].id}\`).`);
  const local = parseRules(read(path.join(droot, DESK, LOCAL_RULES))).rules;
  if (local.length) out.push('Project rules: ' + local.map((r) => `${r.id} ${r.kind}${r.kind === 'off' ? '' : ` ${short(r.summary, 70)}`}`).join(' · '));
  if (moves.length) out.push('Auto-sorted: ' + moves.join('; '));
  return out.join('\n');
}

export function renderMd(droot, desk) {
  const m = findManifest(droot)?.data;
  const L = [];
  const t = (title, list, f = (x) => `- ${ICON[x.status] ?? ''} **${x.id}** ${x.prio ?? ''} ${x.text}${owner(x)}`) => {
    if (!list.length) return;
    L.push(`## ${title}`, '', ...list.map(f), '');
  };
  L.push(`# Desk — ${m?.profession?.title ?? 'Work'}`, '', '> Generated by agent-work-kit from `desk.json`. Do not edit; the agent changes it with `node .agentkit/desk.mjs`.', '');
  L.push('## Goal', '', ...(desk.goal.length ? desk.goal.map((g) => `- ${g}`) : ['- _(not set yet)_']), '');
  const cur = focus(desk);
  t('Now', cur ? [cur] : [], (x) => `- 🔵 **${x.id}** ${x.prio} ${x.text}\n  - done: ${x.done ?? '—'}${x.next ? `\n  - next: ${x.next}` : ''}`);
  t('Team', sortTasks(tasks(desk, 'doing', 'review').filter((x) => !isLead(x))), (x) => `- ${ICON[x.status]} **${x.id}** ${x.prio} ${x.text}${owner(x)}${x.plan ? ` · plan ${x.plan}` : ''}${x.question ? `\n  - ❓ ${x.question.text}` : ''}`);
  t('Waiting', tasks(desk, 'waiting'), (x) => `- ⏸ **${x.id}** ${x.prio} ${x.text} — ${waitWhy(x)}`);
  t('Queue', sortTasks(tasks(desk, 'todo')), (x) => `- ⬜ **${x.id}** ${x.prio} ${x.text}${owner(x)}${x.deps?.length ? ` · after ${x.deps.join(', ')}` : ''}${x.next ? `\n  - next: ${x.next}` : ''}`);
  t('Inbox', tasks(desk, 'inbox'), (x) => `- 📥 **${x.id}** ${x.text}`);
  const mem = sortMem(memories(desk));
  t('Memory', mem, (x) => `- ${x.pin ? '📌' : '·'} **${x.id}** ${x.prio} ${x.text}`);
  t('Lessons', lessons(desk), (x) => `- **${x.id}** ×${x.seen ?? 1} ${x.text}${x.proposal ? ` → ${x.proposal}` : ''}`);
  t('Recently closed', tasks(desk, ...TASK_CLOSED), (x) => `- ${ICON[x.status]} **${x.id}** ${x.text}${x.proof ? ` — ${x.proof}` : ''}${x.why ? ` — ${x.why}` : ''}`);
  const leases = Object.entries(desk.leases ?? {});
  if (leases.length) L.push('## Leases', '', ...leases.map(([k, l]) => `- 🔒 ${k} held by ${l.holder} until ${l.expires}`), '');
  return L.join('\n').replace(/\n{3,}/g, '\n\n');
}

const onPath = (cmd) => (path.isAbsolute(cmd) ? fs.existsSync(cmd) : (process.env.PATH ?? '').split(path.delimiter).some((d) => d && ['', '.exe', '.cmd'].some((x) => fs.existsSync(path.join(d, cmd + x)))));
function planGit(droot) {
  const out = {};
  const root = mainRoot(droot);
  let cur = null;
  for (const l of (git(root, ['worktree', 'list', '--porcelain']) ?? '').split('\n')) {
    if (l.startsWith('worktree ')) cur = l.slice(9);
    else if (l.startsWith('branch refs/heads/plan/')) out[l.slice(23)] = { worktree: cur };
  }
  for (const b of (git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads/plan/']) ?? '').split('\n').filter(Boolean)) out[b.slice(5)] ??= { worktree: null };
  return out;
}

export function refreshViews(droot) {
  try {
    const desk = load(droot);
    writeAtomic(paths(droot).md, renderMd(droot, desk));
    renderHtml(droot, desk);
  } catch {
  }
}

export function renderHtml(droot, desk) {
  const tpl = read(path.join(HERE, 'dashboard.html'));
  if (!tpl || !tpl.includes('/*DESK*/')) return;
  const m = findManifest(droot)?.data;
  const team = readJson(path.join(droot, DESK, 'team.json'), {}) ?? {};
  const recent = archived(droot, 400);
  const payload = JSON.stringify({
    ...desk,
    title: m?.profession?.title ?? 'Work',
    generated: nowIso(),
    review: listReview(droot).filter((r) => !r.archived).map(({ id, title, status }) => ({ id, title, status })),
    team: { maxWorkers: team.maxWorkers ?? 3, maxPlanWorktrees: team.maxPlanWorktrees ?? 3, roles: Object.keys(team.routing?.roles ?? {}), exclusive: team.test?.exclusive || null, orca: onPath(process.env.AGENTKIT_ORCA || 'orca') },
    plans: planGit(droot),
    recent: recent.slice(-120),
    metrics: metrics(droot, desk, { recent }),
  }).replace(/</g, '\\u003c');
  const start = tpl.indexOf('/*DESK*/');
  const end = tpl.indexOf('/*END*/') + '/*END*/'.length;
  writeAtomic(paths(droot).html, tpl.slice(0, start) + payload + tpl.slice(end));
}

const ITEM_RE = /^- (P[0-3]) ([A-Z]+-\d+) (.+?)\s*[·|]\s*\+(\d{4}-\d\d-\d\d)\s*[·|]\s*[×x](\d+)\s*[·|]\s*@(\d{4}-\d\d-\d\d)\s*$/;
const strip = (t) => (t ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/^```[\s\S]*?^```/gm, '');
export function parseV1Items(text) {
  const items = [];
  let divider = -1;
  let cur = null;
  for (const line of strip(text).split('\n')) {
    if (/^---\s*$/.test(line)) {
      if (divider < 0) divider = items.length;
      cur = null;
      continue;
    }
    const m = ITEM_RE.exec(line);
    if (m) {
      cur = { prio: m[1], id: m[2], text: m[3].trim(), created: m[4], uses: Number(m[5]), last: m[6], sub: {} };
      items.push(cur);
    } else if (cur && /^\s+- (\w+):\s*(.*)$/.test(line)) {
      const [, k, v] = /^\s+- (\w+):\s*(.*)$/.exec(line);
      cur.sub[k.toLowerCase()] = v.trim();
    } else if (line.startsWith('- ')) cur = null;
  }
  return { items, divider };
}

export function migrateV1(droot) {
  const dir = path.join(droot, DESK);
  const z = (f) => read(path.join(dir, f));
  const desk = emptyDesk();
  const lines = (t) => strip(t).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  desk.goal = lines(z('goal.md')).map((l) => l.replace(/^[-*]\s*/, '')).slice(0, CAPS.goal);
  const seq = { Q: 0, M: 0, L: 0 };
  const take = (it, extra) => {
    const [k, n] = it.id.split('-');
    if (seq[k] !== undefined) seq[k] = Math.max(seq[k], Number(n));
    return clean({ id: it.id, prio: it.prio, text: it.text, created: it.created, uses: it.uses, last: it.last, ...extra });
  };
  for (const it of parseV1Items(z('now.md')).items) desk.items.push(take(it, { kind: 'task', status: 'doing', done: it.sub.done, next: it.sub.next, refs: csv(it.sub.ref) }));
  for (const it of parseV1Items(z('queue.md')).items) desk.items.push(take(it, { kind: 'task', status: 'todo', done: it.sub.done, next: it.sub.next, refs: csv(it.sub.ref) }));
  const mem = parseV1Items(z('memory.md'));
  mem.items.forEach((it, i) => desk.items.push(take(it, { kind: 'memory', pin: mem.divider < 0 || i < mem.divider ? true : undefined })));
  for (const it of parseV1Items(z('notebook.md')).items) desk.items.push(take(it, { kind: 'lesson', seen: it.uses, proposal: it.sub.proposal })), delete desk.items.at(-1).prio;
  for (const l of lines(z('inbox.md'))) {
    seq.Q++;
    desk.items.push({ id: `Q-${seq.Q}`, kind: 'task', status: 'inbox', prio: 'P2', text: l.replace(/^[-*]\s*/, ''), created: today(), last: today(), uses: 1 });
  }
  const leads = desk.items.filter((i) => i.status === 'doing');
  for (const extra of leads.slice(1)) extra.status = 'todo';
  try {
    for (const f of fs.readdirSync(path.join(dir, 'archive')))
      for (const mm of (read(path.join(dir, 'archive', f)) ?? '').matchAll(/\b([QML])-(\d+)\b/g)) seq[mm[1]] = Math.max(seq[mm[1]], Number(mm[2]));
  } catch {
  }
  desk.seq = { ...desk.seq, ...seq };
  const old = path.join(dir, 'archive', 'v1');
  fs.mkdirSync(old, { recursive: true });
  for (const f of ['goal.md', 'now.md', 'queue.md', 'inbox.md', 'memory.md', 'notebook.md'])
    if (fs.existsSync(path.join(dir, f))) fs.renameSync(path.join(dir, f), path.join(old, f));
  desk.migrated = { from: 1, at: nowIso() };
  save(droot, desk);
  return desk;
}
