/**
 * Advanced Accessibility Service
 * Comprehensive accessibility utilities and ARIA enhancements for medical education platform
 * WCAG 2.1 AA compliant with medical education specific optimizations
 */

import { useEffect, useRef, useCallback } from 'react';

// Accessibility preferences and settings
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  autoSpeak: boolean;
  focusIndicators: 'standard' | 'enhanced' | 'high-contrast';
  colorBlindnessMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

// Focus management
export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  role?: string;
  ariaLabel?: string;
}

// Screen reader announcements
export interface AnnouncementOptions {
  priority: 'polite' | 'assertive' | 'off';
  clear: boolean;
  delay?: number;
}

// Medical content accessibility enhancements
export interface MedicalContentAccessibility {
  medicalTerms: Map<string, string>; // term -> pronunciation/definition
  abbreviations: Map<string, string>; // abbreviation -> full form
  pronunciationGuide: Map<string, string>; // complex terms -> phonetic
}

export class AccessibilityService {
  private preferences: AccessibilityPreferences;
  private focusHistory: HTMLElement[] = [];
  private announcer: HTMLElement | null = null;
  private medicalContent: MedicalContentAccessibility;
  
  constructor() {
    this.preferences = this.loadPreferences();
    this.medicalContent = {
      medicalTerms: new Map([
        ['myocardial infarction', 'Heart attack - death of heart muscle tissue'],
        ['pneumonia', 'Infection and inflammation of the lungs'],
        ['hypertension', 'High blood pressure - persistently elevated arterial pressure'],
        ['diabetes mellitus', 'Chronic metabolic disorder with high blood sugar levels'],
        ['arrhythmia', 'Irregular heartbeat or heart rhythm disorder'],
        ['ischemia', 'Reduced blood supply to tissues causing oxygen shortage'],
        ['tachycardia', 'Fast heart rate - over 100 beats per minute at rest'],
        ['bradycardia', 'Slow heart rate - under 60 beats per minute at rest']
      ]),
      abbreviations: new Map([
        ['MI', 'Myocardial Infarction'],
        ['HTN', 'Hypertension'],
        ['DM', 'Diabetes Mellitus'],
        ['COPD', 'Chronic Obstructive Pulmonary Disease'],
        ['CHF', 'Congestive Heart Failure'],
        ['CAD', 'Coronary Artery Disease'],
        ['DVT', 'Deep Vein Thrombosis'],
        ['PE', 'Pulmonary Embolism'],
        ['CVA', 'Cerebrovascular Accident'],
        ['TIA', 'Transient Ischemic Attack']
      ]),
      pronunciationGuide: new Map([
        ['pneumonoultramicroscopicsilicovolcanoconiosise', 'new-moh-noh-ul-trah-my-kroh-skop-ik-sil-ik-oh-vol-kay-noh-koh-nee-oh-sis'],
        ['peritoneocentesis', 'per-ih-toh-nee-oh-sen-tee-sis'],
        ['cholecystectomy', 'koh-leh-sis-tek-toh-mee'],
        ['endotracheal', 'en-doh-tray-kee-al'],
        ['sphygmomanometer', 'sfig-moh-mah-nom-eh-ter']
      ])
    };
    
    this.initializeAccessibility();
  }

  /**
   * Initialize accessibility features on page load
   */
  private initializeAccessibility(): void {
    this.createAnnouncementRegion();
    this.applyAccessibilityPreferences();
    this.setupKeyboardNavigation();
    this.detectScreenReader();
    this.setupReducedMotion();
  }

