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

<style scoped>
/* VitePress's own `.vp-doc a { text-decoration: underline }` (its default
   theme's prose-link styling) cascades onto this button whenever it's placed
   inline in markdown body content, since that's exactly where a real
   VPButton normally never appears (VPHero's actions row sits outside
   `.vp-doc`). Vue's scoped-CSS attribute selector gives this rule higher
   specificity than that one, so it wins without `!important`. */
.VPButton {
  text-decoration: none;
}
</style>
