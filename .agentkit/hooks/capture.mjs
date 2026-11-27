#!/usr/bin/env node
import { readStdinJson, projectDir, deskRoot, emitContext, readState, writeState, detectSignals, journal, listReview } from './_lib.mjs';
import { hasDesk, mutate, bumpMatches, remember, lesson, focus, log as logItem } from './store.mjs';
import { orcaAvailable, workerContext } from './team.mjs';

const input = await readStdinJson();
const checkout = projectDir(input);
const droot = deskRoot(checkout);
const prompt = String(input.prompt ?? '').trim();
if (!hasDesk(droot) || !prompt || prompt.startsWith('/') || workerContext(droot, checkout)) process.exit(0);

const state = readState(droot);
const signals = detectSignals(prompt);
const C = 'node .agentkit/desk.mjs';
const hints = [];
const clip = (s) => s.replace(/\s+/g, ' ').slice(0, 280);
let hit = [];
let cur = null;

mutate(droot, 'capture', (d) => {
  hit = bumpMatches(d, { text: prompt });
  cur = focus(d);
  const question = /\?\s*$/.test(prompt);
  if (signals.includes('remember') && !question) {
    const r = remember(d, clip(prompt), { auto: true });
    hints.push(r.merged ? `Already remembered as ${r.item.id} (×${r.item.uses}).` : `Saved the user's words as ${r.item.id}; reword it with \`${C} edit ${r.item.id} --text "…"\` only if it is unclear.`);
  }
  if (signals.includes('correction')) {
    const r = lesson(d, clip(prompt), { auto: true });
    hints.push(`Correction → ${r.item.id}${r.merged ? ` (seen ×${r.item.seen})` : ''}. Fix it first.${r.ripe ? ` Seen ${r.item.seen}×: propose a durable fix (\`${C} propose … --from ${r.item.id}\`).` : ''}`);
  }
  const task = hit.find((i) => i.kind === 'task');
  if (signals.includes('urgent')) {
    if (task && task.prio !== 'P0') (task.prio = 'P0'), logItem(task, null, 'user: urgent'), hints.push(`${task.id} raised to P0.`);
    else if (!task) hints.push(`Urgent: if this is new work, \`${C} add P0 "…" --done "…" --now\` (the current task is parked with its next step).`);
  }
  if (signals.includes('later') && !task) hints.push(`"Later": file it with \`${C} add P2 "…"\` instead of starting it.`);
  if (signals.includes('wait')) hints.push(`If a task now waits on someone or something: \`${C} wait ID --on user|Q-3|"who" [--until date]\`.`);
  if (signals.includes('drop')) hints.push(`If the user drops a task: \`${C} drop ID --why "<their words>"\` (undo-able).`);
  if (!hit.length && !hints.length) return { noop: true };
  if (!hints.length) return { bookkeeping: true };
});

journal(droot, { s: state.session, signals: signals.length ? signals : undefined, bumped: hit.length ? hit.map((i) => i.id) : undefined, text: signals.length ? prompt.slice(0, 500) : undefined });
const pending = listReview(droot).filter((r) => !r.archived && r.kind === 'P' && r.status === 'pending');
if (signals.includes('approve') && pending.length) hints.push(`If this approves ${pending.map((p) => p.id).join(' / ')}: \`${C} approve P-… --quote "<their words>"\`, then apply it.`);
if (signals.includes('team') && orcaAvailable() && !state.teamAllowed) hints.push(`Team mode is available (Orca). Before the first worker, ask the user once; after their yes: \`${C} team allow --quote "…"\`. Guide: .agentkit/docs/team.md.`);
const once = (key) => {
  state.reminded ??= {};
  if (state.reminded[key]) return false;
  state.reminded[key] = true;
  writeState(droot, state);
  return true;
};
if (!cur && !signals.includes('correction') && once('no-focus')) hints.push(`No task in progress: if this is a work request, \`${C} add P1 "…" --done "<check>" --now\` before starting.`);
const rel = hit.filter((i) => i.kind !== 'task' || i !== cur);
if (rel.length) hints.push(`Related on the desk: ${rel.slice(0, 5).map((i) => i.id).join(', ')}.`);
if (hints.length) emitContext('UserPromptSubmit', `[desk] ${hints.join(' ')}`);
