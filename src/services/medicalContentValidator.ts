/**
 * Enhanced Medical Content Validation System
 * Ensures USMLE question quality, medical accuracy, and educational value
 */

import type { QuestionData } from '../data/sampleQuestions';

// Medical validation result types
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  medicalAccuracyScore: number;
  educationalValueScore: number;
  usmleComplianceScore: number;
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  recommendation: string;
}

export interface ValidationSuggestion {
  code: string;
  field: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

// Medical terminology and validation data
const MEDICAL_TERMS = {
  // Common medical abbreviations that should be spelled out
  abbreviations: [
    'MI', 'CHF', 'COPD', 'HTN', 'DM', 'CAD', 'PUD', 'UTI', 'URI', 'DVT', 'PE', 'CVA', 'TIA'
  ],
  
  // Required contextual terms for specific categories
  cardiovascular: [
    'myocardial', 'cardiac', 'coronary', 'arrhythmia', 'hypertension', 'atherosclerosis',
    'ejection fraction', 'ST-elevation', 'troponin', 'creatine kinase'
  ],
  
  respiratory: [
    'pneumonia', 'asthma', 'bronchitis', 'pneumothorax', 'pulmonary', 'respiratory',
    'dyspnea', 'hypoxia', 'arterial blood gas', 'spirometry'
  ],
  
  endocrine: [
    'diabetes', 'insulin', 'glucose', 'thyroid', 'hormone', 'endocrine',
    'TSH', 'T4', 'T3', 'cortisol', 'adrenal'
  ],
  
  // Drug names that require specific handling
  medications: [
    'aspirin', 'metformin', 'lisinopril', 'atenolol', 'warfarin', 'heparin',
    'insulin', 'levothyroxine', 'prednisone', 'albuterol'
  ]
};

const USMLE_CATEGORIES = [
  'anatomy', 'pathology', 'pharmacology', 'physiology', 'microbiology',
  'immunology', 'biochemistry', 'genetics', 'behavioral sciences', 'epidemiology'
];

const MEDICAL_SUBJECTS = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics and Gynecology',
  'Psychiatry', 'Family Medicine', 'Emergency Medicine', 'Pathology',
  'Radiology', 'Anesthesiology'
];

const BODY_SYSTEMS = [
  'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Genitourinary',
  'Musculoskeletal', 'Nervous', 'Endocrine', 'Hematologic', 'Immune',
  'Reproductive', 'Integumentary'
];

// Medical reference validation
const VALID_MEDICAL_REFERENCES = [
  'First Aid USMLE Step 1',
  'First Aid USMLE Step 2 CK',
  'Pathoma',
  'Sketchy Medical',
  'UWorld',
  'Harrison\'s Principles of Internal Medicine',
  'Robbins and Cotran Pathologic Basis of Disease',
  'Katzung Basic & Clinical Pharmacology',
  'Gray\'s Anatomy',
  'Netter\'s Atlas of Human Anatomy',
  'Nelson Textbook of Pediatrics',
  'Williams Obstetrics',
  'DSM-5-TR'
];

