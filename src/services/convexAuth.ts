import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";
import { ErrorHandler } from "../utils/errorHandler";

// Simple auth state management - in production, use proper auth service
let currentUser: IUser | null = null;
let currentUserId: string | null = null;

// Import the ConvexReactClient for direct calls
let convexClient: any = null;

// Initialize Convex client
const initConvexClient = async () => {
  if (!convexClient) {
    const { ConvexReactClient } = await import('convex/react');
    convexClient = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
  }
  return convexClient;
};

export const convexAuthService = {
  async createAccount(email: string, _password: string, name: string) {
    try {
      console.log('🔑 Creating account for:', email);
      console.log('🌐 Convex URL:', import.meta.env.VITE_CONVEX_URL);
      
      const client = await initConvexClient();
      
      // Use proper Convex mutation call
      console.log('📡 Calling Convex createUser mutation...');
      const userId = await client.mutation(api.auth.createUser, {
        email,
        name,
        password: _password
      });
      
      console.log('✅ Account created with ID:', userId);
      currentUserId = userId;
      
      // Get the created user
      const user = await this.getUserById(userId);
      currentUser = user;
      
      return { account: { $id: userId }, user };
    } catch (error) {
      console.error('🚨 Account creation error:', error);
      throw await ErrorHandler.handleError(
        error,
        'Account Creation',
        { email, name }
      );
    }
  },

  async login(email: string, _password: string) {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 Convex URL:', import.meta.env.VITE_CONVEX_URL);
      
      const client = await initConvexClient();
      
      // Use proper Convex query call
      console.log('📡 Calling Convex getUserByEmail query...');
      const user = await client.query(api.auth.getUserByEmail, { email });
      
      console.log('👤 User data received:', user ? '✅' : '❌');
      
      if (!user) {
        console.error('❌ No user found with email:', email);
        throw new Error('Invalid credentials');
      }
      
      console.log('✅ Login successful for user:', user.name);
      
      currentUser = {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        streak: user.streak,
        totalQuizzes: user.totalQuizzes,
        accuracy: user.accuracy,
        createdAt: new Date(user._creationTime),
        updatedAt: new Date(user._creationTime),
      };
      currentUserId = user._id;
      
      return { session: { $id: 'session' }, user: currentUser };
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw await ErrorHandler.handleError(
        error,
        'User Login',
        { email }
      );
    }
  },

  async logout() {
    try {
      console.log('🚪 Logging out user:', currentUser?.email);
      
      // Clear in-memory variables
      currentUser = null;
      currentUserId = null;
      
      // Clear persisted storage will be handled by the store
      console.log('✅ Logout successful - session cleared');
    } catch (error) {
      console.error('🚨 Logout error:', error);
      throw await ErrorHandler.handleError(
        error,
        'User Logout'
      );
    }
  },

  async getCurrentUser(): Promise<IUser | null> {
    try {
      console.log('👤 Getting current user, in-memory ID:', currentUserId);
      
      // First check if we have in-memory user data
      if (currentUserId && currentUser) {
        console.log('✅ Using in-memory user data:', currentUser.name);
        return currentUser;
      }
      
      // If no in-memory data, check if we have persisted user data in localStorage
      try {
        const persistedData = localStorage.getItem('medquiz-storage');
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          const persistedUser = parsed.state?.user;
          
          if (persistedUser && persistedUser.id) {
            console.log('🔄 Found persisted user data, refreshing session for:', persistedUser.name);
            
            // Refresh user data from database to ensure it's current
            const user = await this.getUserById(persistedUser.id);
            if (user) {
              // Update in-memory variables
              currentUser = user;
              currentUserId = user.id;
              console.log('✅ Session restored for user:', user.name);
              return user;
            }
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse persisted storage:', parseError);
      }
      
      console.log('❌ No current user ID available');
      return null;
    } catch (error) {
      console.error('🚨 Get current user error:', error);
      return null;
    }
  },

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const client = await initConvexClient();
      
      console.log('📡 Getting user by ID:', userId);
      const user = await client.query(api.auth.getUserById, { userId });
      
      if (!user) {
        console.log('❌ User not found with ID:', userId);
        return null;
      }
      
      console.log('✅ User found:', user.name);
      
      return {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        streak: user.streak,
        totalQuizzes: user.totalQuizzes,
        accuracy: user.accuracy,
        createdAt: new Date(user._creationTime),
        updatedAt: new Date(user._creationTime),
      };
    } catch (error) {
      console.error('🚨 Get user by ID error:', error);
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<IUser>) {
    try {
      const client = await initConvexClient();
      
      console.log('📡 Updating profile for user:', userId);
      const updatedUser = await client.mutation(api.auth.updateUserProfile, {
        userId,
        updates: data
      });
      
      console.log('✅ Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('🚨 Profile update error:', error);
      throw await ErrorHandler.handleError(
        error,
        'Profile Update',
        { userId }
      );
    }
  },

  async resetPassword(email: string) {
    try {
      // Placeholder for password reset functionality
      console.log('Password reset requested for:', email);
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Password Reset',
        { email }
      );
    }
  },

  async updatePassword(_password: string, _newPassword: string) {
    try {
      // Placeholder for password update functionality
      console.log('Password update requested');
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Password Update'
      );
    }
  },
};

// React hooks for Convex - Production Ready
export const useCreateUser = () => useMutation(api.auth.createUser);
export const useGetUserByEmail = (email: string) => useQuery(api.auth.getUserByEmail, { email });
export const useGetUserById = (userId: string) => useQuery(api.auth.getUserById, { userId });
export const useUpdateUserProfile = () => useMutation(api.auth.updateUserProfile);
export const useUpdateUserStats = () => useMutation(api.auth.updateUserStats);
export const useGetLeaderboard = (limit?: number) => useQuery(api.auth.getLeaderboard, { limit });
export const useGetUserProfile = (userId: string) => useQuery(api.auth.getUserProfile, userId ? { userId } : 'skip');
export const useSearchUsers = (searchTerm: string, limit?: number) => useQuery(api.auth.searchUsers, searchTerm ? { searchTerm, limit } : 'skip');