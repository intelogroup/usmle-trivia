import type { Meta, StoryObj } from '@storybook/react';
import { QuizHeader } from './QuizHeader';

const meta = {
  title: 'Quiz/QuizHeader',
  component: QuizHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Header component for quiz interface showing current progress, mode, and optional timer with back navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['quick', 'timed', 'custom'],
      description: 'Quiz mode type',
    },
    currentQuestion: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Current question number (1-based)',
    },
    totalQuestions: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Total number of questions',
    },
    timeRemaining: {
      control: { type: 'number', min: 0, max: 3600 },
      description: 'Time remaining in seconds (null for no timer)',
    },
    onBack: { action: 'back clicked' },
  },
} satisfies Meta<typeof QuizHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Quick Quiz Header (No Timer)
export const QuickQuiz: Story = {
  args: {
    mode: 'quick',
    currentQuestion: 3,
    totalQuestions: 5,
    timeRemaining: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick quiz header without timer, showing question progress and mode.',
      },
    },
  },
};

// Timed Quiz Header with Ample Time
export const TimedQuizNormal: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 4,
    totalQuestions: 10,
    timeRemaining: 420, // 7 minutes remaining
  },
  parameters: {
    docs: {
      description: {
        story: 'Timed quiz header with normal time remaining, showing relaxed timer state.',
      },
    },
  },
};

// Timed Quiz with Critical Time (Under 1 minute)
export const TimedQuizCritical: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 8,
    totalQuestions: 10,
    timeRemaining: 45, // 45 seconds remaining
  },
  parameters: {
    docs: {
      description: {
        story: 'Timed quiz header with critical time remaining, showing urgent red timer with pulse animation.',
      },
    },
  },
};

// Custom Quiz Header
export const CustomQuiz: Story = {
  args: {
    mode: 'custom',
    currentQuestion: 5,
    totalQuestions: 8,
    timeRemaining: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom quiz header without timer, allowing flexible pacing.',
      },
    },
  },
};

// First Question
export const FirstQuestion: Story = {
  args: {
    mode: 'quick',
    currentQuestion: 1,
    totalQuestions: 5,
    timeRemaining: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for the first question of a quiz session.',
      },
    },
  },
};

// Last Question
export const LastQuestion: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 10,
    totalQuestions: 10,
    timeRemaining: 180, // 3 minutes remaining
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for the final question with time still remaining.',
      },
    },
  },
};

// Long Quiz Progress
export const LongQuiz: Story = {
  args: {
    mode: 'custom',
    currentQuestion: 15,
    totalQuestions: 25,
    timeRemaining: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for longer quiz sessions showing mid-progress state.',
      },
    },
  },
};

// Timer at Exactly 1 Minute
export const TimerOneMinute: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 6,
    totalQuestions: 10,
    timeRemaining: 60, // Exactly 1 minute
  },
  parameters: {
    docs: {
      description: {
        story: 'Timer at the threshold (60 seconds) where styling changes from normal to critical.',
      },
    },
  },
};

// Timer at 30 Seconds
export const TimerThirtySeconds: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 9,
    totalQuestions: 10,
    timeRemaining: 30,
  },
  parameters: {
    docs: {
      description: {
        story: 'Timer with 30 seconds remaining, showing high urgency state with pulsing animation.',
      },
    },
  },
};

// Timer at 10 Seconds (Very Critical)
export const TimerTenSeconds: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 10,
    totalQuestions: 10,
    timeRemaining: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Timer in final 10 seconds showing maximum urgency state.',
      },
    },
  },
};

// Timer at 5 Minutes (Common Timed Scenario)
export const TimerFiveMinutes: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 5,
    totalQuestions: 10,
    timeRemaining: 300, // 5 minutes
  },
  parameters: {
    docs: {
      description: {
        story: 'Typical mid-quiz scenario with 5 minutes remaining on timed quiz.',
      },
    },
  },
};

// Medical Specialty Context
export const MedicalContext: Story = {
  args: {
    mode: 'custom',
    currentQuestion: 7,
    totalQuestions: 12,
    timeRemaining: null,
  },
  parameters: {
    backgrounds: {
      default: 'medical',
      values: [
        { name: 'medical', value: '#f8fafc' },
      ],
    },
    docs: {
      description: {
        story: 'Header in medical education context with professional styling.',
      },
    },
  },
};

// Accessibility Focus
export const AccessibilityDemo: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 6,
    totalQuestions: 10,
    timeRemaining: 90,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including ARIA labels, role attributes, and screen reader support.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">Accessibility Features:</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Timer has role="timer" and aria-label with current time</li>
            <li>• Back button has descriptive aria-label</li>
            <li>• Timer updates announced via aria-live="polite"</li>
            <li>• Visual urgency indicators for low time</li>
            <li>• High contrast support for critical states</li>
          </ul>
        </div>
        <Story />
      </div>
    ),
  ],
};

// Mobile Responsive
export const MobileView: Story = {
  args: {
    mode: 'quick',
    currentQuestion: 3,
    totalQuestions: 5,
    timeRemaining: null,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-optimized header showing responsive layout and touch-friendly back button.',
      },
    },
  },
};

// Tablet View with Timer
export const TabletView: Story = {
  args: {
    mode: 'timed',
    currentQuestion: 4,
    totalQuestions: 8,
    timeRemaining: 240, // 4 minutes
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet-optimized header with timer, showing balanced layout for medium screens.',
      },
    },
  },
};