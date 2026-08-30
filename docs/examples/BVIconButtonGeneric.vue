<script setup>
import { BVIconButton } from '@scottkirvan/bojuvue'

const SETTINGS_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'

// BVIconButton has no idea it's running inside VitePress, so a
// site-relative href needs this site's own base prefixed onto it
// manually — a plain hardcoded "/components/" would 404 on any
// deployment not mounted at the domain root. import.meta.env.BASE_URL is
// Vite's own env var, not a vitepress-specific API, so it's fair to use
// in this generic example (see BVButtonGeneric.vue for the same pattern).
const siteBase = import.meta.env.BASE_URL
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
    <BVIconButton text="Settings" :icon="SETTINGS_ICON" :href="`${siteBase}components/`" />
    <BVIconButton :icon="SETTINGS_ICON" label="Settings" :href="`${siteBase}components/`" />
    <BVIconButton text="Submit" />
  </div>
</template>
