import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BVMoreButton from './BVMoreButton.vue'

// BVMoreButton.vue never calls useData() itself, but importing VPButton from
// 'vitepress/theme' pulls in that entry's whole theme barrel (NavBar,
// NotFound, etc.), and NotFound.vue calls useData() at module-eval time —
// so this mock is here purely to satisfy that transitive import in tests,
// the same reason ../BVPlatformButton.test.ts needs it for its own (real)
// useData() call.
vi.mock('vitepress', () => ({
  useData: () => ({}),
}))

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

describe('BVMoreButton (VitePress-specific implementation)', () => {
  describe('icon-only mode (no text)', () => {
    it('renders a hand-rolled button with the default three-dot icon, not VPButton', () => {
      const wrapper = mountButton()
      const button = wrapper.find('button.bv-more-button-trigger.icon-only')
      expect(button.exists()).toBe(true)
      expect(button.classes()).not.toContain('VPButton')
      expect(button.find('svg').exists()).toBe(true)
    })

    it('renders caller-supplied icon markup via v-html instead of the default icon', () => {
      const wrapper = mountButton({ icon: '<svg data-testid="my-icon"></svg>' })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('applies theme/size as modifier classes on the hand-rolled button', () => {
      const wrapper = mountButton({ theme: 'alt', size: 'big' })
      const button = wrapper.find('button.bv-more-button-trigger')
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })
  })

  describe('text mode', () => {
    it("renders through VitePress's real VPButton, not the hand-rolled circular button", () => {
      const wrapper = mountButton({ text: 'More' })
      const button = wrapper.find('button.VPButton')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('More')
      expect(wrapper.find('.bv-more-button-trigger.icon-only').exists()).toBe(false)
    })

    it('applies theme/size as VPButton classes', () => {
      const wrapper = mountButton({ text: 'More', theme: 'alt', size: 'big' })
      const button = wrapper.find('button.VPButton')
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })

    it("falls back to VPButton's own defaults (brand/medium) when theme/size are unset", () => {
      const wrapper = mountButton({ text: 'More' })
      const button = wrapper.find('button.VPButton')
      expect(button.classes()).toContain('brand')
      expect(button.classes()).toContain('medium')
    })

    it('renders icon as a sibling of VPButton, not inside it, when icon is also given', () => {
      const wrapper = mountButton({ text: 'More', icon: '<svg data-testid="my-icon"></svg>' })
      const icon = wrapper.find('[data-testid="my-icon"]')
      expect(icon.exists()).toBe(true)
      expect(wrapper.find('button.VPButton [data-testid="my-icon"]').exists()).toBe(false)
    })

    it('renders no icon when icon is unset — text mode has no default icon', () => {
      const wrapper = mountButton({ text: 'More' })
      expect(wrapper.find('.bv-more-button-icon').exists()).toBe(false)
    })

    it('sets aria-haspopup/aria-expanded on the real VPButton element', async () => {
      const wrapper = mountButton({ text: 'More' })
      const button = wrapper.find('button.VPButton')
      expect(button.attributes('aria-haspopup')).toBe('menu')
      expect(button.attributes('aria-expanded')).toBe('false')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('opens the menu on a VPButton click (fallthrough @click reaches its root element)', async () => {
      const wrapper = mountButton({ text: 'More' })
      await wrapper.find('button.VPButton').trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    })

    it('opens and focuses the first item on ArrowDown at a VPButton trigger (fallthrough @keydown)', async () => {
      const wrapper = mountButton({ text: 'More' })
      await wrapper.find('button.VPButton').trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      expect(document.activeElement).toBe(items[0]?.element)
    })

    it('closes on Escape and returns focus to the VPButton trigger', async () => {
      const wrapper = mountButton({ text: 'More' })
      const button = wrapper.find('button.VPButton')
      await button.trigger('click')
      await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      expect(document.activeElement).toBe(button.element)
    })
  })

  describe('aria attributes (icon-only mode)', () => {
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

  describe('open/close (icon-only mode)', () => {
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

        window.dispatchEvent(new Event('resize'))
        await wrapper.vm.$nextTick()

        expect(panel.style.left).toBe('400px')
      } finally {
        document.documentElement.style.zoom = ''
      }
    })
  })

  describe('keyboard navigation (icon-only mode)', () => {
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
