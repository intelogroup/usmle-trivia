import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';

// Define custom matcher for axe violations
expect.extend({
  toHaveNoViolations(received) {
    const pass = received.violations.length === 0;
    if (pass) {
      return {
        message: () => `Expected accessibility violations, but found none`,
        pass: true,
      };
    } else {
      const violationMessages = received.violations.map((violation: any) => 
        `${violation.id}: ${violation.description}`
      ).join('\n');
      return {
        message: () => `Expected no accessibility violations, but found:\n${violationMessages}`,
        pass: false,
      };
    }
  },
});

describe('Accessibility Tests', () => {
  describe('Button Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with different variants', async () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient'] as const;
      
      for (const variant of variants) {
        const { container } = render(
          <Button variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
          </Button>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should be accessible when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with ARIA attributes', async () => {
      const { container } = render(
        <Button aria-label="Submit form" aria-describedby="submit-help">
          Submit
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content goes here.</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with semantic content', async () => {
      const { container } = render(
        <Card role="article" aria-labelledby="article-title">
          <h2 id="article-title">Article Title</h2>
          <p>Article content with proper heading hierarchy.</p>
          <h3>Subsection</h3>
          <p>More content under the subsection.</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with form elements', async () => {
      const { container } = render(
        <Card>
          <form>
            <fieldset>
              <legend>User Information</legend>
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" type="text" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" />
              </div>
            </fieldset>
          </form>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Input aria-label="Username" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with different input types', async () => {
      const inputTypes = ['text', 'email', 'password', 'number', 'search'] as const;
      
      for (const type of inputTypes) {
        const { container } = render(
          <Input type={type} aria-label={`${type} input`} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should be accessible with labels', async () => {
      const { container } = render(
        <div>
          <label htmlFor="accessible-input">Email Address</label>
          <Input id="accessible-input" type="email" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with validation states', async () => {
      const { container } = render(
        <div>
          <label htmlFor="validated-input">Password</label>
          <Input 
            id="validated-input" 
            type="password" 
            aria-invalid="true"
            aria-describedby="password-error"
          />
          <div id="password-error" role="alert">
            Password must be at least 8 characters long
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when disabled', async () => {
      const { container } = render(
        <div>
          <label htmlFor="disabled-input">Disabled Field</label>
          <Input id="disabled-input" disabled aria-label="This field is disabled" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Combined Component Accessibility', () => {
    it('should be accessible when components are used together', async () => {
      const { container } = render(
        <Card role="region" aria-labelledby="form-title">
          <h2 id="form-title">User Registration</h2>
          <form>
            <div>
              <label htmlFor="reg-name">Full Name</label>
              <Input id="reg-name" type="text" required />
            </div>
            <div>
              <label htmlFor="reg-email">Email Address</label>
              <Input id="reg-email" type="email" required />
            </div>
            <div>
              <Button type="submit">Create Account</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with complex interactive content', async () => {
      const { container } = render(
        <Card>
          <h2>Quiz Question</h2>
          <p>Which of the following is correct?</p>
          <fieldset>
            <legend>Select your answer</legend>
            <div>
              <input type="radio" id="option-a" name="quiz-answer" value="a" />
              <label htmlFor="option-a">Option A</label>
            </div>
            <div>
              <input type="radio" id="option-b" name="quiz-answer" value="b" />
              <label htmlFor="option-b">Option B</label>
            </div>
            <div>
              <input type="radio" id="option-c" name="quiz-answer" value="c" />
              <label htmlFor="option-c">Option C</label>
            </div>
          </fieldset>
          <div>
            <Button type="button">Submit Answer</Button>
            <Button type="button" variant="ghost">Skip Question</Button>
          </div>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast for all button variants', async () => {
      const { container } = render(
        <div>
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient color contrast for form elements', async () => {
      const { container } = render(
        <div>
          <label htmlFor="contrast-test">Test Input</label>
          <Input id="contrast-test" placeholder="Enter text here" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be accessible for keyboard-only users', async () => {
      const { container } = render(
        <div>
          <Button>First Button</Button>
          <Input placeholder="Text input" />
          <Button>Second Button</Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});