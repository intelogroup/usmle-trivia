import type { Meta, StoryObj } from '@storybook/react';
import { QuizQuestion } from './QuizQuestion';
import { type Question } from '../../services/quiz';

// Mock question data following medical education standards
const mockCardiologyQuestion: Question = {
  id: 'cardio_001',
  question: 'A 65-year-old male with a history of hypertension and diabetes presents to the emergency department with chest pain that started 2 hours ago. The pain is described as crushing, substernal, and radiates to the left arm. ECG shows ST-elevation in leads II, III, and aVF. What is the most likely location of the myocardial infarction?',
  options: [
    'Anterior wall',
    'Posterior wall', 
    'Inferior wall',
    'Lateral wall'
  ],
  correctAnswer: 2,
  explanation: 'ST-elevation in leads II, III, and aVF indicates an inferior wall myocardial infarction. These leads look at the inferior aspect of the heart, which is supplied by the right coronary artery in most patients. The clinical presentation of crushing chest pain with radiation to the left arm is classic for acute MI.',
  category: 'Cardiology',
  difficulty: 'medium',
  usmleCategory: 'Step 2 CK',
  tags: ['myocardial-infarction', 'ecg', 'emergency-medicine', 'internal-medicine'],
  medicalReferences: ['First Aid for USMLE Step 1', 'Harrison\'s Principles of Internal Medicine']
};

const mockPharmacologyQuestion: Question = {
  id: 'pharm_001',
  question: 'A 45-year-old woman is prescribed a new medication for her recently diagnosed atrial fibrillation. The medication works by blocking sodium channels and has both class Ia and class III antiarrhythmic properties. Which of the following medications was most likely prescribed?',
  options: [
    'Amiodarone',
    'Quinidine',
    'Procainamide',
    'Flecainide'
  ],
  correctAnswer: 2,
  explanation: 'Procainamide has both class Ia (sodium channel blocking) and class III (potassium channel blocking) antiarrhythmic properties. While amiodarone is primarily class III, procainamide\'s dual mechanism makes it unique among antiarrhythmics.',
  category: 'Pharmacology',
  difficulty: 'hard',
  usmleCategory: 'Step 1',
  tags: ['antiarrhythmics', 'atrial-fibrillation', 'sodium-channels'],
  medicalReferences: ['Basic & Clinical Pharmacology by Katzung']
};

const mockEasyQuestion: Question = {
  id: 'basic_001',
  question: 'Which of the following is the most abundant cell type in the human body?',
  options: [
    'Red blood cells',
    'White blood cells',
    'Platelets',
    'Neurons'
  ],
  correctAnswer: 0,
  explanation: 'Red blood cells (erythrocytes) are the most abundant cell type in the human body, making up about 40-45% of blood volume and numbering approximately 25 trillion cells in an average adult.',
  category: 'Basic Science',
  difficulty: 'easy',
  usmleCategory: 'Step 1',
  tags: ['hematology', 'cell-biology', 'basic-science'],
  medicalReferences: ['Guyton and Hall Textbook of Medical Physiology']
};

const meta = {
  title: 'Quiz Components/QuizQuestion',
  component: QuizQuestion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive quiz question component for USMLE-style medical questions. Features answer selection, visual feedback, and comprehensive accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    selectedAnswer: {
      control: { type: 'select' },
      options: [null, 0, 1, 2, 3],
      description: 'Currently selected answer index (null if no answer selected)',
    },
    showExplanation: {
      control: 'boolean',
      description: 'Whether to show the explanation and correct answer',
    },
    hasAnswered: {
      control: 'boolean',
      description: 'Whether the user has submitted an answer',
    },
    questionNumber: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Current question number in the quiz sequence',
    },
  },
  args: {
    onAnswerSelect: (answerIndex: number) => console.log(`Answer selected: ${answerIndex}`),
  },
} satisfies Meta<typeof QuizQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - question ready for answering
export const Default: Story = {
  args: {
    question: mockCardiologyQuestion,
    selectedAnswer: null,
    showExplanation: false,
    hasAnswered: false,
    questionNumber: 1,
  },
};

// Question with selected answer (before submission)
export const AnswerSelected: Story = {
  args: {
    question: mockCardiologyQuestion,
    selectedAnswer: 2,
    showExplanation: false,
    hasAnswered: false,
    questionNumber: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Question state when user has selected an answer but not yet submitted.',
      },
    },
  },
};

// Correct answer revealed
export const CorrectAnswer: Story = {
  args: {
    question: mockCardiologyQuestion,
    selectedAnswer: 2, // Correct answer
    showExplanation: true,
    hasAnswered: true,
    questionNumber: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Question state showing correct answer with explanation after submission.',
      },
    },
  },
};

// Incorrect answer revealed
export const IncorrectAnswer: Story = {
  args: {
    question: mockCardiologyQuestion,
    selectedAnswer: 0, // Wrong answer
    showExplanation: true,
    hasAnswered: true,
    questionNumber: 7,
  },
  parameters: {
    docs: {
      description: {
        story: 'Question state showing incorrect answer selection with correct answer highlighted.',
      },
    },
  },
};

