# Image knowledge — iPhone

Direct analysis of the Apple illustration images in `assets/` (read visually, not inferred from file names).

| Image | HIG page | Knowledge gained |
|---|---|---|
| `assets/tab-bar-anatomy.png` | Tab bars | One tab = **icon (top) + label (bottom)**. The selected tab sits in a floating **capsule** (brighter background). Search is split out as a separate **round button** at the bar's right edge, not mixed into the tab group. |
| `assets/tab-bar-badges.png` | Tab bars | Badges attach to the icon to signal new status; **don't** change the label, **don't** change the tab size. |
| `assets/liquid-glass-tab-bar.png` | Color / Tab bars | The tab bar is transparent **Liquid Glass**, showing content behind it; the selected tab shows a bright capsule. Because it's transparent, the content underneath must have enough contrast to keep icons readable. |
| `assets/toolbar-grouping-correct.png` | Toolbars | Group actions into **2 clusters at the sides** (left: back/forward; right: pen + overflow), leaving the **middle area empty** for the title. Small gaps between buttons within a cluster, large gaps between clusters. |
| `assets/toolbar-grouping-incorrect.png` | Toolbars | Buttons spread evenly across the bar → groups lost, hard to scan, title squeezed. |
| `assets/toolbar-symbols-correct.png` / `toolbar-symbols-incorrect.png` | Toolbars | Prefer **symbols** over text; **don't** add outlines/rings around icons (visually heavy). |
| `assets/toolbar-prominent-action.png` | Toolbars | Only **one** primary action gets emphasis (tint/filled capsule); all other actions stay neutral. |
| `assets/text-hierarchy.png` | Typography | Standard hierarchy: **Large title** → subtitle (secondary, gray) → rows: **title (bold)** + 2-line body + subtitle. Same screen's toolbar: back chevron (left), "Select" capsule action, "…" overflow. The large title shrinks on scroll. |
| `assets/button-roles-alert.png` | Buttons | Alert: short title + **1-sentence message**; buttons stacked **vertically**: primary (filled blue) → destructive (red) → secondary (gray). Order = priority/danger level. |
| `assets/button-loading-visible.png` | Buttons | Buttons show an **activity indicator** while working; hidden when done. Don't resize the button, to avoid layout jumps. |
| `assets/control-spacing-correct.png` | Accessibility | 3 round buttons with **separate hit regions**, enough spacing to avoid mis-taps; larger buttons get larger hit regions. |
| `assets/control-spacing-incorrect.png` | Accessibility | Buttons **pressed against each other**, hit regions overlapping → mis-taps. Leave padding between controls. |
| `assets/list-disclosure.png` | Lists & tables | A chevron (`>`) in a row = **a detail screen exists**; only use it when the row truly leads somewhere. |
| `assets/size-class-square.png` / `assets/size-class-full.png` | Layout | Same app, **small (square) vs. full-screen windows**: content must re-lay itself out — illustrating why you design to **size classes**, not devices. |

## Resulting rules for iPhone

1. **Control bars are chrome, not content:** tab bars/toolbars float over content as Liquid Glass; content runs underneath.
2. **Group, don't scatter:** actions in the same group sit close together, groups sit far apart; at most 1 highlighted action.
3. **Hierarchy readable at a glance:** Large title → Title → Body → Subtitle, contrast decreasing.
4. **States must be visible:** badge (new), capsule (selected), spinner (loading), chevron (drill-in).
5. **Hit regions stay separate:** the most common mistake is controls touching each other; leave padding ≥ the safe spacing.
