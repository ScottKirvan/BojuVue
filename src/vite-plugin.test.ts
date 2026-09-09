import { describe, it, expect } from 'vitest'
import { bojuvue } from './vite-plugin'

describe('bojuvue (vite plugin)', () => {
  it('is named after the package, so Vite/rollup logging identifies it', () => {
    expect(bojuvue().name).toBe('bojuvue')
  })

  it("config() marks 'bojuvue' as ssr.noExternal, so a consumer's SSR build bundles it through Vite's own resolver instead of externalizing it (fixes #70)", () => {
    const configHook = bojuvue().config as Function
    const config = configHook.call(null, {}, { command: 'build', mode: 'production' })
    expect(config).toEqual({ ssr: { noExternal: ['bojuvue'] } })
  })
})
