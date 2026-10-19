# Evidence & citations

Every number in this skill comes from the sources below. Accessed 2026-09-25 via web search;
full records.

## Touch areas

- **W3C — WCAG 2.2 SC 2.5.8 Target Size (Minimum), AA:** ≥ 24×24 CSS px, or equivalent spacing;
  inline/user-agent/essential exceptions. `w3.org/WAI/WCAG22/Understanding/target-size-minimum`
- **W3C — SC 2.5.5 Target Size (Enhanced), AAA:** 44×44 CSS px.
  `w3.org/WAI/WCAG22/Understanding/target-size-enhanced`
- **Apple HIG:** minimum touch area 44×44 pt. **Material Design:** 48×48 dp.
- **Hoober (Touch Design for Mobile Interfaces):** sizes by position — top ~11 mm, middle ~7 mm,
  bottom ~12 mm (the thumb meets the bottom at a flatter angle).
- **Spacing exception:** a 24 px circle around a target's center must not touch another target.

## Interaction states

- **Material Design 3 — States / State layers:** enabled · disabled (38%) · hover (8%) ·
  focus (10%) · press (10%) · drag (16%); state layer between container and content; state layer 40 dp
  but **interactive target 48 dp**; disabled takes no focus/hover/press; states can combine.
  `m3.material.io/foundations/interaction/states`

## Action hierarchy

- **Carbon Design System — Button guidelines:** "each page should have only one primary button";
  secondary pairs with primary; tertiary/ghost for low emphasis; danger for destruction; valid button combinations.
- **UX Collective (button placement):** primary order in right/left-aligned groups; bottom-sticky favors right.
- **Common practice:** button contrast 3:1, text 4.5:1; prefer undo/confirm for destructive actions.

## Presentation

- **NN/g — Bottom Sheets: Definition and UX Guidelines:** sheet keeps background content visible; allow Back to close;
  has Close; **no stacking**; short interactions only; "reachability" is a **misunderstood** rationale.
  `nngroup.com/articles/bottom-sheet`
- **Material — Snackbars:** screen bottom; mobile ≤ 2 lines; no icons; ≥ 2 actions ⇒ dialog; never the only path
  to a core use case.
- **Material — Dialogs:** highest priority, blocking; use only when needed.
- **Android — Toasts:** use a snackbar when the app is foreground; a notification when background.

## Response times

- **Nielsen — Response Time Limits (1993, from Miller 1968):** 0.1 s instant · 1 s keeps flow · 10 s keeps attention;
  > 10 s needs percent-done + a way to cancel. `nngroup.com/articles/response-times-3-important-limits`
- **First load:** first interactive content goal < 5 s (long-term goal 2 s, mid-range 3G).
- **Frame budget:** 16 ms (60 fps); ~10 ms/frame for render.

## Thumb zone & one-handed use

- **Hoober:** 49% one hand · 36% cradled + other hand · 15% two hands; **67%** use the right thumb one-handed;
  users are most accurate tapping the middle of the screen, slower at corners/edges.
- **Industry case study:** thumb-friendly redesign ⇒ +14% weekly checkout completion (aggregate report).

## State lifecycle

- **NN/g — Empty states:** don't default to a blank screen; use the empty state to guide; provide a path to
  content-creating actions; distinguish "loading" vs "no data".
- **Carbon — Loading pattern:** skeleton for container-based components; no skeleton for toast/
  menu/modal; screen readers must be informed of loading/busy.
- **State-first practice:** skeleton shows after ~200 ms, cap ~5 s; loading buttons keep the label;
  empty = explanation + CTA + visual; error = specific + action + recovery.

## Gestures

- **W3C — SC 2.5.1 Pointer Gestures (A):** single-pointer, non-path-based alternative.
- **W3C — SC 2.5.7 Dragging Movements (AA):** no-drag alternative; **don't** use swipe as the alternative.
- **W3C — SC 2.5.2 Pointer Cancellation:** fire on release; offer cancel/undo.

## Reliability notes

- WCAG numbers are a **standard** (mandatory when compliance is required).
- Apple/Material numbers are **platform recommendations** (stronger than generic "best practice").
- Industry figures (%, wait times) are **indicative**, not standards.
