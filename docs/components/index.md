# Components

Install the package, then import whichever components you need:

```
npm install @scottkirvan/bojuvue
```

Some components have a VitePress-aware build, available from a second import path —
see each component's own page for whether it does and what the difference is:

```ts
// Framework-agnostic — works in any Vue 3 app, no vitepress dependency
import { BVPlatformButton } from '@scottkirvan/bojuvue'

// VitePress adapter — same component name, resolves VitePress-specific
// details (like the site's base path) for you
import { BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
```

See each component's page for its props and a usage example. For how to register a
component in your own VitePress site (globally via `enhanceApp`, or per-page in a
`.md` file's markdown body), see the root [README](https://github.com/ScottKirvan/BojuVue#usage).

## Available components

| Component | Import path(s) | Description |
| --- | --- | --- |
| [BVPlatformButton](./platform-button) | `@scottkirvan/bojuvue`, `@scottkirvan/bojuvue/vitepress` | Detects the visitor's platform and links to the matching download from a JSON manifest. |
