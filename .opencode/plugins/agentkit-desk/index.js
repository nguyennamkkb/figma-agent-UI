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
export default {
  id: 'agentkit-desk',
  async setup(ctx) {
    const root = akRoot(ctx?.location?.directory || process.cwd());
    if (!root) return;
    const started = new Set();
    const reminded = new Set();
    const quiet = async (p) => {
      try {
        return await p;
      } catch {
        return undefined;
      }
    };

    await ctx.session.hook('prompt', async (e) => {
      try {
        const sid = e?.sessionID;
        reminded.delete(sid);
        const parts = [];
        if (!started.has(sid)) {
          started.add(sid);
          parts.push(akSessionStart(root, true, sid));
        }
        parts.push(akCapture(root, e?.prompt?.text));
        const text = parts.filter(Boolean).join('\n\n');
        if (!text) return;
        let ok = false;
        try {
          await ctx.session.instructions.entry.put({ sessionID: sid, key: 'agentkit-desk', value: text });
          ok = true;
        } catch {
        }
        if (!ok && e.prompt) e.prompt.text = `${e.prompt.text}\n\n<agentkit-desk>\n${text}\n</agentkit-desk>`;
      } catch {
      }
    });

    await ctx.tool.hook('execute.before', (e) => {
      const reason = akGuard(root, e?.tool, e?.input);
      if (reason) throw new Error(reason);
    });

    await ctx.tool.hook('execute.after', async (e) => {
      const problems = akAfter(root, e?.tool, e?.input);
      if (problems && e?.sessionID) await quiet(ctx.session.synthetic({ sessionID: e.sessionID, text: problems }));
    });

    await quiet(
      ctx.session.hook('experimental.idle', async (e) => {
        const sid = e?.sessionID;
        if (!sid || e?.background || reminded.has(sid)) return;
        const reason = akStop(root);
        if (!reason) return;
        reminded.add(sid);
        await quiet(ctx.session.synthetic({ sessionID: sid, text: reason }));
      }),
    );
  },
};
