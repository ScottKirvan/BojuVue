# DownloadButton

Detects the visitor's platform (Windows, macOS, Linux, Android, iOS, or ChromeOS) and
links to the matching download from a JSON manifest you host. With no `fallbackHref`
given, it hides itself entirely when there's nothing to link to — no promising a
download that doesn't exist for this visitor's platform.

## Demo

This site's own `docs/public/downloadButton.json` is used below — open dev tools and
override `navigator.platform`/`navigator.userAgent` to see the label and link change.
It has an entry for every platform, so both buttons below link to a real page no
matter which platform gets detected:

<DownloadButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

<DownloadButton />

To see the "no matching platform" case — the second button above hiding itself
instead of showing a link — remove a platform's entry from
`docs/public/downloadButton.json` locally and reload, or see the `resolveDownload`
tests in `src/platform.test.ts`, which cover it directly.

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
  "ios": "https://example.com/releases/app-ios-or-testflight-link",
  "chromeos": "https://example.com/releases/app-chromeos.apk"
}
```

Every platform key is optional — omit any you don't ship a build for. Without a
`fallbackHref` prop, a visitor on a platform with no matching key simply won't see the
button. Each platform key also accepts an optional `"<platform>Label"` sibling (like
`windowsLabel` above) to override that platform's default button text — the manifest
is the single place both the link and its label live, so there's nothing to keep in
sync across two different files.

`chromeos` is the one key with a built-in fallback: ChromeOS runs Android apps, so if
you omit `chromeos` but provide `android`, ChromeOS visitors automatically get the
Android link. Provide a `chromeos` key yourself only if you publish something
ChromeOS-specific — that choice belongs to whoever's shipping builds, not this
component.

## Platform detection

Detection runs once, after the component mounts (`navigator` isn't available during
VitePress's server-side prerender, so the initial render always shows the fallback
state — it updates once the browser takes over). A couple of platforms need to be
checked in a specific order because their signals overlap:

- **iOS before macOS** — modern iPadOS reports `navigator.platform` as `"MacIntel"`,
  identical to a real Mac; it's only distinguishable by touch support.
- **Android before Linux** — Android's `navigator.platform` is often something like
  `"Linux armv8l"`.

If nothing matches — an unrecognized platform, a bot, a browser that doesn't expose
enough information — detection resolves to "unknown" rather than guessing. That's
treated exactly the same as a recognized platform with no manifest entry: hidden with
no `fallbackHref`, or `fallbackHref` shown if one was given.

## Limitations

CPU architecture (x64 vs. ARM64/Apple Silicon, Windows on ARM, etc.) is **not**
detected, and can't be reliably detected client-side across browsers today:

- `navigator.platform` doesn't expose it, and on Apple Silicon Macs it has
  historically still reported `"MacIntel"` for legacy compatibility.
- The API that can genuinely answer this — User-Agent Client Hints
  (`navigator.userAgentData.getHighEntropyValues(['architecture'])`) — is
  Chromium-only. Safari and Firefox don't implement it at all, as a deliberate
  anti-fingerprinting stance, so even a correct implementation would silently fail to
  detect architecture for a large share of visitors.

If you ship separate builds per architecture, this component can only get someone to
the right OS, not the right binary — offer an explicit architecture choice on the
linked page rather than relying on detection for it.

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
