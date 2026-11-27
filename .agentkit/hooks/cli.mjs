import path from 'node:path';
import { projectDir, deskRoot, readState, journal } from './_lib.mjs';
import * as S from './store.mjs';
import * as T from './team.mjs';

export const HELP = `desk — the project's work board (.desk/desk.json). Every change goes through this command.
View    status · list [--all|--status s] · show ID · log [n] · compact (tidy the desk files; runs at session start)
Tasks   add [P0-3] "text" [--done "check"] [--now] [--files a,b] [--deps Q-1] [--parent Q-2] [--ref path] [--plan slug] [--role r]
        edit ID [--text|--prio|--done|--next|--files|--deps|--ref|--plan|--role "…"] · prio ID P0
        start ID [--next "where I stopped on the current one"] · next "step"
        wait ID --on user|Q-3|"who" [--until YYYY-MM-DD] · resume ID
        done [ID] --proof "check that passed" · drop ID --why "…" · split ID "part a" "part b" · undo · restore ID (from the archive)
Memory  remember "fact/decision" [--pin] · forget ID --why "…" · touch ID
Learn   lesson "…" · propose "title" --change "…" --why "…" [--from L-1] · approve P-1 --quote "…" · reject P-1
Goal    goal "line" ["line"…] · inbox "…" · file ID task|memory|lesson [P0-3]
Team    team [status|check|allow --quote "…"|set key value] · plan SLUG --goal "…" · route ROLE [--fails n]
        dispatch ID [--role r] [--spec f] [--worktree path:…] [--prefer agent:model@effort] [--fails n] [--terminal h] [--keep-open] [--dry-run]
        mail · reply ID "…" · send ID --subject PAUSE|RESUME|"REBASE <ref>"|ABORT --body "…" · sync [--apply] · fleet
        lease acquire|release|show [name] --holder ID · wt status|open SLUG [--base ref]|park|close|drop SLUG --yes|tidy · gate SLUG
Worker  worker ID status "…" | ask "…" | escalate "…" | inbox | lease acquire|release | done --outcome succeeded|failed --summary "…" [--no-commit]`;

const BOOL = new Set(['now', 'all', 'pin', 'yes', 'apply', 'dry-run', 'keep-open', 'force', 'no-commit', 'live', 'json']);
export function parse(argv) {
  const pos = [];
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      const key = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (v !== undefined) o[key] = v;
      else if (BOOL.has(k) || argv[i + 1] === undefined || argv[i + 1].startsWith('--')) o[key] = true;
      else o[key] = argv[++i];
    } else pos.push(a);
  }
  return { pos, o };
}

const ok = (s) => `✓ ${s}`;
const line = (t) => `${S.ICON[t.status] ?? '·'} ${S.fmt(t)}${t.status === 'waiting' ? ` (${[t.on && 'on ' + t.on, t.until && 'until ' + t.until].filter(Boolean).join(', ')})` : ''}`;
const isPrio = (s) => /^P[0-3]$/i.test(s ?? '');

