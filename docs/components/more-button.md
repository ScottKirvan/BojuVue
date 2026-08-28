# BVMoreButton

A small "···" trigger button that opens a dropdown menu of secondary outbound links —
GitHub repo, report a bug, request a feature, and the like — next to a primary call to
action, without giving those links equal visual weight. Modeled on the pattern used by
Obsidian's community-plugin pages.

Single implementation — `BVMoreButton` has no VitePress-specific needs (it only ever
renders the `items` you give it, no `useData()`, no site data), so unlike
`BVPlatformButton` it isn't split into two builds. Import it from either path; the
`/vitepress` path is just a re-export of the same component, kept there so importing
everything from `@scottkirvan/bojuvue/vitepress` alone is always enough:

```ts
import { BVMoreButton } from '@scottkirvan/bojuvue'
// or, equivalently:
import { BVMoreButton } from '@scottkirvan/bojuvue/vitepress'
```

## Demo

<script setup>
const GITHUB_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.293 0 .32.216.694.824.576C20.565 23.092 24 18.596 24 13.297c0-6.627-5.373-12-12-12z"/></svg>'
const BUG_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5 7 3M15 5l2-2"/><circle cx="12" cy="6" r="2"/><rect x="7" y="8" width="10" height="11" rx="5"/><path d="M7 11H3M21 11h-4M7 14H3M21 14h-4M7 17l-3 3M17 17l3 3"/></svg>'
const LIGHTBULB_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.472c.53.474 1 1.028 1 1.528v1H15v-1c0-.5.47-1.054 1-1.528A6 6 0 0 0 12 2z"/></svg>'
</script>

<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">

<BVPlatformButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

