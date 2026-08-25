# DownloadButton

Detects the visitor's platform (Windows, macOS, Linux, Android, iOS, or ChromeOS) and
links to the matching download from a JSON manifest you host. Falls back to a generic
link if detection fails or the manifest can't be fetched.

## Demo

This site's own `docs/public/latest.json` is used below — open dev tools and override
`navigator.platform`/`navigator.userAgent` to see the label and link change.

<DownloadButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `manifestUrl` | `string` | `'latest.json'` | Path to the manifest, resolved relative to the site's `base` (so it works the same in local dev and in production). |
| `fallbackHref` | `string` | *(required)* | Link used when the platform can't be detected, the manifest fetch fails, or the manifest has no entry for the detected platform. |
| `fallbackLabel` | `string` | `'View Downloads'` | Button label used alongside `fallbackHref`. |
| `labels` | `Partial<Record<PlatformId, string>>` | `{}` | Override the default per-platform label (e.g. `{ windows: 'Get the app' }`). |

`PlatformId` is `'windows' \| 'macos' \| 'linux' \| 'android' \| 'ios' \| 'chromeos'`.

## The manifest file

A plain JSON file, publicly reachable at `manifestUrl` (typically something your
release process writes into `docs/public/` on each release, independent of the docs
site's own build):

```json
{
  "version": "1.2.3",
  "windows": "https://example.com/releases/app-windows.msi",
  "macos": "https://example.com/releases/app-macos.dmg",
  "linux": "https://example.com/releases/app-linux.tar.gz",
  "android": "https://example.com/releases/app-android.apk",
  "ios": "https://example.com/releases/app-ios-or-testflight-link"
}
```

Every platform key is optional — omit any you don't ship a build for; visitors on that
platform get `fallbackHref` instead. There's no `chromeos` key in the example above
deliberately: ChromeOS runs Android apps, so if a build ships for `android` but not
`chromeos`, ChromeOS visitors automatically get the Android link. Add a `chromeos` key
only if you publish something ChromeOS-specific.

## Platform detection

Detection runs once, after the component mounts (`navigator` isn't available during
VitePress's server-side prerender, so the initial render always shows the fallback —
it updates once the browser takes over). A couple of platforms need to be checked in a
specific order because their signals overlap:

- **iOS before macOS** — modern iPadOS reports `navigator.platform` as `"MacIntel"`,
  identical to a real Mac; it's only distinguishable by touch support.
- **Android before Linux** — Android's `navigator.platform` is often something like
  `"Linux armv8l"`.

## Usage

```vue
<script setup>
import { DownloadButton } from '@scottkirvan/bojuvue'
</script>

<template>
  <DownloadButton
    manifest-url="latest.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
  />
</template>
```
