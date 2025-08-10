import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeBanner } from '../../../src/components/dashboard/WelcomeBanner';
import { createMockUser } from '../../utils/testUtils';

// Mock the useAuth hook from convexAuth service
const mockUseAuth = vi.fn();
vi.mock('../../../src/services/convexAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('WelcomeBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render welcome message when user is provided', () => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ 
          id: '1', 
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@medschool.edu',
        }),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText('Welcome back, Dr. Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Ready for your next study session?')).toBeInTheDocument();
    });

    it('should not render when user is null', () => {
      mockUseAuth.mockReturnValue({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      const { container } = render(<WelcomeBanner />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render when user is undefined', () => {
      mockUseAuth.mockReturnValue({ 
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
      });
      
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
        mockUseAuth.mockReturnValue({
          user: createMockUser({ id: '1', name, email: 'test@example.com' }),
          isAuthenticated: true,
          isLoading: false,
        });

        const { rerender } = render(<WelcomeBanner />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('should handle empty name gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ id: '1', name: '', email: 'test@example.com' }),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(/Welcome back,\s*$/)).toBeInTheDocument();
    });

    it('should handle very long names without breaking layout', () => {
      const longName = 'Dr. Bartholomew Maximilian Constantine Wellington-Fitzpatrick III';
      mockUseAuth.mockReturnValue({
        user: createMockUser({ id: '1', name: longName, email: 'test@example.com' }),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(`Welcome back, ${longName}`)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialName = 'José María Ñuñez-Özdemir';
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: specialName, email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(`Welcome back, ${specialName}`)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes for styling', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      const { container } = render(<WelcomeBanner />);
      const banner = container.firstChild as HTMLElement;
      
      // The component has a simple mb-6 class on the outer div
      expect(banner).toHaveClass('mb-6');
    });

    it('should apply correct heading styles', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      const heading = screen.getByRole('heading', { level: 1 });
      
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-semibold');
      expect(heading).toHaveClass('text-gray-900');
    });

    it('should apply correct paragraph styles', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      const paragraph = screen.getByText('Ready for your next study session?');
      
      expect(paragraph).toHaveClass('text-gray-600');
      expect(paragraph).toHaveClass('mt-1');
    });
  });

  describe('Medical Education Context', () => {
    it('should display medical education appropriate messaging', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'Medical Student', email: 'student@medschool.edu' }
      });

      render(<WelcomeBanner />);
      
      const messageText = screen.getByText('Ready for your next study session?');
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
        mockUseAuth.mockReturnValue({
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
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Welcome back, John Doe');
    });

    it('should be readable by screen readers', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'Jane Smith', email: 'jane@example.com' }
      });

      render(<WelcomeBanner />);
      
      // Check that text content is properly structured for screen readers
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Ready for your next study session?');
      
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });

    it('should maintain proper color contrast for accessibility', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });

      render(<WelcomeBanner />);
      
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Ready for your next study session?');
      
      // Verify dark text classes for good contrast
      expect(heading).toHaveClass('text-gray-900');
      expect(paragraph).toHaveClass('text-gray-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle store state changes gracefully', () => {
      // Start with no user
      mockUseAuth.mockReturnValue({ user: null });
      const { rerender } = render(<WelcomeBanner />);
      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();

      // Add user
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      });
      rerender(<WelcomeBanner />);
      expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument();

      // Remove user again
      mockUseAuth.mockReturnValue({ user: null });
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
        mockUseAuth.mockReturnValue({ user });
        const { rerender } = render(<WelcomeBanner />);
        
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
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: undefined, email: 'test@example.com' }
      });

      render(<WelcomeBanner />);
      
      expect(screen.getByText(/Welcome back,\s*$/)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders when user data is stable', () => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockUseAuth.mockReturnValue({ user });

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
        mockUseAuth.mockReturnValue({ user });
        const { rerender } = render(<WelcomeBanner />);
        expect(screen.getByText(`Welcome back, User ${index + 1}`)).toBeInTheDocument();
        rerender(<div />);
      });
    });
  });

  describe('Integration with Medical Education App Context', () => {
    it('should display appropriate content for medical students', () => {
      mockUseAuth.mockReturnValue({
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
      expect(screen.getByText('Ready for your next study session?')).toBeInTheDocument();
    });

    it('should work within the larger dashboard context', () => {
      mockUseAuth.mockReturnValue({
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