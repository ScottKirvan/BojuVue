# Contributing

This page covers adding a new component to BojuVue. Read
[Architecture](/guide/architecture) first if you haven't — the steps below assume you
know why some components have two implementations and why prop types stay inline.

## A component with no VitePress-specific needs

1. Write the `.vue` file under `src/` (e.g. `src/YourComponent.vue`) — standard SFC:
   `<script setup lang="ts">` for props/logic, `<template>` for markup, `<style
   scoped>` for CSS scoped to that component alone.
2. Make configurable text/behavior actual props, not hardcoded strings —
   `defineProps<{...}>()` with `withDefaults(...)` for sensible fallbacks. Keep the
   prop type written inline in the macro (see
   [Architecture § Where prop types live](/guide/architecture#where-prop-types-live)).
3. Extract any real logic (detection, data-shaping) into a plain `.ts` module next to
   the component, and write unit tests for it (see `src/platform.ts` /
   `src/platform.test.ts`).
4. Add one line to `src/index.ts`:
   ```ts
   export { default as YourComponent } from './YourComponent.vue'
   ```
5. Preview it: `npm run docs:dev` (from `docs/`), then use `<YourComponent />` anywhere
   in a `.md` file — it's registered globally in this repo's own `docs/` theme, so no
   import is needed here specifically.
6. Add a reference page at `docs/components/your-component.md` — copy the structure of
   an existing page (prop table, failure/edge-case behavior, a usage example) — and
   link it from `docs/components/index.md` and the sidebar in
   `docs/.vitepress/config.mts`.
7. `npm run build` at the repo root to confirm the library itself still builds clean,
   and `npm test` to run the unit suite.

## A component that needs something VitePress-specific

Worked example: `BVPlatformButton`. Write two fully independent implementations
instead of one file:

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
4. Preview via `docs/.vitepress/theme/index.ts`, which registers from
   `src/vitepress.ts` (the superset) — this exercises both the VitePress-specific
   implementation and everything re-exported from the generic one.
5. `npm run build` must still produce two separate physical files (check
   `vite.config.ts`'s `build.lib.entry`), and the generic build's output file must
   contain zero reference to `vitepress` — grep for it directly after any build that
   touches this component:
   ```sh
   npm run build
   grep -r vitepress dist/bojuvue.js
   ```
6. Add the reference page and sidebar entry as in step 6 above, and document both
   import paths on that page — see `docs/components/platform-button.md` for the
   pattern.

## Before opening a pull request

- `npm test` and `npm run build` both pass.
- Tests exist for anything with real logic, written alongside the code.
- Every failure and edge path (missing input, no match, partial match) has a
  deliberate, documented user-visible behavior — not whatever falls out of the code by
  default.
- The reference page documents every prop's default and whether it's required, and
  calls out anything deliberately not supported, with why.

See the repo's `CLAUDE.md` for the full set of engineering conventions (branching,
commit style, no-shortcuts policy) this project holds contributions to.
