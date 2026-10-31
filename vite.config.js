import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  // Only these public Supabase values may cross into the browser bundle.
  define: {
    'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
    'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
  },
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
  };
})
