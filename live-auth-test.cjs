#!/usr/bin/env node

/**
 * Live Authentication Testing for MedQuiz Pro
 * Tests real user credentials and authentication flow
 */

const puppeteer = require('puppeteer');

async function testLiveAuthentication() {
  console.log('🏥 MedQuiz Pro - Live Authentication Testing');
  console.log('==============================================');

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Test credentials
    const credentials = {
      email: 'jayveedz19@gmail.com',
      password: 'Jimkali90#'
    };
    
    console.log('\n🔐 Testing Authentication Flow with Real Credentials:');
    console.log(`📧 Email: ${credentials.email}`);
    
    // Navigate to login page
    console.log('\n1️⃣ Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');
    
    console.log('✅ Login page loaded successfully');
    
    // Fill in credentials
    console.log('\n2️⃣ Entering credentials...');
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    
    console.log('✅ Credentials entered');
    
    // Submit form
    console.log('\n3️⃣ Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard or error
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('✅ Navigation completed');
      
      // Check if we're on dashboard
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/dashboard')) {
        console.log('🎉 AUTHENTICATION SUCCESS! Redirected to dashboard');
        
        // Check for user name in UI
        const userName = await page.$eval('h1', el => el.textContent).catch(() => null);
        if (userName) {
          console.log(`👨‍⚕️ Welcome message: ${userName}`);
        }
        
        // Test logout
        console.log('\n4️⃣ Testing logout...');
        const logoutButton = await page.$('button[title="Logout"]').catch(() => null);
        if (logoutButton) {
          await logoutButton.click();
          await page.waitForNavigation({ timeout: 5000 });
          console.log('✅ Logout successful');
        } else {
          console.log('⚠️  Logout button not found in expected location');
        }
        
        return { success: true, message: 'Live authentication test completed successfully' };
        
      } else {
        console.log('❌ Authentication failed - not redirected to dashboard');
        
        // Check for error messages
        const errorMessage = await page.$eval('.text-red-700', el => el.textContent).catch(() => 'No error message found');
        console.log(`❌ Error: ${errorMessage}`);
        
        return { success: false, message: `Authentication failed: ${errorMessage}` };
      }
      
    } catch (error) {
      console.log('❌ Timeout waiting for navigation');
      
      // Check for error messages
      const errorMessage = await page.$eval('.text-red-700', el => el.textContent).catch(() => 'Unknown error');
      console.log(`❌ Error: ${errorMessage}`);
      
      return { success: false, message: `Navigation timeout: ${errorMessage}` };
    }
    
  } catch (error) {
    console.error('💥 Live authentication test failed:', error.message);
    return { success: false, message: error.message };
    
  } finally {
    console.log('\n📊 Test Summary:');
    console.log('================');
    await browser.close();
  }
}

// Run the test
testLiveAuthentication().then(result => {
  if (result.success) {
    console.log('🎉 Live Authentication Test: PASSED');
    console.log('🏥 MedQuiz Pro authentication is working correctly!');
    process.exit(0);
  } else {
    console.log('❌ Live Authentication Test: FAILED');
    console.log(`💡 Issue: ${result.message}`);
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});