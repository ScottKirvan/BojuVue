# Dev Workflow Mistakes

This is not a blame log. It's a running record of process/workflow slips — mine or an
agent's — worth remembering, so the same mistake doesn't get repeated. Each entry
should be concrete enough to recognize the pattern next time, and say what changes
going forward.

---

## 2026-08-24 — Reused a branch after its PR was merged and deleted

**What happened:** PR #1 (`feat/vue-component-library-scaffold`) was merged and GitHub
auto-deleted the remote branch. The agent kept committing new work to the identically
named local branch without checking whether its remote still existed, producing an
unpushed commit with no PR to attach it to.

**Fix going forward:** Before pushing to, or building new commits on, a previously-used
branch, run `git fetch --prune` and confirm the remote ref still exists. Treat any
branch as provisional once its PR has been opened — it may be gone by the next session,
or even later in the same one. Codified in [CLAUDE.md](../../CLAUDE.md).
