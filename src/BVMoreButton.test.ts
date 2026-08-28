import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BVMoreButton from './BVMoreButton.vue'

const ITEMS = [
  { label: 'GitHub repo', href: 'https://github.com/example/example' },
  { label: 'Report a bug', href: '/report-bug' },
  { label: 'Request a feature', href: 'https://example.com/request', target: '_self', rel: 'noopener' },
]

function mountButton(props: Record<string, unknown> = {}) {
  return mount(BVMoreButton, {
    attachTo: document.body,
    props: {
      items: ITEMS,
      ...props,
    },
  })
}

describe('BVMoreButton', () => {
  it('renders the trigger as a real button with the default three-dot icon', () => {
    const wrapper = mountButton()
    const button = wrapper.find('button.bv-more-button-trigger')
    expect(button.exists()).toBe(true)
    expect(button.find('svg').exists()).toBe(true)
  })

  it('renders caller-supplied icon markup via v-html instead of the default icon', () => {
    const wrapper = mountButton({ icon: '<svg data-testid="my-icon"></svg>' })
    expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
  })

  describe('text mode', () => {
    it('renders visible text and switches to the has-text layout class, dropping the default icon', () => {
      const wrapper = mountButton({ text: 'More' })
      const button = wrapper.find('button.bv-more-button-trigger')
      expect(button.text()).toContain('More')
      expect(button.classes()).toContain('has-text')
      expect(button.classes()).not.toContain('icon-only')
      expect(button.find('svg').exists()).toBe(false)
    })

    it('still renders an icon alongside text when icon is explicitly given', () => {
      const wrapper = mountButton({ text: 'More', icon: '<svg data-testid="my-icon"></svg>' })
      const button = wrapper.find('button.bv-more-button-trigger')
      expect(button.text()).toContain('More')
      expect(button.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('omits aria-label in favor of the visible text as the accessible name', () => {
      const wrapper = mountButton({ text: 'More', label: 'Ignored' })
      expect(wrapper.find('button').attributes('aria-label')).toBeUndefined()
    })

    it('defaults to icon-only mode with the fixed circular layout when text is unset', () => {
      const wrapper = mountButton()
      const button = wrapper.find('button.bv-more-button-trigger')
      expect(button.classes()).toContain('icon-only')
      expect(button.classes()).not.toContain('has-text')
      expect(button.text()).toBe('')
    })
  })

  describe('aria attributes', () => {
    it('defaults aria-label to "More options" and sets aria-haspopup/aria-expanded', () => {
      const wrapper = mountButton()
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('More options')
      expect(button.attributes('aria-haspopup')).toBe('menu')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('uses a custom label prop for aria-label', () => {
      const wrapper = mountButton({ label: 'Plugin options' })
      expect(wrapper.find('button').attributes('aria-label')).toBe('Plugin options')
    })

    it('sets aria-expanded to true once the menu is open', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    })
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as modifier classes', () => {
      const wrapper = mountButton({ theme: 'alt', size: 'big' })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })

    it('falls back to brand/medium defaults when theme/size are unset', () => {
      const wrapper = mountButton()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('brand')
      expect(button.classes()).toContain('medium')
    })
  })

  describe('menu items', () => {
    it('renders each item as a role="menuitem" anchor with its label and href', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items).toHaveLength(3)
      expect(items[0]?.text()).toContain('GitHub repo')
      expect(items[0]?.attributes('href')).toBe('https://github.com/example/example')
    })

    it('defaults target/rel to the smart external-link values for an external href', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[0]?.attributes('target')).toBe('_blank')
      expect(items[0]?.attributes('rel')).toBe('noreferrer')
    })

    it('leaves target/rel unset for a site-relative href', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[1]?.attributes('target')).toBeUndefined()
      expect(items[1]?.attributes('rel')).toBeUndefined()
    })

    it('honors an explicit per-item target/rel override', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[2]?.attributes('target')).toBe('_self')
      expect(items[2]?.attributes('rel')).toBe('noopener')
    })

    it('renders a per-item icon via v-html when given', async () => {
      const wrapper = mountButton({
        items: [{ label: 'X', href: 'https://x.example', icon: '<svg data-testid="item-icon"></svg>' }],
      })
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('[data-testid="item-icon"]').exists()).toBe(true)
    })
  })

  describe('open/close', () => {
    it('opens on trigger click and closes on a second click', async () => {
      const wrapper = mountButton()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })

    it('closes on Escape from within the menu and returns focus to the trigger', async () => {
      const wrapper = mountButton()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      expect(document.activeElement).toBe(button.element)
    })

    it('closes on a pointerdown outside the component, with no focus change', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })

    it('does not close on a pointerdown inside the panel', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('click')
      const menu = wrapper.find('[role="menu"]')
      menu.element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    })
  })

  describe('placement', () => {
    it('recomputes panel position on scroll, not just resize (position: fixed follows the viewport, not the trigger)', async () => {
      const wrapper = mountButton()
      const button = wrapper.find('button').element as HTMLButtonElement

      await wrapper.find('button').trigger('click')
      const panel = wrapper.find('[role="menu"]').element as HTMLElement
      panel.getBoundingClientRect = () => ({ width: 200 }) as DOMRect

      // Simulate the page scrolling the trigger to a new viewport position —
      // a fixed-position panel has no reason to follow this on its own.
      button.getBoundingClientRect = () => ({ left: 300, right: 340 }) as DOMRect
      window.dispatchEvent(new Event('scroll'))
      await wrapper.vm.$nextTick()

      expect(panel.style.left).toBe('300px')
    })

    it('corrects for an ancestor `zoom` style so getBoundingClientRect measurements land in the unzoomed inline-style frame', async () => {
      document.documentElement.style.zoom = '0.875'
      try {
        const wrapper = mountButton()
        const button = wrapper.find('button').element as HTMLButtonElement

        await wrapper.find('button').trigger('click')
        const panel = wrapper.find('[role="menu"]').element as HTMLElement
        button.getBoundingClientRect = () => ({ left: 350, right: 385 }) as DOMRect
        panel.getBoundingClientRect = () => ({ width: 175 }) as DOMRect

        // A zoomed getBoundingClientRect() (350) fed straight into the panel's
        // inline `left` would land at 350 in the unzoomed frame the browser
        // actually renders that style in — visually 350 * 0.875 = 306.25 once
        // the ancestor zoom re-applies, not the intended 350. Dividing by the
        // zoom factor first (350 / 0.875 = 400) is what makes the two match.
        window.dispatchEvent(new Event('resize'))
        await wrapper.vm.$nextTick()

        expect(panel.style.left).toBe('400px')
      } finally {
        document.documentElement.style.zoom = ''
      }
    })
  })

  describe('keyboard navigation', () => {
    it('opens and focuses the first item on ArrowDown at the trigger', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      expect(document.activeElement).toBe(items[0]?.element)
    })

    it('opens and focuses the last item on ArrowUp at the trigger', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('keydown', { key: 'ArrowUp' })
      const items = wrapper.findAll('[role="menuitem"]')
      expect(document.activeElement).toBe(items[items.length - 1]?.element)
    })

    it('moves focus between items with ArrowDown/ArrowUp, wrapping at both ends', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      const menu = wrapper.find('[role="menu"]')

      await menu.trigger('keydown', { key: 'ArrowDown' })
      expect(document.activeElement).toBe(items[1]?.element)

      await menu.trigger('keydown', { key: 'ArrowUp' })
      expect(document.activeElement).toBe(items[0]?.element)

      await menu.trigger('keydown', { key: 'ArrowUp' })
      expect(document.activeElement).toBe(items[items.length - 1]?.element)
    })

    it('jumps to the first/last item with Home/End', async () => {
      const wrapper = mountButton()
      await wrapper.find('button').trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      const menu = wrapper.find('[role="menu"]')

      await menu.trigger('keydown', { key: 'End' })
      expect(document.activeElement).toBe(items[items.length - 1]?.element)

      await menu.trigger('keydown', { key: 'Home' })
      expect(document.activeElement).toBe(items[0]?.element)
    })
  })
})
