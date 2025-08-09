// UPDATED AUTH SERVICE - Now uses Convex Auth instead of legacy system
// Simple wrapper around Convex Auth for consistent API

import { useAuth } from './convexAuth';
import type { IUser } from '../types';

// Export the main auth hook
export { useAuth } from './convexAuth';

// Legacy compatibility wrapper - will be removed once all components are updated
export const authService = {
  // These methods are deprecated - use useAuth() hook instead
  async createAccount(email: string, password: string, name: string) {
    throw new Error('DEPRECATED: Use useAuth() hook with register() method instead');
  },

  async login(email: string, password: string) {
    throw new Error('DEPRECATED: Use useAuth() hook with login() method instead');
  },

  async logout() {
    throw new Error('DEPRECATED: Use useAuth() hook with logout() method instead');
  },

  async getCurrentUser(): Promise<IUser | null> {
    throw new Error('DEPRECATED: Use useAuth() hook with user property instead');
  },

  async updateProfile(userId: string, data: Partial<IUser>) {
    throw new Error('DEPRECATED: Use Convex Auth mutations directly');
  },

  async resetPassword(email: string) {
    throw new Error('DEPRECATED: Use Convex Auth password reset');
  },

  async updatePassword(password: string, newPassword: string) {
    throw new Error('DEPRECATED: Use Convex Auth password update');
  },
};