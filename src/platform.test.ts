import { describe, expect, it } from 'vitest'
import { detectPlatform, resolveDownload, type NavigatorLike } from './platform'

function nav(overrides: Partial<NavigatorLike>): NavigatorLike {
  return { userAgent: '', platform: '', maxTouchPoints: 0, ...overrides }
}

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
})

describe('resolveDownload', () => {
  const options = { fallbackHref: 'https://example.com/releases', fallbackLabel: 'View Downloads' }

  it('falls back when no platform was detected', () => {
    expect(resolveDownload(null, { windows: { href: 'https://example.com/win.msi' } }, options)).toEqual({
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

  it('falls back with a neutral label when the manifest has no entry for the detected platform', () => {
    expect(resolveDownload('linux', { windows: { href: 'https://example.com/win.msi' } }, options)).toEqual({
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
    expect(resolveDownload('linux', { windows: { href: 'https://example.com/win.msi' } }, {})).toBeNull()
    expect(resolveDownload('windows', null, {})).toBeNull()
    expect(resolveDownload(null, null, {})).toBeNull()
  })

  it('returns the manifest link and default label for a matched platform', () => {
    expect(resolveDownload('windows', { windows: { href: 'https://example.com/win.msi' } }, options)).toEqual({
      href: 'https://example.com/win.msi',
      label: 'Download for Windows',
    })
  })

  it('uses the ChromeOS-specific entry when published', () => {
    expect(
      resolveDownload(
        'chromeos',
        {
          chromeos: { href: 'https://example.com/chromeos.apk' },
          android: { href: 'https://example.com/android.apk' },
        },
        options
      )
    ).toEqual({ href: 'https://example.com/chromeos.apk', label: 'Get for ChromeOS' })
  })

  it('falls back to the Android entry for ChromeOS when no ChromeOS-specific one is published', () => {
    expect(
      resolveDownload('chromeos', { android: { href: 'https://example.com/android.apk' } }, options)
    ).toEqual({
      href: 'https://example.com/android.apk',
      label: 'Get for ChromeOS',
    })
  })

  it('falls back to fallbackHref for ChromeOS when the manifest has neither a chromeos nor an android entry', () => {
    expect(
      resolveDownload('chromeos', { windows: { href: 'https://example.com/win.msi' } }, options)
    ).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it("honors a manifest entry's label override for the matched platform", () => {
    expect(
      resolveDownload(
        'windows',
        { windows: { href: 'https://example.com/win.msi', label: 'Get the app' } },
        options
      )
    ).toEqual({ href: 'https://example.com/win.msi', label: 'Get the app' })
  })
})
