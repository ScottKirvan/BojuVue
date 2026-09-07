import type { Component, InjectionKey } from 'vue'

// Real vitepress values a consumer supplies via createVitePressButtons() and
// app.use() — see that file for why these can't be plain top-level `import
// ... from 'vitepress'` statements inside this package's own compiled
// output. Symbols, not string keys, so they can never collide with a
// consumer's own unrelated provide()/inject() usage.
export const VPButtonKey: InjectionKey<Component> = Symbol('bojuvue:VPButton')
export const BaseKey: InjectionKey<string> = Symbol('bojuvue:base')
