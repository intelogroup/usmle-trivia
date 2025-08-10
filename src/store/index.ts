import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { IUser, IQuizSession, IQuizConfig, IAnswer, INotification } from '../types';

interface AppState {
  // Quiz state
  currentQuiz: IQuizSession | null;
  
  // UI state
  sidebarOpen: boolean;
  isMobile: boolean;
  theme: 'light' | 'dark';
  
  // Notifications
  notifications: INotification[];
  
  // Actions - AUTH IS NOW HANDLED BY CONVEX AUTH HOOKS
  // Quiz actions
  startQuiz: (config: IQuizConfig) => void;
  submitAnswer: (answer: IAnswer) => void;
  endQuiz: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleTheme: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<INotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // User stats updates (for real-time feedback after quiz completion)
  updateUserStats: (updates: Partial<IUser>) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - AUTH STATE IS NOW MANAGED BY CONVEX AUTH
        currentQuiz: null,
        sidebarOpen: true,
        isMobile: false,
        theme: 'light',
        notifications: [],
        
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
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        
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
        
        // Update user stats after quiz completion for real-time UI updates
        // NOTE: This is just for UI feedback - actual auth state is managed by Convex Auth
        updateUserStats: (updates: Partial<IUser>) => {
          // Show notification for points earned if included
          if (updates.points !== undefined) {
            get().addNotification({
              type: 'success',
              title: 'Points Earned! 🎉',
              message: `You now have ${updates.points} total points!`,
              duration: 4000,
            });
          }
          
          // Show level up notification if level increased
          if (updates.level !== undefined) {
            get().addNotification({
              type: 'success',
              title: 'Level Up! 🚀',
              message: `Congratulations! You reached Level ${updates.level}`,
              duration: 5000,
            });
          }
          
          // Show accuracy improvement if included
          if (updates.accuracy !== undefined) {
            get().addNotification({
              type: 'info',
              title: 'Stats Updated',
              message: `Current accuracy: ${updates.accuracy}%`,
              duration: 3000,
            });
          }
        },
      }),
      {
        name: 'medquiz-storage',
        partialize: (state) => ({
          // Only persist UI state - auth is handled by Convex Auth
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      }
    )
  )
);

// DEPRECATED: Legacy auth actions removed
// Use useAuth() hook from @/services/convexAuth instead:
//
// const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
//
// Migration guide:
// - Replace useAppStore().user with useAuth().user
// - Replace useAppStore().isAuthenticated with useAuth().isAuthenticated
// - Replace useAppStore().login() with useAuth().login()
// - Replace useAppStore().logout() with useAuth().logout()
// - Replace useAppStore().register() with useAuth().register()