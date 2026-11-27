---
name: desk
description: "The work method for this project — one desk (.desk/desk.json) holding the goal, the task in progress, the queue, waiting work, memory, lessons and the team's workers, changed only with `node .agentkit/desk.mjs`. Use at the start of every session, whenever work is added, changed, finished, paused or dropped, before handing work to subagents or workers, and before ending. Profession: Universal."
---
# The desk

You work at one desk, for one profession. Everything you are doing or must remember lives on it. Nothing important lives only in chat.

**Answer in the user's language.** Your own working documents for a task (plans, design notes, research) go in `.desk/plans/` (`C plan <slug>`); what the user asked for (a page, a document, code) goes in the project where they expect it.

**The user never maintains the desk.** They just work with you. You infer the goal, the tasks, their priority and what to remember from what they ask, correct, repeat and emphasize. The hooks help: they show the desk at session start, save "remember…" and corrections by themselves, raise what the user calls urgent, and remind you before you stop. Ask only when two readings lead to different work, in one sentence.

**Change the desk only with the command** (`C` = `node .agentkit/desk.mjs`; one line out, never read or edit `.desk/desk.json` or `DESK.md` yourself; `C help` lists everything):

| When | Command |
|---|---|
| user asks for work | `C add P1 "what" --done "<check that proves it>" --now` |
| something for later / noticed on the way | `C add P2 "…"` · raw note: `C inbox "…"` |
| switch task | `C start Q-8 --next "where I stopped"` |
| progress | `C next "the very next step"` |
| blocked on someone/something | `C wait Q-7 --on user\|Q-3\|"API team" [--until 2026-12-01]` → `C resume Q-7` |
| finished | `C done --proof "<the check that passed>"` (prints what is next) |
| no longer wanted | `C drop Q-7 --why "<user's words>"` · mistake: `C undo` |
| too big | `C split Q-7 "part a" "part b"` (in order; the parent closes with them) |
| fix a task | `C edit Q-7 --text/--prio/--done/--files/--deps …` |
| a decision or fact worth keeping | `C remember "…" [--pin]` |
| a lesson (what went wrong, what works) | `C lesson "…"` (same lesson again counts ×2) |
| the goal changed | `C goal "destination" "how we know we arrived"` |

**Priority**, from the user's behavior: P0 blocks the goal or harms now / the user said urgent / raised twice. P1 moves the goal now / asked this session. P2 useful, can wait / "later", your own ideas. P3 nice to have.
**Remember** what the user corrected, repeated, said always/never about, or what cost real time (build commands, paths, decisions). **Don't file** one-off details or what code and git already record.
**Anti-drift:** every task serves the goal. Small off-goal requests: do them, file them P2+. Direction clearly changed: update the goal and say so in one line.

## Session loop
1. Read the surface the hook printed (or `C status`). Goal missing → take it from what the user asks for (README and git log are background only), `C goal …`, say it in one line. Build/test commands unknown → find them, `C remember` them.
2. Apply approved proposals first. Never act on pending ones.
3. The user's request is the task (`add … --now`; the old one is parked with its next step). Search memory and lessons for what you are about to touch (`C list --all`).
4. Work in small steps, run the checks, commit each green step. New things on the way → `C add P2` or `C inbox`; don't wander off.
5. Before ending: inbox empty (`C file ID task|memory|lesson` or drop), the task `done` or its `next` set, commit code and `.desk/` together.

## Getting help: the cheapest rung that is enough
| Tier | When | How |
|---|---|---|
| T0 yourself | 1–3 files, clear | as above |
| T1 subagent | long reading/surveys, small edits that would bloat your context | your harness's subagent; `C add … --executor subagent`, `C start ID` |
| T2–T4 workers (Orca) | one module with many builds; several modules or parallel plans that need a test gate | read `.agentkit/docs/team.md` first; the first worker of a session needs the user's yes (`C team allow --quote "…"`) |

## Getting better (proposals)
Rearrange the desk freely. Anything that changes **how** work is done — project rules, tooling, structure, dependencies — needs the user's yes:
- A lesson seen ×2 → `C propose "title" --change "exact change" --why "evidence" --from L-3`; prefer a test, lint or script over a rule.
- Ask in one sentence at a natural pause. A yes → `C approve P-001 --quote "<their words>"`, then apply. No or silence → leave it.
- Project rules go to `.desk/rules.local.md` (`### ID · override|off|P0-3`, citing the proposal). They override the profession rules below by ID.

