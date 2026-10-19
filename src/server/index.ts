#!/usr/bin/env node
// MCP server (stdio) exposing Figma tools. It hosts the WebSocket bridge the
// plugin connects to. stdout belongs to MCP: log to stderr only.
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DEFAULT_PORT } from '../shared/protocol';
import * as S from '../shared/schemas';
import { Bridge, PluginError } from './bridge';
import { inlineImages } from './images';

const log = (msg: string) => process.stderr.write(`[figma-agent] ${msg}\n`);
const MAX_TEXT = Number(process.env.FIGMA_AGENT_MAX_OUTPUT ?? 20000);

function loadToken(): string {
  if (process.env.FIGMA_AGENT_TOKEN) return process.env.FIGMA_AGENT_TOKEN;
  const dir = join(homedir(), '.figma-agent');
  const file = join(dir, 'token');
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    const token = randomBytes(12).toString('hex');
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, token + '\n', { mode: 0o600 });
    return token;
  }
}

const token = loadToken();
const port = Number(process.env.FIGMA_AGENT_PORT ?? DEFAULT_PORT);
const bridge = new Bridge({ port, token, log });

const INSTRUCTIONS = `Tools that read, create, edit and screenshot designs in the Figma file where the "figma-agent-UI" plugin is open.
Workflow: (1) inspect first: get_document_info, get_design_system, get_selection; reuse existing components, variables and styles instead of hardcoding values.
(2) build new screens with render_tree (one wrapper frame, auto layout everywhere); edit with update_nodes; use execute_code for anything else in the Plugin API.
(3) verify with screenshot after composing and after each fix; fix the specific node instead of rebuilding.
Every write returns node ids: keep them, there is no other state. If a write fails with safeToRetryWithoutCanvasRead=false, read the canvas before retrying.`;

const server = new McpServer({ name: 'figma-agent', version: '1.0.0' }, { instructions: INSTRUCTIONS });

const fileParam = {
  file: z.string().optional().describe('Target file name or key when several Figma files are connected'),
};

type Content = { type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string };

function text(value: unknown): Content {
  let s = JSON.stringify(value, null, 1);
  if (s.length > MAX_TEXT) {
    s = s.slice(0, MAX_TEXT) + `\n…[truncated ${s.length - MAX_TEXT} chars: narrow the query (depth, ids, limit)]`;
  }
  return { type: 'text', text: s };
}

function failure(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  const safe = e instanceof PluginError ? e.safeToRetryWithoutCanvasRead : true;
  return {
    isError: true,
    content: [{ type: 'text' as const, text: `Error: ${msg}\nsafeToRetryWithoutCanvasRead: ${safe}` }],
  };
}

interface ToolDef<T extends z.ZodObject> {
  description: string;
  input: T;
  readOnly?: boolean;
  timeoutMs?: (args: z.infer<T>) => number;
  prepare?: (args: z.infer<T>) => Promise<unknown>;
  format?: (result: unknown) => Content[];
}

