// Re-exports everything the `.` entry has, plus its own VitePress-specific
// implementations — so a VitePress site developer never needs to remember
// which of the two paths a given export lives on; importing from here alone
// is always enough. `BVPlatformButton` and `BVMoreButton` are each a fully
// independent VitePress-specific implementation, not a wrapper around the
// generic one exported from `./index`, so both are exported directly from
// their own `./vitepress/*.vue` file rather than via `export * from
// './index'`, which would otherwise collide on those names.
export { detectPlatform, resolveDownload, resolveManifestUrl, defaultLabels } from './platform'
export type { BVPlatformManifest, BVPlatformEntry, BVPlatformId } from './platform'
export type { BVPlatformButtonProps } from './BVPlatformButton.types'
export { default as BVPlatformButton } from './vitepress/BVPlatformButton.vue'

export type { BVMoreButtonItem, BVMoreButtonProps } from './BVMoreButton.types'
export { default as BVMoreButton } from './vitepress/BVMoreButton.vue'
