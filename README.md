# BojuVue 보주뷰 [![starline](https://raw.githubusercontent.com/ScottKirvan/BojuVue/refs/heads/starlines/ScottKirvan/BojuVue/starline.svg)](https://github.com/qoomon/starlines)
<div align="center">

  <img src="assets/media/logo.jpg" alt="logo" width="200" height="auto" />
    <h1><a href="https://github.com/ScottKirvan/BojuVue">ScottKirvan/BojuVue</a></h1>
  <h3>A shared Vue 3 component library for ScottKirvan's VitePress sites</h3>
  
  
<!-- Badges -->
<p>
  <a href="https://github.com/ScottKirvan/BojuVue/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/ScottKirvan/BojuVue" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/ScottKirvan/BojuVue" alt="last update" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/network/members">
    <img src="https://img.shields.io/github/forks/ScottKirvan/BojuVue" alt="forks" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/stargazers">
    <img src="https://img.shields.io/github/stars/ScottKirvan/BojuVue" alt="stars" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/issues/">
    <img src="https://img.shields.io/github/issues/ScottKirvan/BojuVue" alt="open issues" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/ScottKirvan/BojuVue.svg" alt="license" />
  </a>
  <a href="https://discord.gg/TN6XJSNK5Y">
    <!--<img src="https://img.shields.io/discord/704680098577514527?style=flat-square&label=%F0%9F%92%AC%20discord&color=00ACD7">-->
    <img src="https://img.shields.io/discord/1052011377415438346?style=flat-square&label=discord&color=00ACD7">
  </a>
</p>
   
<h4>
    <a href="https://tinyurl.com/3vf7whyd">View Demo</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/blob/main/README.md">Documentation</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/issues/new?template=feature_request.md">Request Feature</a>
  </h4>
</div>

