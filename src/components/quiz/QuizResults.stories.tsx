import type { Meta, StoryObj } from '@storybook/react';
import { QuizResults } from './QuizResults';
import { QuizSession, QuizMode } from '../../services/quiz';

const meta = {
  title: 'Quiz/QuizResults',
  component: QuizResults,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Results display for completed quiz sessions with performance analysis and study recommendations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onHome: { action: 'navigated to home' },
    onRetry: { action: 'quiz retried' },
    onReview: { action: 'answers reviewed' },
  },
} satisfies Meta<typeof QuizResults>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock quiz session data
const createMockSession = (overrides: Partial<QuizSession> = {}): QuizSession => ({
  id: 'session-123',
  userId: 'user-456',
  mode: 'quick' as QuizMode,
  questions: Array.from({ length: 5 }, (_, i) => `question-${i + 1}`),
  answers: [0, 1, null, 2, 1], // Mixed answered/unanswered
  score: 80,
  timeSpent: 180, // 3 minutes
  createdAt: new Date('2025-01-15T10:00:00Z').toISOString(),
  completedAt: new Date('2025-01-15T10:03:00Z').toISOString(),
  status: 'completed',
  ...overrides,
});

// Outstanding Performance (90%+)
export const Outstanding: Story = {
  args: {
    session: createMockSession({
      score: 95,
      answers: [0, 1, 2, 2, 1], // All answered correctly
      timeSpent: 240, // 4 minutes
      mode: 'timed' as QuizMode,
      questions: Array.from({ length: 5 }, (_, i) => `cardiology-q${i + 1}`),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Outstanding performance (95%) showing excellence message and trophy icon.',
      },
    },
  },
};

// Great Performance (80-89%)
export const Great: Story = {
  args: {
    session: createMockSession({
      score: 85,
      answers: [0, 1, null, 2, 1], // One unanswered
      timeSpent: 300, // 5 minutes
      mode: 'custom' as QuizMode,
      questions: Array.from({ length: 5 }, (_, i) => `pharmacology-q${i + 1}`),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Great performance (85%) with solid understanding message and target icon.',
      },
    },
  },
};

// Good Progress (70-79%)
export const Good: Story = {
  args: {
    session: createMockSession({
      score: 75,
      answers: [0, null, 2, null, 1], // Multiple unanswered
      timeSpent: 420, // 7 minutes
      mode: 'quick' as QuizMode,
      questions: Array.from({ length: 5 }, (_, i) => `anatomy-q${i + 1}`),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Good progress (75%) with encouragement message and trending up icon.',
      },
    },
  },
};

// Needs Improvement (<70%)
export const NeedsImprovement: Story = {
  args: {
    session: createMockSession({
      score: 60,
      answers: [null, 1, null, null, 1], // Many unanswered
      timeSpent: 150, // 2.5 minutes - rushed
      mode: 'timed' as QuizMode,
      questions: Array.from({ length: 5 }, (_, i) => `pathology-q${i + 1}`),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance needing improvement (60%) with motivational message and retry icon.',
      },
    },
  },
};

// Perfect Score
export const Perfect: Story = {
  args: {
    session: createMockSession({
      score: 100,
      answers: [0, 1, 2, 3, 1], // All correct
      timeSpent: 600, // 10 minutes - thorough
      mode: 'custom' as QuizMode,
      questions: Array.from({ length: 5 }, (_, i) => `comprehensive-q${i + 1}`),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Perfect score (100%) demonstrating complete mastery of the material.',
      },
    },
  },
};

// Long Quiz Session
export const LongQuiz: Story = {
  args: {
    session: createMockSession({
      score: 82,
      questions: Array.from({ length: 20 }, (_, i) => `usmle-q${i + 1}`),
      answers: Array.from({ length: 20 }, (_, i) => 
        i % 5 === 0 ? null : Math.floor(Math.random() * 4) // Some unanswered
      ),
      timeSpent: 1800, // 30 minutes
      mode: 'timed' as QuizMode,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Longer quiz session (20 questions) showing time analysis and detailed breakdown.',
      },
    },
  },
};

// Quick Quiz
export const QuickQuiz: Story = {
  args: {
    session: createMockSession({
      score: 40,
      questions: Array.from({ length: 3 }, (_, i) => `quick-q${i + 1}`),
      answers: [null, 1, null], // Minimal answers
      timeSpent: 90, // 1.5 minutes
      mode: 'quick' as QuizMode,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick 3-question quiz with low completion rate showing study recommendations.',
      },
    },
  },
};

// All Questions Skipped
export const AllSkipped: Story = {
  args: {
    session: createMockSession({
      score: 0,
      answers: [null, null, null, null, null], // All skipped
      timeSpent: 30, // Very quick exit
      mode: 'quick' as QuizMode,
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Session where all questions were skipped, showing minimum engagement metrics.',
      },
    },
  },
};

// Medical Specialty Focus - Cardiology
export const CardiologyFocus: Story = {
  args: {
    session: createMockSession({
      id: 'cardiology-session-789',
      score: 88,
      answers: [0, 1, 2, null, 1], // Strong performance with one skip
      timeSpent: 480, // 8 minutes - thorough consideration
      mode: 'custom' as QuizMode,
      questions: [
        'cardiology-ecg-interpretation-1',
        'cardiology-heart-failure-mgmt-1',
        'cardiology-arrhythmia-dx-1',
        'cardiology-valve-disease-1',
        'cardiology-acs-treatment-1',
      ],
      createdAt: new Date('2025-01-15T14:00:00Z').toISOString(),
      completedAt: new Date('2025-01-15T14:08:00Z').toISOString(),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Cardiology-focused quiz session showing specialized medical content performance.',
      },
    },
  },
};

// With Review Function
export const WithReview: Story = {
  args: {
    session: createMockSession({
      score: 70,
      answers: [0, null, 2, 1, null],
      timeSpent: 360, // 6 minutes
      mode: 'timed' as QuizMode,
    }),
    onReview: () => console.log('Review answers clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Results with review functionality enabled, showing all three action buttons.',
      },
    },
  },
};

// Recently Completed
export const RecentlyCompleted: Story = {
  args: {
    session: createMockSession({
      score: 92,
      answers: [0, 1, 2, 2, 1],
      timeSpent: 210, // 3.5 minutes
      mode: 'quick' as QuizMode,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recently completed session showing current timestamps and excellent performance.',
      },
    },
  },
};