import type { Meta, StoryObj } from '@storybook/react';
import { QuizEngine } from './QuizEngine';
import { Question, QuizSession } from '../../services/quiz';
import React, { useEffect, useState } from 'react';

const meta = {
  title: 'Quiz/QuizEngine',
  component: QuizEngine,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive quiz engine supporting multiple modes (quick, timed, custom) with real-time question navigation and analytics tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['quick', 'timed', 'custom'],
      description: 'Quiz mode determining question count and time limits',
    },
    onBack: { action: 'navigated back' },
    onComplete: { action: 'quiz completed' },
  },
} satisfies Meta<typeof QuizEngine>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Questions Data
const mockQuestions: Question[] = [
  {
    id: 'cardiology-q1',
    question: 'A 65-year-old male presents to the emergency department with severe crushing chest pain radiating to his left arm. The pain began 2 hours ago while he was shoveling snow. His blood pressure is 90/60 mmHg, heart rate is 110 bpm, and he is diaphoretic. ECG shows ST-elevation in leads II, III, and aVF. What is the most appropriate immediate management?',
    choices: [
      'Sublingual nitroglycerin and aspirin',
      'Immediate cardiac catheterization',
      'IV beta-blocker to reduce heart rate',
      'High-flow oxygen and morphine'
    ],
    correctAnswer: 1,
    explanation: 'This patient presents with an acute inferior STEMI (ST-elevation myocardial infarction) as evidenced by ST-elevation in leads II, III, and aVF. The most appropriate immediate management is primary percutaneous coronary intervention (PCI) via cardiac catheterization, which should be performed within 90 minutes of first medical contact for optimal outcomes.',
    category: 'Cardiology',
    difficulty: 'medium',
    tags: ['STEMI', 'Emergency Medicine', 'Cardiology'],
    references: ['First Aid USMLE Step 1', 'Harrison\'s Principles of Internal Medicine']
  },
  {
    id: 'pharmacology-q1',
    question: 'A 45-year-old woman with rheumatoid arthritis is started on methotrexate therapy. Which vitamin supplementation is most important to prevent potential side effects?',
    choices: [
      'Vitamin B12 (cobalamin)',
      'Folic acid',
      'Vitamin B6 (pyridoxine)',
      'Vitamin D'
    ],
    correctAnswer: 1,
    explanation: 'Methotrexate is a folate antagonist that inhibits dihydrofolate reductase, leading to depletion of reduced folates necessary for DNA synthesis. Folic acid supplementation (typically 5-10mg weekly) is essential to prevent methotrexate-induced folate deficiency, which can cause bone marrow suppression, oral ulcers, and hepatotoxicity.',
    category: 'Pharmacology',
    difficulty: 'easy',
    tags: ['Methotrexate', 'Folate', 'Rheumatoid Arthritis'],
    references: ['Katzung Basic & Clinical Pharmacology', 'First Aid USMLE Step 1']
  },
  {
    id: 'anatomy-q1', 
    question: 'During a thyroidectomy procedure, the surgeon must be careful to preserve which structure to prevent hoarseness in the patient?',
    choices: [
      'External branch of superior laryngeal nerve',
      'Recurrent laryngeal nerve',
      'Vagus nerve',
      'Phrenic nerve'
    ],
    correctAnswer: 1,
    explanation: 'The recurrent laryngeal nerve innervates all intrinsic muscles of the larynx except the cricothyroid muscle. Injury to this nerve during thyroidectomy results in vocal cord paralysis and hoarseness. The nerve runs in the tracheoesophageal groove and is at risk during dissection of the inferior thyroid artery.',
    category: 'Anatomy',
    difficulty: 'medium',
    tags: ['Thyroid Surgery', 'Laryngeal Nerve', 'Head and Neck Anatomy'],
    references: ['Gray\'s Anatomy', 'Netter\'s Atlas of Human Anatomy']
  },
  {
    id: 'pathology-q1',
    question: 'A 28-year-old woman presents with a butterfly rash across her cheeks, joint pain in multiple joints, and proteinuria. Laboratory studies show positive ANA and anti-dsDNA antibodies. What is the most likely diagnosis?',
    choices: [
      'Rheumatoid arthritis',
      'Systemic lupus erythematosus',
      'Scleroderma',
      'Sjögren syndrome'
    ],
    correctAnswer: 1,
    explanation: 'This patient presents with the classic triad of systemic lupus erythematosus (SLE): butterfly rash, arthritis, and nephritis (proteinuria). The positive ANA and anti-dsDNA antibodies are highly specific for SLE. Anti-dsDNA antibodies are particularly associated with lupus nephritis and disease activity.',
    category: 'Pathology',
    difficulty: 'easy',
    tags: ['Autoimmune Disease', 'Systemic Lupus Erythematosus', 'Connective Tissue Disorders'],
    references: ['Robbins and Cotran Pathologic Basis of Disease', 'First Aid USMLE Step 1']
  },
  {
    id: 'microbiology-q1',
    question: 'A 4-year-old child presents with a "barking" cough, inspiratory stridor, and fever. The child appears anxious and prefers to sit leaning forward. Which organism is the most likely cause?',
    choices: [
      'Haemophilus influenzae type b',
      'Parainfluenza virus',
      'Respiratory syncytial virus',
      'Streptococcus pneumoniae'
    ],
    correctAnswer: 1,
    explanation: 'This presentation is classic for croup (laryngotracheobronchitis), most commonly caused by parainfluenza virus. The "barking" cough and inspiratory stridor are pathognomonic. While H. influenzae type b can cause epiglottitis with similar symptoms, the "barking" cough is more characteristic of viral croup.',
    category: 'Microbiology',
    difficulty: 'medium',
    tags: ['Pediatric Infections', 'Respiratory Tract Infections', 'Viral Infections'],
    references: ['Medical Microbiology by Murray', 'Nelson Textbook of Pediatrics']
  }
];

