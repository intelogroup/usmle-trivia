module.exports = {
  ci: {
    collect: {
      url: [
        'https://usmle-trivia.netlify.app',
        'https://usmle-trivia.netlify.app/login',
        'https://usmle-trivia.netlify.app/dashboard',
        'https://usmle-trivia.netlify.app/register',
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:.*:4173',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3, // Average of 3 runs for more reliable results
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // Medical platform optimization settings
        throttlingMethod: 'devtools',
        // Simulate real-world medical student conditions
        throttling: {
          rttMs: 150,      // Typical mobile/wifi latency
          throughputKbps: 1600,  // 3G connection speed
          cpuSlowdownMultiplier: 4, // Simulate lower-end devices
        },
        emulatedFormFactor: 'mobile', // Medical students often use mobile
        internalDisableDeviceScreenEmulation: false,
      },
      headful: false,
    },
    assert: {
      // Medical platform performance requirements
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }], // 85+ for medical apps
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95+ for medical accessibility
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
        
        // Core Web Vitals - Critical for medical platform UX
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }], // 2.5s
        'first-input-delay': ['warn', { maxNumericValue: 100 }], // 100ms
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }], // 0.1
        
        // Medical platform specific requirements
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // 2s for quick access
        'speed-index': ['warn', { maxNumericValue: 3000 }], // 3s visual completeness
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms interactivity
        
        // Accessibility requirements for medical professionals
        'color-contrast': 'error', // Critical for medical data visibility
        'heading-order': 'warn',
        'html-has-lang': 'error',
        'image-alt': 'warn',
        'link-name': 'warn',
        'meta-viewport': 'error',
        
        // Security requirements for medical data
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'warn',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      // Store reports for 30 days for medical compliance tracking
      reportFilenamePattern: 'medquiz-lighthouse-%%DATETIME%%-%%PATHNAME%%.%%EXTENSION%%',
    },
    server: {
      port: 9009,
      storage: {
        sqlDatabasePath: './lighthouse-server.db',
      },
    },
    wizard: {
      // Medical platform deployment wizard settings
      chromeFlags: '--no-sandbox --disable-dev-shm-usage',
    },
  },
}