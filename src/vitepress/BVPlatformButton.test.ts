import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BVPlatformButton from './BVPlatformButton.vue'

const useDataMock = vi.fn()

vi.mock('vitepress', () => ({
  useData: () => useDataMock(),
}))

const FALLBACK_HREF = 'https://example.com/downloads'

describe('BVPlatformButton (vitepress adapter)', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch
  })

  it("resolves the manifest fetch against the site's base from useData()", async () => {
    useDataMock.mockReturnValue({ site: { value: { base: '/docs/' } } })

    mount(BVPlatformButton, { props: { fallbackHref: FALLBACK_HREF } })
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith('/docs/platformButton.json', expect.anything())
  })

  it('passes every other prop through to the core component unchanged', async () => {
    useDataMock.mockReturnValue({ site: { value: { base: '/' } } })

    const wrapper = mount(BVPlatformButton, {
      props: {
        fallbackHref: FALLBACK_HREF,
        theme: 'alt',
        size: 'big',
        target: '_self',
        rel: 'noopener',
        icon: '<svg data-testid="my-icon" viewBox="0 0 24 24"></svg>',
      },
    })
    await flushPromises()

    const anchor = wrapper.find('a')
    expect(anchor.classes()).toContain('alt')
    expect(anchor.classes()).toContain('big')
    expect(anchor.attributes('target')).toBe('_self')
    expect(anchor.attributes('rel')).toBe('noopener')
    expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
  })
})
