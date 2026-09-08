import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // SPA fallback: all routes serve index.html
  appType: 'spa',
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  build: {
    // Increase chunk size warning limit (THREE.js is inherently large)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate THREE.js into its own chunk (~600KB) so it's only
          // loaded on desktop when Cursor3D lazy-loads
          three: ['three'],
          // Separate animation libraries
          'framer-motion': ['framer-motion'],
          // GSAP suite
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
