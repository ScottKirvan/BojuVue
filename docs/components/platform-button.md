# BVPlatformButton

Detects the visitor's platform (Windows, macOS, Linux, Android, iOS, or ChromeOS) and
links to the matching download from a JSON manifest you host. With no `fallbackHref`
given, it hides itself entirely when there's nothing to link to — no promising a
download that doesn't exist for this visitor's platform.

## Demo

This site's own `docs/public/platformButton.json` is used below — open dev tools and
override `navigator.platform`/`navigator.userAgent` to see the label and link change.
It has an entry for every platform, so both buttons below link to a real page no
matter which platform gets detected:

<BVPlatformButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

<BVPlatformButton />

To see the "no matching platform" case — the second button above hiding itself
instead of showing a link — remove a platform's entry from
`docs/public/platformButton.json` locally and reload, or see the `resolveDownload`
tests in `src/platform.test.ts`, which cover it directly.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `manifestUrl` | `string` | `'platformButton.json'` | Path to the manifest, resolved relative to the site's `base` (so it works the same in local dev and in production). |
| `fallbackHref` | `string` | *(none)* | Link used when the platform can't be detected, the manifest fetch fails, or the manifest has no entry for the detected platform. **Omit this to hide the button entirely** in those cases instead of showing a generic link. |
| `fallbackLabel` | `string` | `'View Downloads'` | Button label used alongside `fallbackHref`. |

`BVPlatformId` is `'windows' \| 'macos' \| 'linux' \| 'android' \| 'ios' \| 'chromeos'`.
Both `BVPlatformId` and `BVPlatformEntry` (see below) are exported from
`@scottkirvan/bojuvue` if you're generating a manifest programmatically and want the
types.

## The manifest file

A plain JSON file, publicly reachable at `manifestUrl` (typically something your
release process writes into `docs/public/` on each release, independent of the docs
site's own build):

```json
{
  "windows": { "href": "https://example.com/releases/app-windows.msi", "label": "Get the app" },
  "macos": { "href": "https://example.com/releases/app-macos.dmg" },
  "linux": { "href": "https://example.com/releases/app-linux.tar.gz" },
  "android": { "href": "https://example.com/releases/app-android.apk" },
  "ios": { "href": "https://example.com/releases/app-ios-or-testflight-link" },
  "chromeos": { "href": "https://example.com/releases/app-chromeos.apk" }
}
```

Each top-level key is a `BVPlatformId`; its value is a `{ href, label? }` object —
`href` is required, `label` optionally overrides that platform's default button text
(`windows` above renders "Get the app" instead of the default "Download for Windows").
A label is always attached to the entry it belongs to, not a separate key floating
next to it — there's no way to express "a label with nothing to link to."

The default label used when an entry has no `label`:

| Platform | Default label |
| --- | --- |
| `windows` | Download for Windows |
| `macos` | Download for macOS |
| `linux` | Download for Linux |
| `android` | Get for Android |
| `ios` | Get for iOS |
| `chromeos` | Get for ChromeOS |

This is keyed off the *visitor's detected platform*, not which entry actually
supplied the link — a ChromeOS visitor whose link fell back to the `android` entry
still sees "Get for ChromeOS," since that's what describes them, not the source of
the link. The `fallbackHref` path is separate and always uses `fallbackLabel`
(default `'View Downloads'`) regardless of platform, since a generic fallback link
shouldn't imply anything platform-specific.

Every platform key is optional — omit any you don't ship a build for. Without a
`fallbackHref` prop, a visitor on a platform with no matching key simply won't see the
button.

`chromeos` is the one key with a built-in fallback: ChromeOS runs Android apps, so if
you omit `chromeos` but provide `android`, ChromeOS visitors automatically get the
Android entry. Provide a `chromeos` key yourself only if you publish something
ChromeOS-specific — that choice belongs to whoever's shipping builds, not this
component.

## Platform detection

Detection runs once, after the component mounts — `navigator` isn't available during
VitePress's server-side prerender, so the very first HTML sent to the browser never
has a platform-specific answer yet. What a visitor actually experiences depends on
whether `fallbackHref` was given:

- **With `fallbackHref`:** they see that button immediately on page load. Detection
  and the manifest fetch both finish almost instantly, at which point the button can
  silently update in place to the platform-specific link and label — no flicker, no
  reload, same element.
- **Without `fallbackHref`:** if nothing platform-specific is found, the button never
  appears at all. Not a flash-then-disappear — visitors on an unmatched platform never
  see it in the first place.

Either way, there's no loading state to design for — no spinner, no "detecting your
platform" message.

A couple of platforms need to be checked in a specific order because their signals
overlap:

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
import { BVPlatformButton } from '@scottkirvan/bojuvue'
</script>

<template>
  <!-- Shows nothing on platforms with no manifest entry -->
  <BVPlatformButton manifest-url="platformButton.json" />

  <!-- Always shows something, even on unmatched platforms -->
  <BVPlatformButton
    manifest-url="platformButton.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
  />
</template>
```
