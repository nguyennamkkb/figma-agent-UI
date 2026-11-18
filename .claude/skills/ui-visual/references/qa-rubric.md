# QA rubric — prove the visual before handoff

Screenshot at scale 1 (real size) and at scale 3 (detail). Write each result in `qa.md`: pass / fail + the layer id fixed.

| # | Test | How | Pass |
|---|---|---|---|
| Q1 | Side by side | reference and result in one screenshot (or two at the same scale) | reads as the same family; the three premium factors from recipe.md are present |
| Q2 | Squint | screenshot at maxSize 160 | the subject and the title/number are still the first two things seen |
| Q3 | Greyscale | judge luminance only (or export and desaturate) | hierarchy survives without colour; text separates from the picture |
| Q4 | Text at 1× | scale 1 screenshot | every word readable; contrast ≥ 4.5:1 for body, ≥ 3:1 for ≥ 18 pt bold (measure the darkest/lightest pixel behind the text) |
| Q5 | Long copy | replace the copy with +30% text, screenshot, restore | no clipping, no overlap with the subject |
| Q6 | Palette | `extract_palette.py` on an export | no dominant colour outside recipe palette (± a grade shift) |
| Q7 | Edges | scale 3–4 screenshot on every cut-out | no fringe, no halo, no jagged mask |
| Q8 | Light | look at each piece | one light direction; ground shadows agree with it |
| Q9 | Frame break | check the subject overflow | escapes by the planned share, not clipped by a parent, not touching neighbours |
| Q10 | Structure | `get_node` depth 2 | layers named by role (Background, Texture, Glow, Title, CTA, Subject, Sparkles), no stray hidden layers, text is TEXT |
| Q11 | Touch | CTA height | ≥ 44 pt hit area (visual can be smaller inside a larger frame) |
| Q12 | Identity | compare with the source | no source mascot, logo, photo or copy left (unless own asset) |

A failed test is fixed on the specific layer (filter, blend, position, copy), never by regenerating everything. Handoff (◆) lists: final node id, assets folder, the recipe link, and any test that passed with a note.
