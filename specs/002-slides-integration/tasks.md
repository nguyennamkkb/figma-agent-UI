# Tasks: Slides Integration

**Input**: `specs/002-slides-integration/` (spec.md, research.md, data-model.md, contracts/slides-dsl.md, quickstart.md)

**Prerequisites**: plan decisions trong research.md (9 decisions, 0 NEEDS CLARIFICATION)

**Tests**: Có — FR-012 + US6 yêu cầu unit + checklist thủ công.

**Organization**: Theo user story; mỗi story test độc lập được.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Manifest + scaffolding test

- [ ] T001 Add "slides" to editorType in manifest.json
- [ ] T002 [P] Create Slides stub factory in tests/slides.test.ts (stub SLIDE/SLIDE_GRID/SLIDE_ROW/INTERACTIVE_SLIDE_ELEMENT)

## Phase 2: Foundational (blocking)

**Purpose**: Editor guard + HUG fix — mọi story xây trên nó

**⚠️ CRITICAL**: Xong phase này mới làm story khác.

- [ ] T003 Extend DESIGN_ONLY guard in src/plugin/main.ts to editorType slides with Slides refusal vocabulary per contracts/slides-dsl.md §3
- [ ] T004 Guard auto-HUG in src/plugin/apply.ts for slides editor (only auto-assign outside Slides) + add slide transition/skipped appliers
- [ ] T005 Bump version in package.json, rebuild, verify figma_status versionCheck covers Slides

**Checkpoint**: Suite cũ xanh, guard unit-tested.

## Phase 3: US1 Đọc deck (P1) 🎯 MVP

**Goal**: Serializer học Slides views (FR-003)

**Independent Test**: `get_node` stub SLIDE trả transition/skipped/children đúng contracts §2.

- [ ] T006 [P] [US1] Serializer tests for SLIDE (transition/skipped/fill var) + GRID/ROW + INTERACTIVE readOnly in tests/slides.test.ts
- [ ] T007 [US1] Extend Serializer.node() in src/plugin/serialize.ts with SLIDE/SLIDE_GRID/SLIDE_ROW/INTERACTIVE_SLIDE_ELEMENT branches (depends on T006 failing first)

**Checkpoint**: Stub reads khớp contracts §2.

## Phase 4: US2 Ghi vào slide (P1)

**Goal**: `render_tree{parentId}` + fallback parentNote + rollback sạch (FR-004, FR-006)

**Independent Test**: Một render_tree tạo frame + text có dấu trong stub slide; thiếu parent trong Slides trả parentNote.

- [ ] T008 [P] [US2] Schema tests for SlideSpec in tests/slides.test.ts (row/col ≥ 0, transition enum, children recursion)
- [ ] T009 [US2] Add SlideSpec to TreeNode union + skipped/transition to UpdateProps in src/shared/schemas.ts
- [ ] T010 [US2] Add slide create() branch + children recursion + focusedSlide fallback with parentNote in src/plugin/commands/render.ts
- [ ] T011 [US2] Update render_tree/update_nodes descriptions in src/server/index.ts for Slides (docs only)
- [ ] T012 [US2] Run npm run build + typecheck + lint + vitest; fix regressions

**Checkpoint**: Contract §1 ví dụ chạy trên stubs, suite xanh.

## Phase 5: US3 Quản lý grid (P2)

**Goal**: Tạo/sắp xếp slide qua DSL + execute_code contract (FR-005)

**Independent Test**: Quickstart scenario 3 trên deck scratch.

- [ ] T013 [US3] Manual grid test on scratch deck: createSlide(0,0), setCanvasGrid reorder + reorder-back, missing-slide rejection, no-parent parentNote (per quickstart.md scenario 3)
- [ ] T014 [US3] Record Slides manual results in TESTING.md Slides section (groundwork for US6)

## Phase 6: US4 Chạy native Slides (P2)

**Goal**: Re-import + connect + multi-file routing (FR-002, FR-007)

- [ ] T015 [US4] Re-import plugin with new manifest.json and verify panel connects inside Slides file (manual, quickstart scenario 1)
- [ ] T016 [US4] Verify multi-file routing Slides + Design + FigJam (manual)

## Phase 7: US5 Từ chối优雅 (P3)

**Goal**: Danh sách cấm chốt sau đo live (FR-008)

- [ ] T017 [P] [US5] Refusal tests for gated tools with Slides vocabulary in tests/slides.test.ts
- [ ] T018 [US5] Manual pass of quickstart.md scenario 4; ungate tools that work in Slides with code + note (variables/styles candidates)

## Phase 8: US6 Tested như Design (P3)

**Goal**: E2E + checklist parity (FR-010–FR-012)

- [ ] T019 [P] [US6] E2E render/read round-trip slide-starter through fake-plugin harness in tests/slides.test.ts
- [ ] T020 [US6] Full verification: build + typecheck + lint + npm test green, walk quickstart.md 1–5 on scratch deck and record results

## Phase 9: Polish

- [ ] T021 [P] Update README.md + AGENTS.md Slides notes (editorType, Single Slide View parenting rule, re-import note)
- [ ] T022 Consistency review spec ↔ research ↔ data-model ↔ contracts ↔ tasks; fix drift
- [ ] T023 Delete scratch test content from working deck if present; confirm git status clean except intended files

---

## Dependencies & Execution Order

- Setup → Foundational BLOCKS all → US1+US2 (P1) → US3+US4 (P2) → US5+US6 (P3) → Polish.
- US1 (serialize) và US2 (schemas/render) song song được (files khác nhau), sync ở boundary contracts §1/§2.
- US3/US4/US5-manual cần plugin đã re-import + reopen (T005 xong).
- Trong story: tests FAIL trước (T006 trước T007; T008 trước T009), rồi implement.

### Parallel opportunities

- T002 ∥ T001; T006 ∥ T008 ∥ T017 (cùng tests/slides.test.ts — thực tế sequence để tránh conflict, [P] chỉ nghĩa không phụ thuộc logic).
- T003/T004 khác files, làm song song được.

## Implementation Strategy

### MVP (US1+US2)

Setup + Foundational → US1 (đọc) → US2 (ghi có dấu) → **STOP và VALIDATE** trên deck scratch → demo được ngay.

### Incremental

+ US3 (grid) → US4 (native proof) → US5 (refusals + ungate) → US6 (e2e + checklist) → Polish.
