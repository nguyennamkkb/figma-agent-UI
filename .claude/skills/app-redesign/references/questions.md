# Self-questions and the 4 user questions

The usual reason for a redesign is **a sibling app**: the original is not bad, the user needs a version that reads as another product, with the same functions, to publish one more app. So after the app (or the flow) is understood, the agent does not hunt for flaws. It asks itself **how far the new look must move from the original**, answers from the scan, and puts **at most 4 questions** to the user, once, before anything is drawn.

A goal that clearly asks to fix or modernise the same app ("đẹp hơn", "giữ thương hiệu", "dark mode cho app này") is a **refresh**: same 4 questions, but the distance rule (§2) does not apply and the brand may be kept. Write `Purpose: sibling | refresh` in `project.md`; unclear → sibling, marked *assumption*.

## 1. Self-questions (answered by the agent, never asked)

For each one: evidence from the file → recommendation → confidence. High confidence → write it in `plan.md` as *assumption* and do not ask. Only the 4 questions of §3 go to the user.

| # | Self-question | Evidence |
|---|---|---|
| 1 | What does the original look like on each axis of §2? | `get_design_system`, `get_node` on the main screens, screenshots, `inventory.baseline.json` |
| 2 | Which level makes the sibling read as another product? | sibling → L3 by default; L4 when the IA can change without hurting the funnel; L2 only for a refresh |
| 3 | Which 3 directions are far from the original **and** from each other? | §2 distance table; pole combinations of figma-ui-flow `creative-process.md` §4.1 (density, hierarchy, structure, voice, material) |
| 4 | Were siblings of this app released before? | `project.md` → *Released siblings*; each new direction also keeps its distance from them |
| 5 | Which theme? | original theme (sibling → recommend the other one), content (media/creative apps suit dark, productivity apps light), cost: Both doubles QA and needs 2 variable modes (paid Figma plan) |
| 6 | Which image style? | kinds of image in the baseline (3D, photo, flat illustration, mixed), number of hero images, their emotion; the level's treatment (`imagery.md`) |
| 7 | Which type voice, shape language, icon set, navigation, copy tone? | the direction chosen; platform conventions (`style-direction/references/platform-mapping.md`) |
| 8 | Which main screens prove the direction, and which S moves do they make (L3)? | archetypes of the flow; `levels.md` §1.1 |
| 9 | What must stay? | the Function layer always; for a refresh, the brand items the goal names. Sibling → **nothing visual is kept by default**: brand colour, mascot, images and icon set change |

## 2. Distance table (sibling only)

Fill it before proposing directions and put it in `plan.md` §4:

| Axis | Original (measured) | A | B | C |
|---|---|---|---|---|
| Colour family (main hue) | | | | |
| Theme (light / dark) | | | | |
| Type voice | | | | |
| Shape language (radius, strokes) | | | | |
| Material (flat / shadow / glass / 3D) | | | | |
| Image style | | | | |
| Layout of the main screens (S/P moves) | | | | |
| Navigation pattern | | | | |
| Icon set | | | | |
| Copy tone | | | | |

Rules:

1. Each direction differs from the original on **at least 6 of the 10 axes**, always including **colour family, image style and layout**. Silhouette test: original and direction side by side at 25 % zoom, text unreadable; nobody takes them for the same app.
2. The 3 directions differ from **each other**: with colour hidden they still look different (`creative-process.md` §4).
3. Each direction keeps the same distance from every released sibling (§1 #4).
4. No axis may cost a function: parity must still pass.

A direction that misses rule 1 is pushed further or dropped, not shown.

## 3. The 4 user questions ◆

Asked once, in one `AskUserQuestion`, after the analysis and the directions on paper (`start.md` §5.5), **before** any frame or image is made. Every question stands on its own (the user may see only the dialog); the recommended option comes first with "(Recommended)" and the reason from the evidence in its description.

| # | Header | Question | Options |
|---|---|---|---|
| 1 | Hướng | "Chọn hướng thiết kế cho <app> (khác bản gốc ở ≥ 6/10 trục)?" | A / B / C — each with a `preview`: name, 3 feeling words with a "not" pole, palette hex, type pair, signature move, axes changed |
| 2 | Mức | "Mức khác biệt so với bản gốc?" | L3 Recompose (Recommended for a sibling) · L4 New in style · L2 Refresh — one-line effect on Home each |
| 3 | Theme | "Giao diện sáng hay tối?" | the theme opposite to the original first for a sibling · same as the original · Both (primary theme named, cost stated) |
| 4 | Ảnh | "Phong cách ảnh hero/onboarding?" | 2–3 styles different from the source images (e.g. glossy 3D, hyperreal photo, flat illustration) · close to the source (L2 only) — each naming what changes from the source |

Everything else (type, shape, icons, navigation, copy tone, screens to prove the direction) follows the chosen direction and is written in `plan.md` as *assumption*; the user changes it through "Other" or the notes of question 1.

- A question already answered by the goal (an explicit `L3`, "dark only", a named image style) is not asked: leave it out and say the value in the summary above the dialog.
- "Tùy bạn" or no answer → the recommended option, said back in one line.
- Answers go to `project.md` → *Answers* and *Decisions*, and to `plan.md` §1.

## 4. One flow (section link)

Same self-questions on that flow only. If other flows were already redesigned, the "same way or another" question of `section-link.md` §4 comes first; the whole dialog still holds **at most 4 questions**:

| Situation | Questions |
|---|---|
| Pilot start (no project) | the 4 of §3, directions proven on the flow's own main screens |
| Project exists, nothing else edited | none: approved direction and level |
| Other flows edited | 1 "same way or another" · 2 level for this flow (only if not given) · 3 image style for this flow (only at L3/L4) |
| Another way chosen (trial) | the trial's direction and image style, asked when the trial direction is proposed (`section-link.md` §5) |
