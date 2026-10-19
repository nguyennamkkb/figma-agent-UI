// WebSocket server the plugin UI connects to. Tracks one connection per open
// Figma file and correlates requests with responses by id.
import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import type { ClientInfo, PluginToServer, RequestMessage } from '../shared/protocol';

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
}

export class Bridge {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, Client>();
  private pending = new Map<string, Pending>();
  private heartbeat: NodeJS.Timeout | null = null;
  private servers: Server[] = [];
  listenError: string | null = null;

  constructor(private opts: BridgeOptions) {}

  // Listens on loopback only. The plugin connects to "localhost", which may
  // resolve to either IPv4 or IPv6, so both loopback addresses are bound.
  async start(): Promise<void> {
    const log = this.opts.log ?? (() => {});
    const wss = new WebSocketServer({ noServer: true });
    wss.on('connection', (ws, req) => this.onConnection(ws, req));
    const hosts = this.opts.host ? [this.opts.host] : ['127.0.0.1', '::1'];

    for (const host of hosts) {
      const http = createServer((_req, res) => {
        res.writeHead(426).end('figma-agent bridge: WebSocket only');
      });
      http.on('upgrade', (req, socket, head) => wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req)));
      const err = await new Promise<NodeJS.ErrnoException | null>((resolve) => {
        http.once('error', resolve);
        http.listen(this.opts.port, host, () => resolve(null));
      });
      if (!err) {
        this.servers.push(http);
        continue;
      }
      if (err.code === 'EADDRINUSE') {
        this.listenError = `Port ${this.opts.port} is already in use (another figma-agent server, e.g. another Claude session?).`;
        break;
      }
      // No IPv6 loopback on this machine is fine as long as IPv4 works.
      if (host !== '::1') this.listenError = err.message;
    }
    if (this.listenError || this.servers.length === 0) {
      for (const h of this.servers) h.close();
      this.servers = [];
      log(this.listenError ?? 'could not listen');
      return;
    }
    this.wss = wss;
    log(`listening on ws://localhost:${this.opts.port}`);
    this.heartbeat = setInterval(() => {
      for (const c of this.clients.values()) {
        if (c.ws.readyState === WebSocket.OPEN) c.ws.ping();
      }
    }, 20000);
    this.heartbeat.unref();
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

    ws.on('pong', () => (client.lastSeen = Date.now()));
    ws.on('message', (data) => {
      client.lastSeen = Date.now();
      let msg: PluginToServer;
      try {
        msg = JSON.parse(String(data));
      } catch {
        return;
      }
      if (msg.type === 'hello' || msg.type === 'event') client.info = msg.info;
      else if (msg.type === 'response') this.onResponse(msg);
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
    });
  }

  private onResponse(msg: Extract<PluginToServer, { type: 'response' }>) {
    const p = this.pending.get(msg.id);
    if (!p) return;
    clearTimeout(p.timer);
    this.pending.delete(msg.id);
    if (msg.ok) p.resolve(msg.result);
    else p.reject(new PluginError(msg.error, msg.safeToRetryWithoutCanvasRead));
  }

  // Actual port (differs from opts.port when it is 0, e.g. in tests).
  get port(): number {
    const addr = this.servers[0]?.address();
    return addr && typeof addr === 'object' ? addr.port : this.opts.port;
  }

  status() {
    return {
      listening: !!this.wss,
      error: this.listenError,
      port: this.port,
      files: [...this.clients.values()].map((c) => ({
        fileName: c.info?.fileName ?? null,
        fileKey: c.info?.fileKey ?? null,
        user: c.info?.user ?? null,
        currentPage: c.info?.currentPage ?? null,
        connectedAt: new Date(c.connectedAt).toISOString(),
      })),
    };
  }

  // Picks the file to talk to: by fileKey/name when given, otherwise the
  // only (or most recently active) connection.
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
      const hit = open.find((c) => c.info?.fileKey === file || c.info?.fileName === file);
      if (!hit) {
        const names = open.map((c) => c.info?.fileName).join(', ');
        throw new PluginError(`File "${file}" is not connected. Connected: ${names}.`, true);
      }
      return hit;
    }
    return open.sort((a, b) => b.lastSeen - a.lastSeen)[0];
  }

  request<T = unknown>(command: string, params: unknown, opts: { file?: string; timeoutMs?: number } = {}): Promise<T> {
    let client: Client;
    try {
      client = this.pick(opts.file);
    } catch (e) {
      return Promise.reject(e);
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
