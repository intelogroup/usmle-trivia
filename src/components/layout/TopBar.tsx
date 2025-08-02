import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAppStore } from '../../store';

export const TopBar: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="h-16 border-b bg-background px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search questions, topics..."
            className="pl-10 pr-4 py-2 w-64 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  );
};