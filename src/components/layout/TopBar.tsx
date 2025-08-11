import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, Moon, Sun, Trophy, LogOut } from 'lucide-react';
import { UserButton, useUser, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useAppStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const { toggleSidebar, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Mock points for demo (will be fetched from database later)
  const userPoints = 1250;

  return (
    <header className="h-16 bg-background px-4 flex items-center justify-between">
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
            placeholder="Search USMLE questions, medical topics..."
            className="pl-10 pr-4 py-2 w-64 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Points - Only show when signed in */}
        <SignedIn>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/50 rounded-full">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium font-mono">{userPoints}</span>
          </div>
        </SignedIn>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
        
        {/* Notifications - Only show when signed in */}
        <SignedIn>
          <button className="relative p-2 rounded-md hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
          </button>
        </SignedIn>
        
        {/* User Menu - Clerk UserButton for signed-in users */}
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
              }
            }}
          />
        </SignedIn>
        
        {/* Sign In Button for signed-out users */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
};