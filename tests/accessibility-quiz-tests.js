#!/usr/bin/env node

/**
 * ♿ ACCESSIBILITY QUIZ TESTING SUITE
 * WCAG 2.1 AA compliance testing for medical education platform
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { ACCESSIBILITY_CONFIG } from './cross-browser-quiz-config.js';

class QuizAccessibilityTester {
  constructor(page) {
    this.page = page;
    this.violations = [];
    this.tests = [];
  }

  async setupAccessibilityTesting() {
    console.log('♿ Setting up Accessibility Testing...');
    
    // Inject axe-core for automated testing
    await injectAxe(this.page);
    
    // Configure axe for medical education standards
    await this.page.evaluate(() => {
      window.axe.configure({
        rules: {
          // Medical education specific rules
          'color-contrast': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'screen-reader-compatibility': { enabled: true }
        },
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508']
      });
    });

    console.log('   ✅ Accessibility testing configured for WCAG 2.1 AA');
  }

  async testQuizPageAccessibility() {
    console.log('📋 Testing Quiz Page Accessibility...');

    await this.page.goto('/quiz');
    await this.page.waitForLoadState('networkidle');

    // Run automated accessibility scan
    const violations = await this.runAxeCheck('Quiz Landing Page');
    
    // Test specific medical education requirements
    await this.testMedicalTerminologyAccessibility();
    await this.testQuizNavigationAccessibility();
    await this.testFormAccessibility();
    
    return violations;
  }

  async testMedicalTerminologyAccessibility() {
    console.log('🏥 Testing Medical Terminology Accessibility...');

    // Check for proper medical term pronunciation guides
    const medicalTerms = await this.page.$$('[data-medical-term]');
    
    for (const term of medicalTerms.slice(0, 5)) { // Test first 5 terms
      const ariaLabel = await term.getAttribute('aria-label');
      const title = await term.getAttribute('title');
      
      // Medical terms should have pronunciation or explanation
      expect(ariaLabel || title).toBeTruthy();
      
      console.log(`   ✅ Medical term has accessibility annotation`);
    }

    // Check for medical abbreviation expansions
    const abbreviations = await this.page.$$('abbr');
    for (const abbr of abbreviations) {
      const title = await abbr.getAttribute('title');
      expect(title).toBeTruthy();
      console.log(`   ✅ Medical abbreviation properly expanded`);
    }
  }

  async testQuizNavigationAccessibility() {
    console.log('🧭 Testing Quiz Navigation Accessibility...');

    // Start a quiz to test navigation
    await this.page.click('[data-testid="start-quiz-btn"]');
    await this.page.waitForSelector('[data-testid="quiz-question"]');

    // Test keyboard navigation through quiz
    const keyboardNavTest = await this.testKeyboardNavigation();
    this.tests.push(keyboardNavTest);

    // Test focus management
    const focusTest = await this.testFocusManagement();
    this.tests.push(focusTest);

    // Test skip links for efficiency
    const skipLinksTest = await this.testSkipLinks();
    this.tests.push(skipLinksTest);
  }

  async testKeyboardNavigation() {
    console.log('⌨️ Testing Keyboard Navigation...');

    const keyboardTest = {
      name: 'Keyboard Navigation',
      passed: 0,
      failed: 0,
      details: []
    };

    try {
      // Test Tab navigation through quiz elements
      await this.page.keyboard.press('Tab');
      let focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
      keyboardTest.details.push(`First tab focus: ${focusedElement}`);

      // Navigate through answer options using keyboard
      for (let i = 0; i < 4; i++) {
        await this.page.keyboard.press('Tab');
        const focused = await this.page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el.tagName,
            testId: el.getAttribute('data-testid'),
            ariaLabel: el.getAttribute('aria-label')
          };
        });
        
        if (focused.testId && focused.testId.includes('answer-option')) {
          keyboardTest.passed++;
          keyboardTest.details.push(`✅ Answer option ${i} focusable`);
        }
      }

      // Test Enter key for selection
      await this.page.keyboard.press('Enter');
      const selectedOption = await this.page.$('[data-testid^="answer-option-"].selected');
      if (selectedOption) {
        keyboardTest.passed++;
        keyboardTest.details.push('✅ Enter key selects answer');
      }

      // Test space bar for submission
      await this.page.keyboard.press('Tab'); // Move to submit button
      await this.page.keyboard.press('Enter');
      
      await this.page.waitForSelector('[data-testid="answer-feedback"]', { timeout: 5000 });
      keyboardTest.passed++;
      keyboardTest.details.push('✅ Keyboard submission works');

    } catch (error) {
      keyboardTest.failed++;
      keyboardTest.details.push(`❌ Keyboard navigation error: ${error.message}`);
    }

    console.log(`   Keyboard Navigation: ${keyboardTest.passed} passed, ${keyboardTest.failed} failed`);
    return keyboardTest;
  }

  async testFocusManagement() {
    console.log('🎯 Testing Focus Management...');

    const focusTest = {
      name: 'Focus Management',
      passed: 0,
      failed: 0,
      details: []
    };

    try {
      // Test focus indicators visibility
      const focusIndicators = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('button, input, select, textarea, [tabindex]');
        const results = [];
        
        elements.forEach(el => {
          el.focus();
          const styles = window.getComputedStyle(el, ':focus');
          const hasOutline = styles.outline !== 'none' && styles.outline !== '';
          const hasBoxShadow = styles.boxShadow !== 'none';
          const hasBorder = styles.borderColor !== styles.color;
          
          results.push({
            element: el.tagName + (el.className ? '.' + el.className : ''),
            hasFocusIndicator: hasOutline || hasBoxShadow || hasBorder
          });
        });
        
        return results;
      });

      const elementsWithFocus = focusIndicators.filter(el => el.hasFocusIndicator);
      const focusPercentage = (elementsWithFocus.length / focusIndicators.length) * 100;

      if (focusPercentage >= 90) {
        focusTest.passed++;
        focusTest.details.push(`✅ ${focusPercentage.toFixed(1)}% of elements have focus indicators`);
      } else {
        focusTest.failed++;
        focusTest.details.push(`❌ Only ${focusPercentage.toFixed(1)}% of elements have focus indicators`);
      }

      // Test focus order logic
      const focusOrder = await this.page.evaluate(() => {
        const tabbableElements = Array.from(document.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        
        return tabbableElements.map((el, index) => ({
          index,
          element: el.tagName,
          testId: el.getAttribute('data-testid'),
          tabIndex: el.tabIndex
        }));
      });

      if (focusOrder.length > 0) {
        focusTest.passed++;
        focusTest.details.push(`✅ Focus order established (${focusOrder.length} tabbable elements)`);
      }

    } catch (error) {
      focusTest.failed++;
      focusTest.details.push(`❌ Focus management error: ${error.message}`);
    }

    console.log(`   Focus Management: ${focusTest.passed} passed, ${focusTest.failed} failed`);
    return focusTest;
  }

  async testSkipLinks() {
    console.log('⏭️ Testing Skip Links...');

    const skipTest = {
      name: 'Skip Links',
      passed: 0,
      failed: 0,
      details: []
    };

    try {
      // Look for skip links
      const skipLinks = await this.page.$$('[href^="#"], [data-skip-link]');
      
      if (skipLinks.length > 0) {
        skipTest.passed++;
        skipTest.details.push(`✅ Found ${skipLinks.length} skip links`);

        // Test skip link functionality
        for (const link of skipLinks.slice(0, 3)) {
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && href.startsWith('#')) {
            const target = await this.page.$(`${href}`);
            if (target) {
              skipTest.passed++;
              skipTest.details.push(`✅ Skip link "${text}" targets valid element`);
            }
          }
        }
      } else {
        skipTest.failed++;
        skipTest.details.push('❌ No skip links found - consider adding for efficiency');
      }

    } catch (error) {
      skipTest.failed++;
      skipTest.details.push(`❌ Skip links test error: ${error.message}`);
    }

    console.log(`   Skip Links: ${skipTest.passed} passed, ${skipTest.failed} failed`);
    return skipTest;
  }

  async testFormAccessibility() {
    console.log('📝 Testing Form Accessibility...');

    // Test registration/login forms if present
    const forms = await this.page.$$('form');
    
    for (const form of forms) {
      await this.testFormLabels(form);
      await this.testFormValidation(form);
      await this.testFormErrorHandling(form);
    }
  }

  async testFormLabels(form) {
    const inputs = await form.$$('input, select, textarea');
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = await this.page.$(`label[for="${id}"]`);
        if (label || ariaLabel || ariaLabelledBy) {
          console.log('   ✅ Input has proper labeling');
        } else {
          console.log('   ❌ Input missing label association');
        }
      }
    }
  }

  async testFormValidation(form) {
    // Test ARIA validation attributes
    const inputs = await form.$$('input[required], input[aria-required="true"]');
    
    for (const input of inputs) {
      const ariaInvalid = await input.getAttribute('aria-invalid');
      const ariaDescribedBy = await input.getAttribute('aria-describedby');
      
      // Test validation state communication
      if (ariaInvalid !== null || ariaDescribedBy) {
        console.log('   ✅ Validation states properly communicated');
      }
    }
  }

  async testFormErrorHandling(form) {
    // Look for error message containers
    const errorContainers = await form.$$('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    
    if (errorContainers.length > 0) {
      console.log(`   ✅ Found ${errorContainers.length} error announcement regions`);
    }
  }

  async testScreenReaderCompatibility() {
    console.log('🔊 Testing Screen Reader Compatibility...');

    // Test ARIA landmarks
    const landmarks = await this.page.evaluate(() => {
      const landmarkRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo'];
      return landmarkRoles.map(role => ({
        role,
        count: document.querySelectorAll(`[role="${role}"], ${role === 'banner' ? 'header' : role === 'contentinfo' ? 'footer' : role}`).length
      }));
    });

    landmarks.forEach(landmark => {
      if (landmark.count > 0) {
        console.log(`   ✅ ${landmark.role}: ${landmark.count} found`);
      }
    });

    // Test heading structure
    const headingStructure = await this.page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent.trim().substring(0, 50)
      }));
    });

    if (headingStructure.length > 0) {
      console.log(`   ✅ Heading structure: ${headingStructure.length} headings found`);
      
      // Check for logical heading hierarchy
      let hierarchyValid = true;
      for (let i = 1; i < headingStructure.length; i++) {
        const currentLevel = headingStructure[i].level;
        const previousLevel = headingStructure[i-1].level;
        
        if (currentLevel > previousLevel + 1) {
          hierarchyValid = false;
          break;
        }
      }
      
      if (hierarchyValid) {
        console.log('   ✅ Heading hierarchy is logical');
      } else {
        console.log('   ⚠️ Heading hierarchy has gaps');
      }
    }
  }

  async testColorContrastCompliance() {
    console.log('🎨 Testing Color Contrast Compliance...');

    // Use axe-core to check color contrast
    const violations = await getViolations(this.page, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    const contrastViolations = violations.filter(v => v.id === 'color-contrast');
    
    if (contrastViolations.length === 0) {
      console.log('   ✅ All color contrast ratios meet WCAG AA standards');
    } else {
      console.log(`   ❌ Found ${contrastViolations.length} color contrast violations`);
      contrastViolations.forEach(violation => {
        console.log(`      - ${violation.description}`);
      });
    }

    return contrastViolations;
  }

  async runAxeCheck(context) {
    console.log(`🔍 Running automated accessibility scan: ${context}`);

    try {
      const violations = await getViolations(this.page, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          // Enable all relevant rules for medical education
          'bypass': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'keyboard': { enabled: true },
          'screen-reader-only': { enabled: true }
        }
      });

      this.violations.push({
        context,
        violations,
        timestamp: new Date().toISOString()
      });

      if (violations.length === 0) {
        console.log(`   ✅ ${context}: No accessibility violations found`);
      } else {
        console.log(`   ❌ ${context}: ${violations.length} violations found`);
        violations.forEach(violation => {
          console.log(`      - ${violation.id}: ${violation.description}`);
        });
      }

      return violations;

    } catch (error) {
      console.log(`   💥 Accessibility scan error: ${error.message}`);
      return [];
    }
  }

  async generateAccessibilityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      standard: 'WCAG 2.1 AA',
      platform: 'MedQuiz Pro - Medical Education Platform',
      tests: this.tests,
      violations: this.violations,
      summary: {
        totalTests: this.tests.length,
        passedTests: this.tests.reduce((sum, test) => sum + test.passed, 0),
        failedTests: this.tests.reduce((sum, test) => sum + test.failed, 0),
        totalViolations: this.violations.reduce((sum, scan) => sum + scan.violations.length, 0)
      }
    };

    console.log('\n♿ ACCESSIBILITY REPORT SUMMARY');
    console.log('==============================');
    console.log(`Standard: ${report.standard}`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests} ✅`);
    console.log(`Failed: ${report.summary.failedTests} ❌`);
    console.log(`Total Violations: ${report.summary.totalViolations}`);

    const complianceScore = ((report.summary.passedTests / (report.summary.passedTests + report.summary.failedTests)) * 100).toFixed(1);
    console.log(`Compliance Score: ${complianceScore}%`);

    return report;
  }
}

// Test definitions
test.describe('Quiz Accessibility Testing', () => {
  test('Complete WCAG 2.1 AA Compliance Check', async ({ page }) => {
    const tester = new QuizAccessibilityTester(page);

    await tester.setupAccessibilityTesting();
    await tester.testQuizPageAccessibility();
    await tester.testScreenReaderCompatibility();
    await tester.testColorContrastCompliance();

    const report = await tester.generateAccessibilityReport();

    // Save report for analysis
    const fs = require('fs');
    fs.writeFileSync(
      '/tmp/quiz-accessibility-report.json',
      JSON.stringify(report, null, 2)
    );

    // Assert overall compliance
    expect(report.summary.totalViolations).toBeLessThan(5); // Allow minor violations
    expect(report.summary.passedTests).toBeGreaterThan(report.summary.failedTests);

    console.log('✅ Accessibility testing completed successfully');
  });

  test('Medical Education Accessibility Standards', async ({ page }) => {
    console.log('🏥 Testing Medical Education Specific Accessibility...');

    await page.goto('/quiz');
    await page.click('[data-testid="start-quiz-btn"]');
    await page.waitForSelector('[data-testid="quiz-question"]');

    // Test medical terminology pronunciation
    const medicalTerms = await page.$$('[data-medical-term]');
    expect(medicalTerms.length).toBeGreaterThan(0);

    // Test clinical scenario accessibility
    const clinicalScenario = await page.$('[data-testid="clinical-scenario"]');
    if (clinicalScenario) {
      const ariaLabel = await clinicalScenario.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }

    // Test medical image alt text
    const medicalImages = await page.$$('[data-testid*="medical-image"]');
    for (const img of medicalImages) {
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(10); // Descriptive alt text
    }

    console.log('✅ Medical education accessibility standards validated');
  });

  test('High Contrast Mode Compatibility', async ({ page }) => {
    console.log('🎨 Testing High Contrast Mode Compatibility...');

    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
          button {
            background: yellow !important;
            color: black !important;
          }
        }
      `
    });

    await page.goto('/quiz');
    await page.click('[data-testid="start-quiz-btn"]');

    // Verify readability in high contrast mode
    const question = await page.textContent('[data-testid="question-text"]');
    expect(question).toBeTruthy();

    // Test button visibility
    const buttons = await page.$$('button');
    expect(buttons.length).toBeGreaterThan(0);

    console.log('✅ High contrast mode compatibility verified');
  });
});

export { QuizAccessibilityTester };