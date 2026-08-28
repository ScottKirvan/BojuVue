// Shared prop surface for both the generic Vue implementation of `BVButton`
// (`./BVButton.vue`) and the VitePress-specific implementation
// (`./vitepress/BVButton.vue`) — kept in its own module, separate from either
// `.vue` file, so it can be imported by both without either pulling in the
// other's concerns. Framework-agnostic: no import from 'vitepress' here.
//
// Deliberately exactly VitePress's own VPButton prop shape (see
// node_modules/vitepress/dist/client/theme-default/components/VPButton.vue)
// — `tag` is typed as a plain `string` to match VPButton's own untyped
// choice, not narrowed to `'a' | 'button'`, since callers may still want to
// force some other tag through it exactly as VPButton itself allows.
export interface BVButtonProps {
  text: string
  href?: string
  target?: string
  rel?: string
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  tag?: string
}
