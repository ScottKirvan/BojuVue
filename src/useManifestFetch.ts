import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { BVPlatformManifest } from './platform'

// Shared by both the generic Vue implementation (`./BVPlatformButton.vue`)
// and the VitePress-specific implementation
// (`./vitepress/BVPlatformButton.vue`) — each calls this independently with
// its own reactive URL getter. This is a shared utility, not a relationship
// between the two components: neither imports or renders the other.
//
// `getUrl` is read reactively (as a Vue `watch` getter) so a caller can
// derive the URL from whatever reactive state it has (props, a VitePress
// `useData()` value, etc.) without this module knowing anything about where
// that state comes from.
export function useManifestFetch(getUrl: () => string) {
  const manifest = ref<BVPlatformManifest | null>(null)

  let activeFetch: AbortController | null = null

  async function load() {
    activeFetch?.abort()
    const controller = new AbortController()
    activeFetch = controller

    try {
      const res = await fetch(getUrl(), { signal: controller.signal })
      manifest.value = res.ok ? await res.json() : null
    } catch {
      // A request aborted because it was superseded by a newer one (the URL
      // changed again, or the caller unmounted) isn't a real failure — don't
      // let a stale in-flight abort clobber state a newer request may
      // already have written.
      if (controller.signal.aborted) return
      manifest.value = null
    }
  }

  onMounted(load)

  // The URL can change after mount — e.g. a VitePress site's base path can
  // change on a locale switch, or `manifestUrl` itself can change — so
  // re-fetch whenever it does, rather than only ever fetching once on mount.
  watch(getUrl, load)

  onUnmounted(() => activeFetch?.abort())

  return { manifest }
}
