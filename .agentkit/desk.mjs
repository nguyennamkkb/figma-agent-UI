#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './hooks/cli.mjs';

process.stdout.on('error', (e) => e.code === 'EPIPE' ? process.exit(0) : null);
const home = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.exitCode = main(process.argv.slice(2), { home });
