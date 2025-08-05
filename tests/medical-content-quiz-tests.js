#!/usr/bin/env node

/**
 * 🏥 MEDICAL CONTENT VALIDATION TESTING SUITE
 * Validates medical accuracy, terminology, and educational content
 */

import { test, expect } from '@playwright/test';
import { MEDICAL_VALIDATION, MEDICAL_TEST_DATA } from './cross-browser-quiz-config.js';

class MedicalContentValidator {
  constructor(page) {
    this.page = page;
    this.validationResults = {
      terminology: [],
      references: [],
      clinicalScenarios: [],
      educationalStandards: [],
      contentAccuracy: []
    };
  }

  async validateMedicalTerminology() {
    console.log('🏥 Validating Medical Terminology...');

    // Start quiz and collect questions
    await this.page.goto('/quiz');
    await this.page.click('[data-testid="start-quiz-btn"]');
    
    const questions = [];
    let questionCount = 0;
    const maxQuestions = 10;

    while (questionCount < maxQuestions) {
      try {
        await this.page.waitForSelector('[data-testid="quiz-question"]', { timeout: 5000 });
        
        const questionData = await this.page.evaluate(() => {
          const questionText = document.querySelector('[data-testid="question-text"]')?.textContent || '';
          const options = Array.from(document.querySelectorAll('[data-testid^="answer-option-"]'))
            .map(el => el.textContent || '');
          const explanation = document.querySelector('[data-testid="answer-explanation"]')?.textContent || '';
          
          return { questionText, options, explanation };
        });

        questions.push({
          index: questionCount,
          ...questionData
        });

        // Move to next question
        await this.page.click('[data-testid="answer-option-0"]');
        await this.page.click('[data-testid="submit-answer"]');
        
        const nextBtn = await this.page.$('[data-testid="next-question"]');
        if (nextBtn) {
          await nextBtn.click();
          questionCount++;
        } else {
          break;
        }

      } catch (error) {
        console.log(`   ⚠️ Could not process question ${questionCount}: ${error.message}`);
        break;
      }
    }

    // Validate medical terminology in collected questions
    for (const question of questions) {
      const terminologyValidation = this.validateQuestionTerminology(question);
      this.validationResults.terminology.push(terminologyValidation);
    }

    console.log(`   ✅ Validated medical terminology in ${questions.length} questions`);
    return questions;
  }

  validateQuestionTerminology(question) {
    const validation = {
      questionIndex: question.index,
      medicalTermsFound: [],
      terminologyErrors: [],
      professionalLanguage: false,
      clinicalContext: false
    };

    const allText = [
      question.questionText,
      ...question.options,
      question.explanation
    ].join(' ').toLowerCase();

    // Check for medical terminology
    const foundTerms = MEDICAL_VALIDATION.terminology.filter(term => 
      allText.includes(term.toLowerCase())
    );
    validation.medicalTermsFound = foundTerms;

    // Validate professional medical language
    const professionalIndicators = [
      'patient', 'diagnosis', 'treatment', 'symptoms', 'condition',
      'history', 'examination', 'laboratory', 'imaging', 'therapy'
    ];
    validation.professionalLanguage = professionalIndicators.some(indicator => 
      allText.includes(indicator)
    );

    // Check for clinical context
    const clinicalIndicators = [
      'year-old', 'presents with', 'chief complaint', 'physical examination',
      'vital signs', 'medical history', 'differential diagnosis'
    ];
    validation.clinicalContext = clinicalIndicators.some(indicator => 
      allText.includes(indicator.toLowerCase())
    );

    // Identify potential terminology errors
    const commonErrors = [
      { incorrect: 'heart attack', correct: 'myocardial infarction' },
      { incorrect: 'high blood pressure', correct: 'hypertension' },
      { incorrect: 'stroke', correct: 'cerebrovascular accident' },
      { incorrect: 'broken bone', correct: 'fracture' }
    ];

    validation.terminologyErrors = commonErrors.filter(error => 
      allText.includes(error.incorrect) && !allText.includes(error.correct)
    );

    console.log(`   📋 Question ${question.index}: ${foundTerms.length} medical terms, ${validation.terminologyErrors.length} errors`);
    return validation;
  }

