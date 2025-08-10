# Convex Auth Migration Plan

## 🎯 Migration Strategy Overview

**Objective**: Replace all custom authentication code with official Convex Auth system while preserving medical app functionality.

**Approach**: Clean slate migration - Clear database and rebuild with official Convex Auth patterns.

## 📋 Migration Steps (Detailed)

### Phase 1: Preparation & Database Cleanup

#### Step 1.1: Clear All User Data 🗑️
```bash
# This will clear all user data - DESTRUCTIVE OPERATION
# Run Convex dashboard commands or mutation to clear:
# - users table (all records)
# - userSessions table (all records) 
# - Any user-specific data in other tables (quizSessions, etc.)
```

#### Step 1.2: Install Dependencies ✅ (Already Done)
```bash
npm install @convex-dev/auth @auth/core@0.37.0
# Dependencies already installed
```

### Phase 2: Backend Migration

#### Step 2.1: Update Database Schema 🔧
**File**: `/convex/schema.ts`

**BEFORE** (Custom):
```typescript
export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.optional(v.string()), // REMOVE
    // ... custom auth fields
  }),
  userSessions: defineTable({ /* REMOVE ENTIRE TABLE */ }),
  // ... other tables
});
```

**AFTER** (Convex Auth):
```typescript
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables, // ADD: Official Convex Auth tables
  
  // Keep medical app specific user data in separate table
  userProfiles: defineTable({
    userId: v.string(), // Links to Convex Auth user
    medicalLevel: v.optional(v.string()),
    studyGoals: v.optional(v.string()),
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    totalQuizzes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    lastStudyDate: v.optional(v.string()),
    streakFreezeCount: v.optional(v.number()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
  
  // Keep all existing non-auth tables
  questions: defineTable({ /* existing */ }),
  quizSessions: defineTable({ 
    userId: v.string(), // Update to use Convex Auth user ID
    /* ... rest unchanged */
  }),
  // ... other tables unchanged
});
```

#### Step 2.2: Simplify Auth Configuration 🔧  
**File**: `/convex/auth.config.ts`

**BEFORE** (Complex custom validation):
```typescript
export default defineConfig({
  providers: [
    Password({
      profile(params) {
        // Complex validation logic
        if (!email || !email.includes('@')) { /* ... */ }
        return { email, name, medicalLevel, studyGoals };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // Complex user initialization
    },
  },
});
```

**AFTER** (Simple official pattern):
```typescript
export default defineConfig({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          // Medical fields will be handled separately in userProfiles
        };
      },
    }),
  ],
  // Convex Auth handles user creation automatically
  // Medical profile creation handled in separate mutations
});
```

#### Step 2.3: Remove Custom Auth Functions 🚫
**File**: `/convex/auth.ts` - **DELETE ENTIRE FILE**

Remove all custom functions:
- registerUser, loginUser, validateSession, logoutUser
- All custom password hashing functions
- Session management functions
- 559 lines of custom auth code

#### Step 2.4: Create Medical Profile Management 🏥
**New File**: `/convex/userProfiles.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create user profile after Convex Auth creates user
export const createUserProfile = mutation({
  args: {
    userId: v.string(), // From Convex Auth
    medicalLevel: v.optional(v.string()),
    studyGoals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
      
    if (existing) {
      throw new ConvexError("Profile already exists");
    }
    
    // Create medical profile
    await ctx.db.insert("userProfiles", {
      userId: args.userId,
      medicalLevel: args.medicalLevel,
      studyGoals: args.studyGoals,
      points: 0,
      level: 1,
      streak: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzes: 0,
      accuracy: 0,
      streakFreezeCount: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      preferences: {
        theme: "light",
        notifications: true,
        difficulty: "medium",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get user profile
export const getUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
  },
});

// Update user stats after quiz
export const updateUserStats = mutation({
  args: {
    userId: v.string(),
    pointsEarned: v.number(),
    quizScore: v.number(),
    questionsCount: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
      
    if (!profile) {
      throw new ConvexError("User profile not found");
    }
    
    // Calculate new stats
    const newPoints = profile.points + args.pointsEarned;
    const newTotalQuizzes = profile.totalQuizzes + 1;
    const newAccuracy = Math.round(
      (profile.accuracy * profile.totalQuizzes + args.quizScore) / newTotalQuizzes
    );
    const newLevel = Math.floor(newPoints / 100) + 1;
    
    // Update profile
    await ctx.db.patch(profile._id, {
      points: newPoints,
      level: newLevel,
      totalQuizzes: newTotalQuizzes,
      accuracy: newAccuracy,
      updatedAt: Date.now(),
    });
    
    return { newPoints, newLevel, newAccuracy };
  },
});

// Other medical app specific functions...
```

### Phase 3: Frontend Migration

#### Step 3.1: Replace Auth Service 🔧
**File**: `/src/services/convexAuth.ts`

