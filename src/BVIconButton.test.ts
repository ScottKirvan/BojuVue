import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BVIconButton from './BVIconButton.vue'

describe('BVIconButton (generic Vue implementation)', () => {
  describe('icon-only mode (no text)', () => {
    it('renders no visible text and no default icon when none is given', () => {
      const wrapper = mount(BVIconButton, { props: {} })
      expect(wrapper.text()).toBe('')
      expect(wrapper.find('svg').exists()).toBe(false)
      expect(wrapper.find('.icon-only').exists()).toBe(true)
    })

    it('renders caller-supplied icon markup via v-html', () => {
      const wrapper = mount(BVIconButton, { props: { icon: '<svg data-testid="my-icon"></svg>' } })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('treats an explicitly empty text string the same as unset text', () => {
      const wrapper = mount(BVIconButton, { props: { text: '', icon: '<svg data-testid="my-icon"></svg>' } })
      expect(wrapper.find('button').classes()).toContain('icon-only')
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('renders through the underlying BVButton, not separate hand-rolled markup', () => {
      const wrapper = mount(BVIconButton, { props: {} })
      expect(wrapper.find('button.bv-button').exists()).toBe(true)
    })
  })

  describe('icon+text mode', () => {
    it('overlays the icon on the button rather than rendering it as a preceding flex sibling', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', icon: '<svg data-testid="my-icon"></svg>' } })
      const icon = wrapper.find('[data-testid="my-icon"]')
      expect(icon.exists()).toBe(true)
      expect(wrapper.find('button [data-testid="my-icon"]').exists()).toBe(false)
      expect(wrapper.find('button').classes()).toContain('has-icon')
      expect(wrapper.find('button').text()).toBe('Go')
    })

    it('renders no icon when icon is unset', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      expect(wrapper.find('.bv-icon-button-icon').exists()).toBe(false)
    })

    it('does not apply the icon-only fixed-size class', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      expect(wrapper.find('button').classes()).not.toContain('icon-only')
    })
  })

  describe('accessible-name prop (label)', () => {
    it('applies label as aria-label in icon-only mode', () => {
      const wrapper = mount(BVIconButton, { props: { label: 'More options' } })
      expect(wrapper.find('button').attributes('aria-label')).toBe('More options')
    })

    it('ignores label when text is set', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', label: 'More options' } })
      expect(wrapper.find('button').attributes('aria-label')).toBeUndefined()
    })
  })

  describe('with no icon at all', () => {
    it('behaves exactly like a plain BVButton', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', href: 'https://example.com' } })
      const anchor = wrapper.find('a')
      expect(anchor.exists()).toBe(true)
      expect(anchor.text()).toBe('Go')
      expect(anchor.attributes('href')).toBe('https://example.com')
    })
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as modifier classes on the button', () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go', theme: 'alt', size: 'big' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('alt')
      expect(el.classes()).toContain('big')
    })

    it("defaults to BVButton's own defaults ('brand' / 'medium') when unset", () => {
      const wrapper = mount(BVIconButton, { props: { text: 'Go' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('brand')
      expect(el.classes()).toContain('medium')
    })

    it('applies theme/size in icon-only mode too', () => {
      const wrapper = mount(BVIconButton, { props: { theme: 'sponsor', size: 'big' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('sponsor')
      expect(el.classes()).toContain('big')
      expect(el.classes()).toContain('icon-only')
    })
  })

  describe('href/tag pass-through', () => {
    it('renders as an anchor when href is given, even in icon-only mode', () => {
      const wrapper = mount(BVIconButton, { props: { href: 'https://example.com' } })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').classes()).toContain('icon-only')
    })
  })
})
