import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";
import { ErrorHandler } from "../utils/errorHandler";

// Simple auth state management - in production, use proper auth service
let currentUser: IUser | null = null;
let currentUserId: string | null = null;

export const convexAuthService = {
  async createAccount(email: string, _password: string, name: string) {
    try {
      console.log('🔑 Creating account for:', email);
      console.log('🌐 Convex URL:', import.meta.env.VITE_CONVEX_URL);
      
      // For now, we'll use a simple approach. In production, use proper auth
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/createUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password: _password })
      });
      
      console.log('📡 Create account response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Account creation failed:', errorText);
        throw new Error(`Failed to create account: ${errorText}`);
      }
      
      const userId = await response.text();
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
      
      // Simple login - in production, use proper authentication
      const url = `${import.meta.env.VITE_CONVEX_URL}/getUserByEmail?email=${encodeURIComponent(email)}`;
      console.log('📡 Login request URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed - user not found:', errorText);
        throw new Error('User not found');
      }
      
      const user = await response.json();
      console.log('👤 User data received:', user ? '✅' : '❌');
      
      if (!user) {
        console.error('❌ No user data returned');
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
      currentUser = null;
      currentUserId = null;
      console.log('✅ Logout successful');
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
      console.log('👤 Getting current user, ID:', currentUserId);
      if (!currentUserId) {
        console.log('❌ No current user ID');
        return null;
      }
      
      const user = await this.getUserById(currentUserId);
      currentUser = user;
      console.log('👤 Current user retrieved:', user ? '✅' : '❌');
      return user;
    } catch (error) {
      console.error('🚨 Get current user error:', error);
      return null;
    }
  },

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getUserById?userId=${userId}`);
      
      if (!response.ok) {
        return null;
      }
      
      const user = await response.json();
      if (!user) return null;
      
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
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<IUser>) {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/updateUserProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: data })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      return updatedUser;
    } catch (error) {
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