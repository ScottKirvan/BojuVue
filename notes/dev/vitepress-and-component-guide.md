# VitePress Composition & Component Library Guide

Working notes on two things: how a VitePress site is actually put together (frontmatter
vs. components vs. layout overrides), and how BojuVue specifically is wired so a
component can be built once and previewed live, then eventually consumed by other
sites. Written up after digging through `lucide-icons/lucide`'s docs site as a
real-world example.

## 1. How a VitePress page is actually composed

Every `.md` file in a VitePress site is compiled as a Vue SFC. That one fact explains
almost everything else here. A page can combine three distinct layers:

**Frontmatter** — the YAML block at the top (`--- ... ---`). For a page with
`layout: home`, VitePress's own default theme reads `hero:` and `features:` and
renders its built-in hero banner and features grid from that data. This is the layer
you configure declaratively; you don't write any markup for it.

**Layout slot overrides** — VitePress's default theme exposes named "slots" inside its
built-in layout (`home-hero-image`, `home-hero-info-before`, `sidebar-nav-after`, and
others). A site can override `DefaultTheme.Layout` in `.vitepress/theme/index.ts` and
inject its own components into those specific regions without writing a whole custom
layout:

```ts
Layout() {
  return h(DefaultTheme.Layout, null, {
    'home-hero-image': () => h(HomeHeroIconsCard),
  })
}
```

Use this for small enhancements to a region VitePress's default theme already renders.

**Markdown body content** — everything below the closing `---` in a `.md` file is
regular page content. Since the file compiles as an SFC, that means a `<script setup>`
block and component tags work exactly like they would in a `.vue` file:

```md
---
layout: home
hero: { ... }
---

<script setup>
import HomePackagesSection from './.vitepress/theme/components/home/HomePackagesSection.vue'
</script>

<HomePackagesSection />
```

This is how Lucide's entire homepage below the features grid — packages strip, icon
customizer, team section — is built: three plain Vue components dropped straight into
the markdown body. Nothing about it is special VitePress config; it's just Vue.

**One caveat worth remembering from that example:** the components Lucide drops in
there aren't actually reusable — `HomePackagesSection.vue` pulls its data from a
sibling `HomePackagesSection.data.ts` that hardcodes Lucide's own package list and
framework logo paths. It's a good reference for the *composition pattern*, not for
"copy this component and it'll work with different content." A reusable equivalent
would take that data as a prop instead.

## 2. How BojuVue is wired

- `src/index.ts` is the single export barrel. Every component gets one line here:
  `export { default as ComponentName } from './ComponentName.vue'`.
- `vite.config.ts` builds `src/index.ts` in Vite library mode — ES module output,
  `vue` external (a peer dependency, not bundled), types emitted via
  `vite-plugin-dts`.
- `docs/` is a separate, independently-installed VitePress project (own
  `package.json`, own `node_modules`) that doubles as a live component preview.
  `docs/.vitepress/theme/index.ts` imports directly from `../../../src/index` — i.e.
  straight from this repo's own source, not the built/published package — and loops
  over every export, registering each one globally:

  ```ts
  for (const [name, component] of Object.entries(BojuVue)) {
    app.component(name, component)
  }
  ```

  That's why any `.md` file under `docs/` can use `<DownloadButton />` with **no
  import statement** — unlike Lucide's pattern above, which imports each component
  explicitly per page.
  This global-registration shortcut only exists inside this repo's own `docs/`; it's a
  deliberate trade for "zero-friction preview while actively building the library,"
  not something a real consuming site gets or should replicate.

- Because `docs/` imports files that physically live outside itself (in the repo-root
  `src/`), those files' own `import 'vue'` resolves relative to *their* location, not
  `docs/`'s — see `docs/.vitepress/config.mts`'s `vite.resolve.alias` for why `vue` is
  aliased explicitly there. Without it, `vue` fails to resolve unless the repo root's
  `node_modules` happens to already exist (which is exactly what caused a CI-only
  build failure — passed locally, failed in the Pages deploy, because only the deploy
  job never installs root deps).

## 3. Adding a new component (worked example: `DownloadButton`)

1. Write the `.vue` file under `src/` (e.g. `src/DownloadButton.vue`). Standard SFC:
   `<script setup lang="ts">` for props/logic, `<template>` for markup, `<style
   scoped>` for CSS scoped to that component alone.
2. Make configurable text/behavior actual props, not hardcoded strings — use
   `defineProps<{...}>()` with `withDefaults(...)` for sensible fallback values. This
   is the difference between a real reusable component and Lucide's `home/`
   components: a prop the caller can override, vs. a value baked into the file.
3. Add one line to `src/index.ts`: `export { default as DownloadButton } from
   './DownloadButton.vue'`.
4. Preview it: `cd docs && npm run docs:dev`, then use `<DownloadButton />` anywhere in
   a `.md` file — no import needed (see §2). Pass props to override defaults.
5. `npm run build` at the repo root to confirm the library itself still builds clean.

## 4. Consuming BojuVue from another (real) site

This is the workflow for an actual external repo — e.g. a different VitePress site,
not this repo's own `docs/`. It does **not** get the global-registration shortcut from
§2; that only exists here.

```
npm install @scottkirvan/bojuvue
```

Then register what you need explicitly in that site's own
`.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import { DownloadButton } from '@scottkirvan/bojuvue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DownloadButton', DownloadButton)
  },
}
```

Or, for a component only used on one page, skip global registration entirely and
import it directly in that page's markdown body (the Lucide pattern from §1):

```md
<script setup>
import { DownloadButton } from '@scottkirvan/bojuvue'
</script>

<DownloadButton />
```

Updating later is `npm update`.

**Current status (as of this writing):** `@scottkirvan/bojuvue` is not yet published —
checked the registry directly, it 404s. Publishing automation is being wired up
separately; once it's live, the first `npm install` above will actually resolve. Until
then, the only way to test consumption from another repo is `npm link` or a manual
`npm publish` from this repo.

## 5. Licensing, when borrowing a component from another open-source project

Checked this against `lucide-icons/lucide` specifically, but the reasoning generalizes:

- Read the actual license covering the file you want to borrow — don't assume the
  whole repo is one license. Check for a root `LICENSE`, but also check whether
  individual files or subdirectories carry their own header (some projects mix
  licenses per-file or per-directory, as Lucide does for a specific list of icons
  under a different license than the rest of the repo).
- ISC and MIT are both highly permissive and mutually compatible — either can sit
  inside a project licensed under the other. The practical requirement in both is the
  same: preserve the original copyright/permission notice for the code you copied.
  The clean way to do that is either a short header comment in the adapted file, or a
  single `THIRD_PARTY_NOTICES.md` listing what was borrowed from where, with the
  original license text.
- A permissive license doesn't guarantee the specific component is worth borrowing —
  check whether it's actually generic (takes props, no hardcoded content) or
  page-specific (reaches into that project's own data files). See the `base/` vs.
  `home/` distinction in §1 — the license question and the reusability question are
  independent, and both matter before copying something in.

## See also

- `notes/dev/mistakes.md` — process/workflow lessons (not licensing or architecture)
- `CLAUDE.md` — repo conventions (branching, commits, attribution)
- `README.md` — the user-facing Installation/Usage summary
