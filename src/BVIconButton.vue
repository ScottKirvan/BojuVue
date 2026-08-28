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
  <span class="bv-icon-button" :class="[size, { 'icon-only': isIconOnly, 'has-icon': !!icon && !isIconOnly }]">
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
      implementation's problem). The icon itself can't go *inside* BVButton
      (it has no slot, only its own `text` interpolation), so it's always a
      sibling `<span>` in the DOM — but positioned with CSS to sit visually
      on top of the button in both modes: absolutely centered over the whole
      box in icon-only mode (BVButton renders text="" there, i.e. an empty
      box of the right fixed size for the icon to sit on), or absolutely
      pinned to the button's left edge in icon+text mode, with the button's
      own left padding widened below to reserve room so it never overlaps
      the text. It's placed after BVButton in markup (not before) so it
      paints on top; `pointer-events: none` keeps it from intercepting
      clicks meant for the button underneath.
    -->
    <BVButton
      v-bind="$attrs"
      class="bv-icon-button-target"
      :class="{ 'icon-only': isIconOnly, 'has-icon': !!icon && !isIconOnly }"
      :text="text ?? ''"
      :href="href"
      :target="target"
      :rel="rel"
      :size="size"
      :theme="theme"
      :tag="tag"
      :aria-label="isIconOnly ? label : undefined"
    />
    <span v-if="icon" class="bv-icon-button-icon" v-html="icon"></span>
  </span>
</template>

<style scoped>
.bv-icon-button {
  /* No margin/positioning of its own — spacing between this button and its
     neighbors is a caller/layout concern, same rule BVPlatformButton and
     BVMoreButton both follow. See #32. */
  display: inline-flex;
  align-items: center;
  position: relative;
}

.bv-icon-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  pointer-events: none;
}

.bv-icon-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}

/* Icon-only mode's icon sits centered on top of the (visually empty)
   button. */
.bv-icon-button.icon-only .bv-icon-button-icon {
  inset: 0;
}

/* Icon+text mode's icon sits on the button's left edge. Its font-size is
   pinned to match .bv-button's own font-size for this size class (rather
   than inheriting ambient page font-size) so its 1em width below lines up
   exactly with the padding-left reservation further down, which is also
   sized in .bv-button's own em units. */
.bv-icon-button.has-icon .bv-icon-button-icon {
  top: 50%;
  transform: translateY(-50%);
}

.bv-icon-button.has-icon.medium .bv-icon-button-icon {
  left: 20px;
  font-size: 14px;
}

.bv-icon-button.has-icon.big .bv-icon-button-icon {
  left: 24px;
  font-size: 16px;
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

/* Reserves room on the button's left for the overlaid icon plus a gap
   before the text, on top of the button's own normal left padding (20px/
   24px). The `1em` here is relative to .bv-button's own font-size
   (14px/16px for medium/big) — the same 14px/16px the icon span above is
   pinned to, so the two stay in sync even though they're set on different
   elements. */
:deep(.bv-button.has-icon.medium) {
  padding-left: calc(20px + 1em + 6px);
}

:deep(.bv-button.has-icon.big) {
  padding-left: calc(24px + 1em + 6px);
}
</style>
