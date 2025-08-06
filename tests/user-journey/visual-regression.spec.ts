import { test, expect } from '@playwright/test';

/**
 * VCT Framework - Visual Regression Testing
 * Comprehensive visual testing with screenshot comparison
 * Implements VCT visual awareness principles
 */

// VCT Visual Testing Configuration
const VCT_VISUAL_CONFIG = {
  environments: {
    baseline: 'baseline',
    current: 'current',
    diff: 'diff'
  },
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    large: { width: 1920, height: 1080 }
  },
  screenshots: {
    path: 'screenshots/visual-regression',
    threshold: 0.02, // 2% threshold for visual differences
    animations: 'disabled'
  },
  components: [
    'landing-page',
    'authentication',
    'dashboard',
    'quiz-interface',
    'results',
    'navigation',
    'profile',
    'error-states'
  ]
};

test.describe('VCT Visual Regression Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // VCT: Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  // Desktop Visual Regression Tests
  test('VCT Visual: Desktop Components Baseline', async ({ page }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.desktop);

    await test.step('Landing Page Visual Baseline', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for all images and fonts to load
      await page.waitForFunction(() => {
        const images = Array.from(document.images);
        return images.every(img => img.complete);
      });
      
      await expect(page).toHaveScreenshot('desktop-landing-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Desktop landing page baseline captured');
    });

    await test.step('Authentication Pages Visual Baseline', async () => {
      // Login page
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('desktop-login-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      // Register page
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('desktop-register-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Desktop authentication pages baseline captured');
    });

    await test.step('Dashboard Visual Baseline', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for all dynamic content to load
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('desktop-dashboard.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Desktop dashboard baseline captured');
    });

    await test.step('Quiz Interface Visual Baseline', async () => {
      await page.click('[data-testid="quick-quiz-button"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('desktop-quiz-selection.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      // Start quiz
      await page.click('[data-testid="start-quiz-button"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for timer to stabilize
      
      await expect(page).toHaveScreenshot('desktop-quiz-active.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Desktop quiz interface baseline captured');
    });
  });

  // Mobile Visual Regression Tests
  test('VCT Visual: Mobile Components Baseline', async ({ page }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.mobile);

    await test.step('Mobile Landing Page Visual', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('mobile-landing-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Mobile landing page baseline captured');
    });

    await test.step('Mobile Authentication Visual', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('mobile-login-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Mobile authentication baseline captured');
    });

    await test.step('Mobile Dashboard Visual', async () => {
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('mobile-dashboard.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Mobile dashboard baseline captured');
    });

    await test.step('Mobile Quiz Interface Visual', async () => {
      await page.click('[data-testid="quick-quiz-button"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('mobile-quiz-selection.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      await page.click('[data-testid="start-quiz-button"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('mobile-quiz-active.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Mobile quiz interface baseline captured');
    });
  });

  // Tablet Visual Regression Tests
  test('VCT Visual: Tablet Components Baseline', async ({ page }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.tablet);

    await test.step('Tablet Layout Visual Validation', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('tablet-landing-page.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      // Test tablet-specific navigation
      await page.goto('/login');
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('tablet-dashboard.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Tablet layout baseline captured');
    });
  });

  // Component State Visual Tests
  test('VCT Visual: Component States and Interactions', async ({ page }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.desktop);

    await test.step('Button States Visual Validation', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test button hover states
      await page.hover('[data-testid="cta-button"]');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('button-hover-state.png', {
        fullPage: false,
        clip: { x: 0, y: 0, width: 800, height: 400 }
      });
      
      console.log('[VCT] ✅ Button states visual validation complete');
    });

    await test.step('Form States Visual Validation', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Test form focus states
      await page.focus('input[type="email"]');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('form-focus-state.png', {
        fullPage: false,
        clip: { x: 0, y: 0, width: 600, height: 500 }
      });
      
      // Test form error states
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('form-error-state.png', {
        fullPage: false,
        clip: { x: 0, y: 0, width: 600, height: 500 }
      });
      
      console.log('[VCT] ✅ Form states visual validation complete');
    });

    await test.step('Navigation States Visual Validation', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Test sidebar open state
      await page.click('[data-testid="sidebar-toggle"]');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('sidebar-open-state.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      // Test user menu open state
      await page.click('[data-testid="user-menu-button"]');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('user-menu-open-state.png', {
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 400 }
      });
      
      console.log('[VCT] ✅ Navigation states visual validation complete');
    });
  });

  // Error States Visual Tests
  test('VCT Visual: Error States and Edge Cases', async ({ page }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.desktop);

    await test.step('Network Error Visual States', async () => {
      // Simulate network failure
      await page.route('**/convex/**', route => route.abort());
      
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('network-error-state.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Network error visual states captured');
    });

    await test.step('Loading States Visual Validation', async () => {
      // Simulate slow network
      await page.route('**/convex/**', route => {
        setTimeout(() => route.continue(), 1000);
      });
      
      await page.goto('/dashboard');
      await page.waitForTimeout(500); // Capture during loading
      
      await expect(page).toHaveScreenshot('loading-state.png', {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log('[VCT] ✅ Loading states visual validation complete');
    });
  });

  // Cross-Browser Visual Consistency (if multiple browsers configured)
  test('VCT Visual: Cross-Browser Consistency', async ({ page, browserName }) => {
    await page.setViewportSize(VCT_VISUAL_CONFIG.viewports.desktop);

    await test.step(`${browserName} Visual Consistency Check`, async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`${browserName}-landing-consistency.png`, {
        fullPage: true,
        threshold: VCT_VISUAL_CONFIG.screenshots.threshold
      });
      
      console.log(`[VCT] ✅ ${browserName} visual consistency validated`);
    });
  });
});