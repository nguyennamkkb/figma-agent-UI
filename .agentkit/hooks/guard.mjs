#!/usr/bin/env node
import path from 'node:path';
import { read, readStdinJson, projectDir, deskRoot, findManifest, DESK, LOCAL_RULES, lintLocalRules, normalizeWrites, toPosix } from './_lib.mjs';
import { hasDesk, load, mutate, bumpMatches } from './store.mjs';

const START = '<!-- agentkit:start -->';
const END = '<!-- agentkit:end -->';
const input = await readStdinJson();
const checkout = projectDir(input);
const droot = deskRoot(checkout);
const writes = normalizeWrites(checkout, input.tool_name, input.tool_input ?? {}, input.cwd);
if (!writes.length) process.exit(0);

const C = 'node .agentkit/desk.mjs';
const KIT_HINT = 'Kit files change only via `npx github:nguyennamkkb/agent-work-kit update`. To change how work is done, `' + C + ' propose …` and ask the user in one sentence.';
const DIRECT = [/^review\/[PU]-[\w.-]+\.md$/, /^plans\/[\w./-]+\.md$/, /^team\.json$/, new RegExp(`^${LOCAL_RULES.replace('.', '\\.')}$`)];
const problems = [];
const m = findManifest(checkout);
const touchedFiles = [];

for (const w of writes) {
  for (const base of [...new Set([checkout, droot])]) {
    const rel = toPosix(path.relative(base, w.path));
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue;
    if (rel === DESK || rel.startsWith(DESK + '/')) {
      const inner = rel.slice(DESK.length + 1);
      if (base !== droot) problems.push(`.desk/ of this worktree is a copy; the team's desk is ${path.join(droot, DESK)} — change it with \`${C}\`.`);
      else if (!DIRECT.some((re) => re.test(inner))) problems.push(`.desk/${inner} is written only by the desk command: use \`${C} <verb>\` (add, edit, start, done, wait, drop, remember, lesson, goal, … — \`${C} help\`).`);
      else if (w.deleted && inner === LOCAL_RULES) problems.push(`.desk/${LOCAL_RULES} holds the project rules; empty it instead of deleting it.`);
      else if (inner === LOCAL_RULES && w.next != null) problems.push(...lintLocalRules(droot, w.next, read(w.path) ?? ''));
      else if (inner === 'team.json' && w.next != null) {
        try {
          JSON.parse(w.next);
        } catch (e) {
          problems.push(`.desk/team.json must stay valid JSON (${e.message}); or use \`${C} team set key value\`.`);
        }
      }
      break;
    }
    if (base !== checkout || !m) continue;
    if (w.path === m.path) {
      problems.push('.agentkit.json is the kit manifest.');
      continue;
    }
    const entry = m.data.files?.[rel];
    if (!entry) {
      touchedFiles.push(rel);
      continue;
    }
    if (entry.kind === 'file') problems.push(`${rel} is installed by agent-work-kit.`);
    else if (entry.kind === 'json') problems.push(`${rel} holds kit hooks/permissions; explain the change you need to the user instead.`);
    else if (entry.kind === 'block') {
      const cur = read(w.path) ?? '';
      const s = cur.indexOf(START);
      const e = cur.indexOf(END);
      if (s >= 0 && e >= 0 && w.next != null && !w.next.includes(cur.slice(s, e + END.length))) problems.push(`the agentkit block in ${rel} must stay unchanged; edit below the end marker instead.`);
      if (w.deleted) problems.push(`${rel} holds the agentkit block; do not delete it.`);
    }
  }
}

if (problems.length) {
  const kit = problems.some((p) => /installed by|kit hooks|agentkit block|manifest/.test(p));
  process.stderr.write(`[desk] Blocked:\n- ${problems.join('\n- ')}\n${kit ? KIT_HINT : ''}\n`);
  process.exit(2);
}
if (touchedFiles.length && hasDesk(droot)) {
  try {
    const probe = load(droot);
    if (touchedFiles.some((f) => bumpMatches(JSON.parse(JSON.stringify(probe)), { file: f }).length))
      mutate(
        droot,
        'touch-file',
        (d) => {
          let n = 0;
          for (const f of touchedFiles) n += bumpMatches(d, { file: f }).length;
          return n ? n : { noop: true };
        },
        { bookkeeping: true },
      );
  } catch {
  }
}
process.exit(0);
