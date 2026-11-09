# Implementation Plan: FigJam Integration

**Branch**: `test/figma-motion` (spec dir `specs/001-figjam-integration/` independent of branch) | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-figjam-integration/spec.md`

## Summary

Teach the single plugin bundle to run in FigJam: manifest gains the `figjam` editor, the tree DSL gains five FigJam node types (sticky, shape-with-text, connector with two-pass endpoint resolution, code block, table) sharing the existing build/rollback/undo pipeline, the serializer learns FigJam views, Design-only tools refuse cleanly plugin-side, and tests + a manual checklist cover it. No server/hub/token changes; no new MCP tools.

## Technical Context

**Language/Version**: TypeScript 5.9; plugin bundle target es2017 (IIFE), server target node20 ESM

**Primary Dependencies**: `@figma/plugin-typings` (FigJam node typings + `editorType`), zod 4 (DSL schemas, single source of truth), esbuild, vitest 5, `ws`, `sharp`

**Storage**: N/A (stateless; per-file routing is in-memory hub state)

**Testing**: `vitest run` — unit (schemas, motion-equivalent pure helpers) + fake/stub-plugin e2e + `plugin.smoke` bundle test; manual canvas checklist in `TESTING.md`

**Target Platform**: Figma plugin sandbox running in **both** `figma` and `figjam` editors; MCP server on Node 20 via stdio

**Project Type**: Single-project plugin + MCP server (src/shared, src/plugin, src/server, ui.html panel)

**Performance Goals**: Reads bounded by existing caps (`depth`, `maxNodes` 300); table cells counted against the node budget; connector pass-2 adds one linear scan

**Constraints**: Server logs stderr only (stdout = MCP); every board write = one undo step; failed writes leave nothing behind (`RolledBackError`); `manifest.json` edits require plugin re-import; `code.js` is gitignored but must be rebuilt before tests

**Scale/Scope**: ~5 new DSL types + ~6 serializer branches + 1 gating guard; 13 tools gated Design-only; tables capped at 400 cells

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`memory/constitution.md`) is still the unratified template — no project-specific gates exist yet. Applied instead the repo's de-facto governance from `AGENTS.md` / `TESTING.md`:

| Principle (de-facto) | Status |
|---|---|
| Single undo per write; rollback leaves clean canvas | ✅ PASS — two-pass connector build stays inside the existing `renderTree` try/rollback wrapper |
| `npm run build` before `npm test`; typecheck (2 projects) + lint green | ✅ PASS — no new projects or configs |
| Shared schemas as single source of truth (`src/shared/`) | ✅ PASS — DSL + refusal vocabulary defined in `shared/`, plugin only interprets |
| Manual canvas verification for plugin changes (`TESTING.md`) | ✅ PASS — `quickstart.md` + TESTING.md FigJam section planned |
| No new MCP tools without need | ✅ PASS — zero new tools; extended inputs only |

Post-design re-check: no new violations. No `manifest.json` network changes; `editorType` is an install-time capability, not a permission.

## Project Structure

### Documentation (this feature)

```text
specs/001-figjam-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── figjam-dsl.md    # render_tree/get_node shapes + refusal vocabulary
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── schemas.ts        # + Sticky/Shape/Connector/Code/Table specs, UpdateProps figs
│   └── protocol.ts      # unchanged (no protocol bump)
├── plugin/
│   ├── main.ts          # + editorType Design-only guard
│   ├── commands/
│   │   ├── render.ts    # + create() branches + connector pass-2
│   │   ├── read.ts      # unchanged (works via extended serialize)
│   │   ├── write.ts     # + sublayer text path via apply.ts
│   │   └── interactions.ts # + Design-only refusal (or centralized guard)
│   ├── serialize.ts     # + STICKY/SHAPE_WITH_TEXT/CONNECTOR/TABLE/CODE_BLOCK/MEDIA/WIDGET branches
│   ├── apply.ts         # + FigJam text-sublayer path, fills reuse
│   └── sanitize.ts      # check: FigJam id formats (I…;… instance ids already handled?)
├── server/
│   └── index.ts         # tool descriptions mention FigJam support (docs only)
├── manifest.json        # editorType: ["figma", "figjam"]
└── ui.html              # unchanged (editor-agnostic); verify panel in FigJam during manual test

tests/
└── figjam.test.ts       # DSL validation + serializer stubs + e2e path
TESTING.md               # + FigJam manual checklist section
```

**Structure Decision**: Single-project layout preserved; FigJam support is branches inside existing files, not new packages — the codebase already isolates editor specifics to `src/plugin/`, and the server stays editor-agnostic by design.

## Complexity Tracking

> No constitution violations to justify (constitution unratified; de-facto principles all pass). Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| — | — | — |
