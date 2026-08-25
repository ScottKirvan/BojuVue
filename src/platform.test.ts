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
    expect(resolveDownload(null, { windows: 'https://example.com/win.msi' }, options)).toEqual({
      href: 'https://example.com/releases',
      label: 'View Downloads',
    })
  })

  it('falls back when the manifest failed to load, but still uses the platform label', () => {
    expect(resolveDownload('windows', null, options)).toEqual({
      href: 'https://example.com/releases',
      label: 'Download for Windows',
    })
  })

  it('returns the manifest link and default label for a matched platform', () => {
    expect(resolveDownload('windows', { windows: 'https://example.com/win.msi' }, options)).toEqual({
      href: 'https://example.com/win.msi',
      label: 'Download for Windows',
    })
  })

  it('falls back when the manifest has no entry for the detected platform', () => {
    expect(resolveDownload('linux', { windows: 'https://example.com/win.msi' }, options)).toEqual({
      href: 'https://example.com/releases',
      label: 'Download for Linux',
    })
  })

  it('uses the ChromeOS-specific link when published', () => {
    expect(
      resolveDownload(
        'chromeos',
        { chromeos: 'https://example.com/chromeos.apk', android: 'https://example.com/android.apk' },
        options
      )
    ).toEqual({ href: 'https://example.com/chromeos.apk', label: 'Get for ChromeOS' })
  })

  it('falls back to the Android build for ChromeOS when no ChromeOS-specific one is published', () => {
    expect(resolveDownload('chromeos', { android: 'https://example.com/android.apk' }, options)).toEqual({
      href: 'https://example.com/android.apk',
      label: 'Get for ChromeOS',
    })
  })

  it('honors a caller-supplied label override', () => {
    expect(
      resolveDownload('windows', { windows: 'https://example.com/win.msi' }, { ...options, labels: { windows: 'Get the app' } })
    ).toEqual({ href: 'https://example.com/win.msi', label: 'Get the app' })
  })
})
