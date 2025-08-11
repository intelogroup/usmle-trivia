# Authentication System - Clerk Integration

## Overview
MedQuiz Pro uses **Clerk** as its primary authentication provider, replacing the previous Convex Auth implementation. Clerk provides a secure, scalable, and user-friendly authentication solution with built-in UI components and comprehensive user management.

## Key Features
- **Secure Authentication**: Industry-standard security with JWT tokens
- **Social Login**: Support for Google, GitHub, and other OAuth providers
- **Magic Links**: Passwordless authentication via email
- **User Management**: Built-in user profiles and metadata
- **Multi-Factor Authentication**: Enhanced security with 2FA support
- **Session Management**: Automatic session handling and refresh

## Implementation Details

### Environment Configuration
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1zcGlkZXItNDAuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Provider Setup
The application wraps the entire app with `ClerkProvider` in `main.tsx`:
```typescript
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
</ClerkProvider>
```

### Protected Routes
Routes requiring authentication use Clerk's built-in components:
```typescript
<SignedIn>
  <AppLayout>
    <Dashboard />
  </AppLayout>
</SignedIn>
<SignedOut>
  <RedirectToSignIn />
</SignedOut>
```

### User Access
Components can access user data using Clerk hooks:
```typescript
import { useUser } from '@clerk/clerk-react';

const { user, isLoaded, isSignedIn } = useUser();
```

## UI Components

### Sign In/Sign Up
- **Modal Forms**: Built-in modal dialogs for authentication
- **Custom Triggers**: Buttons that open auth modals
- **UserButton**: Pre-built user menu with profile management

### Key Components Used:
- `<SignInButton>`: Triggers sign-in modal
- `<SignUpButton>`: Triggers sign-up modal  
- `<UserButton>`: User avatar with dropdown menu
- `<SignedIn>`: Renders children only when authenticated
- `<SignedOut>`: Renders children only when not authenticated

## Database Integration
While Clerk handles authentication, user quiz data and progress are stored in Convex:
- Clerk provides user identity and profile
- Convex stores quiz sessions, scores, and achievements
- User ID from Clerk links to Convex records

## Security Considerations
- **JWT Tokens**: Secure token-based authentication
- **HTTPS Only**: All authentication traffic encrypted
- **Session Security**: Automatic session expiry and refresh
- **CSRF Protection**: Built-in protection against cross-site attacks

## Testing Credentials
For development and testing:
- **Test Email**: your_email+clerk_test@example.com
- **Verification Code**: 424242
- **Test Phone**: +15555550100

## Migration from Convex Auth
The migration involved:
1. Installing `@clerk/clerk-react` package
2. Configuring Clerk publishable key
3. Wrapping app with `ClerkProvider`
4. Updating components to use Clerk hooks
5. Protecting routes with Clerk components
6. Maintaining compatibility layer for gradual migration

## Benefits Over Previous System
- **Reduced Complexity**: No need to maintain custom auth logic
- **Better UX**: Professional, tested UI components
- **Enhanced Security**: Enterprise-grade security features
- **Scalability**: Handles millions of users without infrastructure changes
- **Developer Experience**: Simple integration with React hooks

## Future Enhancements
- **SSO Integration**: Enterprise single sign-on support
- **Advanced MFA**: Biometric and hardware key support
- **Custom Domains**: White-label authentication URLs
- **Webhooks**: Real-time user event notifications
- **Organizations**: Multi-tenant support for medical schools