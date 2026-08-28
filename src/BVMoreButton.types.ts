// Shared prop surface for BVMoreButton, kept in its own module the same way
// BVPlatformButtonProps is — see BVPlatformButton.types.ts. Framework-
// agnostic: no import from 'vitepress' here.
export interface BVMoreButtonItem {
  label: string
  href: string
  // Caller-authored only, never fed unescaped user input — rendered via
  // v-html the same way BVPlatformButton.icon is.
  icon?: string
  // Left unset so the same smart external-link target/rel default
  // BVPlatformButton uses applies per item; an explicit value overrides it.
  target?: string
  rel?: string
}

export interface BVMoreButtonProps {
  items: BVMoreButtonItem[]
  // Overrides the built-in three-dot icon via v-html. Caller-supplied only.
  // Ignored (no icon rendered) when `text` is set without also setting this.
  icon?: string
  // Visible trigger text. Unset by default (icon-only trigger, fixed
  // circular size). Given, the trigger switches to an auto-width layout
  // showing `icon` (if also given) next to this text.
  text?: string
  // Sets the trigger's aria-label. Only applied when there's no visible
  // `text` — with visible text, the accessible name comes from that text
  // content instead.
  label?: string
  // Pass-through to the rendered trigger, left undefined so its own
  // defaults ('medium' / 'brand') apply when unset — same meaning as
  // BVPlatformButton's identically named props, for visual parity.
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
}
