import { describe, expect, it } from 'vitest';
import {
  isNpxInstall,
  npxSpecFrom,
  parseArgs,
  serverCommand,
  skillTargets,
  tokenCopyHint,
  withClaudeServer,
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

describe('setup: paths and args', () => {
  it('lists the three global skill folders', () => {
    const dirs = skillTargets('/h', {}).map((t) => t.dir.replaceAll('\\', '/'));
    expect(dirs).toEqual(['/h/.claude/skills', '/h/.config/opencode/skills', '/h/.agents/skills']);
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
    expect(parseArgs([]).command).toBe('help');
    expect(parseArgs(['doctor']).clients.size).toBe(2);
  });
});
