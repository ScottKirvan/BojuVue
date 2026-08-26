import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BVPlatformButton from './BVPlatformButton.vue'

const useDataMock = vi.fn()

vi.mock('vitepress', () => ({
  useData: () => useDataMock(),
}))

const FALLBACK_HREF = 'https://example.com/downloads'

async function mountButton(props: Record<string, unknown> = {}, base = '/') {
  useDataMock.mockReturnValue({ site: { value: { base } } })
  const wrapper = mount(BVPlatformButton, {
    props: {
      fallbackHref: FALLBACK_HREF,
      ...props,
    },
  })
  await flushPromises()
  return wrapper
}

describe('BVPlatformButton (VitePress-specific implementation)', () => {
  beforeEach(() => {
    // No manifest entries for any platform — every test resolves through
    // fallbackHref, keeping assertions independent of jsdom's reported
    // navigator/platform.
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch
  })

  it("renders through VitePress's real VPButton, not a hand-rolled class name", async () => {
    const wrapper = await mountButton()
    const anchor = wrapper.find('a')
    expect(anchor.exists()).toBe(true)
    // VPButton's own class name — proof this renders through the real
    // component rather than duplicating its look.
    expect(anchor.classes()).toContain('VPButton')
    expect(anchor.attributes('href')).toBe(FALLBACK_HREF)
    expect(anchor.text()).toBe('View Downloads')
  })

  describe('base', () => {
    it("resolves the manifest fetch against the site's base from useData()", async () => {
      await mountButton({}, '/docs/')
      expect(global.fetch).toHaveBeenCalledWith(
        '/docs/platformButton.json',
        expect.objectContaining({ signal: expect.anything() })
      )
    })
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
    it('renders caller-supplied SVG markup via v-html as a sibling of VPButton', async () => {
      const wrapper = await mountButton({
        icon: '<svg data-testid="my-icon" viewBox="0 0 24 24"></svg>',
      })
      expect(wrapper.find('[data-testid="my-icon"]').exists()).toBe(true)
      expect(wrapper.find('a').text()).toBe('View Downloads')
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

  describe('hide-on-no-match', () => {
    it('renders nothing when nothing matches and no fallbackHref is given', async () => {
      const wrapper = await mountButton({ fallbackHref: undefined })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.find('.VPButton').exists()).toBe(false)
    })
  })

  describe('manifest fetch correctness', () => {
    it('treats a non-ok response as a failed fetch rather than parsing its body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ windows: { href: 'https://example.com/win.msi' } }),
      }) as unknown as typeof fetch

      const wrapper = await mountButton()
      // Falls through to fallbackHref rather than trusting a manifest body
      // that arrived alongside a non-2xx status.
      expect(wrapper.find('a').attributes('href')).toBe(FALLBACK_HREF)
    })

    it('re-fetches when manifestUrl changes after mount', async () => {
      const wrapper = await mountButton({ manifestUrl: 'first.json' })
      expect(global.fetch).toHaveBeenCalledWith('/first.json', expect.anything())

      await wrapper.setProps({ manifestUrl: 'second.json' })
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith('/second.json', expect.anything())
    })

    it('aborts the in-flight fetch when the component unmounts', async () => {
      let capturedSignal: AbortSignal | undefined
      global.fetch = vi.fn((_url, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined
        return new Promise(() => {
          /* never resolves — simulates an in-flight request at unmount time */
        })
      }) as unknown as typeof fetch

      useDataMock.mockReturnValue({ site: { value: { base: '/' } } })
      const wrapper = mount(BVPlatformButton, { props: { fallbackHref: FALLBACK_HREF } })
      await flushPromises()

      expect(capturedSignal?.aborted).toBe(false)
      wrapper.unmount()
      expect(capturedSignal?.aborted).toBe(true)
    })

    it('aborts the superseded fetch when manifestUrl changes before the first one resolves', async () => {
      const signals: AbortSignal[] = []
      global.fetch = vi.fn((_url, init?: RequestInit) => {
        if (init?.signal) signals.push(init.signal)
        return new Promise(() => {
          /* never resolves for this test — only the abort behavior is checked */
        })
      }) as unknown as typeof fetch

      useDataMock.mockReturnValue({ site: { value: { base: '/' } } })
      const wrapper = mount(BVPlatformButton, {
        props: { fallbackHref: FALLBACK_HREF, manifestUrl: 'first.json' },
      })
      await flushPromises()

      await wrapper.setProps({ manifestUrl: 'second.json' })
      await flushPromises()

      expect(signals).toHaveLength(2)
      expect(signals[0]?.aborted).toBe(true)
      expect(signals[1]?.aborted).toBe(false)
    })
  })
})
