import React from 'react';
import { cn } from '../../lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'medical';
  hover?: boolean;
}

const gradientStyles = {
  blue: 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
  purple: 'bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-950/20 dark:via-background dark:to-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
  green: 'bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20 border-green-200/50 dark:border-green-800/50',
  orange: 'bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20 border-orange-200/50 dark:border-orange-800/50',
  medical: 'bg-gradient-to-br from-blue-50 via-cyan-50/50 to-blue-50 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-blue-950/30 border-blue-200/60 dark:border-blue-700/40'
};

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className = '',
  gradient = 'blue',
  hover = true
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border backdrop-blur-sm transition-all duration-300',
        gradientStyles[gradient],
        hover && 'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        'group',
        className
      )}
    >
      {children}
    </div>
  );
};