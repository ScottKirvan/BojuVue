import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BojuVue',
      fileName: 'bojuvue',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vitepress'],
      output: {
        globals: { vue: 'Vue', vitepress: 'VitePress' },
      },
    },
  },
})
