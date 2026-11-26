# Connect, version, limits

Read first in any session with figma-agent tools (`figma_status`, `render_tree`…). Answers: is the plugin connected, is the build right, what the plugin cannot do. Error messages → `../knowledge/troubleshooting.md`.

## 1. Connect and check the version

1. `figma_status` first. `files: []` → ask the user to open Figma → Plugins → Development → **figma-agent-UI**, paste the `token`, press Connect. Several files → pass `file` to every tool.
2. `versionCheck` starting with ⚠️ → the plugin build differs from the server: new tools answer `Unknown command`. Ask the user to close and reopen the plugin (its panel shows `Plugin <version> (<commit>)`).
3. Two situations need a human restart; say so instead of retrying: the plugin was closed, or an `execute_code` call never returned.

## 2. What figma-agent gives (and the plan limits)

- Call `figma_status` first. `files: []` means no file is connected yet: ask the user to open Figma → Plugins → Development → **figma-agent-UI**, paste the `token`, and click Connect.
- Read `versionCheck`. If it shows ⚠️, the plugin open in Figma is a different build from the server, and new tools will return `Unknown command`. Ask the user to **close the plugin and reopen it**. The plugin panel shows a `Plugin <version> (<commit>)` line for comparison.
- Can write to any file the user has open; no remote Figma MCP or Full seat required. Plan limits still apply: for example, the free plan allows only 1 mode per collection.

## 3. Limitations: tell the user

| Task | Reason | Instead |
|---|---|---|
| Publish library, version history, branches | Not possible via the Plugin API | Agent drafts a semver changelog (design-system §8); the user clicks Publish |
| Code Connect | A separate Figma tool | `export_tokens` + annotations with code component names |
| Multiple modes on the free plan | Figma reports `Limited to 1 modes only` | `create_variables`/`import_tokens` still write the first mode and return a warning; Dark mode is only available after upgrading |
| Figma Motion timeline, shaders | No Plugin API yet | Record the parameters in `annotate` |
| Library components (not yet used on the page) | The Plugin API doesn't list them | Ask the user for the name/key, or drag an instance onto the page and then `get_design_system` |
| Infinite loops in `execute_code` | Cannot be interrupted; Figma closes the plugin | Use dedicated tools; always bound loops |
