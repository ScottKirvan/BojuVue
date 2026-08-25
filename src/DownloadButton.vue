<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'chromeos'

// Expected shape of the JSON file at `manifestUrl`:
// { "version": "1.2.3", "windows": "https://...", "macos": "https://...", ... }
// Every platform key is optional — omit any you don't ship a build for.
export type DownloadManifest = { version?: string } & Partial<Record<PlatformId, string>>

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

const defaultLabels: Record<PlatformId, string> = {
  windows: 'Download for Windows',
  macos: 'Download for macOS',
  linux: 'Download for Linux',
  android: 'Get for Android',
  ios: 'Get for iOS',
  chromeos: 'Get for ChromeOS',
}

// iOS check must precede macOS: iPadOS reports navigator.platform as
// "MacIntel" and is only distinguishable via touch support. Android must
// precede Linux: Android's navigator.platform is often "Linux armv8l".
function detectPlatform(): PlatformId | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  const platform = navigator.platform || ''
  const isIPadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  if (/CrOS/i.test(ua)) return 'chromeos'
  if (/Win/i.test(platform)) return 'windows'
  if (/Mac/i.test(platform)) return 'macos'
  if (/Linux/i.test(platform)) return 'linux'
  return null
}

const { site } = useData()
const manifest = ref<DownloadManifest | null>(null)
const platform = ref<PlatformId | null>(null)

onMounted(async () => {
  platform.value = detectPlatform()
  try {
    const res = await fetch(`${site.value.base}${props.manifestUrl}`)
    manifest.value = await res.json()
  } catch {
    manifest.value = null
  }
})

const href = computed(() => {
  if (!manifest.value || !platform.value) return props.fallbackHref
  // ChromeOS runs Android apps — fall back to the Android build if no
  // ChromeOS-specific one is published.
  const link =
    platform.value === 'chromeos'
      ? (manifest.value.chromeos ?? manifest.value.android)
      : manifest.value[platform.value]
  return link ?? props.fallbackHref
})

const label = computed(() => {
  if (!platform.value) return props.fallbackLabel
  return props.labels[platform.value] ?? defaultLabels[platform.value]
})
</script>

<template>
  <a class="bv-download-button" :href="href" target="_blank" rel="noopener noreferrer">
    {{ label }}
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
