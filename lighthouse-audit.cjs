const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * Simplified Lighthouse Alternative Performance Audit
 * Since lighthouse library has import issues, using manual performance testing
 */

class LighthouseAlternative {
  constructor() {
    this.results = {};
  }

  async runAudit() {
    console.log('🔍 Running Lighthouse Alternative Performance Audit...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const testPages = [
        { name: 'Landing', url: 'http://localhost:4175/' },
        { name: 'Login', url: 'http://localhost:4175/login' },
        { name: 'Dashboard', url: 'http://localhost:4175/dashboard' }
      ];

      for (const testPage of testPages) {
        console.log(`   Testing ${testPage.name}...`);
        
        // Desktop test
        const desktopResults = await this.testPage(browser, testPage, 'desktop');
        
        // Mobile test
        const mobileResults = await this.testPage(browser, testPage, 'mobile');
        
        this.results[testPage.name] = {
          desktop: desktopResults,
          mobile: mobileResults
        };
      }

      await this.generateReport();
      
    } finally {
      await browser.close();
    }
  }

  async testPage(browser, testPage, device) {
    const page = await browser.newPage();
    
    try {
      // Set viewport based on device
      if (device === 'mobile') {
        await page.setViewport({ width: 375, height: 667 });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      } else {
        await page.setViewport({ width: 1200, height: 800 });
      }

      // Enable performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.performanceData = {
          navigationStart: 0,
          metrics: {}
        };

        // Capture navigation timing
        window.addEventListener('load', () => {
          const perfData = performance.getEntriesByType('navigation')[0];
          window.performanceData.navigationStart = perfData.fetchStart;
          window.performanceData.metrics = {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            loadComplete: perfData.loadEventEnd - perfData.fetchStart,
            firstByte: perfData.responseStart - perfData.fetchStart,
            domInteractive: perfData.domInteractive - perfData.fetchStart
          };
        });

        // Capture Core Web Vitals
        window.performanceData.webVitals = {};
        
        // LCP Observer
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            window.performanceData.webVitals.lcp = entry.startTime;
          });
        }).observe({entryTypes: ['largest-contentful-paint']});

        // CLS Observer  
        let clsValue = 0;
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              window.performanceData.webVitals.cls = clsValue;
            }
          });
        }).observe({entryTypes: ['layout-shift']});

        // FCP Observer
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              window.performanceData.webVitals.fcp = entry.startTime;
            }
          });
        }).observe({entryTypes: ['paint']});
      });

      // Navigate and measure
      const startTime = Date.now();
      await page.goto(testPage.url, { waitUntil: 'networkidle0' });
      const totalLoadTime = Date.now() - startTime;

      // Wait for metrics to be collected
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get performance data
      const perfData = await page.evaluate(() => window.performanceData);
      
      // Calculate accessibility score (simplified)
      const accessibilityScore = await this.calculateAccessibilityScore(page);
      
      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore(perfData, totalLoadTime);
      
      // Get resource information
      const resources = await this.analyzeResources(page);

      return {
        performanceScore,
        accessibilityScore,
        totalLoadTime,
        metrics: {
          lcp: perfData.webVitals?.lcp || 0,
          cls: perfData.webVitals?.cls || 0,
          fcp: perfData.webVitals?.fcp || 0,
          domContentLoaded: perfData.metrics?.domContentLoaded || 0,
          loadComplete: perfData.metrics?.loadComplete || 0,
          firstByte: perfData.metrics?.firstByte || 0
        },
        resources
      };

    } finally {
      await page.close();
    }
  }

  calculatePerformanceScore(perfData, totalLoadTime) {
    let score = 100;
    
    // Penalize based on load time
    if (totalLoadTime > 3000) score -= 30;
    else if (totalLoadTime > 2000) score -= 15;
    else if (totalLoadTime > 1000) score -= 5;

    // Penalize based on LCP
    const lcp = perfData.webVitals?.lcp || 0;
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 10;

    // Penalize based on CLS
    const cls = perfData.webVitals?.cls || 0;
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 10;

    // Penalize based on FCP
    const fcp = perfData.webVitals?.fcp || 0;
    if (fcp > 3000) score -= 15;
    else if (fcp > 1800) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async calculateAccessibilityScore(page) {
    try {
      // Basic accessibility checks
      const accessibilityChecks = await page.evaluate(() => {
        let score = 100;
        let issues = [];

        // Check for alt text on images
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
        if (imagesWithoutAlt.length > 0) {
          score -= 20;
          issues.push(`${imagesWithoutAlt.length} images without alt text`);
        }

        // Check for form labels
        const inputs = document.querySelectorAll('input');
        const inputsWithoutLabels = Array.from(inputs).filter(input => {
          const id = input.id;
          return id && !document.querySelector(`label[for="${id}"]`);
        });
        if (inputsWithoutLabels.length > 0) {
          score -= 15;
          issues.push(`${inputsWithoutLabels.length} inputs without labels`);
        }

        // Check for headings structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          score -= 10;
          issues.push('No heading structure found');
        }

        // Check for color contrast (simplified)
        const body = document.body;
        const styles = window.getComputedStyle(body);
        if (styles.color === styles.backgroundColor) {
          score -= 30;
          issues.push('Poor color contrast detected');
        }

        return { score: Math.max(0, score), issues };
      });

      return accessibilityChecks.score;
    } catch (error) {
      return 50; // Default score if checks fail
    }
  }

  async analyzeResources(page) {
    try {
      const resourceTiming = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map(resource => ({
          name: resource.name,
          type: resource.initiatorType,
          size: resource.transferSize,
          duration: resource.duration
        }));
      });

      const totalSize = resourceTiming.reduce((sum, resource) => sum + (resource.size || 0), 0);
      const jsSize = resourceTiming.filter(r => r.type === 'script').reduce((sum, r) => sum + (r.size || 0), 0);
      const cssSize = resourceTiming.filter(r => r.type === 'link').reduce((sum, r) => sum + (r.size || 0), 0);
      const imageSize = resourceTiming.filter(r => r.type === 'img').reduce((sum, r) => sum + (r.size || 0), 0);

      return {
        totalSize: Math.round(totalSize / 1024), // KB
        jsSize: Math.round(jsSize / 1024),       // KB
        cssSize: Math.round(cssSize / 1024),     // KB
        imageSize: Math.round(imageSize / 1024), // KB
        resourceCount: resourceTiming.length
      };
    } catch (error) {
      return { totalSize: 0, jsSize: 0, cssSize: 0, imageSize: 0, resourceCount: 0 };
    }
  }

  async generateReport() {
    console.log('📄 Generating Lighthouse Alternative Report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    await fs.writeFile('lighthouse-alternative-report.json', JSON.stringify(report, null, 2));
    
    const readableReport = this.generateReadableReport(report);
    await fs.writeFile('lighthouse-performance-report.md', readableReport);

    console.log('✅ Lighthouse alternative audit complete!');
    console.log('📊 Performance Summary:');
    console.log(`   Average Desktop Performance: ${report.summary.avgDesktopPerformance}`);
    console.log(`   Average Mobile Performance: ${report.summary.avgMobilePerformance}`);
    console.log(`   Average Accessibility: ${report.summary.avgAccessibility}`);
  }

  generateSummary() {
    const pages = Object.keys(this.results);
    const totalPages = pages.length;
    
    const avgDesktopPerformance = Math.round(
      pages.reduce((sum, page) => sum + this.results[page].desktop.performanceScore, 0) / totalPages
    );
    
    const avgMobilePerformance = Math.round(
      pages.reduce((sum, page) => sum + this.results[page].mobile.performanceScore, 0) / totalPages
    );
    
    const avgAccessibility = Math.round(
      pages.reduce((sum, page) => sum + this.results[page].desktop.accessibilityScore, 0) / totalPages
    );

    return {
      avgDesktopPerformance,
      avgMobilePerformance,
      avgAccessibility,
      overallGrade: this.calculateOverallGrade(avgDesktopPerformance, avgMobilePerformance, avgAccessibility)
    };
  }

  calculateOverallGrade(desktop, mobile, accessibility) {
    const overall = (desktop + mobile + accessibility) / 3;
    if (overall >= 90) return 'A';
    if (overall >= 80) return 'B';
    if (overall >= 70) return 'C';
    if (overall >= 60) return 'D';
    return 'F';
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results).forEach(([page, results]) => {
      // Performance recommendations
      if (results.desktop.performanceScore < 80) {
        recommendations.push({
          page,
          type: 'Performance',
          priority: 'High',
          issue: `Desktop performance score (${results.desktop.performanceScore}) below target`,
          suggestion: 'Optimize bundle size, implement code splitting, optimize images'
        });
      }
      
      if (results.mobile.performanceScore < 80) {
        recommendations.push({
          page,
          type: 'Mobile Performance',
          priority: 'High',
          issue: `Mobile performance score (${results.mobile.performanceScore}) below target`,
          suggestion: 'Implement mobile-specific optimizations, reduce bundle size'
        });
      }

      // Core Web Vitals recommendations
      if (results.desktop.metrics.lcp > 2500) {
        recommendations.push({
          page,
          type: 'Core Web Vitals',
          priority: 'High',
          issue: `LCP (${Math.round(results.desktop.metrics.lcp)}ms) exceeds target`,
          suggestion: 'Optimize largest content element, preload critical resources'
        });
      }

      if (results.desktop.metrics.cls > 0.1) {
        recommendations.push({
          page,
          type: 'Core Web Vitals',
          priority: 'Medium',
          issue: `CLS (${results.desktop.metrics.cls.toFixed(3)}) exceeds target`,
          suggestion: 'Reserve space for dynamic content, avoid layout shifts'
        });
      }

      // Accessibility recommendations
      if (results.desktop.accessibilityScore < 90) {
        recommendations.push({
          page,
          type: 'Accessibility',
          priority: 'Medium',
          issue: `Accessibility score (${results.desktop.accessibilityScore}) below target`,
          suggestion: 'Add alt text to images, improve form labels, enhance keyboard navigation'
        });
      }
    });

    return recommendations;
  }

  generateReadableReport(report) {
    return `# 🔍 Lighthouse Alternative Performance Report - MedQuiz Pro

**Generated:** ${report.timestamp}

## Performance Summary

**Overall Grade:** ${report.summary.overallGrade}
- **Desktop Performance:** ${report.summary.avgDesktopPerformance}/100
- **Mobile Performance:** ${report.summary.avgMobilePerformance}/100  
- **Accessibility:** ${report.summary.avgAccessibility}/100

## Detailed Results

${Object.entries(report.results).map(([page, results]) => `
### ${page} Page

#### Desktop Performance
- **Performance Score:** ${results.desktop.performanceScore}/100
- **Accessibility Score:** ${results.desktop.accessibilityScore}/100
- **Load Time:** ${results.desktop.totalLoadTime}ms
- **LCP:** ${Math.round(results.desktop.metrics.lcp)}ms
- **CLS:** ${results.desktop.metrics.cls.toFixed(3)}
- **FCP:** ${Math.round(results.desktop.metrics.fcp)}ms

#### Mobile Performance
- **Performance Score:** ${results.mobile.performanceScore}/100
- **Accessibility Score:** ${results.mobile.accessibilityScore}/100
- **Load Time:** ${results.mobile.totalLoadTime}ms
- **LCP:** ${Math.round(results.mobile.metrics.lcp)}ms
- **CLS:** ${results.mobile.metrics.cls.toFixed(3)}
- **FCP:** ${Math.round(results.mobile.metrics.fcp)}ms

#### Resource Analysis
- **Total Size:** ${results.desktop.resources.totalSize}KB
- **JavaScript:** ${results.desktop.resources.jsSize}KB
- **CSS:** ${results.desktop.resources.cssSize}KB
- **Images:** ${results.desktop.resources.imageSize}KB
`).join('\\n')}

## Performance Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.page} - ${rec.type} (${rec.priority} Priority)
**Issue:** ${rec.issue}
**Suggestion:** ${rec.suggestion}
`).join('\\n')}

## Medical Education Performance Assessment

### Study Session Readiness
${report.summary.avgDesktopPerformance >= 80 ? '✅ Excellent - Ready for extended study sessions' : '⚠️ Needs optimization for optimal study experience'}

### Mobile Learning Capability  
${report.summary.avgMobilePerformance >= 80 ? '✅ Excellent - Suitable for mobile studying' : '⚠️ Mobile performance needs improvement'}

### Accessibility for Medical Education
${report.summary.avgAccessibility >= 90 ? '✅ Excellent - Accessible to all medical students' : '⚠️ Accessibility improvements needed'}

---

*This performance audit is tailored for medical education platforms, focusing on the unique needs of medical students and USMLE preparation.*
`;
  }
}

// Run the Lighthouse alternative audit
async function runAudit() {
  const audit = new LighthouseAlternative();
  await audit.runAudit();
}

if (require.main === module) {
  runAudit().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
}

module.exports = LighthouseAlternative;