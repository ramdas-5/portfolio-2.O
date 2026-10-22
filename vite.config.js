import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // Windows locks (e.g. images open in a viewer) crash Vite's watcher with
      // EBUSY. These assets still import/serve normally — we just don't watch
      // them for hot reload.
      ignored: ['**/src/components/assest/**'],
    },
  },
})
