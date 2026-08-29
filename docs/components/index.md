# Components

Install the package, then import whichever components you need:

```
npm install @scottkirvan/bojuvue
```

Some components have a VitePress-aware build, available from a second import path —
see each component's own page for whether it does and what the difference is:

```ts
// Generic Vue implementation — works in any Vue 3 app, no vitepress dependency
import { BVPlatformButton } from '@scottkirvan/bojuvue'

// VitePress-specific implementation — same component name, resolves
// VitePress-specific details (like the site's base path) for you
import { BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
```

See each component's page for its props, a usage example, and which import path(s) it's
available from. For how to register a component in your own app — a plain Vue 3 app or
a VitePress site — see [Installation & Setup](/guide/installation). For every component
rendered live from both import paths side by side, see [Live Examples](./examples).

::: info About the examples on this site
This site is itself a VitePress site, so every live Demo and the first code sample on
a component's page run through the `/vitepress` import path where a component has
one — that's what's actually rendering on the page you're looking at. Building a
non-VitePress Vue 3 app instead? Use the bare `@scottkirvan/bojuvue` import — each
component's own reference page includes that usage too.
:::

## Available components

| Component | Description |
| --- | --- |
| [BVButton](./button) | The minimal button primitive — exactly VitePress's own `VPButton` prop shape, working outside VitePress too. |
| [BVIconButton](./icon-button) | `BVButton` plus an optional icon, either alongside its label or as a fixed-size icon-only trigger. |
| [BVMoreButton](./more-button) | A small button that opens a dropdown menu of secondary outbound links next to a primary CTA. |
| [BVPlatformButton](./platform-button) | Detects the visitor's platform and links to the matching download from a JSON manifest. |

See also: [Live Examples](./examples) — every component above, rendered from both import
paths, with the exact source that's rendering it shown alongside.
