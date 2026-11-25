import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUNDLED_SKILLS,
  RETIRED_SKILLS,
  PLUGIN_FILES,
  SERVER_NAME,
  codexConfigPath,
  hasCodexServer,
  isNpxInstall,
  npxSpecFrom,
  opencodeConfigPath,
  piConfigPath,
  parseArgs,
  serverCommand,
  shortPath,
  skillTargets,
  staleNpxCopies,
  tokenCopyHint,
  withClaudeServer,
  withCodexServer,
  withOpencodeServer,
  withPiServer,
  withoutClaudeServer,
  withoutCodexServer,
  withoutOpencodeServer,
  withoutPiServer,
  type CliOptions,
  type ServerCommand,
} from './setup-lib';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = homedir();
const platform = process.platform;
const pluginDir = process.env.FIGMA_AGENT_PLUGIN_DIR || join(home, '.figma-agent', 'plugin');
const tokenFile = join(home, '.figma-agent', 'token');
const pkg = readJson<{ version: string }>(join(packageRoot, 'package.json')) ?? { version: '0.0.0' };
const options = parseArgs(process.argv.slice(2));

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (s: string) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = paint(32);
const yellow = paint(33);
const red = paint(31);
const dim = paint(2);
const bold = paint(1);

type Status = 'ok' | 'warn' | 'fail';
const MARK: Record<Status, string> = { ok: green('✓'), warn: yellow('!'), fail: red('✗') };
const LABEL_WIDTH = 10;

process.stdout.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EPIPE') process.exit(process.exitCode ?? 0);
  throw e;
});

const out = (line = '') => process.stdout.write(line + '\n');
const tilde = (p: string) => shortPath(p, home, platform);

function row(status: Status, label: string, text: string, details: string[] = []) {
  if (status === 'fail') process.exitCode = 1;
  out(`  ${MARK[status]} ${label.padEnd(LABEL_WIDTH)}${text}`);
  if (options.verbose) for (const d of details) out(`    ${' '.repeat(LABEL_WIDTH)}${dim(d)}`);
}

function header(title: string) {
  out();
  out(`  ${bold(`figma-agent-ui ${pkg.version}`)} ${dim(`· ${title}${options.dryRun ? ' (dry run)' : ''}`)}`);
  out();
}

