import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizations for production
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          convex: ['convex/react'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    },
    // Increase chunk size warning limit for medical content
    chunkSizeWarningLimit: 1000,
  },
  
  // Development server optimization
  server: {
    host: true,
    port: 5173
  },
  
  // Preview server for production testing
  preview: {
    host: true,
    port: 4173
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
