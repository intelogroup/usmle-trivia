import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Button } from './Button';
import { theme } from '../../theme';

const meta = {
  title: 'UI Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input field type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search questions...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
    placeholder: 'This won\'t show',
  },
};

// Medical Education Specific Examples
export const MedicalStudentLogin: Story = {
  name: 'Medical Student Email',
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Medical School Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="student@medschool.edu"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use your official medical school email address
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Email input specifically designed for medical student registration.',
      },
    },
  },
};

export const QuizSearch: Story = {
  name: 'Question Search',
  render: () => (
    <div className="w-96 space-y-2">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search by topic, specialty, or keyword..."
          className="w-full pr-10"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          🔍
        </span>
      </div>
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 bg-muted rounded">Cardiology</span>
        <span className="px-2 py-1 bg-muted rounded">Step 2 CK</span>
        <span className="px-2 py-1 bg-muted rounded">Hard</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Search input for finding specific medical questions with tag suggestions.',
      },
    },
  },
};

export const TimerInput: Story = {
  name: 'Custom Timer Input',
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <label htmlFor="timer" className="block text-sm font-medium mb-2">
          Quiz Timer (minutes)
        </label>
        <Input
          id="timer"
          type="number"
          min="1"
          max="120"
          defaultValue="30"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Recommended: 1.5 minutes per question
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Numeric input for setting custom quiz timers with medical guidance.',
      },
    },
  },
};

export const LoginForm: Story = {
  name: 'Login Form Example',
  render: () => (
    <div className="w-80 space-y-4 p-6 border rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">MedQuiz Pro Login</h2>
        <p className="text-sm text-muted-foreground">Access your medical studies</p>
      </div>
      
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <Input
          id="login-email"
          type="email"
          placeholder="student@medschool.edu"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          className="w-full"
        />
      </div>
      
      <Button className="w-full">Sign In</Button>
      
      <div className="text-center">
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot your password?
        </a>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete login form example for medical education platform.',
      },
    },
  },
};

export const StudySettings: Story = {
  name: 'Study Settings Form',
  render: () => (
    <div className="w-96 space-y-6 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Study Session Settings</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="questions-count" className="block text-sm font-medium mb-2">
            Questions Count
          </label>
          <Input
            id="questions-count"
            type="number"
            min="5"
            max="100"
            defaultValue="20"
          />
        </div>
        <div>
          <label htmlFor="time-limit" className="block text-sm font-medium mb-2">
            Time Limit (min)
          </label>
          <Input
            id="time-limit"
            type="number"
            min="5"
            max="180"
            defaultValue="30"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="specialty-filter" className="block text-sm font-medium mb-2">
          Filter by Specialty
        </label>
        <Input
          id="specialty-filter"
          type="search"
          placeholder="e.g., Cardiology, Neurology..."
        />
      </div>
      
      <div className="flex gap-2">
        <Button className="flex-1">Start Custom Quiz</Button>
        <Button variant="outline">Reset</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Study session configuration form with multiple input types.',
      },
    },
  },
};