const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;

/**
 * Comprehensive Performance Analysis for MedQuiz Pro
 * Tests Core Web Vitals, bundle analysis, API performance, and mobile optimization
 */

const PERFORMANCE_CONFIG = {
  // Performance targets for medical education platform
  targets: {
    lcp: 2500,        // Largest Contentful Paint < 2.5s
    fid: 100,         // First Input Delay < 100ms  
    cls: 0.1,         // Cumulative Layout Shift < 0.1
    fcp: 1800,        // First Contentful Paint < 1.8s
    speedIndex: 3000, // Speed Index < 3s
    bundleSize: 500,  // Initial bundle < 500KB
    apiResponse: 200, // API calls < 200ms
    lighthouse: 90    // Lighthouse score > 90
  },
  
  // Test URLs for comprehensive analysis
  testUrls: [
    { name: 'Landing Page', url: 'http://localhost:4175/' },
    { name: 'Login Page', url: 'http://localhost:4175/login' },
    { name: 'Dashboard', url: 'http://localhost:4175/dashboard' },
    { name: 'Quiz Engine', url: 'http://localhost:4175/quiz' }
  ],
  
  // Device profiles for mobile testing
  devices: [
    { name: 'Desktop', viewport: { width: 1280, height: 720 } },
    { name: 'Mobile', viewport: { width: 375, height: 667 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } }
  ],
  
  // Network conditions
  networks: [
    { name: '4G', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
    { name: '3G', downloadThroughput: 384 * 1024 / 8, uploadThroughput: 64 * 1024 / 8, latency: 300 }
  ]
};

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      lighthouse: {},
      coreWebVitals: {},
      bundleAnalysis: {},
      apiPerformance: {},
      mobilePerformance: {},
      recommendations: []
    };
  }

  async runComprehensiveAnalysis() {
    console.log('🚀 Starting Comprehensive Performance Analysis for MedQuiz Pro');
    
    try {
      // 1. Bundle Analysis
      await this.analyzeBundleSize();
      
      // 2. Lighthouse Audits
      await this.runLighthouseAudits();
      
      // 3. Core Web Vitals Analysis
      await this.analyzeCoreWebVitals();
      
      // 4. Mobile Performance Testing
      await this.testMobilePerformance();
      
      // 5. API Performance Testing
      await this.testAPIPerformance();
      
      // 6. Generate Recommendations
      await this.generateRecommendations();
      
      // 7. Save Results
      await this.saveResults();
      
      console.log('✅ Performance analysis complete!');
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      throw error;
    }
  }

  async analyzeBundleSize() {
    console.log('📊 Analyzing bundle size...');
    
    try {
      const distPath = './dist';
      const files = await fs.readdir(distPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const cssFiles = files.filter(f => f.endsWith('.css'));
      
      let totalSize = 0;
      const chunkAnalysis = [];
      
      for (const file of [...jsFiles, ...cssFiles]) {
        const filePath = `${distPath}/${file}`;
        const stats = await fs.stat(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        chunkAnalysis.push({
          file,
          sizeKB,
          type: file.endsWith('.js') ? 'JavaScript' : 'CSS'
        });
      }
      
      this.results.bundleAnalysis = {
        totalSizeKB: totalSize,
        chunks: chunkAnalysis.sort((a, b) => b.sizeKB - a.sizeKB),
        meetsTarget: totalSize <= PERFORMANCE_CONFIG.targets.bundleSize,
        largestChunks: chunkAnalysis.filter(c => c.sizeKB > 50)
      };
      
      console.log(`   Total bundle size: ${totalSize}KB (Target: ${PERFORMANCE_CONFIG.targets.bundleSize}KB)`);
      
    } catch (error) {
      console.error('   ❌ Bundle analysis failed:', error.message);
    }
  }

  async runLighthouseAudits() {
    console.log('🔍 Running Lighthouse audits...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      for (const testUrl of PERFORMANCE_CONFIG.testUrls) {
        console.log(`   Auditing ${testUrl.name}...`);
        
        const page = await browser.newPage();
        
        // Desktop audit
        const desktopAudit = await lighthouse(testUrl.url, {
          port: (new URL(browser.wsEndpoint())).port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices']
        });
        
        // Mobile audit
        await page.emulate(puppeteer.devices['iPhone 12']);
        const mobileAudit = await lighthouse(testUrl.url, {
          port: (new URL(browser.wsEndpoint())).port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices'],
          settings: { formFactor: 'mobile' }
        });
        
        this.results.lighthouse[testUrl.name] = {
          desktop: {
            performance: Math.round(desktopAudit.lhr.categories.performance.score * 100),
            accessibility: Math.round(desktopAudit.lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(desktopAudit.lhr.categories['best-practices'].score * 100),
            metrics: this.extractMetrics(desktopAudit.lhr.audits)
          },
          mobile: {
            performance: Math.round(mobileAudit.lhr.categories.performance.score * 100),
            accessibility: Math.round(mobileAudit.lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(mobileAudit.lhr.categories['best-practices'].score * 100),
            metrics: this.extractMetrics(mobileAudit.lhr.audits)
          }
        };
        
        await page.close();
      }
      
    } finally {
      await browser.close();
    }
  }

  extractMetrics(audits) {
    return {
      fcp: audits['first-contentful-paint']?.numericValue,
      lcp: audits['largest-contentful-paint']?.numericValue,
      cls: audits['cumulative-layout-shift']?.numericValue,
      speedIndex: audits['speed-index']?.numericValue,
      totalBlockingTime: audits['total-blocking-time']?.numericValue
    };
  }

  async analyzeCoreWebVitals() {
    console.log('📈 Analyzing Core Web Vitals...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      const page = await browser.newPage();
      
      // Enable runtime performance metrics
      await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = [];
        
        // Capture CLS
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.hadRecentInput) return;
            window.performanceMetrics.push({
              type: 'cls',
              value: entry.value,
              timestamp: entry.startTime
            });
          });
        }).observe({entryTypes: ['layout-shift']});
        
        // Capture LCP
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            window.performanceMetrics.push({
              type: 'lcp',
              value: entry.startTime,
              timestamp: entry.startTime
            });
          });
        }).observe({entryTypes: ['largest-contentful-paint']});
        
        // Capture FCP
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            window.performanceMetrics.push({
              type: 'fcp',
              value: entry.startTime,
              timestamp: entry.startTime
            });
          });
        }).observe({entryTypes: ['paint']});
      });
      
      for (const testUrl of PERFORMANCE_CONFIG.testUrls) {
        console.log(`   Testing Core Web Vitals for ${testUrl.name}...`);
        
        await page.goto(testUrl.url, { waitUntil: 'networkidle0' });
        
        // Wait for metrics to be collected
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const metrics = await page.evaluate(() => window.performanceMetrics);
        
        this.results.coreWebVitals[testUrl.name] = {
          lcp: metrics.find(m => m.type === 'lcp')?.value || null,
          cls: metrics.filter(m => m.type === 'cls').reduce((sum, m) => sum + m.value, 0),
          fcp: metrics.find(m => m.type === 'fcp')?.value || null,
          meetsTargets: {
            lcp: (metrics.find(m => m.type === 'lcp')?.value || Infinity) < PERFORMANCE_CONFIG.targets.lcp,
            cls: metrics.filter(m => m.type === 'cls').reduce((sum, m) => sum + m.value, 0) < PERFORMANCE_CONFIG.targets.cls,
            fcp: (metrics.find(m => m.type === 'fcp')?.value || Infinity) < PERFORMANCE_CONFIG.targets.fcp
          }
        };
      }
      
    } finally {
      await browser.close();
    }
  }

  async testMobilePerformance() {
    console.log('📱 Testing mobile performance...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      for (const device of PERFORMANCE_CONFIG.devices) {
        console.log(`   Testing on ${device.name}...`);
        
        const page = await browser.newPage();
        await page.setViewport(device.viewport);
        
        // Test with different network conditions
        for (const network of PERFORMANCE_CONFIG.networks) {
          await page.emulateNetworkConditions({
            offline: false,
            downloadThroughput: network.downloadThroughput,
            uploadThroughput: network.uploadThroughput,
            latency: network.latency
          });
          
          const startTime = Date.now();
          await page.goto('http://localhost:4175/', { waitUntil: 'networkidle0' });
          const loadTime = Date.now() - startTime;
          
          if (!this.results.mobilePerformance[device.name]) {
            this.results.mobilePerformance[device.name] = {};
          }
          
          this.results.mobilePerformance[device.name][network.name] = {
            loadTime,
            meetsTarget: loadTime < 3000 // 3s target for mobile
          };
        }
        
        await page.close();
      }
      
    } finally {
      await browser.close();
    }
  }

  async testAPIPerformance() {
    console.log('🔗 Testing API performance...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      const page = await browser.newPage();
      
      // Monitor network requests
      const networkRequests = [];
      page.on('response', response => {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          responseTime: response.timing()?.receiveHeadersEnd || 0
        });
      });
      
      await page.goto('http://localhost:4175/login', { waitUntil: 'networkidle0' });
      
      // Simulate login to test authentication API
      await page.type('input[type="email"]', 'test@example.com');
      await page.type('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      
      // Wait for API responses
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Analyze API performance
      const apiRequests = networkRequests.filter(req => 
        req.url.includes('convex') || req.url.includes('api')
      );
      
      this.results.apiPerformance = {
        totalRequests: apiRequests.length,
        averageResponseTime: apiRequests.reduce((sum, req) => sum + req.responseTime, 0) / apiRequests.length || 0,
        slowRequests: apiRequests.filter(req => req.responseTime > PERFORMANCE_CONFIG.targets.apiResponse),
        meetsTarget: apiRequests.every(req => req.responseTime < PERFORMANCE_CONFIG.targets.apiResponse)
      };
      
    } finally {
      await browser.close();
    }
  }

  async generateRecommendations() {
    console.log('💡 Generating performance recommendations...');
    
    const recommendations = [];
    
    // Bundle size recommendations
    if (!this.results.bundleAnalysis.meetsTarget) {
      recommendations.push({
        category: 'Bundle Optimization',
        priority: 'High',
        issue: `Bundle size (${this.results.bundleAnalysis.totalSizeKB}KB) exceeds target (${PERFORMANCE_CONFIG.targets.bundleSize}KB)`,
        solution: 'Implement code splitting, tree shaking, and lazy loading for non-critical components'
      });
    }
    
    // Large chunks recommendations
    if (this.results.bundleAnalysis.largestChunks.length > 0) {
      recommendations.push({
        category: 'Code Splitting',
        priority: 'Medium',
        issue: `Large chunks detected: ${this.results.bundleAnalysis.largestChunks.map(c => c.file).join(', ')}`,
        solution: 'Split large components into smaller chunks and implement dynamic imports'
      });
    }
    
    // Lighthouse score recommendations
    Object.entries(this.results.lighthouse).forEach(([page, results]) => {
      if (results.desktop.performance < PERFORMANCE_CONFIG.targets.lighthouse) {
        recommendations.push({
          category: 'Performance Optimization',
          priority: 'High',
          issue: `${page} desktop performance score (${results.desktop.performance}) below target (${PERFORMANCE_CONFIG.targets.lighthouse})`,
          solution: 'Optimize images, minimize JavaScript, enable compression, and implement caching'
        });
      }
      
      if (results.mobile.performance < PERFORMANCE_CONFIG.targets.lighthouse) {
        recommendations.push({
          category: 'Mobile Optimization',
          priority: 'High',
          issue: `${page} mobile performance score (${results.mobile.performance}) below target (${PERFORMANCE_CONFIG.targets.lighthouse})`,
          solution: 'Implement mobile-specific optimizations, reduce bundle size, and optimize for touch interactions'
        });
      }
    });
    
    // Core Web Vitals recommendations
    Object.entries(this.results.coreWebVitals).forEach(([page, metrics]) => {
      if (!metrics.meetsTargets.lcp) {
        recommendations.push({
          category: 'Core Web Vitals',
          priority: 'High',
          issue: `${page} LCP (${Math.round(metrics.lcp)}ms) exceeds target (${PERFORMANCE_CONFIG.targets.lcp}ms)`,
          solution: 'Optimize largest content element, preload critical resources, and improve server response time'
        });
      }
      
      if (!metrics.meetsTargets.cls) {
        recommendations.push({
          category: 'Core Web Vitals',
          priority: 'Medium',
          issue: `${page} CLS (${metrics.cls.toFixed(3)}) exceeds target (${PERFORMANCE_CONFIG.targets.cls})`,
          solution: 'Reserve space for dynamic content, avoid inserting content above existing elements'
        });
      }
    });
    
    this.results.recommendations = recommendations;
  }

  async saveResults() {
    console.log('💾 Saving performance analysis results...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: this.generateSummary(),
      ...this.results
    };
    
    await fs.writeFile(
      'comprehensive-performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Generate human-readable report
    const readableReport = this.generateReadableReport(report);
    await fs.writeFile('performance-analysis-report.md', readableReport);
    
    console.log('📄 Reports saved:');
    console.log('   - comprehensive-performance-report.json (detailed data)');
    console.log('   - performance-analysis-report.md (readable report)');
  }

  generateSummary() {
    const avgLighthouseScore = Object.values(this.results.lighthouse)
      .reduce((sum, page) => sum + page.desktop.performance + page.mobile.performance, 0) 
      / (Object.keys(this.results.lighthouse).length * 2);
    
    return {
      overallPerformanceScore: Math.round(avgLighthouseScore),
      bundleSizeStatus: this.results.bundleAnalysis.meetsTarget ? 'PASS' : 'NEEDS_OPTIMIZATION',
      coreWebVitalsStatus: Object.values(this.results.coreWebVitals).every(page => 
        page.meetsTargets.lcp && page.meetsTargets.cls && page.meetsTargets.fcp) ? 'PASS' : 'NEEDS_OPTIMIZATION',
      totalRecommendations: this.results.recommendations.length,
      criticalIssues: this.results.recommendations.filter(r => r.priority === 'High').length
    };
  }

  generateReadableReport(report) {
    return `# MedQuiz Pro - Performance Analysis Report

**Generated:** ${report.timestamp}

## Executive Summary
- **Overall Performance Score:** ${report.summary.overallPerformanceScore}/100
- **Bundle Size Status:** ${report.summary.bundleSizeStatus}
- **Core Web Vitals Status:** ${report.summary.coreWebVitalsStatus}
- **Total Recommendations:** ${report.summary.totalRecommendations}
- **Critical Issues:** ${report.summary.criticalIssues}

## Bundle Analysis
**Total Size:** ${report.bundleAnalysis.totalSizeKB}KB (Target: ≤500KB)
**Status:** ${report.bundleAnalysis.meetsTarget ? '✅ MEETS TARGET' : '❌ EXCEEDS TARGET'}

### Largest Chunks:
${report.bundleAnalysis.chunks.slice(0, 5).map(chunk => 
  `- ${chunk.file}: ${chunk.sizeKB}KB (${chunk.type})`).join('\\n')}

## Lighthouse Scores

${Object.entries(report.lighthouse).map(([page, scores]) => `
### ${page}
**Desktop:** Performance: ${scores.desktop.performance}, Accessibility: ${scores.desktop.accessibility}, Best Practices: ${scores.desktop.bestPractices}
**Mobile:** Performance: ${scores.mobile.performance}, Accessibility: ${scores.mobile.accessibility}, Best Practices: ${scores.mobile.bestPractices}
`).join('\\n')}

## Core Web Vitals

${Object.entries(report.coreWebVitals).map(([page, metrics]) => `
### ${page}
- **LCP:** ${Math.round(metrics.lcp)}ms ${metrics.meetsTargets.lcp ? '✅' : '❌'} (Target: <2500ms)
- **CLS:** ${metrics.cls.toFixed(3)} ${metrics.meetsTargets.cls ? '✅' : '❌'} (Target: <0.1)
- **FCP:** ${Math.round(metrics.fcp)}ms ${metrics.meetsTargets.fcp ? '✅' : '❌'} (Target: <1800ms)
`).join('\\n')}

## Mobile Performance

${Object.entries(report.mobilePerformance).map(([device, networks]) => `
### ${device}
${Object.entries(networks).map(([network, perf]) => 
  `- **${network}:** ${perf.loadTime}ms ${perf.meetsTarget ? '✅' : '❌'}`).join('\\n')}
`).join('\\n')}

## Performance Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.category} (${rec.priority} Priority)
**Issue:** ${rec.issue}
**Solution:** ${rec.solution}
`).join('\\n')}

## Medical Education Platform Specific Recommendations

### For Study Sessions
- Implement progressive loading for long quiz sessions
- Cache medical images and diagrams locally
- Optimize for battery life during extended study periods

### for Clinical Scenarios  
- Preload medical terminology and reference materials
- Implement smart prefetching based on study patterns
- Optimize medical image rendering for mobile devices

### For Real-Time Interactions
- Minimize quiz answer selection latency (<100ms)
- Implement offline mode for uninterrupted studying
- Cache progress data locally to prevent loss

---

*This report provides comprehensive performance analysis tailored for medical education platforms. Recommendations prioritize learning experience and accessibility for medical students.*
`;
  }
}

// Run the comprehensive performance analysis
async function main() {
  const analyzer = new PerformanceAnalyzer();
  await analyzer.runComprehensiveAnalysis();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n⏹️ Performance analysis interrupted');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;