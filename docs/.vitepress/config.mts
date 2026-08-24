import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "BojuVue",
  description: "TODO - Replace with your project description.",
  base: '/BojuVue/',
  vite: {
    resolve: {
      // Components imported from ../src (outside docs/) still need to resolve
      // `vue` — without this alias, Vite resolves it relative to the importing
      // file's own directory (repo root), which may not have vue installed.
      alias: {
        vue: fileURLToPath(new URL('../node_modules/vue', import.meta.url)),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/ScottKirvan/BojuVue' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ScottKirvan/BojuVue' },
      { icon: 'discord', link: 'https://discord.gg/TN6XJSNK5Y' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Scott Kirvan'
    }
  }
})
