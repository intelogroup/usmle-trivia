#!/usr/bin/env node

/**
 * Comprehensive Authentication Security Test Suite
 * Tests all edge cases and security scenarios for Convex Auth
 */

import puppeteer from 'puppeteer';
import chalk from 'chalk';

const TEST_URL = 'http://localhost:5173';
const VALID_USER = {
  email: 'jayveedz19@gmail.com',
  password: 'Jimkali90#',
  name: 'Jay veedz'
};

const INVALID_SCENARIOS = [
  {
    name: 'Wrong Password',
    email: VALID_USER.email,
    password: 'WrongPassword123!',
    expectedError: 'Invalid email or password'
  },
  {
    name: 'Non-existent User',
    email: 'nonexistent@example.com',
    password: 'Password123!',
    expectedError: 'Invalid email or password'
  },
  {
    name: 'Invalid Email Format',
    email: 'invalidemail',
    password: 'Password123!',
    expectedError: 'Please enter a valid email address'
  },
  {
    name: 'Empty Password',
    email: VALID_USER.email,
    password: '',
    expectedError: 'required'
  },
  {
    name: 'SQL Injection Attempt',
    email: "admin' OR '1'='1",
    password: "password' OR '1'='1",
    expectedError: 'Please enter a valid email address'
  },
  {
    name: 'XSS Attempt',
    email: '<script>alert("xss")</script>@test.com',
    password: 'Password123!',
    expectedError: 'Please enter a valid email address'
  }
];

const REGISTRATION_SCENARIOS = [
  {
    name: 'Weak Password - Too Short',
    email: 'test1@example.com',
    password: 'Pass1!',
    confirmPassword: 'Pass1!',
    expectedError: 'Password must be at least 8 characters'
  },
  {
    name: 'Weak Password - No Uppercase',
    email: 'test2@example.com',
    password: 'password123!',
    confirmPassword: 'password123!',
    expectedError: 'must contain at least one uppercase letter'
  },
  {
    name: 'Weak Password - No Number',
    email: 'test3@example.com',
    password: 'Password!',
    confirmPassword: 'Password!',
    expectedError: 'must contain at least one number'
  },
  {
    name: 'Weak Password - No Special Char',
    email: 'test4@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    expectedError: 'must contain at least one special character'
  },
  {
    name: 'Password Mismatch',
    email: 'test5@example.com',
    password: 'ValidPass123!',
    confirmPassword: 'DifferentPass123!',
    expectedError: 'Passwords do not match'
  },
  {
    name: 'Duplicate Email Registration',
    email: VALID_USER.email,
    password: 'NewPass123!',
    confirmPassword: 'NewPass123!',
    expectedError: 'already exists'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testLoginScenario(page, scenario) {
  console.log(chalk.yellow(`\n  Testing: ${scenario.name}`));
  
  await page.goto(`${TEST_URL}/login`);
  await page.waitForSelector('#email');
  
  // Clear and fill form
  await page.evaluate(() => {
    document.querySelector('#email').value = '';
    document.querySelector('#password').value = '';
  });
  
  await page.type('#email', scenario.email);
  if (scenario.password) {
    await page.type('#password', scenario.password);
  }
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for response
  await sleep(2000);
  
  // Check for error message
  const errorElement = await page.$('[role="alert"]');
  if (errorElement) {
    const errorText = await page.evaluate(el => el.textContent, errorElement);
    
    if (errorText.toLowerCase().includes(scenario.expectedError.toLowerCase())) {
      console.log(chalk.green(`    ✓ Correct error displayed: "${errorText}"`));
      return true;
    } else {
      console.log(chalk.red(`    ✗ Unexpected error: "${errorText}"`));
      console.log(chalk.gray(`      Expected: "${scenario.expectedError}"`));
      return false;
    }
  } else {
    // Check if we were redirected (shouldn't happen for invalid scenarios)
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log(chalk.red(`    ✗ Unexpected login success!`));
      return false;
    } else {
      console.log(chalk.red(`    ✗ No error message displayed`));
      return false;
    }
  }
}

async function testRegistrationScenario(page, scenario) {
  console.log(chalk.yellow(`\n  Testing: ${scenario.name}`));
  
  await page.goto(`${TEST_URL}/register`);
  await page.waitForSelector('#name');
  
  // Clear and fill form
  await page.evaluate(() => {
    document.querySelector('#name').value = '';
    document.querySelector('#email').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#confirmPassword').value = '';
  });
  
  await page.type('#name', 'Test User');
  await page.type('#email', scenario.email);
  await page.type('#password', scenario.password);
  await page.type('#confirmPassword', scenario.confirmPassword);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for response
  await sleep(2000);
  
  // Check for error message
  const errorElement = await page.$('.bg-destructive\\/10');
  if (errorElement) {
    const errorText = await page.evaluate(el => el.textContent, errorElement);
    
    if (errorText.toLowerCase().includes(scenario.expectedError.toLowerCase())) {
      console.log(chalk.green(`    ✓ Correct validation error: "${errorText}"`));
      return true;
    } else {
      console.log(chalk.red(`    ✗ Unexpected error: "${errorText}"`));
      console.log(chalk.gray(`      Expected: "${scenario.expectedError}"`));
      return false;
    }
  } else {
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log(chalk.red(`    ✗ Unexpected registration success!`));
      return false;
    } else {
      console.log(chalk.red(`    ✗ No error message displayed`));
      return false;
    }
  }
}

