import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB limit for medical content
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: ({ request }) => 
              request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            // Cache API responses (Convex/medical data)
            urlPattern: /^https:\/\/.*\.convex\.(cloud|site)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60 // 5 minutes for medical data
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MedQuiz Pro - USMLE Preparation',
        short_name: 'MedQuiz Pro',
        description: 'Professional USMLE medical quiz application for medical students',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'medical', 'productivity'],
        lang: 'en-US',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Quiz',
            short_name: 'Quick Quiz',
            description: 'Start a 5-question quick quiz',
            url: '/quiz/quick',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your study progress',
            url: '/dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  
  // Optimizations for production
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'lightningcss',
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