function tool<T extends z.ZodObject>(name: string, def: ToolDef<T>) {
  const input = def.input.extend(fileParam);
  server.registerTool(
    name,
    {
      description: def.description,
      inputSchema: input,
      annotations: { readOnlyHint: def.readOnly ?? false, openWorldHint: false },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the SDK infers args from the schema
    (async (args: any) => {
      try {
        const { file, ...rest } = args as z.infer<T> & { file?: string };
        const params = def.prepare ? await def.prepare(rest as z.infer<T>) : rest;
        const result = await bridge.request(name, params, {
          file,
          timeoutMs: def.timeoutMs?.(rest as z.infer<T>) ?? 30000,
        });
        return { content: def.format ? def.format(result) : [text(result)] };
      } catch (e) {
        return failure(e);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );
}

server.registerTool(
  'figma_status',
  {
    description: 'Bridge status and connected Figma files. Call first if any tool reports no connection.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => ({
    content: [
      text({
        ...bridge.status(),
        token,
        howToConnect:
          'Figma desktop → Plugins → Development → figma-agent-UI. Paste the token in the plugin and press Connect.',
      }),
    ],
  }),
);

tool('get_document_info', {
  description: 'File name, pages, current page, selection and top-level layers of the current page.',
  input: z.object({}),
  readOnly: true,
});

tool('set_current_page', {
  description: 'Switch the current page (by id or exact name). Other tools work on the current page.',
  input: S.SetPageInput,
});

tool('get_selection', {
  description: 'Serialize the selected layers (layout, sizing, fills as hex or variable names, text, components).',
  input: S.GetSelectionInput,
  readOnly: true,
});

tool('get_node', {
  description:
    'Serialize nodes by id in the same vocabulary as render_tree/update_nodes. Use depth to control how many child levels are returned.',
  input: S.GetNodeInput,
  readOnly: true,
});

tool('find_nodes', {
  description: 'Search layers under a root (default current page) by type, name substring or text content.',
  input: S.FindNodesInput,
  readOnly: true,
});

tool('get_design_system', {
  description:
    'Local variables (with modes and values), paint/text/effect styles, local components with their properties, library components already used on the page, and optionally library variable collections. Check this before building so you reuse tokens and components.',
  input: S.DesignSystemInput,
  readOnly: true,
  timeoutMs: () => 120000,
});

tool('list_fonts', {
  description: 'Installed font families and their exact style names (e.g. "Semi Bold" vs "SemiBold").',
  input: S.ListFontsInput,
  readOnly: true,
});

tool('screenshot', {
  description:
    'PNG of a node (default: first selected). Use it to verify your work: look for clipped text, overlaps, misalignment and spacing issues.',
  input: S.ScreenshotInput,
  readOnly: true,
  timeoutMs: () => 60000,
  format: (r) => {
    const { base64, mimeType, ...meta } = r as { base64: string; mimeType: string };
    return [{ type: 'image', data: base64, mimeType }, text(meta)];
  },
});

tool('select_nodes', {
  description: 'Select layers on the current page and optionally zoom to them, to show the user a result.',
  input: S.SelectNodesInput,
});

tool('render_tree', {
  description: `Create a whole layout from a nested JSON tree in one call (frames with auto layout, text, rect, ellipse, svg icons, images, component instances).
Rules: build one wrapper frame; use layout HORIZONTAL/VERTICAL with gap/padding instead of x/y; widthMode FILL needs an auto-layout parent; text wraps when it has a width or widthMode FILL; colors are hex or {var:"name"} to bind variables; text styles/paint styles/effect styles by name.
Images (src / {image}) may be URLs or local paths: the server downloads them. If anything fails, the partial result is removed.
Returns rootId and an ids map "Root/Child/Grandchild" → node id.`,
  input: S.RenderTreeInput,
  timeoutMs: () => 120000,
  prepare: (args) => inlineImages(args),
});

tool('update_nodes', {
  description:
    'Patch properties of existing nodes in a batch, using the same properties as render_tree (text, fonts, fills, stroke, radius, effects, layout, padding, gap, sizing, variables, instance variant/properties/texts, component swap). Returns updated and failed ids.',
  input: S.UpdateNodesInput,
  timeoutMs: () => 60000,
  prepare: (args) => inlineImages(args),
});

tool('delete_nodes', { description: 'Delete layers by id.', input: S.DeleteNodesInput });

tool('move_nodes', {
  description: 'Reparent and/or reorder layers (parentId, index) or set x/y for absolutely positioned layers.',
  input: S.MoveNodesInput,
});

tool('clone_node', {
  description: 'Duplicate a layer, optionally into another parent or position. Returns the copy.',
  input: S.CloneNodeInput,
});

tool('execute_code', {
  description: `Run JavaScript against the Figma Plugin API for anything the other tools do not cover (components/variants, variables and modes, styles, prototyping, constraints, boolean ops, vector edits, bulk edits...).
The code is the body of an async function with globals \`figma\` and \`h\`; use top-level await and \`return\` a JSON-friendly value (nodes are summarized automatically). console.log output is not returned.
Rules: colors are 0..1 RGB with opacity on the paint; fills/strokes arrays are immutable (clone, edit, reassign); load fonts before editing text (await h.loadNodeFonts(textNode) or figma.loadFontAsync); use figma.getNodeByIdAsync and await figma.setCurrentPageAsync; resize() before setting layoutSizing*; FILL only inside auto layout. Do not call figma.closePlugin(). Return every created/changed id.
Helpers h: solid(hex) → SolidPaint, rgb(hex), hex(rgb), getNode(id), loadFont(fontName), loadNodeFonts(text), resolveFont(family, style), serialize(node, depth), summary(node), freeSpot() → {x,y} for new top-level nodes.`,
  input: S.ExecuteCodeInput,
  timeoutMs: (a) => a.timeoutMs,
});

async function main() {
  await bridge.start();
  log(`token: ${token}  (stored in ~/.figma-agent/token, override with FIGMA_AGENT_TOKEN)`);
  await server.connect(new StdioServerTransport());
}

main().catch((e) => {
  log(`fatal: ${e instanceof Error ? e.stack : String(e)}`);
  process.exit(1);
});

// Exit with the MCP client: the WebSocket server would otherwise keep the
// process (and the port) alive.
const shutdown = () => void bridge.stop().finally(() => process.exit(0));
process.stdin.on('close', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
