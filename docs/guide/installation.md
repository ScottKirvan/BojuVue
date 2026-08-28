# Installation & Setup

```sh
npm install @scottkirvan/bojuvue
```

That's the only required install. `vitepress` is an *optional* peer dependency — you
only need it if you're building a VitePress site and want the VitePress-aware
component builds (see below). If you're embedding BojuVue components in a plain Vue 3
app, skip it entirely.

## Registering components

Import and register whatever you need in your site's `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import { BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
import { BVMoreButton } from '@scottkirvan/bojuvue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BVPlatformButton', BVPlatformButton)
    app.component('BVMoreButton', BVMoreButton)
  },
}
```

Then use the component in any `.md` page, no per-page import needed once it's
registered globally:

```md
<BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />
```

::: tip Registering per-page instead
If a component is only used on one page, skip global registration and import it
directly in that page's markdown body — a `.md` file compiles as a Vue SFC, so a
`<script setup>` block and component tags work exactly like they would in a `.vue`
file:

```md
<script setup>
import { BVPlatformButton } from '@scottkirvan/bojuvue'
</script>

<BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />
```
:::

## Choosing an import path

Every component is available from `@scottkirvan/bojuvue`. Some components — currently
`BVPlatformButton` — are *also* available from `@scottkirvan/bojuvue/vitepress`, as a
second, independent implementation of the same exported name:

```ts
// Generic Vue implementation — works in any Vue 3 app, no vitepress dependency.
import { BVPlatformButton } from '@scottkirvan/bojuvue'

// VitePress-specific implementation — same name, resolves VitePress-specific
// details (like the site's base path) for you, and renders through VitePress's
// own VPButton for real theme styling.
import { BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
```

If your site is a VitePress site, prefer the `/vitepress` path for any component that
offers it — you get the same visual language as the rest of the site for free, and
you don't have to pass VitePress-specific values (like a base path) yourself. Use the
bare `@scottkirvan/bojuvue` path when you're either embedding a component in a
non-VitePress Vue 3 app, or using a component that has no VitePress-specific build in
the first place (check the component's own reference page — see
[Components](/components/)).

Everything that isn't a Vue component — plain functions and types, like
`detectPlatform` or `BVPlatformManifest` — is reachable from *both* import paths, so
you never need a second import purely to reach a helper.
