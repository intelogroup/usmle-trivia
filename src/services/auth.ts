import { account, databases, COLLECTIONS, DATABASE_ID } from './appwrite';
import { ID } from 'appwrite';
import type { IUser } from '../types';
import { ErrorHandler } from '../utils/errorHandler';

export const authService = {
  async createAccount(email: string, password: string, name: string) {
    try {
      // Create the account
      const response = await account.create(ID.unique(), email, password, name);
      
      // Create a session
      await account.createEmailPasswordSession(email, password);
      
      // Create user document in database
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        response.$id,
        {
          email,
          name,
          points: 0,
          level: 1,
          streak: 0,
          totalQuizzes: 0,
          accuracy: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      return { account: response, user: userDoc };
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Account Creation',
        { email, name }
      );
    }
  },

  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await this.getCurrentUser();
      return { session, user };
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'User Login',
        { email }
      );
    }
  },

  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'User Logout'
      );
    }
  },

  async getCurrentUser(): Promise<IUser | null> {
    try {
      const accountData = await account.get();
      
      // Fetch user document from database
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        accountData.$id
      );
      
      return {
        id: userDoc.$id,
        email: userDoc.email,
        name: userDoc.name,
        avatar: userDoc.avatar,
        points: userDoc.points,
        level: userDoc.level,
        streak: userDoc.streak,
        totalQuizzes: userDoc.totalQuizzes,
        accuracy: userDoc.accuracy,
        createdAt: new Date(userDoc.createdAt),
        updatedAt: new Date(userDoc.updatedAt),
      };
    } catch {
      // Silent fail for getCurrentUser - just return null
      // This is expected when user is not authenticated
      return null;
    }
  },

  async updateProfile(userId: string, data: Partial<IUser>) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        updateData
      );
      
      return response;
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
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Password Reset',
        { email }
      );
    }
  },

  async updatePassword(password: string, newPassword: string) {
    try {
      await account.updatePassword(newPassword, password);
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Password Update'
      );
    }
  },
};