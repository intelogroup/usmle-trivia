import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  
  // Optimizations for production
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false, // Disable sourcemaps for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('convex')) {
              return 'convex';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui-libs';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
            return 'vendor'; // All other node_modules
          }
          
          // Split large application code
          if (id.includes('/src/data/sampleQuestions')) {
            return 'questions-data'; // Separate chunk for question data
          }
          if (id.includes('/src/components/quiz/')) {
            return 'quiz-components';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
          if (id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          return `assets/${name}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      // Enable tree shaking
      treeshake: {
        preset: 'recommended',
        manualPureFunctions: ['console.log', 'console.warn']
      }
    },
    // Reduce chunk size warning limit after optimizations
    chunkSizeWarningLimit: 400, // Target <400KB chunks
    // Enable compression
    reportCompressedSize: true,
    // Additional production optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 8192, // 8KB inline limit
  },
  
  // Development server optimization
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false // Disable error overlay for better performance
    }
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
  },
  
  // Development and production optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'lucide-react'
    ],
    exclude: [
      // Exclude large dependencies from optimization
      'framer-motion'
    ]
  },
  
  // Additional build optimizations for production
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  
  // Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
})
