import React from 'react';
import { useAppStore } from '../../store';

export const WelcomeBanner: React.FC = () => {
  const { user } = useAppStore();

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 mb-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">
        Welcome back, {user.name}
      </h1>
      <p className="text-slate-600">
        Continue your medical studies and track your progress.
      </p>
    </div>
  );
};