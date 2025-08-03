import { convexAuthService } from './convexAuth';
import type { IUser } from '../types';

export const authService = {
  async createAccount(email: string, password: string, name: string) {
    return convexAuthService.createAccount(email, password, name);
  },

  async login(email: string, password: string) {
    return convexAuthService.login(email, password);
  },

  async logout() {
    return convexAuthService.logout();
  },

  async getCurrentUser(): Promise<IUser | null> {
    return convexAuthService.getCurrentUser();
  },

  async updateProfile(userId: string, data: Partial<IUser>) {
    return convexAuthService.updateProfile(userId, data);
  },

  async resetPassword(email: string) {
    return convexAuthService.resetPassword(email);
  },

  async updatePassword(password: string, newPassword: string) {
    return convexAuthService.updatePassword(password, newPassword);
  },
};