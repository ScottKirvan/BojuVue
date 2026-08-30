<script setup>
import { BVButton } from '@scottkirvan/bojuvue'

// BVButton has no idea it's running inside VitePress, so a site-relative
// href needs this site's own base prefixed onto it manually — a plain
// hardcoded "/guide/" would 404 on any deployment not mounted at the
// domain root. import.meta.env.BASE_URL is Vite's own env var (reflecting
// whatever `base` the surrounding site's Vite/VitePress config sets), not
// a vitepress-specific API, so it's fair to use in this generic example.
const siteBase = import.meta.env.BASE_URL
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
    <BVButton text="Get started" :href="`${siteBase}guide/`" theme="brand" size="big" />
    <BVButton text="Learn more" href="https://example.com" theme="alt" />
    <BVButton text="No href (button)" />
  </div>
</template>
