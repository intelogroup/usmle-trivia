#!/usr/bin/env node

/**
 * 🔧 GLOBAL TEST SETUP
 * Initializes test environment and configurations
 */

import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

async function globalSetup() {
  console.log('🔧 Setting up global test environment for MedQuiz Pro...');

  // Create test directories
  const testDirs = [
    './test-results',
    './test-results/screenshots',
    './test-results/videos',
    './test-results/traces',
    './test-results/reports'
  ];

  testDirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`   📁 Created directory: ${dir}`);
    }
  });

  // Setup test environment variables
  process.env.TEST_TIMESTAMP = new Date().toISOString();
  process.env.TEST_SESSION_ID = `quiz-tests-${Date.now()}`;

  // Initialize Convex MCP if available
  try {
    console.log('🔄 Initializing Convex MCP for testing...');
    
    // Create test configuration
    const testConfig = {
      testSession: process.env.TEST_SESSION_ID,
      timestamp: process.env.TEST_TIMESTAMP,
      convexDeployment: 'formal-sardine-916',
      baseURL: process.env.TEST_BASE_URL || 'https://usmle-trivia.netlify.app'
    };

    writeFileSync('./test-results/test-config.json', JSON.stringify(testConfig, null, 2));
    console.log('   ✅ Test configuration saved');

  } catch (error) {
    console.log(`   ⚠️ Convex MCP initialization skipped: ${error.message}`);
  }

  // Verify test target accessibility
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    const testURL = process.env.TEST_BASE_URL || 'https://usmle-trivia.netlify.app';
    console.log(`🌐 Verifying test target: ${testURL}`);
    
    await page.goto(testURL, { timeout: 30000 });
    const title = await page.title();
    
    console.log(`   ✅ Test target accessible: "${title}"`);
    await browser.close();

  } catch (error) {
    console.log(`   ❌ Test target verification failed: ${error.message}`);
    console.log('   🔄 Tests will continue but may encounter connectivity issues');
  }

  // Create test metadata
  const testMetadata = {
    startTime: new Date().toISOString(),
    sessionId: process.env.TEST_SESSION_ID,
    platform: 'MedQuiz Pro',
    testSuite: 'Comprehensive Quiz Functionality',
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      testURL: process.env.TEST_BASE_URL || 'https://usmle-trivia.netlify.app'
    },
    configuration: {
      browsers: ['chromium', 'firefox', 'webkit'],
      devices: ['desktop', 'tablet', 'mobile'],
      testTypes: ['functionality', 'accessibility', 'performance', 'medical-content']
    }
  };

  writeFileSync('./test-results/test-metadata.json', JSON.stringify(testMetadata, null, 2));

  console.log('✅ Global test setup completed successfully');
  console.log(`   📋 Session ID: ${process.env.TEST_SESSION_ID}`);
  console.log(`   🕒 Start Time: ${testMetadata.startTime}`);
  
  return testMetadata;
}

export default globalSetup;