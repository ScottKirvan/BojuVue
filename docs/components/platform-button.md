# BVPlatformButton

Detects the visitor's platform (Windows, macOS, Linux, Android, iOS, or ChromeOS) and
links to the matching download from a JSON manifest you host. With no `fallbackHref`
given, it hides itself entirely when there's nothing to link to — no promising a
download that doesn't exist for this visitor's platform.

Internally, both import paths render their resolved link/label through
[`BVIconButton`](./icon-button) (passing its own `icon` straight through) rather than
owning link markup or button-skin CSS themselves — this is an implementation detail,
not a change to any prop or documented behavior below.

## Two import paths

`BVPlatformButton` ships as two separate builds, exposed as two separate import paths
from the same package — pick whichever matches your site:

```ts
// Generic Vue implementation. Works in any Vue 3 app. Resolves manifestUrl
// relative to a `base` prop you supply yourself (see below) — pass nothing
// and it's treated as an empty base. Renders its own hand-rolled styling,
// since it can't depend on `vitepress` at all.
import { BVPlatformButton } from 'bojuvue'

// VitePress-specific implementation. Same component name and (almost) the
// same props, plus it resolves `base` for you from VitePress's own
// `useData().site.value.base`, so you never pass it yourself. Renders
// through VitePress's own real `VPButton`, so it gets VitePress's real
// theme styling for free.
import { BVPlatformButton } from 'bojuvue/vitepress'
```

If you're building a VitePress site, use the `/vitepress` path — that's what this
site's own demo below uses, and you get real VitePress theme styling for free. Use
the bare package path when you're embedding `BVPlatformButton` in a plain Vue 3 app
with its own manifest-hosting setup, where there's no VitePress `useData()` to read a
base path from.

`vitepress` is an *optional* peer dependency — installing `bojuvue`
alone (importing only the bare package path) never requires `vitepress` to be
installed. Only importing from `bojuvue/vitepress` does.

Everything else this package exports — `detectPlatform`, `resolveDownload`,
`resolveManifestUrl`, `defaultLabels`, and the `BV`-prefixed types — is reachable
from *both* paths. If you're already importing from `/vitepress` for the component,
you don't need a second import from the bare package for these; the `/vitepress`
entry re-exports everything the bare package has.

## Demo

This site's own `docs/public/platformButton.json` is used below — open dev tools and
override `navigator.platform`/`navigator.userAgent` to see the label and link change.
It has an entry for every platform, so both buttons below link to a real page no
matter which platform gets detected:

<div style="display: flex; flex-wrap: wrap; gap: 12px;">

<BVPlatformButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

<BVPlatformButton />

</div>

To see the "no matching platform" case — the second button above hiding itself
instead of showing a link — remove the entry for whichever platform you're testing
from out of your own manifest, then reload. Or read the `resolveDownload` tests in
`src/platform.test.ts`, which cover it directly.

## Props

The two import paths style themselves differently:

