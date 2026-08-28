import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// Imports the vitepress-specific *source* entry (not the published
// package's `./vitepress` subpath) so this site keeps live-previewing
// components straight from this repo's own source, the same way it always
// has — see notes/dev/vitepress-and-component-guide.md §2. This entry
// re-exports everything the `../../../src/index` entry has, plus its own
// VitePress-specific implementations, so registering from here alone is
// enough.
import * as BojuVue from '../../../src/vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // Neither BVPlatformButton nor BVMoreButton carries its own margin
      // (#32, and BVMoreButton follows the same rule) — this slot sits
      // outside VPHero's `.actions` row (whose -6px/+6px gutter trick only
      // applies to its own children), so the spacing above the row and the
      // gap between the two buttons is this call site's responsibility.
      'home-hero-actions-after': () =>
        h(
          'div',
          { style: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' } },
          [
            h(BojuVue.BVPlatformButton, {
              fallbackHref: 'https://github.com/ScottKirvan/BojuVue/releases',
            }),
            h(BojuVue.BVMoreButton, {
              items: [
                { label: 'GitHub repo', href: 'https://github.com/ScottKirvan/BojuVue' },
                {
                  label: 'Report a bug',
                  href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md',
                },
                {
                  label: 'Request a feature',
                  href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=feature_request.md',
                },
              ],
            }),
          ]
        ),
    })
  },
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(BojuVue)) {
      app.component(name, component as any)
    }
  },
} satisfies Theme
