import React from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="animate-fade-up">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};