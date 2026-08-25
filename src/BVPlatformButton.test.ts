import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BVPlatformButton from './BVPlatformButton.vue'

vi.mock('vitepress', () => ({
  useData: () => ({ site: { value: { base: '/' } } }),
}))

const FALLBACK_HREF = 'https://example.com/downloads'

async function mountButton(props: Record<string, unknown> = {}) {
  const wrapper = mount(BVPlatformButton, {
    props: {
      fallbackHref: FALLBACK_HREF,
      ...props,
    },
  })
  await flushPromises()
  return wrapper
}

describe('BVPlatformButton', () => {
  beforeEach(() => {
    // No manifest entries for any platform — every test resolves through
    // fallbackHref, keeping assertions independent of jsdom's reported
    // navigator/platform.
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch
  })

  it('renders through VPButton as an anchor', async () => {
    const wrapper = await mountButton()
    const anchor = wrapper.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.classes()).toContain('VPButton')
    expect(anchor.attributes('href')).toBe(FALLBACK_HREF)
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as VPButton classes', async () => {
      const wrapper = await mountButton({ theme: 'alt', size: 'big' })
      const anchor = wrapper.find('a')
      expect(anchor.classes()).toContain('alt')
      expect(anchor.classes()).toContain('big')
    })

    it("falls back to VPButton's own defaults when theme/size are unset", async () => {
      const wrapper = await mountButton()
      const anchor = wrapper.find('a')
      expect(anchor.classes()).toContain('brand')
      expect(anchor.classes()).toContain('medium')
    })
  })

  describe('icon', () => {
    it('renders caller-supplied SVG markup via v-html next to the label', async () => {
      const wrapper = await mountButton({
        icon: '<svg data-testid="my-icon" viewBox="0 0 24 24"></svg>',
      })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
      expect(wrapper.find('a').text()).toContain('View Downloads')
    })

    it('renders no icon markup when icon is unset', async () => {
      const wrapper = await mountButton()
      expect(wrapper.find('.bv-platform-button-icon').exists()).toBe(false)
    })
  })

  describe('target/rel', () => {
    it("defaults to VPButton's smart external-link target/rel when unset", async () => {
      const wrapper = await mountButton()
      const anchor = wrapper.find('a')
      expect(anchor.attributes('target')).toBe('_blank')
      expect(anchor.attributes('rel')).toBe('noreferrer')
    })

    it('passes explicit target/rel through, overriding the smart defaults', async () => {
      const wrapper = await mountButton({ target: '_self', rel: 'noopener' })
      const anchor = wrapper.find('a')
      expect(anchor.attributes('target')).toBe('_self')
      expect(anchor.attributes('rel')).toBe('noopener')
    })
  })
})
