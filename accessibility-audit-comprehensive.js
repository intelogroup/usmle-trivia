/**
 * Comprehensive Accessibility Audit for MedQuiz Pro
 * WCAG 2.1 AA Compliance Testing for Medical Education Application
 */

const { chromium } = require('playwright');
const fs = require('fs/promises');
const path = require('path');

class AccessibilityAuditor {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        wcagLevel: 'AA',
        overallScore: 0
      },
      pages: {},
      globalIssues: [],
      recommendations: [],
      medicalEducationSpecific: []
    };
    this.baseUrl = 'http://localhost:4173';
    this.testCredentials = {
      email: 'jayveedz19@gmail.com',
      password: 'Jimkali90#'
    };
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Simulate various accessibility tools
      extraHTTPHeaders: {
        'User-Agent': 'AccessibilityAudit-Bot'
      }
    });
    this.page = await this.context.newPage();
  }

  async testPage(url, pageName, requiresAuth = false) {
    console.log(`\n🧪 Testing ${pageName} - ${url}`);
    
    try {
      if (requiresAuth) {
        await this.performLogin();
      }

      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      const pageResults = {
        url,
        pageName,
        issues: [],
        wcagViolations: [],
        keyboardNavigation: { passed: false, issues: [] },
        screenReader: { passed: false, issues: [] },
        colorContrast: { passed: false, issues: [] },
        focusManagement: { passed: false, issues: [] },
        semanticStructure: { passed: false, issues: [] },
        forms: { passed: false, issues: [] },
        medicalContent: { passed: false, issues: [] }
      };

      // Screenshot
      await this.page.screenshot({ 
        path: `/root/repo/accessibility-screenshots/${pageName}-audit.png`,
        fullPage: true 
      });

      // Run accessibility tests
      await this.testSemanticStructure(pageResults);
      await this.testKeyboardNavigation(pageResults);
      await this.testScreenReaderCompatibility(pageResults);
      await this.testColorContrast(pageResults);
      await this.testFocusManagement(pageResults);
      await this.testFormAccessibility(pageResults);
      await this.testMedicalContentAccessibility(pageResults);
      await this.runAxeTests(pageResults);

      this.results.pages[pageName] = pageResults;
      
      console.log(`✅ Completed ${pageName} - Found ${pageResults.issues.length} issues`);
      return pageResults;
      
    } catch (error) {
      console.error(`❌ Error testing ${pageName}:`, error.message);
      return { error: error.message, pageName };
    }
  }

  async performLogin() {
    console.log('🔐 Performing authentication...');
    try {
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForSelector('#email');
      
      await this.page.fill('#email', this.testCredentials.email);
      await this.page.fill('#password', this.testCredentials.password);
      await this.page.click('button[type="submit"]');
      
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Authentication successful');
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error('Authentication required for protected pages failed');
    }
  }

  async testSemanticStructure(pageResults) {
    console.log('  Testing semantic structure...');
    const issues = [];

    try {
      // Check for proper heading hierarchy
      const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', els => 
        els.map(el => ({ tag: el.tagName, text: el.textContent.trim(), level: parseInt(el.tagName[1]) }))
      );

      let expectedLevel = 1;
      headings.forEach((heading, index) => {
        if (index === 0 && heading.level !== 1) {
          issues.push({
            type: 'WCAG_1.3.1',
            severity: 'high',
            element: heading.tag,
            message: 'Page should start with h1 element',
            wcagCriterion: '1.3.1 Info and Relationships'
          });
        }
        if (heading.level > expectedLevel + 1) {
          issues.push({
            type: 'WCAG_1.3.1',
            severity: 'medium',
            element: heading.tag,
            message: `Heading level skipped from h${expectedLevel} to h${heading.level}`,
            wcagCriterion: '1.3.1 Info and Relationships'
          });
        }
        expectedLevel = Math.max(expectedLevel, heading.level);
      });

      // Check for missing main landmark
      const mainElement = await this.page.$('main');
      if (!mainElement) {
        issues.push({
          type: 'WCAG_1.3.1',
          severity: 'high',
          element: 'body',
          message: 'Missing main landmark element',
          wcagCriterion: '1.3.1 Info and Relationships'
        });
      }

      // Check for proper nav elements
      const navElements = await this.page.$$('nav');
      if (navElements.length === 0) {
        issues.push({
          type: 'WCAG_1.3.1',
          severity: 'medium',
          element: 'navigation',
          message: 'No nav elements found for navigation sections',
          wcagCriterion: '1.3.1 Info and Relationships'
        });
      }

      pageResults.semanticStructure.passed = issues.length === 0;
      pageResults.semanticStructure.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.semanticStructure.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Semantic structure test failed: ${error.message}`
      });
    }
  }

  async testKeyboardNavigation(pageResults) {
    console.log('  Testing keyboard navigation...');
    const issues = [];

    try {
      // Test Tab navigation
      const focusableElements = await this.page.$$eval(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        els => els.map(el => ({
          tag: el.tagName,
          type: el.type || null,
          tabIndex: el.tabIndex,
          ariaLabel: el.getAttribute('aria-label'),
          id: el.id,
          className: el.className
        }))
      );

      // Start at the top of the page
      await this.page.keyboard.press('Home');
      
      let currentlyFocused = [];
      let tabCount = 0;
      const maxTabs = Math.min(focusableElements.length * 2, 50); // Prevent infinite loops

      while (tabCount < maxTabs) {
        await this.page.keyboard.press('Tab');
        tabCount++;
        
        try {
          const focusedElement = await this.page.evaluate(() => {
            const el = document.activeElement;
            return el ? {
              tag: el.tagName,
              id: el.id,
              className: el.className,
              ariaLabel: el.getAttribute('aria-label'),
              visible: el.offsetParent !== null
            } : null;
          });

          if (focusedElement && !focusedElement.visible) {
            issues.push({
              type: 'WCAG_2.4.3',
              severity: 'medium',
              element: `${focusedElement.tag}${focusedElement.id ? '#' + focusedElement.id : ''}`,
              message: 'Focusable element is not visible',
              wcagCriterion: '2.4.3 Focus Order'
            });
          }

          currentlyFocused.push(focusedElement);
        } catch (e) {
          // Continue if we can't get focus info for this element
        }
      }

      // Test for focus traps in modals/dialogs
      const modals = await this.page.$$('[role="dialog"], .modal, [aria-modal="true"]');
      if (modals.length > 0) {
        // This would need more complex testing for focus trapping
        console.log(`    Found ${modals.length} modal(s) - focus trap testing needed`);
      }

      // Test for skip links
      await this.page.keyboard.press('Home');
      await this.page.keyboard.press('Tab');
      const firstFocusedElement = await this.page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.textContent : '';
      });
      
      if (!firstFocusedElement.toLowerCase().includes('skip')) {
        issues.push({
          type: 'WCAG_2.4.1',
          severity: 'medium',
          element: 'navigation',
          message: 'Missing skip link as first focusable element',
          wcagCriterion: '2.4.1 Bypass Blocks'
        });
      }

      pageResults.keyboardNavigation.passed = issues.length === 0;
      pageResults.keyboardNavigation.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.keyboardNavigation.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Keyboard navigation test failed: ${error.message}`
      });
    }
  }

  async testScreenReaderCompatibility(pageResults) {
    console.log('  Testing screen reader compatibility...');
    const issues = [];

    try {
      // Check for alt text on images
      const images = await this.page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          ariaLabel: img.getAttribute('aria-label'),
          role: img.getAttribute('role')
        }))
      );

      images.forEach((img, index) => {
        if (!img.alt && !img.ariaLabel && img.role !== 'presentation') {
          issues.push({
            type: 'WCAG_1.1.1',
            severity: 'high',
            element: `img[src="${img.src}"]`,
            message: 'Image missing alternative text',
            wcagCriterion: '1.1.1 Non-text Content'
          });
        }
      });

      // Check for proper form labels
      const inputs = await this.page.$$eval('input, textarea, select', elements => 
        elements.map(el => ({
          id: el.id,
          type: el.type,
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledBy: el.getAttribute('aria-labelledby'),
          hasLabel: document.querySelector(`label[for="${el.id}"]`) !== null
        }))
      );

      inputs.forEach((input, index) => {
        if (!input.hasLabel && !input.ariaLabel && !input.ariaLabelledBy) {
          issues.push({
            type: 'WCAG_1.3.1',
            severity: 'high',
            element: `input${input.id ? '#' + input.id : `[type="${input.type}"]`}`,
            message: 'Form control missing accessible label',
            wcagCriterion: '1.3.1 Info and Relationships'
          });
        }
      });

      // Check for ARIA landmarks
      const landmarks = await this.page.$$eval('[role], main, nav, header, footer, aside', elements =>
        elements.map(el => el.getAttribute('role') || el.tagName.toLowerCase())
      );

      const expectedLandmarks = ['banner', 'navigation', 'main', 'contentinfo'];
      expectedLandmarks.forEach(landmark => {
        if (!landmarks.some(l => l.includes(landmark) || (landmark === 'banner' && l === 'header') || (landmark === 'contentinfo' && l === 'footer'))) {
          issues.push({
            type: 'WCAG_1.3.1',
            severity: 'medium',
            element: 'page structure',
            message: `Missing ${landmark} landmark`,
            wcagCriterion: '1.3.1 Info and Relationships'
          });
        }
      });

      // Check for ARIA attributes
      const ariaElements = await this.page.$$eval('[aria-describedby], [aria-expanded], [aria-hidden], [aria-live]', elements =>
        elements.map(el => ({
          tag: el.tagName,
          ariaDescribedBy: el.getAttribute('aria-describedby'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          ariaHidden: el.getAttribute('aria-hidden'),
          ariaLive: el.getAttribute('aria-live'),
          id: el.id
        }))
      );

      // Validate ARIA describedby references
      for (const el of ariaElements) {
        if (el.ariaDescribedBy) {
          const referencedElement = await this.page.$(`#${el.ariaDescribedBy}`);
          if (!referencedElement) {
            issues.push({
              type: 'WCAG_1.3.1',
              severity: 'high',
              element: `${el.tag}${el.id ? '#' + el.id : ''}`,
              message: `aria-describedby references non-existent element: ${el.ariaDescribedBy}`,
              wcagCriterion: '1.3.1 Info and Relationships'
            });
          }
        }
      }

      pageResults.screenReader.passed = issues.length === 0;
      pageResults.screenReader.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.screenReader.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Screen reader compatibility test failed: ${error.message}`
      });
    }
  }

  async testColorContrast(pageResults) {
    console.log('  Testing color contrast...');
    const issues = [];

    try {
      // Inject color contrast checking library
      await this.page.addScriptTag({
        content: `
          function getContrast(rgb1, rgb2) {
            const getLuminance = (rgb) => {
              const [r, g, b] = rgb.match(/\\d+/g).map(x => {
                x = parseInt(x) / 255;
                return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            
            const l1 = getLuminance(rgb1);
            const l2 = getLuminance(rgb2);
            return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          }
          
          window.checkColorContrast = () => {
            const issues = [];
            const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, input, textarea');
            
            for (const el of textElements) {
              if (el.textContent.trim() && el.offsetParent !== null) {
                const styles = getComputedStyle(el);
                const color = styles.color;
                const backgroundColor = styles.backgroundColor;
                
                if (color && backgroundColor && color !== backgroundColor) {
                  const contrast = getContrast(color, backgroundColor);
                  const fontSize = parseFloat(styles.fontSize);
                  const isLarge = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight >= 700);
                  const requiredRatio = isLarge ? 3 : 4.5;
                  
                  if (contrast < requiredRatio) {
                    issues.push({
                      element: el.tagName + (el.id ? '#' + el.id : ''),
                      contrast: contrast.toFixed(2),
                      required: requiredRatio,
                      color,
                      backgroundColor,
                      fontSize: fontSize + 'px'
                    });
                  }
                }
              }
            }
            return issues;
          };
        `
      });

      const colorIssues = await this.page.evaluate(() => window.checkColorContrast());

      colorIssues.forEach(issue => {
        issues.push({
          type: 'WCAG_1.4.3',
          severity: issue.contrast < 3 ? 'high' : 'medium',
          element: issue.element,
          message: `Insufficient color contrast: ${issue.contrast}:1 (required: ${issue.required}:1)`,
          wcagCriterion: '1.4.3 Contrast (Minimum)',
          details: {
            actualContrast: issue.contrast,
            requiredContrast: issue.required,
            foreground: issue.color,
            background: issue.backgroundColor,
            fontSize: issue.fontSize
          }
        });
      });

      pageResults.colorContrast.passed = issues.length === 0;
      pageResults.colorContrast.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.colorContrast.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Color contrast test failed: ${error.message}`
      });
    }
  }

  async testFocusManagement(pageResults) {
    console.log('  Testing focus management...');
    const issues = [];

    try {
      // Check for visible focus indicators
      await this.page.addStyleTag({
        content: `
          .focus-test:focus {
            outline: 2px solid red !important;
            outline-offset: 2px !important;
          }
        `
      });

      const focusableElements = await this.page.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      for (let i = 0; i < Math.min(focusableElements.length, 20); i++) {
        await focusableElements[i].focus();
        
        const focusStyles = await focusableElements[i].evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
            tag: el.tagName,
            id: el.id
          };
        });

        const hasFocusIndicator = (
          focusStyles.outlineWidth !== '0px' && focusStyles.outlineWidth !== 'none' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.outline !== 'none'
        );

        if (!hasFocusIndicator) {
          issues.push({
            type: 'WCAG_2.4.7',
            severity: 'high',
            element: `${focusStyles.tag}${focusStyles.id ? '#' + focusStyles.id : ''}`,
            message: 'Focusable element lacks visible focus indicator',
            wcagCriterion: '2.4.7 Focus Visible'
          });
        }
      }

      // Test for focus order
      const tabOrderTest = await this.page.evaluate(() => {
        const focusables = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        const issues = [];
        
        for (let i = 0; i < focusables.length - 1; i++) {
          const current = focusables[i];
          const next = focusables[i + 1];
          
          const currentRect = current.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          
          // Check if focus order follows reading order (top to bottom, left to right)
          if (currentRect.top > nextRect.top + 10 || 
              (Math.abs(currentRect.top - nextRect.top) < 10 && currentRect.left > nextRect.left + 10)) {
            issues.push({
              current: current.tagName + (current.id ? '#' + current.id : ''),
              next: next.tagName + (next.id ? '#' + next.id : '')
            });
          }
        }
        
        return issues;
      });

      tabOrderTest.forEach(orderIssue => {
        issues.push({
          type: 'WCAG_2.4.3',
          severity: 'medium',
          element: `${orderIssue.current} -> ${orderIssue.next}`,
          message: 'Focus order does not follow reading order',
          wcagCriterion: '2.4.3 Focus Order'
        });
      });

      pageResults.focusManagement.passed = issues.length === 0;
      pageResults.focusManagement.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.focusManagement.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Focus management test failed: ${error.message}`
      });
    }
  }

  async testFormAccessibility(pageResults) {
    console.log('  Testing form accessibility...');
    const issues = [];

    try {
      const forms = await this.page.$$eval('form', forms => 
        forms.map((form, index) => ({
          id: form.id || `form-${index}`,
          action: form.action,
          method: form.method,
          hasSubmit: form.querySelector('[type="submit"], button[type="submit"]') !== null
        }))
      );

      forms.forEach(form => {
        if (!form.hasSubmit) {
          issues.push({
            type: 'WCAG_3.2.2',
            severity: 'medium',
            element: `form${form.id ? '#' + form.id : ''}`,
            message: 'Form missing submit button',
            wcagCriterion: '3.2.2 On Input'
          });
        }
      });

      // Check for proper error handling
      const errorElements = await this.page.$$eval('[role="alert"], .error, [aria-live="assertive"]', elements =>
        elements.map(el => ({
          role: el.getAttribute('role'),
          ariaLive: el.getAttribute('aria-live'),
          content: el.textContent,
          className: el.className
        }))
      );

      // Check for required field indicators
      const requiredFields = await this.page.$$eval('input[required], textarea[required], select[required]', elements =>
        elements.map(el => ({
          id: el.id,
          type: el.type,
          hasAriaRequired: el.getAttribute('aria-required') === 'true',
          hasVisibleIndicator: el.parentElement.textContent.includes('*') || el.parentElement.textContent.includes('required')
        }))
      );

      requiredFields.forEach((field, index) => {
        if (!field.hasVisibleIndicator && !field.hasAriaRequired) {
          issues.push({
            type: 'WCAG_3.3.2',
            severity: 'medium',
            element: `${field.type}${field.id ? '#' + field.id : `[${index}]`}`,
            message: 'Required field not clearly indicated',
            wcagCriterion: '3.3.2 Labels or Instructions'
          });
        }
      });

      pageResults.forms.passed = issues.length === 0;
      pageResults.forms.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.forms.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Form accessibility test failed: ${error.message}`
      });
    }
  }

  async testMedicalContentAccessibility(pageResults) {
    console.log('  Testing medical content accessibility...');
    const issues = [];

    try {
      // Check for medical abbreviations and acronyms
      const medicalTerms = await this.page.evaluate(() => {
        const content = document.body.textContent;
        const commonMedicalAbbreviations = ['USMLE', 'ECG', 'EKG', 'CBC', 'CT', 'MRI', 'BP', 'HR', 'RR', 'O2', 'CO2', 'IV', 'IM', 'PO', 'PRN', 'BID', 'TID', 'QID'];
        const foundTerms = [];
        
        commonMedicalAbbreviations.forEach(term => {
          if (content.includes(term)) {
            const abbr = document.querySelector(`abbr[title*="${term}"], acronym[title*="${term}"]`);
            if (!abbr) {
              foundTerms.push(term);
            }
          }
        });
        
        return foundTerms;
      });

      medicalTerms.forEach(term => {
        issues.push({
          type: 'MEDICAL_ACCESSIBILITY',
          severity: 'low',
          element: `text content`,
          message: `Medical abbreviation "${term}" should be marked up with <abbr> tag and full explanation`,
          wcagCriterion: '3.1.4 Abbreviations',
          medicalEducationImpact: 'High - Critical for medical students with learning disabilities'
        });
      });

      // Check for complex medical diagrams or images
      const medicalImages = await this.page.$$eval('img', images => 
        images.filter(img => 
          img.alt && (
            img.alt.toLowerCase().includes('diagram') ||
            img.alt.toLowerCase().includes('anatomy') ||
            img.alt.toLowerCase().includes('chart') ||
            img.alt.toLowerCase().includes('graph')
          )
        ).map(img => ({
          src: img.src,
          alt: img.alt,
          hasLongDesc: img.getAttribute('longdesc') !== null,
          hasAriaDescribedBy: img.getAttribute('aria-describedby') !== null
        }))
      );

      medicalImages.forEach(img => {
        if (!img.hasLongDesc && !img.hasAriaDescribedBy) {
          issues.push({
            type: 'MEDICAL_ACCESSIBILITY',
            severity: 'high',
            element: `img[alt="${img.alt}"]`,
            message: 'Complex medical image needs detailed description for screen reader users',
            wcagCriterion: '1.1.1 Non-text Content',
            medicalEducationImpact: 'Critical - Essential for visually impaired medical students'
          });
        }
      });

      // Check for proper quiz question structure
      const quizElements = await this.page.evaluate(() => {
        const questions = document.querySelectorAll('[role="radiogroup"], fieldset');
        return Array.from(questions).map(q => ({
          hasLegend: q.querySelector('legend') !== null,
          hasAriaLabel: q.getAttribute('aria-label') !== null,
          hasAriaLabelledBy: q.getAttribute('aria-labelledby') !== null,
          radioButtons: Array.from(q.querySelectorAll('input[type="radio"], [role="radio"]')).length
        }));
      });

      quizElements.forEach((quiz, index) => {
        if (!quiz.hasLegend && !quiz.hasAriaLabel && !quiz.hasAriaLabelledBy) {
          issues.push({
            type: 'MEDICAL_ACCESSIBILITY',
            severity: 'high',
            element: `quiz question ${index + 1}`,
            message: 'Quiz question group needs accessible label for screen reader users',
            wcagCriterion: '1.3.1 Info and Relationships',
            medicalEducationImpact: 'High - Critical for quiz accessibility in medical education'
          });
        }
      });

      // Check for timer accessibility
      const timerElements = await this.page.$$('[role="timer"], .timer, .countdown');
      if (timerElements.length > 0) {
        const timerAccessibility = await this.page.evaluate(() => {
          const timers = document.querySelectorAll('[role="timer"], .timer, .countdown');
          return Array.from(timers).map(timer => ({
            hasAriaLive: timer.getAttribute('aria-live') !== null,
            hasAriaLabel: timer.getAttribute('aria-label') !== null,
            content: timer.textContent
          }));
        });

        timerAccessibility.forEach((timer, index) => {
          if (!timer.hasAriaLive || !timer.hasAriaLabel) {
            issues.push({
              type: 'MEDICAL_ACCESSIBILITY',
              severity: 'medium',
              element: `timer ${index + 1}`,
              message: 'Quiz timer should have aria-live and aria-label for screen reader updates',
              wcagCriterion: '4.1.3 Status Messages',
              medicalEducationImpact: 'Medium - Important for timed exam accessibility'
            });
          }
        });
      }

      pageResults.medicalContent.passed = issues.length === 0;
      pageResults.medicalContent.issues = issues;
      pageResults.issues.push(...issues);

    } catch (error) {
      pageResults.medicalContent.issues.push({
        type: 'TEST_ERROR',
        severity: 'high',
        message: `Medical content accessibility test failed: ${error.message}`
      });
    }
  }

  async runAxeTests(pageResults) {
    console.log('  Running axe-core accessibility tests...');
    
    try {
      // Inject axe-core
      await this.page.addScriptTag({ 
        url: 'https://unpkg.com/axe-core@latest/axe.min.js' 
      });

      const axeResults = await this.page.evaluate(() => {
        return new Promise((resolve, reject) => {
          axe.run({
            tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
            rules: {
              // Enable medical education specific rules
              'color-contrast': { enabled: true },
              'keyboard-navigation': { enabled: true },
              'focus-order-semantics': { enabled: true }
            }
          }, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
      });

      // Convert axe violations to our format
      axeResults.violations.forEach(violation => {
        violation.nodes.forEach(node => {
          pageResults.wcagViolations.push({
            type: `AXE_${violation.id.toUpperCase()}`,
            severity: violation.impact || 'medium',
            element: node.target.join(', '),
            message: violation.description,
            wcagCriterion: violation.tags.filter(tag => tag.startsWith('wcag')).join(', '),
            help: violation.help,
            helpUrl: violation.helpUrl
          });
        });
      });

      pageResults.issues.push(...pageResults.wcagViolations);

    } catch (error) {
      console.error('  ⚠️ Axe-core test failed:', error.message);
      pageResults.wcagViolations.push({
        type: 'AXE_ERROR',
        severity: 'high',
        message: `Axe-core test failed: ${error.message}`
      });
    }
  }

  async generateReport() {
    console.log('\n📊 Generating comprehensive accessibility report...');
    
    // Calculate overall statistics
    let totalIssues = 0;
    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    Object.values(this.results.pages).forEach(page => {
      if (page.issues) {
        totalIssues += page.issues.length;
        page.issues.forEach(issue => {
          switch(issue.severity) {
            case 'critical': criticalIssues++; break;
            case 'high': highIssues++; break;
            case 'medium': mediumIssues++; break;
            case 'low': lowIssues++; break;
          }
        });
      }
    });

    this.results.summary.totalTests = Object.keys(this.results.pages).length;
    this.results.summary.failed = totalIssues;
    this.results.summary.passed = this.results.summary.totalTests - this.results.summary.failed;
    this.results.summary.overallScore = totalIssues > 0 ? Math.max(0, 100 - (totalIssues * 5)) : 100;

    // Generate medical education specific recommendations
    this.results.medicalEducationSpecific = [
      {
        category: 'Quiz Interface',
        recommendation: 'Implement proper ARIA radiogroup structure for multiple choice questions',
        priority: 'High',
        impact: 'Critical for screen reader users taking medical exams'
      },
      {
        category: 'Medical Content',
        recommendation: 'Add <abbr> tags for medical abbreviations with full explanations',
        priority: 'Medium',
        impact: 'Helps students with learning disabilities understand terminology'
      },
      {
        category: 'Timer Accessibility',
        recommendation: 'Ensure exam timers are announced to assistive technology',
        priority: 'High',
        impact: 'Critical for timed medical examinations'
      },
      {
        category: 'Complex Images',
        recommendation: 'Provide detailed alternative text for medical diagrams and charts',
        priority: 'Critical',
        impact: 'Essential for visually impaired medical students'
      }
    ];

    // Generate actionable recommendations
    this.results.recommendations = [
      {
        title: 'Implement Skip Navigation',
        description: 'Add skip links to help keyboard users bypass repetitive navigation',
        wcagCriterion: '2.4.1 Bypass Blocks',
        implementation: 'Add hidden skip link as first focusable element',
        priority: 'High'
      },
      {
        title: 'Improve Color Contrast',
        description: 'Ensure all text meets WCAG AA contrast requirements',
        wcagCriterion: '1.4.3 Contrast (Minimum)',
        implementation: 'Review color palette and adjust contrast ratios',
        priority: 'Critical'
      },
      {
        title: 'Enhance Focus Indicators',
        description: 'Provide visible focus indicators for all interactive elements',
        wcagCriterion: '2.4.7 Focus Visible',
        implementation: 'Add CSS outline or box-shadow for focus states',
        priority: 'High'
      },
      {
        title: 'Screen Reader Optimization',
        description: 'Add proper ARIA labels and descriptions',
        wcagCriterion: '1.3.1 Info and Relationships',
        implementation: 'Implement comprehensive ARIA labeling strategy',
        priority: 'High'
      }
    ];

    const report = {
      title: 'MedQuiz Pro - Comprehensive Accessibility Audit Report',
      date: new Date().toISOString(),
      wcagLevel: 'AA',
      summary: this.results.summary,
      keyFindings: {
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        complianceScore: this.results.summary.overallScore
      },
      pageResults: this.results.pages,
      medicalEducationSpecific: this.results.medicalEducationSpecific,
      recommendations: this.results.recommendations,
      nextSteps: [
        'Fix all critical and high severity issues',
        'Implement medical education specific enhancements',
        'Conduct user testing with assistive technology',
        'Regular accessibility audits during development'
      ]
    };

    // Save detailed report
    await fs.writeFile(
      '/root/repo/accessibility-audit-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n🎯 ACCESSIBILITY AUDIT SUMMARY');
    console.log('================================');
    console.log(`Overall Score: ${report.keyFindings.complianceScore}/100`);
    console.log(`Total Issues: ${totalIssues}`);
    console.log(`  Critical: ${criticalIssues}`);
    console.log(`  High: ${highIssues}`);
    console.log(`  Medium: ${mediumIssues}`);
    console.log(`  Low: ${lowIssues}`);
    console.log(`Pages Tested: ${this.results.summary.totalTests}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runAccessibilityAudit() {
  const auditor = new AccessibilityAuditor();
  
  try {
    // Create screenshots directory
    await fs.mkdir('/root/repo/accessibility-screenshots', { recursive: true });
    
    await auditor.init();
    console.log('🚀 Starting Comprehensive Accessibility Audit for MedQuiz Pro');
    console.log('Target: Medical Education Platform - WCAG 2.1 AA Compliance\n');

    // Test all major pages
    const pagesToTest = [
      { url: `${auditor.baseUrl}/`, name: 'Landing Page', auth: false },
      { url: `${auditor.baseUrl}/login`, name: 'Login Page', auth: false },
      { url: `${auditor.baseUrl}/register`, name: 'Register Page', auth: false },
      { url: `${auditor.baseUrl}/dashboard`, name: 'Dashboard', auth: true },
      { url: `${auditor.baseUrl}/quiz`, name: 'Quiz Page', auth: true },
      { url: `${auditor.baseUrl}/quiz/quick`, name: 'Quick Quiz', auth: true },
      { url: `${auditor.baseUrl}/progress`, name: 'Progress Page', auth: true },
      { url: `${auditor.baseUrl}/leaderboard`, name: 'Leaderboard', auth: true },
      { url: `${auditor.baseUrl}/profile`, name: 'Profile Page', auth: true }
    ];

    for (const page of pagesToTest) {
      await auditor.testPage(page.url, page.name, page.auth);
    }

    const report = await auditor.generateReport();
    
    console.log('\n✅ Accessibility audit completed successfully!');
    console.log('📄 Detailed report saved to: accessibility-audit-report.json');
    console.log('📸 Screenshots saved to: accessibility-screenshots/');

    return report;

  } catch (error) {
    console.error('❌ Accessibility audit failed:', error);
    throw error;
  } finally {
    await auditor.cleanup();
  }
}

// Run the audit
if (require.main === module) {
  runAccessibilityAudit()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runAccessibilityAudit, AccessibilityAuditor };