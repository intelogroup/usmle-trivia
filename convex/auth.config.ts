import { defineConfig } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers/Password";

export default defineConfig({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
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
        // New user - initialize with defaults
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastStudyDate: new Date().toISOString().split('T')[0],
          streakFreezeCount: 3, // Start with 3 streak freezes
        });
      }
    },
  },
});