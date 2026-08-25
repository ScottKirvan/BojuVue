# CLAUDE.md — BojuVue

## Keeping This File Current

This file is the primary context for any agent working in this repo — keep it accurate
as the project evolves. When you learn what the project is, add a brief description at
the top. As key files, build commands, and architectural decisions emerge, record them
here so future sessions start with full context rather than re-deriving it.

Update this file in the same commit as the work it documents.

## Project Overview

BojuVue is a Vue 3 + TypeScript component library published to npm as
`@scottkirvan/bojuvue`. It's consumed by multiple VitePress sites (a homepage blog and
several local documentation sites) that need shared landing-page/UX components instead
of duplicating them per repo.

- `src/index.ts` — the single entry point; every component is re-exported from here.
- `vite.config.ts` — Vite library-mode build (ES module output, `vue` and `vitepress`
  external as peer dependencies, types emitted via `vite-plugin-dts`). Also holds the
  `test` config (vitest, jsdom environment) — no separate vitest config file.
- Components with real logic (detection, data-shaping, anything beyond pure rendering)
  should have that logic extracted into a plain `.ts` module (see `src/platform.ts`)
  rather than living inline in the `.vue` file's `<script setup>` — much easier to unit
  test without mounting a component or mocking Vue-specific APIs. The `.vue` file stays
  a thin wiring shell around it. `npm test` runs the suite (vitest); tests must be
  written alongside all new code, per the Working Conventions below.
- `docs/` — a separate VitePress project (its own `package.json`/`node_modules`) that
  both serves as this library's demo site and doubles as a live component preview:
  `docs/.vitepress/theme/index.ts` imports directly from `../../../src/index` and
  registers every exported component globally, so a new component can be seen in a
  real VitePress site (`npm run docs:dev` from `docs/`) without publishing or
  `npm link`.
- `docs/components/` — the hand-written API reference (props table + usage example per
  component), linked from the sidebar in `docs/.vitepress/config.mts`. Every new
  component needs a page here alongside its code and tests, per the README's "Adding a
  new component" steps — don't let this drift out of sync with `src/index.ts`'s
  exports.
- Any component under `src/` that imports `vue` or `vitepress` needs those to resolve
  correctly when `docs/` builds it — but `docs/`'s deploy job never installs the repo
  root's dependencies, and those imports are physically outside `docs/`, so plain
  resolution (or a naive path alias) breaks in CI even when it works locally. Fixed via
  a scoped Vite plugin in `docs/.vitepress/config.mts`: when the importing file is
  under repo-root `src/`, resolution is redirected through Vite's normal resolver as if
  the import came from inside `docs/` instead — so it goes through `vitepress`'s real
  `package.json` exports map rather than a hand-maintained guess at it. Verify any
  change here by temporarily renaming root `node_modules` out of the way and confirming
  `docs:build` (from `docs/`) still succeeds.
- Root `npm run build` runs `vue-tsc -b` (typecheck, via composite project
  references) then `vite build` (emits `dist/`). There's no separate typecheck-only
  script — `vue-tsc -b --noEmit` isn't valid with composite project references, so
  `build` is the only way to type-check.
- `.github/workflows/ci.yml` runs `npm test` then `npm run build` on push/PR.

## Working Conventions

- Never commit or push directly to `main`. Always branch first, then PR.
- Branch names must describe the work (e.g. `fix/login-timeout`, `feat/export-csv`).
  No random characters, UUIDs, or generated suffixes to ensure uniqueness — if a name
  is already taken, pick a more specific descriptive name instead.
- Treat any branch as provisional once its PR is opened — the owner merges and deletes
  branches quickly, often within the same session. Before pushing to, or building new
  commits on, a previously-used branch, run `git fetch --prune` and confirm its remote
  ref still exists. If it's gone, start fresh off updated `main` rather than continuing
  on the stale local branch. See `notes/dev/mistakes.md` for the incident that prompted
  this.
- After `git fetch --prune` shows a local branch's remote is gone (merged and deleted),
  delete the local branch too rather than leaving it around — check its commits are
  actually reflected in `main` first (they will be, post-merge) before `git branch -D`.
- If a branch name is pre-assigned by tooling (a hosted agent session, a CI runner)
  rather than chosen by you, verify it against this convention before the first push.
  Rename locally (`git branch -m <name>`) if it doesn't match — being handed a name
  isn't an exemption from the rule.
- One concern per branch and PR. If work naturally splits into independent problems,
  split the branches too — resist bundling unrelated changes into one PR.
- Conventional commits: `feat:` / `fix:` / `docs:` / `chore:` / `refactor:` / `test:`.
  Breaking: `feat!:`.
- `feat:` is for genuinely new user-facing capabilities only. Bug fixes and corrections
  use `fix:`, even when they close a tracked issue.
- Unit tests must be written alongside all new code. All bug fixes require red/green
  tests — a failing test that reproduces the bug, then the fix that makes it pass.
- CI, lint, and formatting must all pass before committing or opening a PR. Discover
  the project's commands from the CI config, `package.json`, `Makefile`, or equivalent
  — do not assume they match another project's toolchain.
- Prefer narrow, localised changes. Favour modularity that contains the blast radius
  of future edits — a fix or feature should not require touching unrelated parts of
  the codebase. If it does, that's a design signal worth surfacing.
