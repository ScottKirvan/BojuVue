<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { VPButton } from 'vitepress/theme'
import { detectPlatform, resolveDownload, type BVPlatformManifest, type BVPlatformId } from './platform'

const props = withDefaults(
  defineProps<{
    manifestUrl?: string
    fallbackHref?: string
    fallbackLabel?: string
    // Pass-through to VPButton, left undefined so VPButton's own defaults
    // ('medium' / 'brand') apply when unset.
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
    // Pass-through to VPButton, left undefined so VPButton's own
    // external-link auto-detection (target="_blank" + rel="noreferrer")
    // applies when unset.
    target?: string
    rel?: string
    // BVPlatformButton-only addition — VPButton has no icon support (no
    // prop, no slot). Raw SVG markup, rendered next to the label via
    // v-html — same trust model as VitePress's own VPFeature `icon` prop.
    // Caller-supplied only; never feed manifest-sourced content here.
    icon?: string
  }>(),
  {
    manifestUrl: 'platformButton.json',
  }
)

const { site } = useData()
const manifest = ref<BVPlatformManifest | null>(null)
const platform = ref<BVPlatformId | null>(null)

onMounted(async () => {
  platform.value = detectPlatform(typeof navigator === 'undefined' ? undefined : navigator)
  try {
    const res = await fetch(`${site.value.base}${props.manifestUrl}`)
    manifest.value = await res.json()
  } catch {
    manifest.value = null
  }
})

const download = computed(() =>
  resolveDownload(platform.value, manifest.value, {
    fallbackHref: props.fallbackHref,
    fallbackLabel: props.fallbackLabel,
  })
)
</script>

<template>
  <span v-if="download" class="bv-platform-button">
    <span v-if="icon" class="bv-platform-button-icon" v-html="icon"></span>
    <VPButton
      tag="a"
      :text="download.label"
      :href="download.href"
      :target="target"
      :rel="rel"
      :size="size"
      :theme="theme"
    />
  </span>
</template>

<style scoped>
.bv-platform-button {
  /* No margin/positioning of its own — spacing between this button and its
     neighbors (another instance, a hero actions row, etc.) is a caller/
     layout concern (flex + gap, or a wrapper at the call site), not
     something this component bakes into itself. See #32. */
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bv-platform-button-icon {
  display: inline-flex;
  align-items: center;
}

.bv-platform-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
