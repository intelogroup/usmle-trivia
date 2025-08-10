/**
 * Accessibility Hooks and Utilities
 * Provides keyboard navigation, focus management, and ARIA support
 * For MedQuiz Pro - Medical Education Platform
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Keyboard navigation hook
 */
export const useKeyboardNavigation = (options: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  enabled?: boolean;
}) => {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }, [enabled, onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  return { handleKeyDown };
};

/**
 * Focus management hook
 */
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocusRef = useCallback((element: HTMLElement | null) => {
    focusRef.current = element;
  }, []);

  const focusElement = useCallback((element?: HTMLElement | null) => {
    const targetElement = element || focusRef.current;
    if (targetElement) {
      targetElement.focus();
    }
  }, []);

  const focusFirst = useCallback((container?: HTMLElement) => {
    const containerElement = container || document;
    const firstFocusable = containerElement.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  const focusLast = useCallback((container?: HTMLElement) => {
    const containerElement = container || document;
    const focusableElements = containerElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (lastFocusable) {
      lastFocusable.focus();
    }
  }, []);

  return {
    focusRef,
    setFocusRef,
    focusElement,
    focusFirst,
    focusLast
  };
};

/**
 * Focus trap hook for modals and dialogs
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus the first element in the container
    const firstFocusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Roving tabindex hook for keyboard navigation in groups
 */
export const useRovingTabindex = <T extends HTMLElement>(items: T[], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1;
    });
  }, [items, currentIndex]);

  const moveNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const movePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const moveToIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index);
    }
  }, [items.length]);

  return {
    currentIndex,
    moveNext,
    movePrevious,
    moveToIndex
  };
};

/**
 * ARIA live region hook for announcements
 */
export const useAriaLiveRegion = () => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement(message);
    
    // Clear the announcement after a delay to allow screen readers to announce it
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  ), [announcement, politeness]);

  return { announce, LiveRegion };
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Hide element from screen readers
   */
  hide: { 'aria-hidden': 'true' } as const,

  /**
   * Make element readable by screen readers only
   */
  only: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  } as React.CSSProperties,

  /**
   * Create accessible description
   */
  describe: (id: string) => ({ 'aria-describedby': id }),

  /**
   * Create accessible label
   */
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),

  /**
   * Create accessible label
   */
  label: (text: string) => ({ 'aria-label': text })
};

/**
 * Keyboard interaction patterns
 */
export const keyboardPatterns = {
  /**
   * Button pattern (Enter and Space activate)
   */
  button: (onClick: () => void) => ({
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }
  }),

  /**
   * Toggle button pattern
   */
  toggleButton: (isPressed: boolean, onToggle: () => void) => ({
    ...keyboardPatterns.button(onToggle),
    'aria-pressed': isPressed
  }),

  /**
   * Menu button pattern
   */
  menuButton: (isExpanded: boolean, onToggle: () => void, menuId: string) => ({
    ...keyboardPatterns.button(onToggle),
    'aria-expanded': isExpanded,
    'aria-haspopup': 'true',
    'aria-controls': menuId
  }),

  /**
   * Tab pattern
   */
  tab: (isSelected: boolean, onSelect: () => void, panelId: string) => ({
    role: 'tab',
    'aria-selected': isSelected,
    'aria-controls': panelId,
    tabIndex: isSelected ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    }
  }),

  /**
   * Checkbox pattern
   */
  checkbox: (isChecked: boolean, onToggle: () => void) => ({
    role: 'checkbox',
    'aria-checked': isChecked,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }
  })
};

/**
 * ARIA attributes helpers
 */
export const aria = {
  /**
   * Required field indicator
   */
  required: { 'aria-required': 'true' } as const,

  /**
   * Invalid field indicator
   */
  invalid: { 'aria-invalid': 'true' } as const,

  /**
   * Disabled element
   */
  disabled: { 'aria-disabled': 'true' } as const,

  /**
   * Loading state
   */
  busy: { 'aria-busy': 'true' } as const,

  /**
   * Expanded state
   */
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),

  /**
   * Selected state
   */
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),

  /**
   * Checked state
   */
  checked: (isChecked: boolean) => ({ 'aria-checked': isChecked }),

  /**
   * Pressed state
   */
  pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),

  /**
   * Owns relationship
   */
  owns: (id: string) => ({ 'aria-owns': id }),

  /**
   * Controls relationship
   */
  controls: (id: string) => ({ 'aria-controls': id }),

  /**
   * Described by relationship
   */
  describedBy: (id: string) => ({ 'aria-describedby': id }),

  /**
   * Labelled by relationship
   */
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),

  /**
   * Live region
   */
  live: (politeness: 'polite' | 'assertive' = 'polite') => ({ 'aria-live': politeness }),

  /**
   * Atomic region
   */
  atomic: { 'aria-atomic': 'true' } as const
};

/**
 * Generate unique IDs for ARIA relationships
 */
export const useAriaIds = (prefix: string) => {
  const baseId = useRef(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  
  return {
    id: baseId.current,
    labelId: `${baseId.current}-label`,
    descriptionId: `${baseId.current}-description`,
    errorId: `${baseId.current}-error`,
    helpId: `${baseId.current}-help`
  };
};