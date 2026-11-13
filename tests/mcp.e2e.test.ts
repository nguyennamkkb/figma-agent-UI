import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';

const SERVER = join(__dirname, '..', 'dist', 'server.mjs');
const PORT = 3999;
// 1×1 PNG: the server decodes screenshots with sharp, so it must be a real image.
const TOKEN = 'e2e-token';
const received: { command: string; params: Record<string, unknown> }[] = [];
const SNAP_DIR = mkdtempSync(join(tmpdir(), 'snapshots-'));

let client: Client;
let plugin: WebSocket;

beforeAll(async () => {
  if (!existsSync(SERVER)) throw new Error('Run `npm run build` first.');
  client = new Client({ name: 'e2e', version: '0.0.0' });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [SERVER],
      env: {
        ...process.env,
        FIGMA_AGENT_PORT: String(PORT),
        FIGMA_AGENT_PORT_RANGE: '1',
        FIGMA_AGENT_TOKEN: TOKEN,
        FIGMA_AGENT_PORT_FILE: join(tmpdir(), `figma-agent-port-${process.pid}`),
        FIGMA_AGENT_SNAPSHOT_DIR: SNAP_DIR,
      } as Record<string, string>,
      stderr: 'ignore',
    }),
  );

  const { tools } = await client.listTools();
  const commands = [
    ...tools.map((t) => t.name).filter((n) => n !== 'figma_status' && n !== 'figma_doctor'),
    'snapshot_read',
    'snapshot_images',
    'snapshot_write',
  ];

  plugin = new WebSocket(`ws://localhost:${PORT}/?token=${TOKEN}`);
  plugin.on('message', (data) => {
    const msg = JSON.parse(String(data));
    if (msg.type !== 'request') return;
    received.push({ command: msg.command, params: msg.params });
    const reply = (body: object) => plugin.send(JSON.stringify({ type: 'response', id: msg.id, ...body }));
    if (msg.command === 'screenshot') {
      reply({ ok: true, result: { nodeId: '1:2', mimeType: 'image/png', base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', width: 10, height: 10 } });
    } else if (msg.command === 'export_tokens') {
      reply({
        ok: true,
        result: {
          collections: [
            { name: 'Primitives', modes: ['Value'], variables: [{ name: 'color/gray/900', type: 'COLOR', values: { Value: '#0F172A' } }] },
            {
              name: 'Semantic',
              modes: ['Light', 'Dark'],
              variables: [{ name: 'color/text/primary', type: 'COLOR', values: { Light: { alias: 'Primitives/color/gray/900' }, Dark: '#F8FAFC' } }],
            },
          ],
          textStyles: [],
        },
      });
    } else if (msg.command === 'export_assets') {
      reply({
        ok: true,
        result: {
          files: [
            { id: '1:2', name: 'icon/home', format: 'PNG', scale: 1, base64: 'iVBORw0KGgo=' },
            { id: '1:2', name: 'icon/home', format: 'PNG', scale: 2, base64: 'iVBORw0KGgo=' },
          ],
        },
      });
    } else if (msg.command === 'list_fonts') {
      reply({ ok: true, result: { total: 1, families: [{ family: 'Inter', styles: ['Regular'] }] } });
    } else if (msg.command === 'snapshot_read') {
      const text = {
        t: 'TEXT',
        name: 'Title',
        x: 0,
        y: 0,
        w: 200,
        h: 30,
        text: {
          chars: 'JOIN',
          alignH: 'CENTER',
          alignV: 'TOP',
          autoResize: 'HEIGHT',
          segments: [{ start: 0, end: 4, font: { family: 'BEAT TECH', style: 'Regular' }, size: 30, fills: [], lineHeight: {}, letterSpacing: {}, textCase: 'ORIGINAL', decoration: 'NONE' }],
          outline: { svg: '<svg/>', ox: 0, oy: 0 },
        },
      };
      const tag = { t: 'FRAME', name: 'Tag', x: 0, y: 40, w: 82, h: 22, fills: [{ type: 'IMAGE', imageHash: 'h2' }] };
      const mode = msg.params.mode as string;
      const id = (msg.params.ids as string[])[0];
      const base = { skipped: [], ms: 1 };
      if (mode === 'shell')
        reply({
          ok: true,
          result: {
            ...base,
            roots: [{ t: 'FRAME', name: 'IAP', x: 10, y: 20, w: 360, h: 800, fills: [{ type: 'IMAGE', imageHash: 'h1' }], kids: [] }],
            childIds: [['1:1', '1:2']],
            imageRefs: [{ key: 'h1', kind: 'hash', hash: 'h1' }],
            fonts: [],
            outlined: 0,
          },
        });
      else
        reply({
          ok: true,
          result: {
            ...base,
            roots: [id === '1:1' ? text : tag],
            imageRefs: id === '1:2' ? [{ key: 'h2', kind: 'hash', hash: 'h2' }] : [],
            fonts: id === '1:1' ? ['BEAT TECH|Regular'] : [],
            outlined: id === '1:1' ? 1 : 0,
          },
        });
    } else if (msg.command === 'snapshot_images') {
      const refs = msg.params.refs as { key: string }[];
      reply({ ok: true, result: { images: Object.fromEntries(refs.map((r) => [r.key, `bytes-${r.key}`])) } });
    } else if (msg.command === 'snapshot_write') {
      const p = msg.params as { op: string; node: { name: string } };
      if (p.op === 'root') reply({ ok: true, result: { id: '5:1', missingFonts: [] } });
      else if (p.op === 'child')
        reply({
          ok: true,
          result: {
            id: '5:2',
            mismatches: p.node.name === 'Tag' ? [{ path: 'Tag', want: [82, 22], got: [82, 24] }] : [],
            missingFonts: p.node.name === 'Title' ? ['BEAT TECH|Regular'] : [],
          },
        });
      else reply({ ok: true, result: { id: '5:1', rootMismatch: false, rootSize: [360, 800], replaced: { oldId: '4:53', name: 'SCR-08' } } });
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
          info: {
            protocol: 2,
            fileKey: null,
            fileName: 'E2E',
            user: null,
            currentPage: { id: '0:1', name: 'Page 1' },
            version: '1.0.0 (e2e)',
            commands,
          },
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
        'annotate',
        'audit_design',
        'bind_variables',
        'clone_node',
        'copy_nodes',
        'create_component_set',
        'create_styles',
        'create_variables',
        'delete_nodes',
        'execute_code',
        'export_assets',
        'export_tokens',
        'figma_doctor',
        'figma_status',
        'find_nodes',
        'get_design_system',
        'get_document_info',
        'get_node',
        'get_selection',
        'import_tokens',
        'list_fonts',
        'manage_pages',
        'move_nodes',
        'paste_nodes',
        'rename_by_rule',
        'render_foundations',
        'render_tree',
        'screenshot',
        'search_design_system',
        'select_nodes',
        'set_current_page',
        'set_dev_status',
        'set_interactions',
        'stress_test',
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
    expect(content[0].type).toBe('image');
    expect(content[0].mimeType).toBe('image/webp');
    expect(typeof content[0].data).toBe('string');
    expect((content[0].data as string).length).toBeGreaterThan(0);
    expect(content[1].type).toBe('text');
  });

  it('surfaces plugin errors with the retry flag', async () => {
    const r = await client.callTool({ name: 'delete_nodes', arguments: { ids: ['9:9'] } });
    expect(r.isError).toBe(true);
    expect((r.content as { text: string }[])[0].text).toContain('safeToRetryWithoutCanvasRead: false');
  });

  it('scopes writes to a page and forwards the audit/params to the plugin', async () => {
    const { tools } = await client.listTools();

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

  it('warns when the plugin in Figma is another build than the server', async () => {
    const r = await client.callTool({ name: 'figma_status', arguments: {} });
    const body = JSON.parse((r.content as { text: string }[])[0].text);
    expect(body.versionCheck).toMatch(/⚠️.*E2E = 1\.0\.0 \(e2e\).*mở lại/);
  });

  it('masks the token unless it is asked for', async () => {
    const masked = await client.callTool({ name: 'figma_status', arguments: {} });
    const raw = (masked.content as { text: string }[])[0].text;
    const body = JSON.parse(raw);
    expect(raw).not.toContain(TOKEN);
    expect(body.token).toBe(`…${TOKEN.slice(-4)}`);
    expect(body.missingCommands).toEqual([]);
    expect(body.protocol).toBe(3);
    expect(body.portRange).toBe(1);
    expect(body.role).toBe('hub');

    const full = await client.callTool({ name: 'figma_status', arguments: { includeToken: true } });
    expect(JSON.parse((full.content as { text: string }[])[0].text).token).toBe(TOKEN);
  });

  it('figma_doctor reports every check without throwing', async () => {
    const r = await client.callTool({ name: 'figma_doctor', arguments: {} });
    expect(r.isError).toBeFalsy();
    const body = JSON.parse((r.content as { text: string }[])[0].text);
    expect(typeof body.ok).toBe('boolean');
    expect(Array.isArray(body.checks)).toBe(true);
    expect(body.checks.length).toBeGreaterThanOrEqual(5);
    expect(body.checks.map((c: { id: string }) => c.id)).toEqual(
      expect.arrayContaining(['server', 'port', 'token', 'plugin', 'version', 'capability', 'manifest']),
    );
    expect(Array.isArray(body.nextSteps)).toBe(true);
  });
});

describe('copy_nodes / paste_nodes', () => {
  it('copies into a snapshot file with images fetched in batches and fonts checked against the target', async () => {
    const r = await client.callTool({ name: 'copy_nodes', arguments: { ids: ['43206:6167'], name: 'IAP gốc', targetFile: 'E2E' } });
    expect(r.isError).toBeFalsy();
    const out = JSON.parse((r.content as { text: string }[])[0].text);
    expect(out.path).toBe(join(SNAP_DIR, 'IAP-goc.json'));
    expect(out).toMatchObject({ images: 2, missingImages: [], missingInTarget: ['BEAT TECH|Regular'], outlinedTexts: 1 });
    const reads = received.filter((x) => x.command === 'snapshot_read').map((x) => x.params as { mode: string; ids: string[]; availableFonts: string[] });
    expect(reads.map((r) => `${r.mode}:${r.ids[0]}`)).toEqual(['shell:43206:6167', 'child:1:1', 'child:1:2']);
    expect(reads[0].availableFonts).toBeUndefined();
    const saved = JSON.parse(readFileSync(out.path, 'utf8'));
    expect(saved).toMatchObject({ version: 1, name: 'IAP gốc', images: { h1: 'bytes-h1', h2: 'bytes-h2' }, roots: [{ name: 'IAP', kids: [{ name: 'Title' }, { name: 'Tag' }] }] });
  });

  it('pastes root shell, each child with only its images, then finalizes with replaceId', async () => {
    const before = received.length;
    const r = await client.callTool({ name: 'paste_nodes', arguments: { snapshot: 'IAP gốc', replaceId: '4:53' } });
    expect(r.isError).toBeFalsy();
    const writes = received.slice(before).filter((x) => x.command === 'snapshot_write').map((x) => x.params as Record<string, unknown>);
    expect(writes.map((w) => w.op)).toEqual(['root', 'child', 'child', 'finalize']);
    expect(writes[0]).toMatchObject({ replaceId: '4:53', images: { h1: 'bytes-h1' }, node: { kids: [] } });
    expect(writes[1].images).toEqual({});
    expect(writes[2].images).toEqual({ h2: 'bytes-h2' });
    expect(writes[3]).toMatchObject({ rootId: '5:1', replaceId: '4:53' });
    const out = JSON.parse((r.content as { text: string }[])[0].text);
    expect(out).toMatchObject({ exact: false, missingFonts: ['BEAT TECH|Regular'], mismatches: [{ path: 'IAP/Tag' }] });
  });

  it('refuses a missing snapshot before reaching Figma', async () => {
    const before = received.length;
    const r = await client.callTool({ name: 'paste_nodes', arguments: { snapshot: 'nope' } });
    expect(r.isError).toBe(true);
    expect(received.length).toBe(before);
  });
});

describe('figma-ui-flow tools with server-side work', () => {
  const example = join(__dirname, '..', '.claude', 'skills', 'figma-ui-flow', 'assets', 'tokens.example.json');

  it('import_tokens lints and plans on the server, then sends collections', async () => {
    const r = await client.callTool({ name: 'import_tokens', arguments: { path: example, dryRun: true } });
    expect(r.isError).toBeFalsy();
    const sent = received.filter((x) => x.command === 'import_tokens').at(-1)!.params as {
      collections: { collection: string; modes: string[] }[];
      dryRun: boolean;
      onExisting: string;
    };
    expect(sent.collections.map((c) => c.collection)).toEqual(['Primitives', 'Semantic']);
    expect(sent.collections[1].modes).toEqual(['Light', 'Dark']);
    expect(sent).toMatchObject({ dryRun: true, onExisting: 'skip' });
  });

  it('import_tokens stops on check_tokens errors before reaching Figma', async () => {
    const before = received.length;
    const r = await client.callTool({
      name: 'import_tokens',
      arguments: { tokens: { primitives: { color: { Blue: { $type: 'color', $value: '#00F' } } } } },
    });
    expect(r.isError).toBe(true);
    expect(JSON.stringify(r.content)).toMatch(/check_tokens/);
    expect(received.length).toBe(before);
  });

  it('export_tokens converts and writes the file', async () => {
    const out = join(mkdtempSync(join(tmpdir(), 'export-')), 'tokens.css');
    const r = await client.callTool({ name: 'export_tokens', arguments: { format: 'css', path: out } });
    expect(r.isError).toBeFalsy();
    const css = readFileSync(out, 'utf8');
    expect(css).toContain('--color-text-primary: var(--color-gray-900);');
    expect(css).toContain('[data-theme="dark"]');
  });

  it('export_assets writes one file per scale', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'assets-'));
    const r = await client.callTool({ name: 'export_assets', arguments: { ids: ['1:2'], scales: [1, 2], outDir: dir } });
    expect(r.isError).toBeFalsy();
    expect(existsSync(join(dir, 'icon-home.png'))).toBe(true);
    expect(existsSync(join(dir, 'icon-home@2x.png'))).toBe(true);
  });

  it('bind_variables and rename_by_rule default to dryRun', async () => {
    await client.callTool({ name: 'bind_variables', arguments: { rootId: '1:2' } });
    await client.callTool({ name: 'rename_by_rule', arguments: { rootId: '1:2' } });
    expect(received.filter((x) => x.command === 'bind_variables').at(-1)!.params).toMatchObject({ dryRun: true, auto: true, tolerance: 2 });
    expect(received.filter((x) => x.command === 'rename_by_rule').at(-1)!.params).toMatchObject({ dryRun: true, auto: true });
  });
});