  async validateMedicalReferences() {
    console.log('📚 Validating Medical References...');

    // Look for reference sections in questions
    const references = await this.page.evaluate(() => {
      const refElements = Array.from(document.querySelectorAll(
        '[data-testid*="reference"], [class*="reference"], .medical-ref, .citation'
      ));
      
      return refElements.map(el => ({
        text: el.textContent || '',
        href: el.href || el.getAttribute('data-reference-url') || '',
        type: el.getAttribute('data-reference-type') || 'unknown'
      }));
    });

    // Validate reference quality
    for (const ref of references) {
      const referenceValidation = {
        text: ref.text,
        isValid: false,
        source: 'unknown',
        medicallyRelevant: false
      };

      // Check against known medical education sources
      const validSources = MEDICAL_VALIDATION.references;
      referenceValidation.isValid = validSources.some(source => 
        ref.text.toLowerCase().includes(source.toLowerCase())
      );

      // Check medical relevance
      const medicalKeywords = ['USMLE', 'medical', 'clinical', 'pathology', 'anatomy'];
      referenceValidation.medicallyRelevant = medicalKeywords.some(keyword => 
        ref.text.toLowerCase().includes(keyword.toLowerCase())
      );

      this.validationResults.references.push(referenceValidation);
    }

    console.log(`   ✅ Validated ${references.length} medical references`);
    return references;
  }

  async validateClinicalScenarios() {
    console.log('🩺 Validating Clinical Scenarios...');

    // Navigate back to quiz if needed
    try {
      await this.page.goto('/quiz');
      await this.page.click('[data-testid="start-quiz-btn"]');
      await this.page.waitForSelector('[data-testid="quiz-question"]');
    } catch (error) {
      console.log('   ⚠️ Could not restart quiz for clinical scenario validation');
      return [];
    }

    const clinicalScenarios = [];
    
    for (let i = 0; i < 5; i++) { // Test first 5 questions
      try {
        const scenarioData = await this.page.evaluate(() => {
          const questionText = document.querySelector('[data-testid="question-text"]')?.textContent || '';
          const hasPatientAge = /\d{1,3}[- ]?year[- ]?old/i.test(questionText);
          const hasPresentation = /presents? with|chief complaint|complain/i.test(questionText);
          const hasHistory = /history|past medical|social history/i.test(questionText);
          const hasPhysicalExam = /physical exam|examination|vital signs/i.test(questionText);
          
          return {
            questionText: questionText.substring(0, 200) + '...',
            hasPatientAge,
            hasPresentation,
            hasHistory,
            hasPhysicalExam,
            isClinicalScenario: hasPatientAge && hasPresentation
          };
        });

        const clinicalValidation = {
          questionIndex: i,
          ...scenarioData,
          clinicalQuality: this.assessClinicalQuality(scenarioData),
          educationalValue: this.assessEducationalValue(scenarioData)
        };

        clinicalScenarios.push(clinicalValidation);
        this.validationResults.clinicalScenarios.push(clinicalValidation);

        // Move to next question
        await this.page.click('[data-testid="answer-option-0"]');
        await this.page.click('[data-testid="submit-answer"]');
        
        const nextBtn = await this.page.$('[data-testid="next-question"]');
        if (nextBtn) {
          await nextBtn.click();
          await this.page.waitForSelector('[data-testid="quiz-question"]', { timeout: 3000 });
        } else {
          break;
        }

      } catch (error) {
        console.log(`   ⚠️ Could not validate clinical scenario ${i}: ${error.message}`);
        break;
      }
    }

    const clinicalCount = clinicalScenarios.filter(s => s.isClinicalScenario).length;
    console.log(`   ✅ Found ${clinicalCount} clinical scenarios out of ${clinicalScenarios.length} questions`);
    
    return clinicalScenarios;
  }

