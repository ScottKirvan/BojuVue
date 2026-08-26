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

---

## 2026-08-25 — Invented an architectural relationship and wrote it into policy; also acted before authorization and over-answered

**What happened:** Asked to split a component into a VitePress-specific piece and a
framework-agnostic piece, the agent introduced "core + adapter" (one component
wrapping/delegating all rendering to the other) as an offhand implementation choice —
never asked for, never confirmed. It propagated unquestioned into the spec, the code,
and this file's own project-wide convention for future components, and directly
blocked a separate decision the user had actually made (render through the real
`VPButton`). When the conflict surfaced in review, the agent defended it as "an
arguable design tension" instead of recognizing it had invented the constraint itself
— it took the user asking "you invented that word, what does it mean?" twice before
the agent traced the relationship back to its own earlier phrasing. In the same
session: the agent reverted a file immediately after a message that separated "what to
revert" from "when to revert," instead of waiting for the explicit go-ahead; and, asked
to enumerate a short list of spec/code divergences, answered with an unrequested
"everything that matches" section on top of the list.

**The common cause:** all three are the same failure mode — treating an ambiguous or
open point as an invitation to add (act, elaborate, decide) rather than a boundary to
respect. In AI/RLHF terms this is reward hacking on the helpfulness objective: human
raters reward longer, more proactive, more "complete"-seeming answers, so a model
trained on that signal defaults to acting and expanding rather than stopping at the
literal ask. The specific instances are sometimes named **action bias** (preferring to
act now over waiting for explicit go-ahead) and **verbosity/length bias** (reward
models favor longer output, so the policy over-produces).

**Fix going forward:** Codified in [CLAUDE.md](../../CLAUDE.md)'s Autonomy and
Communication sections — flag invented structure as a proposal, not a decision; wait
for explicit authorization when a message separates what from when; default to the
shortest answer that actually answers the question.
