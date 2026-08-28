# BVButton

The minimal button primitive this package builds everything button-shaped on top of
— exactly [VitePress's own `VPButton`](https://vitepress.dev/reference/default-theme-home-page)
prop shape, so it works as a drop-in `VPButton`-equivalent outside VitePress too. No
icon support, no platform detection, no dropdown menu — just a label, an optional
link, and a size/theme. Reach for `BVPlatformButton` or `BVMoreButton` instead if you
need those; this is the plain building block.

## Two import paths

`BVButton` ships as two separate builds, exposed as two separate import paths from
the same package — pick whichever matches your site:

```ts
// Generic Vue implementation. Works in any Vue 3 app. Hand-rolled markup and
// <style scoped> CSS that reads the same public --vp-button-* custom
// properties VitePress itself exposes for theming, with a fallback value for
// each so it still looks like a real button outside VitePress.
import { BVButton } from '@scottkirvan/bojuvue'

// VitePress-specific implementation. Same component name and props, thin
// wrapper rendering VitePress's own real VPButton — gets real VitePress
// theme styling for free.
import { BVButton } from '@scottkirvan/bojuvue/vitepress'
```

If you're building a VitePress site, use the `/vitepress` path — that's what this
site's own demo below uses. Use the bare package path when you're embedding
`BVButton` in a plain Vue 3 app with no VitePress install.

`vitepress` is an *optional* peer dependency — installing `@scottkirvan/bojuvue`
alone (importing only the bare package path) never requires `vitepress` to be
installed. Only importing from `@scottkirvan/bojuvue/vitepress` does.

## Demo

<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">

<BVButton text="Brand / medium" href="/components/" />
<BVButton text="Alt / medium" theme="alt" href="/components/" />
<BVButton text="Sponsor / big" theme="sponsor" size="big" href="/components/" />
<BVButton text="No href (button)" />

</div>

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `text` | `string` | yes | — | Visible button label. |
| `href` | `string` | no | *(none)* | When given, renders as an `<a>`; when omitted, renders as a `<button>` — the same auto-detection `VPButton` itself uses. |
| `size` | `'medium' \| 'big'` | no | `'medium'` | Matches `VPButton`'s own `size` prop and defaults. |
| `theme` | `'brand' \| 'alt' \| 'sponsor'` | no | `'brand'` | Matches `VPButton`'s own `theme` prop and defaults. |
| `target` | `string` | no | *(none)* | Left unset by default so a smart default applies: `target="_blank"` when `href` is external (via `VPButton`'s own detection on `/vitepress`, or an equivalent check on the bare package). Set it explicitly only to override that. |
| `rel` | `string` | no | *(none)* | Left unset by default so a smart default applies: `rel="noreferrer"` when `href` is external. Set it explicitly only to override that. |
| `tag` | `string` | no | *(none)* | Escape hatch to force a specific rendered tag regardless of `href` — e.g. `tag="a"` to keep rendering an anchor even when a computed `href` could resolve to an empty string, the same reasoning `BVPlatformButton` uses internally. Matches `VPButton`'s own `tag` prop, which isn't documented as a top-level prop on `BVPlatformButton` either — most callers never need it. |

## Usage

```vue
<script setup>
import { BVButton } from '@scottkirvan/bojuvue/vitepress'
</script>

<template>
  <BVButton text="Get started" href="/guide/" theme="brand" size="big" />
  <BVButton text="Learn more" href="https://example.com" theme="alt" />
  <BVButton text="Submit" @click="onSubmit" />
</template>
```

In any other Vue 3 app (no `vitepress` install required):

```vue
<script setup>
import { BVButton } from '@scottkirvan/bojuvue'
</script>

<template>
  <BVButton text="Get started" href="/guide/" theme="brand" size="big" />
</template>
```

## Spacing

Like `BVPlatformButton` and `BVMoreButton`, `BVButton` claims no margin on itself —
spacing between it and its neighbors is a caller/layout concern (flex + `gap`, as in
the demo above), not something the component bakes in.
