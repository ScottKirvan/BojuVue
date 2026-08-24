import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "BojuVue",
  description: "TODO - Replace with your project description.",
  base: '/BojuVue/',
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
