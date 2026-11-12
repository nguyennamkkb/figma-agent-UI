# Tasks: FigJam Integration

**Input**: Design documents from `specs/001-figjam-integration/` (spec.md, plan.md, research.md, data-model.md, contracts/figjam-dsl.md, quickstart.md)

**Prerequisites**: plan.md, research.md, data-model.md, contracts/figjam-dsl.md, quickstart.md

**Tests**: Included — FR-013 and User Story 6 explicitly require automated tests.

**Organization**: Grouped by user story; each story independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to spec user stories US1–US6

## Phase 1: Setup

**Purpose**: Manifest enablement + test scaffolding foundations

- [X] T001 Add "figjam" to editorType in manifest.json
- [X] T002 [P] Create FigJam stub-node factory for tests in tests/figjam.test.ts (stub STICKY/SHAPE_WITH_TEXT/CONNECTOR/TABLE/CODE_BLOCK/WIDGET objects matching plugin-typings shapes)

## Phase 2: Foundational (blocking)

**Purpose**: Editor detection + Design-only guard — every story builds on these

**⚠️ CRITICAL**: No user story work until this phase is complete.

- [X] T003 Add editorType guard helper in src/plugin/main.ts (or src/plugin/util.ts) returning `figma.editorType`, with Design-only refusal vocabulary from contracts/figjam-dsl.md §3
- [X] T004 [P] Wire Design-only refusal for set_interactions, annotate, set_dev_status in src/plugin/commands/interactions.ts and src/plugin/commands/handoff.ts
- [X] T005 [P] Wire Design-only refusal for bind_variables, create_variables, create_styles, import_tokens, export_tokens, render_foundations, create_component_set, stress_test, get_design_system, search_design_system in their command files
- [X] T006 Bump version in package.json (plugin changed), rebuild, verify figma_status versionCheck logic covers FigJam

**Checkpoint**: Foundation ready — Design behavior unchanged (full existing suite green), guard helper unit-tested.

## Phase 3: US1 Research usage map (P1) 🎯 MVP

**Goal**: Written expert-usage map justifying the integration scope (FR-001)

**Independent Test**: Map file exists; every P2 scope item traces to a mapped workflow.

- [X] T007 [P] [US1] Write expert FigJam usage map to specs/001-figjam-integration/usage-map.md (workflows → node types → API capabilities, from research.md Decisions 1–8)
- [X] T008 [US1] Cross-check usage-map coverage against FR-003/FR-004 scope and record gaps in usage-map.md

**Checkpoint**: US1 done when usage-map.md exists and justifies all five DSL types.

## Phase 4: US2 Read FigJam board (P1)

**Goal**: Serializer learns FigJam views (FR-003); agent reads board content by type

**Independent Test**: `get_selection`/`get_node` on stub FigJam nodes return the contract §2 shapes with correct text/author/endpoints/cells.

- [X] T009 [P] [US2] Serializer test for STICKY/SHAPE_WITH_TEXT/CONNECTOR views in tests/figjam.test.ts (text, authorName, shapeType, lineType, endpoint refs, caps)
- [X] T010 [P] [US2] Serializer test for TABLE (rows/columns/cell matrix + truncation), CODE_BLOCK (code truncation + language), and MEDIA (type + dimensions) in tests/figjam.test.ts
- [X] T011 [P] [US2] Serializer test for WIDGET/STAMP readOnly marker in tests/figjam.test.ts
- [X] T012 [US2] Extend Serializer.node() in src/plugin/serialize.ts with STICKY/SHAPE_WITH_TEXT/CONNECTOR/TABLE/CODE_BLOCK/MEDIA/WIDGET/STAMP branches per data-model.md §2 (depends on T009–T011 failing first)

**Checkpoint**: US2 done when stub-node reads match contracts/figjam-dsl.md §2 exactly.

## Phase 5: US3 Create and edit FigJam content (P2)

**Goal**: Five DSL types + batch edit + rollback cleanliness (FR-004, FR-005, FR-007, FR-008)

**Independent Test**: One render_tree call builds section + 2 shapes + connector + 3 stickies + table; one undo removes all; bad connector ref leaves board unchanged.

- [X] T013 [P] [US3] Schema tests for Sticky/Shape/Connector/Code/Table specs in tests/figjam.test.ts (valid inputs, bad shape enum, cells dimension mismatch, rows×columns ≤ 400 cap, self-loop rejection)
- [X] T014 [US3] Add StickySpec/ShapeSpec/ConnectorSpec/CodeSpec/TableSpec to src/shared/schemas.ts TreeNode union + ConnectorSpec from/to (id or same-call key) per data-model.md §1 (depends on T013 failing first)
- [X] T015 [US3] Add FigJam text-sublayer path in src/plugin/apply.ts (STICKY/SHAPE_WITH_TEXT/TABLE_CELL/CONNECTOR: font load + characters assignment; fills reuse) per research Decision 7
- [X] T016 [US3] Add create() branches + connector two-pass endpoint resolution in src/plugin/commands/render.ts per research Decisions 2–3 (rolls back via existing wrapper)
- [X] T017 [US3] Extend UpdateProps handling in src/plugin/commands/write.ts for FigJam text + connector from/to reassignment (depends on T015)
- [X] T018 [US3] Update render_tree/update_nodes tool descriptions in src/server/index.ts to document FigJam DSL (docs only)
- [X] T019 [US3] Run npm run build + typecheck + lint + full vitest; fix regressions

