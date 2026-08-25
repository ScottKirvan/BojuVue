export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'chromeos'

// Expected shape of the JSON file DownloadButton fetches:
// { "version": "1.2.3", "windows": "https://...", "macos": "https://...", ... }
// Every platform key is optional — omit any you don't ship a build for.
export type DownloadManifest = { version?: string } & Partial<Record<PlatformId, string>>

export interface NavigatorLike {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

// iOS check must precede macOS: iPadOS reports navigator.platform as
// "MacIntel" and is only distinguishable via touch support. Android must
// precede Linux: Android's navigator.platform is often "Linux armv8l".
export function detectPlatform(nav: NavigatorLike | undefined): PlatformId | null {
  if (!nav) return null
  const ua = nav.userAgent
  const platform = nav.platform || ''
  const isIPadOS = platform === 'MacIntel' && nav.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  if (/CrOS/i.test(ua)) return 'chromeos'
  if (/Win/i.test(platform)) return 'windows'
  if (/Mac/i.test(platform)) return 'macos'
  if (/Linux/i.test(platform)) return 'linux'
  return null
}

const defaultLabels: Record<PlatformId, string> = {
  windows: 'Download for Windows',
  macos: 'Download for macOS',
  linux: 'Download for Linux',
  android: 'Get for Android',
  ios: 'Get for iOS',
  chromeos: 'Get for ChromeOS',
}

export function resolveDownload(
  platform: PlatformId | null,
  manifest: DownloadManifest | null,
  options: { fallbackHref: string; fallbackLabel: string; labels?: Partial<Record<PlatformId, string>> }
): { href: string; label: string } {
  if (!platform) {
    return { href: options.fallbackHref, label: options.fallbackLabel }
  }

  const label = options.labels?.[platform] ?? defaultLabels[platform]

  if (!manifest) {
    return { href: options.fallbackHref, label }
  }

  // ChromeOS runs Android apps — fall back to the Android build if no
  // ChromeOS-specific one is published.
  const link = platform === 'chromeos' ? (manifest.chromeos ?? manifest.android) : manifest[platform]

  return { href: link ?? options.fallbackHref, label }
}
