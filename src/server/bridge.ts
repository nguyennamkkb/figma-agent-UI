// WebSocket server the plugin UI connects to. Tracks one connection per open
// Figma file and correlates requests with responses by id.
import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import {
  DEFAULT_PORT_RANGE,
  type ClientInfo,
  type FileSummary,
  type NoticeMessage,
  type PluginToServer,
  type RequestMessage,
} from '../shared/protocol';

export class PluginError extends Error {
  constructor(
    message: string,
    readonly safeToRetryWithoutCanvasRead: boolean,
  ) {
    super(message);
  }
}

interface Client {
  id: string;
  ws: WebSocket;
  info: ClientInfo | null;
  connectedAt: number;
  lastSeen: number;
}

interface Pending {
  resolve(v: unknown): void;
  reject(e: Error): void;
  timer: NodeJS.Timeout;
  client: Client;
}

export interface BridgeOptions {
  port: number;
  host?: string;
  token: string;
  log?: (msg: string) => void;
  /** How many consecutive ports to try when the first ones are busy. */
  portRange?: number;
  /** Commands this server can send to the plugin (used in the "old plugin" error). */
  supportedCommands?: () => string[];
}

export class Bridge {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, Client>();
  private pending = new Map<string, Pending>();
  private heartbeat: NodeJS.Timeout | null = null;
  private servers: Server[] = [];
  private actualPort: number | null = null;
  listenError: string | null = null;

  constructor(private opts: BridgeOptions) {}

  // Ports this bridge may use: the requested one and the next ones, so a
  // second MCP client on the same machine can take the next free port.
  private candidates(): number[] {
    const range = Math.max(1, this.opts.portRange ?? DEFAULT_PORT_RANGE);
    // port 0 means "any free port" (tests): bind exactly that, never fall back.
    if (this.opts.port === 0) return [0];
    return Array.from({ length: range }, (_, i) => this.opts.port + i);
  }

