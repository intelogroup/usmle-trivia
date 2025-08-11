# Database User Data Cleanup Guide

Since we removed the Convex Auth system, there might be some dependency issues with running cleanup scripts directly. Here's how to safely clean up the user data:

## Option 1: Use Convex Dashboard (Recommended)

1. **Go to your Convex Dashboard**: https://dashboard.convex.dev
2. **Navigate to your project**
3. **Go to the "Functions" tab**
4. **Run these functions in order:**

### Step 1: Check what will be preserved
```javascript
// Run this function: clearDatabase:verifyPreservedData
// This will show you:
// - How many questions will be preserved
// - How many tags will be preserved  
// - Sample questions to verify content
```

### Step 2: Check current user data
```javascript  
// Run this function: clearDatabase:verifyDatabaseEmpty
// This will show you all user data that exists:
// - users, userProfiles, quizSessions, etc.
// - Total count of user records
```

### Step 3: Execute cleanup
```javascript
// Run this function: clearDatabase:clearUserData
// This will delete all user-generated data while preserving:
// ✅ All questions and medical content
// ✅ Tags and categories
// ✅ System configuration
```

### Step 4: Verify cleanup
```javascript
// Run this function again: clearDatabase:verifyDatabaseEmpty
// Should return isEmpty: true and all counts should be 0
```

## Option 2: Using Convex CLI (if working)

If you can get the Convex CLI working without auth issues:

```bash
# Check preserved data
npx convex run clearDatabase:verifyPreservedData

# Check current user data
npx convex run clearDatabase:verifyDatabaseEmpty

# Execute cleanup (WARNING: This deletes all user data!)
npx convex run clearDatabase:clearUserData

# Verify cleanup completed
npx convex run clearDatabase:verifyDatabaseEmpty
```

## What Will Be Deleted

The cleanup will remove ALL data from these tables:
- ❌ `users` - All user accounts
- ❌ `userProfiles` - All user profile data  
- ❌ `userSessions` - All user sessions
- ❌ `quizSessions` - All quiz session data
- ❌ `quiz_sessions` - Backward compatibility table
- ❌ `analytics` - All analytics data
- ❌ `attempts` - All question attempts
- ❌ `bookmarks` - All user bookmarks
- ❌ `flaggedQuestions` - All flagged content
- ❌ `friendships` - All social connections
- ❌ `studyGroups` - All study groups
- ❌ `challenges` - All user challenges
- ❌ `contentReviews` - All content reviews
- ❌ `notifications` - All notifications
- ❌ `auditLog` - All audit logs
- ❌ `seenQuestions` - All seen question tracking
- ❌ `quizResults` - All quiz results
- ❌ `leaderboard` - All leaderboard data
- ❌ `metrics` - All user metrics

## What Will Be Preserved

The cleanup will preserve ALL data from these tables:
- ✅ `questions` - All medical questions and USMLE content
- ✅ `tags` - All question tags and categories
- ✅ `systemConfig` - All system configuration and feature flags

## Safety Notes

⚠️ **IMPORTANT**: This action is irreversible!

1. **Backup**: Consider exporting user data first if you need it later
2. **Verify**: Run the verification functions first to see what will be affected
3. **Questions**: The medical questions and content will be completely preserved
4. **Ready**: After cleanup, the database will be ready for your new auth system

## After Cleanup

Once the cleanup is complete:
1. All user-generated data will be removed
2. All medical questions and content will remain intact
3. The database will be ready for your new authentication provider
4. Users will need to create new accounts with the new auth system
5. Quiz progress and user stats will start fresh

## Troubleshooting

If you encounter issues:
1. Ensure your Convex deployment is running
2. Check that your `VITE_CONVEX_URL` is correct
3. Try using the Convex dashboard instead of CLI
4. Contact me if you need help with any step