# Components

Every component below is exported from `@scottkirvan/bojuvue`'s single entry point
(`src/index.ts`). Install the package, then import whichever components you need:

```
npm install @scottkirvan/bojuvue
```

```ts
import { BVPlatformButton } from '@scottkirvan/bojuvue'
```

See each component's page for its props and a usage example. For how to register a
component in your own VitePress site (globally via `enhanceApp`, or per-page in a
`.md` file's markdown body), see the root [README](https://github.com/ScottKirvan/BojuVue#usage).

## Available components

| Component | Description |
| --- | --- |
| [BVPlatformButton](./platform-button) | Detects the visitor's platform and links to the matching download from a JSON manifest. |
