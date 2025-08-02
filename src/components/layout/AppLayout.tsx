import React from 'react';
import { Outlet } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { DatabaseSeeder } from '../dev/DatabaseSeeder';

export const AppLayout: React.FC = () => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <MobileLayout><Outlet /></MobileLayout>
      ) : (
        <DesktopLayout><Outlet /></DesktopLayout>
      )}
      <DatabaseSeeder />
    </div>
  );
};