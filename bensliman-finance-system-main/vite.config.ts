import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',            // explicit (default), good on Vercel
  build: { sourcemap: true },
  optimizeDeps: { exclude: ['lucide-react'] },
})
