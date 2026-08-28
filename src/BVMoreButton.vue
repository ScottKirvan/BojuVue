<script setup lang="ts">
import { nextTick, onBeforeUnmount, onBeforeUpdate, ref, watch, type ComponentPublicInstance } from 'vue'
import { isExternalUrl } from './url'
import { computeMenuPanelLeft, stepMenuIndex, type MenuStepKey } from './moreButtonMenu'

// The prop type is written out inline here (matching `BVMoreButtonProps` /
// `BVMoreButtonItem` in ./BVMoreButton.types.ts, which are exported for
// public/programmatic use) rather than imported into this macro — see the
// identical note in ./BVPlatformButton.vue for why.
const props = withDefaults(
  defineProps<{
    items: { label: string; href: string; icon?: string; target?: string; rel?: string }[]
    // Overrides the built-in three-dot icon via v-html. Caller-supplied only.
    icon?: string
    label?: string
    // Pass-through to the rendered trigger, left undefined so its own
    // defaults ('medium' / 'brand') apply when unset.
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
  }>(),
  {
    label: 'More options',
  }
)

const DEFAULT_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const panelEl = ref<HTMLDivElement | null>(null)
const panelLeft = ref(0)
const panelTop = ref(0)

let itemEls: (HTMLAnchorElement | null)[] = []

onBeforeUpdate(() => {
  itemEls = []
})

function setItemRef(el: Element | ComponentPublicInstance | null, index: number) {
  itemEls[index] = (el as HTMLAnchorElement | null) ?? null
}

function currentFocusedItemIndex(): number {
  if (typeof document === 'undefined') return -1
  return itemEls.findIndex((el) => el === document.activeElement)
}

function focusItem(index: number) {
  itemEls[index]?.focus()
}

// A `zoom` CSS property on an ancestor (non-standard but shipped in every
// major engine, and something this very repo's own docs/ site applies to
// <html> — see docs/.vitepress/theme/custom.css) rescales what
// getBoundingClientRect() reports for any descendant, but does NOT rescale
// an inline `top`/`left` pixel value assigned to a `position: fixed`
// descendant — that value is interpreted in the same unzoomed frame as
// window.innerWidth/offsetLeft. Feeding a zoomed measurement straight into
// the panel's inline style double-applies the zoom and misplaces it.
// Dividing every getBoundingClientRect() measurement by the ancestor zoom
// factor converts it back into that unzoomed frame before it's used; this
// is a no-op (division by 1) on the overwhelmingly common case of no zoom.
function getAncestorZoom(): number {
  if (typeof document === 'undefined') return 1
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom)
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
}

function updatePlacement() {
  const trigger = triggerEl.value
  const panel = panelEl.value
  if (!trigger || !panel || typeof window === 'undefined') return
  const zoom = getAncestorZoom()
  const triggerRect = trigger.getBoundingClientRect()
  const panelWidth = panel.getBoundingClientRect().width / zoom
  panelLeft.value = computeMenuPanelLeft({
    triggerLeft: triggerRect.left / zoom,
    triggerRight: triggerRect.right / zoom,
    panelWidth,
    viewportWidth: window.innerWidth,
  })
  panelTop.value = triggerRect.bottom / zoom
}

async function openMenu(focusIndex = -1) {
  if (open.value) return
  open.value = true
  await nextTick()
  updatePlacement()
  if (focusIndex >= 0) focusItem(focusIndex)
}

function closeMenu(returnFocus = false) {
  if (!open.value) return
  open.value = false
  if (returnFocus) triggerEl.value?.focus()
}

function toggleMenu() {
  if (open.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (open.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu(stepMenuIndex('ArrowDown', -1, props.items.length))
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(stepMenuIndex('ArrowUp', -1, props.items.length))
  }
}

const MENU_STEP_KEYS: MenuStepKey[] = ['ArrowDown', 'ArrowUp', 'Home', 'End']

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  }
  if ((MENU_STEP_KEYS as string[]).includes(event.key)) {
    event.preventDefault()
    const nextIndex = stepMenuIndex(event.key as MenuStepKey, currentFocusedItemIndex(), props.items.length)
    if (nextIndex >= 0) focusItem(nextIndex)
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!rootEl.value) return
  if (event.target instanceof Node && !rootEl.value.contains(event.target)) {
    closeMenu()
  }
}