**BEFORE** (Custom implementation):
```typescript
export function useAuth() {
  // Custom auth logic with manual session management
  const user = useQuery(api.auth.getCurrentUserFromToken, /*...*/);
  
  return {
    user: user ? convertConvexUserToIUser(user) : null,
    async login(email, password) { /* custom logic */ },
    async register(/*...*/) { /* custom logic */ },
    async logout() { /* custom logic */ },
  };
}
```

**AFTER** (Official Convex Auth):
```typescript
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "convex/react"; // or appropriate hook
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAuth() {
  // Official Convex Auth hooks
  const { signIn, signOut, signUp } = useAuthActions();
  const user = useCurrentUser(); // Official Convex Auth user
  
  // Get medical profile
  const profile = useQuery(
    api.userProfiles.getUserProfile, 
    user ? { userId: user._id } : "skip"
  );
  
  return {
    // Auth state
    user,
    profile,
    isAuthenticated: !!user,
    isLoading: user === undefined,
    
    // Auth actions using official Convex Auth
    async login(email: string, password: string) {
      await signIn("password", { email, password, flow: "signIn" });
    },
    
    async register(
      email: string, 
      password: string, 
      name: string,
      medicalLevel?: string,
      studyGoals?: string
    ) {
      // Step 1: Register with Convex Auth
      await signUp("password", { email, password, name, flow: "signUp" });
      
      // Step 2: Create medical profile (will be handled in callback or separately)
      // The newly created user ID will be available after signUp completes
    },
    
    async logout() {
      await signOut();
    },
  };
}

// Hook for updating user stats
export const useUpdateUserStats = () => {
  return useMutation(api.userProfiles.updateUserStats);
};

// Other medical app specific hooks...
```

#### Step 3.2: Update Components 🔧
Update all components using auth:

**Example**: `/src/pages/Login.tsx`
```typescript
// BEFORE
const { login, isLoading, error } = useAuth();

// AFTER  
const { login, isLoading, isAuthenticated } = useAuth();

// Login logic remains similar, but error handling may change
const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    // Convex Auth automatically handles redirect/state updates
  } catch (error) {
    // Handle Convex Auth specific errors
    setError(error.message);
  }
};
```

### Phase 4: Migration Verification

#### Step 4.1: Test Authentication Flows 🧪
- [ ] User registration with medical fields
- [ ] User login/logout
- [ ] Session persistence across page reloads  
- [ ] Medical profile creation and updates
- [ ] Quiz completion and stats updates
- [ ] Error handling for invalid credentials
- [ ] Loading states during auth operations

#### Step 4.2: Verify Data Migration 📊
- [ ] Medical profiles linked correctly to auth users
- [ ] Quiz sessions reference correct user IDs
- [ ] Analytics still work with new user structure
- [ ] All medical app functionality preserved

## 🚨 Critical Migration Notes

### Data Loss Warning ⚠️
- **ALL existing user data will be lost**
- **ALL existing sessions will be invalidated** 
- **Users will need to re-register**
- This is necessary for clean Convex Auth integration

### Breaking Changes 💥
1. **User ID format changes** - Convex Auth uses different ID structure
2. **Authentication flow changes** - Different hooks and methods
3. **Error handling changes** - Different error types and messages
4. **Session management changes** - Automatic instead of manual
5. **Database schema changes** - Auth tables managed by Convex Auth

### Rollback Plan 🔄
If migration fails:
1. Revert to previous git commit
2. Restore custom auth code
3. Clear and restore database from backup (if available)
4. Test custom auth functionality

## 📅 Implementation Timeline

### Phase 1: Preparation (1 hour)
- Clear database
- Backup current implementation

### Phase 2: Backend Migration (2-3 hours)
- Update schema
- Remove custom auth code
- Create medical profile management
- Test backend functions

### Phase 3: Frontend Migration (2-3 hours)
- Update auth service
- Update all components
- Test authentication flows

### Phase 4: Verification (1-2 hours)
- Comprehensive testing
- Fix any issues
- Deploy to production

**Total Estimated Time: 6-9 hours**

## 🎯 Success Criteria

✅ **Authentication Works**: Users can register, login, logout  
✅ **Medical Features Work**: Quiz functionality, stats tracking, profiles  
✅ **No Custom Auth Code**: All custom authentication removed  
✅ **Performance Maintained**: App loads and performs well  
✅ **Error Handling Works**: Proper error messages and states  
✅ **Security Improved**: Using official Convex Auth security practices  

## 📚 Resources During Migration

- **Convex Auth Docs**: https://labs.convex.dev/auth
- **Migration Knowledge**: `/knowledge/convex-auth-official-docs.md`
- **Custom Code Analysis**: `/knowledge/custom-auth-analysis.md`
- **Support**: Convex Discord community for issues