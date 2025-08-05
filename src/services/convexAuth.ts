import type { IUser } from "../types";
import { ErrorHandler } from "../utils/errorHandler";
import convex from "./convex";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

// Simple auth state management - in production, use proper auth service
let currentUser: IUser | null = null;
let currentUserId: string | null = null;

export const convexAuthService = {
  async createAccount(email: string, _password: string, name: string) {
    try {
      console.log('Creating account with Convex:', { email, name });
      
      // Use Convex client to call the mutation
      const userId = await convex.mutation(api.auth.createUser, {
        email,
        name,
        password: _password // Note: In production, password should be hashed on backend
      });
      
      console.log('User created with ID:', userId);
      currentUserId = userId;
      
      // Get the created user
      const user = await this.getUserById(userId);
      currentUser = user;
      
      return { account: { $id: userId }, user };
    } catch (error) {
      console.error('Account creation error:', error);
      throw await ErrorHandler.handleError(
        error,
        'Account Creation',
        { email, name }
      );
    }
  },

  async login(email: string, _password: string) {
    try {
      console.log('Logging in with Convex:', { email });
      
      // Use Convex client to query for user
      const user = await convex.query(api.auth.getUserByEmail, { email });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      console.log('User found:', user);
      
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
      console.error('Login error:', error);
      throw await ErrorHandler.handleError(
        error,
        'User Login',
        { email }
      );
    }
  },

  async logout() {
    try {
      currentUser = null;
      currentUserId = null;
      console.log('User logged out successfully');
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'User Logout'
      );
    }
  },

  async getCurrentUser(): Promise<IUser | null> {
    try {
      if (!currentUserId) return null;
      
      const user = await this.getUserById(currentUserId);
      currentUser = user;
      return user;
    } catch {
      return null;
    }
  },

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await convex.query(api.auth.getUserById, { userId });
      
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
      const updatedUser = await convex.mutation(api.auth.updateUserProfile, {
        userId,
        updates: data
      });
      
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