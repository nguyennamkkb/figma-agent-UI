# Screen build loop: outside-in

Applies to **every** screen, in both Stage 4 (building directions to compare) and Stage 5 (building the real screens). Tool names in parentheses are `figma-agent` tools. Detailed syntax: the `figma-agent-tools` skill; level → tool table: `run-with-figma-agent.md`.

## Contents
1. Why outside-in
2. Rules of the loop
3. The six levels L0 → L5
4. Definition of Done for a screen
5. Moving to the next screen
6. Example: Paywall / Timeline
7. Anti-patterns

---

## 1. Why outside-in

- If the frame is wrong (sizing, padding, region order), everything inside it is wrong too. Fixing the frame once it holds 100 nodes costs many times more than fixing it while it is still empty.
- When each level is small, the screenshot is easy to read and each error has one clear cause.
- Auto Layout is built from parent to child: a child can only `FILL` once its parent has Auto Layout.

## 2. Rules of the loop

1. **One level or one region per write.** Never build a whole screen in a single write. The only exception: L1 builds the frame together with its empty regions in one write.
2. **Check after every write**, using that level's checklist. If something is wrong, fix that node immediately; don't keep building on top of an error.
3. **Auto Layout on every frame that holds content.** Free positioning is only for decoration, background images, and overlays, named `decor/…`.
4. **Tokens first, hex later.** If a variable/style exists, bind it while building (`{var: "…"}`, `textStyle`). If there is no system yet, record the raw values so L5 can report them, or go back to Stage 2.
5. **At most 3 fix rounds per level.** If it is still off after 3 rounds: stop, tell the user the problem and the proposed approach; don't keep patching.
6. **One screen at a time.** Don't open a new screen until the current one meets DoD.

## 3. The six levels L0 → L5

### L0 — Prepare (nothing written yet)

- **Goal:** know what the screen is for and what it is assembled from.
- **Do:**
  1. A one-sentence screen goal and **one primary action** (CTA).
  2. Real content in the user's language: titles, labels, figures, prices. No lorem.
  3. **A text region map**, top to bottom, with sizing:
     ```
     Screen 390×844 VERTICAL
     ├─ Header   FILL × HUG     close · restore
     ├─ Content  FILL × FILL    hero · title · timeline
     └─ Footer   FILL × HUG     rating · CTA · caption · link
     ```
  4. Inventory what can be reused (`search_design_system`, `get_design_system`): components, variables, text styles.
  5. Images to generate (hero, illustrations): generate them at this step (gemini) so L4 only has to attach them.
- **Pass the level when:** the map has exactly 1 primary CTA, every region has a name and sizing, and you know which blocks use instances.

### L1 — Screen frame

- **Goal:** a skeleton with the correct size and Auto Layout.
- **Build (1 write):** a root frame at the correct platform size, `layout VERTICAL`, layout grid (`preset: mobile`), background from a token, safe area via padding (top 54 / bottom 34 on iPhone). Inside it, the **named empty regions** from the L0 map, each with `layout`, sizing (`FILL`/`HUG`/`FIXED`), padding, gap. Temporarily tint regions (`#FF00001A`) if you need to see them in the screenshot.
- **Check:**
  - `get_node{depth:1}`: each region has the correct `widthMode`/`heightMode`; padding and gap are on the 4/8 scale.
  - Frame screenshot: regions don't overlap, order is correct, FILL regions take up the remaining space.
- **Pass the level when:** the frame matches the L0 map and no frame is missing Auto Layout.

### L2 — Regions → blocks

- **Goal:** each region has a block structure with the correct hierarchy.
- **Build:** **one write per region** (`render_tree{parentId: <region id>}`). Blocks are named Auto Layout frames (`Hero`, `Title`, `Timeline`, `Plan list`). Text can already be real content; icons and images can be placeholders.
  - Region order: the region containing the primary CTA first, then the content region, and the header last.
- **Check (screenshot of the region just written):**
  - left edges aligned;
  - even spacing rhythm, on the 4/8 scale;
  - visual hierarchy: title > content > secondary;
  - no text overflow, CTA is the most prominent element.
- **Pass the level when:** every region has its blocks, and a full-screen screenshot reads as the final layout.

### L3 — Components

- **Goal:** no more hand-made copies.
- **Do:** elements repeated ≥ 3 times or standard elements (button, list row, chip, plan card, nav bar) use instances. If the library doesn't have them, build the component on the Components page first (Stage 3, `create_component_set` with properties), then replace the hand-built blocks with instances (`delete_nodes` + `render_tree{parentId, index}` with `type: "instance"`).
- **Check:**
  - instances use the correct variant;
  - properties (`texts`, BOOLEAN) can swap content;
  - the screenshot is unchanged from L2, except for intentional changes.
- **Pass the level when:** every repeated block is an instance.

### L4 — Content and details

- **Goal:** the screen looks real.
- **Do:** final real text, SVG icons colored with tokens, real images (attach the paths generated in L0), selected interactive states (selected, badge), `decor/…` decoration layers. Edit with `update_nodes` in batches.
- **Check:** screenshot at `scale: 1`:
  - no lorem, no placeholders;
  - icons share the same size and stroke;
  - images contain no stray text;
  - text over images is still readable (add a gradient overlay if needed).
