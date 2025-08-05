/**
 * 🎭 PLAYWRIGHT COMPREHENSIVE QUIZ TESTING CONFIGURATION
 * Advanced cross-browser testing setup for Quiz functionality
 */

import { defineConfig, devices } from '@playwright/test';
import { BROWSER_MATRIX, PERFORMANCE_BENCHMARKS, REPORTING_CONFIG } from './tests/cross-browser-quiz-config.js';

export default defineConfig({
  // Test directory configuration
  testDir: './tests',
  testMatch: [
    '**/quiz-comprehensive-test-suite.js',
    '**/user-journey-quiz-tests.js',
    '**/cross-browser-quiz-*.js'
  ],

  // Global test settings
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporting configuration
  reporter: [
    ['html', { 
      outputFolder: './test-results/quiz-comprehensive-html-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: './test-results/quiz-comprehensive-results.json'
    }],
    ['junit', { 
      outputFile: './test-results/quiz-comprehensive-junit.xml'
    }],
    ['line']
  ],

  // Global test configuration
  use: {
    // Base URL configuration
    baseURL: process.env.TEST_BASE_URL || 'https://usmle-trivia.netlify.app',
    
    // Browser settings
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Action timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Screenshots and videos
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    trace: {
      mode: 'retain-on-failure',
      screenshots: true,
      snapshots: true,
      sources: true
    },

    // Medical education specific settings
    extraHTTPHeaders: {
      'X-Test-Environment': 'comprehensive-quiz-testing',
      'X-Medical-Education-Platform': 'MedQuiz-Pro'
    }
  },

  // Project configurations for different browsers and scenarios
  projects: [
    // Desktop Browser Testing
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: BROWSER_MATRIX.desktop.chrome.viewport,
        userAgent: BROWSER_MATRIX.desktop.chrome.userAgent
      },
      testMatch: '**/quiz-comprehensive-test-suite.js'
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: BROWSER_MATRIX.desktop.firefox.viewport,
        userAgent: BROWSER_MATRIX.desktop.firefox.userAgent
      },
      testMatch: '**/quiz-comprehensive-test-suite.js'
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: BROWSER_MATRIX.desktop.safari.viewport,
        userAgent: BROWSER_MATRIX.desktop.safari.userAgent
      },
      testMatch: '**/quiz-comprehensive-test-suite.js'
    },

    // Tablet Testing
    {
      name: 'ipad',
      use: { 
        ...devices['iPad Pro'],
        viewport: BROWSER_MATRIX.tablet.ipad.viewport,
        userAgent: BROWSER_MATRIX.tablet.ipad.userAgent
      },
      testMatch: '**/user-journey-quiz-tests.js'
    },
    {
      name: 'android-tablet',
      use: { 
        ...devices['Galaxy Tab S4'],
        viewport: BROWSER_MATRIX.tablet.androidTablet.viewport,
        userAgent: BROWSER_MATRIX.tablet.androidTablet.userAgent
      },
      testMatch: '**/user-journey-quiz-tests.js'
    },

    // Mobile Testing
    {
      name: 'iphone',
      use: { 
        ...devices['iPhone 13'],
        viewport: BROWSER_MATRIX.mobile.iphone.viewport,
        userAgent: BROWSER_MATRIX.mobile.iphone.userAgent
      },
      testMatch: '**/user-journey-quiz-tests.js'
    },
    {
      name: 'android',
      use: { 
        ...devices['Pixel 5'],
        viewport: BROWSER_MATRIX.mobile.android.viewport,
        userAgent: BROWSER_MATRIX.mobile.android.userAgent
      },
      testMatch: '**/user-journey-quiz-tests.js'
    },

    // Performance Testing Projects
    {
      name: 'performance-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-features=NetworkService', '--enable-logging', '--log-level=0']
        }
      },
      testMatch: '**/performance-*.js'
    },

    // Accessibility Testing
    {
      name: 'accessibility-testing',
      use: { 
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Accessibility-Test': 'true'
        }
      },
      testMatch: '**/accessibility-*.js'
    },

    // Network Condition Testing
    {
      name: 'slow-3g-testing',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          offline: false,
          extraHTTPHeaders: {
            'X-Network-Condition': 'slow-3g'
          }
        }
      },
      testMatch: '**/network-*.js'
    },

    // Medical Education Specific Testing
    {
      name: 'medical-content-validation',
      use: { 
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Medical-Validation': 'true',
          'X-USMLE-Content': 'validation'
        }
      },
      testMatch: '**/medical-content-*.js'
    }
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      VITE_TEST_MODE: 'true',
      VITE_QUIZ_TESTING: 'comprehensive'
    }
  },

  // Global setup and teardown
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',

  // Test metadata
  metadata: {
    platform: 'MedQuiz Pro',
    testSuite: 'Comprehensive Quiz Functionality',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    medicalEducation: {
      standards: ['USMLE', 'NBME', 'Medical Education Standards'],
      accessibility: ['WCAG 2.1 AA', 'Section 508'],
      browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      devices: ['Desktop', 'Tablet', 'Mobile']
    }
  }
});