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
        // Vite 8 (rolldown) requires manualChunks to be a function, not an object
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) return 'gsap';
        },
      },
    },
  },
})