// The panel is `position: fixed` (viewport coordinates), so scrolling the
// page moves the trigger without moving the panel unless this recomputes it
// too — not just `resize`. `capture: true` catches scrolling on any nested
// scroll container between the trigger and the document, not only
// window-level scroll.
watch(open, (isOpen) => {
  if (typeof window === 'undefined') return
  if (isOpen) {
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, { capture: true, passive: true })
    document.addEventListener('pointerdown', onDocumentPointerDown)
  } else {
    window.removeEventListener('resize', updatePlacement)
    window.removeEventListener('scroll', updatePlacement, { capture: true })
    document.removeEventListener('pointerdown', onDocumentPointerDown)
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updatePlacement)
  window.removeEventListener('scroll', updatePlacement, { capture: true })
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

// Reuses the identical smart external-link target/rel default
// BVPlatformButton applies — see ./url.ts.
function resolvedTarget(item: { href: string; target?: string }): string | undefined {
  return item.target ?? (isExternalUrl(item.href) ? '_blank' : undefined)
}

function resolvedRel(item: { href: string; rel?: string }): string | undefined {
  return item.rel ?? (isExternalUrl(item.href) ? 'noreferrer' : undefined)
}
</script>

<template>
  <span ref="rootEl" class="bv-more-button">
    <button
      ref="triggerEl"
      type="button"
      class="bv-more-button-trigger"
      :class="[size ?? 'medium', theme ?? 'brand']"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="label"
      @click="toggleMenu"
      @keydown="onTriggerKeydown"
    >
      <span class="bv-more-button-icon" v-html="icon ?? DEFAULT_ICON"></span>
    </button>
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

.bv-more-button-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.bv-more-button-trigger:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.bv-more-button-trigger.medium {
  border-radius: 20px;
  width: 38px;
  height: 38px;
}

.bv-more-button-trigger.big {
  border-radius: 24px;
  width: 46px;
  height: 46px;
}

.bv-more-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}

.bv-more-button-trigger.brand {
  border-color: var(--vp-button-brand-border, #3c8772);
  color: var(--vp-button-brand-text, #fff);
  background-color: var(--vp-button-brand-bg, #3c8772);
}
.bv-more-button-trigger.brand:hover {
  border-color: var(--vp-button-brand-hover-border, #359469);
  color: var(--vp-button-brand-hover-text, #fff);
  background-color: var(--vp-button-brand-hover-bg, #359469);
}
.bv-more-button-trigger.brand:active {
  border-color: var(--vp-button-brand-active-border, #2b8760);
  color: var(--vp-button-brand-active-text, #fff);
  background-color: var(--vp-button-brand-active-bg, #2b8760);
}

.bv-more-button-trigger.alt {
  border-color: var(--vp-button-alt-border, transparent);
  color: var(--vp-button-alt-text, #3c3c43);
  background-color: var(--vp-button-alt-bg, #f2f2f3);
}
.bv-more-button-trigger.alt:hover {
  border-color: var(--vp-button-alt-hover-border, transparent);
  color: var(--vp-button-alt-hover-text, #3c3c43);
  background-color: var(--vp-button-alt-hover-bg, #e6e6e7);
}
.bv-more-button-trigger.alt:active {
  border-color: var(--vp-button-alt-active-border, transparent);
  color: var(--vp-button-alt-active-text, #3c3c43);
  background-color: var(--vp-button-alt-active-bg, #dcdcdd);
}

.bv-more-button-trigger.sponsor {
  border-color: var(--vp-button-sponsor-border, transparent);
  color: var(--vp-button-sponsor-text, #d5389c);
  background-color: var(--vp-button-sponsor-bg, transparent);
}
.bv-more-button-trigger.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border, #d5389c);
  color: var(--vp-button-sponsor-hover-text, #d5389c);
  background-color: var(--vp-button-sponsor-hover-bg, transparent);
}
.bv-more-button-trigger.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border, #d5389c);
  color: var(--vp-button-sponsor-active-text, #d5389c);
  background-color: var(--vp-button-sponsor-active-bg, transparent);
}

.bv-more-button-panel {
  position: fixed;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 8px;
  background-color: var(--vp-c-bg-elv, #fff);
  box-shadow: var(--vp-shadow-3, 0 12px 32px rgba(0, 0, 0, 0.18));
}

.bv-more-button-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--vp-c-text-1, #3c3c43);
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.bv-more-button-item:hover,
.bv-more-button-item:focus-visible {
  background-color: var(--vp-c-default-soft, #f2f2f3);
  outline: none;
}

.bv-more-button-item-icon :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
