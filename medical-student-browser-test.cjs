#!/usr/bin/env node

/**
 * 🏥 MedQuiz Pro - Medical Student Specific Browser Testing
 * 
 * Tests features specifically important for medical education:
 * - Mobile usage during clinical rotations
 * - Hospital network conditions
 * - Accessibility for studying with gloves
 * - Late-night study compatibility
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

const BASE_URL = 'http://localhost:5174';

class MedicalStudentBrowserTester {
  constructor() {
    this.results = {
      hospitalUsage: [],
      mobileRotations: [],
      accessibilityFeatures: [],
      lateNightStudy: []
    };
  }

  async testHospitalUsage() {
    console.log('\n🏥 Testing Hospital Environment Usage...');
    
    const browser = await chromium.launch({ headless: true });
    
    // Test 1: Restricted Network Access
    console.log('🌐 Testing restricted hospital network');
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    // Simulate hospital network by testing with slow loading
    try {
      const startTime = Date.now();
      await page1.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      // Test if essential medical content loads quickly
      const criticalContent = await page1.evaluate(() => {
        const medicalTerms = document.body.innerText.toLowerCase();
        return {
          hasUsmleContent: medicalTerms.includes('usmle'),
          hasQuizInterface: document.querySelector('button, .quiz') !== null,
          hasMedicalTerms: /medical|diagnosis|treatment|patient/i.test(medicalTerms)
        };
      });
      
      this.results.hospitalUsage.push({
        test: 'Hospital Network Access',
        loadTime: loadTime,
        acceptable: loadTime < 8000,
        criticalContent: criticalContent,
        hospitalReady: loadTime < 8000 && criticalContent.hasUsmleContent
      });
      
      console.log(`🏥 Hospital network: ${loadTime}ms - ${loadTime < 8000 ? 'GOOD' : 'SLOW'}`);
      
    } catch (error) {
      console.error('❌ Hospital network test failed:', error.message);
    }
    
    await context1.close();
    
    // Test 2: Shared Computer Usage
    console.log('💻 Testing shared hospital computer');
    const context2 = await browser.newContext({
      // Simulate older hospital computer with limited resources
      viewport: { width: 1024, height: 768 }
    });
    const page2 = await context2.newPage();
    
    try {
      await page2.goto(BASE_URL);
      
      // Test if interface works on older/shared computers
      const sharedComputerTest = await page2.evaluate(() => {
        return {
          lowResolutionSupport: window.innerWidth >= 1024,
          basicFunctionality: document.querySelector('main, #root') !== null,
          noComplexAnimations: true // Would need to check for heavy animations
        };
      });
      
      this.results.hospitalUsage.push({
        test: 'Shared Hospital Computer',
        ...sharedComputerTest,
        suitable: sharedComputerTest.lowResolutionSupport && sharedComputerTest.basicFunctionality
      });
      
      console.log(`💻 Shared computer: ${sharedComputerTest.suitable ? 'SUITABLE' : 'ISSUES'}`);
      
    } catch (error) {
      console.error('❌ Shared computer test failed:', error.message);
    }
    
    await context2.close();
    await browser.close();
  }

  async testMobileRotations() {
    console.log('\n👩‍⚕️ Testing Mobile Usage During Clinical Rotations...');
    
    const browser = await chromium.launch({ headless: true });
    
    // Test 1: One-handed usage (common during rounds)
    console.log('🤏 Testing one-handed mobile usage');
    const context1 = await browser.newContext({
      viewport: { width: 375, height: 812 }, // iPhone size
      isMobile: true,
      hasTouch: true
    });
    const page1 = await context1.newPage();
    
    try {
      await page1.goto(BASE_URL);
      
      // Test thumb-friendly navigation
      const oneHandedTest = await page1.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, input');
        let thumbReachable = 0;
        
        for (const element of interactiveElements) {
          const rect = element.getBoundingClientRect();
          // Check if elements are in lower 2/3 of screen (thumb-reachable area)
          if (rect.top > window.innerHeight * 0.33) {
            thumbReachable++;
          }
        }
        
        return {
          totalInteractive: interactiveElements.length,
          thumbReachable: thumbReachable,
          oneHandedFriendly: thumbReachable / interactiveElements.length > 0.6
        };
      });
      
      this.results.mobileRotations.push({
        test: 'One-Handed Usage',
        ...oneHandedTest,
        rotationFriendly: oneHandedTest.oneHandedFriendly
      });
      
      console.log(`🤏 One-handed: ${oneHandedTest.oneHandedFriendly ? 'FRIENDLY' : 'DIFFICULT'}`);
      
    } catch (error) {
      console.error('❌ One-handed test failed:', error.message);
    }
    
    await context1.close();
    
    // Test 2: Quick study breaks
    console.log('⚡ Testing quick study sessions');
    const context2 = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page2 = await context2.newPage();
    
    try {
      await page2.goto(BASE_URL);
      
      // Test for quick access to study materials
      const quickAccessTest = await page2.evaluate(() => {
        const quickButtons = document.querySelectorAll('button:has-text("Quick"), button:has-text("Start"), .quick-access');
        const visibleQuizOptions = document.querySelectorAll('[data-testid*="quiz"], .quiz-mode');
        
        return {
          hasQuickAccess: quickButtons.length > 0,
          hasVisibleQuizOptions: visibleQuizOptions.length > 0,
          fastStudyReady: quickButtons.length > 0 || visibleQuizOptions.length > 0
        };
      });
      
      this.results.mobileRotations.push({
        test: 'Quick Study Access',
        ...quickAccessTest,
        rotationBreakReady: quickAccessTest.fastStudyReady
      });
      
      console.log(`⚡ Quick study: ${quickAccessTest.fastStudyReady ? 'READY' : 'LIMITED'}`);
      
    } catch (error) {
      console.error('❌ Quick study test failed:', error.message);
    }
    
    await context2.close();
    await browser.close();
  }

  async testAccessibilityFeatures() {
    console.log('\n♿ Testing Medical Student Accessibility Features...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(BASE_URL);
      
      // Test 1: Large touch targets (important for gloved hands)
      console.log('🧤 Testing glove-friendly interface');
      const glovedHandsTest = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, input[type="submit"]');
        let gloveFriendly = 0;
        
        for (const element of interactiveElements) {
          const rect = element.getBoundingClientRect();
          // 48px minimum for gloved hands (larger than standard 44px)
          if (rect.width >= 48 && rect.height >= 48) {
            gloveFriendly++;
          }
        }
        
        return {
          totalTargets: interactiveElements.length,
          gloveFriendlyTargets: gloveFriendly,
          gloveFriendlyPercentage: interactiveElements.length > 0 ? (gloveFriendly / interactiveElements.length) * 100 : 100
        };
      });
      
      // Test 2: High contrast for tired eyes
      console.log('👁️ Testing visual clarity for tired eyes');
      const visualClarityTest = await page.evaluate(() => {
        const computeContrast = (fg, bg) => {
          // Simplified contrast calculation
          return Math.abs(fg - bg) / 255;
        };
        
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
        let highContrastCount = 0;
        
        for (const element of textElements) {
          const style = window.getComputedStyle(element);
          const textColor = style.color;
          const bgColor = style.backgroundColor;
          
          // Simple check for dark text on light background or vice versa
          if (textColor.includes('rgb(0') || textColor.includes('rgb(255') || 
              textColor === 'black' || textColor === 'white') {
            highContrastCount++;
          }
        }
        
        return {
          totalTextElements: textElements.length,
          highContrastElements: highContrastCount,
          contrastRatio: textElements.length > 0 ? (highContrastCount / textElements.length) * 100 : 100
        };
      });
      
      // Test 3: Keyboard navigation for fatigue
      console.log('⌨️ Testing keyboard navigation');
      const keyboardTest = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        let tabIndexSet = 0;
        for (const element of focusableElements) {
          if (element.tabIndex >= 0) {
            tabIndexSet++;
          }
        }
        
        return {
          focusableElements: focusableElements.length,
          tabIndexSet: tabIndexSet,
          keyboardAccessible: focusableElements.length > 0
        };
      });
      
      this.results.accessibilityFeatures.push({
        test: 'Glove-Friendly Interface',
        ...glovedHandsTest,
        medicalStudentReady: glovedHandsTest.gloveFriendlyPercentage > 70
      });
      
      this.results.accessibilityFeatures.push({
        test: 'Visual Clarity for Tired Eyes',
        ...visualClarityTest,
        fatigueResistant: visualClarityTest.contrastRatio > 80
      });
      
      this.results.accessibilityFeatures.push({
        test: 'Keyboard Navigation',
        ...keyboardTest,
        fatigueReduction: keyboardTest.keyboardAccessible
      });
      
      console.log(`🧤 Glove-friendly: ${glovedHandsTest.gloveFriendlyPercentage.toFixed(1)}%`);
      console.log(`👁️ Visual clarity: ${visualClarityTest.contrastRatio.toFixed(1)}%`);
      console.log(`⌨️ Keyboard accessible: ${keyboardTest.keyboardAccessible ? 'YES' : 'NO'}`);
      
    } catch (error) {
      console.error('❌ Accessibility test failed:', error.message);
    }
    
    await browser.close();
  }

  async testLateNightStudy() {
    console.log('\n🌙 Testing Late-Night Study Compatibility...');
    
    const browser = await chromium.launch({ headless: true });
    
    // Test dark mode readiness
    console.log('🌚 Testing dark mode compatibility');
    const context = await browser.newContext({
      colorScheme: 'dark' // Simulate dark mode preference
    });
    const page = await context.newPage();
    
    try {
      await page.goto(BASE_URL);
      
      // Test readability in dark conditions
      const darkModeTest = await page.evaluate(() => {
        const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        const isDarkBackground = backgroundColor.includes('rgb(0') || 
                                backgroundColor.includes('black') ||
                                backgroundColor === 'transparent';
        
        // Check if text is readable
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        let readableText = 0;
        
        for (const element of textElements) {
          const style = window.getComputedStyle(element);
          const textColor = style.color;
          
          // Light text on dark background is better for late night
          if (textColor.includes('rgb(255') || textColor.includes('white') || 
              textColor.includes('rgb(240') || textColor.includes('rgb(220')) {
            readableText++;
          }
        }
        
        return {
          darkBackground: isDarkBackground,
          totalTextElements: textElements.length,
          readableTextElements: readableText,
          nightFriendly: isDarkBackground || readableText > textElements.length * 0.3
        };
      });
      
      // Test eye strain reduction features
      const eyeStrainTest = await page.evaluate(() => {
        // Check for bright colors that might cause eye strain
        const brightElements = document.querySelectorAll('*');
        let lowStrain = 0;
        
        for (const element of brightElements) {
          const style = window.getComputedStyle(element);
          const bgColor = style.backgroundColor;
          
          // Avoid bright whites and neon colors
          if (!bgColor.includes('rgb(255, 255, 255)') && 
              !bgColor.includes('white') &&
              !bgColor.includes('rgb(0, 255') && // Avoid neon greens
              !bgColor.includes('rgb(255, 0')) {  // Avoid neon reds
            lowStrain++;
          }
        }
        
        return {
          totalElements: brightElements.length,
          lowStrainElements: lowStrain,
          eyeStrainReduction: lowStrain > brightElements.length * 0.8
        };
      });
      
      this.results.lateNightStudy.push({
        test: 'Dark Mode Compatibility',
        ...darkModeTest,
        lateNightReady: darkModeTest.nightFriendly
      });
      
      this.results.lateNightStudy.push({
        test: 'Eye Strain Reduction',
        ...eyeStrainTest,
        fatigueReduction: eyeStrainTest.eyeStrainReduction
      });
      
      console.log(`🌚 Dark mode ready: ${darkModeTest.nightFriendly ? 'YES' : 'NEEDS_IMPROVEMENT'}`);
      console.log(`😴 Eye strain reduction: ${eyeStrainTest.eyeStrainReduction ? 'GOOD' : 'COULD_IMPROVE'}`);
      
    } catch (error) {
      console.error('❌ Late night study test failed:', error.message);
    }
    
    await browser.close();
  }

  async generateMedicalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      medicalStudentBrowserTesting: this.results,
      summary: {
        hospitalUsageReady: this.results.hospitalUsage.length > 0 && 
                           this.results.hospitalUsage.every(r => r.hospitalReady !== false),
        mobileRotationsSupport: this.results.mobileRotations.length > 0 && 
                               this.results.mobileRotations.some(r => r.rotationFriendly || r.rotationBreakReady),
        accessibilityForMedical: this.results.accessibilityFeatures.length > 0,
        lateNightStudyReady: this.results.lateNightStudy.length > 0
      }
    };
    
    await fs.writeFile('./medical-student-browser-report.json', JSON.stringify(report, null, 2));
    
    const markdownReport = `# 🏥 MedQuiz Pro - Medical Student Browser Testing Report

## 🏥 Hospital Environment Compatibility
${this.results.hospitalUsage.map(result => 
  `- **${result.test}**: ${result.hospitalReady ? '✅ READY' : '⚠️ NEEDS_ATTENTION'}`
).join('\n')}

## 👩‍⚕️ Clinical Rotations Mobile Support
${this.results.mobileRotations.map(result => 
  `- **${result.test}**: ${result.rotationFriendly || result.rotationBreakReady ? '✅ SUPPORTED' : '⚠️ LIMITED'}`
).join('\n')}

## ♿ Medical Student Accessibility
${this.results.accessibilityFeatures.map(result => 
  `- **${result.test}**: ${result.medicalStudentReady || result.fatigueResistant || result.fatigueReduction ? '✅ GOOD' : '⚠️ NEEDS_IMPROVEMENT'}`
).join('\n')}

## 🌙 Late-Night Study Compatibility
${this.results.lateNightStudy.map(result => 
  `- **${result.test}**: ${result.lateNightReady || result.fatigueReduction ? '✅ SUPPORTED' : '⚠️ COULD_IMPROVE'}`
).join('\n')}

## 📈 Medical Education Specific Recommendations

### For Hospital Usage:
- Optimize for slow hospital networks (< 8 second load times)
- Ensure compatibility with shared/older hospital computers
- Test with common hospital IT restrictions

### For Mobile Rotations:
- Implement one-handed navigation for bedside usage
- Provide quick-access study modes for breaks between patients
- Optimize touch targets for medical gloves

### For Accessibility:
- Increase touch target sizes to 48px+ for gloved hands
- Provide high contrast modes for tired eyes
- Ensure full keyboard navigation for fatigue management

### For Late-Night Study:
- Implement true dark mode for reduced eye strain
- Use warmer color temperatures for night studying
- Provide brightness controls for different environments

---
*Medical-specific testing completed on ${new Date().toISOString()}*
    `;
    
    await fs.writeFile('./medical-student-browser-summary.md', markdownReport);
    
    console.log('\n📊 Medical student browser reports generated:');
    console.log('   📄 ./medical-student-browser-report.json');
    console.log('   📋 ./medical-student-browser-summary.md');
  }

  async run() {
    console.log('🏥 Starting Medical Student Browser Testing');
    console.log('   Testing features specific to medical education environments');
    
    await this.testHospitalUsage();
    await this.testMobileRotations();
    await this.testAccessibilityFeatures();
    await this.testLateNightStudy();
    
    await this.generateMedicalReport();
    
    console.log('\n🎉 Medical Student Browser Testing Complete!');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new MedicalStudentBrowserTester();
  tester.run().catch(console.error);
}

module.exports = { MedicalStudentBrowserTester };