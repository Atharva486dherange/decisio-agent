import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_'],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.DECISIO_API_URL || 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
