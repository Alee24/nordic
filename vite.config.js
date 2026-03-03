import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8124,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8123',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:8123',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['recharts', 'framer-motion']
  },
  build: {
    rollupOptions: {
      external: [],
    }
  }
})
