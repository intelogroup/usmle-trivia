#!/usr/bin/env node

/**
 * 🧹 GLOBAL TEST TEARDOWN
 * Cleans up test environment and generates final reports
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  try {
    // Read test metadata
    const metadataPath = './test-results/test-metadata.json';
    let testMetadata = {};
    
    if (existsSync(metadataPath)) {
      testMetadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    }

    // Update with completion time
    testMetadata.endTime = new Date().toISOString();
    testMetadata.duration = testMetadata.startTime ? 
      new Date(testMetadata.endTime) - new Date(testMetadata.startTime) : 0;

    // Collect test results
    const testResults = await collectTestResults();
    
    // Generate final summary report
    const finalReport = {
      ...testMetadata,
      summary: testResults.summary,
      results: testResults.details,
      recommendations: generateRecommendations(testResults)
    };

    // Save final report
    const finalReportPath = `./test-results/final-test-report-${Date.now()}.json`;
    writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2));

    // Generate HTML dashboard
    const htmlDashboard = generateHTMLDashboard(finalReport);
    const dashboardPath = `./test-results/test-dashboard-${Date.now()}.html`;
    writeFileSync(dashboardPath, htmlDashboard);

    // Print summary
    console.log('\n📊 FINAL TEST SUMMARY');
    console.log('====================');
    console.log(`Session Duration: ${Math.round(finalReport.duration / 1000 / 60)} minutes`);
    console.log(`Test Suites: ${testResults.summary.totalSuites}`);
    console.log(`Tests Passed: ${testResults.summary.passed} ✅`);
    console.log(`Tests Failed: ${testResults.summary.failed} ❌`);
    console.log(`Success Rate: ${testResults.summary.successRate}%`);
    
    console.log('\n📄 Generated Reports:');
    console.log(`   JSON Report: ${finalReportPath}`);
    console.log(`   HTML Dashboard: ${dashboardPath}`);

    // Cleanup temporary files
    await cleanupTempFiles();

    console.log('\n✅ Global test teardown completed successfully');

  } catch (error) {
    console.error('❌ Error during test teardown:', error.message);
  }
}

async function collectTestResults() {
  const resultsDir = './test-results';
  const results = {
    summary: {
      totalSuites: 0,
      passed: 0,
      failed: 0,
      successRate: 0
    },
    details: {
      functionality: null,
      crossBrowser: null,
      userJourney: null,
      performance: null,
      accessibility: null,
      medicalContent: null
    }
  };

  // Collect individual test results
  const testFiles = [
    { name: 'functionality', file: 'quiz-comprehensive-test-results.json' },
    { name: 'performance', file: 'quiz-performance-report.json' },
    { name: 'accessibility', file: 'quiz-accessibility-report.json' },
    { name: 'medicalContent', file: 'medical-content-validation-report.json' },
    { name: 'userJourney', file: 'user-journey-test-report.json' }
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSuites = 0;

  for (const testFile of testFiles) {
    const filePath = join(resultsDir, testFile.file);
    
    if (existsSync(filePath)) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        results.details[testFile.name] = data;
        
        // Extract metrics based on file structure
        if (data.summary) {
          totalPassed += data.summary.passed || 0;
          totalFailed += data.summary.failed || 0;
          totalSuites += data.summary.total || 1;
        }
        
      } catch (error) {
        console.log(`   ⚠️ Could not parse ${testFile.file}: ${error.message}`);
      }
    }
  }

  results.summary = {
    totalSuites,
    passed: totalPassed,
    failed: totalFailed,
    successRate: totalSuites > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : 0
  };

  return results;
}

function generateRecommendations(testResults) {
  const recommendations = [];

  // Performance recommendations
  if (testResults.details.performance) {
    const avgLoadTime = testResults.details.performance.summary?.averageLoadTime;
    if (avgLoadTime > 3000) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        issue: 'Slow page load times detected',
        suggestion: 'Optimize bundle size and implement code splitting'
      });
    }
  }

  // Accessibility recommendations
  if (testResults.details.accessibility) {
    const violations = testResults.details.accessibility.summary?.totalViolations || 0;
    if (violations > 5) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'High',
        issue: `${violations} accessibility violations found`,
        suggestion: 'Address WCAG 2.1 AA compliance issues for medical education accessibility'
      });
    }
  }

  // Medical content recommendations
  if (testResults.details.medicalContent) {
    const compliance = parseFloat(testResults.details.medicalContent.summary?.overallCompliance || '0');
    if (compliance < 80) {
      recommendations.push({
        category: 'Medical Content',
        priority: 'Medium',
        issue: `Medical content compliance at ${compliance}%`,
        suggestion: 'Review medical terminology and clinical scenario authenticity'
      });
    }
  }

  // General recommendations
  if (testResults.summary.successRate < 90) {
    recommendations.push({
      category: 'Overall Quality',
      priority: 'High',
      issue: `Test success rate at ${testResults.summary.successRate}%`,
      suggestion: 'Investigate failing tests and improve overall system reliability'
    });
  }

  return recommendations;
}

function generateHTMLDashboard(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedQuiz Pro - Comprehensive Test Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 3em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { color: #64748b; font-size: 1.1em; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .section { background: white; border-radius: 10px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section h2 { color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
        .recommendations { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .recommendation { margin-bottom: 15px; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #d97706; font-weight: bold; }
        .priority-low { color: #059669; font-weight: bold; }
        .footer { text-align: center; color: #64748b; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MedQuiz Pro Test Dashboard</h1>
            <p>Comprehensive Quiz Functionality Testing Results</p>
            <p>Generated: ${report.endTime || new Date().toISOString()}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.summary?.totalSuites || 0}</div>
                <div class="metric-label">Test Suites</div>
            </div>
            <div class="metric">
                <div class="metric-value passed">${report.summary?.passed || 0}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${report.summary?.failed || 0}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary?.successRate || 0}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <div class="section">
            <h2>📋 Test Suite Results</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                ${Object.entries(report.results?.details || {}).map(([name, data]) => `
                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                        <h3 style="text-transform: capitalize; margin-bottom: 10px;">${name.replace(/([A-Z])/g, ' $1').trim()}</h3>
                        <p>Status: ${data ? '✅ Completed' : '⏳ Pending'}</p>
                        ${data?.summary ? `<p>Score: ${data.summary.successRate || 'N/A'}%</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        ${report.recommendations && report.recommendations.length > 0 ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <div class="recommendation">
                        <strong class="priority-${rec.priority.toLowerCase()}">[${rec.priority}] ${rec.category}:</strong>
                        <p>${rec.issue}</p>
                        <p><em>Suggestion: ${rec.suggestion}</em></p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>📊 Test Environment</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div><strong>Platform:</strong> ${report.environment?.platform || 'N/A'}</div>
                <div><strong>Node Version:</strong> ${report.environment?.nodeVersion || 'N/A'}</div>
                <div><strong>Test URL:</strong> ${report.environment?.testURL || 'N/A'}</div>
                <div><strong>Duration:</strong> ${Math.round((report.duration || 0) / 1000 / 60)} minutes</div>
            </div>
        </div>

        <div class="footer">
            <p>🤖 Generated with Claude Code | MedQuiz Pro Comprehensive Testing Suite</p>
            <p>Medical Education Platform Testing Dashboard</p>
        </div>
    </div>
</body>
</html>
  `;
}

async function cleanupTempFiles() {
  console.log('🧹 Cleaning up temporary files...');
  
  const tempFiles = [
    '/tmp/quiz-performance-report.json',
    '/tmp/quiz-accessibility-report.json',
    '/tmp/medical-content-validation-report.json'
  ];

  for (const file of tempFiles) {
    try {
      if (existsSync(file)) {
        // In a real environment, you would delete these files
        console.log(`   🗑️ Would cleanup: ${file}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Could not cleanup ${file}: ${error.message}`);
    }
  }
}

export default globalTeardown;