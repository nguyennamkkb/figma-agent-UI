import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pluginDir = process.env.FIGMA_AGENT_PLUGIN_DIR || join(homedir(), '.figma-agent', 'plugin');
const files = ['manifest.json', 'code.js', 'ui.html'];

const missing = files.filter((f) => !existsSync(join(root, f)));
if (missing.length > 0) {
  console.error(`missing ${missing.join(', ')} — run npm run build first`);
  process.exit(1);
}

const manifestTarget = join(pluginDir, 'manifest.json');
const manifestChanged =
  existsSync(manifestTarget) && readFileSync(manifestTarget, 'utf8') !== readFileSync(join(root, 'manifest.json'), 'utf8');

mkdirSync(pluginDir, { recursive: true });
for (const f of files) copyFileSync(join(root, f), join(pluginDir, f));

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
console.error(`synced plugin ${version} → ${pluginDir}`);
console.error(
  manifestChanged
    ? 'manifest.json changed: re-import the plugin in Figma (Plugins → Development → Import plugin from manifest)'
    : 'close and reopen the figma-agent-UI plugin in Figma to load it',
);
