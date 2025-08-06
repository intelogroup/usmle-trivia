import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { DatabaseSeeder } from '../dev/DatabaseSeeder';
import { MedicalErrorBoundary } from '../ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="min-h-screen bg-background">
      <MedicalErrorBoundary>
        {isMobile ? (
          <MobileLayout>
            <MedicalErrorBoundary>{children}</MedicalErrorBoundary>
          </MobileLayout>
        ) : (
          <DesktopLayout>
            <MedicalErrorBoundary>{children}</MedicalErrorBoundary>
          </DesktopLayout>
        )}
      </MedicalErrorBoundary>
      <MedicalErrorBoundary>
        <DatabaseSeeder />
      </MedicalErrorBoundary>
    </div>
  );
};