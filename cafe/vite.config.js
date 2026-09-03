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
})
