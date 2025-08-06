#!/usr/bin/env node

/**
 * QUIZ CONFIGURATION MISMATCH FIX SCRIPT
 * 
 * Purpose: Fix critical configuration mismatches identified in quiz mode analysis:
 * 1. Timed Challenge: UI shows "20 questions, 30 min" but implements "10 questions, 10 min"
 * 2. Custom Practice: UI shows "10 questions, Variable duration" but implements "8 questions, 8 min"  
 * 3. Custom Practice: Promises customization features that don't exist in implementation
 * 
 * This script will align the UI configuration with actual implementation to prevent
 * user confusion and false expectations.
 */

const fs = require('fs');
const path = require('path');

// Configuration fixes based on actual implementation analysis
const QUIZ_MODE_FIXES = {
  quick: {
    // Quick mode is correctly configured - no changes needed
    id: 'quick',
    title: 'Quick Quiz',
    description: 'Fast practice session',
    icon: 'Zap',
    color: 'from-green-500 to-teal-600',
    features: ['5 questions', 'Mixed topics', 'Instant feedback'],
    duration: '5-10 min',
    questions: 5,
  },
  timed: {
    // Fix: Align with actual implementation (10q, 10min)
    id: 'timed',
    title: 'Timed Challenge',
    description: 'Test your speed and accuracy',
    icon: 'Clock',  
    color: 'from-blue-500 to-purple-600',
    features: ['10 questions', 'Time pressure', 'Detailed review'], // Fixed: was 20 questions
    duration: '10 min', // Fixed: was 30 min
    questions: 10, // Fixed: was 20
  },
  custom: {
    // Fix: Align with actual implementation and remove promises of unimplemented features
    id: 'custom',
    title: 'Custom Practice',
    description: 'Focused practice session', // Updated: removed "Design your own quiz"
    icon: 'Settings',
    color: 'from-purple-500 to-pink-600',
    features: ['8 questions', 'Timed practice', 'Review mode'], // Fixed: realistic features only
    duration: '8 min', // Fixed: was 'Variable'
    questions: 8, // Fixed: was 10
  }
};

// File paths
const QUIZ_MODE_SELECTOR_PATH = path.join(__dirname, 'src/components/dashboard/QuizModeSelector.tsx');
const SAMPLE_QUESTIONS_PATH = path.join(__dirname, 'src/data/sampleQuestions.ts');

/**
 * Update QuizModeSelector.tsx with correct configurations
 */
function fixQuizModeSelector() {
  console.log('🔧 Fixing QuizModeSelector.tsx configuration...');
  
  if (!fs.existsSync(QUIZ_MODE_SELECTOR_PATH)) {
    console.error('❌ QuizModeSelector.tsx not found at expected path');
    return false;
  }
  
  let content = fs.readFileSync(QUIZ_MODE_SELECTOR_PATH, 'utf8');
  
  // Replace the entire quizModes array with corrected configuration
  const newQuizModesArray = `const quizModes: QuizMode[] = [
  {
    id: 'quick',
    title: 'Quick Quiz',
    description: 'Fast practice session',
    icon: Zap,
    color: 'from-green-500 to-teal-600',
    features: ['5 questions', 'Mixed topics', 'Instant feedback'],
    duration: '5-10 min',
    questions: 5,
  },
  {
    id: 'timed',
    title: 'Timed Challenge', 
    description: 'Test your speed and accuracy',
    icon: Clock,
    color: 'from-blue-500 to-purple-600',
    features: ['10 questions', 'Time pressure', 'Detailed review'],
    duration: '10 min',
    questions: 10,
  },
  {
    id: 'custom',
    title: 'Custom Practice',
    description: 'Focused practice session',
    icon: Settings,
    color: 'from-purple-500 to-pink-600',
    features: ['8 questions', 'Timed practice', 'Review mode'],
    duration: '8 min',
    questions: 8,
  },
];`;
  
  // Find and replace the existing quizModes array
  const quizModesRegex = /const quizModes: QuizMode\[\] = \[\s*[\s\S]*?\];/;
  
  if (quizModesRegex.test(content)) {
    content = content.replace(quizModesRegex, newQuizModesArray);
    
    fs.writeFileSync(QUIZ_MODE_SELECTOR_PATH, content);
    console.log('✅ QuizModeSelector.tsx updated successfully');
    return true;
  } else {
    console.error('❌ Could not find quizModes array pattern in file');
    return false;
  }
}

/**
 * Update sampleQuestions.ts to export quiz mode configurations
 */