- **Pass the level when:** the screenshot has nothing "temporary" left.

### L5 — Verify and fix

- **Goal:** meet the Definition of Done.
- **Do:**
  1. `audit_design{rootId: <screen>}` with all groups: names, tokens, layout, a11y, content.
  2. `stress_test{id: <screen>, cases: [long-text, large-text]}` (add `modes` when Dark exists), screenshot the section, then delete the section.
  3. Fix each issue with `update_nodes`; default names with `rename_by_rule`; raw values where tokens exist with `bind_variables` (run dryRun first).
  4. Audit and screenshot again after each fix round.
- **Triage warnings:** for false positives (small target on a non-tappable row, SVG icon "without Auto Layout"), state explicitly that they were reviewed and dismissed.

## 4. Definition of Done for a screen

- [ ] 0 **Blocker** issues.
- [ ] Body text contrast ≥ 4.5:1, large text and UI elements ≥ 3:1. Text over images checked visually.
- [ ] No default-named layers remain.
- [ ] Every frame that holds content uses Auto Layout.
- [ ] No raw values outside the primitive level, or the remaining ones are listed with a reason (file has no tokens yet).
- [ ] Long-text and large-text stress cases don't overflow the clip region; the stress section has been deleted.
- [ ] Tappable targets ≥ 44pt; exactly 1 primary CTA.
- [ ] The final screenshot at `scale: 1` has been reviewed.

## 5. Moving to the next screen

- Report in one line: `✅ <Flow / Screen / State> meets DoD — audit: 0 Blocker, N Should fix (reviewed)`.
- The next screen reuses the previous screen's components and tokens. For state screens (empty, error, loading), duplicate the screen that met DoD (`clone_node`), edit what differs, then rerun L5.
- In Stage 4: each direction is one screen and goes through this whole loop, but is only polished enough to compare. Stop at the gate for the user to choose.

## 6. Example: Paywall / Timeline

**L0:**
- Goal: start a trial. CTA: "Start free trial".
- Map: Header (close · restore) / Content (hero 208 · title · 3-step timeline) / Footer (rating · CTA · caption · link).
- Hero image generated with gemini, saved to `generated-images/paywall-c-hero.png`.

**L1 (1 write):**

```jsonc
{ "type": "frame", "name": "Paywall / Timeline", "width": 390, "height": 844, "layout": "VERTICAL",
  "fill": "#FFFFFF", "layoutGrids": { "preset": "mobile" }, "children": [
  { "type": "frame", "name": "Header",  "layout": "HORIZONTAL", "widthMode": "FILL", "padding": [54, 24, 8, 24], "justify": "SPACE_BETWEEN", "align": "CENTER" },
  { "type": "frame", "name": "Content", "layout": "VERTICAL", "widthMode": "FILL", "heightMode": "FILL", "padding": [8, 24], "gap": 24, "align": "CENTER" },
  { "type": "frame", "name": "Footer",  "layout": "VERTICAL", "widthMode": "FILL", "padding": [12, 24, 34, 24], "gap": 8, "align": "CENTER" } ] }
```

Check: `get_node depth 1` shows Content `FILL × FILL`, Header/Footer `FILL × HUG`. The screenshot shows 3 bands in the correct order.

**L2 (3 writes, one region each):**
- Footer: `{parentId: Footer}`, containing Rating, CTA (56-high frame, FILL), Caption, Link.
- Content: Hero (image 208), Title, Timeline (3 Steps, each Step a HORIZONTAL Rail + Text).
- Header: close icon + Restore.
- After each write, screenshot that region: centered correctly, timeline rail is continuous.

**L3:** Step repeats 3 times, so build a `Timeline step` component (properties Title, Desc, Icon swap, Has line), then replace the 3 Steps with instances. The CTA uses a `Button` instance (Variant=Primary) if the library already has one.

**L4:**
- `update_nodes` attaches the hero image and the lock / bell / crown icons colored with tokens.
- Caption finalized so it doesn't leave an orphaned word on a new line: "7 days free, then 399,000₫/year".

**L5:**
- The first audit finds the white CTA on #7C5CFC at 4.38:1 (Blocker), so it is changed to #6A45F0. Yellow stars #B7791F at 3.4:1, changed to #946200.
- Long-text stress doesn't overflow.
- Re-audit shows 0 Blockers. ✅ DoD, and only then move on to the "Paywall / Success" screen.

## 7. Anti-patterns

| Wrong | Consequence | Right |
|---|---|---|
| One write of 136 nodes for 3 screens | Sizing, contrast, and orphaned-line errors surface at once on all 3 screens | L1 → L5 for each screen |
| Checking once at the end | No way to tell which level caused an error | Screenshot after every write |
| Adjusting the frame once it is full of content | Breaks the FILL/HUG chain | Get the frame right in L1 before pouring in content |
| Hand-copying repeated blocks | Fixing 1 place means fixing N places | L3: component + instance |
| Polishing 3 directions before the gate | Wasted effort on the 2 rejected directions | Stage 4 stops at just enough to compare |
| Building screen 2 while screen 1 still has Blockers | The errors get duplicated | DoD first, then the new screen |
