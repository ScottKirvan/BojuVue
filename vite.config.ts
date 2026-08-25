import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      // Two physical entries, not one: 'bojuvue' (src/index.ts) is the
      // framework-agnostic core, 'vitepress' (src/vitepress.ts) is the
      // VitePress adapter. Keeping these as separate Rollup entries — not
      // just separate exports of one bundle — is what actually lets a
      // core-only consumer avoid ever loading a top-level `import
      // 'vitepress'` statement; see package.json's `exports` map for the
      // matching subpath wiring.
      entry: {
        bojuvue: 'src/index.ts',
        vitepress: 'src/vitepress.ts',
      },
      name: 'BojuVue',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      // 'vitepress' alone only matches that exact specifier — it doesn't
      // cover subpaths like 'vitepress/theme' (used for VPButton), which
      // would otherwise get bundled in along with theme-default's other
      // components (e.g. VPLocalSearchBox, which imports a virtual module
      // only resolvable inside a real VitePress site build).
      external: [/^vue$/, /^vitepress(\/.*)?$/],
      output: {
        globals: { vue: 'Vue', vitepress: 'VitePress' },
      },
    },
  },
  test: {
    environment: 'jsdom',
    server: {
      // vitepress/theme has a top-level CSS import (fonts.css); without
      // this it's loaded via Node's native ESM resolver instead of being
      // processed by Vite's CSS/Vue pipeline, which errors on the .css
      // extension. Force it through Vite's transform pipeline instead.
      deps: {
        inline: ['vitepress'],
      },
    },
  },
})
