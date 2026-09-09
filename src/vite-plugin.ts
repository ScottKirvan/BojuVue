import type { Plugin } from 'vite'

// Fixes #70: a consuming VitePress site's production SSR build externalizes
// `bojuvue` by default (Vite's standard behavior for any node_modules
// dependency), which means the internal `import { VPButton } from
// 'vitepress/theme'` inside `bojuvue/vitepress` gets resolved by Node's raw
// ESM loader instead of Vite's own resolver — Node has no idea about
// VitePress's internal conditional exports/aliasing, so that import fails.
// `ssr.noExternal` tells Vite to bundle `bojuvue` through its own resolver
// instead, the same way the consumer's own theme source already resolves an
// identical `vitepress/theme` import successfully. VitePress passes whatever
// the consumer's own `vite.plugins` config contains into both its client and
// SSR builds, so this plugin's `config()` hook reaches the SSR pass without
// the consumer needing to know `ssr.noExternal` exists.
export function bojuvue(): Plugin {
  return {
    name: 'bojuvue',
    config: () => ({ ssr: { noExternal: ['bojuvue'] } }),
  }
}
