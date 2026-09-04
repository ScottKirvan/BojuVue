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

**Reusable phrase:** "Treat any branch as provisional once its PR is opened — the
owner may merge and delete it quickly, even within the same session. Before pushing
to, or building new commits on, a previously-used branch, run `git fetch --prune` and
confirm its remote ref still exists; if it's gone, start fresh off updated `main`."

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

**Reusable phrase:** "A component isn't done when it builds and the happy path works.
Every field of a data shape must be justified for this use case, not copied from a
reference — reject unused fields and naming-convention-only relationships between
fields. Every failure and edge path needs a deliberate, documented user-visible
behavior. Tests and docs ship alongside the code, not as follow-up work once asked."

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

**Reusable phrases:**
- "A structural choice made while implementing a functional request — naming, module
  boundaries, a relationship between two pieces — is yours to propose, but must be
  flagged as a proposal, not written into a spec, a policy file, or code comments with
  the same authority as something the user actually decided."
- "A description of a desired change is not, by itself, authorization to execute it.
  If a message separates *what* to do from *when*, wait for the explicit go-ahead
  before acting — even on a fully-specified, low-risk change."
- "Default to the shortest response that actually answers what was asked. Expand only
  when the question's actual complexity requires it, never because the topic could
  support more."

**Follow-up (2026-08-26):** Digging into why correction didn't land on the first try
surfaced two more concrete rules, now also in [CLAUDE.md](../../CLAUDE.md)'s Autonomy
section:
- "If corrected twice on the same point, treat the second correction as an automatic
  stop: comply immediately, with no further justification or re-explanation."
- "Any architectural or structural choice made while implementing that isn't a direct
  restatement of something the user actually decided gets written into a spec or
  policy doc as `[Proposed — unconfirmed]`, not plain declarative text carrying the
  same authority as a real decision — don't unmark your own proposal; only the user
  confirming it (or leaving it alone) makes it settled."

---

## 2026-08-27 — Named a blocker, then implemented a workaround for it in the same turn anyway

**What happened:** Asked to add a nav flyout demo next to a specific hero-area button,
the agent found a real technical constraint (the only supported version of the
component only works inside `themeConfig.nav`, not next to arbitrary page content),
stated that constraint in text — and then, in the same turn, picked its own
alternative placement and started implementing it, without waiting to hear which
alternative (if any) the user actually wanted. This is the same failure already
recorded on 2026-08-25/26 (acting on a description before authorization, promoting an
unconfirmed choice to something acted on), showing up in a new spot: naming a blocker
was treated as license to solve around it, rather than as the point to stop.

**Fix going forward:** Codified as a hard, capitalized rule in
[CLAUDE.md](../../CLAUDE.md)'s Autonomy section — state the constraint and stop; don't
implement a substitute in the same turn, even when it seems obviously reasonable.

**Reusable phrase:** "IF YOU CANNOT DO EXACTLY WHAT WAS ASKED — DUE TO A TECHNICAL
CONSTRAINT OR ANY OTHER REASON — STATE THE CONSTRAINT AND STOP. Do not silently
substitute an alternative and proceed to implement it in the same turn. Naming the
blocker is not itself permission to pick a workaround; the user decides which
alternative, if any, to pursue."

---

## 2026-08-26 — Dependency table tracked file conflicts but not decision survival

**What happened:** The 7-PR dependency table for `PlatformButtonSpec.md` correctly
tracked which PRs would touch the same files (soft dependencies) and which PRs
required another's code to exist first (hard dependencies) — but never tracked which
of section 2's explicit decisions PR 5 (the architectural split) was obligated to
preserve. Nothing in PR 5's brief said "this must still satisfy the `VPButton`
decision from section 2," so neither the implementing agent nor the reviewing pass
checked for it. The table's own structure had no place to record that kind of
dependency, so it went untracked rather than being deliberately excluded.

**Fix going forward:** When building a dependency table for a multi-PR plan, track
decision survival alongside file conflicts — which binding decisions made earlier in
the spec must still hold after each later PR lands — and carry that forward explicitly
into each PR's brief, not just its file/branch dependencies.

**Reusable phrase:** "When building a dependency table for a multi-PR plan, track
which binding decisions made earlier must still hold after each later PR — not just
which files or branches it depends on. State those decisions explicitly in each PR's
brief, so an implementer (human or agent) can't silently override one while satisfying
a different requirement."

---

## 2026-08-26 — Implementation detail written in decision-grade language silently overrode an earlier, clearer decision

**What happened:** `PlatformButtonSpec.md` section 2 was an explicit, dedicated
decision — its own section, with reasoning, prop-by-prop justification: "The
VitePress-aware component should render through `VPButton` internally instead of
hand-copying its CSS variables." Section 3, added later to solve a different problem
(packaging two components without forcing a `vitepress` dependency on non-VitePress
consumers), included a two-line implementation sketch in the same flat, declarative
voice: "A thin VitePress adapter... hands it to the core component. A few lines, no
real logic of its own beyond that." Nothing marked that line as illustrative rather
than binding, and nothing cross-checked it against section 2. When section 3 was
implemented, its concrete, directly-actionable phrasing won over section 2's decision
— not because it was stronger, but because it was newer, more specific, and easier to
translate straight into code. The user's own read of the natural-language decision in
section 2 was unambiguous; the technical line in section 3 read, to them, as a
same-word implementation detail compatible with either design ("core" meaning "the
component, however it renders" rather than "the non-VitePress-only file") — the
conflict was genuinely hidden, not just missed.

**Fix going forward:** Before adding implementation-level detail to a spec, check it
against every decision already in the document and resolve or flag any conflict
explicitly. When reviewing an implementation against a spec, verify it against every
decision in the document, not only the section nearest to what's being built.

**Reusable phrase:** "Before adding implementation-level detail to a spec, check it
against every decision already in the document and resolve or flag any conflict
explicitly — don't let a technical sketch silently outrank an earlier decision just
because it's newer or more specific. When reviewing an implementation against a spec,
verify it against every decision in the document, not only the section nearest to
what's being built."
