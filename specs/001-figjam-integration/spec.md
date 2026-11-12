# Feature Specification: FigJam Integration

**Feature Branch**: `test/figma-motion` (spec directory independent of branch)

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Tôi muốn Tích hợp khả năng làm việc với figjam chuyên nghiệp. tim hiểu chuyên gia sẽ sử dụng file này thế nào. sau đó tích hợp và test"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Research professional FigJam usage (Priority: P1)

A contributor studies how professional teams use FigJam (brainstorming with stickies, affinity mapping, user flows and diagrams with shapes + connectors, tables for organizing, timers for workshops, code blocks and media for technical sessions) and records a usage map that drives which node types and operations the integration must support.

**Why this priority**: The integration must cover real expert workflows, not just whatever the API happens to expose. Without this map the team risks building the wrong subset.

**Independent Test**: A usage-map note exists listing expert workflows alongside the FigJam node type and plugin-API capability each workflow needs; every P2/P3 story traces back to at least one mapped workflow.

**Acceptance Scenarios**:

1. **Given** no prior FigJam research in the repo, **When** the research is done, **Then** there is a written map of at least: sticky brainstorming, shape + connector diagrams/flows, sections for organization, tables, media/gif, code blocks, and workshop timers.
2. **Given** the usage map, **When** reviewing the P2 scope, **Then** each in-scope node type is justified by at least one mapped workflow.

---

### User Story 2 - Agent reads a FigJam file (Priority: P1)

An AI agent with the plugin open in a FigJam file inspects the board: file/pages info, current selection, and serialized FigJam nodes (stickies with text and author, shapes with text, connectors with endpoints, sections, tables with cell text, code blocks, media).

**Why this priority**: Reading is the foundation — inspect-before-build applies to boards exactly as it does to Design files, and it is read-only so it carries no risk of damaging a live workshop board.

**Independent Test**: With the plugin open in a FigJam file, the agent calls the read tools and receives correct names, text content, colors, and connector endpoint references for board content.

**Acceptance Scenarios**:

1. **Given** a FigJam file with stickies, shapes, connectors and a table, **When** the agent reads document info and selection, **Then** it sees the board structure with correct node types and text.
2. **Given** two connected shapes, **When** the agent serializes the connector, **Then** it learns both endpoint node references and the connector style.

---

### User Story 3 - Agent creates and edits FigJam content (Priority: P2)

An AI agent builds and modifies board content from structured input: sticky notes (text, color), shapes with text, connectors between nodes (style, endpoints), sections containing content, tables (rows, columns, cell text), code blocks, and plain text — plus updating, moving, cloning, and deleting them.

**Why this priority**: This is the core professional value: the agent can run a brainstorm (spawn clustered stickies), draw a user flow (shapes + auto-connected arrows), or lay out a workshop board (sections + tables) in one call each.

**Independent Test**: On a scratch FigJam board, the agent creates a section containing two labeled shapes joined by a connector plus three colored stickies; each write is a single undo step and a failed write leaves no partial content behind.

**Acceptance Scenarios**:

1. **Given** an empty board region, **When** the agent creates organized content in one call, **Then** all nodes appear with correct text, colors, and connector endpoints, and one Cmd+Z removes everything.
2. **Given** existing stickies, **When** the agent edits text and colors in a batch, **Then** all valid edits apply and invalid ids are reported separately without blocking the rest.
3. **Given** a failed creation (e.g. invalid endpoint reference), **When** the call returns, **Then** no partial nodes remain on the board.

---

### User Story 4 - Plugin runs natively in the FigJam editor (Priority: P2)

A user opens the plugin inside FigJam: it connects to the local server with the same token, shows connection status, and every operation routes to the FigJam board rather than failing or touching a Design file.

**Why this priority**: Without editor support nothing else works — today the manifest restricts the plugin to Figma Design, so FigJam users cannot even open it.

**Independent Test**: With a FigJam file open and a Design file also connected, the agent targets the FigJam board explicitly and the Design file is untouched.

**Acceptance Scenarios**:

1. **Given** the plugin open in FigJam, **When** it connects, **Then** status shows the FigJam board name and the shared token authenticates without a separate setup.
2. **Given** FigJam and Design files connected at once, **When** the agent issues a FigJam command without a file selector, **Then** the server asks which file instead of guessing.

---

### User Story 5 - FigJam-inapplicable tools degrade gracefully (Priority: P3)

An agent (or user) calls an operation that has no meaning on a FigJam board — prototype interactions, dev-mode annotations, variable binding — and receives a clear message stating the operation is Design-only instead of a cryptic API error.

**Why this priority**: Professional reliability means the tool explains its own boundaries; silent corruption or raw API errors on a live board are unacceptable.

**Independent Test**: Each Design-only tool called against a FigJam board returns a Design-only message and the board is unchanged.

**Acceptance Scenarios**:

1. **Given** a FigJam board, **When** the agent requests a prototype interaction, **Then** it gets a "Design-only" explanation and nothing changes on the board.
2. **Given** a FigJam board, **When** the agent takes a screenshot, **Then** it receives a viewable image of the board region.

