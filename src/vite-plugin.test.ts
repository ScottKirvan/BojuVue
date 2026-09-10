import { describe, it, expect } from 'vitest'
import type { ConfigEnv, ConfigPluginContext } from 'vite'
import { bojuvue } from './vite-plugin'

describe('bojuvue (vite plugin)', () => {
  it('is named after the package, so Vite/rollup logging identifies it', () => {
    expect(bojuvue().name).toBe('bojuvue')
  })

  it("config() marks 'bojuvue' as ssr.noExternal, so a consumer's SSR build bundles it through Vite's own resolver instead of externalizing it (fixes #70)", () => {
    // Vite's `config` hook is an ObjectHook — either a bare function or a
    // { handler } object. Narrowing both shapes here rather than casting to
    // Function means switching this plugin to the object form later fails
    // typecheck at the source, not at this assertion.
    const hook = bojuvue().config
    const handler = typeof hook === 'function' ? hook : hook?.handler
    // The hook is typed as running with a ConfigPluginContext receiver; this
    // one never touches `this`, so an empty stub stands in for it.
    const ctx = {} as ConfigPluginContext
    const env: ConfigEnv = { command: 'build', mode: 'production' }
    const config = handler?.call(ctx, {}, env)
    expect(config).toEqual({ ssr: { noExternal: ['bojuvue'] } })
  })
})
