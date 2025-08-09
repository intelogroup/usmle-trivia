# UI States & Error Screens - Minimal Design

This document outlines UI states, loading patterns, and error handling for the MedQuiz Pro minimal light theme, focusing on clear functionality over visual complexity.

## Design Principles for UI States

### Minimal Loading States
- **Clean skeleton placeholders** without complex animations
- **Simple loading indicators** using primary color (#0052CC)
- **Text-based feedback** for screen reader accessibility
- **Subtle animations** respecting prefers-reduced-motion

### Clear Error Communication
- **Plain language messaging** for medical students
- **High contrast error colors** meeting WCAG AA standards
- **Actionable retry options** with clear button labels
- **Accessible error announcements** for assistive technology

## Loading States

### QuestionCard Loading
```jsx
// Minimal skeleton design
<div className="bg-white border border-gray-200 rounded-md p-6">
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
    <div className="space-y-3">
      <div className="h-10 bg-gray-100 rounded border"></div>
      <div className="h-10 bg-gray-100 rounded border"></div>
      <div className="h-10 bg-gray-100 rounded border"></div>
      <div className="h-10 bg-gray-100 rounded border"></div>
    </div>
  </div>
</div>
```

Features:
- **Clean gray backgrounds** for skeleton elements
- **Subtle animation** with simple pulse effect
- **Proper aspect ratios** matching real content
- **Border consistency** with loaded cards

### ProgressBar Loading  
```jsx
// Simple progress indicator
<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
  <div 
    className="bg-primary h-2 rounded-full transition-all duration-300"
    style={{width: `${progress}%`}}
  >
    <span className="sr-only">{progress}% complete</span>
  </div>
</div>
```

Features:
- **Primary blue progress** (#0052CC) for consistency
- **Clean rounded design** without complex effects
- **Screen reader announcements** for progress updates
- **Smooth transitions** respecting motion preferences

### Button Loading States
```jsx
// Minimal loading button
<button 
  disabled 
  className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
>
  <span className="inline-flex items-center">
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
    Loading...
  </span>
</button>
```

## Error States

### Network Error
```jsx
// Clean error message design
<div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
      </svg>
    </div>
    <div className="ml-3 flex-1">
      <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
      <p className="mt-1 text-sm text-red-700">
        Unable to load questions. Please check your internet connection.
      </p>
      <div className="mt-3">
        <button 
          onClick={onRetry}
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</div>
```

Features:
- **High contrast colors** (#DC2626) meeting accessibility standards
- **Clear error messaging** in plain language
- **Actionable retry button** with descriptive label
- **Icon support** for visual error identification

### Quiz Timeout Warning
```jsx
// Minimal modal design for timeouts
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="ml-3 text-lg font-medium text-gray-900">Quiz Timeout</h3>
    </div>
    <p className="text-gray-600 mb-6">
      Your quiz session has timed out. Would you like to continue where you left off?
    </p>
    <div className="flex gap-3 justify-end">
      <button 
        onClick={onContinue}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
      >
        Continue Quiz
      </button>
      <button 
        onClick={onRestart}
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
      >
        Start Over
      </button>
    </div>
  </div>
</div>
```

## Empty States

### No Search Results
```jsx
// Clean empty state design
<div className="text-center py-12">
  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 00-8-8 8 8 0 00-8 8c0 2.093.804 3.995 2.119 5.4a.7.7 0 00.99-.17z"/>
  </svg>
  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
  <p className="text-gray-600 mb-6">
    Try adjusting your search terms or browse by specialty.
  </p>
  <button 
    onClick={onClearSearch}
    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
  >
    Browse All Questions
  </button>
</div>
```

### Empty Review Mode
```jsx
// Encouraging empty state for review
<div className="text-center py-12">
  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">Great Work!</h3>
  <p className="text-gray-600 mb-6">
    You haven't marked any questions for review. Keep practicing to build your knowledge.
  </p>
  <button 
    onClick={onStartQuiz}
    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
  >
    Take Another Quiz
  </button>
</div>
```

## Maintenance State

### Service Unavailable
```jsx
// Clean maintenance page
<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div className="max-w-md text-center">
    <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
      <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-3">Scheduled Maintenance</h1>
    <p className="text-gray-600 mb-6">
      MedQuiz Pro is temporarily unavailable for scheduled maintenance. We'll be back shortly.
    </p>
    <p className="text-sm text-gray-500">
      Expected completion: 2:00 PM EST
    </p>
  </div>
</div>
```

## Accessibility Considerations

### Screen Reader Support
- **ARIA live regions** for dynamic content updates
- **Descriptive error messages** with clear resolution steps
- **Loading announcements** for state changes
- **Keyboard navigation** for error recovery actions

### Motion Preferences
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
  .animate-spin {
    animation: none;
  }
}
```

### High Contrast Support
- **Error colors** maintain contrast ratios in high contrast mode
- **Loading states** remain visible with system theme changes
- **Focus indicators** clearly visible in all states

**🏥 These minimal UI states prioritize clarity and accessibility while maintaining the clean, professional appearance appropriate for medical education environments.**