---

### User Story 6 - Tested like the Design side (Priority: P3)

The FigJam integration is covered by automated unit tests for the new serialization/conversion logic plus an end-to-end path with a fake plugin, and a manual checklist for verification on a real FigJam board (create, edit, connectors, undo cleanliness, reconnect).

**Why this priority**: Matches the repo's existing bar (vitest + manual TESTING.md on real canvas) so FigJam support does not rot after merge.

**Independent Test**: The automated suite passes without Figma open, and the manual checklist can be walked on a scratch FigJam board in one session.

**Acceptance Scenarios**:

1. **Given** no Figma/FigJam open, **When** the test command runs, **Then** all FigJam unit and end-to-end tests pass.
2. **Given** a scratch FigJam board, **When** the manual checklist is followed, **Then** create/edit/connect/undo/reconnect all behave as specified.

---

### Edge Cases

- What happens when the agent targets a FigJam-only node type (e.g. connector) while connected only to a Design file? The server must report the mismatch plainly instead of sending a command the Design plugin cannot execute.
- How does the integration handle a board with hundreds of stickies? Reads must stay bounded (depth/limit controls) and never dump the whole board unbounded.
- What happens when the plugin build is old (missing FigJam commands)? The existing stale-build warning must fire for FigJam too, telling the user to rebuild and reopen the plugin.
- How are widget nodes handled? Widgets are read-and-modify only (never created by the plugin API) — the integration surfaces them read-only and refuses creation attempts with a clear message.
- What happens when the FigJam timer is running? Reads must not disturb it; no requirement to control it in this iteration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST document a FigJam expert-usage map (workflows → node types → API capabilities) justifying the integration scope.
- **FR-002**: System MUST allow the plugin to run inside the FigJam editor with the same token authentication as Design.
- **FR-003**: System MUST support reading FigJam boards: file/pages info, selection, and serialization of sticky, shape-with-text, connector, section, table (with cells), code block, media, stamp, and plain text nodes.
- **FR-004**: System MUST support creating sticky notes with text and color, shapes with text, connectors with endpoint references and style, sections, tables with cell content, code blocks, and plain text from structured agent input.
- **FR-005**: System MUST support updating, moving, cloning, deleting, and selecting FigJam nodes in batches with per-id success/failure reporting.
- **FR-006**: System MUST route commands to the correct board when FigJam and Design files are connected simultaneously, and ask the user instead of guessing when ambiguous.
- **FR-007**: System MUST leave no partial nodes on the board when a creation call fails midway.
- **FR-008**: System MUST make every board write a single undo step.
- **FR-009**: System MUST return a clear Design-only explanation (and change nothing) when prototype interactions, dev-mode status, or variable binding are requested on a FigJam board.
- **FR-010**: System MUST surface widget, stamp, and boolean-operation nodes as read-only and refuse creation of them with a clear message.
- **FR-011**: System MUST bound read output (depth/limit controls) so large boards do not produce unbounded responses.
- **FR-012**: System MUST reuse the existing stale-plugin-build detection for FigJam (version stamp comparison with rebuild-and-reopen guidance).
- **FR-013**: System MUST cover new FigJam logic with automated unit tests plus an end-to-end path that runs without Figma open, and provide a manual verification checklist for a real FigJam board.

### Key Entities

- **FigJam board**: A FigJam file canvas; contains pages of sections, stickies, shapes, connectors, tables, and media. Distinct editor from Figma Design with its own node types.
- **Connector endpoint**: A reference from a connector to the shape/sticky at each end; the structural fact that makes a diagram a flow rather than loose shapes.
- **Usage map**: The research artifact linking each professional FigJam workflow to the node types and operations the integration must support.
- **Design-only operation**: Prototype interactions, dev-mode status/annotations, and variable binding — meaningful in Design files, refused with explanation on FigJam boards.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An agent unfamiliar with the board can describe its content (node types, text, structure) after only read calls, with no missing or mislabeled FigJam node types on a test board covering all in-scope types.
- **SC-002**: An agent builds a complete workshop starter (section + labeled shapes + connectors + colored stickies + table) in 3 or fewer write calls, removable with a single undo per call.
- **SC-003**: Every failed write leaves the board exactly as it was (zero leftover nodes across 10 consecutive fault-injection trials).
- **SC-004**: 100% of Design-only calls against a FigJam board return the Design-only explanation and change nothing.
- **SC-005**: A new user connects the plugin in FigJam and runs their first successful read within 5 minutes, using only the token they already use for Design.

## Assumptions

- The agent already runs with the plugin connected via the existing token mechanism; no new authentication scheme is introduced.
- Widget authoring (custom interactive widgets) is out of scope; widgets are read-only surfaced content.
- Controlling the FigJam built-in timer is out of scope for this iteration.
- FigJam Slides are out of scope for this iteration.
- Manual verification happens on a scratch FigJam board, never on a live workshop board.
- The existing multi-file hub routing and stale-build detection designs are reused, not reinvented.
