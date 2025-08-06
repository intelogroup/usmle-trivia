import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../../../src/components/ui/Card';

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(
        <Card data-testid="test-card">
          <div>Card content</div>
        </Card>
      );
      
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow-custom');
    });

    it('should render children correctly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card description</p>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Card className="custom-card-class" data-testid="custom-card">
          <div>Custom card</div>
        </Card>
      );
      
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML div attributes', () => {
      render(
        <Card
          id="test-card"
          data-testid="card-component"
          role="region"
          aria-label="Information card"
        >
          <div>Test content</div>
        </Card>
      );
      
      const card = screen.getByTestId('card-component');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('data-testid', 'card-component');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Information card');
    });
  });

  describe('Styling', () => {
    it('should have default card styling', () => {
      render(
        <Card data-testid="styled-card">
          <div>Styled card</div>
        </Card>
      );
      
      const card = screen.getByTestId('styled-card');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('shadow-custom');
    });

    it('should merge custom classes with default classes', () => {
      render(
        <Card className="p-8 bg-red-100" data-testid="custom-styled-card">
          <div>Custom styled card</div>
        </Card>
      );
      
      const card = screen.getByTestId('custom-styled-card');
      expect(card).toHaveClass('p-8', 'bg-red-100');
      expect(card).toHaveClass('rounded-xl', 'border');
    });
  });

  describe('Nested Components', () => {
    it('should render complex nested content', () => {
      render(
        <Card>
          <div className="card-header">
            <h3>Card Header</h3>
          </div>
          <div className="card-body">
            <p>Card body content</p>
            <button>Action Button</button>
          </div>
          <div className="card-footer">
            <small>Footer text</small>
          </div>
        </Card>
      );
      
      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
      expect(screen.getByText('Footer text')).toBeInTheDocument();
    });

    it('should work with other UI components', () => {
      render(
        <Card>
          <div className="space-y-4">
            <input type="text" placeholder="Name" />
            <textarea placeholder="Message" />
            <button type="submit">Submit</button>
          </div>
        </Card>
      );
      
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible without additional attributes', () => {
      render(
        <Card>
          <h2>Accessible Card</h2>
          <p>This card is accessible by default</p>
        </Card>
      );
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(screen.getByText('This card is accessible by default')).toBeInTheDocument();
    });

    it('should support ARIA attributes for enhanced accessibility', () => {
      render(
        <Card
          role="article"
          aria-labelledby="card-title"
          aria-describedby="card-description"
        >
          <h2 id="card-title">Article Title</h2>
          <p id="card-description">Article description for screen readers</p>
        </Card>
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
    });
  });

  describe('Responsive Design', () => {
    it('should handle responsive content', () => {
      render(
        <Card className="w-full md:w-1/2 lg:w-1/3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">Main content</div>
            <div className="md:w-48">Sidebar</div>
          </div>
        </Card>
      );
      
      const card = screen.getByText('Main content').closest('[class*="w-full"]');
      expect(card).toHaveClass('w-full', 'md:w-1/2', 'lg:w-1/3');
    });
  });
});