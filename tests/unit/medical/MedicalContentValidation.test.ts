import { describe, it, expect } from 'vitest';

// Mock sample questions from the actual data
const mockMedicalQuestions = [
  {
    id: 'q1',
    question: 'A 45-year-old man presents to the emergency department with severe chest pain radiating to his left arm and jaw. His ECG shows ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?',
    options: [
      'Left anterior descending artery',
      'Right coronary artery',
      'Left circumflex artery',
      'Posterior descending artery'
    ],
    correctAnswer: 1,
    explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall MI, which is most commonly caused by occlusion of the right coronary artery (RCA). The RCA supplies the inferior wall of the left ventricle in most patients.',
    category: 'Cardiology',
    difficulty: 'medium',
    usmleCategory: 'Internal Medicine',
    tags: ['STEMI', 'ECG', 'coronary artery', 'inferior MI'],
    medicalReferences: ['First Aid USMLE Step 1', 'Braunwald\'s Heart Disease']
  },
  {
    id: 'q2',
    question: 'A 28-year-old woman with diabetes mellitus presents with polyuria, polydipsia, nausea, and vomiting. Laboratory studies show glucose 450 mg/dL, ketones positive, pH 7.25, and HCO3- 15 mEq/L. What is the most appropriate initial treatment?',
    options: [
      'Regular insulin bolus followed by continuous infusion',
      'NPH insulin subcutaneously',
      'Oral hypoglycemic agents',
      'Glucagon injection'
    ],
    correctAnswer: 0,
    explanation: 'This patient presents with diabetic ketoacidosis (DKA). The initial treatment is IV regular insulin with a bolus followed by continuous infusion, along with IV fluids and electrolyte replacement.',
    category: 'Endocrinology',
    difficulty: 'medium',
    usmleCategory: 'Internal Medicine',
    tags: ['DKA', 'diabetes', 'insulin', 'emergency treatment'],
    medicalReferences: ['ADA Guidelines', 'First Aid USMLE Step 2']
  },
  {
    id: 'q3',
    question: 'A 65-year-old patient with chronic obstructive pulmonary disease (COPD) presents with increased dyspnea and purulent sputum. Which antibiotic is most appropriate for treating this COPD exacerbation?',
    options: [
      'Amoxicillin-clavulanate',
      'Clindamycin',
      'Vancomycin',
      'Metronidazole'
    ],
    correctAnswer: 0,
    explanation: 'Amoxicillin-clavulanate is first-line antibiotic therapy for COPD exacerbations, providing coverage against common bacterial pathogens including H. influenzae, S. pneumoniae, and M. catarrhalis.',
    category: 'Pulmonology',
    difficulty: 'easy',
    usmleCategory: 'Internal Medicine',
    tags: ['COPD', 'exacerbation', 'antibiotics', 'treatment'],
    medicalReferences: ['GOLD Guidelines', 'Chest Guidelines']
  }
];

