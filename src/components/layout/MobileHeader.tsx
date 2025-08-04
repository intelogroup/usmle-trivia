import React from 'react';
import { Stethoscope, Bell, Menu } from 'lucide-react';
import { useAppStore } from '../../store';

export const MobileHeader: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50 animate-slide-in">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg">MedQuiz Pro</span>
        </div>
      </div>

      <button 
        className="relative p-2 rounded-lg hover:bg-accent transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
      </button>
    </header>
  );
};