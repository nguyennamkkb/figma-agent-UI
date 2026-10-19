// Plugin sandbox entry: shows the bridge UI and executes commands relayed by
// it. Commands run one at a time so concurrent requests never interleave.
import type { ClientInfo, RequestMessage, ResponseMessage } from '../shared/protocol';
import { PROTOCOL_VERSION } from '../shared/protocol';
import { executeCode } from './commands/execute';
import { auditDesign } from './commands/audit';
import { managePages } from './commands/pages';
import { createVariables } from './commands/variables';
import { bindVariables } from './commands/bind';
import { createComponentSet } from './commands/components';
import { annotate, exportAssets, setDevStatus } from './commands/handoff';
import { setInteractions } from './commands/interactions';
import { renameByRule } from './commands/rename';
import { searchDesignSystem } from './commands/search';
import { stressTest } from './commands/stress';
import { createStyles } from './commands/styles';
import { importTokens, readTokens, renderFoundations } from './commands/tokens';
import {
  findNodes,
  getDesignSystem,
  getDocumentInfo,
  getNodes,
  getSelection,
  listFontFamilies,
  screenshot,
  setCurrentPage,
} from './commands/read';
import { renderTree } from './commands/render';
import { cloneNode, deleteNodes, moveNodes, selectNodes, updateNodes } from './commands/write';
import { errorMessage, RolledBackError } from './util';

interface Command {
  mutates: boolean;
  // Params are validated by the MCP server before they reach the plugin.
  run(params: never): Promise<unknown>;
}

const commands: Record<string, Command> = {
  get_document_info: { mutates: false, run: getDocumentInfo },
  set_current_page: { mutates: false, run: setCurrentPage },
  get_selection: { mutates: false, run: getSelection },
  get_node: { mutates: false, run: getNodes },
  find_nodes: { mutates: false, run: findNodes },
  get_design_system: { mutates: false, run: getDesignSystem },
  list_fonts: { mutates: false, run: listFontFamilies },
  screenshot: { mutates: false, run: screenshot },
  select_nodes: { mutates: false, run: selectNodes },
  render_tree: { mutates: true, run: renderTree },
  update_nodes: { mutates: true, run: updateNodes },
  delete_nodes: { mutates: true, run: deleteNodes },
  move_nodes: { mutates: true, run: moveNodes },
  clone_node: { mutates: true, run: cloneNode },
  execute_code: { mutates: true, run: executeCode },
  audit_design: { mutates: false, run: auditDesign },
  manage_pages: { mutates: true, run: managePages },
  create_variables: { mutates: true, run: createVariables },
  search_design_system: { mutates: false, run: searchDesignSystem },
  create_styles: { mutates: true, run: createStyles },
  import_tokens: { mutates: true, run: importTokens },
  export_tokens: { mutates: false, run: readTokens },
  render_foundations: { mutates: true, run: renderFoundations },
  create_component_set: { mutates: true, run: createComponentSet },
  stress_test: { mutates: true, run: stressTest },
  set_interactions: { mutates: true, run: setInteractions },
  bind_variables: { mutates: true, run: bindVariables },
  rename_by_rule: { mutates: true, run: renameByRule },
  annotate: { mutates: true, run: annotate },
  set_dev_status: { mutates: true, run: setDevStatus },
  export_assets: { mutates: false, run: exportAssets },
};

figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

function clientInfo(): ClientInfo {
  return {
    protocol: PROTOCOL_VERSION,
    fileKey: figma.fileKey ?? null,
    fileName: figma.root.name,
    user: figma.currentUser?.name ?? null,
    currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
    version: `${__PLUGIN_VERSION__} (${__PLUGIN_BUILD__})`,
  };
}

let queue: Promise<unknown> = Promise.resolve();

async function run(req: RequestMessage): Promise<ResponseMessage> {
  const cmd = commands[req.command];
  if (!cmd) {
    return { type: 'response', id: req.id, ok: false, error: `Unknown command "${req.command}".`, safeToRetryWithoutCanvasRead: true };
  }
  // `page` scopes the command to one page regardless of which page another
  // agent switched to (the current page is file-global state). We switch,
  // run, then hand the previous page back.
  const raw = (req.params ?? {}) as Record<string, unknown>;
  const target = typeof raw.page === 'string' && req.command !== 'set_current_page' ? raw.page : null;
  const { page: _scope, ...params } = raw;
  let previous: PageNode | null = null;
  try {
    if (target) {
      const page = figma.root.children.find((x) => x.id === target || x.name === target);
      if (!page) {
        throw new Error(`Page "${target}" not found. Pages: ${figma.root.children.map((x) => x.name).join(', ')}.`);
      }
      if (page.id !== figma.currentPage.id) {
        previous = figma.currentPage;
        await figma.setCurrentPageAsync(page);
      }
    }
    const result = await cmd.run(params as never);
    if (cmd.mutates) figma.commitUndo();
    return { type: 'response', id: req.id, ok: true, result };
  } catch (e) {
    if (cmd.mutates) figma.commitUndo();
    return {
      type: 'response',
      id: req.id,
      ok: false,
      error: errorMessage(e),
      safeToRetryWithoutCanvasRead: !cmd.mutates || e instanceof RolledBackError,
    };
  } finally {
    if (previous) {
      try {
        await figma.setCurrentPageAsync(previous);
      } catch {
        // the page may have been deleted by this command; leave the new one
      }
    }
  }
}

type UiMessage =
  | { type: 'ready' }
  | { type: 'save-settings'; settings: Record<string, unknown> }
  | { type: 'resize'; width: number; height: number }
  | RequestMessage;

figma.ui.onmessage = (msg: UiMessage) => {
  if (msg.type === 'ready') {
    figma.clientStorage.getAsync('settings').then((settings) => {
      figma.ui.postMessage({ type: 'init', info: clientInfo(), settings: settings ?? {} });
    });
  } else if (msg.type === 'save-settings') {
    figma.clientStorage.setAsync('settings', msg.settings);
  } else if (msg.type === 'resize') {
    figma.ui.resize(msg.width, msg.height);
  } else if (msg.type === 'request') {
    const started = Date.now();
    queue = queue.then(async () => {
      const res = await run(msg);
      figma.ui.postMessage({ ...res, ms: Date.now() - started, command: msg.command });
    });
  }
};

figma.on('currentpagechange', () => figma.ui.postMessage({ type: 'event', event: 'pagechange', info: clientInfo() }));
