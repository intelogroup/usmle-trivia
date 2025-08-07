import type { Meta, StoryObj } from '@storybook/react';
import { QuizProgress } from './QuizProgress';

const meta = {
  title: 'Quiz/QuizProgress',
  component: QuizProgress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Progress bar component showing quiz completion progress with smooth animations and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentQuestion: {
      control: { type: 'number', min: 0, max: 49 },
      description: 'Current question index (0-based)',
    },
    totalQuestions: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Total number of questions in quiz',
    },
    hasAnswered: {
      control: 'boolean',
      description: 'Whether current question has been answered',
    },
  },
} satisfies Meta<typeof QuizProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

// Quiz Just Started
export const QuizStarted: Story = {
  args: {
    currentQuestion: 0,
    totalQuestions: 5,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at the start of a quiz before any questions are answered.',
      },
    },
  },
};

// First Question Answered
export const FirstAnswered: Story = {
  args: {
    currentQuestion: 0,
    totalQuestions: 5,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar after answering the first question, showing 20% progress.',
      },
    },
  },
};

// Mid-Quiz Progress
export const MidQuiz: Story = {
  args: {
    currentQuestion: 2,
    totalQuestions: 5,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar in the middle of a quiz showing 40% completion.',
      },
    },
  },
};

// Mid-Quiz with Current Answer
export const MidQuizAnswered: Story = {
  args: {
    currentQuestion: 2,
    totalQuestions: 5,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar in middle of quiz with current question answered, showing 60% progress.',
      },
    },
  },
};

// Almost Complete
export const AlmostComplete: Story = {
  args: {
    currentQuestion: 4,
    totalQuestions: 5,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar near completion showing 80% progress on final question.',
      },
    },
  },
};

// Quiz Complete
export const QuizComplete: Story = {
  args: {
    currentQuestion: 4,
    totalQuestions: 5,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at 100% completion with all questions answered.',
      },
    },
  },
};

// Long Quiz (10 Questions)
export const LongQuizStart: Story = {
  args: {
    currentQuestion: 0,
    totalQuestions: 10,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for longer quiz at the beginning.',
      },
    },
  },
};

// Long Quiz Mid-Progress
export const LongQuizMid: Story = {
  args: {
    currentQuestion: 5,
    totalQuestions: 10,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for longer quiz at 60% completion.',
      },
    },
  },
};

// Long Quiz Near End
export const LongQuizEnd: Story = {
  args: {
    currentQuestion: 8,
    totalQuestions: 10,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for longer quiz near completion at 80%.',
      },
    },
  },
};

// Custom Quiz (8 Questions)
export const CustomQuizProgress: Story = {
  args: {
    currentQuestion: 3,
    totalQuestions: 8,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for custom quiz format showing 50% completion.',
      },
    },
  },
};

// Quick Quiz (3 Questions)
export const QuickQuizProgress: Story = {
  args: {
    currentQuestion: 1,
    totalQuestions: 3,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for quick quiz format showing 33% completion.',
      },
    },
  },
};

// Very Long Quiz (25 Questions)
export const VeryLongQuiz: Story = {
  args: {
    currentQuestion: 12,
    totalQuestions: 25,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar for very long quiz showing gradual progress at 52%.',
      },
    },
  },
};

// Animation Demonstration
export const AnimationDemo: Story = {
  args: {
    currentQuestion: 2,
    totalQuestions: 5,
    hasAnswered: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates smooth progress bar animations and gradient effects.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Add a container to highlight the animation
      return (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">Animation Features:</h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Smooth 500ms transition duration with ease-out easing</li>
              <li>• Gradient progress bar with animated shimmer effect</li>
              <li>• Live percentage updates with aria-live announcements</li>
              <li>• Visual feedback for progress changes</li>
            </ul>
          </div>
          <Story />
        </div>
      );
    },
  ],
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  args: {
    currentQuestion: 3,
    totalQuestions: 10,
    hasAnswered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including ARIA attributes and screen reader support.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900">Accessibility Features:</h3>
          <ul className="text-sm text-green-800 mt-2 space-y-1">
            <li>• ARIA progressbar role with proper value attributes</li>
            <li>• aria-label for screen reader context</li>
            <li>• aria-live="polite" for percentage updates</li>
            <li>• Semantic progress indication</li>
            <li>• High contrast visual design</li>
          </ul>
        </div>
        <Story />
      </div>
    ),
  ],
};

// Mobile View
export const MobileView: Story = {
  args: {
    currentQuestion: 2,
    totalQuestions: 5,
    hasAnswered: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Progress bar optimized for mobile viewing with appropriate sizing.',
      },
    },
  },
};

// Dark Mode Compatibility
export const DarkMode: Story = {
  args: {
    currentQuestion: 3,
    totalQuestions: 8,
    hasAnswered: false,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Progress bar with dark mode styling showing proper contrast and visibility.',
      },
    },
  },
};

// High Contrast Mode
export const HighContrast: Story = {
  args: {
    currentQuestion: 4,
    totalQuestions: 7,
    hasAnswered: true,
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        story: 'Progress bar with high contrast design for accessibility compliance.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4" style={{ filter: 'contrast(150%)' }}>
        <Story />
      </div>
    ),
  ],
};

// Interactive Progress Simulation
export const InteractiveDemo: Story = {
  render: () => {
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [hasAnswered, setHasAnswered] = React.useState(false);
    const [totalQuestions] = React.useState(5);

    const handleAnswer = () => {
      setHasAnswered(true);
      setTimeout(() => {
        if (currentQuestion < totalQuestions - 1) {
          setCurrentQuestion(prev => prev + 1);
          setHasAnswered(false);
        }
      }, 1000);
    };

    const handleReset = () => {
      setCurrentQuestion(0);
      setHasAnswered(false);
    };

    return (
      <div className="space-y-4">
        <QuizProgress 
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          hasAnswered={hasAnswered}
        />
        <div className="flex gap-2">
          <button 
            onClick={handleAnswer}
            disabled={hasAnswered || currentQuestion >= totalQuestions - 1}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {hasAnswered ? 'Processing...' : 'Answer Question'}
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
          {hasAnswered && ' - Answered ✓'}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing progress bar behavior during quiz progression.',
      },
    },
  },
};