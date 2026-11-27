#!/usr/bin/env node
import path from 'node:path';
import { read, readStdinJson, projectDir, deskRoot, normalizeWrites, DESK, LOCAL_RULES, lintLocalRules, toPosix } from './_lib.mjs';
import { loadTeam, routingErrors } from './team.mjs';

const input = await readStdinJson();
const checkout = projectDir(input);
const droot = deskRoot(checkout);
const errors = [];
for (const w of normalizeWrites(checkout, input.tool_name, input.tool_input ?? {}, input.cwd)) {
  const rel = toPosix(path.relative(droot, w.path));
  if (rel === `${DESK}/${LOCAL_RULES}`) errors.push(...lintLocalRules(droot, read(w.path) ?? ''));
  if (rel === `${DESK}/team.json`) {
    try {
      JSON.parse(read(w.path) ?? '{}');
      errors.push(...routingErrors(loadTeam(droot).routing).map((e) => `team.json routing: ${e}`));
    } catch (e) {
      errors.push(`team.json is not valid JSON: ${e.message}`);
    }
  }
}
if (!errors.length) process.exit(0);
process.stderr.write(`[desk] Fix before continuing:\n- ${errors.slice(0, 8).join('\n- ')}\n`);
process.exit(2);
