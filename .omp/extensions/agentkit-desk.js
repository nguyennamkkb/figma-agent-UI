import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function akRoot(start) {
  let d = path.resolve(start || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(d, '.agentkit.json'))) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

function akRun(root, script, payload) {
  const file = root && path.join(root, '.agentkit', 'hooks', script);
  if (!file || !fs.existsSync(file)) return { code: 0, out: '', err: '' };
  try {
    const r = spawnSync(process.env.AGENTKIT_NODE || 'node', [file], {
      input: JSON.stringify({ cwd: root, ...payload }),
      encoding: 'utf8',
      timeout: 15000,
      env: { ...process.env, AGENTKIT_ROOT: root },
    });
    return { code: r.status ?? 0, out: r.stdout ?? '', err: r.stderr ?? '' };
  } catch {
    return { code: 0, out: '', err: '' };
  }
}

function akContext(out) {
  const t = (out ?? '').trim();
  if (!t) return '';
  if (t.startsWith('{')) {
    try {
      const j = JSON.parse(t);
      return j.hookSpecificOutput?.additionalContext ?? j.reason ?? '';
    } catch {
    }
  }
  return t;
}

const akSessionStart = (root, startup, sessionId) => akContext(akRun(root, 'session-start.mjs', { hook_event_name: 'SessionStart', source: startup ? 'startup' : 'resume', ...(sessionId ? { session_id: String(sessionId) } : {}) }).out);
const akCapture = (root, prompt) => (prompt ? akContext(akRun(root, 'capture.mjs', { hook_event_name: 'UserPromptSubmit', prompt }).out) : '');
const isWriteTool = (name, input) => /write|edit|patch|create|replace/i.test(String(name)) || JSON.stringify(input ?? {}).includes('*** Begin Patch');
function akGuard(root, tool, input) {
  if (!isWriteTool(tool, input)) return null;
  const r = akRun(root, 'guard.mjs', { hook_event_name: 'PreToolUse', tool_name: tool, tool_input: input });
  return r.code === 2 ? r.err.trim() || 'Blocked by agent-work-kit.' : null;
}
function akAfter(root, tool, input) {
  if (!isWriteTool(tool, input)) return null;
  const r = akRun(root, 'desk-check.mjs', { hook_event_name: 'PostToolUse', tool_name: tool, tool_input: input });
  return r.code === 2 ? r.err.trim() : null;
}
function akStop(root) {
  const r = akRun(root, 'stop-check.mjs', { hook_event_name: 'Stop', stop_hook_active: false });
  try {
    const j = JSON.parse(r.out);
    return j.decision === 'block' ? j.reason : null;
  } catch {
    return null;
  }
}
const TYPE = 'agentkit-desk';
export default function agentkitDesk(pi) {
  const isOmp = Boolean(pi && pi.runtime && pi.extension);
  let root = akRoot(process.cwd());
  let surface = '';
  let reminded = false;
  const safe = (fn) => async (...a) => {
    try {
      return await fn(...a);
    } catch {
      return undefined;
    }
  };

  pi.on('session_start', safe((e, ctx) => {
    root = akRoot(ctx?.cwd || process.cwd()) ?? root;
    surface = akSessionStart(root, !e?.reason || e.reason === 'startup' || e.reason === 'new');
  }));

  pi.on('before_agent_start', safe((e) => {
    if (e?.messageType && e.messageType !== 'user') return undefined;
    reminded = false;
    const parts = [surface, akCapture(root, e?.prompt)].filter(Boolean);
    surface = '';
    if (!parts.length) return undefined;
    return { message: { customType: TYPE, content: parts.join('\n\n'), display: false } };
  }));

  pi.on('tool_call', safe((e) => {
    const reason = akGuard(root, e?.toolName, e?.input);
    return reason ? { block: true, reason } : undefined;
  }));

  pi.on('tool_result', safe((e) => {
    const problems = akAfter(root, e?.toolName, e?.input);
    if (!problems) return undefined;
    return { content: [...(Array.isArray(e.content) ? e.content : []), { type: 'text', text: problems }] };
  }));

  if (!isOmp) {
    pi.on('agent_before_settle', safe((e) => {
      if (reminded) return undefined;
      const reason = akStop(root);
      if (!reason) return undefined;
      reminded = true;
      return { entries: [...(e?.entries ?? []), { type: 'custom_message', customType: TYPE, content: reason, display: false }], continue: true };
    }));
  } else {
    pi.on('agent_end', safe(() => {
      if (reminded) return;
      const reason = akStop(root);
      if (!reason) return;
      reminded = true;
      pi.sendMessage({ customType: TYPE, content: reason, display: false }, { deliverAs: 'followUp', triggerTurn: true });
    }));
  }
}
