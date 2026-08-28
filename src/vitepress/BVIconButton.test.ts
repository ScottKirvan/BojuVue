import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BVIconButton from './BVIconButton.vue'

// BVIconButton itself never calls useData(), but importing VPButton from
// 'vitepress/theme' (via ./BVButton.vue) pulls in that entry's whole theme
// barrel (NavBar, NotFound, etc.), and NotFound.vue calls useData() at
// module-eval time — so this mock is here purely to satisfy that transitive
// import in tests, the same reason ./BVButton.test.ts needs it. VPButton's
// own normalizeLink() (invoked for a non-external href) also reads
// `site.value.cleanUrls` from useData() and calls `withBase()`, both
// imported from the 'vitepress' package itself, so the mock needs to cover
// both rather than just useData().
vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: { base: '/', cleanUrls: false } } }),
  withBase: (path: string) => path,
}))

describe('BVIconButton (VitePress-specific implementation)', () => {
  describe('icon-only mode (no text)', () => {
    it('renders the hand-rolled generic BVButton, not VPButton', () => {
      const wrapper = mount(BVIconButton, { props: {} })
      const button = wrapper.find('button.bv-button')
      expect(button.exists()).toBe(true)
      expect(button.classes()).not.toContain('VPButton')
      expect(button.classes()).toContain('icon-only')
    })

    it('renders no visible text and no default icon when none is given', () => {
      const wrapper = mount(BVIconButton, { props: {} })
      expect(wrapper.text()).toBe('')
      expect(wrapper.find('svg').exists()).toBe(false)
    })

    it('renders caller-supplied icon markup via v-html', () => {
      const wrapper = mount(BVIconButton, { props: { icon: '<svg data-testid="my-icon"></svg>' } })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('treats an explicitly empty text string the same as unset text', () => {
      const wrapper = mount(BVIconButton, { props: { text: '' } })
      expect(wrapper.find('button.bv-button.icon-only').exists()).toBe(true)
    })

    it('applies theme/size as modifier classes on the hand-rolled button', () => {
      const wrapper = mount(BVIconButton, { props: { theme: 'alt', size: 'big' } })
      const button = wrapper.find('button.bv-button')
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })
  })

  describe('icon+text mode', () => {
    it("renders through VitePress's real VPButton, not the hand-rolled skin", () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      const button = wrapper.find('button.VPButton')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Go')
      expect(wrapper.find('.bv-button').exists()).toBe(false)
    })

    it('overlays the icon on VPButton rather than rendering it as a preceding flex sibling', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', icon: '<svg data-testid="my-icon"></svg>' } })
      const icon = wrapper.find('[data-testid="my-icon"]')
      expect(icon.exists()).toBe(true)
      expect(wrapper.find('button.VPButton [data-testid="my-icon"]').exists()).toBe(false)
      expect(wrapper.find('button.VPButton').classes()).toContain('has-icon')
    })

    it('renders no icon when icon is unset', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      expect(wrapper.find('.bv-icon-button-icon').exists()).toBe(false)
    })

    it('applies an explicit theme and size as VPButton classes', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', theme: 'alt', size: 'big' } })
      const button = wrapper.find('button.VPButton')
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })

    it("falls back to VPButton's own defaults (brand/medium) when unset", () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      const button = wrapper.find('button.VPButton')
      expect(button.classes()).toContain('brand')
      expect(button.classes()).toContain('medium')
    })
  })

  describe('accessible-name prop (label)', () => {
    it('applies label as aria-label in icon-only mode', () => {
      const wrapper = mount(BVIconButton, { props: { label: 'More options' } })
      expect(wrapper.find('button.bv-button').attributes('aria-label')).toBe('More options')
    })

    it('ignores label when text is set', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', label: 'More options' } })
      expect(wrapper.find('button.VPButton').attributes('aria-label')).toBeUndefined()
    })
  })

  describe('with no icon at all', () => {
    it('behaves like a plain BVButton (VPButton wrapper) in text mode', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', href: 'https://example.com' } })
      const anchor = wrapper.find('a.VPButton')
      expect(anchor.exists()).toBe(true)
      expect(anchor.text()).toBe('Go')
      expect(anchor.attributes('href')).toBe('https://example.com')
    })
  })

  describe('href/tag pass-through in icon-only mode', () => {
    it('renders as an anchor when href is given, even in icon-only mode', () => {
      const wrapper = mount(BVIconButton, { props: { href: 'https://example.com' } })
      const anchor = wrapper.find('a.bv-button')
      expect(anchor.exists()).toBe(true)
      expect(anchor.classes()).toContain('icon-only')
    })
  })
})
