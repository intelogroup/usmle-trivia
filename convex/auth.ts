import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

/**
 * Official Convex Auth Configuration
 * Medical Education Platform (MedQuiz Pro)
 * Production-ready authentication with comprehensive error handling
 */

// Main authentication configuration
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      // Custom profile validation and transformation
      profile(params) {
        // Ensure we have the required fields
        const email = params.email as string;
        const name = params.name as string;
        
        if (!email || !name) {
          throw new ConvexError("Email and name are required");
        }
        
        // Return the profile data
        return {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          emailVerified: false,
        };
      },
      
      // Custom password validation
      validatePasswordRequirements(password: string) {
        // Check password strength
        if (password.length < 8) {
          throw new ConvexError("Password must be at least 8 characters long");
        }
        
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
          throw new ConvexError("Password must contain at least one uppercase letter");
        }
        
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
          throw new ConvexError("Password must contain at least one lowercase letter");
        }
        
        // Check for at least one number
        if (!/[0-9]/.test(password)) {
          throw new ConvexError("Password must contain at least one number");
        }
        
        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          throw new ConvexError("Password must contain at least one special character");
        }
      },
    }),
  ],
  
  // Session configuration for medical platform
  session: {
    // Extended session for studying convenience (7 days)
    totalDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    // Refresh session when 1 day remaining
    inactiveDurationMs: 24 * 60 * 60 * 1000, // 1 day
  },
  
  // Authentication callbacks
  callbacks: {
    // Redirect after sign in
    redirect({ redirectTo }) {
      return redirectTo ?? "/dashboard";
    },
    
    // Create user profile after successful registration
    async afterUserCreatedOrUpdated(ctx, args) {
      // Only create profile for new users
      if (args.existingUserId) {
        return;
      }
      
      const userId = args.userId;
      console.log(`🏥 Creating medical profile for new user: ${userId}`);
      
      try {
        // Get the user data from the auth table
        const user = await ctx.db.get(userId);
        
        if (!user) {
          console.error(`❌ User ${userId} not found in database`);
          return;
        }
        
        // Check if profile already exists
        const existingProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
          
        if (existingProfile) {
          console.log(`✅ Profile already exists for user: ${userId}`);
          return;
        }
        
        // Create the medical profile
        const profileId = await ctx.db.insert("userProfiles", {
          userId: userId,
          email: user.email || "",
          name: user.name || "Medical Student",
          medicalLevel: "Medical Student",
          studyGoals: "USMLE Preparation",
          points: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalQuizzes: 0,
          accuracy: 0,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastStudyDate: new Date().toISOString().split('T')[0],
          streakFreezeCount: 3,
        });
        
        console.log(`✅ Medical profile created: ${profileId}`);
      } catch (error) {
        console.error(`❌ Failed to create medical profile:`, error);
        // Don't throw here - let the user still sign in even if profile creation fails
        // The profile can be created later or on first access
      }
    },
  },
});

// Export a helper to check authentication status
export const isAuthenticated = auth.isAuthenticated;