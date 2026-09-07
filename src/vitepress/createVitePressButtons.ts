import type { App, Component } from 'vue'
import { VPButtonKey, BaseKey } from './injectionKeys'
import BVButton from './BVButton.vue'
import BVIconButton from './BVIconButton.vue'
import BVMoreButton from './BVMoreButton.vue'
import BVPlatformButton from './BVPlatformButton.vue'

// See #70 (github.com/ScottKirvan/BojuVue/issues/70): a real, pre-built
// `VPButton`/useData()`-derived value can't be imported at the top of a
// file inside this package's own compiled dist/vitepress.js — under Vite's
// default SSR externalization, that import bypasses Vite's own resolver
// (which is what makes `import { VPButton } from 'vitepress/theme'` work
// from a consumer's *own* theme source) and falls through to raw Node
// resolution, which fails or silently resolves to the wrong module
// entirely. The only import of `vitepress` guaranteed to go through the
// consumer's real Vite pipeline is one written in the consumer's own
// source — so that's where it has to live. createVitePressButtons() is how
// that value gets from the consumer's source into these components.
export function createVitePressButtons(deps: { VPButton: Component; base?: string }) {
  return {
    BVButton,
    BVIconButton,
    BVMoreButton,
    BVPlatformButton,
    install(app: App) {
      app.provide(VPButtonKey, deps.VPButton)
      app.provide(BaseKey, deps.base ?? '')
      app.component('BVButton', BVButton)
      app.component('BVIconButton', BVIconButton)
      app.component('BVMoreButton', BVMoreButton)
      app.component('BVPlatformButton', BVPlatformButton)
    },
  }
}
