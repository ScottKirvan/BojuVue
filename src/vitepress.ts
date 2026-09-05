// Re-exports everything the `.` entry has, plus its own VitePress-specific
// implementation — so a VitePress site developer never needs to remember
// which of the two paths a given export lives on; importing from here alone
// is always enough. The one name that isn't a re-export is `BVPlatformButton`
// itself: this is a fully independent VitePress-specific implementation
// (reads `useData().site` itself and renders through VitePress's own
// `VPButton`), not a wrapper around the generic implementation exported from
// `./index`, so it's exported directly from `./vitepress/BVPlatformButton.vue`
// rather than via `export * from './index'`, which would otherwise collide
// on that name.
export { detectPlatform, resolveDownload, resolveManifestUrl, defaultLabels } from './platform'
export type { BVPlatformData, BVPlatformEntry, BVPlatformId, BVPlatformManifest } from './platform'
export type { BVPlatformButtonProps } from './BVPlatformButton.types'
export { default as BVPlatformButton } from './vitepress/BVPlatformButton.vue'

// BVButton has real VitePress-specific needs (rendering through the real
// VPButton) — like BVPlatformButton above, and unlike BVMoreButton below,
// it's a fully independent implementation exported directly from
// ./vitepress/BVButton.vue, not a re-export of the generic one.
export type { BVButtonProps } from './BVButton.types'
export { default as BVButton } from './vitepress/BVButton.vue'

// BVIconButton also has real VitePress-specific needs (its icon+text mode
// renders through the real VPButton via ./vitepress/BVButton.vue) — same
// shape as BVButton above, a fully independent implementation, not a
// re-export of the generic one.
export type { BVIconButtonProps } from './BVIconButton.types'
export { default as BVIconButton } from './vitepress/BVIconButton.vue'

// BVMoreButton's own logic (items/menu panel, keyboard handling, placement)
// has no VitePress-specific needs, but its trigger renders through
// BVIconButton — like BVButton/BVIconButton above, that means a fully
// independent implementation exported directly from
// ./vitepress/BVMoreButton.vue, not a re-export of the generic one, so text
// mode gets real VPButton styling automatically.
export type { BVMoreButtonItem, BVMoreButtonProps } from './BVMoreButton.types'
export { default as BVMoreButton } from './vitepress/BVMoreButton.vue'
