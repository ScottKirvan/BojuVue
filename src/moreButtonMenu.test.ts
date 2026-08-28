import { describe, expect, it } from 'vitest'
import { computeMenuPanelLeft, stepMenuIndex } from './moreButtonMenu'

describe('computeMenuPanelLeft', () => {
  it('uses leading-edge alignment when it fits', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 100, triggerRight: 140, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(100)
  })

  it('flips to trailing-edge alignment when leading-edge would clip past the right edge', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 900, triggerRight: 940, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(740)
  })

  it('treats an exact leading-edge fit (panelLeft + panelWidth === viewportWidth) as fitting, not clipping', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 824, triggerRight: 864, panelWidth: 200, viewportWidth: 1024 })
    ).toBe(824)
  })

  it('treats an exact trailing-edge fit (panelLeft === 0) as fitting once flipped', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 150, triggerRight: 200, panelWidth: 200, viewportWidth: 300 })
    ).toBe(0)
  })

  it('clamps inside the viewport when neither leading- nor trailing-edge alignment fits', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 10, triggerRight: 50, panelWidth: 900, viewportWidth: 320 })
    ).toBe(0)
  })

  it('clamps to the largest left value that keeps the panel on screen, not always to 0', () => {
    expect(
      computeMenuPanelLeft({ triggerLeft: 100, triggerRight: 140, panelWidth: 350, viewportWidth: 400 })
    ).toBe(50)
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
