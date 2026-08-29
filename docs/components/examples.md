<script setup>
import BVButtonGenericExample from '../examples/BVButtonGeneric.vue'
import BVButtonVitePressExample from '../examples/BVButtonVitePress.vue'
import BVIconButtonGenericExample from '../examples/BVIconButtonGeneric.vue'
import BVIconButtonVitePressExample from '../examples/BVIconButtonVitePress.vue'
import BVMoreButtonGenericExample from '../examples/BVMoreButtonGeneric.vue'
import BVMoreButtonVitePressExample from '../examples/BVMoreButtonVitePress.vue'
import BVPlatformButtonGenericExample from '../examples/BVPlatformButtonGeneric.vue'
import BVPlatformButtonVitePressExample from '../examples/BVPlatformButtonVitePress.vue'
</script>

# Live Examples

Every code block on this page is the literal contents of a small file under
[`docs/examples/`](https://github.com/ScottKirvan/BojuVue/tree/main/docs/examples), pulled
in through VitePress's own [code-snippet
import](https://vitepress.dev/guide/markdown#import-code-snippets) (`<<< @/path`) — not
retyped by hand. The component rendered directly below each block is that same file,
mounted as-is. There's no second copy to drift out of sync: if the snippet ever stopped
matching what's running, the render underneath it would be the proof.

::: tip Two import paths, one working example each
Every component below ships as two independent builds — a generic Vue implementation
(`@scottkirvan/bojuvue`) and a VitePress-specific one (`@scottkirvan/bojuvue/vitepress`).
They're genuinely different components sharing a name, not one wrapping the other — see
each component's own reference page for why. Each gets its own example here, using its
own real import path.
:::

## BVButton

### Generic (Vue)

<<< @/examples/BVButtonGeneric.vue{vue}

<BVButtonGenericExample />

### VitePress

<<< @/examples/BVButtonVitePress.vue{vue}

<BVButtonVitePressExample />

## BVIconButton

### Generic (Vue)

<<< @/examples/BVIconButtonGeneric.vue{vue}

<BVIconButtonGenericExample />

### VitePress

<<< @/examples/BVIconButtonVitePress.vue{vue}

<BVIconButtonVitePressExample />

## BVMoreButton

### Generic (Vue)

<<< @/examples/BVMoreButtonGeneric.vue{vue}

<BVMoreButtonGenericExample />

### VitePress

<<< @/examples/BVMoreButtonVitePress.vue{vue}

<BVMoreButtonVitePressExample />

## BVPlatformButton

This page's own `docs/public/platformButton.json` has an entry for every platform, so
both variants below link somewhere no matter which platform gets detected.

### Generic (Vue)

The generic build has no VitePress `useData()` to read a site base path from, so it
takes one as a `base` prop instead. A real Vite-built app (VitePress included) exposes
its own base at `import.meta.env.BASE_URL` — passing that through is what keeps this
example working under whatever base this site itself is deployed at, without hardcoding
a path that would only be correct here.

<<< @/examples/BVPlatformButtonGeneric.vue{vue}

<BVPlatformButtonGenericExample />

### VitePress

<<< @/examples/BVPlatformButtonVitePress.vue{vue}

<BVPlatformButtonVitePressExample />
