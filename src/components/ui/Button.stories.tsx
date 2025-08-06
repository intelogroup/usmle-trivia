import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { theme } from '../../theme';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI Components/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select', 
      options: ['default', 'sm', 'lg', 'large', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  // Default onClick handler for actions panel
  args: { onClick: () => console.log('Button clicked') },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    children: 'Start Quiz',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Question',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Learn More',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Skip Question',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'View Guidelines',
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: 'Begin Assessment',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Quick Action',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Primary Action',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'large',
    children: 'Start USMLE Prep',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '✓',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Not Available',
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <span className="animate-pulse">⏳</span> Loading...
      </>
    ),
  },
};

// Medical Education Specific Examples
export const StartQuiz: Story = {
  name: 'Start Quiz (Medical)',
  args: {
    variant: 'gradient',
    size: 'large',
    children: 'Begin USMLE Practice',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary call-to-action for starting medical quiz sessions.',
      },
    },
  },
};

export const SubmitAnswer: Story = {
  name: 'Submit Answer (Medical)',
  args: {
    variant: 'default',
    children: 'Submit Answer',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used when student submits their answer choice during quiz.',
      },
    },
  },
};

export const ReviewExplanation: Story = {
  name: 'Review Explanation (Medical)',
  args: {
    variant: 'outline',
    children: 'Review Explanation',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary action to view detailed medical explanations.',
      },
    },
  },
};

// Button Group Examples
export const ButtonGroup: Story = {
  name: 'Quiz Actions Group',
  render: () => (
    <div className="flex gap-3">
      <Button variant="gradient" size="lg">Start Quiz</Button>
      <Button variant="outline" size="lg">Review</Button>  
      <Button variant="ghost" size="lg">Skip</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common button combinations used in medical quiz interfaces.',
      },
    },
  },
};