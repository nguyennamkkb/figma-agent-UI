# Copy screens between files (`copy_nodes` → `paste_nodes`)

The standard way to bring frames, sections or layers from one Figma file (the source, e.g. the client's original) into another (the target, e.g. the clone being rebuilt). The result is an exact copy built from real layers, not a screenshot. Never hand-write a cross-file copy with `execute_code`: plugin output stops at 20k characters, `clientStorage` hangs on large payloads, and the known traps below are already handled by the tools.

## 0. Quick path

Use when the user wants a screen "y hệt" the original, or to bring source screens into the clone before restyling. Both files must be open with the plugin connected. The rest of this file has the fields, what is copied and troubleshooting.

1. `copy_nodes{file: <source>, ids, name, targetFile: <target>}`: one snapshot per screen or per Section. Read `skipped` and `missingInTarget`.
2. `paste_nodes{file: <target>, page: "06 · Explore (WIP)", snapshot: name, x, y}` next to earlier copies; `exact: true` and an empty `mismatches` mean every layer kept its size. `screenshot` the copy and the source side by side.
3. `fontFallbacks` lists text set in Inter because the target lacks the font: install the font later and swap it (the original is in plugin data `figma-agent/original-font`), or copy again with `outlineMissingFonts: true` when the exact look matters more than editing.
4. Into a flow: `paste_nodes{replaceId: <old frame>}` keeps the slot and name, then rewrite the text-flow `@id`s and redraw connectors (`../standards/file-standards.md` §2.2.1 "Replacing a flow's screens").

Never hand-write a cross-file copy with `execute_code`: snapshots on disk avoid the 20k output limit and plugin `clientStorage`, and the tools fix the known traps (hidden padding, masks, outlined-text strokes, video fills).

## 1. When to use

| Situation | Use |
|---|---|
| "Copy this screen exactly", "sao chép y hệt", bring source screens into the clone | `copy_nodes` → `paste_nodes` |
| Same screen, new style (tokens, components of the clone) | Copy first as a reference on `06 · Explore (WIP)`, then rebuild with `render_tree` and the clone's components |
| Duplicate inside the same file | `clone_node` (keeps instances and variable bindings) |
| A picture only (handoff, mood) | `export_assets` |

## 2. Before you start

1. Open both files in Figma desktop and run the figma-agent-UI plugin in each. `figma_status` must list both with the same build (`versionCheck` ✅). After a plugin update, reopen the plugin in **both** files.
2. Get the node ids from the source link (`node-id=43206-6167` → `43206:6167`), or with `get_node` / `find_nodes` on the source file.
3. The source is only read. Nothing is hidden, moved or renamed there.

## 3. Copy

```text
copy_nodes{
  file: "<source file name>",
  ids: ["43206:6167"],            // one screen, several screens, or a whole Section
  name: "IAP",                    // snapshot name → ~/.figma-agent/snapshots/IAP.json
  targetFile: "<target file name>",
  exclude: ["43030:14727"],       // optional: layers to leave out (badges baked over images)
  outlineMissingFonts: false      // default: text stays editable
}
```

What the summary tells you:

| Field | Meaning | Action |
|---|---|---|
| `roots[].nodes` | Layers captured per root | Sanity check against the source |
| `images`, `missingImages` | Image fills saved (original bytes) | `missingImages` non-empty → the source image is unavailable; re-copy later |
| `fonts`, `missingInTarget` | Fonts used; those the target lacks | Plan a font fix, or re-copy with `outlineMissingFonts: true` |
| `skipped` | Vectors Figma could not export (empty or masked-out shapes) | Usually invisible; screenshot to confirm |
| `timing` | `readCalls` = 1 + direct children; `imagesMs` grows with image size | Seconds, not minutes; minutes = stuck plugin (§6) |

One snapshot per screen keeps pastes fast and lets you replace screens one by one. A Section copy works too (its frames become the children).

## 4. Paste and verify

```text
paste_nodes{
  file: "<target file name>",
  page: "06 · Explore (WIP)",
  snapshot: "IAP",                // or an absolute path to the .json
  x: 440, y: 9000                 // next to earlier copies; other roots keep their offsets
}
```

1. Read `exact`. `true` with empty `mismatches` = every layer kept its size. A mismatch lists the layer path and want vs got. Text in a fallback font can differ by a few px; anything else is a bug worth reporting.
2. `screenshot` the copy and the source at scale 1 and compare side by side (images, gradients, blur, mixed text, icons, masked groups).
3. `fontFallbacks` lists text set in Inter at the same weight because the target lacks the font. The original font is in the layer's plugin data `figma-agent/original-font`. Install the font and swap it later, or re-copy with `outlineMissingFonts: true` when the exact look matters more than editing.

## 5. Put it into a flow

```text
paste_nodes{ file, snapshot: "IAP", replaceId: "4:53" }
```

`replaceId` takes the old node's parent, index, x/y and **name**, pastes there and deletes the old node only after success. A failure removes the partial copy and leaves the old node untouched. Deleting the old frame also deletes every connector attached to it. Then follow `figma-ui-flow/references/standards/file-standards.md` §2.2.1 "Replacing a flow's screens": rewrite the text-flow `@id`s (other flows included) and redraw the missing connectors.

## 6. What is copied, what is not

| Copied exactly | Changed or left out |
|---|---|
| Frames, auto layout (padding, gap, wrap, alignment, sizing modes), absolute children, constraints, layout grids | Instances are detached into frames (component properties and overrides become plain layers) |
| Fills, gradients, image fills (original bytes, scale mode and crop), strokes with per-side weights and dashes, effects (shadows, layer and background blur), radius, corner smoothing, opacity, blend mode | Variable and style bindings: values are copied raw (the target may not have the same tokens) |
| Text with every styled segment (font, size, colour, line height, letter spacing, case, decoration), alignment, auto-resize, truncation | Hidden layers are skipped (only what is visible is copied) |
| Vectors, boolean shapes, shape-only groups and groups with masks, as SVG at their rendered position | Prototype interactions, paragraph spacing and lists, hyperlinks, GRID auto layout |
| Video fills as a still image of the node (children baked in) | Variables of the source file |

Traps handled for you: padding hidden by a fixed size (a 22 px badge with 290 px padding), masks that cannot be exported part by part, strokes of outlined text re-applied to the wrapper (bright lines above and below a title), slow sequential SVG exports.

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `copy_nodes` times out, then every call to that file waits | A previous command is still running in the single-threaded plugin | Wait for it, or close and reopen the plugin in that file; then copy again |
| `Unknown command "snapshot_read"` | Old plugin build in one file | `npm run sync:plugin` (repo) or reinstall, then reopen the plugin in both files |
| Text looks wider or narrower | Fallback font | See `fontFallbacks`; install the font or use `outlineMissingFonts: true` |
| Snapshot is tens of MB | Full-resolution source images | Expected; delete old snapshots in `~/.figma-agent/snapshots` when done |
