import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { IUser, IQuizSession, IQuizConfig, IAnswer, INotification } from '../types';
import { authService } from '../services/auth';

interface AppState {
  // User state
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Quiz state
  currentQuiz: IQuizSession | null;
  
  // UI state
  sidebarOpen: boolean;
  isMobile: boolean;
  
  // Notifications
  notifications: INotification[];
  
  // Actions
  setUser: (user: IUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  
  // Quiz actions
  startQuiz: (config: IQuizConfig) => void;
  submitAnswer: (answer: IAnswer) => void;
  endQuiz: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<INotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: true,
        currentQuiz: null,
        sidebarOpen: true,
        isMobile: false,
        notifications: [],
        
        // User actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (loading) => set({ isLoading: loading }),
        
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true });
            const { user } = await authService.login(email, password);
            set({ user, isAuthenticated: true });
            get().addNotification({
              type: 'success',
              title: 'Welcome back!',
              message: 'You have successfully logged in.',
            });
          } catch (error) {
            get().addNotification({
              type: 'error',
              title: 'Login failed',
              message: error instanceof Error ? error.message : 'An error occurred',
            });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },
        
        logout: async () => {
          try {
            set({ isLoading: true });
            await authService.logout();
            set({ user: null, isAuthenticated: false, currentQuiz: null });
            get().addNotification({
              type: 'info',
              title: 'Logged out',
              message: 'You have been logged out successfully.',
            });
          } catch (error) {
            get().addNotification({
              type: 'error',
              title: 'Logout failed',
              message: error instanceof Error ? error.message : 'An error occurred',
            });
          } finally {
            set({ isLoading: false });
          }
        },
        
        register: async (email: string, password: string, name: string) => {
          try {
            set({ isLoading: true });
            const { user } = await authService.createAccount(email, password, name);
            set({ user: user as unknown as IUser, isAuthenticated: true });
            get().addNotification({
              type: 'success',
              title: 'Welcome to MedQuiz Pro!',
              message: 'Your account has been created successfully.',
            });
          } catch (error) {
            get().addNotification({
              type: 'error',
              title: 'Registration failed',
              message: error instanceof Error ? error.message : 'An error occurred',
            });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },
        
        // Quiz actions
        startQuiz: (config: IQuizConfig) => {
          // Implementation will be added when quiz service is created
          console.log('Starting quiz with config:', config);
        },
        
        submitAnswer: (answer: IAnswer) => {
          // Implementation will be added when quiz service is created
          console.log('Submitting answer:', answer);
        },
        
        endQuiz: () => {
          set({ currentQuiz: null });
          get().addNotification({
            type: 'info',
            title: 'Quiz ended',
            message: 'Your quiz session has ended.',
          });
        },
        
        // UI actions
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setIsMobile: (isMobile) => set({ isMobile }),
        
        // Notification actions
        addNotification: (notification) => {
          const id = Date.now().toString();
          set((state) => ({
            notifications: [...state.notifications, { ...notification, id }],
          }));
          
          // Auto-remove notification after duration
          if (notification.duration !== 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, notification.duration || 5000);
          }
        },
        
        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },
        
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'medquiz-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);