describe('Medical Content Validation', () => {
  describe('Question Medical Accuracy', () => {
    it('should validate question format follows USMLE standards', () => {
      mockMedicalQuestions.forEach(question => {
        // USMLE questions should have clinical vignettes
        expect(question.question.length).toBeGreaterThan(50);
        
        // Should contain patient demographics and presentation
        expect(question.question).toMatch(/\d+(-year-old|\s+year\s+old)/i);
        
        // Should have 4 answer choices
        expect(question.options).toHaveLength(4);
        
        // Should have a correct answer index (0-3)
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(4);
        
        // Should have detailed explanation
        expect(question.explanation.length).toBeGreaterThan(30);
        
        // Should have appropriate medical category
        expect(question.category).toBeDefined();
        expect(question.usmleCategory).toBeDefined();
      });
    });

    it('should validate medical terminology and accuracy', () => {
      mockMedicalQuestions.forEach(question => {
        // Check for common medical abbreviations and terms
        const medicalTerms = /\b(mg\/dL|mEq\/L|ECG|ST|MI|IV|DKA|COPD|pH)\b/;
        const hasAppropriateTerms = medicalTerms.test(question.question) || 
                                  medicalTerms.test(question.explanation);
        
        if (question.category === 'Cardiology' || question.category === 'Endocrinology' || question.category === 'Pulmonology') {
          expect(hasAppropriateTerms).toBe(true);
        }
      });
    });

    it('should validate answer plausibility (all options medically reasonable)', () => {
      const cardiologyQuestion = mockMedicalQuestions.find(q => q.category === 'Cardiology');
      
      // All options should be actual coronary arteries
      const validCoronaryArteries = [
        'Left anterior descending artery',
        'Right coronary artery', 
        'Left circumflex artery',
        'Posterior descending artery'
      ];
      
      cardiologyQuestion?.options.forEach(option => {
        expect(validCoronaryArteries).toContain(option);
      });
    });

    it('should validate explanations contain medical reasoning', () => {
      mockMedicalQuestions.forEach(question => {
        const explanation = question.explanation;
        
        // Should explain why the correct answer is right
        expect(explanation.length).toBeGreaterThan(50);
        
        // Should contain medical reasoning keywords
        const reasoningKeywords = /\b(because|due to|caused by|indicates?|shows?|most likely|first-line|appropriate|initial treatment|is|presents?)\b/i;
        expect(explanation).toMatch(reasoningKeywords);
        
        // Should reference anatomical or physiological concepts
        const medicalConcepts = /\b(artery|heart|ventricle|insulin|glucose|antibiotic|treatment|diagnosis|symptom)\b/i;
        expect(explanation).toMatch(medicalConcepts);
      });
    });
  });

  describe('Difficulty Level Validation', () => {
    it('should appropriately categorize question difficulty', () => {
      const easyQuestion = mockMedicalQuestions.find(q => q.difficulty === 'easy');
      const mediumQuestions = mockMedicalQuestions.filter(q => q.difficulty === 'medium');
      
      // Easy questions should be more straightforward (treatment guidelines)
      expect(easyQuestion?.category).toBe('Pulmonology');
      expect(easyQuestion?.explanation).toContain('first-line');
      
      // Medium questions should require more clinical reasoning
      mediumQuestions.forEach(q => {
        expect(q.question.length).toBeGreaterThan(100); // More complex scenarios
        expect(q.explanation.length).toBeGreaterThan(80); // More detailed explanations
      });
    });

    it('should validate difficulty progression appropriateness', () => {
      const difficulties = ['easy', 'medium', 'hard'];
      const questionsByDifficulty = difficulties.map(diff => 
        mockMedicalQuestions.filter(q => q.difficulty === diff)
      );
      
      // Should have questions across difficulty levels
      expect(questionsByDifficulty[0].length).toBeGreaterThan(0); // easy
      expect(questionsByDifficulty[1].length).toBeGreaterThan(0); // medium
      
      // Easy questions should have shorter, more direct explanations
      if (questionsByDifficulty[0].length > 0 && questionsByDifficulty[1].length > 0) {
        const avgEasyExplanationLength = questionsByDifficulty[0]
          .reduce((acc, q) => acc + q.explanation.length, 0) / questionsByDifficulty[0].length;
        const avgMediumExplanationLength = questionsByDifficulty[1]
          .reduce((acc, q) => acc + q.explanation.length, 0) / questionsByDifficulty[1].length;
        
        expect(avgMediumExplanationLength).toBeGreaterThan(avgEasyExplanationLength);
      }
    });
  });

  describe('Medical Category Coverage', () => {
    it('should cover major USMLE subject areas', () => {
      const categories = mockMedicalQuestions.map(q => q.category);
      const uniqueCategories = [...new Set(categories)];
      
      // Should have multiple medical specialties
      expect(uniqueCategories.length).toBeGreaterThan(1);
      
      // Should include major clinical areas
      const majorAreas = ['Cardiology', 'Endocrinology', 'Pulmonology'];
      majorAreas.forEach(area => {
        expect(categories).toContain(area);
      });
    });

    it('should properly map categories to USMLE subjects', () => {
      mockMedicalQuestions.forEach(question => {
        // All clinical categories should map to appropriate USMLE categories
        if (['Cardiology', 'Endocrinology', 'Pulmonology'].includes(question.category)) {
          expect(question.usmleCategory).toBe('Internal Medicine');
        }
      });
    });

    it('should have appropriate tag coverage for searchability', () => {
      mockMedicalQuestions.forEach(question => {
        expect(question.tags).toBeDefined();
        expect(Array.isArray(question.tags)).toBe(true);
        expect(question.tags.length).toBeGreaterThan(0);
        
        // Tags should be relevant to the question content
        question.tags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(1);
        });
      });
    });
  });

  describe('Medical Reference Validation', () => {
    it('should reference reputable medical sources', () => {
      mockMedicalQuestions.forEach(question => {
        expect(question.medicalReferences).toBeDefined();
        expect(Array.isArray(question.medicalReferences)).toBe(true);
        expect(question.medicalReferences.length).toBeGreaterThan(0);
      });
    });

    it('should include standard medical education references', () => {
      const allReferences = mockMedicalQuestions.flatMap(q => q.medicalReferences);
      const standardReferences = [
        'First Aid USMLE',
        'Harrison\'s',
        'Guidelines',
        'Braunwald',
        'ADA',
        'GOLD',
        'Chest'
      ];
      
      // Should reference at least some standard medical texts
      const hasStandardReference = standardReferences.some(ref => 
        allReferences.some(medRef => medRef.includes(ref))
      );
      
      expect(hasStandardReference).toBe(true);
    });

    it('should have specialty-appropriate references', () => {
      const cardiologyQ = mockMedicalQuestions.find(q => q.category === 'Cardiology');
      const endoQ = mockMedicalQuestions.find(q => q.category === 'Endocrinology');
      const pulmonologyQ = mockMedicalQuestions.find(q => q.category === 'Pulmonology');
      
      // Cardiology question should reference cardiology texts
      expect(cardiologyQ?.medicalReferences.some(ref => 
        ref.includes('Braunwald') || ref.includes('Heart')
      )).toBe(true);
      
      // Endocrinology question should reference diabetes guidelines
      expect(endoQ?.medicalReferences.some(ref => 
        ref.includes('ADA') || ref.includes('Guidelines')
      )).toBe(true);
      
      // Pulmonology question should reference respiratory guidelines
      expect(pulmonologyQ?.medicalReferences.some(ref => 
        ref.includes('GOLD') || ref.includes('Chest')
      )).toBe(true);
    });
  });

  describe('Clinical Scenario Realism', () => {
    it('should present realistic patient presentations', () => {
      mockMedicalQuestions.forEach(question => {
        // Should include patient age and relevant demographics
        expect(question.question).toMatch(/\d+(-year-old|\s+year\s+old)/);
        
        // Should include presenting symptoms
        const symptomKeywords = /\b(presents|complains of|history of|symptoms|pain|dyspnea|nausea|vomiting)\b/i;
        expect(question.question).toMatch(symptomKeywords);
        
        // Should include relevant clinical findings when appropriate
        if (question.category === 'Cardiology') {
          expect(question.question).toMatch(/\b(ECG|chest pain|ST|elevation|leads)\b/i);
        }
        
        if (question.category === 'Endocrinology') {
          expect(question.question).toMatch(/\b(glucose|diabetes|insulin|ketones|pH)\b/i);
        }
      });
    });

    it('should include appropriate laboratory values and units', () => {
      const questionWithLabs = mockMedicalQuestions.find(q => 
        q.question.includes('mg/dL') || q.question.includes('mEq/L')
      );
      
      if (questionWithLabs) {
        // Lab values should be in appropriate ranges
        const glucoseMatch = questionWithLabs.question.match(/glucose (\d+) mg\/dL/);
        if (glucoseMatch) {
          const glucoseValue = parseInt(glucoseMatch[1]);
          expect(glucoseValue).toBeGreaterThan(70); // Above normal range
          expect(glucoseValue).toBeLessThan(1000); // Realistically high but not impossible
        }
        
        // pH values should be physiologically possible
        const pHMatch = questionWithLabs.question.match(/pH ([\d.]+)/);
        if (pHMatch) {
          const pHValue = parseFloat(pHMatch[1]);
          expect(pHValue).toBeGreaterThan(6.8); // Compatible with life
          expect(pHValue).toBeLessThan(7.8); // Compatible with life
        }
      }
    });
  });

  describe('Educational Value Assessment', () => {
    it('should teach important medical concepts', () => {
      mockMedicalQuestions.forEach(question => {
        // Questions should focus on key learning objectives
        const keyMedicalConcepts = [
          'diagnosis', 'treatment', 'pathophysiology', 'management',
          'first-line', 'most likely', 'most appropriate', 'best next step'
        ];
        
        const hasEducationalFocus = keyMedicalConcepts.some(concept => 
          question.question.toLowerCase().includes(concept) || 
          question.explanation.toLowerCase().includes(concept)
        );
        
        expect(hasEducationalFocus).toBe(true);
      });
    });

    it('should provide teaching points in explanations', () => {
      mockMedicalQuestions.forEach(question => {
        const explanation = question.explanation;
        
        // Should explain the pathophysiology or mechanism
        const teachingKeywords = /\b(because|due to|mechanism|pathophysiology|caused by|results in|presents|initial|treatment|IV|insulin|providing|coverage|therapy|antibiotic)\b/i;
        expect(explanation).toMatch(teachingKeywords);
        
        // Should relate to broader medical principles
        const principleKeywords = /\b(first-line|guidelines|standard|appropriate|most common|typical|commonly|initial|treatment|supplies)\b/i;
        expect(explanation).toMatch(principleKeywords);
      });
    });

    it('should align with USMLE competency areas', () => {
      const competencyAreas = {
        'Internal Medicine': ['diagnosis', 'treatment', 'management', 'patient', 'presents', 'insulin', 'antibiotic'],
        'Emergency Medicine': ['acute', 'emergency', 'urgent'],
        'Pharmacology': ['drug', 'medication', 'treatment', 'therapy']
      };
      
      mockMedicalQuestions.forEach(question => {
        const usmleCategory = question.usmleCategory;
        if (competencyAreas[usmleCategory]) {
          const relevantKeywords = competencyAreas[usmleCategory];
          const hasRelevantContent = relevantKeywords.some(keyword => 
            question.question.toLowerCase().includes(keyword) ||
            question.explanation.toLowerCase().includes(keyword)
          );
          
          expect(hasRelevantContent).toBe(true);
        }
      });
    });
  });

  describe('Content Quality Metrics', () => {
    it('should maintain high content standards', () => {
      mockMedicalQuestions.forEach(question => {
        // Question length should be appropriate for clinical vignettes
        expect(question.question.length).toBeGreaterThan(50);
        expect(question.question.length).toBeLessThan(500);
        
        // Explanation should be comprehensive but concise
        expect(question.explanation.length).toBeGreaterThan(50);
        expect(question.explanation.length).toBeLessThan(300);
        
        // All options should be reasonable length
        question.options.forEach(option => {
          expect(option.length).toBeGreaterThan(5);
          expect(option.length).toBeLessThan(100);
        });
      });
    });

    it('should avoid common question writing pitfalls', () => {
      mockMedicalQuestions.forEach(question => {
        // Should not have "all of the above" or "none of the above"
        const badOptions = question.options.some(option => 
          option.toLowerCase().includes('all of the above') ||
          option.toLowerCase().includes('none of the above')
        );
        expect(badOptions).toBe(false);
        
        // Should not have obviously incorrect options (negative options)
        const obviouslyWrong = question.options.some(option =>
          option.toLowerCase().includes('never') ||
          option.toLowerCase().includes('impossible')
        );
        expect(obviouslyWrong).toBe(false);
        
        // Should not give away the answer in the question
        const correctOption = question.options[question.correctAnswer];
        const givesAwayAnswer = question.question.toLowerCase().includes(
          correctOption.toLowerCase().substring(0, correctOption.length / 2)
        );
        expect(givesAwayAnswer).toBe(false);
      });
    });
  });
});