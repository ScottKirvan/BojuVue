import { describe, expect, it } from 'vitest'
import { computeMenuPanelLeft, stepMenuIndex } from './moreButtonMenu'

describe('computeMenuPanelLeft', () => {
  it('uses trailing-edge alignment when it fits', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 300, triggerRight: 340, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(140)
  })

  it('flips to leading-edge alignment when trailing-edge would clip past the left edge', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 10, triggerRight: 50, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(10)
  })

  it('treats an exact trailing-edge fit (panelLeft === 0) as fitting, not clipping', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 160, triggerRight: 200, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(0)
  })

  it('clamps inside the viewport when neither trailing- nor leading-edge alignment fits', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 10, triggerRight: 50, panelWidth: 900, viewportWidth: 320 })
    ).toBe(0)
  })

  it('clamps to the largest left value that keeps the panel on screen, not always to 0', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 700, triggerRight: 780, panelWidth: 900, viewportWidth: 800 })
    ).toBe(0)
    expect(
      computeMenuPanelLeft({ triggerLeft: 150, triggerRight: 190, panelWidth: 300, viewportWidth: 400 })
    ).toBe(100)
  })

  it('treats an exact leading-edge fit (panelLeft + panelWidth === viewportWidth) as fitting', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 10, triggerRight: 50, panelWidth: 200, viewportWidth: 210 })
    ).toBe(10)
  })
})

describe('stepMenuIndex', () => {
  it('opens to the first item on ArrowDown from the trigger (currentIndex -1)', () => {
    expect(stepMenuIndex('ArrowDown', -1, 4)).toBe(0)
  })

  it('opens to the last item on ArrowUp from the trigger (currentIndex -1)', () => {
    expect(stepMenuIndex('ArrowUp', -1, 4)).toBe(3)
  })

  it('moves to the next item on ArrowDown from a middle index', () => {
    expect(stepMenuIndex('ArrowDown', 1, 4)).toBe(2)
  })

  it('wraps from the last item back to the first on ArrowDown', () => {
    expect(stepMenuIndex('ArrowDown', 3, 4)).toBe(0)
  })

  it('moves to the previous item on ArrowUp from a middle index', () => {
    expect(stepMenuIndex('ArrowUp', 2, 4)).toBe(1)
  })

  it('wraps from the first item back to the last on ArrowUp', () => {
    expect(stepMenuIndex('ArrowUp', 0, 4)).toBe(3)
  })

  it('jumps to the first item on Home regardless of current index', () => {
    expect(stepMenuIndex('Home', 2, 4)).toBe(0)
    expect(stepMenuIndex('Home', -1, 4)).toBe(0)
  })

  it('jumps to the last item on End regardless of current index', () => {
    expect(stepMenuIndex('End', 0, 4)).toBe(3)
    expect(stepMenuIndex('End', -1, 4)).toBe(3)
  })

  it('behaves correctly with exactly one item — every step stays on index 0', () => {
    expect(stepMenuIndex('ArrowDown', 0, 1)).toBe(0)
    expect(stepMenuIndex('ArrowUp', 0, 1)).toBe(0)
    expect(stepMenuIndex('ArrowDown', -1, 1)).toBe(0)
    expect(stepMenuIndex('ArrowUp', -1, 1)).toBe(0)
  })

  it('returns -1 for an empty item list', () => {
    expect(stepMenuIndex('ArrowDown', -1, 0)).toBe(-1)
    expect(stepMenuIndex('Home', -1, 0)).toBe(-1)
  })
})
