# Clerk + Convex Integration Strategy

## 🏗️ Architecture Overview

MedQuiz Pro uses a **hybrid authentication architecture** that leverages the strengths of both Clerk and Convex:

- **Clerk**: Handles all authentication, user identity, sessions, and access control
- **Convex**: Stores application-specific data (quiz scores, medical progress, user profiles)

## 🔄 User Synchronization Strategy

### **Recommended Approach: Lazy Synchronization with JWT Validation**

```mermaid
User Signs Up/In (Clerk) → JWT Token Generated → Convex Validates Token → 
User Profile Created/Updated (Convex) → Application Data Stored (Convex)
```

### **Implementation Details**

#### 1. **User Authentication Flow**
```typescript
// User authenticates with Clerk
ClerkProvider → User Sign In → JWT Token Generated

// Token passed to Convex
ConvexProviderWithClerk → useAuth hook → Token to Convex

// Convex validates and creates/updates user
ctx.auth.getUserIdentity() → Sync user profile → Return user data
```

#### 2. **Data Storage Strategy**

**Clerk Stores:**
- User authentication credentials
- Email, phone, OAuth connections
- Multi-factor authentication settings
- Session management
- User metadata (first name, last name, avatar)

**Convex Stores:**
- User profile (medical specialization, study level)
- Quiz history and scores
- Points, levels, achievements
- Study streaks and progress
- Bookmarked questions
- Custom medical app data

#### 3. **User ID Management**
```typescript
// Use Clerk user ID as primary identifier
const clerkUserId = user.id; // "user_2abc..."

// Store in Convex userProfiles
{
  clerkUserId: "user_2abc...",
  email: "student@medical.edu",
  medicalData: {
    points: 1250,
    level: 5,
    specialization: "Cardiology",
    usmleProgress: 45
  }
}
```

## 📁 File Structure

```
/convex
  ├── auth.config.ts          # Clerk JWT configuration
  ├── users.ts               # User sync functions
  ├── clerkQuiz.ts          # Quiz functions with Clerk IDs
  └── schema.ts             # Updated schema with Clerk support

/src
  ├── providers/
  │   └── ConvexClerkProvider.tsx  # Integration provider
  ├── hooks/
  │   └── useAuth.ts              # Enhanced auth hook
  └── main.tsx                    # App setup with providers
```

## 🔐 Security Implementation

### **JWT Token Validation**
```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "https://logical-spider-40.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

### **User Access Control**
```typescript
// Every Convex function validates user
export const getUserProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get or create user profile
    return await ensureUser(ctx, identity);
  },
});
```

## 🔄 Synchronization Functions

### **Core User Sync Functions**

```typescript
// convex/users.ts

// 1. Ensure user exists (create or update)
export const ensureUser = async (ctx, identity) => {
  const existing = await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_id", q => q.eq("clerkUserId", identity.subject))
    .first();
    
  if (!existing) {
    // Create new user profile
    return await createUserProfile(ctx, identity);
  }
  
  // Update existing profile if needed
  return await updateUserProfile(ctx, existing, identity);
};