**BojuVue** is a Vue 3 component library published to npm as [`@scottkirvan/bojuvue`](https://www.npmjs.com/package/@scottkirvan/bojuvue). It exists so that VitePress sites — this author's homepage blog and several local documentation sites — can share one set of landing-page and UX components instead of duplicating them per repo. Update this repo, bump the version, publish, and every consuming site can pull in the update with `npm update`.

## Getting Started with This Template

>[!IMPORTANT]
> **Customization Checklist** - After creating a repository from this template, customize these items:
>
> - [x] Update the project description (line 5 above and in repository settings)
> - [ ] Replace `assets/media/logo.jpg` with your project logo
> - [ ] Update or remove the "View Demo" link (line 35)
> - [ ] Update or remove the Discord badge/link (lines 28-31)
> - [ ] Choose and apply a `.gitignore` from `.github/gitignore-templates/` (see [gitignore templates](.github/gitignore-templates/))
> - [ ] Update the version in `.release-please-manifest.json` to your starting version (e.g., "0.1.0")
> - [x] Fill in the Features, Installation, and Usage sections below
> - [ ] Review and update the [Code of Conduct](CODE_OF_CONDUCT.md) contact information
> - [ ] Enable GitHub Pages in repository settings if you want a project website
> - [ ] Review and customize `CLAUDE.md` if using AI coding agents, or delete it if not
> - [ ] Remove or update this checklist section

Branches
--------
`main` is the [deployed](https://ScottKirvan.github.io/BojuVue/) branch.  The repo doesn't currently contain any other historic or dev branches.

Repo Layout
-----------
```
BojuVue
├───_layouts                     # Jekyll layouts for GitHub Pages
├───.github
│   ├───gitignore-templates      # Example .gitignore files (Unreal, Unity, Python, etc.)
│   ├───ISSUE_TEMPLATE           # Bug report and feature request templates
│   ├───release-please           # Release-Please configuration
│   ├───workflows                # GitHub Actions (release, template-init)
│   ├───FUNDING.yml              # Sponsorship configuration
│   └───PULL_REQUEST_TEMPLATE.md # PR template
├───assets
│   ├───css                      # Styling for GitHub Pages
│   └───media                    # Images and logos
├───notes                        # CHANGELOG, VERSION, TODO
├───CLAUDE.md                    # AI agent context (optional — see Key Features)
├───CODE_OF_CONDUCT.md           # Community guidelines
├───CONTRIBUTING.md              # Contribution guidelines
├───LICENSE.md                   # MIT License
└───README.md                    # This file
```

### Key Features

**GitHub Pages Support**: The `_layouts` and `assets/css` folders enable GitHub Pages rendering with a custom dark theme similar to GitHub's [Dark High Contrast](https://github.blog/changelog/2021-08-25-dark-high-contrast-theme-ga/) theme. Enable Pages in your repo settings - see [GitHub's Jekyll documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll).

**Automated Release Management**: The `.github/workflows` folder includes [Release-Please](https://github.com/googleapis/release-please) for automated versioning and CHANGELOG updates based on conventional commits.

**Template Initialization**: The `template-init.yml` workflow automatically updates repository references when you create a new repo from this template, then deletes itself.

**.gitignore Templates**: The `.github/gitignore-templates/` folder contains ready-to-use `.gitignore` files for Unreal Engine, Unity, Python, Node.js, C++, and general development. See the [templates README](.github/gitignore-templates/) for usage.

**AI Agent Context (optional)**: `CLAUDE.md` gives AI coding agents (e.g. [Claude Code](https://claude.ai/code)) a starting set of engineering standards — branching conventions, commit discipline, test-driven development, and a no-shortcuts ethos. The project name is automatically substituted on initialization. Customize it as your project evolves, or delete it if you're not using AI agents.

>[!NOTE]
> When using this template project, do not clone the tags or branches. Stick with `main` as the name of your main release branch. Change the version number in the `.release-please-manifest.json` file to the version you want to start with.
>
> Release-Please uses  [Conventional Commits](https://www.conventionalcommits.org/) with [Semantic Versioning](https://semver.org/) (version: MAJOR.MINOR.PATCH). Changes to version numbers are triggered by specific keywords in your commit messages:
> - `feat:` (new feature) will bump the MINOR version number.
> - `fix:` (bug fixes) will bump the PATCH number.
> - `feat!:` `fix!:` or any `xxx!:` (major and breaking changes) will bump the MAJOR version number.

>[!TIP]
> **Automatic Template Initialization**: When you create a new repository from this template, a GitHub Actions workflow automatically runs on your first push to update all repository references, URLs, and badges in the README with your new repository information. The workflow then deletes itself to keep your repo clean. No manual setup required!



Table of Contents
-----------------
- [Branches](#branches)
- [Repo Layout](#repo-layout)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Adding a new component](#adding-a-new-component)
- [Contributions / Contact](#contributions--contact)
- [Credits](#credits)

Features
--------
- Vue 3 + TypeScript components, built as an ES module via Vite library mode
- `vue` is a peer dependency, so consuming sites use their own Vue instance — no duplicate copies, no broken reactivity
- Every component is exported from one entry point (`src/index.ts`), so consuming a new component is a one-line import change
- The `docs/` VitePress site imports directly from `src/index.ts`/`src/vitepress.ts` and registers every exported component globally, so new components can be previewed live in a real VitePress site without publishing or `npm link`
- Some components (currently `BVPlatformButton`) ship as **two fully independent builds behind two import paths**: a generic implementation at `@scottkirvan/bojuvue`, with zero dependency on `vitepress`, and a VitePress-specific implementation at `@scottkirvan/bojuvue/vitepress`, same component name, resolving anything VitePress-specific for you. Neither component imports or renders the other — the import path is what disambiguates them. `vitepress` is an *optional* peer dependency — installing the package alone never requires it; only importing from the `/vitepress` path does.

Architecture
------------
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

Installation
------------
```
npm install @scottkirvan/bojuvue
```

Usage
-----
Import and register components in a consuming VitePress site's `.vitepress/theme/index.ts`.
For a component with a VitePress-aware build (see Features above), prefer importing it
from `@scottkirvan/bojuvue/vitepress` when your site is a VitePress site:

```ts
import DefaultTheme from 'vitepress/theme'
import { BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
import { SomeComponent } from '@scottkirvan/bojuvue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BVPlatformButton', BVPlatformButton)
    app.component('SomeComponent', SomeComponent)
  },
}
```

In a non-VitePress Vue 3 app, only the bare `@scottkirvan/bojuvue` path is available —
components without a VitePress-specific build work exactly the same way there.

Then use it in any `.md` page. Update later with `npm update`.

See the **[component reference](https://scottkirvan.github.io/BojuVue/components/)**
for every available component's props and a usage example — including, per component,
which import path(s) it's available from.

Adding a new component
-----------------------
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
it's required, and calls out anything deliberately not supported, with why. See
`CLAUDE.md` for the full set of engineering conventions this project holds
contributions to.

Contributions / Contact
-----------------------
- Please [file an issue](https://github.com/ScottKirvan/BojuVue/issues/new), or [grab a fork](https://github.com/ScottKirvan/BojuVue/fork), hack away, and submit a [pull request](https://github.com/ScottKirvan/BojuVue/pulls).
- Contact me at [linkedin.com/in/scottkirvan/](https://www.linkedin.com/in/scottkirvan/)
- You can also contact me at my [discord](https://discord.gg/TN6XJSNK5Y) server, I'm cptvideo.

Credits
-------
**[ScooterGitTemplate](https://github.com/ScottKirvan/ScooterGitTemplate) Copyright (c) (2025):** [Scott Kirvan](https://github.com/ScottKirvan)  - All rights reserved
*ScooterGitTemplate is licensed under the [MIT License](LICENSE.md).*



x

Project Link:  [BojuVue](https://github.com/ScottKirvan/BojuVue)  
[CHANGELOG](notes/CHANGELOG.md)  
[TODO](notes/TODO.md)
