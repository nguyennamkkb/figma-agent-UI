# Plans
One file per plan that a worker or a team will build: `YYYYMMDD-<slug>.md` (`node .agentkit/desk.mjs plan <slug> --goal "…"`).
The same slug names the worktree `plan-<slug>`, the branch `plan/<slug>` and the tasks (`--plan <slug>`).
Worker briefs live in `specs/<task id>.md`; what was actually sent (`*.sent.md`) is git-ignored.
