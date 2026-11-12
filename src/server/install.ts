import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_FILES = ['manifest.json', 'code.js', 'ui.html'];

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetDir = process.env.FIGMA_AGENT_PLUGIN_DIR || join(homedir(), '.figma-agent', 'plugin');

const missing = PLUGIN_FILES.filter((name) => !existsSync(join(packageRoot, name)));
if (missing.length > 0) {
  process.stderr.write(`Missing build output: ${missing.join(', ')}. Run "npm run build" first.\n`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
for (const name of PLUGIN_FILES) copyFileSync(join(packageRoot, name), join(targetDir, name));

const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as { version: string };
const mcpConfig = { mcpServers: { 'figma-agent': { command: 'npx', args: ['-y', 'github:nguyennamkkb/figma-agent-UI'] } } };

process.stdout.write(
  [
    `figma-agent-UI ${pkg.version}: plugin copied to ${targetDir}`,
    '',
    '1. Figma desktop: Plugins > Development > Import plugin from manifest...',
    `   choose ${join(targetDir, 'manifest.json')}`,
    '2. Add this MCP server to your client config:',
    JSON.stringify(mcpConfig, null, 2),
    '3. Open the plugin in a Figma file. After upgrading, re-run "install" and reopen the plugin.',
    '',
  ].join('\n'),
);
