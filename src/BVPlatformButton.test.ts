import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BVPlatformButton from './BVPlatformButton.vue'

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

describe('BVPlatformButton (generic Vue implementation)', () => {
  beforeEach(() => {
    // No manifest entries for any platform — every test resolves through
    // fallbackHref, keeping assertions independent of jsdom's reported
    // navigator/platform.
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch
  })

  it('renders as an anchor with no dependency on vitepress, via BVIconButton', async () => {
    const wrapper = await mountButton()
    const anchor = wrapper.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.classes()).toContain('bv-button')
    expect(anchor.attributes('href')).toBe(FALLBACK_HREF)
  })

  describe('base', () => {
    it('fetches the manifest relative to the site base when one is given', async () => {
      await mountButton({ base: '/docs/' })
      expect(global.fetch).toHaveBeenCalledWith(
        '/docs/platformButton.json',
        expect.objectContaining({ signal: expect.anything() })
      )
    })

    it('defaults base to an empty string when unset', async () => {
      await mountButton()
      expect(global.fetch).toHaveBeenCalledWith(
        'platformButton.json',
        expect.objectContaining({ signal: expect.anything() })
      )
    })
  })

  describe('theme/size', () => {
    it('applies an explicit theme and size as VPButton-equivalent classes', async () => {
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
      expect(wrapper.find('.bv-icon-button-icon').exists()).toBe(false)
    })
  })

  describe('target/rel', () => {
    it("defaults to BVButton's smart external-link target/rel when unset", async () => {
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

  describe('manifest fetch correctness (#22, #23, #25)', () => {
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
      expect(global.fetch).toHaveBeenCalledWith('first.json', expect.anything())

      await wrapper.setProps({ manifestUrl: 'second.json' })
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith('second.json', expect.anything())
    })

    it('aborts the in-flight fetch when the component unmounts', async () => {
      let capturedSignal: AbortSignal | undefined
      global.fetch = vi.fn((_url, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined
        return new Promise(() => {
          /* never resolves — simulates an in-flight request at unmount time */
        })
      }) as unknown as typeof fetch

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
