# Session Error Logging Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing session error logging in MedQuiz Pro, following VCT framework principles and medical application standards.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React Components with SessionErrorBoundary               │
├─────────────────────────────────────────────────────────────┤
│  Hooks (useSessionErrorHandling, useSessionErrorMonitoring)│
├─────────────────────────────────────────────────────────────┤
│  Store Integration (sessionErrorStore + appStore)         │
├─────────────────────────────────────────────────────────────┤
│  Core Logger (SessionErrorLogger)                         │
├─────────────────────────────────────────────────────────────┤
│  Base Error Handler (ErrorHandler - HIPAA Compliant)      │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. SessionErrorLogger (`src/utils/sessionErrorLogger.ts`)

**Purpose**: Centralized session error logging with HIPAA compliance and medical application standards.

**Key Features**:
- ✅ HIPAA-compliant logging (no PII storage)
- ✅ Session context tracking (auth, quiz, device)
- ✅ Automatic recovery mechanisms
- ✅ Performance metrics collection
- ✅ Cross-device compatibility tracking

**Usage Example**:
```typescript
import { sessionErrorLogger, SessionErrorType } from '../utils/sessionErrorLogger';

// Log authentication error
await sessionErrorLogger.logAuthError(
  new Error('Login failed'),
  {
    userId: user.id, // Will be hashed automatically
    authMethod: 'email',
    failureReason: 'Invalid credentials'
  },
  SessionErrorType.AUTH_SESSION_INVALID
);

// Log quiz error
await sessionErrorLogger.logQuizError(
  error,
  {
    quizId: 'quiz_123',
    mode: 'timed',
    currentQuestion: 5,
    timeRemaining: 120
  },
  SessionErrorType.QUIZ_SESSION_SYNC_FAILED
);
```

### 2. Session Error Hooks (`src/hooks/useSessionErrorHandling.ts`)

**Purpose**: React hooks that integrate session error logging with existing store and services.

#### `useAuthSessionErrorHandling()`

```typescript
import { useAuthSessionErrorHandling } from '../hooks/useSessionErrorHandling';

function LoginComponent() {
  const { handleLoginError, logAuthError, handleLogout } = useAuthSessionErrorHandling();
  
  const onLogin = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
    } catch (error) {
      await handleLoginError(error, email);
    }
  };

  return (
    <form onSubmit={handleSubmit(onLogin)}>
      {/* Login form */}
    </form>
  );
}
```

#### `useQuizSessionErrorHandling()`

```typescript
import { useQuizSessionErrorHandling } from '../hooks/useSessionErrorHandling';

function QuizComponent() {
  const { 
    logQuizError, 
    setupQuizTimeout, 
    setupAutoSave, 
    handleQuizAbandon 
  } = useQuizSessionErrorHandling();
  
  useEffect(() => {
    // Setup quiz timeout (10 minutes)
    setupQuizTimeout(600);
    
    // Setup auto-save every 30 seconds
    setupAutoSave(30);
    
    return () => {
      handleQuizAbandon('user_action');
    };
  }, []);

  return <div>Quiz Interface</div>;
}
```

### 3. Error Boundary Components (`src/components/error/SessionErrorBoundary.tsx`)

**Purpose**: Comprehensive error boundary coverage with medical-themed UI and session recovery.

```typescript
import { SessionErrorBoundary, QuizSessionErrorBoundary } from '../components/error/SessionErrorBoundary';

// Wrap authentication components
function AuthenticatedApp() {
  return (
    <SessionErrorBoundary 
      sessionType="authentication"
      maxRetries={1}
      autoRecovery={false}
    >
      <Dashboard />
    </SessionErrorBoundary>
  );
}

// Wrap quiz components
function QuizApp() {
  return (
    <QuizSessionErrorBoundary
      onQuizError={(error) => console.log('Quiz error:', error)}
    >
      <QuizEngine />
    </QuizSessionErrorBoundary>
  );
}
```

### 4. Session Error Store (`src/store/sessionErrorStore.ts`)

**Purpose**: Zustand store extension for session error state management and analytics.

```typescript
import { useSessionErrorStore, useSessionErrorMonitoring } from '../store/sessionErrorStore';

function ErrorDashboard() {
  const { 
    sessionHealth, 
    currentErrors, 
    getAnalytics, 
    exportReport 
  } = useSessionErrorMonitoring();
  
  const analytics = getAnalytics();
  
  return (
    <div className="error-dashboard">
      <h2>Session Health: {sessionHealth?.health}</h2>
      <p>Total Errors: {analytics.totalErrors}</p>
      <p>Session Stability: {analytics.sessionStability}%</p>
      
      <button onClick={() => {
        const report = exportReport();
        console.log('Error Report:', report);
      }}>
        Export Error Report
      </button>
    </div>
  );
}
```

