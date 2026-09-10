import { defineConfig } from 'vite'

// A second, separate build pass solely for a CommonJS copy of the Vite
// plugin (src/vite-plugin.ts). This is not about consumer *code* being
// CJS — it's that a VitePress site's own .vitepress/config.js (or .ts) is
// loaded by Vite's own config-file bundler using Node's module type rules:
// .js/.ts default to CommonJS unless the consumer's package.json sets
// "type": "module" (only .mjs/.mts force ESM regardless). An ESM-only
// package hits `require()` on that default path and fails outright — see
// notes/dev/lessonslearned.md and #70/#72 for the real consumer (BojuBot)
// this broke on. The plugin has zero runtime dependencies, so a plain CJS
// build alongside the ESM one (already produced by vite.config.ts's own
// 'vite' entry) costs nothing and needs no dts config of its own — types are
// already emitted once, from the ESM build, and apply to both.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: { vite: 'src/vite-plugin.ts' },
      formats: ['cjs'],
      fileName: () => 'vite.cjs',
    },
    rollupOptions: {
      // Nothing to externalize today — the plugin's only import is a
      // type-only `import type { Plugin } from 'vite'`, which erases. This
      // is here so that stays true by construction: without it, adding any
      // real runtime import (`normalizePath` from 'vite', say) would
      // silently bundle that dependency's source into dist/vite.cjs rather
      // than failing the build.
      external: [/^[^.]/],
    },
  },
})
