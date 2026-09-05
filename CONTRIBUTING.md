# Contributing to BojuVue

First off, thank you for considering contributing to BojuVue!

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible using our bug report template.

**Guidelines for bug reports:**
- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what you expected to see
- Include screenshots if applicable
- Note your environment (OS, version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, use our feature request template and include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Examples of how the feature would be used
- Why this enhancement would be useful

### Pull Requests

**Before submitting a pull request:**

1. Fork the repository and create a descriptive branch from `main` (e.g. `fix/login-timeout`, `feat/export-csv` — no random suffixes)
2. Write tests alongside any new code; bug fixes require a failing test that reproduces the bug, then the fix
3. Run `npm test` and `npm run build` — both must pass before opening a PR
4. Follow the commit message conventions below
5. Update documentation alongside the code — don't leave it as a follow-up

**Commit Message Convention:**

We use [Conventional Commits](https://www.conventionalcommits.org/) with [Semantic Versioning](https://semver.org/):

- `feat:` - New features (bumps MINOR version)
- `fix:` - Bug fixes (bumps PATCH version)
- `feat!:` or `fix!:` - Breaking changes (bumps MAJOR version)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add BVTooltip component
fix: platform detection misidentifies iPadOS as macOS
docs: add usage example for BVMoreButton
feat!: rename manifestUrl prop to manifest-url
```

### Pull Request Process

1. Update docs alongside the code — component reference pages live in `docs/components/`
2. CHANGELOG.md is updated automatically by Release Please from your commit messages
3. All CI checks must pass before merging
4. The PR will be merged once approved by a maintainer

## Development Setup

```sh
# Install root dependencies (library build + test)
npm install

# Run the test suite
npm test

# Build the library (also runs the type-check)
npm run build

# Install docs dependencies and start the live preview
cd docs && npm install
npm run docs:dev
```

The docs preview imports directly from `src/` (not the built package), so a new
component shows up in a real VitePress site the moment you write it — no publish or
`npm link` needed.

## Project Structure

```
BojuVue/
├── .github/
│   ├── gitignore-templates/  # .gitignore templates (not used by this repo's own build)
│   ├── release-please/       # Release-Please config — automated version bumps + CHANGELOG
│   └── workflows/            # CI (test + build), docs deploy, release
├── assets/
│   └── media/                # Logo
├── docs/                     # VitePress site — consumer-facing docs, deployed to GitHub Pages
│   ├── .vitepress/           # VitePress config and theme (imports directly from src/)
│   ├── components/           # Per-component reference pages (props, examples)
│   ├── guide/                # Installation and introduction
│   └── public/               # Static assets served by the docs site
├── notes/
│   └── dev/                  # Design specs and working notes
├── src/                      # Library source
│   ├── vitepress/            # VitePress-specific component implementations
│   ├── index.ts              # Generic entry point → dist/bojuvue.js
│   └── vitepress.ts          # VitePress entry point → dist/vitepress.js
├── CLAUDE.md                 # AI agent context
├── CONTRIBUTING.md
├── LICENSE.md
├── README.md
├── package.json
└── vite.config.ts            # Library build config (two entries) + vitest config
```

Issue and PR templates aren't in this repo's `.github/` — they're inherited from the
`ScottKirvan/.github` org repo via GitHub's community health file fallback.

## Testing

`npm test` runs the full suite via vitest. Tests live alongside source files — e.g.
`src/platform.test.ts` next to `src/platform.ts`.

- New code requires new tests. Bug fixes require a failing test that reproduces the
  bug before the fix lands.
- Extract logic worth testing into plain `.ts` modules rather than testing it by
  mounting a component — see `src/platform.ts` for the pattern.
- `npm run build` also runs the type-check (`vue-tsc -b`). Run both before opening a PR.

## Architecture

The bit that shapes everything else in this repo: **the generic build must have zero
dependency on `vitepress`, anywhere in its module graph.** Everything below exists to
make that hold under a real bundler, not just in theory.

**Two entry points, two physical files.** `vite.config.ts` builds library mode with two
separate entries — `src/index.ts` → `dist/bojuvue.js` (published as `.`) and
`src/vitepress.ts` → `dist/vitepress.js` (published as `./vitepress`). `src/vitepress.ts`
re-exports everything `src/index.ts` has, plus its own VitePress-specific component
implementations, under the same names. This has to be two genuinely separate output
files, not two exports of one bundle — if both compiled into a single file, importing
only the generic path would still execute a top-level `import 'vitepress'` somewhere in
it. Verify this invariant after touching anything under `src/` by building and grepping
the output:
```sh
npm run build
grep -r vitepress dist/bojuvue.js   # should print nothing
```

**Two independent implementations per VitePress-aware component.** A component that
needs anything VitePress-specific (site data, the router, VitePress's own `VPButton`)
doesn't take a runtime "VitePress mode" flag — it gets two fully independent
implementations sharing one exported name, disambiguated by import path:
`src/ComponentName.vue` (plain props, no `vitepress` import, exported from
`src/index.ts`) and `src/vitepress/ComponentName.vue` (calls whatever VitePress
composables it needs itself, exported from `src/vitepress.ts`). Neither imports or
renders the other. `BVPlatformButton` is the worked example — see
`src/BVPlatformButton.vue` and `src/vitepress/BVPlatformButton.vue`. Logic genuinely
shared between the two (e.g. manifest-fetch orchestration) lives in a plain utility
module both call independently — see `src/useManifestFetch.ts` — not in one component
owning the other's rendering.

**Prop types stay inline in `defineProps<T>()`.** `@vue/compiler-sfc` resolving a
`defineProps<T>()` type imported from another module needs the `typescript` package
loadable from wherever the `.vue` file is compiled — which breaks under `docs/`'s
cross-directory source build (next point) whenever the repo root's `node_modules` isn't
present. Keep the type written out inline in the macro itself. A type used only for a
public, non-macro export (`BVPlatformButtonProps` in `src/BVPlatformButton.types.ts`,
for instance) is fine to keep in its own file — the constraint is specifically about the
`defineProps<T>()` type position.

**Real logic lives outside the `.vue` file.** Components with real logic — detection,
data-shaping, anything beyond pure rendering — extract that logic into a plain `.ts`
module (`src/platform.ts` next to `BVPlatformButton.vue`) rather than keeping it inline
in `<script setup>`. Much easier to unit test a plain function than to mount a component
or mock Vue-specific APIs to exercise the same branch.

**`docs/` previews live source, not the published package.** `docs/` is a separate,
independently-installed VitePress project. `docs/.vitepress/theme/index.ts` imports
directly from `../../../src/vitepress` — this repo's own VitePress-entry *source* — and
registers every export globally, so a new component shows up in a real VitePress site
the moment you write it (`npm run docs:dev`), no publish or `npm link` needed. That
import crosses a directory boundary `docs/`'s own dependency resolution doesn't know
about: files under repo-root `src/` still `import 'vue'`/`import 'vitepress'`
themselves, which would otherwise resolve relative to `src/`'s own location. A scoped
Vite plugin in `docs/.vitepress/config.mts` fixes this by redirecting any such import,
when the importing file is physically under repo-root `src/`, through Vite's normal
resolver as if it came from inside `docs/` instead. Verify a change here by temporarily
renaming the repo root's `node_modules` out of the way and confirming `npm run
docs:build` (from `docs/`) still succeeds — `docs/`'s deploy job never installs the repo
root's dependencies, so this has to work without them.

**Typechecking and build.** `npm run build` runs `vue-tsc -b` (typecheck, via composite
TypeScript project references) then `vite build` (emits `dist/`). There's no separate
typecheck-only script — `vue-tsc -b --noEmit` isn't valid with composite project
references, so `build` is the only way to typecheck the library.

## Adding a new component

Read [Architecture](#architecture) first if you haven't — the steps below assume you
know why some components have two implementations and why prop types stay inline.

**A component with no VitePress-specific needs:**

1. Write the `.vue` file under `src/` (e.g. `src/YourComponent.vue`) — standard SFC:
   `<script setup lang="ts">` for props/logic, `<template>` for markup, `<style
   scoped>` for CSS scoped to that component alone.
2. Make configurable text/behavior actual props, not hardcoded strings —
   `defineProps<{...}>()` with `withDefaults(...)` for sensible fallbacks. Keep the prop
   type written inline in the macro.
3. Extract any real logic (detection, data-shaping) into a plain `.ts` module next to
   the component, and write unit tests for it (see `src/platform.ts` /
   `src/platform.test.ts`).
4. Add one line to `src/index.ts`: `export { default as YourComponent } from
   './YourComponent.vue'`.
5. Preview it: `npm run docs:dev` (from `docs/`), then use `<YourComponent />` anywhere
   in a `.md` file — it's registered globally in this repo's own `docs/` theme, so no
   import is needed there.
6. Add a reference page at `docs/components/your-component.md` (props table + usage
   example — copy the structure of an existing page) and link it from
   `docs/components/index.md` and the sidebar in `docs/.vitepress/config.mts`.
7. `npm run build` at the repo root to confirm the library itself still builds clean,
   and `npm test` to run the unit suite.

**A component that needs something VitePress-specific** (worked example:
`BVPlatformButton`) gets two fully independent implementations instead of one file:

1. The framework-agnostic logic and markup goes in `src/YourComponent.vue` — plain
   props in (including anything the VitePress-specific implementation would otherwise
   read from a VitePress composable — e.g. a `base` prop standing in for
   `useData().site.value.base`, resolved by that other implementation itself, not read
   directly here). No `vitepress` import anywhere in this file.
2. `src/vitepress/YourComponent.vue` calls whatever VitePress composables it needs
   itself and implements its own rendering. It does not import or render
   `src/YourComponent.vue`. Any logic genuinely shared between the two (like fetch
   orchestration — see `useManifestFetch`) lives in a plain utility module both call
   independently, not in one component owning the other's rendering.
3. `src/index.ts` exports the generic implementation; `src/vitepress.ts` re-exports
   everything `src/index.ts` has, plus exports the VitePress-specific implementation —
   both under the same name, `YourComponent`. The import path is what disambiguates
   them.
4. Preview via `docs/.vitepress/theme/index.ts`, which registers from `src/vitepress.ts`
   (the superset) — this exercises both the VitePress-specific implementation and
   everything re-exported from the generic one.
5. `npm run build` must still produce two separate physical files (check
   `vite.config.ts`'s `build.lib.entry`), and the generic build's output file must
   contain zero reference to `vitepress` — grep for it directly after any build that
   touches this component (see [Architecture](#architecture)).
6. Add the reference page and sidebar entry as in step 6 above, and document both import
   paths on that page — see `docs/components/platform-button.md` for the pattern.

**Before opening a pull request:** `npm test` and `npm run build` both pass; tests exist
for anything with real logic; every failure and edge path has a deliberate, documented
user-visible behavior; the reference page documents every prop's default and whether
it's required, and calls out anything deliberately not supported, with why.

## Questions?

Feel free to open an issue for questions or reach out via:
- [LinkedIn](https://www.linkedin.com/in/scottkirvan/)
- [Discord](https://discord.gg/TN6XJSNK5Y)

Thank you for your contributions!
