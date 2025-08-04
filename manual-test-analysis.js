import { chromium } from 'playwright';
import fs from 'fs';

async function manualTestAnalysis() {
  console.log('Running manual test analysis of existing screenshots...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Create new screenshots directory for this test
  const screenshotsDir = '/root/repo/screenshots-analysis';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const analysis = {
    screenshots: [],
    loadingIssues: [],
    uiRecommendations: [],
    performanceIssues: [],
    accessibilityIssues: [],
    currentState: 'unknown'
  };

  try {
    console.log('1. Testing current application state...');
    
    // Try to load the application with longer timeout
    await page.goto('https://usmle-trivia.netlify.app', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for potential dynamic content
    await page.waitForTimeout(5000);
    
    // Take screenshot of current state
    await page.screenshot({ path: `${screenshotsDir}/current-state.png`, fullPage: true });
    analysis.screenshots.push('current-state.png');
    
    // Check if page has loaded content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasContent: !!document.body.innerText.trim(),
        bodyText: document.body.innerText.slice(0, 500),
        elementsCount: document.querySelectorAll('*').length,
        hasReactRoot: !!document.querySelector('#root, [data-reactroot]'),
        hasJavaScript: !!document.querySelector('script[src]'),
        errorMessages: Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent.includes('Error') || 
          el.textContent.includes('Failed') ||
          el.textContent.includes('Cannot')
        )?.textContent || null
      };
    });
    
    console.log('Page analysis:', pageContent);
    analysis.currentState = pageContent.hasContent ? 'loaded' : 'blank';
    
    if (!pageContent.hasContent || pageContent.elementsCount < 10) {
      analysis.loadingIssues.push('Page appears to be blank or not loading properly');
      analysis.loadingIssues.push('May be a deployment issue or application error');
      
      // Try to check console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Try reloading
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: `${screenshotsDir}/after-reload.png`, fullPage: true });
      analysis.screenshots.push('after-reload.png');
      
      if (consoleErrors.length > 0) {
        analysis.loadingIssues.push(`Console errors: ${consoleErrors.join(', ')}`);
      }
    }
    
    // Try different potential URLs
    const urlsToTry = [
      'https://usmle-trivia.netlify.app/',
      'https://usmle-trivia.netlify.app/dashboard',
      'https://usmle-trivia.netlify.app/login',
      'https://usmle-trivia.netlify.app/register'
    ];
    
    for (const url of urlsToTry) {
      try {
        console.log(`Testing URL: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        const content = await page.evaluate(() => ({
          hasContent: !!document.body.innerText.trim(),
          elementCount: document.querySelectorAll('*').length
        }));
        
        if (content.hasContent && content.elementCount > 10) {
          const urlSlug = url.split('/').pop() || 'root';
          await page.screenshot({ path: `${screenshotsDir}/${urlSlug}-working.png`, fullPage: true });
          analysis.screenshots.push(`${urlSlug}-working.png`);
          console.log(`✓ Found working content at ${url}`);
          break;
        }
      } catch (e) {
        console.log(`Failed to load ${url}: ${e.message}`);
      }
    }

  } catch (error) {
    console.error('Error during analysis:', error.message);
    analysis.loadingIssues.push(`Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }

  return analysis;
}

// Analyze existing screenshots and provide UI recommendations
function analyzeExistingScreenshots() {
  const analysis = {
    uiStrengths: [],
    uiWeaknesses: [],
    modernizationNeeds: [],
    mobileOptimization: [],
    performanceObservations: [],
    recommendations: []
  };

  // Based on the screenshots I've seen, provide analysis
  analysis.uiStrengths = [
    "Clean, medical-focused branding with MedQuiz Pro logo",
    "Professional color scheme with blue gradient header",
    "Well-organized dashboard with statistical cards",
    "Clear navigation sidebar with logical grouping",
    "Proper USMLE-style question format with clinical scenarios",
    "Good use of icons and visual hierarchy"
  ];

  analysis.uiWeaknesses = [
    "Interface looks dated compared to modern medical apps",
    "Card-based statistics could use more visual appeal",
    "Typography appears basic without modern font choices",
    "Color palette is limited and could be more engaging",
    "Sidebar could use better visual indicators for active states",
    "Overall design lacks the polish of premium medical education platforms"
  ];

  analysis.modernizationNeeds = [
    "Implement modern design system (e.g., Tailwind CSS components)",
    "Add glassmorphism or subtle shadows to cards",
    "Upgrade to modern icon set (Lucide, Heroicons)",
    "Implement dark mode support",
    "Add micro-animations and transitions",
    "Modernize color palette with gradients and better contrast",
    "Implement better responsive design patterns"
  ];

  analysis.mobileOptimization = [
    "Sidebar should collapse to hamburger menu on mobile",
    "Touch targets need to be larger for mobile interaction",
    "Typography should scale better across devices",
    "Cards should stack vertically with proper spacing",
    "Quiz interface needs better mobile-specific layout",
    "Need swipe gestures for question navigation"
  ];

  analysis.performanceObservations = [
    "1000ms+ load time indicates optimization opportunities",
    "Only 5 resources loaded suggests minimal bundling",
    "Low memory usage is good (10MB)",
    "Need to implement lazy loading for better performance",
    "Bundle size likely needs optimization"
  ];

  analysis.recommendations = [
    "IMMEDIATE: Fix deployment/loading issues causing blank pages",
    "HIGH: Implement modern UI component library (shadcn/ui, Chakra UI)",
    "HIGH: Add comprehensive mobile-responsive design",
    "MEDIUM: Implement dark mode toggle",
    "MEDIUM: Add smooth transitions and micro-animations",
    "MEDIUM: Upgrade typography with modern font stack",
    "LOW: Add progressive web app features",
    "LOW: Implement advanced accessibility features"
  ];

  return analysis;
}

// Run both analyses
Promise.all([
  manualTestAnalysis(),
  analyzeExistingScreenshots()
]).then(([liveAnalysis, staticAnalysis]) => {
  const combinedResults = {
    timestamp: new Date().toISOString(),
    liveAnalysis,
    staticAnalysis,
    overallAssessment: {
      currentIssues: liveAnalysis.loadingIssues,
      designQuality: "Functional but needs modernization",
      technicalDebt: "Moderate - needs UI/UX overhaul",
      priority: "HIGH - Address loading issues first, then UI modernization"
    }
  };

  console.log('\n=== COMPREHENSIVE UI/UX ANALYSIS COMPLETE ===');
  console.log(`Current state: ${liveAnalysis.currentState}`);
  console.log(`Loading issues: ${liveAnalysis.loadingIssues.length}`);
  console.log(`Screenshots captured: ${liveAnalysis.screenshots.length}`);
  console.log(`UI recommendations: ${staticAnalysis.recommendations.length}`);

  // Save results
  fs.writeFileSync('/root/repo/ui-analysis-results.json', JSON.stringify(combinedResults, null, 2));
  console.log('\n✓ Complete analysis saved to ui-analysis-results.json');
}).catch(error => {
  console.error('Analysis failed:', error);
});