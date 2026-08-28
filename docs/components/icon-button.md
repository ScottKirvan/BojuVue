<script setup>
const GEAR_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
const DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
</script>

# BVIconButton

`BVButton` plus an optional icon. Composes `BVButton` internally rather than
reimplementing its skin — with no `icon` given, `BVIconButton` behaves exactly like a
plain `BVButton`. Reach for this instead of `BVButton` whenever a button needs an icon,
either alongside its label or, with no label at all, as a small fixed-size icon-only
trigger.

## Two import paths

`BVIconButton` ships as two separate builds, exposed as two separate import paths from
the same package — pick whichever matches your site:

```ts
// Generic Vue implementation. Works in any Vue 3 app. Wraps the generic,
// hand-rolled BVButton for both icon-only and icon+text modes.
import { BVIconButton } from '@scottkirvan/bojuvue'

// VitePress-specific implementation. Same component name and props.
// Icon+text mode wraps VitePress's own real VPButton, with the icon
// overlaid on it. Icon-only mode reuses the *generic* hand-rolled
// BVButton instead, since VPButton has no icon-only concept (its `text`
// prop is required, no icon prop or slot).
import { BVIconButton } from '@scottkirvan/bojuvue/vitepress'
```

If you're building a VitePress site, use the `/vitepress` path — that's what this
site's own demo below uses. Use the bare package path when you're embedding
`BVIconButton` in a plain Vue 3 app with no VitePress install.

`vitepress` is an *optional* peer dependency — installing `@scottkirvan/bojuvue` alone
(importing only the bare package path) never requires `vitepress` to be installed.
Only importing from `@scottkirvan/bojuvue/vitepress` does.

## Demo

<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">

<BVIconButton text="Settings" :icon="GEAR_ICON" href="/components/" />
<BVIconButton text="Download" theme="alt" size="big" :icon="DOWNLOAD_ICON" href="/components/" />
<BVIconButton :icon="GEAR_ICON" label="Settings" href="/components/" />
<BVIconButton :icon="DOWNLOAD_ICON" label="Download" theme="sponsor" size="big" href="/components/" />
<BVIconButton label="No icon given" href="/components/" />

</div>

The first two are icon+text mode — the icon renders on the button itself, not beside
it. The next two are icon-only mode (no `text`) — a fixed-size box, sized by `size`
the same way regardless of theme. The last has no `icon` at all, so it's an empty
fixed-size box; icon-only mode still needs an `icon` (or at minimum a `label` for
screen readers) to be useful on its own. All five link to this same page here in the
demo, so every one of them is a real, clickable link.

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `text` | `string` | no | *(none)* | Visible button label. Unlike `BVButton` (where this is required), leaving it unset — or passing an empty string (`text=""`) — switches to icon-only mode instead. |
| `icon` | `string` | no | *(none)* | Raw SVG markup rendered via `v-html`. Always rendered on the button itself, not beside it: with `text`, it's overlaid on the button's left edge and the button's own left padding widens to make room for it; without `text` (icon-only mode), it's centered on top of the fixed-size button. Caller-supplied only — see the warning below. |
| `label` | `string` | no | *(none)* | Sets the button's `aria-label`. Only applied in icon-only mode (no `text`) — with visible text, the accessible name comes from that text content instead, so this prop is ignored rather than layered on top. Same meaning as `BVMoreButton.label`. |
| `href` | `string` | no | *(none)* | When given, renders as an `<a>`; when omitted, renders as a `<button>` — same auto-detection as `BVButton`. |
| `size` | `'medium' \| 'big'` | no | `'medium'` | Matches `BVButton`'s own `size` prop and defaults. In icon-only mode, also sets the fixed box's pixel dimensions: `'medium'` is 38×38px, `'big'` is 46×46px. |
| `theme` | `'brand' \| 'alt' \| 'sponsor'` | no | `'brand'` | Matches `BVButton`'s own `theme` prop and defaults. |
| `target` | `string` | no | *(none)* | Left unset by default so a smart default applies: `target="_blank"` when `href` is external. Set it explicitly only to override that. |
| `rel` | `string` | no | *(none)* | Left unset by default so a smart default applies: `rel="noreferrer"` when `href` is external. Set it explicitly only to override that. |
| `tag` | `string` | no | *(none)* | Escape hatch to force a specific rendered tag regardless of `href` — same meaning as `BVButton.tag`. |

::: warning `icon` is rendered unescaped
`icon` goes through `v-html` with no sanitization — caller-supplied only, never fed
anything dynamic or user-supplied.
:::

## Icon-only mode

With no `text` (or `text=""`), `BVIconButton` renders a fixed, equal-width/height box
instead of an auto-width pill — `size` still selects the same 38px/46px dimensions as
`BVMoreButton`'s own icon-only trigger. The shape that results (circular today) is an
outcome of the underlying button skin's `border-radius`, not something icon-only mode
itself requires — it changes freely if that CSS ever changes.

Icon-only mode has no default icon or label of its own; both are left to the caller
(see `BVMoreButton`'s built-in three-dot icon and `'More options'` default for an
example of a component that layers its own defaults on top of `BVIconButton`).

## Usage

```vue
<script setup>
import { BVIconButton } from '@scottkirvan/bojuvue/vitepress'

const SETTINGS_ICON = "<svg viewBox='0 0 24 24' width='16' height='16'>...</svg>"
</script>

<template>
  <!-- icon+text -->
  <BVIconButton text="Settings" :icon="SETTINGS_ICON" href="/settings" />

  <!-- icon-only -->
  <BVIconButton :icon="SETTINGS_ICON" label="Settings" @click="openSettings" />

  <!-- no icon at all — behaves exactly like BVButton -->
  <BVIconButton text="Submit" @click="onSubmit" />
</template>
```

In any other Vue 3 app (no `vitepress` install required):

```vue
<script setup>
import { BVIconButton } from '@scottkirvan/bojuvue'
</script>

<template>
  <BVIconButton text="Settings" :icon="SETTINGS_ICON" href="/settings" />
</template>
```

## Spacing

Like `BVButton`, `BVPlatformButton`, and `BVMoreButton`, `BVIconButton` claims no
margin on itself — spacing between it and its neighbors is a caller/layout concern
(flex + `gap`, as in the demo above), not something the component bakes in.
