// Spawns the built MCP server over stdio, connects a fake plugin to its
// bridge, and drives it with the official MCP client.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';

const SERVER = join(__dirname, '..', 'dist', 'server.mjs');
const PORT = 3999;
const TOKEN = 'e2e-token';
const received: { command: string; params: Record<string, unknown> }[] = [];

let client: Client;
let plugin: WebSocket;

beforeAll(async () => {
  if (!existsSync(SERVER)) throw new Error('Run `npm run build` first.');
  client = new Client({ name: 'e2e', version: '0.0.0' });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [SERVER],
      env: { ...process.env, FIGMA_AGENT_PORT: String(PORT), FIGMA_AGENT_TOKEN: TOKEN } as Record<string, string>,
      stderr: 'ignore',
    }),
  );

  plugin = new WebSocket(`ws://localhost:${PORT}/?token=${TOKEN}`);
  plugin.on('message', (data) => {
    const msg = JSON.parse(String(data));
    received.push({ command: msg.command, params: msg.params });
    const reply = (body: object) => plugin.send(JSON.stringify({ type: 'response', id: msg.id, ...body }));
    if (msg.command === 'screenshot') {
      reply({ ok: true, result: { nodeId: '1:2', mimeType: 'image/png', base64: 'iVBORw0KGgo=', width: 10, height: 10 } });
    } else if (msg.command === 'delete_nodes') {
      reply({ ok: false, error: 'Node 9:9 not found', safeToRetryWithoutCanvasRead: false });
    } else {
      reply({ ok: true, result: { echo: msg.command } });
    }
  });
  await new Promise<void>((resolve, reject) => {
    plugin.on('open', () => {
      plugin.send(
        JSON.stringify({
          type: 'hello',
          info: { protocol: 1, fileKey: null, fileName: 'E2E', user: null, currentPage: { id: '0:1', name: 'Page 1' }, version: '1.0.0 (e2e)' },
        }),
      );
      setTimeout(resolve, 50);
    });
    plugin.on('error', reject);
  });
}, 20000);

afterAll(async () => {
  plugin?.terminate();
  await client?.close();
});

describe('MCP server', () => {
  it('lists every tool with a JSON schema', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        'audit_design',
        'clone_node',
        'create_variables',
        'delete_nodes',
        'execute_code',
        'figma_status',
        'find_nodes',
        'get_design_system',
        'get_document_info',
        'get_node',
        'get_selection',
        'list_fonts',
        'manage_pages',
        'move_nodes',
        'render_tree',
        'screenshot',
        'select_nodes',
        'set_current_page',
        'update_nodes',
      ].sort(),
    );
    const render = tools.find((t) => t.name === 'render_tree')!;
    expect(JSON.stringify(render.inputSchema)).toContain('"frame"');
    expect(client.getInstructions()).toMatch(/get_design_system/);
  });

  it('reports the connected file', async () => {
    const r = await client.callTool({ name: 'figma_status', arguments: {} });
    const body = JSON.parse((r.content as { text: string }[])[0].text);
    expect(body.files).toMatchObject([{ fileName: 'E2E', pluginVersion: '1.0.0 (e2e)' }]);
    // The server stamps its own build too, so a stale process is obvious.
    expect(body.server.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(typeof body.server.build).toBe('string');
  });

  it('validates, fills defaults, inlines images and strips the file param', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    const r = await client.callTool({
      name: 'render_tree',
      arguments: {
        file: 'E2E',
        tree: { type: 'frame', layout: 'VERTICAL', children: [{ type: 'image', src: png, width: 40 }] },
      },
    });
    expect(r.isError).toBeFalsy();
    const sent = received.find((x) => x.command === 'render_tree')!.params;
    expect(sent.file).toBeUndefined();
    expect(sent.select).toBe(true);
    expect(sent.tree).toEqual({
      type: 'frame',
      layout: 'VERTICAL',
      children: [{ type: 'image', imageBase64: 'iVBORw0KGgo=', width: 40 }],
    });
  });

  it('rejects invalid DSL before it reaches Figma', async () => {
    const before = received.length;
    const r = await client.callTool({ name: 'render_tree', arguments: { tree: { type: 'frame', bg: '#fff' } } });
    expect(r.isError).toBe(true);
    expect(JSON.stringify(r.content)).toMatch(/bg/);
    expect(received.length).toBe(before);
  });

  it('returns screenshots as image content', async () => {
    const r = await client.callTool({ name: 'screenshot', arguments: { id: '1:2' } });
    const content = r.content as { type: string; data?: string; mimeType?: string }[];
    expect(content[0]).toEqual({ type: 'image', data: 'iVBORw0KGgo=', mimeType: 'image/png' });
    expect(content[1].type).toBe('text');
  });

  it('surfaces plugin errors with the retry flag', async () => {
    const r = await client.callTool({ name: 'delete_nodes', arguments: { ids: ['9:9'] } });
    expect(r.isError).toBe(true);
    expect((r.content as { text: string }[])[0].text).toContain('safeToRetryWithoutCanvasRead: false');
  });

  it('scopes writes to a page and forwards the audit/params to the plugin', async () => {
    const { tools } = await client.listTools();

    // Every write/read tool gets the page scope, except the ones that already
    // own a `page` field or manage pages themselves.
    const render = tools.find((t) => t.name === 'render_tree')!;
    expect(JSON.stringify(render.inputSchema)).toContain('"page"');
    expect(JSON.stringify(tools.find((t) => t.name === 'set_current_page')!.inputSchema)).not.toContain(
      'Run on this page',
    );
    expect(JSON.stringify(tools.find((t) => t.name === 'manage_pages')!.inputSchema)).not.toContain('Run on this page');

    await client.callTool({ name: 'render_tree', arguments: { page: '📱 Screens', tree: { type: 'frame' } } });
    const renderSent = received.filter((x) => x.command === 'render_tree').at(-1)!;
    expect(renderSent.params.page).toBe('📱 Screens');

    await client.callTool({
      name: 'audit_design',
      arguments: { page: 'Page 1', checks: ['a11y'], limit: 5, format: 'markdown' },
    });
    const audit = received.filter((x) => x.command === 'audit_design').at(-1)!;
    expect(audit.params).toMatchObject({ page: 'Page 1', checks: ['a11y'], limit: 5, format: 'markdown' });
  });

  it('keeps manage_pages free of the page scope and validates its input', async () => {
    const ok = await client.callTool({ name: 'manage_pages', arguments: { template: true, dryRun: true } });
    expect(ok.isError).toBeFalsy();
    const sent = received.filter((x) => x.command === 'manage_pages').at(-1)!;
    expect(sent.params.page).toBeUndefined();

    const bad = await client.callTool({ name: 'manage_pages', arguments: { rename: [{ page: 'A' }] } });
    expect(bad.isError).toBe(true);
  });
});
