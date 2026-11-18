import { isAbsolute, join, sep } from 'node:path';

export const SERVER_NAME = 'figma-agent';
export const REPO_SPEC = 'github:nguyennamkkb/figma-agent-UI';
export const PACKAGE_NAME = 'figma-agent-ui';
export const BUNDLED_SKILLS = [
  'figma-agent-tools',
  'figma-ui-flow',
  'asset-generator',
  'design-md-writer',
  'style-direction',
  'icon-libraries',
  'ads-board',
  'app-redesign',
  'ui-visual',
] as const;
export const RETIRED_SKILLS = [
  'phosphor-icons',
  'app-asset-generator',
  'generating-oneshot-image-prompts',
  'ios-style-screen-creator',
] as const;
export const PLUGIN_FILES = ['manifest.json', 'code.js', 'ui.html'] as const;

export type Platform = NodeJS.Platform;
export type ServerCommand = { command: string; args: string[] };
export type SkillTarget = { id: 'claude' | 'opencode' | 'agents'; label: string; dir: string };

export function isNpxInstall(packageRoot: string): boolean {
  return packageRoot.split(sep).includes('_npx') || packageRoot.split('/').includes('_npx');
}

export function npxSpecFrom(hostDependencies: Record<string, string> | undefined, version: string): string {
  const fromHost = hostDependencies?.[PACKAGE_NAME];
  if (fromHost && !isAbsolute(fromHost) && !fromHost.startsWith('file:')) return fromHost;
  return `${REPO_SPEC}#v${version}`;
}

export interface NpxCacheEntry {
  dir: string;
  dependencies?: Record<string, string>;
}

export function staleNpxCopies(entries: NpxCacheEntry[], currentDir: string | undefined): string[] {
  return entries
    .filter((e) => e.dir !== currentDir)
    .filter((e) => {
      const names = Object.keys(e.dependencies ?? {});
      return names.length === 1 && names[0].toLowerCase() === PACKAGE_NAME;
    })
    .map((e) => e.dir);
}

export function serverCommand(opts: {
  platform: Platform;
  npxSpec?: string;
  serverPath: string;
  nodePath: string;
}): ServerCommand {
  if (opts.npxSpec) {
    const npx = ['npx', '-y', opts.npxSpec];
    return opts.platform === 'win32' ? { command: 'cmd', args: ['/c', ...npx] } : { command: npx[0], args: npx.slice(1) };
  }
  return { command: opts.nodePath, args: [opts.serverPath] };
}

export function skillTargets(home: string, env: NodeJS.ProcessEnv): SkillTarget[] {
  const xdg = env.XDG_CONFIG_HOME || join(home, '.config');
  return [
    { id: 'claude', label: 'Claude Code', dir: join(home, '.claude', 'skills') },
    { id: 'opencode', label: 'OpenCode', dir: join(xdg, 'opencode', 'skills') },
    { id: 'agents', label: 'Agents', dir: join(home, '.agents', 'skills') },
  ];
}

export function opencodeConfigPath(home: string, env: NodeJS.ProcessEnv): string {
  return join(env.XDG_CONFIG_HOME || join(home, '.config'), 'opencode', 'opencode.json');
}

type OpencodeConfig = { $schema?: string; mcp?: Record<string, Record<string, unknown>>; [key: string]: unknown };

export function withOpencodeServer(config: OpencodeConfig, cmd: ServerCommand): OpencodeConfig {
  const previous = config.mcp?.[SERVER_NAME] ?? {};
  return {
    ...config,
    $schema: config.$schema ?? 'https://opencode.ai/config.json',
    mcp: {
      ...(config.mcp ?? {}),
      [SERVER_NAME]: { ...previous, type: 'local', command: [cmd.command, ...cmd.args], enabled: true },
    },
  };
}

export function withoutOpencodeServer(config: OpencodeConfig): OpencodeConfig {
  if (!config.mcp?.[SERVER_NAME]) return config;
  const rest = { ...config.mcp };
  delete rest[SERVER_NAME];
  return { ...config, mcp: rest };
}

type ClaudeConfig = { mcpServers?: Record<string, unknown>; [key: string]: unknown };

