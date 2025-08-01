import React from 'react';
import { useParams } from 'react-router-dom';

export const Quiz: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {mode ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz` : 'Quiz'}
      </h1>
      <p className="text-muted-foreground">Select a quiz mode to get started.</p>
      {/* Quiz content will be implemented later */}
    </div>
  );
};