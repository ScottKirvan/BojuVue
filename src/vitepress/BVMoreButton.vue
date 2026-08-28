<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, ref, watch, type ComponentPublicInstance } from 'vue'
import { VPButton } from 'vitepress/theme'
import { isExternalUrl } from '../url'
import { computeMenuPanelLeft, stepMenuIndex, type MenuStepKey } from '../moreButtonMenu'

// The prop type is written out inline here (matching `BVMoreButtonProps` /
// `BVMoreButtonItem` in ../BVMoreButton.types.ts, and the prop type in the
// generic implementation at ../BVMoreButton.vue) rather than imported into
// this macro — see the identical note in ../BVPlatformButton.vue for why.
const props = withDefaults(
  defineProps<{
    items: { label: string; href: string; icon?: string; target?: string; rel?: string }[]
    // Overrides the built-in three-dot icon via v-html. Caller-supplied only.
    // Ignored (no icon rendered) when `text` is set and `icon` isn't also
    // explicitly given — see `resolvedIcon` below.
    icon?: string
    // Visible trigger text. Unset by default, which keeps the icon-only
    // trigger (fixed circular size, default three-dot icon, hand-rolled
    // markup — see the "icon-only doesn't use VPButton" note below). Given,
    // the trigger renders through VitePress's real `VPButton` instead, same
    // as `BVPlatformButton`, with `icon` (if also given) alongside it as a
    // sibling.
    text?: string
    // Sets the trigger's aria-label. Only applied in icon-only mode (no
    // `text`) — with visible text, the accessible name comes from that text
    // content instead, so this prop is ignored rather than layered on top.
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

// Icon-only mode (no `text`) always shows something — a caller-supplied
// icon, or the three-dot default. Text mode shows an icon only if the
// caller explicitly asked for one alongside the text; otherwise the visible
// text alone is the trigger's content, same as any ordinary text button.
const resolvedIcon = computed(() => props.icon ?? (props.text ? null : DEFAULT_ICON))

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
// Holds either a native <button> (icon-only mode) or VPButton's component
// instance (text mode) — see triggerElement() below, which normalizes the
// two into the one thing every caller of this ref actually wants: the real
// rendered DOM button.
const triggerRef = ref<HTMLButtonElement | ComponentPublicInstance | null>(null)
const panelEl = ref<HTMLDivElement | null>(null)
const panelLeft = ref(0)
const panelTop = ref(0)

function triggerElement(): HTMLButtonElement | null {
  const el = triggerRef.value
  if (!el) return null
  return el instanceof HTMLElement ? el : ((el as ComponentPublicInstance).$el as HTMLButtonElement)
}

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
  const trigger = triggerElement()
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
  if (returnFocus) triggerElement()?.focus()
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
    <!--
      Text mode renders through VitePress's own real VPButton — same
      reasoning as BVPlatformButton: real theme styling for free, and it
      automatically tracks any future VPButton style change. icon (if given)
      renders as a sibling before it, not inside it, the same workaround
      BVPlatformButton already uses for the same reason: VPButton has no
      icon prop or slot of its own, only ever rendering its `text` prop.

      Icon-only mode (no `text`) intentionally does NOT use VPButton: a
      fixed-size circular icon button isn't a shape VPButton has any concept
      of (no slot, no icon, `text` is a required prop), so forcing it into
      one would mean fighting VPButton's own layout with CSS overrides
      rather than actually using it — no real "tracks VPButton" benefit,
      since we'd be overriding the exact things VPButton controls. Falls
      back to the same hand-rolled circular button as the generic
      implementation instead.
    -->
    <template v-if="text">
      <span v-if="resolvedIcon" class="bv-more-button-icon" v-html="resolvedIcon"></span>
      <VPButton
        ref="triggerRef"
        :text="text"
        :size="size"
        :theme="theme"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="toggleMenu"
        @keydown="onTriggerKeydown"
      />
    </template>
    <button
      v-else
      ref="triggerRef"
      type="button"
      class="bv-more-button-trigger icon-only"
      :class="[size ?? 'medium', theme ?? 'brand']"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="label"
      @click="toggleMenu"
      @keydown="onTriggerKeydown"
    >
      <span v-if="resolvedIcon" class="bv-more-button-icon" v-html="resolvedIcon"></span>
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
  align-items: center;
  gap: 6px;
  position: relative;
}

.bv-more-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}

/* Icon-only mode's hand-rolled button — VPButton isn't used here, see the
   template comment above, so this still needs its own skin reading the same
   public --vp-button-* custom properties the generic implementation and
   VPButton itself both read. No fallback values: unlike the generic
   implementation, this file only ever runs inside a real VitePress site,
   where these are always defined. */
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

.bv-more-button-trigger.icon-only.medium {
  border-radius: 20px;
  width: 38px;
  height: 38px;
}

.bv-more-button-trigger.icon-only.big {
  border-radius: 24px;
  width: 46px;
  height: 46px;
}

.bv-more-button-trigger.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}
.bv-more-button-trigger.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}
.bv-more-button-trigger.brand:active {
  border-color: var(--vp-button-brand-active-border);
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
}

.bv-more-button-trigger.alt {
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
}
.bv-more-button-trigger.alt:hover {
  border-color: var(--vp-button-alt-hover-border);
  color: var(--vp-button-alt-hover-text);
  background-color: var(--vp-button-alt-hover-bg);
}
.bv-more-button-trigger.alt:active {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background-color: var(--vp-button-alt-active-bg);
}

.bv-more-button-trigger.sponsor {
  border-color: var(--vp-button-sponsor-border);
  color: var(--vp-button-sponsor-text);
  background-color: var(--vp-button-sponsor-bg);
}
.bv-more-button-trigger.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border);
  color: var(--vp-button-sponsor-hover-text);
  background-color: var(--vp-button-sponsor-hover-bg);
}
.bv-more-button-trigger.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border);
  color: var(--vp-button-sponsor-active-text);
  background-color: var(--vp-button-sponsor-active-bg);
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
