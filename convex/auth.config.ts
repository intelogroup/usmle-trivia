import { defineConfig } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Official Convex Auth Configuration
 * Medical Education Platform (MedQuiz Pro)
 * Enhanced for USMLE preparation with secure authentication
 */
export default defineConfig({
  providers: [
    // Password-based authentication with enhanced profile
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          emailVerified: false, // Will be handled by email verification flow
          // Medical-specific fields will be handled in userProfiles table
          // to maintain separation of concerns between auth and medical data
        };
      },
      // Enhanced password validation for medical platform security
      verify: async (params) => {
        // Basic email validation
        const email = params.email as string;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
          throw new Error("Please provide a valid email address");
        }
        
        // Password strength validation
        const password = params.password as string;
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        
        return true;
      },
    }),
  ],
  
  // Session configuration for medical platform
  session: {
    // Extended session for studying convenience (7 days)
    totalDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    // Refresh session when 1 day remaining
    inactiveDurationMs: 6 * 24 * 60 * 60 * 1000, // 6 days
  },
  
  // Security callbacks
  callbacks: {
    // Create user profile when user signs up
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (!existingUserId) {
        // New user - create medical profile
        console.log(`🏥 Creating medical profile for new user: ${userId}`);
        
        // Get user data from auth tables
        const user = await ctx.db.get(userId);
        if (user) {
          // Create corresponding userProfile for medical data
          await ctx.db.insert("userProfiles", {
            userId,
            email: user.email,
            name: user.name,
            medicalLevel: "Medical Student", // Default
            studyGoals: "USMLE Preparation", // Default
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
          
          console.log(`✅ Medical profile created for user: ${userId}`);
        }
      }
    },
  },
});