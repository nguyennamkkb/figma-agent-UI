#!/usr/bin/env node
// Builds the plugin bundle and/or the MCP server, stamping each with the
// package version and the current git commit so the Figma panel and
// `figma_status` can tell a new build from a stale one.
//
//   node scripts/build.mjs all
//   node scripts/build.mjs plugin --watch
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { build, context } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const git = (cmd, fallback) => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback;
  } catch {
    return fallback;
  }
};
const sha = git('git rev-parse --short HEAD', 'dev');
const dirty = git('git status --porcelain', '') ? '+dirty' : '';
const buildId = `${sha}${dirty}`;

const define = {
  __PLUGIN_VERSION__: JSON.stringify(pkg.version),
  __PLUGIN_BUILD__: JSON.stringify(buildId),
  __SERVER_VERSION__: JSON.stringify(pkg.version),
  __SERVER_BUILD__: JSON.stringify(buildId),
};

const plugin = {
  entryPoints: ['src/plugin/main.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2017',
  outfile: 'code.js',
  define,
  logLevel: 'info',
};

const server = {
  entryPoints: ['src/server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  outfile: 'dist/server.mjs',
  define,
  logLevel: 'info',
};

const target = process.argv[2] ?? 'all';
const watch = process.argv.includes('--watch');

const jobs = target === 'all' ? [plugin, server] : target === 'plugin' ? [plugin] : target === 'server' ? [server] : null;
if (!jobs) {
  console.error(`usage: node scripts/build.mjs <all|plugin|server> [--watch]`);
  process.exit(2);
}

if (watch) {
  for (const job of jobs) {
    const ctx = await context(job);
    await ctx.watch();
  }
  console.error(`watching (${target}) · ${buildId}`);
} else {
  await Promise.all(jobs.map((job) => build(job)));
  console.error(`built ${target} · ${pkg.version} (${buildId})`);
}