- Refactoring is a first-class activity, not something to defer. Improve structure as
  you go rather than accumulating technical debt for a later pass.
- When working in unfamiliar domain territory, prefer primary sources — official docs,
  specs, RFCs — over general knowledge. Flag domain uncertainty explicitly rather than
  proceeding on an assumption.
- Default to writing no comments. Add one only when the *why* is non-obvious — a
  hidden constraint, a subtle invariant, a workaround for a specific bug. If code is
  hard to understand, the fix is clearer naming and structure, not a comment explaining
  what it does.

## Definition of Done for a New Component

A component isn't done when it builds and the happy path works. Before presenting one
as finished:

- **The data shape is designed, not copied.** If modeling this on an existing or
  reference implementation, re-justify every field for *this* use case instead of
  carrying it over by default. An unused field, or one whose relationship to another
  field is only a naming convention rather than real structure (e.g. a `fooLabel` key
  that only means something when a `foo` key also happens to exist), is a design
  smell to fix at design time — not a detail to patch after review points it out.
  Prefer shapes that make invalid states hard to express.
- **Every failure and edge path is enumerated, and its user-visible behavior is a
  deliberate choice** — not whatever falls out of the code by default. What does a
  user see if a required input never arrives? If nothing matches? If something
  partially matches? Decide each one on purpose, and document the decision.
- **Tests exist for anything with real logic, written alongside the code** — not
  after being asked. Extract logic worth testing into plain, testable functions
  rather than mounting a component to cover it (see `src/platform.ts` next to
  `DownloadButton.vue`).
- **Docs exist alongside the code, not as a follow-up:** every prop's default and
  whether it's required, every field of any data schema and why it's shaped that way,
  what a user actually experiences in each failure/edge case (not just that a
  fallback "exists"), and an explicit callout for anything considered and
  deliberately not supported, with why.

The bar is "a stranger, with neither of us in the room, could use this correctly" —
not "the build passes." See `notes/dev/mistakes.md` for the incident that prompted
writing this down.

## No Shortcuts

Nothing is deferred without explicit permission from the user. A known issue is still
a bug — do not mark it "won't fix", "by design", or "out of scope" unilaterally.

If a library or package cannot meet the stated requirements, the answer is to find an
alternative or do the work from first principles — not to defer the requirement or
revise it to fit the limitation. The requirements define what the project needs; the
implementation serves the requirements, not the other way around.

## Communication

Ask questions in natural language. Never use a multiple choice / structured question
tool — including Claude Code's `AskUserQuestion` tool — if clarification is needed,
just ask directly in plain text. This is a project-wide preference, not a
per-session one: some interfaces render binned/multiple-choice questions poorly,
and forcing a question into fixed options loses the nuance an open question
would surface. Standard engineering practice is to ask a real question and read
a real answer, not to pick from a menu.

## Autonomy

Make implementation decisions independently — don't ask permission for technical
choices within the stated requirements. Escalate only when something would change
scope, defer a requirement, or contradict what the user has described as the goal.

## Attribution

No attribution of any kind in commit messages, PR bodies, or issue text — no
"Generated with", "Co-Authored-By", "Created by Claude", or any AI/tool credit lines.

**Verify by reading the repo, not from memory.** Some git hosting integrations inject
a footer server-side even into a request that omitted one — treat that as expected
behavior, not a surprise. After every commit and after every PR create/update, re-read
the actual result and strip any attribution found, regardless of source:
- Run `git log` and read the actual commit messages
- Re-fetch and read the actual PR body text
- Remove any attribution found, regardless of source

A commit or PR is not finished until this read-back check has run — don't rely on what
you wrote, check what actually landed.

## GitHub Issues and PRs

Issue and PR templates live in `ScottKirvan/.github` (or your org's equivalent) and
apply to this repo automatically via GitHub's community health file fallback.

- Bug reports → `[BUG]` title prefix, `bug_report.md` sections
- Feature requests → `[FEATURE]` title prefix, `feature_request.md` sections
- General → `[GENERAL]` title prefix, `general_report.md` sections
- PRs → fill all checklist sections; no attribution anywhere in the body

Before creating any issue: check for duplicates first — `gh issue list --state open
--limit 100` where the `gh` CLI is available, or the equivalent GitHub search/list
tool (e.g. an MCP GitHub server's `search_issues`/`list_issues`) in hosted sessions
that don't have `gh`. Don't skip the check just because the literal command doesn't
apply in a given environment.
Create issues only when explicitly asked — don't preemptively file future work.

## Sub-Agent Workflow

When using sub-agents for implementation:

- Brief sub-agents on **what** to build, not **how** — implementation decisions belong
  to the sub-agent, which serves as an independent second opinion on the approach.
- Sub-agents follow all conventions in this file except they do not create PRs.
- After a sub-agent completes, review its diff and tests before creating the PR.
  This review is a genuine code review, not a compliance check — evaluate correctness,
  requirement alignment, and test quality independently.
- Simple issues found in review may be fixed directly. Significant deviations from the
  stated requirements or complex problems go back to the sub-agent rather than being
  patched over.
- Create the PR only after review passes.
