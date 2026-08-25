export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'chromeos'

// Expected shape of the JSON file DownloadButton fetches:
// { "version": "1.2.3", "windows": "https://...", "windowsLabel": "Get the app", ... }
// Every platform key (and its optional "<platform>Label" override) is optional — omit
// any you don't ship a build for.
export type DownloadManifest = { version?: string } & Partial<Record<PlatformId, string>> &
  Partial<Record<`${PlatformId}Label`, string>>

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

export interface ResolveDownloadOptions {
  // Omit fallbackHref to hide the button entirely when there's nothing
  // platform-specific to link to, rather than pointing at a generic page
  // that may not actually have anything for this visitor's platform.
  fallbackHref?: string
  fallbackLabel?: string
}

export function resolveDownload(
  platform: PlatformId | null,
  manifest: DownloadManifest | null,
  options: ResolveDownloadOptions = {}
): { href: string; label: string } | null {
  if (platform && manifest) {
    // ChromeOS runs Android apps — fall back to the Android build if no
    // ChromeOS-specific one is published.
    const link = platform === 'chromeos' ? (manifest.chromeos ?? manifest.android) : manifest[platform]
    if (link) {
      const label = manifest[`${platform}Label`] ?? defaultLabels[platform]
      return { href: link, label }
    }
  }

  if (options.fallbackHref) {
    return { href: options.fallbackHref, label: options.fallbackLabel ?? 'View Downloads' }
  }

  return null
}
