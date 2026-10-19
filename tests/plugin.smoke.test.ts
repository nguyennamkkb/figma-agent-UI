// Loads the built code.js in a VM with a minimal fake `figma` global to check
// the bundle evaluates and the dispatcher answers requests. Real rendering is
// verified manually in Figma (see TESTING.md).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

interface Posted {
  type: string;
  id?: string;
  ok?: boolean;
  result?: Record<string, unknown>;
  error?: string;
  safeToRetryWithoutCanvasRead?: boolean;
}

function loadPlugin() {
  const posted: Posted[] = [];
  let onmessage: (msg: unknown) => void = () => {};
  const page = { id: '0:1', name: 'Page 1', type: 'PAGE', children: [], selection: [] };
  const figma = {
    mixed: Symbol('mixed'),
    fileKey: undefined,
    root: { name: 'Smoke file', children: [page] },
    currentPage: page,
    currentUser: { name: 'Tester' },
    showUI: () => {},
    commitUndo: () => {},
    on: () => {},
    clientStorage: { getAsync: async () => ({ token: 't' }), setAsync: async () => {} },
    ui: {
      set onmessage(fn: (msg: unknown) => void) {
        onmessage = fn;
      },
      postMessage: (m: Posted) => posted.push(m),
      resize: () => {},
    },
    getNodeByIdAsync: async () => null,
  };
  const code = readFileSync(join(__dirname, '..', 'code.js'), 'utf8');
  vm.runInNewContext(code, { figma, __html__: '<html></html>', console, setTimeout, Promise });
  const send = async (msg: object) => {
    onmessage(msg);
    await new Promise((r) => setTimeout(r, 20));
  };
  return { posted, send };
}

describe('plugin bundle', () => {
  it('sends init with client info and stored settings', async () => {
    const { posted, send } = loadPlugin();
    await send({ type: 'ready' });
    expect(posted[0]).toMatchObject({
      type: 'init',
      info: { fileName: 'Smoke file', user: 'Tester', currentPage: { name: 'Page 1' } },
      settings: { token: 't' },
    });
  });

  it('answers read commands and reports unknown ones', async () => {
    const { posted, send } = loadPlugin();
    await send({ type: 'request', id: 'a', command: 'get_document_info', params: {} });
    await send({ type: 'request', id: 'b', command: 'nope', params: {} });
    expect(posted.find((m) => m.id === 'a')).toMatchObject({ ok: true, result: { fileName: 'Smoke file', pages: [{ name: 'Page 1' }] } });
    expect(posted.find((m) => m.id === 'b')).toMatchObject({ ok: false, safeToRetryWithoutCanvasRead: true });
  });

  it('runs execute_code with figma and helpers in scope', async () => {
    const { posted, send } = loadPlugin();
    const code = 'const p = figma.currentPage; await null; return { page: p.name, rgb: h.rgb("#FF0000"), mixed: figma.mixed };';
    await send({ type: 'request', id: 'c', command: 'execute_code', params: { code } });
    expect(posted.find((m) => m.id === 'c')).toMatchObject({
      ok: true,
      result: { result: { page: 'Page 1', rgb: { r: 1, g: 0, b: 0 }, mixed: 'MIXED' } },
    });
  });

  it('reports execute_code failures as not safe to retry', async () => {
    const { posted, send } = loadPlugin();
    await send({ type: 'request', id: 'd', command: 'execute_code', params: { code: 'throw new Error("bad")' } });
    await send({ type: 'request', id: 'e', command: 'execute_code', params: { code: 'return (' } });
    expect(posted.find((m) => m.id === 'd')).toMatchObject({ ok: false, error: 'bad', safeToRetryWithoutCanvasRead: false });
    expect(posted.find((m) => m.id === 'e')?.error).toMatch(/Syntax error/);
  });

  it('dispatches every figma-ui-flow command (none is "Unknown command")', async () => {
    const { posted, send } = loadPlugin();
    const commands = [
      'search_design_system', 'create_styles', 'import_tokens', 'export_tokens', 'render_foundations',
      'create_component_set', 'stress_test', 'set_interactions', 'bind_variables', 'rename_by_rule',
      'annotate', 'set_dev_status', 'export_assets', 'audit_design', 'manage_pages', 'create_variables',
    ];
    for (const [i, command] of commands.entries()) await send({ type: 'request', id: `m${i}`, command, params: {} });
    for (const [i, command] of commands.entries()) {
      const res = posted.find((m) => m.id === `m${i}`);
      expect(res, command).toBeDefined();
      expect(res?.error ?? '', command).not.toMatch(/Unknown command/);
    }
  });
});

