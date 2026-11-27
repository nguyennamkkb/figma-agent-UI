# Team mode — leading workers on the desk

Read this before the first worker of a session. `C` = `node .agentkit/desk.mjs`. Every worker's task is a desk task, so the user sees the whole team in `.desk/DESK.md` and `.desk/desk.html`.

You lead. Your job is throughput **and** quality: keep a worker busy on the next plan while a tester proves the previous one, never let two agents fight over a file, a branch or an exclusive resource, and merge only what is proven green. You coordinate; workers type code and run tests.

## Before anything
1. `C team check` — Orca found? routing valid? build/test commands set? Missing build/test → find them and `C team set build "…"`, `C team set test.command "…"`, `C team set test.exclusive simulator` (a resource only one test run may hold), `C team set leadFiles "AppRouter.swift,project.pbxproj"` (files only you edit).
2. **Ask the user once per session** in one sentence: what you will hand out, how many workers, why. After their yes: `C team allow --quote "<their words>"`. `dispatch` refuses until then.
3. Run `orca skills get orchestration` once (Orca's own lifecycle rules) if you have not this session.

## The fixed workflow: plan → task → dispatch → verify → close
1. **Plan.** Work another agent implements gets a plan file: `C plan <slug> --goal "…"`, fill Decisions, Signatures, Order (with the files of each step), Constraints, Done criteria; commit it on the main branch.
2. **Task.** One desk task per hand-off, added **before** anything runs: `C add P1 "<role>: <what>" --plan <slug> --role engineer --files a,b --deps Q-3`. Owned files must not overlap with another open task (dispatch refuses).
3. **Dispatch.** `C dispatch Q-9` picks agent/model from routing, writes the brief from the task (`.desk/plans/specs/Q-9.md` — edit it first for anything the worker must know), adds the reporting commands, starts the worker in the plan's worktree and records it. Never call `orca orchestration worker-start` yourself.
4. **End your turn.** Never wait, poll or sleep. Orca wakes you when a worker reports; then `C mail` applies every message and prints what to do next.
5. **Verify.** A report moves the task to `review`. Check the sha exists (`git -C <worktree> log -1`), read the diff against the plan, then `C done Q-9 --sha <sha> --proof "<what you checked>"`.
6. **Close.** Every task of the plan done → `C gate <slug>` → merge only if the user agreed to merges (`git merge --no-ff plan/<slug>`) → `C wt close <slug>`.

## Tiers — climb only on evidence
| Tier | Who | Where | For |
|---|---|---|---|
| T0 | you | current checkout | 1–3 files, clear |
| T1 | your harness's subagent | current checkout | reading, surveys, read-only review |
| T2 | one worker (reuse first) | current checkout or an open plan worktree | one module, several builds, long |
| T3 | engineer + tester lane | `C wt open <slug>` | several modules, needs the test gate, or runs beside another plan |
| T4 | a lead per plan | one worktree per plan | ≥2 plans in flight and your context is heavy |

Grade work L1–L4 (scope, spread, ambiguity, risk, parallelism). L4 is never dispatched: write the plan, `C split` it, dispatch the slices as L3. Climb past ~3 files, ~15 tool calls or a second red build. After **two failed rounds**: `C dispatch Q-9 --fails 2` (escalates the model) or do it yourself / ask the user. Batch small items of one module into one task. Release what has no next task; close a worktree right after its merge.

**T4 (phase B):** a plan lead is a task `--role lead` dispatched with `--keep-open` in the plan's worktree. It proposes sub-tasks with one `ask`; you `C add … --parent <lead task>` and dispatch them, so every report reaches you. Orca's default nested-worker depth (1) blocks leads from dispatching their own workers.

## Worktrees — one per plan
One name, four places: plan `.desk/plans/<date>-<slug>.md` ↔ worktree `plan-<slug>` ↔ branch `plan/<slug>` ↔ tasks `--plan <slug>`. Agents move; branches never switch.
| Moment | Command |
|---|---|
| a worker starts on a committed plan now | `C wt open <slug>` (stacked on an unmerged plan: `--base plan/<a>`) |
| tester/fixer/reviewer joins | no new worktree; same plan worktree |
| no agent will work on it soon | `C wt park <slug>` (branch kept) → later `C wt open <slug>` |
| merged | `C wt close <slug>` |
| the user drops it | `C wt drop <slug> --yes` (prints the sha to restore) |
| every wake-up and session end | `C wt tidy`, then `C wt status` and act on READY / WAITING / DIRTY / PARKED |
Two plans run together only when neither depends on the other and their files are disjoint (apart from leadFiles). At most `maxPlanWorktrees` (default 3) open; at most `maxWorkers` (default 3) workers.

## Roles
| Role | Does | Never |
|---|---|---|
| you (lead) | plans, lead-owned files, dispatch, triage, diff review, merge | delegates the final review or the merge |
| engineer / designer | code (UI for designer), build, commit in its worktree | runs tests, edits lead-owned files |
| tester | holds the lease, runs the test ladder, reports failures | edits or commits |
| fixer | reproduces one failure with a test, fixes, builds, commits | touches files outside the failure |
| writer | decided doc/string edits, keeps keys and format specifiers | edits code |
| reviewer | read-only diff review against plan + rules | edits |

**Exclusive resource** (`test.exclusive`, e.g. a simulator): exactly one tester runs tests at a time; it takes `worker Q-x lease acquire` before its first run and releases before done. `C lease show` before dispatching a tester.

## Tests — run only what the diff can reach
You choose the tests and write them into the tester's brief; the tester climbs the ladder (unit → your scoped list) and stops at the first real failure. A retest after a fix is the failing ids plus the fix's own scope. The whole slow suite only when the user asks. A list over ~40 slow tests means the plan should be split.

## Triage — every red report ends in one action
| Class | Signal | Action |
|---|---|---|
| 1 environment | no test ran: busy, killed, timeout, resource missing | check `C lease show`, reset the resource (team notes), tester reruns |
| 2 local defect | a test of code this plan touched fails, cause inside the diff | fixer task (`--role fixer --deps <tester task>`, failure block verbatim in the brief), then retest |
| 3 design gap | the fix changes a signature, behaviour or copy the plan fixed | `C wait <task> --on user` or decide; update the plan; PAUSE a parallel plan that uses it |
| 4 not this plan | fails on main too, or asserts behaviour the plan intentionally changed | record it; outdated test → fixer updates it |
Two fix rounds per plan, then stop delegating. Flaky only with evidence (green rerun on the same sha).

## Pause, resume, abort
Workers read their inbox before each new file and after every build. `C send Q-9 --subject PAUSE --body "<why>"` → the worker commits WIP and asks. Answer with `C reply Q-9 "RESUME"`, `"REBASE plan/<a> then RESUME"` or `"ABORT"`. Questions arrive through `C mail`; answer with `C reply Q-9 "…"`.

## Merge gate — all must hold
1. every task of the plan closed (`C gate <slug>` checks it), none failed;
2. a tester's green report on the branch's **current** HEAD;
3. you read the whole `git diff <main>...plan/<slug>` against the plan; every deviation fixed or recorded;
4. the branch contains main's code: rebase only when main moved by code changes (then build and retest); commits that only touch `.desk/` (your bookkeeping) need neither — `gate` knows the difference;
5. the user asked for merges — otherwise leave it merge-ready and say so.

## Keeping it honest
- `C sync --apply` catches a worker that finished without reporting; run it at session start and before telling the user what runs.
- `C fleet` lists workers and idle terminals: reuse a settled worker in the same area with `C dispatch Q-x --terminal <handle>` (it keeps its model), release the rest.
- Report to the user in their language: plans with state, tasks done/open with sha and proof, blockers and decisions. Point to `.desk/desk.html`; never paste worker transcripts.
