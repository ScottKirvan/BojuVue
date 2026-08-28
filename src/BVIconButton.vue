<script setup lang="ts">
import { computed } from 'vue'
import BVButton from './BVButton.vue'

// The prop type is written out inline here (matching `BVIconButtonProps` in
// ./BVIconButton.types.ts, which is exported for public/programmatic use)
// rather than imported into this macro — see the identical note in
// ./BVButton.vue for why.
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

// A caller-supplied non-prop attr (e.g. a click listener, aria-haspopup) is
// meant for the real interactive control, not this component's own wrapping
// `<span>` — the default single-root fallthrough would otherwise land it on
// that span, where it's inert for click/keydown-via-bubbling in appearance
// only and outright wrong for an ARIA attribute a screen reader needs on the
// focusable element itself. `inheritAttrs: false` plus an explicit
// `v-bind="$attrs"` on BVButton below routes it to the right place.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span class="bv-icon-button" :class="{ 'icon-only': isIconOnly, 'has-text': !isIconOnly }">
    <!--
      Every doc comment in this template lives *inside* this root `<span>`,
      never before it — a comment at the template's top level, outside the
      single element root, makes Vue treat this component as an implicit
      multi-root fragment (Vue's non-production compiler keeps template
      comments as real DOM nodes rather than stripping them, so this isn't
      just theoretical), and a fragment's `$el`/template-ref value is its
      anchor node, not the intended `<span>` — exactly what BVMoreButton's
      own template ref on `<BVIconButton>` needs to be the real thing.

      Both modes render through the same hand-rolled BVButton — no VPButton-
      vs-hand-rolled conflict to navigate here (that's the VitePress-specific
      implementation's problem). Icon-only sizing is just another modifier
      class layered on top of BVButton's own skin via :deep(), and the icon
      itself can't go *inside* BVButton (it has no slot, only its own `text`
      interpolation), so it's always a sibling `<span>` — positioned inline
      before the button when there's visible text, or absolutely centered on
      top of it when there isn't (BVButton renders text="" in that case, i.e.
      an empty box of the right fixed size for the icon to sit on).
    -->
    <span v-if="icon && !isIconOnly" class="bv-icon-button-icon" v-html="icon"></span>
    <BVButton
      v-bind="$attrs"
      class="bv-icon-button-target"
      :class="{ 'icon-only': isIconOnly }"
      :text="text ?? ''"
      :href="href"
      :target="target"
      :rel="rel"
      :size="size"
      :theme="theme"
      :tag="tag"
      :aria-label="isIconOnly ? label : undefined"
    />
    <span v-if="icon && isIconOnly" class="bv-icon-button-icon overlay" v-html="icon"></span>
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

/* Icon-only mode's icon sits on top of the (visually empty) button rather
   than affecting layout size — pointer-events: none so clicks/taps land on
   the actual interactive element underneath, not this decorative overlay. */
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