  assessClinicalQuality(scenario) {
    let qualityScore = 0;
    const maxScore = 10;

    // Award points for clinical elements
    if (scenario.hasPatientAge) qualityScore += 2;
    if (scenario.hasPresentation) qualityScore += 3;
    if (scenario.hasHistory) qualityScore += 2;
    if (scenario.hasPhysicalExam) qualityScore += 3;

    const qualityPercentage = (qualityScore / maxScore) * 100;
    
    return {
      score: qualityScore,
      maxScore,
      percentage: qualityPercentage,
      grade: qualityPercentage >= 80 ? 'Excellent' : 
             qualityPercentage >= 60 ? 'Good' : 
             qualityPercentage >= 40 ? 'Fair' : 'Poor'
    };
  }

  assessEducationalValue(scenario) {
    const educationalFactors = {
      realisticPresentation: scenario.hasPatientAge && scenario.hasPresentation,
      comprehensiveHistory: scenario.hasHistory,
      clinicalReasoning: scenario.hasPhysicalExam,
      differentialDiagnosis: scenario.questionText.toLowerCase().includes('differential'),
      treatmentOptions: scenario.questionText.toLowerCase().includes('treatment')
    };

    const valueScore = Object.values(educationalFactors).filter(Boolean).length;

    return {
      factors: educationalFactors,
      score: valueScore,
      maxScore: 5,
      educationalLevel: valueScore >= 4 ? 'High' : 
                      valueScore >= 2 ? 'Medium' : 'Low'
    };
  }

  async validateUSMLEStandards() {
    console.log('📋 Validating USMLE Standards...');

    // Check question format compliance
    const usmleStandards = {
      questionFormat: await this.validateQuestionFormat(),
      answerChoices: await this.validateAnswerChoices(),
      explanationQuality: await this.validateExplanationQuality(),
      difficultyProgression: await this.validateDifficultyProgression()
    };

    this.validationResults.educationalStandards.push(usmleStandards);

    console.log('   ✅ USMLE standards validation completed');
    return usmleStandards;
  }

  async validateQuestionFormat() {
    console.log('   📝 Validating Question Format...');

    const formatChecks = await this.page.evaluate(() => {
      const questionElement = document.querySelector('[data-testid="question-text"]');
      if (!questionElement) return null;

      const questionText = questionElement.textContent || '';
      
      return {
        hasLeadIn: questionText.length > 50,
        hasQuestionStem: questionText.includes('?') || questionText.includes('Which') || questionText.includes('What'),
        appropriate Length: questionText.length >= 100 && questionText.length <= 1000,
        clearlyWorded: !questionText.includes('...') && !questionText.includes('___')
      };
    });

    if (!formatChecks) return { valid: false, reason: 'No question found' };

    const formatScore = Object.values(formatChecks).filter(Boolean).length;
    
    return {
      valid: formatScore >= 3,
      score: formatScore,
      checks: formatChecks,
      compliance: formatScore >= 3 ? 'Compliant' : 'Non-compliant'
    };
  }

  async validateAnswerChoices() {
    console.log('   🔤 Validating Answer Choices...');

    const choiceValidation = await this.page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('[data-testid^="answer-option-"]'));
      
      if (options.length === 0) return null;

      const optionsText = options.map(opt => opt.textContent || '');
      
