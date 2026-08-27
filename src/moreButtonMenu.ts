export interface MenuPlacementInput {
  triggerLeft: number
  triggerRight: number
  panelWidth: number
  viewportWidth: number
}

// Three-step algorithm, in this exact order — see
// notes/dev/MoreButtonSpec.md's "Placement/alignment algorithm":
// 1. Trailing edge (panel's right edge flush with the trigger's right edge)
//    is preferred, matching the reference screenshots at any viewport width.
// 2. If that would clip past the left edge of the viewport, flip to leading
//    edge (panel's left edge flush with the trigger's left edge).
// 3. If neither fits (the viewport is narrower than the panel itself), clamp
//    the panel inside the viewport as a last resort.
export function computeMenuPanelLeft({
  triggerLeft,
  triggerRight,
  panelWidth,
  viewportWidth,
}: MenuPlacementInput): number {
  const trailing = triggerRight - panelWidth
  if (trailing >= 0) return trailing

  const leading = triggerLeft
  if (leading + panelWidth <= viewportWidth) return leading

  return Math.max(0, viewportWidth - panelWidth)
}

export type MenuStepKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'

// currentIndex of -1 represents "no item focused yet" — the trigger itself
// has focus and the menu may still be closed. ArrowDown/ArrowUp from that
// state jump to the first/last item respectively, the same "opening"
// convention described in the spec, reusing the identical wraparound rule
// that governs in-menu navigation once an item already has focus.
export function stepMenuIndex(key: MenuStepKey, currentIndex: number, itemCount: number): number {
  if (itemCount <= 0) return -1

  switch (key) {
    case 'Home':
      return 0
    case 'End':
      return itemCount - 1
    case 'ArrowDown':
      return currentIndex === -1 ? 0 : (currentIndex + 1) % itemCount
    case 'ArrowUp':
      return currentIndex === -1 ? itemCount - 1 : (currentIndex - 1 + itemCount) % itemCount
  }
}