export class MedicalContentValidator {
  /**
   * Comprehensive validation of medical question content
   */
  async validateQuestion(question: QuestionData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    // Core structure validation
    this.validateStructure(question, errors);
    
    // Medical accuracy validation
    this.validateMedicalAccuracy(question, errors, warnings);
    
    // USMLE format compliance
    this.validateUSMLECompliance(question, errors, warnings, suggestions);
    
    // Educational value assessment
    this.validateEducationalValue(question, warnings, suggestions);
    
    // Answer and explanation quality
    this.validateAnswerQuality(question, errors, warnings);
    
    // Reference and citation validation
    this.validateReferences(question, warnings, suggestions);
    
    // Calculate scores
    const medicalAccuracyScore = this.calculateMedicalAccuracyScore(question, errors, warnings);
    const educationalValueScore = this.calculateEducationalValueScore(question, warnings, suggestions);
    const usmleComplianceScore = this.calculateUSMLEComplianceScore(question, errors, warnings);
    
    const overallScore = Math.round((medicalAccuracyScore + educationalValueScore + usmleComplianceScore) / 3);
    
    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score: overallScore,
      errors,
      warnings,
      suggestions,
      medicalAccuracyScore,
      educationalValueScore,
      usmleComplianceScore
    };
  }
  
  /**
   * Validate basic question structure
   */
  private validateStructure(question: QuestionData, errors: ValidationError[]): void {
    // Required fields validation
    if (!question.question || question.question.trim().length < 50) {
      errors.push({
        code: 'INSUFFICIENT_QUESTION_LENGTH',
        field: 'question',
        message: 'Question stem must be at least 50 characters and contain sufficient clinical context',
        severity: 'critical'
      });
    }
    
    // Answer options validation
    if (!question.options || question.options.length !== 4) {
      errors.push({
        code: 'INVALID_OPTIONS_COUNT',
        field: 'options',
        message: 'Question must have exactly 4 answer options',
        severity: 'critical'
      });
    } else {
      question.options.forEach((option, index) => {
        if (!option || option.trim().length < 3) {
          errors.push({
            code: 'INSUFFICIENT_OPTION_LENGTH',
            field: `options[${index}]`,
            message: `Answer option ${index + 1} must be at least 3 characters long`,
            severity: 'major'
          });
        }
      });
    }
    
    // Correct answer validation
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      errors.push({
        code: 'INVALID_CORRECT_ANSWER',
        field: 'correctAnswer',
        message: 'Correct answer index must be valid (0-3)',
        severity: 'critical'
      });
    }
    
    // Explanation validation
    if (!question.explanation || question.explanation.trim().length < 100) {
      errors.push({
        code: 'INSUFFICIENT_EXPLANATION',
        field: 'explanation',
        message: 'Explanation must be at least 100 characters and provide educational context',
        severity: 'critical'
      });
    }
  }
  
  /**
   * Validate medical accuracy and terminology
   */
  private validateMedicalAccuracy(
    question: QuestionData, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    const content = `${question.question} ${question.explanation}`.toLowerCase();
    
    // Check for medical terminology consistency
    const categoryTerms = MEDICAL_TERMS[question.category.toLowerCase() as keyof typeof MEDICAL_TERMS];
    if (Array.isArray(categoryTerms)) {
      const relevantTermsFound = categoryTerms.filter(term => 
        content.includes(term.toLowerCase())
      );
      
      if (relevantTermsFound.length === 0) {
        warnings.push({
          code: 'MISSING_RELEVANT_TERMINOLOGY',
          field: 'question',
          message: `Question lacks category-specific medical terminology for ${question.category}`,
          recommendation: `Consider including relevant terms like: ${categoryTerms.slice(0, 3).join(', ')}`
        });
      }
    }
    
    // Check for undefined medical abbreviations
    MEDICAL_TERMS.abbreviations.forEach(abbrev => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      if (regex.test(content)) {
        warnings.push({
          code: 'UNDEFINED_ABBREVIATION',
          field: 'question',
          message: `Medical abbreviation "${abbrev}" should be defined on first use`,
          recommendation: `Use full term followed by abbreviation: "myocardial infarction (MI)"`
        });
      }
    });
    
    // Validate numerical ranges and units
    this.validateMedicalValues(question, warnings);
  }
  
  /**
   * Validate USMLE format compliance
   */
  private validateUSMLECompliance(
    question: QuestionData,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    // USMLE category validation
    if (!USMLE_CATEGORIES.includes(question.usmleCategory.toLowerCase())) {
      errors.push({
        code: 'INVALID_USMLE_CATEGORY',
        field: 'usmleCategory',
        message: `Invalid USMLE category: ${question.usmleCategory}`,
        severity: 'major'
      });
    }
    
    // Subject validation
    if (!MEDICAL_SUBJECTS.includes(question.subject)) {
      warnings.push({
        code: 'QUESTIONABLE_SUBJECT',
        field: 'subject',
        message: `Subject "${question.subject}" may not be a standard medical specialty`,
        recommendation: `Use standard subjects: ${MEDICAL_SUBJECTS.slice(0, 3).join(', ')}, etc.`
      });
    }
    
    // Body system validation
    if (!BODY_SYSTEMS.includes(question.system)) {
      warnings.push({
        code: 'QUESTIONABLE_SYSTEM',
        field: 'system',
        message: `Body system "${question.system}" may not be standard`,
        recommendation: `Use standard systems: ${BODY_SYSTEMS.slice(0, 3).join(', ')}, etc.`
      });
    }
    
    // Clinical vignette structure
    this.validateClinicalVignette(question, suggestions);
  }
  
  /**
   * Validate educational value and learning objectives
   */
  private validateEducationalValue(
    question: QuestionData,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    // Check for appropriate difficulty scaling
    const questionLength = question.question.length;
    const explanationLength = question.explanation.length;
    
    if (question.difficulty === 'easy' && questionLength > 400) {
      suggestions.push({
        code: 'DIFFICULTY_MISMATCH',
        field: 'difficulty',
        suggestion: 'Easy questions should be more concise. Consider simplifying the clinical scenario.',
        impact: 'medium'
      });
    }
    
    if (question.difficulty === 'hard' && explanationLength < 200) {
      suggestions.push({
        code: 'INSUFFICIENT_HARD_EXPLANATION',
        field: 'explanation',
        suggestion: 'Hard questions should have comprehensive explanations covering differential diagnosis and reasoning.',
        impact: 'high'
      });
    }
    
    // Tags relevance check
    if (question.tags.length < 3) {
      warnings.push({
        code: 'INSUFFICIENT_TAGS',
        field: 'tags',
        message: 'Question should have at least 3 relevant tags for proper categorization',
        recommendation: 'Add more specific medical tags related to the condition, diagnosis, or treatment'
      });
    }
    
    // Points validation based on difficulty
    const expectedPoints = this.getExpectedPoints(question.difficulty);
    if (Math.abs(question.points - expectedPoints) > 5) {
      suggestions.push({
        code: 'POINTS_DIFFICULTY_MISMATCH',
        field: 'points',
        suggestion: `Points (${question.points}) don't align with difficulty (${question.difficulty}). Expected: ${expectedPoints}`,
        impact: 'low'
      });
    }
  }
  
  /**
   * Validate answer quality and distractor effectiveness
   */
  private validateAnswerQuality(
    question: QuestionData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const correctOption = question.options[question.correctAnswer];
    const incorrectOptions = question.options.filter((_, index) => index !== question.correctAnswer);
    
    // Check for obvious correct answers
    if (correctOption.length > incorrectOptions.reduce((max, opt) => Math.max(max, opt.length), 0) * 1.5) {
      warnings.push({
        code: 'OBVIOUS_CORRECT_ANSWER',
        field: 'options',
        message: 'Correct answer is significantly longer than distractors, potentially making it obvious',
        recommendation: 'Balance the length of all answer options'
      });
    }
    
    // Check for implausible distractors
    incorrectOptions.forEach((option, index) => {
      const actualIndex = question.options.indexOf(option);
      if (option.includes('always') || option.includes('never') || option.includes('all') || option.includes('none')) {
        warnings.push({
          code: 'ABSOLUTE_DISTRACTOR',
          field: `options[${actualIndex}]`,
          message: 'Distractor contains absolute terms which are typically incorrect in medical contexts',
          recommendation: 'Use more nuanced, clinically plausible distractors'
        });
      }
    });
  }
  
  /**
   * Validate medical references and citations
   */
  private validateReferences(
    question: QuestionData,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.medicalReferences || question.medicalReferences.length === 0) {
      warnings.push({
        code: 'NO_REFERENCES',
        field: 'medicalReferences',
        message: 'Question lacks medical references for verification',
        recommendation: 'Add at least one authoritative medical reference (e.g., First Aid, Pathoma, Harrison\'s)'
      });
      return;
    }
    
    // Validate reference format
    question.medicalReferences.forEach((ref, index) => {
      const isValidReference = VALID_MEDICAL_REFERENCES.some(validRef => 
        ref.includes(validRef) || validRef.includes(ref)
      );
      
      if (!isValidReference) {
        suggestions.push({
          code: 'UNRECOGNIZED_REFERENCE',
          field: `medicalReferences[${index}]`,
          suggestion: `Reference "${ref}" is not a commonly recognized medical textbook. Consider using standard references.`,
          impact: 'low'
        });
      }
    });
  }
  
  /**
   * Validate clinical vignette structure for USMLE compliance
   */
  private validateClinicalVignette(question: QuestionData, suggestions: ValidationSuggestion[]): void {
    const questionText = question.question.toLowerCase();
    
    // Check for patient demographics
    if (!questionText.includes('year-old') && !questionText.includes('years old')) {
      suggestions.push({
        code: 'MISSING_PATIENT_AGE',
        field: 'question',
        suggestion: 'USMLE questions typically include patient age for clinical context',
        impact: 'medium'
      });
    }
    
    // Check for clinical presentation
    const clinicalTerms = ['presents with', 'complains of', 'reports', 'symptoms', 'history of'];
    const hasClinicalPresentation = clinicalTerms.some(term => questionText.includes(term));
    
    if (!hasClinicalPresentation) {
      suggestions.push({
        code: 'MISSING_CLINICAL_PRESENTATION',
        field: 'question',
        suggestion: 'Consider adding clear clinical presentation language (e.g., "presents with", "complains of")',
        impact: 'medium'
      });
    }
    
    // Check for diagnostic question stem
    const diagnosticStems = [
      'most likely diagnosis',
      'best next step',
      'most appropriate',
      'first-line treatment',
      'initial management'
    ];
    
    const hasDiagnosticStem = diagnosticStems.some(stem => questionText.includes(stem));
    
    if (!hasDiagnosticStem) {
      suggestions.push({
        code: 'UNCLEAR_QUESTION_STEM',
        field: 'question',
        suggestion: 'Use clear diagnostic question stems (e.g., "What is the most likely diagnosis?")',
        impact: 'high'
      });
    }
  }
  
  /**
   * Validate medical values and units
   */
  private validateMedicalValues(question: QuestionData, warnings: ValidationWarning[]): void {
    const content = `${question.question} ${question.explanation}`;
    
    // Common medical value patterns
    const patterns = [
      { regex: /(\d+)\s*mmHg/gi, name: 'blood pressure' },
      { regex: /(\d+)\s*mg\/dL/gi, name: 'blood chemistry' },
      { regex: /(\d+)\s*bpm/gi, name: 'heart rate' },
      { regex: /(\d+)\s*°F/gi, name: 'temperature Fahrenheit' },
      { regex: /(\d+)\s*°C/gi, name: 'temperature Celsius' }
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        matches.forEach(match => {
          const value = parseInt(match.match(/\d+/)?.[0] || '0');
          
          // Basic range validation (this could be more sophisticated)
          if (pattern.name === 'blood pressure' && (value < 60 || value > 300)) {
            warnings.push({
              code: 'QUESTIONABLE_MEDICAL_VALUE',
              field: 'question',
              message: `Blood pressure value ${value} mmHg seems outside normal clinical range`,
              recommendation: 'Verify medical values are physiologically plausible'
            });
          }
          
          if (pattern.name === 'heart rate' && (value < 30 || value > 250)) {
            warnings.push({
              code: 'QUESTIONABLE_MEDICAL_VALUE',
              field: 'question',
              message: `Heart rate ${value} bpm seems outside normal clinical range`,
              recommendation: 'Verify medical values are physiologically plausible'
            });
          }
        });
      }
    });
  }
  
  /**
   * Calculate medical accuracy score
   */
  private calculateMedicalAccuracyScore(
    question: QuestionData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;
    
    // Deduct for errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });
    
    // Deduct for warnings
    warnings.forEach(warning => {
      if (warning.code.includes('MEDICAL') || warning.code.includes('TERMINOLOGY')) {
        score -= 8;
      } else {
        score -= 3;
      }
    });
    
    // Bonus for comprehensive content
    if (question.medicalReferences && question.medicalReferences.length >= 2) {
      score += 5;
    }
    
    if (question.tags.length >= 4) {
      score += 3;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate educational value score
   */
  private calculateEducationalValueScore(
    question: QuestionData,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): number {
    let score = 100;
    
    // Deduct for educational issues
    warnings.forEach(warning => {
      if (warning.code.includes('EDUCATIONAL') || warning.code.includes('TAGS')) {
        score -= 10;
      } else {
        score -= 5;
      }
    });
    
    suggestions.forEach(suggestion => {
      switch (suggestion.impact) {
        case 'high':
          score -= 12;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 4;
          break;
      }
    });
    
    // Bonus for rich educational content
    if (question.explanation.length > 200) {
      score += 10;
    }
    
    if (question.topics.length >= 3) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate USMLE compliance score
   */
  private calculateUSMLEComplianceScore(
    question: QuestionData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;
    
    // Deduct for USMLE format errors
    errors.filter(e => e.code.includes('USMLE')).forEach(error => {
      score -= 20;
    });
    
    warnings.filter(w => w.code.includes('USMLE') || w.code.includes('SUBJECT') || w.code.includes('SYSTEM')).forEach(() => {
      score -= 10;
    });
    
    // Bonus for proper categorization
    if (USMLE_CATEGORIES.includes(question.usmleCategory.toLowerCase())) {
      score += 5;
    }
    
    if (MEDICAL_SUBJECTS.includes(question.subject)) {
      score += 3;
    }
    
    if (BODY_SYSTEMS.includes(question.system)) {
      score += 3;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Get expected points based on difficulty
   */
  private getExpectedPoints(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy':
        return 10;
      case 'medium':
        return 15;
      case 'hard':
        return 25;
      default:
        return 10;
    }
  }
  
  /**
   * Batch validate multiple questions
   */
  async validateQuestions(questions: QuestionData[]): Promise<ValidationResult[]> {
    const results = await Promise.all(
      questions.map(question => this.validateQuestion(question))
    );
    
    return results;
  }
  
  /**
   * Generate validation report summary
   */
  generateValidationReport(results: ValidationResult[]): {
    totalQuestions: number;
    validQuestions: number;
    averageScore: number;
    criticalErrors: number;
    commonIssues: string[];
    recommendations: string[];
  } {
    const totalQuestions = results.length;
    const validQuestions = results.filter(r => r.isValid).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalQuestions;
    const criticalErrors = results.reduce((sum, r) => 
      sum + r.errors.filter(e => e.severity === 'critical').length, 0
    );
    
    // Analyze common issues
    const errorCounts = new Map<string, number>();
    const warningCounts = new Map<string, number>();
    
    results.forEach(result => {
      result.errors.forEach(error => {
        errorCounts.set(error.code, (errorCounts.get(error.code) || 0) + 1);
      });
      result.warnings.forEach(warning => {
        warningCounts.set(warning.code, (warningCounts.get(warning.code) || 0) + 1);
      });
    });
    
    const commonIssues = [
      ...Array.from(errorCounts.entries()),
      ...Array.from(warningCounts.entries())
    ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code]) => code);
    
    const recommendations = [
      'Ensure all questions have comprehensive explanations (>100 characters)',
      'Include relevant medical references for verification',
      'Use proper USMLE question format with clinical vignettes',
      'Validate all medical values and terminology for accuracy',
      'Maintain balanced answer options to avoid obvious correct answers'
    ];
    
    return {
      totalQuestions,
      validQuestions,
      averageScore: Math.round(averageScore),
      criticalErrors,
      commonIssues,
      recommendations
    };
  }
}

// Export singleton instance
export const medicalContentValidator = new MedicalContentValidator();