function readJson<T>(file: string): T | undefined {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

function readText(file: string): string | undefined {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

function writeTextWithBackup(file: string, text: string) {
  if (options.dryRun) return;
  mkdirSync(dirname(file), { recursive: true });
  if (existsSync(file)) copyFileSync(file, `${file}.bak`);
  writeFileSync(file, text);
}

function writeJsonWithBackup(file: string, data: unknown) {
  if (options.dryRun) return;
  mkdirSync(dirname(file), { recursive: true });
  if (existsSync(file)) copyFileSync(file, `${file}.bak`);
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function run(cmd: string, args: string[]) {
  return spawnSync(cmd, args, { encoding: 'utf8', shell: platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
}

function hasCli(cmd: string): boolean {
  return run(cmd, ['--version']).status === 0;
}

function firstLine(text: string): string {
  return text.trim().split('\n')[0] ?? '';
}

function resolveServerCommand(): ServerCommand {
  const npx = isNpxInstall(packageRoot);
  const host = npx ? readJson<{ dependencies?: Record<string, string> }>(join(packageRoot, '..', '..', 'package.json')) : undefined;
  return serverCommand({
    platform,
    npxSpec: npx ? npxSpecFrom(host?.dependencies, pkg.version) : undefined,
    serverPath: join(packageRoot, 'dist', 'server.mjs'),
    nodePath: process.execPath,
  });
}

function selectedTargets(o: CliOptions) {
  return skillTargets(home, process.env).filter((t) => o.skillTargets.has(t.id));
}

function installPlugin() {
  const missing = PLUGIN_FILES.filter((f) => !existsSync(join(packageRoot, f)));
  if (missing.length > 0) {
    row('fail', 'Plugin', `missing ${missing.join(', ')} — run "npm run build"`);
    return;
  }
  if (!options.dryRun) {
    mkdirSync(pluginDir, { recursive: true });
    for (const f of PLUGIN_FILES) copyFileSync(join(packageRoot, f), join(pluginDir, f));
  }
  row('ok', 'Plugin', tilde(pluginDir));
}

function installSkills() {
  const available = BUNDLED_SKILLS.filter((name) => existsSync(join(packageRoot, '.claude', 'skills', name)));
  if (available.length === 0) {
    row('fail', 'Skills', 'none bundled in this package');
    return;
  }
  const targets = selectedTargets(options);
  const failed: string[] = [];
  for (const target of targets) {
    try {
      if (options.dryRun) continue;
      mkdirSync(target.dir, { recursive: true });
      for (const name of RETIRED_SKILLS) rmSync(join(target.dir, name), { recursive: true, force: true });
      for (const name of available) {
        const dest = join(target.dir, name);
        rmSync(dest, { recursive: true, force: true });
        cpSync(join(packageRoot, '.claude', 'skills', name), dest, { recursive: true });
      }
    } catch (e) {
      failed.push(`${target.label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const names = targets.map((t) => t.label).join(', ');
  const details = [...targets.map((t) => tilde(t.dir)), available.join(', ')];
  if (failed.length > 0) row('fail', 'Skills', failed.join('; '), details);
  else row('ok', 'Skills', `${available.length} → ${names}`, details);
}

function uninstallSkills() {
  const targets = selectedTargets(options);
  let removed = 0;
  for (const target of targets) {
    for (const name of [...BUNDLED_SKILLS, ...RETIRED_SKILLS]) {
      const dir = join(target.dir, name);
      if (!existsSync(dir)) continue;
      removed += 1;
      if (!options.dryRun) rmSync(dir, { recursive: true, force: true });
    }
  }
  row('ok', 'Skills', removed ? `removed from ${targets.map((t) => t.label).join(', ')}` : 'nothing to remove');
}

function claudeConfigFile() {
  return join(home, '.claude.json');
}

function configureClaude(cmd: ServerCommand): string | undefined {
  if (hasCli('claude')) {
    if (options.dryRun) return undefined;
    run('claude', ['mcp', 'remove', SERVER_NAME, '-s', 'user']);
    const r = run('claude', ['mcp', 'add', '-s', 'user', SERVER_NAME, '--', cmd.command, ...cmd.args]);
    return r.status === 0 ? undefined : firstLine(r.stderr || r.stdout) || 'claude mcp add failed';
  }
  const file = claudeConfigFile();
  writeJsonWithBackup(file, withClaudeServer(readJson(file) ?? {}, cmd));
  return undefined;
}

function configureOpencode(cmd: ServerCommand): string | undefined {
  const file = opencodeConfigPath(home, process.env);
  const config = existsSync(file) ? readJson<Record<string, unknown>>(file) : {};
  if (!config) return `cannot parse ${tilde(file)} — add "${SERVER_NAME}" under "mcp" by hand`;
  writeJsonWithBackup(file, withOpencodeServer(config, cmd));
  return undefined;
}

function configureCodex(cmd: ServerCommand): string | undefined {
  const file = codexConfigPath(home, process.env);
  try {
    writeTextWithBackup(file, withCodexServer(readText(file) ?? '', cmd));
    return undefined;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

function configurePi(cmd: ServerCommand): string | undefined {
  const file = piConfigPath(home, process.env);
  const config = existsSync(file) ? readJson<Record<string, unknown>>(file) : {};
  if (!config) return `cannot parse ${tilde(file)} — add "${SERVER_NAME}" under "mcpServers" by hand`;
  writeJsonWithBackup(file, withPiServer(config, cmd));
  return undefined;
}

function configureMcp() {
  const cmd = resolveServerCommand();
  const done: string[] = [];
  const errors: string[] = [];
  const details: string[] = [];
  if (options.clients.has('claude')) {
    const err = configureClaude(cmd);
    if (err) errors.push(`Claude Code: ${err}`);
    else done.push('Claude Code');
    details.push(`Claude Code  ${hasCli('claude') ? 'claude mcp add -s user' : tilde(claudeConfigFile())}`);
  }
  if (options.clients.has('opencode')) {
    const err = configureOpencode(cmd);
    if (err) errors.push(`OpenCode: ${err}`);
    else done.push('OpenCode');
    details.push(`OpenCode     ${tilde(opencodeConfigPath(home, process.env))}`);
  }
  if (options.clients.has('codex')) {
    const err = configureCodex(cmd);
    if (err) errors.push(`Codex: ${err}`);
    else done.push('Codex');
    details.push(`Codex        ${tilde(codexConfigPath(home, process.env))}`);
  }
  if (options.clients.has('pi')) {
    const err = configurePi(cmd);
    if (err) errors.push(`Pi: ${err}`);
    else done.push('Pi');
    details.push(`Pi           ${tilde(piConfigPath(home, process.env))}`);
  }
  details.push(`command      ${[cmd.command, ...cmd.args].join(' ')}`);
  if (done.length > 0) row('ok', 'MCP', done.join(', '), details);
  for (const e of errors) row('fail', 'MCP', e);
}

function unconfigureMcp() {
  const done: string[] = [];
  if (options.clients.has('claude')) {
    if (hasCli('claude')) {
      if (!options.dryRun) run('claude', ['mcp', 'remove', SERVER_NAME, '-s', 'user']);
    } else {
      const config = readJson<Record<string, unknown>>(claudeConfigFile());
      if (config) writeJsonWithBackup(claudeConfigFile(), withoutClaudeServer(config));
    }
    done.push('Claude Code');
  }
  if (options.clients.has('opencode')) {
    const file = opencodeConfigPath(home, process.env);
    const config = readJson<Record<string, unknown>>(file);
    if (config) writeJsonWithBackup(file, withoutOpencodeServer(config));
    done.push('OpenCode');
  }
  if (options.clients.has('codex')) {
    const file = codexConfigPath(home, process.env);
    const toml = readText(file);
    if (toml && hasCodexServer(toml)) writeTextWithBackup(file, withoutCodexServer(toml) + '\n');
    done.push('Codex');
  }
  if (options.clients.has('pi')) {
    const file = piConfigPath(home, process.env);
    const config = readJson<Record<string, unknown>>(file);
    if (config) writeJsonWithBackup(file, withoutPiServer(config));
    done.push('Pi');
  }
  row('ok', 'MCP', `removed from ${done.join(', ')}`);
}

function npxCacheDir() {
  if (isNpxInstall(packageRoot)) return resolve(packageRoot, '..', '..', '..');
  const defaultCache = platform === 'win32' ? join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'npm-cache') : join(home, '.npm');
  return join(process.env.npm_config_cache || defaultCache, '_npx');
}

function folderSize(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    try {
      total += statSync(join(entry.parentPath, entry.name)).size;
    } catch {
      continue;
    }
  }
  return total;
}

function cleanNpxCache(keepCurrent: boolean) {
  const cache = npxCacheDir();
  if (!existsSync(cache)) return;
  const entries = readdirSync(cache).map((name) => {
    const dir = join(cache, name);
    return { dir, dependencies: readJson<{ dependencies?: Record<string, string> }>(join(dir, 'package.json'))?.dependencies };
  });
  const current = keepCurrent && isNpxInstall(packageRoot) ? resolve(packageRoot, '..', '..') : undefined;
  const stale = staleNpxCopies(entries, current);
  if (stale.length === 0) return;
  let bytes = 0;
  for (const dir of stale) {
    try {
      bytes += folderSize(dir);
      if (!options.dryRun) rmSync(dir, { recursive: true, force: true });
    } catch {
      continue;
    }
  }
  const label = keepCurrent ? 'old cop' + (stale.length === 1 ? 'y' : 'ies') : 'cop' + (stale.length === 1 ? 'y' : 'ies');
  row('ok', 'Cleanup', `${options.dryRun ? 'would remove' : 'removed'} ${stale.length} ${label} from the npx cache (${Math.round(bytes / 1048576)} MB)`, [tilde(cache)]);
}

function nextSteps() {
  out();
  out(`  ${bold('Next steps')}`);
  out(`  1. Figma → Plugins → Development → Import plugin from manifest…`);
  out(`     ${tilde(join(pluginDir, 'manifest.json'))}`);
  out(`  2. Restart Claude Code / OpenCode / Codex / Pi (or /reload in Pi)`);
  out(`  3. Copy the token   ${tokenCopyHint(platform)}`);
  out(`  4. Open the plugin in Figma → paste the token → Connect`);
  out();
}

function install() {
  header('install');
  installPlugin();
  if (options.skills) installSkills();
  if (options.mcp) configureMcp();
  cleanNpxCache(true);
  if (process.exitCode) {
    out();
    out(red('  Install finished with errors (see ✗ above).'));
    out();
    return;
  }
  nextSteps();
}

function uninstall() {
  header('uninstall');
  if (options.mcp) unconfigureMcp();
  if (options.skills) uninstallSkills();
  if (!options.dryRun) rmSync(pluginDir, { recursive: true, force: true });
  row('ok', 'Plugin', `removed ${tilde(pluginDir)}`);
  cleanNpxCache(false);
  out();
  out(dim('  Token kept. Remove the plugin in Figma → Plugins → Development by hand.'));
  out();
}

function portInUse(port: number): Promise<boolean> {
  return new Promise((done) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      done(true);
    });
    socket.once('error', () => done(false));
  });
}

async function doctor() {
  header(`doctor · ${({ darwin: 'macOS', win32: 'Windows', linux: 'Linux' } as Record<string, string>)[platform] ?? platform}`);
  const nodeOk = Number(process.versions.node.split('.')[0]) >= 20;
  row(nodeOk ? 'ok' : 'fail', 'Node', nodeOk ? process.versions.node : `${process.versions.node} — need 20 or newer`);
  const git = hasCli('git');
  row(git ? 'ok' : 'warn', 'git', git ? 'found' : 'not found — npx github:… installs will fail');

  const pluginCode = join(pluginDir, 'code.js');
  if (!existsSync(pluginCode)) row('fail', 'Plugin', 'not installed — run install');
  else if (readFileSync(pluginCode, 'utf8') === readFileSync(join(packageRoot, 'code.js'), 'utf8')) row('ok', 'Plugin', 'up to date', [tilde(pluginDir)]);
  else row('warn', 'Plugin', 'older or newer than this version — re-run install, reopen the plugin', [tilde(pluginDir)]);

  const counts = selectedTargets(options).map((t) => ({
    target: t,
    present: BUNDLED_SKILLS.filter((n) => existsSync(join(t.dir, n, 'SKILL.md'))).length,
  }));
  const allSkills = counts.every((c) => c.present === BUNDLED_SKILLS.length);
  row(
    allSkills ? 'ok' : 'warn',
    'Skills',
    allSkills
      ? `${BUNDLED_SKILLS.length}/${BUNDLED_SKILLS.length} in ${counts.map((c) => c.target.label).join(', ')}`
      : counts.map((c) => `${c.target.label} ${c.present}/${BUNDLED_SKILLS.length}`).join(' · '),
    counts.map((c) => tilde(c.target.dir)),
  );

  const configured: string[] = [];
  const missing: string[] = [];
  if (options.clients.has('claude')) {
    (hasCli('claude') && run('claude', ['mcp', 'get', SERVER_NAME]).status === 0 ? configured : missing).push('Claude Code');
  }
  if (options.clients.has('opencode')) {
    const config = readJson<{ mcp?: Record<string, unknown> }>(opencodeConfigPath(home, process.env));
    (config?.mcp?.[SERVER_NAME] ? configured : missing).push('OpenCode');
  }
  if (options.clients.has('codex')) {
    (hasCodexServer(readText(codexConfigPath(home, process.env)) ?? '') ? configured : missing).push('Codex');
  }
  if (options.clients.has('pi')) {
    const config = readJson<{ mcpServers?: Record<string, unknown> }>(piConfigPath(home, process.env));
    (config?.mcpServers?.[SERVER_NAME] ? configured : missing).push('Pi');
  }
  if (missing.length === 0) row('ok', 'MCP', configured.join(', '));
  else row('warn', 'MCP', `not configured: ${missing.join(', ')}${configured.length ? ` · ok: ${configured.join(', ')}` : ''}`);

  row(existsSync(tokenFile) ? 'ok' : 'warn', 'Token', existsSync(tokenFile) ? tilde(tokenFile) : 'not created yet — start a client once');
  const hub = await portInUse(3055);
  row(hub ? 'ok' : 'warn', 'Hub', hub ? 'running on port 3055' : 'not running — start Claude Code / OpenCode');
  if (!hasCli(platform === 'win32' ? 'python' : 'python3')) row('warn', 'Python', 'not found (optional, used by figma-ui-flow)');
  out();
}

function help() {
  out(`
  ${bold(`figma-agent-ui ${pkg.version}`)}

  Usage
    figma-agent-ui                       start the MCP server (stdio)
    figma-agent-ui install   [options]   copy plugin, install skills, configure MCP clients
    figma-agent-ui uninstall [options]   undo install (keeps the token)
    figma-agent-ui doctor    [options]   check the setup

  Options
    --client claude,opencode,codex,pi    MCP clients to configure (default: all)
    --skills-to claude,opencode,agents   global skill folders (default: all)
    --no-skills                          skip skills
    --no-mcp                             skip MCP client config
    --dry-run                            show what would change
    --verbose                            show paths and commands
`);
}

if (options.command === 'install') install();
else if (options.command === 'uninstall') uninstall();
else if (options.command === 'doctor') await doctor();
else help();
