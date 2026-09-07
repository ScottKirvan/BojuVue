# Installation & Setup

```sh
npm install bojuvue
```

That's the only required install. `vitepress` is an *optional* peer dependency — you
only need it if you're building a VitePress site and want the VitePress-aware
component builds (see below). If you're embedding BojuVue components in a plain Vue 3
app, skip it entirely — everything below works the same either way.

## Import the stylesheet

A compiled Vue library's `<style scoped>` blocks are extracted into a plain CSS file
at build time, not auto-injected at runtime the way they are in this docs site's own
dev server (which compiles component source directly). Import it once, anywhere in
your app's entry point:

```ts
import 'bojuvue/style.css'
```

One file covers every component from *both* import paths (`bojuvue` and
`bojuvue/vitepress`) — importing it once is enough regardless of which paths you use.
Skipping this step doesn't error; components just render with browser-default
styling instead — no button skin, no dropdown panel background/border/shadow, icons
at their raw SVG size instead of scaled and positioned. Easy to miss until you look
closely, so it's worth double-checking this is in place if a component looks
unstyled.

## Registering components

Every component works as an ordinary Vue 3 component — register it however you
already register components in your app:

```ts
// main.ts (or wherever you create your Vue app)
import { createApp } from 'vue'
import { BVPlatformButton, BVMoreButton } from 'bojuvue'
import App from './App.vue'

const app = createApp(App)
app.component('BVPlatformButton', BVPlatformButton)
app.component('BVMoreButton', BVMoreButton)
app.mount('#app')
```

Or register it only where it's used, no global registration needed:

```vue
<script setup>
import { BVPlatformButton } from 'bojuvue'
</script>

<template>
  <BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />
</template>
```

### In a VitePress site

VitePress sites wire things up in `.vitepress/theme/index.ts` instead of `main.ts`,
from VitePress's `enhanceApp` hook. Prefer importing from `bojuvue/vitepress` here
(see [Choosing an import path](#choosing-an-import-path) below) — doing so requires
one extra setup call; see [VitePress plugin setup](#vitepress-plugin-setup)
immediately below for why:

```ts
import DefaultTheme from 'vitepress/theme'
import { VPButton } from 'vitepress/theme'
import { useData } from 'vitepress'
import { createVitePressButtons } from 'bojuvue/vitepress'
import { BVMoreButton } from 'bojuvue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // useData() needs a component setup context — enhanceApp's callback
    // body isn't one, so runWithContext() bridges that.
    const base = app.runWithContext(() => useData().site.value.base)
    app.use(createVitePressButtons({ VPButton, base }))
    app.component('BVMoreButton', BVMoreButton)
  },
}
```

## VitePress plugin setup

The `/vitepress` variants of `BVButton`, `BVIconButton`, `BVMoreButton`, and
`BVPlatformButton` need `createVitePressButtons()` — a plain `import { BVButton } from
'bojuvue/vitepress'` isn't enough, and using one without the plugin installed throws
immediately (with a message pointing back here) rather than rendering with broken or
missing styling.

**Why:** these four components need VitePress's real `VPButton` component to render
through, for real theme styling. Getting it via a top-level `import { VPButton } from
'vitepress/theme'` *inside this package's own compiled output* works fine in
development, but breaks the moment a real VitePress site does a **production SSR
build** — Vite's default behavior externalizes third-party `node_modules` dependencies
during that build, and an externalized import bypasses Vite's own module resolution
entirely, falling through to Node's raw resolver instead. Node has no idea about
VitePress's internal aliasing for that import, and either fails outright or silently
resolves to the wrong module. This is invisible in most local dev/build testing and
only shows up in a full VitePress SSR build — see
[#70](https://github.com/ScottKirvan/BojuVue/issues/70) for the exact failure modes
this produced. The only import of `vitepress` guaranteed to go through your site's
real Vite pipeline is one written in *your own* source — never one buried inside a
pre-built third-party package — so that's where `VPButton` has to come from.

`createVitePressButtons({ VPButton, base? })` takes it from there and `app.use()`s the
result, which both registers all four components and makes `VPButton` (and, if given,
your site's `base` path) available to them internally. `base` is optional — omit it
unless your site is deployed under a subpath, since it's only used by
`BVPlatformButton` to resolve a site-relative `manifestUrl` correctly.

Call this once, in `enhanceApp` — after that, both global registration and the
"Registering per-page instead" pattern above work exactly as documented, since every
page in a VitePress site shares the one `app` instance `enhanceApp` runs against.

Then use the component in any `.md` page, no per-page import needed once it's
registered globally:

```md
<BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />
```

::: tip Registering per-page instead
If a component is only used on one page, skip global registration and import it
directly in that page's markdown body — a `.md` file compiles as a Vue SFC (VitePress-
specific), so a `<script setup>` block and component tags work exactly like they would
in a `.vue` file:

```md
<script setup>
import { BVPlatformButton } from 'bojuvue'
</script>

<BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />
```
:::

## Choosing an import path

Every component is available from `bojuvue`. Some components — currently
`BVPlatformButton` — are *also* available from `bojuvue/vitepress`, as a
second, independent implementation of the same exported name:

```ts
// Generic Vue implementation — works in any Vue 3 app, no vitepress dependency.
import { BVPlatformButton } from 'bojuvue'

// VitePress-specific implementation — same name, resolves VitePress-specific
// details (like the site's base path) for you, and renders through VitePress's
// own VPButton for real theme styling.
import { BVPlatformButton } from 'bojuvue/vitepress'
```

If your site is a VitePress site, prefer the `/vitepress` path for any component that
offers it — you get the same visual language as the rest of the site for free, and
you don't have to pass VitePress-specific values (like a base path) yourself. Use the
bare `bojuvue` path when you're either embedding a component in a
non-VitePress Vue 3 app, or using a component that has no VitePress-specific build in
the first place (check the component's own reference page — see
[Components](/components/)).

Everything that isn't a Vue component — plain functions and types, like
`detectPlatform` or `BVPlatformManifest` — is reachable from *both* import paths, so
you never need a second import purely to reach a helper.
