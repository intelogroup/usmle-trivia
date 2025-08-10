import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Migration function to fix schema mismatch issue
 * 
 * Problem: The users table contains medical data (accuracy, points, level, etc.)
 * that should be in the userProfiles table according to the schema.
 * 
 * Solution: Move medical data from users table to userProfiles table
 * and clean up users table to only contain Convex Auth fields.
 */

// Query to check current state
export const checkMigrationStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all users with extra medical fields
    const users = await ctx.db.query("users").collect();
    
    const usersWithMedicalData = users.filter(user => 
      'accuracy' in user || 
      'points' in user || 
      'level' in user || 
      'streak' in user ||
      'totalQuizzes' in user
    );

    // Get existing userProfiles
    const userProfiles = await ctx.db.query("userProfiles").collect();
    
    return {
      totalUsers: users.length,
      usersWithMedicalData: usersWithMedicalData.length,
      existingProfiles: userProfiles.length,
      needsMigration: usersWithMedicalData.length > 0,
      usersToMigrate: usersWithMedicalData.map(user => ({
        id: user._id,
        email: user.email,
        medicalFields: {
          accuracy: 'accuracy' in user ? user.accuracy : undefined,
          points: 'points' in user ? user.points : undefined,
          level: 'level' in user ? user.level : undefined,
          streak: 'streak' in user ? user.streak : undefined,
          totalQuizzes: 'totalQuizzes' in user ? user.totalQuizzes : undefined,
        }
      }))
    };
  },
});

// Migration function to move medical data from users to userProfiles
export const migrateMedicalData = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting medical data migration...");
    
    // Get all users with medical data
    const users = await ctx.db.query("users").collect();
    
    const usersWithMedicalData = users.filter(user => 
      'accuracy' in user || 
      'points' in user || 
      'level' in user || 
      'streak' in user ||
      'totalQuizzes' in user
    );
    
    console.log(`Found ${usersWithMedicalData.length} users with medical data to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const user of usersWithMedicalData) {
      try {
        // Check if userProfile already exists
        const existingProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", user._id))
          .first();
        
        if (existingProfile) {
          console.log(`⚠️  UserProfile already exists for ${user._id}, skipping`);
          continue;
        }
        
        // Create userProfile with medical data from user
        const profileData = {
          userId: user._id,
          email: user.email || "",
          name: user.name || "Medical Student",
          medicalLevel: "Medical Student", // Default
          studyGoals: "USMLE Preparation", // Default
          points: ('points' in user ? user.points : 0) as number,
          level: ('level' in user ? user.level : 1) as number,
          currentStreak: ('streak' in user ? user.streak : 0) as number,
          longestStreak: ('streak' in user ? user.streak : 0) as number,
          totalQuizzes: ('totalQuizzes' in user ? user.totalQuizzes : 0) as number,
          accuracy: ('accuracy' in user ? user.accuracy : 0) as number,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastStudyDate: new Date().toISOString().split('T')[0],
          streakFreezeCount: 3,
        };
        
        await ctx.db.insert("userProfiles", profileData);
        
        console.log(`✅ Created userProfile for ${user._id} (${user.email})`);
        migratedCount++;
        
        // Note: We don't clean up the users table here to avoid breaking auth
        // The schema validation will handle rejecting the extra fields
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user._id}:`, error);
        errors.push(`User ${user._id}: ${error}`);
        errorCount++;
      }
    }
    
    console.log(`🎉 Migration completed: ${migratedCount} profiles created, ${errorCount} errors`);
    
    return {
      success: true,
      migratedCount,
      errorCount,
      errors,
      message: `Migration completed: ${migratedCount} user profiles created successfully`
    };
  },
});

// Clean up users table by removing medical fields (should be done after migration)
export const cleanupUsersTable = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting users table cleanup...");
    
    // Get all users
    const users = await ctx.db.query("users").collect();
    
    let cleanedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const user of users) {
      try {
        // Check if user has medical fields that need to be removed
        const hasMedicalFields = 'accuracy' in user || 
                                 'points' in user || 
                                 'level' in user || 
                                 'streak' in user ||
                                 'totalQuizzes' in user;
        
        if (hasMedicalFields) {
          // Create clean user object with only Convex Auth fields
          const cleanUser: any = {
            email: user.email,
            name: user.name,
          };
          
          // Only include standard Convex Auth fields if they exist
          if ('emailVerificationTime' in user) {
            cleanUser.emailVerificationTime = user.emailVerificationTime;
          }
          if ('image' in user) {
            cleanUser.image = user.image;
          }
          if ('isAnonymous' in user) {
            cleanUser.isAnonymous = user.isAnonymous;
          }
          if ('phone' in user) {
            cleanUser.phone = user.phone;
          }
          if ('phoneVerificationTime' in user) {
            cleanUser.phoneVerificationTime = user.phoneVerificationTime;
          }
          
          // Replace the entire user document with clean data
          await ctx.db.replace(user._id, cleanUser);
          
          console.log(`✅ Cleaned user ${user._id} (${user.email})`);
          cleanedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error cleaning user ${user._id}:`, error);
        errors.push(`User ${user._id}: ${error}`);
        errorCount++;
      }
    }
    
    console.log(`🎉 Cleanup completed: ${cleanedCount} users cleaned, ${errorCount} errors`);
    
    return {
      success: true,
      cleanedCount,
      errorCount,
      errors,
      message: `Cleanup completed: ${cleanedCount} users cleaned successfully`
    };
  },
});