#!/usr/bin/env node

/**
 * 🌐 CROSS-BROWSER QUIZ TESTING CONFIGURATION
 * Advanced device and browser matrix testing for Quiz functionality
 */

// Browser and Device Configuration Matrix
export const BROWSER_MATRIX = {
  desktop: {
    chrome: {
      name: 'Chrome Desktop',
      browser: 'chromium',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      features: ['hardware-acceleration', 'webgl', 'localStorage', 'sessionStorage', 'indexedDB']
    },
    firefox: {
      name: 'Firefox Desktop',
      browser: 'firefox',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
      features: ['webgl', 'localStorage', 'sessionStorage', 'indexedDB']
    },
    safari: {
      name: 'Safari Desktop',
      browser: 'webkit',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      features: ['webgl', 'localStorage', 'sessionStorage', 'indexedDB']
    },
    edge: {
      name: 'Edge Desktop',
      browser: 'chromium',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      features: ['hardware-acceleration', 'webgl', 'localStorage', 'sessionStorage', 'indexedDB']
    }
  },
  tablet: {
    ipad: {
      name: 'iPad',
      browser: 'webkit',
      viewport: { width: 768, height: 1024 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      features: ['touch', 'orientation', 'localStorage', 'sessionStorage']
    },
    androidTablet: {
      name: 'Android Tablet',
      browser: 'chromium',
      viewport: { width: 768, height: 1024 },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      features: ['touch', 'orientation', 'localStorage', 'sessionStorage', 'indexedDB']
    }
  },
  mobile: {
    iphone: {
      name: 'iPhone',
      browser: 'webkit',
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      features: ['touch', 'orientation', 'localStorage', 'sessionStorage']
    },
    android: {
      name: 'Android Phone',
      browser: 'chromium',
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      features: ['touch', 'orientation', 'localStorage', 'sessionStorage', 'indexedDB']
    }
  }
};

// Quiz-Specific Test Scenarios
export const QUIZ_TEST_SCENARIOS = {
  quickQuiz: {
    name: 'Quick Quiz (5 Questions)',
    duration: 300, // 5 minutes
    questions: 5,
    timeLimit: false,
    difficulty: 'mixed',
    categories: ['general', 'anatomy', 'physiology']
  },
  timedQuiz: {
    name: 'Timed Quiz (10 Questions)',
    duration: 600, // 10 minutes
    questions: 10,
    timeLimit: true,
    difficulty: 'progressive',
    categories: ['pathology', 'pharmacology', 'clinical']
  },
  customQuiz: {
    name: 'Custom Quiz (8 Questions)',
    duration: 480, // 8 minutes
    questions: 8,
    timeLimit: true,
    difficulty: 'adaptive',
    categories: ['cardiology', 'neurology', 'endocrinology']
  },
  challengeQuiz: {
    name: 'Challenge Quiz (15 Questions)',
    duration: 900, // 15 minutes
    questions: 15,
    timeLimit: true,
    difficulty: 'hard',
    categories: ['surgery', 'emergency', 'internal-medicine']
  }
};

// Performance Benchmarks by Device Type
export const PERFORMANCE_BENCHMARKS = {
  desktop: {
    pageLoad: 2000,      // 2 seconds
    questionRender: 500,  // 0.5 seconds
    answerSubmit: 300,   // 0.3 seconds
    navigation: 200,     // 0.2 seconds
    memoryUsage: 50      // 50MB max
  },
  tablet: {
    pageLoad: 3000,      // 3 seconds
    questionRender: 800,  // 0.8 seconds
    answerSubmit: 500,   // 0.5 seconds
    navigation: 400,     // 0.4 seconds
    memoryUsage: 40      // 40MB max
  },
  mobile: {
    pageLoad: 4000,      // 4 seconds
    questionRender: 1000, // 1 second
    answerSubmit: 700,   // 0.7 seconds
    navigation: 600,     // 0.6 seconds
    memoryUsage: 30      // 30MB max
  }
};

// Medical Education Specific Test Data
export const MEDICAL_TEST_DATA = {
  users: [
    {
      profile: 'medical-student-ms1',
      email: 'ms1.student@medschool.edu',
      password: 'MedStudent123!',
      name: 'John Medical Student',
      level: 'MS1',
      specialties: ['anatomy', 'physiology', 'biochemistry'],
      goals: 'USMLE Step 1 Preparation'
    },
    {
      profile: 'medical-student-ms3',
      email: 'ms3.clinical@medschool.edu',
      password: 'Clinical456!',
      name: 'Sarah Clinical Student',
      level: 'MS3',
      specialties: ['internal-medicine', 'surgery', 'pediatrics'],
      goals: 'USMLE Step 2 CK Preparation'
    },
    {
      profile: 'resident-pgy1',
      email: 'pgy1.resident@hospital.edu',
      password: 'Resident789!',
      name: 'Dr. Michael Resident',
      level: 'PGY1',
      specialties: ['internal-medicine', 'cardiology'],
      goals: 'Board Certification Prep'
    }
  ],
  questions: {
    anatomy: [
      {
        type: 'multiple-choice',
        stem: 'A 25-year-old medical student is studying the heart. Which chamber of the heart has the thickest muscular wall?',
        options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
        correct: 3,
        explanation: 'The left ventricle has the thickest muscular wall because it must pump blood to the entire systemic circulation.',
        references: ['First Aid USMLE Step 1', 'Netters Anatomy']
      }
    ],
    physiology: [
      {
        type: 'clinical-scenario',
        stem: 'A 45-year-old man presents with chest pain and shortness of breath. His ECG shows ST-segment elevation in leads II, III, and aVF. What is the most likely location of the myocardial infarction?',
        options: ['Anterior wall', 'Lateral wall', 'Inferior wall', 'Posterior wall'],
        correct: 2,
        explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall MI, typically involving the right coronary artery.',
        references: ['ECG Interpretation', 'Cardiology Pathophysiology']
      }
    ]
  }
};

// Accessibility Testing Configuration
export const ACCESSIBILITY_CONFIG = {
  standards: ['WCAG21AA', 'Section508'],
  testCases: [
    {
      name: 'Keyboard Navigation',
      description: 'Test complete quiz flow using only keyboard',
      keys: ['Tab', 'Enter', 'Space', 'Arrow Keys'],
      expected: 'Full quiz completion without mouse'
    },
    {
      name: 'Screen Reader Compatibility',
      description: 'Test quiz with screen reader simulation',
      tools: ['axe-core', 'lighthouse-accessibility'],
      expected: 'All content accessible via screen reader'
    },
    {
      name: 'High Contrast Mode',
      description: 'Test quiz in high contrast mode',
      settings: { contrast: 'high', colors: 'inverted' },
      expected: 'Readable content in high contrast'
    },
    {
      name: 'Focus Management',
      description: 'Test focus indicators and management',
      elements: ['buttons', 'inputs', 'links', 'interactive'],
      expected: 'Clear focus indicators throughout'
    }
  ]
};

// Network Condition Testing
export const NETWORK_CONDITIONS = {
  fast3g: {
    name: 'Fast 3G',
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
    latency: 150
  },
  slow3g: {
    name: 'Slow 3G',
    downloadThroughput: 500 * 1024 / 8,  // 500 Kbps
    uploadThroughput: 500 * 1024 / 8,    // 500 Kbps
    latency: 400
  },
  offline: {
    name: 'Offline',
    offline: true
  }
};

// Test Reporting Configuration
export const REPORTING_CONFIG = {
  outputDir: '/root/repo/test-results/cross-browser-quiz',
  formats: ['json', 'html', 'junit'],
  screenshots: {
    onFailure: true,
    onSuccess: false,
    fullPage: true,
    quality: 90
  },
  videos: {
    retain: 'on-failure',
    quality: 'medium'
  },
  traces: {
    retain: 'on-failure',
    screenshots: true,
    snapshots: true
  }
};

// Feature Detection Tests
export const FEATURE_TESTS = {
  localStorage: () => typeof Storage !== 'undefined',
  sessionStorage: () => typeof sessionStorage !== 'undefined',
  indexedDB: () => typeof indexedDB !== 'undefined',
  webGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  },
  touchEvents: () => 'ontouchstart' in window,
  deviceOrientation: () => 'onorientationchange' in window,
  mediaQueries: () => typeof window.matchMedia !== 'undefined',
  cssGrid: () => CSS.supports('display', 'grid'),
  cssFlexbox: () => CSS.supports('display', 'flex')
};

// Medical Content Validation
export const MEDICAL_VALIDATION = {
  terminology: [
    'myocardial infarction', 'hypertension', 'diabetes mellitus',
    'pneumonia', 'sepsis', 'stroke', 'cancer', 'infection'
  ],
  references: [
    'First Aid USMLE Step 1', 'First Aid USMLE Step 2 CK',
    'Pathoma', 'Sketchy Medical', 'UWorld', 'NBME'
  ],
  categories: [
    'anatomy', 'physiology', 'pathology', 'pharmacology',
    'microbiology', 'immunology', 'behavioral-science',
    'internal-medicine', 'surgery', 'pediatrics', 'obstetrics-gynecology',
    'psychiatry', 'neurology', 'dermatology', 'ophthalmology',
    'otolaryngology', 'emergency-medicine', 'family-medicine'
  ]
};

export default {
  BROWSER_MATRIX,
  QUIZ_TEST_SCENARIOS,
  PERFORMANCE_BENCHMARKS,
  MEDICAL_TEST_DATA,
  ACCESSIBILITY_CONFIG,
  NETWORK_CONDITIONS,
  REPORTING_CONFIG,
  FEATURE_TESTS,
  MEDICAL_VALIDATION
};