## Implementation Steps

### Step 1: Basic Integration

1. **Import the session error logger**:
```typescript
// In your main App component
import { SessionErrorProvider } from '../utils/sessionErrorIntegration';

function App() {
  return (
    <SessionErrorProvider>
      <BrowserRouter>
        <Routes>
          {/* Your routes */}
        </Routes>
      </BrowserRouter>
    </SessionErrorProvider>
  );
}
```

2. **Wrap critical components with error boundaries**:
```typescript
// Wrap the entire authenticated section
<SessionErrorBoundary sessionType="authentication">
  <AuthenticatedLayout />
</SessionErrorBoundary>

// Wrap quiz-specific sections
<QuizSessionErrorBoundary>
  <QuizEngine />
</QuizSessionErrorBoundary>
```

### Step 2: Service Integration

1. **Enhance existing auth service**:
```typescript
// In src/services/auth.ts
import { SessionErrorIntegration } from '../utils/sessionErrorIntegration';

export const authService = {
  login: async (email: string, password: string) => {
    return await SessionErrorIntegration.wrapAuthOperation(
      async () => {
        // Original login logic
        const response = await fetch('/api/auth/login', { /* ... */ });
        return response.json();
      },
      'login',
      { authMethod: 'email' }
    );
  },

  logout: async () => {
    return await SessionErrorIntegration.wrapAuthOperation(
      async () => {
        // Original logout logic
      },
      'logout'
    );
  }
};
```

2. **Enhance quiz service**:
```typescript
// In src/services/quiz.ts
import { SessionErrorIntegration } from '../utils/sessionErrorIntegration';

export const quizService = {
  saveProgress: async (quizId: string, answers: any[]) => {
    return await SessionErrorIntegration.wrapQuizOperation(
      async () => {
        // Original save logic
      },
      'saveProgress',
      { quizId, mode: 'timed' }
    );
  }
};
```

### Step 3: API Error Handling

```typescript
// Replace fetch calls with error-aware version
import { apiErrorInterceptor } from '../utils/sessionErrorIntegration';

// Instead of:
// const response = await fetch('/api/endpoint');

// Use:
const response = await apiErrorInterceptor.wrapFetch(
  '/api/endpoint',
  { method: 'POST' },
  { operation: 'saveQuizProgress', sessionType: 'quiz' }
);
```

### Step 4: Component-Level Integration

```typescript
import { useSessionErrorHandling } from '../hooks/useSessionErrorHandling';
import { useSessionErrorContext } from '../utils/sessionErrorIntegration';

function MyComponent() {
  const { logAuthError } = useAuthSessionErrorHandling();
  const { getSessionHealth } = useSessionErrorContext();
  
  const handleSensitiveOperation = async () => {
    try {
      // Perform operation
    } catch (error) {
      await logAuthError(error, { 
        authMethod: 'email',
        failureReason: 'Sensitive operation failed'
      });
    }
  };

  return <div>Component content</div>;
}
```

## Error Types and Handling

### Authentication Session Errors

| Error Type | When to Use | Auto-Recovery |
|------------|-------------|---------------|
| `AUTH_SESSION_EXPIRED` | Session timeout, token expiry | ✅ Token refresh |
| `AUTH_SESSION_INVALID` | Invalid credentials, corrupted session | ❌ Manual re-auth |
| `AUTH_TOKEN_REFRESH_FAILED` | Token refresh API failure | ❌ Force re-login |

### Quiz Session Errors

| Error Type | When to Use | Auto-Recovery |
|------------|-------------|---------------|
| `QUIZ_SESSION_CORRUPTED` | Data corruption, invalid state | ✅ Restore from backup |
| `QUIZ_SESSION_SYNC_FAILED` | Save/sync API failure | ✅ Retry sync |
| `QUIZ_SESSION_TIMEOUT` | Quiz time limit exceeded | ❌ End quiz |
| `QUIZ_SESSION_ABANDONED` | User navigates away | ❌ Save progress |

### System Session Errors

| Error Type | When to Use | Auto-Recovery |
|------------|-------------|---------------|
| `SESSION_STORAGE_FAILED` | localStorage/sessionStorage issues | ✅ Clear and reset |
| `SESSION_DISPLAY_ERROR` | React component errors | ✅ Component retry |
| `SESSION_RECOVERY_FAILED` | Recovery mechanism failure | ❌ Manual intervention |

