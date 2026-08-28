<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { isExternalUrl } from '../url'
import { useMoreButtonMenu } from '../useMoreButtonMenu'
import BVIconButton from './BVIconButton.vue'

// The prop type is written out inline here (matching `BVMoreButtonProps` /
// `BVMoreButtonItem` in ../BVMoreButton.types.ts, and the identical prop
// type in the generic implementation at ../BVMoreButton.vue) rather than
// imported into this macro — see the identical note in ../BVButton.vue for
// why.
const props = withDefaults(
  defineProps<{
    items: { label: string; href: string; icon?: string; target?: string; rel?: string }[]
    // Overrides the built-in three-dot icon via v-html. Caller-supplied only.
    // Ignored (no icon rendered) when `text` is set and `icon` isn't also
    // explicitly given — see `resolvedIcon` below.
    icon?: string
    // Visible trigger text. Defaults to 'More...', an ordinary auto-width
    // text button — same padding/sizing pattern as BVPlatformButton's link.
    // `icon` (if also given) renders next to it. Pass an empty string to opt
    // back into the icon-only trigger instead (fixed-size box, default
    // three-dot icon unless `icon` overrides it) — see `resolvedIcon` below.
    text?: string
    // Sets the trigger's aria-label. Only applied in icon-only mode (empty
    // `text`) — with visible text, the accessible name comes from that text
    // content instead, so this prop is ignored rather than layered on top.
    label?: string
    // Pass-through to the rendered trigger, left undefined so its own
    // defaults ('medium' / 'brand') apply when unset.
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
  }>(),
  {
    text: 'More...',
    label: 'More options',
  }
)

const DEFAULT_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'

// Icon-only mode (`text` empty, e.g. `text=""`) always shows something — a
// caller-supplied icon, or the three-dot default. Text mode (the default)
// shows an icon only if the caller explicitly asked for one alongside the
// text; otherwise the visible text alone is the trigger's content, same as
// any ordinary text button.
const resolvedIcon = computed(() => props.icon ?? (props.text ? null : DEFAULT_ICON))

// Same shared open/close/keyboard/placement wiring the generic
// implementation uses — see ../useMoreButtonMenu.ts. This is a fully
// independent implementation delegating to a shared utility, not one
// BVMoreButton wrapping the other: rendering the trigger through this
// entry's own ./BVIconButton.vue (the VitePress-specific one) is the only
// thing that differs, which is why it gets real VPButton styling in text
// mode automatically.
const rootEl = ref<HTMLElement | null>(null)
const iconButtonEl = ref<ComponentPublicInstance | null>(null)
const panelEl = ref<HTMLDivElement | null>(null)

const { open, panelLeft, panelTop, setItemRef, toggleMenu, onTriggerKeydown, onMenuKeydown } = useMoreButtonMenu({
  itemCount: () => props.items.length,
  rootEl,
  iconButtonEl,
  panelEl,
})

// Reuses the identical smart external-link target/rel default
// BVPlatformButton applies — see ../url.ts.
function resolvedTarget(item: { href: string; target?: string }): string | undefined {
  return item.target ?? (isExternalUrl(item.href) ? '_blank' : undefined)
}

function resolvedRel(item: { href: string; rel?: string }): string | undefined {
  return item.rel ?? (isExternalUrl(item.href) ? 'noreferrer' : undefined)
}
</script>

<template>
  <span ref="rootEl" class="bv-more-button">
    <BVIconButton
      ref="iconButtonEl"
      :text="text"
      :icon="resolvedIcon ?? undefined"
      :size="size"
      :theme="theme"
      :label="text ? undefined : label"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggleMenu"
      @keydown="onTriggerKeydown"
    />
    <div
      v-if="open"
      ref="panelEl"
      class="bv-more-button-panel"
      role="menu"
      :style="{ left: `${panelLeft}px`, top: `${panelTop}px` }"
      @keydown="onMenuKeydown"
    >
      <a
        v-for="(item, index) in items"
        :key="item.href"
        :ref="(el) => setItemRef(el, index)"
        role="menuitem"
        class="bv-more-button-item"
        :href="item.href"
        :target="resolvedTarget(item)"
        :rel="resolvedRel(item)"
      >
        <span v-if="item.icon" class="bv-more-button-item-icon" v-html="item.icon"></span>
        {{ item.label }}
      </a>
    </div>
  </span>
</template>

<style scoped>
.bv-more-button {
  /* No margin/positioning of its own — spacing between this button and its
     neighbors (a primary CTA, etc.) is a caller/layout concern. See #32 on
     BVPlatformButton, which follows the same rule. */
  display: inline-flex;
  position: relative;
}

.bv-more-button-panel {
  position: fixed;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}

.bv-more-button-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--vp-c-text-1);
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.bv-more-button-item:hover,
.bv-more-button-item:focus-visible {
  background-color: var(--vp-c-default-soft);
  outline: none;
}

.bv-more-button-item-icon :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
