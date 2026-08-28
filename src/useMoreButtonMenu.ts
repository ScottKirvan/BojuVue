import { nextTick, onBeforeUnmount, onBeforeUpdate, ref, watch, type ComponentPublicInstance, type Ref } from 'vue'
import { computeMenuPanelLeft, stepMenuIndex, type MenuStepKey } from './moreButtonMenu'

export interface UseMoreButtonMenuOptions {
  itemCount: () => number
  // These three are template refs, so each `.vue` file declares them itself
  // via a direct top-level `const x = ref(...)` and passes them in, rather
  // than this composable creating and returning them: Vue's `ref="x"`
  // template-ref binding only wires up to a name declared that way in the
  // same `<script setup>` block — a name merely destructured from this
  // composable's return value doesn't get recognized as "read" by that
  // literal-string binding, which trips `noUnusedLocals`. Passing them in
  // (rather than back out) sidesteps that entirely.
  rootEl: Ref<HTMLElement | null>
  iconButtonEl: Ref<ComponentPublicInstance | null>
  panelEl: Ref<HTMLDivElement | null>
}

// Shared by both the generic Vue implementation (`./BVMoreButton.vue`) and
// the VitePress-specific implementation (`./vitepress/BVMoreButton.vue`) —
// each wires it into its own template with its own matching `BVIconButton`
// import. This is a shared utility, not a relationship between the two
// components: neither imports or renders the other. Framework-agnostic: no
// import from 'vitepress' here.
//
// Owns every part of `BVMoreButton`'s behavior that isn't the trigger's own
// rendering: open/close state, keyboard handling, and the placement
// algorithm (including the ancestor-zoom correction) — all identical between
// the two implementations because none of it is button-skin concern.
export function useMoreButtonMenu({ itemCount, rootEl, iconButtonEl, panelEl }: UseMoreButtonMenuOptions) {
  const open = ref(false)
  const panelLeft = ref(0)
  const panelTop = ref(0)

  // A template ref on `<BVIconButton>` (either import path) gives its own
  // wrapping `<span>`, not the focusable/measurable control inside it — see
  // the identical note in `BVIconButton.vue` on why that span exists. Both
  // implementations render the same `<span>`-wrapping shape, so querying
  // into it for the real interactive element is identical either way.
  function triggerEl(): HTMLElement | null {
    return (iconButtonEl.value?.$el as HTMLElement | undefined)?.querySelector('a, button') ?? null
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
    const trigger = triggerEl()
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
    if (returnFocus) triggerEl()?.focus()
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
      openMenu(stepMenuIndex('ArrowDown', -1, itemCount()))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(stepMenuIndex('ArrowUp', -1, itemCount()))
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
      const nextIndex = stepMenuIndex(event.key as MenuStepKey, currentFocusedItemIndex(), itemCount())
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
  // page moves the trigger without moving the panel unless this recomputes
  // it too — not just `resize`. `capture: true` catches scrolling on any
  // nested scroll container between the trigger and the document, not only
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

  return {
    open,
    panelLeft,
    panelTop,
    setItemRef,
    toggleMenu,
    onTriggerKeydown,
    onMenuKeydown,
  }
}
