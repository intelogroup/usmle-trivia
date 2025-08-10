# Convex Auth Official Documentation Summary

## Overview
- **Status**: Beta feature for React and React Native applications
- **Purpose**: Implement authentication directly within Convex backend
- **No separate auth service required**: Everything runs within your Convex functions

## Installation & Setup

### 1. Dependencies
```bash
npm install @convex-dev/auth @auth/core@0.37.0
```

### 2. Initialize Convex Auth
```bash
npx @convex-dev/auth
```

### 3. Database Schema Setup
Update `convex/schema.ts`:
```typescript
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Your other tables...
});

export default schema;
```

### 4. React Provider Setup
Modify `src/main.tsx`:
```typescript
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>
);
```

## Authentication Methods Supported

1. **Magic Links** - Email-based passwordless authentication
2. **OTPs** - One-Time Passwords via SMS/Email
3. **OAuth** - GitHub, Google, Apple integration
4. **Password** - Traditional email/password with reset flow
5. **Anonymous** - Temporary user sessions

## Password Provider Configuration

### Basic Setup in `convex/auth.ts`:
```typescript
import { defineConfig } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers/Password";

export default defineConfig({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          // Additional profile fields
        };
      },
      // Optional: Email verification
      verify: EmailProvider({
        // Email verification config
      }),
      // Optional: Password reset
      reset: EmailProvider({
        // Password reset config
      }),
    }),
  ],
});
```

### Advanced Configuration Options:
- **`profile`**: Validate and transform user profile data
- **`validatePasswordRequirements`**: Custom password strength validation
- **`reset`**: Email provider for password reset flow
- **`verify`**: Email provider for email verification

## React Hooks (Based on Current Usage)

### 1. `useAuthActions`
```typescript
const { signIn, signOut, signUp } = useAuthActions();

// Sign in
await signIn("password", { 
  email, 
  password, 
  flow: "signIn" 
});

// Sign up
await signUp("password", { 
  email, 
  password, 
  name,
  flow: "signUp" 
});

// Sign out
await signOut();
```

### 2. `useCurrentUser` (or similar)
Based on current implementation pattern:
```typescript
const user = useQuery(api.auth.getCurrentUser);
const isAuthenticated = !!user;
const isLoading = user === undefined;
```

## Key Principles

### JWT Authentication
- Uses JSON Web Tokens for session management
- Tokens are automatically handled by Convex Auth
- No manual token management required

### Authorization Pattern
```typescript
export const secureFunction = mutation({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Not authenticated");
    }
    // Proceed with authenticated logic
  },
});
```

### Database Integration
- Auth tables are automatically managed
- User profile data stored in Convex database
- Seamless integration with existing Convex queries/mutations

## Migration Considerations

### From Custom Auth to Convex Auth:
1. **Remove custom auth tables** - Convex Auth manages its own user tables
2. **Replace custom auth hooks** - Use official Convex Auth hooks
3. **Update auth configuration** - Move to `convex/auth.config.ts`
4. **Clear existing user data** - Start fresh with Convex Auth tables
5. **Update React components** - Use new auth hooks and patterns

### Benefits of Migration:
- **Reduced complexity**: No custom auth logic to maintain
- **Better security**: Official implementation with best practices
- **Automatic updates**: Security patches and feature updates
- **Standard patterns**: Following Convex recommended approaches

## Current Beta Status Notes
- **Active development**: Features and APIs may change
- **Community support**: Discord and GitHub issues for feedback
- **Documentation**: Still evolving, some features may be underdocumented
- **Production use**: Consider stability requirements for production apps

## Next Steps for Implementation
1. Clear existing user data and custom auth code
2. Update database schema to use `authTables`
3. Replace custom auth service with official Convex Auth hooks
4. Update React components to use new authentication patterns
5. Test all authentication flows (sign-up, sign-in, sign-out)
6. Implement proper error handling and loading states

## Resources
- **Main Docs**: https://labs.convex.dev/auth
- **Setup Guide**: https://labs.convex.dev/auth/setup  
- **Password Provider**: https://labs.convex.dev/auth/config/passwords
- **GitHub Repository**: https://github.com/get-convex/convex-auth
- **Example App**: https://labs.convex.dev/auth-example

## Important Files to Update
- `convex/schema.ts` - Add authTables
- `convex/auth.config.ts` - Configure providers  
- `src/main.tsx` - Use ConvexAuthProvider
- `src/services/auth.ts` - Replace with official hooks
- All components using auth - Update to new patterns