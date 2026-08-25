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
export type { BVPlatformManifest, BVPlatformEntry, BVPlatformId } from './platform'
export type { BVPlatformButtonProps } from './BVPlatformButton.types'
export { default as BVPlatformButton } from './vitepress/BVPlatformButton.vue'
