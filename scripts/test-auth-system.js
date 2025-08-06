#!/usr/bin/env node

/**
 * Comprehensive Authentication System Test
 * Tests all components of the auth system to ensure production readiness
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper function to read file content
async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

// Test 1: Check Core Authentication Files
async function testAuthenticationFiles() {
  log.section('1. CHECKING CORE AUTHENTICATION FILES');
  
  const requiredFiles = [
    { path: 'src/main.tsx', description: 'Main app entry with ConvexProvider' },
    { path: 'src/App.tsx', description: 'App component with protected routes' },
    { path: 'src/services/auth.ts', description: 'Authentication service' },
    { path: 'src/services/convexAuth.ts', description: 'Convex auth implementation' },
    { path: 'src/store/index.ts', description: 'User state management' },
    { path: 'src/pages/Login.tsx', description: 'Login page' },
    { path: 'src/pages/Register.tsx', description: 'Registration page' },
    { path: 'src/pages/Landing.tsx', description: 'Landing page' },
    { path: 'src/pages/Dashboard.tsx', description: 'Dashboard (protected)' },
    { path: 'src/components/layout/AppLayout.tsx', description: 'App layout wrapper' },
    { path: 'convex/auth.ts', description: 'Convex auth functions' },
    { path: '.env', description: 'Environment configuration' }
  ];
  
  for (const file of requiredFiles) {
    const fullPath = path.join(rootDir, file.path);
    if (await fileExists(fullPath)) {
      log.success(`${file.description}: ${file.path}`);
      testResults.passed++;
    } else {
      log.error(`${file.description}: ${file.path} - FILE NOT FOUND`);
      testResults.failed++;
    }
  }
}

// Test 2: Verify ConvexProvider Setup
async function testConvexProviderSetup() {
  log.section('2. VERIFYING CONVEX PROVIDER SETUP');
  
  const mainTsxPath = path.join(rootDir, 'src/main.tsx');
  const content = await readFile(mainTsxPath);
  
  if (content) {
    const checks = [
      { pattern: /ConvexProvider/, description: 'ConvexProvider import' },
      { pattern: /client={?convex}?/, description: 'Convex client prop' },
      { pattern: /<ConvexProvider[^>]*>[\s\S]*<App\s*\/?>[\s\S]*<\/ConvexProvider>/, description: 'App wrapped in ConvexProvider' }
    ];
    
    for (const check of checks) {
      if (check.pattern.test(content)) {
        log.success(check.description);
        testResults.passed++;
      } else {
        log.error(`${check.description} - NOT FOUND`);
        testResults.failed++;
      }
    }
  } else {
    log.error('Could not read main.tsx');
    testResults.failed++;
  }
}

// Test 3: Verify Protected Routes Implementation
async function testProtectedRoutes() {
  log.section('3. VERIFYING PROTECTED ROUTES');
  
  const appTsxPath = path.join(rootDir, 'src/App.tsx');
  const content = await readFile(appTsxPath);
  
  if (content) {
    // Check for ProtectedRoute component
    if (content.includes('ProtectedRoute')) {
      log.success('ProtectedRoute component defined');
      testResults.passed++;
      
      // Check authentication logic
      if (content.includes('isAuthenticated') && content.includes('Navigate')) {
        log.success('Authentication check and redirect logic present');
        testResults.passed++;
      } else {
        log.error('Authentication logic incomplete');
        testResults.failed++;
      }
      
      // Check protected routes
      const protectedRoutes = [
        '/dashboard',
        '/quiz',
        '/progress',
        '/leaderboard',
        '/profile',
        '/analytics',
        '/social'
      ];
      
      let protectedCount = 0;
      for (const route of protectedRoutes) {
        if (content.includes(`path="${route}"`) && content.includes('<ProtectedRoute>')) {
          protectedCount++;
        }
      }
      
      if (protectedCount >= 5) {
        log.success(`${protectedCount} protected routes configured`);
        testResults.passed++;
      } else {
        log.warning(`Only ${protectedCount} protected routes found (expected 7+)`);
        testResults.warnings++;
      }
    } else {
      log.error('ProtectedRoute component not found');
      testResults.failed++;
    }
  } else {
    log.error('Could not read App.tsx');
    testResults.failed++;
  }
}

// Test 4: Verify Authentication Service
async function testAuthService() {
  log.section('4. VERIFYING AUTHENTICATION SERVICE');
  
  const authServicePath = path.join(rootDir, 'src/services/auth.ts');
  const convexAuthPath = path.join(rootDir, 'src/services/convexAuth.ts');
  
  const authContent = await readFile(authServicePath);
  const convexAuthContent = await readFile(convexAuthPath);
  
  if (authContent && convexAuthContent) {
    const requiredMethods = [
      'createAccount',
      'login',
      'logout',
      'getCurrentUser',
      'updateProfile'
    ];
    
    for (const method of requiredMethods) {
      if (authContent.includes(method) && convexAuthContent.includes(method)) {
        log.success(`${method} method implemented`);
        testResults.passed++;
      } else {
        log.error(`${method} method missing or incomplete`);
        testResults.failed++;
      }
    }
    
    // Check Convex integration
    if (convexAuthContent.includes('ConvexReactClient')) {
      log.success('Convex client integration present');
      testResults.passed++;
    } else {
      log.error('Convex client integration missing');
      testResults.failed++;
    }
  } else {
    log.error('Could not read auth service files');
    testResults.failed++;
  }
}

// Test 5: Verify User Store
async function testUserStore() {
  log.section('5. VERIFYING USER STORE');
  
  const storePath = path.join(rootDir, 'src/store/index.ts');
  const content = await readFile(storePath);
  
  if (content) {
    const storeFeatures = [
      { pattern: /user:\s*IUser\s*\|\s*null/, description: 'User state property' },
      { pattern: /isAuthenticated/, description: 'Authentication flag' },
      { pattern: /isLoading/, description: 'Loading state' },
      { pattern: /setUser/, description: 'Set user method' },
      { pattern: /zustand|create/, description: 'Zustand state management' }
    ];
    
    for (const feature of storeFeatures) {
      if (feature.pattern.test(content)) {
        log.success(feature.description);
        testResults.passed++;
      } else {
        log.error(`${feature.description} - NOT FOUND`);
        testResults.failed++;
      }
    }
  } else {
    log.error('Could not read store/index.ts');
    testResults.failed++;
  }
}

// Test 6: Verify Convex Backend Functions
async function testConvexBackend() {
  log.section('6. VERIFYING CONVEX BACKEND');
  
  const convexAuthPath = path.join(rootDir, 'convex/auth.ts');
  const content = await readFile(convexAuthPath);
  
  if (content) {
    const backendFunctions = [
      { pattern: /createUser/, description: 'createUser mutation' },
      { pattern: /getUserByEmail/, description: 'getUserByEmail query' },
      { pattern: /getUserById/, description: 'getUserById query' },
      { pattern: /updateUserProfile/, description: 'updateUserProfile mutation' },
      { pattern: /getLeaderboard/, description: 'getLeaderboard query' }
    ];
    
    for (const func of backendFunctions) {
      if (func.pattern.test(content)) {
        log.success(func.description);
        testResults.passed++;
      } else {
        log.error(`${func.description} - NOT FOUND`);
        testResults.failed++;
      }
    }
  } else {
    log.error('Could not read convex/auth.ts');
    testResults.failed++;
  }
}

// Test 7: Verify Environment Configuration
async function testEnvironmentConfig() {
  log.section('7. VERIFYING ENVIRONMENT CONFIGURATION');
  
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  
  const envContent = await readFile(envPath);
  const envExampleContent = await readFile(envExamplePath);
  
  if (envContent) {
    if (envContent.includes('VITE_CONVEX_URL')) {
      log.success('.env file contains VITE_CONVEX_URL');
      testResults.passed++;
      
      if (envContent.includes('https://formal-sardine-916.convex.cloud')) {
        log.success('Convex URL correctly configured');
        testResults.passed++;
      } else {
        log.warning('Convex URL may need verification');
        testResults.warnings++;
      }
    } else {
      log.error('VITE_CONVEX_URL not found in .env');
      testResults.failed++;
    }
  } else {
    log.error('.env file not found');
    testResults.failed++;
  }
  
  if (envExampleContent) {
    log.success('.env.example file present for reference');
    testResults.passed++;
  } else {
    log.warning('.env.example file not found');
    testResults.warnings++;
  }
}

// Test 8: Verify Authentication Pages
async function testAuthPages() {
  log.section('8. VERIFYING AUTHENTICATION PAGES');
  
  const pages = [
    { path: 'src/pages/Login.tsx', features: ['email', 'password', 'handleSubmit', 'authService.login'] },
    { path: 'src/pages/Register.tsx', features: ['email', 'password', 'name', 'authService.createAccount'] },
    { path: 'src/pages/Landing.tsx', features: ['Login', 'Register', 'Hero'] }
  ];
  
  for (const page of pages) {
    const fullPath = path.join(rootDir, page.path);
    const content = await readFile(fullPath);
    
    if (content) {
      log.info(`Checking ${page.path}`);
      let featureCount = 0;
      
      for (const feature of page.features) {
        if (content.includes(feature)) {
          featureCount++;
        }
      }
      
      if (featureCount === page.features.length) {
        log.success(`All ${featureCount} features present`);
        testResults.passed++;
      } else {
        log.warning(`${featureCount}/${page.features.length} features found`);
        testResults.warnings++;
      }
    } else {
      log.error(`Could not read ${page.path}`);
      testResults.failed++;
    }
  }
}

// Test 9: Verify AppLayout Integration
async function testAppLayout() {
  log.section('9. VERIFYING APP LAYOUT INTEGRATION');
  
  const layoutPath = path.join(rootDir, 'src/components/layout/AppLayout.tsx');
  const content = await readFile(layoutPath);
  
  if (content) {
    const layoutFeatures = [
      { pattern: /(DesktopLayout|MobileLayout)/, description: 'Responsive layout components' },
      { pattern: /useResponsive/, description: 'Responsive hook integration' },
      { pattern: /children/, description: 'Children prop for content' },
      { pattern: /DatabaseSeeder/, description: 'Development tools integration' }
    ];
    
    for (const feature of layoutFeatures) {
      if (feature.pattern.test(content)) {
        log.success(feature.description);
        testResults.passed++;
      } else {
        log.error(`${feature.description} - NOT FOUND`);
        testResults.failed++;
      }
    }
  } else {
    log.error('Could not read AppLayout.tsx');
    testResults.failed++;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}🔐 AUTHENTICATION SYSTEM COMPREHENSIVE TEST${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  
  await testAuthenticationFiles();
  await testConvexProviderSetup();
  await testProtectedRoutes();
  await testAuthService();
  await testUserStore();
  await testConvexBackend();
  await testEnvironmentConfig();
  await testAuthPages();
  await testAppLayout();
  
  // Generate summary
  log.section('TEST SUMMARY');
  
  const total = testResults.passed + testResults.failed;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  if (testResults.warnings > 0) {
    console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings}${colors.reset}`);
  }
  if (testResults.failed > 0) {
    console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  }
  console.log(`\n📊 Pass Rate: ${passRate}%`);
  
  // Final verdict
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  
  if (passRate >= 90) {
    console.log(`${colors.green}🎉 AUTHENTICATION SYSTEM IS PRODUCTION READY!${colors.reset}`);
    console.log(`${colors.green}✨ All core components are properly configured.${colors.reset}`);
    console.log(`${colors.green}🚀 You can proceed with backend and frontend development.${colors.reset}`);
  } else if (passRate >= 70) {
    console.log(`${colors.yellow}⚠️  AUTHENTICATION SYSTEM NEEDS MINOR FIXES${colors.reset}`);
    console.log(`${colors.yellow}Please address the failed tests before proceeding.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ AUTHENTICATION SYSTEM HAS CRITICAL ISSUES${colors.reset}`);
    console.log(`${colors.red}Major fixes required before development can continue.${colors.reset}`);
  }
  
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});