**Checkpoint**: US3 done when contract §1 examples execute against stubs and the suite is green.

## Phase 6: US4 Run in FigJam editor (P2)

**Goal**: Plugin connects in FigJam, multi-file routing disambiguates (FR-002, FR-006)

**Independent Test**: Manual quickstart scenarios 1–2 on a scratch FigJam board; Design file untouched when FigJam targeted.

- [X] T020 [P] [US4] Re-import plugin with new manifest.json in Figma and verify panel connects inside a FigJam file (manual, per quickstart.md scenario 1)
- [X] T021 [US4] Verify multi-file routing with FigJam + Design connected (file param + panel pinning; ambiguous call asks instead of guessing) (manual)
- [X] T022 [US4] Record FigJam manual results in TESTING.md FigJam section (create for US6 groundwork)

**Checkpoint**: US4 done when the agent drives the FigJam board end-to-end (read + write) while the Design file is also connected.

## Phase 7: US5 Graceful degradation (P3)

**Goal**: All 13 gated tools refuse cleanly on FigJam boards (FR-009–FR-011)

**Independent Test**: Each gated tool against a FigJam board returns the §3 vocabulary verbatim with `safeToRetryWithoutCanvasRead: true`; board unchanged (verified via get_node before/after).

- [X] T023 [P] [US5] Refusal tests for all 13 gated tools in tests/figjam.test.ts (message vocabulary + safeToRetry flag)
- [X] T024 [US5] Bound-check test: deep/wide board read stays within depth/maxNodes caps (FR-011)
- [X] T025 [US5] Manual pass of quickstart.md scenario 4 on the scratch board

**Checkpoint**: US5 done when automated refusal tests + manual scenario 4 both pass.

## Phase 8: US6 Tested like Design side (P3)

**Goal**: E2E path + manual checklist parity (FR-012, FR-013)

**Independent Test**: `npm test` green with Figma closed; quickstart.md fully walkable in one session.

- [X] T026 [P] [US6] E2E render/read round-trip for the workshop-starter board through the fake-plugin harness (or stub harness if the fake cannot host FigJam types) in tests/figjam.test.ts
- [X] T027 [US6] Append FigJam manual checklist to TESTING.md (create/edit/connect/undo/reconnect/Design-only error per research Decision 9)
- [X] T028 [US6] Full verification: npm run build + typecheck + lint + npm test green, then walk quickstart.md scenarios 1–5 on the scratch board and record results

**Checkpoint**: US6 done when suite is green and quickstart is fully walked with recorded results.

## Phase 9: Polish & Cross-Cutting

**Purpose**: Docs + consistency + cleanup

- [X] T029 [P] Update README.md tool/DSL section with FigJam support (DSL types, Design-only list, manifest re-import note)
- [X] T030 [P] Update AGENTS.md FigJam notes (editorType, manual FigJam testing requirement)
- [X] T031 [P] Run /speckit.analyze-equivalent review: spec ↔ plan ↔ tasks ↔ contracts consistency check, fix drift
- [X] T032 Delete scratch test content (Motion Test section) from the working file if still present; confirm git status clean except intended files

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** BLOCKS all stories → stories in priority order P1 → P2 → P3 → Polish.
- **US1 (Phase 3)**: after Foundational; no code deps on other stories (docs only).
- **US2 (Phase 4)**: after Foundational; independent of US1/US3 (serializer only).
- **US3 (Phase 5)**: after Foundational; builds on serializer vocabulary but implementable in parallel with US2 (different files: schemas/render/apply vs serialize) — sync at contract §1/§2 boundary.
- **US4 (Phase 6)**: needs US2+US3 implemented (manual live test); manual-only.
- **US5 (Phase 7)**: needs Foundational guards; tests parallel with US2/US3 test tasks.
- **US6 (Phase 8)**: last; needs everything above.
- **Within stories**: tests (T009–T011 before T012; T013 before T014) written to FAIL first per repo TDD bar.

### Parallel opportunities

- T002 with T001; T004 with T005; T009/T010/T011 together; T013 parallel with T009–T011 (different concerns, same file — sequence to avoid conflicts: prefer sequential edits to tests/figjam.test.ts).
- Note: tasks sharing `tests/figjam.test.ts` or `src/shared/schemas.ts` should be sequenced, not parallelized, to avoid edit conflicts despite [P] marks — the [P] marks indicate no logical dependency, but file-level serialization applies.

## Parallel Example: US2

```bash
# Serializer branch tests (same file — run sequentially in practice):
Task: "Serializer test for STICKY/SHAPE_WITH_TEXT/CONNECTOR views in tests/figjam.test.ts"
Task: "Serializer test for TABLE and CODE_BLOCK in tests/figjam.test.ts"
Task: "Serializer test for WIDGET/STAMP readOnly marker in tests/figjam.test.ts"
```

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 Setup + Phase 2 Foundational (guard rails first — protects Design behavior).
2. Phase 3 US1 (usage map — half a day, docs only).
3. Phase 4 US2 (read-only FigJam — safe, immediately useful: agent can inspect boards).
4. **STOP and VALIDATE**: agent reads a real FigJam board correctly; suite green.

### Incremental Delivery

Setup + Foundational → US1 (map) → US2 (read) → US3 (write) → US4 (live editor proof) → US5 (refusals) → US6 (e2e + checklist) → Polish.

### Suggested MVP scope

Phases 1–4 (Setup + Foundational + US1 + US2): read-only FigJam support with Design-only guards — safe to merge, delivers board inspection, and de-risks the write path.