export function withClaudeServer(config: ClaudeConfig, cmd: ServerCommand): ClaudeConfig {
  return {
    ...config,
    mcpServers: { ...(config.mcpServers ?? {}), [SERVER_NAME]: { type: 'stdio', command: cmd.command, args: cmd.args, env: {} } },
  };
}

export function withoutClaudeServer(config: ClaudeConfig): ClaudeConfig {
  if (!config.mcpServers?.[SERVER_NAME]) return config;
  const rest = { ...config.mcpServers };
  delete rest[SERVER_NAME];
  return { ...config, mcpServers: rest };
}

export function shortPath(path: string, home: string, platform: Platform): string {
  if (!home || !path.startsWith(home)) return path;
  return (platform === 'win32' ? '%USERPROFILE%' : '~') + path.slice(home.length);
}

export const CODEX_STARTUP_TIMEOUT_SEC = 120;
export const CODEX_TOOL_TIMEOUT_SEC = 300;

export function codexConfigPath(home: string, env: NodeJS.ProcessEnv): string {
  return join(env.CODEX_HOME || join(home, '.codex'), 'config.toml');
}

const CODEX_HEADER = /^\s*\[\s*mcp_servers\s*\.\s*(?:figma-agent|"figma-agent"|'figma-agent')\s*(?:\.[^\]]*)?\]\s*(?:#.*)?$/;
const ANY_HEADER = /^\s*\[/;

export function withoutCodexServer(toml: string): string {
  const kept: string[] = [];
  let skipping = false;
  for (const line of toml.split(/\r?\n/)) {
    if (CODEX_HEADER.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping && ANY_HEADER.test(line)) skipping = false;
    if (!skipping) kept.push(line);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '');
}

export function hasCodexServer(toml: string): boolean {
  return toml.split(/\r?\n/).some((line) => CODEX_HEADER.test(line));
}

export function withCodexServer(toml: string, cmd: ServerCommand): string {
  const rest = withoutCodexServer(toml);
  const block = [
    `[mcp_servers.${SERVER_NAME}]`,
    `command = ${JSON.stringify(cmd.command)}`,
    `args = [${cmd.args.map((a) => JSON.stringify(a)).join(', ')}]`,
    `startup_timeout_sec = ${CODEX_STARTUP_TIMEOUT_SEC}`,
    `tool_timeout_sec = ${CODEX_TOOL_TIMEOUT_SEC}`,
  ].join('\n');
  return (rest ? `${rest}\n\n` : '') + block + '\n';
}

export function tokenCopyHint(platform: Platform): string {
  if (platform === 'darwin') return 'pbcopy < ~/.figma-agent/token';
  if (platform === 'win32') return 'type %USERPROFILE%\\.figma-agent\\token | clip';
  return 'xclip -selection clipboard < ~/.figma-agent/token';
}

export type McpClient = 'claude' | 'opencode' | 'codex';
export const MCP_CLIENTS: readonly McpClient[] = ['claude', 'opencode', 'codex'];

export type CliOptions = {
  command: 'install' | 'uninstall' | 'doctor' | 'help';
  dryRun: boolean;
  verbose: boolean;
  skills: boolean;
  mcp: boolean;
  clients: Set<McpClient>;
  skillTargets: Set<SkillTarget['id']>;
};

export function parseArgs(argv: string[]): CliOptions {
  const [first = 'help', ...rest] = argv;
  const command = (['install', 'uninstall', 'doctor'] as const).find((c) => c === first) ?? 'help';
  const value = (flag: string) => {
    const inline = rest.find((a) => a.startsWith(`${flag}=`));
    if (inline) return inline.slice(flag.length + 1);
    const i = rest.indexOf(flag);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  const list = <T extends string>(raw: string | undefined, all: readonly T[]): Set<T> => {
    if (!raw || raw === 'all') return new Set(all);
    return new Set(raw.split(',').map((s) => s.trim()).filter((s): s is T => (all as readonly string[]).includes(s)));
  };
  return {
    command,
    dryRun: rest.includes('--dry-run'),
    verbose: rest.includes('--verbose') || rest.includes('-v'),
    skills: !rest.includes('--no-skills'),
    mcp: !rest.includes('--no-mcp'),
    clients: list(value('--client'), MCP_CLIENTS),
    skillTargets: list(value('--skills-to'), ['claude', 'opencode', 'agents'] as const),
  };
}
