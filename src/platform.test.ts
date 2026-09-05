import { describe, expect, it } from 'vitest'
import { defaultLabels, detectPlatform, resolveDownload, resolveManifestUrl, type NavigatorLike } from './platform'

function nav(overrides: Partial<NavigatorLike>): NavigatorLike {
  return { userAgent: '', platform: '', maxTouchPoints: 0, ...overrides }
}

describe('defaultLabels', () => {
  it('has a label for every BVPlatformId, matching what resolveDownload falls back to', () => {
    expect(defaultLabels).toEqual({
      windows: 'Download for Windows',
      macos: 'Download for macOS',
      linux: 'Download for Linux',
      android: 'Get for Android',
      ios: 'Get for iOS',
      chromeos: 'Get for ChromeOS',
    })
  })
})

describe('detectPlatform', () => {
  it('returns null when navigator is unavailable', () => {
    expect(detectPlatform(undefined)).toBeNull()
  })

  it('returns null when nothing matches', () => {
    expect(detectPlatform(nav({ userAgent: 'SomeBot/1.0', platform: 'Amiga' }))).toBeNull()
  })

  it('detects iPhone via user agent', () => {
    expect(detectPlatform(nav({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' }))).toBe('ios')
  })

  it('detects classic iPad via user agent', () => {
    expect(detectPlatform(nav({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0)' }))).toBe('ios')
  })

  it('detects modern iPadOS, which reports platform as MacIntel with touch support', () => {
    expect(
      detectPlatform(
        nav({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)',
          platform: 'MacIntel',
          maxTouchPoints: 5,
        })
      )
    ).toBe('ios')
  })

  it('does not mistake a real Mac (no touch points) for iPadOS', () => {
    expect(
      detectPlatform(
        nav({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)',
          platform: 'MacIntel',
          maxTouchPoints: 0,
        })
      )
    ).toBe('macos')
  })

  it('does not mistake a single touch point for iPadOS support — the guard requires > 1, not > 0', () => {
    expect(
      detectPlatform(
        nav({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)',
          platform: 'MacIntel',
          maxTouchPoints: 1,
        })
      )
    ).toBe('macos')
  })

  it('detects Android ahead of Linux, even though Android reports a Linux platform string', () => {
    expect(
      detectPlatform(
        nav({
          userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
          platform: 'Linux armv8l',
        })
      )
    ).toBe('android')
  })

  it('detects ChromeOS', () => {
    expect(detectPlatform(nav({ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 15633.69.0)' }))).toBe('chromeos')
  })

  it('detects Windows', () => {
    expect(detectPlatform(nav({ platform: 'Win32' }))).toBe('windows')
  })

  it('detects Linux desktop', () => {
    expect(detectPlatform(nav({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: 'Linux x86_64' }))).toBe(
      'linux'
    )
  })

  it('falls back to the user agent for Windows when navigator.platform is frozen/unavailable', () => {
    expect(
      detectPlatform(nav({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: '' }))
    ).toBe('windows')
  })

  it('falls back to the user agent for macOS when navigator.platform is frozen/unavailable', () => {
    expect(
      detectPlatform(nav({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: '' }))
    ).toBe('macos')
  })

  it('falls back to the user agent for Linux when navigator.platform is frozen/unavailable', () => {
    expect(detectPlatform(nav({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: '' }))).toBe('linux')
  })

  it('still detects Android via user agent ahead of the Linux user-agent fallback', () => {
    expect(
      detectPlatform(nav({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)', platform: '' }))
    ).toBe('android')
  })

  it('still detects ChromeOS via user agent ahead of the Linux user-agent fallback', () => {
    expect(
      detectPlatform(nav({ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 15633.69.0)', platform: '' }))
    ).toBe('chromeos')
  })
})

describe('resolveDownload', () => {
  const options = { fallbackHref: 'https://example.com/releases', fallbackLabel: 'View Downloads' }

  it('resolves the enveloped manifest shape', () => {
    expect(
      resolveDownload(
        'windows',
        { platforms: { windows: { href: 'https://example.com/win.msi', label: 'Get the app' } } },
        options
      )
    ).toEqual({ href: 'https://example.com/win.msi', label: 'Get the app' })
  })

  it('falls back when no platform was detected', () => {
    expect(
      resolveDownload(null, { platforms: { windows: { href: 'https://example.com/win.msi' } } }, options)
    ).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it('falls back with a neutral label when the manifest failed to load — we do not know if this platform has a build', () => {
    expect(resolveDownload('windows', null, options)).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it('falls back with a neutral label when the manifest has a malformed (non-object) platforms field', () => {
    expect(
      resolveDownload('windows', { platforms: null } as unknown as { platforms: { windows: { href: string } } }, options)
    ).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it('falls back with a neutral label when the manifest has no entry for the detected platform', () => {
    expect(
      resolveDownload('linux', { platforms: { windows: { href: 'https://example.com/win.msi' } } }, options)
    ).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it("defaults fallbackLabel to 'View Downloads' when the caller doesn't provide one", () => {
    expect(resolveDownload(null, null, { fallbackHref: 'https://example.com/releases' })).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it('returns null (hides the button) when nothing matches and no fallbackHref was given', () => {
    expect(
      resolveDownload('linux', { platforms: { windows: { href: 'https://example.com/win.msi' } } }, {})
    ).toBeNull()
    expect(resolveDownload('windows', null, {})).toBeNull()
    expect(resolveDownload(null, null, {})).toBeNull()
  })

  it('returns the manifest link and default label for a matched platform', () => {
    expect(
      resolveDownload('windows', { platforms: { windows: { href: 'https://example.com/win.msi' } } }, options)
    ).toEqual({
      href: 'https://example.com/win.msi',
      label: 'Download for Windows',
    })
  })

  it('uses the ChromeOS-specific entry when published', () => {
    expect(
      resolveDownload(
        'chromeos',
        {
          platforms: {
            chromeos: { href: 'https://example.com/chromeos.apk' },
            android: { href: 'https://example.com/android.apk' },
          },
        },
        options
      )
    ).toEqual({ href: 'https://example.com/chromeos.apk', label: 'Get for ChromeOS' })
  })

  it('falls back to the Android entry for ChromeOS when no ChromeOS-specific one is published', () => {
    expect(
      resolveDownload(
        'chromeos',
        { platforms: { android: { href: 'https://example.com/android.apk' } } },
        options
      )
    ).toEqual({
      href: 'https://example.com/android.apk',
      label: 'Get for ChromeOS',
    })
  })

  it('falls back to fallbackHref for ChromeOS when the manifest has neither a chromeos nor an android entry', () => {
    expect(
      resolveDownload(
        'chromeos',
        { platforms: { windows: { href: 'https://example.com/win.msi' } } },
        options
      )
    ).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it("honors a manifest entry's label override for the matched platform", () => {
    expect(
      resolveDownload(
        'windows',
        { platforms: { windows: { href: 'https://example.com/win.msi', label: 'Get the app' } } },
        options
      )
    ).toEqual({ href: 'https://example.com/win.msi', label: 'Get the app' })
  })
})

describe('resolveManifestUrl', () => {
  it('prefixes a site-relative manifestUrl with the site base', () => {
    expect(resolveManifestUrl('/docs/', 'platformButton.json')).toBe('/docs/platformButton.json')
  })

  it('prefixes a site-relative manifestUrl even when the base is empty', () => {
    expect(resolveManifestUrl('', 'platformButton.json')).toBe('platformButton.json')
  })

  it('leaves an absolute https manifestUrl untouched, ignoring the site base', () => {
    expect(resolveManifestUrl('/docs/', 'https://cdn.example.com/platformButton.json')).toBe(
      'https://cdn.example.com/platformButton.json'
    )
  })

  it('leaves an absolute http manifestUrl untouched, ignoring the site base', () => {
    expect(resolveManifestUrl('/docs/', 'http://cdn.example.com/platformButton.json')).toBe(
      'http://cdn.example.com/platformButton.json'
    )
  })

  it('treats the scheme check as case-insensitive', () => {
    expect(resolveManifestUrl('/docs/', 'HTTPS://cdn.example.com/platformButton.json')).toBe(
      'HTTPS://cdn.example.com/platformButton.json'
    )
  })

  it('does not treat a protocol-relative URL as absolute, since it still needs a scheme to be fetchable', () => {
    expect(resolveManifestUrl('/docs/', '//cdn.example.com/platformButton.json')).toBe(
      '/docs///cdn.example.com/platformButton.json'
    )
  })
})