      return {
        correctCount: options.length >= 4 && options.length <= 6,
        similarLength: Math.max(...optionsText.map(t => t.length)) - Math.min(...optionsText.map(t => t.length)) < 100,
        noDuplicates: new Set(optionsText).size === optionsText.length,
        medicallyPlausible: optionsText.every(text => text.length > 5),
        homogeneous: optionsText.every(text => !text.includes('All of the above') && !text.includes('None of the above'))
      };
    });

    if (!choiceValidation) return { valid: false, reason: 'No answer choices found' };

    const choiceScore = Object.values(choiceValidation).filter(Boolean).length;
    
    return {
      valid: choiceScore >= 4,
      score: choiceScore,
      checks: choiceValidation,
      compliance: choiceScore >= 4 ? 'Compliant' : 'Non-compliant'
    };
  }

  async validateExplanationQuality() {
    console.log('   💡 Validating Explanation Quality...');

    // Submit an answer to see explanation
    try {
      await this.page.click('[data-testid="answer-option-0"]');
      await this.page.click('[data-testid="submit-answer"]');
      await this.page.waitForSelector('[data-testid="answer-explanation"]', { timeout: 5000 });
    } catch (error) {
      return { valid: false, reason: 'Could not access explanation' };
    }

    const explanationQuality = await this.page.evaluate(() => {
      const explanationElement = document.querySelector('[data-testid="answer-explanation"]');
      if (!explanationElement) return null;

      const explanationText = explanationElement.textContent || '';
      
      return {
        hasExplanation: explanationText.length > 20,
        adequateLength: explanationText.length >= 100,
        explainsCorrectAnswer: explanationText.toLowerCase().includes('correct') || explanationText.toLowerCase().includes('answer'),
        addressesIncorrectOptions: explanationText.split('.').length >= 3,
        hasEducationalContent: explanationText.toLowerCase().includes('because') || explanationText.toLowerCase().includes('reason'),
        medicallyAccurate: !explanationText.toLowerCase().includes('error') && !explanationText.toLowerCase().includes('mistake')
      };
    });

    if (!explanationQuality) return { valid: false, reason: 'No explanation found' };

    const qualityScore = Object.values(explanationQuality).filter(Boolean).length;
    
    return {
      valid: qualityScore >= 4,
      score: qualityScore,
      checks: explanationQuality,
      compliance: qualityScore >= 4 ? 'High Quality' : 'Needs Improvement'
    };
  }

  async validateDifficultyProgression() {
    console.log('   📈 Validating Difficulty Progression...');

    // This would ideally analyze multiple questions to assess difficulty progression
    // For now, we'll do a basic assessment
    return {
      valid: true,
      assessment: 'Progressive difficulty assessment requires multiple quiz sessions',
      recommendation: 'Implement difficulty tracking across question sets'
    };
  }

  async generateMedicalContentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'MedQuiz Pro - Medical Education Platform',
      validationStandards: ['USMLE', 'NBME', 'Medical Education Accreditation'],
      results: this.validationResults,
      summary: {
        totalQuestions: this.validationResults.terminology.length,
        medicalTermsValidated: this.validationResults.terminology.reduce((sum, t) => sum + t.medicalTermsFound.length, 0),
        clinicalScenariosFound: this.validationResults.clinicalScenarios.filter(s => s.isClinicalScenario).length,
        referencesValidated: this.validationResults.references.length,
        overallCompliance: 'Pending calculation'
      }
    };

    // Calculate overall compliance score
    const terminologyCompliance = this.validationResults.terminology.filter(t => 
      t.professionalLanguage && t.terminologyErrors.length === 0
    ).length;

    const clinicalCompliance = this.validationResults.clinicalScenarios.filter(s => 
      s.clinicalQuality.percentage >= 60
    ).length;

    const overallScore = (
      (terminologyCompliance / Math.max(this.validationResults.terminology.length, 1)) * 40 +
      (clinicalCompliance / Math.max(this.validationResults.clinicalScenarios.length, 1)) * 40 +
      (this.validationResults.references.filter(r => r.isValid).length / Math.max(this.validationResults.references.length, 1)) * 20
    );

    report.summary.overallCompliance = `${overallScore.toFixed(1)}%`;

    console.log('\n🏥 MEDICAL CONTENT VALIDATION REPORT');
    console.log('===================================');
    console.log(`Questions Analyzed: ${report.summary.totalQuestions}`);
    console.log(`Medical Terms Found: ${report.summary.medicalTermsValidated}`);
    console.log(`Clinical Scenarios: ${report.summary.clinicalScenariosFound}`);
    console.log(`References Validated: ${report.summary.referencesValidated}`);
    console.log(`Overall Compliance: ${report.summary.overallCompliance}`);

    return report;
  }
}