export function run(argv, { cwd = process.cwd(), home = null, out = (s) => process.stdout.write(s + '\n') } = {}) {
  let checkout = projectDir({ cwd });
  let droot = deskRoot(checkout);
  if (!S.hasDesk(droot) && home && S.hasDesk(deskRoot(home))) (checkout = home), (droot = deskRoot(home));
  const { pos, o } = parse(argv);
  const verb = (pos.shift() ?? 'status').toLowerCase();
  const print = (x) => (Array.isArray(x) ? x.forEach((l) => out(l)) : out(x));
  const m = (op, fn) => S.mutate(droot, op, fn);
  if (!S.hasDesk(droot) && !['help', '-h', '--help'].includes(verb)) throw new Error(`no desk here (${droot}); install with \`npx github:nguyennamkkb/agent-work-kit init --<profession>\``);

  switch (verb) {
    case 'help':
    case '-h':
    case '--help':
      return print(HELP);
    case 'status':
    case 's': {
      const desk = S.load(droot);
      return print(T.workerContext(droot, checkout) ?? S.surface(droot, desk, { state: readState(droot) }));
    }
    case 'list':
    case 'ls': {
      const desk = S.load(droot);
      const want = o.status ? String(o.status).split(',') : o.all ? null : S.TASK_OPEN;
      const items = desk.items.filter((i) => (i.kind === 'task' ? !want || want.includes(i.status) : o.all || o.status === i.kind));
      return print(items.length ? S.sortTasks(items.filter((i) => i.prio)).concat(items.filter((i) => !i.prio)).map((i) => (i.kind === 'task' ? line(i) : `${i.kind === 'memory' ? (i.pin ? '📌' : '·') : '✎'} ${i.id} ${i.text}${i.seen ? ` ×${i.seen}` : ''}`)) : '(nothing)');
    }
    case 'show': {
      const it = S.find(S.load(droot), pos[0]);
      const { history, ...rest } = it;
      return print([JSON.stringify(rest), ...(history ?? []).slice(-8).map((h) => `  ${h.at} ${h.status}${h.note ? ' — ' + h.note : ''}`)]);
    }
    case 'log':
      return print(S.archived(droot, Number(pos[0] ?? 15)).map((e) => `${String(e.closed).slice(0, 10)} ${S.ICON[e.status] ?? '🗄'} ${e.id} ${e.text ?? ''}${e.proof ? ' — ' + e.proof : ''}${e.why ? ' — ' + e.why : ''}`));
    case 'restore': {
      const it = m('restore', (d) => S.restore(droot, d, pos[0]));
      return print(ok(`${it.id} restored as ${it.kind}${it.status ? ` (${it.status})` : ''}`));
    }
    case 'compact': {
      let moves = [];
      m('compact', (d) => {
        moves = S.compact(droot, d, readState(droot));
        return moves.length ? moves : { noop: true };
      });
      return print(moves.length ? moves.map((x) => ok(x)) : 'compact: nothing to do');
    }

    case 'add': {
      const prio = isPrio(pos[0]) ? pos.shift() : o.prio;
      const text = pos.join(' ') || o.text;
      const r = m('add', (d) => S.addTask(d, { text, prio, done: o.done, now: o.now, next: o.next, files: o.files, deps: o.deps, parent: o.parent, refs: o.ref, plan: o.plan, role: o.role, executor: o.executor, tier: o.tier, level: o.level }));
      return print(ok(`${r.item.id} ${r.item.prio} added${o.now ? ' and started' : ''}${r.parked ? ` (${r.parked.id} back to queue)` : ''}`));
    }
    case 'edit': {
      const id = pos.shift();
      const it = m('edit', (d) => S.editItem(d, id, { text: o.text, prio: o.prio, done: o.done, next: o.next, files: o.files, deps: o.deps, refs: o.ref, plan: o.plan, role: o.role, executor: o.executor, tier: o.tier, level: o.level, agent: o.agent, model: o.model, on: o.on, until: o.until, pin: o.pin }));
      return print(ok(`${it.id} edited`));
    }
    case 'prio': {
      const it = m('prio', (d) => S.editItem(d, pos[0], { prio: pos[1] }));
      return print(ok(`${it.id} → ${it.prio}`));
    }
    case 'start': {
      const r = m('start', (d) => S.startTask(d, pos[0], { next: o.next }));
      return print(ok(`${r.item.id} in progress${r.parked ? ` (${r.parked.id} parked${r.parked.next ? `; next: ${r.parked.next}` : ''})` : ''}${r.item.done ? ` · done: ${r.item.done}` : ' · set its check: edit ' + r.item.id + ' --done "…"'}`));
    }
    case 'next': {
      const t = m('next', (d) => S.setNext(d, pos.join(' ') || o.text, o.id));
      return print(ok(`${t.id} next: ${t.next}`));
    }
    case 'wait': {
      const t = m('wait', (d) => S.waitTask(d, pos[0], { on: o.on, until: o.until, note: o.note }));
      return print(ok(`${t.id} waiting ${[t.on && 'on ' + t.on, t.until && 'until ' + t.until].filter(Boolean).join(', ')}`));
    }
    case 'resume':
    case 'reopen': {
      const t = m('resume', (d) => S.resumeTask(d, pos[0]));
      return print(ok(`${t.id} back in the queue`));
    }
    case 'done': {
      const id = pos[0] && /^[QqMmLl]-?\d+$|^\d+$/.test(pos[0]) ? pos.shift() : null;
      const r = m('done', (d) => S.doneTask(droot, d, id, { proof: o.proof ?? (pos.join(' ') || undefined), sha: o.sha, force: o.force }));
      const extra = [r.parents.length && `also done: ${r.parents.join(', ')}`, r.woke.length && `woke ${r.woke.join(', ')}`, r.freed.length && `released ${r.freed.join(', ')}`].filter(Boolean);
      return print(ok(`${r.item.id} done${extra.length ? ` (${extra.join('; ')})` : ''}${r.next ? ` · next up: ${S.fmt(r.next)} → start ${r.next.id}` : ' · queue empty'}`));
    }
    case 'drop':
    case 'cancel': {
      const r = m('drop', (d) => S.dropTask(d, pos[0], { why: o.why ?? (pos.slice(1).join(' ') || undefined) }));
      return print(ok(`${r.item.id} ${r.removed ? 'removed' : 'dropped'}${r.kids?.length ? ` with ${r.kids.map((k) => k.id).join(', ')}` : ''} (undo brings it back)`));
    }
    case 'fail': {
      const t = m('fail', (d) => S.failTask(d, pos[0], { why: o.why }));
      return print(ok(`${t.id} failed: ${t.why}`));
    }
    case 'split': {
      const id = pos.shift();
      const r = m('split', (d) => S.splitTask(d, id, pos, { files: o.files }));
      return print(ok(`${r.item.id} → ${r.made.map((x) => x.id).join(', ')} (in order; ${r.item.id} closes when they are done)`));
    }
    case 'undo': {
      const r = S.undo(droot);
      return print(ok(`undid ${r.op} (${r.left} more step(s) can be undone)`));
    }
    case 'touch': {
      const it = m('touch', (d) => S.touch(d, pos[0]));
      return print(ok(`${it.id} ×${it.uses}`));
    }

    case 'remember': {
      const r = m('remember', (d) => S.remember(d, pos.join(' ') || o.text, { prio: o.prio, pin: o.pin }));
      return print(ok(`${r.item.id} ${r.merged ? `already known (×${r.item.uses})` : 'remembered'}${r.item.pin ? ' 📌' : ''}`));
    }
    case 'forget': {
      const r = m('forget', (d) => S.dropTask(d, pos[0], { why: o.why ?? 'forgotten' }));
      return print(ok(`${r.item.id} forgotten (undo brings it back)`));
    }
    case 'lesson': {
      const r = m('lesson', (d) => S.lesson(d, pos.join(' ') || o.text));
      return print(ok(`${r.item.id} ${r.merged ? `seen ×${r.item.seen}` : 'noted'}${r.ripe ? ` → propose a durable fix: propose "…" --change "…" --why "…" --from ${r.item.id}` : ''}`));
    }
    case 'propose': {
      const p = propose(droot, pos.join(' ') || o.title, o);
      return print(ok(`${p.id} drafted (${path.relative(checkout, p.file)}) — ask the user in one sentence; a yes → approve ${p.id} --quote "…"`));
    }
    case 'approve':
    case 'reject': {
      const r = decide(droot, pos[0], verb, o.quote ?? o.note ?? '');
      return print(ok(`${r.id} ${verb === 'approve' ? 'approved — apply it now' : 'rejected'}`));
    }
    case 'goal': {
      const g = m('goal', (d) => S.setGoal(d, pos.length ? pos : [o.text]));
      return print(ok(`goal set (${g.length} line${g.length > 1 ? 's' : ''}) — tell the user in one line`));
    }
    case 'inbox': {
      if (!pos.length) return print(S.tasks(S.load(droot), 'inbox').map(line));
      const t = m('inbox', (d) => S.addInbox(d, pos.join(' ')));
      return print(ok(`${t.id} in the inbox`));
    }
    case 'file': {
      const it = m('file', (d) => S.fileItem(d, pos[0], (pos[1] ?? 'task').toLowerCase(), pos[2] ?? o.prio));
      return print(ok(`${pos[0]} → ${it.id} ${it.kind}`));
    }

    case 'team': {
      const sub = pos.shift() ?? 'status';
      if (sub === 'allow') {
        const a = T.allowTeam(droot, o.quote ?? pos.join(' '));
        return print(ok(`workers allowed for this session ("${a.quote}")`));
      }
      if (sub === 'set') {
        const v = T.setTeam(droot, pos[0], pos.slice(1).join(' '));
        return print(ok(`team.${pos[0]} = ${JSON.stringify(v)}`));
      }
      const team = T.loadTeam(droot);
      if (sub === 'check') {
        const cats = T.catalogs(droot, { refresh: !!o.live });
        const errs = T.routingErrors(team.routing, cats);
        return print([`orca: ${T.orcaAvailable() ? 'found' : 'not installed (team mode off; solo + subagents still work)'}`, `main: ${team.mainBranch} · build: ${team.build || '(not set)'} · test: ${team.test.command || '(not set)'}${team.test.exclusive ? ` · exclusive: ${team.test.exclusive}` : ''}`, ...Object.entries(team.routing.roles).map(([r, x]) => `  ${r.padEnd(10)} ${(x.use ?? []).join(' → ')} | fallback ${(x.fallback ?? []).join(', ')}${x.escalate ? ` | escalate ${x.escalate.join(', ')}` : ''}`), ...(Object.keys(team.routing.roles).length ? [] : ['  (no agent CLI found for routing; set routing.roles in .desk/team.json)']), errs.length ? `routing: ${errs.length} error(s): ${errs.join('; ')}` : 'routing: valid']);
      }
      const s = T.teamSummary(droot);
      return print([`team: orca ${s.orca ? 'found' : 'not installed'} · workers ${s.running.length}/${team.maxWorkers} · ${s.allowed ? 'allowed this session' : 'not allowed yet this session (ask the user once, then team allow --quote)'}`, ...s.running.map((t) => `  ${line(t)} ${t.route ?? ''}`), ...s.review.map((t) => `  verify ${line(t)}${t.sha ? ' @' + t.sha : ''}`), ...s.questions.map((t) => `  answer ${t.id}: ${t.question.text}`), ...T.wtStatus(droot, team).map((w) => `  [${w.state}] plan/${w.slug} ahead ${w.ahead} · ${w.todo}`), ...Object.entries(s.leases ?? {}).map(([k, l]) => `  🔒 ${k} ${l.holder}`)]);
    }
    case 'plan': {
      const r = T.newPlan(droot, T.loadTeam(droot), pos[0], { goal: o.goal, files: o.files });
      return print(ok(`${path.relative(checkout, r.file)} ${r.created ? 'created — fill Decisions, Order and Done criteria, commit it' : 'exists'}`));
    }
    case 'route': {
      const r = T.route(droot, T.loadTeam(droot), pos[0] ?? 'engineer', { fails: Number(o.fails ?? 0), prefer: o.prefer, level: o.level, terminal: o.terminal });
      return print([...(r.skipped ?? []).map((s) => `skip ${s}`), `${r.kind}${r.cand ? ` ${r.cand.text}` : ''}${r.args ? ` → ${r.args.join(' ')}` : ''}${r.detail ? ` — ${r.detail}` : ''}`]);
    }
    case 'dispatch': {
      const r = T.dispatch(droot, pos[0], { role: o.role, spec: o.spec, worktree: o.worktree, prefer: o.prefer, fails: o.fails, terminal: o.terminal, keepOpen: o.keepOpen, dryRun: o.dryRun, force: o.force, run: o.run });
      if (r.dryRun) return print([...r.steps, `dry run: ${r.route}`, r.command, `brief: ${path.relative(checkout, r.sent)}`]);
      return print([...r.steps, ok(`${pos[0]} dispatched → ${r.route} (dispatch ${r.dispatch ?? '?'}, terminal ${r.terminal ?? '?'}) — end your turn; Orca wakes you when it reports, then run mail`)]);
    }
    case 'mail': {
      const r = T.mail(droot, { runs: o.run ? [o.run] : [] });
      return print([...r.lines, ...r.next.map((n) => `→ ${n}`)]);
    }
    case 'reply':
      return print(ok(`answered ${T.reply(droot, pos[0], pos.slice(1).join(' ') || o.body)}`));
    case 'send':
      return print(ok(`${o.subject} sent to ${T.send(droot, pos[0], o.subject, o.body ?? '')}`));
    case 'sync': {
      const r = T.sync(droot, { apply: !!o.apply });
      return print(r.lines.length ? [...r.lines, ...(r.changes.length && !o.apply ? ['rerun with --apply to write these moves'] : [])] : 'sync: nothing running');
    }
    case 'fleet': {
      const r = T.fleet(droot);
      if (r.error) throw new Error(r.error);
      return print(r.rows.length ? r.rows.map((x) => `${x.task} ${x.dispatch} ${x.status}/${x.terminalState} ${x.terminal ?? ''}${x.hint ? ` — ${x.hint}` : ''}`) : 'fleet: no workers');
    }
    case 'lease':
      return print(T.lease(droot, pos[0] ?? 'show', { resource: pos[1], holder: o.holder, ttlMin: Number(o.ttlMin ?? 90), force: o.force }));
    case 'wt': {
      const team = T.loadTeam(droot);
      const sub = pos.shift() ?? 'status';
      const done = (x) => (S.refreshViews(droot), x);
      if (sub === 'status') {
        const st = T.wtStatus(droot, team);
        return print(st.length ? st.map((w) => `[${w.state}] plan/${w.slug} ahead ${w.ahead} behind ${w.behind} · tasks ${w.tasks - w.open}/${w.tasks} closed${w.path ? ` · ${w.path}` : ''}\n   → ${w.todo}`) : 'worktrees: none');
      }
      if (sub === 'open') {
        const r = done(T.wtOpen(droot, team, pos[0], { base: o.base }));
        return print(ok(`${r.existed ? 'exists' : r.reopened ? 'reopened' : 'opened'} ${r.path}`));
      }
      if (sub === 'park') return print(ok(`plan/${pos[0]} parked @ ${done(T.wtPark(droot, pos[0])).sha.slice(0, 9)} (wt open ${pos[0]} reopens it)`));
      if (sub === 'close') return done(T.wtClose(droot, team, pos[0])), print(ok(`plan/${pos[0]} closed (merged)`));
      if (sub === 'drop') return print(ok(`plan/${pos[0]} dropped (git branch plan/${pos[0]} ${done(T.wtDrop(droot, pos[0], { yes: o.yes })).sha.slice(0, 9)} restores it)`));
      if (sub === 'tidy') {
        const acts = done(T.wtTidy(droot, team, { dryRun: o.dryRun }));
        return print(acts.length ? acts : 'tidy: nothing to do');
      }
      throw new Error('wt status|open|park|close|drop|tidy');
    }
    case 'gate': {
      const g = T.gate(droot, T.loadTeam(droot), pos[0]);
      return print([...g.checks.map((c) => `${c.ok ? '✓' : '✗'} ${c.text}`), ...g.manual.map((x) => `· you: ${x}`), g.pass ? 'gate: mechanical checks pass' : 'gate: NOT ready']);
    }
    case 'worker': {
      const id = pos.shift();
      const sub = pos.shift();
      return print(T.worker(droot, id, sub, { text: pos.join(' ') || o.text, body: o.body, outcome: o.outcome, summary: o.summary, noCommit: o.noCommit, force: o.force, action: sub === 'lease' ? pos[0] ?? 'acquire' : undefined, cwd }));
    }
    default:
      throw new Error(`unknown verb "${verb}". ${HELP.split('\n')[0]} — run \`help\``);
  }
}

