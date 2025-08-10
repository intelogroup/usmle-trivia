// OFFICIAL CONVEX AUTH SERVICE
// Re-export all Convex Auth hooks and utilities
// This file provides a clean single import point for authentication

// Main auth hook - use this for authentication in components
export { useAuth } from './convexAuth';

// Additional auth utilities
export {
  useUpdateUserStats,
  useGetUserQuizHistory,
  useGetLeaderboard,
  useGetUserProfile,
  useUpdateUserProfile,
  useConvexAuth,
  useAuthActions
} from './convexAuth';