// 2. Create new user profile
const createUserProfile = async (ctx, identity) => {
  return await ctx.db.insert("userProfiles", {
    clerkUserId: identity.subject,
    email: identity.email,
    name: identity.name,
    // Medical app specific fields
    points: 0,
    level: 1,
    streak: 0,
    totalQuizzes: 0,
    correctAnswers: 0,
    createdAt: Date.now(),
  });
};
```

## 🎯 Best Practices

### **1. Always Use Clerk for Authentication**
- Never store passwords in Convex
- Use Clerk's UI components (SignIn, UserButton)
- Let Clerk handle MFA, OAuth, magic links

### **2. Keep User Data Synchronized**
- Sync on first login
- Update profile on each session
- Use webhooks for real-time updates (optional)

### **3. Handle Edge Cases**
```typescript
// Handle user deletion
export const handleUserDeleted = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Soft delete or anonymize user data
    const profile = await getUserByClerkId(ctx, args.clerkUserId);
    if (profile) {
      await ctx.db.patch(profile._id, { 
        deleted: true,
        deletedAt: Date.now() 
      });
    }
  },
});
```

### **4. Optimize for Performance**
- Cache user profiles in React context
- Minimize database calls
- Use indexes for clerk user ID lookups

## 🚀 Implementation Checklist

### **Initial Setup**
- [x] Install `@clerk/clerk-react` and `convex`
- [x] Configure Clerk publishable key
- [x] Create JWT template in Clerk dashboard
- [x] Set up auth.config.ts in Convex
- [x] Implement ConvexProviderWithClerk

### **User Management**
- [x] Create user sync functions
- [x] Update schema for Clerk IDs
- [x] Implement getUserProfile query
- [x] Add createOrUpdateUser mutation
- [x] Handle user deletion/deactivation

### **Quiz Integration**
- [x] Update quiz functions for Clerk IDs
- [x] Migrate existing user references
- [x] Test quiz flow with authentication
- [x] Verify data persistence

### **Testing**
- [ ] Test new user registration
- [ ] Test existing user login
- [ ] Test profile synchronization
- [ ] Test quiz data association
- [ ] Test session management

## 📊 Migration Strategy (if needed)

### **For Existing Users**
```typescript
// One-time migration script
export const migrateUsersToClerk = mutation({
  handler: async (ctx) => {
    const oldUsers = await ctx.db.query("users").collect();
    
    for (const user of oldUsers) {
      // Create userProfile with temporary Clerk ID
      await ctx.db.insert("userProfiles", {
        clerkUserId: `migrated_${user._id}`,
        email: user.email,
        name: user.name,
        // Copy existing data
        points: user.points || 0,
        level: user.level || 1,
        // ... other fields
        migrated: true,
        oldUserId: user._id,
      });
    }
  },
});
```

## 🔧 Environment Variables

```env
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1zcGlkZXItNDAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_JWT_ISSUER_DOMAIN=https://logical-spider-40.clerk.accounts.dev
VITE_CONVEX_URL=https://formal-sardine-916.convex.cloud
```

## 🎨 Frontend Integration

### **Enhanced useAuth Hook**
```typescript
export function useAuth() {
  const { user: clerkUser, isSignedIn } = useUser();
  const convexAuth = useConvexAuth();
  const userProfile = useQuery(api.users.getCurrentUser);
  
  return {
    // Clerk data
    user: clerkUser,
    isAuthenticated: isSignedIn,
    
    // Convex data
    profile: userProfile,
    isLoading: convexAuth.isLoading,
    
    // Medical app data
    points: userProfile?.points || 0,
    level: userProfile?.level || 1,
    streak: userProfile?.streak || 0,
  };
}
```

## 🚦 Debugging Tips

### **Common Issues & Solutions**

1. **JWT Token Not Valid**
   - Check Clerk JWT template configuration
   - Verify issuer domain matches
   - Ensure applicationID is "convex"

2. **User Profile Not Created**
   - Check ensureUser is called on login
   - Verify database permissions
   - Check for unique index violations

3. **Quiz Data Not Saving**
   - Verify user ID is passed correctly
   - Check Convex function authentication
   - Ensure proper error handling

## 📈 Monitoring & Analytics

### **Track Key Metrics**
- User registration success rate
- Profile sync latency
- Authentication errors
- Quiz completion with auth

### **Logging Strategy**
```typescript
// Log important events
console.log('[Auth] User synced:', {
  clerkId: identity.subject,
  email: identity.email,
  timestamp: new Date().toISOString(),
});
```

## 🏁 Conclusion

This integration strategy provides:
- **Security**: Enterprise-grade authentication via Clerk
- **Flexibility**: Custom medical app data in Convex
- **Scalability**: Ready for thousands of users
- **Maintainability**: Clean separation of concerns
- **Performance**: Optimized data synchronization

The hybrid approach leverages the best of both platforms while maintaining a seamless user experience for medical students using MedQuiz Pro.