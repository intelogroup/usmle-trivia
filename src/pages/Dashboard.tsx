import React from 'react';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardGrid />
    </div>
  );
};