# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Commands, architecture, code style (no comments in source) and gotchas live in AGENTS.md — follow it:

@AGENTS.md

## Adding or changing an MCP tool

A tool touches four places, in this order:

1. `src/shared/schemas.ts` — zod input `S.<Name>Input` (never add `file`/`page`; the wrapper adds them).
2. `src/server/index.ts` — `tool('<name>', { description, input, … })`; the wrapper forwards to `bridge.request`. Descriptions are what agents read: keep them precise.
3. `src/plugin/commands/<area>.ts` — the implementation, then register it in the `commands` map in `src/plugin/main.ts` with `mutates: true|false`.
4. Editor types: if the tool cannot run in FigJam or Slides, add it to `DESIGN_ONLY_TOOLS` / `SLIDES_DESIGN_ONLY_TOOLS` in `src/shared/figjam.ts`.

Keep logic that doesn't need the `figma` global in `src/shared/` (pure, unit-tested in `tests/`); the plugin side stays thin. Bump `version` in `package.json` when the plugin changes (see AGENTS.md).

## Installer (`npx github:nguyennamkkb/figma-agent-UI install|doctor|uninstall`)

- `bin/figma-agent-ui.mjs` routes `install|uninstall|doctor|help` to `dist/setup.mjs`, everything else to `dist/server.mjs`. `prepare` runs the full build when installed from git.
- `src/server/setup-lib.ts` holds pure, tested helpers (paths per platform, MCP config edits for Claude Code / OpenCode / Codex TOML / Pi, arg parsing); `src/server/setup.ts` does the I/O and output.
- Bundled skills are listed twice and must stay in sync: `BUNDLED_SKILLS` in `setup-lib.ts` and `files` in `package.json`. A renamed or merged skill goes into `RETIRED_SKILLS` so `install`/`uninstall` remove the old copy from `~/.claude/skills`, `~/.config/opencode/skills`, `~/.agents/skills`.
- Verify installer changes in a throwaway home: `HOME=$(mktemp -d) node bin/figma-agent-ui.mjs install --no-mcp` (plus `doctor`, `uninstall`), and `npm pack --dry-run` to check shipped files.
- README installs the latest `main` (no tag; `--prefer-online` defeats the npx cache); the installer writes the same untagged spec into the MCP configs. A release = bump `package.json`, commit, merge to `main`, push, push a `vX.Y.Z` tag for users who pin. Every push is a release: bump the version first, even for docs/skills/tests-only changes.

## Skills (`.claude/skills/`)

Markdown skills shipped to users, not code: `figma-agent-tools` (tool manual), `figma-ui-flow` (design process, build loop, decision playbook), `style-direction`, `asset-generator`, `design-md-writer`, `icon-libraries` (Phosphor + Tabler via jsDelivr), `ads-board` (ads flow board per version; source = `sources/<flow>/` rules + specs + wireframe PNGs inside the skill), `app-redesign` (new UI, same functions, usually a sibling app that must read as another product: after the analysis the agent answers its self-questions and a 10-axis distance table, then asks at most 4 questions — direction, level, theme, image style — before drawing, `references/questions.md`; `start <goal> [L1–L4] [section link]` / `build [FL-NN|section link] [L1–L4]` / `audit [FL-NN|section link]` on the confirmed copy; a section link runs that flow alone and, when other flows were already redesigned, asks "same way or another" (another = trial on Explore, `references/section-link.md`); change levels L1 reskin in place · L2 refresh on the same layout · L3 recompose · L4 new in style, `parity.py --level` checks drift; project data in `redesign/<app>/`, outside the skill), `ui-visual` (UI visuals — banner, popup header, hero, coupon, topic card: `clone <ref> [L1–L4]` / `create <brief>` / `extract <ref>`; decode.js measures the reference, layers split into AI scene / cut-out / native / text, compose.js composites with filters, blends, masks; project data in `visuals/<slug>/`). When a tool's behaviour or name changes, update `figma-agent-tools/references/tool-reference.md` and any recipe that uses it. Python helper scripts in skills (`check_tokens.py`, `extract_palette.py`, `remove_bg.py`, `icons.py`, `spec_diff.py`, `analyze.py`, `parity.py`, `bake_fade.py`, `ratios.py`) keep a usage docstring at the top.