// Mock Convex Hooks (simplified for Storybook)
const MockQuizEngineProvider: React.FC<{ children: React.ReactNode; mockMode?: string }> = ({ 
  children, 
  mockMode = 'normal' 
}) => {
  // This would normally be provided by your app's context/providers
  // For Storybook, we'll simulate the behavior
  return <div>{children}</div>;
};

// Wrapper component to handle initialization and state
const QuizEngineWrapper: React.FC<{
  mode: 'quick' | 'timed' | 'custom';
  onBack: () => void;
  onComplete: (session: QuizSession) => void;
  mockScenario?: 'loading' | 'error' | 'normal';
}> = ({ mode, onBack, onComplete, mockScenario = 'normal' }) => {
  const [isLoading, setIsLoading] = useState(mockScenario === 'loading');
  const [hasError, setHasError] = useState(mockScenario === 'error');

  useEffect(() => {
    if (mockScenario === 'loading') {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mockScenario]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading quiz questions...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-red-500 text-6xl">⚠️</div>
        <div>
          <h3 className="text-lg font-semibold">Quiz Error</h3>
          <p className="text-muted-foreground">Failed to load quiz questions. Please try again.</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <QuizEngine 
      mode={mode} 
      onBack={onBack} 
      onComplete={onComplete} 
    />
  );
};

// Quick Quiz (5 questions, no timer)
export const QuickQuiz: Story = {
  render: (args) => (
    <MockQuizEngineProvider>
      <QuizEngineWrapper {...args} />
    </MockQuizEngineProvider>
  ),
  args: {
    mode: 'quick',
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick quiz mode with 5 questions and no time limit, perfect for rapid assessment.',
      },
    },
  },
};

// Timed Quiz (10 questions, 10 minutes)
export const TimedQuiz: Story = {
  render: (args) => (
    <MockQuizEngineProvider>
      <QuizEngineWrapper {...args} />
    </MockQuizEngineProvider>
  ),
  args: {
    mode: 'timed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Timed quiz mode with 10 questions and 10-minute time limit, simulating exam conditions.',
      },
    },
  },
};

// Custom Quiz (8 questions, no timer)
export const CustomQuiz: Story = {
  render: (args) => (
    <MockQuizEngineProvider>
      <QuizEngineWrapper {...args} />
    </MockQuizEngineProvider>
  ),
  args: {
    mode: 'custom',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom quiz mode with 8 questions, allowing flexible study sessions.',
      },
    },
  },
};