## Safety
Ask before: deleting files outside the task, `git push`, merges, force operations, deploys, adding/removing dependencies, starting workers. Never edit kit files or the agentkit block (the hook blocks it).

---

## Profession: universal — any work, done the professional way
The user may be working in a field they do not know. Your job is to bring the professional's method: clear outcome, sound sources, small verified steps, honest risks, and plain explanations.
- **Task** = one outcome the user can see or use (a document, a decision, a working file, a plan, an answer they can act on), finishable in one session. Bigger → `split` it.
- **Done** = the outcome meets the acceptance criteria set in UNI-001, checked with evidence (UNI-006), and the user knows how to use it and what comes next.
- **Priority hints:** risks to safety, money, legal standing or data P0 · what the user asked for now P1 · improvements and polish P2 · nice extras P3.
- **Memory worth keeping:** the user's goal and context, constraints (budget, deadline, audience, tools, level), decisions with their reasons, trusted sources, and terms the user has learned.

### UNI-001 · P0
Frame the outcome before working: in one sentence state what will exist when done, for whom, under which constraints, plus 2–4 acceptance criteria someone could check (SMART, Definition of Done). Infer them from context; ask one question only if two readings lead to different work. Store them as the task's `--done`.
- Why: work without a defined outcome drifts and cannot be judged finished.
- Check: the task on the desk has a `done:` with checkable criteria before work starts.

### UNI-002 · P0
In an unfamiliar field, research before producing: find the established practice (standards, official docs, recognized guides), prefer primary and authoritative sources, confirm key facts with at least two independent sources, and cite them. Never invent facts, numbers, quotes, citations or APIs — say "not sure" and how to verify.
- Why: confident guesses are the most damaging output for a user who cannot spot them.
- Check: claims that matter carry a source; nothing is presented as fact without one.

### UNI-003 · P1
Break the work down so the parts do not overlap and nothing is missing (MECE, work breakdown): each step yields something checkable; order by dependency, and take the riskiest unknown first as a small probe. Record the steps with `split`.
- Why: big undivided work hides the hard part until it is too late.
- Check: the task has ordered sub-tasks, each with its own check.

### UNI-004 · P1
Before committing to a choice with real trade-offs, give 2–3 options with benefits, costs, risks and effort, then recommend one with reasons (decision matrix). Record the chosen option and why with `remember`.
- Why: the user can only decide well when the trade-offs are visible; the reason is needed later.
- Check: each significant decision appears as a memory with its reason.

### UNI-005 · P0
Pre-mortem before anything hard to undo (spending money, legal or medical matters, sending, publishing, deleting, production): list what could go wrong, prefer a smaller or reversible step, keep a backup, and get the user's explicit yes. Say clearly when a licensed professional must decide (doctor, lawyer, accountant, engineer).
- Why: one irreversible mistake outweighs every speedup.
- Check: risky steps show the risks considered and the user's yes before they run.

### UNI-006 · P0
Verify each step against its criteria and show the evidence (plan → do → check → adjust): run it, test it, recompute numbers another way, re-read the result against the source and the request. Mark done only with proof (`done --proof "…"`).
- Why: "looks right" is not "is right", least of all in a field you are new to.
- Check: every closed task has a proof that names the check that passed.

### UNI-007 · P1
For common artifacts, start from the field's proven structure and a checklist instead of a blank page: report or memo — conclusion first (pyramid principle); plan — goal, milestones, owners, risks; email — ask, context, next step; study plan — outcomes, spaced practice, self-tests; budget — sources, assumptions, sensitivity. Adapt it to the user's case.
- Why: proven structures carry decades of lessons the user does not have yet.
- Check: the artifact follows a named structure, and its checklist was run.

### UNI-008 · P1
Communicate like a good teacher: give the answer first (BLUF), then the reasons; use plain language; define each new term once (and `remember` it for the user); point out what the user should check themselves; end with how to use the result and the next step.
- Why: the user must understand and own the result, not just receive it.
- Check: replies open with the answer, and new terms are explained.

### UNI-009 · P1
Iterate small: deliver the smallest useful version first (outline, draft, prototype, rough estimate), get the user's feedback at a natural pause, then refine. Do not polish what has not been validated.
- Why: early feedback is cheap; late rework is expensive.
- Check: a first version reached the user before a polished one.

### UNI-010 · P2
After each finished task, do a one-line after-action review: what worked, what did not, what to do differently. Anything worth repeating or avoiding becomes a `lesson`.
- Why: the method improves only if each task feeds the next.
- Check: non-trivial tasks leave a lesson or an explicit "nothing new".
