import React from 'react';
import { Stethoscope, BookOpen, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store';

export const WelcomeBanner: React.FC = () => {
  const { user } = useAppStore();

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {user.name}
          </h1>
          <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
            USMLE Prep
          </span>
        </div>
      </div>
      <p className="text-slate-700 mb-4">
        Continue your USMLE preparation journey with evidence-based medical questions and comprehensive explanations.
      </p>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>Medical Education Platform</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Track Your Progress</span>
        </div>
      </div>
    </div>
  );
};