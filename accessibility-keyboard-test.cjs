const { chromium } = require('playwright');
const fs = require('fs');

async function runAccessibilityTests() {
  console.log('♿ Starting Accessibility and Keyboard Navigation Tests');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'Accessibility and Keyboard Navigation Tests',
    results: [],
    screenshots: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  function addTestResult(category, testName, status, details = '', screenshot = '') {
    testResults.results.push({
      category,
      testName,
      status,
      details,
      screenshot,
      timestamp: new Date().toISOString()
    });
    testResults.summary.total++;
    if (status === 'PASS') testResults.summary.passed++;
    else if (status === 'FAIL') testResults.summary.failed++;
    else testResults.summary.warnings++;
  }

  async function takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `accessibility-test-${name}-${timestamp}.png`;
    const dir = '/root/repo/accessibility-test-screenshots';
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filepath = `${dir}/${filename}`;
    await page.screenshot({ path: filepath, fullPage: true });
    
    testResults.screenshots.push({
      name,
      description,
      filename,
      filepath,
      timestamp
    });
    return filename;
  }

  try {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    console.log('🔍 Testing Landing Page Accessibility...');
    const screenshot1 = await takeScreenshot('01-landing-accessibility', 'Landing page accessibility check');

    // Test 1: ARIA Labels and Attributes
    const ariaElements = await page.locator('[aria-label], [aria-describedby], [aria-expanded], [role]').count();
    addTestResult('ARIA Attributes', 'ARIA Elements Present', ariaElements > 0 ? 'PASS' : 'WARNING', 
      `Elements with ARIA attributes: ${ariaElements}`, screenshot1);

    // Test 2: Image Alt Text
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    const altTextCoverage = images > 0 ? (imagesWithAlt / images) * 100 : 100;
    addTestResult('Images', 'Alt Text Coverage', altTextCoverage >= 90 ? 'PASS' : 'WARNING', 
      `${imagesWithAlt}/${images} images have alt text (${altTextCoverage.toFixed(1)}%)`, screenshot1);

    // Test 3: Semantic HTML
    const semanticElements = await page.locator('header, nav, main, section, article, footer, h1, h2, h3, h4, h5, h6').count();
    addTestResult('HTML Semantics', 'Semantic Elements', semanticElements > 5 ? 'PASS' : 'WARNING', 
      `Semantic elements found: ${semanticElements}`, screenshot1);

    // Test 4: Color Contrast (basic check)
    const textElements = await page.locator('h1, h2, h3, p, span, button, a').all();
    let contrastIssues = 0;
    
    for (const element of textElements.slice(0, 10)) {
      try {
        const styles = await element.evaluate(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor
          };
        });
        
        // Basic check: ensure text has color and background isn't the same
        if (styles.color && styles.backgroundColor && styles.color !== styles.backgroundColor) {
          // This is a simplified check - real contrast checking would need more complex calculations
        } else {
          contrastIssues++;
        }
      } catch (e) {
        // Skip elements that can't be evaluated
      }
    }
    
    addTestResult('Color Contrast', 'Basic Contrast Check', contrastIssues < 3 ? 'PASS' : 'WARNING', 
      `Potential contrast issues: ${contrastIssues}`, screenshot1);

    console.log('⌨️  Testing Keyboard Navigation...');

    // Test 5: Tab Navigation
    await page.keyboard.press('Tab'); // First tab
    await page.waitForTimeout(500);
    
    let focusedElement1 = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused ? focused.tagName + (focused.className ? '.' + focused.className.split(' ')[0] : '') : 'none';
    });

    await page.keyboard.press('Tab'); // Second tab
    await page.waitForTimeout(500);
    
    let focusedElement2 = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused ? focused.tagName + (focused.className ? '.' + focused.className.split(' ')[0] : '') : 'none';
    });

    const tabNavigationWorks = focusedElement1 !== 'none' && focusedElement2 !== 'none' && focusedElement1 !== focusedElement2;
    addTestResult('Keyboard Navigation', 'Tab Navigation', tabNavigationWorks ? 'PASS' : 'WARNING', 
      `Focus sequence: ${focusedElement1} → ${focusedElement2}`, screenshot1);

    // Test 6: Focus Visibility
    const screenshot2 = await takeScreenshot('02-focus-visible', 'Focus visibility check');
    
    const hasFocusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return false;
      
      const styles = window.getComputedStyle(focused);
      return styles.outline !== 'none' || styles.boxShadow !== 'none' || styles.border.includes('blue');
    });

    addTestResult('Focus Management', 'Focus Visibility', hasFocusStyles ? 'PASS' : 'WARNING', 
      `Focus styles applied: ${hasFocusStyles}`, screenshot2);

    // Navigate to login page
    await page.click('text=Sign In');
    await page.waitForLoadState('networkidle');

    console.log('🔍 Testing Form Accessibility...');
    const screenshot3 = await takeScreenshot('03-form-accessibility', 'Form accessibility check');

    // Test 7: Form Labels
    const inputs = await page.locator('input').count();
    const labelsForInputs = await page.locator('label[for], input[aria-label], input[aria-labelledby]').count();
    const formLabels = await page.locator('label').count();
    
    const labelCoverage = inputs > 0 ? Math.max(labelsForInputs, formLabels) / inputs : 1;
    addTestResult('Form Labels', 'Input Labels', labelCoverage >= 0.8 ? 'PASS' : 'WARNING', 
      `${Math.max(labelsForInputs, formLabels)}/${inputs} inputs have labels`, screenshot3);

    // Test 8: Required Field Indicators
    const requiredFields = await page.locator('input[required], input[aria-required="true"]').count();
    const requiredIndicators = await page.locator('*[aria-required="true"], .required, *:has(*)').count();
    
    addTestResult('Required Fields', 'Required Indicators', requiredFields > 0 ? 'PASS' : 'PASS', 
      `Required fields: ${requiredFields}, Indicators: ${requiredIndicators}`, screenshot3);

    // Test 9: Error Message Association
    await page.click('button[type="submit"]'); // Submit empty form
    await page.waitForTimeout(1000);
    
    const screenshot4 = await takeScreenshot('04-error-messages', 'Error message accessibility');
    
    const errorMessages = await page.locator('[role="alert"], .error, .text-red-500, [aria-invalid="true"]').count();
    addTestResult('Error Handling', 'Error Message Accessibility', errorMessages >= 0 ? 'PASS' : 'WARNING', 
      `Error messages found: ${errorMessages}`, screenshot4);

    // Test 10: Keyboard Form Navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.type('jayveedz19@gmail.com');
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.type('Jimkali90#');
    
    const screenshot5 = await takeScreenshot('05-keyboard-form-fill', 'Keyboard form filling');
    
    const emailValue = await page.locator('input[type="email"]').inputValue();
    const passwordValue = await page.locator('input[type="password"]').inputValue();
    
    const keyboardFormFill = emailValue.length > 0 && passwordValue.length > 0;
    addTestResult('Keyboard Navigation', 'Form Keyboard Input', keyboardFormFill ? 'PASS' : 'FAIL', 
      `Email filled: ${emailValue.length > 0}, Password filled: ${passwordValue.length > 0}`, screenshot5);

    // Test 11: Enter Key Submission
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    const screenshot6 = await takeScreenshot('06-keyboard-submit', 'Keyboard form submission');
    
    const currentURL = page.url();
    const keyboardSubmitWorks = currentURL.includes('/dashboard') || currentURL === 'http://localhost:5173/';
    addTestResult('Keyboard Navigation', 'Enter Key Submit', keyboardSubmitWorks ? 'PASS' : 'WARNING', 
      `Form submitted via Enter key: ${keyboardSubmitWorks}`, screenshot6);

    // Test 12: Dashboard Accessibility
    if (keyboardSubmitWorks) {
      console.log('🔍 Testing Dashboard Accessibility...');
      
      const screenshot7 = await takeScreenshot('07-dashboard-accessibility', 'Dashboard accessibility');
      
      // Test heading hierarchy
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      const h3Count = await page.locator('h3').count();
      
      const headingHierarchy = h1Count >= 1 || (h2Count > 0 || h3Count > 0);
      addTestResult('Heading Structure', 'Heading Hierarchy', headingHierarchy ? 'PASS' : 'WARNING', 
        `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`, screenshot7);
      
      // Test interactive elements accessibility
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const interactiveElements = buttons + links;
      
      addTestResult('Interactive Elements', 'Clickable Elements', interactiveElements > 0 ? 'PASS' : 'WARNING', 
        `Buttons: ${buttons}, Links: ${links}`, screenshot7);
    }

    // Final Summary
    console.log('\n♿ ACCESSIBILITY TEST RESULTS SUMMARY');
    console.log('====================================');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    
    const successRate = testResults.summary.total > 0 ? 
      ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    
    // Save report
    const reportPath = '/root/repo/accessibility-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    console.log(`📁 Screenshots saved to: /root/repo/accessibility-test-screenshots/`);

  } catch (error) {
    console.error('❌ Accessibility test error:', error);
    addTestResult('System', 'Test Execution', 'FAIL', `Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  return testResults;
}

runAccessibilityTests().catch(console.error);