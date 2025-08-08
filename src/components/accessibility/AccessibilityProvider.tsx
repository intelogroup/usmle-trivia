import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { accessibilityService } from '../../services/accessibilityService';

interface AccessibilityContextType {
  service: typeof accessibilityService;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize accessibility features when the provider mounts
    const initializeAccessibility = () => {
      // Create SVG filters for color blindness support
      createColorBlindnessFilters();
      
      // Add skip links to the page
      createSkipLinks();
      
      // Initialize keyboard shortcuts
      initializeKeyboardShortcuts();
      
      // Set up page-level announcements
      announcePageLoad();
    };

    initializeAccessibility();
  }, []);

  const createColorBlindnessFilters = () => {
    // Create SVG filters for color blindness simulation
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'accessibility-svg-filters');
    svg.setAttribute('aria-hidden', 'true');
    
    // Deuteranopia filter (green-blind)
    const deuteranopiaFilter = document.createElementNS(svgNS, 'filter');
    deuteranopiaFilter.setAttribute('id', 'deuteranopia-filter');
    
    const deuteranopiaMatrix = document.createElementNS(svgNS, 'feColorMatrix');
    deuteranopiaMatrix.setAttribute('type', 'matrix');
    deuteranopiaMatrix.setAttribute('values', '0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0');
    
    deuteranopiaFilter.appendChild(deuteranopiaMatrix);
    svg.appendChild(deuteranopiaFilter);
    
    // Protanopia filter (red-blind)
    const protanopiaFilter = document.createElementNS(svgNS, 'filter');
    protanopiaFilter.setAttribute('id', 'protanopia-filter');
    
    const protanopiaMatrix = document.createElementNS(svgNS, 'feColorMatrix');
    protanopiaMatrix.setAttribute('type', 'matrix');
    protanopiaMatrix.setAttribute('values', '0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0');
    
    protanopiaFilter.appendChild(protanopiaMatrix);
    svg.appendChild(protanopiaFilter);
    
    // Tritanopia filter (blue-blind)
    const tritanopiaFilter = document.createElementNS(svgNS, 'filter');
    tritanopiaFilter.setAttribute('id', 'tritanopia-filter');
    
    const tritanopiaMatrix = document.createElementNS(svgNS, 'feColorMatrix');
    tritanopiaMatrix.setAttribute('type', 'matrix');
    tritanopiaMatrix.setAttribute('values', '0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0');
    
    tritanopiaFilter.appendChild(tritanopiaMatrix);
    svg.appendChild(tritanopiaFilter);
    
    document.body.appendChild(svg);
  };

  const createSkipLinks = () => {
    // Create skip navigation links
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.setAttribute('class', 'skip-links');
    skipLinksContainer.setAttribute('aria-label', 'Skip navigation links');
    
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#quiz-content', text: 'Skip to quiz' },
      { href: '#navigation', text: 'Skip to navigation' },
    ];
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.setAttribute('href', link.href);
      skipLink.setAttribute('class', 'skip-link');
      skipLink.textContent = link.text;
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.href);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          accessibilityService.announce(`Skipped to ${link.text.toLowerCase()}`);
        }
      });
      
      skipLinksContainer.appendChild(skipLink);
    });
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  };

  const initializeKeyboardShortcuts = () => {
    // Enhanced keyboard shortcuts for medical education platform
    const shortcuts = new Map([
      ['Alt+KeyR', () => announceCurrentQuestion()],
      ['Alt+KeyE', () => announceCurrentExplanation()],
      ['Alt+KeyN', () => announceAction('Moving to next question')],
      ['Alt+KeyP', () => announceAction('Moving to previous question')],
      ['Alt+KeyS', () => announceAction('Submitting answer')],
      ['Alt+KeyH', () => announceKeyboardHelp()],
      ['Alt+KeyA', () => openAccessibilitySettings()],
      ['Escape', () => handleEscapeKey()],
    ]);

    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      const shortcutKey = `${e.altKey ? 'Alt+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.code}`;
      const handler = shortcuts.get(shortcutKey);
      
      if (handler) {
        e.preventDefault();
        handler();
      }
    });
  };

  const announceCurrentQuestion = () => {
    const questionElement = document.querySelector('[role="main"] h2, .quiz-question h3, .question-text');
    if (questionElement) {
      const questionText = questionElement.textContent || '';
      accessibilityService.announceMedicalContent(`Current question: ${questionText}`, true);
    } else {
      accessibilityService.announce('No question content found on this page');
    }
  };

  const announceCurrentExplanation = () => {
    const explanationElement = document.querySelector('#explanation, .explanation-text, [data-explanation]');
    if (explanationElement) {
      const explanationText = explanationElement.textContent || '';
      accessibilityService.announceMedicalContent(`Explanation: ${explanationText}`, true);
    } else {
      accessibilityService.announce('No explanation available or explanation not yet revealed');
    }
  };

  const announceAction = (action: string) => {
    accessibilityService.announce(action, { priority: 'polite', clear: false });
  };

  const announceKeyboardHelp = () => {
    const help = `
      Medical Education Platform Keyboard Shortcuts:
      Alt + R: Read current question with medical term definitions
      Alt + E: Read explanation with expanded abbreviations
      Alt + N: Navigate to next question
      Alt + P: Navigate to previous question  
      Alt + S: Submit current answer
      Alt + A: Open accessibility settings
      Alt + H: Repeat this help message
      Escape: Close dialogs and modals
      Tab: Navigate between interactive elements
      Space or Enter: Activate buttons and select options
      Arrow keys: Navigate between answer choices
    `;
    accessibilityService.announce(help, { priority: 'assertive', clear: true });
  };

  const openAccessibilitySettings = () => {
    // Trigger accessibility settings modal
    const event = new CustomEvent('openAccessibilitySettings');
    document.dispatchEvent(event);
    accessibilityService.announce('Opening accessibility settings');
  };

  const handleEscapeKey = () => {
    // Close any open modals or dialogs
    const modals = document.querySelectorAll('[role="dialog"], .modal, .popover');
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1] as HTMLElement;
      const closeButton = lastModal.querySelector('[aria-label*="close"], [data-close], .close-btn') as HTMLElement;
      if (closeButton) {
        closeButton.click();
        accessibilityService.announce('Dialog closed');
      }
    }
  };

  const announcePageLoad = () => {
    // Announce page context when it loads
    setTimeout(() => {
      const pageTitle = document.title;
      const mainHeading = document.querySelector('h1')?.textContent;
      const pageType = document.body.getAttribute('data-page-type') || 'page';
      
      let announcement = `${pageTitle} loaded`;
      if (mainHeading && mainHeading !== pageTitle) {
        announcement += `. Main heading: ${mainHeading}`;
      }
      announcement += `. This is a ${pageType.replace('-', ' ')} in the medical education platform`;
      
      // Add navigation context
      const quizElements = document.querySelectorAll('.quiz-question, [role="radiogroup"]');
      if (quizElements.length > 0) {
        announcement += '. Quiz interface detected. Use Alt + H for keyboard shortcuts';
      }
      
      accessibilityService.announce(announcement, { 
        priority: 'polite', 
        clear: true,
        delay: 1000 // Allow page to fully load
      });
    }, 500);
  };

  return (
    <AccessibilityContext.Provider value={{ service: accessibilityService }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

// Enhanced Quiz Accessibility Hook
export const useQuizAccessibility = () => {
  const { service } = useAccessibilityContext();

  const announceQuizStart = (mode: string, totalQuestions: number, timeLimit?: number) => {
    let announcement = `Starting ${mode} quiz with ${totalQuestions} questions`;
    if (timeLimit) {
      const minutes = Math.floor(timeLimit / 60);
      announcement += `. Time limit: ${minutes} minutes`;
    }
    announcement += '. Use Alt + H for keyboard shortcuts during the quiz';
    
    service.announce(announcement, { priority: 'assertive', clear: true });
  };

  const announceQuestionChange = (questionNumber: number, totalQuestions: number, category: string) => {
    const announcement = `Question ${questionNumber} of ${totalQuestions}. Category: ${category}. Question loaded and ready for interaction`;
    service.announce(announcement, { priority: 'polite', clear: true });
  };

  const announceAnswerSelection = (optionLabel: string, optionText: string) => {
    service.announce(`Selected option ${optionLabel}: ${optionText}`, { priority: 'polite', clear: false });
  };

  const announceCorrectAnswer = (isCorrect: boolean, correctAnswer: string, explanation: string) => {
    let announcement = isCorrect ? 'Correct answer! ' : 'Incorrect answer. ';
    announcement += `The correct answer is: ${correctAnswer}. `;
    
    service.announce(announcement, { priority: 'assertive', clear: true });
    
    // Announce explanation with medical terms expanded
    setTimeout(() => {
      service.announceMedicalContent(`Explanation: ${explanation}`, true);
    }, 2000);
  };

  const announceQuizComplete = (score: number, totalQuestions: number, timeSpent: number) => {
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    const announcement = `Quiz completed! Final score: ${score} percent. Time spent: ${minutes} minutes and ${seconds} seconds. Results page loaded with detailed performance analysis`;
    service.announce(announcement, { priority: 'assertive', clear: true });
  };

  const announceTimeWarning = (timeRemaining: number) => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    let announcement = 'Time warning: ';
    if (timeRemaining <= 60) {
      announcement += `${seconds} seconds remaining!`;
    } else if (timeRemaining <= 300) {
      announcement += `${minutes} minutes and ${seconds} seconds remaining`;
    }
    
    service.announce(announcement, { priority: 'assertive', clear: true });
  };

  return {
    announceQuizStart,
    announceQuestionChange,
    announceAnswerSelection,
    announceCorrectAnswer,
    announceQuizComplete,
    announceTimeWarning,
    service
  };
};

// Medical Content Accessibility Hook
export const useMedicalContentAccessibility = () => {
  const { service } = useAccessibilityContext();

  const announceWithMedicalContext = (content: string, includeDefinitions = true) => {
    service.announceMedicalContent(content, includeDefinitions);
  };

  const createMedicalTermTooltip = (term: string, definition: string) => {
    return {
      'aria-describedby': `tooltip-${term.replace(/\s+/g, '-')}`,
      'data-medical-term': term,
      'data-definition': definition,
      className: 'medical-term'
    };
  };

  const createAbbreviationExpansion = (abbrev: string, expansion: string) => {
    return {
      'aria-label': `${abbrev}, ${expansion}`,
      'data-abbreviation': abbrev,
      'data-expansion': expansion,
      className: 'medical-abbrev',
      title: expansion
    };
  };

  return {
    announceWithMedicalContext,
    createMedicalTermTooltip,
    createAbbreviationExpansion,
    service
  };
};