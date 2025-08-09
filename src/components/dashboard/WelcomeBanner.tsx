import React from 'react';
import { useAuth } from '../../services/convexAuth';

export const WelcomeBanner: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome back, {user.name}
      </h1>
      <p className="text-gray-600 mt-1">Ready for your next study session?</p>
    </div>
  );
};