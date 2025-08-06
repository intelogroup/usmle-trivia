import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '../../../src/components/ui/Input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });

    it('should render with placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('should render with a default value', () => {
      render(<Input defaultValue="Initial value" />);
      const input = screen.getByDisplayValue('Initial value');
      expect(input).toBeInTheDocument();
    });

    it('should render with controlled value', () => {
      render(<Input value="Controlled value" onChange={() => {}} />);
      const input = screen.getByDisplayValue('Controlled value');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render with type="email"', () => {
      render(<Input type="email" placeholder="email@example.com" />);
      const input = screen.getByPlaceholderText('email@example.com');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render with type="password"', () => {
      render(<Input type="password" placeholder="Password" />);
      const input = screen.getByPlaceholderText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render with type="number"', () => {
      render(<Input type="number" min="0" max="100" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should render with type="search"', () => {
      render(<Input type="search" placeholder="Search..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Styling and Classes', () => {
    it('should apply default input styling', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
      expect(input).toHaveClass('border', 'border-input', 'bg-background');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input-class');
    });

    it('should merge custom classes with default classes', () => {
      render(<Input className="text-lg p-4 border-red-500" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('text-lg', 'p-4', 'border-red-500');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test input');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test input');
    });

    it('should handle onFocus and onBlur events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      );
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should be required when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly value="Read only value" />);
      const input = screen.getByDisplayValue('Read only value');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML input attributes', () => {
      render(
        <Input
          id="test-input"
          name="testField"
          autoComplete="email"
          maxLength={50}
          minLength={5}
          data-testid="input-component"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testField');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('maxLength', '50');
      expect(input).toHaveAttribute('minLength', '5');
      expect(input).toHaveAttribute('data-testid', 'input-component');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Search products" />);
      const input = screen.getByLabelText('Search products');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">Enter at least 3 characters</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support aria-invalid for form validation', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should work with labels', () => {
      render(
        <div>
          <label htmlFor="labeled-input">Username</label>
          <Input id="labeled-input" />
        </div>
      );
      
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" defaultValue="testuser" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByDisplayValue('testuser');
      const button = screen.getByRole('button', { name: 'Submit' });
      
      expect(input).toHaveAttribute('name', 'username');
      
      fireEvent.click(button);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      render(<Input value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle null and undefined values gracefully', () => {
      const { rerender } = render(<Input value={undefined} onChange={() => {}} />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      
      rerender(<Input value={null as any} onChange={() => {}} />);
      input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle very long values', () => {
      const longValue = 'a'.repeat(1000);
      render(<Input defaultValue={longValue} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(longValue);
    });
  });
});