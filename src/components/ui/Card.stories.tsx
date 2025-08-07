import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta = {
  title: 'UI Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Complete Card</CardTitle>
        <CardDescription>Card with all sections included.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Main content with footer actions.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Action</Button>
        <Button variant="outline" size="sm">Cancel</Button>
      </CardFooter>
    </Card>
  ),
};

// Medical Education Specific Examples
export const QuestionCard: Story = {
  name: 'USMLE Question Card',
  render: () => (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Question 1 of 10</CardTitle>
        <CardDescription>Cardiology • Step 2 CK • Medium Difficulty</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-sm text-muted-foreground mb-2">Clinical Scenario:</p>
          <p>A 65-year-old male with a history of hypertension and diabetes presents to the emergency department with chest pain that started 2 hours ago...</p>
        </div>
        <div>
          <p className="font-medium text-sm text-muted-foreground mb-2">Question:</p>
          <p>What is the most appropriate next step in management?</p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
            <input type="radio" name="answer" className="text-primary" />
            <span>A. Immediate cardiac catheterization</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
            <input type="radio" name="answer" className="text-primary" />
            <span>B. 12-lead ECG and cardiac enzymes</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
            <input type="radio" name="answer" className="text-primary" />
            <span>C. Chest X-ray</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
            <input type="radio" name="answer" className="text-primary" />
            <span>D. Discharge with follow-up</span>
          </label>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Submit Answer</Button>
        <Button variant="outline">Flag Question</Button>
        <div className="ml-auto text-sm text-muted-foreground">
          ⏱️ 2:45 remaining
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive quiz card for USMLE-style medical questions with multiple choice answers.',
      },
    },
  },
};

export const ResultsCard: Story = {
  name: 'Quiz Results Card',
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Quiz Complete!
        </CardTitle>
        <CardDescription>Cardiology Practice Set</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">85%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">17/20</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Time:</span>
            <span>12:34</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Accuracy:</span>
            <span className="text-success">85%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Review Answers</Button>
        <Button variant="outline" className="w-full">Try Again</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Results summary card displayed after completing a medical quiz.',
      },
    },
  },
};

export const StatsCard: Story = {
  name: 'Performance Statistics Card',
  render: () => (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Progress</CardTitle>
        <CardDescription>Your performance this week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Questions Completed</span>
          <span className="font-semibold">142</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Average Score</span>
          <span className="font-semibold text-success">78%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Study Time</span>
          <span className="font-semibold">8.5h</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{width: '78%'}}></div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard statistics card showing student performance metrics.',
      },
    },
  },
};

export const SubjectCard: Story = {
  name: 'Medical Subject Card',
  render: () => (
    <Card className="w-72 hover:shadow-custom-lg transition-all cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🫀</span>
          Cardiology
        </CardTitle>
        <CardDescription>Cardiovascular system disorders and treatments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-primary">156</div>
            <div className="text-muted-foreground">Questions</div>
          </div>
          <div>
            <div className="font-medium text-success">82%</div>
            <div className="text-muted-foreground">Mastery</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>82/156</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-gradient-primary h-1.5 rounded-full" style={{width: '52%'}}></div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue Studying</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Subject overview card for medical specialties with progress tracking.',
      },
    },
  },
};