- **`bojuvue/vitepress`** delegates its rendering to `BVIconButton` (the
  `/vitepress` implementation), which in icon+text mode wraps VitePress's own real
  `VPButton` component (`vitepress/theme`'s public export). `size`, `theme`, `target`,
  and `rel` below are passed straight through, with the same meaning and defaults
  `VPButton` itself gives them, and the button gets real VitePress theme styling for
  free — no CSS of its own beyond positioning the icon.
- **`bojuvue`** can't depend on `vitepress` at all, so it can't use
  `VPButton`. It delegates its rendering to the generic `BVIconButton`, which in turn
  renders through the generic [`BVButton`](./button) — hand-rolled markup and
  `<style scoped>` CSS that approximates the same look by reading the same *public,
  documented* `--vp-button-*` CSS custom properties VitePress itself exposes for
  theming, each with a fallback value so the button still looks like a clickable
  button outside a VitePress site (where those variables are undefined). `size`/
  `theme` below apply the equivalent modifier classes to that markup rather than to a
  real `VPButton`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `base` | `string` | `''` | **`bojuvue` only** — not exposed on the VitePress-specific implementation, which resolves this for you from `useData().site.value.base`. Site base path a site-relative `manifestUrl` is resolved against. Only relevant if you're embedding the generic implementation directly in a non-VitePress Vue app with its own base-path concept. |
| `manifestUrl` | `string` | `'platformButton.json'` | Path to the manifest. Either a site-relative path, resolved relative to `base` (so it works the same in local dev and in production), or a full absolute URL (`https://...`/`http://...`), fetched as-is with no `base` prefixing — useful when the manifest is hosted on another origin or CDN rather than alongside the docs site itself. Reactive — changing it after mount re-fetches. |
| `fallbackHref` | `string` | *(none)* | Link used when the platform can't be detected, the manifest fetch fails (including a non-2xx response), or the manifest has no entry for the detected platform. **Omit this to hide the button entirely** in those cases instead of showing a generic link. |
| `fallbackLabel` | `string` | `'View Downloads'` | Button label used alongside `fallbackHref`. |
| `size` | `'medium' \| 'big'` | `'medium'` | On `/vitepress`, passed straight through to `VPButton`'s own `size` prop. On the bare package, applied as the equivalent modifier class on this component's own markup. |
| `theme` | `'brand' \| 'alt' \| 'sponsor'` | `'brand'` | On `/vitepress`, passed straight through to `VPButton`'s own `theme` prop. On the bare package, applied as the equivalent modifier class on this component's own markup. |
| `target` | `string` | *(none)* | Left unset by default so a smart default applies: `target="_blank"` when the resolved link is external (via `VPButton`'s own detection on `/vitepress`, or an equivalent check on the bare package). Set it explicitly only to override that. |
| `rel` | `string` | *(none)* | Left unset by default so a smart default applies: `rel="noreferrer"` when the resolved link is external (via `VPButton`'s own detection on `/vitepress`, or an equivalent check on the bare package). Set it explicitly only to override that. |
| `icon` | `string` | *(none)* | Raw SVG markup rendered via `v-html`, via `BVIconButton`. `VPButton` has no icon support of its own (no prop, no slot), so on both import paths this is a sibling element in the DOM, but positioned on the button itself, not beside it — see [`BVIconButton`'s own docs](./icon-button) for how. Same trust model as VitePress's own home-page `features[].icon`: it's rendered unescaped, so only ever pass something a site author wrote, never anything sourced from the fetched manifest. |

::: warning `icon` is rendered unescaped
`icon` goes through `v-html` with no sanitization — same trust model as VitePress's
own home-page `features[].icon`. Only ever pass markup a site author wrote by hand.
Never pass anything sourced from the fetched manifest or any other runtime/user input
— that's an XSS vector, not a theoretical one.
:::

The rendered element is always an anchor (`<a>`) — never a `<button>` — since `href`
always comes from `resolveDownload`'s resolved logic (which never returns an
empty-string `href`). Both import paths force `tag="a"` through to `BVIconButton`
regardless, the same reasoning VitePress's own `VPHero.vue` uses when it already knows
it has a link, rather than relying on `BVButton`'s own `href`-driven auto-detection.

`BVPlatformId` is `'windows' \| 'macos' \| 'linux' \| 'android' \| 'ios' \| 'chromeos'`.
`BVPlatformId`, `BVPlatformEntry`, and `BVPlatformManifest` (see below) are exported
from both import paths if you're generating a manifest programmatically and want the
types. `detectPlatform`, `resolveDownload`, `resolveManifestUrl`, and `defaultLabels`
— the primitives this component is built from — are exported too, from both paths,
in case you want to build your own platform-branching UI (a keyboard-shortcut hint
that shows `⌘K` vs `Ctrl+K`, OS-specific install instructions, browser-extension-store
links, etc.) without using `BVPlatformButton` itself.

## The manifest file

A plain JSON file, publicly reachable at `manifestUrl` (typically something your
release process writes to your site's public directory on each release, independent
of your site's own build).

`manifestUrl` accepts either a site-relative path (the default,
`'platformButton.json'`, resolved against the site's VitePress `base`) or a full
absolute URL. A value starting with `http://` or `https://` is fetched exactly as
given — the site's `base` is never prepended to it, so pointing at a manifest hosted
on a separate origin or CDN works without the `base` path mangling the URL:

::: tip Hosting the manifest off-origin
Point `manifestUrl` at a full URL (CDN, separate release-artifacts host, whatever)
when you want to update download links without touching the docs site's own deploy —
the absolute-URL path skips `base` resolution entirely, so it works identically in
local dev and production.
:::

```vue
<!-- Site-relative: resolved against the site's base -->
<BVPlatformButton manifest-url="platformButton.json" />

<!-- Absolute: fetched as-is, base is not prepended -->
<BVPlatformButton manifest-url="https://cdn.example.com/platformButton.json" />
```

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

`navigator.platform` is formally deprecated, and browsers are already
freezing/limiting what it reports for anti-fingerprinting reasons. Windows, macOS, and
Linux detection each fall back to a `navigator.userAgent` check when `platform`
doesn't identify them — the same pattern iOS/Android detection above already relies
on. Those fallback checks run after the Android and iOS checks, for the same
overlapping-signal reasons: Android's user agent contains "Linux", and iPadOS's
contains "Macintosh".

If nothing matches — an unrecognized platform, a bot, a browser that doesn't expose
enough information — detection resolves to "unknown" rather than guessing. That's
treated exactly the same as a recognized platform with no manifest entry: hidden with
no `fallbackHref`, or `fallbackHref` shown if one was given.

## Limitations

::: info CPU architecture is not detected
x64 vs. ARM64/Apple Silicon, Windows on ARM, etc. is **not** detected, and can't be
reliably detected client-side across browsers today:

- `navigator.platform` doesn't expose it, and on Apple Silicon Macs it has
  historically still reported `"MacIntel"` for legacy compatibility.
- The API that can genuinely answer this — User-Agent Client Hints
  (`navigator.userAgentData.getHighEntropyValues(['architecture'])`) — is
  Chromium-only. Safari and Firefox don't implement it at all, as a deliberate
  anti-fingerprinting stance, so even a correct implementation would silently fail to
  detect architecture for a large share of visitors.
:::

If you ship separate builds per architecture, this component can only get someone to
the right OS, not the right binary — offer an explicit architecture choice on the
linked page rather than relying on detection for it.

## Spacing

`BVPlatformButton` claims no margin on itself — spacing between it and its neighbors
(another instance placed next to it, a surrounding layout slot, etc.) is a caller/
layout concern, not something the component bakes in. Use a flex container with `gap`
around sibling instances, the way the two demo buttons above are wrapped:

```vue
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
  <BVPlatformButton ... />
  <BVPlatformButton ... />
</div>
```

`gap` is the idiomatic CSS-native way to space siblings — unlike margin, it correctly
skips the gap before the first element and after the last, so it doesn't need any
first-/last-child exceptions to look right.

## Usage

In a VitePress site (resolves `base` for you):

```vue
<script setup>
import { BVPlatformButton } from 'bojuvue/vitepress'
</script>

<template>
  <!-- Shows nothing on platforms with no manifest entry -->
  <BVPlatformButton manifest-url="platformButton.json" />

  <!-- Always shows something, even on unmatched platforms -->
  <BVPlatformButton
    manifest-url="platformButton.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
  />

  <!-- theme/size mirror VPButton; icon renders raw SVG on the button itself -->
  <BVPlatformButton
    manifest-url="platformButton.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
    theme="alt"
    size="big"
    icon="<svg viewBox='0 0 24 24' width='16' height='16'><path d='M12 2 2 22h20z'/></svg>"
  />
</template>
```

In any other Vue 3 app (no `vitepress` install required — pass `base` yourself if
`manifestUrl` is site-relative and your app is served from a non-root path):

```vue
<script setup>
import { BVPlatformButton } from 'bojuvue'
</script>

<template>
  <BVPlatformButton
    base="/my-app/"
    manifest-url="platformButton.json"
    fallback-href="https://github.com/your-org/your-repo/releases"
  />
</template>
```
