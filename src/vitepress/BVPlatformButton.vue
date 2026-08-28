<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import {
  detectPlatform,
  resolveDownload,
  resolveManifestUrl,
  type BVPlatformId,
} from '../platform'
import { useManifestFetch } from '../useManifestFetch'
import BVIconButton from './BVIconButton.vue'

// The prop type is written out inline here (matching `BVPlatformButtonProps`
// in ../BVPlatformButton.types.ts, which is exported for public/programmatic
// use, and the prop type in the generic Vue implementation at
// ../BVPlatformButton.vue) rather than imported into this macro — see the
// matching comment there for why: an imported type in this macro position
// needs the `typescript` package resolvable from here, which breaks under
// this repo's docs/ cross-directory source build when the repo root's
// node_modules isn't present.
const props = withDefaults(
  defineProps<{
    manifestUrl?: string
    fallbackHref?: string
    fallbackLabel?: string
    // Pass straight through to BVIconButton (and on to the real VPButton),
    // left undefined so its own defaults ('medium' / 'brand') apply when
    // unset.
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
    // Pass straight through to BVIconButton (and on to the real VPButton),
    // left undefined so its own external-link auto-detection
    // (target="_blank" + rel="noreferrer") applies when unset.
    target?: string
    rel?: string
    // BVPlatformButton-only addition — raw SVG markup, rendered next to
    // BVIconButton's own output via v-html. VPButton has no icon support of
    // its own (no prop, no slot). Caller-supplied only; never feed
    // manifest-sourced content here.
    icon?: string
  }>(),
  {
    manifestUrl: 'platformButton.json',
  }
)

const { site } = useData()
// Read explicitly here rather than leaning on template auto-unwrap of
// `site` (a ref) — keeps the base-resolution behavior in one place that's
// straightforward to unit test regardless of how faithfully a test double
// for `useData()` reproduces Vue's real ref semantics.
const base = computed(() => site.value.base)

const platform = ref<BVPlatformId | null>(null)

const { manifest } = useManifestFetch(() => resolveManifestUrl(base.value, props.manifestUrl))

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
    tag="a" is forced through the same way VitePress's own VPHero.vue
    hardcodes it when it already knows it has a link: the underlying
    VPButton's own auto-detection (`props.tag || (props.href ? 'a' :
    'button')`) treats an empty-string href as falsy, and `download.href`
    here comes from resolved logic (resolveDownload), not a hand-written
    string — without forcing tag="a", that auto-detection could silently
    render an inert <button> instead of a broken-but-still-a-link <a>.
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
