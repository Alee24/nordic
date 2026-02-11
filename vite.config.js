import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8542,
    strictPort: true,
    host: true
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
