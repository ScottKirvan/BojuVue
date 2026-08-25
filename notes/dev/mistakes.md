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

---

## 2026-08-24 — Shipped `DownloadButton` under-designed, then fixed it one review comment at a time

**What happened:** The component's first draft copied a reference implementation's
manifest shape (`ScottKirvan/QuKi-Notes`'s hand-rolled version) without questioning
whether every field belonged in a generalized, public component — an unused `version`
field made it in, and a label override was modeled as a `windowsLabel` sibling key
related to `windows` only by naming convention, not real structure (a `windowsLabel`
with no `windows` key would have meant nothing, and nothing prevented it). It also
shipped with `fallbackHref` required, always showing a generic link rather than
letting the caller hide the button when there was nothing platform-specific to offer.
No unit tests and no component documentation existed until asked for directly, despite
both being explicit requirements. Each of these was caught and fixed, but only because
the user asked about it specifically — tests, then docs, then the manifest schema,
then the default-label documentation, then the visitor-facing hide behavior — across
many review turns, instead of being addressed in the first pass.

**Fix going forward:** Treat design rigor, tests, and documentation as part of what
"done" means for a new component, not follow-up work to do once asked. Codified as a
checklist in [CLAUDE.md](../../CLAUDE.md) under "Definition of Done for a New
Component" — data shapes must be justified per-field rather than copied, every
failure/edge path needs a deliberate documented behavior, and tests/docs ship with the
code, not after.
