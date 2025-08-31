import { defineConfig } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        formats: ['cjs'],
        fileName: () => 'main.js',
      },
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        external: [
          // ensure native addon loads at runtime from node_modules
          'keytar',
        ],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/preload.ts'),
        formats: ['cjs'],
        fileName: () => 'preload.js',
      },
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        external: [
          'keytar',
        ],
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html'),
      },
    },
  },
})
