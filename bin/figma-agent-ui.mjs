#!/usr/bin/env node
const command = process.argv[2];
if (command === 'install') {
  await import('../dist/install.mjs');
} else {
  await import('../dist/server.mjs');
}
