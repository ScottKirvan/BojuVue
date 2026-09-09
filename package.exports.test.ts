import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

// A compiled Vue library's `<style scoped>` blocks are extracted into a plain
// CSS file at build time — nothing auto-injects them into a consumer's page
// the way a dev-mode `vue-loader`/Vite pipeline would. That CSS is useless to
// a real npm consumer unless package.json's `exports` map actually lets them
// import it: an unlisted subpath is hard-blocked by Node's own module
// resolution (ERR_PACKAGE_PATH_NOT_EXPORTED), not just undocumented. This
// went unnoticed because this repo's own docs site imports component
// *source* directly rather than the published package (see
// notes/dev/vitepress-and-component-guide.md), so it never exercises real
// package resolution — the first real npm consumer (BojuBot) hit it instead.
const rootDir = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))

describe('package.json exports the built CSS', () => {
  it('exposes a subpath for the compiled stylesheet', () => {
    expect(pkg.exports['./style.css']).toBe('./dist/bojuvue.css')
  })

  it('also exposes the literal dist path, for a consumer who finds it by exploring node_modules', () => {
    expect(pkg.exports['./dist/bojuvue.css']).toBe('./dist/bojuvue.css')
  })

  // Only meaningful once `npm run build` has produced dist/ — skipped rather
  // than failed when it hasn't, since CI runs `npm test` before `npm run
  // build` (see .github/workflows/ci.yml) and a local `npm test` shouldn't
  // require a prior build just to pass.
  const cssPath = path.join(rootDir, 'dist/bojuvue.css')
  it.skipIf(!existsSync(cssPath))('the built stylesheet actually contains component styles', () => {
    const css = readFileSync(cssPath, 'utf-8')
    expect(css).toContain('.bv-more-button-panel')
  })
})

// #70/#72: a VitePress site's own .vitepress/config.js (or .ts) is loaded by
// Vite's config bundler under Node's default module-type rules -- .js/.ts
// fall back to CommonJS unless the consumer's package.json sets "type":
// "module" (a real consumer, BojuBot, doesn't). An ESM-only package hits
// `require()` on that path and fails outright, so this subpath needs both
// conditions genuinely present -- not just the "import" one other subpaths
// use, since it can be loaded from a CJS context this package doesn't
// control.
describe('package.json exports a CJS build of the Vite plugin, not just ESM', () => {
  it('declares both the import and require conditions', () => {
    expect(pkg.exports['./vite']).toEqual({
      types: './dist/vite-plugin.d.ts',
      import: './dist/vite.js',
      require: './dist/vite.cjs',
    })
  })

  const cjsPath = path.join(rootDir, 'dist/vite.cjs')
  it.skipIf(!existsSync(cjsPath))('the built CJS file is actually require()-able and exports the plugin factory', () => {
    const { bojuvue } = require(cjsPath)
    expect(bojuvue().name).toBe('bojuvue')
  })
})