import fs from 'node:fs';
import { DESK, listReview, setStatus, today } from './_lib.mjs';
function propose(droot, title, o) {
  if (!title) throw new Error('propose "title" --change "the exact change" --why "evidence" [--from L-1] [--metric "…"] [--rollback "…"]');
  if (!o.change || !o.why) throw new Error('a proposal states --change (exactly what changes) and --why (evidence: dates, errors, the user\'s words)');
  const id = S.mutate(droot, 'propose', (d) => {
    d.seq.P = (d.seq.P ?? 0) + 1;
    const pid = `P-${String(d.seq.P).padStart(3, '0')}`;
    if (o.from) S.find(d, o.from).proposal = pid;
    return pid;
  });
  const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const file = path.join(droot, DESK, 'review', `${id}-${slug || 'proposal'}.md`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `# ${id}: ${title}\n- Status: pending\n- Created: ${today()}${o.from ? `\n- From: ${o.from}` : ''}\n\n## Evidence\n${o.why}\n\n## Change\n${o.change}\n\n## Impact\n${o.impact ?? '-'}\n\n## Success metric\n${o.metric ?? '-'}\n\n## Rollback\n${o.rollback ?? 'revert the change; mark this proposal rejected'}\n`);
  return { id, file };
}
function decide(droot, id, verb, quote) {
  const p = listReview(droot).find((r) => r.kind === 'P' && r.id.toLowerCase() === String(id).toLowerCase());
  if (!p) throw new Error(`no proposal ${id} in .desk/review/`);
  if (verb === 'approve' && !quote) throw new Error('approve needs --quote "<the user\'s words>" — only the user approves');
  setStatus(p.file, verb === 'approve' ? 'approved' : 'rejected', quote ? `"${quote}"` : '');
  if (verb === 'reject') fs.renameSync(p.file, path.join(droot, DESK, 'archive', path.basename(p.file)));
  journal(droot, { s: readState(droot).session, decided: p.id, verb, quote });
  return p;
}

export function main(argv, { home = null } = {}) {
  try {
    run(argv, { home });
    return 0;
  } catch (e) {
    process.stderr.write(`✗ ${e.message}\n`);
    return 1;
  }
}
