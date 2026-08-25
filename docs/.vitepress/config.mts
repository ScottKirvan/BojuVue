import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import type { Plugin } from 'vite'

// Components imported from ../src (outside docs/) still import `vue` and
// `vitepress` themselves. Left alone, those imports resolve relative to the
// importing file's own physical location (the repo root), which may not
// have those packages installed (and even when it does, vitepress's own
// package.json unconditionally maps its bare "." export to a Node
// build-time entry that breaks in a browser bundle — only specific
// subpaths, like "./theme", are browser-safe).
//
// Rather than hand-alias every subpath that turns out to matter (an
// unbounded list — "vitepress/theme", "vue/server-renderer", ...), redirect
// resolution at the source: when a module physically under repo-root src/
// imports "vue" or "vitepress" (any subpath), resolve it as if the import
// came from inside docs/ instead. That reuses Vite's normal resolution
// algorithm — package.json exports maps, conditions, everything — exactly
// as it already works for every file that's actually inside docs/.
const configFilePath = fileURLToPath(import.meta.url)
const srcDir = fileURLToPath(new URL('../../src/', import.meta.url)).replace(/\\/g, '/')

const redirectSharedDepsFromSrc: Plugin = {
  name: 'bojuvue-redirect-shared-deps-from-src',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!importer) return null
    const normalizedImporter = importer.replace(/\\/g, '/')
    if (!normalizedImporter.startsWith(srcDir)) return null
    if (source !== 'vue' && !source.startsWith('vue/') && source !== 'vitepress' && !source.startsWith('vitepress/')) {
      return null
    }
    return this.resolve(source, configFilePath, { skipSelf: true })
  },
}

export default defineConfig({
  title: "BojuVue",
  description: "TODO - Replace with your project description.",
  base: '/BojuVue/',
  vite: {
    plugins: [redirectSharedDepsFromSrc],
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/ScottKirvan/BojuVue' }
    ],
    sidebar: {
      '/components/': [
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'HelloWorld', link: '/components/hello-world' },
            { text: 'DownloadButton', link: '/components/download-button' },
          ],
        },
      ],
    },
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