// Loading State
export const Loading: Story = {
  render: (args) => (
    <MockQuizEngineProvider>
      <QuizEngineWrapper {...args} mockScenario="loading" />
    </MockQuizEngineProvider>
  ),
  args: {
    mode: 'quick',
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while quiz questions are being fetched from the backend.',
      },
    },
  },
};

// Error State
export const Error: Story = {
  render: (args) => (
    <MockQuizEngineProvider>
      <QuizEngineWrapper {...args} mockScenario="error" />
    </MockQuizEngineProvider>
  ),
  args: {
    mode: 'timed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when quiz questions fail to load, with recovery option.',
      },
    },
  },
};

// Interactive Demo Component
const InteractiveQuizDemo: React.FC<{
  mode: 'quick' | 'timed' | 'custom';
}> = ({ mode }) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleBack = () => {
    setCurrentStep('intro');
  };

  const handleComplete = (session: QuizSession) => {
    setQuizSession(session);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setQuizSession(null);
    setCurrentStep('intro');
  };

  if (currentStep === 'intro') {
    return (
      <div className="p-8 text-center space-y-6">
        <h2 className="text-2xl font-bold">USMLE {mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            {mode === 'quick' && 'Quick assessment with 5 questions'}
            {mode === 'timed' && 'Timed quiz with 10 questions (10 minutes)'}
            {mode === 'custom' && 'Custom quiz with 8 questions'}
          </p>
          <p className="text-sm text-muted-foreground">
            Medical scenarios covering cardiology, pharmacology, anatomy, pathology, and microbiology
          </p>
        </div>
        <button
          onClick={handleStartQuiz}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (currentStep === 'results' && quizSession) {
    return (
      <div className="p-8 text-center space-y-6">
        <h2 className="text-2xl font-bold">Quiz Complete!</h2>
        <div className="space-y-4">
          <div className="text-4xl font-bold text-primary">{quizSession.score}%</div>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((quizSession.score / 100) * quizSession.questions.length)}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {quizSession.questions.length - Math.round((quizSession.score / 100) * quizSession.questions.length)}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <MockQuizEngineProvider>
      <QuizEngine mode={mode} onBack={handleBack} onComplete={handleComplete} />
    </MockQuizEngineProvider>
  );
};

// Interactive Demo Stories
export const InteractiveQuickDemo: Story = {
  render: () => <InteractiveQuizDemo mode="quick" />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo of quick quiz mode with full user journey from start to completion.',
      },
    },
  },
};

export const InteractiveTimedDemo: Story = {
  render: () => <InteractiveQuizDemo mode="timed" />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo of timed quiz mode showing countdown timer and pressure of time limits.',
      },
    },
  },
};

export const InteractiveCustomDemo: Story = {
  render: () => <InteractiveQuizDemo mode="custom" />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo of custom quiz mode with balanced question count and flexible timing.',
      },
    },
  },
};

// Accessibility Focused Story
export const AccessibilityDemo: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900">Accessibility Features Demonstrated:</h3>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• Screen reader announcements for quiz progress</li>
          <li>• Keyboard navigation support</li>
          <li>• ARIA labels and live regions</li>
          <li>• High contrast mode compatibility</li>
          <li>• Focus management and visual indicators</li>
        </ul>
      </div>
      <MockQuizEngineProvider>
        <QuizEngineWrapper {...args} />
      </MockQuizEngineProvider>
    </div>
  ),
  args: {
    mode: 'quick',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including screen reader support, keyboard navigation, and ARIA compliance.',
      },
    },
  },
};

// Mobile-Optimized Story
export const MobileOptimized: Story = {
  render: (args) => (
    <div className="max-w-sm mx-auto border rounded-lg overflow-hidden">
      <MockQuizEngineProvider>
        <QuizEngineWrapper {...args} />
      </MockQuizEngineProvider>
    </div>
  ),
  args: {
    mode: 'quick',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-optimized view showing responsive design and touch-friendly interfaces.',
      },
    },
  },
};