## HIPAA Compliance Features

### 1. Data Sanitization
- ✅ User IDs are hashed before logging
- ✅ Email addresses are redacted from error messages
- ✅ Sensitive form data is never logged
- ✅ Medical data is excluded from all logs

### 2. Storage Security
- ✅ Local storage is encrypted where possible
- ✅ Session logs are automatically pruned (max 50 entries)
- ✅ No PII is transmitted to external monitoring services
- ✅ All error reports are anonymized

### 3. Access Control
- ✅ Error logs require authentication to access
- ✅ Debug information is only available in development
- ✅ Export functionality includes PII filtering
- ✅ Session data is isolated per user

## Performance Considerations

### 1. Monitoring Impact
- ✅ Async error logging to prevent UI blocking
- ✅ Batched error reporting to reduce API calls
- ✅ Lightweight performance metrics collection
- ✅ Configurable monitoring levels

### 2. Memory Management
- ✅ Automatic log pruning to prevent memory leaks
- ✅ Efficient error deduplication
- ✅ Lazy loading of error analysis tools
- ✅ Cleanup on component unmount

### 3. Network Efficiency
- ✅ Offline error queuing
- ✅ Compressed error reports
- ✅ Retry logic with exponential backoff
- ✅ Network-aware error reporting

## Testing and Development

### 1. Error Simulation
```typescript
import { sessionTestUtils } from '../utils/sessionErrorIntegration';

// Simulate different error types in development
if (process.env.NODE_ENV === 'development') {
  // Simulate auth session expiry
  await sessionTestUtils.simulateError(
    SessionErrorType.AUTH_SESSION_EXPIRED, 
    'high'
  );
}
```

### 2. Debug Reports
```typescript
// Get comprehensive debug information
const debugReport = sessionTestUtils.getDebugReport();
console.log('Session Debug Report:', debugReport);

// Clear errors for testing
sessionTestUtils.clearAllErrors();
```

### 3. Error Monitoring Dashboard
```typescript
function DeveloperDashboard() {
  const { getAnalytics } = useSessionErrorMonitoring();
  const analytics = getAnalytics();
  
  return (
    <div className="p-4">
      <h2>Error Analytics</h2>
      <div>Total Errors: {analytics.totalErrors}</div>
      <div>Session Stability: {analytics.sessionStability}%</div>
      <div>Recovery Rate: {analytics.averageRecoveryTime}ms</div>
    </div>
  );
}
```

## Migration from Existing Error Handling

### 1. Gradual Migration
```typescript
// Existing error handler
try {
  await someOperation();
} catch (error) {
  console.error('Error:', error);
}

// Enhanced with session logging
try {
  await someOperation();
} catch (error) {
  // Keep existing logging
  console.error('Error:', error);
  
  // Add session logging
  await sessionErrorLogger.logAuthError(
    error,
    { authMethod: 'email' },
    SessionErrorType.AUTH_SESSION_INVALID
  );
}
```

### 2. Component Wrapping
```typescript
// Before
function MyComponent() {
  return <div>Content</div>;
}

// After
import { withSessionErrorHandling } from '../utils/sessionErrorIntegration';

const MyComponent = withSessionErrorHandling(
  function MyComponentImpl() {
    return <div>Content</div>;
  },
  'authentication'
);
```

## Best Practices

### 1. Error Context
- Always provide meaningful context in error logs
- Include user journey information (where they came from)
- Add timing information for performance issues
- Include device/browser information for compatibility issues

### 2. User Experience
- Show user-friendly error messages, not technical details
- Provide clear recovery actions when possible
- Don't overwhelm users with too many error notifications
- Always maintain medical application professionalism

### 3. Development Workflow
- Use error simulation for testing error scenarios
- Monitor error patterns during development
- Set up alerts for critical errors in production
- Regularly review and analyze error reports

### 4. Security
- Never log sensitive medical information
- Hash all user identifiers
- Sanitize error messages before storage
- Use secure transmission for error reports

## Conclusion

This comprehensive session error logging system provides:
- **Medical Application Compliance**: HIPAA-compliant error handling
- **VCT Framework Alignment**: Follows VCT architecture principles
- **Production-Ready**: Comprehensive error recovery and monitoring
- **Developer-Friendly**: Easy integration with existing codebase
- **User-Centric**: Professional medical-themed error UI

The system enhances the existing MedQuiz Pro architecture without disrupting current functionality, providing a robust foundation for production deployment and ongoing maintenance.