  // Listens on loopback only. The plugin connects to "localhost", which may
  // resolve to either IPv4 or IPv6, so both loopback addresses are bound.
  async start(): Promise<void> {
    const log = this.opts.log ?? (() => {});
    const wss = new WebSocketServer({ noServer: true });
    wss.on('connection', (ws, req) => this.onConnection(ws, req));
    const hosts = this.opts.host ? [this.opts.host] : ['127.0.0.1', '::1'];
    const candidates = this.candidates();
    const tried: number[] = [];

    for (const port of candidates) {
      const servers: Server[] = [];
      let unusable = false;
      for (let i = 0; i < hosts.length; i++) {
        const host = hosts[i];
        const http = createServer((_req, res) => {
          res.writeHead(426).end('figma-agent bridge: WebSocket only');
        });
        http.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)));
        const err = await new Promise<NodeJS.ErrnoException | null>((resolve) => {
          http.once('error', resolve);
          http.listen(port, host, () => resolve(null));
        });
        if (!err) {
          servers.push(http);
          continue;
        }
        if (i === 0) {
          // The primary host failed → this port cannot be used, try the next one.
          unusable = true;
          tried.push(port);
          log(`port ${port} unusable on ${host} (${err.message}) — trying the next port`);
          break;
        }
        // A secondary host failing is fine: no IPv6 loopback on this machine,
        // or the IPv6 port is taken while IPv4 works. One of the two is enough.
        log(`warning: ${host}:${port} unavailable (${err.message}) — continuing on ${hosts[0]}`);
      }
      if (unusable || servers.length === 0) continue;
      this.servers = servers;
      this.actualPort = port === 0 ? this.boundPort(servers) : port;
      break;
    }

    if (this.servers.length === 0) {
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      this.listenError =
        `Không tìm được port trống trong ${first}-${last} (đã thử: ${tried.join(', ') || '—'}). ` +
        `Có tiến trình khác đang chiếm port (MCP client khác, figma-agent cũ). ` +
        `Đóng chúng rồi khởi động lại server, hoặc đặt FIGMA_AGENT_PORT. Kiểm tra: lsof -i :${first}-${last}`;
      for (const h of this.servers) h.close();
      this.servers = [];
      log(this.listenError);
      return;
    }
    this.wss = wss;
    log(`listening on ws://localhost:${this.port} (candidates ${candidates[0]}-${candidates[candidates.length - 1]})`);
    this.heartbeat = setInterval(() => {
      for (const c of this.clients.values()) {
        if (c.ws.readyState === WebSocket.OPEN) c.ws.ping();
      }
    }, 20000);
    this.heartbeat.unref();
  }

  private boundPort(servers: Server[]): number {
    const addr = servers[0]?.address();
    return addr && typeof addr === 'object' ? addr.port : this.opts.port;
  }

  async stop(): Promise<void> {
    if (this.heartbeat) clearInterval(this.heartbeat);
    for (const c of this.clients.values()) c.ws.terminate();
    this.wss?.close();
    await Promise.all(this.servers.map((h) => new Promise<void>((r) => h.close(() => r()))));
    this.servers = [];
  }

  private onConnection(ws: WebSocket, req: IncomingMessage) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.searchParams.get('token') !== this.opts.token) {
      ws.close(4001, 'invalid token');
      return;
    }
    const client: Client = { id: randomUUID(), ws, info: null, connectedAt: Date.now(), lastSeen: Date.now() };
    this.clients.set(client.id, client);
    this.opts.log?.(`plugin connected (${client.id.slice(0, 8)})`);
    this.broadcastFiles();

    ws.on('pong', () => (client.lastSeen = Date.now()));
    ws.on('message', (data) => {
      client.lastSeen = Date.now();
      let msg: PluginToServer;
      try {
        msg = JSON.parse(String(data));
      } catch {
        return;
      }
      if (msg.type === 'hello' || msg.type === 'event') {
        // Merge, don't replace: an event must not drop the capability list or
        // the pinned file the plugin reported in its hello.
        client.info = { ...client.info, ...msg.info };
        this.broadcastFiles();
      } else if (msg.type === 'response') this.onResponse(msg);
    });
    ws.on('close', () => {
      this.clients.delete(client.id);
      this.opts.log?.(`plugin disconnected (${client.info?.fileName ?? client.id.slice(0, 8)})`);
      for (const [id, p] of this.pending) {
        if (p.client === client) {
          clearTimeout(p.timer);
          this.pending.delete(id);
          p.reject(new PluginError('The Figma plugin disconnected before answering.', false));
        }
      }
      this.broadcastFiles();
    });
  }

  // Tells every open plugin which files are connected (the panel file picker).
  // The list is sent only when it actually changes, so a selection event does
  // not flood every panel with the same list.
  private filesSignature = '';
  private broadcastFiles() {
    const files: FileSummary[] = [...this.clients.values()]
      .filter((c) => c.ws.readyState === WebSocket.OPEN)
      .map((c) => ({
        fileName: c.info?.fileName ?? 'Unknown file',
        fileKey: c.info?.fileKey ?? null,
        currentPage: c.info?.currentPage?.name ?? '',
      }));
    const signature = JSON.stringify(files);
    if (signature === this.filesSignature) return;
    this.filesSignature = signature;
    const msg: NoticeMessage = { type: 'notice', notice: 'files', files };
    const payload = JSON.stringify(msg);
    for (const c of this.clients.values()) {
      if (c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
    }
  }

  private onResponse(msg: Extract<PluginToServer, { type: 'response' }>) {
    const p = this.pending.get(msg.id);
    if (!p) return;
    clearTimeout(p.timer);
    this.pending.delete(msg.id);
    if (msg.ok) p.resolve(msg.result);
    else p.reject(new PluginError(msg.error, msg.safeToRetryWithoutCanvasRead));
  }

  // Actual port (differs from opts.port when it is 0, or when a busy port
  // pushed the bridge to the next one).
  get port(): number {
    const addr = this.servers[0]?.address();
    if (addr && typeof addr === 'object') return addr.port;
    return this.actualPort ?? this.opts.port;
  }

  // The file the user pinned in the panel (null when nothing is pinned).
  // Drafts have no fileKey and are pinned by name, so report the name then.
  private preferredFileKey(): string | null {
    const open = [...this.clients.values()].filter((c) => c.ws.readyState === WebSocket.OPEN);
    const pinned = open.find((c) => this.isPinned(c));
    return pinned?.info?.fileKey ?? pinned?.info?.fileName ?? null;
  }

  // A file is "pinned" when the panel named it. Untitled drafts have no
  // fileKey, so the panel pins them by name.
  private isPinned(c: Client): boolean {
    const info = c.info;
    const pin = info?.preferredFileKey;
    if (!info || pin == null) return false;
    if (info.fileKey != null) return pin === info.fileKey;
    return pin === info.fileName;
  }

  status() {
    return {
      listening: !!this.wss,
      error: this.listenError,
      port: this.port,
      portRange: this.opts.portRange ?? DEFAULT_PORT_RANGE,
      ports: this.candidates(),
      preferredFile: this.preferredFileKey(),
      files: [...this.clients.values()].map((c) => ({
        fileName: c.info?.fileName ?? null,
        fileKey: c.info?.fileKey ?? null,
        user: c.info?.user ?? null,
        currentPage: c.info?.currentPage ?? null,
        pluginVersion: c.info?.version ?? null,
        connectedAt: new Date(c.connectedAt).toISOString(),
      })),
    };
  }

  // Commands this server can send that the connected plugin does not support.
  // Plugins that do not report their command list (protocol v1) are ignored:
  // we cannot tell what they miss, so we do not guess.
  missingCommands(supported: string[]): string[] {
    const reporting = [...this.clients.values()].filter(
      (c) => c.ws.readyState === WebSocket.OPEN && Array.isArray(c.info?.commands) && (c.info?.commands?.length ?? 0) > 0,
    );
    if (reporting.length === 0) return [];
    const missing = new Set<string>();
    for (const c of reporting) {
      const known = new Set(c.info?.commands ?? []);
      for (const s of supported) if (!known.has(s)) missing.add(s);
    }
    return [...missing];
  }

  // Picks the file to talk to: by fileKey/name when given, otherwise the
  // file pinned in the panel, otherwise the only open connection.
  private pick(file?: string): Client {
    if (!this.wss) throw new PluginError(this.listenError ?? 'Bridge is not listening.', true);
    const open = [...this.clients.values()].filter((c) => c.ws.readyState === WebSocket.OPEN);
    if (open.length === 0) {
      throw new PluginError(
        'No Figma file is connected. Open the "figma-agent-UI" plugin in Figma (Plugins → Development) and enter the token.',
        true,
      );
    }
    if (file) {
      // fileKey first, then the name (two files may share a name).
      const hit = open.find((c) => c.info?.fileKey === file) ?? open.find((c) => c.info?.fileName === file);
      if (!hit) {
        const names = open.map((c) => c.info?.fileName).join(', ');
        throw new PluginError(`File "${file}" is not connected. Connected: ${names}.`, true);
      }
      return hit;
    }
    // The file pinned in the panel wins.
    const pinned = open.filter((c) => this.isPinned(c));
    if (pinned.length === 1) return pinned[0];
    if (open.length === 1) return open[0];
    // Several files and no preference: never guess, ask for the file.
    const names = open.map((c) => c.info?.fileName ?? '(unknown)').join(', ');
    throw new PluginError(
      `Nhiều file Figma đang mở (${names}). Chọn file bằng tham số "file", hoặc ghim file trong panel plugin.`,
      true,
    );
  }

  request<T = unknown>(command: string, params: unknown, opts: { file?: string; timeoutMs?: number } = {}): Promise<T> {
    let client: Client;
    try {
      client = this.pick(opts.file);
    } catch (e) {
      return Promise.reject(e);
    }
    // Protocol v2: the plugin tells us which commands it supports. A plugin
    // that reports a list but not this command is an old build.
    const commands = client.info?.commands;
    if (Array.isArray(commands) && commands.length > 0 && !commands.includes(command)) {
      const supported = this.opts.supportedCommands?.() ?? [];
      const missing = [...new Set([command, ...supported.filter((c) => !commands.includes(c))])];
      return Promise.reject(
        new PluginError(
          `Plugin đang mở là bản cũ, chưa hỗ trợ lệnh '${command}'. Thiếu: ${missing.join(', ')}. ` +
            `Đóng và mở lại plugin trong Figma (Plugins → Development → figma-agent-UI) sau khi chạy npm run build.`,
          true,
        ),
      );
    }
    const id = randomUUID();
    const timeoutMs = opts.timeoutMs ?? 30000;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new PluginError(
            `Timed out after ${timeoutMs} ms waiting for Figma. The command may still be running; read the canvas before retrying.`,
            false,
          ),
        );
      }, timeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer, client });
      const msg: RequestMessage = { type: 'request', id, command, params };
      client.ws.send(JSON.stringify(msg));
    });
  }
}
