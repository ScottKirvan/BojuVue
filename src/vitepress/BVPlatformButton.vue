<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import BVPlatformButton from '../core/BVPlatformButton.vue'

// Mirrors `BVPlatformButtonProps` in ../BVPlatformButton.types.ts (also the
// core component's own prop type) as an inline literal rather than an
// imported one — see the matching comment in ../core/BVPlatformButton.vue
// for why: an imported type in this macro position needs the `typescript`
// package resolvable from here, which breaks under this repo's docs/
// cross-directory source build when the repo root's node_modules isn't
// present.
const props = defineProps<{
  manifestUrl?: string
  fallbackHref?: string
  fallbackLabel?: string
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  target?: string
  rel?: string
  icon?: string
}>()

const { site } = useData()
// Read explicitly here rather than leaning on template auto-unwrap of
// `site` (a ref) — keeps the base-resolution behavior in one place that's
// straightforward to unit test regardless of how faithfully a test double
// for `useData()` reproduces Vue's real ref semantics.
const base = computed(() => site.value.base)
</script>

<template>
  <BVPlatformButton v-bind="props" :base="base" />
</template>