// Hard pharmacology question
export const HardQuestion: Story = {
  args: {
    question: mockPharmacologyQuestion,
    selectedAnswer: null,
    showExplanation: false,
    hasAnswered: false,
    questionNumber: 15,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex pharmacology question demonstrating difficult USMLE Step 1 content.',
      },
    },
  },
};

// Easy foundational question
export const EasyQuestion: Story = {
  args: {
    question: mockEasyQuestion,
    selectedAnswer: 0,
    showExplanation: true,
    hasAnswered: true,
    questionNumber: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic science question suitable for early medical education or warm-up.',
      },
    },
  },
};

// Long clinical vignette example
export const LongClinicalVignette: Story = {
  args: {
    question: {
      ...mockCardiologyQuestion,
      question: 'A 65-year-old male with a past medical history significant for hypertension (controlled on lisinopril), type 2 diabetes mellitus (HbA1c 7.2% on metformin), and hyperlipidemia presents to the emergency department with acute onset of severe chest pain that began approximately 2 hours ago while watching television. The patient describes the pain as crushing and substernal with radiation to his left arm and jaw. He reports associated nausea, diaphoresis, and shortness of breath. He denies any recent trauma, recent illness, or changes in medications. Vital signs reveal: BP 180/95 mmHg, HR 105 bpm, RR 22/min, O2 sat 92% on room air, temperature 98.6°F. Physical examination is notable for diaphoresis, mild respiratory distress, and an S4 gallop on cardiac auscultation. ECG demonstrates ST-elevation in leads II, III, and aVF with reciprocal changes in leads I and aVL. Cardiac enzymes reveal elevated troponin I. Given this clinical presentation and diagnostic findings, what is the most likely location of the myocardial infarction?'
    },
    selectedAnswer: null,
    showExplanation: false,
    hasAnswered: false,
    questionNumber: 23,
  },
  parameters: {
    docs: {
      description: {
        story: 'Extended clinical vignette typical of USMLE Step 2 CK questions with comprehensive patient presentation.',
      },
    },
  },
};

// Different medical specialties showcase
export const SpecialtyShowcase: Story = {
  name: 'Medical Specialties',
  render: () => (
    <div className="space-y-8 max-w-4xl">
      {/* Cardiology */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-medical-physiology">Cardiology Example</h3>
        <QuizQuestion
          question={mockCardiologyQuestion}
          selectedAnswer={2}
          showExplanation={true}
          hasAnswered={true}
          questionNumber={1}
          onAnswerSelect={() => {}}
        />
      </div>
      
      {/* Pharmacology */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-medical-pharmacology">Pharmacology Example</h3>
        <QuizQuestion
          question={mockPharmacologyQuestion}
          selectedAnswer={null}
          showExplanation={false}
          hasAnswered={false}
          questionNumber={2}
          onAnswerSelect={() => {}}
        />
      </div>
      
      {/* Basic Science */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-medical-biochemistry">Basic Science Example</h3>
        <QuizQuestion
          question={mockEasyQuestion}
          selectedAnswer={0}
          showExplanation={true}
          hasAnswered={true}
          questionNumber={3}
          onAnswerSelect={() => {}}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of different medical specialties and their unique question characteristics.',
      },
    },
  },
};

// Accessibility demonstration
export const AccessibilityFeatures: Story = {
  name: 'Accessibility Features',
  args: {
    question: {
      ...mockCardiologyQuestion,
      question: 'This question demonstrates accessibility features including proper ARIA labels, keyboard navigation, and screen reader support.'
    },
    selectedAnswer: 1,
    showExplanation: true,
    hasAnswered: true,
    questionNumber: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features: ARIA labels, keyboard navigation, role attributes, and screen reader announcements.',
      },
    },
  },
};

// Mobile responsive demonstration
export const MobileView: Story = {
  args: {
    question: mockCardiologyQuestion,
    selectedAnswer: 2,
    showExplanation: true,
    hasAnswered: true,
    questionNumber: 8,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-optimized view demonstrating responsive design for quiz-taking on mobile devices.',
      },
    },
  },
};

// Interactive quiz flow demonstration
export const InteractiveFlow: Story = {
  name: 'Interactive Quiz Flow',
  render: () => {
    const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = React.useState(false);
    const [showExplanation, setShowExplanation] = React.useState(false);

    const handleAnswerSelect = (answerIndex: number) => {
      if (!hasAnswered) {
        setSelectedAnswer(answerIndex);
      }
    };

    const handleSubmit = () => {
      setHasAnswered(true);
      setShowExplanation(true);
    };

    const handleReset = () => {
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowExplanation(false);
    };

    return (
      <div className="max-w-4xl space-y-4">
        <QuizQuestion
          question={mockCardiologyQuestion}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          hasAnswered={hasAnswered}
          questionNumber={1}
          onAnswerSelect={handleAnswerSelect}
        />
        
        <div className="flex gap-4 justify-center">
          {selectedAnswer !== null && !hasAnswered && (
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit Answer
            </button>
          )}
          
          {hasAnswered && (
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of the complete quiz question flow with state management.',
      },
    },
  },
};