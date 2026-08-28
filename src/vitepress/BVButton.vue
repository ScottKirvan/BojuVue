<script setup lang="ts">
import { VPButton } from 'vitepress/theme'

// The prop type is written out inline here (matching `BVButtonProps` in
// ../BVButton.types.ts, which is exported for public/programmatic use, and
// the prop type in the generic Vue implementation at ../BVButton.vue)
// rather than imported into this macro — see the matching comment there for
// why.
defineProps<{
  text: string
  href?: string
  target?: string
  rel?: string
  size?: 'medium' | 'big'
  theme?: 'brand' | 'alt' | 'sponsor'
  tag?: string
}>()
</script>

<template>
  <VPButton
    :tag="tag"
    :text="text"
    :href="href"
    :target="target"
    :rel="rel"
    :size="size"
    :theme="theme"
  />
</template>
