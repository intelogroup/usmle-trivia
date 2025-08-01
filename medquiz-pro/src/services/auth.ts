import { account, databases, COLLECTIONS, DATABASE_ID } from './appwrite';
import { ID } from 'appwrite';
import type { IUser } from '../types';

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
      console.error('Error creating account:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await this.getCurrentUser();
      return { session, user };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
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
    } catch (error) {
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
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  async updatePassword(password: string, newPassword: string) {
    try {
      await account.updatePassword(newPassword, password);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
};