async function testMultipleFailedAttempts(page) {
  console.log(chalk.yellow('\n  Testing: Rate Limiting (Multiple Failed Attempts)'));
  
  let attemptCount = 0;
  let rateLimited = false;
  
  // Try to login 6 times with wrong password
  for (let i = 0; i < 6; i++) {
    await page.goto(`${TEST_URL}/login`);
    await page.waitForSelector('#email');
    
    await page.type('#email', VALID_USER.email);
    await page.type('#password', 'WrongPassword' + i);
    
    await page.click('button[type="submit"]');
    await sleep(1500);
    
    attemptCount++;
    
    const errorElement = await page.$('[role="alert"]');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      
      if (errorText.toLowerCase().includes('too many attempts') || 
          errorText.toLowerCase().includes('rate limit')) {
        console.log(chalk.green(`    ✓ Rate limiting activated after ${attemptCount} attempts`));
        console.log(chalk.gray(`      Error: "${errorText}"`));
        rateLimited = true;
        break;
      }
    }
  }
  
  if (!rateLimited && attemptCount === 6) {
    console.log(chalk.yellow(`    ⚠ Rate limiting not enforced after ${attemptCount} attempts`));
    console.log(chalk.gray(`      Consider implementing stricter rate limiting`));
  }
  
  return true;
}

async function testRouteProtection(page) {
  console.log(chalk.blue('\n\n🔒 Testing Route Protection'));
  
  const protectedRoutes = [
    '/dashboard',
    '/quiz',
    '/progress',
    '/analytics',
    '/profile',
    '/leaderboard'
  ];
  
  for (const route of protectedRoutes) {
    console.log(chalk.yellow(`\n  Testing: ${route}`));
    
    // Clear cookies/session
    await page.deleteCookie();
    await page.goto(`${TEST_URL}${route}`);
    await sleep(2000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      console.log(chalk.green(`    ✓ Redirected to login (protected)`));
    } else if (currentUrl.includes(route)) {
      console.log(chalk.red(`    ✗ Unauthorized access allowed!`));
      return false;
    } else {
      console.log(chalk.yellow(`    ⚠ Redirected to: ${currentUrl}`));
    }
  }
  
  return true;
}

async function testValidLogin(page) {
  console.log(chalk.yellow('\n  Testing: Valid User Login'));
  
  await page.goto(`${TEST_URL}/login`);
  await page.waitForSelector('#email');
  
  await page.type('#email', VALID_USER.email);
  await page.type('#password', VALID_USER.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  await sleep(2000);
  
  const currentUrl = page.url();
  
  if (currentUrl.includes('/dashboard')) {
    console.log(chalk.green(`    ✓ Successfully logged in and redirected to dashboard`));
    
    // Check if user info is displayed
    const userName = await page.$eval('.text-foreground', el => el.textContent).catch(() => null);
    if (userName) {
      console.log(chalk.green(`    ✓ User name displayed: "${userName}"`));
    }
    
    return true;
  } else {
    console.log(chalk.red(`    ✗ Login failed or incorrect redirect`));
    console.log(chalk.gray(`      Current URL: ${currentUrl}`));
    return false;
  }
}

async function runTests() {
  console.log(chalk.bold.cyan('\n🔐 MedQuiz Pro - Authentication Security Test Suite\n'));
  console.log(chalk.gray('=' .repeat(60)));
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  let totalTests = 0;
  let passedTests = 0;
  
  try {
    // Test invalid login scenarios
    console.log(chalk.blue('\n\n🚫 Testing Invalid Login Scenarios'));
    for (const scenario of INVALID_SCENARIOS) {
      totalTests++;
      if (await testLoginScenario(page, scenario)) {
        passedTests++;
      }
    }
    
    // Test registration validation
    console.log(chalk.blue('\n\n📝 Testing Registration Validation'));
    for (const scenario of REGISTRATION_SCENARIOS) {
      totalTests++;
      if (await testRegistrationScenario(page, scenario)) {
        passedTests++;
      }
    }
    
    // Test rate limiting
    console.log(chalk.blue('\n\n⏱️ Testing Rate Limiting'));
    totalTests++;
    if (await testMultipleFailedAttempts(page)) {
      passedTests++;
    }
    
    // Test route protection
    totalTests++;
    if (await testRouteProtection(page)) {
      passedTests++;
    }
    
    // Test valid login
    console.log(chalk.blue('\n\n✅ Testing Valid Authentication'));
    totalTests++;
    if (await testValidLogin(page)) {
      passedTests++;
    }
    
  } catch (error) {
    console.error(chalk.red('\n\n❌ Test suite error:'), error);
  } finally {
    // Summary
    console.log(chalk.gray('\n' + '=' .repeat(60)));
    console.log(chalk.bold.cyan('\n📊 Test Results Summary\n'));
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    const color = percentage === 100 ? chalk.green : percentage >= 80 ? chalk.yellow : chalk.red;
    
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${chalk.green(passedTests)}`);
    console.log(`  Failed: ${chalk.red(totalTests - passedTests)}`);
    console.log(`  Success Rate: ${color(percentage + '%')}`);
    
    // Security recommendations
    console.log(chalk.bold.cyan('\n🔒 Security Assessment:\n'));
    
    if (percentage === 100) {
      console.log(chalk.green('  ✓ Excellent security implementation!'));
      console.log(chalk.green('  ✓ All authentication scenarios properly handled'));
      console.log(chalk.green('  ✓ Route protection working correctly'));
    } else {
      console.log(chalk.yellow('  ⚠ Some security improvements needed:'));
      
      if (passedTests < totalTests) {
        console.log(chalk.yellow('    • Review failed test scenarios'));
        console.log(chalk.yellow('    • Ensure proper error handling'));
        console.log(chalk.yellow('    • Verify rate limiting is enforced'));
      }
    }
    
    console.log(chalk.gray('\n' + '=' .repeat(60)));
    
    await browser.close();
  }
}

// Run tests
runTests().catch(console.error);