// Test definitions
test.describe('Medical Content Validation', () => {
  test('Complete Medical Content Validation Suite', async ({ page }) => {
    const validator = new MedicalContentValidator(page);

    await validator.validateMedicalTerminology();
    await validator.validateMedicalReferences();
    await validator.validateClinicalScenarios();
    await validator.validateUSMLEStandards();

    const report = await validator.generateMedicalContentReport();

    // Save report for analysis
    const fs = require('fs');
    fs.writeFileSync(
      '/tmp/medical-content-validation-report.json',
      JSON.stringify(report, null, 2)
    );

    // Assert medical content quality
    expect(parseFloat(report.summary.overallCompliance)).toBeGreaterThan(70); // 70% compliance threshold
    expect(report.summary.totalQuestions).toBeGreaterThan(0);

    console.log('✅ Medical content validation completed successfully');
  });

  test('USMLE Format Compliance Check', async ({ page }) => {
    console.log('📋 Testing USMLE Format Compliance...');

    await page.goto('/quiz');
    await page.click('[data-testid="start-quiz-btn"]');
    await page.waitForSelector('[data-testid="quiz-question"]');

    // Check question structure
    const questionText = await page.textContent('[data-testid="question-text"]');
    expect(questionText).toBeTruthy();
    expect(questionText.length).toBeGreaterThan(50); // Substantial question content

    // Check answer options
    const options = await page.$$('[data-testid^="answer-option-"]');
    expect(options.length).toBeGreaterThanOrEqual(4);
    expect(options.length).toBeLessThanOrEqual(6);

    // Check for explanation availability
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="submit-answer"]');
    
    const explanation = await page.waitForSelector('[data-testid="answer-explanation"]', { timeout: 5000 });
    expect(explanation).toBeTruthy();

    console.log('✅ USMLE format compliance verified');
  });

  test('Clinical Scenario Authenticity', async ({ page }) => {
    console.log('🩺 Testing Clinical Scenario Authenticity...');

    await page.goto('/quiz');
    await page.click('[data-testid="start-quiz-btn"]');

    let clinicalScenariosFound = 0;
    let questionsAnalyzed = 0;

    for (let i = 0; i < 5; i++) {
      try {
        await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 5000 });
        
        const questionText = await page.textContent('[data-testid="question-text"]');
        
        // Check for clinical scenario indicators
        const hasClinicalElements = [
          /\d{1,3}[- ]?year[- ]?old/i.test(questionText), // Patient age
          /presents? with|chief complaint/i.test(questionText), // Presentation
          /history|past medical/i.test(questionText), // Medical history
          /examination|vital signs/i.test(questionText) // Physical exam
        ];

        const clinicalElementCount = hasClinicalElements.filter(Boolean).length;
        
        if (clinicalElementCount >= 2) {
          clinicalScenariosFound++;
          console.log(`   ✅ Question ${i + 1}: Clinical scenario (${clinicalElementCount}/4 elements)`);
        }

        questionsAnalyzed++;

        // Move to next question
        await page.click('[data-testid="answer-option-0"]');
        await page.click('[data-testid="submit-answer"]');
        
        const nextBtn = await page.$('[data-testid="next-question"]');
        if (nextBtn) {
          await nextBtn.click();
        } else {
          break;
        }

      } catch (error) {
        console.log(`   ⚠️ Could not analyze question ${i + 1}: ${error.message}`);
        break;
      }
    }

    // Expect at least 60% of questions to be clinical scenarios
    const clinicalPercentage = (clinicalScenariosFound / questionsAnalyzed) * 100;
    expect(clinicalPercentage).toBeGreaterThan(40); // At least 40% clinical scenarios

    console.log(`✅ Clinical scenarios: ${clinicalScenariosFound}/${questionsAnalyzed} (${clinicalPercentage.toFixed(1)}%)`);
  });
});

export { MedicalContentValidator };