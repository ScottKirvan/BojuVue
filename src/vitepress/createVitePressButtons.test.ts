import { describe, it, expect, vi } from 'vitest'
import { createApp, h } from 'vue'
import { mount } from '@vue/test-utils'
import { VPButton } from 'vitepress/theme'
import BVButton from './BVButton.vue'
import { createVitePressButtons } from './createVitePressButtons'

// See BVButton.test.ts for why this mock exists — vitepress/theme's barrel
// transitively pulls in NotFound.vue, which calls useData() at module-eval
// time.
vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: { base: '/', cleanUrls: false } } }),
  withBase: (path: string) => path,
}))

describe('createVitePressButtons', () => {
  it('returns all four components directly, usable without app.use()', () => {
    const { BVButton: FactoryBVButton } = createVitePressButtons({ VPButton })
    expect(FactoryBVButton).toBe(BVButton)
  })

  it('install() registers all four components globally on the app', () => {
    const plugin = createVitePressButtons({ VPButton })
    const app = createApp({ render: () => h('div') })
    app.use(plugin)
    expect(app.component('BVButton')).toBeTruthy()
    expect(app.component('BVIconButton')).toBeTruthy()
    expect(app.component('BVMoreButton')).toBeTruthy()
    expect(app.component('BVPlatformButton')).toBeTruthy()
  })

  it('provides VPButton to descendants once installed as a plugin', () => {
    // Provide/inject is scoped to a real app instance, not to whichever
    // variable happens to hold the returned component — install() (via
    // app.use(), or VTU's global.plugins here) is what actually wires it,
    // the same way a consumer's enhanceApp() does.
    const wrapper = mount(BVButton, {
      props: { text: 'Go' },
      global: { plugins: [createVitePressButtons({ VPButton })] },
    })
    expect(wrapper.classes()).toContain('VPButton')
  })

  it('defaults base to "" when omitted', () => {
    // An unset base still renders correctly (no crash, no "undefined" in
    // any resolved path) — the actual base-prefixing behavior itself is
    // covered by BVIconButton.test.ts / BVPlatformButton.test.ts.
    const wrapper = mount(BVButton, {
      props: { text: 'Go', href: '/guide/' },
      global: { plugins: [createVitePressButtons({ VPButton })] },
    })
    expect(wrapper.attributes('href')).toBe('/guide/')
  })
})

describe('BVButton without the plugin installed', () => {
  it('throws a clear error rather than rendering with an undefined VPButton', () => {
    // Mounting directly (not via the factory's returned component) means
    // inject(VPButtonKey) finds nothing — the exact mistake this guards
    // against: importing BVButton from 'bojuvue/vitepress' without ever
    // calling app.use(createVitePressButtons(...)).
    expect(() => mount(BVButton, { props: { text: 'Go' } })).toThrow(/createVitePressButtons/)
  })
})
