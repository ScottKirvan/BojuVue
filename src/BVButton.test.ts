import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BVButton from './BVButton.vue'

describe('BVButton (generic Vue implementation)', () => {
  describe('tag auto-detection', () => {
    it('renders as an anchor when href is given', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', href: 'https://example.com' } })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
      expect(wrapper.text()).toBe('Go')
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
    it('applies an explicit theme and size as modifier classes', () => {
      const wrapper = mount(BVButton, { props: { text: 'Go', theme: 'alt', size: 'big' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('alt')
      expect(el.classes()).toContain('big')
    })

    it("defaults to VPButton's own defaults ('brand' / 'medium') when unset", () => {
      const wrapper = mount(BVButton, { props: { text: 'Go' } })
      const el = wrapper.find('button')
      expect(el.classes()).toContain('brand')
      expect(el.classes()).toContain('medium')
    })
  })

  describe('target/rel', () => {
    it('applies smart external-link target/rel defaults for an external href', () => {
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
