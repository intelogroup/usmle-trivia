import { defineConfig } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers/Password";

export default defineConfig({
  providers: [
    Password({
      profile(params) {
        // Enhanced validation for medical education platform
        const email = params.email as string;
        const name = params.name as string;
        
        // Basic validation
        if (!email || !email.includes('@')) {
          throw new Error('Valid email address is required');
        }
        
        if (!name || name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }
        
        return {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          // Medical education platform specific fields
          medicalLevel: params.medicalLevel as string | undefined,
          studyGoals: params.studyGoals as string | undefined,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // Initialize user with medical education defaults
      const { userId, existingUser } = args;
      
      if (!existingUser) {
        try {
          // New user - initialize with defaults and enhanced medical fields
          await ctx.db.patch(userId, {
            points: 0,
            level: 1,
            streak: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalQuizzes: 0,
            accuracy: 0,
            isActive: true,
            role: "user",
            emailVerified: false, // Start with unverified email
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastStudyDate: new Date().toISOString().split('T')[0],
            streakFreezeCount: 3, // Start with 3 streak freezes
            // Medical platform specific defaults
            preferences: {
              theme: "light",
              notifications: true,
              difficulty: "medium",
            },
          });
          
          console.log(`✅ New medical student user initialized: ${userId}`);
        } catch (error) {
          console.error(`❌ Failed to initialize user ${userId}:`, error);
          throw error;
        }
      } else {
        // Existing user - update last login
        try {
          await ctx.db.patch(userId, {
            updatedAt: Date.now(),
          });
        } catch (error) {
          console.error(`❌ Failed to update user ${userId}:`, error);
          // Don't throw error for existing user updates to avoid login failures
        }
      }
    },
  },
});