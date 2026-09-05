export type BVPlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'chromeos'

export interface BVPlatformEntry {
  href: string
  label?: string
}

// Expected shape of the JSON file BVPlatformButton fetches:
// { "platforms": { "windows": { "href": "https://...", "label": "Get the app" }, "macos": { "href": "https://..." } } }
// Every platform key is optional — omit any you don't ship a build for. A label only
// ever makes sense attached to its own entry, so it's nested under it rather than
// living as a separate sibling key.
export type BVPlatformData = Partial<Record<BVPlatformId, BVPlatformEntry>>

export interface BVPlatformManifest {
  platforms: BVPlatformData
}

export interface NavigatorLike {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

// iOS check must precede macOS: iPadOS reports navigator.platform as
// "MacIntel" and is only distinguishable via touch support. Android must
// precede Linux: Android's navigator.platform is often "Linux armv8l".
//
// navigator.platform is formally deprecated and browsers are already
// freezing/limiting it for anti-fingerprinting reasons, so each desktop
// branch also falls back to a navigator.userAgent check — same pattern
// mobile detection above already relies on. The UA fallbacks must run
// after the Android check (Android's UA contains "Linux") and after the
// iOS check (iPadOS's UA contains "Macintosh"), which they do here since
// desktop detection already runs last.
export function detectPlatform(nav: NavigatorLike | undefined): BVPlatformId | null {
  if (!nav) return null
  const ua = nav.userAgent
  const platform = nav.platform || ''
  const isIPadOS = platform === 'MacIntel' && nav.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  if (/CrOS/i.test(ua)) return 'chromeos'
  if (/Win/i.test(platform) || /Windows NT/i.test(ua)) return 'windows'
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'macos'
  if (/Linux/i.test(platform) || /X11|Linux/i.test(ua)) return 'linux'
  return null
}

export const defaultLabels: Record<BVPlatformId, string> = {
  windows: 'Download for Windows',
  macos: 'Download for macOS',
  linux: 'Download for Linux',
  android: 'Get for Android',
  ios: 'Get for iOS',
  chromeos: 'Get for ChromeOS',
}

// Absolute manifestUrl values (a manifest hosted on another origin/CDN, not
// alongside the docs site itself) must not be prefixed with the site's
// VitePress base path — prepending it would mangle an already-complete URL
// into something unfetchable.
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

export function resolveManifestUrl(base: string, manifestUrl: string): string {
  if (ABSOLUTE_URL_PATTERN.test(manifestUrl)) return manifestUrl
  return `${base}${manifestUrl}`
}

export interface ResolveDownloadOptions {
  // Omit fallbackHref to hide the button entirely when there's nothing
  // platform-specific to link to, rather than pointing at a generic page
  // that may not actually have anything for this visitor's platform.
  fallbackHref?: string
  fallbackLabel?: string
}

function isPlatformData(value: unknown): value is BVPlatformData {
  return typeof value === 'object' && value !== null
}

export function resolveDownload(
  platform: BVPlatformId | null,
  manifest: BVPlatformManifest | null,
  options: ResolveDownloadOptions = {}
): { href: string; label: string } | null {
  if (platform && manifest) {
    const platformData = isPlatformData(manifest.platforms) ? manifest.platforms : undefined

    // ChromeOS runs Android apps — fall back to the Android entry if no
    // ChromeOS-specific one is published.
    const entry =
      platformData && (platform === 'chromeos' ? (platformData.chromeos ?? platformData.android) : platformData[platform])
    if (entry) {
      return { href: entry.href, label: entry.label ?? defaultLabels[platform] }
    }
  }

  if (options.fallbackHref) {
    return { href: options.fallbackHref, label: options.fallbackLabel ?? 'View Downloads' }
  }

  return null
}
