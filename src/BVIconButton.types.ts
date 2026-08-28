// Shared prop surface for both the generic Vue implementation of
// `BVIconButton` (`./BVIconButton.vue`) and the VitePress-specific
// implementation (`./vitepress/BVIconButton.vue`) — kept in its own module,
// separate from either `.vue` file, so it can be imported by both without
// either pulling in the other's concerns. Framework-agnostic: no import
// from 'vitepress' here.
//
// Everything `BVButtonProps` has, plus `icon` and `label`. `text` is
// optional here even though `BVButtonProps.text` is required — an unset or
// empty `text` is exactly what selects icon-only mode (see BVIconButton.vue
// for the rendering split), so this is a deliberate widening of the shape,
// not an oversight.
export interface BVIconButtonProps {
  text?: string
  href?: string
  target?: string
  rel?: string
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  tag?: string
  // Raw SVG markup rendered via v-html. Caller-supplied only, same trust
  // model as `BVPlatformButton.icon` — never feed anything dynamic/
  // untrusted here. Optional: with none given, `BVIconButton` behaves
  // exactly like a plain `BVButton`.
  icon?: string
  // Sets the rendered button's aria-label. Only applied in icon-only mode
  // (no `text`) — with visible text, the accessible name comes from that
  // text content instead, so this prop is ignored rather than layered on
  // top. Same meaning as `BVMoreButton.label`.
  label?: string
}
