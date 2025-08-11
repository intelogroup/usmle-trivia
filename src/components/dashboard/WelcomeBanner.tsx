import React from 'react';
import { useUser } from '@clerk/clerk-react';

export const WelcomeBanner: React.FC = () => {
  const { user } = useUser();

  if (!user) return null;

  const displayName = user.firstName || user.username || 'Student';

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome back, {displayName}
      </h1>
      <p className="text-gray-600 mt-1">Ready for your next study session?</p>
    </div>
  );
};