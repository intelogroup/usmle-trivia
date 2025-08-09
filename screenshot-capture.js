import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🏥 Starting MedQuiz Pro screenshot capture...\n');

    // Desktop screenshots (1280x720)
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 1. Landing page
    console.log('📸 Capturing desktop landing page...');
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/1-landing-desktop.png', fullPage: true });
    
    // Wait a moment for any animations
    await page.waitForTimeout(2000);
    
    // 2. Try to navigate to login
    try {
      const loginButton = await page.locator('text=Login').first();
      if (await loginButton.count() > 0) {
        console.log('📸 Capturing desktop login page...');
        await loginButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: '/tmp/2-login-desktop.png', fullPage: true });
      }
    } catch (e) {
      console.log('⚠️  Could not access login page:', e.message);
      
      // Try direct navigation to login
      try {
        await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
        await page.screenshot({ path: '/tmp/2-login-desktop.png', fullPage: true });
        console.log('📸 Captured login page via direct navigation');
      } catch (e2) {
        console.log('⚠️  Could not access login page directly:', e2.message);
      }
    }
    
    // 3. Try to access dashboard
    try {
      console.log('📸 Attempting to capture dashboard...');
      await page.goto('https://usmle-trivia.netlify.app/dashboard', { waitUntil: 'networkidle' });
      await page.screenshot({ path: '/tmp/3-dashboard-desktop.png', fullPage: true });
      console.log('✅ Captured dashboard page');
    } catch (e) {
      console.log('⚠️  Could not access dashboard:', e.message);
    }

    // Mobile screenshots (375x667 - iPhone SE)
    console.log('\n📱 Switching to mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 4. Mobile landing page
    console.log('📸 Capturing mobile landing page...');
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/4-landing-mobile.png', fullPage: true });
    
    // 5. Mobile login attempt
    try {
      const loginButton = await page.locator('text=Login').first();
      if (await loginButton.count() > 0) {
        console.log('📸 Capturing mobile login page...');
        await loginButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: '/tmp/5-login-mobile.png', fullPage: true });
      }
    } catch (e) {
      console.log('⚠️  Could not access mobile login:', e.message);
    }

    // Tablet screenshots (768x1024 - iPad)
    console.log('\n📱 Switching to tablet viewport...');
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 6. Tablet landing page
    console.log('📸 Capturing tablet landing page...');
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/6-landing-tablet.png', fullPage: true });

    console.log('\n✅ Screenshot capture completed successfully!');
    console.log('🖼️  Screenshots saved to /tmp/ directory');
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);