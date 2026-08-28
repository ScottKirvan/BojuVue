<script setup lang="ts">
import { computed } from 'vue'
import VPBVButton from './BVButton.vue'
import GenericBVButton from '../BVButton.vue'

// The prop type is written out inline here (matching `BVIconButtonProps` in
// ../BVIconButton.types.ts, and the prop type in the generic implementation
// at ../BVIconButton.vue) rather than imported into this macro — see the
// identical note in ../BVButton.vue for why.
const props = withDefaults(
  defineProps<{
    text?: string
    href?: string
    target?: string
    rel?: string
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
    tag?: string
    icon?: string
    label?: string
  }>(),
  {
    size: 'medium',
    theme: 'brand',
  }
)

// Icon-only mode is "no text at all", including an explicitly empty string
// — same rule BVMoreButton already established for its own `text` prop.
const isIconOnly = computed(() => !props.text)
</script>

<template>
  <!--
    Text mode renders through the real VPButton (via ./BVButton.vue) — same
    reasoning as BVPlatformButton: real theme styling for free, tracking any
    future VPButton style change automatically. `icon` (if given) renders as
    a sibling before it, not inside it — VPButton has no icon prop or slot.

    Icon-only mode intentionally does NOT use VPButton: a fixed-size box is
    not a shape VPButton has any concept of (`text` is required, no icon
    prop/slot), so forcing it in would mean fighting VPButton's own layout
    with CSS overrides rather than using it. It reuses the *generic*,
    hand-rolled ../BVButton.vue instead — deliberate, one-directional
    exception to "the VitePress entry can depend on vitepress, the bare
    entry never does": a VitePress-specific file importing a generic file is
    always fine, since the generic file still has zero vitepress dependency
    of its own. Reuses the exact same icon-only sizing CSS as the generic
    BVIconButton implementation rather than re-deriving it, because both
    render through that same hand-rolled BVButton for this mode.
  -->
  <span class="bv-icon-button" :class="{ 'icon-only': isIconOnly, 'has-text': !isIconOnly }">
    <template v-if="isIconOnly">
      <GenericBVButton
        class="bv-icon-button-target icon-only"
        text=""
        :href="href"
        :target="target"
        :rel="rel"
        :size="size"
        :theme="theme"
        :tag="tag"
        :aria-label="label"
      />
      <span v-if="icon" class="bv-icon-button-icon overlay" v-html="icon"></span>
    </template>
    <template v-else>
      <span v-if="icon" class="bv-icon-button-icon" v-html="icon"></span>
      <VPBVButton
        class="bv-icon-button-target"
        :text="text ?? ''"
        :href="href"
        :target="target"
        :rel="rel"
        :size="size"
        :theme="theme"
        :tag="tag"
      />
    </template>
  </span>
</template>

<style scoped>
.bv-icon-button {
  /* No margin/positioning of its own — spacing between this button and its
     neighbors is a caller/layout concern, same rule BVPlatformButton and
     BVMoreButton both follow. See #32. */
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bv-icon-button.icon-only {
  position: relative;
  gap: 0;
}

.bv-icon-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bv-icon-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}

/* Icon-only mode's icon sits on top of the (visually empty) hand-rolled
   button rather than affecting layout size — pointer-events: none so
   clicks/taps land on the actual interactive element underneath, not this
   decorative overlay. */
.bv-icon-button-icon.overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Fixed equal-width/height box, same pixel dimensions BVMoreButton's own
   icon-only trigger already used before this refactor — an outcome of this
   CSS, not something icon-only mode itself requires; it stays whatever
   shape .bv-button's own border-radius happens to draw. */
:deep(.bv-button.icon-only) {
  padding: 0;
  line-height: 1;
}

:deep(.bv-button.icon-only.medium) {
  width: 38px;
  height: 38px;
}

:deep(.bv-button.icon-only.big) {
  width: 46px;
  height: 46px;
}
</style>