<BVMoreButton
  :items="[
    { label: 'GitHub repo', href: 'https://github.com/ScottKirvan/BojuVue', icon: GITHUB_ICON },
    { label: 'Report a bug', href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md', icon: BUG_ICON },
    { label: 'Request a feature', href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=feature_request.md', icon: LIGHTBULB_ICON },
  ]"
/>

</div>

Try it with a keyboard: focus the "···" button and press `ArrowDown` (jumps to the
first item) or `ArrowUp` (jumps to the last item), then `ArrowDown`/`ArrowUp` to move
between items (wrapping at both ends), `Home`/`End` to jump to the first/last item, and
`Escape` to close and return focus to the trigger.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `BVMoreButtonItem[]` | *(required)* | The menu's contents, in order. See below for the item shape. |
| `icon` | `string` | *(none)* | Raw SVG markup rendered via `v-html` in place of the built-in three-dot icon. Same trust model as `BVPlatformButton.icon`: caller-supplied only, never fed anything dynamic/untrusted. |
| `label` | `string` | `'More options'` | Sets the trigger's `aria-label`. The trigger has no visible text label either way (icon-only), so the accessible name always comes from this prop. |
| `size` | `'medium' \| 'big'` | `'medium'` | Same meaning and default as `BVPlatformButton.size`, so the two sit naturally side by side in an actions row. |
| `theme` | `'brand' \| 'alt' \| 'sponsor'` | `'brand'` | Same meaning and default as `BVPlatformButton.theme`. |

`BVMoreButtonItem`:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | *(required)* | The menu item's visible text. |
| `href` | `string` | *(required)* | The link target. Rendered as a real `<a role="menuitem">`, so Enter-to-activate and middle-click/ctrl-click-to-open-in-new-tab work natively with no extra code. |
| `icon` | `string` | *(none)* | Raw SVG markup rendered via `v-html` next to the label. Caller-authored only — the `items` array is something you write yourself, never unescaped user input. |
| `target` | `string` | *(none)* | Left unset by default so a smart default applies: `target="_blank"` when `href` looks external. Set it explicitly only to override that. |
| `rel` | `string` | *(none)* | Left unset by default so a smart default applies: `rel="noreferrer"` when `href` looks external. Set it explicitly only to override that. |

::: warning `icon` is rendered unescaped
Both the trigger's `icon` and each item's `icon` go through `v-html` with no
sanitization — same trust model as `BVPlatformButton`'s icon. `items` is something you
write yourself, not fetched or user-supplied, so this is safe as long as it stays that
way. Never wire `items` up to anything dynamic without escaping it first.
:::

The trigger renders as a real `<button>` (not an `<a>`) since it has no `href` of its
own — it only ever toggles the menu.

## Styling

Unlike the menu items (real links you author yourself), the trigger reads the same
public `--vp-button-*` CSS custom properties `BVPlatformButton`'s generic build already
reads, with the same fallback values, so the two look like natural siblings in the same
actions row even outside a VitePress site. The dropdown panel reads VitePress's public
`--vp-c-*` design tokens (also with fallback values) for its background, border, and
text color.

## Keyboard behavior

Following the WAI-ARIA menu button pattern:

- **Enter/Space on the trigger** toggles the menu open/closed — native `<button>`
  behavior, no custom handling needed.
- **`ArrowDown` on the trigger while the menu is closed** opens it and moves focus to
  the *first* item. **`ArrowUp`** in the same state opens it and moves focus to the
  *last* item — lets a keyboard user jump straight to the last option without arrowing
  through everything.
- **While the menu is open**, `ArrowDown`/`ArrowUp` move real DOM focus between items,
  wrapping at both ends. `Home`/`End` jump to the first/last item.
- **`Escape`** closes the menu from anywhere inside it and returns focus to the
  trigger.
- **Clicking outside** the component closes the menu, with no focus change.
- **Enter on a focused item** navigates natively — it's a real anchor with real DOM
  focus, so nothing is intercepted.

Deliberately not handled: no auto-close on window blur/tab switch, and no special
handling when a menu item is activated. Ordinary browser navigation already does the
right thing for an outbound link, so there's nothing extra to add there.

## Placement

The panel's preferred alignment is **leading-edge** — its left edge flush with the
trigger's left edge, opening below and to the right. It's still clamped to stay on
screen at any viewport width, computed at open time and recomputed on window resize
*and scroll* while open (the panel is `position: fixed` in viewport coordinates, so
without recomputing on scroll it would stay put while the trigger scrolled away
underneath it) via a three-step algorithm:

1. Try leading-edge (`panelLeft = triggerLeft`). Use it if it doesn't clip past the
   right edge of the viewport.
2. Otherwise flip to trailing-edge (`panelLeft = triggerRight - panelWidth`) — this is
   what kicks in when the trigger sits close to the right edge of the viewport. Use it
   if it doesn't clip past the left edge.
3. Otherwise (the viewport is narrower than the panel) clamp the panel inside the
   viewport as a last resort.

The logic behind this lives in the plain (non-Vue) `computeMenuPanelLeft` function, in
`src/moreButtonMenu.ts` if you want to read it directly.

## Spacing

Like `BVPlatformButton`, `BVMoreButton` claims no margin on itself — spacing between it
and a neighboring primary CTA is a caller/layout concern. Use a flex container with
`gap`, the way the demo above is wrapped.

## Explicitly out of scope

- **No VitePress-aware convenience.** `items` is always a plain prop you pass in
  explicitly — this component never reads `useData().themeConfig.socialLinks` or
  anything else VitePress-specific for you. You always know exactly what's in the
  menu, because you're the one who put it there.
- **No nested/submenu items.** Every item is a flat, single-level link.
- **No manifest/remote-fetched items.** `items` is always something the caller already
  has in hand — no async state, no loading state to design for.

## Usage

```vue
<script setup>
import { BVMoreButton, BVPlatformButton } from '@scottkirvan/bojuvue/vitepress'
</script>

<template>
  <div style="display: flex; gap: 12px; align-items: center;">
    <BVPlatformButton fallback-href="https://github.com/your-org/your-repo/releases" />

    <BVMoreButton
      :items="[
        {
          label: 'GitHub repo',
          href: 'https://github.com/your-org/your-repo',
          icon: "<svg viewBox='0 0 24 24' width='16' height='16'>...</svg>",
        },
        { label: 'Report a bug', href: 'https://github.com/your-org/your-repo/issues/new' },
      ]"
    />
  </div>
</template>
```

With a custom icon, label, theme, and size:

```vue
<BVMoreButton
  label="Plugin options"
  theme="alt"
  size="big"
  icon="<svg viewBox='0 0 24 24' width='16' height='16'><path d='M12 2 2 22h20z'/></svg>"
  :items="items"
/>
```
