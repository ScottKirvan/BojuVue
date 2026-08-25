# DownloadButton

Detects the visitor's platform (Windows, macOS, Linux, Android, iOS, or ChromeOS) and
links to the matching download from a JSON manifest you host. With no `fallbackHref`
given, it hides itself entirely when there's nothing to link to — no promising a
download that doesn't exist for this visitor's platform.

## Demo

This site's own `docs/public/downloadButton.json` is used below — open dev tools and
override `navigator.platform`/`navigator.userAgent` to see the label and link change.
The manifest deliberately has no `macos` entry, to demonstrate both behaviors:

With a `fallbackHref`, macOS visitors still see a (generic) button:

<DownloadButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

With no `fallbackHref`, macOS visitors see nothing at all — try switching your
`navigator.platform` to `MacIntel` in dev tools and reloading to compare:

<DownloadButton />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `manifestUrl` | `string` | `'downloadButton.json'` | Path to the manifest, resolved relative to the site's `base` (so it works the same in local dev and in production). |
| `fallbackHref` | `string` | *(none)* | Link used when the platform can't be detected, the manifest fetch fails, or the manifest has no entry for the detected platform. **Omit this to hide the button entirely** in those cases instead of showing a generic link. |
| `fallbackLabel` | `string` | `'View Downloads'` | Button label used alongside `fallbackHref`. |

`PlatformId` is `'windows' \| 'macos' \| 'linux' \| 'android' \| 'ios' \| 'chromeos'`.

## The manifest file

A plain JSON file, publicly reachable at `manifestUrl` (typically something your
release process writes into `docs/public/` on each release, independent of the docs
site's own build):

```json
{
  "version": "1.2.3",
  "windows": "https://example.com/releases/app-windows.msi",
  "windowsLabel": "Get the app",
  "macos": "https://example.com/releases/app-macos.dmg",
  "linux": "https://example.com/releases/app-linux.tar.gz",
  "android": "https://example.com/releases/app-android.apk",
  "ios": "https://example.com/releases/app-ios-or-testflight-link"
}
```

Every platform key is optional — omit any you don't ship a build for. Without a
`fallbackHref` prop, a visitor on a platform with no matching key simply won't see the
button. Each platform key also accepts an optional `"<platform>Label"` sibling (like
`windowsLabel` above) to override that platform's default button text — the manifest
is the single place both the link and its label live, so there's nothing to keep in
sync across two different files.

There's no `chromeos` key in the example above deliberately: ChromeOS runs Android
apps, so if a build ships for `android` but not `chromeos`, ChromeOS visitors
automatically get the Android link. Add a `chromeos` key only if you publish something
ChromeOS-specific.

## Platform detection

Detection runs once, after the component mounts (`navigator` isn't available during
VitePress's server-side prerender, so the initial render always shows the fallback
state — it updates once the browser takes over). A couple of platforms need to be
checked in a specific order because their signals overlap:

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
  <!-- Shows nothing on platforms with no manifest entry -->
  <DownloadButton manifest-url="downloadButton.json" />

  <!-- Always shows something, even on unmatched platforms -->
  <DownloadButton
    manifest-url="downloadButton.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
  />
</template>
```
