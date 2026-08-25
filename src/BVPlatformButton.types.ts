// Shared prop surface for both the core `BVPlatformButton` (`./core`) and
// the VitePress adapter (`./vitepress`) — kept in its own module, separate
// from `platform.ts`'s detection/manifest logic, so it can be imported by
// both `.vue` files without either pulling in the other's concerns. Framework
// -agnostic like `platform.ts`: no import from 'vitepress' here either.
export interface BVPlatformButtonProps {
  manifestUrl?: string
  fallbackHref?: string
  fallbackLabel?: string
  // Pass-through to the rendered button, left undefined so its own defaults
  // ('medium' / 'brand') apply when unset.
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  // Pass-through to the rendered button, left undefined so its own
  // external-link auto-detection (target="_blank" + rel="noreferrer")
  // applies when unset.
  target?: string
  rel?: string
  // BVPlatformButton-only addition — raw SVG markup, rendered next to the
  // label via v-html. Caller-supplied only; never feed manifest-sourced
  // content here.
  icon?: string
}
