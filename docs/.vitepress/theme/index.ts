import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// Imports the vitepress-specific *source* entry (not the published
// package's `./vitepress` subpath) so this site keeps live-previewing
// components straight from this repo's own source, the same way it always
// has — see notes/dev/vitepress-and-component-guide.md §2. This entry
// re-exports everything the core entry (`../../../src/index`) has, plus the
// VitePress adapter itself, so registering from here alone is enough.
import * as BojuVue from '../../../src/vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // BVPlatformButton no longer carries its own margin (#32) — this
      // slot sits outside VPHero's `.actions` row (whose -6px/+6px gutter
      // trick only applies to its own children), so the spacing above the
      // button is this call site's responsibility, not the component's.
      'home-hero-actions-after': () =>
        h(
          'div',
          { style: { marginTop: '12px' } },
          h(BojuVue.BVPlatformButton, {
            fallbackHref: 'https://github.com/ScottKirvan/BojuVue/releases',
          })
        ),
    })
  },
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(BojuVue)) {
      app.component(name, component as any)
    }
  },
} satisfies Theme
