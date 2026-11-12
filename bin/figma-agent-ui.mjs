#!/usr/bin/env node
const setupCommands = new Set(['install', 'uninstall', 'doctor', 'help', '--help', '-h']);
if (setupCommands.has(process.argv[2])) {
  await import('../dist/setup.mjs');
} else {
  await import('../dist/server.mjs');
}
