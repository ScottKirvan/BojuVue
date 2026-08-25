import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import * as BojuVue from '../../../src/index'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-actions-after': () =>
        h(BojuVue.DownloadButton, {
          fallbackHref: 'https://github.com/ScottKirvan/BojuVue/releases',
        }),
    })
  },
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(BojuVue)) {
      app.component(name, component as any)
    }
  },
} satisfies Theme
