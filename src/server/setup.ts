import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUNDLED_SKILLS,
  PLUGIN_FILES,
  SERVER_NAME,
  isNpxInstall,
  npxSpecFrom,
  opencodeConfigPath,
  parseArgs,
  serverCommand,
  skillTargets,
  tokenCopyHint,
  withClaudeServer,
  withOpencodeServer,
  withoutClaudeServer,
  withoutOpencodeServer,
  type CliOptions,
  type ServerCommand,
} from './setup-lib';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = homedir();
const platform = process.platform;
const pluginDir = process.env.FIGMA_AGENT_PLUGIN_DIR || join(home, '.figma-agent', 'plugin');
const tokenFile = join(home, '.figma-agent', 'token');
const pkg = readJson<{ version: string }>(join(packageRoot, 'package.json')) ?? { version: '0.0.0' };

const out = (line = '') => process.stdout.write(line + '\n');
const ok = (msg: string) => out(`  ✓ ${msg}`);
const warn = (msg: string) => out(`  ! ${msg}`);
const bad = (msg: string) => out(`  ✗ ${msg}`);

function readJson<T>(file: string): T | undefined {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

function writeJsonWithBackup(file: string, data: unknown, dryRun: boolean) {
  if (dryRun) return;
  mkdirSync(dirname(file), { recursive: true });
  if (existsSync(file)) copyFileSync(file, `${file}.bak`);
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function run(cmd: string, args: string[]) {
  return spawnSync(cmd, args, { encoding: 'utf8', shell: platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
}

function hasCli(cmd: string): boolean {
  const r = run(cmd, ['--version']);
  return r.status === 0;
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

function installPlugin(o: CliOptions) {
  const missing = PLUGIN_FILES.filter((f) => !existsSync(join(packageRoot, f)));
  if (missing.length > 0) {
    bad(`missing build output: ${missing.join(', ')} (run "npm run build")`);
    process.exitCode = 1;
    return;
  }
  if (!o.dryRun) {
    mkdirSync(pluginDir, { recursive: true });
    for (const f of PLUGIN_FILES) copyFileSync(join(packageRoot, f), join(pluginDir, f));
  }
  ok(`plugin → ${pluginDir}`);
}

function installSkills(o: CliOptions) {
  for (const target of skillTargets(home, process.env).filter((t) => o.skillTargets.has(t.id))) {
    const installed: string[] = [];
    for (const name of BUNDLED_SKILLS) {
      const src = join(packageRoot, '.claude', 'skills', name);
      if (!existsSync(src)) continue;
      const dest = join(target.dir, name);
      if (!o.dryRun) {
        rmSync(dest, { recursive: true, force: true });
        mkdirSync(target.dir, { recursive: true });
        cpSync(src, dest, { recursive: true });
      }
      installed.push(name);
    }
    if (installed.length === 0) warn(`skills: none bundled in ${join(packageRoot, '.claude', 'skills')}`);
    else ok(`skills (${target.label}) → ${target.dir}: ${installed.join(', ')}`);
  }
}

function uninstallSkills(o: CliOptions) {
  for (const target of skillTargets(home, process.env).filter((t) => o.skillTargets.has(t.id))) {
    const removed = BUNDLED_SKILLS.filter((name) => existsSync(join(target.dir, name)));
    if (!o.dryRun) for (const name of removed) rmSync(join(target.dir, name), { recursive: true, force: true });
    ok(`skills (${target.label}): removed ${removed.length ? removed.join(', ') : 'nothing'}`);
  }
}

function claudeConfigFile() {
  return join(home, '.claude.json');
}

function configureClaude(o: CliOptions, cmd: ServerCommand) {
  if (hasCli('claude')) {
    if (!o.dryRun) {
      run('claude', ['mcp', 'remove', SERVER_NAME, '-s', 'user']);
      const r = run('claude', ['mcp', 'add', '-s', 'user', SERVER_NAME, '--', cmd.command, ...cmd.args]);
      if (r.status !== 0) {
        bad(`Claude Code: "claude mcp add" failed: ${(r.stderr || r.stdout).trim()}`);
        process.exitCode = 1;
        return;
      }
    }
    ok(`Claude Code (user scope): ${[cmd.command, ...cmd.args].join(' ')}`);
    return;
  }
  const file = claudeConfigFile();
  writeJsonWithBackup(file, withClaudeServer(readJson(file) ?? {}, cmd), o.dryRun);
  ok(`Claude Code (${file}, claude CLI not found): ${[cmd.command, ...cmd.args].join(' ')}`);
}

function unconfigureClaude(o: CliOptions) {
  if (hasCli('claude')) {
    if (!o.dryRun) run('claude', ['mcp', 'remove', SERVER_NAME, '-s', 'user']);
  } else {
    const file = claudeConfigFile();
    const config = readJson<Record<string, unknown>>(file);
    if (config) writeJsonWithBackup(file, withoutClaudeServer(config), o.dryRun);
  }
  ok(`Claude Code: removed ${SERVER_NAME}`);
}

function configureOpencode(o: CliOptions, cmd: ServerCommand) {
  const file = opencodeConfigPath(home, process.env);
  const exists = existsSync(file);
  const config = exists ? readJson<Record<string, unknown>>(file) : {};
  if (!config) {
    warn(`OpenCode: cannot parse ${file} (JSONC?). Add this under "mcp":`);
    out(JSON.stringify({ [SERVER_NAME]: { type: 'local', command: [cmd.command, ...cmd.args], enabled: true } }, null, 2));
    return;
  }
  writeJsonWithBackup(file, withOpencodeServer(config, cmd), o.dryRun);
  ok(`OpenCode (${file}): ${[cmd.command, ...cmd.args].join(' ')}`);
}

function unconfigureOpencode(o: CliOptions) {
  const file = opencodeConfigPath(home, process.env);
  const config = readJson<Record<string, unknown>>(file);
  if (config) writeJsonWithBackup(file, withoutOpencodeServer(config), o.dryRun);
  ok(`OpenCode: removed ${SERVER_NAME}`);
}

function install(o: CliOptions) {
  out(`figma-agent-ui ${pkg.version} install${o.dryRun ? ' (dry run)' : ''}`);
  installPlugin(o);
  if (o.skills) installSkills(o);
  if (o.mcp) {
    const cmd = resolveServerCommand();
    if (o.clients.has('claude')) configureClaude(o, cmd);
    if (o.clients.has('opencode')) configureOpencode(o, cmd);
  }
  out();
  out('Next steps:');
  out(`  1. Figma desktop → Plugins → Development → Import plugin from manifest… → ${join(pluginDir, 'manifest.json')}`);
  out('  2. Restart Claude Code / OpenCode so they start the figma-agent MCP server.');
  out(`  3. Token (created on first server start): ${tokenFile}  —  copy: ${tokenCopyHint(platform)}`);
  out('  4. Open the plugin in a Figma file, paste the token, Connect.');
  out('  Upgrade: re-run install with the new tag, then close and reopen the plugin.');
}

function uninstall(o: CliOptions) {
  out(`figma-agent-ui uninstall${o.dryRun ? ' (dry run)' : ''}`);
  if (o.mcp) {
    if (o.clients.has('claude')) unconfigureClaude(o);
    if (o.clients.has('opencode')) unconfigureOpencode(o);
  }
  if (o.skills) uninstallSkills(o);
  if (!o.dryRun) rmSync(pluginDir, { recursive: true, force: true });
  ok(`plugin: removed ${pluginDir} (token kept at ${tokenFile}); remove it from Figma → Plugins → Development manually`);
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

async function doctor(o: CliOptions) {
  out(`figma-agent-ui ${pkg.version} doctor (${platform})`);
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= 20) ok(`node ${process.versions.node}`);
  else bad(`node ${process.versions.node}: need >= 20`);
  if (hasCli('git')) ok('git found');
  else warn('git not found: npx github:… installs will fail');

  const pluginCode = join(pluginDir, 'code.js');
  if (!existsSync(pluginCode)) bad(`plugin not installed at ${pluginDir} (run install)`);
  else if (readFileSync(pluginCode, 'utf8') === readFileSync(join(packageRoot, 'code.js'), 'utf8')) ok(`plugin up to date at ${pluginDir}`);
  else warn(`plugin at ${pluginDir} differs from this version (re-run install, then reopen the plugin)`);

  for (const target of skillTargets(home, process.env).filter((t) => o.skillTargets.has(t.id))) {
    const present = BUNDLED_SKILLS.filter((n) => existsSync(join(target.dir, n, 'SKILL.md')));
    if (present.length === BUNDLED_SKILLS.length) ok(`skills (${target.label}): all ${present.length}`);
    else warn(`skills (${target.label}): ${present.length}/${BUNDLED_SKILLS.length} in ${target.dir}`);
  }

  if (o.clients.has('claude')) {
    if (hasCli('claude')) {
      const r = run('claude', ['mcp', 'get', SERVER_NAME]);
      if (r.status === 0) ok('Claude Code: figma-agent configured');
      else warn('Claude Code: figma-agent not configured');
    } else warn('Claude Code: claude CLI not found');
  }
  if (o.clients.has('opencode')) {
    const config = readJson<{ mcp?: Record<string, unknown> }>(opencodeConfigPath(home, process.env));
    if (config?.mcp?.[SERVER_NAME]) ok('OpenCode: figma-agent configured');
    else warn('OpenCode: figma-agent not configured');
  }

  if (existsSync(tokenFile)) ok(`token at ${tokenFile}`);
  else warn('token not created yet (starts with the first server run)');
  if (await portInUse(3055)) ok('port 3055 in use (a figma-agent hub is probably running)');
  else warn('port 3055 free (no server running right now)');
  if (!hasCli(platform === 'win32' ? 'python' : 'python3')) warn('python not found: figma-ui-flow token check script will be skipped');
}

function help() {
  out(`figma-agent-ui ${pkg.version}

Usage: figma-agent-ui                      start the MCP server (stdio)
       figma-agent-ui install   [options]  copy plugin, install skills, configure MCP clients
       figma-agent-ui uninstall [options]  undo install (keeps the token)
       figma-agent-ui doctor    [options]  check the setup

Options:
  --client claude,opencode     MCP clients to configure (default: all)
  --skills-to claude,opencode,agents
                               global skill folders (default: all)
  --no-skills                  skip skills
  --no-mcp                     skip MCP client config
  --dry-run                    show what would change`);
}

const options = parseArgs(process.argv.slice(2));
if (options.command === 'install') install(options);
else if (options.command === 'uninstall') uninstall(options);
else if (options.command === 'doctor') await doctor(options);
else help();
