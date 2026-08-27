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

<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">

<BVPlatformButton fallback-href="https://github.com/ScottKirvan/BojuVue/releases" />

<BVMoreButton
  :items="[
    { label: 'GitHub repo', href: 'https://github.com/ScottKirvan/BojuVue' },
    { label: 'Report a bug', href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md' },
    { label: 'Request a feature', href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=feature_request.md' },
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
handling when a menu item is activated (ordinary browser navigation is enough for
outbound links). Nothing was asked for there, so nothing was invented.

## Placement

The panel's preferred alignment is **trailing-edge** — its right edge flush with the
trigger's right edge. It's still clamped to stay on screen at any viewport width,
computed at open time (and recomputed on window resize while open) via a three-step
algorithm:

1. Try trailing-edge (`panelLeft = triggerRight - panelWidth`). Use it if it doesn't
   clip past the left edge of the viewport.
2. Otherwise flip to leading-edge (`panelLeft = triggerLeft`). Use it if it doesn't
   clip past the right edge.
3. Otherwise (the viewport is narrower than the panel) clamp the panel inside the
   viewport as a last resort.

This is a pure, DOM-free function (`computeMenuPanelLeft` in `src/moreButtonMenu.ts`),
unit-tested directly rather than only indirectly through the component.

## Spacing

Like `BVPlatformButton`, `BVMoreButton` claims no margin on itself — spacing between it
and a neighboring primary CTA is a caller/layout concern. Use a flex container with
`gap`, the way the demo above is wrapped.

## Explicitly out of scope

- **No VitePress-aware convenience.** `items` is always a plain prop you pass in
  explicitly — this component never reads `useData().themeConfig.socialLinks` or
  anything else VitePress-specific for you. Considered and rejected: it would have
  been a different tone than "you always say exactly what the menu contains."
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
        { label: 'GitHub repo', href: 'https://github.com/your-org/your-repo' },
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
