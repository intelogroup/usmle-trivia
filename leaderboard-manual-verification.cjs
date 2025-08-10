// Manual Leaderboard Verification Script
// Analyzes the leaderboard code to verify real data integration

const fs = require('fs').promises;
const path = require('path');

class LeaderboardAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      testName: 'Leaderboard Real Data Integration Analysis',
      findings: [],
      codeSnippets: [],
      recommendations: [],
      status: 'UNKNOWN'
    };
  }

  async analyzeLeaderboardComponent() {
    console.log('🔍 Analyzing Leaderboard Component...');
    
    try {
      const leaderboardPath = '/root/repo/src/pages/Leaderboard.tsx';
      const content = await fs.readFile(leaderboardPath, 'utf8');
      
      // Check for Convex integration
      const hasConvexImport = content.includes('import { useQuery } from \'convex/react\'');
      const hasApiImport = content.includes('import { api } from \'../convex/_generated/api\'');
      const hasConvexQuery = content.includes('useQuery(api.auth.getLeaderboard');
      
      this.analysis.findings.push({
        test: 'Convex Backend Integration',
        passed: hasConvexImport && hasApiImport && hasConvexQuery,
        details: {
          convexImport: hasConvexImport,
          apiImport: hasApiImport,
          convexQuery: hasConvexQuery
        }
      });

      // Check for real data processing
      const hasDataMapping = content.includes('leaderboardData.map');
      const hasUserMapping = content.includes('user.userId') || content.includes('user.userName');
      const hasPointsDisplay = content.includes('user.points') && content.includes('user.accuracy');
      
      this.analysis.findings.push({
        test: 'Real Data Processing',
        passed: hasDataMapping && hasUserMapping && hasPointsDisplay,
        details: {
          dataMapping: hasDataMapping,
          userMapping: hasUserMapping,
          pointsDisplay: hasPointsDisplay
        }
      });

      // Check for loading states
      const hasLoadingState = content.includes('leaderboardData === undefined') && content.includes('LoadingSpinner');
      const hasEmptyState = content.includes('leaderboardData.length === 0');
      
      this.analysis.findings.push({
        test: 'Loading and Empty States',
        passed: hasLoadingState && hasEmptyState,
        details: {
          loadingState: hasLoadingState,
          emptyState: hasEmptyState
        }
      });

      // Check for user identification
      const hasCurrentUserCheck = content.includes('user?.userId') && content.includes('You');
      const hasUserAuth = content.includes('useAuth');
      
      this.analysis.findings.push({
        test: 'Current User Identification',
        passed: hasCurrentUserCheck && hasUserAuth,
        details: {
          currentUserCheck: hasCurrentUserCheck,
          userAuth: hasUserAuth
        }
      });

      // Extract relevant code snippets
      const convexQueryMatch = content.match(/const leaderboardData = useQuery\(([^)]+)\)/);
      if (convexQueryMatch) {
        this.analysis.codeSnippets.push({
          type: 'Convex Query',
          code: convexQueryMatch[0]
        });
      }

      const dataProcessingMatch = content.match(/const processedData = leaderboardData\.map\(([^}]+}[^}]*})/);
      if (dataProcessingMatch) {
        this.analysis.codeSnippets.push({
          type: 'Data Processing',
          code: dataProcessingMatch[0]
        });
      }

      console.log('✅ Leaderboard component analysis complete');
      return true;

    } catch (error) {
      this.analysis.findings.push({
        test: 'Component File Access',
        passed: false,
        details: { error: error.message }
      });
      return false;
    }
  }

  async analyzeBackendFunction() {
    console.log('🔍 Analyzing Backend Leaderboard Function...');
    
    try {
      const authPath = '/root/repo/convex/auth.ts';
      const content = await fs.readFile(authPath, 'utf8');
      
      // Check for getLeaderboard function
      const hasLeaderboardFunction = content.includes('export const getLeaderboard');
      const hasUserQuery = content.includes('ctx.db.query("users")');
      const hasPointsIndex = content.includes('withIndex("by_points")') || content.includes('.order("desc")');
      
      this.analysis.findings.push({
        test: 'Backend Leaderboard Function',
        passed: hasLeaderboardFunction && hasUserQuery && hasPointsIndex,
        details: {
          leaderboardFunction: hasLeaderboardFunction,
          userQuery: hasUserQuery,
          pointsIndex: hasPointsIndex
        }
      });

      // Check for user stats update function
      const hasStatsUpdate = content.includes('updateUserStats');
      const hasPointsUpdate = content.includes('points:') && content.includes('newPoints');
      const hasAccuracyUpdate = content.includes('accuracy:') && content.includes('newAccuracy');
      
      this.analysis.findings.push({
        test: 'User Stats Update Function',
        passed: hasStatsUpdate && hasPointsUpdate && hasAccuracyUpdate,
        details: {
          statsUpdate: hasStatsUpdate,
          pointsUpdate: hasPointsUpdate,
          accuracyUpdate: hasAccuracyUpdate
        }
      });

      // Extract leaderboard function
      const leaderboardFunctionMatch = content.match(/export const getLeaderboard[^}]+}[^}]*}/);
      if (leaderboardFunctionMatch) {
        this.analysis.codeSnippets.push({
          type: 'Leaderboard Query Function',
          code: leaderboardFunctionMatch[0]
        });
      }

      console.log('✅ Backend function analysis complete');
      return true;

    } catch (error) {
      this.analysis.findings.push({
        test: 'Backend File Access',
        passed: false,
        details: { error: error.message }
      });
      return false;
    }
  }

  async analyzeSchema() {
    console.log('🔍 Analyzing Database Schema...');
    
    try {
      const schemaPath = '/root/repo/convex/schema.ts';
      const content = await fs.readFile(schemaPath, 'utf8');
      
      // Check for users table with necessary fields
      const hasUsersTable = content.includes('users: defineTable');
      const hasPointsField = content.includes('points: v.optional(v.number())');
      const hasAccuracyField = content.includes('accuracy: v.optional(v.number())');
      const hasPointsIndex = content.includes('.index("by_points", ["points"])');
      
      this.analysis.findings.push({
        test: 'Database Schema for Leaderboard',
        passed: hasUsersTable && hasPointsField && hasAccuracyField && hasPointsIndex,
        details: {
          usersTable: hasUsersTable,
          pointsField: hasPointsField,
          accuracyField: hasAccuracyField,
          pointsIndex: hasPointsIndex
        }
      });

      // Check for comprehensive user fields
      const hasLevelField = content.includes('level: v.optional(v.number())');
      const hasStreakField = content.includes('streak: v.optional(v.number())');
      const hasTotalQuizzesField = content.includes('totalQuizzes: v.optional(v.number())');
      
      this.analysis.findings.push({
        test: 'Complete User Profile Fields',
        passed: hasLevelField && hasStreakField && hasTotalQuizzesField,
        details: {
          levelField: hasLevelField,
          streakField: hasStreakField,
          totalQuizzesField: hasTotalQuizzesField
        }
      });

      console.log('✅ Schema analysis complete');
      return true;

    } catch (error) {
      this.analysis.findings.push({
        test: 'Schema File Access',
        passed: false,
        details: { error: error.message }
      });
      return false;
    }
  }

  async checkQuizIntegration() {
    console.log('🔍 Checking Quiz to Leaderboard Integration...');
    
    try {
      // Check if quiz completion updates user stats
      const quizPath = '/root/repo/convex/quiz.ts';
      let hasQuizStatsUpdate = false;
      
      try {
        const quizContent = await fs.readFile(quizPath, 'utf8');
        hasQuizStatsUpdate = quizContent.includes('updateUserStats') || quizContent.includes('points');
      } catch (error) {
        // Quiz file might not exist or be in different location
        console.log('Quiz file not found, checking auth.ts for updateUserStats');
      }

      // Check auth.ts for updateUserStats function
      const authPath = '/root/repo/convex/auth.ts';
      const authContent = await fs.readFile(authPath, 'utf8');
      const hasUpdateFunction = authContent.includes('export const updateUserStats');
      const hasPointsCalculation = authContent.includes('pointsEarned') && authContent.includes('newPoints');
      
      this.analysis.findings.push({
        test: 'Quiz to Leaderboard Integration',
        passed: hasUpdateFunction && hasPointsCalculation,
        details: {
          updateFunction: hasUpdateFunction,
          pointsCalculation: hasPointsCalculation,
          quizStatsUpdate: hasQuizStatsUpdate
        }
      });

      console.log('✅ Quiz integration analysis complete');
      return true;

    } catch (error) {
      this.analysis.findings.push({
        test: 'Quiz Integration Analysis',
        passed: false,
        details: { error: error.message }
      });
      return false;
    }
  }

  generateRecommendations() {
    console.log('📝 Generating Recommendations...');
    
    const passedTests = this.analysis.findings.filter(f => f.passed).length;
    const totalTests = this.analysis.findings.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    if (successRate >= 90) {
      this.analysis.status = 'EXCELLENT';
      this.analysis.recommendations.push({
        priority: 'HIGH',
        action: 'Ready for Testing',
        description: 'Leaderboard implementation appears complete with real data integration. Ready for live testing with development server.'
      });
    } else if (successRate >= 70) {
      this.analysis.status = 'GOOD';
      this.analysis.recommendations.push({
        priority: 'MEDIUM',
        action: 'Minor Improvements',
        description: 'Leaderboard is mostly complete but could benefit from minor enhancements based on failed tests.'
      });
    } else {
      this.analysis.status = 'NEEDS_WORK';
      this.analysis.recommendations.push({
        priority: 'HIGH',
        action: 'Major Updates Required',
        description: 'Leaderboard implementation needs significant work to properly integrate with real data.'
      });
    }

    // Specific recommendations based on failed tests
    this.analysis.findings.forEach(finding => {
      if (!finding.passed) {
        switch (finding.test) {
          case 'Convex Backend Integration':
            this.analysis.recommendations.push({
              priority: 'HIGH',
              action: 'Fix Backend Integration',
              description: 'Ensure proper Convex imports and API calls in Leaderboard component.'
            });
            break;
          case 'Real Data Processing':
            this.analysis.recommendations.push({
              priority: 'HIGH',
              action: 'Implement Data Processing',
              description: 'Add proper mapping and processing of real user data from backend.'
            });
            break;
          case 'User Stats Update Function':
            this.analysis.recommendations.push({
              priority: 'HIGH',
              action: 'Create Stats Update Function',
              description: 'Implement updateUserStats function to update leaderboard when users complete quizzes.'
            });
            break;
        }
      }
    });

    console.log(`✅ Analysis complete - Status: ${this.analysis.status} (${successRate.toFixed(1)}% success rate)`);
  }

  async generateReport() {
    const reportPath = '/root/repo/leaderboard-analysis-report.json';
    const htmlReportPath = '/root/repo/leaderboard-analysis-report.html';

    // Save JSON report
    await fs.writeFile(reportPath, JSON.stringify(this.analysis, null, 2));

    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Leaderboard Real Data Integration Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; }
        .status { padding: 15px; margin: 20px 0; border-radius: 8px; }
        .excellent { background: #dcfce7; border-left: 4px solid #16a34a; }
        .good { background: #fef3c7; border-left: 4px solid #d97706; }
        .needs-work { background: #fee2e2; border-left: 4px solid #dc2626; }
        .finding { margin: 15px 0; padding: 15px; border-radius: 5px; background: #f8fafc; }
        .passed { border-left: 4px solid #16a34a; }
        .failed { border-left: 4px solid #dc2626; }
        .code { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .recommendation { margin: 10px 0; padding: 12px; border-radius: 5px; }
        .high { background: #fee2e2; border-left: 4px solid #dc2626; }
        .medium { background: #fef3c7; border-left: 4px solid #d97706; }
        .low { background: #e0f2fe; border-left: 4px solid #0284c7; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Leaderboard Real Data Integration Analysis</h1>
        <p>Comprehensive code analysis for real user data integration</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div class="status ${this.analysis.status.toLowerCase().replace('_', '-')}">
        <h2>📊 Overall Status: ${this.analysis.status}</h2>
        <p><strong>Tests Passed:</strong> ${this.analysis.findings.filter(f => f.passed).length}/${this.analysis.findings.length}</p>
        <p><strong>Success Rate:</strong> ${((this.analysis.findings.filter(f => f.passed).length / this.analysis.findings.length) * 100).toFixed(1)}%</p>
    </div>

    <div class="findings">
        <h2>🔍 Detailed Findings</h2>
        ${this.analysis.findings.map(finding => `
          <div class="finding ${finding.passed ? 'passed' : 'failed'}">
            <h3>${finding.passed ? '✅' : '❌'} ${finding.test}</h3>
            <pre>${JSON.stringify(finding.details, null, 2)}</pre>
          </div>
        `).join('')}
    </div>

    ${this.analysis.codeSnippets.length > 0 ? `
    <div class="code-snippets">
        <h2>💻 Relevant Code Snippets</h2>
        ${this.analysis.codeSnippets.map(snippet => `
          <div>
            <h4>${snippet.type}</h4>
            <pre class="code">${snippet.code}</pre>
          </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="recommendations">
        <h2>🎯 Recommendations</h2>
        ${this.analysis.recommendations.map(rec => `
          <div class="recommendation ${rec.priority.toLowerCase()}">
            <h4>${rec.priority} PRIORITY: ${rec.action}</h4>
            <p>${rec.description}</p>
          </div>
        `).join('')}
    </div>
</body>
</html>`;

    await fs.writeFile(htmlReportPath, htmlReport);

    console.log(`\n📄 Reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);

    return this.analysis;
  }

  async runAnalysis() {
    console.log('🔍 Starting Leaderboard Real Data Integration Analysis...');
    console.log('='.repeat(70));

    await this.analyzeLeaderboardComponent();
    await this.analyzeBackendFunction();
    await this.analyzeSchema();
    await this.checkQuizIntegration();
    
    this.generateRecommendations();
    const report = await this.generateReport();

    console.log('\n🎉 Analysis Complete!');
    console.log('='.repeat(70));
    console.log(`📊 Status: ${report.status}`);
    console.log(`✅ Tests Passed: ${report.findings.filter(f => f.passed).length}/${report.findings.length}`);
    
    if (report.status === 'EXCELLENT') {
      console.log('🏆 EXCELLENT - Leaderboard is ready for real data testing!');
    } else if (report.status === 'GOOD') {
      console.log('👍 GOOD - Minor improvements recommended');
    } else {
      console.log('⚠️  NEEDS WORK - Major improvements required');
    }

    return report;
  }
}

// Run the analysis
const analyzer = new LeaderboardAnalyzer();
analyzer.runAnalysis().catch(console.error);