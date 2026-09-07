<script setup lang="ts">
import { inject } from 'vue'
import { VPButtonKey } from './injectionKeys'

// See createVitePressButtons.ts / #70: VPButton can't be a top-level
// `import ... from 'vitepress/theme'` in this file — that import breaks
// under a consumer's SSR build once bojuvue gets externalized (the default).
// It's supplied instead by whichever app called
// createVitePressButtons({ VPButton, ... }) and app.use()'d the result.
const VPButton = inject(VPButtonKey)
if (!VPButton) {
  throw new Error(
    "BVButton (bojuvue/vitepress) requires createVitePressButtons()'s plugin to be installed first — call app.use(createVitePressButtons({ VPButton })) in your VitePress theme's enhanceApp. See the 'VitePress plugin setup' section of the installation guide."
  )
}

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
