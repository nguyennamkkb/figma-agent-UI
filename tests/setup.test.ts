import { describe, expect, it } from 'vitest';
import {
  isNpxInstall,
  npxSpecFrom,
  parseArgs,
  serverCommand,
  shortPath,
  skillTargets,
  tokenCopyHint,
  codexConfigPath,
  hasCodexServer,
  withClaudeServer,
  withCodexServer,
  withoutCodexServer,
  withOpencodeServer,
  withoutClaudeServer,
  withoutOpencodeServer,
} from '../src/server/setup-lib';

describe('setup: server command', () => {
  it('uses npx directly on macOS/Linux', () => {
    expect(serverCommand({ platform: 'darwin', npxSpec: 'github:a/b#v1', serverPath: '/x', nodePath: '/n' })).toEqual({
      command: 'npx',
      args: ['-y', 'github:a/b#v1'],
    });
  });

  it('wraps npx with cmd /c on Windows', () => {
    expect(serverCommand({ platform: 'win32', npxSpec: 'github:a/b#v1', serverPath: 'C:\\x', nodePath: 'C:\\n' })).toEqual({
      command: 'cmd',
      args: ['/c', 'npx', '-y', 'github:a/b#v1'],
    });
  });

  it('uses node + absolute server path for a clone', () => {
    expect(serverCommand({ platform: 'darwin', serverPath: '/repo/dist/server.mjs', nodePath: '/usr/bin/node' })).toEqual({
      command: '/usr/bin/node',
      args: ['/repo/dist/server.mjs'],
    });
  });

  it('detects the npx cache', () => {
    expect(isNpxInstall('/Users/a/.npm/_npx/abc/node_modules/figma-agent-ui')).toBe(true);
    expect(isNpxInstall('/Users/a/code/figma-agent-UI')).toBe(false);
  });

  it('takes the npx spec from the host package, else pins the version tag', () => {
    expect(npxSpecFrom({ 'figma-agent-ui': 'github:nguyennamkkb/figma-agent-UI#v1.5.0' }, '1.5.0')).toBe(
      'github:nguyennamkkb/figma-agent-UI#v1.5.0',
    );
    expect(npxSpecFrom({ 'figma-agent-ui': 'file:/tmp/x.tgz' }, '1.5.0')).toBe('github:nguyennamkkb/figma-agent-UI#v1.5.0');
    expect(npxSpecFrom(undefined, '2.0.0')).toBe('github:nguyennamkkb/figma-agent-UI#v2.0.0');
  });
});

describe('setup: client configs', () => {
  const cmd = { command: 'npx', args: ['-y', 'spec'] };

  it('adds and removes the OpenCode entry without touching other servers', () => {
    const before = { mcp: { other: { type: 'local', command: ['x'] }, 'figma-agent': { directTools: true } }, plugin: ['p'] };
    const added = withOpencodeServer(before, cmd);
    expect(added.mcp?.['figma-agent']).toEqual({ directTools: true, type: 'local', command: ['npx', '-y', 'spec'], enabled: true });
    expect(added.mcp?.other).toEqual(before.mcp.other);
    expect(added.plugin).toEqual(['p']);
    const removed = withoutOpencodeServer(added);
    expect(removed.mcp?.['figma-agent']).toBeUndefined();
    expect(removed.mcp?.other).toEqual(before.mcp.other);
  });

  it('adds and removes the Claude Code user entry', () => {
    const added = withClaudeServer({ mcpServers: { other: {} }, numStartups: 3 }, cmd);
    expect(added.mcpServers?.['figma-agent']).toEqual({ type: 'stdio', command: 'npx', args: ['-y', 'spec'], env: {} });
    expect(added.numStartups).toBe(3);
    expect(withoutClaudeServer(added).mcpServers).toEqual({ other: {} });
  });
});

