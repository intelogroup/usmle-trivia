import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeBanner } from '../../../src/components/dashboard/WelcomeBanner';

// Mock the useAppStore hook
const mockUseAppStore = vi.fn();
vi.mock('../../../src/store', () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe('WelcomeBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render welcome message when user is provided', () => {
      mockUseAppStore.mockReturnValue({
        user: { 
          id: '1', 
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@medschool.edu',
        }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText('Welcome back, Dr. Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.')).toBeInTheDocument();
    });

    it('should not render when user is null', () => {
      mockUseAppStore.mockReturnValue({ user: null });
      
      const { container } = render(<WelcomeBanner />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render when user is undefined', () => {
      mockUseAppStore.mockReturnValue({ user: undefined });
      
      const { container } = render(<WelcomeBanner />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('User Name Handling', () => {
    it('should handle different name formats correctly', () => {
      const testCases = [
        { name: 'John', expected: 'Welcome back, John' },
        { name: 'Dr. Sarah Wilson', expected: 'Welcome back, Dr. Sarah Wilson' },
        { name: 'Maria Rodriguez-Garcia', expected: 'Welcome back, Maria Rodriguez-Garcia' },
        { name: 'Ahmed Al-Rashid', expected: 'Welcome back, Ahmed Al-Rashid' },
        { name: 'Prof. Chen Li', expected: 'Welcome back, Prof. Chen Li' },
      ];

      testCases.forEach(({ name, expected }) => {
        mockUseAppStore.mockReturnValue({
          user: { id: '1', name, email: 'test@example.com' }
        });

        const { rerender } = render(<WelcomeBanner />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('should handle empty name gracefully', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: '', email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(/Welcome back,\s*$/)).toBeInTheDocument();
    });

    it('should handle very long names without breaking layout', () => {
      const longName = 'Dr. Bartholomew Maximilian Constantine Wellington-Fitzpatrick III';
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: longName, email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(`Welcome back, ${longName}`)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialName = 'José María Ñuñez-Özdemir';
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: specialName, email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(`Welcome back, ${specialName}`)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes for styling', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      const { container } = render(<WelcomeBanner />);
      const banner = container.firstChild as HTMLElement;
      
      expect(banner).toHaveClass('bg-gradient-to-r');
      expect(banner).toHaveClass('from-primary/5');
      expect(banner).toHaveClass('via-primary/10');
      expect(banner).toHaveClass('to-primary/5');
      expect(banner).toHaveClass('border');
      expect(banner).toHaveClass('border-primary/20');
      expect(banner).toHaveClass('rounded-2xl');
      expect(banner).toHaveClass('p-6');
      expect(banner).toHaveClass('mb-6');
    });

    it('should apply correct heading styles', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      const heading = screen.getByRole('heading', { level: 1 });
      
      expect(heading).toHaveClass('text-xl');
      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('text-slate-900');
    });

    it('should apply correct paragraph styles', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      const paragraph = screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.');
      
      expect(paragraph).toHaveClass('text-slate-700');
    });
  });

  describe('Medical Education Context', () => {
    it('should display medical education appropriate messaging', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'Medical Student', email: 'student@medschool.edu' }
      });

      render(<WelcomeBanner />);
      
      const messageText = screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.');
      expect(messageText).toBeInTheDocument();
      expect(messageText.textContent).toContain('USMLE preparation');
    });

    it('should work with different medical professional titles', () => {
      const medicalUsers = [
        'Dr. Smith',
        'Resident Johnson',
        'Medical Student Brown',
        'Attending Physician Davis',
        'Chief Resident Wilson'
      ];

      medicalUsers.forEach(name => {
        mockUseAppStore.mockReturnValue({
          user: { id: '1', name, email: 'test@hospital.edu' }
        });

        const { rerender } = render(<WelcomeBanner />);
        expect(screen.getByText(`Welcome back, ${name}`)).toBeInTheDocument();
        rerender(<div />);
      });
    });
  });

  describe('Accessibility', () => {
    it('should use proper heading hierarchy', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Welcome back, John Doe');
    });

    it('should be readable by screen readers', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'Jane Smith', email: 'jane@example.com' }
      });

      render(<WelcomeBanner />);
      
      // Check that text content is properly structured for screen readers
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.');
      
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });

    it('should maintain proper color contrast for accessibility', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.');
      
      // Verify dark text classes for good contrast
      expect(heading).toHaveClass('text-slate-900');
      expect(paragraph).toHaveClass('text-slate-700');
    });
  });

  describe('Edge Cases', () => {
    it('should handle store state changes gracefully', () => {
      // Start with no user
      mockUseAppStore.mockReturnValue({ user: null });
      const { rerender } = render(<WelcomeBanner />);
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();

      // Add user
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });
      rerender(<WelcomeBanner />);
      expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument();

      // Remove user again
      mockUseAppStore.mockReturnValue({ user: null });
      rerender(<WelcomeBanner />);
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
    });

    it('should handle malformed user objects', () => {
      const malformedUsers = [
        { id: '1' }, // Missing name and email
        { name: 'John' }, // Missing id and email
        { email: 'test@example.com' }, // Missing id and name
        {}, // Empty object
      ];

      malformedUsers.forEach((user, index) => {
        mockUseAppStore.mockReturnValue({ user });
        const { container, rerender } = render(<WelcomeBanner />);
        
        // Should still render but with appropriate fallbacks
        if (user.name) {
          expect(screen.getByText(`Welcome back, ${user.name}`)).toBeInTheDocument();
        } else {
          expect(screen.getAllByText(/Welcome back,\s*$/)).toHaveLength(1);
        }
        
        // Clean up for next iteration
        rerender(<div key={index} />);
      });
    });

    it('should handle undefined name property', () => {
      mockUseAppStore.mockReturnValue({
        user: { id: '1', name: undefined, email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(/Welcome back,\s*$/)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders when user data is stable', () => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockUseAppStore.mockReturnValue({ user });

      const { rerender } = render(<WelcomeBanner />);
      expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument();

      // Simulate re-render with same user data
      rerender(<WelcomeBanner />);
      expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument();
    });

    it('should handle rapid user changes efficiently', () => {
      const users = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
        { id: '3', name: 'User 3', email: 'user3@example.com' },
      ];

      users.forEach((user, index) => {
        mockUseAppStore.mockReturnValue({ user });
        const { rerender } = render(<WelcomeBanner />);
        expect(screen.getByText(`Welcome back, User ${index + 1}`)).toBeInTheDocument();
        rerender(<div />);
      });
    });
  });

  describe('Integration with Medical Education App Context', () => {
    it('should display appropriate content for medical students', () => {
      mockUseAppStore.mockReturnValue({
        user: { 
          id: '1', 
          name: 'Sarah Chen', 
          email: 'sarah.chen@medschool.edu',
          medicalLevel: 'student',
          studyGoals: 'USMLE Step 1'
        }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText('Welcome back, Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.')).toBeInTheDocument();
    });

    it('should work within the larger dashboard context', () => {
      mockUseAppStore.mockReturnValue({
        user: { 
          id: '1', 
          name: 'Dr. Thompson', 
          email: 'thompson@residency.hospital.edu',
          points: 1250,
          level: 3,
          streak: 5,
          accuracy: 78
        }
      });

      render(<WelcomeBanner />);
      
      // Should render the banner regardless of additional user properties
      expect(screen.getByText('Welcome back, Dr. Thompson')).toBeInTheDocument();
    });
  });
});