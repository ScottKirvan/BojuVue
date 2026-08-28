<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  detectPlatform,
  resolveDownload,
  resolveManifestUrl,
  type BVPlatformId,
} from './platform'
import { useManifestFetch } from './useManifestFetch'
import BVIconButton from './BVIconButton.vue'

// The prop type is written out inline here (matching `BVPlatformButtonProps`
// in ./BVPlatformButton.types.ts, which is exported for public/programmatic
// use) rather than imported into this macro. `defineProps<T>()` resolving a
// type from another module needs @vue/compiler-sfc to load the `typescript`
// package to parse that module — this repo's docs/ site compiles files
// under repo-root src/ using docs/'s own Vue install, which doesn't carry
// `typescript` as its own dependency (see docs/.vitepress/config.mts's
// cross-directory resolution notes), so that lookup only succeeds when the
// repo root's node_modules happens to be present too. Keeping the type
// fully local avoids that dependency entirely.
const props = withDefaults(
  defineProps<{
    manifestUrl?: string
    fallbackHref?: string
    fallbackLabel?: string
    // Pass-through to the rendered button, left undefined so its own
    // defaults ('medium' / 'brand') apply when unset.
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
    // Site base path to prefix a site-relative `manifestUrl` with. Plain
    // prop — this component has no knowledge of VitePress or any other
    // host framework; the VitePress-specific implementation (`BVPlatformButton`
    // exported from the `./vitepress` entry) resolves this itself (from
    // VitePress's own `useData().site.value.base`) and passes it in the same
    // shape here.
    base?: string
  }>(),
  {
    base: '',
    manifestUrl: 'platformButton.json',
  }
)

const platform = ref<BVPlatformId | null>(null)

const { manifest } = useManifestFetch(() => resolveManifestUrl(props.base, props.manifestUrl))

onMounted(() => {
  platform.value = detectPlatform(typeof navigator === 'undefined' ? undefined : navigator)
})

const download = computed(() =>
  resolveDownload(platform.value, manifest.value, {
    fallbackHref: props.fallbackHref,
    fallbackLabel: props.fallbackLabel,
  })
)
</script>

<template>
  <!--
    download.href never comes back empty (resolveDownload always resolves to
    either a real manifest/fallback href or no match at all), but tag="a" is
    still forced through rather than left to BVButton's own
    tag || (href ? 'a' : 'button') auto-detection — same defensive reasoning
    the VitePress-specific implementation already needs (see the identical
    comment there), kept here too so both implementations honor the same
    documented "always an anchor, never a button" guarantee the same way.
  -->
  <BVIconButton
    v-if="download"
    tag="a"
    :text="download.label"
    :href="download.href"
    :target="target"
    :rel="rel"
    :size="size"
    :theme="theme"
    :icon="icon"
  />
</template>
