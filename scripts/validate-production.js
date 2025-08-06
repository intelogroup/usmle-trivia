#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates that all required environment variables and configurations
 * are properly set for production deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function validateProduction() {
  log.info('🚀 Validating MedQuiz Pro Production Configuration...\n');
  
  let isValid = true;
  
  // Check Netlify configuration
  log.info('📋 Checking Netlify Configuration...');
  
  if (existsSync('./netlify.toml')) {
    log.success('netlify.toml configuration found');
    
    const netlifyConfig = readFileSync('./netlify.toml', 'utf8');
    
    // Check required sections
    const requiredSections = [
      '[build]',
      '[[redirects]]',
      '[[headers]]',
      '[context.production.environment]'
    ];
    
    requiredSections.forEach(section => {
      if (netlifyConfig.includes(section)) {
        log.success(`${section} configuration present`);
      } else {
        log.error(`Missing ${section} in netlify.toml`);
        isValid = false;
      }
    });
    
    // Check for Convex URL
    if (netlifyConfig.includes('VITE_CONVEX_URL')) {
      log.success('Convex URL configured');
    } else {
      log.error('VITE_CONVEX_URL not found in netlify.toml');
      isValid = false;
    }
    
  } else {
    log.error('netlify.toml not found');
    isValid = false;
  }
  
  // Check _redirects file
  if (existsSync('./public/_redirects')) {
    log.success('_redirects file found for SPA routing');
  } else {
    log.warning('_redirects file missing - SPA routing may not work properly');
  }
  
  // Check package.json scripts
  log.info('\n📦 Checking Package.json Scripts...');
  
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const requiredScripts = [
    'build',
    'preview',
    'build:prod',
    'netlify:dev',
    'netlify:build'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      log.success(`${script} script available`);
    } else {
      log.error(`Missing ${script} script in package.json`);
      isValid = false;
    }
  });
  
  // Check Convex configuration
  log.info('\n🔧 Checking Convex Configuration...');
  
  if (existsSync('./convex/_generated/api.ts')) {
    log.success('Convex API types generated');
  } else {
    log.warning('Convex types not generated - run "convex dev" first');
  }
  
  if (existsSync('./convex.config.ts')) {
    log.success('Convex configuration found');
  } else {
    log.error('convex.config.ts missing');
    isValid = false;
  }
  
  // Check Vite configuration
  log.info('\n⚡ Checking Vite Configuration...');
  
  if (existsSync('./vite.config.ts')) {
    log.success('Vite configuration found');
    
    const viteConfig = readFileSync('./vite.config.ts', 'utf8');
    if (viteConfig.includes('react()')) {
      log.success('React plugin configured');
    }
    if (viteConfig.includes('build:')) {
      log.success('Build configuration present');
    }
  } else {
    log.error('vite.config.ts missing');
    isValid = false;
  }
  
  // Check TypeScript configuration
  log.info('\n📝 Checking TypeScript Configuration...');
  
  if (existsSync('./tsconfig.json')) {
    log.success('TypeScript configuration found');
  } else {
    log.error('tsconfig.json missing');
    isValid = false;
  }
  
  // Check Tailwind configuration
  log.info('\n🎨 Checking Tailwind CSS Configuration...');
  
  if (existsSync('./tailwind.config.js')) {
    log.success('Tailwind configuration found');
  } else {
    log.error('tailwind.config.js missing');
    isValid = false;
  }
  
  // Final validation
  log.info('\n🔍 Final Validation Results...');
  
  if (isValid) {
    log.success('🎉 All production configurations are valid!');
    log.info('\n📋 Next Steps:');
    log.info('1. Run "npm run netlify:dev" to test locally with Netlify CLI');
    log.info('2. Run "npm run build:prod" to create production build');
    log.info('3. Run "npm run netlify:deploy" to deploy to staging');
    log.info('4. Run "npm run netlify:deploy:prod" to deploy to production');
    process.exit(0);
  } else {
    log.error('❌ Production configuration validation failed!');
    log.info('Please fix the above issues before deploying to production.');
    process.exit(1);
  }
}

// Run validation
validateProduction().catch(error => {
  log.error(`Validation script failed: ${error.message}`);
  process.exit(1);
});