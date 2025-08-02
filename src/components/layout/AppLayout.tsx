import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { DatabaseSeeder } from '../dev/DatabaseSeeder';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <DesktopLayout>{children}</DesktopLayout>
      )}
      <DatabaseSeeder />
    </div>
  );
};