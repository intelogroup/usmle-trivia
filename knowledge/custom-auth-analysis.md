# Custom Auth Code Analysis - TO BE REMOVED

## Current Custom Auth Implementation

### 1. Custom Auth Functions in `/convex/auth.ts`
**🚫 TO BE REMOVED - Replace with Convex Auth**

Custom mutations and queries that duplicate Convex Auth functionality:

```typescript
// Custom functions to remove:
- registerUser (mutation) - line 59
- loginUser (mutation) - line 112  
- validateSession (query) - line 290
- logoutUser (mutation) - line 344
- changePassword (mutation) - line 186
- updateStudyStreak (mutation) - line 227
- updateUserStats (mutation) - line 386
- getLeaderboard (query) - line 483
- getUserProfile (query) - line 509
- updateUserProfile (mutation) - line 520
- searchUsers (query) - line 541
- getCurrentUserFromToken (query) - line 367
```

### 2. Custom Auth Schema in `/convex/schema.ts`
**🚫 TO BE MODIFIED - Replace with authTables**

Custom user table with auth-specific fields:
```typescript
users: defineTable({
  // Basic fields (KEEP)
  email: v.string(),
  name: v.string(),
  avatar: v.optional(v.string()),
  
  // Custom auth fields (REMOVE - handled by Convex Auth)
  passwordHash: v.optional(v.string()),
  lastLogin: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
  emailVerified: v.optional(v.boolean()),
  
  // App-specific fields (KEEP)
  points: v.optional(v.number()),
  level: v.optional(v.number()),
  medicalLevel: v.optional(v.string()),
  // ... other medical app fields
})

// Custom session table (REMOVE - handled by Convex Auth)
userSessions: defineTable({
  userId: v.id("users"),
  tokenHash: v.string(),
  expiresAt: v.number(),
  // ... other session fields
})
```

### 3. Custom Auth Service in `/src/services/convexAuth.ts`
**🚫 TO BE REPLACED - Use official Convex Auth hooks**

Current custom implementation:
```typescript
export function useAuth() {
  const { signIn, signOut, signUp } = useAuthActions();
  const token = useAuthToken();
  
  // Custom user query (REMOVE)
  const user = useQuery(api.auth.getCurrentUserFromToken, token ? {} : "skip");
  
  // Custom auth methods (REMOVE)
  async login(email, password) { /* custom logic */ }
  async register(...) { /* custom logic */ }
  async logout() { /* custom logic */ }
}
```

### 4. Custom Auth Configuration in `/convex/auth.config.ts`
**✅ KEEP BUT SIMPLIFY - Already using official Convex Auth**

Current config is mostly correct but has custom validation logic:
```typescript
export default defineConfig({
  providers: [
    Password({
      profile(params) {
        // Custom validation logic (SIMPLIFY)
        return { email, name, medicalLevel, studyGoals };
      },
    }),
  ],
  callbacks: {
    // Custom user initialization (MODIFY)
    async afterUserCreatedOrUpdated(ctx, args) { /* ... */ }
  },
});
```

## Files That Need Updates

### Backend Files (Convex)
1. **`/convex/auth.ts`** - 🚫 DELETE (559 lines of custom auth)
2. **`/convex/schema.ts`** - 🔧 MODIFY (Replace users table, remove userSessions)
3. **`/convex/auth.config.ts`** - 🔧 SIMPLIFY (Remove custom validation)
4. **`/convex/systemManagement.ts`** - 🔧 UPDATE (Remove userSessions references)

### Frontend Files (React)
1. **`/src/services/convexAuth.ts`** - 🔧 REPLACE (Use official hooks only)
2. **`/src/services/auth.ts`** - 🚫 DELETE (If exists)
3. **`/src/main.tsx`** - ✅ KEEP (Already using ConvexAuthProvider)

### Component Files
All components using custom auth hooks need updates:
- `/src/pages/Login.tsx`
- `/src/pages/Register.tsx` 
- `/src/pages/Dashboard.tsx`
- `/src/components/layout/TopBar.tsx`
- `/src/components/quiz/QuizEngineLocal.tsx`
- And others...

## Database Tables Analysis

### Tables to Remove/Replace:
1. **`users`** - Replace with Convex Auth managed user table
2. **`userSessions`** - Remove (handled by Convex Auth)

### Tables to Keep:
- `questions` - App-specific data
- `quizSessions` - App functionality 
- `analytics` - App metrics
- All other non-auth tables

### User Data Migration Needed:
- **Profile data**: medicalLevel, studyGoals, preferences
- **Game data**: points, level, streak, totalQuizzes, accuracy
- **Study data**: currentStreak, longestStreak, lastStudyDate

## Custom Password Hashing Code
**🚫 TO BE REMOVED**

Current custom implementation in `/convex/auth.ts`:
```typescript
function simpleHash(passwordInput: string): string { /* ... */ }
function hashUserId(userId: string): string { /* ... */ }
function generateSessionToken(userId: string): string { /* ... */ }
function hashSessionToken(token: string): string { /* ... */ }
function verifyPassword(passwordInput: string, hash: string): boolean { /* ... */ }
```

## Authentication Flow Changes

### Current Custom Flow:
1. User calls `useAuth().login(email, password)`
2. Custom `loginUser` mutation runs with custom password validation
3. Custom session token generated and stored in `userSessions`
4. Custom `validateSession` validates tokens
5. Custom user data returned

### New Convex Auth Flow:
1. User calls `useAuthActions().signIn("password", { email, password, flow: "signIn" })`
2. Convex Auth handles password validation automatically
3. Convex Auth manages sessions internally
4. Use `useCurrentUser()` or similar to get authenticated user
5. Convex Auth manages user data in its own tables

## Security Improvements
Moving to official Convex Auth provides:
- **Better password hashing**: Industry-standard bcrypt vs custom implementation
- **Secure session management**: Automatic token rotation and validation
- **Security updates**: Automatic security patches from Convex team
- **Standard implementation**: Follows authentication best practices
- **Reduced attack surface**: Less custom code to audit and maintain

## Breaking Changes for Migration
1. **All user data will be lost** - Need to clear database
2. **Authentication flow changes** - Components need updates
3. **User profile structure changes** - May need to adjust data model
4. **Session management changes** - Automatic instead of manual
5. **Error handling changes** - Different error types and messages