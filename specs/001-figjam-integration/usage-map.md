# FigJam Expert Usage Map

**Date**: 2026-11-09 · Justifies the integration scope (FR-001). Sources: Figma developer docs ("Working in FigJam"), `plugin-api.d.ts` typings, professional workflow knowledge.

## Workflows → node types → API capabilities

| # | Professional workflow | FigJam node types used | Plugin API needed | Integration coverage |
|---|---|---|---|---|
| 1 | Brainstorming: facilitator seeds a prompt, participants add stickies, then cluster by theme | STICKY (text + fill color), SECTION (clusters) | `createSticky`, `fills`, `TextSublayerNode.characters` | `sticky` DSL (text/color/isWide); `section` exists |
| 2 | Affinity mapping / retros: group stickies, label groups, dot-vote | STICKY, SHAPE_WITH_TEXT (labels), STAMP (votes, read-only) | same as above + `createShapeWithText` | `sticky` + `shape`; stamps surfaced read-only (FR-010) |
| 3 | User flows & diagrams: labeled boxes joined by arrows, swimlane sections | SHAPE_WITH_TEXT (`shapeType`: ROUNDED_RECTANGLE, DIAMOND, CHEVRON…), CONNECTOR (endpoints, line type, caps), SECTION | `createShapeWithText`, `createConnector` + `connectorStart/connectorEnd` (`endpointNodeId` + `magnet`), `connectorLineType`, stroke caps | `shape` + `connector` DSL with two-pass endpoint resolution |
| 4 | Workshop organization: agenda sections, comparison tables, timeboxed activities | SECTION, TABLE (rows/columns/cell text), FigJam TIMER | `createTable` + `cellAt(r,c).text`, section resize | `table` DSL (row-major cells); timer explicitly out of scope |
| 5 | Technical sessions: sharing snippets, embedding references, moodboards | CODE_BLOCK (code + language), MEDIA (gif/image embeds) | `createCodeBlock`, `createGif`, IMAGE fills | `code` DSL; media read supported, creation via existing `image` spec (rect + IMAGE fill works in both editors) |
| 6 | Design critiques on boards: pin context, hand off to dev | TEXT, dev-mode annotations | text API | TEXT exists; `annotate`/`set_dev_status` are Design-only → clean refusal (FR-009) |
| 7 | Multi-board navigation: pages per workshop phase | PAGE | pages API (editor-agnostic) | `manage_pages`, `set_current_page` unchanged |

## Out of scope (with reason)

- **Custom widgets**: creation is not exposed by the plugin API (read/modify only); surfaced read-only.
- **Timer control**: runtime facilitation concern, no agent value in v1.
- **FigJam Slides**: separate presentation surface, no mapped workflow needs it yet.

## Coverage check (T008)

- FR-003 (read): STICKY, SHAPE_WITH_TEXT, CONNECTOR, TABLE, CODE_BLOCK, MEDIA, STAMP/WIDGET-readonly, TEXT — all mapped to workflows 1–6. ✅
- FR-004 (create): sticky, shape, connector, section, table, code, text — workflows 1–5. ✅ (media creation reuses `image`; gif creation deferred.)
- No mapped workflow requires a node type outside the five new DSL types + existing primitives. No gaps.