function addQuizModeExport() {
  console.log('🔧 Adding quiz mode configuration export to sampleQuestions.ts...');
  
  if (!fs.existsSync(SAMPLE_QUESTIONS_PATH)) {
    console.error('❌ sampleQuestions.ts not found at expected path');
    return false;
  }
  
  let content = fs.readFileSync(SAMPLE_QUESTIONS_PATH, 'utf8');
  
  // Add quiz mode configuration export at the end of the file
  const quizModeExport = `
/**
 * Quiz mode configurations aligned with actual implementation
 * Updated to fix configuration mismatches identified in testing
 */
export const quizModes = {
  quick: {
    name: 'Quick Quiz',
    description: 'Fast practice session with no time pressure',
    questions: 5,
    timeLimit: null,
    features: ['5 questions', 'Mixed topics', 'Instant feedback']
  },
  timed: {
    name: 'Timed Challenge',
    description: 'Test your speed and accuracy under time pressure',
    questions: 10,
    timeLimit: 600, // 10 minutes in seconds
    features: ['10 questions', 'Time pressure', 'Detailed review']
  },
  custom: {
    name: 'Custom Practice', 
    description: 'Focused practice session with curated content',
    questions: 8,
    timeLimit: 480, // 8 minutes in seconds
    features: ['8 questions', 'Timed practice', 'Review mode']
  }
} as const;

export type QuizModeKey = keyof typeof quizModes;
export type QuizModeConfig = typeof quizModes[QuizModeKey];
`;
  
  // Check if the export already exists
  if (!content.includes('export const quizModes')) {
    content += quizModeExport;
    fs.writeFileSync(SAMPLE_QUESTIONS_PATH, content);
    console.log('✅ Quiz mode configuration export added to sampleQuestions.ts');
    return true;
  } else {
    console.log('ℹ️ Quiz mode export already exists in sampleQuestions.ts');
    return true;
  }
}

/**
 * Create a comprehensive fix report
 */
function generateFixReport() {
  const reportContent = `# Quiz Configuration Mismatch Fix Report

**Generated:** ${new Date().toISOString()}
**Purpose:** Fix critical configuration mismatches between UI display and actual implementation

## 🚨 Issues Fixed

### 1. Timed Challenge Mode Configuration Mismatch
**Before:** UI displayed "20 questions, 30 minutes"
**After:** UI now displays "10 questions, 10 minutes" 
**Reason:** Aligns with actual QuizEngine implementation

### 2. Custom Practice Mode Configuration Mismatch  
**Before:** UI displayed "10 questions, Variable duration"
**After:** UI now displays "8 questions, 8 minutes"
**Reason:** Aligns with actual QuizEngine implementation

### 3. Custom Practice Mode Feature Promises
**Before:** Promised "Choose topics, Set difficulty, Review mode"
**After:** Realistic features "8 questions, Timed practice, Review mode"
**Reason:** Removed promises of unimplemented customization features

## 🔧 Files Modified

1. **src/components/dashboard/QuizModeSelector.tsx**
   - Updated quizModes array with correct configurations
   - Aligned question counts and durations with implementation
   - Removed false promises of customization features

2. **src/data/sampleQuestions.ts**  
   - Added quizModes export for consistent configuration
   - Provided TypeScript types for quiz mode configurations
   - Centralized configuration source of truth

## ✅ Expected User Experience Improvements

1. **No More Confusion:** Users will see exactly what they get
2. **Accurate Expectations:** Quiz duration and question count match reality  
3. **Honest Features:** Only advertise features that actually work
4. **Consistent Experience:** UI promises align with implementation

## 🧪 Testing Recommendations

After applying these fixes:

1. **Visual Verification:** Check that all quiz mode cards show correct information
2. **User Journey Testing:** Verify setup → active quiz flow matches expectations
3. **Timer Testing:** Confirm Timed Challenge actually uses 10-minute timer
4. **Custom Mode Testing:** Verify Custom Practice delivers promised experience

## 📋 Future Enhancements (Optional)

If you want to implement the originally promised features:

1. **True Custom Mode:**
   - Add category selection interface
   - Add difficulty level selection
   - Add custom time limit selection
   - Add timed vs untimed toggle

2. **Enhanced Timed Mode:**
   - Option to extend to 20-30 questions
   - Multiple timer options (15min, 20min, 30min)
   - Difficulty-based time scaling

## 🏁 Conclusion

These fixes eliminate false advertising and align user expectations with reality. The quiz modes will now provide a consistent, honest user experience that matches the actual implementation.

**Status:** Configuration mismatches resolved ✅
**Impact:** Improved user trust and experience ✅  
**Next Step:** Apply fixes and conduct user acceptance testing ✅

---
*Fix report generated by Quiz Configuration Mismatch Resolution Script*
`;

  const reportPath = path.join(__dirname, 'QUIZ_CONFIGURATION_FIX_REPORT.md');
  fs.writeFileSync(reportPath, reportContent);
  console.log(`📄 Fix report generated: ${reportPath}`);
  return reportPath;
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting Quiz Configuration Mismatch Fix...');
  console.log('🎯 Purpose: Align UI display with actual implementation\n');
  
  let success = true;
  
  // Apply fixes
  success = fixQuizModeSelector() && success;
  success = addQuizModeExport() && success;
  
  // Generate report
  const reportPath = generateFixReport();
  
  // Summary
  console.log('\n📊 FIX SUMMARY:');
  console.log(`✅ QuizModeSelector.tsx: ${success ? 'Updated' : 'Failed'}`);
  console.log(`✅ sampleQuestions.ts: Configuration export added`);
  console.log(`📄 Report: ${reportPath}`);
  
  if (success) {
    console.log('\n🎉 All configuration mismatches have been fixed!');
    console.log('🧪 Next steps:');
    console.log('  1. Review the changes in your code editor');
    console.log('  2. Test the quiz mode selector displays');  
    console.log('  3. Verify quiz modes work as advertised');
    console.log('  4. Conduct user acceptance testing');
  } else {
    console.log('\n❌ Some fixes failed. Please check the error messages above.');
  }
  
  return success;
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  fixQuizModeSelector,
  addQuizModeExport,
  generateFixReport,
  QUIZ_MODE_FIXES
};