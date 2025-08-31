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
        external: [],
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
        external: [],
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    server: { port: 5173 },
    build: {
      outDir: resolve(__dirname, 'dist'),
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html'),
      },
    },
  },
})
