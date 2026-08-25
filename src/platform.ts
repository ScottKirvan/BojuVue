export type BVPlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'chromeos'

export interface BVPlatformEntry {
  href: string
  label?: string
}

// Expected shape of the JSON file BVPlatformButton fetches:
// { "windows": { "href": "https://...", "label": "Get the app" }, "macos": { "href": "https://..." } }
// Every platform key is optional — omit any you don't ship a build for. A label only
// ever makes sense attached to its own entry, so it's nested under it rather than
// living as a separate sibling key.
export type BVPlatformManifest = Partial<Record<BVPlatformId, BVPlatformEntry>>

export interface NavigatorLike {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

// iOS check must precede macOS: iPadOS reports navigator.platform as
// "MacIntel" and is only distinguishable via touch support. Android must
// precede Linux: Android's navigator.platform is often "Linux armv8l".
export function detectPlatform(nav: NavigatorLike | undefined): BVPlatformId | null {
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

const defaultLabels: Record<BVPlatformId, string> = {
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
  platform: BVPlatformId | null,
  manifest: BVPlatformManifest | null,
  options: ResolveDownloadOptions = {}
): { href: string; label: string } | null {
  if (platform && manifest) {
    // ChromeOS runs Android apps — fall back to the Android entry if no
    // ChromeOS-specific one is published.
    const entry = platform === 'chromeos' ? (manifest.chromeos ?? manifest.android) : manifest[platform]
    if (entry) {
      return { href: entry.href, label: entry.label ?? defaultLabels[platform] }
    }
  }

  if (options.fallbackHref) {
    return { href: options.fallbackHref, label: options.fallbackLabel ?? 'View Downloads' }
  }

  return null
}
