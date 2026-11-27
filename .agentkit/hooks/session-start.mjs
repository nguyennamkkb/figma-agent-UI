#!/usr/bin/env node
import path from 'node:path';
import { readStdinJson, projectDir, deskRoot, bumpSession, readState, writeState, git, read, findManifest, emitContext } from './_lib.mjs';
import { hasDesk, load, mutate, autoSort, compact, surface } from './store.mjs';
import { workerContext } from './team.mjs';

const input = await readStdinJson();
const checkout = projectDir(input);
const droot = deskRoot(checkout);
if (!hasDesk(droot)) process.exit(0);
const worker = workerContext(droot, checkout);
if (worker) {
  emitContext('SessionStart', worker);
  process.exit(0);
}
const prev = readState(droot);
const resumed = input.session_id && prev.lastSessionId === input.session_id;
const startup = (!input.source || input.source === 'startup') && !resumed;
const state = startup ? bumpSession(droot) : prev;
if (input.session_id && state.lastSessionId !== input.session_id) {
  state.lastSessionId = input.session_id;
  writeState(droot, state);
}
let moves = [];
if (startup)
  mutate(droot, 'auto-sort', (d) => {
    moves = [...autoSort(droot, d, state), ...compact(droot, d, state)];
    return moves.length ? moves : { noop: true };
  });
let out = surface(droot, load(droot), { state, moves });
const log = git(checkout, ['log', '--oneline', '-3']);
if (log) out += '\nRecent commits: ' + log.split('\n').join(' | ');
if (startup) {
  const rel = Object.keys(findManifest(checkout)?.data?.files ?? {}).find((f) => /(^|\/)skills\/desk\/SKILL\.md$/.test(f));
  const body = rel && (read(path.join(checkout, rel)) ?? '').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  if (body) out += `\n\n<desk-skill source="${rel}">\nThis is your working method for this project, already loaded — follow it; no need to open the file.\n\n${body}\n</desk-skill>`;
}
emitContext('SessionStart', out);
