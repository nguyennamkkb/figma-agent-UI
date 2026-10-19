// Wire protocol between the MCP server (WebSocket server) and the plugin UI
// (WebSocket client). The UI relays requests to the plugin sandbox via
// postMessage and relays responses back unchanged.

export const PROTOCOL_VERSION = 1;
export const DEFAULT_PORT = 3055;

export interface ClientInfo {
  protocol: number;
  fileKey: string | null;
  fileName: string;
  user: string | null;
  currentPage: { id: string; name: string };
  // Stamped at build time, e.g. "1.0.0 (a1b2c3d)" — lets the agent and the
  // plugin panel tell a fresh build from a stale one.
  version?: string;
}

export interface RequestMessage {
  type: 'request';
  id: string;
  command: string;
  params: unknown;
}

export type ResponseMessage =
  | { type: 'response'; id: string; ok: true; result: unknown }
  | {
      type: 'response';
      id: string;
      ok: false;
      error: string;
      // true when the failed command left the canvas untouched (read-only
      // command, or a write that was rolled back), so it can be retried as is.
      safeToRetryWithoutCanvasRead: boolean;
    };

export type PluginToServer =
  | { type: 'hello'; info: ClientInfo }
  | ResponseMessage
  | { type: 'event'; event: 'pagechange' | 'selectionchange'; info: ClientInfo };

export type ServerToPlugin = RequestMessage;