  /**
   * Create ARIA live region for announcements
   */
  private createAnnouncementRegion(): void {
    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.setAttribute('class', 'sr-only');
      this.announcer.setAttribute('id', 'accessibility-announcer');
      document.body.appendChild(this.announcer);
    }
  }

  /**
   * Announce content to screen readers
   */
  announce(message: string, options: AnnouncementOptions = { priority: 'polite', clear: false }): void {
    if (!this.announcer) return;

    if (options.clear) {
      this.announcer.textContent = '';
    }

    this.announcer.setAttribute('aria-live', options.priority);

    const announceText = () => {
      if (this.announcer) {
        this.announcer.textContent = message;
      }
    };

    if (options.delay) {
      setTimeout(announceText, options.delay);
    } else {
      // Small delay to ensure screen readers pick up changes
      setTimeout(announceText, 100);
    }
  }

  /**
   * Enhanced medical content announcements
   */
  announceMedicalContent(content: string, includeDefinitions = true): void {
    let enhancedContent = content;

    if (includeDefinitions) {
      // Expand abbreviations
      this.medicalContent.abbreviations.forEach((fullForm, abbrev) => {
        const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
        enhancedContent = enhancedContent.replace(regex, `${abbrev}, ${fullForm}`);
      });

      // Add definitions for complex medical terms
      this.medicalContent.medicalTerms.forEach((definition, term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (enhancedContent.toLowerCase().includes(term)) {
          enhancedContent = enhancedContent.replace(regex, `${term}, defined as ${definition}`);
        }
      });
    }

    this.announce(enhancedContent);
  }

  /**
   * Quiz-specific accessibility announcements
   */
  announceQuizState(state: {
    questionNumber: number;
    totalQuestions: number;
    timeRemaining?: number;
    answered?: boolean;
    correct?: boolean;
  }): void {
    const { questionNumber, totalQuestions, timeRemaining, answered, correct } = state;
    
    let announcement = `Question ${questionNumber} of ${totalQuestions}`;
    
    if (timeRemaining !== undefined && timeRemaining < 120) {
      announcement += `. Warning: ${Math.floor(timeRemaining / 60)} minutes and ${timeRemaining % 60} seconds remaining`;
    }
    
    if (answered !== undefined) {
      if (answered) {
        announcement += `. Answer selected`;
        if (correct !== undefined) {
          announcement += correct ? '. Correct answer' : '. Incorrect answer';
        }
      } else {
        announcement += `. No answer selected yet`;
      }
    }

    this.announce(announcement, { priority: 'polite', clear: true });
  }

  /**
   * Advanced focus management
   */
  manageFocus(): {
    saveFocus: () => void;
    restoreFocus: () => void;
    trapFocus: (container: HTMLElement) => () => void;
    moveFocusToElement: (element: HTMLElement | null) => void;
  } {
    const saveFocus = () => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== document.body) {
        this.focusHistory.push(activeElement);
      }
    };

    const restoreFocus = () => {
      const lastFocused = this.focusHistory.pop();
      if (lastFocused && lastFocused.isConnected) {
        lastFocused.focus();
      }
    };

    const trapFocus = (container: HTMLElement) => {
      const focusableElements = this.getFocusableElements(container);
      if (focusableElements.length === 0) return () => {};

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      firstElement.focus();

      return () => {
        container.removeEventListener('keydown', handleTabKey);
      };
    };

    const moveFocusToElement = (element: HTMLElement | null) => {
      if (element && element.isConnected) {
        element.focus();
        // Ensure focus is visible
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    return { saveFocus, restoreFocus, trapFocus, moveFocusToElement };
  }

  /**
   * Get all focusable elements in container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  /**
   * Keyboard navigation utilities
   */
  private setupKeyboardNavigation(): void {
    // Enhanced keyboard shortcuts for medical education
    const shortcuts = {
      'r': () => this.announce('Reading question content', { priority: 'assertive', clear: true }),
      'e': () => this.announce('Reading explanation', { priority: 'assertive', clear: true }),
      'n': () => this.announce('Moving to next question', { priority: 'polite', clear: true }),
      'p': () => this.announce('Moving to previous question', { priority: 'polite', clear: true }),
      's': () => this.announce('Submitting answer', { priority: 'polite', clear: true }),
      'h': () => this.announceKeyboardHelp()
    };

    document.addEventListener('keydown', (e) => {
      // Only activate shortcuts when not in form inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.altKey && shortcuts[e.key.toLowerCase() as keyof typeof shortcuts]) {
        e.preventDefault();
        shortcuts[e.key.toLowerCase() as keyof typeof shortcuts]();
      }
    });
  }

  /**
   * Announce available keyboard shortcuts
   */
  private announceKeyboardHelp(): void {
    const help = `
      Keyboard shortcuts available:
      Alt + R: Read current question
      Alt + E: Read explanation  
      Alt + N: Next question
      Alt + P: Previous question
      Alt + S: Submit answer
      Alt + H: Repeat this help
      Tab and Shift+Tab to navigate between elements
      Space or Enter to select options
    `;
    this.announce(help, { priority: 'assertive', clear: true });
  }

  /**
   * Screen reader detection
   */
  private detectScreenReader(): void {
    // Detect common screen readers
    const userAgent = navigator.userAgent.toLowerCase();
    const isScreenReader = userAgent.includes('nvda') || 
                          userAgent.includes('jaws') || 
                          userAgent.includes('dragon') ||
                          userAgent.includes('voiceover') ||
                          // Check for high contrast mode as indicator
                          window.matchMedia('(prefers-contrast: high)').matches ||
                          // Check for reduced motion as indicator
                          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isScreenReader) {
      this.preferences.screenReader = true;
      this.preferences.autoSpeak = true;
      this.updatePreferences(this.preferences);
    }
  }

  /**
   * High contrast mode support
   */
  enableHighContrast(enable = true): void {
    const root = document.documentElement;
    if (enable) {
      root.classList.add('accessibility-high-contrast');
      this.announce('High contrast mode enabled');
    } else {
      root.classList.remove('accessibility-high-contrast');
      this.announce('High contrast mode disabled');
    }
    
    this.preferences.highContrast = enable;
    this.updatePreferences(this.preferences);
  }

  /**
   * Large text support
   */
  enableLargeText(enable = true): void {
    const root = document.documentElement;
    if (enable) {
      root.classList.add('accessibility-large-text');
      this.announce('Large text mode enabled');
    } else {
      root.classList.remove('accessibility-large-text');
      this.announce('Large text mode disabled');
    }
    
    this.preferences.largeText = enable;
    this.updatePreferences(this.preferences);
  }

  /**
   * Reduced motion support
   */
  private setupReducedMotion(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      this.preferences.reducedMotion = true;
      document.documentElement.classList.add('accessibility-reduced-motion');
    }

    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.preferences.reducedMotion = e.matches;
      if (e.matches) {
        document.documentElement.classList.add('accessibility-reduced-motion');
      } else {
        document.documentElement.classList.remove('accessibility-reduced-motion');
      }
      this.updatePreferences(this.preferences);
    });
  }

  /**
   * Color blindness support
   */
  setColorBlindnessMode(mode: AccessibilityPreferences['colorBlindnessMode']): void {
    const root = document.documentElement;
    
    // Remove existing color blindness classes
    root.classList.remove('accessibility-deuteranopia', 'accessibility-protanopia', 'accessibility-tritanopia');
    
    if (mode !== 'none') {
      root.classList.add(`accessibility-${mode}`);
      this.announce(`Color blindness filter applied: ${mode}`);
    } else {
      this.announce('Color blindness filter removed');
    }
    
    this.preferences.colorBlindnessMode = mode;
    this.updatePreferences(this.preferences);
  }

  /**
   * Enhanced ARIA utilities
   */
  createEnhancedARIA() {
    return {
      /**
       * Create comprehensive ARIA label for quiz questions
       */
      createQuestionARIA: (questionData: {
        questionNumber: number;
        totalQuestions: number;
        category: string;
        difficulty: string;
        timeRemaining?: number;
      }) => {
        const { questionNumber, totalQuestions, category, difficulty, timeRemaining } = questionData;
        
        let ariaLabel = `Question ${questionNumber} of ${totalQuestions}. `;
        ariaLabel += `Category: ${category}. Difficulty: ${difficulty}. `;
        
        if (timeRemaining !== undefined) {
          const minutes = Math.floor(timeRemaining / 60);
          const seconds = timeRemaining % 60;
          ariaLabel += `Time remaining: ${minutes} minutes and ${seconds} seconds. `;
        }
        
        return ariaLabel;
      },

      /**
       * Create ARIA attributes for answer options
       */
      createOptionARIA: (optionData: {
        optionIndex: number;
        optionText: string;
        isSelected: boolean;
        isCorrect?: boolean;
        isRevealed?: boolean;
      }) => {
        const { optionIndex, optionText, isSelected, isCorrect, isRevealed } = optionData;
        const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D
        
        let ariaLabel = `Option ${optionLabel}: ${optionText}`;
        
        if (isRevealed) {
          if (isCorrect) {
            ariaLabel += ' - Correct answer';
          } else if (isSelected && !isCorrect) {
            ariaLabel += ' - Incorrect answer, this was your selection';
          }
        } else if (isSelected) {
          ariaLabel += ' - Currently selected';
        }
        
        return {
          'aria-label': ariaLabel,
          'aria-checked': isSelected,
          'aria-describedby': isRevealed ? 'explanation' : undefined
        };
      },

      /**
       * Create live region updates for quiz progress
       */
      createProgressARIA: (progressData: {
        completed: number;
        total: number;
        currentScore?: number;
        timeSpent?: number;
      }) => {
        const { completed, total, currentScore, timeSpent } = progressData;
        const percentage = Math.round((completed / total) * 100);
        
        let announcement = `Quiz progress: ${completed} of ${total} questions completed, ${percentage} percent complete`;
        
        if (currentScore !== undefined) {
          announcement += `. Current score: ${currentScore} percent`;
        }
        
        if (timeSpent !== undefined) {
          const minutes = Math.floor(timeSpent / 60);
          const seconds = timeSpent % 60;
          announcement += `. Time spent: ${minutes} minutes and ${seconds} seconds`;
        }
        
        return announcement;
      }
    };
  }

  /**
   * Load accessibility preferences
   */
  private loadPreferences(): AccessibilityPreferences {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  /**
   * Update accessibility preferences
   */
  updatePreferences(preferences: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
    this.applyAccessibilityPreferences();
  }

  /**
   * Get default accessibility preferences
   */
  private getDefaultPreferences(): AccessibilityPreferences {
    return {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      autoSpeak: false,
      focusIndicators: 'standard',
      colorBlindnessMode: 'none'
    };
  }

  /**
   * Apply accessibility preferences to UI
   */
  private applyAccessibilityPreferences(): void {
    const root = document.documentElement;
    
    // Apply high contrast
    if (this.preferences.highContrast) {
      root.classList.add('accessibility-high-contrast');
    }
    
    // Apply large text
    if (this.preferences.largeText) {
      root.classList.add('accessibility-large-text');
    }
    
    // Apply reduced motion
    if (this.preferences.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    }
    
    // Apply focus indicators
    root.classList.add(`accessibility-focus-${this.preferences.focusIndicators}`);
    
    // Apply color blindness mode
    if (this.preferences.colorBlindnessMode !== 'none') {
      root.classList.add(`accessibility-${this.preferences.colorBlindnessMode}`);
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Test accessibility compliance
   */
  testAccessibility(): {
    missingAltText: Element[];
    missingLabels: Element[];
    lowContrastElements: Element[];
    keyboardInaccessible: Element[];
    missingHeadings: boolean;
    recommendations: string[];
  } {
    const results = {
      missingAltText: Array.from(document.querySelectorAll('img:not([alt])')),
      missingLabels: Array.from(document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])')),
      lowContrastElements: [], // Would require color analysis
      keyboardInaccessible: Array.from(document.querySelectorAll('*[onclick]:not(button):not(a):not([tabindex])')),
      missingHeadings: !document.querySelector('h1, h2, h3, h4, h5, h6'),
      recommendations: []
    };

    // Generate recommendations
    if (results.missingAltText.length > 0) {
      results.recommendations.push(`Add alt text to ${results.missingAltText.length} images`);
    }
    if (results.missingLabels.length > 0) {
      results.recommendations.push(`Add labels to ${results.missingLabels.length} form inputs`);
    }
    if (results.keyboardInaccessible.length > 0) {
      results.recommendations.push(`Make ${results.keyboardInaccessible.length} clickable elements keyboard accessible`);
    }
    if (results.missingHeadings) {
      results.recommendations.push('Add proper heading structure for screen readers');
    }

    return results;
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();

// React hooks for accessibility
export const useAccessibility = () => {
  const focusManager = accessibilityService.manageFocus();
  
  const announce = useCallback((message: string, options?: AnnouncementOptions) => {
    accessibilityService.announce(message, options);
  }, []);
  
  const announceMedical = useCallback((content: string, includeDefinitions = true) => {
    accessibilityService.announceMedicalContent(content, includeDefinitions);
  }, []);
  
  return {
    announce,
    announceMedical,
    focusManager,
    preferences: accessibilityService.getPreferences(),
    updatePreferences: accessibilityService.updatePreferences.bind(accessibilityService),
    createARIA: accessibilityService.createEnhancedARIA()
  };
};

// Focus trap hook
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, active: boolean) => {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const cleanup = accessibilityService.manageFocus().trapFocus(containerRef.current);
    return cleanup;
  }, [active, containerRef]);
};

// Announcement hook
export const useAnnouncement = () => {
  const announce = useCallback((message: string, options?: AnnouncementOptions) => {
    accessibilityService.announce(message, options);
  }, []);
  
  return announce;
};