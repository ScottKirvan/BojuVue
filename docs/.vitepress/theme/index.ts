import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import * as BojuVue from '../../../src/index'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(BojuVue)) {
      app.component(name, component as any)
    }
  },
} satisfies Theme
