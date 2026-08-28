import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BVMoreButton from './BVMoreButton.vue'

// BVMoreButton itself never calls useData(), but importing VPButton from
// 'vitepress/theme' (via ./BVIconButton.vue -> ./BVButton.vue) pulls in that
// entry's whole theme barrel (NavBar, NotFound, etc.), and NotFound.vue
// calls useData() at module-eval time — so this mock is here purely to
// satisfy that transitive import in tests, the same reason
// ./BVIconButton.test.ts needs it. VPButton's own normalizeLink() (invoked
// for a non-external href) also reads `site.value.cleanUrls` from useData()
// and calls `withBase()`, both imported from the 'vitepress' package
// itself, so the mock needs to cover both rather than just useData().
vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: { base: '/', cleanUrls: false } } }),
  withBase: (path: string) => path,
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

function trigger(wrapper: ReturnType<typeof mountButton>) {
  return wrapper.find('.bv-icon-button-target')
}

describe('BVMoreButton (VitePress-specific implementation)', () => {
  it('renders its trigger through BVIconButton, not hand-rolled markup', () => {
    const wrapper = mountButton()
    expect(wrapper.find('.bv-more-button-trigger').exists()).toBe(false)
    expect(trigger(wrapper).exists()).toBe(true)
  })

  describe('text mode (default)', () => {
    it('renders through the real VPButton, not the hand-rolled generic BVButton', () => {
      const wrapper = mountButton()
      const button = trigger(wrapper)
      expect(button.classes()).toContain('VPButton')
      expect(button.classes()).not.toContain('bv-button')
      expect(button.text()).toBe('More...')
    })

    it('still renders an icon alongside text when icon is explicitly given', () => {
      const wrapper = mountButton({ text: 'More', icon: '<svg data-testid="my-icon"></svg>' })
      expect(trigger(wrapper).text()).toContain('More')
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('omits aria-label in favor of the visible text as the accessible name', () => {
      const wrapper = mountButton({ text: 'More', label: 'Ignored' })
      expect(trigger(wrapper).attributes('aria-label')).toBeUndefined()
    })

    it('sets aria-haspopup/aria-expanded on the real VPButton element', async () => {
      const wrapper = mountButton()
      const button = trigger(wrapper)
      expect(button.attributes('aria-haspopup')).toBe('menu')
      expect(button.attributes('aria-expanded')).toBe('false')

      await button.trigger('click')
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    })
  })

  describe('icon-only mode (text explicitly emptied out)', () => {
    it('renders through the hand-rolled generic BVButton, not VPButton', () => {
      const wrapper = mountButton({ text: '' })
      const button = trigger(wrapper)
      expect(button.classes()).toContain('bv-button')
      expect(button.classes()).not.toContain('VPButton')
      expect(button.classes()).toContain('icon-only')
      expect(button.text()).toBe('')
    })

    it('renders the default three-dot icon', () => {
      const wrapper = mountButton({ text: '' })
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders caller-supplied icon markup via v-html instead of the default icon', () => {
      const wrapper = mountButton({ text: '', icon: '<svg data-testid="my-icon"></svg>' })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
    })

    it('defaults aria-label to "More options", alongside aria-haspopup/aria-expanded', () => {
      const wrapper = mountButton({ text: '' })
      const button = trigger(wrapper)
      expect(button.attributes('aria-label')).toBe('More options')
      expect(button.attributes('aria-haspopup')).toBe('menu')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('uses a custom label prop for aria-label', () => {
      const wrapper = mountButton({ text: '', label: 'Plugin options' })
      expect(trigger(wrapper).attributes('aria-label')).toBe('Plugin options')
    })
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as modifier classes on the trigger', () => {
      const wrapper = mountButton({ theme: 'alt', size: 'big' })
      const button = trigger(wrapper)
      expect(button.classes()).toContain('alt')
      expect(button.classes()).toContain('big')
    })

    it('falls back to brand/medium defaults when theme/size are unset', () => {
      const wrapper = mountButton()
      const button = trigger(wrapper)
      expect(button.classes()).toContain('brand')
      expect(button.classes()).toContain('medium')
    })
  })

  describe('menu items', () => {
    it('renders each item as a role="menuitem" anchor with its label and href', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items).toHaveLength(3)
      expect(items[0]?.text()).toContain('GitHub repo')
      expect(items[0]?.attributes('href')).toBe('https://github.com/example/example')
    })

    it('defaults target/rel to the smart external-link values for an external href', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[0]?.attributes('target')).toBe('_blank')
      expect(items[0]?.attributes('rel')).toBe('noreferrer')
    })

    it('leaves target/rel unset for a site-relative href', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[1]?.attributes('target')).toBeUndefined()
      expect(items[1]?.attributes('rel')).toBeUndefined()
    })

    it('honors an explicit per-item target/rel override', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      const items = wrapper.findAll('[role="menuitem"]')
      expect(items[2]?.attributes('target')).toBe('_self')
      expect(items[2]?.attributes('rel')).toBe('noopener')
    })

    it('renders a per-item icon via v-html when given', async () => {
      const wrapper = mountButton({
        items: [{ label: 'X', href: 'https://x.example', icon: '<svg data-testid="item-icon"></svg>' }],
      })
      await trigger(wrapper).trigger('click')
      expect(wrapper.find('[data-testid="item-icon"]').exists()).toBe(true)
    })
  })

  describe('open/close', () => {
    it('opens on trigger click and closes on a second click', async () => {
      const wrapper = mountButton()
      const button = trigger(wrapper)
      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })

    it('closes on Escape from within the menu and returns focus to the trigger', async () => {
      const wrapper = mountButton()
      const button = trigger(wrapper)
      await button.trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
      expect(document.activeElement).toBe(button.element)
    })

    it('closes on a pointerdown outside the component, with no focus change', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)

      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    })

    it('does not close on a pointerdown inside the panel', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('click')
      const menu = wrapper.find('[role="menu"]')
      menu.element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    })
  })

  describe('placement', () => {
    it('recomputes panel position on scroll, not just resize (position: fixed follows the viewport, not the trigger)', async () => {
      const wrapper = mountButton()
      const button = trigger(wrapper).element as HTMLElement

      await trigger(wrapper).trigger('click')
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
        const button = trigger(wrapper).element as HTMLElement

        await trigger(wrapper).trigger('click')
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

  describe('keyboard navigation', () => {
    it('opens and focuses the first item on ArrowDown at the trigger', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      expect(document.activeElement).toBe(items[0]?.element)
    })

    it('opens and focuses the last item on ArrowUp at the trigger', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('keydown', { key: 'ArrowUp' })
      const items = wrapper.findAll('[role="menuitem"]')
      expect(document.activeElement).toBe(items[items.length - 1]?.element)
    })

    it('moves focus between items with ArrowDown/ArrowUp, wrapping at both ends', async () => {
      const wrapper = mountButton()
      await trigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
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
      await trigger(wrapper).trigger('keydown', { key: 'ArrowDown' })
      const items = wrapper.findAll('[role="menuitem"]')
      const menu = wrapper.find('[role="menu"]')

      await menu.trigger('keydown', { key: 'End' })
      expect(document.activeElement).toBe(items[items.length - 1]?.element)

      await menu.trigger('keydown', { key: 'Home' })
      expect(document.activeElement).toBe(items[0]?.element)
    })
  })
})
