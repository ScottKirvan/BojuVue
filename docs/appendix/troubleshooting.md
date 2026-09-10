# Troubleshooting

Symptom-first entries for problems that don't point at their own cause. Growing as
real ones turn up — this isn't meant to be exhaustive on day one.

## `vitepress build` fails with `ERR_MODULE_NOT_FOUND` or `ERR_UNKNOWN_FILE_EXTENSION ".css"` pointing inside `vitepress/dist/client/theme-default`

**If:** your VitePress production build (`vitepress build docs`) dies during "building
client + server bundles", before any page renders, with one of these — the exact
message depends on your Node version, but both name a file inside VitePress's *own*
`theme-default` directory, not yours:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
  '.../node_modules/vitepress/dist/client/theme-default/without-fonts'
  imported from '.../node_modules/vitepress/dist/client/theme-default/index.js'
```

```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".css" for
  .../node_modules/vitepress/dist/client/theme-default/styles/fonts.css
```

— and your theme imports anything from `bojuvue/vitepress`. The dev server
(`vitepress dev`) works fine; only the production build fails.

**Then:** you're missing BojuVue's Vite plugin. Add it to your VitePress config:

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { bojuvue } from 'bojuvue/vite'

export default defineConfig({
  vite: { plugins: [bojuvue()] },
})
```

Vite externalizes `node_modules` dependencies by default during an SSR build, which
means BojuVue's own internal `vitepress/theme` import gets handed to Node's raw module
loader instead of Vite's resolver — and Node knows nothing about VitePress's internal
aliasing, so it fails on the first file it can't resolve. That's why the error names
VitePress's files rather than BojuVue's, and why nothing in the stack trace mentions
`bojuvue` at all. The plugin tells Vite to bundle this package through its own
resolver instead. See [Installation](/guide/installation) for the full setup step and
[#70](https://github.com/ScottKirvan/BojuVue/issues/70) for the original report.

Nothing else changes — component imports and registration stay exactly as documented.

## A component renders with no styling — no button skin, an unstyled dropdown panel, icons at raw SVG size

**If:** a component (especially [`BVMoreButton`](/components/more-button)'s dropdown
panel — see the callout on that page) looks like plain unstyled HTML instead of a
styled button or floating card, even though it's rendering and behaving correctly
(clicks work, the menu opens, links go where they should) —

**Then:** you're missing BojuVue's stylesheet import. A compiled Vue library's `<style
scoped>` blocks are extracted into a plain CSS file at build time, not auto-injected at
runtime — this is a separate, required import, not something registering the
components already covers:

```ts
import 'bojuvue/style.css'
```

Import it once, anywhere in your app's entry point. One file covers every component
from both import paths (`bojuvue` and `bojuvue/vitepress`) — one import is enough
regardless of which paths you use. See [Import the
stylesheet](/guide/installation#import-the-stylesheet) for the full setup step.

This one is easy to miss because it's partial: a component like `BVButton` or
`BVMoreButton`'s own trigger, on the `/vitepress` import path, renders through
VitePress's real `VPButton` and picks up real theme styling from VitePress itself, with
or without BojuVue's own CSS loaded — so it can look basically fine right up until you
hit something that's entirely BojuVue-authored markup, like the dropdown panel.
