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

// See the identical note in ../BVIconButton.vue: a caller-supplied non-prop
// attr belongs on the real interactive control (GenericBVButton/VPBVButton
// below), not this component's own wrapping `<span>` — the default
// single-root fallthrough would otherwise strand it there.
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

      Text mode renders through the real VPButton (via ./BVButton.vue) — same
      reasoning as BVPlatformButton: real theme styling for free, tracking any
      future VPButton style change automatically. `icon` (if given) can't go
      *inside* it — VPButton has no icon prop or slot — so it's a sibling
      `<span>` in the DOM, positioned with CSS to sit visually on top of the
      button's left edge, with the button's own left padding widened below to
      reserve room for it. Rendered after VPBVButton (not before) so it paints
      on top; `pointer-events: none` keeps it from intercepting clicks.

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
      render through that same hand-rolled BVButton for this mode. Its icon is
      likewise rendered after the button (not before) for the same on-top
      paint-order reason.
    -->
    <template v-if="isIconOnly">
      <GenericBVButton
        v-bind="$attrs"
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
      <span v-if="icon" class="bv-icon-button-icon" v-html="icon"></span>
    </template>
    <template v-else>
      <VPBVButton
        v-bind="$attrs"
        class="bv-icon-button-target"
        :class="{ 'has-icon': !!icon }"
        :text="text ?? ''"
        :href="href"
        :target="target"
        :rel="rel"
        :size="size"
        :theme="theme"
        :tag="tag"
      />
      <span v-if="icon" class="bv-icon-button-icon" v-html="icon"></span>
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
   hand-rolled button. */
.bv-icon-button.icon-only .bv-icon-button-icon {
  inset: 0;
}

/* Icon+text mode's icon sits on the real VPButton's left edge. Its
   font-size is pinned to match VPButton's own font-size for this size class
   (rather than inheriting ambient page font-size) so its 1em width below
   lines up exactly with the padding-left reservation further down, which is
   also sized in VPButton's own em units. */
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

/* Reserves room on the real VPButton's left for the overlaid icon plus a
   gap before the text, on top of VPButton's own normal left padding (20px/
   24px, mirrored exactly by ../BVButton.vue). The `1em` here is relative to
   VPButton's own font-size (14px/16px for medium/big) — the same 14px/16px
   the icon span above is pinned to, so the two stay in sync even though
   they're set on different elements. */
:deep(.VPButton.has-icon.medium) {
  padding-left: calc(20px + 1em + 6px);
}

:deep(.VPButton.has-icon.big) {
  padding-left: calc(24px + 1em + 6px);
}
</style>
