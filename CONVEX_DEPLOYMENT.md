# 🚀 Convex Deployment Instructions

## ✅ Completed Steps

1. **React Hooks Enabled**: All Convex React hooks have been uncommented in:
   - `src/services/convexAuth.ts` - Authentication hooks ready
   - `src/services/convexQuiz.ts` - Quiz functionality hooks ready

2. **Environment Configuration**: 
   - `.env.local` created with `VITE_CONVEX_URL=https://formal-sardine-916.convex.cloud`
   - Deployment key available: `prod:formal-sardine-916|eyJ2MiI6ImIyMWM3NDc1MGM3NTRmNTJhNTQ2NmIyMzQzZjYxYWY1In0=`

## 📋 Manual Deployment Steps Required

Since interactive authentication is required for Convex deployment, please follow these steps manually:

### 1. Install Convex CLI (if not already installed)
```bash
npm install -g convex
```

### 2. Login to Convex
```bash
npx convex login
```

### 3. Deploy Functions
```bash
# Use the deployment key
export CONVEX_DEPLOYMENT_KEY="prod:formal-sardine-916|eyJ2MiI6ImIyMWM3NDc1MGM3NTRmNTJhNTQ2NmIyMzQzZjYxYWY1In0="

# Deploy to production
npx convex deploy
```

### 4. Alternative: Deploy with Team/Project Info
```bash
npx convex dev --configure=existing --team jay-code101 --project usmletrivia
```

## 🧪 Testing the Integration

After deployment, the application will automatically use the Convex hooks for:

### Authentication Features:
- User registration with `useCreateUser()`
- User login with `useGetUserByEmail()`
- Profile updates with `useUpdateUserProfile()`
- User stats tracking with `useUpdateUserStats()`
- Leaderboard with `useGetLeaderboard()`

### Quiz Features:
- Question management with `useGetQuestions()`, `useCreateQuestion()`
- Quiz sessions with `useCreateQuizSession()`, `useSubmitAnswer()`, `useCompleteQuizSession()`
- Quiz history with `useGetUserQuizHistory()`
- Batch operations with `useBatchCreateQuestions()`

## ✅ Verification Steps

1. **Check Deployment Status**:
   - Visit: https://dashboard.convex.dev
   - Verify functions are deployed to `formal-sardine-916`

2. **Test Authentication**:
   - Create a new user account
   - Login with credentials
   - Update profile information

3. **Test Quiz Functionality**:
   - Start a new quiz session
   - Answer questions
   - View results and history

## 🔍 Troubleshooting

If you encounter issues:

1. **Connection Errors**: Ensure `.env.local` contains the correct Convex URL
2. **Function Not Found**: Verify all functions are deployed with `npx convex functions`
3. **Authentication Issues**: Check that the deployment key is correctly set

## 📊 Current Status

- ✅ Frontend configured with ConvexProvider
- ✅ React hooks uncommented and ready
- ✅ Database schema defined
- ✅ API functions implemented
- ⏳ Awaiting manual deployment of functions