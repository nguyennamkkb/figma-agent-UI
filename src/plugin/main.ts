// Plugin sandbox entry: shows the bridge UI and executes commands relayed by
// it. Commands run one at a time so concurrent requests never interleave.
import type { ClientInfo, RequestMessage, ResponseMessage } from '../shared/protocol';
import { PROTOCOL_VERSION } from '../shared/protocol';
import { executeCode } from './commands/execute';
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
};

figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

function clientInfo(): ClientInfo {
  return {
    protocol: PROTOCOL_VERSION,
    fileKey: figma.fileKey ?? null,
    fileName: figma.root.name,
    user: figma.currentUser?.name ?? null,
    currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
  };
}

let queue: Promise<unknown> = Promise.resolve();

async function run(req: RequestMessage): Promise<ResponseMessage> {
  const cmd = commands[req.command];
  if (!cmd) {
    return { type: 'response', id: req.id, ok: false, error: `Unknown command "${req.command}".`, safeToRetryWithoutCanvasRead: true };
  }
  try {
    const result = await cmd.run((req.params ?? {}) as never);
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
