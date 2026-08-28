import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BVButton from './BVButton.vue'

// BVButton itself never calls useData(), but vitepress/theme's barrel
// export transitively pulls in NotFound.vue, which does call useData() at
// module-eval time — without this mock, importing VPButton from
// 'vitepress/theme' below throws outside a real VitePress app context.
// VPButton's own normalizeLink() (invoked for a non-external href) also
// reads `site.value.cleanUrls` from useData() and calls `withBase()`, both
// imported from the 'vitepress' package itself, so the mock needs to cover
// both rather than just useData().
vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: { base: '/', cleanUrls: false } } }),
  withBase: (path: string) => path,
}))

describe('BVButton (VitePress-specific implementation)', () => {
  describe('tag auto-detection', () => {
    it('renders as an anchor when href is given', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', href: 'https://example.com' } })
      const anchor = wrapper.find('a')
      expect(anchor.exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(false)
      // VPButton's own class name — proof this renders through the real
      // component rather than duplicating its look.
      expect(anchor.classes()).toContain('VPButton')
      expect(anchor.attributes('href')).toBe('https://example.com')
      expect(anchor.text()).toBe('Go')
    })

    it('renders as a button when href is unset', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go' } })
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('forces a given tag even when href would otherwise select one', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', href: 'https://example.com', tag: 'button' } })
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('a').exists()).toBe(false)
    })
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as VPButton classes', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', theme: 'alt', size: 'big' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('alt')
      expect(el.classes()).toContain('big')
    })

    it("falls back to VPButton's own defaults when theme/size are unset", () => {
      const wrapper = mount(BVButton, { props: { text: 'Go' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('brand')
      expect(el.classes()).toContain('medium')
    })
  })

  describe('target/rel', () => {
    it("defaults to VPButton's smart external-link target/rel when unset", () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', href: 'https://example.com' } })
      const anchor = wrapper.find('a')
      expect(anchor.attributes('target')).toBe('_blank')
      expect(anchor.attributes('rel')).toBe('noreferrer')
    })

    it('applies no smart target/rel defaults for a site-relative href', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', href: '/local-page' } })
      const anchor = wrapper.find('a')
      expect(anchor.attributes('target')).toBeUndefined()
      expect(anchor.attributes('rel')).toBeUndefined()
    })

    it('passes explicit target/rel through, overriding the smart defaults', () => {
      const wrapper = mount(BVButton, {
        props: { text: 'Go', href: 'https://example.com', target: '_self', rel: 'noopener' },
      })
      const anchor = wrapper.find('a')
      expect(anchor.attributes('target')).toBe('_self')
      expect(anchor.attributes('rel')).toBe('noopener')
    })
  })
})
