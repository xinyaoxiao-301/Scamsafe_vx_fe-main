// Vite config for the ScamSafe frontend. This keeps path aliases and the local
// API proxy in one place so app code can stay environment-agnostic.
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Keep frontend calls same-origin in development so pages stay decoupled
      // from whichever backend host is currently serving the API.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
