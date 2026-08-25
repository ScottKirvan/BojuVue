<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { detectPlatform, resolveDownload, type DownloadManifest, type PlatformId } from './platform'

const props = withDefaults(
  defineProps<{
    manifestUrl?: string
    fallbackHref: string
    fallbackLabel?: string
    labels?: Partial<Record<PlatformId, string>>
  }>(),
  {
    manifestUrl: 'latest.json',
    fallbackLabel: 'View Downloads',
    labels: () => ({}),
  }
)

const { site } = useData()
const manifest = ref<DownloadManifest | null>(null)
const platform = ref<PlatformId | null>(null)

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
    labels: props.labels,
  })
)
</script>

<template>
  <a class="bv-download-button" :href="download.href" target="_blank" rel="noopener noreferrer">
    {{ download.label }}
  </a>
</template>

<style scoped>
.bv-download-button {
  display: inline-block;
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  text-decoration: none;
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.bv-download-button:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.bv-download-button:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}
</style>