describe('setup: Codex config.toml', () => {
  const cmd = { command: 'npx', args: ['-y', 'github:a/b#v1'] };
  const existing = [
    'model = "gpt-5"',
    '',
    '[mcp_servers.opencode_console]',
    'url = "https://opencode.ai/console/mcp"',
    '',
    '[mcp_servers.figma-agent]',
    'command = "node"',
    'args = ["/old/server.mjs"]',
    '',
    '[mcp_servers.figma-agent.env]',
    'FIGMA_AGENT_PORT = "3055"',
    '',
    '[tui]',
    'screen_reader_detection_done = true',
  ].join('\n');

  it('replaces the old figma-agent block and keeps everything else', () => {
    const next = withCodexServer(existing, cmd);
    expect(next).not.toContain('/old/server.mjs');
    expect(next).not.toContain('[mcp_servers.figma-agent.env]');
    expect(next).toContain('[mcp_servers.opencode_console]');
    expect(next).toContain('[tui]\nscreen_reader_detection_done = true');
    expect(next).toContain('model = "gpt-5"');
    expect(next.match(/\[mcp_servers\.figma-agent\]/g)).toHaveLength(1);
    expect(next).toContain('args = ["-y", "github:a/b#v1"]');
    expect(next).toContain('startup_timeout_sec = 120');
    expect(next.endsWith('\n')).toBe(true);
  });

  it('writes into an empty file and escapes Windows paths', () => {
    const next = withCodexServer('', { command: 'C:\\node\\node.exe', args: ['C:\\repo\\dist\\server.mjs'] });
    expect(next.startsWith('[mcp_servers.figma-agent]')).toBe(true);
    expect(next).toContain('command = "C:\\\\node\\\\node.exe"');
  });

  it('detects and removes the entry, including the quoted form', () => {
    expect(hasCodexServer(existing)).toBe(true);
    expect(hasCodexServer(withoutCodexServer(existing))).toBe(false);
    expect(hasCodexServer('[mcp_servers."figma-agent"]\ncommand = "x"')).toBe(true);
    expect(withoutCodexServer('[mcp_servers.figma-agent-other]\ncommand = "x"')).toContain('figma-agent-other');
  });

  it('honours CODEX_HOME', () => {
    expect(codexConfigPath('/h', {}).replaceAll('\\', '/')).toBe('/h/.codex/config.toml');
    expect(codexConfigPath('/h', { CODEX_HOME: '/c' }).replaceAll('\\', '/')).toBe('/c/config.toml');
  });
});

describe('setup: paths and args', () => {
  it('lists the three global skill folders', () => {
    const dirs = skillTargets('/h', {}).map((t) => t.dir.replaceAll('\\', '/'));
    expect(dirs).toEqual(['/h/.claude/skills', '/h/.config/opencode/skills', '/h/.agents/skills']);
  });

  it('shortens paths under home', () => {
    expect(shortPath('/Users/a/.figma-agent/plugin', '/Users/a', 'darwin')).toBe('~/.figma-agent/plugin');
    expect(shortPath('C:\\Users\\a\\.figma-agent', 'C:\\Users\\a', 'win32')).toBe('%USERPROFILE%\\.figma-agent');
    expect(shortPath('/opt/x', '/Users/a', 'darwin')).toBe('/opt/x');
  });

  it('gives a clipboard hint per OS', () => {
    expect(tokenCopyHint('darwin')).toContain('pbcopy');
    expect(tokenCopyHint('win32')).toContain('clip');
    expect(tokenCopyHint('linux')).toContain('xclip');
  });

  it('parses commands and filters', () => {
    const o = parseArgs(['install', '--client', 'opencode', '--skills-to=claude,agents', '--dry-run']);
    expect(o.command).toBe('install');
    expect([...o.clients]).toEqual(['opencode']);
    expect([...o.skillTargets]).toEqual(['claude', 'agents']);
    expect(o.dryRun).toBe(true);
    expect(o.verbose).toBe(false);
    expect(parseArgs(['install', '--verbose']).verbose).toBe(true);
    expect(parseArgs([]).command).toBe('help');
    expect(parseArgs(['doctor']).clients.size).toBe(3);
  });
});
