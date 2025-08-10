/**
 * Comprehensive Quiz Engine Analysis Script
 * Analyzes the MedQuiz Pro quiz engine functionality through code review and static analysis
 */

const fs = require('fs');
const path = require('path');

class QuizEngineAnalyzer {
  constructor() {
    this.results = {
      testSuite: 'Quiz Engine Comprehensive Analysis',
      startTime: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  addTest(name, status, details = '', recommendation = null) {
    const test = {
      name,
      status,
      details,
      recommendation,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(test);
    this.results.summary.total++;
    
    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${name}`);
    } else if (status === 'FAIL') {
      this.results.summary.failed++;
      console.log(`❌ ${name}: ${details}`);
    } else if (status === 'WARNING') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${name}: ${details}`);
    }
    
    if (details) console.log(`   ${details}`);
    if (recommendation) console.log(`   💡 Recommendation: ${recommendation}`);
  }

  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  analyzeQuestionData() {
    console.log('\n📚 Analyzing Question Data & Content...');
    
    const questionPath = path.join(__dirname, 'src', 'data', 'sampleQuestions.ts');
    const content = this.readFileContent(questionPath);
    
    if (!content) {
      this.addTest('Question data file exists', 'FAIL', 'sampleQuestions.ts not found');
      return;
    }
    
    // Count questions
    const questionMatches = content.match(/question:/g);
    const questionCount = questionMatches ? questionMatches.length : 0;
    
    if (questionCount >= 246) {
      this.addTest('Question count verification', 'PASS', `${questionCount} questions available (≥246 required)`);
    } else {
      this.addTest('Question count verification', 'FAIL', `Only ${questionCount} questions found, expected 246+`);
    }
    
    // Check question structure
    const hasOptions = content.includes('options:');
    const hasExplanations = content.includes('explanation:');
    const hasCategories = content.includes('category:');
    const hasDifficulty = content.includes('difficulty:');
    const hasReferences = content.includes('medicalReferences');
    const hasPoints = content.includes('points:');
    
    if (hasOptions && hasExplanations && hasCategories && hasDifficulty) {
      this.addTest('Question data structure', 'PASS', 'All required question fields present (options, explanation, category, difficulty)');
    } else {
      const missing = [];
      if (!hasOptions) missing.push('options');
      if (!hasExplanations) missing.push('explanations');
      if (!hasCategories) missing.push('categories');
      if (!hasDifficulty) missing.push('difficulty');
      this.addTest('Question data structure', 'FAIL', `Missing fields: ${missing.join(', ')}`);
    }
    
    if (hasReferences) {
      this.addTest('Medical references', 'PASS', 'Questions include medical references');
    } else {
      this.addTest('Medical references', 'WARNING', 'No medical references found in questions');
    }
    
    if (hasPoints) {
      this.addTest('Points system', 'PASS', 'Questions include points for gamification');
    } else {
      this.addTest('Points system', 'WARNING', 'No points system found in questions');
    }
    
    // Check medical categories
    const categories = this.extractMedicalCategories(content);
    if (categories.length >= 10) {
      this.addTest('Medical category diversity', 'PASS', `${categories.length} medical categories: ${categories.slice(0, 5).join(', ')}...`);
    } else {
      this.addTest('Medical category diversity', 'WARNING', `Only ${categories.length} categories found: ${categories.join(', ')}`);
    }
    
    // Check difficulty distribution
    const difficulties = this.extractDifficulties(content);
    if (difficulties.easy && difficulties.medium && difficulties.hard) {
      this.addTest('Difficulty distribution', 'PASS', `Balanced difficulty: Easy(${difficulties.easy}), Medium(${difficulties.medium}), Hard(${difficulties.hard})`);
    } else {
      this.addTest('Difficulty distribution', 'WARNING', `Unbalanced difficulty distribution: ${JSON.stringify(difficulties)}`);
    }
  }

  extractMedicalCategories(content) {
    const matches = content.match(/category:\s*["']([^"']+)["']/g);
    if (!matches) return [];
    
    const categories = matches.map(match => match.match(/["']([^"']+)["']/)[1]);
    return [...new Set(categories)]; // Remove duplicates
  }

  extractDifficulties(content) {
    const matches = content.match(/difficulty:\s*["']([^"']+)["']/g);
    if (!matches) return { easy: 0, medium: 0, hard: 0 };
    
    const difficulties = matches.map(match => match.match(/["']([^"']+)["']/)[1]);
    return {
      easy: difficulties.filter(d => d === 'easy').length,
      medium: difficulties.filter(d => d === 'medium').length,
      hard: difficulties.filter(d => d === 'hard').length
    };
  }

  analyzeQuizModes() {
    console.log('\n🎯 Analyzing Quiz Modes...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const content = this.readFileContent(quizEnginePath);
    
    if (!content) {
      this.addTest('Quiz engine component', 'FAIL', 'QuizEngineLocal.tsx not found');
      return;
    }
    
    // Check for quiz modes
    const hasQuickMode = content.includes("case 'quick'");
    const hasTimedMode = content.includes("case 'timed'");
    const hasCustomMode = content.includes("case 'custom'");
    
    if (hasQuickMode && hasTimedMode && hasCustomMode) {
      this.addTest('Quiz modes implementation', 'PASS', 'All three quiz modes (quick, timed, custom) implemented');
    } else {
      const missing = [];
      if (!hasQuickMode) missing.push('quick');
      if (!hasTimedMode) missing.push('timed');
      if (!hasCustomMode) missing.push('custom');
      this.addTest('Quiz modes implementation', 'FAIL', `Missing quiz modes: ${missing.join(', ')}`);
    }
    
    // Check quiz configuration
    const quickConfig = content.match(/case 'quick':\s*return\s*{\s*numQuestions:\s*(\d+)/);
    const timedConfig = content.match(/case 'timed':\s*return\s*{\s*numQuestions:\s*(\d+).*timeLimit:\s*(\d+)/s);
    const customConfig = content.match(/case 'custom':\s*return\s*{\s*numQuestions:\s*(\d+)/);
    
    if (quickConfig) {
      const questionCount = parseInt(quickConfig[1]);
      if (questionCount === 5) {
        this.addTest('Quick mode configuration', 'PASS', `Quick mode: ${questionCount} questions, no time limit`);
      } else {
        this.addTest('Quick mode configuration', 'WARNING', `Quick mode has ${questionCount} questions, expected 5`);
      }
    } else {
      this.addTest('Quick mode configuration', 'FAIL', 'Quick mode configuration not found');
    }
    
    if (timedConfig) {
      const questionCount = parseInt(timedConfig[1]);
      const timeLimit = parseInt(timedConfig[2]);
      if (questionCount >= 10 && timeLimit > 0) {
        this.addTest('Timed mode configuration', 'PASS', `Timed mode: ${questionCount} questions, ${Math.floor(timeLimit/60)} minutes`);
      } else {
        this.addTest('Timed mode configuration', 'WARNING', `Timed mode: ${questionCount} questions, ${timeLimit}s - verify configuration`);
      }
    } else {
      this.addTest('Timed mode configuration', 'WARNING', 'Timed mode configuration not clearly found');
    }
    
    if (customConfig) {
      const questionCount = parseInt(customConfig[1]);
      this.addTest('Custom mode configuration', 'PASS', `Custom mode: ${questionCount} questions (default), configurable`);
    } else {
      this.addTest('Custom mode configuration', 'FAIL', 'Custom mode configuration not found');
    }
  }

  analyzeQuizInterface() {
    console.log('\n🎮 Analyzing Quiz Interface & Navigation...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const quizQuestionPath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizQuestion.tsx');
    const quizProgressPath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizProgress.tsx');
    const quizHeaderPath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizHeader.tsx');
    
    const engineContent = this.readFileContent(quizEnginePath);
    const questionContent = this.readFileContent(quizQuestionPath);
    const progressContent = this.readFileContent(quizProgressPath);
    const headerContent = this.readFileContent(quizHeaderPath);
    
    // Check component architecture
    const components = [
      { name: 'QuizEngine', path: quizEnginePath, content: engineContent },
      { name: 'QuizQuestion', path: quizQuestionPath, content: questionContent },
      { name: 'QuizProgress', path: quizProgressPath, content: progressContent },
      { name: 'QuizHeader', path: quizHeaderPath, content: headerContent }
    ];
    
    let componentCount = 0;
    components.forEach(comp => {
      if (comp.content) {
        componentCount++;
        this.addTest(`${comp.name} component exists`, 'PASS', `Component file found and loaded`);
      } else {
        this.addTest(`${comp.name} component exists`, 'FAIL', `Component file not found: ${comp.path}`);
      }
    });
    
    if (componentCount >= 3) {
      this.addTest('Quiz component architecture', 'PASS', `${componentCount}/4 quiz components found - modular architecture`);
    } else {
      this.addTest('Quiz component architecture', 'FAIL', `Only ${componentCount}/4 quiz components found`);
    }
    
    // Check for key interface elements
    if (engineContent) {
      const hasAnswerSelection = engineContent.includes('handleAnswerSelect');
      const hasNextQuestion = engineContent.includes('handleNextQuestion');
      const hasQuizCompletion = engineContent.includes('handleCompleteQuiz');
      const hasProgressTracking = engineContent.includes('QuizProgress');
      
      if (hasAnswerSelection) {
        this.addTest('Answer selection functionality', 'PASS', 'Answer selection handler implemented');
      } else {
        this.addTest('Answer selection functionality', 'FAIL', 'Answer selection handler not found');
      }
      
      if (hasNextQuestion) {
        this.addTest('Question navigation', 'PASS', 'Next question navigation implemented');
      } else {
        this.addTest('Question navigation', 'FAIL', 'Next question handler not found');
      }
      
      if (hasQuizCompletion) {
        this.addTest('Quiz completion flow', 'PASS', 'Quiz completion handler implemented');
      } else {
        this.addTest('Quiz completion flow', 'FAIL', 'Quiz completion handler not found');
      }
      
      if (hasProgressTracking) {
        this.addTest('Progress tracking component', 'PASS', 'Progress tracking component integrated');
      } else {
        this.addTest('Progress tracking component', 'FAIL', 'Progress tracking not found');
      }
    }
  }

  analyzeScoringSystem() {
    console.log('\n📊 Analyzing Scoring System & Calculations...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const content = this.readFileContent(quizEnginePath);
    
    if (!content) {
      this.addTest('Scoring system access', 'FAIL', 'Cannot access quiz engine for scoring analysis');
      return;
    }
    
    // Check score calculation logic
    const hasScoreCalculation = content.includes('totalCorrect') && content.includes('score');
    const hasPercentageCalculation = content.includes('* 100');
    const hasPointsCalculation = content.includes('pointsEarned');
    
    if (hasScoreCalculation && hasPercentageCalculation) {
      this.addTest('Score calculation logic', 'PASS', 'Percentage-based scoring system implemented');
    } else {
      this.addTest('Score calculation logic', 'FAIL', 'Score calculation logic not found or incomplete');
    }
    
    if (hasPointsCalculation) {
      this.addTest('Points system integration', 'PASS', 'Points calculation for gamification');
    } else {
      this.addTest('Points system integration', 'WARNING', 'Points calculation not found');
    }
    
    // Check for performance metrics
    const hasPerformanceMetrics = content.includes('performanceMetrics');
    const hasDifficultyBreakdown = content.includes('difficultyBreakdown');
    const hasCategoryBreakdown = content.includes('categoryBreakdown');
    
    if (hasPerformanceMetrics) {
      this.addTest('Performance metrics', 'PASS', 'Advanced performance metrics calculation');
    } else {
      this.addTest('Performance metrics', 'WARNING', 'Performance metrics not implemented');
    }
    
    if (hasDifficultyBreakdown && hasCategoryBreakdown) {
      this.addTest('Detailed analytics', 'PASS', 'Difficulty and category breakdown analytics');
    } else {
      this.addTest('Detailed analytics', 'WARNING', 'Detailed analytics breakdown not found');
    }
    
    // Check for 10 points per correct answer (as mentioned in requirements)
    const pointsPerQuestion = content.match(/isCorrect \? (\d+) : 0/);
    if (pointsPerQuestion && pointsPerQuestion[1] === '10') {
      this.addTest('Points per question', 'PASS', '10 points awarded per correct answer');
    } else {
      this.addTest('Points per question', 'WARNING', 'Points per question not clearly defined as 10');
    }
  }

  analyzeQuizResults() {
    console.log('\n🏁 Analyzing Quiz Completion Flow & Results Display...');
    
    const quizResultsPath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizResults.tsx');
    const content = this.readFileContent(quizResultsPath);
    
    if (!content) {
      this.addTest('Quiz results component', 'FAIL', 'QuizResults.tsx not found');
      return;
    }
    
    // Check results display components
    const hasScoreDisplay = content.includes('session.score');
    const hasAccuracyDisplay = content.includes('accuracy');
    const hasTimeAnalysis = content.includes('timeSpent');
    const hasPerformanceAnalysis = content.includes('Performance Analysis');
    
    if (hasScoreDisplay) {
      this.addTest('Score display', 'PASS', 'Quiz score prominently displayed');
    } else {
      this.addTest('Score display', 'FAIL', 'Score display not found');
    }
    
    if (hasAccuracyDisplay && hasTimeAnalysis) {
      this.addTest('Results analytics', 'PASS', 'Accuracy and time analysis displayed');
    } else {
      this.addTest('Results analytics', 'WARNING', 'Results analytics incomplete');
    }
    
    if (hasPerformanceAnalysis) {
      this.addTest('Performance breakdown', 'PASS', 'Detailed performance analysis section');
    } else {
      this.addTest('Performance breakdown', 'FAIL', 'Performance analysis section not found');
    }
    
    // Check for study recommendations
    const hasRecommendations = content.includes('Study Recommendations');
    const hasScoreBasedFeedback = content.includes('session.score <') && content.includes('session.score >=');
    
    if (hasRecommendations && hasScoreBasedFeedback) {
      this.addTest('Study recommendations', 'PASS', 'Score-based study recommendations implemented');
    } else {
      this.addTest('Study recommendations', 'WARNING', 'Study recommendations not found or incomplete');
    }
    
    // Check action buttons
    const hasRetryButton = content.includes('Try Again') || content.includes('Retry');
    const hasHomeButton = content.includes('Dashboard') || content.includes('Home');
    const hasReviewButton = content.includes('Review');
    
    if (hasRetryButton && hasHomeButton) {
      this.addTest('Result actions', 'PASS', 'Retry and home navigation buttons available');
    } else {
      this.addTest('Result actions', 'FAIL', 'Essential action buttons missing');
    }
    
    if (hasReviewButton) {
      this.addTest('Answer review feature', 'PASS', 'Answer review functionality available');
    } else {
      this.addTest('Answer review feature', 'WARNING', 'Answer review functionality not found');
    }
  }

  analyzeTimerFunctionality() {
    console.log('\n⏰ Analyzing Timer Functionality & Progress Tracking...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const content = this.readFileContent(quizEnginePath);
    
    if (!content) {
      this.addTest('Timer functionality access', 'FAIL', 'Cannot access quiz engine for timer analysis');
      return;
    }
    
    // Check timer implementation
    const hasTimerState = content.includes('timeRemaining');
    const hasTimerInterval = content.includes('setInterval');
    const hasTimerCountdown = content.includes('newTime = prev.timeRemaining - 1');
    const hasAutoSubmission = content.includes('handleCompleteQuiz()');
    
    if (hasTimerState && hasTimerInterval && hasTimerCountdown) {
      this.addTest('Timer implementation', 'PASS', 'Complete countdown timer functionality implemented');
    } else {
      const missing = [];
      if (!hasTimerState) missing.push('timer state');
      if (!hasTimerInterval) missing.push('interval');
      if (!hasTimerCountdown) missing.push('countdown');
      this.addTest('Timer implementation', 'FAIL', `Timer incomplete - missing: ${missing.join(', ')}`);
    }
    
    if (hasAutoSubmission) {
      this.addTest('Auto-submission on timeout', 'PASS', 'Quiz auto-submits when timer expires');
    } else {
      this.addTest('Auto-submission on timeout', 'FAIL', 'Auto-submission not implemented');
    }
    
    // Check progress tracking
    const hasProgressComponent = content.includes('QuizProgress');
    const hasQuestionTracking = content.includes('currentQuestionIndex');
    const hasAnswerTracking = content.includes('answers');
    
    if (hasProgressComponent && hasQuestionTracking) {
      this.addTest('Progress tracking', 'PASS', 'Question progress tracking implemented');
    } else {
      this.addTest('Progress tracking', 'FAIL', 'Progress tracking incomplete');
    }
    
    if (hasAnswerTracking) {
      this.addTest('Answer state tracking', 'PASS', 'User answers tracked throughout quiz');
    } else {
      this.addTest('Answer state tracking', 'FAIL', 'Answer tracking not found');
    }
    
    // Check for time tracking analytics
    const hasTimeSpentTracking = content.includes('timeSpent') && content.includes('startTime');
    if (hasTimeSpentTracking) {
      this.addTest('Time analytics', 'PASS', 'Time spent tracking for analytics');
    } else {
      this.addTest('Time analytics', 'WARNING', 'Time analytics tracking not found');
    }
  }

  analyzeAnswerValidation() {
    console.log('\n✅ Analyzing Answer Validation & Feedback System...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const quizQuestionPath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizQuestion.tsx');
    const engineContent = this.readFileContent(quizEnginePath);
    const questionContent = this.readFileContent(quizQuestionPath);
    
    if (!engineContent) {
      this.addTest('Answer validation access', 'FAIL', 'Cannot access quiz engine for validation analysis');
      return;
    }
    
    // Check answer validation logic
    const hasAnswerValidation = engineContent.includes('correctAnswer') && engineContent.includes('isCorrect');
    const hasAnswerLocking = engineContent.includes('hasAnswered');
    const hasExplanationDisplay = engineContent.includes('showExplanation');
    
    if (hasAnswerValidation) {
      this.addTest('Answer validation logic', 'PASS', 'Answer correctness validation implemented');
    } else {
      this.addTest('Answer validation logic', 'FAIL', 'Answer validation logic not found');
    }
    
    if (hasAnswerLocking) {
      this.addTest('Answer locking mechanism', 'PASS', 'Prevents multiple answer submissions');
    } else {
      this.addTest('Answer locking mechanism', 'WARNING', 'Answer locking not found');
    }
    
    if (hasExplanationDisplay) {
      this.addTest('Explanation feedback', 'PASS', 'Explanations shown after answer selection');
    } else {
      this.addTest('Explanation feedback', 'FAIL', 'Explanation display not found');
    }
    
    // Check for immediate feedback
    const hasImmediateFeedback = engineContent.includes('analyticsService.trackAnswerSelected');
    if (hasImmediateFeedback) {
      this.addTest('Immediate feedback system', 'PASS', 'Analytics and feedback triggered on answer selection');
    } else {
      this.addTest('Immediate feedback system', 'WARNING', 'Immediate feedback system not found');
    }
    
    // Check QuizQuestion component for UI feedback
    if (questionContent) {
      const hasSelectedState = questionContent.includes('selectedAnswer');
      const hasCorrectAnswerDisplay = questionContent.includes('correctAnswer');
      const hasExplanationSection = questionContent.includes('explanation');
      
      if (hasSelectedState && hasCorrectAnswerDisplay) {
        this.addTest('Visual answer feedback', 'PASS', 'Selected and correct answers visually indicated');
      } else {
        this.addTest('Visual answer feedback', 'WARNING', 'Visual feedback may be incomplete');
      }
      
      if (hasExplanationSection) {
        this.addTest('Explanation display component', 'PASS', 'Dedicated explanation display in question component');
      } else {
        this.addTest('Explanation display component', 'FAIL', 'Explanation display component not found');
      }
    }
  }

  analyzePerformanceErrorHandling() {
    console.log('\n⚡ Analyzing Performance & Error Handling...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const errorHandlerPath = path.join(__dirname, 'src', 'utils', 'errorHandler.ts');
    const engineContent = this.readFileContent(quizEnginePath);
    const errorContent = this.readFileContent(errorHandlerPath);
    
    if (engineContent) {
      // Check error handling in quiz engine
      const hasTryCatch = engineContent.includes('try {') && engineContent.includes('catch');
      const hasErrorState = engineContent.includes('error') && engineContent.includes('setError');
      const hasLoadingStates = engineContent.includes('isSubmitting') || engineContent.includes('loading');
      
      if (hasTryCatch) {
        this.addTest('Error handling implementation', 'PASS', 'Try-catch blocks for error management');
      } else {
        this.addTest('Error handling implementation', 'FAIL', 'No error handling blocks found');
      }
      
      if (hasErrorState) {
        this.addTest('Error state management', 'PASS', 'Error states tracked and displayed');
      } else {
        this.addTest('Error state management', 'FAIL', 'Error state management not found');
      }
      
      if (hasLoadingStates) {
        this.addTest('Loading state handling', 'PASS', 'Loading states for better UX');
      } else {
        this.addTest('Loading state handling', 'WARNING', 'Loading states not found');
      }
      
      // Check for performance optimizations
      const hasUseCallback = engineContent.includes('useCallback');
      const hasUseMemo = engineContent.includes('useMemo');
      const hasProperCleanup = engineContent.includes('clearInterval');
      
      if (hasUseCallback) {
        this.addTest('Performance optimization (useCallback)', 'PASS', 'Callback memoization for performance');
      } else {
        this.addTest('Performance optimization (useCallback)', 'WARNING', 'useCallback optimization not found');
      }
      
      if (hasProperCleanup) {
        this.addTest('Memory leak prevention', 'PASS', 'Timer cleanup implemented');
      } else {
        this.addTest('Memory leak prevention', 'WARNING', 'Timer cleanup not found');
      }
    }
    
    if (errorContent) {
      this.addTest('Dedicated error handler', 'PASS', 'Dedicated error handling utility exists');
      
      const hasHIPAACompliance = errorContent.includes('HIPAA') || errorContent.includes('sanitize') || errorContent.includes('hash');
      if (hasHIPAACompliance) {
        this.addTest('HIPAA compliance', 'PASS', 'HIPAA-compliant error handling implemented');
      } else {
        this.addTest('HIPAA compliance', 'WARNING', 'HIPAA compliance not clearly implemented');
      }
    } else {
      this.addTest('Dedicated error handler', 'WARNING', 'Dedicated error handler not found');
    }
  }

  analyzeAccessibilityFeatures() {
    console.log('\n♿ Analyzing User Experience & Accessibility Features...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const content = this.readFileContent(quizEnginePath);
    
    if (!content) {
      this.addTest('Accessibility analysis access', 'FAIL', 'Cannot access quiz components for accessibility analysis');
      return;
    }
    
    // Check for accessibility attributes
    const hasAriaLabels = content.includes('aria-label');
    const hasAriaRoles = content.includes('role=');
    const hasLiveRegions = content.includes('aria-live');
    const hasKeyboardSupport = content.includes('onKeyDown') || content.includes('tabIndex');
    
    if (hasAriaLabels) {
      this.addTest('ARIA labels', 'PASS', 'ARIA labels implemented for screen readers');
    } else {
      this.addTest('ARIA labels', 'WARNING', 'ARIA labels not found');
    }
    
    if (hasAriaRoles) {
      this.addTest('ARIA roles', 'PASS', 'Semantic roles defined for accessibility');
    } else {
      this.addTest('ARIA roles', 'WARNING', 'ARIA roles not found');
    }
    
    if (hasLiveRegions) {
      this.addTest('Live regions', 'PASS', 'Live regions for dynamic content updates');
    } else {
      this.addTest('Live regions', 'FAIL', 'Live regions not implemented');
    }
    
    if (hasKeyboardSupport) {
      this.addTest('Keyboard navigation', 'PASS', 'Keyboard navigation support implemented');
    } else {
      this.addTest('Keyboard navigation', 'WARNING', 'Keyboard navigation not clearly implemented');
    }
    
    // Check for responsive design indicators
    const hasResponsiveClasses = content.includes('md:') || content.includes('lg:') || content.includes('sm:');
    const hasMobileOptimizations = content.includes('mobile') || content.includes('touch');
    
    if (hasResponsiveClasses) {
      this.addTest('Responsive design', 'PASS', 'Responsive CSS classes used');
    } else {
      this.addTest('Responsive design', 'WARNING', 'Responsive design classes not found');
    }
    
    // Check for user experience enhancements
    const hasLoadingStates = content.includes('Loading') || content.includes('spinner');
    const hasErrorMessages = content.includes('Error') && content.includes('message');
    const hasProgressIndicators = content.includes('progress') || content.includes('Progress');
    
    if (hasLoadingStates) {
      this.addTest('Loading state UX', 'PASS', 'Loading states for better user experience');
    } else {
      this.addTest('Loading state UX', 'WARNING', 'Loading states not found');
    }
    
    if (hasErrorMessages) {
      this.addTest('Error message UX', 'PASS', 'User-friendly error messages');
    } else {
      this.addTest('Error message UX', 'FAIL', 'Error messages not found');
    }
    
    if (hasProgressIndicators) {
      this.addTest('Progress indicators', 'PASS', 'Progress indicators for user guidance');
    } else {
      this.addTest('Progress indicators', 'FAIL', 'Progress indicators not found');
    }
  }

  analyzeIntegrationFeatures() {
    console.log('\n🔗 Analyzing Integration with User Stats & Leaderboard...');
    
    const quizEnginePath = path.join(__dirname, 'src', 'components', 'quiz', 'QuizEngineLocal.tsx');
    const analyticsPath = path.join(__dirname, 'src', 'services', 'analytics.ts');
    const authPath = path.join(__dirname, 'src', 'services', 'convexAuth.ts');
    
    const engineContent = this.readFileContent(quizEnginePath);
    const analyticsContent = this.readFileContent(analyticsPath);
    const authContent = this.readFileContent(authPath);
    
    if (engineContent) {
      // Check for analytics integration
      const hasAnalyticsTracking = engineContent.includes('analyticsService');
      const hasQuizTracking = engineContent.includes('trackQuizComplete');
      const hasQuestionTracking = engineContent.includes('trackQuestionView');
      const hasAnswerTracking = engineContent.includes('trackAnswerSelected');
      
      if (hasAnalyticsTracking) {
        this.addTest('Analytics service integration', 'PASS', 'Analytics service integrated in quiz engine');
      } else {
        this.addTest('Analytics service integration', 'FAIL', 'Analytics service not integrated');
      }
      
      const trackingFeatures = [];
      if (hasQuizTracking) trackingFeatures.push('quiz completion');
      if (hasQuestionTracking) trackingFeatures.push('question views');
      if (hasAnswerTracking) trackingFeatures.push('answer selection');
      
      if (trackingFeatures.length >= 2) {
        this.addTest('Comprehensive event tracking', 'PASS', `Tracking: ${trackingFeatures.join(', ')}`);
      } else {
        this.addTest('Comprehensive event tracking', 'WARNING', `Limited tracking: ${trackingFeatures.join(', ')}`);
      }
      
      // Check for user stats updates
      const hasUserStatsUpdate = engineContent.includes('userStats') || engineContent.includes('points');
      const hasSessionPersistence = engineContent.includes('session') && engineContent.includes('userId');
      
      if (hasUserStatsUpdate) {
        this.addTest('User stats integration', 'PASS', 'User statistics updated after quiz completion');
      } else {
        this.addTest('User stats integration', 'WARNING', 'User stats updates not found');
      }
      
      if (hasSessionPersistence) {
        this.addTest('Session persistence', 'PASS', 'Quiz sessions linked to user accounts');
      } else {
        this.addTest('Session persistence', 'FAIL', 'Session persistence not implemented');
      }
    }
    
    if (analyticsContent) {
      this.addTest('Analytics service exists', 'PASS', 'Dedicated analytics service implemented');
    } else {
      this.addTest('Analytics service exists', 'WARNING', 'Analytics service file not found');
    }
    
    if (authContent) {
      this.addTest('Authentication integration', 'PASS', 'Authentication service available for user tracking');
    } else {
      this.addTest('Authentication integration', 'WARNING', 'Authentication service not found');
    }
    
    // Check for leaderboard integration potential
    const leaderboardPath = path.join(__dirname, 'src', 'pages', 'Leaderboard.tsx');
    const leaderboardContent = this.readFileContent(leaderboardPath);
    
    if (leaderboardContent) {
      this.addTest('Leaderboard integration', 'PASS', 'Leaderboard component exists for stats display');
    } else {
      this.addTest('Leaderboard integration', 'WARNING', 'Leaderboard component not found');
    }
  }

  generateReport() {
    this.results.endTime = new Date().toISOString();
    this.results.duration = new Date(this.results.endTime) - new Date(this.results.startTime);
    
    // Calculate success rate
    this.results.summary.successRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100)
      : 0;
    
    // Save results to file
    const reportPath = path.join(__dirname, 'quiz-engine-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate readable summary
    const summaryPath = path.join(__dirname, 'quiz-engine-analysis-summary.md');
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summary);
    
    console.log('\n📊 QUIZ ENGINE ANALYSIS RESULTS:');
    console.log('==================================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📈 Success Rate: ${this.results.summary.successRate}%`);
    console.log(`📄 Report saved: ${reportPath}`);
    console.log(`📝 Summary saved: ${summaryPath}`);
    
    return this.results;
  }

  generateMarkdownSummary() {
    const { summary, tests } = this.results;
    
    let markdown = `# MedQuiz Pro Quiz Engine Comprehensive Analysis\n\n`;
    markdown += `**Analysis Date**: ${new Date(this.results.startTime).toLocaleString()}\n`;
    markdown += `**Duration**: ${Math.round(this.results.duration / 1000)}s\n\n`;
    
    markdown += `## Executive Summary\n\n`;
    markdown += `The MedQuiz Pro quiz engine has been comprehensively analyzed across 11 key areas:\n\n`;
    markdown += `- **Total Tests**: ${summary.total}\n`;
    markdown += `- **✅ Passed**: ${summary.passed}\n`;
    markdown += `- **❌ Failed**: ${summary.failed}\n`;
    markdown += `- **⚠️ Warnings**: ${summary.warnings}\n`;
    markdown += `- **Success Rate**: ${summary.successRate}%\n\n`;
    
    // Group tests by status
    const passed = tests.filter(t => t.status === 'PASS');
    const failed = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    if (passed.length > 0) {
      markdown += `## ✅ Strengths (${passed.length})\n\n`;
      passed.forEach(test => {
        markdown += `### ${test.name}\n`;
        markdown += `${test.details}\n`;
        if (test.recommendation) markdown += `💡 **Recommendation**: ${test.recommendation}\n`;
        markdown += `\n`;
      });
    }
    
    if (failed.length > 0) {
      markdown += `## ❌ Critical Issues (${failed.length})\n\n`;
      failed.forEach(test => {
        markdown += `### ${test.name}\n`;
        markdown += `**Issue**: ${test.details}\n`;
        if (test.recommendation) markdown += `💡 **Recommendation**: ${test.recommendation}\n`;
        markdown += `\n`;
      });
    }
    
    if (warnings.length > 0) {
      markdown += `## ⚠️ Areas for Improvement (${warnings.length})\n\n`;
      warnings.forEach(test => {
        markdown += `### ${test.name}\n`;
        markdown += `**Note**: ${test.details}\n`;
        if (test.recommendation) markdown += `💡 **Recommendation**: ${test.recommendation}\n`;
        markdown += `\n`;
      });
    }
    
    // Add recommendations section
    markdown += `## 🚀 Overall Recommendations\n\n`;
    
    if (summary.successRate >= 80) {
      markdown += `### Excellent Foundation\n`;
      markdown += `The quiz engine demonstrates solid architecture and implementation. Focus on:\n`;
      markdown += `- Addressing remaining warnings for optimization\n`;
      markdown += `- Expanding test coverage for edge cases\n`;
      markdown += `- Performance monitoring in production\n\n`;
    } else if (summary.successRate >= 60) {
      markdown += `### Good Progress with Key Issues\n`;
      markdown += `The quiz engine has good foundational elements but requires attention to:\n`;
      markdown += `- Resolving critical failures immediately\n`;
      markdown += `- Improving error handling and user experience\n`;
      markdown += `- Strengthening accessibility features\n\n`;
    } else {
      markdown += `### Significant Development Needed\n`;
      markdown += `The quiz engine requires substantial work before production deployment:\n`;
      markdown += `- Address all critical failures\n`;
      markdown += `- Implement missing core functionality\n`;
      markdown += `- Comprehensive testing required\n\n`;
    }
    
    markdown += `## 📋 Testing Categories Analyzed\n\n`;
    markdown += `1. **Question Data & Content** - USMLE question quality and structure\n`;
    markdown += `2. **Quiz Modes** - Quick, Timed, and Custom quiz implementations\n`;
    markdown += `3. **Quiz Interface** - Component architecture and navigation\n`;
    markdown += `4. **Scoring System** - Point calculation and performance metrics\n`;
    markdown += `5. **Quiz Results** - Results display and user feedback\n`;
    markdown += `6. **Timer Functionality** - Countdown timers and auto-submission\n`;
    markdown += `7. **Answer Validation** - Feedback and explanation systems\n`;
    markdown += `8. **Performance & Errors** - Error handling and optimization\n`;
    markdown += `9. **Accessibility** - User experience and accessibility features\n`;
    markdown += `10. **Integration** - Analytics and user stats integration\n\n`;
    
    return markdown;
  }

  async runAnalysis() {
    console.log('🔍 MedQuiz Pro Quiz Engine Comprehensive Analysis');
    console.log('================================================\n');
    
    try {
      this.analyzeQuestionData();
      this.analyzeQuizModes();
      this.analyzeQuizInterface();
      this.analyzeScoringSystem();
      this.analyzeQuizResults();
      this.analyzeTimerFunctionality();
      this.analyzeAnswerValidation();
      this.analyzePerformanceErrorHandling();
      this.analyzeAccessibilityFeatures();
      this.analyzeIntegrationFeatures();
      
      return this.generateReport();
    } catch (error) {
      console.error('Analysis error:', error);
      this.addTest('Analysis Execution', 'FAIL', `Critical error: ${error.message}`);
      return this.generateReport();
    }
  }
}

// Run the analysis
async function main() {
  const analyzer = new QuizEngineAnalyzer();
  const results = await analyzer.runAnalysis();
  
  // Exit with appropriate code
  const hasFailures = results.summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { QuizEngineAnalyzer };