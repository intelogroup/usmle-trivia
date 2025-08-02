import React from 'react';
import { Stethoscope, Bell, Menu } from 'lucide-react';
import { useAppStore } from '../../store';

export const MobileHeader: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="h-14 border-b bg-background px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="font-semibold">MedQuiz Pro</span>
      </div>

      <button className="relative p-2 rounded-md hover:bg-accent">
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
      </button>
    </header>
  );
};