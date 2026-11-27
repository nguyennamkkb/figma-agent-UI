#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { readStdinJson, projectDir, deskRoot, git, findManifest, readState, writeState, DESK } from './_lib.mjs';
import { hasDesk, load, tasks, focus, paths, TASK_OPEN } from './store.mjs';
import { workerContext } from './team.mjs';

const SKIP = new Set(['.git', 'node_modules', DESK, '.agentkit', '.agents', '.pi', '.omp', '.opencode', '.claude', '.codex', '.cursor', 'dist', 'build', '.next', '.cache', 'vendor', 'Pods', 'DerivedData']);
function newerThan(root, since, kitFiles, max = 3000) {
  const out = [];
  let seen = 0;
  const walk = (dir, rel, depth) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (++seen > max || depth > 5) return;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!SKIP.has(e.name)) walk(path.join(dir, e.name), r, depth + 1);
      } else if (!kitFiles.includes(r) && !/^(AGENTS|CLAUDE)\.md$/.test(r)) {
        try {
          if (fs.statSync(path.join(dir, e.name)).mtimeMs > since) out.push(r);
        } catch {
        }
      }
    }
  };
  walk(root, '', 0);
  return out;
}

const input = await readStdinJson();
if (input.stop_hook_active) process.exit(0);
const checkout = projectDir(input);
const droot = deskRoot(checkout);
if (!hasDesk(droot)) process.exit(0);
const C = 'node .agentkit/desk.mjs';
const desk = load(droot);
const problems = [];

const w = workerContext(droot, checkout);
if (w) {
  const id = /You are a worker: (Q-\d+)/.exec(w)?.[1] ?? '<task id>';
  problems.push(`you are worker ${id}: report before stopping — \`worker ${id} done --outcome … --summary "…"\` (the REPORT commands in your brief) when finished, or \`ask\`/\`escalate\` if you are waiting (then end your turn)`);
} else {
  const inbox = tasks(desk, 'inbox');
  if (inbox.length) problems.push(`the inbox holds ${inbox.length} item(s) (${inbox.map((t) => t.id).join(', ')}) — \`${C} file ID task|memory|lesson\` or \`drop ID --why\``);
  const kitFiles = Object.keys(findManifest(checkout)?.data?.files ?? {}).concat('.agentkit.json');
  const mtime = (f) => {
    try {
      return fs.statSync(f).mtimeMs;
    } catch {
      return 0;
    }
  };
  const deskTime = mtime(paths(droot).json);
  const status = git(checkout, ['status', '--porcelain', '--untracked-files=all']);
  let changed;
  if (status != null) {
    changed = status
      .split('\n')
      .map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop())
      .filter((f) => f && !f.startsWith(DESK + '/') && !kitFiles.includes(f));
  } else changed = newerThan(checkout, deskTime, kitFiles);
  {
    if (changed.length && Math.max(...changed.map((f) => mtime(path.join(checkout, f)))) > deskTime) {
      const cur = focus(desk);
      problems.push(cur ? `${changed.length} file(s) changed after the desk — \`${C} done ${cur.id} --proof "…"\` if its check passes, else \`${C} next "…"\`` : `${changed.length} file(s) changed but no task is in progress — record the work: \`${C} add P1 "…" --done "…" --now\`, then done/next`);
    }
  }
  const review = tasks(desk, 'review');
  if (review.length) problems.push(`worker report(s) to verify: ${review.map((t) => t.id).join(', ')} (git log -1 in its worktree, diff vs plan, then \`${C} done ID --sha … --proof …\`)`);
  const asks = tasks(desk, ...TASK_OPEN).filter((t) => t.question);
  if (asks.length) problems.push(`worker question(s) waiting: ${asks.map((t) => t.id).join(', ')} — \`${C} reply ID "…"\``);
}
if (!problems.length) process.exit(0);
const state = readState(droot);
const key = problems.join('|').replace(/\d+ file\(s\)/g, 'N files');
state.reminded ??= {};
if (state.reminded.stop === key) process.exit(0);
state.reminded.stop = key;
writeState(droot, state);
process.stdout.write(JSON.stringify({ decision: 'block', reason: `[desk] Before stopping: ${problems.join('; ')}. If this turn was only a question, just stop.` }) + '\n');
